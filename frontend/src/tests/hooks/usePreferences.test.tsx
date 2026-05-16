import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mocks DEVEM ser declarados antes do import do módulo testado.
const { fetchPreferencesMock, updatePreferencesMock, authState } = vi.hoisted(() => ({
  fetchPreferencesMock: vi.fn(),
  updatePreferencesMock: vi.fn(),
  authState: { isLoggedIn: false, user: null as { id?: string; email?: string } | null },
}));

vi.mock('@/lib/preferences-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/preferences-api')>();
  return {
    ...actual,
    fetchPreferences: fetchPreferencesMock,
    updatePreferences: updatePreferencesMock,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: authState.user,
    isLoggedIn: authState.isLoggedIn,
    requireLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { usePreferences } from '@/hooks/usePreferences';
import type { Preferences } from '@/lib/preferences-api';

function defaultPrefs(over: Partial<Preferences> = {}): Preferences {
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

describe('usePreferences', () => {
  beforeEach(() => {
    fetchPreferencesMock.mockReset();
    updatePreferencesMock.mockReset();
    authState.isLoggedIn = false;
    authState.user = null;
  });

  it('quando deslogado, retorna status=logged-out e não chama API', async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.status).toBe('logged-out'));
    expect(result.current.preferences).toBeNull();
    expect(fetchPreferencesMock).not.toHaveBeenCalled();
  });

  it('quando logado, chama fetchPreferences e expõe status ready', async () => {
    authState.isLoggedIn = true;
    authState.user = { id: 'u1', email: 'u@example.com' };
    fetchPreferencesMock.mockResolvedValue(defaultPrefs({ hubIds: ['hub-ia'] }));

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.preferences?.hubIds).toEqual(['hub-ia']);
    expect(fetchPreferencesMock).toHaveBeenCalledTimes(1);
  });

  it('em caso de erro do fetch, expõe status=error e error string', async () => {
    authState.isLoggedIn = true;
    authState.user = { id: 'u1', email: 'u@example.com' };
    fetchPreferencesMock.mockImplementationOnce(() => Promise.reject(new Error('offline')));

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('offline');
    expect(result.current.preferences).toBeNull();
  });

  it('update() chama PUT e atualiza state local com resposta do servidor', async () => {
    authState.isLoggedIn = true;
    authState.user = { id: 'u1', email: 'u@example.com' };
    fetchPreferencesMock.mockResolvedValue(defaultPrefs());
    updatePreferencesMock.mockResolvedValue(defaultPrefs({ hubIds: ['hub-aws'], onboarded: true }));

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.update({ hubIds: ['hub-aws'] });
    });

    expect(updatePreferencesMock).toHaveBeenCalledWith({ hubIds: ['hub-aws'] });
    expect(result.current.preferences?.hubIds).toEqual(['hub-aws']);
    expect(result.current.preferences?.onboarded).toBe(true);
  });

  it('update() em caso de falha, restaura state anterior (revert otimista)', async () => {
    authState.isLoggedIn = true;
    authState.user = { id: 'u1', email: 'u@example.com' };
    const original = defaultPrefs({ hubIds: ['hub-original'] });
    fetchPreferencesMock.mockResolvedValue(original);
    updatePreferencesMock.mockImplementationOnce(() => Promise.reject(new Error('500 internal')));

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.preferences?.hubIds).toEqual(['hub-original']));

    await expect(
      act(async () => {
        await result.current.update({ hubIds: ['hub-novo'] });
      })
    ).rejects.toThrow('500 internal');

    expect(result.current.preferences?.hubIds).toEqual(['hub-original']);
  });

  it('refresh() re-fetcha do backend', async () => {
    authState.isLoggedIn = true;
    authState.user = { id: 'u1', email: 'u@example.com' };
    fetchPreferencesMock
      .mockResolvedValueOnce(defaultPrefs({ hubIds: ['hub-1'] }))
      .mockResolvedValueOnce(defaultPrefs({ hubIds: ['hub-2'] }));

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.preferences?.hubIds).toEqual(['hub-1']));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.preferences?.hubIds).toEqual(['hub-2']);
    expect(fetchPreferencesMock).toHaveBeenCalledTimes(2);
  });
});
