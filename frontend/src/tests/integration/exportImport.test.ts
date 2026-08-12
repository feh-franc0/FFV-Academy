/**
 * Integração — export/import de progresso.
 *
 * Usuário clica "Exportar" → baixa JSON → reimporta mais tarde (outro device).
 * Garantimos que o estado é preservado através do roundtrip.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  completeModule, exportState, importState, loadState, saveQuizScore,
} from '../../lib/engine';

beforeEach(() => localStorage.clear());

describe('Export/Import — preservação de estado', () => {
  it('round-trip preserva XP, badges, streaks, cards, quizScores', async () => {
    // Popula o estado com dados variados
    completeModule({
      slug: 'o-que-e-ia', title: 'O que é IA?', trailColor: '#58a6ff',
      readTime: 6, quiz: [], quizScore: 1.0,
    });
    saveQuizScore('o-que-e-ia', 3, 3);

    completeModule({
      slug: 'dados-o-combustivel', title: 'Dados', trailColor: '#58a6ff',
      readTime: 5, quiz: [], quizScore: 0.5,
    });

    const before = loadState();
    const exported = exportState();

    // Wipe e importa
    localStorage.clear();
    const result = await importState(exported);
    expect(result.ok).toBe(true);

    const after = loadState();
    expect(after.xp).toBe(before.xp);
    expect(after.completedModules).toEqual(before.completedModules);
    expect(after.quizScores).toEqual(before.quizScores);
    expect(after.badges).toEqual(before.badges);
    expect(after.streak).toBe(before.streak);
  });

  it('import de arquivo inválido mantém estado anterior intacto', async () => {
    completeModule({
      slug: 'o-que-e-ia', title: 'O que é IA?', trailColor: '#58a6ff',
      readTime: 6, quiz: [], quizScore: 1.0,
    });
    const xpBefore = loadState().xp;

    const result = await importState('{"xp": "invalido"}');
    expect(result.ok).toBe(false);

    // Estado NÃO foi sobrescrito
    expect(loadState().xp).toBe(xpBefore);
  });

  it('import com campos novos (upgrade v1→v2) aceita e preenche defaults', async () => {
    // Simula export de uma versão anterior sem perfectQuizStreak/earlyMorningDays/trailStartedAt
    const legacy = JSON.stringify({
      schemaVersion: 1, xp: 50, level: 1, streak: 0, lastStudyDate: null,
      completedModules: [], quizScores: {}, badges: [], totalStudyTime: 0,
      startedAt: null, reviewCards: [], archivedCards: [], studyDays: [],
      freezes: 0, dailyGoal: 3, lastReviewDate: null, lastArticle: null,
      preferredHub: null, onboardedAt: null, articleProgress: {},
    });
    const result = await importState(legacy);
    expect(result.ok).toBe(true);
    const state = loadState();
    expect(state.perfectQuizStreak).toBe(0);
    expect(state.earlyMorningDays).toEqual([]);
    expect(state.trailStartedAt).toEqual({});
    expect(state.xp).toBe(50);
  });
});
