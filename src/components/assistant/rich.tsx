import { Fragment, type ReactNode } from "react";

/**
 * Renders the small subset of markdown the model is asked to produce
 * (paragraphs, "- " bullets, **bold**) as React nodes. No HTML injection path.
 */
export function Rich({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="my-3 space-y-1.5 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-accent" />
                  <span>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-3 first:mt-0 last:mb-0">
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}
