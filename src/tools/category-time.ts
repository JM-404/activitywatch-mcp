import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { query, AWClientError } from "../aw-client.js";
import { getAppsForCategory, getCategories } from "../categories.js";
import { getLocalDateString, toISOPeriod, toDateRangePeriods, daysAgo, secondsToHours, textResult, errorResult } from "../utils.js";

export function registerCategoryTime(server: McpServer): void {
  server.tool(
    "get_category_time",
    "Query total usage time for an activity category (coding, browsing, communication, entertainment, writing, design) or a specific app name, over a date range",
    {
      category: z.string().describe(
        `Activity category or app name. Built-in categories: ${Object.keys(getCategories()).join(", ")}. Or use any app name directly.`
      ),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD). Defaults to 7 days ago."),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD). Defaults to today."),
    },
    async ({ category, start_date, end_date }) => {
      try {
        const startStr = start_date || daysAgo(7);
        const endStr = getLocalDateString(end_date);

        // Determine which apps to filter
        const categoryApps = getAppsForCategory(category);
        const isCustomApp = categoryApps === null;
        const apps = isCustomApp ? [category] : categoryApps;

        const periods = toDateRangePeriods(startStr, endStr);

        // Build app filter string for AW query
        const appListStr = apps.map((a) => `"${a}"`).join(", ");

        const results = await query(
          [
            `afk_events = query_bucket(find_bucket("aw-watcher-afk_"));`,
            `window_events = query_bucket(find_bucket("aw-watcher-window_"));`,
            `events = filter_period_intersect(window_events, filter_keyvals(afk_events, "status", ["not-afk"]));`,
            `events = filter_keyvals(events, "app", [${appListStr}]);`,
            `events = merge_events_by_keys(events, ["app"]);`,
            `events = sort_by_duration(events);`,
            `RETURN = events;`,
          ],
          periods
        );

        let totalSeconds = 0;
        const dailyBreakdown: { date: string; hours: number }[] = [];
        const appTotals: Record<string, number> = {};

        for (let i = 0; i < periods.length; i++) {
          const dayEvents = results[i] || [];
          let dayTotal = 0;
          for (const e of dayEvents) {
            dayTotal += e.duration;
            appTotals[e.data.app] = (appTotals[e.data.app] || 0) + e.duration;
          }
          totalSeconds += dayTotal;

          // Extract date from period string
          const dateMatch = periods[i]!.match(/^(\d{4}-\d{2}-\d{2})/);
          dailyBreakdown.push({
            date: dateMatch ? dateMatch[1]! : `day-${i}`,
            hours: secondsToHours(dayTotal),
          });
        }

        const appsDetail = Object.entries(appTotals)
          .map(([app, seconds]) => ({ app, hours: secondsToHours(seconds) }))
          .sort((a, b) => b.hours - a.hours);

        return textResult({
          category: isCustomApp ? `app:${category}` : category,
          period: `${startStr} to ${endStr}`,
          total_hours: secondsToHours(totalSeconds),
          daily_breakdown: dailyBreakdown,
          apps_detail: appsDetail,
        });
      } catch (error) {
        if (error instanceof AWClientError) return errorResult(error.message);
        throw error;
      }
    }
  );
}
