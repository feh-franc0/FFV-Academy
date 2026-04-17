'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { exportState, importState } from '@/lib/engine';
import {
  BADGES_DEF,
  CURRICULUM,
  HUBS,
  LEVELS,
  getHubStats,
  getHubTrails,
  getLevelInfo,
  getTrailProgress,
  type Hub,
  type Trail,
} from '@/lib/curriculum';

const TRAIL_HREF: Record<string, string> = {
  trail1: '/fundamentos-da-ia',
  trail2: '/ia-alem-do-llm',
  trail3: '/ferramentas-ia-codigo',
  trail4: '/aws-cloud-practitioner',
  trail5: '/aws-saa-c03',
  trail6: '/como-aprender',
  trail7: '/devops-containers',
  trail8: '/engenharia-software',
  trail9: '/ai-native',
  trail10: '/sistemas-distribuidos',
  trail11: '/observabilidade-sre',
};

export function ProgressoClient() {
  const { state, levelInfo, dueCards, refresh } = useGameState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ffv-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const json = ev.target?.result as string;
      const ok = importState(json);
      if (ok) {
        refresh();
        alert('Dados importados com sucesso!');
      } else {
        alert('Arquivo inválido ou corrompido. Tente outro backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (!state) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <div className="text-4xl mb-3">📊</div>
          <p style={{ color: 'var(--ffv-muted)' }}>Carregando seu progresso…</p>
        </div>
      </section>
    );
  }

  const completed = state.completedModules;
  const totalModules = CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0);
  const overallPct = totalModules === 0 ? 0 : Math.round((completed.length / totalModules) * 100);
  const totalXpPossible = CURRICULUM.reduce(
    (acc, t) => acc + t.modules.reduce((a, m) => a + m.xp, 0),
    0
  );

  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpInLevel = state.xp - (levelInfo?.xpMin ?? 0);
  const xpNeeded = (nextLevel?.xpMin ?? levelInfo?.xpMax ?? 9999) - (levelInfo?.xpMin ?? 0);
  const levelPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <Hero state={state} levelInfo={levelInfo ?? getLevelInfo(state.xp)} levelPct={levelPct} xpInLevel={xpInLevel} xpNeeded={xpNeeded} />

      <section className="max-w-5xl mx-auto px-6 py-12">
        <SectionLabel>VISÃO GERAL</SectionLabel>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Stat label="Artigos lidos" value={`${completed.length}`} sub={`de ${totalModules} · ${overallPct}%`} accent="var(--ffv-blue)" />
          <Stat label="XP total" value={state.xp.toLocaleString('pt-BR')} sub={`de ${totalXpPossible.toLocaleString('pt-BR')} disponíveis`} accent="var(--ffv-yellow)" />
          <Stat label="Streak atual" value={`${state.streak}d`} sub={state.freezes > 0 ? `🧊 ${state.freezes} freeze${state.freezes !== 1 ? 's' : ''}` : 'Volte amanhã'} accent="var(--ffv-orange)" />
          <Stat label="Badges" value={`${state.badges.length}`} sub={`de ${BADGES_DEF.length} conquistas`} accent="var(--ffv-purple)" />
          <Stat label="Cards devidos" value={`${dueCards.length}`} sub={dueCards.length > 0 ? 'revisar agora' : 'em dia'} accent="var(--ffv-green)" link={dueCards.length > 0 ? '/revisar' : undefined} />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>PROGRESSO POR HUB</SectionLabel>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {HUBS.map(h => (
            <HubProgressCard key={h.id} hub={h} completedSlugs={completed} />
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>TRILHAS</SectionLabel>
        <div className="flex flex-col gap-3 mt-4">
          {CURRICULUM.map(t => (
            <TrailProgressRow key={t.id} trail={t} completedSlugs={completed} />
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <SectionLabel>BADGES</SectionLabel>
        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {BADGES_DEF.map(b => {
            const owned = state.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className="p-4 rounded-xl"
                style={{
                  background: owned ? 'color-mix(in srgb, var(--ffv-yellow) 10%, transparent)' : 'var(--ffv-bg2)',
                  border: owned
                    ? '1px solid color-mix(in srgb, var(--ffv-yellow) 35%, transparent)'
                    : '1px solid var(--ffv-border)',
                  opacity: owned ? 1 : 0.55,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{b.name}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--ffv-muted)', lineHeight: 1.5 }}>{b.desc}</p>
                {owned && (
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      color: 'var(--ffv-yellow)',
                      letterSpacing: '0.1em',
                      marginTop: 6,
                      display: 'inline-block',
                    }}
                  >
                    desbloqueada · +{b.xpBonus} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <SectionLabel>DADOS</SectionLabel>
        <div
          className="mt-4 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <div className="flex-1 min-w-0">
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Backup do seu progresso</p>
            <p style={{ fontSize: 12, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
              Seu progresso fica salvo no navegador. Exporte para não perder nada ao limpar o cache
              ou trocar de dispositivo.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
              style={{
                background: 'color-mix(in srgb, var(--ffv-blue) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
                color: 'var(--ffv-blue)',
              }}
            >
              Exportar backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
              style={{
                background: 'color-mix(in srgb, var(--ffv-muted) 10%, transparent)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--ffv-muted)',
              }}
            >
              Importar backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────── HERO ───────── */
function Hero({
  state,
  levelInfo,
  levelPct,
  xpInLevel,
  xpNeeded,
}: {
  state: ReturnType<typeof useGameState>['state'];
  levelInfo: NonNullable<ReturnType<typeof useGameState>['levelInfo']>;
  levelPct: number;
  xpInLevel: number;
  xpNeeded: number;
}) {
  if (!state) return null;
  return (
    <section className="relative px-6 pt-14 pb-12" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, ${levelInfo.color} 20%, transparent) 0%, transparent 65%)`,
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <SectionLabel color={levelInfo.color}>SEU DASHBOARD</SectionLabel>
        </div>
        <div className="flex items-center gap-5">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `color-mix(in srgb, ${levelInfo.color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${levelInfo.color} 40%, transparent)`,
              fontSize: 36,
            }}
          >
            {levelInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Nível {state.level} · <span style={{ color: levelInfo.color }}>{levelInfo.name}</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 6 }}>
              {state.xp.toLocaleString('pt-BR')} XP · {xpInLevel}/{xpNeeded} para o próximo nível
            </p>
            <div className="mt-4" style={{ maxWidth: 520 }}>
              <div style={{ height: 6, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${levelPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${levelInfo.color}, color-mix(in srgb, ${levelInfo.color} 60%, white))`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Hub card ───────── */
function HubProgressCard({ hub, completedSlugs }: { hub: Hub; completedSlugs: string[] }) {
  const stats = getHubStats(hub, completedSlugs);
  const trails = getHubTrails(hub);
  return (
    <Link
      href={hub.href}
      className="block"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="rounded-2xl p-5 h-full flex flex-col"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid color-mix(in srgb, ${hub.color} 22%, transparent)`,
          transition: 'border-color 0.2s ease',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hub.color} 55%, transparent)`; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hub.color} 22%, transparent)`; }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 20 }}>{hub.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>{hub.name}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>{stats.done}/{stats.moduleCount} artigos</span>
          <span className="font-mono" style={{ fontSize: 11, color: hub.color, fontWeight: 700 }}>{stats.pct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${stats.pct}%`,
              height: '100%',
              background: hub.color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trails.map(t => {
            const tp = getTrailProgress(t.modules, completedSlugs);
            return (
              <span
                key={t.id}
                style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  border: `1px solid color-mix(in srgb, ${t.color} 30%, transparent)`,
                  color: t.color,
                  fontWeight: 600,
                }}
              >
                {t.icon} {tp.done}/{tp.total}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

/* ───────── Trail row ───────── */
function TrailProgressRow({ trail, completedSlugs }: { trail: Trail; completedSlugs: string[] }) {
  const tp = getTrailProgress(trail.modules, completedSlugs);
  const href = TRAIL_HREF[trail.id] ?? '/';
  return (
    <Link href={href} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          transition: 'border-color 0.2s ease',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${trail.color} 55%, transparent)`; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ffv-border)'; }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `color-mix(in srgb, ${trail.color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${trail.color} 30%, transparent)`,
            fontSize: 18,
          }}
        >
          {trail.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{trail.name}</span>
            <span className="font-mono" style={{ fontSize: 11, color: trail.color, fontWeight: 700 }}>
              {tp.done}/{tp.total} · {tp.pct}%
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${tp.pct}%`,
                height: '100%',
                background: trail.color,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ───────── Primitives ───────── */
function SectionLabel({ children, color = 'var(--ffv-muted)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 10,
        letterSpacing: '0.14em',
        color,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  link,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  link?: string;
}) {
  const inner = (
    <div
      className="rounded-xl p-4 h-full"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
        transition: 'border-color 0.2s ease',
      }}
    >
      <div
        className="font-mono uppercase"
        style={{ fontSize: 10, color: accent, letterSpacing: '0.12em', fontWeight: 700 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--foreground)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
  if (link) {
    return (
      <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}
