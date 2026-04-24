'use client';

import LZString from 'lz-string';
import { CURRICULUM, LEVELS, BADGES_DEF, getLevelInfo } from './curriculum';
import { type ReviewCard, type ReviewQuality, createCard, reviewCard, getDueCards, todayISO, isoDate } from './srs';
import { GAME_CONFIG, STORAGE_KEYS } from './constants';
import { getRaw, setRaw, onStorageError } from './storage';
import { GameStateSchema, safeParseJSON } from './schemas';
import { evaluateModuleBadges, evaluateReviewBadges, evaluateQuizBadges } from './badges';

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
  archivedCards: ReviewCard[];  // cards GC'd: easeFactor > 3.0 && interval > 90
  studyDays: StudyDay[];
  freezes: number;          // 0-2 streak freezes in bank
  dailyGoal: number;        // default 3 cards/day
  lastReviewDate: string | null;
  // UX v2 (personalization + continuity)
  lastArticle: LastArticle | null;
  preferredHub: string | null;    // hub slug chosen at onboarding
  onboardedAt: string | null;     // ISO
  articleProgress: Record<string, number>; // slug → 0..1
  // v2 — counters para badges avançados
  /** Sequência atual de quizzes perfect (reseta em qualquer imperfeição). */
  perfectQuizStreak: number;
  /** Datas (YYYY-MM-DD) em que estudou antes das 6h — badge aurora. */
  earlyMorningDays: string[];
  /** Timestamp ISO do primeiro módulo de cada trilha (para badge speedrun_trail). */
  trailStartedAt: Record<string, string>;
}

const CURRENT_SCHEMA = 2;

/** Migra estado antigo (sem schemaVersion) para versão atual. */
function migrateState(parsed: Record<string, unknown>): Partial<GameState> {
  const version = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 0;
  let state = { ...parsed } as Record<string, unknown>;
  // v0 → v1: sem mudanças destrutivas, só adiciona schemaVersion
  if (version < 1) state = { ...state, schemaVersion: 1 };
  // v1 → v2: adiciona campos de tracking pra badges avançados (aurora/sniper/speedrun_trail)
  if (version < 2) {
    state = {
      ...state,
      schemaVersion: 2,
      perfectQuizStreak: typeof state.perfectQuizStreak === 'number' ? state.perfectQuizStreak : 0,
      earlyMorningDays: Array.isArray(state.earlyMorningDays) ? state.earlyMorningDays : [],
      trailStartedAt: state.trailStartedAt && typeof state.trailStartedAt === 'object' ? state.trailStartedAt : {},
    };
  }
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
  archivedCards: [],
  studyDays: [],
  freezes: 0,
  dailyGoal: 3,
  lastReviewDate: null,
  lastArticle: null,
  preferredHub: null,
  onboardedAt: null,
  articleProgress: {},
  perfectQuizStreak: 0,
  earlyMorningDays: [],
  trailStartedAt: {},
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = getRaw(STORAGE_KEYS.GAME_STATE);
    if (raw) {
      // Support both lz-string compressed (new) and plain JSON (legacy).
      // Skip decompress for plain JSON — LZString.decompress can hang on arbitrary input.
      let finalStr: string;
      if (raw.charAt(0) === '{') {
        finalStr = raw;
      } else {
        let jsonStr: string | null = null;
        try {
          jsonStr = LZString.decompress(raw);
        } catch { /* not compressed */ }
        finalStr = jsonStr || raw;
      }
      const parsed = JSON.parse(finalStr) as Record<string, unknown>;
      const migrated = migrateState(parsed);
      return {
        ...DEFAULT_STATE,
        ...migrated,
        schemaVersion: CURRENT_SCHEMA,
        reviewCards: Array.isArray(migrated.reviewCards) ? migrated.reviewCards : [],
        archivedCards: Array.isArray(migrated.archivedCards) ? migrated.archivedCards : [],
        studyDays: Array.isArray(migrated.studyDays) ? migrated.studyDays : [],
        freezes: typeof migrated.freezes === 'number' ? migrated.freezes : 0,
        dailyGoal: typeof migrated.dailyGoal === 'number' ? migrated.dailyGoal : 3,
        lastReviewDate: typeof migrated.lastReviewDate === 'string' ? migrated.lastReviewDate : null,
        lastArticle: migrated.lastArticle && typeof migrated.lastArticle === 'object' ? migrated.lastArticle as LastArticle : null,
        preferredHub: typeof migrated.preferredHub === 'string' ? migrated.preferredHub : null,
        onboardedAt: typeof migrated.onboardedAt === 'string' ? migrated.onboardedAt : null,
        articleProgress: migrated.articleProgress && typeof migrated.articleProgress === 'object' ? migrated.articleProgress as Record<string, number> : {},
        perfectQuizStreak: typeof migrated.perfectQuizStreak === 'number' ? migrated.perfectQuizStreak : 0,
        earlyMorningDays: Array.isArray(migrated.earlyMorningDays) ? migrated.earlyMorningDays : [],
        trailStartedAt: migrated.trailStartedAt && typeof migrated.trailStartedAt === 'object' ? migrated.trailStartedAt as Record<string, string> : {},
      };
    }
  } catch {}
  return { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
}

