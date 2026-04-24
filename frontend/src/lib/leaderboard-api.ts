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

export async function getMyRank(): Promise<MyRank | null> {
  if (!hasBackend()) return null;
  try {
    return await apiGet<MyRank>('/api/v1/leaderboard/me');
  } catch {
    return null;
  }
}
