import { describe, expect, it } from "vitest";
import { scenes } from "./scenes";

describe("hero scenes", () => {
  for (const scene of scenes) {
    for (const [n, w, h] of [
      [9000, 750, 576],
      [4200, 343, 270],
    ]) {
      it(`${scene.id} places ${n} points and colours only the ones that stay`, () => {
        const stay = n - Math.round(n * 0.64);
        const pts = scene.points(n, stay, w, h);
        expect(pts).toHaveLength(n);
        expect(pts.slice(0, n - stay).every((p) => p.hot === 0)).toBe(true);
        expect(pts.some((p) => p.hot !== 0)).toBe(true);
        for (const p of pts) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
          expect(p.x).toBeGreaterThan(-w * 0.05);
          expect(p.x).toBeLessThan(w * 1.05);
          expect(p.y).toBeGreaterThan(-h * 0.1);
          expect(p.y).toBeLessThan(h * 1.05);
        }
      });
    }
  }
});
