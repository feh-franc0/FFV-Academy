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

// ─── Growth time-series ────────────────────────────────────────────────────

export interface GrowthPoint {
  date: string;
  count: number;
}

export interface AdminGrowthResponse {
  days: number;
  userSignups: GrowthPoint[];
  simuladoAttempts: GrowthPoint[];
}

export async function fetchAdminGrowth(days = 30): Promise<AdminGrowthResponse | null> {
  try {
    return await apiFetch<AdminGrowthResponse>(`/api/v1/admin/growth?days=${days}`, {}, true);
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

// ─── Study Requests (solicitações de experiência personalizada) ────────────

export type StudyRequestStatus =
  | 'pending'
  | 'in_review'
  | 'in_production'
  | 'ready'
  | 'rejected';

export const STUDY_REQUEST_STATUSES: StudyRequestStatus[] = [
  'pending',
  'in_review',
  'in_production',
  'ready',
  'rejected',
];

export const STUDY_REQUEST_STATUS_LABEL: Record<StudyRequestStatus, string> = {
  pending: 'Pendente',
  in_review: 'Em análise',
  in_production: 'Em produção',
  ready: 'Entregue',
  rejected: 'Rejeitada',
};

export const STUDY_REQUEST_STATUS_COLOR: Record<StudyRequestStatus, string> = {
  pending: '#e3b341',       // amarelo
  in_review: '#58a6ff',     // azul
  in_production: '#ffa657', // laranja
  ready: '#3fb950',         // verde
  rejected: '#f78166',      // vermelho
};

export interface StudyRequestSummary {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  studyArea: string;
  institution?: string;
  subject: string;
  goal?: string;
  status: StudyRequestStatus;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyRequestAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageUrl: string;
  downloadUrl: string;
  createdAt: string;
}

export interface StudyRequestDetail extends StudyRequestSummary {
  description: string;
  internalNotes?: string;
  attachments: StudyRequestAttachment[];
}

export interface StudyRequestsListResponse {
  data: StudyRequestSummary[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchStudyRequests(params: {
  status?: StudyRequestStatus | '';
  studyArea?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<StudyRequestsListResponse | null> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.studyArea) q.set('studyArea', params.studyArea);
  if (params.search) q.set('search', params.search);
  q.set('limit', String(params.limit ?? 50));
  q.set('offset', String(params.offset ?? 0));
  try {
    return await apiFetch<StudyRequestsListResponse>(
      `/api/v1/admin/study-requests?${q.toString()}`,
      {},
      true,
    );
  } catch {
    return null;
  }
}

export async function fetchStudyRequest(id: string): Promise<StudyRequestDetail | null> {
  try {
    return await apiFetch<StudyRequestDetail>(`/api/v1/admin/study-requests/${id}`, {}, true);
  } catch {
    return null;
  }
}

export async function updateStudyRequest(
  id: string,
  patch: { status?: StudyRequestStatus; internalNotes?: string },
): Promise<StudyRequestDetail | null> {
  try {
    return await apiFetch<StudyRequestDetail>(
      `/api/v1/admin/study-requests/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
        headers: { 'Content-Type': 'application/json' },
      },
      true,
    );
  } catch {
    return null;
  }
}

// Devolve a URL completa de download (com base, para abrir em nova aba).
export function studyRequestDownloadUrl(downloadPath: string): string {
  const base =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
  return `${base}${downloadPath}`;
}
