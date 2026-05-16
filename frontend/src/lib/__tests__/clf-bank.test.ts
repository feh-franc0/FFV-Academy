import { describe, it, expect, vi, beforeEach } from 'vitest';

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock('@/lib/api-client', () => ({
  apiFetch: apiFetchMock,
}));

import {
  CLF_DOMAIN_WEIGHTS,
  CLF_SIMULADO_ID,
  fetchOneRandomQuestion,
  fetchQuestionCount,
  fetchQuestionsByIds,
  fetchRandomQuestions,
} from '../clf-bank';

function makeAPIQuestion(id: string, overrides: Partial<{ topic: string; difficulty: string }> = {}) {
  return {
    id,
    simuladoId: CLF_SIMULADO_ID,
    stem: `Stem ${id}`,
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correctId: 'A',
    explanation: 'plain',
    topic: overrides.topic ?? 'Cloud Concepts',
    domain: overrides.topic ?? 'Cloud Concepts',
    difficulty: overrides.difficulty ?? 'medium',
    status: 'active',
  };
}

describe('CLF_DOMAIN_WEIGHTS', () => {
  it('reflete o blueprint oficial AWS CLF-C02 (24/30/34/12 = 100)', () => {
    const total = Object.values(CLF_DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

describe('fetchRandomQuestions', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('chama /study/random com count default = 1 e simulado padrão aws-clf', async () => {
    apiFetchMock.mockResolvedValue({ questions: [makeAPIQuestion('q1')], total: 1 });
    const out = await fetchRandomQuestions();
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('q1');
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [url] = apiFetchMock.mock.calls[0];
    expect(url).toContain('/api/v1/simulados/aws-clf/study/random');
    expect(url).toContain('count=1');
  });

  it('passa domain, difficulty e excludeIds como query params', async () => {
    apiFetchMock.mockResolvedValue({ questions: [], total: 0 });
    await fetchRandomQuestions({
      count: 5,
      domain: 'Security & Compliance',
      difficulty: 'hard',
      excludeIds: ['a', 'b', 'c'],
    });
    const [url] = apiFetchMock.mock.calls[0];
    expect(url).toContain('count=5');
    expect(url).toContain('domain=Security+%26+Compliance');
    expect(url).toContain('difficulty=hard');
    expect(url).toContain('excludeIds=a%2Cb%2Cc');
  });

  it('clampa count para [1, 100]', async () => {
    apiFetchMock.mockResolvedValue({ questions: [], total: 0 });
    await fetchRandomQuestions({ count: 500 });
    expect(apiFetchMock.mock.calls[0][0]).toContain('count=100');

    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ questions: [], total: 0 });
    await fetchRandomQuestions({ count: 0 });
    expect(apiFetchMock.mock.calls[0][0]).toContain('count=1');
  });
});

describe('fetchOneRandomQuestion', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('retorna a primeira questão da resposta', async () => {
    apiFetchMock.mockResolvedValue({ questions: [makeAPIQuestion('q1')], total: 1 });
    const q = await fetchOneRandomQuestion();
    expect(q?.id).toBe('q1');
  });

  it('retorna null quando o backend devolve lista vazia', async () => {
    apiFetchMock.mockResolvedValue({ questions: [], total: 0 });
    const q = await fetchOneRandomQuestion();
    expect(q).toBeNull();
  });
});

describe('fetchQuestionsByIds', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('chama /questions/batch com ids CSV', async () => {
    apiFetchMock.mockResolvedValue({
      questions: [makeAPIQuestion('a'), makeAPIQuestion('b')],
      total: 2,
    });
    const out = await fetchQuestionsByIds(['a', 'b']);
    expect(out).toHaveLength(2);
    const [url] = apiFetchMock.mock.calls[0];
    expect(url).toContain('/api/v1/simulados/aws-clf/questions/batch');
    expect(url).toContain('ids=a%2Cb');
  });

  it('curto-circuita sem chamar API quando ids vazio', async () => {
    const out = await fetchQuestionsByIds([]);
    expect(out).toEqual([]);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe('fetchQuestionCount', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('retorna count da API', async () => {
    apiFetchMock.mockResolvedValue({ simuladoId: 'aws-clf', count: 1015 });
    expect(await fetchQuestionCount()).toBe(1015);
  });

  it('retorna 0 quando API falha (gate-friendly)', async () => {
    apiFetchMock.mockImplementationOnce(() => Promise.reject(new Error('offline')));
    expect(await fetchQuestionCount()).toBe(0);
  });
});
