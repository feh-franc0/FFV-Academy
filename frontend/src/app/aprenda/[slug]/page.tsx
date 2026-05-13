/**
 * Rota dinâmica CMS-driven que substitui as 765 page.tsx estáticas que
 * viviam em src/app/aprenda-legacy/<slug>/page.tsx.
 *
 * Todos os módulos agora vêm do banco via GET /api/v1/curriculum/:slug/blocks
 * e são renderizados pelo BlockRenderer usando os mesmos primitives.
 *
 * `output: export` + `generateStaticParams` = no build, Next.js itera por
 * todos os slugs publicados e gera 1 HTML estático por rota. Em produção,
 * o servidor entrega só HTML pré-gerado (rápido + SEO perfeito).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchArticleWithBlocks } from '@/lib/curriculum-api';
import { BlockTree } from '@/components/article/BlockRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pré-gera 1 HTML por slug publicado no banco.
// Backend tem cap de 100/página — paginamos até pegar todos.
export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  if (!apiBase) {
    return [];
  }
  try {
    const all: Array<{ slug: string }> = [];
    let offset = 0;
    const pageSize = 100;
    // Safety brake em 50 páginas = 5000 slugs
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${apiBase}/api/v1/curriculum?limit=${pageSize}&offset=${offset}`, {
        cache: 'no-store',
      });
      if (!res.ok) break;
      const json = await res.json();
      const items: Array<{ slug: string }> = json.data ?? [];
      if (items.length === 0) break;
      all.push(...items);
      if (items.length < pageSize) break;
      offset += pageSize;
    }
    console.log(`[aprenda/generateStaticParams] ${all.length} slugs do backend`);
    return all.map(item => ({ slug: item.slug }));
  } catch (err) {
    console.warn('[aprenda/generateStaticParams] erro:', err);
    return [];
  }
}

// Estritamente sem fallback dinâmico em build estático.
export const dynamicParams = false;

// Metadata para SEO — também do banco.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleWithBlocks(slug);
  if (!article) return { title: 'Módulo não encontrado' };
  return {
    title: `${article.title} — FFV Academy`,
    description: `Aprenda ${article.title} na trilha ${article.trail_id} do hub ${article.hub_id}.`,
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticleWithBlocks(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <div className="flex gap-2 mb-2 text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
          <span>{article.hub_id}</span>
          <span>·</span>
          <span>{article.trail_id}</span>
          <span>·</span>
          <span>{article.difficulty}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
        <div className="flex gap-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
          <span>⏱ {article.read_time} min</span>
          <span>·</span>
          <span>⭐ {article.xp} XP</span>
        </div>
      </header>

      <article className="prose prose-invert max-w-none">
        <BlockTree blocks={article.blocks} />
      </article>
    </main>
  );
}
