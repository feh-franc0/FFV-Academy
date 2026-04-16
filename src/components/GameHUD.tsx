'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HUBS, LEVELS } from '@/lib/curriculum';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CommandPaletteTrigger } from '@/components/CommandPalette';

type NavItem = { href: string; icon: string; label: string; color?: string };

const PROGRESSO: NavItem = { href: '/progresso', icon: '📊', label: 'Progresso', color: 'var(--ffv-green)' };

export function GameHUD() {
  const { state, levelInfo, dueCards } = useGameState();
  const pathname = usePathname() ?? '/';

  const navItems: NavItem[] = [
    ...HUBS.map(h => ({
      href: h.href,
      icon: h.icon,
      label: h.shortName,
      color: h.color,
    })),
    PROGRESSO,
  ];

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

      {/* Nav links — hubs + progresso */}
      <nav className="hidden md:flex items-center gap-1 mx-6 mr-auto">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <CommandPaletteTrigger />
        {state && dueCards.length > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/revisar"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: 'color-mix(in srgb, var(--ffv-green) 14%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--ffv-green) 35%, transparent)',
                    color: 'var(--ffv-green)',
                  }}
                />
              }
            >
              🧠 {dueCards.length}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dueCards.length} card{dueCards.length !== 1 ? 's' : ''} pendente{dueCards.length !== 1 ? 's' : ''} — revisar agora</p>
            </TooltipContent>
          </Tooltip>
        )}
        {state && <HUDStats state={state} levelInfo={levelInfo} />}
        <ThemeToggle />
      </div>
    </header>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const accent = item.color ?? 'var(--ffv-blue)';
  return (
    <Link
      href={item.href}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        color: active ? 'var(--foreground)' : 'var(--ffv-muted)',
        background: active ? `color-mix(in srgb, ${accent} 14%, transparent)` : 'transparent',
        border: `1px solid ${active ? `color-mix(in srgb, ${accent} 32%, transparent)` : 'transparent'}`,
      }}
    >
      <span style={{ fontSize: 13 }}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
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
                background: 'color-mix(in srgb, var(--ffv-orange) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-orange) 28%, transparent)',
                color: 'var(--ffv-orange)',
              }}
            >
              🔥 {state.streak}d
              {state.freezes > 0 && <span className="ml-1 opacity-80">· 🧊{state.freezes}</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{state.streak} dias seguidos de estudo</p>
            {state.freezes > 0 && (
              <p className="text-xs opacity-70">🧊 {state.freezes} freeze{state.freezes !== 1 ? 's' : ''} — te salva se você pular um dia</p>
            )}
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
