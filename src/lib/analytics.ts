import { type Env, hasDB } from "./env";
import { getSql } from "./db/client";

export type ChatMetric = {
  mode: "ai" | "demo" | "policy";
  retrieval: string;
  sources: string[];
  questionChars: number;
  latencyMs: number;
  outcome: "ok" | "aborted" | "error";
};

/**
 * Privacy-first usage metrics: which sections get asked about and how the
 * pipeline behaved. Question text is never stored.
 */
export async function recordChat(env: Env, m: ChatMetric) {
  if (!hasDB(env)) return;
  try {
    await getSql(env.DATABASE_URL!)`
      insert into chat_events (mode, retrieval, sources, question_chars, latency_ms, outcome)
      values (${m.mode}, ${m.retrieval}, ${m.sources}, ${m.questionChars}, ${m.latencyMs}, ${m.outcome})
    `;
  } catch (err) {
    console.error("[analytics] insert failed", err);
  }
}
