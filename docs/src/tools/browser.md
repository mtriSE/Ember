# Browser Tool

The Browser tool enables Ember agents to control a headless browser for complex web interactions.

## Overview

The Browser tool provides:
- Full browser automation via Chromium
- Page navigation and interaction
- Form filling and submission
- Screenshot capture
- JavaScript execution
- DOM manipulation

## Enabling the Browser Tool

```bash
ember chat --agent --tools browser "Take a screenshot of github.com"
```

## Capabilities

### Navigation

```bash
ember chat --agent --tools browser "Navigate to rust-lang.org and tell me what you see"
```

Supports:
- URL navigation
- Back/forward
- Refresh
- Wait for load

### Interaction

```bash
ember chat --agent --tools browser "Fill out the contact form on this page"
```

Supports:
- Click elements
- Type text
- Select dropdowns
- Upload files
- Scroll

### Screenshots

```bash
ember chat --agent --tools browser "Take a screenshot of the entire page"
```

Captures:
- Full page
- Viewport only
- Specific elements
- Multiple formats (PNG, JPEG)

### JavaScript Execution

```bash
ember chat --agent --tools browser "Extract all links from the page"
```

Enables:
- Run custom scripts
- Query DOM
- Modify page
- Extract data

## Configuration

### Basic Configuration

```toml
[agent.tools.browser]
enabled = true
headless = true
timeout = 30  # seconds
```

### Security Configuration

```toml
[agent.tools.browser]
# Domain restrictions
allowed_domains = ["github.com", "*.github.com"]
blocked_domains = ["localhost", "127.0.0.1"]

# Navigation restrictions
allow_downloads = false
allow_popups = false
allow_geolocation = false

# Resource limits
max_pages = 5
timeout = 30
```

### Full Example

```toml
[agent.tools.browser]
enabled = true
headless = true

# Browser settings
user_agent = "Mozilla/5.0 (compatible; Ember/1.0)"
viewport_width = 1920
viewport_height = 1080
device_scale_factor = 1

# Domain security
allowed_domains = [
    "github.com",
    "*.github.com",
    "docs.rs",
    "crates.io"
]

blocked_domains = [
    "localhost",
    "127.0.0.1",
    "*.local"
]

# Permissions
allow_javascript = true
allow_cookies = true
allow_downloads = false
allow_popups = false
allow_geolocation = false
allow_camera = false
allow_microphone = false

# Resource limits
max_pages = 3
timeout = 30
max_screenshot_size = "10MB"

# Performance
disable_images = false
disable_css = false
block_ads = true
```

## Usage Examples

### Web Research

```bash
# Screenshot a page
ember chat --agent --tools browser "Screenshot the Rust homepage"

# Extract content
ember chat --agent --tools browser "Get the main article content from this news page"

# Check page status
ember chat --agent --tools browser "Is this website loading correctly?"
```

### Form Automation

```bash
# Fill a form
ember chat --agent --tools browser "Fill out the signup form with test data"

# Submit search
ember chat --agent --tools browser "Search for 'Rust async' on this docs site"

# Login (use with caution)
ember chat --agent --tools browser "Log into the dashboard with these credentials"
```

### Testing

```bash
# Visual regression
ember chat --agent --tools browser "Compare this page to the screenshot"

# Check elements
ember chat --agent --tools browser "Verify the submit button is visible"

# Test flow
ember chat --agent --tools browser "Test the checkout process"
```

## Programmatic Usage

### Rust API

```rust
use ember_tools::BrowserTool;

// Create with defaults
let browser = BrowserTool::new().await?;

// Create with configuration
let browser = BrowserTool::builder()
    .headless(true)
    .viewport(1920, 1080)
    .allowed_domains(vec!["github.com"])
    .build()
    .await?;

// Navigate to URL
let page = browser.execute(json!({
    "action": "navigate",
    "url": "https://github.com"
})).await?;

// Take screenshot
let screenshot = browser.execute(json!({
    "action": "screenshot",
    "full_page": true
})).await?;

// Click element
browser.execute(json!({
    "action": "click",
    "selector": "button.submit"
})).await?;

// Type text
browser.execute(json!({
    "action": "type",
    "selector": "input[name='search']",
    "text": "Rust programming"
})).await?;
```

### With Event Handlers

