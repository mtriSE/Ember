import * as vscode from 'vscode';
import { ChatViewProvider } from './ChatViewProvider';
import { EmberClient } from './EmberClient';
import { InlineCompletionProvider } from './InlineCompletionProvider';

let client: EmberClient;
let chatViewProvider: ChatViewProvider;
let inlineCompletionProvider: InlineCompletionProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Ember AI extension activated');

    // Initialize client
    const config = vscode.workspace.getConfiguration('ember');
    const serverUrl = config.get<string>('serverUrl') || 'http://localhost:3000';
    client = new EmberClient(serverUrl);

    // Register chat view
    chatViewProvider = new ChatViewProvider(context.extensionUri, client);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('ember.chatView', chatViewProvider)
    );

    // Register inline completion provider
    inlineCompletionProvider = new InlineCompletionProvider(client);
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' }, // All files
            inlineCompletionProvider
        )
    );

    // Register commands
    registerCommands(context);

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ember.serverUrl')) {
                const newUrl = vscode.workspace.getConfiguration('ember').get<string>('serverUrl') || 'http://localhost:3000';
                client.setServerUrl(newUrl);
            }
            if (e.affectsConfiguration('ember.inlineCompletions')) {
                inlineCompletionProvider.clearCache();
            }
        })
    );

    // Show status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(flame) Ember';
    statusBarItem.tooltip = 'Ember AI - Click to open chat';
    statusBarItem.command = 'ember.chat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Check server connection on startup
    checkServerConnection(statusBarItem);
}

function registerCommands(context: vscode.ExtensionContext) {
    // Open Chat
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.chat', () => {
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Explain Selection
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.explain', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Explain this ${selection.language} code in detail. What does it do? How does it work?

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Improve Selection
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.improve', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Improve this ${selection.language} code. Suggest optimizations, better practices, and explain the improvements:

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Generate Tests
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.generateTests', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Generate comprehensive unit tests for this ${selection.language} code. Include edge cases and use appropriate testing frameworks:

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Fix Code
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.fixCode', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Fix any bugs or issues in this ${selection.language} code. Identify problems and provide corrected code:

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Add Documentation
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.addDocs', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Add comprehensive documentation to this ${selection.language} code. Include:
- Function/class documentation
- Parameter descriptions
- Return value descriptions
- Usage examples if appropriate

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );

    // Refactor Selection
    context.subscriptions.push(
        vscode.commands.registerCommand('ember.refactor', async () => {
            const selection = getSelectedCode();
            if (!selection) return;

            const prompt = `Refactor this ${selection.language} code to improve:
- Code structure and organization
- Readability and maintainability
- Performance if applicable
- Following best practices and design patterns

Explain your refactoring decisions:

\`\`\`${selection.language}
${selection.code}
\`\`\``;
            
            chatViewProvider.sendMessage(prompt);
            vscode.commands.executeCommand('workbench.view.extension.ember-sidebar');
        })
    );
}

function getSelectedCode(): { code: string; language: string } | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return null;
    }

    const selection = editor.document.getText(editor.selection);
    if (!selection) {
        vscode.window.showWarningMessage('No text selected');
        return null;
    }

    return {
        code: selection,
        language: editor.document.languageId,
    };
}

async function checkServerConnection(statusBarItem: vscode.StatusBarItem) {
    try {
        const healthy = await client.healthCheck();
        if (healthy) {
            statusBarItem.text = '$(flame) Ember';
            statusBarItem.backgroundColor = undefined;
        } else {
            statusBarItem.text = '$(flame) Ember (offline)';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    } catch {
        statusBarItem.text = '$(flame) Ember (offline)';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    // Check again in 30 seconds
    setTimeout(() => checkServerConnection(statusBarItem), 30000);
}

export function deactivate() {
    console.log('Ember AI extension deactivated');
}