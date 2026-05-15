import { describe, it, expect } from 'vitest';
import { calculatePeerPercentile } from '@/lib/peer-stats';

describe('calculatePeerPercentile', () => {
  it('retorna percentil entre 0 e 100', () => {
    for (const score of [0, 10, 50, 80, 100]) {
      const res = calculatePeerPercentile(score, 'modulo-x');
      expect(res.percentile).toBeGreaterThanOrEqual(0);
      expect(res.percentile).toBeLessThanOrEqual(100);
    }
  });

  it('é estável para o mesmo slug + score no mesmo dia', () => {
    const a = calculatePeerPercentile(75, 'arquitetura-rag');
    const b = calculatePeerPercentile(75, 'arquitetura-rag');
    expect(a.percentile).toBe(b.percentile);
  });

  it('marca mock=true', () => {
    expect(calculatePeerPercentile(50, 'x').mock).toBe(true);
  });

  it('clamp em [0,100] mesmo com inputs fora do range', () => {
    expect(calculatePeerPercentile(-10, 'x').score).toBe(0);
    expect(calculatePeerPercentile(150, 'x').score).toBe(100);
  });

  it('score alto tende a percentil alto', () => {
    const low = calculatePeerPercentile(10, 'a');
    const high = calculatePeerPercentile(95, 'a');
    expect(high.percentile).toBeGreaterThan(low.percentile);
  });
});
