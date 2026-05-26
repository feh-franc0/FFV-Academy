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
import { ArticleDiscussion } from '@/components/ArticleDiscussion';
import { NextSteps } from '@/components/article/NextSteps';
import { AnkiExport } from '@/components/article/AnkiExport';
import { TrailCertificateBanner } from '@/components/TrailCertificateBanner';
import { TrailSidebar } from '@/components/article/TrailSidebar';
import { AutoRefresh } from '@/components/article/AutoRefresh';
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

// SSR Docker: slugs novos no banco que ainda não estavam no build do frontend
// são renderizados em runtime (SSR on-demand). Sem isso, qualquer artigo criado
// no admin após o último deploy do frontend daria 404 imediato — o que é o oposto
// do que faz sentido em CMS-driven com SSR.
//
// Em build estático (output: export) o valor deveria ser `false`, mas migramos
// pra `output: "standalone"` em 845eddb (15/mai/2026).
export const dynamicParams = true;

// Revalida o ISR a cada 60s — antes era 1h via `revalidate: 3600` dentro do
// fetch. Se o build pegar uma janela ruim (backend reiniciando durante deploy),
// o "Módulo não encontrado" cacheado dura no máximo 1 minuto antes de
// regerar. Antes durava 1h e o usuário via 404 mesmo após o backend voltar.
export const revalidate = 60;

// Metadata para SEO — busca do banco; fallback rico no CURRICULUM local.
// Antes desta correção (2026-05-21), quando o backend retornava null (erro
// transient durante build), o título virava "Módulo não encontrado" e o
// usuário via isso no tab/SEO mesmo com slug válido.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleWithBlocks(slug);
  if (article) {
    return {
      title: `${article.title} — FFV Academy`,
      description: `Aprenda ${article.title} na trilha ${article.trail_id} do hub ${article.hub_id}.`,
    };
  }
  // Backend falhou — tenta CURRICULUM local antes de assumir 404.
  const meta = CURRICULUM.flatMap(t =>
    t.modules.map(m => ({ ...m, trailId: t.id, trailName: t.name })),
  ).find(m => m.slug === slug);
  if (meta) {
    return {
      title: `${meta.title} — FFV Academy`,
      description: `Aprenda ${meta.title} na trilha ${meta.trailName}.`,
    };
  }
  return { title: 'Módulo não encontrado — FFV Academy' };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticleWithBlocks(slug);

  // Quando o backend retorna null (erro transient durante build, slug não
  // publicado no CMS ainda, network failure), NUNCA dar 404 se o slug está
  // no CURRICULUM local — é um módulo legítimo, só falta o conteúdo. Mostra
  // placeholder rico com metadata real e botão "Tentar novamente".
  //
  // Antes desta correção (2026-05-21), o build pegava janela de restart do
  // backend e cacheava notFound() por 1h via ISR. Usuários viam 404 em
  // módulos que existem.
  if (!article) {
    const meta = CURRICULUM.flatMap(t =>
      t.modules.map(m => ({ ...m, trailId: t.id, trailName: t.name, trailColor: t.color })),
    ).find(m => m.slug === slug);

    if (meta) {
      return (
        <main className="base-module-grid max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <TrailSidebar currentSlug={slug} trailId={meta.trailId} />
          <article>
            <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
              <div className="flex gap-2 mb-2 text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                <span style={{ color: meta.trailColor }}>{meta.trailName}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{meta.title}</h1>
              <div className="flex gap-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
                <span>⏱ {meta.readTime ?? 5} min</span>
                <span>·</span>
                <span>⭐ {meta.xp ?? 10} XP</span>
                {meta.level && (
                  <>
                    <span>·</span>
                    <span style={{ textTransform: 'capitalize' }}>{meta.level}</span>
                  </>
                )}
              </div>
            </header>
            <div
              className="p-5 rounded-xl mb-6"
              style={{
                background: 'color-mix(in srgb, var(--ffv-amber) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-amber) 30%, transparent)',
              }}
            >
              <p className="text-sm font-semibold mb-1.5">Conteúdo carregando…</p>
              <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                Esse módulo está sendo gerado/atualizado pela curadoria. Volte em alguns
                minutos — o ISR regenera o cache automaticamente a cada 60 segundos.
              </p>
              <AutoRefresh delaySeconds={8} />
            </div>
            <ViewTracker slug={slug} hubId={undefined} trailId={meta.trailId} />
          </article>
        </main>
      );
    }

    // Slug não está nem no banco nem no CURRICULUM local → 404 legítimo.
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
    <main className="base-module-grid max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <TrailSidebar currentSlug={slug} trailId={article.trail_id} />

      <article>
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

        <div className="prose prose-invert max-w-none">
          <BlockTree blocks={article.blocks} />
        </div>

        <ViewTracker slug={slug} hubId={article.hub_id} trailId={article.trail_id} />

        <TrailCertificateBanner trailId={article.trail_id} />

        <div className="mt-8 flex justify-end">
          <AnkiExport slug={slug} title={article.title} blocks={article.blocks} />
        </div>

        <NextSteps slug={slug} />

        <section className="mt-12">
          <ArticleDiscussion targetType="article" slug={slug} title={article.title} />
        </section>
      </article>
    </main>
  );
}
