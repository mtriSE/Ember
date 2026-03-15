# Slack Integration Plugin for Ember

A comprehensive Slack integration plugin that enables Ember to send messages, manage channels, search conversations, and automate team communication.

## Features

- **Messaging**: Send plain text or rich Block Kit messages
- **Channel Management**: List, create, and manage channels
- **User Directory**: Look up users and manage status
- **Message Search**: Search across your workspace
- **File Sharing**: Upload and share files
- **Reactions**: Add emoji reactions to messages
- **Threaded Conversations**: Reply in threads

## Installation

```bash
ember plugin install ember-slack
```

## Configuration

### Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Enter an app name (e.g., "Ember AI") and select your workspace
4. Click **Create App**

### Step 2: Configure Bot Permissions

1. Go to **OAuth & Permissions** in the sidebar
2. Under **Scopes** → **Bot Token Scopes**, add:

| Scope | Description |
|-------|-------------|
| `channels:history` | Read public channel messages |
| `channels:read` | List public channels |
| `channels:write` | Create/manage public channels |
| `chat:write` | Send messages |
| `files:write` | Upload files |
| `groups:history` | Read private channel messages |
| `groups:read` | List private channels |
| `reactions:write` | Add reactions |
| `search:read` | Search messages |
| `users:read` | View user information |
| `users:write` | Update user status |

### Step 3: Install to Workspace

1. Go to **OAuth & Permissions**
2. Click **Install to Workspace**
3. Authorize the permissions
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Step 4: Configure the Plugin

**Option 1: Environment Variable (Recommended)**
```bash
export SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
```

**Option 2: Plugin Configuration**
```bash
ember plugin config ember-slack bot_token=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional Settings

```bash
# Default channel for messages
ember plugin config ember-slack default_channel=general

