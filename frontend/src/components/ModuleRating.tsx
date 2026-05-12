'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';

interface Props {
  slug: string;
}

export function ModuleRating({ slug }: Props) {
  const { state, rate } = useGameState();
  const current = state?.moduleRatings[slug] ?? null;

  return (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>Este módulo foi útil?</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => rate(slug, 1)}
          aria-label="Sim, foi útil"
          aria-pressed={current === 1}
          style={{
            background: current === 1
              ? 'color-mix(in srgb, var(--ffv-green) 15%, transparent)'
              : 'var(--ffv-bg2)',
            border: `1px solid ${current === 1 ? 'color-mix(in srgb, var(--ffv-green) 40%, transparent)' : 'var(--ffv-border)'}`,
            color: current === 1 ? 'var(--ffv-green)' : 'var(--ffv-muted)',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <ThumbsUp size={13} fill={current === 1 ? 'currentColor' : 'none'} strokeWidth={1.8} />
          Sim
        </button>
        <button
          type="button"
          onClick={() => rate(slug, -1)}
          aria-label="Não, não foi útil"
          aria-pressed={current === -1}
          style={{
            background: current === -1
              ? 'color-mix(in srgb, var(--ffv-red) 12%, transparent)'
              : 'var(--ffv-bg2)',
            border: `1px solid ${current === -1 ? 'color-mix(in srgb, var(--ffv-red) 35%, transparent)' : 'var(--ffv-border)'}`,
            color: current === -1 ? 'var(--ffv-red)' : 'var(--ffv-muted)',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <ThumbsDown size={13} fill={current === -1 ? 'currentColor' : 'none'} strokeWidth={1.8} />
          Não
        </button>
      </div>
    </div>
  );
}
