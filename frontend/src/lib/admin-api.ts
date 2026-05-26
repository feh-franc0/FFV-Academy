/**
 * admin-api — cliente HTTP dos endpoints de admin.
 *
 * Todos os endpoints aqui requerem JWT com role=admin. O api-client.ts já
 * anexa o Authorization: Bearer automaticamente quando há sessão ativa.
 */
import { apiFetch, getAccessToken } from './api-client';

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

// ─── Admin Views (feed "quem acessou o quê") ───────────────────────────────

export type ViewKind = 'module' | 'page' | 'simulado' | 'admin' | 'other';

export interface ViewEntry {
  id: number;
  viewedAt: string;
  baseSlug?: string;
  kind: ViewKind;
  slug?: string;
  path?: string;
  hubId?: string;
  trailId?: string;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  anonId?: string;
  sessionId?: string;
  displayLabel: string;
}

export interface ListViewsResponse {
  views: ViewEntry[];
  count: number;
}

export async function fetchAdminViews(params: {
  base?: string;
  kind?: ViewKind;
  user?: string;
  slug?: string;
  since?: string;
  until?: string;
  limit?: number;
} = {}): Promise<ListViewsResponse | null> {
  const q = new URLSearchParams();
  if (params.base) q.set('base', params.base);
  if (params.kind) q.set('kind', params.kind);
  if (params.user) q.set('user', params.user);
  if (params.slug) q.set('slug', params.slug);
  if (params.since) q.set('since', params.since);
  if (params.until) q.set('until', params.until);
  q.set('limit', String(params.limit ?? 50));
  try {
    return await apiFetch(`/api/v1/admin/views?${q.toString()}`, {}, true);
  } catch {
    return null;
  }
}

// ─── Admin Metrics Overview (KPIs por base) ────────────────────────────────

export interface BaseMetrics {
  baseSlug: string;
  viewsTotal: number;
  viewsLogged: number;
  viewsAnon: number;
  uniqueUsers: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  topModule?: string;
  topModuleViews?: number;
}

export interface KindCount {
  kind: string;
  count: number;
}

export interface MetricsOverview {
  since: string;
  until: string;
  viewsTotal: number;
  viewsLogged: number;
  viewsAnon: number;
  byBase: BaseMetrics[];
  byKind: KindCount[];
  generatedAt: string;
}

export async function fetchAdminMetricsOverview(days = 7): Promise<MetricsOverview | null> {
  try {
    return await apiFetch(`/api/v1/admin/metrics/overview?days=${days}`, {}, true);
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
  /**
   * Quando o estudante clicou no magic-link do email de boas-vindas e entrou
   * pela primeira vez. Ausência indica "email não verificado" — lead frio
   * que o admin pode despriorizar.
   */
  emailVerifiedAt?: string;
  /**
   * Último login do estudante. Combinado com emailVerifiedAt indica
   * engajamento: "logou há 2h" sinaliza lead ativo agora.
   */
  lastLoginAt?: string;
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
  deliveredUrl?: string;
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
  patch: { status?: StudyRequestStatus; internalNotes?: string; deliveredUrl?: string },
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

// URL do endpoint que baixa todos os anexos de uma solicitação como .zip.
export function studyRequestZipUrl(id: string): string {
  const base =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
  return `${base}/api/v1/admin/study-requests/${id}/download-all`;
}

/**
 * downloadAuthenticatedFile — baixa um arquivo de endpoint protegido por JWT.
 *
 * Por quê não usar &lt;a href&gt;: o token JWT vive em memória (não em cookie),
 * então links diretos abrem nova aba SEM o header Authorization → backend
 * retorna 401. Esta função faz fetch com Bearer, converte resposta em Blob
 * e dispara download via &lt;a&gt; dinâmico com object URL.
 *
 * Trade-off: o arquivo inteiro carrega em memória do browser antes do
 * download começar. Aceitável pra arquivos ≤ 50 MiB (limite do form é
 * 10 anexos × 25 MiB = 250 MiB; raro um ZIP passar disso, mas vigiar).
 *
 * Retorna {ok: true} em sucesso, {ok: false, error: msg} em falha.
 */
export async function downloadAuthenticatedFile(
  url: string,
  filename: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, error: 'Sessão expirada. Faça login novamente.' };
  }
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (res.status === 401) {
      return { ok: false, error: 'Sessão expirada. Faça login novamente.' };
    }
    if (res.status === 403) {
      return { ok: false, error: 'Sem permissão pra baixar este arquivo.' };
    }
    if (res.status === 410) {
      return { ok: false, error: 'Arquivo não disponível no storage (foi removido?).' };
    }
    if (!res.ok) {
      return { ok: false, error: `Falha no download (HTTP ${res.status}).` };
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    // Cleanup após o browser processar o click.
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    }, 100);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Erro de rede: ${(e as Error).message}` };
  }
}
