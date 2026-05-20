/**
 * Comment API — cliente HTTP pro backend Go.
 *
 * Endpoints cobertos:
 *  - GET    /api/v1/comments?targetType=article&targetId=<slug>
 *  - POST   /api/v1/comments              (JWT required)
 *  - DELETE /api/v1/comments/{id}         (JWT required, autor ou admin)
 *  - POST   /api/v1/comments/{id}/vote    (JWT required, body: {vote: 1|0|-1})
 *  - POST   /api/v1/comments/{id}/report  (JWT required, body: {reason})
 *
 * Erros mapeados pra tipo discriminado pro chamador tratar 401 (login),
 * 429 (rate limit), 400 spam (mensagem do servidor).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export type CommentTargetType = 'article' | 'trail' | 'block';

export interface Comment {
  id: string;
  userId: string;
  authorName: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  content: string;
  status: 'visible' | 'hidden' | 'flagged' | 'deleted';
  edited: boolean;
  score: number;
  userVote?: -1 | 0 | 1; // 0 ou ausente = não votou (ou anônimo)
  createdAt: string; // ISO
  updatedAt: string;
}

export interface CommentList {
  data: Comment[];
  total: number;
  limit: number;
  offset: number;
}

export const COMMENT_MAX_CHARS = 1000;
export const COMMENT_MIN_CHARS = 1;

// ─── Error types ─────────────────────────────────────────────────────────

export class CommentApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'CommentApiError';
  }

  get isAuthRequired(): boolean { return this.status === 401; }
  get isRateLimited(): boolean { return this.status === 429; }
  get isValidation(): boolean { return this.status === 400; }
  get isForbidden(): boolean { return this.status === 403; }
  get isNotFound(): boolean { return this.status === 404; }
  get isSpam(): boolean { return this.code.startsWith('spam:'); }
}

async function parseError(res: Response): Promise<CommentApiError> {
  try {
    const body = await res.json() as { type?: string; detail?: string; title?: string };
    const code = body.type ?? 'error';
    const detail = body.detail ?? body.title ?? `HTTP ${res.status}`;
    return new CommentApiError(res.status, code, detail);
  } catch {
    return new CommentApiError(res.status, 'error', `HTTP ${res.status}`);
  }
}

// ─── Auth header helper ──────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  // Auth token storage convenção do projeto. Se mudar, atualizar aqui.
  const token = window.localStorage.getItem('ffv_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Public API ──────────────────────────────────────────────────────────

export async function listComments(
  targetType: CommentTargetType,
  targetId: string,
  opts: { limit?: number; offset?: number; signal?: AbortSignal } = {},
): Promise<CommentList> {
  const params = new URLSearchParams({
    targetType,
    targetId,
    limit: String(opts.limit ?? 50),
    offset: String(opts.offset ?? 0),
  });
  const res = await fetch(`${API_BASE}/api/v1/comments?${params}`, {
    signal: opts.signal,
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<CommentList>;
}

export interface CreateCommentInput {
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  parentId?: string;
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const res = await fetch(`${API_BASE}/api/v1/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<Comment>;
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw await parseError(res);
}

export async function voteComment(id: string, vote: -1 | 0 | 1): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/comments/${encodeURIComponent(id)}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ vote }),
  });
  if (!res.ok) throw await parseError(res);
}

export async function reportComment(id: string, reason: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/comments/${encodeURIComponent(id)}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw await parseError(res);
}

// ─── Admin moderation ─────────────────────────────────────────────────────

export type CommentStatus = 'visible' | 'flagged' | 'hidden' | 'deleted';

/** Lista comments por status pra moderação. Requer role=admin. */
export async function adminListComments(
  status: CommentStatus = 'flagged',
  opts: { limit?: number; offset?: number; signal?: AbortSignal } = {},
): Promise<CommentList> {
  const params = new URLSearchParams({
    status,
    limit: String(opts.limit ?? 50),
    offset: String(opts.offset ?? 0),
  });
  const res = await fetch(`${API_BASE}/api/v1/admin/comments?${params}`, {
    signal: opts.signal,
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<CommentList>;
}

export async function adminHideComment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/comments/${encodeURIComponent(id)}/hide`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw await parseError(res);
}

export async function adminRestoreComment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/comments/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw await parseError(res);
}

// ─── Client-side validation (mirror do backend) ──────────────────────────

/**
 * Valida client-side ANTES de enviar — feedback instantâneo + economiza
 * round-trip. Backend revalida (defesa em profundidade). Mensagens iguais
 * pra consistência de UX.
 */
export function validateCommentLocally(content: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = content.trim();
  if (trimmed.length < COMMENT_MIN_CHARS) return { ok: false, reason: 'comentário vazio' };
  if (trimmed.length > COMMENT_MAX_CHARS) {
    return { ok: false, reason: `comentário acima de ${COMMENT_MAX_CHARS} caracteres` };
  }

  // URLs — máximo 1
  const urlPattern = /(https?:\/\/\S+|www\.\S+|\b\S+\.(com|net|org|io|br|co|tv|me|app|dev|xyz|info|biz)\/?\S*)/gi;
  const urls = trimmed.match(urlPattern) ?? [];
  if (urls.length > 1) return { ok: false, reason: 'no máximo 1 link por comentário' };

  // Caractere repetido — 8+ iguais seguidos
  let runs = 1;
  let prev = '';
  for (const c of trimmed) {
    if (c === prev) {
      runs++;
      if (runs >= 8) return { ok: false, reason: 'evite repetir o mesmo caractere muitas vezes' };
    } else {
      runs = 1;
    }
    prev = c;
  }

  // All caps — >70% maiúsculas em strings com 10+ chars
  if (trimmed.length >= 10) {
    let caps = 0;
    let letters = 0;
    for (const c of trimmed) {
      if (/[A-Za-zÀ-ÿ]/.test(c)) {
        letters++;
        if (c === c.toUpperCase() && c !== c.toLowerCase()) caps++;
      }
    }
    if (letters > 0 && caps / letters > 0.70) {
      return { ok: false, reason: 'evite escrever tudo em CAIXA ALTA' };
    }
  }

  // Banned words — mesma lista do backend pra paridade.
  // Normalização: NFKC + strip zero-width + lookalike fold + lowercase
  // (espelho do normalizeForSpamCheck no Go).
  const normalized = normalizeForBannedCheck(trimmed);
  for (const w of BANNED_WORDS) {
    if (normalized.includes(w)) {
      return { ok: false, reason: 'linguagem ofensiva ou spam detectado' };
    }
  }

  return { ok: true };
}

// Lista espelhada de backend/internal/interfaces/http/handlers/comments_spam.go
// Mantém-se em sincronia manualmente — vale extrair pra JSON compartilhado
// no futuro.
const BANNED_WORDS = [
  'f*da-se', 'fdp', 'filho da puta',
  'puta que pariu',
  'vai se fuder', 'vai tomar no',
  'compre agora', 'ganhe dinheiro fácil', 'ganhe dinheiro facil',
  'clique aqui ganhe',
  'hack grátis', 'hack gratis', 'hackeie',
  'viagra', 'casino online',
  'telegram t.me/',
] as const;

// Cirílico/grego → latino (mesma tabela do backend).
const LOOKALIKE_MAP: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
  'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'У': 'Y', 'Х': 'X',
  'α': 'a', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'υ': 'y',
  'Α': 'A', 'Ο': 'O', 'Ρ': 'P', 'Ν': 'V', 'Υ': 'Y',
};

const INVISIBLE_CODE_POINTS = new Set([0x200B, 0x200C, 0x200D, 0xFEFF, 0x2060]);

function normalizeForBannedCheck(s: string): string {
  // Strip invisible/zero-width chars.
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (!INVISIBLE_CODE_POINTS.has(cp)) out += ch;
  }
  // NFKC normalization (built-in no V8/Node moderno).
  out = out.normalize('NFKC');
  // Lookalike fold.
  let folded = '';
  for (const ch of out) {
    folded += LOOKALIKE_MAP[ch] ?? ch;
  }
  return folded.toLowerCase();
}
