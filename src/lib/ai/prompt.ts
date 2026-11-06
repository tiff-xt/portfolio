import type { Chunk } from "../kb/chunk";
import type { ChatMessage } from "./cloudflare";
import { site } from "../site";

export function buildMessages(
  history: { role: "user" | "assistant"; content: string }[],
  guidance: Chunk[],
  matches: Chunk[],
): ChatMessage[] {
  const context = matches.length
    ? matches.map((c) => `[${c.id}] ${c.heading}\n${c.content}`).join("\n\n---\n\n")
    : "(No section of the knowledge base matched this question.)";

  const system = `You are the assistant on ${site.name}'s personal site. You answer visitors' questions about ${site.name}'s technical expertise, way of working and interests, speaking in first person as ${site.name}.

Rules:
- Use ONLY the knowledge below. If it doesn't cover the question, say you don't have that detail here and suggest a related topic you can speak to. Never invent projects, employers, numbers or credentials.
- Talk about the work itself. Don't name employers or discuss compensation, job searching or interviews.
- Be warm, direct and specific. 2-4 short paragraphs or a short list. No headings. No sign-offs.
- Plain text with simple "- " bullets only. Never use em dashes; use commas, colons or full stops instead.
${guidance.map((g) => g.content).join("\n")}

Knowledge:
${context}`;

  return [{ role: "system", content: system }, ...history.slice(-6)];
}
