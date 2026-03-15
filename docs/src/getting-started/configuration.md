# Configuration

Ember offers flexible configuration through environment variables, configuration files, and command-line arguments.

## Configuration Hierarchy

Configuration is loaded in the following order (later sources override earlier ones):

1. **Built-in defaults**
2. **System config** (`/etc/ember/config.toml`)
3. **User config** (`~/.config/ember/config.toml`)
4. **Project config** (`.ember/config.toml` in current directory)
5. **Environment variables**
6. **Command-line arguments**

## Configuration File

### Location

The default user configuration file is located at:

- **Linux/macOS**: `~/.config/ember/config.toml`
- **Windows**: `%APPDATA%\ember\config.toml`

### Generating Default Config

```bash
# Create config with defaults
ember config init

# Show config file location
ember config path
```

### Full Configuration Example

```toml
# ~/.config/ember/config.toml

# Default settings
[default]
provider = "openai"
model = "gpt-4"
temperature = 0.7
max_tokens = 4096
stream = true

# OpenAI Configuration
[providers.openai]
api_key = "${OPENAI_API_KEY}"
base_url = "https://api.openai.com/v1"  # Optional
organization = ""  # Optional
timeout_seconds = 60

[providers.openai.models]
default = "gpt-4"
fast = "gpt-3.5-turbo"
vision = "gpt-4-vision-preview"

# Anthropic Configuration
[providers.anthropic]
api_key = "${ANTHROPIC_API_KEY}"
base_url = "https://api.anthropic.com"
timeout_seconds = 120

[providers.anthropic.models]
default = "claude-3-opus-20240229"
fast = "claude-3-haiku-20240307"
balanced = "claude-3-sonnet-20240229"

# Ollama Configuration (Local)
[providers.ollama]
base_url = "http://localhost:11434"
timeout_seconds = 300  # Longer for local inference

[providers.ollama.models]
default = "llama3"
code = "codellama"
small = "llama3:8b"

# Groq Configuration
[providers.groq]
api_key = "${GROQ_API_KEY}"
timeout_seconds = 30  # Groq is fast

# Google Gemini Configuration
[providers.gemini]
api_key = "${GOOGLE_API_KEY}"
timeout_seconds = 60

# DeepSeek Configuration
[providers.deepseek]
api_key = "${DEEPSEEK_API_KEY}"
base_url = "https://api.deepseek.com"

# Mistral Configuration
[providers.mistral]
api_key = "${MISTRAL_API_KEY}"

# OpenRouter Configuration
[providers.openrouter]
api_key = "${OPENROUTER_API_KEY}"
site_url = "https://yourapp.com"  # Optional
site_name = "Your App"  # Optional

# xAI Configuration
[providers.xai]
api_key = "${XAI_API_KEY}"

# Agent Configuration
[agent]
enabled = false  # Enable by default with --agent flag
max_iterations = 10
planning_enabled = true
thinking_enabled = true

[agent.tools]
enabled = ["shell", "filesystem", "web"]
shell_timeout = 30
filesystem_root = "."  # Restrict to current directory
require_approval = true  # Ask before executing tools

# Memory Configuration
[memory]
enabled = true
backend = "sqlite"  # sqlite, memory, or vector
path = "~/.local/share/ember/memory.db"
max_history = 1000

# RAG Configuration
[rag]
enabled = false
chunk_size = 512
chunk_overlap = 50
embedding_model = "text-embedding-3-small"

# Cost Tracking
[costs]
enabled = true
budget_limit = 10.0  # Daily limit in USD
warn_threshold = 0.8  # Warn at 80% of budget

# Logging
[logging]
level = "info"  # trace, debug, info, warn, error
file = "~/.local/share/ember/ember.log"
format = "pretty"  # pretty, json, compact

# Web Interface
[web]
enabled = false
host = "127.0.0.1"
port = 3000
cors_origins = ["http://localhost:*"]

# TUI Configuration
[tui]
theme = "dark"  # dark, light, auto
vim_mode = false
show_tokens = true
show_cost = true
```

## Environment Variables

All configuration can be overridden with environment variables:

### API Keys

