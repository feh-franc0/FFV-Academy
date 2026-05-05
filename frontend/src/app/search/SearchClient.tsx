'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CURRICULUM, type Module, type Trail } from '@/lib/curriculum';
import { track } from '@/lib/analytics';

type ModuleWithTrail = Module & { trail: Trail };

const ALL_MODULES: ModuleWithTrail[] = CURRICULUM.flatMap(trail =>
  trail.modules.map(m => ({ ...m, trail })),
);

/**
 * SearchClient — busca local instantânea em todos os módulos do CURRICULUM.
 *
 * Usa busca por substring case-insensitive em title + desc + keywords + trail.
 * Para 600+ módulos, isso roda em <10ms — não vale o overhead de Fuse.js
 * ou MeiliSearch nesta escala. Se passarmos de 5000 módulos, considerar.
 *
 * Score simples: matches em title valem 3x, desc 2x, keywords 1x.
 * Resultados ordenados por score desc, limit 50.
 */
function searchModules(query: string): Array<ModuleWithTrail & { score: number }> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = ALL_MODULES.map(m => {
    const title = m.title.toLowerCase();
    const desc = m.desc.toLowerCase();
    const keywords = (m.keywords ?? '').toLowerCase();
    const trailName = m.trail.name.toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += 3;
      if (desc.includes(token)) score += 2;
      if (keywords.includes(token)) score += 1;
      if (trailName.includes(token)) score += 1;
    }
    return { ...m, score };
  })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return scored;
}

export function SearchClient() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce de 150ms — UX fica fluida sem busca em cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  // Track só quando usuário pausa de digitar — rate limit local: max 1 evento
  // por minuto para a mesma query length, evitando flood de Plausible se
  // alguém apagar/redigitar muito rápido.
  useEffect(() => {
    if (debouncedQuery.length < 3) return;
    const now = Date.now();
    const lastTrack = Number(sessionStorage.getItem('ffv:lastSearchTrack') ?? 0);
    if (now - lastTrack < 60_000) return;
    sessionStorage.setItem('ffv:lastSearchTrack', String(now));
    track('search_performed', { query_length: debouncedQuery.length });
  }, [debouncedQuery]);

  // Auto-focus no input ao abrir
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchModules(debouncedQuery), [debouncedQuery]);

  // Reset índice ativo ao mudar query
  useEffect(() => { setActiveIndex(0); }, [debouncedQuery]);

  // Keyboard nav — ↑↓ para navegar, Enter para abrir
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) router.push(`/aprenda/${target.slug}`);
    }
  }

  // Initial query from URL ?q=
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setQuery(q);
  }, []);

  const showEmpty = debouncedQuery.length >= 2 && results.length === 0;
  const showInitial = debouncedQuery.length < 2;

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <section className="px-6 pt-12 pb-8 md:pt-16">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            Buscar em todos os artigos
          </h1>

          <div className="relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar módulo, trilha ou tema..."
              className="w-full px-5 py-4 rounded-2xl text-base font-medium pr-16"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--foreground)',
              }}
              aria-label="Buscar artigos"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <span
              aria-hidden
              className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs"
              style={{ color: 'var(--ffv-muted)' }}
            >
              {results.length > 0 && `${results.length}/50`}
            </span>
          </div>
          <p
            className="text-xs mt-3 font-mono"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
          >
            {ALL_MODULES.length} ARTIGOS · BUSCA INSTANTÂNEA
          </p>
        </div>
      </section>

      <section className="px-6 pb-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-4xl mx-auto pt-8">
          {showInitial && <InitialState />}
          {showEmpty && <EmptyState query={debouncedQuery} />}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((m, i) => (
                <ResultRow
                  key={m.slug}
                  module={m}
                  query={debouncedQuery}
                  active={i === activeIndex}
                />
              ))}
            </div>
          )}
          <p
            className="text-xs font-mono mt-6 text-center"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
          >
            ↑ ↓ NAVEGAR · ENTER ABRIR
          </p>
        </div>
      </section>
    </div>
  );
}

function InitialState() {
  const popular = ['rag', 'agents', 'kubernetes', 'tool calling', 'aws lambda', 'claude code'];
  return (
    <div className="text-center py-10">
      <div className="text-3xl mb-3">🔍</div>
      <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)' }}>
        Comece digitando — busca em title, descrição, keywords e trilhas.
      </p>
      <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
        {popular.map(p => (
          <Link
            key={p}
            href={`/search?q=${encodeURIComponent(p)}`}
            className="px-3 py-1 rounded-full text-xs transition-colors"
            style={{
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
              color: 'var(--ffv-muted)',
              textDecoration: 'none',
            }}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px dashed var(--ffv-border)',
      }}
    >
      <div className="text-3xl mb-3">🔎</div>
      <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>
        Nenhum resultado para <strong>&ldquo;{query}&rdquo;</strong>
      </p>
      <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
        Tente termos mais gerais ou explore por hub em{' '}
        <Link href="/explorar" style={{ color: 'var(--ffv-blue)' }}>
          /explorar
        </Link>
        .
      </p>
    </div>
  );
}

function ResultRow({ module: m, query, active }: { module: ModuleWithTrail; query: string; active?: boolean }) {
  return (
    <Link
      href={`/aprenda/${m.slug}`}
      className="group block p-4 rounded-xl transition-all"
      style={{
        background: active ? 'var(--ffv-bg3)' : 'var(--ffv-bg2)',
        border: `1px solid ${active ? 'var(--ffv-blue)' : 'var(--ffv-border)'}`,
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: active ? '0 0 0 3px color-mix(in srgb, var(--ffv-blue) 15%, transparent)' : undefined,
      }}
    >
      <div className="flex items-start gap-4">
        <span style={{ fontSize: 24 }} className="flex-shrink-0">
          {m.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-sm md:text-base">
              <Highlight text={m.title} query={query} />
            </h3>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)',
                color: 'var(--ffv-blue)',
                letterSpacing: '0.04em',
              }}
            >
              +{m.xp} XP
            </span>
          </div>
          <p
            className="text-xs mb-2 line-clamp-2"
            style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}
          >
            <Highlight text={m.desc} query={query} />
          </p>
          <div
            className="flex items-center gap-2 text-[10px] font-mono"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
          >
            <span style={{ color: m.trail.color }}>{m.trail.name}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{m.readTime}min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Destaque visual de matches no texto. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  if (tokens.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((p, i) => {
        const match = tokens.includes(p.toLowerCase());
        return match ? (
          <mark
            key={i}
            style={{
              background: 'color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
              color: 'inherit',
              padding: '0 2px',
              borderRadius: 3,
            }}
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </>
  );
}
