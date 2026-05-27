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


export function GameHUD() {
  const pathname = usePathname() ?? '/';

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

      {/* Espaçador — empurra busca + auth pra direita */}
      <div className="flex-1" />

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        {/* Busca global (Cmd+K) — mantida em todos */}
        <CommandPaletteTrigger />

        {/*
          REMOVIDOS em 2026-05-26 (decisão de produto — limpar header):
            - <nav> com hubNavItems (IA/AWS/Engenharia/Claude/Progresso/Simulados)
              → quem quiser navegar por hub vê na home da base
            - 🎯 Meta diária pill
            - 🔖 Bookmarks pill
            - 🧠 Cards pendentes pill (revisão agora vive no dropdown do avatar)
            - <HUDStats /> (XP / nível / streak / conquistas)
            - Streak-at-risk toast (estilo "🔥 1d em risco")
          Razão: header virou padrão pra TODAS as bases. Progresso/Revisar/
          Preferências/Sair foram pro dropdown do AuthBadge (avatar). Aluno
          vê stats quando quer, não permanentemente.
        */}

        <AuthBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}

