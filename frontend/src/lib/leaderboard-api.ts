'use client';

/**
 * Leaderboard API adapter.
 * GET /api/v1/leaderboard  → top-N da semana
 * GET /api/v1/leaderboard/me → rank e XP do usuário logado
 */

import { hasBackend, apiGet } from './api-client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xpGained: number;
  avatarInitials: string;
}

export interface LeaderboardData {
  items: LeaderboardEntry[];
  weekStart: string;
}

export interface MyRank {
  rank: number;
  xpGained: number;
  userId: string;
}

export async function getLeaderboard(): Promise<LeaderboardData | null> {
  if (!hasBackend()) return null;
  try {
    return await apiGet<LeaderboardData>('/api/v1/leaderboard');
  } catch {
    return null;
  }
}

/**
 * Top-10 público — para uso na home, sem auth.
 * Backend retorna { weekStart, entries, total } com IDs vazios.
 */
interface PublicLeaderboardResponse {
  weekStart: string;
  entries: Array<{ rank: number; userId: string; userName: string; score: number }>;
  total: number;
}

export interface PublicLeaderboardEntry {
  rank: number;
  name: string;
  xpGained: number;
  avatarInitials: string;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type RankPeriod = 'weekly' | 'monthly' | 'yearly' | 'all-time';

export interface PublicLeaderboardData {
  period: RankPeriod;
  periodStart: string;
  periodEnd: string;
  entries: PublicLeaderboardEntry[];
}

export async function getPublicLeaderboard(
  period: RankPeriod = 'weekly',
  limit = 10,
): Promise<PublicLeaderboardData | null> {
  if (!hasBackend()) return null;
  try {
    const data = await apiGet<PublicLeaderboardResponse & { period: string; periodStart: string; periodEnd: string }>(
      `/api/v1/leaderboard/public?period=${period}&limit=${limit}`,
      false,
    );
    return {
      period: (data.period as RankPeriod) ?? period,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      entries: data.entries.map(e => ({
        rank: e.rank,
        name: e.userName,
        xpGained: e.score,
        avatarInitials: initialsFromName(e.userName),
      })),
    };
  } catch {
    return null;
  }
}

export interface MyRankByPeriod {
  period: RankPeriod;
  rank: number;
  xp: number;
}

export async function getMyRankAll(): Promise<MyRankByPeriod[] | null> {
  if (!hasBackend()) return null;
  try {
    const data = await apiGet<{ ranks: MyRankByPeriod[] }>('/api/v1/leaderboard/me/all');
    return data.ranks;
  } catch {
    return null;
  }
}

export async function getMyRank(): Promise<MyRank | null> {
  if (!hasBackend()) return null;
  try {
    return await apiGet<MyRank>('/api/v1/leaderboard/me');
  } catch {
    return null;
  }
}
