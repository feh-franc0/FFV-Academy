/**
 * Testes de integração — leaderboard-api.ts
 *
 * Valida: getLeaderboard e getMyRank — modo real e fallback sem backend.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getLeaderboard, getMyRank } from '../../lib/leaderboard-api';
import { setAccessToken } from '../../lib/api-client';

const MOCK_LEADERBOARD = {
  weekStart: '2024-01-08T00:00:00Z',
  items: [
    { rank: 1, userId: 'u_abc', name: 'Alice', xpGained: 800, avatarInitials: 'AL' },
    { rank: 2, userId: 'u_def', name: 'Bob', xpGained: 650, avatarInitials: 'BO' },
    { rank: 3, userId: 'u_ghi', name: 'Carol', xpGained: 500, avatarInitials: 'CA' },
  ],
};

const MOCK_MY_RANK = { rank: 5, xpGained: 320, userId: 'u_me' };

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true, status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

beforeEach(() => {
  localStorage.clear();
  setAccessToken('tok_test');
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('getLeaderboard', () => {
  it('retorna null sem backend configurado', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    expect(await getLeaderboard()).toBeNull();
  });

  it('chama GET /api/v1/leaderboard e retorna dados formatados', async () => {
    const fetchMock = mockFetchOk(MOCK_LEADERBOARD);
    vi.stubGlobal('fetch', fetchMock);

    const data = await getLeaderboard();
    expect(data).not.toBeNull();
    expect(data!.items).toHaveLength(3);
    expect(data!.items[0].name).toBe('Alice');
    expect(data!.weekStart).toBe('2024-01-08T00:00:00Z');

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/leaderboard');
  });

  it('retorna null em caso de erro de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const data = await getLeaderboard();
    expect(data).toBeNull();
  });
});

describe('getMyRank', () => {
  it('retorna null sem backend configurado', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    expect(await getMyRank()).toBeNull();
  });

  it('chama GET /api/v1/leaderboard/me', async () => {
    const fetchMock = mockFetchOk(MOCK_MY_RANK);
    vi.stubGlobal('fetch', fetchMock);

    const me = await getMyRank();
    expect(me?.rank).toBe(5);
    expect(me?.xpGained).toBe(320);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/leaderboard/me');
  });

  it('retorna null em erro 401 (não logado)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 401,
      json: () => Promise.resolve({ type: 'unauthorized', title: 'Unauthorized', status: 401, detail: '' }),
    });
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      // refresh → fail
      if (url.includes('/auth/refresh')) return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) });
      return fetchMock(url);
    }));

    const me = await getMyRank();
    expect(me).toBeNull();
  });
});
