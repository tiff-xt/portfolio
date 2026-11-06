/** JS mirror of the CSS motion tokens in globals.css. */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = { 1: 120, 2: 220, 3: 420, 4: 800 } as const;

/** Critically-damped-ish spring step for pointer-follow effects. */
export function springStep(
  state: { x: number; v: number },
  target: number,
  dt: number,
  { stiffness = 170, damping = 20 } = {},
) {
  const a = stiffness * (target - state.x) - damping * state.v;
  state.v += a * dt;
  state.x += state.v * dt;
  return state.x;
}

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
