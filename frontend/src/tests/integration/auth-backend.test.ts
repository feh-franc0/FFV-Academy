/**
 * Testes de integração — auth.ts com backend (fetch mockado).
 *
 * Valida: requestToken, verifyToken, logout, refreshSession,
 * updateProfile, deleteAccount com chamadas HTTP simuladas.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  requestToken,
  verifyToken,
  logout,
  refreshSession,
  getCurrentUser,
  isPaidFor,
  updateProfile,
  updateMarketingConsent,
  deleteAccount,
  syncProfileFromServer,
  MOCK_TOKEN,
} from '../../lib/auth';
import { getAccessToken, clearAccessToken } from '../../lib/api-client';

const VALID_EMAIL = 'test@example.com';
const VALID_PHONE = '+5511987654321';

const MOCK_USER_DTO = {
  id: 'u_123',
  email: VALID_EMAIL,
  phone: VALID_PHONE,
  name: 'Test User',
  role: 'user',
  referralId: 'testuser',
  products: ['simulado-aws-practitioner'],
  marketingConsent: false,
  createdAt: '2024-01-01T00:00:00Z',
};

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function setupBackend() {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
}

function setupMock() {
  process.env.NEXT_PUBLIC_API_BASE_URL = '';
}

function mockFetchResponse(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    statusText: status < 400 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

beforeEach(() => {
  localStorage.clear();
  clearAccessToken();
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

// ─── Modo Mock (sem backend) ───────────────────────────────────────────────

describe('Modo mock (sem NEXT_PUBLIC_API_BASE_URL)', () => {
  beforeEach(setupMock);

  it('requestToken aceita email e phone válidos', async () => {
    const r = await requestToken(VALID_EMAIL, VALID_PHONE);
    expect(r.ok).toBe(true);
  });

  it('requestToken rejeita email malformado', async () => {
    await expect(requestToken('invalid', VALID_PHONE)).rejects.toThrow('email');
  });

  it('verifyToken aceita MOCK_TOKEN e cria user', async () => {
    const r = await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano',
      phone: VALID_PHONE,
      marketingConsent: false,
    });
    expect(r.ok).toBe(true);
    expect(r.user?.email).toBe(VALID_EMAIL);
  });

  it('verifyToken rejeita token diferente de 000000', async () => {
    const r = await verifyToken(VALID_EMAIL, '123456', {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: false,
    });
    expect(r.ok).toBe(false);
  });

  it('logout limpa user do storage (sem HTTP)', async () => {
    await verifyToken(VALID_EMAIL, MOCK_TOKEN, {
      name: 'Fulano', phone: VALID_PHONE, marketingConsent: false,
    });
    await logout();
    expect(getCurrentUser()).toBeNull();
  });
});

// ─── Modo Real (com backend mockado via fetch) ────────────────────────────

describe('Modo real (NEXT_PUBLIC_API_BASE_URL configurado)', () => {
  beforeEach(setupBackend);

  it('requestToken chama POST /api/v1/auth/request-token', async () => {
    const fetchMock = mockFetchResponse({ ok: true }, 202);
    vi.stubGlobal('fetch', fetchMock);

    const r = await requestToken(VALID_EMAIL, VALID_PHONE);
    expect(r.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/request-token');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ email: VALID_EMAIL, phone: VALID_PHONE });
  });

  it('requestToken ainda valida email antes de chamar HTTP', async () => {
    await expect(requestToken('bad-email', VALID_PHONE)).rejects.toThrow('email');
  });

  it('verifyToken chama POST /api/v1/auth/verify e armazena access token', async () => {
    const fetchMock = mockFetchResponse({ accessToken: 'tok_real', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', fetchMock);

    const r = await verifyToken(VALID_EMAIL, 'any_token', {
      name: 'Test User', phone: VALID_PHONE, marketingConsent: false,
    });
    expect(r.ok).toBe(true);
    expect(r.user?.email).toBe(VALID_EMAIL);
    expect(r.user?.paidProducts).toContain('simulado-aws-practitioner');
    expect(getAccessToken()).toBe('tok_real');
  });

  it('verifyToken retorna ok:false em 401 do backend', async () => {
    const fetchMock = mockFetchResponse(
      { type: 'unauthorized', title: 'Token inválido', status: 401, detail: '' },
      401,
    );
    vi.stubGlobal('fetch', fetchMock);

    const r = await verifyToken(VALID_EMAIL, 'wrong_token');
    expect(r.ok).toBe(false);
  });

  it('verifyToken persiste UserProfile no localStorage', async () => {
    const fetchMock = mockFetchResponse({ accessToken: 'tok_real', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', fetchMock);

    await verifyToken(VALID_EMAIL, 'any_token', {
      name: 'Test User', phone: VALID_PHONE, marketingConsent: false,
    });
    const stored = getCurrentUser();
    expect(stored?.email).toBe(VALID_EMAIL);
    expect(stored?.name).toBe('Test User');
  });

  it('logout chama POST /api/v1/auth/logout e limpa estado', async () => {
    // Configura user logado
    const loginMock = mockFetchResponse({ accessToken: 'tok_real', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', loginMock);
    await verifyToken(VALID_EMAIL, 'any', { name: 'X', phone: VALID_PHONE, marketingConsent: false });

    // Mock para logout (204)
    const logoutMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) });
    vi.stubGlobal('fetch', logoutMock);

    await logout();

    expect(getCurrentUser()).toBeNull();
    expect(getAccessToken()).toBeNull();
    const [url, init] = logoutMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/logout');
    expect(init.method).toBe('POST');
  });

  it('refreshSession chama POST /api/v1/auth/refresh e renova token', async () => {
    const fetchMock = mockFetchResponse({ accessToken: 'tok_refreshed', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', fetchMock);

    const user = await refreshSession();
    expect(user?.email).toBe(VALID_EMAIL);
    expect(getAccessToken()).toBe('tok_refreshed');
  });

  it('refreshSession retorna null se cookie expirado (fetch falha)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const user = await refreshSession();
    expect(user).toBeNull();
  });

  it('updateProfile chama PATCH /api/v1/me', async () => {
    const fetchMock = mockFetchResponse({ ...MOCK_USER_DTO, name: 'Novo Nome' });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await updateProfile({ name: 'Novo Nome' });
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/me');
    expect(init.method).toBe('PATCH');
  });

  it('updateMarketingConsent chama PATCH /api/v1/me com marketingConsent', async () => {
    const fetchMock = mockFetchResponse({ ...MOCK_USER_DTO, marketingConsent: true });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await updateMarketingConsent(true);
    expect(ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ marketingConsent: true });
  });

  it('deleteAccount chama DELETE /api/v1/me e limpa estado', async () => {
    // Login primeiro
    const loginMock = mockFetchResponse({ accessToken: 'tok', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', loginMock);
    await verifyToken(VALID_EMAIL, 'any', { name: 'X', phone: VALID_PHONE, marketingConsent: false });

    const deleteMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) });
    vi.stubGlobal('fetch', deleteMock);

    const ok = await deleteAccount();
    expect(ok).toBe(true);
    expect(getCurrentUser()).toBeNull();
    expect(getAccessToken()).toBeNull();
    const [url, init] = deleteMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/me');
    expect(init.method).toBe('DELETE');
  });

  it('isPaidFor lê paidProducts do cache local após login', async () => {
    const fetchMock = mockFetchResponse({ accessToken: 'tok', user: MOCK_USER_DTO });
    vi.stubGlobal('fetch', fetchMock);

    await verifyToken(VALID_EMAIL, 'any', { name: 'X', phone: VALID_PHONE, marketingConsent: false });
    expect(isPaidFor('simulado-aws-practitioner')).toBe(true);
    expect(isPaidFor('simulado-azure')).toBe(false);
  });

  it('syncProfileFromServer renova token e atualiza paidProducts', async () => {
    const updatedUser = { ...MOCK_USER_DTO, products: ['simulado-aws-practitioner', 'simulado-azure'] };
    const fetchMock = mockFetchResponse({ accessToken: 'tok_new', user: updatedUser });
    vi.stubGlobal('fetch', fetchMock);

    const profile = await syncProfileFromServer();
    expect(profile?.paidProducts).toContain('simulado-azure');
    expect(getAccessToken()).toBe('tok_new');
  });
});
