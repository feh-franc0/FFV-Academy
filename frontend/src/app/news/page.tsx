import type { Metadata } from 'next';
import Link from 'next/link';
import { loadNewsFeed, sortByDateDesc } from '@/lib/news';
import { NewsClient } from '@/components/news/NewsClient';

export const metadata: Metadata = {
  title: 'News — IA, Anthropic, OpenAI, infra · FFV Academy',
  description:
    'As 20 notícias mais quentes da semana em IA, modelos, arquitetura e infra. Curadoria editorial sem hype, com link pra fonte original.',
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

export default function NewsPage() {
  const feed = loadNewsFeed();
  const items = sortByDateDesc(feed.items);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-12">
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>News</span>
      </nav>

      <header className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--ffv-green)' }}
            aria-hidden
          />
          <span>Curadoria editorial · atualizado em {formatBrDate(feed.updatedAt)}</span>
        </div>
        <h1
          className="font-bold mb-3"
          style={{
            fontSize: 'clamp(1.5rem, 5.5vw, 3rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            overflowWrap: 'anywhere',
            hyphens: 'auto',
          }}
        >
          O que importa em IA esta semana
        </h1>
        <p className="text-base md:text-lg max-w-3xl" style={{ color: 'var(--ffv-muted)' }}>
          Seleção editorial das {items.length} notícias mais relevantes em IA, infra e arquitetura moderna. Sem ruído, sem hype — cada card leva direto à fonte original.
        </p>
      </header>

      <NewsClient items={items} />
    </div>
  );
}

function formatBrDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
