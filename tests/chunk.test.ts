import { describe, expect, it } from "vitest";
import { chunkMarkdown } from "@/lib/kb/chunk";

const md = `# Title (ignored)

## Guidance
- be nice

## Data visualization
Expert in D3.

### Performance
Think about the whole pipeline.

## Empty section
`;

describe("chunkMarkdown", () => {
  const chunks = chunkMarkdown(md);

  it("splits on h2 and h3, skipping titles and empty sections", () => {
    expect(chunks.map((c) => c.heading)).toEqual([
      "Guidance",
      "Data visualization",
      "Data visualization › Performance",
    ]);
  });

  it("flags guidance sections so they are never cited", () => {
    expect(chunks[0].guidance).toBe(true);
    expect(chunks.slice(1).every((c) => !c.guidance)).toBe(true);
  });

  it("produces stable, unique ids", () => {
    expect(chunks.map((c) => c.id)).toEqual(["guidance", "data-visualization", "data-visualization-performance"]);
  });
});
