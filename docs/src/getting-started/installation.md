# Installation

There are several ways to install Ember, depending on your needs.

## Quick Install (Recommended)

The easiest way to install Ember is using our installation script:

### Linux / macOS

```bash
curl -fsSL https://ember.dev/install.sh | sh
```

### Windows (PowerShell)

```powershell
irm https://ember.dev/install.ps1 | iex
```

## Package Managers

### Homebrew (macOS/Linux)

```bash
brew install ember-agent
```

### Cargo (Rust)

If you have Rust installed:

```bash
cargo install ember-cli
```

## Docker

Run Ember in a container:

```bash
# Pull the image
docker pull emberai/ember:latest

# Run a chat
docker run -it --rm emberai/ember chat "Hello!"
```

Or use Docker Compose for a complete setup with Ollama:

```bash
# Clone the repository
git clone https://github.com/ember-ai/ember
cd ember

# Start Ember with Ollama
docker compose up -d

# Chat
docker compose exec ember ember chat "Hello!"
```

## Build from Source

Requirements:
- Rust 1.75 or later
- Git

```bash
# Clone the repository
git clone https://github.com/ember-ai/ember
cd ember

# Build in release mode
cargo build --release

# Install globally
cargo install --path crates/ember-cli

# Verify installation
ember --version
```

## Verify Installation

After installation, verify Ember is working:

```bash
# Check version
ember --version

# Get help
ember --help

# Quick test (requires Ollama or OpenAI)
ember chat "Hello, world!"
```

## Next Steps

- [Quick Start](./quickstart.md) - Get started in 30 seconds
- [Configuration](./configuration.md) - Customize Ember
- [First Chat](./first-chat.md) - Your first conversation