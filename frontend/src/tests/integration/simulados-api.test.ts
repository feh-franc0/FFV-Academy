/**
 * Testes de integração — simulados-api.ts
 *
 * Valida: listagem, busca por id, startOrResume, answerQuestion,
 * toggleFlag, finishAttempt, listAttempts — ambos em modo mock e real.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  listSimuladosApi,
  getSimuladoApi,
  startOrResumeAttempt,
  getActiveAttempt,
  answerQuestion,
  toggleFlag,
  finishAttempt,
  listAttemptsApi,
  claimXPCredit,
} from '../../lib/simulados-api';
import { setAccessToken } from '../../lib/api-client';

const MOCK_SIMULADO_DTO = {
  id: 'simulado-aws-practitioner',
  certification: 'AWS CLF-C02',
  title: 'Simulado AWS Cloud Practitioner',
  description: 'Descrição',
  priceCents: 4700,
  questionCount: 20,
  timeLimitMin: 30,
  topics: ['IAM', 'Storage'],
  passingScore: 70,
  comingSoon: false,
};

const MOCK_ATTEMPT_DTO = {
  id: 'att_001',
  simuladoId: 'simulado-aws-practitioner',
  status: 'active' as const,
  answers: {},
  flagged: [],
  score: null,
  startedAt: '2024-01-01T00:00:00Z',
  deadlineAt: '2024-01-01T00:30:00Z',
  finishedAt: null,
  timeLeftSec: 1800,
  questions: [
    {
      id: 'clf-q1',
      stem: 'Quem é responsável por patch do OS em EC2?',
      options: [
        { id: 'A', text: 'AWS' },
        { id: 'B', text: 'O cliente' },
      ],
      topic: 'Shared Responsibility',
      difficulty: 'easy' as const,
    },
  ],
};

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function setupBackend() {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
}

function setupMock() {
  process.env.NEXT_PUBLIC_API_BASE_URL = '';
}

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true, status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

function mockFetch204() {
  return vi.fn().mockResolvedValue({
    ok: true, status: 204,
    json: () => Promise.resolve(null),
  } as unknown as Response);
}

beforeEach(() => {
  localStorage.clear();
  setAccessToken('tok_test');
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

// ─── Modo mock ─────────────────────────────────────────────────────────────

describe('Modo mock (sem backend)', () => {
  beforeEach(setupMock);

  it('listSimuladosApi retorna catálogo estático', async () => {
    const list = await listSimuladosApi();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toBeTruthy();
  });

  it('getSimuladoApi retorna simulado do catálogo por id', async () => {
    const sim = await getSimuladoApi('simulado-aws-practitioner');
    expect(sim?.id).toBe('simulado-aws-practitioner');
  });

  it('getSimuladoApi retorna null para id desconhecido', async () => {
    const sim = await getSimuladoApi('nao-existe');
    expect(sim).toBeNull();
  });

  it('claimXPCredit retorna claimed=false sem backend, sem chamar fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await claimXPCredit('att_001');
    expect(result.claimed).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── Modo real ─────────────────────────────────────────────────────────────

describe('Modo real (backend mockado)', () => {
  beforeEach(setupBackend);

  it('listSimuladosApi chama GET /api/v1/simulados', async () => {
    // Backend responde `{simulados, total}`, não um array solto.
    const fetchMock = mockFetchOk({ simulados: [MOCK_SIMULADO_DTO], total: 1 });
    vi.stubGlobal('fetch', fetchMock);

    const list = await listSimuladosApi();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('simulado-aws-practitioner');
    expect(list[0].price).toBe(47); // priceCents / 100

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/simulados');
    expect(init.method).toBe('GET');
  });

  it('getSimuladoApi chama GET /api/v1/simulados/:id', async () => {
    const fetchMock = mockFetchOk(MOCK_SIMULADO_DTO);
    vi.stubGlobal('fetch', fetchMock);

    const sim = await getSimuladoApi('simulado-aws-practitioner');
    expect(sim?.id).toBe('simulado-aws-practitioner');
    expect(sim?.questionCount).toBe(20);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/simulados/simulado-aws-practitioner');
  });

  it('getSimuladoApi retorna null em 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 404,
      json: () => Promise.resolve({ type: 'not-found', title: 'Not Found', status: 404, detail: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const sim = await getSimuladoApi('nao-existe');
    expect(sim).toBeNull();
  });

  it('startOrResumeAttempt chama POST /api/v1/simulados/:id/attempts', async () => {
    // Backend responde `{attempt, simulado}`, não o AttemptDTO solto.
    const fetchMock = mockFetchOk({ attempt: MOCK_ATTEMPT_DTO, simulado: MOCK_SIMULADO_DTO });
    vi.stubGlobal('fetch', fetchMock);

    const { attempt } = await startOrResumeAttempt('simulado-aws-practitioner');
    expect(attempt.id).toBe('att_001');
    expect(attempt.questions).toHaveLength(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/simulados/simulado-aws-practitioner/attempts');
    expect(init.method).toBe('POST');
  });

  it('getActiveAttempt chama GET /api/v1/simulados/:id/attempts/active e desembrulha o envelope', async () => {
    const fetchMock = mockFetchOk({ attempt: MOCK_ATTEMPT_DTO, simulado: MOCK_SIMULADO_DTO });
    vi.stubGlobal('fetch', fetchMock);

    const attempt = await getActiveAttempt('simulado-aws-practitioner');
    expect(attempt?.id).toBe('att_001');

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/simulados/simulado-aws-practitioner/attempts/active');
  });

  it('getActiveAttempt retorna null quando não há tentativa ativa (404)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 404,
      json: () => Promise.resolve({ type: 'not-found', title: 'Not Found', status: 404, detail: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const attempt = await getActiveAttempt('simulado-aws-practitioner');
    expect(attempt).toBeNull();
  });

  it('answerQuestion chama POST /api/v1/attempts/:id/answers', async () => {
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    await answerQuestion('att_001', 'clf-q1', 'B');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/attempts/att_001/answers');
    expect(JSON.parse(init.body as string)).toMatchObject({ questionId: 'clf-q1', optionId: 'B' });
  });

  it('toggleFlag chama POST /api/v1/attempts/:id/flags/:questionId', async () => {
    const fetchMock = mockFetch204();
    vi.stubGlobal('fetch', fetchMock);

    await toggleFlag('att_001', 'clf-q1');

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/attempts/att_001/flags/clf-q1');
  });

  it('finishAttempt chama POST /api/v1/attempts/:id/finish e retorna ScoreDTO', async () => {
    const scoreDTO = {
      value: 85,
      correct: 17,
      total: 20,
      passed: true,
      byTopic: { 'Shared Responsibility': { correct: 4, total: 5 } },
    };
    // Backend responde `{attempt, weakTopics}`, com o score aninhado em attempt.score.
    const fetchMock = mockFetchOk({
      attempt: { ...MOCK_ATTEMPT_DTO, status: 'finished' as const, score: scoreDTO },
      weakTopics: ['Shared Responsibility'],
    });
    vi.stubGlobal('fetch', fetchMock);

    const { score, weakTopics } = await finishAttempt('att_001');
    expect(score.value).toBe(85);
    expect(score.passed).toBe(true);
    expect(score.correct).toBe(17);
    expect(weakTopics).toEqual(['Shared Responsibility']);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/attempts/att_001/finish');
    expect(init.method).toBe('POST');
  });

  it('listAttemptsApi chama GET /api/v1/attempts', async () => {
    const finishedAttempt = { ...MOCK_ATTEMPT_DTO, status: 'finished' as const, finishedAt: '2024-01-01T01:00:00Z', score: { value: 90, correct: 18, total: 20, passed: true, byTopic: {} } };
    // Backend responde `{attempts, total}`, não um array solto.
    const fetchMock = mockFetchOk({ attempts: [finishedAttempt], total: 1 });
    vi.stubGlobal('fetch', fetchMock);

    const attempts = await listAttemptsApi();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].simuladoId).toBe('simulado-aws-practitioner');
    expect(attempts[0].score).toBe(90);
    expect(attempts[0].passed).toBe(true);
  });

  it('claimXPCredit chama POST /api/v1/attempts/:id/claim-xp e retorna claimed', async () => {
    const fetchMock = mockFetchOk({ claimed: true });
    vi.stubGlobal('fetch', fetchMock);

    const result = await claimXPCredit('att_001');
    expect(result.claimed).toBe(true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/attempts/att_001/claim-xp');
    expect(init.method).toBe('POST');
  });

  it('claimXPCredit retorna claimed=false quando o servidor já concedeu antes', async () => {
    const fetchMock = mockFetchOk({ claimed: false });
    vi.stubGlobal('fetch', fetchMock);

    const result = await claimXPCredit('att_001');
    expect(result.claimed).toBe(false);
  });
});
