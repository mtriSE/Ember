import * as vscode from 'vscode';
import { EmberClient } from './EmberClient';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private _debounceTimer: NodeJS.Timeout | undefined;
    private _lastRequest: AbortController | undefined;
    private _cache: Map<string, vscode.InlineCompletionItem[]> = new Map();

    constructor(private readonly _client: EmberClient) {}

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | null> {
        const config = vscode.workspace.getConfiguration('ember');
        const enabled = config.get<boolean>('inlineCompletions.enabled', true);
        
        if (!enabled) {
            return null;
        }

        // Cancel any pending request
        if (this._lastRequest) {
            this._lastRequest.abort();
        }

        // Create new abort controller
        this._lastRequest = new AbortController();

        // Get context around cursor
        const prefix = this._getPrefix(document, position);
        const suffix = this._getSuffix(document, position);
        
        if (prefix.length < 3) {
            return null;
        }

        // Check cache
        const cacheKey = `${document.uri.toString()}:${position.line}:${prefix.slice(-50)}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey) || null;
        }

        // Debounce
        const debounceMs = config.get<number>('inlineCompletions.debounceMs', 500);
        
        return new Promise((resolve) => {
            if (this._debounceTimer) {
                clearTimeout(this._debounceTimer);
            }

            this._debounceTimer = setTimeout(async () => {
                if (token.isCancellationRequested) {
                    resolve(null);
                    return;
                }

                try {
                    const completion = await this._getCompletion(
                        document,
                        prefix,
                        suffix,
                        token
                    );

                    if (!completion || token.isCancellationRequested) {
                        resolve(null);
                        return;
                    }

                    const items = [
                        new vscode.InlineCompletionItem(
                            completion,
                            new vscode.Range(position, position)
                        ),
                    ];

                    // Cache the result
                    this._cache.set(cacheKey, items);
                    
                    // Clear old cache entries
                    if (this._cache.size > 100) {
                        const firstKey = this._cache.keys().next().value;
                        if (firstKey) {
                            this._cache.delete(firstKey);
                        }
                    }

                    resolve(items);
                } catch (error) {
                    console.error('Inline completion error:', error);
                    resolve(null);
                }
            }, debounceMs);
        });
    }

    private _getPrefix(document: vscode.TextDocument, position: vscode.Position): string {
        // Get up to 50 lines before cursor
        const startLine = Math.max(0, position.line - 50);
        const range = new vscode.Range(startLine, 0, position.line, position.character);
        return document.getText(range);
    }

    private _getSuffix(document: vscode.TextDocument, position: vscode.Position): string {
        // Get up to 10 lines after cursor
        const endLine = Math.min(document.lineCount - 1, position.line + 10);
        const endChar = document.lineAt(endLine).text.length;
        const range = new vscode.Range(position.line, position.character, endLine, endChar);
        return document.getText(range);
    }

    private async _getCompletion(
        document: vscode.TextDocument,
        prefix: string,
        suffix: string,
        token: vscode.CancellationToken
    ): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('ember');
        const maxTokens = config.get<number>('inlineCompletions.maxTokens', 100);
        const model = config.get<string>('model', 'llama3.2');
        
        const language = document.languageId;
        const fileName = document.fileName.split('/').pop() || 'file';

        const prompt = `You are a code completion assistant. Complete the code at the cursor position marked with <CURSOR>.
Only output the completion text, nothing else. Do not repeat existing code. Do not add explanations.

File: ${fileName}
Language: ${language}

Code:
\`\`\`${language}
${prefix}<CURSOR>${suffix}
\`\`\`

Complete the code at <CURSOR>:`;

        try {
            const response = await this._client.complete(prompt, {
                model,
                maxTokens,
                stop: ['\n\n', '```', '<CURSOR>'],
            });

            if (token.isCancellationRequested) {
                return null;
            }

            // Clean up the response
            let completion = response.trim();
            
            // Remove any markdown artifacts
            completion = completion.replace(/^```[\w]*\n?/, '');
            completion = completion.replace(/\n?```$/, '');
            
            // Don't return empty completions
            if (!completion || completion.length < 2) {
                return null;
            }

            return completion;
        } catch (error) {
            console.error('Completion request failed:', error);
            return null;
        }
    }

    public clearCache(): void {
        this._cache.clear();
    }
}