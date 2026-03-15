#!/bin/bash
# Ember Installation Script
# Usage: curl -fsSL https://ember.dev/install.sh | sh
#
# This script installs Ember, a blazing-fast AI agent framework written in Rust.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
REPO="ember-ai/ember"
INSTALL_DIR="${EMBER_INSTALL_DIR:-$HOME/.ember}"
BIN_DIR="${EMBER_BIN_DIR:-$HOME/.local/bin}"

# Print banner
print_banner() {
    echo ""
    echo -e "${YELLOW}${BOLD}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║                                           ║"
    echo "  ║   EMBER - AI Agent Framework              ║"
    echo "  ║   Small spark, big fire                   ║"
    echo "  ║                                           ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print colored message
info() {
    echo -e "${BLUE}[info]${NC} $1"
}

success() {
    echo -e "${GREEN}[ok]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[warn]${NC} $1"
}

error() {
    echo -e "${RED}[error]${NC} $1"
    exit 1
}

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case "$OS" in
        linux)
            OS="linux"
            ;;
        darwin)
            OS="darwin"
            ;;
        mingw*|msys*|cygwin*)
            OS="windows"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64)
            ARCH="x86_64"
            ;;
        aarch64|arm64)
            ARCH="aarch64"
            ;;
        *)
            error "Unsupported architecture: $ARCH"
            ;;
    esac

    PLATFORM="${OS}-${ARCH}"
    info "Detected platform: ${CYAN}${PLATFORM}${NC}"
}

# Check for required tools
check_dependencies() {
    info "Checking dependencies..."
    
    if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
        error "Either curl or wget is required for installation"
    fi

    if ! command -v tar &> /dev/null; then
        error "tar is required for installation"
    fi

    success "All dependencies found"
}

# Check if Rust is installed (for building from source)
check_rust() {
    if command -v cargo &> /dev/null; then
        RUST_VERSION=$(cargo --version | cut -d' ' -f2)
        info "Found Rust: ${CYAN}${RUST_VERSION}${NC}"
        return 0
    fi
    return 1
}

# Download file using curl or wget
download() {
    local url="$1"
    local output="$2"

    if command -v curl &> /dev/null; then
        curl -fsSL "$url" -o "$output"
    elif command -v wget &> /dev/null; then
        wget -q "$url" -O "$output"
    fi
}

