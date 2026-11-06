export type Chunk = {
  /** Stable slug, used as primary key and citation anchor. */
  id: string;
  /** Top-level (h2) section the chunk belongs to. */
  section: string;
  /** Display heading: "Section" or "Section › Subsection". */
  heading: string;
  content: string;
  /** Guidance chunks are instructions for the assistant, never cited. */
  guidance: boolean;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");

/**
 * Split markdown into heading-scoped chunks. `##` starts a section, `###` a
 * subsection; `#` titles are ignored. Small corpus, so heading-level chunks
 * keep citations meaningful without a tokenizer-based splitter.
 */
export function chunkMarkdown(markdown: string): Chunk[] {
  const chunks: Chunk[] = [];
  let section = "";
  let sub = "";
  let buffer: string[] = [];

  const flush = () => {
    const content = buffer.join("\n").trim();
    buffer = [];
    if (!section || !content) return;
    const heading = sub ? `${section} › ${sub}` : section;
    chunks.push({
      id: slugify(sub ? `${section}-${sub}` : section),
      section,
      heading,
      content,
      guidance: /^guidance\b/i.test(section),
    });
  };

  for (const line of markdown.split(/\r?\n/)) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h2 && !line.startsWith("###")) {
      flush();
      section = h2[1];
      sub = "";
    } else if (h3) {
      flush();
      sub = h3[1];
    } else if (/^#\s/.test(line)) {
      flush();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return chunks;
}
