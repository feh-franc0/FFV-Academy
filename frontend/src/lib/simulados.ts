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

/**
 * Schema rico de explicação (v2) — substitui a string única do schema v1.
 *
 * O schema v1 era uma string no formato `(a) ... (b) ... (c) ... (d) ...`,
 * onde cada bloco cobria, respectivamente: por que a correta acerta, por que
 * os distractors erram (todos juntos), conceito-chave e referência. Embora
 * compacto, dificultava renderização estruturada, integração com TutorChat e
 * análise de "qual distractor o usuário escolheu vs por que aquele erra".
 *
 * O schema v2 quebra a explicação em campos navegáveis. Toda nova questão
 * deve usar o objeto. Strings antigas continuam aceitas via union type para
 * backward-compat até a migração de todos os bancos.
 */
export interface QuestionExplanation {
  /** 1–2 frases TLDR — resposta rápida e direta. */
  summary: string;
  /** Por que a opção correta está certa, com a regra/princípio AWS por trás. */
  whyCorrect: string;
  /** Por que CADA distractor erra. Chave = id da opção (A/B/C/D/E). */
  whyWrong: Partial<Record<OptionId, string>>;
  /** Conceito AWS testado (ex.: "Shared Responsibility Model", "Reserved vs Spot"). */
  keyConcept: string;
  /** Conceitos próximos que vale revisar (ex.: ["Reserved Instances vs Savings Plans"]). */
  compareWith?: string[];
  /** Onde isso aparece na vida real / cenário típico. */
  realWorldContext?: string;
  /** Pegadinhas comuns que candidatos caem. */
  commonMistakes?: string;
  /** Sementes de pergunta sugeridas se o usuário ficou com dúvida — usadas pelo TutorChat futuro. */
  tutorSeeds?: string[];
}

export interface SimuladoQuestion {
  id: string;
  stem: string;
  options: SimuladoQuestionOption[];
  correctId: OptionId;
  /**
   * Explicação do "tutor IA". Aceita string (schema v1 legado, formato
   * `(a) ... (b) ... (c) ... (d) ...`) ou objeto `QuestionExplanation`
   * (schema v2 estruturado). Use {@link isRichExplanation} para discriminar.
   */
  explanation: string | QuestionExplanation;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Link opcional para artigo da FFV relacionado. */
  relatedSlug?: string;
}

// ─────────────────────────────────────────────────────────────────
// Explanation helpers (v1 string ↔ v2 object)
// ─────────────────────────────────────────────────────────────────

/** Type guard: verifica se a explicação está no schema rico (v2). */
export function isRichExplanation(
  e: string | QuestionExplanation | undefined | null,
): e is QuestionExplanation {
  return (
    !!e &&
    typeof e === 'object' &&
    typeof (e as QuestionExplanation).summary === 'string' &&
    typeof (e as QuestionExplanation).whyCorrect === 'string' &&
    typeof (e as QuestionExplanation).keyConcept === 'string' &&
    typeof (e as QuestionExplanation).whyWrong === 'object'
  );
}

/**
 * Retorna a explicação como texto plano para renderização em componentes
 * que ainda não suportam o schema rico. Em v2 concatena os campos
 * principais; em v1 devolve a string como está.
 */
export function getExplanationText(
  e: string | QuestionExplanation | undefined | null,
): string {
  if (!e) return '';
  if (typeof e === 'string') return e;
  const parts: string[] = [e.summary, e.whyCorrect];
  const wrongs = Object.entries(e.whyWrong)
    .map(([k, v]) => `(${k}) ${v}`)
    .join(' ');
  if (wrongs) parts.push(wrongs);
  parts.push(`Conceito: ${e.keyConcept}.`);
  return parts.filter(Boolean).join(' ');
}

/**
/**
 * `parseExplanationString` e `buildTutorSeeds` foram APAGADAS em 07/ago/2026.
 *
 * Elas prometiam converter a explicação em string (v1) para o objeto rico (v2),
 * casando cada bloco `(a)`/`(b)`/`(c)` com os distratores por palavra-chave.
 * Medido antes de apagar: das **75 explicações do catálogo, 75 são string v1 e
 * ZERO tem os três blocos** que a função exigia — ela devolveria `null` para
 * todas. E não era chamada de lugar nenhum.
 *
 * Manter custava mais que apagar: quem abria o arquivo via uma conversão
 * automática que não existia, e por isso não fazia a migração real — que é
 * redação técnica, um distrator de cada vez, nomeando o erro de raciocínio de
 * quem escolheria aquela alternativa.
 *
 * Os marcadores `TODO_REVIEW` que ela geraria NUNCA chegaram ao aluno, porque a
 * função nunca executou. A suspeita inicial era a oposta, e a medição a
 * contradisse — fica registrado para não voltar como achado.
 */


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
  /**
   * Id do banco no Postgres (`questions.simulado_id`), quando as questões vêm
   * do backend em vez de inline. É DIFERENTE do `id` do catálogo de propósito
   * histórico — `simulado-aws-practitioner` no catálogo, `aws-clf` no banco —
   * e a ausência desta ponte quebrou o fluxo `fazer` em silêncio: o runner
   * consultava a API com o id do catálogo, a query `simulado_id = $1` voltava
   * vazia, e o aluno via "banco vazio" com 1.015 questões no banco.
   */
  dbBankId?: string;
  /** URL do modo de estudo livre associado (sem timer, banco completo). */
  studyModeUrl?: string;
}

export interface SimuladoAttempt {
  /** ID real da tentativa no servidor — ausente no modo mock (identificado só por simuladoId). */
  id?: string;
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

/** Número de questões incluídas no pool de questões aleatórias por simulado. */
export const FREE_QUESTIONS_LIMIT = 10;

// Todas as questões são gratuitas — acesso via nível do usuário, sem pagamento.
export function isQuestionAccessible(): boolean {
  return true;
}
