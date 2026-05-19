'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '@/lib/user-preferences';

/**
 * useUserPreferences — hook React pra ler/escrever UserPreferences.
 *
 * V1: localStorage. Subscribers vivem na mesma aba (estado React local).
 * Mudanças cross-tab não propagam ainda (acceptable trade-off pra V1).
 *
 * V2: plugar em GET/PUT /api/v1/me/preferences via SWR (PR3 do plano).
 */
export function useUserPreferences() {
  // SSR-safe: default no servidor, hidratado no client após mount.
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs(curr => {
      const next = { ...curr, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
    setPrefs(DEFAULT_PREFERENCES);
  }, []);

  return { prefs, update, reset, hydrated };
}
