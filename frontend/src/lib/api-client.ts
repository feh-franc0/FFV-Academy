/**
 * API Client — camada HTTP centralizada para o backend Go.
 *
 * - Access token JWT fica em memória (nunca localStorage/cookie JS).
 * - Refresh token chega via cookie HttpOnly — browser gerencia automaticamente.
 * - Em caso de 401, tenta POST /api/v1/auth/refresh automaticamente e retenta.
 * - Todos os erros do backend (envelope { type, title, status, detail }) viram ApiError.
 * - Erros inesperados (não ApiError com 4xx) são capturados pelo Sentry.
 *
 * Uso:
 *   const data = await apiFetch<UserDTO>('/api/v1/me', {}, true);
 */

/**
 * Captura exceção inesperada no Sentry, se disponível.
 *
 * ApiErrors com status 4xx são comportamento esperado (401 = não autenticado,
 * 403 = sem permissão, 404 = não encontrado) e NÃO devem ser reportados.
 * Apenas erros genuinamente inesperados vão para o Sentry: 5xx do servidor,
 * erros de rede após esgotamento de retries e erros de código (bugs).
 *
 * Usa `globalThis.__sentry_capture__` quando disponível (injetado pelo
 * sentry.client.config.ts após Sentry.init()). Desta forma evitamos
 * import dinâmico que causaria problemas em testes e em SSR.
 */
function captureUnexpectedError(err: unknown): void {
  // 4xx = comportamento esperado — não reportar ao Sentry
  if (err instanceof ApiError) {
    const isClientError = err.status >= 400 && err.status < 500;
    if (isClientError) return;
  }

  // Tenta capturar via Sentry. O SDK é injetado pelo sentry.client.config.ts
  // apenas em produção. Em dev/testes este bloco é no-op silencioso.
  try {
    // Acessa via globalThis para evitar import estático de @sentry/nextjs
    // (que quebraria o build estático quando o DSN não está configurado).
    const sentry = (globalThis as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry;
    sentry?.captureException(err);
  } catch {
    // Sentry indisponível — ignora silenciosamente
  }
}

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

// Timeout padrão por request — 15 segundos.
// Requests que ultrapassem esse limite são abortadas e retornam ApiError com type 'timeout'.
// Valor configurável por chamada via RequestInit.signal (para uploads grandes, use signal próprio).
const DEFAULT_TIMEOUT_MS = 15_000;

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

  // Cria AbortController por request para garantir que o timeout seja específico desta chamada.
  // Se o caller já passou um signal próprio (ex: para upload grande), combina os dois.
  const doFetch = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), DEFAULT_TIMEOUT_MS);

    // Combina o signal do caller (se houver) com o nosso timeout.
    // Se o caller cancelar, ambos os signals são abortados.
    const callerSignal = (init as RequestInit & { signal?: AbortSignal }).signal;
    let callerAbortHandler: (() => void) | undefined;
    if (callerSignal) {
      callerAbortHandler = () => controller.abort(callerSignal.reason);
      callerSignal.addEventListener('abort', callerAbortHandler);
    }

    const promise = fetch(`${base}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      signal: controller.signal,
    });

    // Limpa timeout e o listener do caller quando o fetch terminar — evita memory leak
    // quando o mesmo AbortSignal é reutilizado em múltiplos requests.
    return promise.finally(() => {
      clearTimeout(timeoutId);
      if (callerSignal && callerAbortHandler) {
        callerSignal.removeEventListener('abort', callerAbortHandler);
      }
    });
  };

  let res: Response | null = null;
  let lastNetworkErr: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      res = await doFetch();
      lastNetworkErr = null;
    } catch (err) {
      // AbortError com reason 'timeout' = nosso timeout de 15s estourou.
      // Relança como ApiError tipado para que o caller possa diferenciar de erro de rede.
      if (err instanceof DOMException && err.name === 'AbortError') {
        const isTimeout = (err as DOMException & { cause?: string }).cause === 'timeout' ||
          String(err.message).includes('timeout');
        if (isTimeout) {
          throw new ApiError({
            type: 'timeout',
            title: 'Tempo limite excedido',
            status: 0,
            detail: 'O servidor demorou mais de 15 segundos para responder. Tente novamente.',
          });
        }
        // AbortError de outro signal (caller cancelou) — relança sem retry.
        throw err;
      }
      // Erro de rede (TypeError / fetch rejeitou) — retry se ainda houver tentativas.
      lastNetworkErr = err;
      res = null;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(jitter(BASE_DELAYS_MS[attempt]));
        continue;
      }
      // Todas as tentativas falharam — converte para ApiError tipado.
      // Captura no Sentry: erros de rede após esgotar retries são inesperados
      // e podem indicar problemas de infraestrutura ou regressão de rede.
      const networkApiError = new ApiError({
        type: 'network_error',
        title: 'Erro de rede',
        status: 0,
        detail: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      });
      captureUnexpectedError(networkApiError);
      throw networkApiError;
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
    // Fallback — não deveria chegar aqui após o throw dentro do catch.
    throw lastNetworkErr ?? new ApiError({
      type: 'network_error',
      title: 'Erro de rede',
      status: 0,
      detail: 'Falha de rede desconhecida.',
    });
  }

  if (!res.ok) {
    const apiErr = await parseError(res);
    // Captura erros inesperados no Sentry (5xx e erros sem status 4xx).
    // 4xx (401, 403, 404, 422) são comportamento esperado e não são reportados.
    captureUnexpectedError(apiErr);
    throw apiErr;
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
