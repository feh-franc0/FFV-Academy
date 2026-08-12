'use client';

import Link from 'next/link';
// Import type-only — apagado no runtime. `steps` chega pronto como prop: o
// Server Component (`/aprenda/[slug]/page.tsx`) já chama `getModuleNextSteps`
// no servidor. Até 11/ago/2026 este componente chamava a mesma função de
// novo no CLIENTE, o que arrastava `CURRICULUM` completo (~92 KB gz) — a
// função constrói um mapa de TODOS os módulos para achar 1-3 sugestões.
import type { NextStepInfo } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface NextStepsProps {
  steps: NextStepInfo[];
}

export function NextSteps({ steps }: NextStepsProps) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];

  if (steps.length === 0) return null;

  return (
    <div className="mt-10 mb-6">
      <div className="h-px mb-8" style={{ background: 'var(--ffv-border)' }} />
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ffv-muted)' }}>
        Próximos passos sugeridos
      </h3>
      <div className="flex flex-col gap-3">
        {steps.map(s => {
          const done = completed.includes(s.module.slug);
          return (
            <Link
              key={s.module.slug}
              href={`/aprenda/${s.module.slug}`}
              className="group flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              <span className="text-xl flex-shrink-0">{s.module.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:underline truncate">
                  {s.module.title}
                  {done && <span className="ml-2 text-xs" style={{ color: 'var(--ffv-green)' }}>✓ feito</span>}
                </p>
                <p className="text-xs truncate ffv-acento-texto" style={{ color: 'var(--ffv-muted)' }}>
                  <span style={{ '--ffv-acento': s.trail.color } as React.CSSProperties}>{s.trail.name}</span>
                  {' · '}{s.module.readTime} min · +{s.module.xp} XP
                </p>
              </div>
              <span className="text-sm" style={{ color: 'var(--ffv-muted)' }}>→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
