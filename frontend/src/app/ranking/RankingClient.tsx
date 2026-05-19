'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getPublicLeaderboard,
  getMyRankAll,
  type PublicLeaderboardEntry,
  type RankPeriod,
  type MyRankByPeriod,
} from '@/lib/leaderboard-api';
import { HUBS } from '@/lib/curriculum';

const PERIODS: { id: RankPeriod; label: string; short: string; emoji: string }[] = [
  { id: 'all-time', label: 'Geral', short: 'GERAL', emoji: '👑' },
  { id: 'yearly', label: 'Anual', short: 'ANO', emoji: '📅' },
  { id: 'monthly', label: 'Mensal', short: 'MÊS', emoji: '🗓️' },
  { id: 'weekly', label: 'Semanal', short: 'SEMANA', emoji: '⚡' },
];

export function RankingClient() {
  const [period, setPeriod] = useState<RankPeriod>('all-time');
  const [entries, setEntries] = useState<PublicLeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodLabel, setPeriodLabel] = useState<string>('');
  const [myRanks, setMyRanks] = useState<MyRankByPeriod[]>([]);
  const [hubFilter, setHubFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicLeaderboard(period, 100).then(data => {
      if (cancelled) return;
      setEntries(data?.entries ?? null);
      setPeriodLabel(formatPeriodLabel(period, data?.periodStart, data?.periodEnd));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  // Carrega rank em todos os períodos uma vez (só funciona se autenticado)
  useEffect(() => {
    let cancelled = false;
    getMyRankAll().then(data => {
      if (!cancelled && data) setMyRanks(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const myRankInPeriod = myRanks.find(r => r.period === period);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      {/* Hero da página */}
      <section className="px-6 pt-16 pb-10 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-gold) 13%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: 40 }}>🏆</span>
            <p
              className="font-mono uppercase tracking-widest text-xs"
              style={{ color: 'var(--ffv-gold)', letterSpacing: '0.14em' }}
            >
              Ranking da Academia
            </p>
          </div>
          <h1
            style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Quem está se tornando um dos
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              profissionais mais qualificados.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ffv-muted)', lineHeight: 1.7, maxWidth: 640 }}>
            XP é ganho ao completar artigos, fazer simulados e manter streak diário. O ranking
            destaca quem está investindo de verdade na nova era da IA no digital.
          </p>
        </div>
      </section>

      {/* Tabs de período */}
      <section className="px-6" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-5xl mx-auto py-6">
          <div
            className="inline-flex gap-1 p-1 rounded-2xl"
            style={{
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className="px-4 md:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
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
                <span className="mr-1.5">{p.emoji}</span>
                <span className="hidden md:inline">{p.label}</span>
                <span className="md:hidden">{p.short}</span>
              </button>
            ))}
          </div>
          <p
            className="text-xs font-mono mt-3"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
          >
            {periodLabel}
          </p>
        </div>
      </section>

      {/* Hub filter tabs */}
      <section className="px-6 pb-2">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono mb-3" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}>
            FILTRAR POR HUB
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setHubFilter('all')}
              className="px-3 py-1.5 rounded-full font-semibold text-xs transition-all"
              style={{
                background: hubFilter === 'all' ? 'var(--ffv-blue)' : 'var(--ffv-bg2)',
                border: `1px solid ${hubFilter === 'all' ? 'var(--ffv-blue)' : 'var(--ffv-border)'}`,
                color: hubFilter === 'all' ? '#fff' : 'var(--ffv-muted)',
                cursor: 'pointer',
              }}
            >
              🌐 Todos
            </button>
            {HUBS.map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHubFilter(h.id)}
                className="px-3 py-1.5 rounded-full font-semibold text-xs transition-all"
                style={{
                  background: hubFilter === h.id ? h.color : 'var(--ffv-bg2)',
                  border: `1px solid ${hubFilter === h.id ? h.color : 'var(--ffv-border)'}`,
                  color: hubFilter === h.id ? '#0d1117' : 'var(--ffv-muted)',
                  cursor: 'pointer',
                }}
              >
                {h.icon} {h.shortName}
              </button>
            ))}
          </div>
          {hubFilter !== 'all' && (
            <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
              Exibindo ranking global — filtro por hub em breve (requer backend).
            </p>
          )}
        </div>
      </section>

      {/* Sua posição (só se autenticado) */}
      {myRankInPeriod && myRankInPeriod.rank > 0 && (
        <section className="px-6">
          <div className="max-w-5xl mx-auto pb-8">
            <MyRankCard rank={myRankInPeriod.rank} xp={myRankInPeriod.xp} entries={entries ?? []} />
          </div>
        </section>
      )}

      {/* Conteúdo do ranking */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <SkeletonGrid />
          ) : entries && entries.length >= 3 ? (
            <>
              <Podium top3={entries.slice(0, 3)} />
              {entries.length > 3 && <RankList entries={entries.slice(3)} />}
            </>
          ) : entries && entries.length > 0 ? (
            <RankList entries={entries} />
          ) : (
            <EmptyState period={period} />
          )}
        </div>
      </section>

      {/* CTA inferior */}
      <section
        className="px-6 py-16"
        style={{
          borderTop: '1px solid var(--ffv-border)',
          background: 'var(--ffv-bg2)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}
          >
            Quer aparecer aqui?
          </h2>
          <p
            style={{ fontSize: 14, color: 'var(--ffv-muted)', marginBottom: 24, lineHeight: 1.7 }}
          >
            Comece a estudar agora. Cada artigo dá XP. Cada streak protegido amplifica o ganho.
            Top 100 aparece nesta página toda semana.
          </p>
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.04]"
            style={{
              background: 'linear-gradient(90deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))',
              color: '#0d1117',
              boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--ffv-gold) 38%, transparent)',
            }}
          >
            Começar a ganhar XP →
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────── Pódio top 3 ─────────────────── */

