/**
 * Rota DINÂMICA CMS-driven. Busca blocos do backend e renderiza via
 * BlockRenderer. Esta rota é PARALELA às 915 estáticas em /aprenda/.
 *
 * Durante Sprint 1-3, esta rota serve só os módulos que já foram migrados
 * para o backend (DB). Quando migração ficar pronta (Sprint 9), a rota
 * /aprenda/[slug] passa a fazer o mesmo e esta rota é removida.
 *
 * Acesso (dev local): http://localhost:3000/aprenda-dynamic/<slug>
 */

import { notFound } from 'next/navigation';
import { fetchArticleWithBlocks } from '@/lib/curriculum-api';
import { BlockTree } from '@/components/article/BlockRenderer';

// `output: export` exige que rotas dinâmicas declarem antecipadamente os slugs
// que devem ser pré-gerados no build. Durante migração, listamos manualmente
// os módulos já presentes no DB. Sprint 3+ vai buscar essa lista do backend.
export async function generateStaticParams() {
  return [
    { slug: 'o-que-e-ia' },
    { slug: 'o-que-e-llm' },
    { slug: 'rag-fundamentos' },
  ];
}

// Permite construir rotas dinâmicas em dev local sem cache.
// Em build estático (CI), as rotas em generateStaticParams() são pré-renderizadas.
export const dynamicParams = false;

export default async function DynamicModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleWithBlocks(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Banner indicando rota CMS-driven (visível só em dev/teste) */}
      <div className="mb-6 p-3 rounded-lg text-xs font-mono" style={{
        background: 'rgba(63,185,80,0.08)',
        border: '1px solid rgba(63,185,80,0.25)',
        color: 'var(--ffv-green, #3FB950)',
      }}>
        🔵 CMS-driven · slug={article.slug} · {article.blocks.length} blocos · atualizado em {new Date(article.updated_at).toLocaleString('pt-BR')}
      </div>

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
