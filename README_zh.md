<p align="center">
  <a href="./README.md">English</a> | <a href="./README_zh.md">中文</a>
</p>

<h1 align="center">🔍 ActivityWatch MCP Server</h1>

<p align="center">
  <strong>让你的 AI 助手看到你在做什么，而不只是听你说什么。</strong>
</p>

<p align="center">
  <a href="https://github.com/JM-404/activitywatch-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Node-%3E%3D20-3C873A" alt="Node >= 20">
  <img src="https://img.shields.io/badge/MCP-stdio-f4a261" alt="MCP stdio">
  <a href="https://activitywatch.net/"><img src="https://img.shields.io/badge/ActivityWatch-compatible-7B68EE" alt="ActivityWatch"></a>
</p>

---

一个 MCP 服务器，通过 [ActivityWatch](https://activitywatch.net/) 让 AI 助手**实时感知**你的电脑使用行为。不需要写查询语句，不需要了解 AQL 语法，直接问 AI「我今天都干了啥？」就能得到答案。

## 为什么选这个？

市面上已有[其他 ActivityWatch MCP](https://github.com/ActivityWatch/awesome-activitywatch)，但这个不一样：

| | 本项目 | 其他项目 |
|---|---|---|
| **查询方式** | 预聚合的高级工具 | 原始 AQL 查询 |
| **用户需要会 AQL？** | 不需要 | 需要 |
| **内置活动分类** | ✅ 编程、浏览、通讯等 | ❌ |
| **开箱即用** | `get_day_summary`、`get_current_activity` 等 | `run_query(aql_string)` |
| **面向** | AI 助手和对话界面 | 开发者调试 |

**一句话总结：** 其他 MCP 给你的 AI 一个数据库控制台，这个给你的 AI 一双*眼睛*。

## AI 能帮你做什么？

连接后，你的 AI 助手可以回答这些问题：

- 🕐 *「我现在在干什么？」*
- 📊 *「我今天的时间都花在哪了？」*
- 💻 *「这周我写了多少小时代码？」*
- 🌙 *「我昨晚几点停止工作的？」*
- 🔍 *「给我看看昨天下午 2 点到 5 点都做了什么。」*
- 🌐 *「我在哪些网站上花的时间最多？」*
- 📁 *「这周我做了哪些项目？」*
- 🏷️ *「把 Cursor 加到编程分类里。」*

你的 AI 知道你*做了什么*，而不只是你*说了什么*。它能发现你自己忽略的规律——比如你已经连续写了 5 个小时代码还没休息。

## 快速开始

### 1. 前置要求

- 安装并运行 [ActivityWatch](https://activitywatch.net/)
- Node.js >= 20

### 2. 安装

```bash
git clone https://github.com/JM-404/activitywatch-mcp.git
cd activitywatch-mcp
npm install && npm run build
```

### 3. 配置

添加到你的 Claude Desktop / Claude Code MCP 配置中：

```json
{
  "mcpServers": {
    "activitywatch": {
      "command": "node",
      "args": ["/你的绝对路径/activitywatch-mcp/dist/index.js"]
    }
  }
}
```

### 4. 试试看

打开 Claude，问：*「我今天在电脑上都做了什么？」*

就这么简单。不需要 AQL，不需要 bucket ID，只需要对话。

## 工具列表

### `get_current_activity`
> *「我现在在干什么？」*

返回当前活跃的应用、窗口标题、持续时间和 AFK 状态。

### `get_day_summary`
> *「我今天的时间花在哪了？」*

按使用时间排序的 Top 应用、总活跃/离开时间、首次和最后活跃时间。

**参数：** `date`（可选，默认今天）

### `get_category_time`
> *「这周我写了多少小时代码？」*

查询某个分类或特定应用在时间范围内的使用时长，含每日明细。

**参数：** `category`（必填），`start_date`、`end_date`（可选）

**内置分类：**

| 分类 | 应用 |
|---|---|
| `coding` | VS Code, PyCharm, Terminal, iTerm2, Cursor, Warp, Xcode |
| `browsing` | Chrome, Safari, Firefox, Arc, Edge |
| `communication` | WeChat, Slack, Discord, Telegram, Messages, Zoom, Teams |
| `entertainment` | Bilibili, YouTube, Spotify, Netflix |
| `writing` | Obsidian, Notion, Typora, Word, Pages |
| `design` | Figma, Sketch, Canva, Photoshop |

通过 `AW_CATEGORIES_FILE` 环境变量指向自定义 JSON 文件来定制分类。

### `get_timeline`
> *「带我回顾一下今天下午。」*

按时间顺序展示应用切换记录，包含窗口标题和持续时间。

**参数：** `date`、`start_time`、`end_time`、`min_duration_seconds`

### `get_browser_history`
> *「我今天访问了哪些网站？」*

按时间排序的热门域名。需要安装 [ActivityWatch 浏览器扩展](https://docs.activitywatch.net/en/latest/getting-started.html)。

**参数：** `date`、`domain`（可选过滤）

### `manage_categories`
> *「把 Cursor 加到编程分类里。」*

运行时查看和修改活动分类映射。更改持久化到 `~/.activitywatch-mcp/categories.json`。

**参数：** `action`（`list` | `add` | `remove` | `update`），`category`，`apps`

### `get_project_time`
> *「这周我做了哪些项目？」*

按项目/仓库拆分编程时间。通过解析 IDE 窗口标题提取项目名（VS Code、Cursor、PyCharm、Xcode、Terminal）。

**参数：** `start_date`、`end_date`（可选）

### 自然语言日期

所有日期参数除了支持 `YYYY-MM-DD` 格式外，还支持自然语言：

`today`、`yesterday`、`this_week`、`last_week`、`this_month`、`last_month`、`last_7_days`、`last_30_days`

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `AW_HOST` | `http://localhost:5600` | ActivityWatch API 地址 |
| `AW_TITLE_MAX_LENGTH` | `80` | 窗口标题最大长度（隐私保护） |
| `AW_CATEGORIES_FILE` | 内置默认 | 自定义分类映射 JSON 文件路径 |

## 隐私

🔒 **你的数据永远不会离开你的电脑。**

- ActivityWatch 所有数据存储在本地
- 本 MCP 服务器在本地运行
- 数据流向：`ActivityWatch（本地）→ MCP Server（本地）→ 你的 AI 对话`
- 窗口标题会被截断，防止敏感内容泄露
- 无遥测、无外部 API 调用、无云存储

## 路线图

- [ ] macOS 屏幕使用时间集成（通过 `knowledgeC.db` 获取 iPhone + Mac 数据）
- [ ] 自动生成日报/周报
- [ ] 主动提醒（如「你已经连续写了 4 小时代码——该休息了」）
- [ ] 生产力评分和趋势分析
- [ ] SSE transport 支持远程访问

## 贡献

欢迎 PR 和 Issue。如果你有新工具或分类的想法，请开 Issue。

## 许可证

MIT

---

<p align="center">
  为 AI 伴侣社区而生 ❤️<br>
  <em>因为你的 AI 应该了解你，而不只是回答你。</em>
</p>
