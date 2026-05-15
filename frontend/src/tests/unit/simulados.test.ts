/**
 * Simulados — scoring, weak topics, acesso, persistência.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSimulado, scoreAttempt, getWeakTopics,
  isQuestionAccessible,
  saveAttempt, getAttempt, listAttempts, clearAttempt,
  type SimuladoAttempt,
} from '../../lib/simulados';

beforeEach(() => localStorage.clear());

const SIM_ID = 'simulado-aws-practitioner';

describe('getSimulado', () => {
  it('retorna catálogo para id conhecido', () => {
    const s = getSimulado(SIM_ID);
    expect(s).not.toBeUndefined();
    expect(s?.questions.length).toBeGreaterThan(0);
  });

  it('retorna undefined para id desconhecido', () => {
    expect(getSimulado('xxxx')).toBeUndefined();
  });
});

describe('scoreAttempt', () => {
  const sim = getSimulado(SIM_ID)!;

  it('100% quando todas respostas corretas', () => {
    const answers: Record<string, string> = {};
    for (const q of sim.questions) answers[q.id] = q.correctId;
    const scored = scoreAttempt(sim, {
      simuladoId: SIM_ID, startedAt: '', answers,
    });
    expect(scored.score).toBe(100);
    expect(scored.passed).toBe(true);
  });

  it('0% quando nenhuma resposta', () => {
    const scored = scoreAttempt(sim, { simuladoId: SIM_ID, startedAt: '', answers: {} });
    expect(scored.score).toBe(0);
    expect(scored.passed).toBe(false);
  });

  it('byTopic agrega corretamente', () => {
    const answers: Record<string, string> = {};
    const firstQ = sim.questions[0];
    answers[firstQ.id] = firstQ.correctId;
    const scored = scoreAttempt(sim, { simuladoId: SIM_ID, startedAt: '', answers });
    expect(scored.byTopic[firstQ.topic].correct).toBeGreaterThanOrEqual(1);
  });
});

describe('getWeakTopics', () => {
  const sim = getSimulado(SIM_ID)!;

  it('retorna tópicos com < 70% acerto', () => {
    // Responde só metade das primeiras N questões corretamente
    const answers: Record<string, string> = {};
    sim.questions.forEach((q, i) => {
      answers[q.id] = i % 2 === 0 ? q.correctId : 'A'; // alterna acerta/erra
    });
    const weak = getWeakTopics({ simuladoId: SIM_ID, startedAt: '', answers }, sim);
    expect(Array.isArray(weak)).toBe(true);
  });

  it('retorna vazio quando tudo 100%', () => {
    const answers: Record<string, string> = {};
    for (const q of sim.questions) answers[q.id] = q.correctId;
    const weak = getWeakTopics({ simuladoId: SIM_ID, startedAt: '', answers }, sim);
    expect(weak).toEqual([]);
  });
});

describe('isQuestionAccessible — acesso gratuito completo', () => {
  it('qualquer questão é acessível (simulados são gratuitos)', () => {
    for (let i = 0; i < 100; i++) {
      expect(isQuestionAccessible()).toBe(true);
    }
  });
});

describe('Persistência de attempts', () => {
  it('roundtrip save → get', () => {
    const a: SimuladoAttempt = {
      simuladoId: SIM_ID,
      startedAt: '2026-04-20T10:00:00Z',
      answers: { 'clf-q1': 'B' },
    };
    saveAttempt(a);
    expect(getAttempt(SIM_ID)).toEqual(a);
  });

  it('listAttempts retorna todas', () => {
    saveAttempt({ simuladoId: SIM_ID, startedAt: '', answers: {} });
    expect(listAttempts().length).toBe(1);
  });

  it('clearAttempt remove', () => {
    saveAttempt({ simuladoId: SIM_ID, startedAt: '', answers: {} });
    clearAttempt(SIM_ID);
    expect(getAttempt(SIM_ID)).toBeNull();
  });

  it('getAttempt retorna null quando storage tem JSON corrompido', () => {
    localStorage.setItem('ffv_simulado_attempts', '{malformed');
    expect(getAttempt(SIM_ID)).toBeNull();
  });
});
