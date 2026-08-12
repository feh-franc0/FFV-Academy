'use client';

import type { StudyDay } from '@/lib/engine';
import { isoDate } from '@/lib/srs';

interface Props {
  studyDays: StudyDay[];
  /** Number of days to show (default 91 = 13 weeks) */
  days?: number;
}

const DAYS_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getIntensity(xp: number): 0 | 1 | 2 | 3 | 4 {
  if (xp === 0) return 0;
  if (xp < 30) return 1;
  if (xp < 80) return 2;
  if (xp < 150) return 3;
  return 4;
}

const INTENSITY_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'var(--ffv-bg3)',
  1: 'color-mix(in srgb, var(--ffv-green) 25%, transparent)',
  2: 'color-mix(in srgb, var(--ffv-green) 50%, transparent)',
  3: 'color-mix(in srgb, var(--ffv-green) 75%, transparent)',
  4: 'var(--ffv-green)',
};

export function StudyHeatmap({ studyDays, days = 91 }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build lookup map: ISO date → StudyDay
  const byDate = new Map<string, StudyDay>();
  for (const d of studyDays) byDate.set(d.date, d);

  // Build grid: days cells starting from the Sunday before (days) days ago
  const cells: Array<{ date: Date; iso: string; xp: number; minutes: number; cards: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = isoDate(d);
    const entry = byDate.get(iso);
    cells.push({
      date: d,
      iso,
      xp: entry?.xpEarned ?? 0,
      minutes: entry?.minutes ?? 0,
      cards: entry?.cardsReviewed ?? 0,
    });
  }

  // Pad start so grid begins on Sunday
  const startDow = cells[0].date.getDay(); // 0=Sun
  const padded = Array<null>(startDow).fill(null).concat(cells as never[]) as Array<null | typeof cells[0]>;

  // Split into weeks (columns of 7)
  const weeks: Array<Array<null | typeof cells[0]>> = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels: find the first cell of each month
  const monthLabels: Array<{ weekIdx: number; label: string }> = [];
  for (let wi = 0; wi < weeks.length; wi++) {
    for (const cell of weeks[wi]) {
      if (!cell) continue;
      if (cell.date.getDate() <= 7) {
        const label = cell.date.toLocaleDateString('pt-BR', { month: 'short' });
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
          monthLabels.push({ weekIdx: wi, label });
        }
      }
      break;
    }
  }

  const totalXp = cells.reduce((s, c) => s + c.xp, 0);
  const activeDays = cells.filter(c => c.xp > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ffv-muted)', fontWeight: 700 }}
        >
          HISTÓRICO DE ESTUDOS — últimos {days} dias
        </span>
        <span style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>
          {activeDays} dias ativos · {totalXp.toLocaleString('pt-BR')} XP
        </span>
      </div>

      <div
        tabIndex={0}
        role="group"
        aria-label="Heatmap de estudo dos últimos 91 dias, rolável na horizontal"
        className="rounded-xl p-4 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 28 }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.weekIdx === wi);
            return (
              <div key={wi} style={{ width: 14, flexShrink: 0, fontSize: 9, color: 'var(--ffv-muted)', whiteSpace: 'nowrap' }}>
                {ml ? ml.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 mr-1" style={{ paddingTop: 0 }}>
            {DAYS_LABEL.map((label, i) => (
              <div key={i} style={{ height: 12, fontSize: 8, color: 'var(--ffv-muted)', lineHeight: '12px', whiteSpace: 'nowrap' }}>
                {i % 2 === 0 ? label.slice(0, 3) : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => {
                if (!cell) {
                  return <div key={di} style={{ width: 12, height: 12 }} />;
                }
                const intensity = getIntensity(cell.xp);
                const isToday = cell.iso === isoDate(today);
                return (
                  <div
                    key={di}
                    title={cell.xp > 0
                      ? `${cell.date.toLocaleDateString('pt-BR')}: ${cell.xp} XP · ${cell.cards} cards · ${cell.minutes} min`
                      : cell.date.toLocaleDateString('pt-BR')}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: INTENSITY_COLORS[intensity],
                      outline: isToday ? '1px solid var(--ffv-green)' : undefined,
                      transition: 'background 0.2s',
                      cursor: cell.xp > 0 ? 'help' : 'default',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span style={{ fontSize: 9, color: 'var(--ffv-muted)' }}>Menos</span>
          {([0, 1, 2, 3, 4] as const).map(i => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: INTENSITY_COLORS[i] }} />
          ))}
          <span style={{ fontSize: 9, color: 'var(--ffv-muted)' }}>Mais</span>
        </div>
      </div>
    </div>
  );
}
