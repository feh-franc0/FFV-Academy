/**
 * Pergunta do Dia — MVP.
 *
 * Constrói um pool unificado de perguntas a partir de:
 * - SRS reviewCards do usuário (deriva de quizzes de módulos já visitados)
 * - SIMULADOS_CATALOG: as 10 primeiras questões free de cada simulado
 *
 * Sorteio é determinístico por seed (userId + today), com pesos:
 * - 35% gap   — tópicos que o user errou (quizScore < 70%) ou nunca tocou
 * - 30% SRS   — cards SRS due hoje
 * - 20% trail — trilha em progresso (do reviewCards)
 * - 15% discovery — qualquer pergunta do pool
 *
 * Se um bucket está vazio, o peso "transborda" para o próximo (discovery cobre default).
 */

import type { GameState } from './engine';
// NOTE: only type imports above to avoid runtime circular dep with engine.ts
import { SIMULADOS_CATALOG } from './simulados-catalog';
import { FREE_QUESTIONS_LIMIT, getExplanationText } from './simulados';
import { CURRICULUM } from './curriculum';

export type PoolSource = 'module' | 'simulado' | 'pool';

export interface PoolQuestion {
  id: string;
  source: PoolSource;
  stem: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  hubId?: string;
  trailId?: string;
  moduleSlug?: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weight?: number;
  /** Slug de artigo relacionado, se houver. */
  relatedSlug?: string;
}

/**
 * Hash determinístico (FNV-1a 32-bit). Mesma seed → mesmo número.
 */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function trailFromSlug(slug: string): { trailId?: string } {
  for (const t of CURRICULUM) {
    if (t.modules.some(m => m.slug === slug)) return { trailId: t.id };
  }
  return {};
}

/**
 * Constrói o pool unificado.
 *
 * `reviewCards` é opcional — quando provido, perguntas baseadas em quizzes
 * de módulos que o user já abriu entram no pool com source='module'.
 */
export function buildPool(reviewCards?: GameState['reviewCards']): PoolQuestion[] {
  const out: PoolQuestion[] = [];

  // Source: SRS cards (representam quizzes de módulos)
  if (reviewCards) {
    for (const card of reviewCards) {
      const { trailId } = trailFromSlug(card.slug);
      out.push({
        id: `mod_${card.id}`,
        source: 'module',
        stem: card.question,
        options: card.options.map((text, i) => ({
          id: String.fromCharCode(65 + i),
          text,
        })),
        correctId: String.fromCharCode(65 + card.correct),
        explanation: card.explanation,
        topic: card.title,
        difficulty: 'medium',
        trailId,
        moduleSlug: card.slug,
        relatedSlug: card.slug,
      });
    }
  }

  // Source: simulado free questions (FREE_QUESTIONS_LIMIT primeiras de cada)
  for (const sim of SIMULADOS_CATALOG) {
    const free = sim.questions.slice(0, FREE_QUESTIONS_LIMIT);
    for (const q of free) {
      out.push({
        id: `sim_${sim.id}_${q.id}`,
        source: 'simulado',
        stem: q.stem,
        options: q.options.map(o => ({ id: o.id, text: o.text })),
        correctId: q.correctId,
        explanation: getExplanationText(q.explanation),
        topic: q.topic,
        difficulty: q.difficulty,
        relatedSlug: q.relatedSlug,
      });
    }
  }

  return out;
}

/* ─── seleção por buckets ──────────────────────────────────── */

function isWeak(state: GameState, q: PoolQuestion): boolean {
  if (q.moduleSlug) {
    const qs = state.quizScores[q.moduleSlug];
    if (qs && qs.total > 0 && qs.score / qs.total < 0.7) return true;
    return !state.completedModules.includes(q.moduleSlug);
  }
  // simulado: sem score por questão; considera gap se nunca acertou nenhum quiz
  return Object.keys(state.quizScores).length === 0;
}

function isSrsDue(state: GameState, q: PoolQuestion, today: string): boolean {
  if (q.source !== 'module' || !q.moduleSlug) return false;
  return state.reviewCards.some(c => c.id === q.id.replace(/^mod_/, '') && c.dueDate <= today);
}

function isInProgressTrail(state: GameState, q: PoolQuestion): boolean {
  if (!q.trailId) return false;
  return state.completedModules.some(slug => trailFromSlug(slug).trailId === q.trailId);
}

/** Já respondida nas últimas N entradas do histórico. */
function isRecent(history: GameState['dailyQuestionHistory'] | undefined, id: string): boolean {
  return !!history?.some(h => h.id === id);
}

/**
 * Picks daily question deterministically from pool using seed.
 *
 * Estratégia:
 * 1. Filtra perguntas já recentemente respondidas (cap 30 no history).
 * 2. Classifica candidatos em buckets: srs(30) → gap(35) → trail(20) → discovery(15).
 * 3. Hash da seed escolhe bucket (cumulativo de pesos), depois escolhe item.
 * 4. Se bucket vazio, cai para o próximo non-empty.
 *
 * Retorna `null` se o pool estiver vazio.
 */
export function pickDailyQuestion(
  state: GameState,
  pool: PoolQuestion[],
  today: string,
  seedBase = 'anon',
): PoolQuestion | null {
  if (pool.length === 0) return null;
  const history = state.dailyQuestionHistory;
  const candidates = pool.filter(q => !isRecent(history, q.id));
  const eff = candidates.length > 0 ? candidates : pool;

  const srs: PoolQuestion[] = [];
  const gap: PoolQuestion[] = [];
  const trail: PoolQuestion[] = [];
  const discovery: PoolQuestion[] = eff;

  for (const q of eff) {
    if (isSrsDue(state, q, today)) srs.push(q);
    else if (isWeak(state, q)) gap.push(q);
    else if (isInProgressTrail(state, q)) trail.push(q);
  }

  const seed = `${seedBase}|${today}`;
  const h = hashString(seed);
  const bucketRoll = h % 100;

  // 0..29 srs, 30..64 gap, 65..84 trail, 85..99 discovery
  const ordered: PoolQuestion[][] = [];
  if (bucketRoll < 30) ordered.push(srs, gap, trail, discovery);
  else if (bucketRoll < 65) ordered.push(gap, srs, trail, discovery);
  else if (bucketRoll < 85) ordered.push(trail, gap, srs, discovery);
  else ordered.push(discovery, gap, srs, trail);

  const bucket = ordered.find(b => b.length > 0) ?? eff;
  const idx = hashString(seed + '|idx') % bucket.length;
  return bucket[idx];
}
