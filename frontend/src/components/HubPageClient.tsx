'use client';

import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import {
  getHubStats,
  getHubTrails,
  getTrailHref,
  type Hub,
  type Trail,
} from '@/lib/curriculum';
import { EndOfContextCta } from '@/components/EndOfContextCta';

export function HubPageClient({ hub }: { hub: Hub }) {
  const { state } = useGameState();
  const completed = state?.completedModules ?? [];
  const stats = getHubStats(hub, completed);
  const trails = getHubTrails(hub);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <HubHero hub={hub} stats={stats} />
      <HubTrails hub={hub} trails={trails} completed={completed} />
      <EndOfContextCta contextLabel={`o hub ${hub.name}`} />
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
          <span style={{ color: hub.color }}>{hub.name}</span>
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
            className="font-mono text-[11px] tracking-[0.18em] uppercase font-bold"
            style={{ color: hub.color }}
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
          <span
            className="font-mono"
            style={{ fontSize: 11, color: trail.color, letterSpacing: '0.08em', fontWeight: 700 }}
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
                className="font-mono"
                style={{ fontSize: 10, color: trail.color, fontWeight: 700 }}
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
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: trail.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
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

