/**
 * Integração — fluxo end-to-end de simulado.
 *
 * Simula: login → responde questões → atinge paywall → paga (mock) → continua
 * → finaliza → score → emite certificado.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { verifyToken, grantProduct, isPaidFor, MOCK_TOKEN } from '../../lib/auth';
import {
  getSimulado, saveAttempt, scoreAttempt, getAttempt,
  isQuestionAccessible, FREE_QUESTIONS_LIMIT,
} from '../../lib/simulados';
import { issueCertificate, getCertificate } from '../../lib/certificates';
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

describe('Fluxo completo de simulado', () => {
  it('user loga → gate paywall na 11ª → paga → continua → finaliza', async () => {
    await login();
    const sim = getSimulado(SIM_ID)!;

    // Primeiras 10 grátis — accessível sem pagar
    for (let i = 0; i < FREE_QUESTIONS_LIMIT; i++) {
      expect(isQuestionAccessible(i, false)).toBe(true);
    }

    // 11ª bloqueada
    expect(isQuestionAccessible(FREE_QUESTIONS_LIMIT, false)).toBe(false);

    // Mock pagamento
    grantProduct(SIM_ID);
    expect(isPaidFor(SIM_ID)).toBe(true);

    // Agora todas acessíveis
    expect(isQuestionAccessible(FREE_QUESTIONS_LIMIT, true)).toBe(true);

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
    const lookup = getCertificate(cert.hash);
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
