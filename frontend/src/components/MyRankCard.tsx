'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyRankAll, type MyRankByPeriod, type RankPeriod } from '@/lib/leaderboard-api';

const PERIOD_META: Record<RankPeriod, { label: string; emoji: string; color: string }> = {
  'all-time': { label: 'Geral', emoji: '👑', color: 'var(--ffv-gold)' },
  yearly: { label: 'Ano', emoji: '📅', color: '#a371f7' },
  monthly: { label: 'Mês', emoji: '🗓️', color: '#58a6ff' },
  weekly: { label: 'Semana', emoji: '⚡', color: '#3fb950' },
};

const ORDER: RankPeriod[] = ['all-time', 'yearly', 'monthly', 'weekly'];

/**
 * Card "Sua posição no ranking" para /progresso.
 *
 * Mostra rank do usuário em cada um dos 4 períodos (geral, anual, mensal, semanal),
 * com link para ranking completo. Empty state honesto se ainda não há atividade.
 *
 * Só renderiza se o backend está disponível e retornou dados.
 */
export function MyRankCard() {
  const [ranks, setRanks] = useState<MyRankByPeriod[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyRankAll().then(data => {
      if (cancelled) return;
      setRanks(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          minHeight: 140,
        }}
      />
    );
  }

  // Backend offline ou sem dados → não renderiza nada (ProgressoClient já tem outras seções)
  if (!ranks) return null;

  const orderedRanks = ORDER.map(p => ranks.find(r => r.period === p)).filter(Boolean) as MyRankByPeriod[];

  if (orderedRanks.length === 0) return null;

  const hasAnyRank = orderedRanks.some(r => r.rank > 0);

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--ffv-bg2), color-mix(in srgb, #fbbf24 6%, var(--ffv-bg2)))',
        border: '1px solid color-mix(in srgb, #fbbf24 30%, transparent)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 100% 0%, color-mix(in srgb, #fbbf24 12%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 22 }}>🏆</span>
            <p
              className="font-mono uppercase tracking-widest text-xs"
              style={{ color: 'var(--ffv-gold)', letterSpacing: '0.12em' }}
            >
              Sua posição no Ranking
            </p>
          </div>
          <Link
            href="/ranking"
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-gold)' }}
          >
            Ver ranking completo →
          </Link>
        </div>

        {hasAnyRank ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
          >
            {orderedRanks.map(r => (
              <RankCell key={r.period} rank={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm font-semibold mb-2">Você ainda não pontuou nesta semana</p>
            <p className="text-xs mb-5" style={{ color: 'var(--ffv-muted)' }}>
              Complete um artigo para entrar no ranking — XP é creditado em tempo real.
            </p>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                color: '#0d1117',
              }}
            >
              Começar a estudar →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function RankCell({ rank }: { rank: MyRankByPeriod }) {
  const meta = PERIOD_META[rank.period];
  const isUnranked = rank.rank === 0;
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: 'var(--ffv-bg)',
        border: `1px solid ${isUnranked ? 'var(--ffv-border)' : `${meta.color}30`}`,
      }}
    >
      <p
        className="font-mono text-[10px] mb-2 ffv-acento-texto"
        style={{ '--ffv-acento': meta.color, letterSpacing: '0.08em', fontWeight: 700 } as React.CSSProperties}
      >
        {meta.emoji} {meta.label.toUpperCase()}
      </p>
      {isUnranked ? (
        <>
          <p className="text-base font-bold" style={{ color: 'var(--ffv-muted)' }}>
            —
          </p>
          <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--ffv-muted)' }}>
            sem pontos
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold ffv-acento-texto" style={{ '--ffv-acento': meta.color, lineHeight: 1 } as React.CSSProperties}>
            #{rank.rank}
          </p>
          <p
            className="font-mono text-[10px] mt-1"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
          >
            {rank.xp.toLocaleString('pt-BR')} XP
          </p>
        </>
      )}
    </div>
  );
}
