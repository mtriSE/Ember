"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
class ChatViewProvider {
    _extensionUri;
    _client;
    static viewType = 'ember.chatView';
    _view;
    _messages = [];
    constructor(_extensionUri, _client) {
        this._extensionUri = _extensionUri;
        this._client = _client;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleMessage(data.message);
                    break;
                case 'clear':
                    this._messages = [];
                    this._updateMessages();
                    break;
            }
        });
    }
    sendMessage(message) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'addUserMessage', message });
            this._handleMessage(message);
        }
    }
    async _handleMessage(message) {
        this._messages.push({ role: 'user', content: message });
        this._updateMessages();
        let fullResponse = '';
        this._client.chatStream(message, { messages: this._messages.map(m => ({ role: m.role, content: m.content })) }, (chunk) => {
            fullResponse += chunk;
            this._view?.webview.postMessage({ type: 'streamChunk', content: fullResponse });
        }, () => {
            this._messages.push({ role: 'assistant', content: fullResponse });
            this._updateMessages();
        }, (error) => {
            this._view?.webview.postMessage({ type: 'error', message: error });
        });
    }
    _updateMessages() {
        this._view?.webview.postMessage({ type: 'updateMessages', messages: this._messages });
    }
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ember Chat</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); height: 100vh; display: flex; flex-direction: column; }
        #messages { flex: 1; overflow-y: auto; padding: 12px; }
        .message { margin-bottom: 12px; padding: 8px 12px; border-radius: 8px; max-width: 90%; }
        .user { background: var(--vscode-button-background); color: var(--vscode-button-foreground); margin-left: auto; }
        .assistant { background: var(--vscode-editor-inactiveSelectionBackground); }
        .streaming { opacity: 0.8; }
        #input-container { padding: 12px; border-top: 1px solid var(--vscode-panel-border); display: flex; gap: 8px; }
        #input { flex: 1; padding: 8px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; resize: none; }
        button { padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        pre { background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 4px; overflow-x: auto; }
        code { font-family: var(--vscode-editor-font-family); }
        .empty { text-align: center; color: var(--vscode-descriptionForeground); margin-top: 40px; }
    </style>
</head>
<body>
    <div id="messages">
        <div class="empty">Start a conversation with Ember AI</div>
    </div>
    <div id="input-container">
        <textarea id="input" rows="2" placeholder="Type a message..."></textarea>
        <button id="send">Send</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesEl = document.getElementById('messages');
        const inputEl = document.getElementById('input');
        const sendBtn = document.getElementById('send');

        let messages = [];
        let streamingContent = '';

        function renderMessages() {
            if (messages.length === 0 && !streamingContent) {
                messagesEl.innerHTML = '<div class="empty">Start a conversation with Ember AI</div>';
                return;
            }
            
            let html = messages.map(m => 
                '<div class="message ' + m.role + '">' + escapeHtml(m.content) + '</div>'
            ).join('');
            
            if (streamingContent) {
                html += '<div class="message assistant streaming">' + escapeHtml(streamingContent) + '</div>';
            }
            
            messagesEl.innerHTML = html;
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function send() {
            const msg = inputEl.value.trim();
            if (!msg) return;
            inputEl.value = '';
            vscode.postMessage({ type: 'sendMessage', message: msg });
        }

        sendBtn.addEventListener('click', send);
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });

        window.addEventListener('message', (e) => {
            const data = e.data;
            switch (data.type) {
                case 'updateMessages':
                    messages = data.messages;
                    streamingContent = '';
                    renderMessages();
                    break;
                case 'streamChunk':
                    streamingContent = data.content;
                    renderMessages();
                    break;
                case 'addUserMessage':
                    messages.push({ role: 'user', content: data.message });
                    renderMessages();
                    break;
                case 'error':
                    messagesEl.innerHTML += '<div class="message assistant" style="color: var(--vscode-errorForeground)">Error: ' + escapeHtml(data.message) + '</div>';
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
exports.ChatViewProvider = ChatViewProvider;
