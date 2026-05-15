'use client';

/**
 * PeerComparisonChip — gatilho emocional de validação social pós-quiz.
 *
 * Renderiza um chip "Você acertou X% — melhor que Y% da turma esta semana".
 * Verde quando ≥50, amber quando <50.
 *
 * MVP: percentil é mock (ver `lib/peer-stats.ts`). Substituir pelo retorno
 * real de `/api/v1/module/:id/stats` quando o endpoint existir.
 */

export interface PeerComparisonChipProps {
  /** Score do usuário (0-100). */
  score: number;
  /** Percentil 0-100 (vindo de `calculatePeerPercentile`). */
  percentile: number;
}

export function PeerComparisonChip({ score, percentile }: PeerComparisonChipProps) {
  const isGood = percentile >= 50;
  const accent = isGood ? 'var(--ffv-green)' : 'var(--ffv-yellow)';

  return (
    <div
      data-testid="peer-comparison-chip"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold mt-3"
      style={{
        background: `color-mix(in srgb, ${accent} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 32%, transparent)`,
        color: accent,
      }}
      aria-label={`Você acertou ${Math.round(score)}%, melhor que ${percentile}% da turma esta semana`}
    >
      <span aria-hidden>🎯</span>
      <span>
        Você acertou <b>{Math.round(score)}%</b> — melhor que <b>{percentile}%</b> da turma esta semana
      </span>
    </div>
  );
}
