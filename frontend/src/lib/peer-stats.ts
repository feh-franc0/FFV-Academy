/**
 * Peer comparison — calcula percentil mock contra "a turma da semana".
 *
 * MVP: derivação determinística baseada no próprio score, sem backend.
 * Score ~= percentil com leve variação pseudo-randômica baseada em hash
 * do slug + dia da semana — garante estabilidade dentro do mesmo dia mas
 * variação fim-de-semana → semana.
 *
 * TODO(backend): substituir por GET /api/v1/module/:id/stats que devolve
 * `{ p25, p50, p75, p90, totalAttempts }` calculado a partir de quiz_scores
 * agregados das últimas 168h. Quando disponível, marcar `mock=false` e
 * usar `percentileFromBuckets(score, buckets)`.
 */

export interface PeerComparison {
  /** Score do usuário (0-100). */
  score: number;
  /** Percentil estimado (0-100) — "você ficou melhor que X% da turma". */
  percentile: number;
  /** Marcador para tracking até endpoint real existir. */
  mock: boolean;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Calcula percentil mock para um score.
 *
 * Fórmula: `percentile = score * 0.85 + noise * 15` onde `noise ∈ [0, 1)`
 * derivado do hash(slug + ISO-week). Clamp em `[0, 100]`.
 *
 * Por que esse formato? Score 100 → percentil ~85-100 (perfect raramente é
 * top 1%, mas é top decile). Score 50 → percentil ~42-57 (mediana). Score 0
 * → percentil ~0-15 (cauda inferior). Não é cientificamente justo, mas é
 * **plausível** e **estável dentro do mesmo dia**.
 *
 * @param score - Score do usuário (0-100).
 * @param slug - Identificador do módulo/simulado para gerar noise estável.
 */
export function calculatePeerPercentile(score: number, slug: string): PeerComparison {
  const clampedScore = Math.max(0, Math.min(100, score));
  const today = new Date();
  // ISO week (ano + número semana) — muda toda segunda-feira
  const isoWeek = `${today.getUTCFullYear()}-W${Math.floor(today.getUTCDate() / 7)}`;
  const seed = hashString(`${slug}::${isoWeek}`);
  const noise = (seed % 1000) / 1000; // [0, 1)
  const raw = clampedScore * 0.85 + noise * 15;
  const percentile = Math.max(0, Math.min(100, Math.round(raw)));
  return { score: clampedScore, percentile, mock: true };
}
