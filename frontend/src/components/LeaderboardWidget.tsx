'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, getMyRank, type LeaderboardData, type MyRank } from '@/lib/leaderboard-api';
import { useAuth } from '@/hooks/useAuth';

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${fmt(d)} – ${fmt(end)}`;
}

export function LeaderboardWidget() {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [lb, me] = await Promise.all([
        getLeaderboard(),
        isLoggedIn ? getMyRank() : Promise.resolve(null),
      ]);
      if (!cancelled) {
        setData(lb);
        setMyRank(me);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--ffv-border)' }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 rounded mb-2" style={{ background: 'var(--ffv-border)' }} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">🏆 Ranking semanal</h3>
        <span className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
          {weekLabel(data.weekStart)}
        </span>
      </div>

      {myRank && (
        <div
          className="rounded-lg px-3 py-2 mb-3 text-xs font-semibold"
          style={{ background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)', color: 'var(--ffv-blue)' }}
        >
          Sua posição: #{myRank.rank} · {myRank.xpGained} XP esta semana
        </div>
      )}

      <ol className="space-y-1">
        {data.items.map(entry => {
          const isMe = isLoggedIn && user && entry.userId === (myRank?.userId ?? '');
          return (
            <li
              key={entry.userId}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
              style={{
                background: isMe
                  ? 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)'
                  : 'transparent',
                border: isMe
                  ? '1px solid color-mix(in srgb, var(--ffv-blue) 20%, transparent)'
                  : '1px solid transparent',
              }}
            >
              <span
                className="text-xs font-bold w-5 text-center"
                style={{ color: entry.rank <= 3 ? '#fbbf24' : 'var(--ffv-muted)' }}
              >
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: 'var(--ffv-blue)', color: '#fff' }}
              >
                {entry.avatarInitials}
              </span>
              <span className="flex-1 truncate" style={{ color: 'var(--foreground)' }}>
                {isMe ? 'Você' : entry.name}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
                {entry.xpGained} XP
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
