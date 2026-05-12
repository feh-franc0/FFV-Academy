/**
 * Testes de integração — billing.ts
 *
 * Valida: createCheckout chama POST /api/v1/billing/checkout
 * e retorna URL de redirect.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Stub feature flags ANTES de importar billing.ts — caso contrário, FEATURES é
// avaliado em build time com env vars vazias e createCheckout sempre falha.
vi.mock('../../lib/features', () => ({
  FEATURES: { billing: true, tutorAI: true, phoneAuth: true },
}));

import { createCheckout } from '../../lib/billing';
import { setAccessToken } from '../../lib/api-client';

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

beforeEach(() => {
  localStorage.clear();
  setAccessToken('tok_test');
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('createCheckout', () => {
  it('chama POST /api/v1/billing/checkout com productId', async () => {
    const checkoutUrl = 'https://checkout.stripe.com/pay/cs_test_abc';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 201,
      json: () => Promise.resolve({ checkoutUrl }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const url = await createCheckout('simulado-aws-practitioner');
    expect(url).toBe(checkoutUrl);

    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toContain('/api/v1/billing/checkout');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ productId: 'simulado-aws-practitioner' });
  });

  it('lança erro sem backend configurado', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    await expect(createCheckout('simulado-aws-practitioner')).rejects.toThrow('backend');
  });

  it('quando billing feature flag está desativada, isolando o módulo, lança erro sem chamar fetch', async () => {
    // Importa billing num módulo isolado com FEATURES.billing = false.
    vi.resetModules();
    vi.doMock('../../lib/features', () => ({
      FEATURES: { billing: false, tutorAI: false, phoneAuth: false },
    }));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const mod = await import('../../lib/billing');
    await expect(mod.createCheckout('x')).rejects.toThrow(/desabilitado/i);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.doUnmock('../../lib/features');
    vi.resetModules();
  });

  it('inclui Authorization header (requer login)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 201,
      json: () => Promise.resolve({ checkoutUrl: 'https://stripe.com/pay/x' }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await createCheckout('simulado-aws-practitioner');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers['Authorization']).toBe('Bearer tok_test');
  });
});
