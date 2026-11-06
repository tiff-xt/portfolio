import { type Env, hasDB } from "./env";
import { getSql } from "./db/client";

export type Limit = { ok: true; remaining: number } | { ok: false; retryAfter: number };

const WINDOW_S = 10 * 60;
const MAX = 20;
const memory = new Map<string, { start: number; count: number }>();

/** Hash IPs so raw addresses are never stored. */
export async function clientKey(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("base64url").slice(0, 22);
}

/**
 * Fixed-window limiter. Postgres in production (shared across serverless
 * instances, one atomic upsert), in-memory locally.
 */
export async function rateLimit(env: Env, key: string, now = Date.now()): Promise<Limit> {
  const windowStart = Math.floor(now / 1000 / WINDOW_S) * WINDOW_S;
  const retryAfter = windowStart + WINDOW_S - Math.floor(now / 1000);

  if (hasDB(env)) {
    try {
      const [row] = (await getSql(env.DATABASE_URL!)`
        insert into rate_limits (key, window_start, count)
        values (${key}, to_timestamp(${windowStart}), 1)
        on conflict (key, window_start) do update set count = rate_limits.count + 1
        returning count
      `) as { count: number }[];
      return row.count > MAX ? { ok: false, retryAfter } : { ok: true, remaining: MAX - row.count };
    } catch (err) {
      console.error("[ratelimit] db unavailable, using memory", err);
    }
  }

  if (memory.size > 5_000) {
    for (const [k, v] of memory) if (v.start !== windowStart) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.start !== windowStart) {
    memory.set(key, { start: windowStart, count: 1 });
    return { ok: true, remaining: MAX - 1 };
  }
  entry.count++;
  return entry.count > MAX ? { ok: false, retryAfter } : { ok: true, remaining: MAX - entry.count };
}
