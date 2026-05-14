/**
 * admin-content-api — clientes admin para news/cheatsheets/playlists.
 *
 * Endpoints abaixo requerem JWT com role=admin. apiFetch anexa
 * Authorization: Bearer automaticamente quando há sessão.
 */
import { apiFetch } from './api-client';

// ─── News ─────────────────────────────────────────────────────────────────

export interface NewsInput {
  slug: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  category: 'launch' | 'research' | 'business' | 'safety' | 'regulation';
  hot?: boolean;
  tags?: string[];
  publishedAt: string; // YYYY-MM-DD
  status?: 'draft' | 'published' | 'archived';
}

export async function createNews(input: NewsInput): Promise<boolean> {
  try {
    await apiFetch('/api/v1/admin/news', { method: 'POST', body: JSON.stringify(input) }, true);
    return true;
  } catch {
    return false;
  }
}

export async function updateNews(slug: string, input: NewsInput): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/news/${encodeURIComponent(slug)}`, {
      method: 'PATCH', body: JSON.stringify(input),
    }, true);
    return true;
  } catch {
    return false;
  }
}

export async function deleteNews(slug: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/news/${encodeURIComponent(slug)}`, { method: 'DELETE' }, true);
    return true;
  } catch {
    return false;
  }
}

// ─── Cheatsheets ──────────────────────────────────────────────────────────

export interface CheatsheetInput {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  accent?: string;
  emoji?: string;
  bodyMd: string;
  order?: number;
  status?: 'draft' | 'published' | 'archived';
}

export async function createCheatsheet(input: CheatsheetInput): Promise<boolean> {
  try {
    await apiFetch('/api/v1/admin/cheatsheets', { method: 'POST', body: JSON.stringify(input) }, true);
    return true;
  } catch {
    return false;
  }
}

export async function updateCheatsheet(slug: string, input: CheatsheetInput): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/cheatsheets/${encodeURIComponent(slug)}`, {
      method: 'PATCH', body: JSON.stringify(input),
    }, true);
    return true;
  } catch {
    return false;
  }
}

export async function deleteCheatsheet(slug: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/cheatsheets/${encodeURIComponent(slug)}`, { method: 'DELETE' }, true);
    return true;
  } catch {
    return false;
  }
}

// ─── Playlists ────────────────────────────────────────────────────────────

export interface PlaylistInput {
  slug: string;
  title: string;
  subtitle?: string;
  audience?: string;
  color?: string;
  emoji?: string;
  moduleSlugs: string[];
  order?: number;
  status?: 'draft' | 'published' | 'archived';
}

export async function createPlaylist(input: PlaylistInput): Promise<boolean> {
  try {
    await apiFetch('/api/v1/admin/playlists', { method: 'POST', body: JSON.stringify(input) }, true);
    return true;
  } catch {
    return false;
  }
}

export async function updatePlaylist(slug: string, input: PlaylistInput): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/playlists/${encodeURIComponent(slug)}`, {
      method: 'PATCH', body: JSON.stringify(input),
    }, true);
    return true;
  } catch {
    return false;
  }
}

export async function deletePlaylist(slug: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/admin/playlists/${encodeURIComponent(slug)}`, { method: 'DELETE' }, true);
    return true;
  } catch {
    return false;
  }
}
