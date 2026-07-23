'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { getQuestProgress, getQuestActionHref } from '@/lib/quests';
import type { QuestProgress } from '@/lib/quests';
import { toast } from '@/lib/toast';
import { playXPCoin } from '@/lib/sounds';
import { useActiveBase } from '@/components/base/ActiveBaseContext';

type Period = 'daily' | 'weekly';

export function QuestPanel() {
  const { state, claimQuestV2 } = useGameState();
  const { base: activeBase } = useActiveBase();
  const [period, setPeriod] = useState<Period>('daily');
  const [claiming, setClaiming] = useState<string | null>(null);

  if (!state || state.xp === 0) return null;

  const allProgress = getQuestProgress(state, activeBase.slug);
  const shown = allProgress.filter(p => p.quest.type === period);
  const basePath = activeBase.basePath || `/${activeBase.slug}`;

  const dailyProgress = allProgress.filter(p => p.quest.type === 'daily');
  const dailyDone = dailyProgress.filter(p => p.claimed).length;
  const dailyTotal = dailyProgress.length;

  const weeklyProgress = allProgress.filter(p => p.quest.type === 'weekly');
  const weeklyDone = weeklyProgress.filter(p => p.claimed).length;
  const weeklyTotal = weeklyProgress.length;

  function handleClaim(p: QuestProgress) {
    if (!state || claiming || p.claimed || !p.completed) return;
    setClaiming(p.quest.id);
    try {
      claimQuestV2(p.quest.id, p.quest.xpReward);
      playXPCoin();
      toast.xp(p.quest.xpReward, p.quest.title);
    } finally {
      setClaiming(null);
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--ffv-border)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>⚔️</span>
          <span className="font-bold text-sm">
            {period === 'daily' ? 'Quests de Hoje' : 'Quests da Semana'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {period === 'daily' ? (
            <span
              className="font-mono text-xs px-2 py-1 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)',
                color: 'var(--ffv-blue)',
                border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
              }}
            >
              {dailyDone}/{dailyTotal}
            </span>
          ) : (
            <span
              className="font-mono text-xs px-2 py-1 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--ffv-purple) 12%, transparent)',
                color: 'var(--ffv-purple)',
                border: '1px solid color-mix(in srgb, var(--ffv-purple) 30%, transparent)',
              }}
            >
              {weeklyDone}/{weeklyTotal}
            </span>
          )}
          <button
            type="button"
            onClick={() => setPeriod(p => p === 'daily' ? 'weekly' : 'daily')}
            className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--ffv-bg)',
              color: 'var(--ffv-muted)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            {period === 'daily' ? 'Semanais' : 'Diárias'}
          </button>
        </div>
      </div>

      {/* Quest list */}
      <div className="p-4 space-y-3">
        {shown.map(p => {
          const { quest, current, completed, claimed } = p;
          const canClaim = completed && !claimed;
          const pct = Math.min(1, current / quest.target);
          const actionHref = getQuestActionHref(quest, basePath);
          // Link a quest card só quando há ação útil:
          // - claimed: nada a fazer, vira div estática
          // - canClaim: o resgate é a ação principal (botão), não vamos competir
          // - in-progress: link inteiro leva pra ação (módulo/revisar) sem
          //   interceptar o botão (que não existe nesse estado).
          const isLinkable = !claimed && !canClaim;
          const Wrapper: React.ElementType = isLinkable ? Link : 'div';
          const wrapperProps = isLinkable
            ? { href: actionHref, 'aria-label': `Ir para a ação: ${quest.title}` }
            : {};

          return (
            <Wrapper
              key={quest.id}
              {...wrapperProps}
              className={`rounded-xl px-4 py-3 block ${isLinkable ? 'transition-all hover:shadow-md hover:-translate-y-0.5' : ''}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: claimed
                  ? 'color-mix(in srgb, var(--ffv-green) 6%, transparent)'
                  : completed
                    ? 'color-mix(in srgb, var(--ffv-gold) 8%, transparent)'
                    : 'var(--ffv-bg)',
                border: `1px solid ${
                  claimed
                    ? 'color-mix(in srgb, var(--ffv-green) 25%, transparent)'
                    : completed
                      ? 'color-mix(in srgb, var(--ffv-gold) 25%, transparent)'
                      : 'var(--ffv-border)'
                }`,
                opacity: claimed ? 0.75 : 1,
                cursor: isLinkable ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 20, flexShrink: 0 }}>{quest.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: claimed
                        ? 'var(--ffv-green)'
                        : completed
                          ? 'var(--ffv-gold)'
                          : 'var(--foreground)',
                      textDecoration: claimed ? 'line-through' : 'none',
                    }}
                  >
                    {quest.title}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div
                      className="flex-1 rounded-full overflow-hidden"
                      style={{ height: 6, background: 'var(--ffv-border)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct * 100}%`,
                          background: claimed
                            ? 'var(--ffv-green)'
                            : completed
                              ? 'var(--ffv-gold)'
                              : 'var(--ffv-blue)',
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-xs flex-shrink-0"
                      style={{ color: 'var(--ffv-muted)', minWidth: 36, textAlign: 'right' }}
                    >
                      {current}/{quest.target}
                    </span>
                  </div>
                </div>
                {/* Right side: XP badge + action */}
                <div className="flex-shrink-0 flex items-center gap-2 ml-1">
                  {!claimed && (
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--ffv-gold) 12%, transparent)',
                        color: 'var(--ffv-gold)',
                      }}
                    >
                      +{quest.xpReward} XP
                    </span>
                  )}
                  {canClaim ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(p)}
                      disabled={!!claiming}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
                      style={{
                        background: 'var(--ffv-gold)',
                        color: '#0d1117',
                        border: 'none',
                        cursor: claiming ? 'wait' : 'pointer',
                        opacity: claiming ? 0.7 : 1,
                      }}
                    >
                      Resgatar →
                    </button>
                  ) : claimed ? (
                    <span style={{ fontSize: 16 }}>✅</span>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full inline-block"
                      style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
                    />
                  )}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
