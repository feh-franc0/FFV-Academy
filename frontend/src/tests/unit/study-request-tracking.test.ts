import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveActiveRequest,
  loadActiveRequest,
  clearActiveRequest,
  deriveSlaStep,
  humanizeElapsed,
  fetchStudyRequestStatus,
  StatusNotFoundError,
} from '@/lib/study-request-tracking';

describe('study-request-tracking', () => {
  beforeEach(() => window.localStorage.clear());

  it('save + load round-trip', () => {
    const req = {
      id: 'abc-123',
      email: 'aluno@gmail.com',
      attachmentCount: 2,
      submittedAt: new Date('2026-05-19T10:00:00Z').toISOString(),
    };
    saveActiveRequest(req);
    expect(loadActiveRequest()).toEqual(req);
  });

  it('load retorna null quando não há solicitação', () => {
    expect(loadActiveRequest()).toBeNull();
  });

  it('load rejeita JSON corrompido + limpa', () => {
    window.localStorage.setItem('ffv_active_study_request_v1', '{not json');
    expect(loadActiveRequest()).toBeNull();
    expect(window.localStorage.getItem('ffv_active_study_request_v1')).toBeNull();
  });

  it('clear remove', () => {
    saveActiveRequest({
      id: 'x', email: 'a', attachmentCount: 0, submittedAt: new Date().toISOString(),
    });
    clearActiveRequest();
    expect(loadActiveRequest()).toBeNull();
  });

  describe('deriveSlaStep', () => {
    const base = (submittedAt: string) => ({
      id: 'x', email: 'a', attachmentCount: 0, submittedAt,
    });

    it('< 30min → received', () => {
      const now = new Date('2026-05-19T10:20:00Z');
      const req = base('2026-05-19T10:00:00Z');
      expect(deriveSlaStep(req, now)).toBe('received');
    });

    it('30min-24h → curating', () => {
      const now = new Date('2026-05-19T15:00:00Z');
      const req = base('2026-05-19T10:00:00Z');
      expect(deriveSlaStep(req, now)).toBe('curating');
    });

    it('>24h → delivered', () => {
      const now = new Date('2026-05-20T11:00:00Z');
      const req = base('2026-05-19T10:00:00Z');
      expect(deriveSlaStep(req, now)).toBe('delivered');
    });

    it('status explícito do backend sempre vence o cálculo de tempo', () => {
      const now = new Date('2026-05-19T10:01:00Z');
      const req = { ...base('2026-05-19T10:00:00Z'), status: 'delivered' as const };
      expect(deriveSlaStep(req, now)).toBe('delivered');
    });
  });

  describe('humanizeElapsed', () => {
    const fix = (s: string, n: string) =>
      humanizeElapsed(s, new Date(n));

    it('< 1 min → "agora mesmo"', () => {
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T10:00:30Z')).toBe('agora mesmo');
    });

    it('minutos', () => {
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T10:05:00Z')).toBe('há 5 minutos');
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T10:01:00Z')).toBe('há 1 minuto');
    });

    it('horas redondas', () => {
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T13:00:00Z')).toBe('há 3 horas');
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T11:00:00Z')).toBe('há 1 hora');
    });

    it('horas + minutos', () => {
      expect(fix('2026-05-19T10:00:00Z', '2026-05-19T12:30:00Z')).toBe('há 2h 30min');
    });

    it('dias', () => {
      expect(fix('2026-05-18T10:00:00Z', '2026-05-19T10:00:00Z')).toBe('há 1 dia');
      expect(fix('2026-05-17T10:00:00Z', '2026-05-19T10:00:00Z')).toBe('há 2 dias');
    });
  });

  // ─── Backend integration ────────────────────────────────────────────────
  describe('fetchStudyRequestStatus', () => {
    const fetchMock = vi.fn();
    beforeEach(() => {
      fetchMock.mockReset();
      global.fetch = fetchMock as unknown as typeof fetch;
    });
    afterEach(() => {
      // @ts-expect-error reset
      global.fetch = undefined;
    });

    it('retorna shape parseado em 200', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'abc',
          status: 'curating',
          submittedAt: '2026-05-19T10:00:00Z',
          updatedAt: '2026-05-19T12:00:00Z',
          etaHoursMax: 24,
          etaHoursAvg: 12,
        }),
      });
      const res = await fetchStudyRequestStatus('abc');
      expect(res.status).toBe('curating');
      expect(res.etaHoursAvg).toBe(12);
    });

    it('lança StatusNotFoundError em 404', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
      await expect(fetchStudyRequestStatus('inexistente')).rejects.toBeInstanceOf(StatusNotFoundError);
    });

    it('lança Error genérico em outro status', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
      await expect(fetchStudyRequestStatus('abc')).rejects.toThrow(/HTTP 500/);
    });

    it('lança em shape inválido', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ foo: 'bar' }),
      });
      await expect(fetchStudyRequestStatus('abc')).rejects.toThrow();
    });

    it('encoda ID na URL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'abc/123',
          status: 'received',
          submittedAt: '2026-05-19T10:00:00Z',
          updatedAt: '2026-05-19T10:00:00Z',
          etaHoursMax: 24,
          etaHoursAvg: 12,
        }),
      });
      await fetchStudyRequestStatus('abc/123');
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('abc%2F123'),
        expect.any(Object),
      );
    });
  });
});
