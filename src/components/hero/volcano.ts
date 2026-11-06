/**
 * Synthetic volcano-plot distribution: x is effect size (log fold change),
 * y is significance (−log10 p). Most points are noise near the origin; a few
 * reach significance and are "hot". Seeded so SSR/CSR and reloads match.
 */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Significance thresholds, shared with the hero's axis overlay. */
export const FC_THRESHOLD = 1.05;
export const P_THRESHOLD = 2.6;
export const X_DOMAIN = 3.2;
export const Y_DOMAIN = 11;

export type VolcanoPoint = { x: number; y: number; hot: -1 | 0 | 1 };

export function volcano(n: number, seed = 7): VolcanoPoint[] {
  const rand = mulberry32(seed);
  const gauss = () => {
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const out: VolcanoPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.max(-3, Math.min(3, gauss() * 0.9));
    // Significance grows with |effect|, plus exponential noise.
    const y = Math.min(10.4, Math.pow(Math.abs(x), 1.6) * 1.9 + -Math.log(1 - rand()) * 0.55);
    const hot = Math.abs(x) > FC_THRESHOLD && y > P_THRESHOLD ? (x > 0 ? 1 : -1) : 0;
    out.push({ x, y, hot });
  }
  return out;
}
