# Terminal UI

Ember's Terminal User Interface (TUI) provides a rich, full-screen interface for interacting with AI models.

## Overview

The TUI offers:
- Split-pane layout with chat and information panels
- Syntax highlighting for code
- Real-time streaming display
- Keyboard-driven navigation
- Multiple conversation tabs

## Launching the TUI

```bash
ember tui
```

With options:

```bash
# Dark theme (default)
ember tui --theme dark

# Light theme
ember tui --theme light

# Enable vim keybindings
ember tui --vim
```

## Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Ember TUI                        Provider: openai | gpt-4   │
├─────────────────────────────────────────────────────────────┤
│ Conversations │ Chat                                        │
│ ───────────── │ ─────────────────────────────────────────── │
│ > Session 1   │ User: What is Rust?                         │
│   Session 2   │                                             │
│   Session 3   │ Assistant: Rust is a systems programming    │
│               │ language focused on safety, speed, and      │
│               │ concurrency...                              │
│               │                                             │
│               │                                             │
│               │ User: _                                     │
├─────────────────────────────────────────────────────────────┤
│ Tokens: 245 | Cost: $0.0012 | Streaming: On      [F1: Help] │
└─────────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `Tab` | Switch between panels |
| `Ctrl+n` | New conversation |
| `Ctrl+w` | Close current tab |
| `Ctrl+Tab` | Next conversation |
| `Ctrl+Shift+Tab` | Previous conversation |
| `F1` | Show help |
| `Esc` | Cancel/close popup |
| `Ctrl+q` | Quit TUI |

### Chat Input

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Ctrl+c` | Cancel generation |
| `Up/Down` | Navigate history |
| `Ctrl+l` | Clear chat |

### Vim Mode (--vim)

| Key | Action |
|-----|--------|
| `i` | Enter insert mode |
| `Esc` | Exit insert mode |
| `j/k` | Scroll down/up |
| `g/G` | Go to top/bottom |
| `/` | Search |
| `n/N` | Next/previous match |
| `:w` | Save conversation |
| `:q` | Quit |

## Panels

### Conversation List

The left panel shows all conversations:
- Click or use arrow keys to select
- Press `Enter` to switch
- Press `Delete` to remove
- Press `r` to rename

### Chat Panel

The main panel for conversation:
- Messages are displayed with syntax highlighting
- Code blocks are formatted
- Streaming responses appear in real-time
- Scroll with mouse wheel or keyboard

### Info Bar

The bottom bar shows:
- Token count for current context
- Session cost
- Streaming status
- Current provider/model

## Features

### Syntax Highlighting

Code in responses is automatically highlighted:

```rust
fn main() {
    println!("Hello, Ember!");
}
```

Supported languages: Rust, Python, JavaScript, TypeScript, Go, C/C++, and many more.

### Code Actions

When hovering over code blocks:
- `c` - Copy to clipboard
- `s` - Save to file
- `r` - Run (if code execution enabled)
- `e` - Edit and send back

### Search

Press `/` to search within the conversation:
- Type search term
- `Enter` to find
- `n` for next match
- `N` for previous match
- `Esc` to close

### Multi-Tab Support

Work with multiple conversations:
- `Ctrl+n` creates new tab
- `Ctrl+Tab` switches tabs
- Each tab has independent context

## Configuration

### TUI Settings

```toml
# ~/.config/ember/config.toml

[tui]
theme = "dark"  # dark, light, auto
vim_mode = false
show_tokens = true
show_cost = true
show_time = true
word_wrap = true
tab_width = 4

[tui.layout]
sidebar_width = 25  # percentage
input_height = 3    # lines

[tui.colors]
background = "#1e1e2e"
foreground = "#cdd6f4"
accent = "#89b4fa"
error = "#f38ba8"
warning = "#fab387"
success = "#a6e3a1"

[tui.keybindings]
quit = "ctrl+q"
new_chat = "ctrl+n"
toggle_sidebar = "ctrl+b"
```

### Custom Themes

Create custom themes in `~/.config/ember/themes/`:

```toml
# ~/.config/ember/themes/my-theme.toml

[colors]
background = "#282a36"
foreground = "#f8f8f2"
accent = "#bd93f9"
user_message = "#50fa7b"
assistant_message = "#f8f8f2"
code_background = "#44475a"
selection = "#44475a"
```

Use custom theme:

```bash
ember tui --theme my-theme
```

## Advanced Features

### Split View

View multiple chats side by side:
- `Ctrl+\` to split horizontally
- `Ctrl+Shift+\` to split vertically
- `Ctrl+w` to close split

### Focus Mode

Hide panels for distraction-free chatting:
- `Ctrl+b` toggle sidebar
- `Ctrl+i` toggle info bar
- `F11` full screen

### Export Options

Export from TUI:
- `Ctrl+e` export dialog
- Choose format: Markdown, JSON, HTML
- Select destination

### Agent Mode in TUI

Toggle agent mode:
- `Ctrl+a` to enable/disable
- Tool calls appear with special formatting
- Approval prompts shown inline

## Troubleshooting

### Display Issues

If characters don't display correctly:
```bash
# Check terminal encoding
echo $LANG

# Should be UTF-8, e.g.:
export LANG=en_US.UTF-8
```

### Colors Not Working

Ensure your terminal supports 256 colors:
```bash
echo $TERM
# Should be xterm-256color or similar
export TERM=xterm-256color
```

### Performance Issues

For large conversations:
```toml
[tui]
virtual_scroll = true  # Only render visible messages
max_displayed_messages = 100
```

### Mouse Not Working

Enable mouse support in your terminal:
```bash
# For tmux
set -g mouse on
```

## Tips

1. **Use keyboard shortcuts** - Much faster than mouse
2. **Enable vim mode** - If you're comfortable with vim
3. **Customize colors** - Match your terminal theme
4. **Use tabs** - Organize different topics
5. **Export often** - Save important conversations

## Related Documentation

- [CLI Commands](./cli.md)
- [Interactive Mode](./interactive.md)
- [Configuration](../getting-started/configuration.md)