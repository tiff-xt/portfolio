import type { Chunk } from "./chunk";

const STOP = new Set(
  "a an and are as at be but by can do does for from has have how i in is it its me my of on or so that the their them they this to was what when where which who why will with you your yourself about tell".split(
    " ",
  ),
);

/** Domain synonyms so casual phrasing still hits the right section. */
const SYNONYMS: Record<string, string[]> = {
  viz: ["visualization"],
  dataviz: ["visualization"],
  chart: ["visualization"],
  charts: ["visualization"],
  graph: ["visualization"],
  plot: ["visualization"],
  ai: ["llm"],
  llm: ["ai"],
  gpt: ["ai"],
  prompt: ["ai"],
  css: ["styling", "tailwind"],
  style: ["styling"],
  design: ["design", "ux"],
  backend: ["backend"],
  server: ["backend"],
  api: ["backend", "rest"],
  database: ["sql", "postgresql"],
  db: ["sql", "postgresql"],
  test: ["testing"],
  tests: ["testing"],
  qa: ["testing"],
  deploy: ["devops", "ci"],
  cloud: ["aws", "devops"],
  perf: ["performance"],
  fast: ["performance"],
  slow: ["performance"],
  realtime: ["collaborative", "concurrency"],
  sync: ["synchronization", "state"],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

/** Deliberately tiny stemmer: enough to match "visualizations" ↔ "visualization". */
function stem(t: string) {
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

function expand(tokens: string[]) {
  const out = new Set(tokens);
  for (const t of tokens) for (const s of SYNONYMS[t] ?? []) out.add(stem(s));
  return [...out];
}

export type Ranked = { chunk: Chunk; score: number };

/** BM25 over chunk text, with heading matches weighted 3×. */
export function rankChunks(query: string, chunks: Chunk[], k = 4): Ranked[] {
  const candidates = chunks.filter((c) => !c.guidance);
  if (!candidates.length) return [];
  const q = expand(tokenize(query));
  if (!q.length) return [];

  const docs = candidates.map((c) => {
    const body = tokenize(c.content);
    const head = tokenize(c.heading);
    return { chunk: c, terms: [...body, ...head, ...head, ...head], len: body.length + head.length * 3 };
  });
  const avgLen = docs.reduce((n, d) => n + d.len, 0) / docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d.terms)) df.set(t, (df.get(t) ?? 0) + 1);

  const K1 = 1.4;
  const B = 0.75;
  return (
    docs
      .map(({ chunk, terms, len }) => {
        const tf = new Map<string, number>();
        for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
        let score = 0;
        for (const t of q) {
          const f = tf.get(t);
          if (!f) continue;
          const n = df.get(t) ?? 0;
          const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
          score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / avgLen));
        }
        return { chunk, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      // Drop weak tail matches: they dilute citations and the prompt.
      .filter((r, _, all) => r.score >= all[0].score * 0.35)
      .slice(0, k)
  );
}
