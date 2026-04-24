/**
 * Retry com backoff do apiFetch.
 *
 * Cobre:
 * - 500 x2 seguido de 200 → sucesso em 3 chamadas
 * - 429 com Retry-After → respeita delay informado
 * - 400 → sem retry (1 chamada)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, ApiError, clearAccessToken } from '../../lib/api-client';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  clearAccessToken();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('apiFetch retry', () => {
  it('retenta 5xx e retorna sucesso na 3ª tentativa', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(500, { type: 'err', title: 'boom', status: 500, detail: '' }))
      .mockResolvedValueOnce(jsonResponse(500, { type: 'err', title: 'boom', status: 500, detail: '' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiFetch<{ ok: boolean }>('/x', {}, false);
    // Avança todos os timers de backoff pendentes.
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('respeita Retry-After em 429', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(429, { type: 'err', title: 'rate', status: 429, detail: '' }, { 'Retry-After': '1' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiFetch<{ ok: boolean }>('/x', {}, false);

    // Depois da 1ª chamada, só deve ter 1 invocação enquanto o timer < 1s não dispara.
    await vi.advanceTimersByTimeAsync(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Avança o restante do Retry-After (1s total).
    await vi.advanceTimersByTimeAsync(600);
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('não retenta em 400 (4xx não-429)', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(400, { type: 'err', title: 'bad', status: 400, detail: 'x' }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiFetch('/x', {}, false);
    // Anexa handler antes de avançar timers para evitar unhandled rejection.
    const assertion = expect(promise).rejects.toBeInstanceOf(ApiError);
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
