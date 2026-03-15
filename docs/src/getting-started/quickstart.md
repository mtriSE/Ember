# Quick Start

Get up and running with Ember in under 5 minutes.

## Prerequisites

Before starting, ensure you have:

- **Rust 1.75+** installed ([rustup.rs](https://rustup.rs))
- An API key from at least one provider (or Ollama for local models)

## Installation

### Option 1: Install from crates.io (Recommended)

```bash
cargo install ember-cli
```

### Option 2: Build from Source

```bash
git clone https://github.com/your-org/ember.git
cd ember
cargo build --release
```

### Option 3: Quick Install Script

```bash
curl -fsSL https://ember.dev/install.sh | bash
```

## Configure Your First Provider

### Using OpenAI

```bash
export OPENAI_API_KEY="sk-..."
ember config set default-provider openai
ember config set default-model gpt-4
```

### Using Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
ember config set default-provider anthropic
ember config set default-model claude-3-opus-20240229
```

### Using Ollama (Free, Local)

```bash
# Install Ollama first: https://ollama.ai
ollama pull llama3

ember config set default-provider ollama
ember config set default-model llama3
```

## Your First Chat

### Simple Question

```bash
ember chat "What is Rust?"
```

### Interactive Mode

```bash
ember chat
# Then type your messages interactively
```

### With a Specific Provider

```bash
ember chat --provider openai --model gpt-4 "Explain async/await"
```

## Your First Agent

Agents can use tools to accomplish tasks:

```bash
# Enable agent mode with tools
ember chat --agent --tools shell,filesystem "Create a new Rust project called hello-world"
```

The agent will:
1. Plan the steps needed
2. Execute shell commands
3. Create files as needed
4. Report the results

## Basic Configuration

Create a configuration file for persistent settings:

```bash
# Create config directory
mkdir -p ~/.config/ember

# Generate default config
ember config init
```

Edit `~/.config/ember/config.toml`:

```toml
[default]
provider = "openai"
model = "gpt-4"

[providers.openai]
api_key = "${OPENAI_API_KEY}"

[providers.anthropic]
api_key = "${ANTHROPIC_API_KEY}"

[providers.ollama]
base_url = "http://localhost:11434"
```

## Common Commands

| Command | Description |
|---------|-------------|
| `ember chat` | Start interactive chat |
| `ember chat "prompt"` | Single-turn chat |
| `ember chat --agent` | Agent mode with tools |
| `ember config list` | Show current config |
| `ember serve` | Start web interface |

## Next Steps

- [Configuration Guide](./configuration.md) - Detailed configuration options
- [First Chat](./first-chat.md) - In-depth chat features
- [Provider Setup](../providers/index.md) - Configure all 9 providers
- [Agent Mode](../guide/agent-mode.md) - Use tools and agents

## Troubleshooting Quick Fixes

### "API key not found"

```bash
# Check if key is set
echo $OPENAI_API_KEY

# Set it in your shell config
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc
source ~/.zshrc
```

### "Connection refused" (Ollama)

```bash
# Start Ollama server
ollama serve

# In another terminal
ember chat --provider ollama
```

### "Model not found"

```bash
# List available models
ember config list-models --provider openai

# For Ollama, pull the model first
ollama pull llama3
```

## Example Session

```bash
$ ember chat
🔥 Ember v1.0.0 - AI Agent Framework
Provider: openai | Model: gpt-4

You: What can you help me with?