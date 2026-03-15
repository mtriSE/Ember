# Ember Telemetry

Privacy-first, opt-in telemetry for Ember AI.

## Philosophy

Ember Telemetry is built on six core principles:

1. **Opt-in by default** - Telemetry is disabled unless you explicitly enable it
2. **No PII collection** - We never collect personal identifiable information
3. **Local-first** - All data is stored locally first, remote reporting is optional
4. **Transparent** - You can view all collected data at any time
5. **Minimal data** - We only collect what's necessary for improving the product
6. **User control** - You can delete your data at any time

## What We Collect (When Enabled)

| Data Type | Example | Purpose |
|-----------|---------|---------|
| Command usage | "chat", "agent" | Know which features are popular |
| Provider usage | "openai", "ollama" | Understand provider preferences |
| Error types | "network_error" | Identify common issues |
| Latency buckets | "100-500ms" | Monitor performance |
| Session info | Duration buckets | Understand usage patterns |
| Version | "0.1.0" | Track adoption |
| Platform | "macos", "linux" | Know our user base |

## What We NEVER Collect

- ❌ Prompts or messages
- ❌ API keys or credentials
- ❌ File contents or paths
- ❌ IP addresses
- ❌ Email addresses
- ❌ Personal information
- ❌ Conversation history
- ❌ Exact timestamps (only bucketed)
- ❌ Exact durations (only bucketed)

## Usage

### Basic Usage

```rust
use ember_telemetry::{Telemetry, TelemetryConfig};

#[tokio::main]
async fn main() {
    // Telemetry is disabled by default
    let config = TelemetryConfig::default();
    let telemetry = Telemetry::new(config).await.unwrap();
    
    // Explicitly enable telemetry
    telemetry.enable().await;
    
    // Record events
    telemetry.record_command("chat").await;
    telemetry.record_provider_used("openai", "gpt-4").await;
    telemetry.record_latency("api_call", 250).await;
    
    // Get statistics
    let stats = telemetry.get_statistics().await;
    println!("Total events: {}", stats.total_events);
    
    // Export data for review
    let json = telemetry.export_data().await.unwrap();
    println!("{}", json);
    
    // Delete all data
    telemetry.delete_all_data().await.unwrap();
}
```

### Disabled Mode (No-Op)

```rust
// Create a telemetry instance that does nothing
let telemetry = Telemetry::disabled();

// All calls are no-ops
telemetry.record_command("chat").await; // Does nothing
```

### Configuration

```rust
use ember_telemetry::{TelemetryConfig, EventCategory};

let config = TelemetryConfig {
    // Disabled by default
    enabled: false,
    
    // Don't send to remote server
    remote_reporting: false,
    
    // Flush interval (seconds)
    flush_interval_secs: 60,
    
    // Max events to store locally
    max_local_events: 10000,
    
    // Categories to collect
    categories: vec![
        EventCategory::Usage,
        EventCategory::Error,
        EventCategory::Performance,
    ],
    
    ..Default::default()
};
```

## Data Storage

Telemetry data is stored locally in:

| Platform | Location |
|----------|----------|
| macOS | `~/Library/Application Support/dev.ember.ember-ai/telemetry.json` |
| Linux | `~/.local/share/ember-ai/telemetry.json` |
| Windows | `%APPDATA%\ember\ember-ai\telemetry.json` |

You can:
- View this file at any time to see exactly what's collected
- Delete this file to remove all telemetry data
- Use `telemetry.export_data()` to get a formatted JSON export

## Privacy Protections

### Data Bucketing

Instead of collecting exact values, we bucket data:

```
Latency: 247ms → "100-500ms"
Session: 8 minutes → "5-15min"
```

### Model Name Anonymization

Custom model names are anonymized:

```
"gpt-4-turbo-preview-20240301" → "gpt-4-turbo"
"my-custom-finetuned-llama" → "custom"
```

### PII Detection

The anonymizer actively detects and redacts potential PII:

```rust
use ember_telemetry::anonymizer;

// Detected PII is redacted
assert_eq!(anonymizer::redact_pii("user@example.com"), "[REDACTED]");
assert_eq!(anonymizer::redact_pii("api_key=sk-xxx"), "[REDACTED]");

// Safe strings pass through
assert_eq!(anonymizer::redact_pii("gpt-4"), "gpt-4");
```

## CLI Integration

View your telemetry data:

```bash
# Show telemetry status
ember telemetry status

# Enable telemetry
ember telemetry enable

# Disable telemetry
ember telemetry disable

# Show collected data
ember telemetry show

# Export to file
ember telemetry export > telemetry.json

# Delete all data
ember telemetry delete
```

## Optional: Remote Reporting

Remote reporting is disabled by default. If enabled, data is sent to:
- Only the official Ember telemetry endpoint
- Over HTTPS
- In aggregated batches
- Without any identifying information

To enable:

```rust
let config = TelemetryConfig {
    enabled: true,
    remote_reporting: true,
    remote_endpoint: Some("https://telemetry.ember.dev".into()),
    ..Default::default()
};
```

## License

MIT OR Apache-2.0