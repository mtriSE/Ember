# Agent Mode with Tools

Ember's agent mode enables the AI to use tools and take actions to accomplish complex tasks.

## Overview

Agent mode transforms Ember from a simple chat interface into a capable assistant that can:

- Execute shell commands
- Read and write files
- Browse the web
- Interact with APIs
- Plan and execute multi-step tasks

## Enabling Agent Mode

### Via CLI Flag

```bash
ember chat --agent "Create a new Rust project with a basic CLI"
```

### Via Configuration

```toml
# ~/.config/ember/config.toml
[agent]
enabled = true
```

### With Specific Tools

```bash
ember chat --agent --tools shell,filesystem,web "Set up a Node.js project"
```

## Available Tools

### Shell Tool

Execute shell commands on the system.

```bash
ember chat --agent --tools shell "What files are in the current directory?"
```

**Capabilities:**
- Run any shell command
- Capture stdout/stderr
- Handle exit codes
- Timeout protection

**Configuration:**

```toml
[agent.tools.shell]
timeout = 30  # seconds
allowed_commands = ["ls", "cat", "grep", "find"]  # optional whitelist
blocked_commands = ["rm -rf", "sudo"]  # optional blacklist
```

### Filesystem Tool

Read and write files on the filesystem.

```bash
ember chat --agent --tools filesystem "Read the contents of README.md"
```

**Capabilities:**
- Read file contents
- Write/create files
- List directories
- File metadata

**Configuration:**

```toml
[agent.tools.filesystem]
root = "."  # restrict to current directory
allowed_extensions = [".rs", ".md", ".toml"]  # optional
max_file_size = "10MB"
```

### Web Tool

Fetch web content and make HTTP requests.

```bash
ember chat --agent --tools web "What's on the Rust homepage?"
```

**Capabilities:**
- HTTP GET/POST requests
- HTML parsing
- JSON API calls
- Content extraction

### Browser Tool

Control a headless browser for complex web interactions.

```bash
ember chat --agent --tools browser "Take a screenshot of github.com"
```

**Capabilities:**
- Navigate pages
- Click elements
- Fill forms
- Take screenshots
- Execute JavaScript

### Git Tool

Interact with Git repositories.

```bash
ember chat --agent --tools git "What are the recent commits?"
```

**Capabilities:**
- Status and diff
- Commit changes
- Branch management
- Log history

### Code Execution Tool

Run code in sandboxed environments.

```bash
ember chat --agent --tools code "Run this Python: print(2+2)"
```

**Capabilities:**
- Python execution
- JavaScript/Node.js
- Multiple language support
- Sandboxed execution

## Tool Combinations

Combine multiple tools for complex tasks:

```bash
# Full development workflow
ember chat --agent --tools shell,filesystem,git "Create a Rust library with tests and commit it"

# Research and documentation
ember chat --agent --tools web,filesystem "Research Rust error handling and write a summary"

# Web automation
ember chat --agent --tools browser,filesystem "Screenshot these 5 websites and save them"
```

## Agent Behavior

### Planning

The agent plans before executing:

```bash
ember chat --agent --plan "Set up a complete web project"
```

With planning enabled, the agent will:
1. Analyze the task
2. Create a step-by-step plan
3. Show the plan for approval
4. Execute each step

### Thinking

Show the agent's reasoning process:

```bash
ember chat --agent --thinking "Debug this code issue"
```

### Iterations

Control how many steps the agent can take:

```toml
[agent]
max_iterations = 10  # default
```

## Safety and Approval

### Require Approval

Always ask before executing tools:

```toml
[agent.tools]
require_approval = true
```

With approval enabled:
```
Agent wants to execute: rm old_file.txt
Allow this action? [y/N]
```

### Sandboxing

Restrict agent capabilities:

```toml
[agent.tools]
# Filesystem restrictions
filesystem_root = "./workspace"
filesystem_readonly = false

# Shell restrictions
shell_timeout = 30
shell_blocked = ["sudo", "rm -rf /"]

# Network restrictions
web_allowed_domains = ["api.github.com", "docs.rs"]
```

## Programmatic Usage

### Rust API

```rust
use ember_core::{Agent, AgentConfig};
use ember_tools::{ShellTool, FilesystemTool};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AgentConfig::builder()
        .max_iterations(10)
        .require_approval(true)
        .build();
    
    let agent = Agent::builder()
        .provider(OpenAIProvider::new()?)
        .config(config)
        .tool(ShellTool::new())
        .tool(FilesystemTool::new("./workspace"))
        .build()?;
    
    let result = agent.run("Create a hello world program").await?;
    println!("Result: {}", result);
    
    Ok(())
}
```

### With Tool Approval Callback

```rust
let agent = Agent::builder()
    .provider(provider)
    .on_tool_request(|tool_call| async {
        println!("Tool: {} with args: {:?}", tool_call.name, tool_call.args);
        
        // Custom approval logic
        if tool_call.name == "shell" {
            print!("Allow? [y/N] ");
            // ... get user input
        }
        
        ApprovalResult::Approved
    })
    .build()?;
```

## Custom Tools

Create your own tools for specific use cases:

```rust
use ember_tools::{Tool, ToolResult};
use async_trait::async_trait;

struct DatabaseTool {
    connection: DatabaseConnection,
}

#[async_trait]
impl Tool for DatabaseTool {
    fn name(&self) -> &str {
        "database"
    }
    
    fn description(&self) -> &str {
        "Execute SQL queries against the database"
    }
    
    fn parameters(&self) -> serde_json::Value {
        json!({
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "SQL query to execute"
                }
            },
            "required": ["query"]
        })
    }
    
    async fn execute(&self, args: serde_json::Value) -> ToolResult {
        let query = args["query"].as_str().unwrap();
        let result = self.connection.execute(query).await?;
        Ok(result.to_string())
    }
}
```

Register the custom tool:

```rust
let agent = Agent::builder()
    .provider(provider)
    .tool(DatabaseTool::new(connection))
    .build()?;
```

## Best Practices

1. **Start with minimal tools** - Only enable tools you need
2. **Use sandboxing** - Restrict filesystem and network access
3. **Enable approval** - Review actions before execution
4. **Set timeouts** - Prevent runaway processes
5. **Monitor costs** - Agent mode uses more tokens
6. **Review logs** - Check what the agent did

## Troubleshooting

### Agent Not Using Tools

```bash
# Ensure tools are specified
ember chat --agent --tools shell "List files"

# Check tool availability
ember config list-tools
```

### Tool Execution Failed

```bash
# Enable verbose output
ember chat --agent --tools shell -v "Run command"

# Check tool configuration
ember config get agent.tools
```

### Agent Stuck in Loop

```toml
# Reduce max iterations
[agent]
max_iterations = 5

# Or use timeout
timeout_seconds = 300
```

## Related Documentation

- [CLI Commands](./cli.md)
- [Shell Tool](../tools/shell.md)
- [Filesystem Tool](../tools/filesystem.md)
- [Custom Tools](../custom-tools.md)
- [Plan/Act Mode](../advanced/plan-act.md)