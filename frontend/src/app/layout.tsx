import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { SiteFooter } from '@/components/SiteFooter';
import { OnboardingModalLazy } from '@/components/OnboardingModalLazy';
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
import { safeJsonLd } from '@/lib/safe-json';
import { SITE_GRAPH } from '@/lib/site-jsonld';

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

// Roboto Mono — blocos de código.
//
// Peso 500 removido em 11/ago/2026: nenhum uso de `font-mono`/`.sh-codeblock`
// no código-fonte aplica `fontWeight: 500` — os poucos elementos mono com
// peso mais forte usam 700 (que a família nem carrega; o navegador já
// sintetiza a partir de 400, então declarar 500 não ajudava esses casos).
// `code`/`pre`/`.font-mono` sempre foram 400 (herdado, sem override).
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fernandofrancovalle.com'),
  title: {
    default: 'FFV Academy — Arquitetura de Soluções AWS e IA em Produção',
    template: '%s — FFV Academy',
  },
  description:
    'Arquitete soluções de IA na AWS como engenheiro: Bedrock, Knowledge Bases, agents e 100 laboratórios em Terraform. Trilhas gamificadas com XP, quiz e revisão espaçada. 100% gratuito, sem cadastro.',
  keywords: [
    // O eixo, na ordem em que a demanda de busca o expressa: primeiro a junção
    // (IA + AWS), depois cada lado, depois a credencial. Ver
    // PESQUISA_DEMANDA_BUSCA_2026-08.md para o corpus de 10.000 consultas.
    'arquitetura de ia na aws',
    'amazon bedrock',
    'bedrock knowledge bases',
    'rag na aws',
    'agentes de ia aws',
    'agentcore',
    'arquitetura de solucoes aws',
    'laboratorio aws terraform',
    'well-architected',
    'aws saa-c03',
    'aws aif-c01',
    'ia generativa em producao',
    'llm em producao',
    'engenharia de software brasil',
  ],
  authors: [{ name: 'Fernando Franco Valle', url: 'https://fernandofrancovalle.com' }],
  creator: 'Fernando Franco Valle',
  publisher: 'FFV Academy',
  category: 'education',
  /**
   * O que o layout raiz declara aqui é HERDADO INTEIRO por toda página que não
   * declara o próprio bloco — e é por isso que `title` e `url` saíram daqui.
   *
   * Auditoria de 06/ago/2026, medindo 77 rotas servidas: **58 páginas** emitiam
   * `og:url` da HOME e `twitter:title` genérico do site. Ou seja, cada uma dizia
   * ao rastreador e a cada rede social que ELA é a página inicial. Compartilhar
   * qualquer uma delas produzia o mesmo cartão, apontando para o mesmo lugar.
   *
   * A herança que salvava essas páginas de perder o `og:image` era a mesma que as
   * fazia mentir a URL. A saída é herdar só o que é verdade para TODA página:
   *
   *  - `siteName`, `locale`, `images` e `card` valem para o site inteiro → ficam;
   *  - `title` e `description` saem: sem eles, o Next cai no `title`/`description`
   *    da própria página, que é o correto em cada uma;
   *  - `url` sai: URL errada é pior que URL ausente. Quem precisa de `og:url`
   *    exato usa `social()` de `@/lib/metadata-social`, que o monta a partir do
   *    caminho.
   *
   * A home declara o cartão dela em `app/page.tsx`, com `social()`.
   */
  openGraph: {
    type: 'website',
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
        {/*
          A política de segurança de conteúdo vive APENAS no header HTTP, em
          next.config.ts. Havia aqui uma <meta> com a mesma política, herdada da
          época do export estático — e ela não somava, INTERSECTAVA: a URL da API
          estava fixa no código, bloqueando qualquer ambiente com outra URL, e o
          script do Stripe ficava de fora por estar ausente do header. Não
          recrie esta meta: `frame-ancestors` nem sequer funciona nela.
        */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Google Search Console — verificação de propriedade (substituir pelo token gerado no GSC) */}
        {/* <meta name="google-site-verification" content="SEU_TOKEN_GSC_AQUI" /> */}
        {/* Plausible Analytics — privacy-first, sem cookies, LGPD-ok, evento quiz-complete via JS */}
        <script defer data-domain="fernandofrancovalle.com" src="https://plausible.io/js/script.js" />
        {/*
          Grafo de entidades do site — emitido UMA vez, aqui.

          Antes, a única identidade estruturada era um `publisher` inline
          repetido em cada artigo, sem `@id`: para o buscador, 415 organizações
          homônimas em vez de uma escola com 415 artigos. Com `@id` estável, as
          páginas referenciam a entidade e a autoria acumula num nó só.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(SITE_GRAPH) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}
        // Extensões de browser (ColorZilla, Grammarly, Dark Reader) injetam
        // atributos como cz-shortcut-listen no <body> antes do React hidratar.
        // suppressHydrationWarning silencia esses falsos positivos em dev.
        suppressHydrationWarning
      >
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
              <OnboardingModalLazy />
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
