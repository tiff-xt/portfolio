import { describe, expect, it } from "vitest";
import { parseSSE } from "@/lib/ai/sse";
import { decodeEvents, encodeEvent, type ChatEvent } from "@/lib/ai/protocol";

/** Stream that delivers the text in awkward, arbitrary slices. */
function chunked(text: string, sizes: number[]) {
  const bytes = new TextEncoder().encode(text);
  let i = 0;
  let s = 0;
  return new ReadableStream<Uint8Array>({
    pull(c) {
      if (i >= bytes.length) return c.close();
      const n = sizes[s++ % sizes.length];
      c.enqueue(bytes.slice(i, i + n));
      i += n;
    },
  });
}

async function collect<T>(it: AsyncIterable<T>) {
  const out: T[] = [];
  for await (const x of it) out.push(x);
  return out;
}

describe("parseSSE", () => {
  it("reassembles events split across network chunks", async () => {
    const body = 'data: {"response":"Hel"}\n\ndata: {"response":"lo ✨"}\r\n\r\ndata: [DONE]\n\n';
    expect(await collect(parseSSE(chunked(body, [3, 7, 1, 11])))).toEqual([
      '{"response":"Hel"}',
      '{"response":"lo ✨"}',
      "[DONE]",
    ]);
  });
});

describe("NDJSON protocol", () => {
  it("round-trips events regardless of chunk boundaries", async () => {
    const events: ChatEvent[] = [
      { type: "meta", mode: "ai", retrieval: "vector", sources: [{ id: "a", heading: "A" }] },
      { type: "delta", text: "line\nbreak and ünïcode" },
      { type: "done" },
    ];
    const wire = events.map(encodeEvent).join("");
    expect(await collect(decodeEvents(chunked(wire, [5, 2, 13])))).toEqual(events);
  });
});
