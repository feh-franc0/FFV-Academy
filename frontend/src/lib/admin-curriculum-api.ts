/**
 * admin-curriculum-api — wrappers do CRUD admin de currículo.
 *
 * Todos os endpoints precisam JWT com role=admin.
 */
import { apiFetch, getAccessToken } from './api-client';

export interface ArticleUpdate {
  title?: string;
  contentMd?: string;
  difficulty?: string;
  xp?: number;
  readTime?: number;
  order?: number;
  published?: boolean;
}

export interface BlockInput {
  id: string;
  type: string;
  position: number;
  data: unknown;
  children?: BlockInput[];
}

export async function updateArticleMetadata(slug: string, patch: ArticleUpdate): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/curriculum/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }, true);
    return true;
  } catch {
    return false;
  }
}

export async function saveArticleBlocks(slug: string, blocks: BlockInput[]): Promise<{ count: number } | null> {
  try {
    const res = await apiFetch<{ slug: string; blocks_count: number }>(
      `/api/v1/admin/curriculum/${encodeURIComponent(slug)}/blocks`,
      { method: 'PUT', body: JSON.stringify({ blocks }) },
      true,
    );
    return { count: res.blocks_count };
  } catch {
    return null;
  }
}

export async function deleteArticle(slug: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/curriculum/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    }, true);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pede ao próprio Next para refazer a página do módulo agora, em vez de esperar
 * a janela de ISR (1 hora).
 *
 * Devolve `boolean` de propósito, e quem chama trata a falha como AVISO, não
 * como erro de salvamento: neste ponto o conteúdo já está gravado no banco. Se a
 * revalidação falhar, a única consequência é a página pública demorar até uma
 * hora para refletir — que é exatamente o comportamento que existia antes desta
 * função. Transformar isso em erro de salvamento faria o editor sugerir que a
 * edição se perdeu, o que seria falso e levaria alguém a salvar de novo.
 */
export async function revalidarModulo(slug: string): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;
  try {
    // Rota do PRÓPRIO Next (não do backend Go): `revalidatePath` só existe
    // dentro do processo que serve as páginas.
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slug }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
