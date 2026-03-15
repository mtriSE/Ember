# LLM Providers

Ember supports 9+ LLM providers, all accessible through a unified API. This section describes the configuration and usage of each provider.

## Overview

| Provider | Type | Best For | Pricing |
|----------|------|----------|---------|
| [OpenAI](./openai.md) | Cloud | General purpose, GPT-4 | Paid |
| [Anthropic](./anthropic.md) | Cloud | Coding, Analysis | Paid |
| [Ollama](./ollama.md) | Local | Offline, Privacy | **Free** |
| [Gemini](./gemini.md) | Cloud | 2M context, Multimodal | Free tier |
| [Groq](./groq.md) | Cloud | Ultra-fast | Free tier |
| [DeepSeek](./deepseek.md) | Cloud | Affordable, Reasoning | Very cheap |
| [Mistral](./mistral.md) | Cloud | European, Coding | Paid |
| [OpenRouter](./openrouter.md) | Cloud | Multi-Provider | Varies |
| [xAI Grok](./xai.md) | Cloud | Real-time knowledge | Paid |

## Selecting a Provider

### Via CLI

```bash
# OpenAI (default)
ember chat "Hello!"

# Specific provider
ember chat --provider anthropic "Explain this code"
ember chat --provider ollama "Write a poem"
ember chat --provider groq "Quick question"
```

### Via Environment Variables

```bash
# Set default provider
export EMBER_DEFAULT_PROVIDER=ollama

# Then simply
ember chat "Hello!"
```

### Via Configuration File

```toml
# ~/.config/ember/config.toml

[default]
provider = "anthropic"
model = "claude-3-5-sonnet-20241022"

[providers.openai]
api_key = "sk-..."
default_model = "gpt-4o"

[providers.anthropic]
api_key = "sk-ant-..."
default_model = "claude-3-5-sonnet-20241022"

[providers.ollama]
base_url = "http://localhost:11434"
default_model = "llama3.2"
```

## Provider Comparison

### Speed (Time to First Token)

| Provider | Latency | Notes |
|----------|---------|-------|
| Groq | ~50ms | Fastest cloud inference |
| OpenAI | ~200ms | Very good |
| Anthropic | ~300ms | Good |
| Ollama | ~100-500ms | Hardware dependent |
| Gemini | ~150ms | Fast |

### Pricing (per 1M Tokens)

| Provider | Input | Output |
|----------|-------|--------|
| Ollama | $0 | $0 |
| Groq (Free) | $0 | $0 |
| DeepSeek | $0.14 | $0.28 |
| Gemini Flash | $0.075 | $0.30 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude Haiku | $0.25 | $1.25 |
| GPT-4o | $2.50 | $10 |
| Claude Sonnet | $3 | $15 |
| Claude Opus | $15 | $75 |

### Context Window

| Provider/Model | Max Tokens |
|----------------|------------|
| Gemini 1.5 Pro | 2,000,000 |
| Claude 3 | 200,000 |
| GPT-4o | 128,000 |
| Llama 3.2 | 128,000 |
| Mistral Large | 128,000 |

## Recommendations

### For Beginners
**Ollama** - Free, offline, no registration required.

```bash
# Install once
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2

# Use
ember chat --provider ollama
```

### For Productivity
**Anthropic Claude** or **OpenAI GPT-4o** - Best quality for complex tasks.

### For Speed
**Groq** - Extremely fast inference, free tier available.

### For Large Documents
**Google Gemini** - 2M token context for very long documents.

### For Budget-Conscious Users
**DeepSeek** - Very affordable with good quality.

## Multi-Provider Setup

Ember supports configuring multiple providers simultaneously:

```toml
# ~/.config/ember/config.toml

[providers.openai]
api_key = "sk-..."

[providers.anthropic]
api_key = "sk-ant-..."

[providers.ollama]
base_url = "http://localhost:11434"

# Routing rules
[routing]
# Use Ollama for simple tasks
simple = "ollama"
# Use Claude for coding
coding = "anthropic"
# Use GPT-4 for analysis
analysis = "openai"
```

## Fallback Configuration

Ember can automatically fall back to alternative providers:

```toml
[fallback]
enabled = true
order = ["openai", "anthropic", "ollama"]
on_rate_limit = true
on_error = true
```

## Next Steps

Choose a provider and follow the detailed configuration guide:

- [OpenAI](./openai.md) - The market leader
- [Anthropic](./anthropic.md) - Best coding capabilities
- [Ollama](./ollama.md) - 100% free and offline