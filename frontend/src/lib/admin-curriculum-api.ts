/**
 * admin-curriculum-api — wrappers do CRUD admin de currículo.
 *
 * Todos os endpoints precisam JWT com role=admin.
 */
import { apiFetch } from './api-client';

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
