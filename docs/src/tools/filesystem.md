# Filesystem Tool

The Filesystem tool enables Ember agents to read and write files on the local filesystem.

## Overview

The Filesystem tool provides:
- File reading with encoding support
- File writing and creation
- Directory listing and traversal
- File metadata access
- Path-based restrictions

## Enabling the Filesystem Tool

```bash
ember chat --agent --tools filesystem "Read the contents of README.md"
```

## Capabilities

### Read Files

```bash
ember chat --agent --tools filesystem "What's in Cargo.toml?"
```

Supports:
- Text files (UTF-8, UTF-16, etc.)
- Binary files (as base64)
- Large files with streaming
- Line range reading

### Write Files

```bash
ember chat --agent --tools filesystem "Create a new file called hello.txt with 'Hello World'"
```

Supports:
- Creating new files
- Overwriting existing files
- Appending to files
- Creating parent directories

### List Directories

```bash
ember chat --agent --tools filesystem "What files are in the src directory?"
```

Returns:
- File names
- File sizes
- Modification times
- File types

### File Metadata

```bash
ember chat --agent --tools filesystem "How big is the target folder?"
```

Provides:
- Size
- Creation/modification times
- Permissions
- Type (file/directory/symlink)

## Configuration

### Basic Configuration

```toml
[agent.tools.filesystem]
enabled = true
root = "."  # Restrict to current directory
```

### Security Configuration

```toml
[agent.tools.filesystem]
# Root directory (all paths relative to this)
root = "./workspace"

# Path restrictions
allowed_paths = ["./src", "./tests", "./docs"]
denied_paths = ["./secrets", "./.env", "./.git"]

# File type restrictions
allowed_extensions = [".rs", ".md", ".toml", ".json", ".txt"]
denied_extensions = [".exe", ".sh", ".bat"]

# Size limits
max_file_size = "10MB"
max_read_size = "1MB"

# Permissions
allow_write = true
allow_delete = false
allow_create_directory = true
```

### Full Example

```toml
[agent.tools.filesystem]
enabled = true
root = "./project"

# Allowed operations
allow_read = true
allow_write = true
allow_delete = false
allow_list = true

# Path security
allowed_paths = [
    "./src",
    "./tests", 
    "./docs",
    "./examples"
]

denied_paths = [
    "./.git",
    "./.env*",
    "./secrets",
    "./credentials"
]

# File type restrictions
allowed_extensions = [
    ".rs", ".toml", ".md", ".txt",
    ".json", ".yaml", ".yml"
]

# Size limits
max_file_size = "10MB"
max_directory_depth = 10
```

## Usage Examples

### Code Editing

```bash
# Read and modify code
ember chat --agent --tools filesystem "Add error handling to src/main.rs"

# Create new files
ember chat --agent --tools filesystem "Create a new module in src/utils.rs"

# Read multiple files
ember chat --agent --tools filesystem "Show me all the test files"
```

### Documentation

```bash
# Update README
ember chat --agent --tools filesystem "Update the installation instructions in README.md"

# Generate docs
ember chat --agent --tools filesystem "Create API documentation from the source code"
```

### Project Management

```bash
# Explore structure
ember chat --agent --tools filesystem "What's the project structure?"

# Find files
ember chat --agent --tools filesystem "Find all Rust files with 'TODO' comments"

# Analyze codebase
ember chat --agent --tools filesystem "How many lines of code are in this project?"
```

## Programmatic Usage

### Rust API

```rust
use ember_tools::FilesystemTool;

// Create with root directory
let fs = FilesystemTool::new("./workspace");

// Create with configuration
let fs = FilesystemTool::builder()
    .root("./workspace")
    .allow_write(true)
    .allow_delete(false)
    .allowed_extensions(vec![".rs", ".md", ".toml"])
    .build()?;

// Read file
let content = fs.execute(json!({
    "action": "read",
    "path": "src/main.rs"
})).await?;

// Write file
let result = fs.execute(json!({
    "action": "write",
    "path": "output.txt",
    "content": "Hello, World!"
})).await?;

// List directory
let files = fs.execute(json!({
    "action": "list",
    "path": "src"
})).await?;
```

