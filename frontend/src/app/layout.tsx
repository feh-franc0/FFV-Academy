import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter, Poppins, Roboto_Mono, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { WebVitalsInit } from '@/components/WebVitalsInit';
import { AppChrome } from '@/components/AppChrome';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReferralCapture } from '@/components/ReferralCapture';
import { PWARegister } from '@/components/PWARegister';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootStructuredData } from '@/components/seo/StructuredData';
import { PageTracker } from '@/components/PageTracker';

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

// Source Serif 4 — headlines editoriais da landing pública.
// Dá tom acadêmico/premium, confiável para estudantes de qualquer área
// (medicina, direito, engenharia, etc) — não parece "tech SaaS".
const sourceSerif = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fernandofrancovalle.com'),
  title: {
    default: 'FFV Academy — IA que transforma seus arquivos em uma escola completa no mesmo dia',
    template: '%s — FFV Academy',
  },
  description:
    'FFV — Formação Focada em Você. Envie seus PDFs, slides ou anotações — IA + curadoria humana montam no mesmo dia uma base completa de estudo: trilhas sequenciais, módulos, exercícios e revisão espaçada (SM-2). Não é chatbot. É a sua escola personalizada. Já no ar: Tecnologia (157 módulos) e Medicina Veterinária — Genética (12 módulos). Pode pedir Medicina, Engenharia, Direito, Administração, Design e mais. Grátis na V1.',
  keywords: [
    // Hero search intent — pivot de produto
    'IA que gera base de conhecimento',
    'criar curso personalizado com IA',
    'plataforma de estudo gerada por IA',
    'transformar PDF em curso online',
    'IA monta trilha de estudo do meu material',
    'gerar curso a partir de arquivos',
    'aprender com PDF da faculdade',
    'estudo personalizado no mesmo dia',
    'base de conhecimento sob demanda',
    // Long-tail por área (cobre bases existentes + queued)
    'medicina veterinária genética estudos',
    'leis de mendel veterinária',
    'hardy weinberg genética animal',
    'engenharia de software curso gratuito',
    'aws cloud practitioner português',
    'transformers IA arquitetura',
    'simulado oab personalizado',
    'concurso público estudo personalizado',
    'residência médica estudo organizado',
    // Plataforma + diferencial
    'revisão espaçada SM-2 português',
    'algoritmo Anki em plataforma educacional',
    'gamificação estudo XP badges streak',
    'plataforma de estudo gratuita PT-BR',
    'curso gratuito gamificado brasil',
  ],
  authors: [{ name: 'Fernando Franco Valle', url: 'https://fernandofrancovalle.com' }],
  creator: 'Fernando Franco Valle',
  publisher: 'FFV Academy',
  category: 'education',
  alternates: {
    canonical: 'https://fernandofrancovalle.com',
    languages: { 'pt-BR': 'https://fernandofrancovalle.com' },
  },
  openGraph: {
    title: 'FFV Academy — IA que transforma seus arquivos em uma escola completa no mesmo dia',
    description:
      'FFV — Formação Focada em Você. Mande seus PDFs, slides e anotações. IA + curadoria humana entregam trilhas, módulos, exercícios e revisão espaçada no mesmo dia. Já no ar: Tecnologia e Medicina Veterinária — Genética. Grátis na V1.',
    type: 'website',
    url: 'https://fernandofrancovalle.com',
    siteName: 'FFV Academy',
    locale: 'pt_BR',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FFV Academy — IA que vira PDF em escola completa no mesmo dia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FFV Academy — IA transforma seu PDF em escola completa no mesmo dia',
    description:
      'Envie arquivos, receba trilhas + módulos + exercícios + revisão espaçada. Tecnologia e Medicina Veterinária já no ar. Grátis.',
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
      { rel: 'mask-icon', url: '/icon.svg', color: '#4f46e5' },
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Default = light SEMPRE (pivot 2026-05).
// Não respeitamos prefers-color-scheme — a landing precisa ser clara, amigável
// e acolhedora para qualquer estudante, mesmo em macOS dark. Dark fica
// disponível só se o usuário tocar no toggle explicitamente (salvo em
// localStorage). Esta é uma decisão de produto, não acidente.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('ffv_theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${robotoMono.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
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
        {/* JSON-LD: Organization + WebSite + Courses (tech + medvet) — emite
            structured data pro Google indexar como rich results e cards de curso. */}
        <RootStructuredData />
        {/* Google Search Console — verificação de propriedade (substituir pelo token gerado no GSC) */}
        {/* <meta name="google-site-verification" content="SEU_TOKEN_GSC_AQUI" /> */}
        {/* Plausible Analytics — privacy-first, sem cookies, LGPD-ok, evento quiz-complete via JS */}
        <script defer data-domain="fernandofrancovalle.com" src="https://plausible.io/js/script.js" />
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
              <WebVitalsInit />
              {/* PageTracker — registra cada navegação no backend pra admin
                  ver quem acessou o quê. Identidade via X-FFV-* headers
                  (lib/tracking.ts). Dedupe por sessão. */}
              <Suspense fallback={null}>
                <PageTracker />
              </Suspense>
              <AppChrome>{children}</AppChrome>
              <Toaster
                position="top-center"
                theme="system"
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
