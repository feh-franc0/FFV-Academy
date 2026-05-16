/**
 * Integração — fluxo end-to-end de simulado.
 *
 * Simula: login → responde questões → finaliza → score → emite certificado.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { verifyToken, MOCK_TOKEN } from '../../lib/auth';
import {
  getSimulado, saveAttempt, scoreAttempt, getAttempt,
  isQuestionAccessible, type Simulado, type SimuladoQuestion,
} from '../../lib/simulados';
import { issueCertificate, getCertificateLocal } from '../../lib/certificates';
import { completeSimulado, loadState } from '../../lib/engine';

const SIM_ID = 'simulado-aws-practitioner';
const EMAIL = 'tester@exemplo.com';
const PHONE = '+5511987654321';

beforeEach(() => localStorage.clear());

async function login() {
  await verifyToken(EMAIL, MOCK_TOKEN, {
    name: 'Tester',
    phone: PHONE,
    marketingConsent: true,
  });
}

// CLF agora pega questões do backend, então o test usa um conjunto fake in-memory.
const FAKE_QUESTIONS: SimuladoQuestion[] = [
  { id: 'q1', stem: 's1', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }], correctId: 'A', explanation: '', topic: 'Cloud Concepts', difficulty: 'easy' },
  { id: 'q2', stem: 's2', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }], correctId: 'B', explanation: '', topic: 'Security & Compliance', difficulty: 'medium' },
];

function simWithFakeQuestions(): Simulado {
  return { ...getSimulado(SIM_ID)!, questions: FAKE_QUESTIONS };
}

describe('Fluxo completo de simulado', () => {
  it('user loga → todas as questões acessíveis → finaliza', async () => {
    await login();
    const sim = simWithFakeQuestions();

    // Todas as questões acessíveis — sem paywall
    expect(isQuestionAccessible()).toBe(true);
    for (let i = 0; i < sim.questions.length; i++) {
      expect(isQuestionAccessible()).toBe(true);
    }

    // Responde todas corretamente
    const answers: Record<string, string> = {};
    for (const q of sim.questions) answers[q.id] = q.correctId;

    saveAttempt({
      simuladoId: SIM_ID,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      answers,
    });

    const saved = getAttempt(SIM_ID)!;
    const scored = scoreAttempt(sim, saved);
    expect(scored.score).toBe(100);
    expect(scored.passed).toBe(true);
  });

  it('completeSimulado concede XP proporcional + badges', async () => {
    await login();
    const r = completeSimulado({ simuladoId: SIM_ID, score: 85, passed: true });
    expect(r.xpGained).toBe(Math.round(85 * 0.5));
    expect(r.newBadges).toContain('simulado_first');
    expect(r.newBadges).toContain('simulado_aws_practitioner');
  });

  it('completeSimulado com score < passing não concede badge de aprovação', async () => {
    await login();
    const r = completeSimulado({ simuladoId: SIM_ID, score: 50, passed: false });
    expect(r.newBadges).toContain('simulado_first');
    expect(r.newBadges).not.toContain('simulado_aws_practitioner');
  });

  it('emite certificado ao passar e verifica via hash', async () => {
    await login();
    const cert = await issueCertificate({
      email: EMAIL,
      name: 'Tester',
      simuladoId: SIM_ID,
      score: 95,
    });
    expect(cert.hash).toMatch(/^[a-f0-9]{32}$/);
    const lookup = getCertificateLocal(cert.hash);
    expect(lookup?.name).toBe('Tester');
  });

  it('XP do simulado aparece no state.xp', async () => {
    await login();
    const before = loadState().xp;
    completeSimulado({ simuladoId: SIM_ID, score: 100, passed: true });
    const after = loadState().xp;
    expect(after).toBeGreaterThan(before);
  });
});
