import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

/** Lazily created HTTP client: no pooled connections to leak on serverless. */
export function getSql(url: string) {
  sql ??= neon(url);
  return sql;
}
