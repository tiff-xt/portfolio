import { z } from "zod";
import { getEnv, hasAI } from "@/lib/env";
import { retrieve } from "@/lib/kb/store";
import { checkTopic } from "@/lib/ai/guard";
import { buildMessages } from "@/lib/ai/prompt";
import { AIUnavailableError, streamChat } from "@/lib/ai/cloudflare";
import { extractiveAnswer, streamText } from "@/lib/ai/demo";
import { type ChatEvent, type Mode, encodeEvent } from "@/lib/ai/protocol";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { recordChat } from "@/lib/analytics";

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2_000),
      }),
    )
    .min(1)
    .max(20)
    .refine((m) => m.at(-1)?.role === "user", "Last message must be from the user"),
});

const json = (status: number, body: ChatEvent, headers: HeadersInit = {}) =>
  new Response(encodeEvent(body), {
    status,
    headers: { "Content-Type": "application/x-ndjson", ...headers },
  });

export async function POST(request: Request) {
  const started = Date.now();
  const env = getEnv();

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json(400, { type: "error", message: "Invalid request." });
  }
  const { messages } = parsed.data;
  const question = messages.at(-1)!.content;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await rateLimit(env, await clientKey(ip, env.RATE_LIMIT_SALT));
  if (!limit.ok) {
    return json(
      429,
      {
        type: "error",
        message: "You've asked a lot in a short time. Give it a few minutes.",
        retryAfter: limit.retryAfter,
      },
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  const signal = request.signal;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (e: ChatEvent) => controller.enqueue(enc.encode(encodeEvent(e)));
      let mode: Mode = "demo";
      let sources: string[] = [];
      let retrievalMethod = "none";
      let outcome: "ok" | "aborted" | "error" = "ok";

      try {
        // 1. Deterministic policy first: no retrieval, no model call.
        const policy = checkTopic(question);
        if (!policy.allowed) {
          mode = "policy";
          send({ type: "meta", mode, sources: [], retrieval: "none" });
          for await (const t of streamText(policy.reply, signal)) send({ type: "delta", text: t });
          send({ type: "done" });
          return;
        }

        // 2. Ground the answer.
        const r = await retrieve(env, question, 4, signal);
        retrievalMethod = r.method;
        const meta = (m: Mode) => {
          // The extractive fallback only quotes the top two sections: cite exactly those.
          const used = m === "ai" ? r.matches : r.matches.slice(0, 2);
          sources = used.map((c) => c.id);
          send({
            type: "meta",
            mode: m,
            retrieval: r.method,
            sources: used.map((c) => ({ id: c.id, heading: c.heading })),
            model: m === "ai" ? env.CF_CHAT_MODEL.split("/").pop() : undefined,
          });
        };

        // 3. Generate, degrading to extractive answers if the model is unavailable.
        if (hasAI(env)) {
          try {
            const tokens = streamChat(env, buildMessages(messages, r.guidance, r.matches), { signal });
            // Pull the first token before committing to "ai" mode, so a quota
            // error can still fall back cleanly.
            const first = await tokens.next();
            mode = "ai";
            meta(mode);
            if (!first.done) send({ type: "delta", text: first.value });
            for await (const t of tokens) send({ type: "delta", text: t });
            send({ type: "done" });
            return;
          } catch (err) {
            if (signal.aborted) throw err;
            console.warn(
              "[chat] model unavailable, falling back",
              err instanceof AIUnavailableError ? err.message : err,
            );
          }
        }

        mode = "demo";
        meta(mode);
        if (hasAI(env)) {
          send({
            type: "notice",
            message: "The model is resting (free daily limit). Here's what my notes say directly.",
          });
        }
        for await (const t of streamText(extractiveAnswer(question, r.matches), signal)) {
          send({ type: "delta", text: t });
        }
        send({ type: "done" });
      } catch (err) {
        if (signal.aborted) {
          outcome = "aborted";
        } else {
          outcome = "error";
          console.error("[chat] failed", err);
          send({ type: "error", message: "Something went wrong on my side. Try again in a moment." });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed by client abort
        }
        void recordChat(env, {
          mode,
          retrieval: retrievalMethod,
          sources,
          questionChars: question.length,
          latencyMs: Date.now() - started,
          outcome,
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": String(limit.remaining),
    },
  });
}
