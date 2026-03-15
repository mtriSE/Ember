# CLI Commands

Complete reference for all Ember command-line interface commands.

## Overview

Ember provides a powerful CLI for interacting with AI models, managing configuration, and running agents.

```bash
ember [COMMAND] [OPTIONS]
```

## Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `-h, --help` | Print help information |
| `-V, --version` | Print version information |
| `-v, --verbose` | Enable verbose output |
| `-q, --quiet` | Suppress non-essential output |
| `--config <FILE>` | Use custom config file |
| `--profile <NAME>` | Use configuration profile |

## Commands

### chat

Start a chat session with an AI model.

```bash
ember chat [OPTIONS] [PROMPT]
```

**Arguments:**
- `[PROMPT]` - Optional initial prompt (if omitted, starts interactive mode)

**Options:**

| Option | Description |
|--------|-------------|
| `-p, --provider <NAME>` | LLM provider (openai, anthropic, ollama, etc.) |
| `-m, --model <NAME>` | Model to use |
| `-t, --temperature <FLOAT>` | Sampling temperature (0.0-2.0) |
| `--max-tokens <INT>` | Maximum tokens in response |
| `-s, --stream` | Enable streaming output |
| `--no-stream` | Disable streaming |
| `--system <TEXT>` | System prompt |
| `-a, --agent` | Enable agent mode with tools |
| `--tools <LIST>` | Comma-separated list of tools |
| `--thinking` | Show thinking process |
| `--plan` | Enable Plan/Act mode |

**Examples:**

```bash
# Simple question
ember chat "What is Rust?"

# Interactive mode
ember chat

# With specific provider and model
ember chat -p anthropic -m claude-3-opus-20240229 "Explain monads"

# Agent mode with tools
ember chat --agent --tools shell,filesystem "Create a hello world Rust project"

# With streaming and thinking visible
ember chat --stream --thinking "Solve this step by step: 15% of 240"
```

### config

Manage Ember configuration.

```bash
ember config <SUBCOMMAND>
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `init` | Create default configuration file |
| `list` | Show all configuration values |
| `get <KEY>` | Get a specific config value |
| `set <KEY> <VALUE>` | Set a config value |
| `unset <KEY>` | Remove a config value |
| `path` | Show config file location |
| `validate` | Validate configuration syntax |
| `list-providers` | List available providers |
| `list-models` | List available models |
| `test-provider` | Test provider connection |

**Examples:**

```bash
# Initialize config
ember config init

# View all settings
ember config list

# Set default provider
ember config set default.provider openai

# Test provider
ember config test-provider openai

# List models for a provider
ember config list-models --provider anthropic
```

### serve

Start the web interface server.

```bash
ember serve [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-H, --host <ADDR>` | Host address (default: 127.0.0.1) |
| `-p, --port <PORT>` | Port number (default: 3000) |
| `--cors <ORIGINS>` | CORS allowed origins |
| `--no-open` | Don't open browser automatically |

**Examples:**

```bash
# Start with defaults
ember serve

# Custom host and port
ember serve --host 0.0.0.0 --port 8080

# Start without opening browser
ember serve --no-open
```

### tui

Launch the terminal user interface.

```bash
ember tui [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--theme <NAME>` | Color theme (dark, light, auto) |
| `--vim` | Enable vim keybindings |

**Examples:**

```bash
# Launch TUI
ember tui

# With vim mode
ember tui --vim
```

### run

Execute a predefined workflow or script.

```bash
ember run <SCRIPT> [ARGS]
```

**Examples:**

```bash
# Run a workflow file
ember run ./workflow.yml

# Run with arguments
ember run ./script.yml --input data.json
```

### memory

Manage conversation memory and history.

```bash
ember memory <SUBCOMMAND>
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `list` | List saved conversations |
| `show <ID>` | Display a conversation |
| `delete <ID>` | Delete a conversation |
| `clear` | Clear all memory |
| `export <FILE>` | Export memory to file |
| `import <FILE>` | Import memory from file |

**Examples:**

```bash
# List conversations
ember memory list

# Export all memory
ember memory export backup.json

# Clear all memory
ember memory clear --confirm
```

### cost

Track and manage API costs.

```bash
ember cost <SUBCOMMAND>
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `show` | Show current costs |
| `history` | Show cost history |
| `budget` | Manage budget limits |
| `reset` | Reset cost tracking |

**Examples:**

```bash
# Show today's costs
ember cost show

# Show cost history
ember cost history --days 30

# Set daily budget
ember cost budget set 10.00
```

### plugin

Manage WASM plugins.

```bash
ember plugin <SUBCOMMAND>
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `list` | List installed plugins |
| `install <URL>` | Install a plugin |
| `remove <NAME>` | Remove a plugin |
| `update` | Update all plugins |

**Examples:**

```bash
# List plugins
ember plugin list

# Install from marketplace
ember plugin install github:user/plugin

# Remove plugin
ember plugin remove my-plugin
```

## Environment Variables

Ember respects these environment variables:

| Variable | Description |
|----------|-------------|
| `EMBER_CONFIG` | Custom config file path |
| `EMBER_PROVIDER` | Default provider |
| `EMBER_MODEL` | Default model |
| `EMBER_LOG_LEVEL` | Logging level |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GROQ_API_KEY` | Groq API key |
| `GOOGLE_API_KEY` | Google/Gemini API key |

## Shell Completion

Generate shell completion scripts:

```bash
# Bash
ember completions bash > ~/.local/share/bash-completion/completions/ember

# Zsh
ember completions zsh > ~/.zfunc/_ember

# Fish
ember completions fish > ~/.config/fish/completions/ember.fish

# PowerShell
ember completions powershell > ember.ps1
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 3 | Provider error |
| 4 | Network error |
| 5 | Authentication error |

## Related Documentation

- [Interactive Mode](./interactive.md)
- [Agent Mode](./agent-mode.md)
- [Terminal UI](./tui.md)
- [Configuration](../getting-started/configuration.md)