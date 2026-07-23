'use client';

import { usePathname } from 'next/navigation';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { OnboardingV3Modal } from '@/components/OnboardingV3Modal';
import { SyncBanner } from '@/components/SyncBanner';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { SiteFooter } from '@/components/SiteFooter';
import { BaseNavProvider } from '@/components/base/BaseNavContext';
import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { ActiveBaseProvider, useActiveBase } from '@/components/base/ActiveBaseContext';
import { BaseTour } from '@/components/base/BaseTour';
import { MARKETING_THEME } from '@/lib/bases/marketing-theme';
import { DEFAULT_BASE_SLUG } from '@/lib/bases/registry';
import { resolveBaseConfig } from '@/lib/bases/resolver';
import type { BaseConfig } from '@/lib/bases/types';

/**
 * AppChrome — decide qual header/chrome renderizar com base na rota.
 *
 * Em vez de detectar bases via if/else hardcoded, consulta o `BaseResolver`
 * (lib/bases/resolver.ts) que conhece todas as bases registradas. Adicionar
 * uma nova base = adicionar entrada em `lib/bases/registry.ts` — zero mudança
 * aqui.
 *
 * Marketing (/, /sobre, /comunidade, /newsletter, /bases):
 *   - LandingHeader minimal
 *   - MARKETING_THEME aplicado globalmente
 *
 * App dentro de uma base (/medicina-veterinaria/*, /tecnologia/*, /aprenda/*):
 *   - GameHUD, footer e tema vêm da base resolvida pelo pathname
 *
 * App em rota global (/progresso, /ranking, /revisar, /perfil…):
 *   - GameHUD, footer e tema vêm da BASE ATIVA (última base visitada pelo
 *     usuário). Isso mantém o usuário "no mundinho dele" mesmo quando navega
 *     pra rotas compartilhadas.
 */

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <ActiveBaseProvider>
      <AppChromeInner>{children}</AppChromeInner>
    </ActiveBaseProvider>
  );
}

function AppChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const resolved = resolveBaseConfig(pathname);
  const { base: activeBase } = useActiveBase();

  if (resolved.isMarketing) {
    return (
      <BaseThemeProvider theme={MARKETING_THEME}>
        <LandingHeader />
        <main
          id="main-content"
          className="flex-1"
          style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}
        >
          {children}
        </main>
        <LandingFooter />
      </BaseThemeProvider>
    );
  }

  // Em rotas globais (sem base no pathname), usamos a BASE ATIVA — última base
  // visitada pelo usuário. Em rotas dentro de uma base, usamos a resolvida.
  const baseForChrome: BaseConfig = resolved.isAppGlobal
    ? activeBase
    : (resolved.base ?? activeBase);

  const navConfig = baseForChrome.nav;
  const footer = baseForChrome.footer;

  const chrome = (
    <BaseNavProvider
      value={{
        hubNavItems: navConfig.hubNavItems,
        hideGlobalContentNav: navConfig.hideGlobalContentNav,
      }}
    >
      <GameHUD />
      <CommandPalette />
      <KeyboardShortcuts />
      <OnboardingV3Modal />
      <SyncBanner />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        {children}
      </main>
      <SiteFooter
        hubLinks={footer?.hubLinks}
        contentLinks={footer?.contentLinks}
        hubColumnTitle={footer?.hubColumnTitle}
        mobilePrimary={footer?.mobilePrimary}
      />
      <div aria-hidden className="md:hidden" style={{ height: 72 }} />
      <MobileNav />
      <PWAInstallBanner />
      <BaseTour />
    </BaseNavProvider>
  );

  // Em rotas globais, aplicar o tema da base ativa SEMPRE que ela for ≠ default
  // (tech). Tech mantém o styling global atual (dark/light do globals.css).
  // Em rotas dentro de uma base, o layout da base aplica o tema próprio.
  if (resolved.isAppGlobal && baseForChrome.slug !== DEFAULT_BASE_SLUG) {
    return <BaseThemeProvider theme={baseForChrome.theme}>{chrome}</BaseThemeProvider>;
  }

  return chrome;
}
