// Easing curves catalogue — para motion cinematico alem do spring()
// Usar com interpolate() do Remotion via easing param

export const EASE = {
  outExpo: (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: (t: number): number => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  outBackStrong: (t: number): number => {
    const c = 2.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  inOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOutQuint: (t: number): number =>
    t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outElastic: (t: number): number => {
    const c = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c) + 1;
  },
  /** 0 → 1.15 (overshoot) → 1 — usar para numbers/CTA */
  overshoot: (t: number, amount = 0.15): number => {
    if (t < 0.6) return (t / 0.6) * (1 + amount);
    return 1 + amount - ((t - 0.6) / 0.4) * amount;
  },
  /** Anticipation: -0.05 → 0 → 1 — usar ANTES de eventos grandes */
  anticipation: (t: number): number => {
    if (t < 0.2) return -0.05 * (t / 0.2);
    return -0.05 + 1.05 * ((t - 0.2) / 0.8);
  },
};

/**
 * Aplica uma curva de easing a um progresso normalizado [0,1].
 * Uso: const y = 100 * EASE.outBack(progress);
 */
export function ease(fn: (t: number) => number, progress: number): number {
  return fn(Math.max(0, Math.min(1, progress)));
}
