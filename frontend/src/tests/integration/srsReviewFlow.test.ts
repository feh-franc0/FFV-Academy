/**
 * Integração — fluxo de revisão SRS.
 *
 * Usuário completa um módulo (gera cards) → revisa um card com outcome 'good'
 * → algoritmo SM-2 reagenda card para o futuro.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { completeModule, submitCardReview, loadState } from '../../lib/engine';
import { todayISO } from '../../lib/srs';

beforeEach(() => localStorage.clear());

const MOD = {
  slug: 'o-que-e-ia', title: 'O que é IA?', trailColor: '#58a6ff',
  readTime: 6,
  quiz: [
    { question: 'Q1', options: ['A', 'B'], correct: 0, explanation: '' },
    { question: 'Q2', options: ['A', 'B'], correct: 1, explanation: '' },
  ],
};

describe('SRS — review flow', () => {
  it('review good/easy/hard incrementa XP, reagenda futuro', () => {
    completeModule({ ...MOD, quizScore: 1.0 });
    const state = loadState();
    const card = state.reviewCards[0];
    expect(card).toBeTruthy();

    const r = submitCardReview(card.id, 'good');
    expect(r.xpGained).toBeGreaterThan(0);
    // Usa todayISO() (local) pra bater com a fonte usada pelo srs.ts — evita
    // timezone gotcha onde UTC já rolou pro dia seguinte enquanto local ainda é hoje.
    expect(r.nextDueDate > todayISO()).toBe(true);
  });

  it('review again não incrementa XP', () => {
    completeModule({ ...MOD, quizScore: 1.0 });
    const card = loadState().reviewCards[0];
    const r = submitCardReview(card.id, 'again');
    expect(r.xpGained).toBe(0);
  });

  it('cards_50 é concedido quando user atinge 50 cards reviewed', () => {
    completeModule({ ...MOD, quizScore: 1.0 });
    // Simulamos 50 cards revisados manipulando studyDays diretamente
    const state = loadState();
    state.studyDays = [{
      date: new Date().toISOString().slice(0, 10),
      minutes: 30, xpEarned: 100, cardsReviewed: 50, modulesCompleted: 0,
    }];
    localStorage.setItem('ffv_academy', require('lz-string').compress(JSON.stringify(state)));

    const card = loadState().reviewCards[0];
    const r = submitCardReview(card.id, 'good');
    expect(r.newBadges).toContain('cards_50');
  });

  it('review de card inexistente retorna resultado vazio', () => {
    const r = submitCardReview('card-inexistente', 'good');
    expect(r.xpGained).toBe(0);
    expect(r.newBadges).toEqual([]);
  });
});
