import { z } from "zod";

/**
 * Server-side configuration. Every integration is optional: with nothing set,
 * the site runs fully in demo mode (local knowledge files, in-memory rate
 * limits, extractive answers). Each variable unlocks one capability.
 */
const schema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
  CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
  CF_CHAT_MODEL: z.string().default("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
  CF_EMBED_MODEL: z.string().default("@cf/baai/bge-base-en-v1.5"),
  DATABASE_URL: z.url().optional(),
  RATE_LIMIT_SALT: z.string().default("local-dev-salt"),
});

export type Env = z.infer<typeof schema>;

export function getEnv(source: Record<string, string | undefined> = process.env): Env {
  // Treat empty strings (common in .env templates) as unset.
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v.trim() !== ""));
  return schema.parse(cleaned);
}

export const hasAI = (env: Env) => Boolean(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN);
export const hasDB = (env: Env) => Boolean(env.DATABASE_URL);
