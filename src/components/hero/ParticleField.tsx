"use client";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LinearSRGBColorSpace,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { fragment, vertex } from "./shaders";
import { FC_THRESHOLD, P_THRESHOLD, X_DOMAIN, Y_DOMAIN, mulberry32, volcano } from "./volcano";
import { clamp, easeOutExpo } from "@/lib/motion/tokens";

type Props = {
  /** The hero section: sizing, scroll progress and the data-particles flag. */
  hostRef: React.RefObject<HTMLElement | null>;
  /** The real headline text the particles assemble into. */
  targetRef: React.RefObject<HTMLElement | null>;
};

/** Where the plot sits inside the hero, as fractions of its size. */
function plotRect(w: number, h: number) {
  return w >= 900
    ? { x0: w * 0.45, x1: w * 0.97, y0: h * 0.12, y1: h * 0.76 }
    : { x0: w * 0.06, x1: w * 0.94, y0: h * 0.11, y1: h * 0.45 };
}

/**
 * GPU particle field. Thousands of points start as a volcano plot, assemble
 * into the headline's exact letterforms, and scatter back into data on scroll.
 * All per-point motion runs in the vertex shader; the CPU only updates a
 * handful of uniforms per frame.
 *
 * Progressive enhancement: the DOM headline is always rendered. It's only
 * painted transparent (via [data-particles="on"]) once WebGL is running.
 */
