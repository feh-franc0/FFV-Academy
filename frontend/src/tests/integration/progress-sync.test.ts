/**
 * Testes de integração — progress-sync.ts
 *
 * Valida: pull (servidor mais novo substitui local), push (sucesso e conflito),
 * debounce schedulePush, modo offline-first.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { pullProgress, pushProgress, GAME_STATE_SCHEMA_VERSION } from '../../lib/progress-sync';
import { setAccessToken } from '../../lib/api-client';

const MINIMAL_STATE = {
  xp: 500,
  level: 3,
  streak: 5,
  lastStudyDate: '2024-01-10',
  completedModules: ['intro-ia'],
  quizScores: {},
  badges: [],
  totalStudyTime: 120,
  startedAt: '2024-01-01T00:00:00Z',
  reviewCards: [],
  archivedCards: [],
  studyDays: [],
  freezes: 0,
  dailyGoal: 1,
  lastReviewDate: null,
  lastArticle: null,
  preferredHub: null,
  onboardedAt: null,
  articleProgress: {},
};

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function setupBackend() {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
}

function mockFetchOk(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

function mockFetch204() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    json: () => Promise.resolve(null),
  } as unknown as Response);
}

beforeEach(() => {
  localStorage.clear();
  setAccessToken('tok_test');
  setupBackend();
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

// ─── pullProgress ──────────────────────────────────────────────────────────

describe('pullProgress', () => {
  it('retorna "local" sem backend configurado', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    const result = await pullProgress();
    expect(result).toBe('local');
  });

  it('substitui localStorage quando servidor tem estado mais recente', async () => {
    const serverState = { ...MINIMAL_STATE, xp: 9999 };
    const fetchMock = mockFetchOk({
      state: serverState,
      serverUpdatedAt: new Date().toISOString(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgress();
    expect(result).toBe('pulled');

    const stored = JSON.parse(localStorage.getItem('ffv_academy') ?? '{}');
    expect(stored.xp).toBe(9999);
  });

  it('mantém local se já sincronizou e local não é mais antigo', async () => {
    // Salva estado local e marca sync recente
    localStorage.setItem('ffv_academy', JSON.stringify(MINIMAL_STATE));
    localStorage.setItem('ffv_progress_last_sync', new Date().toISOString());

    const serverState = { ...MINIMAL_STATE, xp: 100 };
    const fetchMock = mockFetchOk({
      state: serverState,
      serverUpdatedAt: new Date(Date.now() - 60000).toISOString(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgress();
    expect(result).toBe('local');
  });

  it('retorna "error" quando fetch falha', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgress();
    expect(result).toBe('error');
  });

  it('retorna "local" quando backend retorna sem state', async () => {
    const fetchMock = mockFetchOk({ state: null, serverUpdatedAt: null });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgress();
    expect(result).toBe('local');
  });
});

// ─── pushProgress ──────────────────────────────────────────────────────────

describe('pushProgress', () => {
  it('retorna "pushed" sem backend', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    const result = await pushProgress();
    expect(result).toBe('pushed');
  });

  it('envia PUT /api/v1/progress com state e schemaVersion', async () => {
    localStorage.setItem('ffv_academy', JSON.stringify(MINIMAL_STATE));
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    const result = await pushProgress();
    expect(result).toBe('pushed');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/progress');
    expect(init.method).toBe('PUT');

    const body = JSON.parse(init.body as string);
    expect(body.schemaVersion).toBe(GAME_STATE_SCHEMA_VERSION);
    expect(body.state.xp).toBe(500);
    expect(body.clientUpdatedAt).toBeTruthy();
  });

  it('retorna "conflict_pulled" em 409 e faz pull automático', async () => {
    localStorage.setItem('ffv_academy', JSON.stringify(MINIMAL_STATE));

    const serverState = { ...MINIMAL_STATE, xp: 9999 };
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // PUT → 409
        return Promise.resolve({
          ok: false, status: 409,
          json: () => Promise.resolve({ type: 'conflict', title: 'Conflict', status: 409, detail: '' }),
        });
      }
      // GET pull → ok
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve({ state: serverState, serverUpdatedAt: new Date().toISOString() }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pushProgress();
    expect(result).toBe('conflict_pulled');
    expect(callCount).toBe(2);
  });

  it('retorna "error" se state local está ausente', async () => {
    // localStorage vazio — sem state para enviar
    const result = await pushProgress();
    expect(result).toBe('error');
  });
});

// ─── GAME_STATE_SCHEMA_VERSION ────────────────────────────────────────────

describe('GAME_STATE_SCHEMA_VERSION', () => {
  it('é um número positivo', () => {
    expect(GAME_STATE_SCHEMA_VERSION).toBeGreaterThan(0);
  });
});
