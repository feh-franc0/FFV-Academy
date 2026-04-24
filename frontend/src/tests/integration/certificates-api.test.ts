/**
 * Testes de integração — certificates.ts com backend.
 *
 * Valida: issueCertificate, getCertificate, listCertificates
 * em modo mock e modo real (fetch mockado).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { issueCertificate, getCertificate, getCertificateLocal, listCertificates } from '../../lib/certificates';
import { setAccessToken } from '../../lib/api-client';

const MOCK_CERT_DTO = {
  hash: 'abc123def456abc1',
  userId: 'u_123',
  simuladoId: 'simulado-aws-practitioner',
  attemptId: 'att_001',
  holderName: 'Test User',
  issuedAt: '2024-01-01T00:00:00Z',
  verifyUrl: 'https://fernandofrancovalle.com/verificar?h=abc123def456abc1',
};

const ORIG_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function setupBackend() {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
}

function setupMock() {
  process.env.NEXT_PUBLIC_API_BASE_URL = '';
}

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true, status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

beforeEach(() => {
  localStorage.clear();
  setAccessToken('tok_test');
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIG_URL ?? '';
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

// ─── Modo mock ─────────────────────────────────────────────────────────────

describe('Modo mock (sem backend)', () => {
  beforeEach(setupMock);

  it('issueCertificate gera hash e persiste no localStorage', async () => {
    const cert = await issueCertificate({
      email: 'user@test.com',
      name: 'User Test',
      simuladoId: 'simulado-aws-practitioner',
      score: 90,
    });
    expect(cert.hash).toMatch(/^[a-f0-9]{32}$/);
    expect(cert.name).toBe('User Test');
    expect(cert.score).toBe(90);
  });

  it('getCertificateLocal busca no localStorage', async () => {
    const cert = await issueCertificate({
      email: 'a@b.com',
      name: 'Tester',
      simuladoId: 'simulado-aws-practitioner',
      score: 85,
    });
    const lookup = getCertificateLocal(cert.hash);
    expect(lookup?.name).toBe('Tester');
  });

  it('getCertificate (async) também lê localStorage no modo mock', async () => {
    const cert = await issueCertificate({
      email: 'a@b.com',
      name: 'Tester',
      simuladoId: 'simulado-aws-practitioner',
      score: 85,
    });
    const lookup = await getCertificate(cert.hash);
    expect(lookup?.name).toBe('Tester');
  });

  it('listCertificates retorna todos do localStorage', async () => {
    await issueCertificate({ email: 'a@b.com', name: 'A', simuladoId: 'sim1', score: 80 });
    await issueCertificate({ email: 'b@c.com', name: 'B', simuladoId: 'sim2', score: 90 });
    const certs = await listCertificates();
    expect(certs.length).toBe(2);
  });
});

// ─── Modo real ─────────────────────────────────────────────────────────────

describe('Modo real (backend mockado)', () => {
  beforeEach(setupBackend);

  it('issueCertificate chama POST /api/v1/certificates', async () => {
    const fetchMock = mockFetchOk(MOCK_CERT_DTO);
    vi.stubGlobal('fetch', fetchMock);

    const cert = await issueCertificate({
      email: 'user@test.com',
      name: 'Test User',
      simuladoId: 'simulado-aws-practitioner',
      score: 90,
      attemptId: 'att_001',
    });

    expect(cert.hash).toBe('abc123def456abc1');
    expect(cert.name).toBe('Test User');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/certificates');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({
      simuladoId: 'simulado-aws-practitioner',
      attemptId: 'att_001',
      holderName: 'Test User',
    });
  });

  it('issueCertificate cacheia no localStorage após emitir', async () => {
    const fetchMock = mockFetchOk(MOCK_CERT_DTO);
    vi.stubGlobal('fetch', fetchMock);

    const cert = await issueCertificate({
      email: 'user@test.com',
      name: 'Test User',
      simuladoId: 'simulado-aws-practitioner',
      score: 90,
      attemptId: 'att_001',
    });

    // Deve ter cacheado localmente
    const local = getCertificateLocal(cert.hash);
    expect(local?.hash).toBe(MOCK_CERT_DTO.hash);
  });

  it('issueCertificate sem attemptId usa modo mock (hash local)', async () => {
    // Sem attemptId o servidor não pode ser chamado — usa hash local
    const cert = await issueCertificate({
      email: 'user@test.com',
      name: 'Test User',
      simuladoId: 'simulado-aws-practitioner',
      score: 90,
    });
    // Hash local = 32 chars hex
    expect(cert.hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it('getCertificate chama GET /api/v1/certificates/:hash (público)', async () => {
    const fetchMock = mockFetchOk(MOCK_CERT_DTO);
    vi.stubGlobal('fetch', fetchMock);

    const cert = await getCertificate('abc123def456abc1');
    expect(cert?.hash).toBe('abc123def456abc1');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/certificates/abc123def456abc1');
    expect(init.method).toBe('GET');
    // Não deve ter Authorization (endpoint público)
    const headers = init.headers as Record<string, string>;
    expect(headers?.['Authorization']).toBeUndefined();
  });

  it('getCertificate retorna null em 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 404,
      json: () => Promise.resolve({ type: 'not-found', title: 'Not Found', status: 404, detail: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const cert = await getCertificate('hashquenaoexiste00000000000000000');
    expect(cert).toBeNull();
  });

  it('listCertificates chama GET /api/v1/me/certificates', async () => {
    const fetchMock = mockFetchOk([MOCK_CERT_DTO]);
    vi.stubGlobal('fetch', fetchMock);

    const certs = await listCertificates();
    expect(certs).toHaveLength(1);
    expect(certs[0].hash).toBe('abc123def456abc1');

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/me/certificates');
  });
});
