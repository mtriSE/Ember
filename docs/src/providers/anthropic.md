# Anthropic (Claude)

Anthropic offers the Claude model family, known for excellent coding capabilities, analysis, and large context windows. Claude 3.5 Sonnet is considered one of the best models for programming tasks.

## Quick Start

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
ember chat --provider anthropic "Hello!"
```

## Getting an API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Click **Create Key**

## Configuration

```toml
[providers.anthropic]
api_key = "sk-ant-..."
default_model = "claude-3-5-sonnet-20241022"
```

## Available Models

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `claude-3-5-sonnet-20241022` | 200K | $3.00 | $15.00 | Coding, Analysis |
| `claude-3-5-haiku-20241022` | 200K | $0.80 | $4.00 | Fast & cheap |
| `claude-3-opus-20240229` | 200K | $15.00 | $75.00 | Highest quality |

## CLI Usage

```bash
ember chat --provider anthropic "Explain Rust lifetimes"
ember chat --provider anthropic --model claude-3-5-haiku-20241022 "Quick question"
```

## Rust API

```rust
use ember::prelude::*;

let provider = AnthropicProvider::from_env()?;
let response = provider.chat("Hello!").await?;
```

## Why Claude for Coding?

1. **Context understanding**: Better comprehension of large codebases
2. **Precise instructions**: Follows coding standards more accurately
3. **Less hallucination**: Says "I don't know" instead of making things up
4. **Better explanations**: Explains code decisions thoroughly

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Claude Model Card](https://www.anthropic.com/claude)