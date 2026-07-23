import { describe, it, expect } from 'vitest';
import { deriveSlaPercentage, PublicStatsSchema } from '@/lib/public-stats-api';

describe('PublicStatsSchema', () => {
  it('aceita payload mínimo (sem campos novos)', () => {
    const parsed = PublicStatsSchema.parse({
      totalUsers: 100,
      activeWeekly: 20,
      totalXpAwarded: 5000,
    });
    expect(parsed.basesLive).toBeUndefined();
    expect(parsed.studyRequestsTotal).toBeUndefined();
  });

  it('aceita payload completo com campos novos', () => {
    const parsed = PublicStatsSchema.parse({
      totalUsers: 100,
      activeWeekly: 20,
      totalXpAwarded: 5000,
      basesLive: 2,
      studyRequestsTotal: 50,
      studyRequestsDelivered: 30,
    });
    expect(parsed.basesLive).toBe(2);
    expect(parsed.studyRequestsTotal).toBe(50);
    expect(parsed.studyRequestsDelivered).toBe(30);
  });

  it('rejeita valores negativos', () => {
    expect(() =>
      PublicStatsSchema.parse({
        totalUsers: -5,
        activeWeekly: 0,
        totalXpAwarded: 0,
      }),
    ).toThrow();
  });

  it('rejeita shape malformado', () => {
    expect(() => PublicStatsSchema.parse({ foo: 'bar' })).toThrow();
  });
});

describe('deriveSlaPercentage', () => {
  it('calcula % de SLA cumprido', () => {
    expect(deriveSlaPercentage({ studyRequestsTotal: 100, studyRequestsDelivered: 80 })).toBe(80);
    expect(deriveSlaPercentage({ studyRequestsTotal: 10, studyRequestsDelivered: 10 })).toBe(100);
  });

  it('retorna null se amostra < 5 (não inflate número)', () => {
    expect(deriveSlaPercentage({ studyRequestsTotal: 4, studyRequestsDelivered: 4 })).toBeNull();
    expect(deriveSlaPercentage({ studyRequestsTotal: 0, studyRequestsDelivered: 0 })).toBeNull();
  });

  it('lida com undefined gracefully', () => {
    expect(deriveSlaPercentage({})).toBeNull();
    expect(deriveSlaPercentage({ studyRequestsTotal: 10 })).toBe(0);
  });

  it('arredonda corretamente', () => {
    expect(deriveSlaPercentage({ studyRequestsTotal: 7, studyRequestsDelivered: 5 })).toBe(71); // 71.4 → 71
  });
});
