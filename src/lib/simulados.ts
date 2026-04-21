'use client';

/**
 * Modelo e helpers de simulados pagos.
 *
 * Catálogo estático em `simulados-catalog.ts`. Tentativas (attempts) do
 * usuário persistem em localStorage via storage.ts, indexadas por simuladoId.
 *
 * Toda persistência passa por storage.ts; nenhuma chamada localStorage direta.
 */

import { STORAGE_KEYS } from './constants';
import { getJSON, setJSON } from './storage';
import { SimuladoAttemptsStoredSchema } from './schemas';

export type OptionId = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SimuladoQuestionOption {
  id: OptionId;
  text: string;
}

export interface SimuladoQuestion {
  id: string;
  stem: string;
  options: SimuladoQuestionOption[];
  correctId: OptionId;
  /** Explicação do "tutor IA" mockado — por que certa é certa, por que cada distrator erra. */
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Link opcional para artigo da FFV relacionado. */
  relatedSlug?: string;
}

export interface Simulado {
  id: string;
  certification: string;
  title: string;
  description: string;
  /** Preço em R$. */
  price: number;
  questionCount: number;
  timeLimitMin: number;
  topics: string[];
  questions: SimuladoQuestion[];
  /** Nota mínima para passar (0-100). */
  passingScore: number;
  /** Se true, ainda não está disponível (mostrar "Em breve"). */
  comingSoon?: boolean;
}

export interface SimuladoAttempt {
  simuladoId: string;
  startedAt: string;
  finishedAt?: string;
  /** questionId → optionId escolhido. */
  answers: Record<string, string>;
  /** Score 0-100 (calculado no finishedAt). */
  score?: number;
  passed?: boolean;
  /** IDs de questões marcadas para revisão. */
  reviewFlags?: string[];
}

export interface ScoredAttempt {
  score: number;
  passed: boolean;
  totalAnswered: number;
  correctCount: number;
  byTopic: Record<string, { correct: number; total: number }>;
}

/**
 * Limite gratuito (sem pagar) — primeiras N questões acessíveis a qualquer
 * user logado. Após a N+1ª, mostra paywall.
 */
export const FREE_QUESTIONS_LIMIT = 10;

// ─────────────────────────────────────────────────────────────────
// Catálogo lookup
// ─────────────────────────────────────────────────────────────────

import { SIMULADOS_CATALOG } from './simulados-catalog';

export function getSimulado(id: string): Simulado | undefined {
  return SIMULADOS_CATALOG.find(s => s.id === id);
}

export function listSimulados(): readonly Simulado[] {
  return SIMULADOS_CATALOG;
}

// ─────────────────────────────────────────────────────────────────
// Attempt persistence
// ─────────────────────────────────────────────────────────────────

/** Lê TODAS as attempts do usuário (map simuladoId → attempt). */
function loadAttempts(): Record<string, SimuladoAttempt> {
  const raw = getJSON<unknown>(STORAGE_KEYS.SIMULADO_ATTEMPTS, {});
  const parsed = SimuladoAttemptsStoredSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export function getAttempt(simuladoId: string): SimuladoAttempt | null {
  return loadAttempts()[simuladoId] ?? null;
}

export function listAttempts(): SimuladoAttempt[] {
  return Object.values(loadAttempts());
}

export function saveAttempt(attempt: SimuladoAttempt): boolean {
  const attempts = loadAttempts();
  attempts[attempt.simuladoId] = attempt;
  return setJSON(STORAGE_KEYS.SIMULADO_ATTEMPTS, attempts);
}

export function clearAttempt(simuladoId: string): boolean {
  const attempts = loadAttempts();
  delete attempts[simuladoId];
  return setJSON(STORAGE_KEYS.SIMULADO_ATTEMPTS, attempts);
}

// ─────────────────────────────────────────────────────────────────
// Scoring (puro — testável isoladamente)
// ─────────────────────────────────────────────────────────────────

/**
 * Calcula pontuação de uma tentativa contra o gabarito.
 * Apenas questões respondidas e presentes no simulado contam.
 */
export function scoreAttempt(simulado: Simulado, attempt: SimuladoAttempt): ScoredAttempt {
  const byTopic: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;
  let totalAnswered = 0;

  for (const q of simulado.questions) {
    const topic = q.topic;
    if (!byTopic[topic]) byTopic[topic] = { correct: 0, total: 0 };
    byTopic[topic].total += 1;

    const chosen = attempt.answers[q.id];
    if (!chosen) continue;
    totalAnswered += 1;
    if (chosen === q.correctId) {
      correctCount += 1;
      byTopic[topic].correct += 1;
    }
  }

  const total = simulado.questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= simulado.passingScore;
  return { score, passed, totalAnswered, correctCount, byTopic };
}

/**
 * Identifica tópicos fracos — aqueles com acerto < 70%.
 * Usado para sugerir "gerar questões extras" (mock no MVP).
 */
export function getWeakTopics(attempt: SimuladoAttempt, simulado: Simulado): string[] {
  const scored = scoreAttempt(simulado, attempt);
  const weak: string[] = [];
  for (const [topic, { correct, total }] of Object.entries(scored.byTopic)) {
    if (total === 0) continue;
    if (correct / total < 0.7) weak.push(topic);
  }
  return weak;
}

// ─────────────────────────────────────────────────────────────────
// Paywall gate
// ─────────────────────────────────────────────────────────────────

/**
 * Decide se uma questão está acessível para este user.
 * - N primeiras questões (FREE_QUESTIONS_LIMIT): sempre free
 * - Depois: só se user pagou pelo simulado
 */
export function isQuestionAccessible(
  questionIndex: number,
  hasPaid: boolean,
): boolean {
  if (questionIndex < FREE_QUESTIONS_LIMIT) return true;
  return hasPaid;
}
