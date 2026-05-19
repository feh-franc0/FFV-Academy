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
import { SiteFooter, type FooterLinkItem } from '@/components/SiteFooter';
import { BaseNavProvider } from '@/components/base/BaseNavContext';
import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { TECH_NAV_ITEMS } from '@/lib/bases/tecnologia/nav';
import { MEDVET_NAV_ITEMS } from '@/lib/bases/medvet/nav';
import { MEDVET_BASE } from '@/lib/bases/medvet';
import { MARKETING_THEME } from '@/lib/bases/marketing-theme';

// Footer da medvet — coluna de hubs aponta pros 4 hubs da base + coluna de
// conteúdo só com links que fazem sentido pra estudante de veterinária.
const MEDVET_FOOTER_HUB_LINKS: FooterLinkItem[] = (MEDVET_BASE.hubs ?? []).map(h => ({
  label: h.name,
  href: `/medicina-veterinaria#${h.slug}`,
}));
const MEDVET_FOOTER_CONTENT_LINKS: FooterLinkItem[] = [
  { label: 'Trilha de Genética', href: '/medicina-veterinaria' },
  { label: 'Simulado 100 questões', href: '/medicina-veterinaria/simulado-genetica' },
  { label: 'Progresso', href: '/progresso' },
  { label: 'Revisar (SRS)', href: '/revisar' },
];

// Detecta qual base de conhecimento está ativa pelo path → escolhe quais
// itens de nav aparecem no GameHUD (top bar) e no SiteFooter. Tech é o default.
//
// `hideGlobalContentNav: true` esconde os itens GLOBAIS de conteúdo (News, o
// Simulados global de tech) — usado quando a base tem seus próprios links de
// simulado/conteúdo e não faz sentido vazar pro tech.
interface BaseChromeConfig {
  hubNavItems: typeof TECH_NAV_ITEMS | typeof MEDVET_NAV_ITEMS;
  hideGlobalContentNav?: boolean;
  footerHubLinks?: FooterLinkItem[];
  footerContentLinks?: FooterLinkItem[];
  footerHubColumnTitle?: string;
}

function getBaseChromeForPath(pathname: string): BaseChromeConfig {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  if (trimmed === '/medicina-veterinaria' || trimmed.startsWith('/medicina-veterinaria/')) {
    return {
      hubNavItems: MEDVET_NAV_ITEMS,
      hideGlobalContentNav: true,
      footerHubLinks: MEDVET_FOOTER_HUB_LINKS,
      footerContentLinks: MEDVET_FOOTER_CONTENT_LINKS,
      footerHubColumnTitle: 'Hubs temáticos',
    };
  }
  return { hubNavItems: TECH_NAV_ITEMS };
}

// Rotas públicas/marketing: header limpo (LandingHeader), sem GameHUD, sem
// MobileNav, sem banners de gamificação. Tudo o que é "app chrome" só aparece
// dentro das bases de conhecimento (ex.: /tecnologia) e nas rotas do app.
const MARKETING_PATHS = new Set([
  '/',
  '/sobre',
  '/comunidade',
  '/newsletter',
  '/bases',
]);

// Prefixos de rotas marketing — usam o chrome editorial (LandingHeader +
// LandingFooter). TODAS as bases de conhecimento (tecnologia, medvet, etc.)
// ficam no app chrome (GameHUD + SiteFooter) — gamificação igual em todas.
const MARKETING_PREFIXES: string[] = [];

function isMarketingPath(pathname: string): boolean {
  if (MARKETING_PATHS.has(pathname)) return true;
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  if (MARKETING_PATHS.has(trimmed)) return true;
  return MARKETING_PREFIXES.some(p => trimmed === p || trimmed.startsWith(p + '/'));
}

// AppChrome — decide qual header/chrome renderizar com base na rota.
//
// Marketing (/, /sobre, /comunidade, /newsletter):
//   - LandingHeader minimal (logo + "Ver Tecnologia" + "Entrar")
//   - Sem GameHUD, sem MobileNav, sem onboarding modal
//
// App (resto):
//   - GameHUD (top bar com hubs/XP/ranking)
//   - MobileNav, onboarding, banners, PWA install
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isMarketing = isMarketingPath(pathname);

  if (isMarketing) {
    // Marketing SEMPRE renderiza no tema editorial (cream + navy + amber),
    // ignorando o dark mode global do usuário. Sem isso, o usuário em dark
    // mode vê tipografia branca em fundo cream e o "FFV Academy" some.
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

  const chrome = getBaseChromeForPath(pathname);

  return (
    <BaseNavProvider
      value={{ hubNavItems: chrome.hubNavItems, hideGlobalContentNav: chrome.hideGlobalContentNav }}
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
        hubLinks={chrome.footerHubLinks}
        contentLinks={chrome.footerContentLinks}
        hubColumnTitle={chrome.footerHubColumnTitle}
      />
      <div aria-hidden className="md:hidden" style={{ height: 72 }} />
      <MobileNav />
      <PWAInstallBanner />
    </BaseNavProvider>
  );
}
