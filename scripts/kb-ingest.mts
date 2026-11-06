/**
 * Sync the private knowledge base (content/knowledge/private/*.md, gitignored)
 * into Postgres. Embeds only chunks whose content changed; removes chunks
 * that no longer exist. Your notes go machine → database, never through git.
 *
 * Usage: DATABASE_URL=... CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run kb:ingest
 * (Without Cloudflare credentials it stores text only; keyword search still works.)
 */
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getEnv, hasAI } from "../src/lib/env";
import { loadFromFiles } from "../src/lib/kb/store";
import { embed } from "../src/lib/ai/cloudflare";

const env = getEnv();
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = neon(env.DATABASE_URL);

const [{ exists }] = (await sql`select to_regclass('public.kb_chunks') is not null as exists`) as { exists: boolean }[];
if (!exists) {
  console.error("The kb_chunks table doesn't exist yet. Run `npm run db:migrate` first, then re-run this.");
  process.exit(1);
}

const { chunks, source } = await loadFromFiles();
if (source !== "private-files") {
  throw new Error(
    "No files in content/knowledge/private/. Refusing to overwrite the database with the public example.",
  );
}

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const existing = new Map(
  (
    (await sql`select id, content_hash, embedding is not null as embedded from kb_chunks`) as {
      id: string;
      content_hash: string;
      embedded: boolean;
    }[]
  ).map((r) => [r.id, r]),
);

const withHash = chunks.map((c, position) => ({ ...c, position, hash: hash(`${c.heading}\n${c.content}`) }));
const toEmbed = withHash.filter(
  (c) => !c.guidance && (existing.get(c.id)?.content_hash !== c.hash || !existing.get(c.id)?.embedded),
);

let vectors = new Map<string, number[]>();
if (hasAI(env) && toEmbed.length) {
  const out = await embed(
    env,
    toEmbed.map((c) => `${c.heading}\n${c.content}`),
  );
  vectors = new Map(toEmbed.map((c, i) => [c.id, out[i]]));
}

await sql.transaction([
  ...withHash.map((c) => {
    const v = vectors.get(c.id);
    return sql`
      insert into kb_chunks (id, position, section, heading, content, guidance, content_hash, embedding, updated_at)
      values (${c.id}, ${c.position}, ${c.section}, ${c.heading}, ${c.content}, ${c.guidance}, ${c.hash},
              ${v ? JSON.stringify(v) : null}::vector, now())
      on conflict (id) do update set
        position = excluded.position, section = excluded.section, heading = excluded.heading,
        content = excluded.content, guidance = excluded.guidance, content_hash = excluded.content_hash,
        embedding = coalesce(excluded.embedding, case when kb_chunks.content_hash = excluded.content_hash then kb_chunks.embedding end),
        updated_at = now()
    `;
  }),
  sql`delete from kb_chunks where not (id = any(${withHash.map((c) => c.id)}))`,
]);

console.log(
  `synced ${withHash.length} chunks (${vectors.size} embedded${hasAI(env) ? "" : "; no Cloudflare credentials, text only"})`,
);
