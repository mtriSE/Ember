# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-15

### 🎉 First Stable Release

This is the first production-ready release of Ember, a fast and extensible AI agent framework in Rust.

### Added
- **9-crate modular architecture** for maximum flexibility
- **ember-core**: Agent runtime with ReAct loop, memory management, context handling, checkpoints
- **ember-llm**: LLM provider abstraction with 10+ providers (OpenAI, Anthropic, Ollama, Groq, Gemini, Mistral, DeepSeek, xAI, OpenRouter)
- **ember-tools**: Built-in tools (shell, filesystem, web, git, code execution)
- **ember-storage**: SQLite for conversations, vector database for semantic search, RAG support
- **ember-plugins**: WASM plugin system with Wasmtime runtime and hot-reload
- **ember-mcp**: Model Context Protocol (MCP) client/server support
- **ember-browser**: Headless browser automation tool
- **ember-cli**: Full-featured command-line interface with TUI mode
- **ember-web**: REST API server with WebSocket streaming and React frontend
- Multi-model routing with cost optimization
- Plan/Act mode for complex task execution
- Checkpoint and undo functionality
- Local embeddings for RAG
- Model registry with pricing information
- Cost tracking and budget management
- Streaming responses in CLI and Web UI

### CLI Features
- `ember chat` - Interactive chat with streaming
- `ember tui` - Terminal UI mode
- `ember run` - Single command execution
- `ember serve` - Web server with dashboard
- `ember config` - Configuration management
- Tool support via `--tools` flag (shell, filesystem, web)
- Provider switching via `--provider` flag

### Web Dashboard
- Real-time chat interface with Markdown rendering
- Model selection and provider switching
- Cost tracking dashboard
- Dark theme UI

### Infrastructure
- GitHub Actions CI/CD pipelines
- Multi-platform release builds (Linux x86_64/aarch64, macOS x86_64/aarch64, Windows)
- Docker support with multi-platform images
- Homebrew formula
- crates.io publishing
- 278+ automated tests
- Comprehensive API documentation

### Security
- Sandboxed shell execution with configurable allowed commands
- Path traversal protection for filesystem operations
- Configurable allowed domains for web requests
- API key management

### Performance
- Binary size: 6.4MB (optimized)
- Startup time: <100ms
- Streaming support for real-time responses

## [Unreleased]

### Added
- Initial project structure with 9 crates
- **ember-core**: Agent runtime with ReAct loop, memory management, context handling
- **ember-llm**: LLM provider abstraction with OpenAI and Ollama support
- **ember-tools**: Built-in tools (shell, filesystem, web)
- **ember-storage**: SQLite for conversations, vector database for semantic search
- **ember-plugins**: WASM plugin system with Wasmtime runtime
- **ember-cli**: Command-line interface with chat, run, config commands
- **ember-web**: REST API server with Axum
- Multi-model routing support
- Configurable security sandboxing for tools
- GitHub Actions CI/CD pipelines
- Multi-platform release builds (Linux, macOS, Windows)

### Security
- Sandboxed shell execution with configurable allowed commands
- Path traversal protection for filesystem operations
- Configurable allowed domains for web requests

## [0.1.0] - 2024-XX-XX

### Added
- Initial release
- Basic agent functionality
- OpenAI and Ollama provider support
- Shell, filesystem, and web tools
- SQLite-based conversation storage
- Command-line interface

[Unreleased]: https://github.com/ember-ai/ember/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ember-ai/ember/releases/tag/v0.1.0