'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CURRICULUM, getHubBySlug, getHubTrails, getTrailProgress } from '@/lib/curriculum';

function hashDate(dateStr: string, salt: number = 0): number {
  let hash = salt;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getDailyTrailSuggestion(
  completedSlugs: string[],
  preferredHub: string | null,
  dateStr: string,
) {
  // Pick from preferred hub if set, else all trails
  const candidateTrails = preferredHub
    ? (() => {
        const hub = getHubBySlug(preferredHub);
        return hub ? getHubTrails(hub) : CURRICULUM;
      })()
    : CURRICULUM;

  // Only trails that are not 100% done
  const incomplete = candidateTrails.filter(t => {
    const tp = getTrailProgress(t.modules, completedSlugs);
    return tp.pct < 100 && tp.done < tp.total;
  });

  if (incomplete.length === 0) return null;

  const idx = hashDate(dateStr) % incomplete.length;
  const trail = incomplete[idx];

  // Pick up to 3 unread modules from this trail
  const unread = trail.modules.filter(m => !completedSlugs.includes(m.slug));
  const count = Math.min(3, unread.length);
  const modules = unread.slice(0, count);

  return { trail, modules };
}

export function TrilhaDoDia() {
  const { state } = useGameState();
  const today = new Date().toISOString().slice(0, 10);

  const suggestion = useMemo(() => {
    if (!state) return null;
    return getDailyTrailSuggestion(state.completedModules, state.preferredHub, today);
  }, [state, today]);

  if (!suggestion) return null;

  const { trail, modules } = suggestion;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${trail.color} 10%, var(--ffv-bg2)), var(--ffv-bg2))`,
        border: `1px solid ${trail.color}35`,
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 18 }}>{trail.icon}</span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${trail.color}20`, color: trail.color, border: `1px solid ${trail.color}40` }}
          >
            Trilha do Dia
          </span>
          <span className="text-[10px] font-mono ml-auto" style={{ color: 'var(--ffv-muted)' }}>{today}</span>
        </div>

        <h3 className="font-bold text-base mb-1" style={{ color: trail.color }}>{trail.name}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
          {modules.length} módulo{modules.length !== 1 ? 's' : ''} recomendado{modules.length !== 1 ? 's' : ''} para hoje
        </p>

        <div className="space-y-2 mb-4">
          {modules.map(m => (
            <Link
              key={m.slug}
              href={`/aprenda/${m.slug}?source=trilha-do-dia`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{
                background: 'var(--ffv-bg)',
                border: `1px solid ${trail.color}25`,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{m.title}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
                  {m.readTime} min · <span style={{ color: trail.color }}>+{m.xp} XP</span>
                </div>
              </div>
              <span style={{ color: trail.color, fontSize: 12, flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>

        <Link
          href={trail.href ?? '/mapa'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: trail.color, textDecoration: 'none' }}
        >
          Ver trilha completa →
        </Link>
      </div>
    </div>
  );
}
