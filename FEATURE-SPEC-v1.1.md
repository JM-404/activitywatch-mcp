# ActivityWatch MCP v1.1 Feature Spec

## 你是一个 TypeScript MCP server 开发者。请在现有 activitywatch-mcp 项目基础上实现以下三个功能。

## 功能1：自然语言时间段支持

在所有接受 date/start_date/end_date 参数的 tool 中，增加对自然语言时间段的支持。

### 需要支持的表达式：
- `today`, `yesterday`
- `this_week`, `last_week`
- `this_month`, `last_month`
- `last_7_days`, `last_30_days`
- 具体日期仍然支持 `YYYY-MM-DD` 格式

### 实现方式：
- 新建 `src/time-parser.ts`
- 导出函数 `parseTimeRange(input: string): { start: string, end: string }` 返回 ISO 日期
- 周一算一周的开始
- 在每个 tool 的参数处理阶段调用此函数，兼容旧格式

### 修改的 tools：
- `get_day_summary`: `date` 参数支持 `today`, `yesterday`
- `get_category_time`: `start_date` 和 `end_date` 支持所有表达式
- `get_timeline`: `date` 参数支持 `today`, `yesterday`
- `get_browser_history`: `date` 参数支持 `today`, `yesterday`

---

## 功能2：Category 管理 tool

新增一个 `manage_categories` tool，让 AI 可以查看和修改 category 分类映射。

### Tool: `manage_categories`

**参数：**
- `action` (required): `"list"` | `"add"` | `"remove"` | `"update"`
- `category` (optional): 分类名称
- `apps` (optional): string[]，要添加/设置的 app 列表

**行为：**
- `list`: 返回当前所有分类及其包含的 app 列表
- `add`: 新增一个分类，或向已有分类添加 app
  - 如果 category 已存在，将 apps 追加（去重）
  - 如果 category 不存在，创建新分类
- `remove`: 从指定分类中删除指定 app，或删除整个分类（apps 为空时）
- `update`: 覆盖替换指定分类的 app 列表

**持久化：**
- 修改后写入 `~/.activitywatch-mcp/categories.json`
- 启动时优先读取此文件，如果不存在则用内置默认分类
- 文件格式：`{ "coding": ["VS Code", "PyCharm", ...], "browsing": [...] }`

**示例交互：**
- "把 Cursor 加到 coding 分类里" → `manage_categories({ action: "add", category: "coding", apps: ["Cursor"] })`
- "新建一个 research 分类，包含 Zotero 和 Google Scholar" → `manage_categories({ action: "add", category: "research", apps: ["Zotero", "Google Scholar"] })`
- "看看现在有哪些分类" → `manage_categories({ action: "list" })`

---

## 功能3：按项目/文件夹拆分工作时间

新增 `get_project_time` tool，通过解析窗口标题中的项目/文件夹信息来统计每个项目的工作时长。

### Tool: `get_project_time`

**参数：**
- `start_date` (optional): 开始日期，支持自然语言
- `end_date` (optional): 结束日期，支持自然语言

**实现逻辑：**

1. 获取时间范围内所有 window 事件
2. 过滤出 coding 类 app 的事件（VS Code, PyCharm, Terminal, Cursor 等）
3. 从窗口标题中提取项目名：
   - **VS Code / Cursor**: 标题格式通常是 `filename — project_name`，提取 `—` 后面的部分
   - **PyCharm / JetBrains**: 标题格式通常是 `project_name – filename`，提取 `–` 前面的部分
   - **Terminal / iTerm2**: 解析 `pwd` 或路径中的最后一级目录名；如果标题包含路径如 `~/Projects/my-app`，提取 `my-app`
   - **Xcode**: 标题格式 `project_name — Xcode`，提取 `—` 前面的部分
4. 无法识别项目名的事件归入 `"unknown"` 类别
5. 按项目名聚合 duration

**返回格式：**
```json
{
  "period": "2026-04-01 to 2026-04-07",
  "projects": [
    {
      "name": "activitywatch-mcp",
      "hours": 3.2,
      "apps": ["Visual Studio Code", "Terminal"],
      "last_active": "2026-04-07"
    },
    {
      "name": "prism-pipeline",
      "hours": 8.5,
      "apps": ["PyCharm", "Terminal"],
      "last_active": "2026-04-06"
    },
    {
      "name": "fox-on-desk",
      "hours": 1.1,
      "apps": ["Visual Studio Code"],
      "last_active": "2026-04-05"
    }
  ],
  "unknown_hours": 2.3,
  "total_coding_hours": 15.1
}
```

**注意：**
- 窗口标题的分隔符因 app 而异（`—`, `–`, `-`, `:`），需要按 app 类型分别处理
- Terminal 的项目识别准确率会比 IDE 低，可接受
- 结果按 hours 降序排列

---

## 通用要求

- 写完后跑 `npm run build` 确认编译通过
- 新 tool 在 `src/index.ts` 中注册
- 每个 tool 的 description 写清楚，这样 Claude 能自动选择调用
- 错误处理：参数不合法时返回友好提示，不要 throw
- 更新 README.md 的 Tools 部分，加入新的三个 tool 的文档
