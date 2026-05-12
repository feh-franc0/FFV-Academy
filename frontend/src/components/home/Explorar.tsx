'use client';

import Link from 'next/link';
import { HUBS, getHubStats } from '@/lib/curriculum';
import { PLAYLISTS } from '@/lib/playlists';

export function Explorar() {
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-mono uppercase tracking-widest text-xs mb-3"
          style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
        >
          Explorar conteúdo
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          {HUBS.length} áreas, {PLAYLISTS.length} playlists curadas
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--ffv-muted)',
            maxWidth: 640,
            lineHeight: 1.7,
            marginBottom: 48,
          }}
        >
          Hubs agrupam trilhas relacionadas. Playlists são sequências curadas para um objetivo
          específico — atalho ideal quando você sabe onde quer chegar.
        </p>

        {/* Hubs */}
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
        >
          POR ÁREA (HUBS)
        </h3>
        <div
          className="grid gap-3 mb-12"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {HUBS.map(hub => {
            const stats = getHubStats(hub);
            return (
              <Link
                key={hub.id}
                href={hub.href}
                className="p-5 rounded-2xl transition-all"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: `1px solid ${hub.color}25`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = `${hub.color}80`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = `${hub.color}25`;
                  e.currentTarget.style.transform = '';
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 22 }}>{hub.icon}</span>
                  <span className="font-bold text-base">{hub.name}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                  {hub.tagline}
                </p>
                <div
                  className="flex items-center gap-3 text-[11px] font-mono mt-2 pt-2"
                  style={{
                    color: 'var(--ffv-muted)',
                    borderTop: '1px solid var(--ffv-border)',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span>{stats.trailCount} trilhas</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{stats.moduleCount} módulos</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Playlists curadas */}
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
        >
          PLAYLISTS CURADAS
        </h3>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {PLAYLISTS.slice(0, 8).map(p => (
            <Link
              key={p.id}
              href="/playlists"
              className="p-4 rounded-xl transition-all"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${p.color}25`,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = `${p.color}80`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = `${p.color}25`;
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <span
                  className="font-mono text-[10px] font-bold"
                  style={{ color: p.color, letterSpacing: '0.06em' }}
                >
                  {p.moduleSlugs.length} MÓDULOS
                </span>
              </div>
              <p className="font-bold text-sm mb-1">{p.title}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
                {p.subtitle}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--ffv-border)',
              color: 'var(--foreground)',
            }}
          >
            Ver mapa completo de trilhas →
          </Link>
        </div>
      </div>
    </section>
  );
}
