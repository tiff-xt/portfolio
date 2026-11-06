"use client";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  src: StaticImageData;
  alt: string;
  /** Where the reveal starts, as fractions of the frame (usually the subject). */
  focus?: [number, number];
  className?: string;
  sizes?: string;
};

/**
 * A photo that arrives as data. It's first drawn as a colour halftone (each
 * dot sized by brightness, like an LED matrix), then the real photo opens up
 * from the subject. Afterwards, hovering shows a halftone lens under the cursor.
 *
 * The canvas is painted once (and again on resize or theme change); every
 * animation after that is CSS clip-path or mask, so it runs on the compositor.
 * The <img> is the real content; the canvas is decoration.
 */
export function HalftonePhoto({ src, alt, focus = [0.5, 0.5], className, sizes }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const source = new window.Image();
    source.decoding = "async";
    source.src = src.src;
    let disposed = false;
    let reveal = 0;
    let done = 0;

    const paint = () => {
      if (disposed || !source.complete || !source.naturalWidth) return;
      const { width, height } = frame.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Sample the photo as object-fit: cover would show it.
      const cell = width < 640 ? 7 : 9;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const scale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (source.naturalWidth - sw) * focus[0];
      const sy = (source.naturalHeight - sh) * 0.5;
      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true })!;
      sctx.drawImage(source, sx, sy, sw, sh, 0, 0, cols, rows);
      const px = sctx.getImageData(0, 0, cols, rows).data;

      const dark = getComputedStyle(document.documentElement).colorScheme.includes("dark");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle =
        getComputedStyle(frame).getPropertyValue("--halftone-bg").trim() || (dark ? "#0b0c0e" : "#f3f0e8");
      ctx.fillRect(0, 0, width, height);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
          const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          // Dark theme: light emits (big bright dots). Light theme: ink prints.
          const weight = dark ? l : 1 - l * 0.85;
          const radius = (cell / 2) * Math.sqrt(weight) * 0.95;
          if (radius < 0.4) continue;
          ctx.fillStyle = `rgb(${r} ${g} ${b})`;
          ctx.beginPath();
          ctx.arc(x * cell + cell / 2, y * cell + cell / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      frame.dataset.ready = "";
    };

    source.onload = paint;
    if (source.complete) paint();

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // Let the halftone register before the photo opens up.
        reveal = window.setTimeout(() => {
          frame.setAttribute("data-in", "");
          // Once the photo has fully opened, the dots become a hover lens.
          done = window.setTimeout(() => frame.setAttribute("data-done", ""), 1700);
        }, 500);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(frame);

    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(paint, 150);
    });
    ro.observe(frame);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mql = matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", paint);

    return () => {
      disposed = true;
      clearTimeout(t);
      clearTimeout(reveal);
      clearTimeout(done);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      mql.removeEventListener("change", paint);
    };
  }, [src.src, focus]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--lx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={onMove}
      className={`halftone group/ht relative overflow-hidden ${className ?? ""}`}
      style={{ "--fx": `${focus[0] * 100}%`, "--fy": `${focus[1] * 100}%` } as React.CSSProperties}
    >
      <canvas ref={canvasRef} aria-hidden className="halftone-dots absolute inset-0 size-full" />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        placeholder="blur"
        className="halftone-photo object-cover"
        style={{ objectPosition: `${focus[0] * 100}% 50%` }}
      />
    </div>
  );
}
