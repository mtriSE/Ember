# xAI (Grok)

xAI is Elon Musk's AI company offering the Grok family of models, known for real-time knowledge and unique personality.

## Overview

xAI provides:

- **Grok Models**: Cutting-edge language models with real-time X (Twitter) knowledge
- **Real-time Information**: Access to current events and trends
- **Unique Personality**: Models with humor and directness
- **Large Context**: Up to 128K token context window

## Configuration

### API Key Setup

1. Sign up at [x.ai](https://x.ai) or access via X Premium+
2. Generate an API key in your dashboard
3. Set the environment variable:

```bash
export XAI_API_KEY="xai-..."
```

### Basic Usage

```rust
use ember_llm::{XAIProvider, LLMProvider, Message, Role};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = XAIProvider::new()?;
    
    let messages = vec![
        Message {
            role: Role::User,
            content: "What's happening in tech today?".to_string(),
        },
    ];
    
    let response = provider.chat("grok-2", &messages).await?;
    println!("{}", response.content);
    
    Ok(())
}
```

### CLI Usage

```bash
# Chat with Grok
ember chat --provider xai --model grok-2

# Use Grok for coding
ember chat --provider xai --model grok-2 "Explain async/await in Rust"

# Real-time information queries
ember chat --provider xai --model grok-2 "What are the trending topics right now?"
```

## Available Models

### Grok-2
The flagship model with best overall performance.

| Property | Value |
|----------|-------|
| Context Window | 128K tokens |
| Knowledge Cutoff | Real-time (via X) |
| Best For | General tasks, real-time info |

```bash
ember chat --provider xai --model grok-2
```

### Grok-2-mini
Faster, more efficient version for simpler tasks.

| Property | Value |
|----------|-------|
| Context Window | 128K tokens |
| Speed | 2x faster than Grok-2 |
| Best For | Quick queries, simple tasks |

```bash
ember chat --provider xai --model grok-2-mini
```

### Grok-1.5
Previous generation, still available for compatibility.

| Property | Value |
|----------|-------|
| Context Window | 128K tokens |
| Best For | Legacy applications |

## Configuration Options

```rust
use ember_llm::XAIProvider;

let provider = XAIProvider::builder()
    .api_key("xai-...")
    .default_model("grok-2")
    .timeout(Duration::from_secs(120))
    .build()?;
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `XAI_API_KEY` | Your xAI API key |
| `XAI_BASE_URL` | Custom API endpoint (optional) |

## Advanced Features

### Real-time Knowledge

Grok has access to real-time information from X (Twitter):

```rust
let messages = vec![
    Message {
        role: Role::System,
        content: "You have access to real-time information. Be helpful and factual.".to_string(),
    },
    Message {
        role: Role::User,
        content: "What are people saying about the latest tech announcement?".to_string(),
    },
];

let response = provider.chat("grok-2", &messages).await?;
```

### Streaming

```rust
use futures::StreamExt;

let mut stream = provider.chat_stream("grok-2", &messages).await?;

while let Some(chunk) = stream.next().await {
    match chunk {
        Ok(text) => print!("{}", text),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

### Function Calling

Grok supports function calling for tool use:

```rust
use ember_llm::{Tool, ToolParameter};

let tools = vec![
    Tool {
        name: "search_x".to_string(),
        description: "Search X for recent posts".to_string(),
        parameters: vec![
            ToolParameter {
                name: "query".to_string(),
                param_type: "string".to_string(),
                description: "Search query".to_string(),
                required: true,
            },
        ],
    },
];

let response = provider.chat_with_tools("grok-2", &messages, &tools).await?;
```

### Long Context

Grok excels at processing long documents:

```rust
// Process entire codebases or documents
let long_content = std::fs::read_to_string("large_document.md")?;

let messages = vec![
    Message {
        role: Role::User,
        content: format!("Summarize this document:\n\n{}", long_content),
    },
];

// 128K context handles large inputs easily
let response = provider.chat("grok-2", &messages).await?;
```

## Use Cases

### Real-time Analysis

```rust
// Get current market sentiment
let response = provider.chat("grok-2", &[
    Message {
        role: Role::User,
        content: "What's the current sentiment around AI stocks on X?".to_string(),
    },
]).await?;
```

### Code Generation

```rust
// Grok is effective at coding tasks
let response = provider.chat("grok-2", &[
    Message {
        role: Role::System,
        content: "You are a Rust expert. Write clean, idiomatic code.".to_string(),
    },
    Message {
        role: Role::User,
        content: "Write a concurrent web scraper in Rust".to_string(),
    },
]).await?;
```

### Trend Analysis

```rust
// Analyze trending topics
let response = provider.chat("grok-2", &[
    Message {
        role: Role::User,
        content: "What are the top 5 tech trends being discussed today?".to_string(),
    },
]).await?;
```

## Pricing

xAI offers competitive pricing:

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Grok-2 | $2.00 | $10.00 |
| Grok-2-mini | $0.50 | $2.00 |

Check [x.ai/pricing](https://x.ai) for current rates.

## Troubleshooting

### Common Issues

**Authentication Failed**
```
Error: Invalid API key
Solution: Verify your XAI_API_KEY is correct and active.
```

**Rate Limited**
```
Error: Rate limit exceeded
Solution: Implement exponential backoff or upgrade your plan.
```

**Timeout**
```
Error: Request timeout
Solution: Increase timeout for complex queries:
  provider.with_timeout(Duration::from_secs(180))
```

## Best Practices

1. **Leverage real-time knowledge** - Grok excels at current events
2. **Use system prompts** - Guide the model's personality and focus
3. **Stream for UX** - Use streaming for better user experience
4. **Handle long contexts** - Take advantage of 128K window for documents
5. **Consider mini for speed** - Use grok-2-mini for simple queries

## Comparison with Other Providers

| Feature | Grok-2 | GPT-4 | Claude 3 |
|---------|--------|-------|----------|
| Context Window | 128K | 128K | 200K |
| Real-time Knowledge | ✅ (X) | ❌ | ❌ |
| Function Calling | ✅ | ✅ | ✅ |
| Vision | Coming Soon | ✅ | ✅ |

## Related Documentation

- [Provider Overview](./index.md)
- [OpenAI](./openai.md)
- [Anthropic](./anthropic.md)
- [Model Registry](../advanced/model-registry.md)