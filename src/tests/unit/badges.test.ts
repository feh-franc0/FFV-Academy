/**
 * Motor de badges — testes unitários das regras declarativas.
 *
 * Como `evaluateModuleBadges` é puro (state in → state out), os testes
 * injetam contexto controlado e não dependem do relógio/DOM.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateModuleBadges,
  evaluateReviewBadges,
  evaluateQuizBadges,
} from '../../lib/badges';
import { CURRICULUM } from '../../lib/curriculum';
import type { GameState } from '../../lib/engine';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    schemaVersion: 2,
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    completedModules: [],
    quizScores: {},
    badges: [],
    totalStudyTime: 0,
    startedAt: '2026-01-01T00:00:00.000Z',
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
    ...overrides,
  };
}

describe('evaluateModuleBadges — básicos', () => {
  it('first_step é concedido quando completou primeiro módulo', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['o-que-e-ia'] }),
      isRevisit: false,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T12:00:00Z',
    });
    expect(newBadges).toContain('first_step');
  });

  it('curious é concedido em revisita', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a', 'b'] }),
      isRevisit: true,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T12:00:00Z',
    });
    expect(newBadges).toContain('curious');
  });

  it('não concede badge já presente (idempotência)', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a'], badges: ['first_step'] }),
      isRevisit: false,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T12:00:00Z',
    });
    expect(newBadges).not.toContain('first_step');
  });
});

describe('evaluateModuleBadges — janelas de tempo', () => {
  it('early_bird em hora < 8h', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a'] }),
      isRevisit: false,
      hour: 7,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T07:00:00Z',
    });
    expect(newBadges).toContain('early_bird');
  });

  it('early_bird NÃO em 8h (limite exclusivo)', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a'] }),
      isRevisit: false,
      hour: 8,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T08:00:00Z',
    });
    expect(newBadges).not.toContain('early_bird');
  });

  it('night_owl em hora >= 22h', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a'] }),
      isRevisit: false,
      hour: 22,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T22:00:00Z',
    });
    expect(newBadges).toContain('night_owl');
  });

  it('midnight_oil em hora 2..4', () => {
    for (const hour of [2, 3, 4]) {
      const { newBadges } = evaluateModuleBadges({
        state: baseState({ completedModules: ['a'] }),
        isRevisit: false,
        hour,
        dayOfWeek: 3,
        today: '2026-04-20',
        now: '2026-04-20T03:00:00Z',
      });
      expect(newBadges).toContain('midnight_oil');
    }
  });

  it('midnight_oil NÃO em hora 5 (limite exclusivo)', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: ['a'] }),
      isRevisit: false,
      hour: 5,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T05:00:00Z',
    });
    expect(newBadges).not.toContain('midnight_oil');
  });
});

describe('evaluateModuleBadges — orphan badges implementados', () => {
  it('aurora após 3 manhãs em earlyMorningDays', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({
        completedModules: ['a'],
        earlyMorningDays: ['2026-04-18', '2026-04-19', '2026-04-20'],
      }),
      isRevisit: false,
      hour: 5,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T05:30:00Z',
    });
    expect(newBadges).toContain('aurora');
  });

  it('aurora NÃO com apenas 2 dias', () => {
    const { newBadges } = evaluateModuleBadges({
      state: baseState({
        completedModules: ['a'],
        earlyMorningDays: ['2026-04-19', '2026-04-20'],
      }),
      isRevisit: false,
      hour: 5,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T05:30:00Z',
    });
    expect(newBadges).not.toContain('aurora');
  });

  it('speedrun_trail quando trilha concluída em < 24h', () => {
    // trail1 tem módulos 'o-que-e-ia', 'dados-o-combustivel', etc.
    // Simulamos state com TODOS os módulos da trilha completos + trailStartedAt recente.
    
    const trail1 = CURRICULUM[0];
    const { newBadges } = evaluateModuleBadges({
      state: baseState({
        completedModules: trail1.modules.map((m: { slug: string }) => m.slug),
        trailStartedAt: { [trail1.id]: '2026-04-20T00:00:00Z' },
      }),
      isRevisit: false,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T20:00:00Z', // 20h depois
    });
    expect(newBadges).toContain('speedrun_trail');
  });

  it('speedrun_trail NÃO quando trilha levou > 24h', () => {
    
    const trail1 = CURRICULUM[0];
    const { newBadges } = evaluateModuleBadges({
      state: baseState({
        completedModules: trail1.modules.map((m: { slug: string }) => m.slug),
        trailStartedAt: { [trail1.id]: '2026-04-19T00:00:00Z' },
      }),
      isRevisit: false,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T20:00:00Z', // 44h depois
    });
    expect(newBadges).not.toContain('speedrun_trail');
  });
});

describe('evaluateQuizBadges — sniper streak', () => {
  it('sniper em 10 perfect quizzes seguidos', () => {
    const { newBadges } = evaluateQuizBadges({
      state: baseState({ perfectQuizStreak: 10 }),
      perfect: true,
    });
    expect(newBadges).toContain('sniper');
  });

  it('sniper NÃO em 9', () => {
    const { newBadges } = evaluateQuizBadges({
      state: baseState({ perfectQuizStreak: 9 }),
      perfect: true,
    });
    expect(newBadges).not.toContain('sniper');
  });

  it('quiz_perfect somente se perfect=true', () => {
    const fail = evaluateQuizBadges({ state: baseState(), perfect: false });
    expect(fail.newBadges).not.toContain('quiz_perfect');
    const ok = evaluateQuizBadges({
      state: baseState({ quizScores: { a: { score: 3, total: 3, perfect: true } } }),
      perfect: true,
    });
    expect(ok.newBadges).toContain('quiz_perfect');
  });
});

describe('evaluateReviewBadges', () => {
  it('cards_50 após 50 cards acumulados', () => {
    const { newBadges } = evaluateReviewBadges({
      state: baseState({
        studyDays: [{ date: '2026-04-20', minutes: 0, xpEarned: 0, cardsReviewed: 50, modulesCompleted: 0 }],
      }),
      outcome: 'good',
      today: '2026-04-20',
    });
    expect(newBadges).toContain('cards_50');
  });

  it('perfect_review NÃO dispara em outcome=again', () => {
    const { newBadges } = evaluateReviewBadges({
      state: baseState({
        studyDays: [{ date: '2026-04-20', minutes: 0, xpEarned: 0, cardsReviewed: 20, modulesCompleted: 0 }],
      }),
      outcome: 'again',
      today: '2026-04-20',
    });
    expect(newBadges).not.toContain('perfect_review');
  });
});

describe('Polyglot — 4 hubs', () => {
  it('polyglot precisa de todos os 4 hubs distintos', () => {
    
    // Pega 1 módulo de cada trilha que esteja num hub único
    const slugsFromAllHubs = CURRICULUM
      .slice(0, 15)
      .map((t: { modules: { slug: string }[] }) => t.modules[0].slug);

    const { newBadges } = evaluateModuleBadges({
      state: baseState({ completedModules: slugsFromAllHubs }),
      isRevisit: false,
      hour: 12,
      dayOfWeek: 3,
      today: '2026-04-20',
      now: '2026-04-20T12:00:00Z',
    });
    expect(newBadges).toContain('polyglot');
    expect(newBadges).toContain('explorer');
  });
});
