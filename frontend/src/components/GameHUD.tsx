'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Cloud, Wrench, Bot, ChartBarIncreasing, Target, BookOpen } from 'lucide-react';
import { FfvLogo } from '@/components/ui/ffv-logo';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LEVELS } from '@/lib/curriculum';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthBadge } from '@/components/auth/AuthBadge';
import { CommandPaletteTrigger } from '@/components/CommandPalette';
import { unlockAudio } from '@/lib/sounds';
import { toast } from '@/lib/toast';
import { useBaseNav, type BaseNavItem } from '@/components/base/BaseNavContext';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { selectDueCardsForBase } from '@/lib/bases/state-selectors';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

// Mapa de ícones por nome — bases podem usar `iconName` em vez de href
// hardcoded. Adicione ícones aqui ao precisar.
const ICON_MAP: Record<string, LucideIcon> = {
  brain: BrainCircuit,
  cloud: Cloud,
  wrench: Wrench,
  bot: Bot,
  book: BookOpen,
  target: Target,
  chart: ChartBarIncreasing,
};

// Itens globais — aparecem em TODAS as bases (a menos que a base esconda).
const PROGRESSO: BaseNavItem = {
  href: '/progresso',
  label: 'Progresso',
  color: 'var(--ffv-green)',
  iconName: 'chart',
};
const SIMULADOS: BaseNavItem = {
  href: '/simulados',
  label: 'Simulados',
  color: '#f78166',
  iconName: 'target',
  isNew: true,
};

function NavIcon({ item, size }: { item: BaseNavItem; size: number }) {
  if (!item.iconName) return null;
  const Icon = ICON_MAP[item.iconName];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.8} />;
}

