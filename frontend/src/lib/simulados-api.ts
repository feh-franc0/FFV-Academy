'use client';

/**
 * Simulados API adapter — abstrai acesso ao catálogo e tentativas.
 *
 * Modo mock (sem NEXT_PUBLIC_API_BASE_URL): usa SIMULADOS_CATALOG estático
 *   + localStorage via simulados.ts.
 * Modo real: chama backend Go para catálogo e tentativas.
 *
 * DTOs do backend não expõem correctId nas questões — o servidor calcula
 * o score em FinishAttempt. No mock o correctId está local.
 */

import { hasBackend, apiGet, apiPost } from './api-client';
import { SIMULADOS_CATALOG } from './simulados-catalog';
import type { Simulado, SimuladoAttempt } from './simulados';

// ─── DTOs do backend ────────────────────────────────────────────────────────

export interface SimuladoDTO {
  id: string;
  certification: string;
  title: string;
  description: string;
  priceCents: number;
  questionCount: number;
  timeLimitMin: number;
  topics: string[];
  passingScore: number;
  comingSoon?: boolean;
}

export interface QuestionOptionDTO {
  id: string;
  text: string;
}

export interface QuestionDTO {
  id: string;
  stem: string;
  options: QuestionOptionDTO[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedSlug?: string;
}

export interface AttemptDTO {
  id: string;
  simuladoId: string;
  status: 'active' | 'finished';
  answers: Record<string, string>;
  flagged: string[];
  score: ScoreDTO | null;
  startedAt: string;
  deadlineAt: string;
  finishedAt: string | null;
  timeLeftSec: number;
  questions: QuestionDTO[];
}

export interface ScoreDTO {
  value: number;
  correct: number;
  total: number;
  passed: boolean;
  byTopic: Record<string, { correct: number; total: number }>;
}

// ─── Catálogo ───────────────────────────────────────────────────────────────

/** Converte SimuladoDTO do backend para o tipo Simulado local (sem questions). */
function dtoToSimulado(dto: SimuladoDTO): Simulado {
  return {
    id: dto.id,
    certification: dto.certification,
    title: dto.title,
    description: dto.description,
    price: dto.priceCents / 100,
    questionCount: dto.questionCount,
    timeLimitMin: dto.timeLimitMin,
    topics: dto.topics,
    questions: [],
    passingScore: dto.passingScore,
    comingSoon: dto.comingSoon,
  };
}

/** Lista todos os simulados disponíveis. */
export async function listSimuladosApi(): Promise<Simulado[]> {
  if (!hasBackend()) {
    return [...SIMULADOS_CATALOG];
  }
  const items = await apiGet<SimuladoDTO[]>('/api/v1/simulados', false);
  return items.map(dtoToSimulado);
}

/** Busca um simulado específico pelo id. */
export async function getSimuladoApi(simuladoId: string): Promise<Simulado | null> {
  if (!hasBackend()) {
    return SIMULADOS_CATALOG.find(s => s.id === simuladoId) ?? null;
  }
  try {
    const dto = await apiGet<SimuladoDTO>(`/api/v1/simulados/${simuladoId}`, false);
    return dtoToSimulado(dto);
  } catch {
    return null;
  }
}

// ─── Tentativas ────────────────────────────────────────────────────────────

/**
 * Inicia ou retoma uma tentativa no servidor.
 * Retorna AttemptDTO com as questões (sem correctId).
 */
export async function startOrResumeAttempt(simuladoId: string): Promise<AttemptDTO> {
  if (!hasBackend()) {
    throw new Error('startOrResumeAttempt requer backend');
  }
  // POST cria nova ou retoma ativa (comportamento idempotente no servidor)
  return apiPost<AttemptDTO>(`/api/v1/simulados/${simuladoId}/attempts`);
}

/** Busca tentativa ativa (sem criar nova). Retorna null se não existe. */
export async function getActiveAttempt(simuladoId: string): Promise<AttemptDTO | null> {
  if (!hasBackend()) return null;
  try {
    return await apiGet<AttemptDTO>(`/api/v1/simulados/${simuladoId}/attempts/active`);
  } catch {
    return null;
  }
}

/** Envia resposta a uma questão. */
export async function answerQuestion(
  attemptId: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  if (!hasBackend()) return;
  await apiPost(`/api/v1/attempts/${attemptId}/answers`, { questionId, optionId });
}

/** Alterna flag de revisão em uma questão. */
export async function toggleFlag(attemptId: string, questionId: string): Promise<void> {
  if (!hasBackend()) return;
  await apiPost(`/api/v1/attempts/${attemptId}/flags/${questionId}`);
}

/** Finaliza a tentativa e retorna score do servidor. */
export async function finishAttempt(attemptId: string): Promise<ScoreDTO> {
  if (!hasBackend()) {
    throw new Error('finishAttempt requer backend');
  }
  const res = await apiPost<{ score: ScoreDTO }>(`/api/v1/attempts/${attemptId}/finish`);
  return res.score;
}

/** Lista todas as tentativas do usuário. */
export async function listAttemptsApi(): Promise<SimuladoAttempt[]> {
  if (!hasBackend()) return [];
  const items = await apiGet<AttemptDTO[]>('/api/v1/attempts');
  return items.map(a => ({
    simuladoId: a.simuladoId,
    startedAt: a.startedAt,
    finishedAt: a.finishedAt ?? undefined,
    answers: a.answers,
    score: a.score?.value,
    passed: a.score?.passed,
    reviewFlags: a.flagged,
  }));
}
