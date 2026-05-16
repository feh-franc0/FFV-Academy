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
import { ViewTracker } from '@/components/article/ViewTracker';
import { CommentSection } from '@/components/comments/CommentSection';
import { NextSteps } from '@/components/article/NextSteps';
import { TrailLeaderboard } from '@/components/ranking/TrailLeaderboard';
import { AnkiExport } from '@/components/article/AnkiExport';
import { TrailCertificateBanner } from '@/components/TrailCertificateBanner';
import { safeJsonLd } from '@/lib/safe-json';

interface PageProps {
  params: Promise<{ slug: string }>;
}

import { CURRICULUM } from '@/lib/curriculum';

/**
 * Slugs de fallback — extraídos do CURRICULUM constant local.
 *
 * Por que: em CI (`npm run build` sem NEXT_PUBLIC_API_BASE_URL setado),
 * o backend está fora. Sem fallback, generateStaticParams retornaria []
 * e Next.js 16 com `output: export` rejeita a build inteira.
 *
 * Os 765+ slugs estão na fonte de verdade `src/lib/curriculum.ts`,
 * que continua sendo o índice de metadados do frontend. O conteúdo
 * vem do backend em runtime via fetchArticleWithBlocks.
 */
function fallbackSlugs(): Array<{ slug: string }> {
  return CURRICULUM.flatMap(t => t.modules.map(m => ({ slug: m.slug })));
}

// Pré-gera 1 HTML por slug publicado no banco.
// Backend tem cap de 100/página — paginamos até pegar todos.
export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  if (!apiBase) {
    // CI / dev sem backend: usa CURRICULUM local como fonte de slugs.
    // O conteúdo de cada página vem do backend em runtime, mas a LISTA
    // de slugs estática é suficiente pra Next.js gerar HTML placeholder.
    return fallbackSlugs();
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
    if (all.length === 0) {
      // Backend respondeu vazio — usa fallback pra não quebrar build.
      return fallbackSlugs();
    }
    console.info(`[aprenda/generateStaticParams] ${all.length} slugs do backend`);
    return all.map(item => ({ slug: item.slug }));
  } catch (err) {
    console.warn('[aprenda/generateStaticParams] erro, usando fallback:', err);
    return fallbackSlugs();
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
    // Sem backend disponível no build (CI) ou slug fora do índice: renderiza
    // placeholder rico — busca metadata no CURRICULUM local pra ter title +
    // hub + trail + xp reais. Em produção, este caminho não dispara porque
    // o backend está presente. Em E2E o title precisa ser real pros testes
    // de navegação validarem o H1.
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (!apiBase) {
      const meta = CURRICULUM.flatMap(t =>
        t.modules.map(m => ({ ...m, trailId: t.id })),
      ).find(m => m.slug === slug);
      if (meta) {
        return (
          <main className="max-w-3xl mx-auto px-6 py-12">
            <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
              <div className="flex gap-2 mb-2 text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                <span>{meta.trailId}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{meta.title}</h1>
              <div className="flex gap-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
                <span>⏱ {meta.readTime ?? 5} min</span>
                <span>·</span>
                <span>⭐ {meta.xp ?? 10} XP</span>
              </div>
            </header>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
              Conteúdo deste módulo será carregado do CMS quando o backend estiver disponível.
            </p>
          </main>
        );
      }
      return (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-3">Módulo: {slug}</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Conteúdo será carregado do backend quando disponível.
          </p>
        </main>
      );
    }
    notFound();
  }

  // JSON-LD Article — rich results no Google. headline + description em todas
  // as páginas de módulo. Servidor renderiza, search engines indexam.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: `Aprenda ${article.title} na trilha ${article.trail_id} (hub ${article.hub_id}) — FFV Academy.`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    datePublished: article.updated_at,
    dateModified: article.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: 'https://fernandofrancovalle.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://fernandofrancovalle.com/aprenda/${slug}/`,
    },
    educationalLevel: article.difficulty,
    timeRequired: `PT${article.read_time}M`,
    learningResourceType: 'Article',
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
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

      <ViewTracker slug={slug} hubId={article.hub_id} trailId={article.trail_id} />

      <TrailCertificateBanner trailId={article.trail_id} />

      <div className="mt-8 flex justify-end">
        <AnkiExport slug={slug} title={article.title} blocks={article.blocks} />
      </div>

      <NextSteps slug={slug} />

      <section className="mt-12">
        <TrailLeaderboard trailId={article.trail_id} />
      </section>

      <section className="mt-12">
        <CommentSection targetType="article" targetId={slug} />
      </section>
    </main>
  );
}
