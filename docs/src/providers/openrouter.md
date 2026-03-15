# OpenRouter

OpenRouter is a unified API gateway that provides access to 100+ AI models through a single endpoint.

## Overview

OpenRouter acts as a router between your application and various AI providers. It offers:

- **Access to 100+ Models**: Including GPT-4, Claude, Llama, Mistral, and many more
- **Unified API**: One API key for all providers
- **Automatic Fallbacks**: Built-in failover between providers
- **Cost Transparency**: Real-time pricing across all models

## Configuration

### API Key Setup

1. Create an account at [openrouter.ai](https://openrouter.ai)
2. Generate an API key in your dashboard
3. Set the environment variable:

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

### Basic Usage

```rust
use ember_llm::{OpenRouterProvider, LLMProvider, Message, Role};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = OpenRouterProvider::new()?;
    
    let messages = vec![
        Message {
            role: Role::User,
            content: "What is Rust?".to_string(),
        },
    ];
    
    let response = provider.chat("openai/gpt-4", &messages).await?;
    println!("{}", response.content);
    
    Ok(())
}
```

### CLI Usage

```bash
# Use any model via OpenRouter
ember chat --provider openrouter --model "openai/gpt-4"

# Use Claude via OpenRouter
ember chat --provider openrouter --model "anthropic/claude-3-opus"

# Use open-source models
ember chat --provider openrouter --model "meta-llama/llama-3-70b-instruct"
```

## Available Models

OpenRouter provides access to models from many providers:

### OpenAI Models
- `openai/gpt-4-turbo` - Latest GPT-4 Turbo
- `openai/gpt-4` - Standard GPT-4
- `openai/gpt-3.5-turbo` - Fast and affordable

### Anthropic Models
- `anthropic/claude-3-opus` - Most capable
- `anthropic/claude-3-sonnet` - Balanced
- `anthropic/claude-3-haiku` - Fast and cheap

### Meta Llama Models
- `meta-llama/llama-3-70b-instruct` - Large Llama 3
- `meta-llama/llama-3-8b-instruct` - Small Llama 3

### Mistral Models
- `mistral/mistral-large` - Most capable
- `mistral/mistral-medium` - Balanced
- `mistral/mixtral-8x7b-instruct` - MoE model

### Google Models
- `google/gemini-pro` - Gemini Pro
- `google/palm-2-chat-bison` - PaLM 2

### And Many More
Visit [openrouter.ai/models](https://openrouter.ai/models) for the complete list.

## Configuration Options

```rust
use ember_llm::OpenRouterProvider;

let provider = OpenRouterProvider::builder()
    .api_key("sk-or-v1-...")
    .site_url("https://yourapp.com")  // For rankings
    .site_name("Your App")
    .build()?;
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your API key |
| `OPENROUTER_SITE_URL` | Your site URL (optional) |
| `OPENROUTER_SITE_NAME` | Your app name (optional) |

## Advanced Features

### Model Routing

OpenRouter can automatically select the best model:

```rust
// Let OpenRouter choose the best model for the task
let response = provider.chat("auto", &messages).await?;

// Or use fallback routing
let response = provider.chat_with_fallback(
    &["openai/gpt-4", "anthropic/claude-3-opus"],
    &messages
).await?;
```

### Streaming

```rust
use futures::StreamExt;

let mut stream = provider.chat_stream("openai/gpt-4", &messages).await?;

while let Some(chunk) = stream.next().await {
    match chunk {
        Ok(text) => print!("{}", text),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

### Cost Tracking

```rust
let response = provider.chat_with_usage("openai/gpt-4", &messages).await?;

if let Some(usage) = response.usage {
    println!("Cost: ${:.6}", usage.total_cost);
    println!("Tokens: {} in, {} out", usage.prompt_tokens, usage.completion_tokens);
}
```

## Pricing

OpenRouter passes through provider pricing plus a small margin. Benefits:

- **Transparent Pricing**: See costs per request
- **No Minimums**: Pay only for what you use
- **Credit System**: Prepay for discounts

Check [openrouter.ai/pricing](https://openrouter.ai/pricing) for current rates.

## Use Cases

### Multi-Provider Fallback

```rust
use ember_llm::{Router, OpenRouterProvider};

// Use OpenRouter as a fallback provider
let router = Router::new()
    .add_provider("primary", OpenAIProvider::new()?)
    .add_provider("fallback", OpenRouterProvider::new()?)
    .with_fallback_strategy();
```

### Model Comparison

```rust
// Test different models through one API
let models = [
    "openai/gpt-4",
    "anthropic/claude-3-opus",
    "meta-llama/llama-3-70b-instruct",
];

for model in models {
    let response = provider.chat(model, &messages).await?;
    println!("{}: {}", model, response.content);
}
```

### Budget-Conscious Usage

```rust
// Use cheaper models for simple tasks
let cheap_models = [
    "openai/gpt-3.5-turbo",
    "mistral/mistral-7b-instruct",
];

let response = provider.chat_with_budget(
    cheap_models,
    &messages,
    max_cost: 0.001,  // $0.001 per request max
).await?;
```

## Troubleshooting

### Common Issues

**Rate Limits**
```
Error: Rate limit exceeded
Solution: OpenRouter aggregates limits. Wait or upgrade plan.
```

**Model Unavailable**
```
Error: Model not available
Solution: Check openrouter.ai/models for current availability.
```

**Credit Balance**
```
Error: Insufficient credits
Solution: Add credits at openrouter.ai/account
```

## Best Practices

1. **Use specific model IDs** - Don't rely on aliases
2. **Monitor costs** - Use the dashboard to track spending
3. **Set up alerts** - Configure budget alerts
4. **Cache responses** - Reduce duplicate requests
5. **Use streaming** - Better user experience for long responses

## Related Documentation

- [Provider Overview](./index.md)
- [OpenAI](./openai.md)
- [Anthropic](./anthropic.md)
- [Model Registry](../advanced/model-registry.md)