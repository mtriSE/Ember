#!/bin/bash
# Ember Desktop Build Script
# Build the desktop application for all platforms

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DESKTOP_DIR="$ROOT_DIR/crates/ember-desktop"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help
show_help() {
    echo "Ember Desktop Build Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [PLATFORM]"
    echo ""
    echo "Platforms:"
    echo "  macos       Build for macOS"
    echo "  windows     Build for Windows"
    echo "  linux       Build for Linux"
    echo "  all         Build for all platforms (requires cross-compilation)"
    echo ""
    echo "Options:"
    echo "  --release   Build in release mode (default)"
    echo "  --debug     Build in debug mode"
    echo "  --no-bundle Skip bundling (faster builds)"
    echo "  --clean     Clean build artifacts before building"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build for current platform in release mode"
    echo "  $0 macos             # Build for macOS"
    echo "  $0 --debug linux     # Build for Linux in debug mode"
    echo "  $0 --clean all       # Clean and build for all platforms"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Rust
    if ! command -v cargo &> /dev/null; then
        print_error "Cargo not found. Please install Rust: https://rustup.rs/"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js: https://nodejs.org/"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi

    # Check Tauri CLI
    if ! cargo tauri --version &> /dev/null 2>&1; then
        print_warning "Tauri CLI not found. Installing..."
        cargo install tauri-cli
    fi

    print_success "All prerequisites met"
}

# Check platform-specific requirements
check_platform_requirements() {
    local platform=$1

    case $platform in
        macos)
            if [[ "$(uname)" != "Darwin" ]]; then
                print_error "macOS builds require macOS"
                exit 1
            fi
            # Check Xcode Command Line Tools
            if ! xcode-select -p &> /dev/null; then
                print_error "Xcode Command Line Tools not found. Install with: xcode-select --install"
                exit 1
            fi
            ;;
        windows)
            if [[ "$(uname)" == "Darwin" || "$(uname)" == "Linux" ]]; then
                print_warning "Cross-compiling to Windows. This requires additional setup."
                print_warning "See: https://tauri.app/v1/guides/building/cross-platform"
            fi
            ;;
        linux)
            if [[ "$(uname)" == "Darwin" ]]; then
                print_warning "Cross-compiling to Linux from macOS. This requires additional setup."
            fi
            # Check Linux dependencies
            if [[ "$(uname)" == "Linux" ]]; then
                local missing_deps=""
                for dep in libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev; do
                    if ! dpkg -l | grep -q "^ii  $dep "; then
                        missing_deps="$missing_deps $dep"
                    fi
                done
                if [[ -n "$missing_deps" ]]; then
                    print_warning "Missing Linux dependencies:$missing_deps"
                    print_info "Install with: sudo apt install$missing_deps"
                fi
            fi
            ;;
    esac
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    cd "$ROOT_DIR/crates/ember-web/frontend"
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    cd "$ROOT_DIR"
    print_success "Frontend dependencies installed"
}

# Build frontend
build_frontend() {
    print_info "Building frontend..."
    cd "$ROOT_DIR/crates/ember-web/frontend"
    npm run build
    cd "$ROOT_DIR"
    print_success "Frontend built"
}

# Clean build artifacts
clean_build() {
    print_info "Cleaning build artifacts..."
    cd "$DESKTOP_DIR"
    cargo clean
    rm -rf src-tauri/target
    cd "$ROOT_DIR"
    print_success "Build artifacts cleaned"
}

# Build for macOS
build_macos() {
    local build_mode=$1
    local bundle=$2

    print_info "Building for macOS ($build_mode)..."
    check_platform_requirements "macos"

    cd "$DESKTOP_DIR"

    local args=""
    if [ "$build_mode" = "release" ]; then
        args="--release"
    fi
    if [ "$bundle" = "false" ]; then
        args="$args --no-bundle"
    fi

    cargo tauri build $args

    print_success "macOS build complete"
    
    if [ "$bundle" != "false" ]; then
        print_info "Output: target/release/bundle/macos/Ember AI.app"
        print_info "DMG: target/release/bundle/dmg/Ember AI_*.dmg"
    fi
}

