'use client';

import Link from 'next/link';
import type { Simulado } from '@/lib/simulados';

interface Props {
  simulado: Simulado;
  variant?: 'grid' | 'compact';
}

/** Card reutilizável pra exibir um simulado no catálogo. */
export function SimuladoCard({ simulado, variant = 'grid' }: Props) {
  const accent = simulado.comingSoon ? '#a371f7' : '#f78166';

  return (
    <Link
      href={`/simulados/${slugFromId(simulado.id)}`}
      className="block rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid ${accent}40`,
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-widest mb-1"
              style={{ color: accent }}
            >
              {simulado.comingSoon ? 'Em breve · Preview' : simulado.certification}
            </p>
            <h3 className="text-lg font-bold">{simulado.title}</h3>
          </div>
          <span className="text-2xl">🎯</span>
        </div>

        {variant === 'grid' && (
          <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
            {simulado.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
          <span>📝 {simulado.questionCount} questões</span>
          <span>⏱ {simulado.timeLimitMin} min</span>
          <span>🎓 {simulado.passingScore}% para aprovar</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {simulado.topics.slice(0, 3).map(t => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: `${accent}15`,
                  color: accent,
                  border: `1px solid ${accent}30`,
                }}
              >
                {t}
              </span>
            ))}
            {simulado.topics.length > 3 && (
              <span className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
                +{simulado.topics.length - 3}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: simulado.comingSoon ? 'var(--ffv-muted)' : accent }}>
              {simulado.comingSoon ? 'Em breve' : 'Gratuito'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Converte id ("simulado-aws-practitioner") em slug ("aws-practitioner"). */
export function slugFromId(id: string): string {
  return id.replace(/^simulado-/, '');
}

export function idFromSlug(slug: string): string {
  return `simulado-${slug}`;
}