/**
 * Move SRS cards that are well-known (easeFactor > 3.0 && interval > 90 days)
 * to archivedCards, keeping reviewCards lean for daily use.
 */
function gcSRSCards(state: GameState): GameState {
  const active: ReviewCard[] = [];
  const toArchive: ReviewCard[] = [];

  for (const card of state.reviewCards) {
    if (card.easeFactor > 3.0 && card.interval > 90) {
      toArchive.push(card);
    } else {
      active.push(card);
    }
  }

  if (toArchive.length === 0) return state;

  // Merge into archivedCards, avoiding duplicates
  const archivedIds = new Set(state.archivedCards.map(c => c.id));
  const newArchived = [...state.archivedCards, ...toArchive.filter(c => !archivedIds.has(c.id))];

  return { ...state, reviewCards: active, archivedCards: newArchived };
}

let _saveErrorCallback: ((msg: string) => void) | null = null;
/** Registra callback para erros de persistência (ex: localStorage cheio). */
export function onSaveError(cb: (msg: string) => void) {
  _saveErrorCallback = cb;
  // Propaga para a camada de storage também — o adapter reporta aqui.
  onStorageError(msg => _saveErrorCallback?.(msg));
}

function saveState(state: GameState) {
  // GC well-known SRS cards before persisting
  const gc = gcSRSCards(state);
  const compressed = LZString.compress(JSON.stringify(gc));
  const ok = setRaw(STORAGE_KEYS.GAME_STATE, compressed);
  if (!ok) {
    // Fallback: retenta com dados mínimos (preserva progresso, descarta histórico pesado)
    const minimal = {
      ...gc,
      studyDays: gc.studyDays.slice(-GAME_CONFIG.FALLBACK_STUDY_DAYS_TRIM),
      reviewCards: gc.reviewCards.slice(-GAME_CONFIG.FALLBACK_CARDS_TRIM),
    };
    setRaw(STORAGE_KEYS.GAME_STATE, LZString.compress(JSON.stringify(minimal)));
  }
}

