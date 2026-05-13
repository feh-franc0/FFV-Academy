/**
 * comments-api — cliente HTTP do CRUD de comentários.
 */
import { apiFetch } from './api-client';

export interface CommentDTO {
  id: string;
  userId: string;
  authorName: string;
  targetType: 'article' | 'trail' | 'block';
  targetId: string;
  parentId?: string;
  content: string;
  status: 'visible' | 'hidden' | 'flagged' | 'deleted';
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsListResponse {
  data: CommentDTO[];
  total: number;
  limit: number;
  offset: number;
}

export async function listComments(targetType: string, targetId: string, limit = 50, offset = 0): Promise<CommentsListResponse | null> {
  try {
    const q = new URLSearchParams({ targetType, targetId, limit: String(limit), offset: String(offset) });
    return await apiFetch<CommentsListResponse>(`/api/v1/comments?${q.toString()}`, {}, false);
  } catch {
    return null;
  }
}

export async function createComment(input: {
  targetType: string;
  targetId: string;
  parentId?: string;
  content: string;
}): Promise<CommentDTO | null> {
  try {
    return await apiFetch<CommentDTO>('/api/v1/comments', {
      method: 'POST',
      body: JSON.stringify(input),
    }, true);
  } catch {
    return null;
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/comments/${id}`, { method: 'DELETE' }, true);
    return true;
  } catch {
    return false;
  }
}
