'use client';

import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LEVELS } from '@/lib/curriculum';
import { ThemeToggle } from '@/components/ThemeToggle';

export function GameHUD() {
  const { state, levelInfo } = useGameState();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-5"
      style={{
        background: 'color-mix(in srgb, var(--ffv-bg) 92%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--ffv-border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-sm tracking-tight"
        style={{ color: 'var(--foreground)' }}
      >
        <span className="text-lg">🧠</span>
        <span>FFV</span>
        <span style={{ color: 'var(--ffv-blue)', fontWeight: 400 }}>Academy</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 mx-6 mr-auto">
        <Link
          href="/fundamentos-da-ia"
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-white whitespace-nowrap"
          style={{ color: 'var(--ffv-muted)' }}
        >
          🧠 Fundamentos
        </Link>
        <Link
          href="/ia-alem-do-llm"
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-white whitespace-nowrap"
          style={{ color: 'var(--ffv-muted)' }}
        >
          🏗️ Além do LLM
        </Link>
        <Link
          href="/ferramentas-ia-codigo"
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-white whitespace-nowrap"
          style={{ color: 'var(--ffv-muted)' }}
        >
          💻 Ferramentas
        </Link>
        <Link
          href="/aws-cloud-practitioner"
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-white whitespace-nowrap"
          style={{ color: 'var(--ffv-muted)' }}
        >
          ☁️ Practitioner
        </Link>
        <Link
          href="/aws-saa-c03"
          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-white whitespace-nowrap"
          style={{ color: 'var(--ffv-muted)' }}
        >
          🏛️ SAA-C03
        </Link>
      </nav>

      <div className="flex items-center gap-3 ml-auto">
        {state && <HUDStats state={state} levelInfo={levelInfo} />}
        <ThemeToggle />
      </div>
    </header>
  );
}

function HUDStats({
  state,
  levelInfo,
}: {
  state: NonNullable<ReturnType<typeof useGameState>['state']>;
  levelInfo: ReturnType<typeof useGameState>['levelInfo'];
}) {
  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpInLevel = state.xp - (levelInfo?.xpMin ?? 0);
  const xpNeeded = (nextLevel?.xpMin ?? 9999) - (levelInfo?.xpMin ?? 0);
  const levelPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div className="flex items-center gap-3">
      {/* Streak */}
      {state.streak > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-default"
              style={{
                background: 'rgba(255,166,87,0.1)',
                border: '1px solid rgba(255,166,87,0.25)',
                color: 'var(--ffv-orange)',
              }}
            >
              🔥 {state.streak}d
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{state.streak} dias seguidos de leitura</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Level + XP bar */}
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2 cursor-default">
            <span className="text-sm">{levelInfo?.icon ?? '🌱'}</span>
            <div className="hidden sm:flex flex-col justify-center" style={{ width: 72 }}>
              <Progress value={levelPct} className="h-1.5" />
              <span className="text-xs mt-0.5 tabular-nums" style={{ color: 'var(--ffv-muted)' }}>
                {state.xp} XP
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: levelInfo?.color }}>
              Nv.{state.level}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-semibold">{levelInfo?.name}</p>
          <p className="text-xs opacity-70">{xpInLevel}/{xpNeeded} XP para o próximo nível</p>
        </TooltipContent>
      </Tooltip>

      {/* Badges */}
      {state.badges.length > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className="hidden sm:flex items-center gap-1 text-xs cursor-default px-2 py-1 rounded-full"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}
            >
              🏅 {state.badges.length}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{state.badges.length} conquista{state.badges.length !== 1 ? 's' : ''}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
