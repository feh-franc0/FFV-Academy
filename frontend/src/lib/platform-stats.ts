'use client';

/**
 * Platform-wide stats (read-only, public).
 *
 * GET /api/v1/stats → { totalUsers, activeWeekly, totalXpAwarded }
 *
 * Used by the home page social-proof bar. Falls back gracefully when the
 * backend isn't reachable — the home shows an honest "primeira leva de devs"
 * placeholder instead of a fake number.
 */

import { hasBackend, apiGet } from './api-client';

export interface PlatformStats {
  totalUsers: number;
  activeWeekly: number;
  totalXpAwarded: number;
}

export async function getPlatformStats(): Promise<PlatformStats | null> {
  if (!hasBackend()) return null;
  try {
    return await apiGet<PlatformStats>('/api/v1/stats', false);
  } catch {
    return null;
  }
}
