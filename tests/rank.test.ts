import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { chunkMarkdown } from "@/lib/kb/chunk";
import { rankChunks } from "@/lib/kb/rank";

const chunks = chunkMarkdown(readFileSync("content/knowledge/example.md", "utf8"));

describe("rankChunks", () => {
  it("finds the right section through synonyms and plurals", () => {
    expect(rankChunks("how do you make charts fast?", chunks)[0].chunk.id).toBe("data-visualization");
    expect(rankChunks("LLM structured outputs", chunks)[0].chunk.id).toBe("ai-and-llm-engineering");
  });

  it("never returns guidance chunks", () => {
    expect(rankChunks("guidance answer questions", chunks).every((r) => !r.chunk.guidance)).toBe(true);
  });

  it("returns nothing for unrelated or empty questions", () => {
    expect(rankChunks("favourite pizza topping", chunks)).toEqual([]);
    expect(rankChunks("the and of", chunks)).toEqual([]);
  });
});
