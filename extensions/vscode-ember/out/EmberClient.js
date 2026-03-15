"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmberClient = void 0;
class EmberClient {
    serverUrl;
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
    }
    setServerUrl(url) {
        this.serverUrl = url;
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.serverUrl}/api/v1/health`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
    async chat(message, options = {}) {
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
        const data = await response.json();
        return data.message;
    }
    chatStream(message, options = {}, onChunk, onDone, onError) {
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
                    if (done)
                        break;
                    const text = decoder.decode(value);
                    for (const line of text.split('\n')) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.event === 'chunk' && data.content) {
                                    onChunk(data.content);
                                }
                                else if (data.event === 'error') {
                                    onError(data.error || 'Unknown error');
                                }
                                else if (data.event === 'end') {
                                    onDone();
                                }
                            }
                            catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
                onDone();
            }
            catch (error) {
                if (error.name !== 'AbortError') {
                    onError(error.message);
                }
            }
        };
        streamRequest();
        return () => controller.abort();
    }
}
exports.EmberClient = EmberClient;