/** Exporta o estado completo como JSON string para download pelo usuário. */
export function exportState(): string {
  const state = loadState();
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

/**
 * Importa estado a partir de JSON exportado.
 *
 * Segurança:
 * - Validação estrutural via Zod (fail-closed) — campos com tipo errado rejeitam tudo.
 * - Limite de tamanho (IMPORT_STATE_MAX_BYTES) previne exhaustion.
 * - Zod `.strict()` bloqueia prototype pollution (`__proto__`, `constructor`).
 *
 * Retorna `{ ok: true }` em sucesso ou `{ ok: false, error }` com motivo.
 */
export function importState(json: string): { ok: true } | { ok: false; error: string } {
  const result = safeParseJSON<Record<string, unknown>>(
    GameStateSchema as unknown as { safeParse: (i: unknown) => { success: boolean; data?: Record<string, unknown>; error?: { message: string } } },
    json,
    GAME_CONFIG.IMPORT_STATE_MAX_BYTES,
  );
  if (!result.ok) return result;

  const next: GameState = {
    ...DEFAULT_STATE,
    ...(result.data as unknown as Partial<GameState>),
    schemaVersion: CURRENT_SCHEMA,
  };
  const ok = setRaw(STORAGE_KEYS.GAME_STATE, LZString.compress(JSON.stringify(next)));
  return ok ? { ok: true } : { ok: false, error: 'falha ao persistir' };
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

/**
 * Completa um simulado — concede XP proporcional ao score + badges específicos.
 *
 * score é 0-100. XP = score * 0.5 (ex: 80% → +40 XP; 100% → +50 XP).
 * Badges concedidos:
 * - simulado_first (primeira vez completando qualquer simulado)
 * - simulado_aws_practitioner (passou no AWS Practitioner)
 * - simulado_aws_saa (passou no AWS SAA)
 */
export function completeSimulado(input: {
  simuladoId: string;
  score: number;
  passed: boolean;
}): { xpGained: number; newBadges: string[]; leveledUp: boolean; newLevel: number } {
  let state = loadState();
  const xpGained = Math.round(input.score * 0.5);
  const prevLevel = state.level;
  const addRes = addXP(state, xpGained);
  state = addRes.state;

  const newBadges: string[] = [];

  // simulado_first
  if (!state.badges.includes('simulado_first')) {
    const firstRes = awardBadgeInState(state, 'simulado_first');
    if (firstRes.unlocked) {
      state = firstRes.state;
      newBadges.push('simulado_first');
    }
  }

  // Badges específicos por passed
  if (input.passed) {
    const passedMap: Record<string, string> = {
      'simulado-aws-practitioner': 'simulado_aws_practitioner',
      'simulado-aws-developer': 'simulado_aws_developer',
      'simulado-aws-saa': 'simulado_aws_saa',
    };
    const badgeId = passedMap[input.simuladoId];
    if (badgeId) {
      const passRes = awardBadgeInState(state, badgeId);
      if (passRes.unlocked) {
        state = passRes.state;
        newBadges.push(badgeId);
      }
    }
  }

  saveState(state);
  return {
    xpGained,
    newBadges,
    leveledUp: addRes.newLevel > prevLevel,
    newLevel: addRes.newLevel,
  };
}

/** Helper local pra awardBadge trabalhar em state (não persiste). */
function awardBadgeInState(state: GameState, badgeId: string): { state: GameState; unlocked: boolean } {
  if (state.badges.includes(badgeId)) return { state, unlocked: false };
  const def = BADGES_DEF.find(b => b.id === badgeId);
  if (!def) return { state, unlocked: false };
  return {
    state: { ...state, badges: [...state.badges, badgeId], xp: state.xp + def.xpBonus },
    unlocked: true,
  };
}

/** Desbloqueia um badge direto no estado persistido. Retorna se foi novo. */
export function awardBadge(badgeId: string): { unlocked: boolean; xpGained: number; leveledUp: boolean; newLevel: number } {
  let state = loadState();
  if (state.badges.includes(badgeId)) {
    return { unlocked: false, xpGained: 0, leveledUp: false, newLevel: state.level };
  }
  const badge = BADGES_DEF.find(b => b.id === badgeId);
  if (!badge) {
    return { unlocked: false, xpGained: 0, leveledUp: false, newLevel: state.level };
  }
  const prevLevel = state.level;
  state = { ...state, badges: [...state.badges, badgeId] };
  const addRes = addXP(state, badge.xpBonus);
  state = addRes.state;
  saveState(state);
  return {
    unlocked: true,
    xpGained: badge.xpBonus,
    leveledUp: addRes.newLevel > prevLevel,
    newLevel: addRes.newLevel,
  };
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
  /** XP bônus adicional (ex.: Módulo do Dia). Somado ao xpGained. */
  bonusXp?: number;
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
  if (input.bonusXp && input.bonusXp > 0) {
    xpGained += input.bonusXp;
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

  // Trackers específicos que exigem atualização de state ANTES da avaliação:
  state = trackTrailStart(state, slug);
  state = trackEarlyMorning(state);

  // Delega toda a avaliação de badges para o módulo `badges.ts` (puro, testável).
  const now = new Date();
  const { state: stateAfterBadges, newBadges: badgesUnlocked } = evaluateModuleBadges({
    state,
    isRevisit,
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    today: todayISO(),
    now: now.toISOString(),
  });
  state = stateAfterBadges;
  newBadges.push(...badgesUnlocked);

  saveState(state);
  return { xpGained, newBadges, leveledUp, newLevel, cardsAdded };
}

/** Registra o timestamp do primeiro módulo de uma trilha (para speedrun_trail). */
function trackTrailStart(state: GameState, slug: string): GameState {
  const trail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
  if (!trail) return state;
  if (state.trailStartedAt[trail.id]) return state;
  return {
    ...state,
    trailStartedAt: { ...state.trailStartedAt, [trail.id]: new Date().toISOString() },
  };
}

/** Adiciona `today` ao array de earlyMorningDays se hora < AURORA_HOUR_MAX. */
function trackEarlyMorning(state: GameState): GameState {
  if (new Date().getHours() >= GAME_CONFIG.AURORA_HOUR_MAX) return state;
  const today = todayISO();
  if (state.earlyMorningDays.includes(today)) return state;
  return { ...state, earlyMorningDays: [...state.earlyMorningDays, today].slice(-30) };
}

export function saveQuizScore(slug: string, score: number, total: number) {
  let state = loadState();
  const perfect = score === total;
  state = {
    ...state,
    quizScores: { ...state.quizScores, [slug]: { score, total, perfect } },
    // Sniper streak: incrementa em perfect, reseta em qualquer erro.
    perfectQuizStreak: perfect ? state.perfectQuizStreak + 1 : 0,
  };
  const { state: next } = evaluateQuizBadges({ state, perfect });
  saveState(next);
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

  const { state: stateAfterBadges, newBadges: badgesUnlocked } = evaluateReviewBadges({
    state,
    outcome,
    today: todayISO(),
  });
  state = stateAfterBadges;
  newBadges.push(...badgesUnlocked);

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
export function isTrailUnlocked(): boolean {
  return true;
}

/* ──────────────────────────────────────────────
   DAILY CHALLENGE — 1 card aleatório por dia com XP triplicado
──────────────────────────────────────────────── */

export interface DailyChallenge {
  card: ReviewCard;
  xpMultiplier: number;
  completed: boolean;
}

/**
 * Retorna o Daily Challenge do dia (determinístico por data).
 * Se o usuário não tem cards, retorna null.
 * Se já completou hoje, marca como completed.
 */
export function getDailyChallenge(): DailyChallenge | null {
  const state = loadState();
  if (state.reviewCards.length === 0) return null;

  // Hash da data → índice determinístico
  const today = todayISO();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % state.reviewCards.length;
  const card = state.reviewCards[idx];

  // Checa se o card já foi revisado hoje (dueDate mudou para o futuro)
  const completed = card.dueDate > today;

  return { card, xpMultiplier: 3, completed };
}

export { LEVELS, getLevelInfo, getDueCards, todayISO, isoDate };
