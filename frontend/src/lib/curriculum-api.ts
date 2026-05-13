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
 * Busca um artigo completo (metadata + blocks) do backend.
 * @param slug Slug do artigo (ex: "rag-fundamentos")
 * @returns ArticleWithBlocks ou null se não existir / erro
 */
export async function fetchArticleWithBlocks(
  slug: string,
): Promise<ArticleWithBlocks | null> {
  if (!API_BASE_URL) {
    // Modo build estático sem backend configurado — silenciar (não logar erro).
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/curriculum/${encodeURIComponent(slug)}/blocks`, {
      // Next.js: cache por 1h, revalida em background.
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      console.warn(`[curriculum-api] HTTP ${res.status} para ${slug}`);
      return null;
    }

    const raw = await res.json();
    const parsed = ArticleWithBlocksSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`[curriculum-api] response inválido para ${slug}:`, parsed.error.message);
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error(`[curriculum-api] erro de rede para ${slug}:`, err);
    return null;
  }
}
