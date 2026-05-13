/**
 * admin-api — cliente HTTP dos endpoints de admin.
 *
 * Todos os endpoints aqui requerem JWT com role=admin. O api-client.ts já
 * anexa o Authorization: Bearer automaticamente quando há sessão ativa.
 */
import { apiFetch } from './api-client';

// ─── Stats ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  usersLast7Days: number;
  usersLast30Days: number;
  activeDaily: number;
  activeWeekly: number;
  activeMonthly: number;
  totalXpAwarded: number;
  totalAttempts: number;
  totalCertificates: number;
  totalArticles: number;
  totalBlocks: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  generatedAt: string;
}

export interface TrailViewStat {
  trailId: string;
  views: number;
}

export interface ModuleViewStat {
  slug: string;
  title: string;
  trailId?: string;
  views: number;
}

export interface AdminStatsResponse {
  stats: AdminStats;
  topTrails: TrailViewStat[];
  topModules: ModuleViewStat[];
}

export async function fetchAdminStats(): Promise<AdminStatsResponse | null> {
  try {
    return await apiFetch<AdminStatsResponse>('/api/v1/admin/stats', {}, true);
  } catch {
    return null;
  }
}

// ─── Users ─────────────────────────────────────────────────────────────────

export interface AdminUserItem {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminUsersResponse {
  data: AdminUserItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchAdminUsers(params: {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminUsersResponse | null> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  q.set('limit', String(params.limit ?? 50));
  q.set('offset', String(params.offset ?? 0));
  try {
    return await apiFetch<AdminUsersResponse>(`/api/v1/admin/users?${q.toString()}`, {}, true);
  } catch {
    return null;
  }
}

// ─── Audit log ────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  user_id?: string;
  actor?: string;
  action: string;
  path?: string;
  status?: number;
  latency_ms?: number;
  ip?: string;
  created_at: string;
}

export async function fetchAuditLog(params: {
  limit?: number;
  offset?: number;
  action?: string;
} = {}): Promise<{ data: AuditEntry[]; total: number } | null> {
  const q = new URLSearchParams();
  q.set('limit', String(params.limit ?? 50));
  q.set('offset', String(params.offset ?? 0));
  if (params.action) q.set('action', params.action);
  try {
    return await apiFetch(`/api/v1/admin/audit?${q.toString()}`, {}, true);
  } catch {
    return null;
  }
}
