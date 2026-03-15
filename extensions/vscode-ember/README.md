# Ember AI for Visual Studio Code

<p align="center">
  <img src="resources/ember.svg" alt="Ember AI" width="128" />
</p>

**Ember AI** is your intelligent coding assistant powered by the Ember framework. Get AI-powered code explanations, improvements, test generation, and chat directly in VS Code.

## Features

### 🔥 Chat Sidebar
Open the Ember AI sidebar to have conversations with your AI assistant. Ask questions, get help with code, or brainstorm ideas.

- **Keyboard Shortcut**: `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
- **Command Palette**: "Ember: Open Chat"

### 📝 Code Explanation
Select any code in your editor and get a detailed explanation of what it does.

- Right-click → "Ember: Explain Selection"
- Works with any programming language

### ✨ Code Improvement
Get suggestions for improving your selected code with optimizations and best practices.

- Right-click → "Ember: Improve Selection"
- Receive detailed explanations of suggested changes

### 🧪 Test Generation
Automatically generate unit tests for your selected code.

- Right-click → "Ember: Generate Tests"
- Supports multiple testing frameworks

### 💬 Inline Completions (Experimental)
Get AI-powered code completions as you type.

- Trigger with `Ctrl+Space` or automatically after a brief pause
- Accept suggestions with `Tab`

## Requirements

- **Ember Server**: The extension requires a running Ember server
- Install Ember: `cargo install ember-cli`
- Start the server: `ember serve`

## Installation

### From VSIX (Local)
1. Download the `.vsix` file from releases
2. In VS Code, open the Command Palette (`Ctrl+Shift+P`)
3. Type "Extensions: Install from VSIX..."
4. Select the downloaded file

### From Source
```bash
cd extensions/vscode-ember
npm install
npm run compile
```
Then press `F5` in VS Code to launch the extension in debug mode.

## Configuration

Open VS Code Settings and search for "Ember" to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| `ember.serverUrl` | `http://localhost:3000` | URL of the Ember server |
| `ember.model` | `llama3.2` | Default model to use |
| `ember.autoStart` | `false` | Automatically start Ember server |
| `ember.inlineCompletions.enabled` | `true` | Enable inline code completions |
| `ember.inlineCompletions.debounceMs` | `500` | Delay before triggering completions |
| `ember.inlineCompletions.maxTokens` | `100` | Maximum tokens for completions |

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Ember: Open Chat` | Open the chat sidebar | `Ctrl+Shift+E` |
| `Ember: Explain Selection` | Explain selected code | Right-click menu |
| `Ember: Improve Selection` | Suggest improvements | Right-click menu |
| `Ember: Generate Tests` | Generate unit tests | Right-click menu |
| `Ember: Fix Code` | Fix errors in selection | Right-click menu |
| `Ember: Add Documentation` | Add docs to selection | Right-click menu |

## Supported Providers

Ember supports multiple LLM providers. Configure your preferred provider in the Ember server:

- **OpenAI** - GPT-4o, GPT-4o-mini
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus
- **Ollama** - Local models (Llama, Mistral, etc.)
- **Groq** - Fast inference
- **Google Gemini** - Gemini 1.5 Pro/Flash
- **DeepSeek** - DeepSeek Chat/Coder
- **Mistral AI** - Mistral Large/Medium
- **OpenRouter** - Access 100+ models
- **xAI** - Grok

## Troubleshooting

### Extension not connecting to server
1. Ensure Ember server is running: `ember serve`
2. Check the server URL in settings matches your server
3. Verify no firewall is blocking the connection

### Slow responses
1. Try a faster model (e.g., Groq or local Ollama)
2. Reduce `ember.inlineCompletions.maxTokens`
3. Check your network connection

### Inline completions not working
1. Ensure `ember.inlineCompletions.enabled` is `true`
2. Check the server is responsive
3. Try increasing `ember.inlineCompletions.debounceMs`

## Development

### Building
```bash
npm install
npm run compile
```

### Packaging
```bash
npm run package
```
This creates `ember-ai-{version}.vsix` in the extension folder.

### Running Tests
```bash
npm test
```

## Contributing

Contributions are welcome! Please see the main [Ember repository](https://github.com/ember-ai/ember) for contribution guidelines.

## License

MIT OR Apache-2.0

---

**Ember AI** - Making coding assistance accessible to everyone 🔥