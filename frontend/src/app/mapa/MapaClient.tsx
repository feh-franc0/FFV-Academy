'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CURRICULUM, HUBS, type Trail } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

/**
 * /mapa — visualização simples do currículo por hub, destacando
 * prerequisites entre trilhas. SVG nativo sem libs extras.
 */
export function MapaClient() {
  const { state } = useGameState();
  const completed = useMemo(() => new Set(state?.completedModules ?? []), [state]);

  const trailsByHub = useMemo(() => {
    const map = new Map<string, Trail[]>();
    for (const hub of HUBS) {
      const trails = hub.trailIds
        .map(id => CURRICULUM.find(t => t.id === id))
        .filter((t): t is Trail => !!t);
      map.set(hub.id, trails);
    }
    return map;
  }, []);

  function trailProgress(trail: Trail): { pct: number; done: number; total: number } {
    const total = trail.modules.length;
    const done = trail.modules.filter(m => completed.has(m.slug)).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Mapa</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Mapa de trilhas</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Todas as {CURRICULUM.length} trilhas agrupadas por hub. Dependências sugeridas apontam a ordem natural; nada é obrigatório — você escolhe o caminho.
        </p>
      </header>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-10 text-xs" style={{ color: 'var(--ffv-muted)' }}>
        <span>🌱 Intermediate</span>
        <span>🔥 Advanced</span>
        <span>→ Prerequisite / recomendação</span>
        <span>🏁 Capstone hands-on obrigatório</span>
      </div>

      {/* Hubs em cascata */}
      {HUBS.map(hub => {
        const trails = trailsByHub.get(hub.id) ?? [];
        if (trails.length === 0) return null;
        return (
          <section key={hub.id} className="mb-12">
            <Link
              href={hub.href}
              className="inline-flex items-center gap-3 mb-5 rounded-xl px-4 py-3 transition-all hover:scale-[1.005]"
              style={{
                background: `color-mix(in srgb, ${hub.color} 12%, var(--ffv-bg2))`,
                border: `1px solid ${hub.color}40`,
              }}
            >
              <span className="text-2xl">{hub.icon}</span>
              <div>
                <h2 className="text-xl font-bold" style={{ color: hub.color }}>
                  {hub.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  {trails.length} trilha{trails.length > 1 ? 's' : ''} · {trails.reduce((s, t) => s + t.modules.length, 0)} módulos
                </p>
              </div>
            </Link>

            <div className="grid md:grid-cols-2 gap-4 ml-4">
              {trails.map((trail) => {
                const { done, total, pct } = trailProgress(trail);
                const levelEmoji = trail.level === 'advanced' ? '🔥' : trail.level === 'intermediate' ? '🌱' : '🌱';
                const hasPrereq = (trail.prerequisites?.length ?? 0) > 0;
                const hasCapstone = trail.modules.some(m => m.slug.startsWith('capstone-') || m.slug.startsWith('simulado-'));
                return (
                  <Link
                    key={trail.id}
                    href={trail.href ?? '/'}
                    className="rounded-xl p-4 transition-all hover:scale-[1.005]"
                    style={{
                      background: 'var(--ffv-bg2)',
                      border: `1px solid ${trail.color}40`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{trail.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold" style={{ color: trail.color }}>
                          {levelEmoji} {trail.name}
                        </h3>
                        {hasCapstone && (
                          <span className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
                            🏁 Tem capstone
                          </span>
                        )}
                      </div>
                    </div>
                    {hasPrereq && trail.prerequisites && (
                      <p className="text-[10px] mb-2" style={{ color: 'var(--ffv-muted)' }}>
                        → Requer: {trail.prerequisites.slice(0, 2).map(p => p.split('-').slice(0, 3).join('-')).join(', ')}
                        {trail.prerequisites.length > 2 && ` +${trail.prerequisites.length - 2}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span style={{ color: 'var(--ffv-muted)' }}>
                        {done}/{total} módulos
                      </span>
                      <span style={{ color: trail.color }}>{pct}%</span>
                    </div>
                    <div
                      className="h-1 rounded-full mt-1 overflow-hidden"
                      style={{ background: 'var(--ffv-bg)' }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, background: trail.color }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* CTA roadmaps */}
      <section
        className="mt-16 p-6 rounded-xl"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <h2 className="text-xl font-bold mb-2">Quer um caminho curado?</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Roadmaps organizam trilhas em jornadas objetivas: &quot;Zero a Staff Engineer em IA&quot;, &quot;Dev Web → Full-stack AI-Native&quot; e mais.
        </p>
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm"
          style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
        >
          Ver roadmaps →
        </Link>
      </section>
    </div>
  );
}