# Get latest release version from GitHub
get_latest_version() {
    info "Fetching latest version..."
    
    if command -v curl &> /dev/null; then
        VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v?([^"]+)".*/\1/')
    else
        VERSION=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v?([^"]+)".*/\1/')
    fi

    if [ -z "$VERSION" ]; then
        warn "Could not fetch latest version, using 'main' branch"
        VERSION="main"
    else
        info "Latest version: ${CYAN}v${VERSION}${NC}"
    fi
}

# Install from pre-built binary
install_binary() {
    info "Downloading pre-built binary..."
    
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/ember-${PLATFORM}.tar.gz"
    TEMP_DIR=$(mktemp -d)
    ARCHIVE="${TEMP_DIR}/ember.tar.gz"

    if ! download "$DOWNLOAD_URL" "$ARCHIVE" 2>/dev/null; then
        warn "Pre-built binary not available for ${PLATFORM}"
        return 1
    fi

    info "Extracting archive..."
    tar -xzf "$ARCHIVE" -C "$TEMP_DIR"

    # Create directories
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"

    # Move binary
    if [ -f "${TEMP_DIR}/ember" ]; then
        mv "${TEMP_DIR}/ember" "$BIN_DIR/ember"
        chmod +x "$BIN_DIR/ember"
    elif [ -f "${TEMP_DIR}/ember-cli" ]; then
        mv "${TEMP_DIR}/ember-cli" "$BIN_DIR/ember"
        chmod +x "$BIN_DIR/ember"
    else
        error "Binary not found in archive"
    fi

    # Cleanup
    rm -rf "$TEMP_DIR"

    success "Binary installed to ${CYAN}${BIN_DIR}/ember${NC}"
    return 0
}

# Build from source using Cargo
build_from_source() {
    info "Building from source..."
    
    if ! check_rust; then
        error "Rust is required to build from source. Install from https://rustup.rs"
    fi

    # Clone or download source
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    info "Cloning repository..."
    if command -v git &> /dev/null; then
        git clone --depth 1 "https://github.com/${REPO}.git" ember
        cd ember
    else
        DOWNLOAD_URL="https://github.com/${REPO}/archive/refs/heads/main.tar.gz"
        download "$DOWNLOAD_URL" "ember.tar.gz"
        tar -xzf ember.tar.gz
        cd ember-main
    fi

    info "Building with Cargo (this may take a few minutes)..."
    cargo build --release -p ember-cli

    # Create directories
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"

    # Move binary
    cp "target/release/ember-cli" "$BIN_DIR/ember"
    chmod +x "$BIN_DIR/ember"

    # Cleanup
    cd /
    rm -rf "$TEMP_DIR"

    success "Built and installed to ${CYAN}${BIN_DIR}/ember${NC}"
}

# Add to PATH
setup_path() {
    info "Setting up PATH..."
    
    SHELL_NAME=$(basename "$SHELL")
    PROFILE=""

    case "$SHELL_NAME" in
        bash)
            if [ -f "$HOME/.bashrc" ]; then
                PROFILE="$HOME/.bashrc"
            elif [ -f "$HOME/.bash_profile" ]; then
                PROFILE="$HOME/.bash_profile"
            fi
            ;;
        zsh)
            PROFILE="$HOME/.zshrc"
            ;;
        fish)
            PROFILE="$HOME/.config/fish/config.fish"
            ;;
    esac

    # Check if BIN_DIR is already in PATH
    if [[ ":$PATH:" == *":$BIN_DIR:"* ]]; then
        success "PATH already configured"
        return
    fi

    if [ -n "$PROFILE" ] && [ -f "$PROFILE" ]; then
        # Check if already added
        if ! grep -q "EMBER" "$PROFILE"; then
            echo "" >> "$PROFILE"
            echo "# Ember AI Agent" >> "$PROFILE"
            echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$PROFILE"
            success "Added ${CYAN}${BIN_DIR}${NC} to PATH in ${CYAN}${PROFILE}${NC}"
            warn "Run ${CYAN}source ${PROFILE}${NC} or restart your terminal"
        fi
    else
        warn "Could not find shell profile. Add manually:"
        echo "  export PATH=\"\$PATH:$BIN_DIR\""
    fi
}

# Create default configuration
create_config() {
    CONFIG_DIR="${HOME}/.config/ember"
    CONFIG_FILE="${CONFIG_DIR}/config.toml"

    if [ -f "$CONFIG_FILE" ]; then
        info "Configuration already exists at ${CYAN}${CONFIG_FILE}${NC}"
        return
    fi

    mkdir -p "$CONFIG_DIR"

    cat > "$CONFIG_FILE" << 'EOF'
# Ember Configuration
# Generated by install.sh

[provider]
default = "ollama"

[provider.ollama]
url = "http://localhost:11434"
model = "llama3.2"

[provider.openai]
# api_key = "sk-..."  # Or set OPENAI_API_KEY environment variable
model = "gpt-4o-mini"

[agent]
system_prompt = "You are Ember, a helpful AI assistant."
temperature = 0.7
max_tokens = 4096
EOF

    success "Created default configuration at ${CYAN}${CONFIG_FILE}${NC}"
}

# Print usage information
print_usage() {
    echo ""
    echo -e "${GREEN}${BOLD}Installation complete!${NC}"
    echo ""
    echo "Getting started:"
    echo -e "  ${CYAN}ember chat \"Hello, world!\"${NC}    # Quick chat"
    echo -e "  ${CYAN}ember chat${NC}                     # Interactive mode"
    echo -e "  ${CYAN}ember chat --tools shell${NC}       # Agent mode with tools"
    echo -e "  ${CYAN}ember --help${NC}                   # Show all commands"
    echo ""
    echo "Configuration:"
    echo -e "  Config file: ${CYAN}~/.config/ember/config.toml${NC}"
    echo -e "  For OpenAI: Set ${CYAN}OPENAI_API_KEY${NC} environment variable"
    echo -e "  For Ollama: Run ${CYAN}ollama pull llama3.2${NC}"
    echo ""
    echo "Learn more:"
    echo -e "  Documentation: ${CYAN}https://ember.dev/docs${NC}"
    echo -e "  GitHub: ${CYAN}https://github.com/${REPO}${NC}"
    echo ""
}

# Main installation flow
main() {
    print_banner
    
    # Parse arguments
    BUILD_FROM_SOURCE=false
    for arg in "$@"; do
        case $arg in
            --source)
                BUILD_FROM_SOURCE=true
                ;;
            --help|-h)
                echo "Usage: install.sh [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --source    Build from source instead of downloading binary"
                echo "  --help      Show this help message"
                echo ""
                echo "Environment variables:"
                echo "  EMBER_INSTALL_DIR    Installation directory (default: ~/.ember)"
                echo "  EMBER_BIN_DIR        Binary directory (default: ~/.local/bin)"
                exit 0
                ;;
        esac
    done

    detect_platform
    check_dependencies

    if [ "$BUILD_FROM_SOURCE" = true ]; then
        build_from_source
    else
        # Try binary first, fall back to source
        get_latest_version
        if ! install_binary; then
            info "Falling back to building from source..."
            build_from_source
        fi
    fi

    setup_path
    create_config
    print_usage
}

# Run main function
main "$@"