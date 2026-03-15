# Mistral AI

Mistral AI is a French AI company offering powerful models with a focus on European data privacy and strong coding capabilities.

## Quick Start

```bash
export MISTRAL_API_KEY="..."
ember chat --provider mistral "Hello!"
```

## Getting an API Key

1. Visit [console.mistral.ai](https://console.mistral.ai)
2. Create an account
3. Navigate to **API Keys**

## Configuration

```toml
[providers.mistral]
api_key = "..."
default_model = "mistral-large-latest"
```

## Available Models

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `mistral-large-latest` | 128K | $2.00 | $6.00 | Best quality |
| `mistral-small-latest` | 128K | $0.20 | $0.60 | Fast & cheap |
| `codestral-latest` | 32K | $0.20 | $0.60 | Coding |
| `pixtral-12b-2409` | 128K | $0.15 | $0.15 | Vision |

## CLI Usage

```bash
ember chat --provider mistral "Question"
ember chat --provider mistral --model codestral-latest "Write code"
```

## Why Mistral?

✅ European company (GDPR compliant)
✅ Excellent coding model (Codestral)
✅ Competitive pricing
✅ Open-weight models available

## Resources

- [Mistral Console](https://console.mistral.ai)
- [Mistral Documentation](https://docs.mistral.ai)