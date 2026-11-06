import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal, SplitText } from "@/components/motion/Reveal";
import { Cover } from "@/components/sections/Covers";
import { caseStudies, caseStudyBySlug } from "@/content/caseStudies";
import { projects } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudyBySlug(slug);
  const project = projects.find((p) => p.slug === slug);
  if (!cs || !project) return {};
  return {
    title: `${project.title}: case study`,
    description: cs.headline,
    openGraph: { title: `${project.title}: case study`, description: cs.headline, images: [cs.shots[0].src] },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = caseStudyBySlug(slug);
  const project = projects.find((p) => p.slug === slug);
  if (!cs || !project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const [lead, ...rest] = cs.shots;

  return (
    <>
      <Nav />
      <main id="main" className="px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
        <article className="mx-auto max-w-6xl">
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-fg"
          >
            ← All work
          </Link>

          <header className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <span className="text-accent">Case study</span> / {project.title}
              </p>
              <SplitText
                as="h1"
                text={cs.headline}
                className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.015em]"
              />
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform active:scale-95"
                >
                  Open live site <span aria-hidden>↗</span>
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm transition-colors hover:bg-surface-2"
                >
                  Source{" "}
                  <span aria-hidden className="ml-1">
                    ↗
                  </span>
                </a>
              )}
            </div>
          </header>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              ["Role", cs.role],
              ["Focus", cs.focus.join(" · ")],
              ["Stack", cs.stack.join(" · ")],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg p-5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{k}</dt>
                <dd className="mt-2 text-sm leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>

          <Reveal as="figure" className="mt-12">
            <BrowserFrame url={project.href ?? project.repo ?? ""}>
              <Image
                src={lead.src}
                alt={lead.alt}
                width={lead.width}
                height={lead.height}
                priority
                sizes="(min-width: 1200px) 1152px, 100vw"
                className="block h-auto w-full"
              />
            </BrowserFrame>
            <figcaption className="mt-3 font-mono text-[11px] text-muted">{lead.caption}</figcaption>
          </Reveal>

          <div className="mt-20 grid gap-16 lg:grid-cols-[12rem_1fr]">
            <Section label="The problem">
              {cs.problem.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Section>
            <Section label="Approach">
              {cs.approach.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Section>
            <Section label="Key decisions">
              <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
                {cs.decisions.map((d, i) => (
                  <Reveal as="li" key={d.title} index={i % 2} className="bg-bg p-6">
                    <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 text-lg font-medium tracking-tight text-fg">{d.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{d.body}</p>
                  </Reveal>
                ))}
              </ol>
            </Section>
          </div>

          {rest.length > 0 && (
            <section aria-label="Screenshots" className="mt-20 grid gap-8 md:grid-cols-2">
              {rest.map((s, i) => (
                <Reveal
                  as="figure"
                  key={s.src}
                  index={i % 2}
                  className={rest.length % 2 === 1 && i === rest.length - 1 ? "md:col-span-2" : ""}
                >
                  <BrowserFrame url={project.href ?? ""} compact>
                    <Image
                      src={s.src}
                      alt={s.alt}
                      width={s.width}
                      height={s.height}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="block h-auto w-full"
                    />
                  </BrowserFrame>
                  <figcaption className="mt-3 font-mono text-[11px] text-muted">{s.caption}</figcaption>
                </Reveal>
              ))}
            </section>
          )}

          <div className="mt-20 grid gap-16 lg:grid-cols-[12rem_1fr]">
            <Section label="Outcome">
              <ul className="space-y-3">
                {cs.outcome.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <nav aria-label="Next case study" className="mt-24 border-t border-line pt-10">
            <Link href={`/work/${next.slug}`} className="group grid items-center gap-6 sm:grid-cols-[1fr_18rem]">
              <span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Next case study</span>
                <span className="mt-2 block font-display text-[clamp(2.2rem,5vw,4rem)] leading-none transition-colors group-hover:text-accent">
                  {next.title} <span aria-hidden>→</span>
                </span>
              </span>
              <span className="hidden overflow-hidden rounded-2xl transition-transform duration-500 group-hover:-translate-y-1 sm:block">
                <Cover slug={next.slug} hue={next.hue} />
              </span>
            </Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted lg:pt-1.5">{label}</h2>
      <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-fg/85">{children}</div>
    </>
  );
}

/** Minimal browser chrome so screenshots read as live sites, not mockups. */
function BrowserFrame({ url, compact, children }: { url: string; compact?: boolean; children: React.ReactNode }) {
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)]">
      <div className={`flex items-center gap-3 border-b border-line px-4 ${compact ? "py-2" : "py-2.5"}`}>
        <span aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-line-strong" />
          ))}
        </span>
        {host && (
          <span className="truncate rounded-md bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-muted">
            {host}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
