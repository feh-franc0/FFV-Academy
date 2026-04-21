/**
 * Testes de segurança — integridade do localStorage.
 *
 * - Tamper externo (ex: usuário edita via DevTools) não derruba a app
 * - Leitura de JSON inválido retorna estado default (graceful)
 * - Writes não-autorizados (fora das chaves conhecidas) não interferem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loadState } from '../../lib/engine';
import { getDailyModule } from '../../lib/dailyModule';
import { getReferralRecord, getMyReferralId } from '../../lib/referral';

beforeEach(() => localStorage.clear());

describe('localStorage tamper resilience', () => {
  it('loadState retorna default quando ffv_academy contém JSON lixo', () => {
    localStorage.setItem('ffv_academy', 'não-é-json-{{');
    const state = loadState();
    expect(state.xp).toBe(0);
    expect(state.completedModules).toEqual([]);
  });

  it('loadState retorna default quando ffv_academy contém null', () => {
    localStorage.setItem('ffv_academy', 'null');
    const state = loadState();
    expect(state.completedModules).toEqual([]);
  });

  it('getDailyModule não trava com ffv_daily_module corrompido', () => {
    localStorage.setItem('ffv_daily_module', '{malformed');
    expect(() => getDailyModule()).not.toThrow();
  });

  it('getReferralRecord retorna null com payload inválido', () => {
    localStorage.setItem('ffv_referral', '{bad-json');
    expect(getReferralRecord()).toBeNull();
  });
});

describe('Isolamento de chaves', () => {
  it('chaves do app começam todas com prefixo ffv_', () => {
    // Efetua writes através das APIs e valida que nenhum criou key fora do namespace.
    getMyReferralId();
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(k => k.startsWith('ffv_'));
    expect(appKeys.length).toBe(keys.length); // todas são ffv_*
  });
});
