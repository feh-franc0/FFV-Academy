'use client';

import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { safeJsonLd } from '@/lib/safe-json';
import {
  HUBS,
  getHubStats,
  getHubTrails,
  getTrailHref,
  type Hub,
  type Trail,
} from '@/lib/curriculum';

export function HubPageClient({ hub }: { hub: Hub }) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];
  const stats = getHubStats(hub, completed);
  const trails = getHubTrails(hub);

  /**
   * Lista de cursos do hub.
   *
   * As páginas de hub não tinham dado estruturado nenhum — e são exatamente o
   * formato que o buscador espera para carrossel de cursos: uma página-resumo com
   * `ItemList` de `Course`, apontando para as páginas de cada curso, que já têm o
   * `Course` completo. Faltava metade do par.
   *
   * `description` e `name` são as duas propriedades exigidas; `provider` é a
   * recomendada. Nada além disso é usado pelo recurso, então não há motivo para
   * inflar o objeto.
   */
  const cursosLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Trilhas de ${hub.name} — FFV Academy`,
    itemListElement: trails.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: t.name,
        description: t.desc,
        url: `https://fernandofrancovalle.com${getTrailHref(t.id)}`,
        provider: {
          '@type': 'Organization',
          name: 'FFV Academy',
          url: 'https://fernandofrancovalle.com',
        },
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
      },
    })),
  };

  // Migalha legível por máquina. O hub tinha `ItemList` de cursos e nenhuma
  // `BreadcrumbList`: sem ela, o resultado de busca mostra a URL crua em vez da
  // linha de contexto, e o buscador não sabe que o hub está sob a jornada.
  const migalhaLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FFV Academy', item: 'https://fernandofrancovalle.com' },
      { '@type': 'ListItem', position: 2, name: 'A jornada', item: 'https://fernandofrancovalle.com/jornada' },
      { '@type': 'ListItem', position: 3, name: hub.name, item: `https://fernandofrancovalle.com${hub.href}` },
    ],
  };

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(migalhaLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(cursosLd) }}
      />
      <HubHero hub={hub} stats={stats} />
      <HubTrails hub={hub} trails={trails} completed={completed} />
      <HubCrossSell hub={hub} />
    </div>
  );
}

function HubHero({
  hub,
  stats,
}: {
  hub: Hub;
  stats: ReturnType<typeof getHubStats>;
}) {
  const hours = Math.round(stats.minutes / 60);
  return (
    <section className="relative px-6 pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${hub.color} 18%, transparent) 0%, transparent 65%)`,
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
          <Link href="/" className="transition-colors hover:text-white">FFV Academy</Link>
          <span>/</span>
          <span className="ffv-acento-texto" style={{ '--ffv-acento': hub.color } as React.CSSProperties}>{hub.name}</span>
        </nav>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: `color-mix(in srgb, ${hub.color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${hub.color} 34%, transparent)`,
            }}
          >
            {hub.icon}
          </div>
          <p
            className="font-mono text-[11px] tracking-[0.18em] uppercase font-bold ffv-acento-texto"
            style={{ '--ffv-acento': hub.color } as React.CSSProperties}
          >
            Hub · {hub.shortName}
          </p>
        </div>

        <h1
          className="font-bold"
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            marginBottom: 18,
            maxWidth: 820,
          }}
        >
          {hub.tagline}
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
            color: 'var(--ffv-muted)',
            lineHeight: 1.7,
            maxWidth: 680,
            marginBottom: 28,
          }}
        >
          {hub.desc}
        </p>

        <HubMetrics
          accent={hub.color}
          items={[
            { n: String(stats.trailCount), label: 'trilhas' },
            { n: String(stats.moduleCount), label: 'artigos' },
            { n: String(stats.totalXp), label: 'XP total' },
            { n: hours > 0 ? `${hours}h` : `${stats.minutes}min`, label: 'leitura' },
          ]}
          progress={stats.done > 0 ? stats : undefined}
        />
      </div>
    </section>
  );
}

