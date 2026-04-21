/**
 * Integração — fluxo de quiz completo.
 *
 * Simula o que acontece quando um usuário:
 * 1. Responde um quiz
 * 2. Submete (saveQuizScore + completeModule em sequência)
 * 3. Eventualmente ganha badges e progride de nível
 *
 * Não testa UI; testa a cadeia engine → badges → storage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { completeModule, saveQuizScore, loadState } from '../../lib/engine';
import { CURRICULUM } from '../../lib/curriculum';

const TEST_MODULE = {
  slug: 'o-que-e-ia',
  title: 'O que é IA?',
  trailColor: '#58a6ff',
  readTime: 6,
  quiz: [
    { question: 'Q1', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: '' },
    { question: 'Q2', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: '' },
    { question: 'Q3', options: ['A', 'B', 'C', 'D'], correct: 2, explanation: '' },
  ],
};

describe('Fluxo quiz completo', () => {
  beforeEach(() => localStorage.clear());

  it('quiz perfeito → save score → complete module → quiz_perfect badge', () => {
    saveQuizScore(TEST_MODULE.slug, 3, 3);
    const result = completeModule({ ...TEST_MODULE, quizScore: 1.0 });

    const state = loadState();
    expect(state.badges).toContain('quiz_perfect');
    expect(state.badges).toContain('first_step');
    expect(result.cardsAdded).toBe(3);
  });

  it('quiz imperfeito reseta perfectQuizStreak', () => {
    saveQuizScore(TEST_MODULE.slug, 3, 3);
    expect(loadState().perfectQuizStreak).toBe(1);

    saveQuizScore('outro-modulo', 1, 3);
    expect(loadState().perfectQuizStreak).toBe(0);
  });

  it('10 perfect quizzes seguidos → sniper badge', () => {
    for (let i = 0; i < 10; i++) {
      saveQuizScore(`mod-${i}`, 3, 3);
    }
    const state = loadState();
    expect(state.perfectQuizStreak).toBe(10);
    expect(state.badges).toContain('sniper');
  });

  it('trailStartedAt é registrado no primeiro módulo da trilha', () => {
    completeModule({ ...TEST_MODULE, quizScore: 1.0 });
    const state = loadState();
    expect(state.trailStartedAt['trail1']).toBeTruthy();

    // Completar outro módulo da MESMA trilha não sobrescreve
    const firstStart = state.trailStartedAt['trail1'];
    completeModule({
      ...TEST_MODULE,
      slug: 'dados-o-combustivel',
      title: 'Dados',
    });
    expect(loadState().trailStartedAt['trail1']).toBe(firstStart);
  });

  it('módulo do dia (daily) + time-attack bônus XP são somados', () => {
    const r = completeModule({
      ...TEST_MODULE,
      quizScore: 1.0,
      bonusXp: 25 + 30, // Daily + TimeAttack
    });
    // xpGained reflete base + bonus
    const baseModuleXp = CURRICULUM.flatMap(t => t.modules).find(m => m.slug === TEST_MODULE.slug)?.xp ?? 30;
    const expected = Math.round(baseModuleXp * 0.7) + Math.round(baseModuleXp * 0.3) + 55;
    expect(r.xpGained).toBe(expected);
  });
});

describe('Fluxo level up', () => {
  beforeEach(() => localStorage.clear());

  it('acumular XP suficiente → level up → leveledUp=true', () => {
    // Precisa ~100 XP pra nível 2
    const modules = CURRICULUM[0].modules.slice(0, 5);
    let leveledUp = false;
    for (const m of modules) {
      const r = completeModule({
        slug: m.slug, title: m.title, trailColor: '#58a6ff',
        readTime: m.readTime, quiz: [], quizScore: 1.0,
      });
      if (r.leveledUp) leveledUp = true;
    }
    expect(leveledUp).toBe(true);
  });
});
