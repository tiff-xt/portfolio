import { describe, expect, it } from "vitest";
import { extractiveAnswer } from "@/lib/ai/demo";
import type { Chunk } from "@/lib/kb/chunk";

const chunk = (id: string, content: string): Chunk => ({ id, section: id, heading: id, content, guidance: false });

describe("extractiveAnswer", () => {
  it("only uses sentences that exist in the knowledge base", () => {
    const c = chunk(
      "viz",
      "I think about payload size. Rendering cost matters a lot. Unrelated sentence about cooking dinner.",
    );
    const answer = extractiveAnswer("payload and rendering cost", [c]);
    for (const sentence of answer.split(/(?<=\.)\s+/)) expect(c.content).toContain(sentence);
  });

  it("skips skill lists unless the question asks about skills", () => {
    const c = chunk(
      "fe",
      "Expert: TypeScript, React, Next.js and many more things. I care about architecture a great deal.",
    );
    expect(extractiveAnswer("how do you think about architecture", [c])).not.toMatch(/^Expert:/);
    expect(extractiveAnswer("what skills do you have", [c])).toMatch(/Expert:/);
  });

  it("says so when nothing matched", () => {
    expect(extractiveAnswer("anything", [])).toMatch(/don't have anything/);
  });
});
