import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { findBucket, query, AWClientError } from "../aw-client.js";
import { getLocalDateString, toISOPeriod, secondsToHours, formatTime, textResult, errorResult } from "../utils.js";

export function registerDaySummary(server: McpServer): void {
  server.tool(
    "get_day_summary",
    "Get a summary of app usage for a specific day, including top apps, active/AFK hours, and first/last active times",
    {
      date: z.string().optional().describe("ISO date (YYYY-MM-DD). Defaults to today."),
    },
    async ({ date }) => {
      try {
        const dateStr = getLocalDateString(date);
        const period = toISOPeriod(dateStr);

        const windowBucket = await findBucket("aw-watcher-window_");
        if (!windowBucket) {
          return errorResult("No window watcher data available.");
        }

        const afkBucket = await findBucket("aw-watcher-afk_");
        if (!afkBucket) {
          return errorResult("No AFK watcher data available.");
        }

        // Query aggregated app usage (active only)
        const [appResults] = await query(
          [
            `afk_events = query_bucket(find_bucket("aw-watcher-afk_"));`,
            `window_events = query_bucket(find_bucket("aw-watcher-window_"));`,
            `events = filter_period_intersect(window_events, filter_keyvals(afk_events, "status", ["not-afk"]));`,
            `events = merge_events_by_keys(events, ["app"]);`,
            `events = sort_by_duration(events);`,
            `RETURN = events;`,
          ],
          [period]
        );

        // Query AFK durations
        const [afkResults] = await query(
          [
            `afk_events = query_bucket(find_bucket("aw-watcher-afk_"));`,
            `afk_events = merge_events_by_keys(afk_events, ["status"]);`,
            `RETURN = afk_events;`,
          ],
          [period]
        );

        // Query raw window events for first/last active times
        const [rawEvents] = await query(
          [
            `afk_events = query_bucket(find_bucket("aw-watcher-afk_"));`,
            `window_events = query_bucket(find_bucket("aw-watcher-window_"));`,
            `events = filter_period_intersect(window_events, filter_keyvals(afk_events, "status", ["not-afk"]));`,
            `events = sort_by_timestamp(events);`,
            `RETURN = events;`,
          ],
          [period]
        );

        const topApps = (appResults || []).slice(0, 15).map((e) => ({
          app: e.data.app,
          hours: secondsToHours(e.duration),
        }));

        const totalActiveSeconds = (appResults || []).reduce((sum, e) => sum + e.duration, 0);

        let totalAfkSeconds = 0;
        for (const e of afkResults || []) {
          if (e.data.status === "afk") totalAfkSeconds += e.duration;
        }

        let firstActive = "";
        let lastActive = "";
        if (rawEvents && rawEvents.length > 0) {
          firstActive = formatTime(rawEvents[0]!.timestamp);
          const last = rawEvents[rawEvents.length - 1]!;
          const lastEnd = new Date(new Date(last.timestamp).getTime() + last.duration * 1000);
          lastActive = formatTime(lastEnd.toISOString());
        }

        return textResult({
          date: dateStr,
          total_active_hours: secondsToHours(totalActiveSeconds),
          total_afk_hours: secondsToHours(totalAfkSeconds),
          top_apps: topApps,
          first_active: firstActive,
          last_active: lastActive,
        });
      } catch (error) {
        if (error instanceof AWClientError) return errorResult(error.message);
        throw error;
      }
    }
  );
}
