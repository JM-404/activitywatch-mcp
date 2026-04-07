import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { findBucket, getEvents, AWClientError } from "../aw-client.js";
import { truncateTitle, textResult, errorResult } from "../utils.js";

export function registerCurrentActivity(server: McpServer): void {
  server.tool(
    "get_current_activity",
    "Get the user's current active application and window title",
    {},
    async () => {
      try {
        const windowBucket = await findBucket("aw-watcher-window_");
        if (!windowBucket) {
          return errorResult("No window watcher data available. Is ActivityWatch running with aw-watcher-window?");
        }

        const afkBucket = await findBucket("aw-watcher-afk_");

        const [windowEvents, afkEvents] = await Promise.all([
          getEvents(windowBucket, { limit: 1 }),
          afkBucket ? getEvents(afkBucket, { limit: 1 }) : Promise.resolve([]),
        ]);

        if (windowEvents.length === 0) {
          return textResult({ message: "No recent activity data." });
        }

        const latest = windowEvents[0]!;
        const isAfk = afkEvents.length > 0 ? afkEvents[0]!.data.status === "afk" : false;

        return textResult({
          app: latest.data.app,
          title: truncateTitle(latest.data.title),
          duration_seconds: Math.round(latest.duration),
          is_afk: isAfk,
        });
      } catch (error) {
        if (error instanceof AWClientError) return errorResult(error.message);
        throw error;
      }
    }
  );
}
