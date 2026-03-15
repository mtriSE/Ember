# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Ember seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@ember.dev** (or create a private security advisory on GitHub)

### What to Include

Please include as much of the following information as possible:

- Type of vulnerability (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Communication**: We will keep you informed about our progress toward resolving the issue.
- **Resolution Timeline**: We aim to resolve critical vulnerabilities within 7 days.
- **Disclosure**: We will coordinate with you on the public disclosure of the vulnerability.

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report vulnerabilities directly to us and do not share them with third parties

## Security Features

Ember includes several security features by design:

### Tool Sandboxing

- **Shell Tool**: Configurable allowed commands list, working directory restrictions
- **Filesystem Tool**: Path traversal protection, configurable allowed directories
- **Web Tool**: Configurable allowed domains, request timeout limits

### Configuration

```toml
# Example security configuration in ember.toml

[tools.shell]
allowed_commands = ["ls", "cat", "grep", "find"]
working_directory = "/home/user/projects"

[tools.filesystem]
allowed_paths = ["/home/user/projects", "/tmp"]
read_only = false

[tools.web]
allowed_domains = ["api.openai.com", "api.github.com"]
timeout_seconds = 30
```

### Plugin Security

- WASM plugins run in a sandboxed environment
- Explicit capability grants required for host access
- Memory isolation between plugins

## Best Practices

When deploying Ember, we recommend:

1. **Use environment variables** for API keys, never commit them to version control
2. **Restrict tool permissions** to only what's necessary for your use case
3. **Run in containers** when possible for additional isolation
4. **Keep Ember updated** to receive security patches
5. **Review plugin permissions** before installing third-party plugins

## Security Audits

We welcome security audits and will work with researchers to address any findings. If you're planning a security audit, please contact us in advance so we can provide any necessary context or support.