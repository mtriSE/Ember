# Frequently Asked Questions (FAQ)

Common questions and answers about Ember.

---

## General

### What is Ember?

Ember is an open-source AI agent framework written in Rust. It provides a unified interface for interacting with 9+ LLM providers (OpenAI, Anthropic, Google, Ollama, etc.) and includes features like:
- Tool execution (shell, filesystem, web, browser)
- Memory and context management
- RAG (Retrieval-Augmented Generation)
- Plugin system
- Cost tracking and budgeting

### Why Rust?

Rust provides:
- **Memory safety** without garbage collection
- **High performance** comparable to C/C++
- **Concurrency** without data races
- **Strong type system** catching errors at compile time
- **Cross-platform** binaries with no runtime dependencies

### Is Ember free to use?

Yes! Ember is dual-licensed under Apache 2.0 and MIT licenses, making it free for both personal and commercial use.

### Which LLM providers are supported?

Ember supports:
1. **OpenAI** - GPT-4, GPT-4o, GPT-3.5
2. **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus/Haiku
3. **Google** - Gemini Pro, Gemini Flash
4. **Ollama** - Local models (Llama, Mistral, etc.)
5. **Groq** - Ultra-fast inference
6. **DeepSeek** - DeepSeek models
7. **Mistral** - Mistral AI models
8. **OpenRouter** - 100+ models via single API
9. **xAI** - Grok models

---

## Installation

### How do I install Ember?

```bash
# Using cargo (recommended)
cargo install ember-cli

# From source
git clone https://github.com/niklasmarderx/ember.git
cd ember
cargo install --path crates/ember-cli

# Using the install script
curl -fsSL https://ember.dev/install.sh | sh
```

### What are the system requirements?

- **Rust** 1.75+ (for building from source)
- **OS**: Linux, macOS, Windows
- **Memory**: 512MB+ RAM
- **Storage**: ~100MB for binaries

### How do I update Ember?

```bash
cargo install ember-cli --force
```

---

## Configuration

### Where is the configuration file?

Ember looks for configuration in this order:
1. `./ember.toml` (current directory)
2. `~/.config/ember/config.toml`
3. `~/.ember/config.toml`

### How do I set my API key?

Option 1: Environment variable
```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

Option 2: Configuration file
```toml
# ~/.config/ember/config.toml
[providers.openai]
api_key = "sk-..."
```

Option 3: CLI flag
```bash
ember chat --api-key "sk-..." "Hello"
```

### How do I use a local model with Ollama?

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3`
3. Configure Ember:
```toml
[providers.ollama]
base_url = "http://localhost:11434"
model = "llama3"
```
4. Use it: `ember chat --provider ollama "Hello"`

---

## Usage

### How do I start a chat?

```bash
# Simple chat
ember chat "What is the capital of France?"

# Interactive mode
ember chat --interactive

# With specific model
ember chat --model gpt-4o "Explain quantum computing"
```

### How do I use tools?

Tools are enabled by default in agent mode:
```bash
# Shell command
ember agent "List files in the current directory"

# Web search
ember agent "Search for the latest Rust news"

# File operations
ember agent "Read the contents of README.md"
```

### How do I enable streaming?

```bash
ember chat --stream "Tell me a story"
```

### How do I set a budget limit?

```bash
# Set daily budget to $5
ember config set budget.daily 5.00

# Set per-request limit
ember chat --max-cost 0.10 "Complex query"
```

---

## Tools

### What tools are available?

1. **Shell** - Execute system commands
2. **Filesystem** - Read, write, list files
3. **Web** - HTTP requests, web search
4. **Browser** - Headless browser automation
5. **Git** - Git operations
6. **Code Execution** - Run code snippets

### Can I create custom tools?

Yes! See the [Custom Tools Guide](../docs/src/custom-tools.md).

```rust
use ember_tools::{Tool, ToolResult};

struct MyTool;

#[async_trait]
impl Tool for MyTool {
    fn name(&self) -> &str { "my_tool" }
    
    async fn execute(&self, params: Value) -> ToolResult {
        // Your implementation
    }
}
```

### Are tools sandboxed?

Yes, tools run with configurable security levels:
- **Strict**: Confirmation required for all actions
- **Standard**: Confirmation for destructive actions
- **Permissive**: Auto-approve safe actions

---

## Plugins

### How do I install a plugin?

```bash
ember plugin install weather
```

### Where can I find plugins?

- Built-in marketplace: `ember plugin search <query>`
- Community plugins: GitHub topics `ember-plugin`

### How do I create a plugin?

See the [Plugin Development Guide](../docs/plugins.md) or example plugins in `examples/plugins/`.

---

## Troubleshooting

### "API key not found" error

1. Check environment variables: `echo $OPENAI_API_KEY`
2. Check config file: `cat ~/.config/ember/config.toml`
3. Verify key is valid with the provider

### "Connection refused" with Ollama

1. Ensure Ollama is running: `ollama serve`
2. Check the URL: `curl http://localhost:11434/api/tags`
3. Verify firewall settings

### "Rate limit exceeded"

1. Wait and retry (automatic with exponential backoff)
2. Use a different provider
3. Reduce request frequency
4. Upgrade your API plan

### Build errors

```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean
cargo build --release
```

### High memory usage

1. Use smaller models
2. Reduce context window size
3. Enable memory management:
```toml
[memory]
max_tokens = 8000
strategy = "sliding_window"
```

---

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `cargo test`
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

### How do I run tests?

```bash
# All tests
cargo test

# Specific crate
cargo test -p ember-core

# Integration tests
cargo test --test integration
```

### How do I build documentation?

```bash
# API docs
cargo doc --open

# User docs
cd docs && mdbook serve
```

---

## Security

### Is my data private?

Yes! Ember:
- Never sends data to our servers
- Only communicates with providers you configure
- Stores all data locally by default
- Has opt-in telemetry (disabled by default)

### How do I report security issues?

Email security@ember.dev or see [SECURITY.md](../SECURITY.md).

---

## Still have questions?

- 💬 [Discord](https://discord.gg/ember-ai)
- 🐛 [GitHub Issues](https://github.com/niklasmarderx/ember/issues)
- 💡 [GitHub Discussions](https://github.com/niklasmarderx/ember/discussions)