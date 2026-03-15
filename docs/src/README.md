# Ember Documentation

**The Rust AI Agent Framework That Just Works**

Welcome to the Ember documentation. Ember is a blazing-fast, memory-safe AI agent framework written in Rust that provides:

- **Instant startup** (<100ms cold start)
- **Single binary** (no runtime dependencies)
- **100% offline capable** (works with local Ollama)
- **Built-in tools** (shell, filesystem, web, browser)
- **Streaming responses** (real-time output)
- **Memory & RAG** (vector search with local embeddings)

## Quick Start

```bash
# Install Ember
curl -fsSL https://ember.dev/install.sh | sh

# Start chatting
ember chat
```

That's it! No Python, no Node.js, no complex setup.

## Why Ember?

| Feature | Other Frameworks | Ember |
|---------|-----------------|-------|
| Setup Time | 30+ minutes | **30 seconds** |
| Memory Usage | 500MB+ | **<50MB** |
| Startup | 2-5 seconds | **<100ms** |
| Offline | No | **Yes** |

## Features at a Glance

### CLI Interface
```bash
# Simple chat
ember chat "What is Rust?"

# Interactive mode
ember chat

# Agent mode with tools
ember chat --tools shell,filesystem "Create a Python project"

# Terminal UI
ember tui
```

### Rust Library
```rust
use ember_llm::{OllamaProvider, CompletionRequest, Message, LLMProvider};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let provider = OllamaProvider::new();
    
    let request = CompletionRequest::new("llama3.2")
        .with_message(Message::user("Hello!"));
    
    let response = provider.complete(request).await?;
    println!("{}", response.content);
    
    Ok(())
}
```

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/ember-ai/ember/issues)
- **Discord**: [Join our community](https://discord.gg/ember)
- **API Docs**: [docs.rs/ember](https://docs.rs/ember)

## Contributing

We welcome contributions! Check out the [Contributing Guide](./dev/contributing.md) to get started.

---

<p align="center">
<strong>Small spark, big fire.</strong>
</p>