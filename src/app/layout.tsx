import type { Metadata } from 'next';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileNav } from '@/components/MobileNav';
import { OnboardingModal } from '@/components/OnboardingModal';
import { TooltipProvider } from '@/components/ui/tooltip';

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
    description: 'IA, AWS, DevOps e Engenharia de Software explicados por dentro. Zero hype, arquitetura real. 16 trilhas gamificadas, 100% gratuito.',
    type: 'website',
    url: 'https://fernandofrancovalle.com',
  },
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Umami Analytics — privacy-first, sem cookies, GDPR-ok */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ffv-academy"
          data-domains="fernandofrancovalle.com"
          data-do-not-track="true"
        />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
        <TooltipProvider>
          <GameHUD />
          <CommandPalette />
          <OnboardingModal />
          <main className="flex-1 pt-14 pb-16 md:pb-0">{children}</main>
          <MobileNav />
        </TooltipProvider>
      </body>
    </html>
  );
}