function HubMetrics({
  items,
  accent,
  progress,
}: {
  items: { n: string; label: string }[];
  accent: string;
  progress?: { done: number; pct: number; moduleCount: number };
}) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        gap: 0,
        borderTop: '1px solid var(--ffv-border)',
        borderBottom: '1px solid var(--ffv-border)',
      }}
    >
      {items.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: '18px 22px',
            borderRight: i < items.length - 1 ? '1px solid var(--ffv-border)' : undefined,
            borderBottom: i < 2 ? '1px solid var(--ffv-border)' : undefined,
          }}
          className={i < 2 ? 'md:border-b-0' : ''}
        >
          <div
            className="font-mono"
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
            }}
          >
            {s.n}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: 'var(--ffv-muted)',
              marginTop: 4,
              letterSpacing: '0.04em',
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
      {progress && (
        <div
          className="col-span-2 md:col-span-4"
          style={{ padding: '14px 22px', borderTop: '1px solid var(--ffv-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--ffv-muted)', letterSpacing: '0.1em' }}
            >
              SEU PROGRESSO
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 11, color: accent, fontWeight: 700 }}
            >
              {progress.done}/{progress.moduleCount} · {progress.pct}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: 'var(--ffv-bg3)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress.pct}%`,
                height: '100%',
                background: accent,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function HubTrails({
  hub,
  trails,
  completed,
}: {
  hub: Hub;
  trails: Trail[];
  completed: string[];
}) {
  return (
    <section className="px-6 py-16" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-5xl mx-auto">
        <p
          className="font-mono text-[11px] tracking-[0.14em] uppercase font-bold mb-3"
          style={{ color: 'var(--ffv-muted)' }}
        >
          TRILHAS DESTE HUB
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 26,
            lineHeight: 1.2,
          }}
        >
          {trails.length > 1
            ? `${trails.length} caminhos curados — leia em ordem ou salte.`
            : 'A trilha completa deste tema.'}
        </h2>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}
        >
          {trails.map((trail, idx) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              number={idx + 1}
              href={getTrailHref(trail.id)}
              completed={completed}
              hubColor={hub.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrailCard({
  trail,
  number,
  href,
  completed,
  hubColor,
}: {
  trail: Trail;
  number: number;
  href: string;
  completed: string[];
  hubColor: string;
}) {
  const done = trail.modules.filter(m => completed.includes(m.slug)).length;
  const pct = Math.round((done / trail.modules.length) * 100);
  const totalXp = trail.modules.reduce((acc, m) => acc + m.xp, 0);

  return (
    <Link href={href} className="block group" style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        className="h-full flex flex-col"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid ${trail.color}28`,
          borderRadius: 20,
          padding: '26px 24px',
          transition: 'all 0.22s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = `${trail.color}60`;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--ffv-shadow-lift)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = `${trail.color}28`;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${trail.color}, transparent)`,
          }}
        />

        <div className="flex items-center justify-between mb-5">
          {/* Cor de trilha como TEXTO falha WCAG AA em tema claro: `#ff9900` a
              2,01:1, medido aqui em 07/ago/2026 — 5 cards × 2 rótulos = 10 nós.
              O utilitário de acento (globals.css) escurece 57% só no claro.
              (Comentário curto de propósito: `tema-falha-em-seguranca.test.ts`
              procura a variável numa janela de 400 caracteres depois de cada
              menção à classe, e conta a menção em comentário como uso.) */}
          <span
            className="font-mono ffv-acento-texto"
            style={{ fontSize: 11, '--ffv-acento': trail.color, letterSpacing: '0.08em', fontWeight: 700 } as React.CSSProperties}
          >
            TRILHA {String(number).padStart(2, '0')}
          </span>
          <div
            className="flex items-center justify-center"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `color-mix(in srgb, ${trail.color} 12%, transparent)`,
              border: `1px solid ${trail.color}35`,
              fontSize: 20,
            }}
          >
            {trail.icon}
          </div>
        </div>

        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            marginBottom: 10,
            color: 'var(--foreground)',
          }}
        >
          {trail.name}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: 'var(--ffv-muted)',
            lineHeight: 1.65,
            marginBottom: 18,
          }}
        >
          {trail.desc}
        </p>

        <ul className="flex flex-col gap-1.5 mb-5 flex-1">
          {trail.modules.slice(0, 4).map(m => {
            const isDone = completed.includes(m.slug);
            return (
              <li key={m.slug} className="flex items-center gap-2">
                <span
                  className="flex-shrink-0"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isDone ? 'var(--ffv-green)' : trail.color,
                    opacity: isDone ? 1 : 0.5,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--ffv-muted)',
                    lineHeight: 1.5,
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {m.title}
                </span>
              </li>
            );
          })}
          {trail.modules.length > 4 && (
            <li
              className="font-mono"
              style={{ fontSize: 11, color: 'var(--ffv-muted)', paddingLeft: 12, marginTop: 4 }}
            >
              + {trail.modules.length - 4} artigos
            </li>
          )}
        </ul>

        {done > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
              >
                PROGRESSO
              </span>
              <span
                className="font-mono ffv-acento-texto"
                style={{ fontSize: 10, '--ffv-acento': trail.color, fontWeight: 700 } as React.CSSProperties}
              >
                {done}/{trail.modules.length}
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: 'var(--ffv-bg3)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: trail.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--ffv-border)' }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
          >
            {trail.modules.length} ARTIGOS · {totalXp} XP
          </span>
          <span
            className="ffv-acento-texto"
            style={{
              fontSize: 13,
              fontWeight: 700,
              '--ffv-acento': trail.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            } as React.CSSProperties}
          >
            Abrir
            <span
              className="group-hover:translate-x-1 inline-block"
              style={{ transition: 'transform 0.2s ease' }}
            >
              →
            </span>
          </span>
        </div>

        {hubColor !== trail.color && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${hubColor}, ${trail.color})`,
              opacity: 0.18,
            }}
          />
        )}
      </article>
    </Link>
  );
}

function HubCrossSell({ hub }: { hub: Hub }) {
  const all = HUBS.filter(h => h.id !== hub.id);
  return (
    <section
      className="px-6 py-16"
      style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg2)' }}
    >
      <div className="max-w-5xl mx-auto">
        <p
          className="font-mono text-[11px] tracking-[0.14em] uppercase font-bold mb-3"
          style={{ color: 'var(--ffv-muted)' }}
        >
          EXPLORAR OUTROS HUBS
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.35rem, 2.2vw, 1.7rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 22,
            lineHeight: 1.2,
          }}
        >
          Siga por outro tema.
        </h2>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {all.map(h => (
            <Link
              key={h.id}
              href={h.href}
              className="block group"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  background: 'var(--ffv-bg)',
                  border: `1px solid ${h.color}25`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = `${h.color}60`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = `${h.color}25`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${h.color} 14%, transparent)`,
                    border: `1px solid ${h.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {h.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>
                    {h.name}
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--ffv-muted)',
                      marginTop: 2,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {h.trailIds.length} trilha{h.trailIds.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {/* className ANTES do style: o gate de tema procura
                    `--ffv-acento` numa janela para FRENTE da menção à classe. */}
                <span
                  className="group-hover:translate-x-1 inline-block ffv-acento-texto"
                  style={{
                    '--ffv-acento': h.color,
                    fontWeight: 700,
                    fontSize: 14,
                    transition: 'transform 0.2s ease',
                  } as React.CSSProperties}
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
