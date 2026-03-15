# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with 7 crates
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