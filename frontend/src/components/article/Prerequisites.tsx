'use client';

import Link from 'next/link';
// Import type-only — apagado no runtime. `prereqs` chega pronto como prop: o
// Server Component (`/aprenda/[slug]/page.tsx`) já chama `getModulePrerequisites`
// no servidor, igual a `NextSteps`. Este componente ficou ÓRFÃO (nenhuma rota o
// importava) desde a migração para o CMS-driven — achado da auditoria
// pedagógica de 12/ago/2026: 364 de 490 módulos (74%) declaravam
// `prerequisites`, mas o dado só chegava ao JSON-LD (`coursePrerequisites`) e a
// um teste, nunca à tela. Religado com o mesmo padrão de `NextSteps` (que já
// resolvia isso) em vez de voltar a chamar `getModulePrerequisites` no
// cliente, o que arrastaria `CURRICULUM` completo (~92 KB gz) para o bundle
// de toda página de artigo.
import type { PrereqInfo } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface PrerequisitesProps {
  prereqs: PrereqInfo[];
  accent?: string;
}

export function Prerequisites({ prereqs, accent = 'var(--ffv-blue)' }: PrerequisitesProps) {
  const { state } = useGameState();
  const completedSlugs = state?.completedModules ?? [];

  if (prereqs.length === 0) return null;

  // `completed` computado aqui, a partir do estado ATUAL do leitor — o
  // `PrereqInfo.completed` vindo do servidor é sempre `false` (o servidor não
  // tem acesso ao GameState, que vive em localStorage).
  const doneCount = prereqs.filter(p => completedSlugs.includes(p.module.slug)).length;
  const allDone = doneCount === prereqs.length;
  const pct = Math.round((doneCount / prereqs.length) * 100);

  return (
    <div
      className="rounded-xl p-4 mb-8 text-sm"
      style={{
        background: allDone ? 'color-mix(in srgb, var(--ffv-green) 8%, transparent)' : 'var(--ffv-bg2)',
        border: `1px solid ${allDone ? 'color-mix(in srgb, var(--ffv-green) 25%, transparent)' : 'var(--ffv-border)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-xs" style={{ color: allDone ? 'var(--ffv-green)' : 'var(--ffv-muted)' }}>
          {allDone ? '✓ Pré-requisitos completos' : `Pré-requisitos (${doneCount}/${prereqs.length})`}
        </span>
        <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--ffv-bg3)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: allDone ? 'var(--ffv-green)' : accent }}
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {prereqs.map(p => {
          const done = completedSlugs.includes(p.module.slug);
          return (
            <li key={p.module.slug} className="flex items-center gap-2">
              <span className="text-xs">{done ? '✅' : '⬜'}</span>
              <Link
                href={`/aprenda/${p.module.slug}`}
                className="text-xs transition-colors hover:underline"
                style={{ color: done ? 'var(--ffv-muted)' : accent, textDecoration: done ? 'line-through' : 'none' }}
              >
                {p.module.icon} {p.module.title}
              </Link>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                ({p.trail.name})
              </span>
            </li>
          );
        })}
      </ul>

      {!allDone && (
        <p className="mt-3 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Recomendamos completar os pré-requisitos antes de seguir, mas nada te impede de continuar.
        </p>
      )}
    </div>
  );
}
