# DeepSeek

DeepSeek offers very cost-effective LLMs with strong reasoning capabilities. The DeepSeek-R1 model is particularly known for mathematical and logical thinking.

## Quick Start

```bash
export DEEPSEEK_API_KEY="sk-..."
ember chat --provider deepseek "Hello!"
```

## Getting an API Key

1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Create an account
3. Navigate to **API Keys**

## Configuration

```toml
[providers.deepseek]
api_key = "sk-..."
default_model = "deepseek-chat"
```

## Available Models

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `deepseek-chat` | 64K | $0.14 | $0.28 | General |
| `deepseek-reasoner` | 64K | $0.55 | $2.19 | Math, Logic |

## CLI Usage

```bash
# General use
ember chat --provider deepseek "Explain Rust"

# For reasoning/math
ember chat --provider deepseek --model deepseek-reasoner "Solve: x² + 5x + 6 = 0"
```

## When to Use DeepSeek?

✅ Budget-conscious usage
✅ Mathematical problems
✅ Logical reasoning
✅ Chinese-English translations

## Resources

- [DeepSeek Platform](https://platform.deepseek.com)
- [DeepSeek Docs](https://platform.deepseek.com/docs)