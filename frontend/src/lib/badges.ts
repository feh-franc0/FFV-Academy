/**
 * Motor de avaliação de badges — funções puras, testáveis isoladamente.
 *
 * Separado de `engine.ts` para respeitar SRP: `completeModule` e
 * `submitCardReview` despacham para aqui toda a decisão de "que badges
 * foram desbloqueados agora?", em vez de enfileirar 30+ `if` inline.
 *
 * Regras são declarativas (array `MODULE_BADGES` e `REVIEW_BADGES`). Adicionar
 * um novo badge = adicionar uma entrada. Nada mais precisa mudar.
 */

import { CURRICULUM, BADGES_DEF, getHubForTrail } from './curriculum';
import { todayISO, daysBetween } from './srs';
import { GAME_CONFIG } from './constants';
import type { GameState } from './engine';

// ──────────────────────────────────────────────────────────────────────────
// Context passado às regras
// ──────────────────────────────────────────────────────────────────────────

export interface ModuleBadgeContext {
  state: GameState;
  isRevisit: boolean;
  /** Hora do dia (0-23) usada na avaliação; injetável pra testes. */
  hour: number;
  /** Dia da semana (0=Dom ... 6=Sáb); injetável pra testes. */
  dayOfWeek: number;
  /** YYYY-MM-DD de "hoje"; injetável pra testes. */
  today: string;
  /** Timestamp ISO agora; injetável pra testes. */
  now: string;
}

