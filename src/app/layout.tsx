import type { Metadata } from 'next';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { GameHUD } from '@/components/GameHUD';
import { CommandPalette } from '@/components/CommandPalette';
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
  title: 'FFV Academy — Aprenda IA do Zero ao Avançado',
  description: 'Trilha de aprendizado gamificada sobre Inteligência Artificial. Do conceito básico até arquiteturas avançadas. Aprenda com XP, badges e progresso visual.',
  keywords: 'aprender inteligencia artificial, trilha IA, curso IA gamificado, LLM aprender, machine learning iniciantes',
  openGraph: {
    title: 'FFV Academy — Aprenda IA do Zero ao Avançado',
    description: 'Trilha gamificada de IA. XP, badges, progresso visual. 100% gratuito, sem cadastro.',
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
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
        <TooltipProvider>
          <GameHUD />
          <CommandPalette />
          <main className="flex-1 pt-14">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
