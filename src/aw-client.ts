const AW_HOST = process.env.AW_HOST || "http://localhost:5600";
const API_BASE = `${AW_HOST}/api/0`;

export interface AWEvent {
  id: number | null;
  timestamp: string;
  duration: number;
  data: Record<string, string>;
}

export interface AWBucket {
  id: string;
  type: string;
  hostname: string;
  created: string;
}

class AWClientError extends Error {
  constructor(message: string, public readonly isConnectionError: boolean = false) {
    super(message);
    this.name = "AWClientError";
  }
}

async function awFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new AWClientError(`ActivityWatch API error: ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (error instanceof AWClientError) throw error;
    throw new AWClientError(
      "ActivityWatch is not running. Please start it first.",
      true
    );
  }
}

export async function listBuckets(): Promise<Record<string, AWBucket>> {
  const response = await awFetch("/buckets/");
  return response.json();
}

export async function findBucket(prefix: string): Promise<string | null> {
  const buckets = await listBuckets();
  const match = Object.keys(buckets).find((id) => id.startsWith(prefix));
  return match ?? null;
}

export async function getEvents(
  bucketId: string,
  params: { limit?: number; start?: string; end?: string } = {}
): Promise<AWEvent[]> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params.start) searchParams.set("start", params.start);
  if (params.end) searchParams.set("end", params.end);

  const qs = searchParams.toString();
  const path = `/buckets/${encodeURIComponent(bucketId)}/events${qs ? `?${qs}` : ""}`;
  const response = await awFetch(path);
  return response.json();
}

export async function query(queries: string[], timeperiods: string[]): Promise<AWEvent[][]> {
  const response = await awFetch("/query/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queries, timeperiods }),
  });
  return response.json();
}

export { AWClientError };
