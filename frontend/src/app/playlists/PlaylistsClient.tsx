'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PLAYLISTS, resolvePlaylist, type Playlist } from '@/lib/playlists';
import { useGameState } from '@/hooks/useGameState';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface BackendPlaylist {
  slug: string;
  title: string;
  subtitle?: string;
  audience?: string;
  color: string;
  emoji?: string;
  moduleSlugs: string[];
}

function backendToFrontend(b: BackendPlaylist): Playlist {
  return {
    id: b.slug,
    title: b.title,
    subtitle: b.subtitle ?? '',
    audience: b.audience ?? '',
    color: b.color,
    emoji: b.emoji ?? '🎯',
    moduleSlugs: b.moduleSlugs ?? [],
  };
}

export function PlaylistsClient() {
  const { state } = useGameState();
  const completed = useMemo(() => new Set(state?.completedModules ?? []), [state]);

  // Backend é fonte de verdade; PLAYLISTS local é fallback offline / build.
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLISTS);
  useEffect(() => {
    if (!API_BASE) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/playlists`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (cancelled || !json?.data?.length) return;
        setPlaylists((json.data as BackendPlaylist[]).map(backendToFrontend));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
          <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
          <span className="mx-1">/</span>
          <span style={{ color: 'var(--foreground)' }}>Playlists</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Playlists curadas</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Jornadas pré-montadas atravessando trilhas — para objetivos específicos.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {playlists.map(pl => {
          const mods = resolvePlaylist(pl);
          const done = mods.filter(m => completed.has(m.slug)).length;
          const pct = mods.length > 0 ? Math.round((done / mods.length) * 100) : 0;
          return (
            <section
              key={pl.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--ffv-bg2)', border: `1px solid ${pl.color}40` }}
            >
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-4 mb-4 flex-wrap">
                  <span className="text-3xl">{pl.emoji}</span>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="text-xl font-bold mb-1" style={{ color: pl.color }}>{pl.title}</h2>
                    <p className="text-sm mb-2">{pl.subtitle}</p>
                    <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                      <b>Pra quem:</b> {pl.audience}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs mb-1" style={{ color: 'var(--ffv-muted)' }}>
                      {done}/{mods.length} · {pct}%
                    </div>
                    <div className="h-1.5 w-32 rounded-full overflow-hidden" style={{ background: 'var(--ffv-bg3)' }}>
                      <div className="h-full transition-all" style={{ width: `${pct}%`, background: pl.color }} />
                    </div>
                  </div>
                </div>

                <ol className="flex flex-col gap-2">
                  {mods.map((m, i) => {
                    const isDone = completed.has(m.slug);
                    return (
                      <li key={m.slug}>
                        <Link
                          href={`/aprenda/${m.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:opacity-90"
                          style={{
                            background: isDone
                              ? 'color-mix(in srgb, var(--ffv-green) 10%, var(--ffv-bg))'
                              : 'var(--ffv-bg)',
                            border: `1px solid ${isDone ? 'rgba(63,185,80,0.3)' : 'var(--ffv-border)'}`,
                          }}
                        >
                          <span
                            className="text-xs font-mono tabular-nums w-6 text-right"
                            style={{ color: 'var(--ffv-muted)' }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-lg">{m.icon}</span>
                          <span className="flex-1 min-w-0 text-sm font-medium truncate">
                            {m.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: m.trailColor, border: `1px solid ${m.trailColor}40` }}>
                            {m.trailName}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: isDone ? 'var(--ffv-green)' : m.trailColor }}>
                            {isDone ? '✓' : `+${m.xp}XP`}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
