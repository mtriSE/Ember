# Tools Overview

Ember's tool system enables agents to interact with the outside world - executing commands, reading files, browsing the web, and more.

## What Are Tools?

Tools are capabilities that Ember agents can use to accomplish tasks. When agent mode is enabled, the AI can:

1. **Analyze** the task requirements
2. **Select** appropriate tools
3. **Execute** tool calls with parameters
4. **Process** results and continue

## Built-in Tools

Ember comes with several built-in tools:

| Tool | Description | Use Case |
|------|-------------|----------|
| [Shell](./shell.md) | Execute shell commands | System operations, builds |
| [Filesystem](./filesystem.md) | Read/write files | Code editing, file management |
| [Web](./web.md) | HTTP requests | API calls, web scraping |
| [Browser](./browser.md) | Browser automation | Screenshots, form filling |
| Git | Git operations | Version control |
| Code | Code execution | Running scripts |

## Enabling Tools

### Via CLI

```bash
# Enable all default tools
ember chat --agent

# Enable specific tools
ember chat --agent --tools shell,filesystem

# Enable all tools
ember chat --agent --tools all
```

### Via Configuration

```toml
[agent]
enabled = true

[agent.tools]
enabled = ["shell", "filesystem", "web"]
```

## Tool Architecture

```
┌─────────────────────────────────────────────────┐
│                   Agent                          │
│  ┌─────────────────────────────────────────┐   │
│  │           Tool Executor                  │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │   │
│  │  │Shell│ │ FS  │ │ Web │ │ ... │       │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘       │   │
│  └─────────────────────────────────────────┘   │
│                     │                           │
│                     ▼                           │
│  ┌─────────────────────────────────────────┐   │
│  │          Approval System                │   │
│  │   (Requires user approval if enabled)   │   │
│  └─────────────────────────────────────────┘   │
│                     │                           │
│                     ▼                           │
│  ┌─────────────────────────────────────────┐   │
│  │            Sandbox                       │   │
│  │   (Filesystem, network restrictions)     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## How Tool Calls Work

1. **LLM Request**: Agent asks LLM with available tools
2. **Tool Selection**: LLM chooses tool and parameters
3. **Validation**: Parameters are validated
4. **Approval**: User approval requested (if enabled)
5. **Execution**: Tool runs in sandbox
6. **Result**: Output returned to LLM
7. **Continue**: LLM processes result, may call more tools

### Example Flow

```
User: "What files are in the current directory?"

Agent thinking: I need to list files, I'll use the shell tool.

Tool call: shell.execute("ls -la")

Tool result:
total 48
drwxr-xr-x  10 user  staff   320 Mar 15 10:30 .
drwxr-xr-x   5 user  staff   160 Mar 15 10:00 ..
-rw-r--r--   1 user  staff  1234 Mar 15 10:30 Cargo.toml
-rw-r--r--   1 user  staff   567 Mar 15 10:25 README.md
drwxr-xr-x   3 user  staff    96 Mar 15 10:20 src

Agent response: The current directory contains:
- Cargo.toml (1234 bytes)
- README.md (567 bytes)
- src/ directory
```

## Safety Features

### Approval System

Require explicit approval for tool execution:

```toml
[agent.tools]
require_approval = true
```

With approval enabled:
```
Tool: shell.execute("rm old_file.txt")
Allow this action? [y/n/always/never]: 
```

### Sandboxing

Restrict tool capabilities:

```toml
[agent.tools]
# Filesystem restrictions
filesystem_root = "./workspace"
filesystem_allowed_paths = ["./src", "./tests"]
filesystem_denied_paths = ["./secrets", "./.env"]

# Shell restrictions  
shell_timeout = 30
shell_blocked_commands = ["rm -rf", "sudo", "chmod"]

# Network restrictions
web_allowed_domains = ["api.github.com"]
web_blocked_domains = ["*.internal.com"]
```

### Rate Limiting

Prevent runaway execution:

```toml
[agent.tools]
max_calls_per_minute = 30
max_total_calls = 100
```

## Tool Parameters

Tools receive parameters in JSON format:

```json
{
  "command": "ls -la",
  "working_directory": "./src"
}
```

Each tool defines its parameter schema:

```rust
fn parameters(&self) -> serde_json::Value {
    json!({
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "Shell command to execute"
            },
            "working_directory": {
                "type": "string",
                "description": "Working directory for command"
            }
        },
        "required": ["command"]
    })
}
```

## Creating Custom Tools

See [Custom Tools](../custom-tools.md) for detailed guide.

Quick example:

```rust
use ember_tools::{Tool, ToolResult};
use async_trait::async_trait;

struct WeatherTool;

#[async_trait]
impl Tool for WeatherTool {
    fn name(&self) -> &str { "weather" }
    
    fn description(&self) -> &str {
        "Get current weather for a location"
    }
    
    fn parameters(&self) -> serde_json::Value {
        json!({
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name"
                }
            },
            "required": ["location"]
        })
    }
    
    async fn execute(&self, args: serde_json::Value) -> ToolResult {
        let location = args["location"].as_str().unwrap();
        // Fetch weather...
        Ok(format!("Weather in {}: Sunny, 22°C", location))
    }
}
```

## Tool Best Practices

1. **Minimal Tools** - Only enable what you need
2. **Sandboxing** - Always restrict filesystem and network
3. **Approval** - Enable for sensitive operations
4. **Timeouts** - Set reasonable timeouts
5. **Logging** - Review tool execution logs
6. **Testing** - Test tools in isolation first

## Debugging Tools

### Verbose Output

```bash
ember chat --agent --tools shell -v "List files"
```

### Tool Logs

```toml
[logging]
level = "debug"
# Shows all tool calls and results
```

### Dry Run

Test without execution:

```toml
[agent.tools]
dry_run = true  # Shows what would be executed
```

## Related Documentation

- [Shell Tool](./shell.md)
- [Filesystem Tool](./filesystem.md)
- [Web Tool](./web.md)
- [Browser Tool](./browser.md)
- [Custom Tools](../custom-tools.md)
- [Agent Mode](../guide/agent-mode.md)