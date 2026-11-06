import { SplitText } from "../motion/Reveal";

export function SectionHeading({ index, kicker, title }: { index: string; kicker: string; title: string }) {
  return (
    <div className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-[8rem_1fr]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{index}</span> / {kicker}
      </p>
      <SplitText
        as="h2"
        text={title}
        className="max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.015em]"
      />
    </div>
  );
}
