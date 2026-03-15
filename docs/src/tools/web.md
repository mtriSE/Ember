# Web Tool

The Web tool enables Ember agents to make HTTP requests and fetch web content.

## Overview

The Web tool provides:
- HTTP GET/POST/PUT/DELETE requests
- JSON API interactions
- HTML content fetching
- Content parsing and extraction
- Domain restrictions

## Enabling the Web Tool

```bash
ember chat --agent --tools web "What's on the Rust homepage?"
```

## Capabilities

### HTTP Requests

```bash
ember chat --agent --tools web "Fetch the latest Rust version from the API"
```

Supports:
- GET, POST, PUT, PATCH, DELETE
- Custom headers
- Request body (JSON, form data)
- Authentication

### Content Fetching

```bash
ember chat --agent --tools web "Get the main content from this article"
```

Returns:
- Raw HTML
- Extracted text
- Parsed JSON
- Status codes

### API Interactions

```bash
ember chat --agent --tools web "Create a GitHub issue using the API"
```

Supports:
- REST APIs
- JSON payloads
- Bearer token auth
- Rate limit handling

## Configuration

### Basic Configuration

```toml
[agent.tools.web]
enabled = true
timeout = 30  # seconds
```

### Security Configuration

```toml
[agent.tools.web]
# Domain restrictions
allowed_domains = ["api.github.com", "docs.rs", "crates.io"]
blocked_domains = ["*.internal.com", "localhost", "127.0.0.1"]

# Protocol restrictions
allowed_protocols = ["https"]  # Block http

# Request limits
max_request_size = "1MB"
max_response_size = "10MB"
max_redirects = 5

# Rate limiting
requests_per_minute = 30
```

### Full Example

```toml
[agent.tools.web]
enabled = true
timeout = 30

# Domain security
allowed_domains = [
    "api.github.com",
    "*.githubusercontent.com",
    "api.openai.com",
    "docs.rs",
    "crates.io"
]

blocked_domains = [
    "localhost",
    "127.0.0.1",
    "*.local",
    "*.internal"
]

# Only HTTPS
allowed_protocols = ["https"]

# Request configuration
user_agent = "Ember/1.0"
max_redirects = 5
follow_redirects = true

# Size limits
max_request_size = "1MB"
max_response_size = "10MB"

# Rate limiting
requests_per_minute = 30
concurrent_requests = 5
```

## Usage Examples

### Fetching Web Content

```bash
# Get webpage content
ember chat --agent --tools web "What's on the Rust homepage?"

# Fetch documentation
ember chat --agent --tools web "Get the tokio documentation for async tasks"

# Download text content
ember chat --agent --tools web "Get the README from this GitHub repo"
```

### API Interactions

```bash
# REST API GET
ember chat --agent --tools web "Get my GitHub profile information"

# REST API POST
ember chat --agent --tools web "Create a new gist with this code"

# Check API status
ember chat --agent --tools web "Is the OpenAI API available?"
```

### Data Extraction

```bash
# Parse JSON
ember chat --agent --tools web "Get the latest npm package versions"

# Extract specific data
ember chat --agent --tools web "What's the current Bitcoin price?"

# Scrape content
ember chat --agent --tools web "Get the headlines from Hacker News"
```

## Programmatic Usage

### Rust API

```rust
use ember_tools::WebTool;

// Create with defaults
let web = WebTool::new();

// Create with configuration
let web = WebTool::builder()
    .timeout(Duration::from_secs(30))
    .allowed_domains(vec!["api.github.com"])
    .user_agent("Ember/1.0")
    .build()?;

// GET request
let response = web.execute(json!({
    "method": "GET",
    "url": "https://api.github.com/user"
})).await?;

// POST request with JSON
let response = web.execute(json!({
    "method": "POST",
    "url": "https://api.example.com/data",
    "headers": {
        "Content-Type": "application/json"
    },
    "body": {
        "key": "value"
    }
})).await?;
```

### With Authentication

```rust
let web = WebTool::builder()
    .default_header("Authorization", "Bearer token123")
    .build()?;

// Or per-request
let response = web.execute(json!({
    "method": "GET",
    "url": "https://api.github.com/user",
    "headers": {
        "Authorization": "Bearer token123"
    }
})).await?;
```

## Tool Schema

### GET Request

```json
{
  "method": "GET",
  "url": "https://api.example.com/data",
  "headers": {
    "Accept": "application/json"
  },
  "query": {
    "page": "1",
    "limit": "10"
  }
}
```

### POST Request

```json
{
  "method": "POST",
  "url": "https://api.example.com/data",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "example",
    "value": 123
  }
}
```

### Response Format

```json
{
  "status": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": "...",
  "elapsed_ms": 150
}
```

## Safety Considerations

### Domain Restrictions

Always configure allowed domains:

```toml
[agent.tools.web]
# Allowlist approach (recommended)
allowed_domains = ["api.github.com", "api.openai.com"]

# Block internal networks
blocked_domains = ["localhost", "127.*", "10.*", "192.168.*", "*.local"]
```

### HTTPS Only

Enforce encrypted connections:

```toml
[agent.tools.web]
allowed_protocols = ["https"]
# Blocks http:// URLs
```

### Rate Limiting

Prevent abuse:

```toml
[agent.tools.web]
requests_per_minute = 30
concurrent_requests = 3
```

### Response Size Limits

Prevent memory issues:

```toml
[agent.tools.web]
max_response_size = "10MB"
```

## Error Handling

### Connection Errors

```
URL: https://api.example.com
Error: Connection refused
```

### Timeout

```
URL: https://slow-api.example.com
Error: Request timed out after 30 seconds
```

### Domain Blocked

```
URL: https://internal.company.com
Error: Domain not in allowed list
```

### Status Errors

```
URL: https://api.example.com/data
Status: 404
Error: Not Found
```

## Debugging

### Verbose Logging

```bash
RUST_LOG=ember_tools::web=debug ember chat --agent --tools web "Fetch API"
```

### Request Logging

```toml
[agent.tools.web]
log_requests = true
log_responses = true
log_headers = false  # May contain secrets
```

## Best Practices

1. **Use allowlists** - Explicitly list allowed domains
2. **HTTPS only** - Never allow plain HTTP
3. **Set timeouts** - Prevent hanging requests
4. **Rate limit** - Respect API limits
5. **Size limits** - Prevent memory issues
6. **Log requests** - For debugging and audit

## Integration with Other Tools

### With Filesystem

```bash
# Download and save
ember chat --agent --tools web,filesystem "Download the Rust logo and save it"
```

### With Shell

```bash
# Fetch then process
ember chat --agent --tools web,shell "Get the JSON and format it with jq"
```

## Common Issues

### SSL Certificate Errors

```toml
[agent.tools.web]
# Only for development/testing!
verify_ssl = false
```

### Encoding Issues

```toml
[agent.tools.web]
default_encoding = "utf-8"
detect_encoding = true
```

### Large Responses

```toml
[agent.tools.web]
# Stream large responses
streaming = true
chunk_size = "64KB"
```

## Related Documentation

- [Tools Overview](./overview.md)
- [Browser Tool](./browser.md)
- [Agent Mode](../guide/agent-mode.md)
- [Configuration](../getting-started/configuration.md)