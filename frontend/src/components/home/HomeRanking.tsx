'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getPublicLeaderboard,
  type PublicLeaderboardEntry,
  type RankPeriod,
} from '@/lib/leaderboard-api';

const PERIODS: { id: RankPeriod; label: string; emoji: string }[] = [
  { id: 'all-time', label: 'Geral', emoji: '👑' },
  { id: 'yearly', label: 'Ano', emoji: '📅' },
  { id: 'monthly', label: 'Mês', emoji: '🗓️' },
  { id: 'weekly', label: 'Semana', emoji: '⚡' },
];

/**
 * Ranking compacto da home — pódio top 3 + lista 4-7 + link para /ranking.
 * Tabs permitem filtrar por período (geral, anual, mensal, semanal).
 */
export function HomeRanking() {
  const [period, setPeriod] = useState<RankPeriod>('all-time');
  const [entries, setEntries] = useState<PublicLeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Cap em 6s: se a API demorar/falhar, cai no EmptyState em vez de skeleton eterno.
    // Na home isso é aceitável — a seção é secundária e o visitante não está ali
    // para conferir ranking. Em /ranking, onde é o conteúdo principal, a falha é
    // mostrada explicitamente (ver FalhaAoCarregar em RankingClient).
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 6000));
    Promise.race([getPublicLeaderboard(period, 7), timeout])
      .then(resultado => {
        if (cancelled) return;
        const dados = resultado && resultado.status === 'ok' ? resultado.dados : null;
        setEntries(dados?.entries ?? null);
      })
      .catch(() => {
        if (!cancelled) setEntries(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p
              className="font-mono uppercase tracking-widest text-xs mb-3"
              style={{ color: 'var(--ffv-gold)', letterSpacing: '0.12em' }}
            >
              🏆 Ranking da Academia
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Os profissionais que mais estudam
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--ffv-muted)',
                marginTop: 8,
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              XP é ganho ao completar artigos, fazer simulados e manter streak diário. Quatro
              janelas: geral, anual, mensal e semanal.
            </p>
          </div>
          <Link
            href="/ranking"
            className="text-sm font-semibold transition-opacity hover:opacity-70 px-4 py-2 rounded-xl"
            style={{
              color: '#0d1117',
              background: 'linear-gradient(90deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))',
            }}
          >
            Ver ranking completo →
          </Link>
        </div>

        {/* Tabs de período */}
        <div
          className="inline-flex gap-1 p-1 rounded-2xl mb-8"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
          }}
        >
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all"
              style={{
                background:
                  period === p.id
                    ? 'linear-gradient(135deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))'
                    : 'transparent',
                color: period === p.id ? '#0d1117' : 'var(--ffv-muted)',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <span className="mr-1">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonPodium />
        ) : entries && entries.length >= 3 ? (
          <>
            <Podium top3={entries.slice(0, 3)} />
            {entries.length > 3 && <RankList entries={entries.slice(3, 7)} />}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

/* ─────────────────────── Pódio ─────────────────────── */

function Podium({ top3 }: { top3: PublicLeaderboardEntry[] }) {
  const [first, second, third] = top3;
  return (
    <>
      {/* Mobile — lista vertical para nomes longos não quebrarem */}
      <div className="flex flex-col gap-3 mb-6 md:hidden">
        <MobilePodiumRow entry={first} place={1} />
        <MobilePodiumRow entry={second} place={2} />
        <MobilePodiumRow entry={third} place={3} />
      </div>
      {/* Desktop — pódio horizontal clássico */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-6 items-end">
        <PodiumCard entry={second} place={2} />
        <PodiumCard entry={first} place={1} />
        <PodiumCard entry={third} place={3} />
      </div>
    </>
  );
}

function MobilePodiumRow({ entry, place }: { entry: PublicLeaderboardEntry; place: 1 | 2 | 3 }) {
  const config = {
    1: { emoji: '🥇', color: 'var(--ffv-gold)', label: '1º LUGAR', glow: '0 0 30px -8px color-mix(in srgb, var(--ffv-gold) 60%, transparent)' },
    2: { emoji: '🥈', color: 'var(--ffv-silver)', label: '2º LUGAR', glow: '0 0 20px -8px color-mix(in srgb, var(--ffv-silver) 50%, transparent)' },
    3: { emoji: '🥉', color: 'var(--ffv-bronze)', label: '3º LUGAR', glow: '0 0 16px -8px color-mix(in srgb, var(--ffv-bronze) 45%, transparent)' },
  }[place];

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{
        background: 'var(--ffv-bg2)',
        border: `2px solid color-mix(in srgb, ${config.color} 35%, transparent)`,
        boxShadow: place === 1 ? config.glow : undefined,
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
          color: '#0d1117',
          boxShadow: config.glow,
        }}
      >
        {entry.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl">{config.emoji}</span>
          <p
            className="font-mono text-[10px] ffv-acento-texto"
            style={{ '--ffv-acento': config.color, letterSpacing: '0.08em', fontWeight: 700 } as React.CSSProperties}
          >
            {config.label}
          </p>
        </div>
        <p className="font-bold text-sm truncate">{entry.name}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': config.color } as React.CSSProperties}>
          {entry.xpGained.toLocaleString('pt-BR')}
        </p>
        <p
          className="font-mono text-[9px]"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
        >
          XP
        </p>
      </div>
    </div>
  );
}

function PodiumCard({ entry, place }: { entry: PublicLeaderboardEntry; place: 1 | 2 | 3 }) {
  const config = {
    1: {
      emoji: '🥇',
      color: 'var(--ffv-gold)',
      label: '1º LUGAR',
      heightPx: 220,
      glow: '0 0 60px -10px color-mix(in srgb, var(--ffv-gold) 50%, transparent)',
    },
    2: {
      emoji: '🥈',
      color: 'var(--ffv-silver)',
      label: '2º LUGAR',
      heightPx: 180,
      glow: '0 0 40px -10px #9ca3af60',
    },
    3: {
      emoji: '🥉',
      color: 'var(--ffv-bronze)',
      label: '3º LUGAR',
      heightPx: 160,
      glow: '0 0 30px -10px #cd7f3260',
    },
  }[place];

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-lg md:text-xl font-bold mb-3"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
          color: '#0d1117',
          boxShadow: config.glow,
        }}
      >
        {entry.avatarInitials}
      </div>

      <div
        className="w-full rounded-2xl p-4 md:p-5 text-center"
        style={{
          background: 'var(--ffv-bg2)',
          border: `2px solid ${config.color}40`,
          height: config.heightPx,
          boxShadow: place === 1 ? config.glow : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="text-2xl md:text-3xl mb-2">{config.emoji}</div>
          <p
            className="font-mono text-[10px] mb-2 ffv-acento-texto"
            style={{ '--ffv-acento': config.color, letterSpacing: '0.08em', fontWeight: 700 } as React.CSSProperties}
          >
            {config.label}
          </p>
          <p
            className="font-bold text-sm md:text-base truncate"
            style={{ color: 'var(--foreground)' }}
          >
            {entry.name}
          </p>
        </div>
        <div>
          <p className="font-mono text-xl md:text-2xl font-bold ffv-acento-texto" style={{ '--ffv-acento': config.color } as React.CSSProperties}>
            {entry.xpGained.toLocaleString('pt-BR')}
          </p>
          <p
            className="text-[10px] font-mono"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            XP
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Lista ─────────────────────── */

function RankList({ entries }: { entries: PublicLeaderboardEntry[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      {entries.map((entry, i) => (
        <div
          key={`${entry.rank}-${entry.name}-${i}`}
          className="flex items-center gap-4 px-4 md:px-6 py-3"
          style={{
            borderTop: i === 0 ? undefined : '1px solid var(--ffv-border)',
          }}
        >
          <span
            className="font-mono font-bold text-sm w-8 text-center"
            style={{ color: 'var(--ffv-muted)' }}
          >
            #{entry.rank}
          </span>
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--ffv-blue) 15%, transparent)',
              color: 'var(--ffv-blue)',
            }}
          >
            {entry.avatarInitials}
          </span>
          <span className="flex-1 truncate font-medium text-sm">{entry.name}</span>
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--ffv-blue)' }}>
            {entry.xpGained.toLocaleString('pt-BR')} XP
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Empty / Skeleton ─────────────────────── */

function EmptyState() {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px dashed var(--ffv-border)',
      }}
    >
      <div className="text-4xl mb-3">🏁</div>
      <h3 className="font-bold text-lg mb-2">Ranking em formação</h3>
      <p
        className="text-sm mb-6"
        style={{ color: 'var(--ffv-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}
      >
        A primeira leva de devs está começando. Comece a estudar e dispute as primeiras posições.
      </p>
      <Link
        href="/mapa"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.03]"
        style={{
          background: 'linear-gradient(90deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))',
          color: '#0d1117',
        }}
      >
        Começar a ganhar XP →
      </Link>
    </div>
  );
}

function SkeletonPodium() {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
      {[180, 220, 160].map((h, i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse"
          style={{
            height: h,
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
          }}
        />
      ))}
    </div>
  );
}
