'use client';

/**
 * BasesClient — página pública /bases.
 *
 * Lista todas as bases de conhecimento: as que já estão no ar ("live"),
 * as em fila aguardando demanda ("queued") e — futuramente — as em produção
 * ("in_production"). Permite busca client-side e CTA pra solicitar nova área.
 *
 * Estilo editorial alinhado à landing (cream + serif + amber).
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchBases, type KnowledgeBase, type BasesResponse } from '@/lib/bases-api';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { rankItemsSimple } from '@/lib/personalization/rank';
import { loadEngagement } from '@/lib/personalization/engagement-store';

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

const KICKER: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ffv-amber)',
};

const H_SECTION: React.CSSProperties = {
  ...SERIF,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: 'var(--ffv-ink)',
};

const LEAD: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  color: '#44403c',
  lineHeight: 1.65,
};

type Filter = 'todas' | 'live' | 'queued';

export function BasesClient() {
  const [resp, setResp] = useState<BasesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');
  // Personalização (PERSONALIZATION_PLAN §3.b — ranker aplicado em /bases).
  // Quando user tem prefs ou engagement, bases preferidas sobem dentro do
  // grupo "live". Sem prefs, o ordenamento default (live + demandCount +
  // alfabética) prevalece.
  const { prefs, hydrated } = useUserPreferences();

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBases({ signal: ctrl.signal })
      .then(setResp)
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError('Não conseguimos carregar as bases agora. Tente recarregar.');
      });
    return () => ctrl.abort();
  }, []);

  const filteredBases = useMemo(() => {
    if (!resp) return [];
    const q = query.trim().toLowerCase();

    // Calcula índice de personalização — bases preferidas/engajadas ficam
    // com índice baixo (ordem prioritária). Bases sem sinal recebem índice
    // alto (manda pro final dentro do mesmo status). Quando hydrated=false
    // (SSR ou pré-mount), pula personalização — usa só ordem default.
    const engagement = hydrated && typeof window !== 'undefined'
      ? loadEngagement()
      : null;
    const personalRanked = hydrated && engagement
      ? rankItemsSimple(
          // areaLabel é texto formatado (ex: "Tecnologia · IA"). Quebra
          // em tokens lowercased pra fazer match com user.topicTags.
          resp.bases.map(b => ({
            slug: b.slug,
            name: b.name,
            tags: b.areaLabel
              .toLowerCase()
              .split(/[\s·,/]+/)
              .filter(t => t.length > 2),
          })),
          prefs,
          engagement,
        )
      : null;
    const slugPriority = new Map<string, number>();
    personalRanked?.forEach((r, idx) => slugPriority.set(r.slug, idx));

    return resp.bases
      .filter(b => filter === 'todas' || b.status === filter)
      .filter(b => {
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          b.areaLabel.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
        );
      })
      // Ordena: live primeiro, depois personalização (se aplicada),
      // depois demandCount desc, depois alfabética.
      .sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        // Tie-break por personalização (índice menor = mais alto na lista)
        const pa = slugPriority.get(a.slug);
        const pb = slugPriority.get(b.slug);
        if (pa !== undefined && pb !== undefined && pa !== pb) return pa - pb;
        if (b.demandCount !== a.demandCount) return b.demandCount - a.demandCount;
        return a.name.localeCompare(b.name);
      });
  }, [resp, query, filter, prefs, hydrated]);

  return (
    <div style={{ background: 'var(--ffv-paper)', color: 'var(--ffv-ink)' }}>
      {/* Hero */}
      <section
        className="px-6 lg:px-10 relative overflow-hidden"
        style={{
          paddingTop: 'clamp(120px, 14vw, 168px)',
          paddingBottom: 'clamp(48px, 6vw, 72px)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 80% 0%, color-mix(in srgb, var(--ffv-amber) 10%, transparent) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span
              style={{
                height: 1,
                width: 32,
                background: 'var(--ffv-amber)',
                display: 'inline-block',
              }}
            />
            <span style={KICKER}>Áreas de conhecimento · Geradas por demanda</span>
          </div>

          <h1
            style={{
              ...H_SECTION,
              fontSize: 'clamp(2.2rem, 4.6vw, 3.8rem)',
              marginBottom: 22,
            }}
          >
            Bases de conhecimento{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--ffv-amber)',
                fontWeight: 600,
              }}
            >
              no ar
            </em>{' '}
            e em fila.
          </h1>

          <p style={{ ...LEAD, fontSize: '1.1rem', maxWidth: 680, marginBottom: 36 }}>
            Cada base é uma jornada completa de estudo — trilhas, conteúdo, exercícios, revisão.
            Tecnologia já está no ar. As outras nascem por demanda: quanto mais gente pede uma área,
            antes ela existe.
          </p>

          {/* Busca + filtros */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="flex-1 relative">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar área (ex: medicina, design, direito...)"
                aria-label="Buscar bases de conhecimento"
                className="w-full text-sm"
                style={{
                  padding: '14px 16px 14px 44px',
                  background: '#ffffff',
                  border: '1px solid var(--ffv-border)',
                  borderRadius: 10,
                  color: 'var(--ffv-ink)',
                  outline: 'none',
                  fontFamily: 'var(--font-inter)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--ffv-ink)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--ffv-border)')}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--ffv-muted)',
                  fontSize: 16,
                }}
              >
                🔍
              </span>
            </div>
            <div className="flex gap-1.5" role="tablist" aria-label="Filtro de status">
              <FilterChip active={filter === 'todas'}    onClick={() => setFilter('todas')}    >Todas</FilterChip>
              <FilterChip active={filter === 'live'}      onClick={() => setFilter('live')}    >No ar{resp ? ` · ${resp.totalLive}` : ''}</FilterChip>
              <FilterChip active={filter === 'queued'}    onClick={() => setFilter('queued')}  >Em fila{resp ? ` · ${resp.totalQueued}` : ''}</FilterChip>
            </div>
          </div>
        </div>
      </section>

      {/* Listagem */}
      <section
        className="px-6 lg:px-10"
        style={{ paddingTop: 24, paddingBottom: 'clamp(72px, 10vw, 128px)' }}
      >
        <div className="max-w-5xl mx-auto">
          {error && (
            <p
              className="text-sm p-4 rounded-lg"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
            >
              {error}
            </p>
          )}

          {!resp && !error && <ListSkeleton />}

          {resp && filteredBases.length === 0 && (
            <EmptyState query={query} />
          )}

          {resp && filteredBases.length > 0 && (
            <ul className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filteredBases.map(b => (
                <BaseCard key={b.slug} base={b} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section
        className="px-6 lg:px-10"
        style={{
          background: 'var(--ffv-ink)',
          color: '#faf7f2',
          paddingTop: 'clamp(64px, 8vw, 96px)',
          paddingBottom: 'clamp(64px, 8vw, 96px)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ ...KICKER, color: '#fbbf24' }}>Sua área não está aqui?</p>
          <h2
            style={{
              ...H_SECTION,
              color: '#faf7f2',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              marginTop: 14,
              marginBottom: 18,
            }}
          >
            Não temos catálogo fechado.{' '}
            <em style={{ fontStyle: 'italic', color: '#fbbf24' }}>Sua área pode ser a próxima.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '1.05rem', color: '#d6d3d1', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Solicite a sua. Em até 24 horas a sua jornada está no ar — com a mesma estrutura,
            o mesmo padrão e os mesmos seis pilares da base de Tecnologia.
          </p>
          <Link
            href="/#solicitar-base"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-all"
            style={{
              background: '#fbbf24',
              color: 'var(--ffv-ink)',
              borderRadius: 8,
              boxShadow: '0 8px 24px -8px rgba(251,191,36,0.5)',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => (e.currentTarget.style.transform = '')}
          >
            Solicitar minha base agora
            <span aria-hidden style={{ fontSize: 12 }}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap"
      style={{
        background: active ? 'var(--ffv-ink)' : '#ffffff',
        color: active ? '#fff' : 'var(--ffv-muted)',
        border: '1px solid',
        borderColor: active ? 'var(--ffv-ink)' : 'var(--ffv-border)',
        borderRadius: 8,
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </button>
  );
}

function BaseCard({ base }: { base: KnowledgeBase }) {
  const isLive = base.status === 'live';
  const isQueued = base.status === 'queued';
  const isInProd = base.status === 'in_production';

  const statusLabel = isLive
    ? '● No ar'
    : isInProd
      ? '◐ Em produção'
      : '○ Aguardando demanda';

  const statusColor = isLive
    ? 'var(--ffv-sage)'
    : isInProd
      ? 'var(--ffv-amber)'
      : '#a8a29e';

  return (
    <li
      className="flex flex-col p-6 transition-all"
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--ffv-border)',
        boxShadow: isLive ? 'var(--ffv-shadow-soft)' : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{base.icon}</div>
        <span
          className="font-mono text-[10px] font-bold uppercase px-2 py-1 rounded"
          style={{
            background: 'color-mix(in srgb, ' + statusColor + ' 12%, transparent)',
            color: statusColor,
            letterSpacing: '0.08em',
          }}
        >
          {statusLabel}
        </span>
      </div>

      <h3 style={{ ...H_SECTION, fontSize: 19, marginBottom: 6 }}>{base.name}</h3>
      <p
        className="font-mono text-[11px] uppercase mb-3"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}
      >
        {base.areaLabel}
      </p>
      <p
        className="text-sm flex-1"
        style={{ color: '#57534e', lineHeight: 1.65, marginBottom: 16 }}
      >
        {base.description}
      </p>

      {/* Stats / demanda */}
      {isLive && base.modules ? (
        <div
          className="flex items-center gap-4 mb-4 text-[11px]"
          style={{ color: 'var(--ffv-muted)' }}
        >
          <span><strong style={{ color: 'var(--ffv-ink)' }}>{base.modules}</strong> conteúdos</span>
          <span><strong style={{ color: 'var(--ffv-ink)' }}>{base.trails}</strong> trilhas</span>
          <span><strong style={{ color: 'var(--ffv-ink)' }}>{base.hubs}</strong> hubs</span>
        </div>
      ) : (
        <div
          className="mb-4 flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg"
          style={{
            background: base.demandCount > 0
              ? 'color-mix(in srgb, var(--ffv-amber) 12%, transparent)'
              : 'var(--ffv-bg2)',
            border: base.demandCount > 0
              ? '1px solid color-mix(in srgb, var(--ffv-amber) 30%, transparent)'
              : '1px solid var(--ffv-border)',
            color: base.demandCount > 0 ? 'var(--ffv-amber)' : 'var(--ffv-muted)',
          }}
        >
          <span aria-hidden style={{ fontSize: 13 }}>{base.demandCount > 0 ? '🔥' : '🌱'}</span>
          {base.demandCount > 0 ? (
            <span>
              <strong>{base.demandCount}</strong>
              {base.demandCount === 1 ? ' pessoa pediu' : ' pessoas pediram'} —
              <strong> +1</strong> pode mudar a fila
            </span>
          ) : (
            <span>Seja a primeira pessoa a pedir essa base</span>
          )}
        </div>
      )}

      {/* CTA por status */}
      {isLive && base.url ? (
        <Link
          href={base.url}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors"
          style={{
            background: 'var(--ffv-ink)',
            color: '#fff',
            borderRadius: 8,
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--ffv-navy)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--ffv-ink)')}
        >
          Explorar base
          <span aria-hidden style={{ fontSize: 11 }}>→</span>
        </Link>
      ) : (
        <Link
          href={`/#solicitar-base?area=${base.slug}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid var(--ffv-ink)',
            color: 'var(--ffv-ink)',
            borderRadius: 8,
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--ffv-ink)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--ffv-ink)';
          }}
        >
          {isQueued ? 'Pedir essa base' : 'Acompanhar'}
          <span aria-hidden style={{ fontSize: 11 }}>→</span>
        </Link>
      )}
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="p-6"
          style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid var(--ffv-border)',
            minHeight: 220,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--ffv-bg3)',
              borderRadius: 6,
              marginBottom: 14,
            }}
          />
          <div style={{ width: '70%', height: 14, background: 'var(--ffv-bg3)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: '40%', height: 10, background: 'var(--ffv-bg3)', borderRadius: 4, marginBottom: 16 }} />
          <div style={{ width: '100%', height: 8, background: 'var(--ffv-bg3)', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ width: '85%', height: 8, background: 'var(--ffv-bg3)', borderRadius: 4 }} />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      className="text-center py-16 px-6"
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px dashed var(--ffv-border)',
      }}
    >
      <div className="text-4xl mb-4">🌱</div>
      <h3 style={{ ...H_SECTION, fontSize: 20, marginBottom: 10 }}>
        Nenhuma base encontrada {query && (
          <em style={{ fontStyle: 'italic', color: 'var(--ffv-amber)' }}>
            pra &ldquo;{query}&rdquo;
          </em>
        )}.
      </h3>
      <p
        className="text-sm mb-6"
        style={{ color: '#57534e', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}
      >
        Boa notícia: a gente cria sob demanda. Conte o que você precisa estudar — em até 24 horas,
        a sua jornada está no ar.
      </p>
      <Link
        href="/#solicitar-base"
        className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold transition-colors"
        style={{
          background: 'var(--ffv-ink)',
          color: '#fff',
          borderRadius: 8,
        }}
      >
        Solicitar minha base
        <span aria-hidden style={{ fontSize: 11 }}>→</span>
      </Link>
    </div>
  );
}