export default function ParticleField({ hostRef, targetRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const target = targetRef.current;
    const canvas = canvasRef.current;
    if (!host || !target || !canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the DOM headline simply stays visible.
    }

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const readout = host.querySelector<HTMLElement>("[data-readout]");
    const scene = new Scene();
    const camera = new OrthographicCamera(0, 1, 0, 1, -1, 1);
    const geometry = new BufferGeometry();
    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: reduce ? 1 : 0 },
      uScroll: { value: 0 },
      uMouse: { value: [-9999, -9999] },
      uMouseStrength: { value: 0 },
      uRadius: { value: 120 },
      uPixelRatio: { value: 1 },
      uSize: { value: 2.2 },
      uInk: { value: new Color() },
      uAccent: { value: new Color() },
      uAccent2: { value: new Color() },
    };
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthTest: false,
      blending: NormalBlending,
    });
    const points = new Points(geometry, material);
    scene.add(points);

    let width = 0;
    let height = 0;
    let disposed = false;

    const applyTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      // The custom shader writes raw values with no output colour conversion,
      // so load CSS colours untouched rather than converting sRGB → linear.
      const css = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
      uniforms.uInk.value.setStyle(css("--particle", "#ddd"), LinearSRGBColorSpace);
      uniforms.uAccent.value.setStyle(css("--accent", "#f60"), LinearSRGBColorSpace);
      uniforms.uAccent2.value.setStyle(css("--accent-2", "#3cc"), LinearSRGBColorSpace);
      const dark = cs.colorScheme.includes("dark");
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    };

    /** Rasterise the headline with its computed font and sample filled pixels. */
    const sampleText = (): [number, number][] => {
      const hostBox = host.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const cs = getComputedStyle(target);
      const w = Math.ceil(box.width);
      const h = Math.ceil(box.height);
      if (!w || !h) return [];
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx)
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing;
      ctx.textBaseline = "alphabetic";
      const text = target.textContent ?? "";
      const m = ctx.measureText(text);
      const baseline = (h - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
      ctx.fillText(text, 0, baseline);
      const data = ctx.getImageData(0, 0, w, h).data;
      const ox = box.left - hostBox.left;
      const oy = box.top - hostBox.top;
      const out: [number, number][] = [];
      const step = 2;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 140) out.push([ox + x, oy + y]);
        }
      }
      return out;
    };

    let rect = plotRect(1, 1);
    const toScreen = (vx: number, vy: number): [number, number] => [
      rect.x0 + ((vx + X_DOMAIN) / (2 * X_DOMAIN)) * (rect.x1 - rect.x0),
      rect.y1 - (vy / Y_DOMAIN) * (rect.y1 - rect.y0),
    ];
    const fromScreen = (sx: number, sy: number): [number, number] => [
      ((sx - rect.x0) / (rect.x1 - rect.x0)) * 2 * X_DOMAIN - X_DOMAIN,
      ((rect.y1 - sy) / (rect.y1 - rect.y0)) * Y_DOMAIN,
    ];

    /** Expose plot geometry to the DOM axis overlay as CSS variables. */
    const publishAxes = () => {
      const [fcL] = toScreen(-FC_THRESHOLD, 0);
      const [fcR, thr] = toScreen(FC_THRESHOLD, P_THRESHOLD);
      const [zero] = toScreen(0, 0);
      const vars: Record<string, number> = { x0: rect.x0, x1: rect.x1, y0: rect.y0, y1: rect.y1, zero, fcL, fcR, thr };
      for (const [k, v] of Object.entries(vars)) host.style.setProperty(`--plot-${k}`, `${v.toFixed(1)}px`);
    };

    const build = () => {
      const hostBox = host.getBoundingClientRect();
      width = hostBox.width;
      height = hostBox.height;
      rect = plotRect(width, height);
      publishAxes();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      uniforms.uPixelRatio.value = dpr;
      uniforms.uSize.value = width < 640 ? 2 : 2.3;
      uniforms.uRadius.value = Math.max(90, Math.min(width, height) * 0.16);

      const n = width < 640 ? 4200 : 9000;
      const data = volcano(n);
      const rand = mulberry32(11);
      const textPts = sampleText();
      // Shuffle samples so the subset is spatially even.
      for (let i = textPts.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [textPts[i], textPts[j]] = [textPts[j], textPts[i]];
      }
      const textCount = textPts.length ? Math.round(n * 0.64) : 0;

      const scatter = new Float32Array(n * 2);
      const tgt = new Float32Array(n * 2);
      const seed = new Float32Array(n);
      const hot = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const [sx, sy] = toScreen(data[i].x, data[i].y);
        scatter[i * 2] = sx;
        scatter[i * 2 + 1] = sy;
        // Hot (significant) points stay in the plot so the data story persists.
        const joins = i < textCount && data[i].hot === 0;
        if (joins) {
          const [tx, ty] = textPts[i % textPts.length];
          tgt[i * 2] = tx + (rand() - 0.5) * 1.6;
          tgt[i * 2 + 1] = ty + (rand() - 0.5) * 1.6;
        } else {
          tgt[i * 2] = sx;
          tgt[i * 2 + 1] = sy;
        }
        seed[i] = rand();
        hot[i] = data[i].hot;
      }
      geometry.setAttribute("aScatter", new BufferAttribute(scatter, 2));
      geometry.setAttribute("aTarget", new BufferAttribute(tgt, 2));
      geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
      geometry.setAttribute("aHot", new BufferAttribute(hot, 1));
      // Bounds are computed in-shader; skip three's culling.
      geometry.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
      points.frustumCulled = false;
      geometry.setDrawRange(0, n);
    };

    // ── Pointer ──────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, lastMove: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const b = host.getBoundingClientRect();
      mouse.tx = e.clientX - b.left;
      mouse.ty = e.clientY - b.top;
      if (mouse.x < -9000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.lastMove = performance.now();
      if (readout && mouse.ty >= 0 && mouse.ty <= height) {
        const [fc, p] = fromScreen(mouse.tx, mouse.ty);
        readout.textContent = `log₂FC ${fc >= 0 ? "+" : "−"}${Math.abs(fc).toFixed(2)}  ·  −log₁₀p ${Math.max(0, p).toFixed(2)}`;
      }
    };

    // ── Loop ─────────────────────────────────────────────────
    let raf = 0;
    let visible = true;
    let introStart = 0;
    const render = (t: number) => {
      raf = 0;
      if (disposed) return;
      uniforms.uTime.value = t / 1000;
      if (introStart) uniforms.uProgress.value = easeOutExpo(clamp((t - introStart) / 2600));
      const b = host.getBoundingClientRect();
      uniforms.uScroll.value = clamp(-b.top / (b.height * 0.85));

      const idle = t - mouse.lastMove > 1400;
      mouse.strength += ((idle ? 0 : 1) - mouse.strength) * 0.06;
      mouse.x += (mouse.tx - mouse.x) * 0.14;
      mouse.y += (mouse.ty - mouse.y) * 0.14;
      uniforms.uMouse.value = [mouse.x, mouse.y];
      uniforms.uMouseStrength.value = mouse.strength;

      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && document.visibilityState === "visible";
      if (visible) start();
    });
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) start();
    };

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        start();
      }, 120);
    });

    const themeObserver = new MutationObserver(() => {
      applyTheme();
      start();
    });
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      applyTheme();
      start();
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      host.removeAttribute("data-particles");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    // Sample only after the display font has loaded, or letterforms won't match.
    document.fonts.ready.then(() => {
      if (disposed) return;
      applyTheme();
      build();
      host.setAttribute("data-particles", "on");
      introStart = reduce ? 0 : performance.now() + 250;
      io.observe(host);
      ro.observe(host);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      scheme.addEventListener("change", onScheme);
      document.addEventListener("visibilitychange", onVisibility);
      if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });
      start();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      host.removeAttribute("data-particles");
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [hostRef, targetRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
