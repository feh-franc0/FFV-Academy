/**
 * public-stats-api — cliente do GET /api/v1/stats (público, cache 60s).
 *
 * Endpoint retorna métricas agregadas sem PII. Frontend usa em
 * /stats-publicas + landing trust strip + Open Admin radical.
 *
 * V1: campos `basesLive`, `studyRequestsTotal`, `studyRequestsDelivered`
 * adicionados em mai/2026. Versões antigas do backend retornam só
 * `totalUsers/activeWeekly/totalXpAwarded` — code path lida com ausência
 * via `?? 0`.
 */

import { z } from 'zod';

export const PublicStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeWeekly: z.number().int().nonnegative(),
  totalXpAwarded: z.number().int().nonnegative(),
  // Campos novos — opcionais pra compat com backend antigo.
  basesLive: z.number().int().nonnegative().optional(),
  studyRequestsTotal: z.number().int().nonnegative().optional(),
  studyRequestsDelivered: z.number().int().nonnegative().optional(),
});

export type PublicStats = z.infer<typeof PublicStatsSchema>;

function getApiBase(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
}

/**
 * Busca stats públicas. Lança erro em falha de rede ou schema.
 * Caller (PublicStatsClient) decide se cai pra fallback estático.
 */
export async function fetchPublicStats(signal?: AbortSignal): Promise<PublicStats> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/v1/stats`, {
    method: 'GET',
    signal,
    credentials: 'omit',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao buscar stats`);
  }
  const json = await res.json();
  return PublicStatsSchema.parse(json);
}

/**
 * Deriva SLA cumprido em % a partir de delivered/total.
 * Honesto: se total < 5, retorna null (amostra insuficiente).
 */
export function deriveSlaPercentage(stats: Pick<PublicStats, 'studyRequestsTotal' | 'studyRequestsDelivered'>): number | null {
  const total = stats.studyRequestsTotal ?? 0;
  const delivered = stats.studyRequestsDelivered ?? 0;
  if (total < 5) return null;
  return Math.round((delivered / total) * 100);
}
