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
import { FC_THRESHOLD, LATENCY, P_THRESHOLD, latencyY, scenes, volcanoX, volcanoY } from "./scenes";
import { mulberry32 } from "./volcano";
import { clamp, easeOutExpo } from "@/lib/motion/tokens";

type Props = {
  /** The hero section: sizing, scroll progress and the data-particles flag. */
  hostRef: React.RefObject<HTMLElement | null>;
  /** The real headline text the particles assemble into. */
  targetRef: React.RefObject<HTMLElement | null>;
};

/**
 * Where the plot sits inside the hero. Beside the headline on a wide screen;
 * on a narrow one, between the nav and the headline, however much room that is.
 */
function plotRect(w: number, h: number, headlineTop: number) {
  if (w >= 900) return { x0: w * 0.45, x1: w * 0.97, y0: h * 0.12, y1: h * 0.76 };
  const y0 = 112;
  return { x0: w * 0.06, x1: w * 0.94, y0, y1: Math.max(y0 + 130, headlineTop - 62) };
}

/** How long a picture is held, and how long the change to the next takes. */
const HOLD_MS = 7000;
const CHANGE_MS = 2000;

/**
 * GPU particle field. Thousands of points draw a picture (a seat map, a
 * latency chart, a volcano plot, in turn), lend most of themselves to the
 * headline's exact letterforms, and scatter back into the picture on scroll.
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
      uMix: { value: 0 },
      uMouse: { value: [-9999, -9999] },
      uMouseStrength: { value: 0 },
      uRadius: { value: 120 },
      uPixelRatio: { value: 1 },
      uSize: { value: 2.2 },
      uGlow: { value: 0 },
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
      uniforms.uAccent.value.setStyle(css("--accent", "#a78bfa"), LinearSRGBColorSpace);
      uniforms.uAccent2.value.setStyle(css("--accent-2", "#4f95ff"), LinearSRGBColorSpace);
      const dark = cs.colorScheme.includes("dark");
      material.blending = dark ? AdditiveBlending : NormalBlending;
      // Neon glow only reads on a dark ground; on paper it just looks blurry.
      uniforms.uGlow.value = dark ? 1 : 0;
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

    let rect = plotRect(1, 1, 0);

    /** Expose plot geometry to the DOM overlays as CSS variables. */
    const publishAxes = () => {
      const w = rect.x1 - rect.x0;
      const h = rect.y1 - rect.y0;
      const vars: Record<string, number> = {
        x0: rect.x0,
        x1: rect.x1,
        y0: rect.y0,
        y1: rect.y1,
        zero: rect.x0 + volcanoX(0, w),
        fcL: rect.x0 + volcanoX(-FC_THRESHOLD, w),
        fcR: rect.x0 + volcanoX(FC_THRESHOLD, w),
        thr: rect.y0 + volcanoY(P_THRESHOLD, h),
        open: rect.x0 + LATENCY.open * w,
        budget: rect.y0 + latencyY(LATENCY.budget, h),
      };
      for (const [k, v] of Object.entries(vars)) host.style.setProperty(`--plot-${k}`, `${v.toFixed(1)}px`);
    };

    // ── Scenes ───────────────────────────────────────────────
    /** Per scene: where every point sits, and which are coloured. */
    let pictures: { at: Float32Array; hot: Float32Array }[] = [];
    let shown = 0;
    let heading = -1; // the scene being changed to, or −1
    let changeStart = 0;
    let holdStart = 0;
    const hint = readout?.textContent ?? "";

    const load = (name: "A" | "B", index: number) => {
      const suffix = name === "A" ? "" : "B";
      const at = geometry.getAttribute(`aScatter${suffix}`) as BufferAttribute;
      const hot = geometry.getAttribute(`aHot${suffix}`) as BufferAttribute;
      (at.array as Float32Array).set(pictures[index].at);
      (hot.array as Float32Array).set(pictures[index].hot);
      at.needsUpdate = true;
      hot.needsUpdate = true;
    };
    const land = (index: number) => {
      shown = index;
      heading = -1;
      load("A", index);
      uniforms.uMix.value = 0;
    };
    const go = (index: number, now: number) => {
      if (index === (heading < 0 ? shown : heading)) return;
      if (heading >= 0) land(heading);
      host.setAttribute("data-scene", scenes[index].id);
      if (readout) readout.textContent = hint;
      if (reduce) {
        land(index);
      } else {
        heading = index;
        load("B", index);
        changeStart = now;
      }
      holdStart = now + CHANGE_MS;
    };

    const build = () => {
      const hostBox = host.getBoundingClientRect();
      width = hostBox.width;
      height = hostBox.height;
      rect = plotRect(width, height, target.getBoundingClientRect().top - hostBox.top);
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
      const rand = mulberry32(11);
      const textPts = sampleText();
      // Shuffle samples so the subset is spatially even.
      for (let i = textPts.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [textPts[i], textPts[j]] = [textPts[j], textPts[i]];
      }
      const textCount = textPts.length ? Math.round(n * 0.64) : 0;

      // Coloured points stay in the picture, so each scene keeps its story
      // while the rest spell the headline.
      pictures = scenes.map((scene) => {
        const pts = scene.points(n, n - textCount, rect.x1 - rect.x0, rect.y1 - rect.y0);
        const at = new Float32Array(n * 2);
        const hot = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          at[i * 2] = rect.x0 + pts[i].x;
          at[i * 2 + 1] = rect.y0 + pts[i].y;
          hot[i] = pts[i].hot;
        }
        return { at, hot };
      });

      const tgt = new Float32Array(n * 2);
      const seed = new Float32Array(n);
      const join = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        if (i < textCount) {
          const [tx, ty] = textPts[i % textPts.length];
          tgt[i * 2] = tx + (rand() - 0.5) * 1.6;
          tgt[i * 2 + 1] = ty + (rand() - 0.5) * 1.6;
          join[i] = 1;
        }
        seed[i] = rand();
      }
      if (heading >= 0) shown = heading;
      heading = -1;
      uniforms.uMix.value = 0;
      const current = pictures[shown];
      geometry.setAttribute("aScatter", new BufferAttribute(current.at.slice(), 2));
      geometry.setAttribute("aScatterB", new BufferAttribute(current.at.slice(), 2));
      geometry.setAttribute("aHot", new BufferAttribute(current.hot.slice(), 1));
      geometry.setAttribute("aHotB", new BufferAttribute(current.hot.slice(), 1));
      geometry.setAttribute("aTarget", new BufferAttribute(tgt, 2));
      geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
      geometry.setAttribute("aJoin", new BufferAttribute(join, 1));
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
        const scene = scenes[heading < 0 ? shown : heading];
        readout.textContent =
          scene.readout(mouse.tx - rect.x0, mouse.ty - rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0) ?? hint;
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

      if (heading >= 0) {
        uniforms.uMix.value = clamp((t - changeStart) / CHANGE_MS);
        if (uniforms.uMix.value >= 1) land(heading);
      } else if (!reduce && holdStart && t - holdStart > HOLD_MS) {
        go((shown + 1) % scenes.length, t);
      }

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

    // The caption's buttons pick a picture directly.
    const onPick = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest<HTMLElement>("[data-scene-go]");
      if (!button) return;
      go(Number(button.dataset.sceneGo), performance.now());
      start();
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      host.removeAttribute("data-particles");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    // Sample only after the display font has loaded, or letterforms won't match.
    // Wait for the display font (or letterforms won't match), then for an idle
    // moment, so shader compilation never competes with hydration and input.
    const whenIdle = (fn: () => void) =>
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(fn, { timeout: 1200 })
        : window.setTimeout(fn, 200);
    const init = () => {
      if (disposed) return;
      applyTheme();
      build();
      host.setAttribute("data-particles", "on");
      host.setAttribute("data-scene", scenes[shown].id);
      host.addEventListener("click", onPick);
      introStart = reduce ? 0 : performance.now() + 250;
      holdStart = performance.now() + 1500;
      io.observe(host);
      ro.observe(host);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      scheme.addEventListener("change", onScheme);
      document.addEventListener("visibilitychange", onVisibility);
      if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });
      start();
    };
    document.fonts.ready.then(() => whenIdle(init));

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
      host.removeEventListener("click", onPick);
      host.removeAttribute("data-particles");
      host.removeAttribute("data-scene");
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [hostRef, targetRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
