import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { query, AWClientError } from "../aw-client.js";
import { toISOPeriod, truncateTitle, formatTime, textResult, errorResult } from "../utils.js";
import { parseSingleDate } from "../time-parser.js";

export function registerTimeline(server: McpServer): void {
  server.tool(
    "get_timeline",
    "Get a detailed activity timeline for a specific day, showing what apps and windows were used chronologically",
    {
      date: z.string().optional().describe("Date: YYYY-MM-DD or natural language (today, yesterday). Defaults to today."),
      start_time: z.string().optional().describe("Start time filter (HH:MM). Defaults to 00:00."),
      end_time: z.string().optional().describe("End time filter (HH:MM). Defaults to 23:59."),
      min_duration_seconds: z.number().optional().describe("Minimum event duration in seconds. Defaults to 60."),
    },
    async ({ date, start_time, end_time, min_duration_seconds }) => {
      try {
        const dateStr = parseSingleDate(date);
        const period = toISOPeriod(dateStr);
        const minDuration = min_duration_seconds ?? 60;

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

        if (!rawEvents || rawEvents.length === 0) {
          return textResult({ date: dateStr, events: [] });
        }

        // Merge consecutive events with same app+title
        const merged: Array<{ app: string; title: string; start: Date; end: Date }> = [];
        for (const e of rawEvents) {
          const start = new Date(e.timestamp);
          const end = new Date(start.getTime() + e.duration * 1000);
          const app = e.data.app;
          const title = e.data.title || "";

          const last = merged[merged.length - 1];
          if (last && last.app === app && last.title === title) {
            last.end = end;
          } else {
            merged.push({ app, title, start, end });
          }
        }

        // Filter by duration and time range
        const startFilter = start_time || "00:00";
        const endFilter = end_time || "23:59";

        const events = merged
          .filter((e) => {
            const durationSec = (e.end.getTime() - e.start.getTime()) / 1000;
            if (durationSec < minDuration) return false;

            const eventTime = formatTime(e.start.toISOString());
            return eventTime >= startFilter && eventTime <= endFilter;
          })
          .map((e) => ({
            start: formatTime(e.start.toISOString()),
            end: formatTime(e.end.toISOString()),
            app: e.app,
            title: truncateTitle(e.title),
            minutes: Math.round((e.end.getTime() - e.start.getTime()) / 60000),
          }));

        return textResult({ date: dateStr, events });
      } catch (error) {
        if (error instanceof AWClientError) return errorResult(error.message);
        throw error;
      }
    }
  );
}
