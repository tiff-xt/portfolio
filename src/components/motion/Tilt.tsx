"use client";
import { type ReactNode, useRef } from "react";

/**
 * Pointer-driven 3D tilt with a moving specular highlight. Writes CSS custom
 * properties only; the transition on the element does the smoothing.
 */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/tilt motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] ${className ?? ""}`}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgb(255 255 255 / 0.12), transparent 45%)",
        }}
      />
    </div>
  );
}
