/**
 * Testes de integração — api-client.ts
 *
 * Valida: token em memória, injeção de Authorization header,
 * auto-refresh em 401, parse de ApiError, helpers (get/post/patch/put/delete).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  apiFetch,
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  hasBackend,
  ApiError,
} from '../../lib/api-client';

// ─── helpers ──────────────────────────────────────────────────────────────

function mockFetchOk(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

function mockFetchError(body: unknown, status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

function mockFetch204() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    json: () => Promise.resolve(null),
  } as unknown as Response);
}

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

beforeEach(() => {
  clearAccessToken();
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

// ─── Token em memória ──────────────────────────────────────────────────────

describe('Token em memória', () => {
  it('setAccessToken / getAccessToken / clearAccessToken', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('tok_abc123');
    expect(getAccessToken()).toBe('tok_abc123');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

// ─── hasBackend ────────────────────────────────────────────────────────────

describe('hasBackend()', () => {
  it('retorna true quando NEXT_PUBLIC_API_BASE_URL está definido', () => {
    expect(hasBackend()).toBe(true);
  });

  it('retorna false quando NEXT_PUBLIC_API_BASE_URL está vazio', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    expect(hasBackend()).toBe(false);
  });
});

// ─── apiFetch básico ───────────────────────────────────────────────────────

describe('apiFetch', () => {
  it('injeta Authorization header quando token está em memória', async () => {
    setAccessToken('tok_test');
    const fetchMock = mockFetchOk({ id: '1' });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/v1/me');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers['Authorization']).toBe('Bearer tok_test');
  });

  it('não injeta Authorization quando auth=false', async () => {
    setAccessToken('tok_test');
    const fetchMock = mockFetchOk({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/v1/auth/request-token', {}, false);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('retorna undefined em 204 No Content', async () => {
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch('/api/v1/auth/logout', { method: 'POST' });
    expect(result).toBeUndefined();
  });

  it('lança ApiError em resposta não-ok', async () => {
    const fetchMock = mockFetchError(
      { type: 'validation', title: 'Campo inválido', status: 400, detail: 'email inválido' },
      400,
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/v1/auth/verify', {}, false)).rejects.toThrow(ApiError);
  });

  it('ApiError tem status e type corretos', async () => {
    const fetchMock = mockFetchError(
      { type: 'not-found', title: 'Not Found', status: 404, detail: '' },
      404,
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      await apiFetch('/api/v1/simulados/x', {}, false);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).type).toBe('not-found');
    }
  });
});

// ─── Auto-refresh em 401 ──────────────────────────────────────────────────

describe('auto-refresh em 401', () => {
  it('tenta refresh e retenta a request original em 401', async () => {
    setAccessToken('tok_expired');

    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/me') && callCount === 0) {
        callCount++;
        return Promise.resolve({ ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ type: 'unauthorized', title: 'Unauthorized', status: 401, detail: '' }) });
      }
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ accessToken: 'tok_new' }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'u1', name: 'Test' }) });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<{ id: string; name: string }>('/api/v1/me');

    expect(result.name).toBe('Test');
    expect(getAccessToken()).toBe('tok_new');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('lança ApiError se refresh também falha (401)', async () => {
    setAccessToken('tok_expired');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ type: 'unauthorized', title: 'Unauthorized', status: 401, detail: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/v1/me')).rejects.toThrow(ApiError);
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────

describe('Helpers apiGet / apiPost / apiPatch / apiPut / apiDelete', () => {
  it('apiGet faz GET', async () => {
    const fetchMock = mockFetchOk([{ id: 's1' }]);
    vi.stubGlobal('fetch', fetchMock);
    await apiGet('/api/v1/simulados', false);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('GET');
  });

  it('apiPost serializa body JSON', async () => {
    const fetchMock = mockFetchOk({ accessToken: 'tok' });
    vi.stubGlobal('fetch', fetchMock);
    await apiPost('/api/v1/auth/verify', { email: 'a@b.com', token: '000000' }, false);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ email: 'a@b.com' });
  });

  it('apiDelete faz DELETE', async () => {
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');
    await apiDelete('/api/v1/me');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('DELETE');
  });

  it('apiPatch faz PATCH', async () => {
    const fetchMock = mockFetchOk({ name: 'Novo' });
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');
    await apiPatch('/api/v1/me', { name: 'Novo' });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PATCH');
  });

  it('apiPut faz PUT', async () => {
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');
    await apiPut('/api/v1/progress', { state: {}, clientUpdatedAt: '' });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PUT');
  });
});
