# OpenAI

OpenAI is the market leader in LLMs, offering the GPT model family including GPT-4o, GPT-4o-mini, and the o1/o3 reasoning models.

## Quick Start

```bash
# Set API key
export OPENAI_API_KEY="sk-..."

# Start chatting
ember chat "Hello!"
```

## Getting an API Key

1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to **API Keys** in the dashboard
4. Click **Create new secret key**
5. Copy the key (it's only shown once!)

## Configuration

### Environment Variables

```bash
# Required
export OPENAI_API_KEY="sk-..."

# Optional
export OPENAI_ORG_ID="org-..."        # Organization ID
export OPENAI_BASE_URL="https://..."   # Custom endpoint
```

### Configuration File

```toml
# ~/.config/ember/config.toml

[providers.openai]
api_key = "sk-..."
org_id = "org-..."                     # Optional
base_url = "https://api.openai.com/v1" # Optional
default_model = "gpt-4o"
timeout_seconds = 60
max_retries = 3
```

## Available Models

### GPT-4o Family

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `gpt-4o` | 128K | $2.50 | $10.00 | Best quality |
| `gpt-4o-mini` | 128K | $0.15 | $0.60 | Fast & cheap |

### o1 Reasoning Models

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `o1` | 200K | $15.00 | $60.00 | Complex reasoning |
| `o1-mini` | 128K | $3.00 | $12.00 | Fast reasoning |

### o3 Models (New)

| Model | Context | Input/1M | Output/1M | Best For |
|-------|---------|----------|-----------|----------|
| `o3-mini` | 200K | $1.10 | $4.40 | Efficient reasoning |

## CLI Usage

```bash
# Simple chat
ember chat "Explain quantum computing"

# With specific model
ember chat --model gpt-4o-mini "Quick question"

# With system prompt
ember chat --system "You are a helpful coding assistant" "Review this code"

# Without streaming
ember chat --no-stream "Generate a long list"
```

## Rust API

```rust
use ember::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let provider = OpenAIProvider::from_env()?;
    let response = provider.chat("Hello!").await?;
    println!("{}", response);
    Ok(())
}
```

## Error Handling

### API Key Error
```
Error: OpenAI API key not found

Solution:
1. export OPENAI_API_KEY="sk-..."
2. Or configure in ~/.config/ember/config.toml
```

### Rate Limit
```
Error: Rate limit exceeded

Ember automatically waits and retries.
For immediate solution: Upgrade to higher tier at OpenAI.
```

## Best Practices

1. **Model Selection**: Use `gpt-4o-mini` for most tasks, `gpt-4o` for complex ones
2. **Temperature**: `0.0` for deterministic, `0.7` for balanced, `1.0+` for creative
3. **Cost optimization**: Enable response caching, use smaller models when possible

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)