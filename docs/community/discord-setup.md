# Discord Server Setup Guide

This guide provides instructions for setting up and managing the Ember Discord server.

---

## Server Structure

### Categories and Channels

#### 📢 Information
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#welcome` | Welcome message, rules, and getting started | Read-only |
| `#announcements` | Official announcements and updates | Read-only |
| `#rules` | Community guidelines and Code of Conduct | Read-only |
| `#roles` | Self-assignable roles via reactions | Read-only |

#### 💬 Community
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#general` | General chat about Ember | Everyone |
| `#introductions` | New member introductions | Everyone |
| `#off-topic` | Non-Ember discussions | Everyone |
| `#memes` | Fun and memes | Everyone |

#### 🆘 Support
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#help` | Get help with Ember issues | Everyone |
| `#troubleshooting` | Debug problems together | Everyone |
| `#installation` | Installation help | Everyone |
| `#providers` | LLM provider questions | Everyone |

#### 💻 Development
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#development` | Development discussions | Everyone |
| `#contributions` | Discuss PRs and contributions | Everyone |
| `#plugins` | Plugin development | Everyone |
| `#api-design` | API and architecture discussions | Everyone |

#### 🎨 Showcase
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#showcase` | Share your Ember projects | Everyone |
| `#plugins-showcase` | Share your plugins | Everyone |
| `#feedback` | Give feedback on showcased projects | Everyone |

#### 🔧 Maintainers (Private)
| Channel | Purpose | Permissions |
|---------|---------|-------------|
| `#maintainer-chat` | Maintainer discussions | Maintainers+ |
| `#moderation` | Moderation discussions | Moderators+ |
| `#releases` | Release planning | Maintainers+ |
| `#triage` | Issue triage | Maintainers+ |

---

## Roles

### Role Hierarchy

```
🔥 Admin
├── 🛡️ Moderator
├── 🔧 Maintainer
├── 💎 Core Contributor
├── 🌟 Contributor
├── 📚 Documentation
├── 🔌 Plugin Developer
├── 🎨 Designer
└── 👋 Member
```

### Role Descriptions

| Role | Description | Color |
|------|-------------|-------|
| Admin | Full server access | Red |
| Moderator | Moderation powers | Orange |
| Maintainer | Core maintainers | Purple |
| Core Contributor | Major contributors | Blue |
| Contributor | Has contributed code | Green |
| Documentation | Documentation contributors | Teal |
| Plugin Developer | Plugin creators | Yellow |
| Designer | UI/UX contributors | Pink |
| Member | Default role | Gray |

### Self-Assignable Roles

Users can assign these via reaction roles in `#roles`:

| Role | Description | Emoji |
|------|-------------|-------|
| Looking for Help | Get pinged for help requests | ❓ |
| Announcements | Get pinged for announcements | 📢 |
| Beta Tester | Test pre-release versions | 🧪 |
| Windows | Windows user | 🪟 |
| macOS | macOS user | 🍎 |
| Linux | Linux user | 🐧 |

---

## Bots

### Required Bots

#### 1. MEE6 or Carl-bot
- Welcome messages
- Reaction roles
- Moderation
- Level system

#### 2. GitHub Bot
- PR/Issue notifications
- Release announcements
- Commit updates

Configuration:
```
Repository: niklasmarderx/ember
Channels:
  - #announcements: releases
  - #development: PRs, issues
  - #contributions: PRs
```

#### 3. DiscordSRV (Optional)
- Link Discord to GitHub accounts
- Contributor verification

---

## Welcome Message

Paste in `#welcome`:

```
# 🔥 Welcome to Ember!

Ember is an open-source AI agent framework written in Rust.

## Quick Links
📚 **Documentation**: https://docs.ember.dev
💻 **GitHub**: https://github.com/niklasmarderx/ember
🗺️ **Roadmap**: https://github.com/niklasmarderx/ember/blob/main/ROADMAP.md

## Getting Started
1. Read the #rules
2. Introduce yourself in #introductions
3. Pick your roles in #roles
4. Ask questions in #help or chat in #general

## Support
- **Questions**: #help
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions

Happy chatting! 🎉
```

---

## Rules

Paste in `#rules`:

```
# 📜 Community Rules

1. **Be Respectful**
   Treat everyone with respect. No harassment, discrimination, or personal attacks.

2. **No Spam**
   Avoid excessive messages, self-promotion, or advertising without permission.

3. **Stay On Topic**
   Use channels for their intended purpose. Off-topic chat goes in #off-topic.

4. **No NSFW**
   Keep content appropriate for all ages.

5. **English Only**
   Please communicate in English so everyone can participate.

6. **No Illegal Content**
   Don't share pirated software, exploits, or illegal material.

7. **Respect Privacy**
   Don't share personal information about yourself or others.

8. **Follow Discord ToS**
   Follow Discord's Terms of Service and Community Guidelines.

9. **Listen to Moderators**
   Moderator decisions are final. Appeal via DM if needed.

10. **Have Fun!**
    We're here to build great things together. Enjoy!

**Violations may result in warnings, mutes, kicks, or bans.**

By staying in this server, you agree to follow these rules.
```

---

## Moderation Guidelines

### Warning System

1. **First offense**: Verbal warning
2. **Second offense**: Written warning (logged)
3. **Third offense**: 24-hour mute
4. **Fourth offense**: 7-day ban
5. **Fifth offense**: Permanent ban

*Severe violations may skip steps.*

### Ban-worthy Offenses (Immediate)
- Hate speech
- Doxxing
- NSFW content
- Spam bots
- Malicious links/files

### Logging
Log all moderation actions in `#moderation`:
```
**Action**: Warning/Mute/Ban
**User**: @username (ID: 123456789)
**Reason**: [Description]
**Duration**: [If applicable]
**Moderator**: @moderator
**Date**: YYYY-MM-DD
```

---

## Integration with GitHub

### Webhook Setup

1. Go to GitHub repo → Settings → Webhooks
2. Add webhook:
   - URL: Discord webhook URL
   - Content type: `application/json`
   - Events: Releases, Issues, Pull Requests

### Bot Commands

If using a GitHub bot:
```
!github status     - Show repo status
!github pr list    - List open PRs
!github issue #123 - Show issue details
```

---

## Announcement Templates

### Release Announcement
```
🚀 **Ember v1.1.0 Released!**

We're excited to announce the release of Ember v1.1.0!

**Highlights:**
• Feature 1
• Feature 2
• Bug fixes

📦 **Install/Update:**
```bash
cargo install ember-cli --force
```

📝 **Changelog:** https://github.com/niklasmarderx/ember/releases/tag/v1.1.0

Thank you to all contributors! 🎉
```

### Event Announcement
```
📅 **Community Event: Office Hours**

Join us for our weekly community call!

**When:** Saturday, March 20, 2:00 PM UTC
**Where:** Voice Channel #office-hours

**Agenda:**
• Q&A with maintainers
• Feature preview
• Community showcase

See you there! 👋
```

---

## Server Settings Checklist

- [ ] Verification level: Medium
- [ ] Default notifications: Only @mentions
- [ ] Explicit media content filter: Enabled
- [ ] 2FA required for moderators
- [ ] Slowmode on busy channels (5-10 sec)
- [ ] Server boost perks configured
- [ ] Vanity URL claimed (if Level 3)
- [ ] Server discovery enabled (if eligible)

---

## Metrics to Track

### Monthly KPIs
- New members
- Active members (7-day)
- Messages per channel
- Help requests resolved
- Support satisfaction

### Health Indicators
- Response time in #help
- Moderator activity
- Bot uptime
- Engagement rate

---

*Last updated: March 2026*