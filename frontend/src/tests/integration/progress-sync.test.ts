/**
 * Testes de integração — progress-sync.ts
 *
 * Valida: pull (servidor mais novo substitui local), push (sucesso e conflito),
 * debounce schedulePush, modo offline-first.
 *
 * IMPORTANTE — por que este arquivo semeia o localStorage via `encodeGameState`
 * (o codec real, o mesmo que engine.ts usa) e não via `JSON.stringify` cru:
 * a versão anterior deste teste semeava com `localStorage.setItem(key,
 * JSON.stringify(MINIMAL_STATE))` — JSON puro. A engine real grava
 * LZ-comprimido. Isso fazia o teste passar verde contra um formato que o
 * produto NUNCA produz, escondendo um bug real onde `pushProgress` nunca
 * conseguia ler o estado local e desistia antes de chamar a API — XP, streak
 * e SRS nunca saíam do navegador, em produção, sem nenhum teste acusando.
 * Ver game-state-codec.ts e o CHANGELOG do pack sincronizacao-de-progresso-confiavel.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { pullProgress, pushProgress, pullProgressOnLogin, schedulePush, GAME_STATE_SCHEMA_VERSION } from '../../lib/progress-sync';
import { setAccessToken } from '../../lib/api-client';
import { encodeGameState, decodeGameState } from '../../lib/game-state-codec';
import { STORAGE_KEYS } from '../../lib/constants';

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

/** Semeia o localStorage EXATAMENTE como a engine grava — LZ-comprimido. */
function seedLocalState(state: unknown): void {
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, encodeGameState(state));
}

/** Lê de volta pelo mesmo codec que a engine e o sync usam para escrever. */
function readSeededState(): Record<string, unknown> | null {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  return decodeGameState(raw) as Record<string, unknown> | null;
}

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

// ─── Prova direta do defeito corrigido ─────────────────────────────────────

describe('formato de persistência (a causa raiz do P0)', () => {
  it('o estado semeado no formato real (comprimido) é lido de volta por pushProgress', async () => {
    // Sem este teste, um regresso para "ler com JSON.parse cru" passaria
    // despercebido de novo — é a prova de que o formato bate nos dois lados.
    seedLocalState(MINIMAL_STATE);
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    const result = await pushProgress();
    expect(result).toBe('pushed');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.state.xp).toBe(500);
  });

  it('um payload JSON puro (formato legado) ainda é lido — retrocompatibilidade', async () => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(MINIMAL_STATE));
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    const result = await pushProgress();
    expect(result).toBe('pushed');
  });
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

    const stored = readSeededState();
    expect(stored?.xp).toBe(9999);
  });

  it('mantém local se já sincronizou e local não é mais antigo', async () => {
    // Salva estado local (no formato real) e marca sync recente
    seedLocalState(MINIMAL_STATE);
    localStorage.setItem(STORAGE_KEYS.PROGRESS_LAST_SYNC, new Date().toISOString());

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

// ─── pullProgressOnLogin ────────────────────────────────────────────────────

describe('pullProgressOnLogin', () => {
  it('anônimo com progresso real e nunca sincronizado: local NÃO é apagado, é enviado', async () => {
    // XP e módulo concluído — progresso real, mas ffv_progress_last_sync
    // nunca foi setado (nunca sincronizou). Isso é EXATAMENTE o estado de um
    // usuário anônimo que acabou de criar conta.
    seedLocalState({ ...MINIMAL_STATE, xp: 750, completedModules: ['a', 'b'] });

    const fetchMock = mockFetch204(); // PUT bem-sucedido
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgressOnLogin();
    expect(result).toBe('local_kept');

    // Prova que o local NÃO foi sobrescrito: continua com xp=750.
    const stored = readSeededState();
    expect(stored?.xp).toBe(750);

    // E prova que foi de fato ENVIADO ao servidor (não só preservado localmente).
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/progress');
    expect(init.method).toBe('PUT');
  });

  it('local vazio (sem progresso): pull normal do servidor acontece', async () => {
    // Sem seedLocalState — não há progresso local para proteger.
    const serverState = { ...MINIMAL_STATE, xp: 200 };
    const fetchMock = mockFetchOk({
      state: serverState,
      serverUpdatedAt: new Date().toISOString(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgressOnLogin();
    expect(result).toBe('pulled');
    expect(readSeededState()?.xp).toBe(200);
  });

  it('local com progresso mas JÁ sincronizado antes: resolução normal por data', async () => {
    seedLocalState({ ...MINIMAL_STATE, xp: 300 });
    localStorage.setItem('ffv_progress_last_sync', new Date(Date.now() - 60000).toISOString());

    const serverState = { ...MINIMAL_STATE, xp: 9999 };
    const fetchMock = mockFetchOk({
      state: serverState,
      serverUpdatedAt: new Date().toISOString(), // mais novo que o lastSync
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await pullProgressOnLogin();
    expect(result).toBe('pulled');
    expect(readSeededState()?.xp).toBe(9999);
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
    seedLocalState(MINIMAL_STATE);
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
    seedLocalState(MINIMAL_STATE);

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

// ─── Retry ao reconectar ────────────────────────────────────────────────────

describe('retry de push ao voltar online', () => {
  it('push que falha é reenviado quando o evento "online" dispara', async () => {
    seedLocalState(MINIMAL_STATE);

    // Usa um 400 (não 409, não 5xx) para a 1ª chamada: fica FORA das faixas de
    // retry-com-backoff do api-client (429/5xx), então o catch de pushProgress
    // reage a exatamente 1 chamada de fetch — sem precisar simular o
    // backoff interno do api-client sob fake timers.
    const badRequest = {
      ok: false, status: 400,
      json: () => Promise.resolve({ type: 'validation-error', title: 'Bad Request', status: 400, detail: '' }),
    } as unknown as Response;
    const success = { ok: true, status: 204, json: () => Promise.resolve(null) } as unknown as Response;
    const fetchMock = vi.fn().mockResolvedValueOnce(badRequest).mockResolvedValueOnce(success);
    vi.stubGlobal('fetch', fetchMock);

    // schedulePush registra o listener de 'online' (idempotente) e agenda o
    // push debounced de 3s; fake timers o tempo todo evita deixar um
    // setTimeout real pendente vazando para os próximos testes do arquivo.
    vi.useFakeTimers();
    try {
      schedulePush();
      await vi.advanceTimersByTimeAsync(3000);
      expect(fetchMock).toHaveBeenCalledTimes(1); // 1ª tentativa, falhou (400)

      // Simula reconexão — o listener registrado por schedulePush deve reenviar.
      window.dispatchEvent(new Event('online'));
      await vi.advanceTimersByTimeAsync(0); // flush da promise do listener

      expect(fetchMock).toHaveBeenCalledTimes(2); // reenviado, desta vez com sucesso
    } finally {
      vi.useRealTimers();
    }
  });
});

// ─── GAME_STATE_SCHEMA_VERSION ────────────────────────────────────────────

describe('GAME_STATE_SCHEMA_VERSION', () => {
  it('é um número positivo', () => {
    expect(GAME_STATE_SCHEMA_VERSION).toBeGreaterThan(0);
  });

  it('é importado de engine.ts, não duplicado (a causa do drift anterior)', async () => {
    const { CURRENT_SCHEMA } = await import('../../lib/engine');
    expect(GAME_STATE_SCHEMA_VERSION).toBe(CURRENT_SCHEMA);
  });
});
