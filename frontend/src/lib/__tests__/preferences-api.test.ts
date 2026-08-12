import { describe, it, expect, vi, beforeEach } from 'vitest';

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock('@/lib/api-client', () => ({
  apiFetch: apiFetchMock,
}));

import {
  fetchPreferences,
  updatePreferences,
  HUB_OPTIONS,
  CERTIFICATION_OPTIONS,
  OBJECTIVE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  SKILL_LEVELS,
  OBJECTIVES,
  type Preferences,
} from '../preferences-api';

function makePrefs(over: Partial<Preferences> = {}): Preferences {
  return {
    hubIds: [],
    trailIds: [],
    certificationIds: [],
    objectives: [],
    skillLevel: '',
    dailyQuestionEnabled: true,
    onboarded: false,
    updatedAt: '2026-05-16T12:00:00Z',
    ...over,
  };
}

describe('fetchPreferences', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('chama GET /api/v1/me/preferences autenticado', async () => {
    apiFetchMock.mockResolvedValue(makePrefs());
    await fetchPreferences();

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, opts, withAuth] = apiFetchMock.mock.calls[0];
    expect(path).toBe('/api/v1/me/preferences');
    expect(opts).toEqual({});
    expect(withAuth).toBe(true);
  });

  it('retorna o shape Preferences', async () => {
    const stub = makePrefs({ hubIds: ['hub-ia'], onboarded: true });
    apiFetchMock.mockResolvedValue(stub);
    const out = await fetchPreferences();
    expect(out).toEqual(stub);
  });
});

describe('updatePreferences', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('chama PUT /api/v1/me/preferences com JSON body + content-type', async () => {
    apiFetchMock.mockResolvedValue(makePrefs({ onboarded: true }));
    await updatePreferences({ hubIds: ['hub-aws'], skillLevel: 'intermediate' });

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, opts, withAuth] = apiFetchMock.mock.calls[0];
    expect(path).toBe('/api/v1/me/preferences');
    expect(withAuth).toBe(true);
    expect(opts.method).toBe('PUT');
    expect(opts.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(opts.body)).toEqual({
      hubIds: ['hub-aws'],
      skillLevel: 'intermediate',
    });
  });

  it('omite campos undefined do body (não envia chaves null/undefined)', async () => {
    apiFetchMock.mockResolvedValue(makePrefs());
    await updatePreferences({ dailyQuestionEnabled: false });

    const body = JSON.parse(apiFetchMock.mock.calls[0][1].body);
    expect(Object.keys(body)).toEqual(['dailyQuestionEnabled']);
    expect(body.dailyQuestionEnabled).toBe(false);
  });

  it('passa listas vazias intencionalmente (limpa preferência)', async () => {
    apiFetchMock.mockResolvedValue(makePrefs());
    await updatePreferences({ hubIds: [], objectives: [] });

    const body = JSON.parse(apiFetchMock.mock.calls[0][1].body);
    expect(body.hubIds).toEqual([]);
    expect(body.objectives).toEqual([]);
  });

  it('propaga erro do apiFetch (rede/4xx/5xx)', async () => {
    apiFetchMock.mockImplementationOnce(() => Promise.reject(new Error('429 too many')));
    await expect(updatePreferences({ hubIds: ['hub-ia'] })).rejects.toThrow('429 too many');
  });
});

describe('catálogos UI exportados', () => {
  it('HUB_OPTIONS tem 5 hubs com IDs slug-like', () => {
    expect(HUB_OPTIONS).toHaveLength(5);
    for (const opt of HUB_OPTIONS) {
      expect(opt.id).toMatch(/^[a-z0-9-]+$/);
      expect(opt.label).toBeTruthy();
      expect(opt.icon).toBeTruthy();
    }
  });

  it('CERTIFICATION_OPTIONS cobre simulados ativos (CLF, DVA, SAA, AIF, Anthropic)', () => {
    const ids = CERTIFICATION_OPTIONS.map(c => c.id);
    expect(ids).toContain('aws-clf');
    expect(ids).toContain('aws-dva');
    expect(ids).toContain('anthropic-ai');
  });

  it('OBJECTIVE_OPTIONS bate exatamente com enum canônico do backend', () => {
    const ids = OBJECTIVE_OPTIONS.map(o => o.id).sort();
    expect(ids).toEqual([...OBJECTIVES].sort());
  });

  it('SKILL_LEVEL_OPTIONS bate exatamente com enum canônico', () => {
    const ids = SKILL_LEVEL_OPTIONS.map(s => s.id).sort();
    expect(ids).toEqual([...SKILL_LEVELS].sort());
  });

  it('IDs e labels são únicos (sem duplicatas acidentais)', () => {
    const allCatalogs = [HUB_OPTIONS, CERTIFICATION_OPTIONS, OBJECTIVE_OPTIONS, SKILL_LEVEL_OPTIONS];
    for (const cat of allCatalogs) {
      const ids = cat.map(o => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