### With Approval Callback

```rust
let fs = FilesystemTool::builder()
    .root("./workspace")
    .on_write(|path, content| async move {
        println!("Writing {} bytes to {}", content.len(), path);
        // Return true to allow, false to deny
        true
    })
    .build()?;
```

## Tool Schema

### Read Action

```json
{
  "action": "read",
  "path": "src/main.rs",
  "encoding": "utf-8",
  "start_line": 1,
  "end_line": 100
}
```

### Write Action

```json
{
  "action": "write",
  "path": "output.txt",
  "content": "File contents here",
  "create_dirs": true,
  "append": false
}
```

### List Action

```json
{
  "action": "list",
  "path": "src",
  "recursive": false,
  "include_hidden": false
}
```

### Metadata Action

```json
{
  "action": "metadata",
  "path": "Cargo.toml"
}
```

### Delete Action

```json
{
  "action": "delete",
  "path": "temp.txt"
}
```

## Safety Considerations

### Path Traversal Prevention

The tool prevents path traversal attacks:

```
# These are blocked:
../../../etc/passwd
/etc/passwd
./workspace/../secrets/key.pem
```

### Restricted Paths

Always configure denied paths:

```toml
[agent.tools.filesystem]
denied_paths = [
    "./.env",
    "./.env.*",
    "./secrets/**",
    "./**/*.key",
    "./**/*.pem"
]
```

### File Type Restrictions

Limit allowed extensions:

```toml
[agent.tools.filesystem]
allowed_extensions = [".rs", ".md", ".toml"]
# Blocks .exe, .sh, .bat, etc.
```

### Size Limits

Prevent reading huge files:

```toml
[agent.tools.filesystem]
max_read_size = "1MB"
max_file_size = "10MB"
```

## Error Handling

### File Not Found

```
Action: read
Path: nonexistent.txt
Error: File not found: nonexistent.txt
```

### Permission Denied

```
Action: write
Path: /etc/passwd
Error: Path outside allowed root directory
```

### Size Exceeded

```
Action: read
Path: huge_file.bin
Error: File size (500MB) exceeds limit (10MB)
```

### Extension Blocked

```
Action: write
Path: script.sh
Error: Extension '.sh' is not allowed
```

## Debugging

### Verbose Logging

```bash
RUST_LOG=ember_tools::filesystem=debug ember chat --agent --tools filesystem "List files"
```

### Dry Run Mode

```toml
[agent.tools.filesystem]
dry_run = true  # Operations logged but not executed
```

## Best Practices

1. **Set a root directory** - Never allow access to entire filesystem
2. **Use allowlists** - Explicitly list allowed paths
3. **Restrict extensions** - Only allow needed file types
4. **Disable delete** - Unless specifically needed
5. **Monitor writes** - Log all write operations
6. **Size limits** - Prevent resource exhaustion

## Integration with Other Tools

### With Shell Tool

```bash
# Read file, process with shell
ember chat --agent --tools shell,filesystem "Read config.json and validate it with jq"
```

### With Web Tool

```bash
# Download and save
ember chat --agent --tools web,filesystem "Download the Rust logo and save it as logo.png"
```

## Common Issues

### Encoding Errors

```toml
[agent.tools.filesystem]
# Specify default encoding
default_encoding = "utf-8"
# Or detect automatically
detect_encoding = true
```

### Large Files

```toml
[agent.tools.filesystem]
# Enable streaming for large files
streaming = true
chunk_size = "64KB"
```

### Symlinks

```toml
[agent.tools.filesystem]
# Follow or deny symlinks
follow_symlinks = false  # Safer
# or
follow_symlinks = true
max_symlink_depth = 3
```

## Related Documentation

- [Tools Overview](./overview.md)
- [Shell Tool](./shell.md)
- [Agent Mode](../guide/agent-mode.md)
- [Configuration](../getting-started/configuration.md)