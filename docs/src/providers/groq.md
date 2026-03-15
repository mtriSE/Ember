# Groq

Groq offers the fastest LLM inference in the industry with their proprietary LPU™ (Language Processing Unit) hardware. Ideal for applications requiring extremely low latency.

## Quick Start

```bash
export GROQ_API_KEY="gsk_..."
ember chat --provider groq "Hello!"
```

## Getting an API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Create a free account
3. Navigate to **API Keys**
4. Create a new key (starts with `gsk_`)

**Note:** Groq offers a generous free tier!

## Configuration

```toml
[providers.groq]
api_key = "gsk_..."
default_model = "llama-3.3-70b-versatile"
```

## Available Models

| Model | Context | Speed | Best For |
|-------|---------|-------|----------|
| `llama-3.3-70b-versatile` | 128K | ~250 T/s | General, best quality |
| `llama-3.3-70b-specdec` | 8K | ~400 T/s | Ultra-fast |
| `llama-3.2-90b-vision-preview` | 128K | ~150 T/s | Vision + Text |
| `mixtral-8x7b-32768` | 32K | ~500 T/s | Fast, good quality |

## Free Tier Limits

| Model | Requests/Day | Tokens/Min |
|-------|--------------|------------|
| 70B models | 100 | 6,000 |
| 8B/9B models | 1,000 | 20,000 |

## CLI Usage

```bash
ember chat --provider groq "Quick question"
ember chat --provider groq --model llama-3.3-70b-versatile "Complex question"
```

## Speed Comparison

| Provider | Model | Time to First Token | Tokens/Second |
|----------|-------|---------------------|---------------|
| **Groq** | Llama 70B | ~50ms | ~250 |
| OpenAI | GPT-4o | ~200ms | ~50 |
| Anthropic | Claude 3.5 | ~300ms | ~40 |

**Groq is 5-10x faster than other cloud providers!**

## When to Use Groq?

✅ Real-time chat applications
✅ Low latency requirements
✅ Free/affordable usage
✅ High throughput needs

## Resources

- [Groq Console](https://console.groq.com)
- [Groq Documentation](https://console.groq.com/docs)