const TITLE_MAX_LENGTH = parseInt(process.env.AW_TITLE_MAX_LENGTH || "80", 10);

export function truncateTitle(title: string, maxLen: number = TITLE_MAX_LENGTH): string {
  if (!title || title.length <= maxLen) return title;
  return title.slice(0, maxLen - 3) + "...";
}

export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10;
}

export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function getLocalDateString(date?: string): string {
  if (date) return date;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function toISOPeriod(dateStr: string): string {
  // Get local timezone offset in ±HH:MM format
  const offset = new Date().getTimezoneOffset();
  const sign = offset <= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const mins = String(absOffset % 60).padStart(2, "0");
  const tz = `${sign}${hours}:${mins}`;

  const start = `${dateStr}T00:00:00${tz}`;
  // Next day
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const nextDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const end = `${nextDate}T00:00:00${tz}`;

  return `${start}/${end}`;
}

export function toDateRangePeriods(startDate: string, endDate: string): string[] {
  const periods: string[] = [];
  const current = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  while (current <= end) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    periods.push(toISOPeriod(dateStr));
    current.setDate(current.getDate() + 1);
  }

  return periods;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function textResult(data: unknown): { content: [{ type: "text"; text: string }] } {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(message: string): { content: [{ type: "text"; text: string }]; isError: true } {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}
