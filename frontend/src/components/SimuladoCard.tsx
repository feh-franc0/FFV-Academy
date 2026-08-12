'use client';

import Link from 'next/link';
import type { Simulado } from '@/lib/simulados';

interface Props {
  simulado: Simulado;
  variant?: 'grid' | 'compact';
}

/** Card reutilizável pra exibir um simulado no catálogo. */
export function SimuladoCard({ simulado, variant = 'grid' }: Props) {
  // Variável, não hex: `#a371f7`/`#f78166` são valores do tema ESCURO, e em tema
  // claro mediam 2,9:1 e 2,21:1 — os 44 nós de contraste de `/simulados` saíam
  // todos daqui. `--ffv-purple` e `--ffv-red` trocam de valor com o tema.
  const accent = simulado.comingSoon ? 'var(--ffv-purple)' : 'var(--ffv-red)';

  return (
    <Link
      href={`/simulados/${slugFromId(simulado.id)}`}
      className="block rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
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
                  background: `color-mix(in srgb, ${accent} 8%, transparent)`,
                  color: accent,
                  border: `1px solid color-mix(in srgb, ${accent} 19%, transparent)`,
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
