/**
 * Wire protocol for /api/chat: newline-delimited JSON events. Simpler than SSE
 * for a POST response, trivially parseable, and typed end to end.
 */
export type Source = { id: string; heading: string };
export type Mode = "ai" | "demo" | "policy";

export type ChatEvent =
  | { type: "meta"; mode: Mode; sources: Source[]; retrieval: "vector" | "keyword" | "none"; model?: string }
  | { type: "delta"; text: string }
  | { type: "notice"; message: string }
  | { type: "done" }
  | { type: "error"; message: string; retryAfter?: number };

export const encodeEvent = (e: ChatEvent) => JSON.stringify(e) + "\n";

export async function* decodeEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line) yield JSON.parse(line) as ChatEvent;
      }
      if (done) break;
    }
    if (buffer.trim()) yield JSON.parse(buffer) as ChatEvent;
  } finally {
    reader.releaseLock();
  }
}
