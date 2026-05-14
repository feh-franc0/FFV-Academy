import type { Metadata } from 'next';
import Link from 'next/link';
import { loadNewsFeedAsync, sortByDateDesc } from '@/lib/news';
import { NewsClient } from '@/components/news/NewsClient';

export const metadata: Metadata = {
  title: 'News — IA, Anthropic, OpenAI, infra · FFV Academy',
  description:
    'As notícias mais relevantes da semana em IA, modelos, arquitetura e infra. Curadoria editorial sem hype, com link pra fonte original.',
  keywords:
    'noticias ia, anthropic, openai, claude opus, gemini, llama, regulação ai act, benchmarks, deepseek, nvidia blackwell',
  alternates: { canonical: 'https://fernandofrancovalle.com/news' },
  openGraph: {
    title: 'News — IA e engenharia moderna · FFV Academy',
    description: 'Curadoria semanal das notícias que realmente importam em IA e arquitetura.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/news',
  },
};

export default async function NewsPage() {
  const feed = await loadNewsFeedAsync();
  const items = sortByDateDesc(feed.items);
  const hotCount = items.filter(i => i.hot).length;

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      {/* Hero editorial */}
      <section className="relative px-5 pt-12 pb-10 md:pt-16 md:pb-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 16%, transparent) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 30%, color-mix(in srgb, var(--ffv-purple) 14%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--ffv-grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--ffv-grid-line) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage:
              'radial-gradient(ellipse 70% 50% at 50% 30%, #000 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 50% at 50% 30%, #000 30%, transparent 80%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          <nav className="text-xs mb-6 font-mono" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}>
            <Link
              href="/"
              className="transition-opacity hover:opacity-70"
              style={{ color: 'var(--ffv-muted)' }}
            >
              FFV ACADEMY
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--foreground)' }}>NEWS</span>
          </nav>

          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest"
              style={{
                background: 'color-mix(in srgb, var(--ffv-green) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-green) 30%, transparent)',
                color: 'var(--ffv-green)',
                letterSpacing: '0.12em',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--ffv-green)', boxShadow: '0 0 8px var(--ffv-green)' }}
                aria-hidden
              />
              CURADORIA EDITORIAL · {formatBrDate(feed.updatedAt)}
            </span>
            <span
              className="hidden md:inline-flex items-center gap-2 text-[10px] font-mono"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}
            >
              {items.length} notícias · {hotCount} em destaque
            </span>
          </div>

          <h1
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              overflowWrap: 'anywhere',
              hyphens: 'auto',
              maxWidth: 920,
            }}
          >
            O que está
            <br />
            <span
              style={{
                background:
                  'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple), #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              redefinindo a IA agora.
            </span>
          </h1>
          <p
            className="text-base md:text-lg max-w-3xl leading-relaxed"
            style={{ color: 'var(--ffv-muted)' }}
          >
            Seleção editorial das notícias que realmente importam em IA, infra e arquitetura moderna.
            Sem ruído, sem hype — cada matéria leva direto à fonte original. Atualizado semanalmente
            por curadoria humana.
          </p>
        </div>
      </section>

      <div
        className="max-w-6xl mx-auto px-5 pb-20"
        style={{ borderTop: '1px solid var(--ffv-border)', paddingTop: 40 }}
      >
        <NewsClient items={items} />
      </div>
    </div>
  );
}

function formatBrDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
