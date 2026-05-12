import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { SiteFooter } from '@/components/SiteFooter';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SyncBanner } from '@/components/SyncBanner';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { WebVitalsInit } from '@/components/WebVitalsInit';
import { Toaster } from 'sonner';
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
  metadataBase: new URL('https://fernandofrancovalle.com'),
  title: {
    default: 'FFV Academy — Escola de Engenharia para a Era da IA',
    template: '%s — FFV Academy',
  },
  description:
    'Aprenda IA, engenharia de software, AWS e sistemas distribuídos como engenheiro — não como consumidor de hype. Trilhas gamificadas com XP, quiz e revisão espaçada. 100% gratuito, sem cadastro.',
  keywords: [
    'escola engenharia software',
    'aprender inteligencia artificial',
    'trilha IA',
    'engenharia era ia',
    'LLM aprender',
    'RAG embeddings',
    'machine learning devs',
    'aws cloud practitioner',
    'sistemas distribuidos',
    'context engineering',
    'agentes LLM',
    'fine-tuning',
    'engenharia de software brasil',
  ],
  authors: [{ name: 'Fernando Franco Valle', url: 'https://fernandofrancovalle.com' }],
  creator: 'Fernando Franco Valle',
  publisher: 'FFV Academy',
  category: 'education',
  openGraph: {
    title: 'FFV Academy — Escola de Engenharia para a Era da IA',
    description:
      'IA, AWS, DevOps e Engenharia de Software explicados por dentro. Zero hype, arquitetura real. 17 trilhas gamificadas, 100% gratuito.',
    type: 'website',
    url: 'https://fernandofrancovalle.com',
    siteName: 'FFV Academy',
    locale: 'pt_BR',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FFV Academy — Escola de Engenharia para a Era da IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FFV Academy — Escola de Engenharia para a Era da IA',
    description:
      'IA, AWS, DevOps e Engenharia de Software explicados por dentro. Zero hype, arquitetura real. 17 trilhas, 100% gratuito.',
    images: ['/opengraph-image'],
    creator: '@fernandofv',
    site: '@ffvacademy',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FFV Academy',
    startupImage: [
      {
        url: '/icons/splash-2048x2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/splash-1668x2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/splash-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#38bdf8' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'SEU_TOKEN_GSC_AQUI',
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
            content="default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://avatars.githubusercontent.com https://api.fernandofrancovalle.com; connect-src 'self' https://api.fernandofrancovalle.com https://api.stripe.com https://plausible.io https://cdn.jsdelivr.net https://esm.sh; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'"
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
              <KeyboardShortcuts />
              <WebVitalsInit />
              <OnboardingModal />
              <SyncBanner />
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
              <PWAInstallBanner />
              <Toaster
                position="top-center"
                theme="dark"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    background: 'var(--ffv-bg2)',
                    border: '1px solid var(--ffv-border)',
                    color: 'var(--foreground)',
                  },
                }}
              />
            </TooltipProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
