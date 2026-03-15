# Getting Started with Ember

> Small spark, big fire - Your AI assistant in Rust

## Installation

### From Binary (Recommended)

```bash
# macOS (Apple Silicon)
curl -L https://github.com/ember-ai/ember/releases/latest/download/ember-aarch64-apple-darwin.tar.gz | tar xz
sudo mv ember /usr/local/bin/

# macOS (Intel)
curl -L https://github.com/ember-ai/ember/releases/latest/download/ember-x86_64-apple-darwin.tar.gz | tar xz
sudo mv ember /usr/local/bin/

# Linux (x86_64)
curl -L https://github.com/ember-ai/ember/releases/latest/download/ember-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv ember /usr/local/bin/

# Windows (PowerShell)
Invoke-WebRequest -Uri https://github.com/ember-ai/ember/releases/latest/download/ember-x86_64-pc-windows-msvc.zip -OutFile ember.zip
Expand-Archive ember.zip -DestinationPath .
Move-Item ember.exe C:\Windows\System32\
```

### From Source

```bash
# Requires Rust 1.75+
cargo install ember-cli

# Or build from source
git clone https://github.com/ember-ai/ember.git
cd ember
cargo build --release
```

## Quick Start

### 1. Set up API Keys

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Or Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Or Ollama (no API key needed for local models)
ollama serve
```

### 2. Start Chatting

```bash
# Interactive chat
ember chat

# One-shot query
ember chat "What is the meaning of life?"

# Use a specific model
ember chat --model gpt-4o "Explain quantum computing"

# Use Anthropic Claude
ember chat --provider anthropic "Write a poem about Rust"

# Use local Ollama
ember chat --provider ollama --model llama3.2 "Hello!"
```

### 3. Configuration

Create `~/.config/ember/config.toml`:

```toml
# Default provider and model
[default]
provider = "openai"
model = "gpt-4o-mini"

# Provider configurations
[providers.openai]
api_key = "${OPENAI_API_KEY}"

[providers.anthropic]
api_key = "${ANTHROPIC_API_KEY}"

[providers.ollama]
base_url = "http://localhost:11434"

# Agent settings
[agent]
max_iterations = 10
temperature = 0.7

# Tool permissions
[tools.shell]
enabled = true
allowed_commands = ["ls", "cat", "grep", "find", "git"]

[tools.filesystem]
enabled = true
allowed_paths = ["~/projects", "/tmp"]

[tools.web]
enabled = true
allowed_domains = ["api.github.com", "*.openai.com"]
```

## Using as a Library

Add to your `Cargo.toml`:

```toml
[dependencies]
ember-llm = "0.1"
ember-core = "0.1"
tokio = { version = "1", features = ["full"] }
```

### Basic Completion

```rust
use ember_llm::{OpenAIProvider, LLMProvider, CompletionRequest, Message};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = OpenAIProvider::from_env()?;
    
    let request = CompletionRequest::new("gpt-4o-mini")
        .with_message(Message::user("Hello!"));
    
    let response = provider.complete(request).await?;
    println!("{}", response.content);
    
    Ok(())
}
```

### Streaming

```rust
use ember_llm::{OpenAIProvider, LLMProvider, CompletionRequest, Message};
use futures::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = OpenAIProvider::from_env()?;
    
    let request = CompletionRequest::new("gpt-4o-mini")
        .with_message(Message::user("Tell me a story"));
    
    let mut stream = provider.complete_stream(request).await?;
    
    while let Some(chunk) = stream.next().await {
        if let Ok(chunk) = chunk {
            if let Some(content) = chunk.content {
                print!("{}", content);
            }
        }
    }
    
    Ok(())
}
```

### Using Multiple Providers

```rust
use ember_llm::{LLMRouter, OpenAIProvider, AnthropicProvider, OllamaProvider};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut router = LLMRouter::new();
    
    // Register providers
    if let Ok(openai) = OpenAIProvider::from_env() {
        router.register("openai", openai);
    }
    if let Ok(anthropic) = AnthropicProvider::from_env() {
        router.register("anthropic", anthropic);
    }
    if let Ok(ollama) = OllamaProvider::new("http://localhost:11434") {
        router.register("ollama", ollama);
    }
    
    // Route by model name
    let response = router.complete("gpt-4o", request).await?;
    
    Ok(())
}
```

## Key Concepts

### Providers

Ember supports multiple LLM providers through a unified interface:

| Provider | Models | Streaming | Tools | Vision |
|----------|--------|-----------|-------|--------|
| OpenAI | GPT-4o, GPT-4o-mini | Yes | Yes | Yes |
| Anthropic | Claude 3.5 Sonnet/Haiku | Yes | Yes | Yes |
| Ollama | Llama 3.2, Mistral, etc. | Yes | Yes | No |

### Messages

Messages follow the standard role-based format:

```rust
Message::system("You are a helpful assistant")  // Instructions
Message::user("Hello!")                          // User input
Message::assistant("Hi there!")                  // LLM response
Message::tool_result("tool_id", "result")        // Tool output
```

### Tools

Tools enable the LLM to perform actions:

```rust
use ember_llm::ToolDefinition;
use serde_json::json;

let weather_tool = ToolDefinition::new(
    "get_weather",
    "Get the current weather for a location",
    json!({
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name"
            }
        },
        "required": ["location"]
    })
);

let request = CompletionRequest::new("gpt-4o")
    .with_message(Message::user("What's the weather in Tokyo?"))
    .with_tools(vec![weather_tool]);
```

## Next Steps

- [Tool Configuration Guide](./tools.md)
- [Agent Development](./agents.md)
- [Plugin System](./plugins.md)
- [API Reference](https://docs.rs/ember-llm)

## Getting Help

- [GitHub Issues](https://github.com/ember-ai/ember/issues)
- [Discussions](https://github.com/ember-ai/ember/discussions)
- [Discord Community](https://discord.gg/ember-ai)