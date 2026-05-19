'use client';

import { BrainCircuit } from 'lucide-react';

/**
 * FfvLogo — logo oficial da FFV Academy.
 *
 * Ícone BrainCircuit (lucide) + "FFV Academy" em duas pesagens.
 * Cores via CSS vars (`--foreground`, `--ffv-blue`) — adapta automaticamente
 * a qualquer base/tema (sage na medvet, navy na tech, etc.).
 *
 * Use em headers, footers e qualquer lugar que precise da identidade FFV.
 */

interface Props {
  /** Tamanho do ícone em px. Default: 20 (header), use 24/28 pra hero. */
  iconSize?: number;
  /** Tamanho do texto. Default: '16' (sm). Use 'lg' pra footer/landing. */
  size?: 'sm' | 'md' | 'lg';
  /** Inverte cores pra fundos escuros. */
  inverted?: boolean;
  /** Override do "FFV" (texto bold). Default: var(--foreground). */
  textColor?: string;
  /** Override do ícone + "Academy". Default: var(--ffv-blue). */
  accentColor?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { text: 14, icon: 18 },
  md: { text: 16, icon: 20 },
  lg: { text: 18, icon: 22 },
};

export function FfvLogo({
  iconSize,
  size = 'md',
  inverted = false,
  textColor,
  accentColor,
  className,
}: Props) {
  const sz = SIZE_MAP[size];
  const finalIconSize = iconSize ?? sz.icon;
  const finalTextColor = textColor ?? (inverted ? '#fbf7f0' : 'var(--foreground)');
  const finalAccentColor =
    accentColor ?? (inverted ? 'color-mix(in srgb, #fbf7f0 75%, transparent)' : 'var(--ffv-blue)');

  return (
    <span
      className={`inline-flex items-center gap-2 font-bold tracking-tight ${className ?? ''}`}
      style={{ color: finalTextColor, fontSize: sz.text, lineHeight: 1 }}
    >
      <BrainCircuit
        size={finalIconSize}
        strokeWidth={1.8}
        style={{ color: finalAccentColor, flexShrink: 0 }}
        aria-hidden
      />
      <span>FFV</span>
      <span style={{ color: finalAccentColor, fontWeight: 400 }}>Academy</span>
    </span>
  );
}
