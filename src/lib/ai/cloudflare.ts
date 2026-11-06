import type { Env } from "../env";
import { parseSSE } from "./sse";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AIUnavailableError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const endpoint = (env: Env, model: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;

async function call(env: Env, model: string, body: unknown, signal?: AbortSignal) {
  const res = await fetch(endpoint(env, model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    // 429 / 4006 = free daily allocation used up. Caller falls back to demo mode.
    const detail = await res.text().catch(() => "");
    throw new AIUnavailableError(`Workers AI ${res.status}: ${detail.slice(0, 200)}`, res.status);
  }
  return res;
}

/** Stream tokens from a Workers AI text-generation model. */
export async function* streamChat(
  env: Env,
  messages: ChatMessage[],
  opts: { maxTokens?: number; signal?: AbortSignal } = {},
): AsyncGenerator<string> {
  const res = await call(
    env,
    env.CF_CHAT_MODEL,
    { messages, stream: true, max_tokens: opts.maxTokens ?? 450, temperature: 0.4 },
    opts.signal,
  );
  if (!res.body) throw new AIUnavailableError("Empty response body");
  for await (const data of parseSSE(res.body)) {
    if (data === "[DONE]") return;
    try {
      const token = (JSON.parse(data) as { response?: string }).response;
      if (token) yield token;
    } catch {
      // Ignore keep-alives / non-JSON frames.
    }
  }
}

/** Embed texts with a Workers AI embedding model (bge-base: 768 dims). */
export async function embed(env: Env, texts: string[], signal?: AbortSignal): Promise<number[][]> {
  const res = await call(env, env.CF_EMBED_MODEL, { text: texts }, signal);
  const json = (await res.json()) as { result?: { data?: number[][] } };
  const data = json.result?.data;
  if (!data || data.length !== texts.length) throw new AIUnavailableError("Malformed embedding response");
  return data;
}
