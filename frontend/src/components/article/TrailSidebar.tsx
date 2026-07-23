'use client';

/**
 * TrailSidebar — lista de módulos da trilha ativa, sticky no lado esquerdo
 * dentro de qualquer página de módulo. Reflete o mesmo padrão da sidebar de
 * /medicina-veterinaria (BaseModule.tsx) — usuário sempre sabe onde está na
 * trilha e quantos módulos faltam, sem precisar voltar pra base.
 *
 * Reutilizado por /aprenda/[slug] (tech + 6 bases profissionais) e poderia
 * ser plugado em outras bases novas.
 */
import Link from 'next/link';
import { Check } from 'lucide-react';
import { CURRICULUM } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface TrailSidebarProps {
  /** Slug do módulo atual — usado para destacar item ativo. */
  currentSlug: string;
  /** trail_id do CURRICULUM (vem do backend; cai no fallback se inválido). */
  trailId: string;
  /** Prefixo dos hrefs (default '/aprenda'). */
  basePath?: string;
  /** Href de volta para a home da base (default deduzido). */
  backHref?: string;
  /** Texto do botão de voltar (default "Voltar"). */
  backLabel?: string;
}

export function TrailSidebar({
  currentSlug,
  trailId,
  basePath = '/aprenda',
  backHref,
  backLabel,
}: TrailSidebarProps) {
  const { state } = useGameState();
  const trail = CURRICULUM.find((t) => t.id === trailId);

  if (!trail) {
    // Sem trail no curriculum (caso raro de mismatch DB↔curriculum.ts) —
    // não rendeririza nada pra não atrapalhar o usuário.
    return null;
  }

  const completed = state?.completedModules ?? [];
  const currentIdx = trail.modules.findIndex((m) => m.slug === currentSlug);
  const inferredBackHref = backHref ?? trail.href ?? '/explorar';
  const inferredBackLabel = backLabel ?? trail.name;

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
      <Link
        href={inferredBackHref}
        className="inline-flex items-center gap-1.5 text-xs font-mono mb-5"
        style={{
          color: 'var(--ffv-muted)',
          letterSpacing: '0.08em',
          textDecoration: 'none',
        }}
      >
        ← {inferredBackLabel.toUpperCase()}
      </Link>

      <div className="flex items-center gap-2.5 mb-5">
        <span style={{ fontSize: 22 }} aria-hidden>
          {trail.icon}
        </span>
        <div>
          <p
            className="font-mono uppercase"
            style={{
              fontSize: 9,
              lineHeight: 1,
              letterSpacing: '0.12em',
              color: 'var(--ffv-muted)',
              fontWeight: 700,
            }}
          >
            Trilha
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            {trail.name}
          </p>
        </div>
      </div>

      <ol
        className="flex flex-col gap-1 list-none p-0 pb-6"
        style={{ borderBottom: '1px solid var(--ffv-border)' }}
      >
        {trail.modules.map((mod, idx) => {
          const isCurrent = mod.slug === currentSlug;
          const isCompleted = completed.includes(mod.slug);
          const isPast = idx < currentIdx;
          return (
            <li key={mod.slug}>
              <Link
                href={`${basePath}/${mod.slug}`}
                aria-current={isCurrent ? 'page' : undefined}
                className="flex items-start gap-2 py-1.5 rounded transition-colors"
                style={{
                  textDecoration: 'none',
                  color: isCurrent
                    ? 'var(--ffv-ink)'
                    : isCompleted || isPast
                      ? 'var(--ffv-muted)'
                      : '#44403c',
                  background: isCurrent ? 'var(--ffv-bg2)' : 'transparent',
                  fontWeight: isCurrent ? 600 : 400,
                  borderLeft: isCurrent ? `3px solid ${trail.color}` : '3px solid transparent',
                  paddingLeft: 10,
                  paddingRight: 8,
                }}
                onMouseOver={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'var(--ffv-bg2)';
                }}
                onMouseOut={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isCompleted
                      ? '#15803d'
                      : isCurrent
                        ? trail.color
                        : 'var(--ffv-muted)',
                    minWidth: 22,
                    marginTop: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  aria-label={isCompleted ? 'Módulo concluído' : undefined}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={2.5} aria-hidden />
                  ) : (
                    String(idx + 1).padStart(2, '0')
                  )}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.4 }}>{mod.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
