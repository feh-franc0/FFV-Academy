/**
 * Cliente da API de questões CLF-C02.
 *
 * O banco de questões vive no Postgres do backend. O frontend NUNCA carrega
 * a lista completa — sempre busca 1 questão (modo estudo) ou um lote sorteado
 * server-side (modo simulado) via os endpoints:
 *
 *   GET /api/v1/simulados/{simuladoId}/study/random?count=N&domain=X&difficulty=Y&excludeIds=a,b
 *   GET /api/v1/simulados/{simuladoId}/questions/batch?ids=a,b,c
 *
 * O sorteio aleatório (ORDER BY RANDOM()) e os filtros por domínio/dificuldade
 * são feitos pelo Postgres — barato com os índices parciais
 * `idx_questions_simulado_domain` e `idx_questions_simulado_difficulty`.
 *
 * Blueprint oficial (AWS CLF-C02):
 * - Cloud Concepts: 24%
 * - Security & Compliance: 30%
 * - Cloud Technology & Services: 34%
 * - Billing, Pricing & Support: 12%
 */

import type { SimuladoQuestion, OptionId } from './simulados';
import { apiFetch } from '@/lib/api-client';

export const CLF_SIMULADO_ID = 'aws-clf';

export const CLF_DOMAINS = [
  'Cloud Concepts',
  'Security & Compliance',
  'Cloud Technology & Services',
  'Billing, Pricing & Support',
] as const;

export type ClfDomain = (typeof CLF_DOMAINS)[number];

export const CLF_DOMAIN_WEIGHTS: Record<ClfDomain, number> = {
  'Cloud Concepts': 24,
  'Security & Compliance': 30,
  'Cloud Technology & Services': 34,
  'Billing, Pricing & Support': 12,
};

// ─── API response shape ───────────────────────────────────────────────────

interface APIQuestion {
  id: string;
  simuladoId: string;
  stem: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: unknown;
  topic: string;
  domain: string;
  difficulty: string;
  scenarioType?: string;
  tags?: string[];
  source?: string;
  status: string;
}

interface APIQuestionsResponse {
  questions: APIQuestion[];
  total: number;
}

function normalizeAPIQuestion(q: APIQuestion): SimuladoQuestion {
  return {
    id: q.id,
    stem: q.stem,
    options: q.options.map(o => ({ id: o.id as OptionId, text: o.text })),
    correctId: q.correctId as OptionId,
    explanation: q.explanation as unknown as string,
    topic: q.topic || q.domain || 'Geral',
    difficulty: (q.difficulty === 'easy' || q.difficulty === 'hard') ? q.difficulty : 'medium',
  };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────

export interface RandomFetchOpts {
  count?: number;          // default 1, max 100
  domain?: string;         // ex: 'Security & Compliance'
  difficulty?: 'easy' | 'medium' | 'hard';
  excludeIds?: readonly string[];
  simuladoId?: string;     // default = CLF_SIMULADO_ID
}

/**
 * Busca questões aleatórias do backend. O Postgres sorteia via ORDER BY RANDOM()
 * usando os índices `(simulado_id, domain)` e `(simulado_id, difficulty)`.
 *
 * Caller passa `excludeIds` para evitar repetição na sessão atual.
 */
export async function fetchRandomQuestions(opts: RandomFetchOpts = {}): Promise<SimuladoQuestion[]> {
  const simuladoId = opts.simuladoId ?? CLF_SIMULADO_ID;
  const params = new URLSearchParams();
  params.set('count', String(Math.max(1, Math.min(100, opts.count ?? 1))));
  if (opts.domain) params.set('domain', opts.domain);
  if (opts.difficulty) params.set('difficulty', opts.difficulty);
  if (opts.excludeIds && opts.excludeIds.length > 0) {
    params.set('excludeIds', opts.excludeIds.join(','));
  }

  const data = await apiFetch<APIQuestionsResponse>(
    `/api/v1/simulados/${simuladoId}/study/random?${params.toString()}`,
    {},
    true,
  );
  return (data.questions ?? []).map(normalizeAPIQuestion);
}

/**
 * Atalho para buscar 1 questão. Retorna `null` se o backend não tem nada
 * disponível (ex: usuário já viu todas as questões com aqueles filtros).
 */
export async function fetchOneRandomQuestion(opts: Omit<RandomFetchOpts, 'count'> = {}): Promise<SimuladoQuestion | null> {
  const [q] = await fetchRandomQuestions({ ...opts, count: 1 });
  return q ?? null;
}

/**
 * Busca múltiplas questões por ID — usado pelo ResultadoClient para
 * renderizar a revisão das questões respondidas no simulado.
 */
export async function fetchQuestionsByIds(
  ids: readonly string[],
  simuladoId: string = CLF_SIMULADO_ID,
): Promise<SimuladoQuestion[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams();
  params.set('ids', ids.join(','));

  const data = await apiFetch<APIQuestionsResponse>(
    `/api/v1/simulados/${simuladoId}/questions/batch?${params.toString()}`,
    {},
    true,
  );
  return (data.questions ?? []).map(normalizeAPIQuestion);
}

// ─── Public count (gate de UI) ────────────────────────────────────────────

interface CountResponse {
  simuladoId: string;
  count: number;
}

/**
 * Retorna quantas questões ativas estão no banco para o simulado.
 * Endpoint público (sem JWT) — usado para mostrar "banco com N questões" na UI.
 */
export async function fetchQuestionCount(simuladoId: string = CLF_SIMULADO_ID): Promise<number> {
  try {
    const data = await apiFetch<CountResponse>(
      `/api/v1/simulados/${simuladoId}/questions/count`,
      {},
      false,
    );
    return data.count ?? 0;
  } catch {
    return 0;
  }
}
