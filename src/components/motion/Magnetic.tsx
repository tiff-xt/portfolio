"use client";
import { type ReactNode, useEffect, useRef } from "react";
import { springStep } from "@/lib/motion/tokens";

/**
 * Pulls its child toward the pointer with spring physics, then springs home.
 * Only runs a rAF loop while settling; disabled for coarse pointers and
 * reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;

    const sx = { x: 0, v: 0 };
    const sy = { x: 0, v: 0 };
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = 0;

    const tick = (t: number) => {
      const dt = Math.min(0.032, (t - (last || t)) / 1000 || 0.016);
      last = t;
      const x = springStep(sx, tx, dt);
      const y = springStep(sy, ty, dt);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      const settled = Math.abs(x - tx) + Math.abs(y - ty) + Math.abs(sx.v) + Math.abs(sy.v) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(tick);
      if (settled) last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      kick();
    };
    const leave = () => {
      tx = ty = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className ?? ""}`}>
      {children}
    </span>
  );
}