export function GameHUD() {
  const { state, levelInfo, dueCards, todayReviewCount, dailyGoalMet } = useGameState();
  const pathname = usePathname() ?? '/';
  const { base: activeBase } = useActiveBase();
  // Filtra os cards SRS devidos pela base ativa — sem isso, o pill mostra
  // contagem cross-base (tech + medvet) e o usuário em medvet vê questões tech.
  const baseDueCards = selectDueCardsForBase(dueCards, activeBase.slug);

  // Unlock audio on first interaction with the header
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const handler = () => unlockAudio();
    el.addEventListener('click', handler, { once: true });
    return () => el.removeEventListener('click', handler);
  }, []);

  // Streak-at-risk reminder — once per day, shown when user hasn't studied yet and streak > 0
  useEffect(() => {
    if (!state || state.streak === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastStudied = state.lastStudyDate;
    if (lastStudied === today) return;
    const storageKey = `ffv_streak_reminder_${today}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (lastStudied === yesterdayStr) {
      toast.info(`🔥 Sequência de ${state.streak} dias em risco — estude algo hoje!`);
    }
  }, [state]);

  // Nav items vêm do BaseNavContext (cada base define seus próprios hubs).
  // Default = vazio. /tecnologia layout injeta IA/AWS/Engenharia/Claude.
  const { hubNavItems, hideGlobalContentNav = false } = useBaseNav();

  // Itens "do meio" — hubs da base atual + Progresso (sempre).
  const navItems: BaseNavItem[] = [
    ...hubNavItems.filter(i => !i.lgOnly && !i.xlOnly),
    PROGRESSO,
  ];
  const lgOnlyItems: BaseNavItem[] = hubNavItems.filter(i => i.lgOnly && !i.xlOnly);
  const xlOnlyItems: BaseNavItem[] = [
    ...hubNavItems.filter(i => i.xlOnly),
    ...(hideGlobalContentNav ? [] : [SIMULADOS]),
  ];

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-5"
      style={{
        height: 'calc(56px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'color-mix(in srgb, var(--ffv-bg) 92%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--ffv-border)',
      }}
    >
      {/* Logo */}
      <Link href="/" aria-label="FFV Academy — voltar para a home">
        <FfvLogo size="sm" />
      </Link>

      {/* Nav links — hubs primários + progresso (News/Simulados progressivos em lg/xl) */}
      <nav className="hidden md:flex items-center gap-1 mx-6 mr-auto">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}
        {lgOnlyItems.map(item => (
          <span key={item.href} className="hidden lg:inline-flex">
            <NavLink item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
          </span>
        ))}
        {xlOnlyItems.map(item => (
          <span key={item.href} className="hidden xl:inline-flex">
            <NavLink item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <CommandPaletteTrigger />
        {/* Daily goal pill */}
        {state && state.dailyGoal > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Link
                href="/revisar"
                aria-label={`Meta diária: ${todayReviewCount} de ${state.dailyGoal} cards`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: dailyGoalMet
                    ? 'color-mix(in srgb, var(--ffv-green) 14%, transparent)'
                    : 'color-mix(in srgb, var(--ffv-yellow) 12%, transparent)',
                  border: `1px solid ${dailyGoalMet ? 'color-mix(in srgb, var(--ffv-green) 32%, transparent)' : 'color-mix(in srgb, var(--ffv-yellow) 28%, transparent)'}`,
                  color: dailyGoalMet ? 'var(--ffv-green)' : 'var(--ffv-yellow)',
                }}
              >
                🎯 {todayReviewCount}/{state.dailyGoal}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dailyGoalMet ? '✅ Meta diária atingida!' : `Meta: ${todayReviewCount} de ${state.dailyGoal} cards hoje`}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {state && baseDueCards.length > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/revisar"
                  aria-label={`${baseDueCards.length} cards pendentes`}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: 'color-mix(in srgb, var(--ffv-green) 14%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--ffv-green) 35%, transparent)',
                    color: 'var(--ffv-green)',
                  }}
                />
              }
            >
              🧠 {baseDueCards.length}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{baseDueCards.length} card{baseDueCards.length !== 1 ? 's' : ''} pendente{baseDueCards.length !== 1 ? 's' : ''} — revisar agora</p>
            </TooltipContent>
          </Tooltip>
        )}
        {state && <HUDStats state={state} levelInfo={levelInfo} />}
        <AuthBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}

function NavLink({ item, active }: { item: BaseNavItem; active: boolean }) {
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
      <NavIcon item={item} size={14} />
      <span>{item.label}</span>
      {item.isNew && (
        <span
          className="text-[9px] font-bold px-1.5 py-0 rounded-full"
          style={{ background: accent, color: '#0d1117' }}
        >
          NOVO
        </span>
      )}
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

  // Animate XP number when it changes
  const prevXp = useRef(state.xp);
  const [xpBump, setXpBump] = useState(false);
  useEffect(() => {
    if (prevXp.current !== state.xp) {
      prevXp.current = state.xp;
      setXpBump(true);
      const t = setTimeout(() => setXpBump(false), 600);
      return () => clearTimeout(t);
    }
  }, [state.xp]);

  return (
    <div className="flex items-center gap-3">
      {/* Mobile-only: ícone compacto de nível linkando pra /progresso */}
      <Link
        href="/progresso"
        aria-label={`Nível ${state.level} — ${state.xp} XP`}
        className="sm:hidden flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          textDecoration: 'none',
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        <span aria-hidden>{levelInfo?.icon ?? '🌱'}</span>
      </Link>

      {/* Streak — sm+ */}
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

      {/* Level + XP bar — sm+ apenas (mobile usa o link compacto acima) */}
      <Tooltip>
        <TooltipTrigger>
          <div className="hidden sm:flex items-center gap-2 cursor-default">
            <span className="text-sm">{levelInfo?.icon ?? '🌱'}</span>
            <div className="flex flex-col justify-center" style={{ width: 72 }}>
              <Progress
                value={levelPct}
                className="h-1.5"
                style={{ transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <span
                className="text-xs mt-0.5 tabular-nums"
                style={{
                  color: xpBump ? levelInfo?.color ?? 'var(--ffv-green)' : 'var(--ffv-muted)',
                  fontWeight: xpBump ? 700 : undefined,
                  transition: 'color 0.4s ease, font-weight 0.2s ease',
                }}
              >
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
