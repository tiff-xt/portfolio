import { Reveal } from "../motion/Reveal";
import { SectionHeading } from "./SectionHeading";

const principles = [
  {
    title: "Own the whole problem",
    body: "From an incomplete idea through architecture, implementation, release and the debugging after. I talk directly with users and domain experts to find what they actually need.",
  },
  {
    title: "The unglamorous states are the design",
    body: "I sweat the details users notice, such as spacing, motion and empty states, as much as the ones they never see, such as queries, queues and failure modes. Loading, error and offline are engineering decisions, not decoration.",
  },
  {
    title: "Make the wrong state impossible",
    body: "The rules that must never break belong in the database as constraints, and every write should be safe to retry. Then a bug in the code above them is an error message, not a double charge or a seat sold twice.",
  },
  {
    title: "Performance is a pipeline",
    body: "A slow chart is rarely just a chart problem. Request size, payload, parsing, memory and rendering all add up, and so does how much detail the user needs right now.",
  },
  {
    title: "Measure it, then say it",
    body: "Load tests for the backend, evals for the AI, invariant checks for the data. I publish the numbers, including the ones that were bad before they were fixed.",
  },
  {
    title: "AI is an accelerator, not an authority",
    body: "Structured outputs, deterministic rules around the model, and UI that shows what happened. The assistant on this page works that way, and you can see how below.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="02" kicker="Approach" title="Clarity is something you engineer." />
        <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              index={i}
              className="group relative bg-bg p-8 transition-colors duration-500 hover:bg-surface sm:p-10"
            >
              <span className="font-mono text-xs text-muted transition-colors group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-2xl font-medium tracking-tight">{p.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted">{p.body}</p>
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
              />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
