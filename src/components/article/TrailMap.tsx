'use client';

import Link from 'next/link';
import type { Trail } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface TrailMapProps {
  trail: Trail;
}

export function TrailMap({ trail }: TrailMapProps) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];

  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
        Mapa da trilha — {trail.modules.filter(m => completed.includes(m.slug)).length}/{trail.modules.length} concluídos
      </h3>
      <div className="flex flex-col gap-1">
        {trail.modules.map((m, i) => {
          const done = completed.includes(m.slug);
          const isLast = i === trail.modules.length - 1;
          return (
            <div key={m.slug} className="flex items-stretch gap-3">
              {/* Vertical connector line */}
              <div className="flex flex-col items-center" style={{ width: 20 }}>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                  style={{
                    background: done ? trail.color : 'var(--ffv-bg3)',
                    border: `2px solid ${done ? trail.color : 'var(--ffv-border)'}`,
                  }}
                />
                {!isLast && (
                  <div
                    className="flex-1 w-px"
                    style={{ background: done ? trail.color : 'var(--ffv-border)' }}
                  />
                )}
              </div>
              <Link
                href={`/aprenda/${m.slug}`}
                className="flex-1 py-1.5 text-xs transition-colors hover:underline"
                style={{ color: done ? 'var(--ffv-muted)' : 'var(--foreground)' }}
              >
                <span>{m.icon} {m.title}</span>
                {done && <span className="ml-1.5" style={{ color: 'var(--ffv-green)' }}>✓</span>}
                {!done && <span className="ml-1.5" style={{ color: trail.color }}>+{m.xp} XP</span>}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
