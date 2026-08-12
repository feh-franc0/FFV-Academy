import { describe, it, expect, vi } from 'vitest';

// engine.ts usa 'use client' — ok em Vitest, a diretiva é ignorada
// Mas depende de localStorage (jsdom fornece) e de CURRICULUM/LEVELS
import { completeModule, loadState, answerDailyQuestion, hasLocalState, restoreFromBackup, CURRENT_SCHEMA } from '../lib/engine';
import { getLevelInfo } from '../lib/curriculum';

// Módulo real do currículo (existe no CURRICULUM)
const TEST_MODULE = {
  slug: 'o-que-e-ia',
  title: 'O que é IA?',
  trailColor: '#58a6ff',
  readTime: 6,
  quiz: [
    { question: 'Q1', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'Exp1' },
    { question: 'Q2', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: 'Exp2' },
  ],
  quizScore: 1.0, // 100%
};

describe('hasLocalState / restoreFromBackup (fallback de IndexedDB)', () => {
  it('hasLocalState é false quando não há nada salvo', () => {
    localStorage.clear();
    expect(hasLocalState()).toBe(false);
  });

  it('hasLocalState é true depois de completeModule salvar', () => {
    localStorage.clear();
    completeModule({ ...TEST_MODULE, slug: 'hls-teste' });
    expect(hasLocalState()).toBe(true);
  });

  it('restoreFromBackup grava um estado (do IndexedDB) e loadState o lê de volta', () => {
    localStorage.clear();
    expect(hasLocalState()).toBe(false);

    const backup = {
      ...loadState(),
      xp: 4242,
      completedModules: ['recuperado-do-idb'],
      schemaVersion: CURRENT_SCHEMA,
    };
    restoreFromBackup(backup);

    expect(hasLocalState()).toBe(true);
    const restored = loadState();
    expect(restored.xp).toBe(4242);
    expect(restored.completedModules).toContain('recuperado-do-idb');
  });
});

describe('completeModule', () => {
  it('estado inicial começa zerado', () => {
    const state = loadState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.completedModules).toEqual([]);
    expect(state.badges).toEqual([]);
  });

  it('completa um módulo e concede XP', () => {
    const result = completeModule(TEST_MODULE);
    expect(result.xpGained).toBeGreaterThan(0);
    expect(result.persisted).toBe(true);

    const state = loadState();
    expect(state.xp).toBeGreaterThan(0);
    expect(state.completedModules).toContain(TEST_MODULE.slug);
  });

  it('persisted é false quando o localStorage falha (quota estourada) — não reporta sucesso falso', () => {
    localStorage.clear();
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('exceeded quota', 'QuotaExceededError');
      });

    const result = completeModule({ ...TEST_MODULE, slug: 'quota-teste' });
    expect(result.persisted).toBe(false);
    // xp/badges continuam calculados em memória (usados só para decidir a
    // mensagem de erro) — o que muda é que ConcluirModulo não pode afirmar
    // "concluído" com base neles.
    expect(result.xpGained).toBeGreaterThan(0);

    setItemSpy.mockRestore();
  });

  it('concede badge first_step na primeira conclusão', () => {
    const result = completeModule(TEST_MODULE);
    expect(result.newBadges).toContain('first_step');
  });

  it('não concede first_step duas vezes', () => {
    completeModule(TEST_MODULE);
    const result2 = completeModule({
      ...TEST_MODULE,
      slug: 'dados-o-combustivel',
      title: 'Dados',
    });
    expect(result2.newBadges).not.toContain('first_step');
  });

  it('revisita módulo concede apenas 5 XP', () => {
    completeModule(TEST_MODULE);
    const result2 = completeModule(TEST_MODULE);
    expect(result2.xpGained).toBe(5);
  });

  it('não duplica módulo em completedModules na revisita', () => {
    completeModule(TEST_MODULE);
    completeModule(TEST_MODULE);
    const state = loadState();
    const count = state.completedModules.filter(s => s === TEST_MODULE.slug).length;
    expect(count).toBe(1);
  });

  it('XP com quiz 50% é menor que com 100%', () => {
    const r1 = completeModule({ ...TEST_MODULE, quizScore: 0.5 });
    localStorage.clear();
    const r2 = completeModule({ ...TEST_MODULE, quizScore: 1.0 });
    expect(r2.xpGained).toBeGreaterThan(r1.xpGained);
  });

  it('adiciona cards SRS após primeira conclusão', () => {
    const result = completeModule(TEST_MODULE);
    expect(result.cardsAdded).toBe(TEST_MODULE.quiz.length);
    const state = loadState();
    expect(state.reviewCards.length).toBe(TEST_MODULE.quiz.length);
  });

  it('streak é incrementado no primeiro dia de estudo', () => {
    completeModule(TEST_MODULE);
    const state = loadState();
    expect(state.streak).toBe(1);
  });

  it('freeze é concedido a cada 7 dias de streak', () => {
    // Simula streak de 6 para verificar que não ganha freeze ainda
    const s = loadState();
    localStorage.setItem(
      'ffv_academy',
      JSON.stringify({
        ...s,
        streak: 6,
        lastStudyDate: new Date(Date.now() - 86_400_000).toDateString(),
        freezes: 0,
      }),
    );
    completeModule(TEST_MODULE);
    const after = loadState();
    // streak 7 → deve ganhar 1 freeze
    expect(after.streak).toBe(7);
    expect(after.freezes).toBe(1);
  });
});

