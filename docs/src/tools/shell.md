# Shell Tool

The Shell tool enables Ember agents to execute shell commands on the system.

## Overview

The Shell tool provides:
- Command execution with stdout/stderr capture
- Timeout protection
- Working directory support
- Environment variable control
- Command allowlist/blocklist

## Enabling the Shell Tool

```bash
ember chat --agent --tools shell "What's my current directory?"
```

## Capabilities

### Execute Commands

```bash
ember chat --agent --tools shell "Run 'cargo build' and show the output"
```

The agent can run any shell command and capture:
- Standard output (stdout)
- Standard error (stderr)
- Exit code

### Working Directory

Commands can run in specific directories:

```bash
ember chat --agent --tools shell "Run tests in the src folder"
```

### Environment Variables

Custom environment can be passed:

```rust
let tool = ShellTool::builder()
    .env("RUST_BACKTRACE", "1")
    .env("CARGO_TERM_COLOR", "always")
    .build();
```

## Configuration

### Basic Configuration

```toml
[agent.tools.shell]
enabled = true
timeout = 30  # seconds
```

### Security Configuration

```toml
[agent.tools.shell]
# Working directory restrictions
working_directory = "."  # Default directory
allowed_directories = ["./", "./src", "./tests"]

# Command restrictions
allowed_commands = ["ls", "cat", "grep", "find", "cargo", "npm", "git"]
blocked_commands = ["rm -rf", "sudo", "chmod 777", "curl | bash"]
blocked_patterns = ["rm -rf /", ":(){ :|:& };:"]

# Resource limits
timeout = 30
max_output_size = "1MB"
```

### Full Example

```toml
[agent.tools.shell]
enabled = true
timeout = 60
working_directory = "./workspace"

# Allowlist approach (recommended)
allowed_commands = [
    "ls", "cat", "head", "tail", "grep", "find", "wc",
    "cargo", "rustc", "rustfmt",
    "npm", "node", "npx",
    "git", "gh"
]

# Or blocklist approach
blocked_commands = [
    "rm -rf /",
    "sudo",
    "su",
    "passwd",
    "chmod 777",
    "mkfs",
    "dd",
    "curl | bash",
    "wget | bash"
]

# Block patterns (regex)
blocked_patterns = [
    "rm\\s+-rf\\s+/",
    ":(\\)\\{.*\\|.*&.*\\};:",
    ">\\s*/dev/sd"
]
```

## Usage Examples

### Development Tasks

```bash
# Build a project
ember chat --agent --tools shell "Build this Rust project in release mode"

# Run tests
ember chat --agent --tools shell "Run all tests and show failures"

# Format code
ember chat --agent --tools shell "Format all Rust files in src/"
```

### System Information

```bash
# Disk usage
ember chat --agent --tools shell "How much disk space is available?"

# Process information
ember chat --agent --tools shell "What's using the most CPU?"

# Network information
ember chat --agent --tools shell "What ports are open?"
```

### File Operations

```bash
# Find files
ember chat --agent --tools shell "Find all TODO comments in the codebase"

# Search content
ember chat --agent --tools shell "Search for uses of 'deprecated' in src/"

# Count lines
ember chat --agent --tools shell "How many lines of Rust code are in this project?"
```

## Programmatic Usage

### Rust API

```rust
use ember_tools::ShellTool;

// Create with defaults
let shell = ShellTool::new();

// Create with configuration
let shell = ShellTool::builder()
    .timeout(Duration::from_secs(60))
    .working_directory("./workspace")
    .allowed_commands(vec!["ls", "cat", "cargo"])
    .build()?;

// Execute command
let result = shell.execute(json!({
    "command": "cargo build --release"
})).await?;

println!("Output: {}", result);
```

### With Environment Variables

```rust
let shell = ShellTool::builder()
    .env("RUST_LOG", "debug")
    .env("CI", "true")
    .clear_env(false)  // Keep system environment
    .build()?;
```

### With Approval Callback

```rust
let shell = ShellTool::builder()
    .on_execute(|cmd| async move {
        println!("About to run: {}", cmd);
        // Return true to allow, false to deny
        true
    })
    .build()?;
```

## Tool Schema

The Shell tool accepts these parameters:

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "description": "The shell command to execute"
    },
    "working_directory": {
      "type": "string",
      "description": "Directory to run the command in"
    },
    "timeout": {
      "type": "integer",
      "description": "Timeout in seconds (overrides default)"
    }
  },
  "required": ["command"]
}
```

## Safety Considerations

### Principle of Least Privilege

Only enable commands the agent actually needs:

```toml
[agent.tools.shell]
# Better: explicit allowlist
allowed_commands = ["cargo", "git", "ls", "cat"]

# Instead of blocking dangerous commands
# blocked_commands = ["rm", "sudo", ...]
```

### Timeout Protection

Always set reasonable timeouts:

```toml
[agent.tools.shell]
timeout = 30  # 30 seconds max

# For long-running builds
timeout = 300  # 5 minutes
```

### Output Size Limits

Prevent memory issues from large outputs:

```toml
[agent.tools.shell]
max_output_size = "1MB"
truncate_output = true
```

### Directory Restrictions

Limit where commands can run:

```toml
[agent.tools.shell]
working_directory = "./workspace"
allowed_directories = ["./workspace", "./workspace/src"]
```

## Error Handling

### Non-Zero Exit Code

```
Command: cargo build
Exit Code: 101
Stderr: error[E0382]: borrow of moved value
```

The agent receives the error and can attempt to fix it.

### Timeout

```
Command: long-running-process
Error: Command timed out after 30 seconds
```

### Blocked Command

```
Command: sudo rm -rf /
Error: Command blocked by security policy
```

## Debugging

### Verbose Logging

```bash
RUST_LOG=ember_tools::shell=debug ember chat --agent --tools shell "Run tests"
```

### Dry Run Mode

```toml
[agent.tools.shell]
dry_run = true  # Commands are logged but not executed
```

## Best Practices

1. **Use allowlists** - Explicitly list allowed commands
2. **Set timeouts** - Prevent hanging processes
3. **Limit directories** - Restrict working directories
4. **Monitor logs** - Review executed commands
5. **Enable approval** - For sensitive environments
6. **Test first** - Verify tool behavior before production

## Common Issues

### Command Not Found

```bash
# Ensure the command is in PATH
which cargo

# Or use full path
/usr/local/bin/cargo build
```

### Permission Denied

```bash
# Check file permissions
ls -la script.sh

# Agent cannot use sudo by default
# This is by design for security
```

### Output Truncated

```toml
# Increase output size limit
[agent.tools.shell]
max_output_size = "10MB"
```

## Related Documentation

- [Tools Overview](./overview.md)
- [Filesystem Tool](./filesystem.md)
- [Agent Mode](../guide/agent-mode.md)
- [Configuration](../getting-started/configuration.md)