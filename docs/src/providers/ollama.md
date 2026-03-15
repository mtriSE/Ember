# Ollama (Local Models)

Ollama enables running LLMs locally on your computer - **100% free, offline, and private**. Ideal for developers who don't want to send data to the cloud.

## Quick Start

```bash
# Install Ollama (once)
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model (once)
ollama pull llama3.2

# Use with Ember
ember chat --provider ollama "Hello!"
```

## Why Ollama?

| Benefit | Description |
|---------|-------------|
| **Free** | No API costs, no subscriptions |
| **Offline** | Works without internet |
| **Private** | Your data stays on your machine |
| **Fast** | No network latency |
| **Unlimited** | No rate limits or token limits |

## Installation

### macOS
```bash
brew install ollama
# or
curl -fsSL https://ollama.ai/install.sh | sh
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download from [ollama.ai/download](https://ollama.ai/download)

## Configuration

```toml
[providers.ollama]
base_url = "http://localhost:11434"
default_model = "llama3.2"
timeout_seconds = 300
```

## Available Models

| Model | Size | RAM | Best For |
|-------|------|-----|----------|
| `llama3.2` | 4.7GB | 8GB | General, best balance |
| `llama3.2:1b` | 1.3GB | 4GB | Fast, low RAM |
| `codellama:7b` | 3.8GB | 8GB | Coding |
| `deepseek-r1:8b` | 4.9GB | 10GB | Reasoning, Math |
| `qwen2.5:7b` | 4.7GB | 8GB | Multilingual |

## CLI Usage

```bash
ember chat --provider ollama "Explain Rust ownership"
ember chat --provider ollama --model codellama:7b "Write a sorting algorithm"
```

## Rust API

```rust
use ember::prelude::*;

let provider = OllamaProvider::new()?;
let response = provider.chat("Hello!").await?;
```

## Hardware Recommendations

- **Minimum** (1b-3b models): 8GB RAM
- **Recommended** (7b models): 16GB RAM, GPU optional
- **Ideal** (13b-34b models): 32GB RAM, 24GB VRAM
- **High-end** (70b+ models): 64GB+ RAM, 48GB+ VRAM

## Troubleshooting

### Ollama not starting
```bash
ollama serve  # Start manually
```

### Out of memory
Use a smaller model: `ollama pull llama3.2:1b`

## Resources

- [Ollama Website](https://ollama.ai)
- [Ollama Model Library](https://ollama.ai/library)