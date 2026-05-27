'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FfvLogo } from '@/components/ui/ffv-logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthBadge } from '@/components/auth/AuthBadge';
import { CommandPaletteTrigger } from '@/components/CommandPalette';
import { unlockAudio } from '@/lib/sounds';
import { BaseSwitcher } from '@/components/base/BaseSwitcher';
import { useGameState } from '@/hooks/useGameState';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { selectDueCardsForBase } from '@/lib/bases/state-selectors';

const NAV_TABS = [
  { href: '/simulados', label: 'Simulados', icon: '🎯' },
  { href: '/revisar', label: 'Revisar', icon: '🧠' },
] as const;


export function GameHUD() {
  const pathname = usePathname() ?? '/';
  const { state, levelInfo, dueCards } = useGameState();
  const { base: activeBase } = useActiveBase();
  // Cards SRS pendentes na base ativa — pra mostrar badge no tab "Revisar"
  const baseDueCards = state ? selectDueCardsForBase(dueCards, activeBase.slug) : [];

  // Unlock audio on first interaction with the header
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const handler = () => unlockAudio();
    el.addEventListener('click', handler, { once: true });
    return () => el.removeEventListener('click', handler);
  }, []);

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

      {/* Switcher de base: chip com dropdown de bases disponíveis. */}
      <BaseSwitcher pathname={pathname} />

      {/* Tabs globais — Simulados e Revisar. Padrão em TODAS as bases.
          Se um dia houver banco de questões avulso (/questoes), entra aqui. */}
      <nav className="hidden md:flex items-center gap-1 mx-3 mr-auto">
        {NAV_TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const showBadge = tab.href === '/revisar' && baseDueCards.length > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
              style={{
                color: active ? 'var(--foreground)' : 'var(--ffv-muted)',
                background: active
                  ? 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)'
                  : 'transparent',
                border: `1px solid ${active ? 'color-mix(in srgb, var(--ffv-blue) 32%, transparent)' : 'transparent'}`,
              }}
            >
              <span aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
              {showBadge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0 rounded-full ml-0.5"
                  style={{ background: 'var(--ffv-green)', color: '#fff', lineHeight: '14px' }}
                  aria-label={`${baseDueCards.length} cards pendentes`}
                >
                  {baseDueCards.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        {/* Busca global (Cmd+K) — mantida em todos */}
        <CommandPaletteTrigger />

        {/* Chip de nível — clicável → /progresso. Só aparece pra logado.
            Voltou pro header em 2026-05-26 como sinalizador motivacional
            discreto (decisão do PO). */}
        {state && levelInfo && (
          <Link
            href="/progresso"
            aria-label={`Nível ${state.level} · ${state.xp} XP · ver progresso`}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'color-mix(in srgb, var(--ffv-yellow) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-yellow) 32%, transparent)',
              color: 'var(--ffv-yellow)',
              textDecoration: 'none',
            }}
          >
            <span aria-hidden>{levelInfo.icon}</span>
            <span>Nv.{state.level}</span>
          </Link>
        )}

        <AuthBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}

