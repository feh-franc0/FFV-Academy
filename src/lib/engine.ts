'use client';

import { CURRICULUM, LEVELS, BADGES_DEF, getLevelInfo } from './curriculum';
import { type ReviewCard, type ReviewQuality, createCard, reviewCard, getDueCards, todayISO, isoDate } from './srs';

const ENGINE_KEY = 'ffv_academy';

export interface StudyDay {
  date: string;            // YYYY-MM-DD
  minutes: number;
  xpEarned: number;
  cardsReviewed: number;
  modulesCompleted: number;
}

export interface LastArticle {
  slug: string;
  title: string;
  icon: string;
  trailName: string;
  trailColor: string;
  readTime: number;
  xp: number;
  href: string;
  at: string;       // ISO timestamp
  progress: number; // 0..1, scroll read ratio
}

export interface GameState {
  schemaVersion: number;    // incrementar a cada migração destrutiva
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  completedModules: string[];
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>;
  badges: string[];
  totalStudyTime: number;
  startedAt: string | null;
  // SRS + habit tracking (Phase 1)
  reviewCards: ReviewCard[];
  studyDays: StudyDay[];
  freezes: number;          // 0-2 streak freezes in bank
  dailyGoal: number;        // default 3 cards/day
  lastReviewDate: string | null;
  // UX v2 (personalization + continuity)
  lastArticle: LastArticle | null;
  preferredHub: string | null;    // hub slug chosen at onboarding
  onboardedAt: string | null;     // ISO
  articleProgress: Record<string, number>; // slug → 0..1
}

const CURRENT_SCHEMA = 1;

/** Migra estado antigo (sem schemaVersion) para versão atual. */
function migrateState(parsed: Record<string, unknown>): Partial<GameState> {
  const version = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 0;
  let state = { ...parsed } as Record<string, unknown>;
  // v0 → v1: sem mudanças destrutivas, só adiciona schemaVersion
  if (version < 1) {
    state = { ...state, schemaVersion: 1 };
  }
  // v1 → v2: adicionar aqui no futuro
  return state as Partial<GameState>;
}

export interface CompleteModuleResult {
  xpGained: number;
  newBadges: string[];
  leveledUp: boolean;
  newLevel: number;
  cardsAdded: number;
}

const DEFAULT_STATE: GameState = {
  schemaVersion: CURRENT_SCHEMA,
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  completedModules: [],
  quizScores: {},
  badges: [],
  totalStudyTime: 0,
  startedAt: null,
  reviewCards: [],
  studyDays: [],
  freezes: 0,
  dailyGoal: 3,
  lastReviewDate: null,
  lastArticle: null,
  preferredHub: null,
  onboardedAt: null,
  articleProgress: {},
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(ENGINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const migrated = migrateState(parsed);
      return {
        ...DEFAULT_STATE,
        ...migrated,
        schemaVersion: CURRENT_SCHEMA,
        reviewCards: Array.isArray(migrated.reviewCards) ? migrated.reviewCards : [],
        studyDays: Array.isArray(migrated.studyDays) ? migrated.studyDays : [],
        freezes: typeof migrated.freezes === 'number' ? migrated.freezes : 0,
        dailyGoal: typeof migrated.dailyGoal === 'number' ? migrated.dailyGoal : 3,
        lastReviewDate: typeof migrated.lastReviewDate === 'string' ? migrated.lastReviewDate : null,
        lastArticle: migrated.lastArticle && typeof migrated.lastArticle === 'object' ? migrated.lastArticle as LastArticle : null,
        preferredHub: typeof migrated.preferredHub === 'string' ? migrated.preferredHub : null,
        onboardedAt: typeof migrated.onboardedAt === 'string' ? migrated.onboardedAt : null,
        articleProgress: migrated.articleProgress && typeof migrated.articleProgress === 'object' ? migrated.articleProgress as Record<string, number> : {},
      };
    }
  } catch {}
  return { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
}