function Podium({ top3 }: { top3: PublicLeaderboardEntry[] }) {
  const [first, second, third] = top3;
  return (
    <>
      {/* Mobile — vertical com nomes completos */}
      <div className="flex flex-col gap-3 mb-10 md:hidden">
        <MobilePodiumRow entry={first} place={1} />
        <MobilePodiumRow entry={second} place={2} />
        <MobilePodiumRow entry={third} place={3} />
      </div>
      {/* Desktop — pódio horizontal */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-10 items-end">
        <PodiumCard entry={second} place={2} />
        <PodiumCard entry={first} place={1} />
        <PodiumCard entry={third} place={3} />
      </div>
    </>
  );
}

function MobilePodiumRow({ entry, place }: { entry: PublicLeaderboardEntry; place: 1 | 2 | 3 }) {
  const config = {
    1: { emoji: '🥇', color: 'var(--ffv-gold)', label: '1º LUGAR', glow: '0 0 40px -8px color-mix(in srgb, var(--ffv-gold) 70%, transparent)' },
    2: { emoji: '🥈', color: 'var(--ffv-silver)', label: '2º LUGAR', glow: '0 0 24px -8px color-mix(in srgb, var(--ffv-silver) 55%, transparent)' },
    3: { emoji: '🥉', color: 'var(--ffv-bronze)', label: '3º LUGAR', glow: '0 0 20px -8px color-mix(in srgb, var(--ffv-bronze) 50%, transparent)' },
  }[place];

  return (
    <div
      className="flex items-center gap-4 p-5 rounded-2xl"
      style={{
        background: 'var(--ffv-bg2)',
        border: `2px solid color-mix(in srgb, ${config.color} 40%, transparent)`,
        boxShadow: place === 1 ? config.glow : undefined,
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
          color: '#0d1117',
          boxShadow: config.glow,
        }}
      >
        {entry.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{config.emoji}</span>
          <p
            className="font-mono text-[11px]"
            style={{ color: config.color, letterSpacing: '0.08em', fontWeight: 700 }}
          >
            {config.label}
          </p>
        </div>
        <p className="font-bold text-base truncate">{entry.name}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono text-xl font-bold" style={{ color: config.color }}>
          {entry.xpGained.toLocaleString('pt-BR')}
        </p>
        <p
          className="font-mono text-[10px]"
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
      heightPx: 280,
      glow: '0 0 80px -10px color-mix(in srgb, var(--ffv-gold) 63%, transparent)',
    },
    2: {
      emoji: '🥈',
      color: 'var(--ffv-silver)',
      label: '2º LUGAR',
      heightPx: 230,
      glow: '0 0 50px -10px #9ca3af80',
    },
    3: {
      emoji: '🥉',
      color: 'var(--ffv-bronze)',
      label: '3º LUGAR',
      heightPx: 200,
      glow: '0 0 40px -10px #cd7f3280',
    },
  }[place];

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-base md:text-2xl font-bold mb-3"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
          color: '#0d1117',
          boxShadow: config.glow,
        }}
      >
        {entry.avatarInitials}
      </div>

      <div
        className="w-full rounded-2xl p-4 md:p-6 text-center"
        style={{
          background: 'var(--ffv-bg2)',
          border: `2px solid ${config.color}50`,
          height: config.heightPx,
          boxShadow: place === 1 ? config.glow : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="text-3xl md:text-4xl mb-2">{config.emoji}</div>
          <p
            className="font-mono text-[10px] mb-2"
            style={{ color: config.color, letterSpacing: '0.08em', fontWeight: 700 }}
          >
            {config.label}
          </p>
          <p
            className="font-bold text-sm md:text-lg truncate"
            style={{ color: 'var(--foreground)' }}
          >
            {entry.name}
          </p>
        </div>
        <div>
          <p
            className="font-mono text-2xl md:text-3xl font-bold"
            style={{ color: config.color }}
          >
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

/* ─────────────────── Lista 4-100 ─────────────────── */

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
          className="flex items-center gap-4 px-4 md:px-6 py-3.5 transition-colors"
          style={{
            borderTop: i === 0 ? undefined : '1px solid var(--ffv-border)',
            background: entry.rank <= 10 ? 'color-mix(in srgb, var(--ffv-gold) 4%, transparent)' : undefined,
          }}
        >
          <span
            className="font-mono font-bold text-sm md:text-base w-10 md:w-12 text-center"
            style={{
              color: entry.rank <= 10 ? 'var(--ffv-gold)' : 'var(--ffv-muted)',
            }}
          >
            #{entry.rank}
          </span>
          <span
            className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0"
            style={{
              background:
                entry.rank <= 10
                  ? 'linear-gradient(135deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))'
                  : 'color-mix(in srgb, var(--ffv-blue) 15%, transparent)',
              color: entry.rank <= 10 ? '#0d1117' : 'var(--ffv-blue)',
            }}
          >
            {entry.avatarInitials}
          </span>
          <span className="flex-1 truncate font-medium text-sm md:text-base">{entry.name}</span>
          <span
            className="font-mono font-bold text-sm md:text-base"
            style={{ color: entry.rank <= 10 ? 'var(--ffv-gold)' : 'var(--ffv-blue)' }}
          >
            {entry.xpGained.toLocaleString('pt-BR')} XP
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── Card "minha posição" ─────────────────── */

function MyRankCard({ rank, xp, entries }: { rank: number; xp: number; entries: PublicLeaderboardEntry[] }) {
  const entryAbove = rank > 1 ? entries.find(e => e.rank === rank - 1) : null;
  const xpGap = entryAbove ? entryAbove.xpGained - xp : null;

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, var(--ffv-blue), var(--ffv-purple))',
          color: '#fff',
        }}
      >
        EU
      </div>
      <div className="flex-1">
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--ffv-blue)', letterSpacing: '0.08em' }}
        >
          SUA POSIÇÃO
        </p>
        <p className="text-xl md:text-2xl font-bold mt-1">
          #{rank}{' '}
          <span style={{ color: 'var(--ffv-muted)', fontSize: '0.7em', fontWeight: 500 }}>
            no ranking
          </span>
        </p>
        {xpGap !== null && xpGap > 0 && (
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
            Faltam{' '}
            <span style={{ color: 'var(--ffv-gold)', fontWeight: 700 }}>
              {xpGap.toLocaleString('pt-BR')} XP
            </span>
            {' '}para o #{rank - 1}
          </p>
        )}
        {rank === 1 && (
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--ffv-gold)' }}>
            Você está em 1º lugar 👑
          </p>
        )}
      </div>
      <div className="text-right">
        <p
          className="font-mono text-2xl md:text-3xl font-bold"
          style={{ color: 'var(--ffv-blue)' }}
        >
          {xp.toLocaleString('pt-BR')}
        </p>
        <p
          className="font-mono text-[10px]"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
        >
          XP NO PERÍODO
        </p>
      </div>
    </div>
  );
}