describe('migrateState v3 → v6', () => {
  it('preserva campos antigos e adiciona dailyQuestionStreak/History e questsClaimedAt', () => {
    localStorage.clear();
    const legacy = {
      schemaVersion: 3,
      xp: 100,
      level: 2,
      completedModules: ['m1'],
      bookmarks: ['m1'],
      moduleRatings: { m1: 1 },
    };
    localStorage.setItem('ffv_academy', JSON.stringify(legacy));
    const state = loadState();
    expect(state.xp).toBe(100);
    expect(state.completedModules).toContain('m1');
    expect(state.bookmarks).toContain('m1');
    expect(state.schemaVersion).toBe(6);
    expect(state.dailyQuestionStreak).toBe(0);
    expect(state.dailyQuestionHistory).toEqual([]);
    expect(state.quests).toEqual({ daily: [], weekly: [] });
    expect(state.questsClaimedAt).toEqual({});
  });
});

describe('answerDailyQuestion', () => {
  it('acerto soma 5 XP, incrementa streak, registra no histórico', () => {
    localStorage.clear();
    const result = answerDailyQuestion({
      questionId: 'sim_x_q1',
      answeredId: 'A',
      correctId: 'A',
      source: 'simulado',
      stem: 'Stem?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'porque',
      topic: 'IAM',
    });
    expect(result.correct).toBe(true);
    expect(result.xpGained).toBe(5);
    expect(result.streak).toBe(1);
    const state = loadState();
    expect(state.dailyQuestion?.correct).toBe(true);
    expect(state.dailyQuestionHistory?.length).toBe(1);
  });

  it('erro soma 1 XP, reseta streak, cria card SRS', () => {
    localStorage.clear();
    const before = loadState();
    expect(before.reviewCards.length).toBe(0);
    const result = answerDailyQuestion({
      questionId: 'sim_x_q1',
      answeredId: 'B',
      correctId: 'A',
      source: 'simulado',
      stem: 'Stem?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'porque',
      topic: 'IAM',
    });
    expect(result.correct).toBe(false);
    expect(result.xpGained).toBe(1);
    expect(result.streak).toBe(0);
    const state = loadState();
    expect(state.reviewCards.length).toBe(1);
  });

  it('idempotente: segunda chamada no mesmo dia não muda XP', () => {
    localStorage.clear();
    answerDailyQuestion({
      questionId: 'sim_x_q1',
      answeredId: 'A',
      correctId: 'A',
      source: 'simulado',
      stem: 'S',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: '',
      topic: 't',
    });
    const xpAfterFirst = loadState().xp;
    const second = answerDailyQuestion({
      questionId: 'sim_x_q1',
      answeredId: 'A',
      correctId: 'A',
      source: 'simulado',
      stem: 'S',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: '',
      topic: 't',
    });
    expect(second.xpGained).toBe(0);
    expect(loadState().xp).toBe(xpAfterFirst);
  });
});

describe('getLevelInfo', () => {
  it('nível 1 começa no XP 0', () => {
    const info = getLevelInfo(0);
    expect(info.level).toBe(1);
  });

  it('XP 100 já é nível 2', () => {
    const info = getLevelInfo(100);
    expect(info.level).toBe(2);
  });

  it('XP 5500 é nível 10 (Principal Engineer)', () => {
    const info = getLevelInfo(5500);
    expect(info.level).toBe(10);
  });

  it('XP altíssimo cai no último nível', () => {
    const info = getLevelInfo(99999);
    expect(info.level).toBe(12); // Distinguished Engineer
  });
});
