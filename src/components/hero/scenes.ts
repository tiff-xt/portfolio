import { FC_THRESHOLD, P_THRESHOLD, X_DOMAIN, Y_DOMAIN, mulberry32, volcano } from "./volcano";

/**
 * The hero cycles through three pictures drawn with the same points: an
 * interface (a seat map mid-sale), a backend view (request latency as a sale
 * opens) and a data view (a volcano plot). Every scene places all n points in
 * pixels inside a w × h plot, y down.
 *
 * The first n − stay points are the ones that fly off to form the headline,
 * so they are never coloured: a scene only marks the last `stay` points hot.
 */
export type Pt = { x: number; y: number; hot: -1 | 0 | 1 };
export type SceneId = "seats" | "latency" | "volcano";
export type Scene = {
  id: SceneId;
  points: (n: number, stay: number, w: number, h: number) => Pt[];
  /** What the cursor is over, or null to show the default hint. */
  readout: (x: number, y: number, w: number, h: number) => string | null;
};

/** Move coloured points to the end; cool any that still land among the headline's. */
function hotLast(pts: Pt[], stay: number): Pt[] {
  const out = [...pts.filter((p) => p.hot === 0), ...pts.filter((p) => p.hot !== 0)];
  const first = out.length - stay;
  return out.map((p, i) => (i < first && p.hot !== 0 ? { ...p, hot: 0 } : p));
}

// ── Seat map ───────────────────────────────────────────────

type Seat = { x: number; y: number; row: number; number: number; state: -1 | 0 | 1 };

/** Rows that bow toward a stage at the top, split by two aisles. */
export function seatLayout(w: number, h: number) {
  const widest = w < 420 ? 18 : 24;
  const pitchX = w / (widest + 1.5);
  const top = h * 0.22;
  const rows = Math.max(5, Math.round((h * 0.74) / (pitchX * 1.12)) + 1);
  const pitchY = (h * 0.74) / (rows - 1);
  const bow = h * 0.11;
  const rowY = (row: number, dx: number) => top + row * pitchY - bow * (dx / (w / 2)) ** 2;
  const rand = mulberry32(23);
  const seats: Seat[] = [];
  for (let row = 0; row < rows; row++) {
    const count = Math.max(8, widest - Math.floor(row * 0.9));
    let number = 0;
    for (let j = 0; j < count; j++) {
      const dx = (j - (count - 1) / 2) * pitchX;
      if (Math.abs(Math.abs(dx) - w * 0.17) < pitchX * 0.5) continue; // aisle
      number++;
      // Front and centre sells first.
      const demand = 0.85 - 0.55 * (row / rows) - 0.3 * (Math.abs(dx) / (w / 2));
      const mine = row === 2 && dx > 0 && dx < pitchX * 4;
      seats.push({ x: w / 2 + dx, y: rowY(row, dx), row, number, state: mine ? 1 : rand() < demand ? -1 : 0 });
    }
  }
  return { seats, size: Math.min(pitchX, pitchY) * 0.5, pitchX, pitchY, rows, rowY };
}

const seats: Scene = {
  id: "seats",
  points(n, stay, w, h) {
    const { seats: all, size } = seatLayout(w, h);
    const rand = mulberry32(31);
    const stage = (hot: 0): Pt => {
      const dx = (rand() - 0.5) * w * 0.46;
      return { x: w / 2 + dx, y: h * 0.09 - h * 0.06 * (dx / (w * 0.23)) ** 2 + (rand() - 0.5) * 5, hot };
    };
    const out: Pt[] = [];
    const place = (first: number, count: number, grid: number, coloured: boolean) => {
      const onStage = Math.round(count * 0.08);
      for (let k = 0; k < count; k++) {
        if (k < onStage) {
          out[first + k] = stage(0);
          continue;
        }
        const seat = all[k % all.length];
        const cell = Math.floor(k / all.length) % (grid * grid);
        const step = size / grid;
        out[first + k] = {
          x: seat.x + ((cell % grid) - (grid - 1) / 2) * step + (rand() - 0.5) * 0.4,
          y: seat.y + (Math.floor(cell / grid) - (grid - 1) / 2) * step + (rand() - 0.5) * 0.4,
          hot: coloured ? seat.state : 0,
        };
      }
    };
    place(0, n - stay, 4, false);
    place(n - stay, stay, 3, true);
    return out;
  },
  readout(x, y, w, h) {
    const { rows, rowY, pitchX, pitchY } = seatLayout(w, h);
    const dx = x - w / 2;
    for (let row = 0; row < rows; row++) {
      if (Math.abs(rowY(row, dx) - y) < pitchY / 2) {
        const seat = Math.round(dx / pitchX);
        return `row ${String.fromCharCode(65 + row)}  ·  seat ${seat >= 0 ? "R" : "L"}${Math.abs(seat) + 1}`;
      }
    }
    return null;
  },
};

// ── Latency as a sale opens ────────────────────────────────

/** Log latency axis and the moment the sale opens, shared with the overlay. */
export const LATENCY = { min: 4, max: 4000, budget: 500, open: 0.22, seconds: 60 };
export const latencyY = (ms: number, h: number) =>
  h - (Math.log(ms / LATENCY.min) / Math.log(LATENCY.max / LATENCY.min)) * h;

const latency: Scene = {
  id: "latency",
  points(n, stay, w, h) {
    const rand = mulberry32(53);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
    const { open, min, max, budget } = LATENCY;
    const pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
      // A trickle before the sale, then a rush that tails off.
      const t = rand() < 0.14 ? rand() * open : open + (1 - open) * Math.pow(rand(), 1.8);
      const load = t < open ? 0.1 : Math.exp(-(t - open) * 3.4);
      let ms = 18 * (1 + 5 * load) * Math.exp(gauss() * (0.42 + 0.5 * load));
      if (rand() < 0.03) ms *= 3 + rand() * 6;
      ms = Math.min(max * 0.92, Math.max(min * 1.1, ms));
      pts.push({ x: t * w, y: latencyY(ms, h), hot: ms > budget ? 1 : 0 });
    }
    return hotLast(pts, stay);
  },
  readout(x, y, w, h) {
    if (x < 0 || x > w || y < 0 || y > h) return null;
    const t = (x / w - LATENCY.open) * LATENCY.seconds;
    const ms = LATENCY.min * Math.pow(LATENCY.max / LATENCY.min, (h - y) / h);
    return `t ${t >= 0 ? "+" : "−"}${Math.abs(t).toFixed(1)} s  ·  ${ms < 100 ? ms.toFixed(1) : Math.round(ms)} ms`;
  },
};

// ── Volcano plot ───────────────────────────────────────────

export const volcanoX = (v: number, w: number) => ((v + X_DOMAIN) / (2 * X_DOMAIN)) * w;
export const volcanoY = (v: number, h: number) => h - (v / Y_DOMAIN) * h;

const volcanoScene: Scene = {
  id: "volcano",
  points(n, stay, w, h) {
    return hotLast(
      volcano(n).map((p) => ({ x: volcanoX(p.x, w), y: volcanoY(p.y, h), hot: p.hot })),
      stay,
    );
  },
  readout(x, y, w, h) {
    const fc = (x / w) * 2 * X_DOMAIN - X_DOMAIN;
    const p = ((h - y) / h) * Y_DOMAIN;
    return `log₂FC ${fc >= 0 ? "+" : "−"}${Math.abs(fc).toFixed(2)}  ·  −log₁₀p ${Math.max(0, p).toFixed(2)}`;
  },
};

export const scenes: Scene[] = [seats, latency, volcanoScene];
export { FC_THRESHOLD, P_THRESHOLD };
