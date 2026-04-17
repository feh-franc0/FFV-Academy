'use client';

import Link from 'next/link';
import { getModulePrerequisites } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface PrerequisitesProps {
  slug: string;
  accent?: string;
}

export function Prerequisites({ slug, accent = 'var(--ffv-blue)' }: PrerequisitesProps) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];
  const prereqs = getModulePrerequisites(slug, completed);

  if (prereqs.length === 0) return null;

  const doneCount = prereqs.filter(p => p.completed).length;
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
        {prereqs.map(p => (
          <li key={p.module.slug} className="flex items-center gap-2">
            <span className="text-xs">{p.completed ? '✅' : '⬜'}</span>
            <Link
              href={`/aprenda/${p.module.slug}`}
              className="text-xs transition-colors hover:underline"
              style={{ color: p.completed ? 'var(--ffv-muted)' : accent, textDecoration: p.completed ? 'line-through' : 'none' }}
            >
              {p.module.icon} {p.module.title}
            </Link>
            <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              ({p.trail.name})
            </span>
          </li>
        ))}
      </ul>

      {!allDone && (
        <p className="mt-3 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Recomendamos completar os pré-requisitos antes de seguir, mas nada te impede de continuar.
        </p>
      )}
    </div>
  );
}
