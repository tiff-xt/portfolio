import type { Chunk } from "../kb/chunk";
import { tokenize } from "../kb/rank";

/**
 * Model-free answer used when Workers AI isn't configured or the free daily
 * allocation is exhausted. Extractive, so it can only say what the knowledge
 * base says: graceful degradation, never fabrication.
 */
export function extractiveAnswer(question: string, matches: Chunk[]): string {
  if (!matches.length) {
    return "I don't have anything on that in my notes here. I can talk about frontend architecture, design systems, data visualization, full-stack work, AI features or testing.";
  }
  const q = new Set(tokenize(question));
  const wantsLists = /\b(skills?|stack|tools?|technolog|know|languages?|frameworks?|experience with)\b/i.test(question);
  const top = matches.slice(0, 2);
  const sentences = top.flatMap((c, ci) =>
    c.content
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s, i) => ({ s: s.trim(), i, ci })),
  );
  const isList = (s: string) => /^(expert|proficient|familiar)[^:]{0,40}:/i.test(s);
  const picked = sentences
    .filter((x) => x.s.length > 20 && (wantsLists || !isList(x.s)))
    .map((x) => ({ ...x, score: tokenize(x.s).filter((t) => q.has(t)).length + (x.ci === 0 ? 0.5 : 0) - x.i * 0.04 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    // Restore reading order inside the chosen set.
    .sort((a, b) => a.ci - b.ci || a.i - b.i);
  return picked.map((x) => x.s).join(" ");
}

export async function* streamText(text: string, signal?: AbortSignal, delayMs = 14): AsyncGenerator<string> {
  for (const piece of text.match(/\S+\s*/g) ?? []) {
    if (signal?.aborted) return;
    yield piece;
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
}
