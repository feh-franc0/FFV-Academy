'use client';

/**
 * usePreferences — carrega as preferências do user logado do backend.
 *
 * Comportamento:
 *   - Deslogado → retorna { preferences: null, status: 'logged-out' }
 *   - Logado + carregando → status: 'loading'
 *   - Logado + sucesso → status: 'ready'
 *   - Logado + erro → status: 'error'
 *
 * Cache: salva o último resultado em memória pra evitar refetch agressivo.
 * Refresh manual via `refresh()`. Re-fetch automático ao mudar de usuário.
 *
 * Update otimista via `update()`: aplica localmente + chama PUT em background.
 * Reverte se falhar.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  fetchPreferences,
  updatePreferences as putPreferences,
  type Preferences,
  type UpdatePreferencesInput,
} from '@/lib/preferences-api';

type Status = 'logged-out' | 'loading' | 'ready' | 'error';

interface UsePreferencesResult {
  preferences: Preferences | null;
  status: Status;
  error: string | null;
  refresh: () => Promise<void>;
  update: (input: UpdatePreferencesInput) => Promise<Preferences>;
}

export function usePreferences(): UsePreferencesResult {
  const { user, isLoggedIn } = useAuth();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [status, setStatus] = useState<Status>('logged-out');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setPreferences(null);
      setStatus('logged-out');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const prefs = await fetchPreferences();
      setPreferences(prefs);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro ao carregar preferências');
      setStatus('error');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    load();
  }, [load, user?.email]);

  const update = useCallback(async (input: UpdatePreferencesInput) => {
    const previous = preferences;
    try {
      const next = await putPreferences(input);
      setPreferences(next);
      return next;
    } catch (err) {
      setPreferences(previous);
      throw err;
    }
  }, [preferences]);

  return { preferences, status, error, refresh: load, update };
}
