import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { SiteFooter } from '@/components/SiteFooter';
import { OnboardingModal } from '@/components/OnboardingModal';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReferralCapture } from '@/components/ReferralCapture';
import { PWARegister } from '@/components/PWARegister';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Inter — corpo do texto (máxima legibilidade)
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

// Poppins — títulos e headlines (personalidade)
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

// Roboto Mono — blocos de código
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'FFV Academy — Escola de Engenharia para a Era da IA',
  description: 'Aprenda IA, engenharia de software, AWS e sistemas distribuídos como engenheiro — não como consumidor de hype. Trilhas gamificadas com XP, quiz e revisão espaçada. 100% gratuito, sem cadastro.',
  keywords: 'escola engenharia software, aprender inteligencia artificial, trilha IA, engenharia era ia, LLM aprender, machine learning devs, aws cloud practitioner, sistemas distribuidos',
  openGraph: {
    title: 'FFV Academy — Escola de Engenharia para a Era da IA',
    description: 'IA, AWS, DevOps e Engenharia de Software explicados por dentro. Zero hype, arquitetura real. 17 trilhas gamificadas, 100% gratuito.',
    type: 'website',
    url: 'https://fernandofrancovalle.com',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FFV Academy',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('ffv_theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Em dev o next.config.ts injeta o header CSP com unsafe-eval (necessário para React HMR/Turbopack).
            Em prod (export estático na Hostinger) não há headers HTTP, então o <meta> é a única forma. */}
        {process.env.NODE_ENV !== 'development' && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.fernandofrancovalle.com https://api.stripe.com https://plausible.io https://cdn.jsdelivr.net https://esm.sh; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'"
          />
        )}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Google Search Console — verificação de propriedade (substituir pelo token gerado no GSC) */}
        {/* <meta name="google-site-verification" content="SEU_TOKEN_GSC_AQUI" /> */}
        {/* Plausible Analytics — privacy-first, sem cookies, LGPD-ok, evento quiz-complete via JS */}
        <script defer data-domain="fernandofrancovalle.com" src="https://plausible.io/js/script.js" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
        <a href="#main-content" className="skip-to-content">Pular para o conteúdo</a>
        <ReferralCapture />
        <PWARegister />
        <ErrorBoundary>
          <AuthProvider>
            <TooltipProvider>
              <GameHUD />
              <CommandPalette />
              <OnboardingModal />
              <main
                id="main-content"
                className="flex-1"
                style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
              >
                {children}
              </main>
              <SiteFooter />
              <div aria-hidden className="md:hidden" style={{ height: 72 }} />
              <MobileNav />
            </TooltipProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
