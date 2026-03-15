# First Chat

Learn how to have your first conversation with Ember and explore its chat capabilities.

## Starting a Chat

### Quick One-Off Chat

For a single question and response:

```bash
ember chat "What is the Rust programming language?"
```

### Interactive Chat Session

For a multi-turn conversation:

```bash
ember chat
```

This opens an interactive session where you can have a back-and-forth dialogue.

## Interactive Mode Features

### Basic Commands

Once in interactive mode, you can use these commands:

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation history |
| `/model <name>` | Switch to a different model |
| `/provider <name>` | Switch to a different provider |
| `/system <prompt>` | Set a system prompt |
| `/save <file>` | Save conversation to file |
| `/load <file>` | Load conversation from file |
| `/exit` or `/quit` | Exit the chat |

### Example Interactive Session

```text
$ ember chat
Ember v1.0.0 - AI Agent Framework
Provider: openai | Model: gpt-4

You: Hello! What can you help me with?
