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
 * Parseia uma explicação no schema v1 (string com blocos `(a)`, `(b)`, `(c)`,
 * `(d)`) para o objeto `QuestionExplanation` (v2).
 *
 * Heurística:
 *   - `(a)` → `whyCorrect` (e primeira frase vira `summary`)
 *   - `(b)` → distribuído em `whyWrong[optId]` para cada distractor, com
 *             matching por palavra-chave do texto da opção. Se não conseguir
 *             mapear, joga tudo no primeiro distractor não-correto e o
 *             chamador deve marcar TODO.
 *   - `(c)` → `keyConcept`
 *   - `(d)` → ignorado (referência já vive em `references[]` do JSON)
 *   - `tutorSeeds` → inferido a partir do `keyConcept`.
 *
 * Retorna `null` se a string não tem os 3 blocos mínimos `(a)`/`(b)`/`(c)` —
 * nesse caso, o chamador deve manter o original como fallback.
 */
export function parseExplanationString(
  raw: string,
  optionIds: OptionId[],
  correctId: OptionId,
  optionTexts?: Partial<Record<OptionId, string>>,
): QuestionExplanation | null {
  const a = /\(a\)\s*([\s\S]*?)\s*\(b\)/i.exec(raw);
  const b = /\(b\)\s*([\s\S]*?)\s*\(c\)/i.exec(raw);
  const c = /\(c\)\s*([\s\S]*?)(?:\s*\(d\)|\s*$)/i.exec(raw);
  if (!a || !b || !c) return null;

  const whyCorrect = a[1].trim();
  const wrongBlock = b[1].trim();
  const keyConcept = c[1].trim();

  // summary = primeira frase do whyCorrect
  const firstSentence =
    /^[\s\S]*?[.!?](?=\s|$)/.exec(whyCorrect)?.[0]?.trim() ?? whyCorrect;
  const summary = firstSentence.length > 280
    ? firstSentence.slice(0, 277) + '...'
    : firstSentence;

  // Split wrongBlock em sentenças/cláusulas: ponto+maiúscula, ponto-e-vírgula
  // e travessão " — " (separador comum nos autores).
  const sentences = wrongBlock
    .split(/(?<=[.!?])\s+(?=[A-ZÁÊÉÍÓÔÚÇ])|;\s+|\s+—\s+/)
    .map(s => s.trim().replace(/^[,.;:]\s*/, ''))
    .filter(s => s.length > 0);

  const distractors = optionIds.filter(id => id !== correctId);
  const whyWrong: Partial<Record<OptionId, string>> = {};

  // Heurística de matching: para cada sentença, achar distractor cujo texto
  // tem mais sobreposição de tokens significativos.
  const tokenize = (s: string): string[] =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 4); // descarta stopwords curtas

  const stop = new Set([
    'para', 'pelo', 'pela', 'pelos', 'pelas', 'sobre', 'cada', 'mais', 'menos',
    'todos', 'todas', 'esse', 'essa', 'isso', 'esta', 'este', 'isto', 'tipo',
    'tipos', 'porque', 'quando', 'enquanto', 'apenas', 'serviço', 'serviços',
    'cliente', 'clientes', 'opção', 'opções', 'aqui', 'então', 'também',
  ]);

  const distractorTokens = new Map<OptionId, Set<string>>();
  for (const id of distractors) {
    const text = optionTexts?.[id] ?? '';
    const toks = tokenize(text).filter(t => !stop.has(t));
    distractorTokens.set(id, new Set(toks));
  }

  const buckets = new Map<OptionId, string[]>();
  const unmatched: string[] = [];

  for (const sent of sentences) {
    const sentToks = new Set(tokenize(sent).filter(t => !stop.has(t)));
    let best: { id: OptionId; score: number } | null = null;
    for (const id of distractors) {
      const dToks = distractorTokens.get(id)!;
      let score = 0;
      for (const t of dToks) if (sentToks.has(t)) score++;
      if (score > 0 && (!best || score > best.score)) {
        best = { id, score };
      }
    }
    if (best) {
      if (!buckets.has(best.id)) buckets.set(best.id, []);
      buckets.get(best.id)!.push(sent);
    } else {
      unmatched.push(sent);
    }
  }

  for (const id of distractors) {
    const bucket = buckets.get(id);
    if (bucket && bucket.length > 0) {
      whyWrong[id] = bucket.join(' ');
    }
  }

  // Se sobraram sentenças sem matching, append no primeiro distractor sem texto
  // ou no primeiro distractor (se todos já têm) com marcador.
  if (unmatched.length > 0) {
    const emptyTarget = distractors.find(id => !whyWrong[id]);
    if (emptyTarget) {
      whyWrong[emptyTarget] = `TODO_REVIEW: ${unmatched.join(' ')}`;
    } else if (distractors[0]) {
      whyWrong[distractors[0]] =
        (whyWrong[distractors[0]] ?? '') + ` [extra: ${unmatched.join(' ')}]`;
    }
  }

  // Para distractors sem nenhuma sentença atribuída, marcar TODO.
  for (const id of distractors) {
    if (!whyWrong[id]) {
      whyWrong[id] = `TODO_REVIEW: distractor sem explicação específica no bloco (b). Contexto geral: ${wrongBlock}`;
    }
  }

  // tutorSeeds — perguntas inferidas a partir do keyConcept
  const tutorSeeds = buildTutorSeeds(keyConcept, whyCorrect);

  return {
    summary,
    whyCorrect,
    whyWrong,
    keyConcept,
    tutorSeeds,
  };
}

/** Heurística simples de geração de seeds de tutor. */
function buildTutorSeeds(keyConcept: string, whyCorrect: string): string[] {
  const seeds: string[] = [];
  const concept = keyConcept.replace(/\.$/, '').trim();
  if (concept) {
    seeds.push(`Pode explicar com mais detalhe: ${concept}?`);
    seeds.push(`Quais cenários reais aplicam ${concept}?`);
  }
  // Procura termos AWS-style (CamelCase ou ALLCAPS) no whyCorrect.
  const awsTerms = Array.from(
    new Set(whyCorrect.match(/\b(?:AWS\s+[A-Z][\w-]+|Amazon\s+[A-Z][\w-]+|[A-Z]{2,}[\w-]*)\b/g) ?? []),
  ).slice(0, 1);
  if (awsTerms[0]) {
    seeds.push(`Como ${awsTerms[0]} se compara com alternativas?`);
  }
  return seeds.slice(0, 3);
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
  /** URL do modo de estudo livre associado (sem timer, banco completo). */
  studyModeUrl?: string;
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