/* ─────────────────── Empty state e skeleton ─────────────────── */

function EmptyState({ period }: { period: RankPeriod }) {
  const labels: Record<RankPeriod, string> = {
    weekly: 'esta semana',
    monthly: 'este mês',
    yearly: 'este ano',
    'all-time': 'no ranking geral',
  };
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px dashed var(--ffv-border)',
      }}
    >
      <div className="text-5xl mb-4">🏁</div>
      <h3 className="font-bold text-xl mb-2">Ranking em formação</h3>
      <p
        className="text-sm mb-6"
        style={{ color: 'var(--ffv-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}
      >
        Ainda não há atividade {labels[period]}. Seja o primeiro a aparecer aqui — comece uma trilha
        e ganhe XP.
      </p>
      <Link
        href="/mapa"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.03]"
        style={{
          background: 'linear-gradient(90deg, var(--ffv-gold), color-mix(in srgb, var(--ffv-gold) 85%, black))',
          color: '#0d1117',
        }}
      >
        Começar agora →
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 items-end">
        {[230, 280, 200].map((h, i) => (
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
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            className="h-14 animate-pulse"
            style={{ borderTop: i > 1 ? '1px solid var(--ffv-border)' : undefined }}
          />
        ))}
      </div>
    </>
  );
}

/* ─────────────────── Helpers ─────────────────── */

function formatPeriodLabel(period: RankPeriod, start?: string, end?: string): string {
  if (!start && !end) return '';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  switch (period) {
    case 'weekly':
      return start && end ? `Semana ${fmt(start)} – ${fmt(end)}` : '';
    case 'monthly':
      return start
        ? `${new Date(start).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`
        : '';
    case 'yearly':
      return start ? `ANO ${new Date(start).getFullYear()}` : '';
    case 'all-time':
      return 'TODO O HISTÓRICO';
  }
}