let _saveErrorCallback: ((msg: string) => void) | null = null;
/** Registra callback para erros de persistência (ex: localStorage cheio). */
export function onSaveError(cb: (msg: string) => void) { _saveErrorCallback = cb; }

function saveState(state: GameState) {
  try {
    localStorage.setItem(ENGINE_KEY, JSON.stringify(state));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar progresso';
    _saveErrorCallback?.(msg);
    // Re-tentativa com dados críticos mínimos (preserva progresso, descarta histórico pesado)
    try {
      const minimal = { ...state, studyDays: state.studyDays.slice(-30), reviewCards: state.reviewCards.slice(-100) };
      localStorage.setItem(ENGINE_KEY, JSON.stringify(minimal));
    } catch {}
  }
}

/** Exporta o estado completo como JSON string para download pelo usuário. */
export function exportState(): string {
  const state = loadState();
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

/** Importa estado a partir de JSON exportado. Retorna true se sucesso, false se JSON inválido. */
export function importState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return false;
    // Valida campos mínimos obrigatórios
    if (typeof parsed.xp !== 'number' || !Array.isArray(parsed.completedModules)) return false;
    const migrated = migrateState(parsed);
    const next: GameState = {
      ...DEFAULT_STATE,
      ...migrated,
      schemaVersion: CURRENT_SCHEMA,
      reviewCards: Array.isArray(migrated.reviewCards) ? migrated.reviewCards : [],
      studyDays: Array.isArray(migrated.studyDays) ? migrated.studyDays : [],
    };
    localStorage.setItem(ENGINE_KEY, JSON.stringify(next));
    return true;
  } catch { return false; }
}

function recordStudyDay(state: GameState, delta: Partial<Omit<StudyDay, 'date'>>): GameState {
  const today = todayISO();
  const existing = state.studyDays.find(d => d.date === today);
  const base: StudyDay = existing ?? { date: today, minutes: 0, xpEarned: 0, cardsReviewed: 0, modulesCompleted: 0 };
  const updated: StudyDay = {
    date: today,
    minutes: base.minutes + (delta.minutes ?? 0),
    xpEarned: base.xpEarned + (delta.xpEarned ?? 0),
    cardsReviewed: base.cardsReviewed + (delta.cardsReviewed ?? 0),
    modulesCompleted: base.modulesCompleted + (delta.modulesCompleted ?? 0),
  };
  const others = state.studyDays.filter(d => d.date !== today);
  // keep last 365 days
  const sorted = [...others, updated].sort((a, b) => a.date.localeCompare(b.date));
  const trimmed = sorted.slice(-365);
  return { ...state, studyDays: trimmed };
}

function checkStreak(state: GameState): GameState {
  const today = new Date().toDateString();
  const last = state.lastStudyDate;
  if (!last) return state;

  const lastDate = new Date(last);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    lastDate.toDateString() !== yesterday.toDateString() &&
    lastDate.toDateString() !== today
  ) {
    // Missed at least one day. Try to consume a freeze.
    if (state.streak > 0) {
      if (state.freezes > 0) {
        return { ...state, freezes: state.freezes - 1, lastStudyDate: yesterday.toDateString() };
      }
      return { ...state, streak: 0 };
    }
  }
  return state;
}

