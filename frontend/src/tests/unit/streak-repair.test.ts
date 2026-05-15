import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectStreakBreak,
  repairStreak,
  markRepairModalSeen,
  REPAIR_COST_XP,
  __resetStreakRepairForTests,
} from '@/lib/streak-repair';
import { loadState } from '@/lib/engine';

const GAME_KEY = 'ffv_academy';

function seedGameState(overrides: Partial<{ xp: number; streak: number; lastStudyDate: string | null }> = {}) {
  // Grava state em JSON puro (loadState aceita compressed E plain — primeiro char `{` curto-circuita decompress).
  const base = {
    schemaVersion: 5,
    xp: 100,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    completedModules: [],
    quizScores: {},
    badges: [],
    totalStudyTime: 0,
    startedAt: new Date().toISOString(),
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
    bookmarks: [],
    moduleRatings: {},
    quests: { daily: [], weekly: [] },
    dailyQuestionStreak: 0,
    dailyQuestionHistory: [],
    ...overrides,
  };
  localStorage.setItem(GAME_KEY, JSON.stringify(base));
}

describe('streak-repair', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetStreakRepairForTests();
  });

  it('snapshot persiste streak quando há streak ativa', () => {
    const status = detectStreakBreak(5, 100);
    expect(status.eligible).toBe(false);
    expect(status.reason).toBe('no-break');
    // Próxima chamada com streak=0 detecta quebra
    const next = detectStreakBreak(0, 100);
    expect(next.eligible).toBe(true);
    expect(next.brokenStreak).toBe(5);
  });

  it('não é eligível se modal já foi mostrado hoje', () => {
    detectStreakBreak(7, 100); // snapshot streak=7
    detectStreakBreak(0, 100); // primeira detecção
    markRepairModalSeen();
    const after = detectStreakBreak(0, 100);
    expect(after.eligible).toBe(false);
    expect(after.reason).toBe('already-shown');
  });

  it('não é eligível se XP insuficiente', () => {
    detectStreakBreak(3, REPAIR_COST_XP - 1); // snapshot
    const status = detectStreakBreak(0, REPAIR_COST_XP - 1);
    expect(status.eligible).toBe(false);
    expect(status.reason).toBe('no-xp');
  });

  it('repairStreak debita XP e restaura streak', () => {
    seedGameState({ xp: 50, streak: 0, lastStudyDate: null });
    // Simula snapshot anterior: estávamos com streak=8 ontem
    detectStreakBreak(8, 50); // grava snapshot
    detectStreakBreak(0, 50); // confirma elegibilidade

    const res = repairStreak();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.restoredStreak).toBe(8);
    expect(res.xpSpent).toBe(REPAIR_COST_XP);

    const after = loadState();
    expect(after.xp).toBe(50 - REPAIR_COST_XP);
    expect(after.streak).toBe(8);
  });

  it('repairStreak falha sem XP suficiente', () => {
    seedGameState({ xp: 3 });
    detectStreakBreak(4, 3);
    const res = repairStreak();
    expect(res.ok).toBe(false);
  });

  it('dismiss (markRepairModalSeen) impede reaparição no mesmo dia', () => {
    detectStreakBreak(2, 100);
    const first = detectStreakBreak(0, 100);
    expect(first.eligible).toBe(true);
    markRepairModalSeen();
    const second = detectStreakBreak(0, 100);
    expect(second.eligible).toBe(false);
  });
});
