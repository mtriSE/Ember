#!/bin/bash
# Ember Quick Start Script
# Run this script to get started with Ember in seconds!

set -e

echo "========================================"
echo "     Ember AI Agent Framework"
echo "  Small spark, big fire"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} Rust is not installed. Installing via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo -e "${GREEN}[OK]${NC} Rust installed successfully!"
else
    echo -e "${GREEN}[OK]${NC} Rust is already installed: $(rustc --version)"
fi

# Build the project
echo ""
echo -e "${BLUE}[STEP 1]${NC} Building Ember..."
cargo build --release -p ember-cli 2>&1 | tail -5

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK]${NC} Build successful!"
else
    echo -e "${RED}[ERROR]${NC} Build failed. Please check the error messages above."
    exit 1
fi

# Check for API keys
echo ""
echo -e "${BLUE}[STEP 2]${NC} Checking API configuration..."

if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$GROQ_API_KEY" ]; then
    echo -e "${YELLOW}[INFO]${NC} No API keys found. You can set one of these:"
    echo ""
    echo "  For OpenAI (GPT-4, GPT-3.5):"
    echo "    export OPENAI_API_KEY=your-key-here"
    echo ""
    echo "  For Anthropic (Claude):"
    echo "    export ANTHROPIC_API_KEY=your-key-here"
    echo ""
    echo "  For Groq (Llama, Mixtral - fast & free tier available):"
    echo "    export GROQ_API_KEY=your-key-here"
    echo ""
    echo "  For local models (Ollama - no API key needed):"
    echo "    Install Ollama from https://ollama.com"
    echo "    Then run: ollama pull llama3.2"
    echo ""
else
    if [ -n "$OPENAI_API_KEY" ]; then
        echo -e "${GREEN}[OK]${NC} OpenAI API key found"
    fi
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo -e "${GREEN}[OK]${NC} Anthropic API key found"
    fi
    if [ -n "$GROQ_API_KEY" ]; then
        echo -e "${GREEN}[OK]${NC} Groq API key found"
    fi
fi

# Create example config if not exists
if [ ! -f "$HOME/.ember/config.toml" ]; then
    echo ""
    echo -e "${BLUE}[STEP 3]${NC} Creating default configuration..."
    mkdir -p "$HOME/.ember"
    cat > "$HOME/.ember/config.toml" << 'EOF'
# Ember Configuration
# Edit this file to customize your Ember setup

[llm]
# Default provider: "openai", "anthropic", "groq", "ollama"
default_provider = "ollama"

# Default model (depends on provider)
# OpenAI: "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"
# Anthropic: "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"
# Groq: "llama-3.3-70b-versatile", "mixtral-8x7b-32768"
# Ollama: "llama3.2", "mistral", "codellama"
default_model = "llama3.2"

[tools]
# Enable shell command execution
shell_enabled = true
# Shell security level: "strict", "normal", "permissive"
shell_security = "normal"

# Enable filesystem access
filesystem_enabled = true
# Allowed directories (empty = current directory only)
allowed_directories = []

[agent]
# Maximum conversation history length
max_history = 50
# Enable streaming responses
streaming = true
EOF
    echo -e "${GREEN}[OK]${NC} Config created at ~/.ember/config.toml"
fi

# Print usage instructions
echo ""
echo "========================================"
echo -e "${GREEN}Ember is ready!${NC}"
echo "========================================"
echo ""
echo "Quick commands:"
echo ""
echo "  Start a chat session:"
echo "    ./target/release/ember-cli chat"
echo ""
echo "  Start with a specific model:"
echo "    ./target/release/ember-cli chat --model gpt-4"
echo ""
echo "  Start the web interface:"
echo "    ./target/release/ember-cli serve"
echo "    Then open http://localhost:3000"
echo ""
echo "  Run tests:"
echo "    cargo test --workspace"
echo ""
echo "  View help:"
echo "    ./target/release/ember-cli --help"
echo ""
echo "========================================"
echo ""

# Ask if user wants to start chat
read -p "Would you like to start a chat session now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting Ember chat...${NC}"
    echo "Type 'exit' or press Ctrl+C to quit."
    echo ""
    ./target/release/ember-cli chat
fi