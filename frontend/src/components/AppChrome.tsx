'use client';

import { usePathname } from 'next/navigation';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SyncBanner } from '@/components/SyncBanner';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { SiteFooter } from '@/components/SiteFooter';
import { BaseNavProvider } from '@/components/base/BaseNavContext';
import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { MARKETING_THEME } from '@/lib/bases/marketing-theme';
import { resolveBaseConfig } from '@/lib/bases/resolver';

/**
 * AppChrome — decide qual header/chrome renderizar com base na rota.
 *
 * Em vez de detectar bases via if/else hardcoded, consulta o `BaseResolver`
 * (lib/bases/resolver.ts) que conhece todas as bases registradas. Adicionar
 * uma nova base = adicionar entrada em `lib/bases/registry.ts` — zero mudança
 * aqui.
 *
 * Marketing (/, /sobre, /comunidade, /newsletter, /bases):
 *   - LandingHeader minimal (logo + "Ver Tecnologia" + "Entrar")
 *   - Sem GameHUD, sem MobileNav, sem onboarding modal
 *
 * App (resto):
 *   - GameHUD (top bar com hubs/XP/ranking da base resolvida)
 *   - MobileNav, onboarding, banners, PWA install
 *   - SiteFooter parametrizado por `BaseConfig.footer`
 */

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const resolved = resolveBaseConfig(pathname);

  if (resolved.isMarketing) {
    // Marketing SEMPRE renderiza no tema editorial (cream + navy + amber),
    // ignorando o dark mode global do usuário.
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

  const base = resolved.base;
  // base é null só se nenhum config existir — defensivo. Em produção sempre
  // cai no DEFAULT (tech) via resolver.
  const navConfig = base?.nav ?? { hubNavItems: [], hideGlobalContentNav: false };
  const footer = base?.footer;

  return (
    <BaseNavProvider
      value={{
        hubNavItems: navConfig.hubNavItems,
        hideGlobalContentNav: navConfig.hideGlobalContentNav,
      }}
    >
      <GameHUD />
      <CommandPalette />
      <KeyboardShortcuts />
      <OnboardingModal />
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
    </BaseNavProvider>
  );
}
