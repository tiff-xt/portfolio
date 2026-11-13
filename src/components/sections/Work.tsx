import Link from "next/link";
import { type Project, projects } from "@/lib/site";
import { caseStudyBySlug } from "@/content/caseStudies";
import { Reveal } from "../motion/Reveal";
import { Tilt } from "../motion/Tilt";
import { Cover } from "./Covers";
import { SectionHeading } from "./SectionHeading";

const STATUS = {
  live: { label: "Live", dot: "bg-accent-2" },
  building: { label: "In progress", dot: "bg-accent animate-[pulse-dot_1.6s_ease-in-out_infinite]" },
  planned: { label: "Up next", dot: "bg-line-strong" },
  library: { label: "Library", dot: "bg-accent-2" },
};

export function Work() {
  const featured = projects.filter((p) => p.featured);
  const craft = projects.filter((p) => !p.featured);
  return (
    <section id="work" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="01" kicker="Work" title="Things I've designed and built." />

        {/* The three to read first. One per row, so each gets a full look. */}
        <ul className="grid gap-6">
          {featured.map((p, i) => (
            <Reveal as="li" key={p.slug} index={0}>
              <Card project={p} number={i + 1} />
            </Reveal>
          ))}
        </ul>

        <div className="mb-6 mt-20 flex items-baseline justify-between gap-6 border-t border-line pt-8">
          <h3 className="font-display text-3xl tracking-tight sm:text-4xl">Craft and experiments</h3>
          <p className="hidden max-w-sm text-right text-sm text-muted sm:block">
            Smaller builds where the point is the medium: a backend library, graphics, motion, sound and an npm package.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {craft.map((p, i) => (
            <Reveal as="li" key={p.slug} index={i % 2}>
              <Card project={p} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A project card. With a `number` it is a featured, full-width card: cover beside the text. */
function Card({ project: p, number }: { project: Project; number?: number }) {
  const study = caseStudyBySlug(p.slug) ? `/work/${p.slug}` : undefined;
  const wide = number !== undefined;
  return (
    <Tilt
      className={`group relative h-full rounded-3xl border border-line bg-surface p-3 sm:p-4 ${
        wide ? "grid gap-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-6" : ""
      }`}
    >
      <Cover slug={p.slug} hue={p.hue} />
      <div className={wide ? "px-2 pb-3 pt-5 sm:px-3 lg:py-4" : "px-2 pb-3 pt-5 sm:px-3"}>
        {wide && p.proves && (
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">{String(number).padStart(2, "0")}</span> / {p.proves}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <h3 className={wide ? "text-2xl font-medium tracking-tight sm:text-3xl" : "text-xl font-medium tracking-tight"}>
            {study ? (
              <Link href={study} className="after:absolute after:inset-0 after:rounded-3xl">
                {p.title}
              </Link>
            ) : (
              p.title
            )}
          </h3>
          <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className={`size-1.5 rounded-full ${STATUS[p.status].dot}`} />
            {STATUS[p.status].label}
          </span>
        </div>
        <p className={`mt-2 leading-relaxed text-muted ${wide ? "sm:text-lg" : ""}`}>{p.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted">
              {t}
            </li>
          ))}
        </ul>
        <div className="relative z-10 mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted">
          {study && <span className="pointer-events-none text-fg">Read case study →</span>}
          {p.href && (
            <a href={p.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-fg hover:underline">
              Live site ↗
            </a>
          )}
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-fg hover:underline">
              Source ↗
            </a>
          )}
        </div>
      </div>
    </Tilt>
  );
}