```bash
# Provider API Keys
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GROQ_API_KEY="gsk_..."
export GOOGLE_API_KEY="..."
export DEEPSEEK_API_KEY="..."
export MISTRAL_API_KEY="..."
export OPENROUTER_API_KEY="sk-or-v1-..."
export XAI_API_KEY="xai-..."
```

### General Settings

```bash
# Default provider and model
export EMBER_PROVIDER="openai"
export EMBER_MODEL="gpt-4"

# Behavior
export EMBER_TEMPERATURE="0.7"
export EMBER_MAX_TOKENS="4096"
export EMBER_STREAM="true"

# Logging
export EMBER_LOG_LEVEL="info"
export RUST_LOG="ember=debug"
```

### Provider-Specific Settings

```bash
# Custom endpoints
export OPENAI_BASE_URL="https://api.openai.com/v1"
export OLLAMA_BASE_URL="http://localhost:11434"

# Timeouts
export EMBER_TIMEOUT="60"
```

## Command-Line Arguments

Override any setting via CLI:

```bash
# Provider and model
ember chat --provider openai --model gpt-4

# Temperature and tokens
ember chat --temperature 0.9 --max-tokens 2000

# Enable features
ember chat --agent --stream --thinking

# Specify tools
ember chat --agent --tools shell,filesystem,web

# Custom config file
ember chat --config ./my-config.toml
```

## Configuration Commands

### View Current Configuration

```bash
# Show all settings
ember config list

# Show specific setting
ember config get default.provider

# Show providers
ember config list-providers
```

### Modify Configuration

```bash
# Set values
ember config set default.provider openai
ember config set default.model gpt-4
ember config set costs.budget_limit 5.0

# Unset values
ember config unset providers.openai.organization
```

### Provider Management

```bash
# List available providers
ember config list-providers

# Test provider connection
ember config test-provider openai

# List models for provider
ember config list-models --provider openai
```

## Project-Level Configuration

Create `.ember/config.toml` in your project for project-specific settings:

```bash
mkdir -p .ember
cat > .ember/config.toml << 'EOF'
[default]
provider = "anthropic"
model = "claude-3-opus-20240229"

[agent]
enabled = true
tools = ["shell", "filesystem"]

[agent.tools]
filesystem_root = "./src"  # Restrict to src directory
EOF
```

## Profiles

Define multiple profiles for different use cases:

```toml
# ~/.config/ember/config.toml

[profiles.coding]
provider = "anthropic"
model = "claude-3-opus-20240229"
temperature = 0.3
agent.tools = ["shell", "filesystem"]

[profiles.creative]
provider = "openai"
model = "gpt-4"
temperature = 0.9

[profiles.fast]
provider = "groq"
model = "mixtral-8x7b-32768"
temperature = 0.5

[profiles.local]
provider = "ollama"
model = "llama3"
```

Use profiles:

```bash
ember chat --profile coding
ember chat --profile creative
ember chat --profile fast
```

## Security Best Practices

### Never Commit API Keys

Add to `.gitignore`:

```gitignore
# Ember config with secrets
.ember/config.toml

# Environment files
.env
.env.local
```

### Use Environment Variables

```bash
# Use env vars instead of hardcoding
[providers.openai]
api_key = "${OPENAI_API_KEY}"  # References environment variable
```

### Restrict Tool Permissions

```toml
[agent.tools]
require_approval = true  # Always ask before executing
filesystem_root = "./sandbox"  # Restrict file access
shell_allowed_commands = ["ls", "cat", "grep"]  # Whitelist commands
```

## Troubleshooting

### Config Not Loading

```bash
# Check config path
ember config path

# Validate config syntax
ember config validate

# Debug config loading
RUST_LOG=ember::config=debug ember chat
```

### Environment Variables Not Working

```bash
# Check if variable is set
echo $OPENAI_API_KEY

# Check if Ember sees it
ember config get providers.openai.api_key
```

## Next Steps

- [First Chat](./first-chat.md) - Start using Ember
- [CLI Commands](../guide/cli.md) - Full CLI reference
- [Provider Setup](../providers/index.md) - Configure all providers