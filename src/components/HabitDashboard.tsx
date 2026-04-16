'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { isoDate, todayISO } from '@/lib/srs';

export function HabitDashboard() {
  const { state, dueCards } = useGameState();

  if (!state) return null;
  const hasStarted = (state.completedModules?.length ?? 0) > 0 || (state.reviewCards?.length ?? 0) > 0;
  if (!hasStarted) return null;

  const today = state.studyDays?.find(d => d.date === todayISO());
  const xpToday = today?.xpEarned ?? 0;
  const cardsToday = today?.cardsReviewed ?? 0;
  const dueCount = dueCards.length;
  const goal = state.dailyGoal ?? 3;
  const goalPct = Math.min(100, Math.round((cardsToday / goal) * 100));

  return (
    <section className="px-6 py-14" style={{ background: 'var(--ffv-bg2)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>
              Seu hub de estudos
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">O que ciência aplicada ao aprendizado faz por você.</h2>
          </div>
          <Link
            href="/revisar"
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: dueCount > 0 ? 'var(--ffv-green)' : 'var(--ffv-bg3)', color: dueCount > 0 ? '#0d1117' : 'var(--ffv-muted)', border: dueCount > 0 ? 'none' : '1px solid var(--ffv-border)' }}
          >
            {dueCount > 0 ? `Revisar ${dueCount} card${dueCount === 1 ? '' : 's'} →` : 'Fila zerada ✓'}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Streak" value={`${state.streak}d`} accent="var(--ffv-orange)" icon="🔥" />
          <StatCard label="Freezes" value={String(state.freezes ?? 0)} accent="var(--ffv-blue)" icon="🧊" hint={state.freezes > 0 ? 'te salva se esquecer' : 'faz streak de 7 dias'} />
          <StatCard label="XP hoje" value={`+${xpToday}`} accent="var(--ffv-green)" icon="⚡" />
          <StatCard label={`Meta (${goal}/dia)`} value={`${cardsToday}/${goal}`} accent="var(--ffv-purple)" icon={goalPct >= 100 ? '🎯' : '📈'} hint={goalPct >= 100 ? 'meta batida hoje' : `${goalPct}%`} />
        </div>

        <HeatmapSection studyDays={state.studyDays ?? []} />

        <div className="mt-6 grid md:grid-cols-2 gap-3">
          <WhyCard
            icon="🧠"
            title="Fila de revisão espaçada"
            text="Cada pergunta vira um card que volta no dia exato em que você está prestes a esquecer. Técnica com mais evidência empírica de retenção de longo prazo."
          />
          <WhyCard
            icon="🔥"
            title="Streak com freeze"
            text={`Voltar todo dia é o vício bom. A cada 7 dias você ganha 1 freeze (máx ${2}) que te salva se der furo. Perdeu tudo? Começa de novo, sem drama.`}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, accent, icon, hint }: { label: string; value: string; accent: string; icon: string; hint?: string }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums" style={{ color: accent }}>{value}</div>
      {hint && <div className="text-[10px] mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{hint}</div>}
    </div>
  );
}

function WhyCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>{text}</p>
    </div>
  );
}

/* ───────── Heatmap (12 semanas, estilo GitHub) ───────── */
function HeatmapSection({ studyDays }: { studyDays: Array<{ date: string; minutes: number; xpEarned: number; cardsReviewed: number; modulesCompleted: number }> }) {
  const { weeks, maxXP, totalXP, totalDays } = useMemo(() => {
    const WEEKS = 12;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    // Go back so start is Sunday WEEKS-1 weeks ago
    const dayOfWeek = today.getDay();
    start.setDate(today.getDate() - dayOfWeek - (WEEKS - 1) * 7);

    const byDate = new Map(studyDays.map(d => [d.date, d] as const));

    const weeks: Array<Array<{ date: string; xp: number; cards: number; minutes: number; modules: number; inFuture: boolean }>> = [];
    let maxXP = 0;
    let totalXP = 0;
    let totalDays = 0;

    for (let w = 0; w < WEEKS; w++) {
      const week: Array<{ date: string; xp: number; cards: number; minutes: number; modules: number; inFuture: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(start);
        cellDate.setDate(start.getDate() + w * 7 + d);
        const key = isoDate(cellDate);
        const record = byDate.get(key);
        const xp = record?.xpEarned ?? 0;
        const cards = record?.cardsReviewed ?? 0;
        const minutes = record?.minutes ?? 0;
        const modules = record?.modulesCompleted ?? 0;
        if (xp > maxXP) maxXP = xp;
        if (xp > 0) {
          totalXP += xp;
          totalDays += 1;
        }
        week.push({ date: key, xp, cards, minutes, modules, inFuture: cellDate > today });
      }
      weeks.push(week);
    }
    return { weeks, maxXP, totalXP, totalDays };
  }, [studyDays]);

  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-xs font-semibold">Últimas 12 semanas</p>
          <p className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
            {totalDays} dias com estudo · {totalXP} XP acumulado no período
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
          <span>menos</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: heatColor(i, 4) }} />
          ))}
          <span>mais</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" style={{ minWidth: 340 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const intensity = maxXP === 0 ? 0 : Math.min(4, Math.ceil((day.xp / maxXP) * 4));
                const bg = day.inFuture ? 'transparent' : heatColor(intensity, 4);
                const border = day.inFuture ? '1px dashed var(--ffv-border)' : 'none';
                const title = day.inFuture
                  ? day.date
                  : `${day.date} · ${day.xp} XP · ${day.cards} cards · ${day.modules} módulos`;
                return (
                  <div
                    key={di}
                    title={title}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: bg, border }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function heatColor(i: number, max: number): string {
  if (i === 0) return 'var(--ffv-bg3)';
  const pct = i / max;
  if (pct <= 0.25) return 'color-mix(in srgb, var(--ffv-green) 20%, var(--ffv-bg3))';
  if (pct <= 0.5) return 'color-mix(in srgb, var(--ffv-green) 40%, var(--ffv-bg3))';
  if (pct <= 0.75) return 'color-mix(in srgb, var(--ffv-green) 70%, var(--ffv-bg3))';
  return 'var(--ffv-green)';
}
