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
}