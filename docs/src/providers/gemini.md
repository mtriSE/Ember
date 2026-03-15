# Google Gemini

Google Gemini offers powerful LLMs with an exceptionally large context window of up to 2 million tokens - ideal for analyzing very long documents.

## Quick Start

```bash
export GOOGLE_API_KEY="AI..."
ember chat --provider gemini "Hello!"
```

## Getting an API Key

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key**
3. Create a key for your project

## Configuration

```toml
[providers.gemini]
api_key = "AI..."
default_model = "gemini-2.0-flash"
```

## Available Models

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `gemini-2.0-flash` | 1M | $0.10 | $0.40 | Fast, multimodal |
| `gemini-1.5-pro` | 2M | $1.25 | $5.00 | Longest context |
| `gemini-1.5-flash` | 1M | $0.075 | $0.30 | Cheap, fast |

## Special Features

### 2M Token Context
```bash
# Analyze an entire book
cat book.txt | ember chat --provider gemini "Analyze this book"
```

### Multimodal (Images, Video, Audio)
```bash
ember chat --provider gemini --image photo.jpg "Describe this image"
```

## CLI Usage

```bash
ember chat --provider gemini "Question"
ember chat --provider gemini --model gemini-1.5-pro "Very long text..."
```

## When to Use Gemini?

✅ Very long documents (>100K tokens)
✅ Multimodal tasks
✅ Cost-effective usage

## Resources

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Docs](https://ai.google.dev/docs)