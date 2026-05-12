'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { getQuestStatuses, QUEST_DEFS } from '@/lib/quests';
import { toast } from '@/lib/toast';

export function QuestsCard() {
  const { state, claimQuest } = useGameState();
  const [claiming, setClaiming] = useState<string | null>(null);

  if (!state) return null;

  const statuses = getQuestStatuses(state);
  const daily = statuses.filter(s => s.def.period === 'daily');
  const weekly = statuses.filter(s => s.def.period === 'weekly');

  async function handleClaim(questId: string) {
    if (!state || claiming) return;
    setClaiming(questId);
    try {
      const def = QUEST_DEFS.find(q => q.id === questId);
      if (!def) return;
      claimQuest(questId, def.xpReward);
      toast.xp(def.xpReward, def.title);
    } finally {
      setClaiming(null);
    }
  }

  const completedCount = statuses.filter(s => s.alreadyClaimed).length;
  const totalCount = statuses.length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>🎯</span>
          <span className="font-bold text-sm">Quests</span>
        </div>
        <span
          className="font-mono text-xs px-2 py-1 rounded-full"
          style={{ background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)', color: 'var(--ffv-blue)', border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)' }}
        >
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <QuestGroup title="Diárias" quests={daily} onClaim={handleClaim} claiming={claiming} />
        <QuestGroup title="Semanais" quests={weekly} onClaim={handleClaim} claiming={claiming} />
      </div>
    </div>
  );
}

function QuestGroup({
  title,
  quests,
  onClaim,
  claiming,
}: {
  title: string;
  quests: ReturnType<typeof getQuestStatuses>;
  onClaim: (id: string) => void;
  claiming: string | null;
}) {
  return (
    <div>
      <p className="font-mono uppercase text-[10px] mb-3" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}>
        {title}
      </p>
      <div className="space-y-2">
        {quests.map(s => {
          const done = s.completed;
          const claimed = s.alreadyClaimed;
          const canClaim = done && !claimed;

          return (
            <div
              key={s.def.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: claimed
                  ? 'color-mix(in srgb, var(--ffv-green) 6%, transparent)'
                  : done
                    ? 'color-mix(in srgb, var(--ffv-gold) 8%, transparent)'
                    : 'var(--ffv-bg)',
                border: `1px solid ${claimed ? 'color-mix(in srgb, var(--ffv-green) 25%, transparent)' : done ? 'color-mix(in srgb, var(--ffv-gold) 25%, transparent)' : 'var(--ffv-border)'}`,
                opacity: claimed ? 0.75 : 1,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.def.icon}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: claimed ? 'var(--ffv-green)' : done ? 'var(--ffv-gold)' : 'var(--foreground)',
                    textDecoration: claimed ? 'line-through' : 'none',
                  }}
                >
                  {s.def.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{s.def.desc}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {!claimed && (
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--ffv-gold) 12%, transparent)', color: 'var(--ffv-gold)' }}
                  >
                    +{s.def.xpReward} XP
                  </span>
                )}
                {canClaim ? (
                  <button
                    type="button"
                    onClick={() => onClaim(s.def.id)}
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
                    className="w-5 h-5 rounded-full"
                    style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)', display: 'inline-block' }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
