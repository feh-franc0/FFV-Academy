'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Cloud, Wrench, Bot, ChartBarIncreasing, Target, Newspaper } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HUBS, LEVELS } from '@/lib/curriculum';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthBadge } from '@/components/auth/AuthBadge';
import { CommandPaletteTrigger } from '@/components/CommandPalette';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const HUB_ICONS: Record<string, LucideIcon> = {
  '/ia': BrainCircuit,
  '/aws': Cloud,
  '/engenharia': Wrench,
  '/claude-anthropic': Bot,
};

type NavItem = { href: string; label: string; color?: string; isNew?: boolean };

const PROGRESSO: NavItem = { href: '/progresso', label: 'Progresso', color: 'var(--ffv-green)' };
const SIMULADOS: NavItem = { href: '/simulados', label: 'Simulados', color: '#f78166', isNew: true };
const NEWS: NavItem = { href: '/news', label: 'News', color: '#ff5a36', isNew: true };

function NavIcon({ href, size }: { href: string; size: number }) {
  if (href === '/progresso') return <ChartBarIncreasing size={size} strokeWidth={1.8} />;
  if (href === '/simulados') return <Target size={size} strokeWidth={1.8} />;
  if (href === '/news') return <Newspaper size={size} strokeWidth={1.8} />;
  const Icon = HUB_ICONS[href];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.8} />;
}

export function GameHUD() {
  const { state, levelInfo, dueCards } = useGameState();
  const pathname = usePathname() ?? '/';

  // Apenas 4 hubs primários + Progresso no header desktop — resto fica em Cmd+K e MobileNav.
  const PRIMARY_HUB_SLUGS = new Set(['ia', 'aws', 'engenharia', 'claude-anthropic']);
  const primaryHubs: NavItem[] = HUBS
    .filter(h => PRIMARY_HUB_SLUGS.has(h.slug))
    .map(h => ({ href: h.href, label: h.shortName, color: h.color }));

  // News aparece apenas em lg+ (≥1024px), Simulados em xl+ (≥1280px) — header fica limpo em notebook.
  const navItems: NavItem[] = [...primaryHubs, PROGRESSO];
  const lgOnlyItems: NavItem[] = [NEWS];
  const xlOnlyItems: NavItem[] = [SIMULADOS];

  return (
    <header
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
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-sm tracking-tight"
        style={{ color: 'var(--foreground)' }}
      >
        <BrainCircuit size={20} strokeWidth={1.8} style={{ color: 'var(--ffv-blue)' }} />
        <span>FFV</span>
        <span style={{ color: 'var(--ffv-blue)', fontWeight: 400 }}>Academy</span>
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
        {state && dueCards.length > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/revisar"
                  aria-label={`${dueCards.length} cards pendentes`}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
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
        <AuthBadge />
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
      <NavIcon href={item.href} size={14} />
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
