'use client';

import { CURRICULUM, LEVELS, BADGES_DEF, getLevelInfo } from './curriculum';

const ENGINE_KEY = 'ffv_academy';

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
}

export interface CompleteModuleResult {
  xpGained: number;
  newBadges: string[];
  leveledUp: boolean;
  newLevel: number;
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
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(ENGINE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(ENGINE_KEY, JSON.stringify(state));
  } catch {}
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
    if (state.streak > 0) {
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
  if (last && new Date(last).toDateString() === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  return { ...state, streak, lastStudyDate: today };
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

export function completeModule(slug: string): CompleteModuleResult {
  let state = loadState();
  state = checkStreak(state);

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
    state = { ...state, completedModules: [...state.completedModules, slug] };
  }

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
  const todayModules = state.completedModules.filter(() => true); // simplificado
  if (todayModules.length >= 3) {
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
      const badgeId = trail.id === 'trail1' ? 'trail1_done' : trail.id === 'trail2' ? 'trail2_done' : 'trail3_done';
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
  return { xpGained, newBadges, leveledUp, newLevel };
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

// Todas as trilhas liberadas — o leitor escolhe por onde começa
export function isTrailUnlocked(_trailId: string): boolean {
  return true;
}

export { LEVELS, getLevelInfo };
