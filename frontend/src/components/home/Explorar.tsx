'use client';

import Link from 'next/link';
import { HUBS, getHubStats } from '@/lib/curriculum';
import { PLAYLISTS } from '@/lib/playlists';

/**
 * Explorar — grade de hubs + playlists para descoberta.
 *
 * Aceita hubs e playlists via props. Sem props, usa o currículo de Tecnologia
 * (HUBS + PLAYLISTS globais) — preserva o comportamento da /tecnologia atual.
 *
 * Outras bases (medvet, direito...) passam seus próprios hubs (adapter pra
 * formato HubCardData) e podem omitir playlists.
 */

export interface HubCardData {
  id: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  href: string;
  trailCount: number;
  moduleCount: number;
}

export interface PlaylistCardData {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  moduleCount: number;
  href: string;
}

interface ExplorarProps {
  hubs?: HubCardData[];
  playlists?: PlaylistCardData[];
  /** Onde leva o botão "Ver mapa completo". Default: /mapa. */
  mapHref?: string;
  /** Override do título acima dos hubs. */
  heading?: string;
  /** Override do subtítulo abaixo do título. */
  subheading?: string;
}

export function Explorar({ hubs, playlists, mapHref = '/mapa', heading, subheading }: ExplorarProps) {
  // Default: hubs e playlists do currículo de Tecnologia
  const finalHubs: HubCardData[] =
    hubs ??
    HUBS.map(hub => {
      const stats = getHubStats(hub);
      return {
        id: hub.id,
        name: hub.name,
        icon: hub.icon,
        color: hub.color,
        tagline: hub.tagline,
        href: hub.href,
        trailCount: stats.trailCount,
        moduleCount: stats.moduleCount,
      };
    });

  const finalPlaylists: PlaylistCardData[] =
    playlists ??
    PLAYLISTS.slice(0, 8).map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      emoji: p.emoji,
      color: p.color,
      moduleCount: p.moduleSlugs.length,
      href: '/playlists',
    }));

  const finalHeading = heading ?? `${finalHubs.length} áreas, ${finalPlaylists.length} playlists curadas`;
  const finalSubheading =
    subheading ??
    'Hubs agrupam trilhas relacionadas. Playlists são sequências curadas para um objetivo específico — atalho ideal quando você sabe onde quer chegar.';

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
          {finalHeading}
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
          {finalSubheading}
        </p>

        {/* Hubs */}
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
        >
          POR ÁREA (HUBS)
        </h3>
        {/* Density consistente entre bases (2026-05-26): mostra no MÁXIMO 6
            hubs no grid + link "ver todos" pro mapa quando excede. Sem cap,
            /tecnologia mostrava 8-9 cards (denso) enquanto /ingles mostrava
            1 só (espaço sobrando). */}
        <div
          className="grid gap-3 mb-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {finalHubs.slice(0, 6).map(hub => (
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
                <span>{hub.trailCount} trilhas</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{hub.moduleCount} módulos</span>
              </div>
            </Link>
          ))}
        </div>
        {finalHubs.length > 6 && (
          <div className="mb-12">
            <Link
              href={mapHref}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--ffv-blue)' }}
            >
              Ver todos os {finalHubs.length} hubs no mapa →
            </Link>
          </div>
        )}
        {finalHubs.length <= 6 && <div className="mb-12" />}

        {/* Playlists curadas */}
        {finalPlaylists.length > 0 && (
          <>
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
              {finalPlaylists.map(p => (
                <Link
                  key={p.id}
                  href={p.href}
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
                      {p.moduleCount} MÓDULOS
                    </span>
                  </div>
                  <p className="font-bold text-sm mb-1">{p.title}</p>
                  <p className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
                    {p.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-10">
          <Link
            href={mapHref}
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
