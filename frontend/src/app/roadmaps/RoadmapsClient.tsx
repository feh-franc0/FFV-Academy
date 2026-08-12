'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ROADMAPS, resolveRoadmap } from '@/lib/roadmaps';
import { useGameState } from '@/hooks/useGameState';

export function RoadmapsClient() {
  const { state } = useGameState();
  const completed = useMemo(() => new Set(state?.completedModules ?? []), [state]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Roadmaps</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Roadmaps curados</h1>
        <p className="text-base md:text-lg" style={{ color: 'var(--ffv-muted)' }}>
          5 jornadas de longo prazo que atravessam trilhas inteiras, orientadas a objetivos de carreira. Cada stage é um bloco de aprendizado com outcome claro; siga na ordem ou salte conforme sua base.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {ROADMAPS.map(roadmap => {
          const stages = resolveRoadmap(roadmap);
          const allTrails = stages.flatMap(s => s.trails);
          const totalModules = allTrails.reduce((acc, t) => acc + t.modules.length, 0);
          const doneModules = allTrails.reduce(
            (acc, t) => acc + t.modules.filter(m => completed.has(m.slug)).length,
            0,
          );
          const pct = totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;

          return (
            <section
              key={roadmap.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${roadmap.color}40`,
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5 flex-wrap">
                  <span className="text-4xl">{roadmap.emoji}</span>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="text-2xl font-bold mb-1 ffv-acento-texto" style={{ '--ffv-acento': roadmap.color } as React.CSSProperties}>
                      {roadmap.title}
                    </h2>
                    <p className="text-sm mb-2">{roadmap.subtitle}</p>
                    <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                      <b>Para:</b> {roadmap.audience}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                      Estimativa (10h/semana)
                    </p>
                    <p className="text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': roadmap.color } as React.CSSProperties}>
                      {roadmap.estimatedWeeks} semanas
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--ffv-muted)' }}>
                      {doneModules}/{totalModules} módulos · {allTrails.length} trilhas
                    </span>
                    <span className="ffv-acento-texto" style={{ '--ffv-acento': roadmap.color } as React.CSSProperties}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ffv-bg)' }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, background: roadmap.color }}
                    />
                  </div>
                </div>

                {/* Stages */}
                <ol className="flex flex-col gap-4">
                  {stages.map((stage, i) => {
                    const stageTotal = stage.trails.reduce((acc, t) => acc + t.modules.length, 0);
                    const stageDone = stage.trails.reduce(
                      (acc, t) => acc + t.modules.filter(m => completed.has(m.slug)).length,
                      0,
                    );
                    const stagePct = stageTotal > 0 ? Math.round((stageDone / stageTotal) * 100) : 0;

                    return (
                      <li
                        key={i}
                        className="rounded-xl p-4"
                        style={{
                          background: 'var(--ffv-bg)',
                          border: `1px solid var(--ffv-border)`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-sm font-bold mb-1">{stage.title}</h3>
                            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                              ✅ Outcome: {stage.outcome}
                            </p>
                          </div>
                          <span
                            className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
                            style={{
                              background: stagePct === 100 ? 'rgba(63,185,80,0.15)' : 'var(--ffv-bg2)',
                              color: stagePct === 100 ? 'var(--ffv-green)' : roadmap.color,
                              border: `1px solid ${stagePct === 100 ? 'rgba(63,185,80,0.3)' : roadmap.color + '40'}`,
                            }}
                          >
                            {stagePct === 100 ? '✓ Completa' : `${stagePct}%`}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {stage.trails.map(t => (
                            <Link
                              key={t.id}
                              href={t.href ?? '/'}
                              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 ffv-acento-texto"
                              style={{
                                background: `${t.color}15`,
                                '--ffv-acento': t.color,
                                border: `1px solid ${t.color}40`,
                              } as React.CSSProperties}
                            >
                              {t.icon} {t.name}
                            </Link>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer note */}
      <section className="mt-12 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-2">Sem roadmap? Tudo certo.</h2>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Roadmaps são sugestões. Você pode também navegar livremente:{' '}
          <Link href="/mapa" style={{ color: 'var(--ffv-blue)' }}>Mapa completo</Link>{' '}
          ou{' '}
          <Link href="/playlists" style={{ color: 'var(--ffv-blue)' }}>Playlists curtas</Link>.
        </p>
      </section>
    </div>
  );
}
