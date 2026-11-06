import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { type Env, hasAI, hasDB } from "../env";
import { getSql } from "../db/client";
import { embed } from "../ai/cloudflare";
import { chunkMarkdown, type Chunk } from "./chunk";
import { rankChunks } from "./rank";

const KB_DIR = path.join(process.cwd(), "content", "knowledge");
const TTL_MS = 5 * 60_000;
let cache: { chunks: Chunk[]; source: KBSource; at: number } | null = null;

export type KBSource = "database" | "private-files" | "example";

/**
 * Knowledge base resolution, most private first:
 * 1. Postgres (production): content was ingested from local files, never committed.
 * 2. content/knowledge/private/*.md (local dev, gitignored).
 * 3. content/knowledge/example.md (public sample so the demo always works).
 */
export async function loadChunks(env: Env): Promise<{ chunks: Chunk[]; source: KBSource }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;

  let result: { chunks: Chunk[]; source: KBSource } | null = null;
  if (hasDB(env)) {
    try {
      const rows = (await getSql(env.DATABASE_URL!)`
        select id, section, heading, content, guidance from kb_chunks order by position
      `) as Chunk[];
      if (rows.length) result = { chunks: rows, source: "database" };
    } catch (err) {
      const missing = String(err).includes("does not exist");
      console.error(
        missing
          ? "[kb] tables missing: run `npm run db:migrate` and `npm run kb:ingest`. Using file fallback."
          : "[kb] database read failed, falling back to files",
        missing ? "" : err,
      );
    }
  }
  result ??= await loadFromFiles();
  cache = { ...result, at: Date.now() };
  return result;
}

export async function loadFromFiles(): Promise<{ chunks: Chunk[]; source: KBSource }> {
  const privateDir = path.join(KB_DIR, "private");
  const files = await readdir(privateDir).catch(() => [] as string[]);
  const md = files.filter((f) => f.endsWith(".md")).sort();
  if (md.length) {
    const texts = await Promise.all(md.map((f) => readFile(path.join(privateDir, f), "utf8")));
    return { chunks: texts.flatMap(chunkMarkdown), source: "private-files" };
  }
  const example = await readFile(path.join(KB_DIR, "example.md"), "utf8");
  return { chunks: chunkMarkdown(example), source: "example" };
}

export type Retrieval = {
  guidance: Chunk[];
  matches: Chunk[];
  source: KBSource;
  method: "vector" | "keyword";
};

/**
 * Hybrid retrieval: pgvector similarity when embeddings exist, BM25 otherwise
 * (or if embedding fails). The corpus is small, so BM25 alone is genuinely
 * good; vectors help with paraphrases ("make charts fast" → performance).
 */
export async function retrieve(env: Env, query: string, k = 4, signal?: AbortSignal): Promise<Retrieval> {
  const { chunks, source } = await loadChunks(env);
  const guidance = chunks.filter((c) => c.guidance);

  if (source === "database" && hasAI(env)) {
    try {
      const [vector] = await embed(env, [query], signal);
      const rows = (await getSql(env.DATABASE_URL!)`
        select id, section, heading, content, guidance
        from kb_chunks
        where not guidance and embedding is not null
          and 1 - (embedding <=> ${JSON.stringify(vector)}::vector) > 0.55
        order by embedding <=> ${JSON.stringify(vector)}::vector
        limit ${k}
      `) as Chunk[];
      if (rows.length) return { guidance, matches: rows, source, method: "vector" };
    } catch (err) {
      console.warn("[kb] vector search unavailable, using keyword ranking", err);
    }
  }
  const matches = rankChunks(query, chunks, k).map((r) => r.chunk);
  return { guidance, matches, source, method: "keyword" };
}

export function clearKBCache() {
  cache = null;
}
