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

export interface GameState {
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
}

export interface CompleteModuleResult {
  xpGained: number;
  newBadges: string[];
  leveledUp: boolean;
  newLevel: number;
  cardsAdded: number;
}

const DEFAULT_STATE: GameState = {
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
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(ENGINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration: merge with defaults so new fields exist on old states
      return {
        ...DEFAULT_STATE,
        ...parsed,
        reviewCards: Array.isArray(parsed.reviewCards) ? parsed.reviewCards : [],
        studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
        freezes: typeof parsed.freezes === 'number' ? parsed.freezes : 0,
        dailyGoal: typeof parsed.dailyGoal === 'number' ? parsed.dailyGoal : 3,
        lastReviewDate: typeof parsed.lastReviewDate === 'string' ? parsed.lastReviewDate : null,
      };
    }
  } catch {}
  return { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(ENGINE_KEY, JSON.stringify(state));
  } catch {}
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

  // Adiciona XP
  let leveledUp = false;
  let newLevel = state.level;
  const xpGained = isRevisit ? 5 : moduleXP;
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

  // Badges de trilha completa
  for (const trail of CURRICULUM) {
    const allDone = trail.modules.every(m => state.completedModules.includes(m.slug));
    if (allDone) {
      const badgeId = `${trail.id}_done`;
      const r = unlockBadge(state, badgeId);
      if (r.unlocked) { state = r.state; newBadges.push(badgeId); }
    }
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
  const state = loadState();
  const perfect = score === total;
  const updated = {
    ...state,
    quizScores: { ...state.quizScores, [slug]: { score, total, perfect } },
  };

  if (perfect) {
    const r = unlockBadge(updated, 'quiz_perfect');
    saveState(r.unlocked ? r.state : updated);
  } else {
    saveState(updated);
  }
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

// Todas as trilhas liberadas — o leitor escolhe por onde começa
export function isTrailUnlocked(_trailId: string): boolean {
  return true;
}

export { LEVELS, getLevelInfo, getDueCards, todayISO, isoDate };
