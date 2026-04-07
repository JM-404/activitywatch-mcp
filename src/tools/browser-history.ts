import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { findBucket, query, listBuckets, AWClientError } from "../aw-client.js";
import { toISOPeriod, textResult, errorResult } from "../utils.js";
import { parseSingleDate } from "../time-parser.js";

export function registerBrowserHistory(server: McpServer): void {
  server.tool(
    "get_browser_history",
    "Get browser browsing history with top domains visited. Requires the ActivityWatch browser extension to be installed.",
    {
      date: z.string().optional().describe("Date: YYYY-MM-DD or natural language (today, yesterday). Defaults to today."),
      domain: z.string().optional().describe("Filter by specific domain (e.g., 'github.com')."),
    },
    async ({ date, domain }) => {
      try {
        // Find browser watcher bucket
        const buckets = await listBuckets();
        const browserBucketId = Object.keys(buckets).find(
          (id) => id.startsWith("aw-watcher-web-")
        );

        if (!browserBucketId) {
          return textResult({
            message: "Browser watcher not installed. Install the ActivityWatch browser extension (aw-watcher-web) for browser tracking.",
            install_url: "https://docs.activitywatch.net/en/latest/getting-started.html",
          });
        }

        const dateStr = parseSingleDate(date);
        const period = toISOPeriod(dateStr);

        // Query browser events, aggregate by domain (url field)
        const [results] = await query(
          [
            `events = query_bucket("${browserBucketId}");`,
            `events = merge_events_by_keys(events, ["$domain"]);`,
            `events = sort_by_duration(events);`,
            `RETURN = events;`,
          ],
          [period]
        );

        if (!results || results.length === 0) {
          return textResult({ date: dateStr, top_domains: [], message: "No browser data for this date." });
        }

        let domains = results.map((e) => ({
          domain: e.data["$domain"] || e.data.url || "unknown",
          minutes: Math.round(e.duration / 60),
        }));

        if (domain) {
          domains = domains.filter((d) => d.domain.includes(domain));
        }

        return textResult({
          date: dateStr,
          top_domains: domains.slice(0, 20),
        });
      } catch (error) {
        if (error instanceof AWClientError) return errorResult(error.message);
        throw error;
      }
    }
  );
}
