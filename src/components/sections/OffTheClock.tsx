"use client";
import ride from "@/assets/ride.jpg";
import { askAssistant } from "../assistant/bus";
import { Reveal } from "../motion/Reveal";
import { HalftonePhoto } from "./HalftonePhoto";
import { SectionHeading } from "./SectionHeading";

const interests = [
  { title: "Photography & editing", note: "Framing it, then grading it.", Icon: Aperture },
  { title: "Video editing", note: "Ride footage, cut to the beat.", Icon: Timeline },
  { title: "3D printing", note: "Design it, slice it, layer by layer.", Icon: Layers },
  { title: "Cooking", note: "The most iterative thing I make.", Icon: Steam },
  { title: "Gaming", note: "Where a lot of my taste in feedback and feel comes from.", Icon: PixelHeart },
];

export function OffTheClock() {
  return (
    <section id="life" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="05" kicker="Off the clock" title="When I'm not shipping, I'm riding." />

        <Reveal>
          <figure>
            <HalftonePhoto
              src={ride}
              alt="Me in a pink top and white patterned helmet, sitting on a black motorcycle at dusk, looking out over open fields."
              focus={[0.52, 0.5]}
              sizes="(min-width: 1200px) 1152px, 100vw"
              className="aspect-[4/5] rounded-3xl border border-line sm:aspect-[16/9]"
            />
            <figcaption className="mt-3 flex justify-between gap-4 font-mono text-[11px] text-muted">
              <span>Motorcycles: my main thing right now.</span>
              <span className="hidden sm:inline">Hover the photo to see it as data.</span>
            </figcaption>
          </figure>
        </Reveal>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {interests.map(({ title, note, Icon }, i) => (
            <Reveal
              as="li"
              key={title}
              index={i}
              className="group rounded-2xl border border-line bg-surface p-5 transition-colors duration-300 hover:border-line-strong"
            >
              <Icon />
              <p className="mt-5 font-medium leading-snug">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{note}</p>
            </Reveal>
          ))}
          <li className="col-span-2 flex items-center sm:col-span-3 lg:col-span-5">
            <button
              type="button"
              onClick={() => askAssistant("What do you do outside of work?")}
              className="mt-4 text-sm underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
            >
              Ask the assistant what I do outside work →
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* Small icons, each with one hover micro-interaction tied to the hobby. */
const svg = "size-9 text-fg";

function Aperture() {
  return (
    <svg viewBox="0 0 36 36" className={svg} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="18" cy="18" r="15" />
      <g className="origin-center transition-transform duration-700 ease-[var(--ease-spring)] group-hover:rotate-[60deg]">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M18 3 L24 16" transform={`rotate(${a} 18 18)`} />
        ))}
      </g>
      <circle
        cx="18"
        cy="18"
        r="5"
        className="origin-center fill-accent stroke-none transition-transform duration-500 group-hover:scale-50"
      />
    </svg>
  );
}

function Timeline() {
  return (
    <svg viewBox="0 0 36 36" className={svg} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="9" width="12" height="7" rx="1.5" />
      <rect x="17" y="9" width="16" height="7" rx="1.5" />
      <rect x="3" y="20" width="20" height="7" rx="1.5" />
      <rect x="25" y="20" width="8" height="7" rx="1.5" />
      <line
        x1="8"
        y1="5"
        x2="8"
        y2="31"
        className="stroke-accent transition-transform duration-1000 ease-in-out group-hover:translate-x-[20px]"
        strokeWidth="2"
      />
    </svg>
  );
}

function Layers() {
  return (
    <svg viewBox="0 0 36 36" className={svg} fill="currentColor" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={8 + i}
          y={29 - i * 5}
          width={20 - i * 2}
          height="3.2"
          rx="1"
          className={`origin-left transition-transform duration-300 ${i > 1 ? "group-hover:scale-x-100 scale-x-0 fill-accent" : ""}`}
          style={{ transitionDelay: `${(i - 2) * 140}ms` }}
        />
      ))}
    </svg>
  );
}

function Steam() {
  return (
    <svg
      viewBox="0 0 36 36"
      className={svg}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 21h26M7 21c0 6 4 10 11 10s11-4 11-10" />
      {[12, 18, 24].map((x, i) => (
        <path
          key={x}
          d={`M${x} 16c-2-2 2-4 0-6s2-4 0-6`}
          className="stroke-accent opacity-0 transition-all duration-700 group-hover:-translate-y-1 group-hover:opacity-100"
          style={{ transitionDelay: `${i * 120}ms` }}
        />
      ))}
    </svg>
  );
}

function PixelHeart() {
  const rows = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  return (
    <svg viewBox="0 0 36 36" className={svg} aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "1" ? (
            <rect
              key={`${x}-${y}`}
              x={4 + x * 4}
              y={6 + y * 4}
              width="3.4"
              height="3.4"
              className="fill-fg transition-colors duration-150 group-hover:fill-accent"
              style={{ transitionDelay: `${(x + y) * 35}ms` }}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
