"use client";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { areas, type Depth } from "@/content/skills";
import { askAssistant } from "../assistant/bus";
import { SectionHeading } from "./SectionHeading";

const DEPTH: Record<Depth, { label: string; dots: number }> = {
  expert: { label: "Expert", dots: 3 },
  proficient: { label: "Proficient", dots: 2 },
  familiar: { label: "Familiar", dots: 1 },
};

/** Runs a state update inside a View Transition when supported and wanted. */
function withTransition(update: () => void) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return update();
  document.startViewTransition(() => flushSync(update));
}

export function Skills() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const area = areas[active];

  const select = (i: number, focus = false) => {
    if (i === active) return;
    withTransition(() => setActive(i));
    if (focus) tabs.current[i]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: areas.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + areas.length) % areas.length, true);
  };

  return (
    <section id="skills" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="02" kicker="Skills" title="Full stack, from the interface to the database." />

        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div
            role="tablist"
            aria-label="Skill areas"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="flex flex-col"
          >
            {areas.map((a, i) => {
              const selected = i === active;
              return (
                <button
                  key={a.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`${id}-tab-${a.id}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`relative flex items-baseline justify-between border-b border-line py-4 pl-5 text-left text-lg transition-colors duration-300 ${
                    selected ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent"
                      style={{ viewTransitionName: "skill-indicator" }}
                    />
                  )}
                  {a.title}
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {String(a.skills.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${area.id}`}
            className="min-h-[24rem]"
            style={{ viewTransitionName: "skill-panel" }}
          >
            <p className="max-w-2xl text-2xl leading-snug tracking-tight sm:text-3xl">{area.blurb}</p>

            <div className="mt-10 space-y-8">
              {(["expert", "proficient", "familiar"] as Depth[]).map((depth) => {
                const list = area.skills.filter((s) => s.depth === depth);
                if (!list.length) return null;
                return (
                  <div key={depth}>
                    <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">
                      <span className="flex gap-1" aria-hidden>
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className={`size-1.5 rounded-full ${d < DEPTH[depth].dots ? "bg-accent" : "bg-line-strong"}`}
                          />
                        ))}
                      </span>
                      {DEPTH[depth].label}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {list.map((s, i) => (
                        <li
                          key={s.name}
                          className="motion-safe:animate-[chip-in_600ms_var(--ease-out)_both] rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm transition-colors hover:border-line-strong"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => askAssistant(area.ask)}
              className="group mt-10 inline-flex items-center gap-3 text-sm font-medium"
            >
              <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
                ?
              </span>
              <span className="underline decoration-line-strong underline-offset-4 transition-colors group-hover:decoration-accent">
                Ask: “{area.ask}”
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
