# GitHub Integration Plugin for Ember

A comprehensive GitHub integration plugin that enables Ember to interact with GitHub repositories, issues, pull requests, and GitHub Actions.

## Features

- **Repository Management**: Search, view, and explore repositories
- **Issue Tracking**: List, create, and manage issues
- **Pull Requests**: View and track pull requests
- **Commit History**: Browse commit logs and changes
- **File Access**: Read files directly from repositories
- **GitHub Actions**: Monitor workflows and runs

## Installation

```bash
ember plugin install ember-github
```

## Configuration

### Required: GitHub Token

Create a Personal Access Token (PAT) at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).

**Required scopes:**
- `repo` - Full control of private repositories (or `public_repo` for public only)
- `read:org` - Read organization membership (optional)
- `workflow` - Access GitHub Actions (optional)

### Set Token

**Option 1: Environment Variable (Recommended)**
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Option 2: Plugin Configuration**
```bash
ember plugin config ember-github token=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional Settings

```bash
# GitHub Enterprise URL (default: https://api.github.com)
ember plugin config ember-github api_url=https://github.mycompany.com/api/v3

# Default repository owner
ember plugin config ember-github default_owner=my-org

# Request timeout in seconds (default: 30)
ember plugin config ember-github timeout=60
```

## Available Tools

### Repository Tools

#### `github_search_repos`
Search GitHub repositories by query.

```
User: Search for popular Rust async runtimes
Ember: [Uses github_search_repos with query="rust async runtime" sort="stars"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query with optional qualifiers |
| `sort` | string | No | Sort by: stars, forks, updated, help-wanted-issues |
| `order` | string | No | Sort order: asc, desc (default: desc) |
| `per_page` | integer | No | Results per page, 1-100 (default: 10) |

#### `github_get_repo`
Get detailed information about a repository.

```
User: Show me info about the tokio repository
Ember: [Uses github_get_repo with owner="tokio-rs" repo="tokio"]
```

### Issue Tools

#### `github_list_issues`
List issues in a repository.

```
User: Show open bugs in ember-ai/ember
Ember: [Uses github_list_issues with owner="ember-ai" repo="ember" labels="bug"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `state` | string | No | Filter: open, closed, all (default: open) |
| `labels` | string | No | Comma-separated labels |
| `sort` | string | No | Sort by: created, updated, comments |
| `per_page` | integer | No | Results per page (default: 30) |

#### `github_create_issue`
Create a new issue.

```
User: Create an issue about the login bug
Ember: [Uses github_create_issue with title="Login fails on mobile" body="..." labels=["bug"]]
```

### Pull Request Tools

#### `github_list_prs`
List pull requests in a repository.

```
User: Show me open PRs in the project
Ember: [Uses github_list_prs with owner="ember-ai" repo="ember"]
```

#### `github_get_pr`
Get detailed information about a specific PR.

```
User: Show me PR #42
Ember: [Uses github_get_pr with owner="ember-ai" repo="ember" pr_number=42]
```

### Commit Tools

#### `github_list_commits`
List commits in a repository.

```
User: Show recent commits on the main branch
Ember: [Uses github_list_commits with owner="ember-ai" repo="ember" sha="main"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `sha` | string | No | Branch or commit SHA |
| `path` | string | No | Filter by file path |
| `author` | string | No | Filter by author |
| `per_page` | integer | No | Results per page (default: 30) |

### File Tools

#### `github_get_file`
Get contents of a file from a repository.

```
User: Show me the Cargo.toml from tokio
Ember: [Uses github_get_file with owner="tokio-rs" repo="tokio" path="Cargo.toml"]
```

### GitHub Actions Tools

#### `github_list_workflows`
List GitHub Actions workflows in a repository.

```
User: What workflows does this project have?
Ember: [Uses github_list_workflows with owner="ember-ai" repo="ember"]
```

#### `github_get_workflow_runs`
Get recent workflow runs.

```
User: Show me recent CI runs
Ember: [Uses github_get_workflow_runs with owner="ember-ai" repo="ember"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | Repository owner |
| `repo` | string | Yes | Repository name |
| `workflow_id` | string | No | Specific workflow ID or filename |
| `branch` | string | No | Filter by branch |
| `status` | string | No | Filter: completed, in_progress, queued |
| `per_page` | integer | No | Results per page (default: 10) |

## Usage Examples

### Example 1: Project Research
```
User: Find the most popular machine learning libraries in Python

Ember: I'll search for popular Python ML libraries on GitHub.

[Uses github_search_repos: query="machine learning language:python" sort="stars"]

Here are the top Python machine learning libraries:

1. **tensorflow/tensorflow** ⭐ 180k
   - An Open Source Machine Learning Framework for Everyone

2. **pytorch/pytorch** ⭐ 75k  
   - Tensors and Dynamic neural networks in Python

3. **scikit-learn/scikit-learn** ⭐ 58k
   - Machine learning in Python
```

### Example 2: Issue Management
```
User: Create an issue for the memory leak we found in the cache module

Ember: I'll create an issue for this bug.

[Uses github_create_issue: 
  owner="ember-ai"
  repo="ember"
  title="Memory leak in cache module"
  body="## Description\nMemory usage increases over time...\n\n## Steps to Reproduce\n1. ..."
  labels=["bug", "priority-high"]]

Created issue #127: "Memory leak in cache module"
- URL: https://github.com/ember-ai/ember/issues/127
- Labels: bug, priority-high
```

### Example 3: Code Review Preparation
```
User: Show me what changes are pending in PR #42

Ember: I'll get the details of PR #42.

[Uses github_get_pr: owner="ember-ai" repo="ember" pr_number=42]

**PR #42: Add streaming support for chat responses**

- Author: @contributor123
- Branch: feature/streaming → main
- Status: Open, awaiting review
- Changed files: 8
- Additions: +342 / Deletions: -56

**Description:**
This PR adds streaming support for chat responses...
```

### Example 4: CI/CD Monitoring
```
User: Why is our CI failing?

Ember: Let me check the recent workflow runs.

[Uses github_get_workflow_runs: owner="ember-ai" repo="ember" status="completed"]

Recent CI results for ember-ai/ember:

❌ **CI (6 hours ago)** - Failed
   - Commit: "Update dependencies"
   - Failed job: test-linux
   - [View logs](https://github.com/ember-ai/ember/actions/runs/...)

✅ **CI (1 day ago)** - Passed
   - Commit: "Fix memory leak"
```

## Search Query Syntax

The `github_search_repos` tool supports GitHub's advanced search syntax:

| Qualifier | Example | Description |
|-----------|---------|-------------|
| `language:` | `language:rust` | Filter by programming language |
| `stars:` | `stars:>1000` | Filter by star count |
| `forks:` | `forks:>100` | Filter by fork count |
| `user:` | `user:torvalds` | Search user's repositories |
| `org:` | `org:microsoft` | Search organization's repositories |
| `topic:` | `topic:react` | Filter by topic |
| `license:` | `license:mit` | Filter by license |
| `archived:` | `archived:false` | Filter by archived status |
| `is:` | `is:public` | Filter by visibility |

**Combined example:**
```
language:rust stars:>500 topic:async archived:false
```

## Error Handling

The plugin handles common GitHub API errors:

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or expired token | Regenerate your GitHub token |
| 403 Forbidden | Rate limit exceeded | Wait or use authenticated requests |
| 404 Not Found | Repository doesn't exist | Check owner/repo spelling |
| 422 Validation Failed | Invalid parameters | Check required fields |

## Rate Limits

GitHub API has rate limits:

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Search API**: 30 requests/minute (authenticated)

The plugin automatically handles rate limiting with exponential backoff.

## Security

- Tokens are stored securely and never logged
- HTTPS is enforced for all API calls
- Minimal permissions are requested
- Supports GitHub Enterprise for private deployments

## Changelog

### v1.0.0
- Initial release
- Repository search and details
- Issue listing and creation
- Pull request viewing
- Commit history
- File content retrieval
- GitHub Actions workflow monitoring

## License

MIT License - see [LICENSE](LICENSE) for details.