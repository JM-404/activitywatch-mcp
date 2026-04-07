#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCurrentActivity } from "./tools/current-activity.js";
import { registerDaySummary } from "./tools/day-summary.js";
import { registerCategoryTime } from "./tools/category-time.js";
import { registerTimeline } from "./tools/timeline.js";
import { registerBrowserHistory } from "./tools/browser-history.js";
import { registerManageCategories } from "./tools/manage-categories.js";
import { registerProjectTime } from "./tools/project-time.js";

const server = new McpServer({
  name: "activitywatch-mcp",
  version: "1.1.0",
});

// Register all tools
registerCurrentActivity(server);
registerDaySummary(server);
registerCategoryTime(server);
registerTimeline(server);
registerBrowserHistory(server);
registerManageCategories(server);
registerProjectTime(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ActivityWatch MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
