import { projects } from "@/lib/site";
import { Reveal } from "../motion/Reveal";
import { Tilt } from "../motion/Tilt";
import { Cover } from "./Covers";
import { SectionHeading } from "./SectionHeading";

const STATUS = {
  live: { label: "Live", dot: "bg-accent-2" },
  building: { label: "In progress", dot: "bg-accent animate-[pulse-dot_1.6s_ease-in-out_infinite]" },
  planned: { label: "Up next", dot: "bg-line-strong" },
};

export function Work() {
  return (
    <section id="work" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="03" kicker="Work" title="Things I've designed and built." />
        <ul className="grid gap-6 sm:grid-cols-2">
          {projects.map((p, i) => {
            const href = p.href ?? p.repo;
            return (
              <Reveal as="li" key={p.slug} index={i % 2}>
                <Tilt className="group relative h-full rounded-3xl border border-line bg-surface p-3 sm:p-4">
                  <Cover slug={p.slug} hue={p.hue} />
                  <div className="px-2 pb-3 pt-5 sm:px-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-medium tracking-tight">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="after:absolute after:inset-0 after:rounded-3xl"
                          >
                            {p.title}
                          </a>
                        ) : (
                          p.title
                        )}
                      </h3>
                      <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                        <span className={`size-1.5 rounded-full ${STATUS[p.status].dot}`} />
                        {STATUS[p.status].label}
                      </span>
                    </div>
                    <p className="mt-2 leading-relaxed text-muted">{p.summary}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                      {p.tags.map((t) => (
                        <li key={t} className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted">
                          {t}
                        </li>
                      ))}
                    </ul>
                    {p.repo && p.href && (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="relative z-10 mt-4 inline-block font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                      >
                        Source ↗
                      </a>
                    )}
                  </div>
                </Tilt>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
