# Interactive Mode

Interactive mode provides a rich conversational experience with multi-turn dialogue, context retention, and special commands.

## Starting Interactive Mode

Simply run `ember chat` without a prompt:

```bash
ember chat
```

Or explicitly enable interactive mode:

```bash
ember chat --interactive
```

## Interface Overview

When you start interactive mode, you'll see a prompt showing:
- Ember version
- Current provider and model
- Help instructions
- Input prompt waiting for your message

## Conversation Features

### Multi-Turn Dialogue

Ember maintains conversation context across turns. Ask follow-up questions and the AI will remember previous context.

### Context Window

Each provider has a context window limit. Ember automatically manages this by:
- Summarizing older messages when needed
- Showing token usage with `--show-tokens`
- Warning when approaching limits

## Slash Commands

Commands start with `/` and provide quick actions:

### Navigation Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/exit` | Exit interactive mode |
| `/quit` | Same as /exit |
| `/clear` | Clear conversation history |

### Model Commands

| Command | Description |
|---------|-------------|
| `/model <name>` | Switch to a different model |
| `/provider <name>` | Switch to a different provider |
| `/models` | List available models |
| `/providers` | List available providers |

### Context Commands

| Command | Description |
|---------|-------------|
| `/system <prompt>` | Set or update system prompt |
| `/context` | Show current context size |
| `/history` | Show conversation history |
| `/forget` | Clear context but keep session |

### File Commands

| Command | Description |
|---------|-------------|
| `/save <file>` | Save conversation to file |
| `/load <file>` | Load conversation from file |
| `/export <format>` | Export as markdown/json/txt |

### Agent Commands

| Command | Description |
|---------|-------------|
| `/agent` | Toggle agent mode |
| `/tools` | List available tools |
| `/tools <list>` | Enable specific tools |
| `/plan` | Toggle Plan/Act mode |

### Display Commands

| Command | Description |
|---------|-------------|
| `/tokens` | Toggle token display |
| `/cost` | Show session cost |
| `/thinking` | Toggle thinking display |
| `/stream` | Toggle streaming |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current response |
| `Ctrl+D` | Exit (same as /exit) |
| `Ctrl+L` | Clear screen |
| `Up/Down` | Navigate input history |
| `Tab` | Autocomplete commands |

## Multi-Line Input

For longer inputs, use triple backticks:

```
\`\`\`
This is a multi-line
input that spans
several lines
\`\`\`
```

Or use a backslash at the end of a line:

```
This is a long message that \
continues on the next line
```

## Session Management

### Saving Sessions

```
/save my-session.json
```

This saves:
- Full conversation history
- System prompt
- Current settings

### Loading Sessions

```
/load my-session.json
```

Resume exactly where you left off.

### Auto-Save

Enable automatic session saving:

```toml
[interactive]
auto_save = true
save_path = "~/.local/share/ember/sessions"
```

## Customization

### Prompt Customization

```toml
[interactive]
prompt = ">>> "
assistant_prefix = "AI: "
show_provider = true
show_model = true
show_tokens = false
```

### Color Themes

```toml
[interactive.colors]
user_input = "cyan"
assistant_output = "white"
error = "red"
command = "yellow"
```

### History Settings

```toml
[interactive]
history_size = 1000
history_file = "~/.local/share/ember/history"
save_history = true
```

## Advanced Usage

### Piping Input

```bash
echo "Explain this code" | ember chat
cat code.rs | ember chat "Review this Rust code"
```

### With Initial Context

```bash
ember chat --system "You are a Rust expert" --context ./src/
```

### Recording Sessions

```bash
ember chat --record session.log
```

### Replay Sessions

```bash
ember chat --replay session.log
```

## Tips and Tricks

1. **Use /system early** - Set context before diving in
2. **Save interesting conversations** - Use /save for future reference
3. **Switch models mid-conversation** - Use /model for different tasks
4. **Monitor costs** - Use /cost to track spending
5. **Use multi-line for code** - Triple backticks preserve formatting

## Troubleshooting

### Command Not Recognized

Ensure you're using the correct syntax:
- Commands start with `/`
- Arguments are space-separated
- Use quotes for arguments with spaces

### History Not Saving

Check permissions:
```bash
ls -la ~/.local/share/ember/
```

### Slow Response

Try:
- Switching to a faster model: `/model gpt-3.5-turbo`
- Enabling streaming: `/stream`
- Using a faster provider: `/provider groq`

## Related Documentation

- [CLI Commands](./cli.md)
- [Agent Mode](./agent-mode.md)
- [Terminal UI](./tui.md)
- [Configuration](../getting-started/configuration.md)