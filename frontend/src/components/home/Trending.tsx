'use client';

/**
 * Trending — top módulos mais lidos nos últimos 7 dias.
 *
 * Source: GET /api/v1/curriculum/trending (cache 5 min no servidor).
 * Em ambientes sem backend ou com 0 views, o componente renderiza null
 * (não polui a home com seções vazias).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrendingItem {
  slug: string;
  title: string;
  trailId?: string;
  hubId?: string;
  views: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function Trending() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/curriculum/trending?window=7d&limit=8`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (cancelled || !json?.data) return;
        setItems(json.data as TrendingItem[]);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Esconde a seção quando não há dados suficientes.
  if (!loaded || items.length < 3) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Em alta esta semana</h2>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Módulos mais lidos pela comunidade nos últimos 7 dias.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((it, i) => (
          <Link
            key={it.slug}
            href={`/aprenda/${it.slug}/`}
            className="p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            <div
              className="text-xs font-bold mb-2"
              style={{ color: 'var(--ffv-blue)' }}
            >
              #{i + 1} · {it.views.toLocaleString('pt-BR')} views
            </div>
            <h3 className="text-sm font-semibold leading-snug">{it.title}</h3>
            {it.trailId && (
              <p className="text-xs mt-2 font-mono" style={{ color: 'var(--ffv-muted)' }}>
                {it.trailId}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
