/**
 * Auth mock adapter — testes unitários.
 *
 * Valida: request/verify, persistência, idempotência, gate de paidProducts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  requestToken, verifyToken, getCurrentUser, logout,
  isPaidFor, grantProduct, updateMarketingConsent, updateProfile,
  MOCK_TOKEN,
} from '../../lib/auth';

const VALID_EMAIL = 'teste@exemplo.com';
const VALID_PHONE = '+5511987654321';

beforeEach(() => localStorage.clear());

describe('requestToken', () => {
  it('aceita email válido e resolve { ok: true } sem isNewUser (endpoint público, não prova posse do email)', async () => {
    const r = await requestToken(VALID_EMAIL);
    expect(r.ok).toBe(true);
    expect('isNewUser' in r).toBe(false);
  });

  it('rejeita email malformado', async () => {
    await expect(requestToken('xxx')).rejects.toThrow('email');
  });
});

describe('verifyToken — token 000000', () => {
  it(`aceita apenas "${MOCK_TOKEN}"`, async () => {
    const ok = await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano',
      phone: VALID_PHONE,
      marketingConsent: true,
    });
    expect(ok.ok).toBe(true);
    expect(ok.user?.email).toBe(VALID_EMAIL);
  });

  it('rejeita qualquer outro token', async () => {
    const tests = ['123456', '111111', '999999', '000001', 'abcdef', ''];
    for (const token of tests) {
      const r = await verifyToken(VALID_EMAIL, token, {
        name: 'Fulano', phone: VALID_PHONE, marketingConsent: true,
      });
      expect(r.ok).toBe(false);
    }
  });

  it('primeira auth sem registration retorna registrationRequired (código já validado, cadastro pendente)', async () => {
    const r = await verifyToken(VALID_EMAIL, MOCK_TOKEN);
    expect(r.ok).toBe(false);
    expect(r.registrationRequired).toBe(true);
  });

  it('segundo login (mesmo email) reaproveita user existente', async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: true,
    });
    // Segundo login sem pendingRegistration funciona — retorna user existente
    const r2 = await verifyToken(VALID_EMAIL, MOCK_TOKEN);
    expect(r2.ok).toBe(true);
    expect(r2.user?.name).toBe('Fulano');
  });
});

describe('getCurrentUser / logout', () => {
  it('retorna null antes de login', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('retorna user após login bem-sucedido', async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: true,
    });
    const u = getCurrentUser();
    expect(u).not.toBeNull();
    expect(u?.paidProducts).toEqual([]);
  });

  it('logout limpa o perfil', async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: true,
    });
    logout();
    expect(getCurrentUser()).toBeNull();
  });
});

describe('isPaidFor / grantProduct', () => {
  beforeEach(async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: true,
    });
  });

  it('isPaidFor retorna false antes de grantProduct', () => {
    expect(isPaidFor('simulado-aws-practitioner')).toBe(false);
  });

  it('grantProduct + isPaidFor → true', () => {
    grantProduct('simulado-aws-practitioner');
    expect(isPaidFor('simulado-aws-practitioner')).toBe(true);
  });

  it('grantProduct é idempotente (não duplica)', () => {
    grantProduct('simulado-aws-practitioner');
    grantProduct('simulado-aws-practitioner');
    const u = getCurrentUser();
    const count = u!.paidProducts.filter(p => p === 'simulado-aws-practitioner').length;
    expect(count).toBe(1);
  });

  it('grantProduct retorna false se não logado', () => {
    logout();
    expect(grantProduct('simulado-aws-practitioner')).toBe(false);
  });
});

describe('updateMarketingConsent / updateProfile', () => {
  beforeEach(async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: false,
    });
  });

  it('atualiza consentimento', () => {
    updateMarketingConsent(true);
    expect(getCurrentUser()?.marketingConsent).toBe(true);
  });

  it('atualiza nome preservando email + paidProducts', () => {
    grantProduct('simulado-aws-practitioner');
    updateProfile({ name: 'Novo Nome' });
    const u = getCurrentUser();
    expect(u?.name).toBe('Novo Nome');
    expect(u?.email).toBe(VALID_EMAIL);
    expect(u?.paidProducts).toContain('simulado-aws-practitioner');
  });
});
