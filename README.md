# ActivityWatch MCP Server

An MCP (Model Context Protocol) server that bridges [ActivityWatch](https://activitywatch.net/) to AI companions like Claude, letting your AI see what you do on your computer.

**Let your AI companion see what you do, not just what you say.**

## Prerequisites

- [ActivityWatch](https://activitywatch.net/) installed and running
- Node.js >= 20

## Installation

```bash
git clone https://github.com/jm/activitywatch-mcp.git
cd activitywatch-mcp
npm install && npm run build
```

## Configuration

Add to your Claude Desktop / Claude Code MCP config:

```json
{
  "mcpServers": {
    "activitywatch": {
      "command": "node",
      "args": ["/path/to/activitywatch-mcp/dist/index.js"],
      "env": {
        "AW_HOST": "http://localhost:5600"
      }
    }
  }
}
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `AW_HOST` | `http://localhost:5600` | ActivityWatch API address |
| `AW_TITLE_MAX_LENGTH` | `80` | Max window title length (privacy) |
| `AW_CATEGORIES_FILE` | built-in defaults | Path to custom category mappings JSON |

## Tools

### `get_current_activity`

Returns the currently active app, window title, and AFK status.

**Example response:**
```json
{
  "app": "Visual Studio Code",
  "title": "activitywatch-mcp -- index.ts",
  "duration_seconds": 1823,
  "is_afk": false
}
```

### `get_day_summary`

Summarizes app usage for a given day with top apps, active/AFK hours, and first/last active times.

**Parameters:** `date` (optional, YYYY-MM-DD)

### `get_category_time`

Queries usage time for a category or app over a date range.

**Parameters:**
- `category` (required) - One of: `coding`, `browsing`, `communication`, `entertainment`, `writing`, `design`, or any app name
- `start_date` / `end_date` (optional, YYYY-MM-DD)

**Built-in categories:**
- **coding**: VS Code, PyCharm, Terminal, iTerm2, Cursor, Warp, Xcode
- **browsing**: Chrome, Safari, Firefox, Arc, Edge
- **communication**: WeChat, Slack, Discord, Telegram, Messages, Mail, Zoom, Teams
- **entertainment**: Bilibili, YouTube, Spotify, Music, Netflix
- **writing**: Obsidian, Notion, Typora, Word, Pages, Bear
- **design**: Figma, Sketch, Canva, Photoshop, Illustrator

Customize by setting `AW_CATEGORIES_FILE` to a JSON file path.

### `get_timeline`

Returns a chronological timeline of app usage with window titles.

**Parameters:** `date`, `start_time` (HH:MM), `end_time` (HH:MM), `min_duration_seconds` (default 60)

### `get_browser_history`

Shows top visited domains (requires [AW browser extension](https://docs.activitywatch.net/en/latest/getting-started.html)).

**Parameters:** `date`, `domain` (filter)

## Privacy

- All data stays local (ActivityWatch local -> MCP server local -> your Claude conversation)
- Window titles are truncated to prevent sensitive content leakage
- No data is sent to external servers
- Customize `AW_TITLE_MAX_LENGTH` to control title exposure

## License

MIT
