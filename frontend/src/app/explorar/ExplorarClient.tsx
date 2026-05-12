'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CURRICULUM, HUBS, type Module, type Trail } from '@/lib/curriculum';

type ModuleWithTrail = Module & { trail: Trail };

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const ALL_MODULES: ModuleWithTrail[] = CURRICULUM.flatMap(trail =>
  trail.modules.map(m => ({ ...m, trail })),
);

function difficultyOf(xp: number): Exclude<Difficulty, 'all'> {
  if (xp <= 40) return 'beginner';
  if (xp <= 65) return 'intermediate';
  return 'advanced';
}

export function ExplorarClient() {
  const [query, setQuery] = useState('');
  const [hubFilter, setHubFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('all');
  const [showCount, setShowCount] = useState(60);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_MODULES.filter(m => {
      if (hubFilter) {
        const hub = HUBS.find(h => h.id === hubFilter);
        if (!hub || !hub.trailIds.includes(m.trail.id)) return false;
      }
      if (difficultyFilter !== 'all' && difficultyOf(m.xp) !== difficultyFilter) return false;
      if (q) {
        const haystack = `${m.title} ${m.desc} ${m.keywords ?? ''} ${m.trail.name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [query, hubFilter, difficultyFilter]);

  const visible = filtered.slice(0, showCount);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      {/* Hero */}
      <section className="px-6 pt-16 pb-10 md:pt-24 md:pb-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Explorar conteúdo
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {ALL_MODULES.length}+ artigos. Filtre e encontre.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--ffv-muted)',
              maxWidth: 640,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Cada artigo é um checkpoint com XP, quiz e profundidade técnica real. Use os filtros para
            encontrar o que importa pra você agora.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por tópico, palavra-chave ou trilha..."
              className="w-full px-5 py-4 rounded-2xl text-base font-medium transition-colors"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--foreground)',
              }}
              aria-label="Buscar artigos"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
                style={{
                  background: 'var(--ffv-bg)',
                  color: 'var(--ffv-muted)',
                  border: '1px solid var(--ffv-border)',
                }}
                aria-label="Limpar busca"
              >
                ESC
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-6 py-6" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <FilterRow label="Hub">
            <Chip active={hubFilter === null} onClick={() => setHubFilter(null)}>
              Todos
            </Chip>
            {HUBS.map(h => (
              <Chip
                key={h.id}
                active={hubFilter === h.id}
                onClick={() => setHubFilter(hubFilter === h.id ? null : h.id)}
                color={h.color}
              >
                {h.icon} {h.shortName}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Nível">
            <Chip active={difficultyFilter === 'all'} onClick={() => setDifficultyFilter('all')}>
              Todos
            </Chip>
            <Chip
              active={difficultyFilter === 'beginner'}
              onClick={() => setDifficultyFilter('beginner')}
            >
              🌱 Iniciante
            </Chip>
            <Chip
              active={difficultyFilter === 'intermediate'}
              onClick={() => setDifficultyFilter('intermediate')}
            >
              ⚡ Intermediário
            </Chip>
            <Chip
              active={difficultyFilter === 'advanced'}
              onClick={() => setDifficultyFilter('advanced')}
            >
              🏗️ Avançado
            </Chip>
          </FilterRow>
        </div>
      </section>

      {/* Resultados */}
      <section className="px-6 py-10" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-bold text-lg">
              {filtered.length} {filtered.length === 1 ? 'artigo' : 'artigos'}
            </h2>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
            >
              {filtered.length > showCount
                ? `mostrando ${showCount}/${filtered.length}`
                : `mostrando todos`}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px dashed var(--ffv-border)',
              }}
            >
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Nenhum artigo no filtro atual. Tente termos mais gerais ou limpe os filtros.
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
              >
                {visible.map(m => (
                  <ModuleCard key={m.slug} module={m} />
                ))}
              </div>
              {filtered.length > showCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowCount(c => c + 60)}
                    className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--ffv-border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    Carregar mais ({filtered.length - showCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 ffv-scroll-x-mask flex-nowrap md:flex-wrap">
      <span
        className="text-[11px] font-mono uppercase tracking-wider mr-2"
        style={{ color: 'var(--ffv-muted)', minWidth: 60, letterSpacing: '0.08em' }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: active
          ? color
            ? `color-mix(in srgb, ${color} 20%, transparent)`
            : 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))'
          : 'var(--ffv-bg2)',
        border: `1px solid ${active ? (color ?? 'transparent') : 'var(--ffv-border)'}`,
        color: active ? (color ?? '#fff') : 'var(--ffv-muted)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function ModuleCard({ module: m }: { module: ModuleWithTrail }) {
  const diff = difficultyOf(m.xp);
  const diffLabel: Record<typeof diff, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <Link
      href={`/aprenda/${m.slug}`}
      className="group block p-5 rounded-2xl transition-all"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 22 }}>{m.icon}</span>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)',
            color: 'var(--ffv-blue)',
            letterSpacing: '0.05em',
            fontWeight: 700,
          }}
        >
          +{m.xp} XP
        </span>
      </div>
      <h3 className="font-bold text-sm mb-2 line-clamp-2">{m.title}</h3>
      <p
        className="text-xs mb-3 line-clamp-2"
        style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}
      >
        {m.desc}
      </p>
      <div
        className="flex items-center gap-2 text-[10px] font-mono pt-3 mt-auto"
        style={{
          color: 'var(--ffv-muted)',
          borderTop: '1px solid var(--ffv-border)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ color: m.trail.color }}>{m.trail.name}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{diffLabel[diff]}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{m.readTime}min</span>
      </div>
    </Link>
  );
}