function touchStreak(state: GameState): GameState {
  const today = new Date().toDateString();
  if (state.lastStudyDate === today) return state;

  const last = state.lastStudyDate;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = state.streak;
  let freezes = state.freezes;

  if (last && new Date(last).toDateString() === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  // Earn 1 freeze every 7 consecutive days, cap at 2
  if (streak > 0 && streak % 7 === 0 && freezes < 2) {
    freezes += 1;
  }

  return { ...state, streak, freezes, lastStudyDate: today };
}

function addXP(state: GameState, amount: number): { state: GameState; leveledUp: boolean; newLevel: number } {
  const prevLevel = state.level;
  const newXP = state.xp + amount;
  const levelInfo = getLevelInfo(newXP);
  const newLevel = levelInfo.level;
  return {
    state: { ...state, xp: newXP, level: newLevel },
    leveledUp: newLevel > prevLevel,
    newLevel,
  };
}

function unlockBadge(state: GameState, badgeId: string): { state: GameState; unlocked: boolean } {
  if (state.badges.includes(badgeId)) return { state, unlocked: false };
  const badge = BADGES_DEF.find(b => b.id === badgeId);
  if (!badge) return { state, unlocked: false };
  const newState = { ...state, badges: [...state.badges, badgeId], xp: state.xp + badge.xpBonus };
  return { state: newState, unlocked: true };
}

function addCardsFromQuiz(
  state: GameState,
  slug: string,
  title: string,
  trailColor: string,
  quiz: Array<{ question: string; options: string[]; correct: number; explanation: string }>,
): { state: GameState; added: number } {
  let added = 0;
  const existingIds = new Set(state.reviewCards.map(c => c.id));
  const newCards: ReviewCard[] = [];
  quiz.forEach((q, i) => {
    const id = `${slug}_q${i}`;
    if (existingIds.has(id)) return;
    newCards.push(createCard(slug, title, trailColor, i, q.question, q.options, q.correct, q.explanation));
    added += 1;
  });
  if (added === 0) return { state, added };
  return { state: { ...state, reviewCards: [...state.reviewCards, ...newCards] }, added };
}

export interface CompleteModuleInput {
  slug: string;
  title: string;
  trailColor: string;
  readTime: number;
  quiz: Array<{ question: string; options: string[]; correct: number; explanation: string }>;
  /** Proporção do quiz acertada (0..1). Se omitido, assume 1 (100% base + bonus). */
  quizScore?: number;
}

export function completeModule(input: CompleteModuleInput): CompleteModuleResult {
  let state = loadState();
  state = checkStreak(state);

  const { slug, title, trailColor, readTime, quiz } = input;
  const isRevisit = state.completedModules.includes(slug);
  const newBadges: string[] = [];

  // Encontra o módulo no currículo
  let moduleXP = 30;
  for (const trail of CURRICULUM) {
    const mod = trail.modules.find(m => m.slug === slug);
    if (mod) { moduleXP = mod.xp; break; }
  }

  // Marca streak
  state = touchStreak(state);

  // Adiciona XP — 70% base garantido + 30% proporcional ao quiz score
  let leveledUp = false;
  let newLevel = state.level;
  let xpGained: number;
  if (isRevisit) {
    xpGained = 5;
  } else {
    const baseXP = Math.round(moduleXP * 0.7);
    const bonusXP = Math.round(moduleXP * 0.3 * (input.quizScore ?? 1));
    xpGained = baseXP + bonusXP;
  }
  ({ state, leveledUp, newLevel } = addXP(state, xpGained));

  // Marca módulo como completo
  if (!isRevisit) {
    state = { ...state, completedModules: [...state.completedModules, slug], totalStudyTime: state.totalStudyTime + readTime };
  }

  // Adiciona cards SRS
  const { state: afterCards, added: cardsAdded } = addCardsFromQuiz(state, slug, title, trailColor, quiz);
  state = afterCards;

  // Registra estudo do dia
  state = recordStudyDay(state, {
    minutes: isRevisit ? 0 : readTime,
    xpEarned: xpGained,
    modulesCompleted: isRevisit ? 0 : 1,
  });

  // Badge: primeiro passo
  if (state.completedModules.length === 1) {
    const r = unlockBadge(state, 'first_step');
    if (r.unlocked) { state = r.state; newBadges.push('first_step'); }
  }

  // Badge: revisita
  if (isRevisit) {
    const r = unlockBadge(state, 'curious');
    if (r.unlocked) { state = r.state; newBadges.push('curious'); }
  }

  // Badge: speed run (3 módulos no dia)
  const todayCount = state.studyDays.find(d => d.date === todayISO())?.modulesCompleted ?? 0;
  if (todayCount >= 3) {
    const r = unlockBadge(state, 'speed_run');
    if (r.unlocked) { state = r.state; newBadges.push('speed_run'); }
  }

  // Badges de streak
  if (state.streak >= 3) {
    const r = unlockBadge(state, 'streak_3');
    if (r.unlocked) { state = r.state; newBadges.push('streak_3'); }
  }
  if (state.streak >= 7) {
    const r = unlockBadge(state, 'streak_7');
    if (r.unlocked) { state = r.state; newBadges.push('streak_7'); }
  }
  if (state.streak >= 30) {
    const r = unlockBadge(state, 'streak_30');
    if (r.unlocked) { state = r.state; newBadges.push('streak_30'); }
  }
  if (state.streak >= 60) {
    const r = unlockBadge(state, 'streak_60');
    if (r.unlocked) { state = r.state; newBadges.push('streak_60'); }
  }

  // Badges de volume de módulos
  if (state.completedModules.length >= 25) {
    const r = unlockBadge(state, 'modules_25');
    if (r.unlocked) { state = r.state; newBadges.push('modules_25'); }
  }
  if (state.completedModules.length >= 75) {
    const r = unlockBadge(state, 'modules_75');
    if (r.unlocked) { state = r.state; newBadges.push('modules_75'); }
  }

  // Badge: maratonista (5 módulos em 1 dia)
  const todayCountMarathon = state.studyDays.find(d => d.date === todayISO())?.modulesCompleted ?? 0;
  if (todayCountMarathon >= 5) {
    const r = unlockBadge(state, 'marathon');
    if (r.unlocked) { state = r.state; newBadges.push('marathon'); }
  }

  // Badges de trilha completa
  let completedTrailCount = 0;
  for (const trail of CURRICULUM) {
    const allDone = trail.modules.every(m => state.completedModules.includes(m.slug));
    if (allDone) {
      completedTrailCount += 1;
      const badgeId = `${trail.id}_done`;
      const r = unlockBadge(state, badgeId);
      if (r.unlocked) { state = r.state; newBadges.push(badgeId); }
    }
  }

  // Badges de múltiplas trilhas completas
  if (completedTrailCount >= 2) {
    const r = unlockBadge(state, 'two_trails_done');
    if (r.unlocked) { state = r.state; newBadges.push('two_trails_done'); }
  }
  if (completedTrailCount >= 5) {
    const r = unlockBadge(state, 'five_trails_done');
    if (r.unlocked) { state = r.state; newBadges.push('five_trails_done'); }
  }

  // Badge: tudo completo
  const allTrailsDone = CURRICULUM.every(trail =>
    trail.modules.every(m => state.completedModules.includes(m.slug))
  );
  if (allTrailsDone) {
    const r = unlockBadge(state, 'all_done');
    if (r.unlocked) { state = r.state; newBadges.push('all_done'); }
  }

  saveState(state);
  return { xpGained, newBadges, leveledUp, newLevel, cardsAdded };
}

export function saveQuizScore(slug: string, score: number, total: number) {
  let state = loadState();
  const perfect = score === total;
  state = { ...state, quizScores: { ...state.quizScores, [slug]: { score, total, perfect } } };

  if (perfect) {
    const r = unlockBadge(state, 'quiz_perfect');
    if (r.unlocked) state = r.state;

    // Contagem acumulada de quizzes perfeitos
    const perfectCount = Object.values(state.quizScores).filter(s => s.perfect).length;
    if (perfectCount >= 5) {
      const r5 = unlockBadge(state, 'perfect_5');
      if (r5.unlocked) state = r5.state;
    }
    if (perfectCount >= 20) {
      const r20 = unlockBadge(state, 'perfect_20');
      if (r20.unlocked) state = r20.state;
    }
  }

  saveState(state);
}

export interface ReviewCardResult {
  newBadges: string[];
  xpGained: number;
  nextDueDate: string;
  remainingDue: number;
}

export function submitCardReview(cardId: string, outcome: ReviewQuality): ReviewCardResult {
  let state = loadState();
  state = checkStreak(state);

  const idx = state.reviewCards.findIndex(c => c.id === cardId);
  if (idx < 0) {
    return { newBadges: [], xpGained: 0, nextDueDate: todayISO(), remainingDue: 0 };
  }

  const card = state.reviewCards[idx];
  const updated = reviewCard(card, outcome);
  const newCards = [...state.reviewCards];
  newCards[idx] = updated;
  state = { ...state, reviewCards: newCards };

  // Reward: +2 XP acerto simples, +4 fácil, +1 difícil, 0 erro
  const xpMap: Record<ReviewQuality, number> = { again: 0, hard: 1, good: 2, easy: 4 };
  const xpGained = xpMap[outcome];

  // Streak conta review como atividade válida
  state = touchStreak(state);

  // Log study day
  state = recordStudyDay(state, { cardsReviewed: 1, xpEarned: xpGained, minutes: 1 });

  const newBadges: string[] = [];
  if (xpGained > 0) {
    const r = addXP(state, xpGained);
    state = r.state;
  }

  state = { ...state, lastReviewDate: todayISO() };

  // Badge de streak de review (7 dias seguidos revisando)
  if (state.streak >= 7) {
    const r = unlockBadge(state, 'streak_7');
    if (r.unlocked) { state = r.state; newBadges.push('streak_7'); }
  }

  // Badges de volume de cards revisados
  const totalCardsReviewed = state.studyDays.reduce((acc, d) => acc + d.cardsReviewed, 0);
  if (totalCardsReviewed >= 50) {
    const r = unlockBadge(state, 'cards_50');
    if (r.unlocked) { state = r.state; newBadges.push('cards_50'); }
  }
  if (totalCardsReviewed >= 200) {
    const r = unlockBadge(state, 'cards_200');
    if (r.unlocked) { state = r.state; newBadges.push('cards_200'); }
  }

  saveState(state);

  return {
    newBadges,
    xpGained,
    nextDueDate: updated.dueDate,
    remainingDue: getDueCards(state.reviewCards).length,
  };
}

export function setDailyGoal(goal: number) {
  const state = loadState();
  saveState({ ...state, dailyGoal: Math.max(1, Math.min(20, Math.round(goal))) });
}

export function recordArticleVisit(meta: Omit<LastArticle, 'at' | 'progress'> & { progress?: number }) {
  const state = loadState();
  const existingProgress = state.articleProgress[meta.slug] ?? 0;
  const progress = Math.max(existingProgress, meta.progress ?? 0.02);
  const lastArticle: LastArticle = {
    ...meta,
    progress,
    at: new Date().toISOString(),
  };
  saveState({
    ...state,
    lastArticle,
    articleProgress: { ...state.articleProgress, [meta.slug]: progress },
  });
}

export function updateArticleProgress(slug: string, progress: number) {
  const state = loadState();
  const clamped = Math.max(0, Math.min(1, progress));
  const existing = state.articleProgress[slug] ?? 0;
  if (clamped <= existing + 0.01) return;
  const next: GameState = {
    ...state,
    articleProgress: { ...state.articleProgress, [slug]: clamped },
  };
  if (state.lastArticle && state.lastArticle.slug === slug) {
    next.lastArticle = { ...state.lastArticle, progress: clamped, at: new Date().toISOString() };
  }
  saveState(next);
}

export function completeOnboarding(preferredHub: string | null) {
  const state = loadState();
  saveState({
    ...state,
    onboardedAt: new Date().toISOString(),
    preferredHub,
  });
}

export function setPreferredHub(preferredHub: string | null) {
  const state = loadState();
  saveState({ ...state, preferredHub });
}

// Todas as trilhas liberadas — o leitor escolhe por onde começa
export function isTrailUnlocked(_trailId: string): boolean {
  return true;
}

export { LEVELS, getLevelInfo, getDueCards, todayISO, isoDate };
