<p align="center">
  <a href="./README.md">English</a> | <a href="./README_zh.md">中文</a>
</p>

<h1 align="center">🔍 ActivityWatch MCP Server</h1>

<p align="center">
  <strong>Let your AI companion see what you do, not just what you say.</strong>
</p>

<p align="center">
  <a href="https://github.com/JM-404/activitywatch-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Node-%3E%3D20-3C873A" alt="Node >= 20">
  <img src="https://img.shields.io/badge/MCP-stdio-f4a261" alt="MCP stdio">
  <a href="https://activitywatch.net/"><img src="https://img.shields.io/badge/ActivityWatch-compatible-7B68EE" alt="ActivityWatch"></a>
</p>

---

An MCP server that gives AI assistants **real-time awareness** of your computer activity through [ActivityWatch](https://activitywatch.net/). No raw queries. No AQL syntax. Just ask your AI *"what did I do today?"* and get a human-readable answer.

## Why this one?

There are [other ActivityWatch MCPs](https://github.com/ActivityWatch/awesome-activitywatch) out there. Here's how this one is different:

| | This project | Others |
|---|---|---|
| **Query interface** | Pre-aggregated, high-level tools | Raw AQL queries |
| **User needs to know AQL?** | No | Yes |
| **Built-in categories** | ✅ coding, browsing, communication, etc. | ❌ |
| **Ready-to-use tools** | `get_day_summary`, `get_current_activity`, etc. | `run_query(aql_string)` |
| **Designed for** | AI companions & chat interfaces | Developer debugging |

**TL;DR:** Other MCPs give your AI a database console. This one gives your AI *eyes*.

## What can your AI do with this?

Once connected, your AI companion can answer questions like:

- 🕐 *"What am I working on right now?"*
- 📊 *"How did I spend my time today?"*
- 💻 *"How many hours did I code this week?"*
- 🌙 *"What time did I stop working last night?"*
- 🔍 *"Show me everything I did between 2pm and 5pm yesterday."*
- 🌐 *"What websites did I spend the most time on?"*
- 📁 *"Which projects did I work on this week?"*
- 🏷️ *"Add Cursor to my coding category."*

Your AI knows what you *do*, not just what you *say*. It can notice patterns you miss — like when you've been coding for 5 hours straight without a break.

## Quick Start

### 1. Prerequisites

- [ActivityWatch](https://activitywatch.net/) installed and running
- Node.js >= 20

### 2. Install

```bash
git clone https://github.com/JM-404/activitywatch-mcp.git
cd activitywatch-mcp
npm install && npm run build
```

### 3. Configure

Add to your Claude Desktop / Claude Code MCP config:

```json
{
  "mcpServers": {
    "activitywatch": {
      "command": "node",
      "args": ["/absolute/path/to/activitywatch-mcp/dist/index.js"]
    }
  }
}
```

### 4. Try it

Open Claude and ask: *"What have I been doing on my computer today?"*

That's it. No AQL. No bucket IDs. Just conversation.

## Tools

### `get_current_activity`
> *"What am I doing right now?"*

Returns the currently active app, window title, duration, and AFK status.

### `get_day_summary`
> *"How did I spend my time today?"*

Top apps by usage time, total active/AFK hours, first and last active timestamps.

**Parameters:** `date` (optional, defaults to today)

### `get_category_time`
> *"How many hours did I code this week?"*

Aggregated time for a category or specific app over a date range, with daily breakdown.

**Parameters:** `category` (required), `start_date`, `end_date` (optional)

**Built-in categories:**

| Category | Apps |
|---|---|
| `coding` | VS Code, PyCharm, Terminal, iTerm2, Cursor, Warp, Xcode |
| `browsing` | Chrome, Safari, Firefox, Arc, Edge |
| `communication` | WeChat, Slack, Discord, Telegram, Messages, Zoom, Teams |
| `entertainment` | Bilibili, YouTube, Spotify, Netflix |
| `writing` | Obsidian, Notion, Typora, Word, Pages |
| `design` | Figma, Sketch, Canva, Photoshop |

Customize categories with `AW_CATEGORIES_FILE` env var pointing to your own JSON.

### `get_timeline`
> *"Walk me through my afternoon."*

Chronological list of app switches with window titles and durations.

**Parameters:** `date`, `start_time`, `end_time`, `min_duration_seconds`

### `get_browser_history`
> *"What websites did I visit today?"*

Top domains by time spent. Requires the [ActivityWatch browser extension](https://docs.activitywatch.net/en/latest/getting-started.html).

**Parameters:** `date`, `domain` (optional filter)

### `manage_categories`
> *"Add Cursor to my coding category."*

View and modify activity category mappings at runtime. Changes persist to `~/.activitywatch-mcp/categories.json`.

**Parameters:** `action` (`list` | `add` | `remove` | `update`), `category`, `apps`

### `get_project_time`
> *"Which projects did I work on this week?"*

Coding time broken down by project/repository. Extracts project names from IDE window titles (VS Code, Cursor, PyCharm, Xcode, Terminal).

**Parameters:** `start_date`, `end_date` (optional)

### Natural language dates

All date parameters accept natural language in addition to `YYYY-MM-DD`:

`today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, `last_7_days`, `last_30_days`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `AW_HOST` | `http://localhost:5600` | ActivityWatch API address |
| `AW_TITLE_MAX_LENGTH` | `80` | Truncate window titles for privacy |
| `AW_CATEGORIES_FILE` | built-in | Path to custom category mapping JSON |

## Privacy

🔒 **Your data never leaves your machine.**

- ActivityWatch stores everything locally
- This MCP server runs locally
- Data flows: `ActivityWatch (local) → MCP Server (local) → Your AI conversation`
- Window titles are truncated to prevent accidental exposure of sensitive content
- No telemetry, no external API calls, no cloud storage

## Roadmap

- [ ] macOS Screen Time integration (iPhone + Mac data from `knowledgeC.db`)
- [ ] Auto-generated daily/weekly reports
- [ ] Proactive alerts (e.g., "You've been coding for 4 hours — take a break")
- [ ] Productivity scoring and trend analysis
- [ ] SSE transport for remote access

## Contributing

PRs and issues welcome. If you have ideas for new tools or categories, open an issue.

## License

MIT

---

<p align="center">
  Built with ❤️ for the AI companion community.<br>
  <em>Because your AI should know you, not just answer you.</em>
</p>