```rust
let browser = BrowserTool::builder()
    .on_navigate(|url| async move {
        println!("Navigating to: {}", url);
        true  // Allow navigation
    })
    .on_dialog(|dialog| async move {
        println!("Dialog: {}", dialog.message);
        dialog.dismiss()
    })
    .build()
    .await?;
```

## Tool Schema

### Navigate Action

```json
{
  "action": "navigate",
  "url": "https://example.com",
  "wait_until": "networkidle"
}
```

### Click Action

```json
{
  "action": "click",
  "selector": "button.submit",
  "button": "left",
  "click_count": 1
}
```

### Type Action

```json
{
  "action": "type",
  "selector": "input[name='email']",
  "text": "test@example.com",
  "delay": 50
}
```

### Screenshot Action

```json
{
  "action": "screenshot",
  "full_page": false,
  "selector": "#main-content",
  "format": "png",
  "quality": 90
}
```

### Execute JavaScript

```json
{
  "action": "evaluate",
  "script": "document.title"
}
```

### Wait Action

```json
{
  "action": "wait",
  "selector": ".loaded",
  "timeout": 5000
}
```

## Safety Considerations

### Domain Restrictions

Always configure allowed domains:

```toml
[agent.tools.browser]
allowed_domains = ["example.com", "*.example.com"]
blocked_domains = ["localhost", "127.*", "*.local"]
```

### Disable Dangerous Features

```toml
[agent.tools.browser]
allow_downloads = false
allow_popups = false
allow_geolocation = false
allow_camera = false
allow_microphone = false
allow_notifications = false
```

### Script Restrictions

```toml
[agent.tools.browser]
# Limit JavaScript execution
max_script_timeout = 5000
block_eval = true  # Block eval() calls
```

### Resource Limits

```toml
[agent.tools.browser]
max_pages = 3
max_memory = "512MB"
timeout = 30
```

## Error Handling

### Navigation Errors

```
Action: navigate
URL: https://nonexistent.example.com
Error: Navigation failed: DNS resolution failed
```

### Selector Errors

```
Action: click
Selector: #nonexistent-button
Error: Element not found: #nonexistent-button
```

### Timeout Errors

```
Action: wait
Selector: .dynamic-content
Error: Timeout waiting for selector after 30s
```

### Domain Blocked

```
Action: navigate
URL: https://blocked-site.com
Error: Domain not in allowed list
```

## Debugging

### Verbose Logging

```bash
RUST_LOG=ember_tools::browser=debug ember chat --agent --tools browser "Navigate"
```

### Headful Mode

For debugging, run with visible browser:

```toml
[agent.tools.browser]
headless = false  # Shows browser window
devtools = true   # Opens DevTools
slowmo = 100      # Slow down actions (ms)
```

### Screenshot on Error

```toml
[agent.tools.browser]
screenshot_on_error = true
error_screenshot_path = "./debug-screenshots/"
```

## Best Practices

1. **Use domain allowlists** - Only allow necessary domains
2. **Disable downloads** - Prevent file downloads
3. **Set timeouts** - Prevent hanging operations
4. **Use headless mode** - Better performance in production
5. **Handle errors** - Graceful degradation
6. **Clean up** - Close browser when done

## Integration with Other Tools

### With Filesystem

```bash
# Screenshot and save
ember chat --agent --tools browser,filesystem "Screenshot the page and save it"
```

### With Web Tool

```bash
# Browser for complex JS, web for simple requests
ember chat --agent --tools browser,web "Get data from this single-page app"
```

## Common Issues

### Page Not Loading

```toml
[agent.tools.browser]
# Increase timeout
timeout = 60
# Wait for specific state
wait_until = "networkidle"
```

### Element Not Found

```rust
// Wait for element to appear
browser.execute(json!({
    "action": "wait",
    "selector": ".dynamic-element",
    "timeout": 10000
})).await?;
```

### Memory Issues

```toml
[agent.tools.browser]
# Limit resources
max_pages = 1
disable_images = true
block_third_party = true
```

### Blocking Detection

```toml
[agent.tools.browser]
# Reduce detection
stealth_mode = true
random_user_agent = true
```

## Related Documentation

- [Tools Overview](./overview.md)
- [Web Tool](./web.md)
- [Agent Mode](../guide/agent-mode.md)
- [Configuration](../getting-started/configuration.md)