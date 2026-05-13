'use client';

/**
 * TrailLeaderboard — top usuários por trilha.
 *
 * Consome GET /api/v1/leaderboard/trail/{trailId}. Use em landings de trilha
 * (sidebar) ou em /ranking?tab=trail.
 */
import { useEffect, useState } from 'react';

interface Entry {
  rank: number;
  displayName: string;
  moduleCount: number;
  viewCount: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function TrailLeaderboard({ trailId, limit = 10 }: { trailId: string; limit?: number }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!API_BASE || !trailId) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/leaderboard/trail/${encodeURIComponent(trailId)}?window=30d&limit=${limit}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (cancelled || !json?.data) return;
        setItems(json.data as Entry[]);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [trailId, limit]);

  if (!loaded) return null;
  if (items.length === 0) {
    return (
      <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h3 className="text-sm font-bold mb-2">Top devs nesta trilha</h3>
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Ainda sem ranking — seja o primeiro a estudar e apareça aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
      <div className="px-4 py-2" style={{ background: 'var(--ffv-bg2)' }}>
        <h3 className="text-sm font-bold">Top devs nesta trilha (30d)</h3>
      </div>
      <ol>
        {items.map((e, i) => (
          <li
            key={`${e.displayName}-${i}`}
            className="px-4 py-2 flex items-center justify-between text-sm"
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--ffv-border)',
            }}
          >
            <span className="flex items-center gap-3">
              <span
                className="font-mono text-xs w-5 text-right"
                style={{ color: 'var(--ffv-muted)' }}
              >
                {e.rank}
              </span>
              <span className="font-semibold">{e.displayName}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              {e.moduleCount} módulos
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
