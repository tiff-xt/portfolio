"use client";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const read = (): Theme => {
  const set = document.documentElement.dataset.theme as Theme | undefined;
  return set ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
};
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const mql = matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mql.removeEventListener("change", cb);
  };
};

/** Theme switch with a circular view-transition wipe from the button. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);

  const toggle = (e: React.MouseEvent) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
      listeners.forEach((l) => l());
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();

    const { clientX: x, clientY: y } = e;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="relative grid size-9 place-items-center rounded-full border border-line text-fg transition-colors hover:border-line-strong"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <mask id="moon">
          <rect width="24" height="24" fill="white" />
          <circle
            cx={theme === "dark" ? 17 : 30}
            cy={theme === "dark" ? 7 : 0}
            r="6"
            fill="black"
            className="transition-all duration-500 ease-out"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={theme === "dark" ? 8 : 5}
          fill="currentColor"
          mask="url(#moon)"
          className="transition-all duration-500 ease-out"
        />
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="origin-center transition-all duration-500 ease-out"
          style={{
            opacity: theme === "dark" ? 0 : 1,
            transform: theme === "dark" ? "rotate(-45deg) scale(.6)" : "none",
          }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