# Build for Windows
build_windows() {
    local build_mode=$1
    local bundle=$2

    print_info "Building for Windows ($build_mode)..."
    check_platform_requirements "windows"

    cd "$DESKTOP_DIR"

    local args=""
    if [ "$build_mode" = "release" ]; then
        args="--release"
    fi
    if [ "$bundle" = "false" ]; then
        args="$args --no-bundle"
    fi

    # Cross-compile target for Windows
    local target=""
    if [[ "$(uname)" != *"MINGW"* && "$(uname)" != *"MSYS"* ]]; then
        target="--target x86_64-pc-windows-msvc"
    fi

    cargo tauri build $args $target

    print_success "Windows build complete"

    if [ "$bundle" != "false" ]; then
        print_info "Output: target/release/bundle/msi/Ember AI_*.msi"
        print_info "NSIS: target/release/bundle/nsis/Ember AI_*.exe"
    fi
}

# Build for Linux
build_linux() {
    local build_mode=$1
    local bundle=$2

    print_info "Building for Linux ($build_mode)..."
    check_platform_requirements "linux"

    cd "$DESKTOP_DIR"

    local args=""
    if [ "$build_mode" = "release" ]; then
        args="--release"
    fi
    if [ "$bundle" = "false" ]; then
        args="$args --no-bundle"
    fi

    cargo tauri build $args

    print_success "Linux build complete"

    if [ "$bundle" != "false" ]; then
        print_info "Output: target/release/bundle/deb/ember-desktop_*.deb"
        print_info "AppImage: target/release/bundle/appimage/ember-desktop_*.AppImage"
    fi
}

# Build for all platforms
build_all() {
    local build_mode=$1
    local bundle=$2

    print_info "Building for all platforms..."

    case "$(uname)" in
        Darwin)
            build_macos "$build_mode" "$bundle"
            print_warning "To build for Windows/Linux, use a CI/CD pipeline or Docker."
            ;;
        Linux)
            build_linux "$build_mode" "$bundle"
            print_warning "To build for macOS/Windows, use a CI/CD pipeline."
            ;;
        MINGW*|MSYS*|CYGWIN*)
            build_windows "$build_mode" "$bundle"
            print_warning "To build for macOS/Linux, use a CI/CD pipeline."
            ;;
        *)
            print_error "Unknown operating system: $(uname)"
            exit 1
            ;;
    esac
}

# Detect current platform
detect_platform() {
    case "$(uname)" in
        Darwin)
            echo "macos"
            ;;
        Linux)
            echo "linux"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Main function
main() {
    local build_mode="release"
    local bundle="true"
    local clean="false"
    local platform=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --release)
                build_mode="release"
                shift
                ;;
            --debug)
                build_mode="debug"
                shift
                ;;
            --no-bundle)
                bundle="false"
                shift
                ;;
            --clean)
                clean="true"
                shift
                ;;
            macos|windows|linux|all)
                platform=$1
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Default to current platform
    if [ -z "$platform" ]; then
        platform=$(detect_platform)
        if [ "$platform" = "unknown" ]; then
            print_error "Could not detect platform. Please specify: macos, windows, or linux"
            exit 1
        fi
        print_info "Detected platform: $platform"
    fi

    # Check prerequisites
    check_prerequisites

    # Clean if requested
    if [ "$clean" = "true" ]; then
        clean_build
    fi

    # Install and build frontend
    install_frontend
    build_frontend

    # Build for target platform
    case $platform in
        macos)
            build_macos "$build_mode" "$bundle"
            ;;
        windows)
            build_windows "$build_mode" "$bundle"
            ;;
        linux)
            build_linux "$build_mode" "$bundle"
            ;;
        all)
            build_all "$build_mode" "$bundle"
            ;;
    esac

    print_success "Build complete!"
}

# Run main function
main "$@"