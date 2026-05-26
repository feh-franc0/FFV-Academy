'use client';

import type { ReactNode } from 'react';

/**
 * BigNumberCard — KPI card grande pra dashboards admin.
 *
 * Comportamento:
 *  - Se `prev` está definido: calcula delta % vs período anterior e mostra
 *    seta colorida (↑ verde se diff>0, ↓ vermelho se diff<0; invertido se
 *    `inversed=true` pra métricas onde menor é melhor tipo churn).
 *  - Se `prev` é undefined mas `periodLabel` definido: mostra só o rótulo.
 *  - Casos especiais: prev=0 e value=0 → "sem variação"; prev=0 e value>0 → "novo".
 *
 * Usado no /admin (dashboard global) e em cada listagem (header com 3-4 cards).
 */
export function BigNumberCard({
  label,
  value,
  prev,
  periodLabel,
  inversed = false,
  hint,
}: {
  label: string;
  value: number | string;
  prev?: number;
  periodLabel?: string;
  inversed?: boolean;
  hint?: string;
}) {
  const numeric = typeof value === 'number';
  let deltaUI: ReactNode = null;

  if (numeric && prev !== undefined) {
    const v = value as number;
    const diff = v - prev;
    if (prev === 0 && v === 0) {
      deltaUI = (
        <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          sem variação{periodLabel ? ` vs ${periodLabel} anterior` : ''}
        </span>
      );
    } else if (prev === 0) {
      deltaUI = (
        <span className="text-xs font-semibold" style={{ color: '#15803d' }}>
          novo{periodLabel ? ` (${periodLabel})` : ''}
        </span>
      );
    } else {
      const pct = (diff / prev) * 100;
      const positive = inversed ? diff < 0 : diff > 0;
      const negative = inversed ? diff > 0 : diff < 0;
      const color = positive ? '#15803d' : negative ? '#dc2626' : 'var(--ffv-muted)';
      const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '·';
      deltaUI = (
        <span className="text-xs font-semibold" style={{ color }}>
          {arrow} {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
          {periodLabel && (
            <span className="ml-1 font-normal" style={{ color: 'var(--ffv-muted)' }}>
              vs {periodLabel} anterior
            </span>
          )}
        </span>
      );
    }
  } else if (hint) {
    deltaUI = <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{hint}</span>;
  } else if (periodLabel) {
    deltaUI = (
      <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
        {periodLabel}
      </span>
    );
  }

  return (
    <div
      className="p-5 rounded-xl flex flex-col gap-2"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div
        className="text-xs uppercase tracking-widest font-semibold"
        style={{ color: 'var(--ffv-muted)' }}
      >
        {label}
      </div>
      <div className="text-4xl font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
        {numeric ? (value as number).toLocaleString('pt-BR') : value}
      </div>
      {deltaUI}
    </div>
  );
}
