/**
 * Apply SQL migrations in order, once each.
 * Usage: DATABASE_URL=... npm run db:migrate
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = neon(url);
const dir = path.join(process.cwd(), "db", "migrations");

await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
const applied = new Set(((await sql`select name from schema_migrations`) as { name: string }[]).map((r) => r.name));

for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
  if (applied.has(file)) continue;
  const statements = (await readFile(path.join(dir, file), "utf8"))
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  await sql.transaction([
    ...statements.map((s) => sql.query(s)),
    sql`insert into schema_migrations (name) values (${file})`,
  ]);
  console.log(`applied ${file}`);
}
console.log("migrations up to date");
