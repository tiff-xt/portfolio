import { describe, expect, it } from "vitest";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getEnv } from "@/lib/env";

describe("rateLimit (memory)", () => {
  const env = getEnv({});

  it("allows 20 requests per window, then reports when to retry", async () => {
    const key = "test-" + Math.random();
    const now = Date.UTC(2026, 0, 1, 12, 0, 30);
    for (let i = 0; i < 20; i++) expect((await rateLimit(env, key, now)).ok).toBe(true);
    const blocked = await rateLimit(env, key, now);
    expect(blocked).toEqual({ ok: false, retryAfter: 570 });
    // Next window resets.
    expect((await rateLimit(env, key, now + 10 * 60_000)).ok).toBe(true);
  });

  it("hashes client identifiers instead of storing raw IPs", async () => {
    const k = await clientKey("203.0.113.9", "salt");
    expect(k).not.toContain("203");
    expect(k).toBe(await clientKey("203.0.113.9", "salt"));
    expect(k).not.toBe(await clientKey("203.0.113.9", "other-salt"));
  });
});
