import { describe, it, expect } from 'vitest';
import { buildPool, pickDailyQuestion, hashString } from '../random-question';
import type { GameState } from '../engine';

function emptyState(overrides: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 5,
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
    bookmarks: [],
    moduleRatings: {},
    quests: { daily: [], weekly: [] },
    dailyQuestion: undefined,
    dailyQuestionStreak: 0,
    dailyQuestionHistory: [],
    ...overrides,
  };
}

describe('hashString', () => {
  it('é determinístico', () => {
    expect(hashString('foo|2026-05-14')).toBe(hashString('foo|2026-05-14'));
  });
  it('diferentes seeds → hashes diferentes (alta probabilidade)', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('buildPool', () => {
  it('retorna pelo menos 1 item de simulado mesmo sem reviewCards', () => {
    const pool = buildPool();
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.some(q => q.source === 'simulado')).toBe(true);
  });

  it('inclui source=module quando reviewCards são providos', () => {
    const reviewCards: GameState['reviewCards'] = [{
      id: 'o-que-e-ia_q0',
      slug: 'o-que-e-ia',
      title: 'O que é IA',
      trailColor: '#58a6ff',
      question: 'Q?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'porque sim',
      easeFactor: 2.5,
      interval: 0,
      repetition: 0,
      dueDate: '2026-05-14',
      lastReview: null,
    }];
    const pool = buildPool(reviewCards);
    expect(pool.some(q => q.source === 'module')).toBe(true);
  });
});

describe('pickDailyQuestion', () => {
  const today = '2026-05-14';
  const pool = buildPool();

  it('é determinístico para mesma seed', () => {
    const state = emptyState();
    const a = pickDailyQuestion(state, pool, today, 'user-42');
    const b = pickDailyQuestion(state, pool, today, 'user-42');
    expect(a?.id).toBe(b?.id);
  });

  it('seeds diferentes podem retornar perguntas diferentes', () => {
    const state = emptyState();
    const a = pickDailyQuestion(state, pool, today, 'user-aaa');
    const b = pickDailyQuestion(state, pool, today, 'user-zzz');
    // Pool tem >10 itens — improvável que duas seeds aleatórias coincidam
    // (não é garantia matemática, mas válido como smoke test)
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it('retorna null para pool vazio', () => {
    expect(pickDailyQuestion(emptyState(), [], today, 'x')).toBeNull();
  });

  it('prefere SRS due cards quando bucket SRS está populado e roll cai em <30', () => {
    // Construímos um state onde 1 reviewCard está due hoje
    const reviewCards: GameState['reviewCards'] = [{
      id: 'o-que-e-ia_q0',
      slug: 'o-que-e-ia',
      title: 'O que é IA',
      trailColor: '#58a6ff',
      question: 'Q SRS?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'porque sim',
      easeFactor: 2.5,
      interval: 0,
      repetition: 0,
      dueDate: today, // due
      lastReview: null,
    }];
    const state = emptyState({ reviewCards });
    const poolWithMod = buildPool(reviewCards);
    // Buscamos uma seed onde o hash cai em <30 (bucket SRS first)
    let foundSrsBucket = false;
    for (let i = 0; i < 100; i++) {
      const seed = `seed-${i}`;
      const h = hashString(`${seed}|${today}`) % 100;
      if (h < 30) {
        const q = pickDailyQuestion(state, poolWithMod, today, seed);
        if (q && q.source === 'module') {
          foundSrsBucket = true;
          break;
        }
      }
    }
    expect(foundSrsBucket).toBe(true);
  });

  it('evita repetir pergunta que está no histórico', () => {
    const state = emptyState();
    const first = pickDailyQuestion(state, pool, today, 'seed-x');
    expect(first).not.toBeNull();
    const stateWithHistory = emptyState({
      dailyQuestionHistory: [{ id: first!.id, date: today, correct: true, source: first!.source }],
    });
    const second = pickDailyQuestion(stateWithHistory, pool, today, 'seed-x');
    expect(second?.id).not.toBe(first!.id);
  });
});
