/**
 * curriculum-api.ts — cliente HTTP para o endpoint CMS-driven do backend.
 *
 * Consome: GET /api/v1/curriculum/:slug/blocks
 *
 * Retorna ArticleWithBlocks (article metadata + árvore de blocks).
 * Em caso de 404 ou erro de rede, retorna null — caller decide se mostra
 * fallback estático (LegacyArticle) ou 404.
 */

import { ArticleWithBlocksSchema, type ArticleWithBlocks } from '@/components/article/blocks/schemas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Resultado de busca que DISTINGUE "não existe" de "não deu pra saber".
 *
 * `fetchArticleWithBlocks` (abaixo) colapsava os dois em `null` — e a rota
 * `/aprenda/[slug]` usava esse `null` pra decidir `notFound()`. Com o backend
 * fora do ar em produção, as 490 páginas de módulo respondiam 404 real: erro
 * de infraestrutura virava "este conteúdo não existe" pro aluno e pro
 * rastreador de busca. `not-found` só sai do HTTP 404 explícito do backend
 * (slug de fato ausente); qualquer outra falha (rede, 5xx, payload inválido)
 * é `error` — indisponibilidade temporária, não ausência de conteúdo.
 */
export type ArticleFetchResult =
  | { status: 'ok'; article: ArticleWithBlocks }
  | { status: 'not-found' }
  | { status: 'error' };

export async function fetchArticleWithBlocksResult(
  slug: string,
): Promise<ArticleFetchResult> {
  if (!API_BASE_URL) {
    // Modo build estático sem backend configurado — não é nem 404 nem erro,
    // é "sem como saber agora"; o caller decide o fallback.
    return { status: 'error' };
  }

  try {
    const url = `${API_BASE_URL}/api/v1/curriculum/${encodeURIComponent(slug)}/blocks`;
    // eslint-disable-next-line no-console
    console.log(`[curriculum-api] fetching ${url}`);
    const res = await fetch(url, {
      // Em dev local: sem cache, pra ver request no Network do browser.
      // Em prod (Next build): revalida a cada 1h.
      cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
      next: process.env.NODE_ENV === 'development' ? undefined : { revalidate: 3600 },
    });

    if (res.status === 404) {
      return { status: 'not-found' };
    }
    if (!res.ok) {
      console.warn(`[curriculum-api] HTTP ${res.status} para ${slug}`);
      return { status: 'error' };
    }

    const raw = await res.json();
    const parsed = ArticleWithBlocksSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`[curriculum-api] response inválido para ${slug}:`, parsed.error.message);
      return { status: 'error' };
    }

    return { status: 'ok', article: parsed.data };
  } catch (err) {
    console.error(`[curriculum-api] erro de rede para ${slug}:`, err);
    return { status: 'error' };
  }
}

/**
 * Busca um artigo completo (metadata + blocks) do backend.
 * @param slug Slug do artigo (ex: "rag-fundamentos")
 * @returns ArticleWithBlocks ou null se não existir / erro
 *
 * Mantido para os callers que genuinamente só precisam de "achou ou não"
 * (edição no admin). `/aprenda/[slug]` usa `fetchArticleWithBlocksResult`
 * diretamente porque a distinção 404-vs-erro muda a resposta HTTP da rota.
 */
export async function fetchArticleWithBlocks(
  slug: string,
): Promise<ArticleWithBlocks | null> {
  const result = await fetchArticleWithBlocksResult(slug);
  return result.status === 'ok' ? result.article : null;
}