# Rate limit retry attempts (default: 3)
ember plugin config ember-slack rate_limit_retries=5
```

## Available Tools

### Messaging Tools

#### `slack_send_message`
Send a message to a channel or user.

```
User: Send "Deployment complete!" to the #releases channel
Ember: [Uses slack_send_message with channel="#releases" text="Deployment complete!"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | string | Yes | Channel (#name), channel ID, or user ID |
| `text` | string | Yes | Message text (Slack markdown supported) |
| `thread_ts` | string | No | Reply in a thread |
| `unfurl_links` | boolean | No | Show link previews (default: true) |
| `unfurl_media` | boolean | No | Show media previews (default: true) |

#### `slack_send_blocks`
Send a rich message using Block Kit.

```
User: Send a formatted deployment summary to #releases
Ember: [Uses slack_send_blocks with channel="#releases" and Block Kit JSON]
```

### Channel Tools

#### `slack_list_channels`
List channels in the workspace.

```
User: What channels are available?
Ember: [Uses slack_list_channels]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `types` | string | No | Channel type filter |
| `exclude_archived` | boolean | No | Exclude archived (default: true) |
| `limit` | integer | No | Max results (default: 100) |

#### `slack_get_channel_info`
Get details about a specific channel.

```
User: Tell me about the #engineering channel
Ember: [Uses slack_get_channel_info with channel="engineering"]
```

#### `slack_get_channel_history`
Retrieve recent messages from a channel.

```
User: Show me recent messages in #general
Ember: [Uses slack_get_channel_history with channel="general" limit=10]
```

#### `slack_create_channel`
Create a new channel.

```
User: Create a private channel called project-alpha
Ember: [Uses slack_create_channel with name="project-alpha" is_private=true]
```

#### `slack_invite_to_channel`
Invite users to a channel.

```
User: Invite @alice and @bob to #project-alpha
Ember: [Uses slack_invite_to_channel with channel="project-alpha" users="U123,U456"]
```

#### `slack_set_channel_topic`
Set a channel's topic.

```
User: Set the topic of #announcements to "Company-wide updates"
Ember: [Uses slack_set_channel_topic with channel="announcements" topic="Company-wide updates"]
```

### Search Tools

#### `slack_search_messages`
Search for messages across the workspace.

```
User: Find messages about the API migration
Ember: [Uses slack_search_messages with query="API migration"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `sort` | string | No | Sort by: score, timestamp |
| `sort_dir` | string | No | asc or desc |
| `count` | integer | No | Results per page (default: 20) |

### User Tools

#### `slack_list_users`
List users in the workspace.

```
User: Who's in this workspace?
Ember: [Uses slack_list_users]
```

#### `slack_get_user_info`
Get details about a specific user.

```
User: Tell me about @alice
Ember: [Uses slack_get_user_info with user="U1234567890"]
```

#### `slack_set_status`
Set a user's status.

```
User: Set my status to "In a meeting" with a calendar emoji
Ember: [Uses slack_set_status with status_text="In a meeting" status_emoji=":calendar:"]
```

### Interaction Tools

#### `slack_add_reaction`
Add an emoji reaction to a message.

```
User: React with thumbs up to that message
Ember: [Uses slack_add_reaction with channel="C123" timestamp="1234567890.123456" name="thumbsup"]
```

### File Tools

#### `slack_upload_file`
Upload a file to Slack.

```
User: Share this log file in #support
Ember: [Uses slack_upload_file with channels="support" content="..." filename="app.log"]
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channels` | string | Yes | Channel IDs (comma-separated) |
| `content` | string | Yes | File content |
| `filename` | string | Yes | File name |
| `filetype` | string | No | File type (python, json, etc.) |
| `title` | string | No | File title |
| `initial_comment` | string | No | Message with the file |
| `thread_ts` | string | No | Upload to a thread |

## Usage Examples

### Example 1: Deployment Notification
```
User: Notify the team that v2.1.0 has been deployed to production

Ember: I'll send a deployment notification to Slack.

[Uses slack_send_message:
  channel="#releases"
  text="🚀 *Deployment Complete*\n\n• Version: v2.1.0\n• Environment: Production\n• Status: Success\n\nSee <https://github.com/company/app/releases/tag/v2.1.0|release notes>"]

Sent deployment notification to #releases.
```

### Example 2: Rich Message with Blocks
```
User: Send a formatted status update to #engineering

Ember: I'll create a rich message using Block Kit.

[Uses slack_send_blocks:
  channel="#engineering"
  blocks=[
    {"type": "header", "text": {"type": "plain_text", "text": "📊 Daily Status Update"}},
    {"type": "section", "fields": [
      {"type": "mrkdwn", "text": "*Build Status:*\n✅ Passing"},
      {"type": "mrkdwn", "text": "*Test Coverage:*\n87.3%"}
    ]},
    {"type": "divider"},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*Open Issues:* 12 | *PRs to Review:* 5"}}
  ]]

Sent status update to #engineering.
```

### Example 3: Finding Information
```
User: Find messages about the database outage from last week

Ember: I'll search Slack for relevant messages.

[Uses slack_search_messages:
  query="database outage"
  sort="timestamp"
  count=10]

Found 8 messages about the database outage:

1. **#incidents** (Mar 10, 9:42 AM) - @ops: "Database connection pool exhausted..."
2. **#engineering** (Mar 10, 10:15 AM) - @alice: "Root cause identified..."
3. **#incidents** (Mar 10, 11:30 AM) - @bob: "Postmortem document ready..."
```

### Example 4: Team Coordination
```
User: Create a channel for the Q2 planning project and invite the product team

Ember: I'll create the channel and invite the team members.

[Uses slack_create_channel:
  name="q2-planning"
  is_private=false
  description="Q2 2026 Planning and OKR discussions"]

Created #q2-planning.

[Uses slack_invite_to_channel:
  channel="C0987654321"
  users="U111,U222,U333,U444"]

Invited 4 team members to #q2-planning.

[Uses slack_set_channel_topic:
  channel="C0987654321"
  topic="Q2 2026 Planning | OKRs due Apr 1 | Weekly sync Tuesdays"]

Set channel topic. Channel is ready for collaboration!
```

### Example 5: Code Sharing
```
User: Share this error trace in the support channel

Ember: I'll upload the error trace as a formatted file.

[Uses slack_upload_file:
  channels="support"
  content="Error: Connection refused\n  at connect (/app/db.js:42:15)\n  at Object.<anonymous>..."
  filename="error_trace.txt"
  filetype="text"
  title="Production Error - Mar 15"
  initial_comment="🔴 New error from production server"]

Uploaded error trace to #support.
```

## Search Query Syntax

The `slack_search_messages` tool supports Slack's search modifiers:

| Modifier | Example | Description |
|----------|---------|-------------|
| `from:` | `from:@alice` | Messages from a specific user |
| `in:` | `in:#general` | Messages in a specific channel |
| `to:` | `to:@me` | Direct messages to you |
| `before:` | `before:2024-03-01` | Messages before a date |
| `after:` | `after:2024-01-01` | Messages after a date |
| `during:` | `during:march` | Messages during a time period |
| `has:` | `has:link` | Messages with links/files/reactions |
| `is:` | `is:saved` | Saved items or starred |

**Combined example:**
```
from:@alice in:#engineering after:2024-03-01 has:link
```

## Slack Markdown Formatting

Messages support Slack's mrkdwn format:

| Format | Syntax | Result |
|--------|--------|--------|
| Bold | `*text*` | **text** |
| Italic | `_text_` | *text* |
| Strike | `~text~` | ~~text~~ |
| Code | `` `code` `` | `code` |
| Code Block | ` ```code``` ` | Code block |
| Link | `<url\|text>` | Hyperlink |
| User | `<@U123>` | @mention |
| Channel | `<#C123>` | #channel-link |
| Emoji | `:emoji:` | 🎉 |

## Rate Limits

Slack API has rate limits (tier-based):

| Tier | Limit | Example APIs |
|------|-------|--------------|
| Tier 1 | 1+ per minute | Most write operations |
| Tier 2 | 20+ per minute | Most read operations |
| Tier 3 | 50+ per minute | Chat posting |
| Tier 4 | 100+ per minute | Channel info |

The plugin automatically handles rate limiting with exponential backoff.

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| `not_authed` | Invalid or missing token | Check your bot token |
| `channel_not_found` | Channel doesn't exist | Verify channel name/ID |
| `not_in_channel` | Bot not in channel | Invite bot to channel |
| `is_archived` | Channel is archived | Unarchive or use different channel |
| `ratelimited` | Too many requests | Wait and retry (automatic) |

## Security Best Practices

1. **Token Security**: Never commit tokens to version control
2. **Principle of Least Privilege**: Only request necessary scopes
3. **Audit Logs**: Monitor bot activity in Slack admin
4. **Rotation**: Rotate tokens periodically
5. **Private Channels**: Be cautious with private channel access

## Changelog

### v1.0.0
- Initial release
- Send plain text and Block Kit messages
- Channel management (list, create, invite, topic)
- Message history and search
- User directory and status
- File uploads
- Emoji reactions
- Threaded conversations

## License

MIT License - see [LICENSE](LICENSE) for details.