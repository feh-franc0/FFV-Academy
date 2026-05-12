import { describe, it, expect } from 'vitest';

/**
 * Tests pequenos para garantir que o tipo RankPeriod e os mapeamentos do
 * cliente leaderboard-api estão consistentes com o backend Go.
 *
 * Não chama o backend — apenas valida shape esperada.
 */
import type { RankPeriod, MyRankByPeriod, PublicLeaderboardEntry } from '@/lib/leaderboard-api';

describe('leaderboard-api types', () => {
  it('RankPeriod aceita 4 valores conhecidos', () => {
    const periods: RankPeriod[] = ['weekly', 'monthly', 'yearly', 'all-time'];
    expect(periods).toHaveLength(4);
  });

  it('MyRankByPeriod tem campos obrigatórios', () => {
    const r: MyRankByPeriod = { period: 'weekly', rank: 5, xp: 320 };
    expect(r.period).toBe('weekly');
    expect(r.rank).toBe(5);
    expect(r.xp).toBe(320);
  });

  it('PublicLeaderboardEntry tem rank, name, xpGained, avatarInitials', () => {
    const e: PublicLeaderboardEntry = {
      rank: 1,
      name: 'Fernando',
      xpGained: 1000,
      avatarInitials: 'FE',
    };
    expect(e.rank).toBe(1);
    expect(e.avatarInitials).toBe('FE');
  });
});
