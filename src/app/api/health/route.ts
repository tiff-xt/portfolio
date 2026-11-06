import { connection } from "next/server";
import { getEnv, hasAI, hasDB } from "@/lib/env";
import { loadChunks } from "@/lib/kb/store";

/** Which capabilities are live. Never exposes values, only booleans and counts. */
export async function GET() {
  await connection();
  const env = getEnv();
  const kb = await loadChunks(env);
  return Response.json({
    ai: hasAI(env),
    database: hasDB(env),
    knowledge: { source: kb.source, chunks: kb.chunks.length },
  });
}