export interface ReviewBadgeContext {
  state: GameState;
  outcome: 'again' | 'hard' | 'good' | 'easy';
  today: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Primitivo: regra de badge
// ──────────────────────────────────────────────────────────────────────────

interface BadgeRule<Ctx> {
  id: string;
  /** Retorna true se o badge deve desbloquear (dado o contexto). */
  predicate: (ctx: Ctx) => boolean;
}

/** Aplica um badge ao state (idempotente). Retorna se foi novo. */
function applyBadge(state: GameState, badgeId: string): { state: GameState; unlocked: boolean } {
  if (state.badges.includes(badgeId)) return { state, unlocked: false };
  const def = BADGES_DEF.find(b => b.id === badgeId);
  if (!def) return { state, unlocked: false };
  return {
    state: { ...state, badges: [...state.badges, badgeId], xp: state.xp + def.xpBonus },
    unlocked: true,
  };
}

/** Executa uma lista de regras sequencialmente. Retorna state final + badges novos. */
function runRules<Ctx extends { state: GameState }>(
  rules: readonly BadgeRule<Ctx>[],
  initialCtx: Ctx,
): { state: GameState; newBadges: string[] } {
  let state = initialCtx.state;
  const newBadges: string[] = [];
  for (const rule of rules) {
    const ctx = { ...initialCtx, state };
    if (!rule.predicate(ctx)) continue;
    const { state: next, unlocked } = applyBadge(state, rule.id);
    if (unlocked) {
      state = next;
      newBadges.push(rule.id);
    }
  }
  return { state, newBadges };
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers reutilizáveis (puros)
// ──────────────────────────────────────────────────────────────────────────

function getHubsSeen(state: GameState): Set<string> {
  const hubs = new Set<string>();
  for (const slug of state.completedModules) {
    for (const trail of CURRICULUM) {
      if (trail.modules.some(m => m.slug === slug)) {
        const hub = getHubForTrail(trail.id);
        if (hub) hubs.add(hub.id);
        break;
      }
    }
  }
  return hubs;
}

function countCompletedTrails(state: GameState): number {
  let count = 0;
  for (const trail of CURRICULUM) {
    if (trail.modules.every(m => state.completedModules.includes(m.slug))) count += 1;
  }
  return count;
}

function isTrailDone(trailId: string, completedModules: string[]): boolean {
  const trail = CURRICULUM.find(t => t.id === trailId);
  if (!trail) return false;
  return trail.modules.every(m => completedModules.includes(m.slug));
}

function todayModulesCount(state: GameState, today: string): number {
  return state.studyDays.find(d => d.date === today)?.modulesCompleted ?? 0;
}

function consecutiveGoalDays(state: GameState): number {
  let count = 0;
  for (let i = 0; i < GAME_CONFIG.DAILY_GOAL_7_DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const day = state.studyDays.find(sd => sd.date === dateStr);
    if (day && day.cardsReviewed >= state.dailyGoal) count++;
    else break;
  }
  return count;
}

// ──────────────────────────────────────────────────────────────────────────
// Regras de badges disparados em completeModule
// ──────────────────────────────────────────────────────────────────────────

export const MODULE_BADGES: readonly BadgeRule<ModuleBadgeContext>[] = [
  { id: 'first_step', predicate: c => c.state.completedModules.length === 1 },
  { id: 'curious', predicate: c => c.isRevisit },

  // Volume
  { id: 'speed_run', predicate: c => todayModulesCount(c.state, c.today) >= GAME_CONFIG.SPEED_RUN_MODULES_PER_DAY },
  { id: 'marathon', predicate: c => todayModulesCount(c.state, c.today) >= GAME_CONFIG.MARATHON_MODULES_PER_DAY },
  { id: 'modules_25', predicate: c => c.state.completedModules.length >= GAME_CONFIG.MODULES_25 },
  { id: 'modules_75', predicate: c => c.state.completedModules.length >= GAME_CONFIG.MODULES_75 },

  // Streaks
  { id: 'streak_3',  predicate: c => c.state.streak >= GAME_CONFIG.STREAK_3 },
  { id: 'streak_7',  predicate: c => c.state.streak >= GAME_CONFIG.STREAK_7 },
  { id: 'streak_14', predicate: c => c.state.streak >= GAME_CONFIG.STREAK_14 },
  { id: 'streak_30', predicate: c => c.state.streak >= GAME_CONFIG.STREAK_30 },
  { id: 'streak_60', predicate: c => c.state.streak >= GAME_CONFIG.STREAK_60 },

  // Comportamento
  { id: 'early_bird', predicate: c => c.hour < GAME_CONFIG.EARLY_BIRD_HOUR_MAX },
  { id: 'night_owl',  predicate: c => c.hour >= GAME_CONFIG.NIGHT_OWL_HOUR_MIN },
  {
    id: 'midnight_oil',
    predicate: c => c.hour >= GAME_CONFIG.MIDNIGHT_OIL_HOUR_MIN && c.hour < GAME_CONFIG.MIDNIGHT_OIL_HOUR_MAX,
  },
  {
    id: 'weekend_warrior',
    predicate: c => {
      if (c.dayOfWeek !== 0 && c.dayOfWeek !== 6) return false;
      const other = new Date(c.today);
      other.setDate(other.getDate() + (c.dayOfWeek === 6 ? 1 : -1));
      const otherISO = other.toISOString().slice(0, 10);
      return c.state.studyDays.some(d => d.date === otherISO && (d.modulesCompleted > 0 || d.cardsReviewed > 0));
    },
  },
  {
    id: 'comeback',
    predicate: c => {
      if (!c.state.startedAt || c.state.studyDays.length < 2) return false;
      const sorted = [...c.state.studyDays].sort((a, b) => a.date.localeCompare(b.date));
      const idx = sorted.findIndex(d => d.date === c.today);
      if (idx <= 0) return false;
      return daysBetween(sorted[idx - 1].date, c.today) >= GAME_CONFIG.COMEBACK_DAYS_GAP;
    },
  },

  // Hubs
  { id: 'explorer', predicate: c => getHubsSeen(c.state).size >= GAME_CONFIG.EXPLORER_HUBS },
  { id: 'polyglot', predicate: c => getHubsSeen(c.state).size >= GAME_CONFIG.POLYGLOT_HUBS },

  // Trilhas completadas — gera `trailN_done` dinamicamente
  ...CURRICULUM.map(trail => ({
    id: `${trail.id}_done`,
    predicate: (c: ModuleBadgeContext) => isTrailDone(trail.id, c.state.completedModules),
  })),

  // Mastery (≥80% avg score)
  ...CURRICULUM.map(trail => ({
    id: `${trail.id}_mastery`,
    predicate: (c: ModuleBadgeContext) => {
      if (!isTrailDone(trail.id, c.state.completedModules)) return false;
      const withQuiz = trail.modules.filter(m => c.state.quizScores[m.slug]);
      if (withQuiz.length === 0) return false;
      const avg = withQuiz.reduce((s, m) => {
        const qs = c.state.quizScores[m.slug];
        return s + (qs ? qs.score / qs.total : 0);
      }, 0) / withQuiz.length;
      return avg >= GAME_CONFIG.MASTERY_QUIZ_AVG;
    },
  })),

  // Múltiplas trilhas
  { id: 'two_trails_done',  predicate: c => countCompletedTrails(c.state) >= GAME_CONFIG.TWO_TRAILS },
  { id: 'five_trails_done', predicate: c => countCompletedTrails(c.state) >= GAME_CONFIG.FIVE_TRAILS },
  { id: 'all_done', predicate: c => CURRICULUM.every(t => isTrailDone(t.id, c.state.completedModules)) },

  // Completionist: uma trilha inteira 100% perfect
  {
    id: 'completionist',
    predicate: c => {
      for (const trail of CURRICULUM) {
        if (!isTrailDone(trail.id, c.state.completedModules)) continue;
        const withQuiz = trail.modules.filter(m => c.state.quizScores[m.slug]);
        if (withQuiz.length === 0) continue;
        if (withQuiz.every(m => {
          const qs = c.state.quizScores[m.slug];
          return qs && qs.score === qs.total;
        })) return true;
      }
      return false;
    },
  },

  // Claude Master: completou trilhas 13 + 17 + 18
  {
    id: 'claude_master',
    predicate: c =>
      isTrailDone('trail13', c.state.completedModules) &&
      isTrailDone('trail17', c.state.completedModules) &&
      isTrailDone('trail18', c.state.completedModules),
  },

  // Aurora: estudou antes das 6h em >= 3 dias distintos
  {
    id: 'aurora',
    predicate: c => c.state.earlyMorningDays.length >= GAME_CONFIG.AURORA_DAYS_REQUIRED,
  },

  // Speedrun de trilha: completou alguma em < 24h desde o primeiro módulo
  {
    id: 'speedrun_trail',
    predicate: c => {
      for (const trail of CURRICULUM) {
        if (!isTrailDone(trail.id, c.state.completedModules)) continue;
        const startedAt = c.state.trailStartedAt[trail.id];
        if (!startedAt) continue;
        const elapsedH = (Date.parse(c.now) - Date.parse(startedAt)) / 36e5;
        if (elapsedH <= GAME_CONFIG.SPEEDRUN_TRAIL_HOURS) return true;
      }
      return false;
    },
  },
] as const;

// ──────────────────────────────────────────────────────────────────────────
// Regras de badges em submitCardReview
// ──────────────────────────────────────────────────────────────────────────

export const REVIEW_BADGES: readonly BadgeRule<ReviewBadgeContext>[] = [
  { id: 'streak_7', predicate: c => c.state.streak >= GAME_CONFIG.STREAK_7 },
  {
    id: 'cards_50',
    predicate: c => c.state.studyDays.reduce((a, d) => a + d.cardsReviewed, 0) >= GAME_CONFIG.CARDS_50,
  },
  {
    id: 'cards_200',
    predicate: c => c.state.studyDays.reduce((a, d) => a + d.cardsReviewed, 0) >= GAME_CONFIG.CARDS_200,
  },
  {
    id: 'perfect_review',
    predicate: c => {
      if (c.outcome === 'again') return false;
      const today = c.state.studyDays.find(d => d.date === c.today);
      return !!today && today.cardsReviewed >= 10;
    },
  },
  { id: 'daily_goal_7', predicate: c => consecutiveGoalDays(c.state) >= GAME_CONFIG.DAILY_GOAL_7_DAYS },
] as const;

// ──────────────────────────────────────────────────────────────────────────
// Regras de badges em saveQuizScore (sniper + perfect counts)
// ──────────────────────────────────────────────────────────────────────────

export interface QuizBadgeContext {
  state: GameState;
  perfect: boolean;
}

export const QUIZ_BADGES: readonly BadgeRule<QuizBadgeContext>[] = [
  { id: 'quiz_perfect', predicate: c => c.perfect },
  {
    id: 'perfect_5',
    predicate: c => Object.values(c.state.quizScores).filter(s => s.perfect).length >= GAME_CONFIG.PERFECT_5,
  },
  {
    id: 'perfect_20',
    predicate: c => Object.values(c.state.quizScores).filter(s => s.perfect).length >= GAME_CONFIG.PERFECT_20,
  },
  { id: 'sniper', predicate: c => c.state.perfectQuizStreak >= GAME_CONFIG.SNIPER_PERFECT_STREAK },
] as const;

// ──────────────────────────────────────────────────────────────────────────
// Entrypoints públicos
// ──────────────────────────────────────────────────────────────────────────

export function evaluateModuleBadges(ctx: ModuleBadgeContext): { state: GameState; newBadges: string[] } {
  return runRules(MODULE_BADGES, ctx);
}

export function evaluateReviewBadges(ctx: ReviewBadgeContext): { state: GameState; newBadges: string[] } {
  return runRules(REVIEW_BADGES, ctx);
}

export function evaluateQuizBadges(ctx: QuizBadgeContext): { state: GameState; newBadges: string[] } {
  return runRules(QUIZ_BADGES, ctx);
}
