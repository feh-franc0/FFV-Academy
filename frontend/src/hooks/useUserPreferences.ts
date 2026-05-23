'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '@/lib/user-preferences';
import {
  fetchPreferences,
  updatePreferences,
  serverToUserPreferences,
  userPreferencesToUpdateInput,
} from '@/lib/preferences-api';

/**
 * useUserPreferences — hook React híbrido.
 *
 * Estratégia "offline-first, backend-truth-when-logged-in":
 *  1. Hidrata IMEDIATAMENTE do localStorage (perfil pra visitante anônimo).
 *  2. Em paralelo, tenta GET /api/v1/me/preferences (autenticado).
 *  3. Se 401 → mantém localStorage (visitante).
 *  4. Se 200 → substitui state com server data + salva no localStorage como cache.
 *  5. update() é optimistic: atualiza state + localStorage IMEDIATAMENTE,
 *     em background dispara PUT. Falha de PUT = mantém local (não bloqueia user).
 *
 * Source = "local" | "remote" — UI pode mostrar "Sincronizado" só quando remote.
 */
export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const [source, setSource] = useState<'local' | 'remote'>('local');
  const [syncing, setSyncing] = useState(false);
  const initRef = useRef(false);
  // mountedRef: evita setState em background depois do unmount. Em testes
  // com JSDOM teardown, isso prevenia "window is not defined" quando o
  // promise resolvia depois do environment ter sido destruído.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Mount: hidrata do localStorage + tenta server.
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // 1. Hidrata local imediatamente (não bloqueia UX)
    setPrefs(loadPreferences());
    setHydrated(true);

    // 2. Tenta server em background. apiFetch dispara o auth flow;
    //    se não autenticado, lança erro e caímos em local.
    let cancelled = false;
    fetchPreferences()
      .then(server => {
        if (cancelled || !mountedRef.current) return;
        const mapped = serverToUserPreferences(server);
        setPrefs(mapped);
        savePreferences(mapped); // cache local pra próximas leituras
        setSource('remote');
      })
      .catch(() => {
        // 401, rede, ou shape — fica em local silenciosamente.
        if (cancelled || !mountedRef.current) return;
        setSource('local');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs(curr => {
      const next = { ...curr, ...patch };
      // Optimistic local + cache
      savePreferences(next);

      // Background PUT — silencioso, fail-safe.
      setSyncing(true);
      updatePreferences(userPreferencesToUpdateInput(next))
        .then(server => {
          if (!mountedRef.current) return;
          const mapped = serverToUserPreferences(server);
          setPrefs(mapped); // server pode normalizar (ordenar arrays, etc)
          savePreferences(mapped);
          setSource('remote');
        })
        .catch(() => {
          // 401 (visitante) ou erro de rede — mantém local, sem perder edit.
          if (!mountedRef.current) return;
          setSource('local');
        })
        .finally(() => {
          if (!mountedRef.current) return;
          setSyncing(false);
        });

      return next;
    });
  }, []);

  const reset = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
    setPrefs(DEFAULT_PREFERENCES);
    // Não envia reset pro backend — destrutivo. Caller que quiser reset
    // server-side deve chamar update() pra cada campo.
  }, []);

  return { prefs, update, reset, hydrated, source, syncing };
}
