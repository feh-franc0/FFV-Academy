/**
 * curriculum-api.ts — cliente HTTP para o endpoint CMS-driven do backend.
 *
 * Consome: GET /api/v1/curriculum/:slug/blocks
 *
 * Retorna ArticleWithBlocks (article metadata + árvore de blocks).
 * Em caso de 404 ou erro de rede, retorna null — caller decide se mostra
 * fallback estático (LegacyArticle) ou 404.
 *
 * Por que retry: durante deploy, o build do frontend pode pegar janela em
 * que o backend está reiniciando (segundos entre migrate up e api up). Se
 * fetch falhar uma vez, a página fica com placeholder estático cacheado
 * por ISR. Retry com backoff transforma falha transitória em sucesso.
 */

import { ArticleWithBlocksSchema, type ArticleWithBlocks } from '@/components/article/blocks/schemas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// 3 tentativas com backoff progressivo (250ms → 750ms → 1500ms = ~2.5s max).
// Suficiente pra absorver janela típica de restart de API (~1s).
const RETRY_DELAYS_MS = [250, 750, 1500];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOnce(url: string): Promise<{ status: number; body?: unknown }> {
  const res = await fetch(url, {
    // Em dev local: sem cache, pra ver request no Network do browser.
    // Em prod (Next build): revalida a cada 1h.
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
    next: process.env.NODE_ENV === 'development' ? undefined : { revalidate: 3600 },
  });
  if (res.status === 404) return { status: 404 };
  if (!res.ok) return { status: res.status };
  const body = await res.json();
  return { status: 200, body };
}

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

  const url = `${API_BASE_URL}/api/v1/curriculum/${encodeURIComponent(slug)}/blocks`;
  // eslint-disable-next-line no-console
  console.log(`[curriculum-api] fetching ${url}`);

  let lastFailureStatus: number | string = 'no-attempt';
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    try {
      const result = await fetchOnce(url);

      if (result.status === 404) {
        // 404 é determinístico — não vale a pena retry.
        return null;
      }

      if (result.status === 200 && result.body !== undefined) {
        const parsed = ArticleWithBlocksSchema.safeParse(result.body);
        if (!parsed.success) {
          console.error(`[curriculum-api] response inválido para ${slug}:`, parsed.error.message);
          return null;
        }
        return parsed.data;
      }

      // 5xx ou outro erro HTTP — retry.
      lastFailureStatus = result.status;
    } catch (err) {
      lastFailureStatus = err instanceof Error ? err.message : String(err);
    }

    // Não esperar depois da última tentativa.
    if (attempt < RETRY_DELAYS_MS.length - 1) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  console.warn(
    `[curriculum-api] desistiu de ${slug} após ${RETRY_DELAYS_MS.length} tentativas: ${lastFailureStatus}`,
  );
  return null;
}
