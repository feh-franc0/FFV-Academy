'use client';

import type { ReactNode } from 'react';

type Tone = 'live' | 'active' | 'warning' | 'info' | 'gold';

const TONE_CONFIG: Record<Tone, { color: string; pulse: boolean }> = {
  live: { color: 'var(--ffv-green)', pulse: true },
  active: { color: 'var(--ffv-green)', pulse: false },
  warning: { color: 'var(--ffv-orange)', pulse: false },
  info: { color: 'var(--ffv-blue)', pulse: false },
  gold: { color: 'var(--ffv-gold)', pulse: true },
};

/**
 * StatusBadge — pill com dot pulsante e texto uppercase mono.
 *
 * Padrão repetido em Hero, /news header, /sobre, /comunidade. Consolidado
 * em componente único para manter consistência visual.
 *
 * Uso:
 *   <StatusBadge tone="live">NOVOS ARTIGOS TODA SEMANA</StatusBadge>
 *   <StatusBadge tone="gold">CURADORIA EDITORIAL · 04/05/2026</StatusBadge>
 */
export function StatusBadge({
  tone = 'live',
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const { color, pulse } = TONE_CONFIG[tone];

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono"
      style={{
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 'var(--radius-full)',
          background: color,
          boxShadow: pulse ? `0 0 8px ${color}` : 'none',
          animation: pulse ? 'pulse 2s ease-in-out infinite' : undefined,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}
