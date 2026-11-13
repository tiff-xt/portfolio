"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { site } from "@/lib/site";
import { Magnetic } from "../motion/Magnetic";

// three.js is ~150 kB: keep it out of the critical path and off the server.
const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

const captions = [
  { id: "seats", kind: "Interface", text: "a seat map, mid-sale" },
  { id: "latency", kind: "Backend", text: "latency as a sale opens" },
  { id: "volcano", kind: "Data", text: "a volcano plot" },
];

const group = "absolute inset-0 opacity-0 transition-opacity duration-700";
const label = "absolute whitespace-nowrap font-mono text-[10px] tracking-wide text-muted";
const across = { left: "var(--plot-x0)", width: "calc(var(--plot-x1) - var(--plot-x0))" };
const upright = { top: "var(--plot-y0)", height: "calc(var(--plot-y1) - var(--plot-y0))" };

function Key({ className, text }: { className: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-1.5 rounded-[1px] ${className}`} />
      {text}
    </span>
  );
}

export function Hero() {
  const hostRef = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);

  return (
    <section
      ref={hostRef}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-14 pt-[19.5rem] sm:px-10 sm:pb-20 min-[900px]:pt-28"
    >
      <ParticleField hostRef={hostRef} targetRef={targetRef} />

      {/* Labels for each picture, positioned from the plot geometry the field
          publishes. Only the current scene's set is visible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity delay-700 duration-1000 [[data-particles=on]_&]:opacity-100"
      >
        <div className={`${group} [[data-scene=seats]_&]:opacity-100`}>
          <span
            className={`${label} -translate-x-1/2 -translate-y-full pb-1`}
            style={{ left: "calc((var(--plot-x0) + var(--plot-x1)) / 2)", top: "var(--plot-y0)" }}
          >
            stage
          </span>
          <span
            className={`${label} flex -translate-x-full gap-4 pr-1 pt-3`}
            style={{ left: "var(--plot-x1)", top: "var(--plot-y1)" }}
          >
            <Key className="bg-accent-2" text="sold" />
            <Key className="bg-accent" text="yours" />
            <Key className="bg-[var(--particle)] opacity-60" text="open" />
          </span>
        </div>

        <div className={`${group} [[data-scene=latency]_&]:opacity-100`}>
          <span className="absolute h-px bg-line-strong" style={{ ...across, top: "var(--plot-y1)" }} />
          <span className="absolute w-px bg-line" style={{ ...upright, left: "var(--plot-x0)" }} />
          <span className="absolute border-t border-dashed border-line" style={{ ...across, top: "var(--plot-budget)" }} />
          <span className="absolute border-l border-dashed border-line" style={{ ...upright, left: "var(--plot-open)" }} />
          <span
            className={`${label} -translate-x-full pr-1 pt-2`}
            style={{ left: "var(--plot-x1)", top: "var(--plot-y1)" }}
          >
            time →
          </span>
          <span className={`${label} -translate-y-full pb-1`} style={{ left: "var(--plot-x0)", top: "var(--plot-y0)" }}>
            ↑ latency, log scale
          </span>
          <span
            className={`${label} -translate-x-full -translate-y-full pb-1 pr-1`}
            style={{ left: "var(--plot-x1)", top: "var(--plot-budget)" }}
          >
            500 ms budget
          </span>
          <span className={`${label} pl-2 pt-2`} style={{ left: "var(--plot-open)", top: "var(--plot-y1)" }}>
            sale opens
          </span>
        </div>

        <div className={`${group} [[data-scene=volcano]_&]:opacity-100`}>
          <span className="absolute h-px bg-line-strong" style={{ ...across, top: "var(--plot-y1)" }} />
          <span className="absolute w-px bg-line" style={{ ...upright, left: "var(--plot-zero)" }} />
          <span className="absolute border-t border-dashed border-line" style={{ ...across, top: "var(--plot-thr)" }} />
          {["--plot-fcL", "--plot-fcR"].map((v) => (
            <span key={v} className="absolute border-l border-dashed border-line" style={{ ...upright, left: `var(${v})` }} />
          ))}
          <span
            className={`${label} -translate-x-full pr-1 pt-2`}
            style={{ left: "var(--plot-x1)", top: "var(--plot-y1)" }}
          >
            log₂ fold change →
          </span>
          <span
            className={`${label} -translate-y-full pb-1 pl-2`}
            style={{ left: "var(--plot-zero)", top: "var(--plot-y0)" }}
          >
            ↑ −log₁₀ p
          </span>
          <span className={`${label} -translate-y-full pb-1`} style={{ left: "var(--plot-x0)", top: "var(--plot-thr)" }}>
            p = 0.0025
          </span>
        </div>
      </div>

      {/* What the picture is, and a way to pick another. */}
      <div
        className="absolute flex -translate-y-full items-center justify-end gap-3 pb-7 opacity-0 transition-opacity delay-700 duration-1000 [[data-particles=on]_&]:opacity-100"
        style={{ left: "var(--plot-x0)", width: "calc(var(--plot-x1) - var(--plot-x0))", top: "var(--plot-y0)" }}
      >
        <p className="relative h-4 flex-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px]">
          {captions.map((c) => (
            <span
              key={c.id}
              data-caption={c.id}
              className="absolute right-0 top-0 whitespace-nowrap opacity-0 transition-opacity duration-700"
            >
              <span className="text-fg">{c.kind}</span>
              <span className="mx-2 text-line-strong">/</span>
              {c.text}
            </span>
          ))}
        </p>
        <div className="flex gap-1.5">
          {captions.map((c, i) => (
            <button
              key={c.id}
              type="button"
              data-scene-go={i}
              data-caption-dot={c.id}
              aria-label={`Show the ${c.kind.toLowerCase()} example`}
              className="h-4 w-4 cursor-pointer after:block after:h-0.5 after:w-full after:rounded-full after:bg-line-strong after:transition-colors"
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* One line at every width. On a phone it sits over the plot, so it
            gets its own backing to stay readable. */}
        <p className="mb-5 inline-block whitespace-nowrap rounded-full bg-bg/85 py-1 pr-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted backdrop-blur-sm sm:bg-transparent sm:p-0 sm:text-xs sm:tracking-[0.2em] sm:backdrop-blur-none">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-accent align-middle" />
          {site.role}
          <span className="mx-2 text-line-strong">/</span>
          {site.experience}
        </p>
        <h1 className="font-display leading-[0.86] tracking-[-0.02em]">
          <span
            ref={targetRef}
            className="particle-target inline-block whitespace-nowrap text-[clamp(6rem,30vw,8.5rem)] leading-none sm:text-[clamp(6rem,22vw,19rem)]"
          >
            {site.name}
          </span>
          <span className="sr-only">, {site.role.toLowerCase()}.</span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{site.tagline}</p>
          <div className="flex shrink-0 gap-3">
            <Magnetic>
              <a
                href="#ask"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg transition-transform duration-200 active:scale-95"
              >
                Ask me anything
                <span aria-hidden>↘</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#work"
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                See work
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <p
        aria-hidden
        data-readout
        className="pointer-events-none absolute bottom-4 left-5 hidden font-mono text-[11px] tabular-nums tracking-wide text-muted sm:left-10 sm:block"
      >
        move your cursor through the data
      </p>
    </section>
  );
}
