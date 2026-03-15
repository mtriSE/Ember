export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface StreamEvent {
    event: string;
    content?: string;
    model?: string;
    conversation_id?: string;
    error?: string;
}

interface ChatResponse {
    message: string;
    model?: string;
    conversation_id?: string;
}

interface CompletionOptions {
    model?: string;
    maxTokens?: number;
    stop?: string[];
    temperature?: number;
}

interface CompletionResponse {
    completion: string;
    model?: string;
    tokens_used?: number;
}

export class EmberClient {
    private serverUrl: string;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    setServerUrl(url: string): void {
        this.serverUrl = url;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.serverUrl}/api/v1/health`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async chat(
        message: string,
        options: { model?: string; messages?: ChatMessage[] } = {}
    ): Promise<string> {
        const response = await fetch(`${this.serverUrl}/api/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                model: options.model,
                messages: options.messages,
            }),
        });

        if (!response.ok) {
            throw new Error(`Chat request failed: ${response.statusText}`);
        }

        const data: ChatResponse = await response.json();
        return data.message;
    }

    chatStream(
        message: string,
        options: { model?: string; messages?: ChatMessage[] } = {},
        onChunk: (content: string) => void,
        onDone: () => void,
        onError: (error: string) => void
    ): () => void {
        const controller = new AbortController();

        const streamRequest = async () => {
            try {
                const response = await fetch(`${this.serverUrl}/api/v1/chat/stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        model: options.model,
                        messages: options.messages,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    throw new Error(`Stream request failed`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    for (const line of text.split('\n')) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data: StreamEvent = JSON.parse(line.slice(6));
                                if (data.event === 'chunk' && data.content) {
                                    onChunk(data.content);
                                } else if (data.event === 'error') {
                                    onError(data.error || 'Unknown error');
                                } else if (data.event === 'end') {
                                    onDone();
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
                onDone();
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    onError((error as Error).message);
                }
            }
        };

        streamRequest();
        return () => controller.abort();
    }

    /**
     * Get a completion from the API (non-streaming).
     * Used for inline completions and code generation.
     */
    async complete(
        prompt: string,
        options: CompletionOptions = {}
    ): Promise<string> {
        try {
            const response = await fetch(`${this.serverUrl}/api/v1/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: options.model,
                    max_tokens: options.maxTokens,
                    stop: options.stop,
                    temperature: options.temperature,
                }),
            });

            if (!response.ok) {
                throw new Error(`Completion request failed: ${response.statusText}`);
            }

            const data: CompletionResponse = await response.json();
            return data.completion;
        } catch (error) {
            // Fallback to chat endpoint if complete endpoint doesn't exist
            return this.chat(prompt, { model: options.model });
        }
    }

    /**
     * Get server information.
     */
    async getInfo(): Promise<{ name: string; version: string; llm_provider: string }> {
        const response = await fetch(`${this.serverUrl}/api/v1/info`);
        if (!response.ok) {
            throw new Error(`Failed to get server info: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Get available models.
     */
    async getModels(): Promise<{ id: string; name: string; provider: string }[]> {
        const response = await fetch(`${this.serverUrl}/api/v1/models`);
        if (!response.ok) {
            throw new Error(`Failed to get models: ${response.statusText}`);
        }
        const data = await response.json();
        return data.models || [];
    }
}
