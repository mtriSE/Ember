# Ember AI Desktop

A native desktop application for Ember AI, built with [Tauri](https://tauri.app/).

## Features

- 🖥️ **Native Desktop Experience** - Runs as a native app on macOS, Windows, and Linux
- 🔔 **System Tray** - Quick access from your system tray with context menu
- ⌨️ **Global Shortcuts** - Toggle the window with `Cmd/Ctrl+Shift+E`
- 🔄 **Auto-Update** - Automatically checks for and installs updates
- 📣 **Native Notifications** - Get notified about responses and updates
- 🚀 **Autostart** - Optionally start with your system
- 🎨 **Cross-Platform** - Consistent experience across all platforms

## Installation

### Pre-built Binaries

Download the latest release for your platform:

- **macOS**: `Ember AI.dmg` or `Ember AI.app`
- **Windows**: `Ember AI Setup.exe` (NSIS) or `Ember AI.msi`
- **Linux**: `ember-desktop.AppImage` or `ember-desktop.deb`

### Build from Source

#### Prerequisites

1. **Rust** (1.70+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js** (18+)
   ```bash
   # macOS
   brew install node
   
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Tauri CLI**
   ```bash
   cargo install tauri-cli
   ```

4. **Platform-specific dependencies**

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Ubuntu/Debian:**
   ```bash
   sudo apt install libwebkit2gtk-4.1-dev \
       build-essential \
       curl \
       wget \
       file \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

   **Windows:**
   - Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

#### Build

```bash
# Using the build script
./scripts/build-desktop.sh

# Or manually
cd crates/ember-desktop
cargo tauri build
```

#### Development

```bash
# Start in development mode
cd crates/ember-desktop
cargo tauri dev
```

## Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+E` | Toggle window visibility |
| `Cmd/Ctrl+Shift+Space` | Open and focus chat input |

### System Tray

Right-click the tray icon for quick actions:

- **Show/Hide Window** - Toggle the main window
- **Switch Model** - Quick model selection (GPT-4, Claude, Gemini, Ollama)
- **Check for Updates** - Manually check for updates
- **Preferences** - Open settings
- **Quit** - Close the application

### Commands (Tauri IPC)

The desktop app exposes these commands to the frontend:

```typescript
// Chat with the AI
const response = await invoke('chat', {
  request: { message: 'Hello', model: 'gpt-4' }
});

// Get server info
const info = await invoke('get_info');

// Get available models
const models = await invoke('get_models');

// Set current model
await invoke('set_model', { model: 'claude-3-sonnet' });

// Check for updates
const update = await invoke('check_for_updates');

// Install update
await invoke('install_update');

// Send notification
await invoke('send_notification', { 
  title: 'Task Complete', 
  body: 'Your code has been generated' 
});

// Autostart management
const enabled = await invoke('get_autostart_enabled');
await invoke('set_autostart_enabled', { enabled: true });
```

### Events

Listen for events from the backend:

```typescript
import { listen } from '@tauri-apps/api/event';

// Model changed via tray menu
await listen('model-changed', (event) => {
  console.log('Model changed to:', event.payload);
});

// Settings requested via tray
await listen('open-settings', () => {
  // Open settings panel
});

// Focus chat input (from shortcut)
await listen('focus-chat-input', () => {
  document.getElementById('chat-input')?.focus();
});
```

## Configuration

### Update Server

To enable auto-updates, configure the update endpoint in `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://your-update-server.com/releases/latest.json"
      ],
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

Generate signing keys:

```bash
cargo tauri signer generate -w ~/.tauri/ember.key
```

### Icons

Generate icons from a source SVG:

```bash
cargo tauri icon assets/logo.svg
```

This creates all required icon formats in `icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

## Architecture

```
ember-desktop/
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
├── build.rs            # Build script
├── icons/              # Application icons
└── src/
    └── main.rs         # Main application code
        ├── AppState    # Global application state
        ├── Commands    # Tauri IPC commands
        ├── Tray        # System tray setup
        └── Shortcuts   # Global keyboard shortcuts
```

## Development

### Project Structure

The desktop app uses the web frontend from `ember-web/frontend`. In development:

1. The frontend dev server runs on `http://localhost:5173`
2. Tauri loads the frontend from the dev server
3. Hot reload works for both Rust and TypeScript changes

### Building for Release

```bash
# Build for current platform
./scripts/build-desktop.sh --release

# Build with debug symbols
./scripts/build-desktop.sh --debug

# Skip bundling (faster builds)
./scripts/build-desktop.sh --no-bundle

# Clean before build
./scripts/build-desktop.sh --clean
```

### Cross-Platform Building

For CI/CD, use the GitHub Actions workflow in `.github/workflows/release.yml` to build for all platforms.

## Troubleshooting

### macOS

**"Ember AI" is damaged and can't be opened**

This happens when the app isn't signed. Right-click the app and select "Open", or:
```bash
xattr -cr "/Applications/Ember AI.app"
```

### Windows

**Missing WebView2**

Install the [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### Linux

**Missing libraries**

```bash
sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
```

**AppImage doesn't run**

```bash
chmod +x ember-desktop.AppImage
./ember-desktop.AppImage --no-sandbox
```

## Security

- All IPC commands are whitelisted in `tauri.conf.json`
- CSP is configured to prevent XSS attacks
- Auto-update uses signature verification
- No unnecessary system permissions are requested

## License

MIT OR Apache-2.0