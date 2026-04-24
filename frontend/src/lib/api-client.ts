/**
 * API Client — camada HTTP centralizada para o backend Go.
 *
 * - Access token JWT fica em memória (nunca localStorage/cookie JS).
 * - Refresh token chega via cookie HttpOnly — browser gerencia automaticamente.
 * - Em caso de 401, tenta POST /api/v1/auth/refresh automaticamente e retenta.
 * - Todos os erros do backend (envelope { type, title, status, detail }) viram ApiError.
 *
 * Uso:
 *   const data = await apiFetch<UserDTO>('/api/v1/me', {}, true);
 */

function getApiBase(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
}

/** Envelope de erro do backend Go (RFC 7807-like). */
export interface ApiErrorBody {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly detail: string;

  constructor(body: ApiErrorBody) {
    super(body.title);
    this.name = 'ApiError';
    this.status = body.status;
    this.type = body.type;
    this.detail = body.detail;
  }
}

// ─── Token em memória ───────────────────────────────────────────────────────

let _accessToken: string | null = null;

export function setAccessToken(token: string): void {
  _accessToken = token;
}

export function clearAccessToken(): void {
  _accessToken = null;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Core fetch ────────────────────────────────────────────────────────────

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json() as ApiErrorBody;
    return new ApiError(body);
  } catch {
    return new ApiError({
      type: 'unknown',
      title: res.statusText || 'Erro desconhecido',
      status: res.status,
      detail: '',
    });
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json() as { accessToken: string };
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Política de retry:
 * - Até 3 tentativas em 5xx e erros de rede (TypeError no fetch).
 * - Backoff exponencial com jitter: 100ms, 300ms, 900ms (+/- 25%).
 * - 429: respeita header Retry-After (segundos ou HTTP-date) quando presente.
 * - 4xx (exceto 429): sem retry, falha imediata.
 * - 401 mantém fluxo separado de refresh + 1 retry. Após refresh, a política
 *   de retry 5xx/rede volta a valer normalmente na requisição retentada.
 */

const MAX_RETRIES = 3;
const BASE_DELAYS_MS = [100, 300, 900];

function jitter(ms: number): number {
  const variance = ms * 0.25;
  return ms + (Math.random() * 2 - 1) * variance;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const asNum = Number(header);
  if (Number.isFinite(asNum) && asNum >= 0) return asNum * 1000;
  const asDate = Date.parse(header);
  if (Number.isFinite(asDate)) {
    const delta = asDate - Date.now();
    return delta > 0 ? delta : 0;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Faz fetch autenticado com retry automático em 401, 5xx, 429 e erros de rede.
 *
 * @param path     Caminho relativo, ex: "/api/v1/me"
 * @param init     Opções de fetch (method, body, headers extras)
 * @param auth     true = injeta Authorization header (default: true)
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (auth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const base = getApiBase();
  const doFetch = () =>
    fetch(`${base}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    });

  let res: Response | null = null;
  let lastNetworkErr: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      res = await doFetch();
      lastNetworkErr = null;
    } catch (err) {
      // Erro de rede (TypeError / fetch rejeitou) — retry se ainda houver tentativas.
      lastNetworkErr = err;
      res = null;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(jitter(BASE_DELAYS_MS[attempt]));
        continue;
      }
      throw err;
    }

    // 401: tenta refresh uma única vez e refaz — não entra no loop de retry de 5xx.
    if (res.status === 401 && auth && attempt === 0) {
      const refreshed = await tryRefresh();
      if (refreshed && _accessToken) {
        headers['Authorization'] = `Bearer ${_accessToken}`;
        // Reinicia o loop para que a retentada também tenha direito a retry em 5xx.
        continue;
      }
      break;
    }

    // 429: respeita Retry-After quando presente; caso contrário, backoff padrão.
    if (res.status === 429 && attempt < MAX_RETRIES - 1) {
      const retryAfter = parseRetryAfter(res.headers.get('Retry-After'));
      const delay = retryAfter !== null ? retryAfter : jitter(BASE_DELAYS_MS[attempt]);
      await sleep(delay);
      continue;
    }

    // 5xx: retry até esgotar tentativas.
    if (res.status >= 500 && res.status < 600 && attempt < MAX_RETRIES - 1) {
      await sleep(jitter(BASE_DELAYS_MS[attempt]));
      continue;
    }

    // Demais casos (2xx, 3xx, 4xx não-429) saem do loop.
    break;
  }

  if (!res) {
    // Todas as tentativas falharam em rede.
    throw lastNetworkErr ?? new Error('Falha de rede desconhecida');
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  // 204 No Content — sem body
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Conveniência para GET. */
export const apiGet = <T>(path: string, auth = true) =>
  apiFetch<T>(path, { method: 'GET' }, auth);

/** Conveniência para POST com body JSON. */
export const apiPost = <T>(path: string, body?: unknown, auth = true) =>
  apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }, auth);

/** Conveniência para PATCH com body JSON. */
export const apiPatch = <T>(path: string, body?: unknown, auth = true) =>
  apiFetch<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }, auth);

/** Conveniência para PUT com body JSON. */
export const apiPut = <T>(path: string, body?: unknown, auth = true) =>
  apiFetch<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }, auth);

/** Conveniência para DELETE. */
export const apiDelete = <T>(path: string, auth = true) =>
  apiFetch<T>(path, { method: 'DELETE' }, auth);

/** True se o backend está configurado. */
export function hasBackend(): boolean {
  return getApiBase().length > 0;
}
