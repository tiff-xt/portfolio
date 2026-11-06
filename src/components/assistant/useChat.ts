"use client";
import { useCallback, useRef, useState } from "react";
import { decodeEvents, type Mode, type Source } from "@/lib/ai/protocol";

export type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "done" | "error" | "stopped";
  mode?: Mode;
  retrieval?: "vector" | "keyword" | "none";
  sources?: Source[];
  model?: string;
  notice?: string;
  ms?: number;
};

let n = 0;
const uid = () => `t${Date.now().toString(36)}${n++}`;

/** Streaming chat state machine over the NDJSON protocol. */
export function useChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const patch = (id: string, p: Partial<Turn> | ((t: Turn) => Partial<Turn>)) =>
    setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...(typeof p === "function" ? p(t) : p) } : t)));

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      const user: Turn = { id: uid(), role: "user", content: q };
      const reply: Turn = { id: uid(), role: "assistant", content: "", status: "streaming" };
      const history = [...turns, user]
        .filter((t) => t.content && t.status !== "error")
        .map(({ role, content }) => ({ role, content }));
      setTurns((ts) => [...ts, user, reply]);
      setBusy(true);
      const ctrl = new AbortController();
      abort.current = ctrl;
      const started = performance.now();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });
        if (!res.body) throw new Error("No response body");
        for await (const e of decodeEvents(res.body)) {
          if (e.type === "meta")
            patch(reply.id, { mode: e.mode, retrieval: e.retrieval, sources: e.sources, model: e.model });
          else if (e.type === "delta") patch(reply.id, (t) => ({ content: t.content + e.text }));
          else if (e.type === "notice") patch(reply.id, { notice: e.message });
          else if (e.type === "error") patch(reply.id, { status: "error", content: e.message });
          else if (e.type === "done") patch(reply.id, { status: "done" });
        }
        patch(reply.id, (t) => ({
          status: t.status === "streaming" ? "done" : t.status,
          ms: Math.round(performance.now() - started),
        }));
      } catch (err) {
        if (ctrl.signal.aborted) patch(reply.id, { status: "stopped" });
        else
          patch(reply.id, {
            status: "error",
            content: "Couldn't reach the server. Check your connection and try again.",
          });
        if (!ctrl.signal.aborted) console.error(err);
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, turns],
  );

  const stop = useCallback(() => abort.current?.abort(), []);
  const reset = useCallback(() => {
    abort.current?.abort();
    setTurns([]);
  }, []);

  return { turns, busy, send, stop, reset };
}
