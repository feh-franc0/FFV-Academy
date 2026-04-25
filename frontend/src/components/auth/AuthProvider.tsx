'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import {
  getCurrentUser,
  logout as doLogout,
  refreshSession,
  type UserProfile,
} from '@/lib/auth';
import { LoginModal } from './LoginModal';
import { migrateFromLocalStorage } from '@/lib/game-state-storage';

/**
 * Provider global de auth.
 *
 * On mount: tenta renovar sessão via refresh token (cookie HttpOnly).
 * requireLogin(reason): abre modal e resolve quando usuário conclui.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();

  const pendingResolvers = useRef<{
    resolve: (user: UserProfile) => void;
    reject: (err: Error) => void;
  } | null>(null);

  /**
   * Migração automática: localStorage → IndexedDB.
   *
   * Executa uma única vez na montagem inicial do AuthProvider (componente root).
   * A função migrateFromLocalStorage verifica internamente a flag 'ffv_idb_migrated_v1'
   * e é no-op se a migração já foi concluída anteriormente.
   *
   * Por que aqui (AuthProvider) e não em useGameState?
   * - AuthProvider monta ANTES de qualquer componente que use useGameState.
   * - Isso garante que os dados estejam no IndexedDB antes do primeiro loadState().
   * - Erros de migração são não-críticos: o app continua funcionando com localStorage.
   */
  useEffect(() => {
    migrateFromLocalStorage().catch(err =>
      console.warn('[AuthProvider] Migração localStorage → IndexedDB falhou (não crítico)', err)
    );
  }, []);

  // Tenta restaurar sessão via refresh token (cookie HttpOnly) ou localStorage.
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      const restored = await refreshSession();
      if (!cancelled) setUser(restored);
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

  /**
   * Auto-refresh do access token a cada 12 minutos.
   *
   * Por que 12 minutos? O access token JWT tem validade de 15 minutos.
   * Renovar 3 minutos antes garante que nunca haverá uma janela sem token
   * válido — o intervalo termina, o novo token chega, e só depois os 3 min
   * restantes escoam. Se o refresh falhar (refresh token expirado, logout
   * em outro dispositivo), a sessão é encerrada localmente via logout().
   *
   * O intervalo só roda quando o usuário está logado (user !== null).
   * Ao deslogar, o cleanup cancela o interval automaticamente.
   */
  const TOKEN_REFRESH_INTERVAL_MS = 12 * 60 * 1000; // 12 minutos

  useEffect(() => {
    // Não agender refresh se não há usuário logado
    if (user === null) return;

    const intervalId = setInterval(async () => {
      // Tab oculta (background): pular refresh para não logar silenciosamente o usuário
      // quando há falha transitória de rede (ex: sleep do dispositivo).
      // Quando a tab voltar ao foreground, o primeiro request autenticado dispara
      // tryRefresh() via apiFetch (401 → refresh automático).
      if (typeof document !== 'undefined' && document.hidden) return;

      const renewed = await refreshSession();
      if (renewed === null) {
        // Refresh token expirado ou inválido — encerra sessão
        await doLogout();
        setUser(null);
      }
      // Se sucesso, refreshSession já atualizou o access token em memória
      // (via setAccessToken em api-client). Não precisa atualizar o state de user
      // pois o perfil não mudou — apenas o JWT rotacionou.
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user]);

  const refresh = useCallback(async () => {
    const restored = await refreshSession();
    setUser(restored);
  }, []);

  const requireLogin = useCallback((why?: string): Promise<UserProfile> => {
    const current = getCurrentUser();
    if (current) return Promise.resolve(current);
    setReason(why);
    setModalOpen(true);
    return new Promise<UserProfile>((resolve, reject) => {
      pendingResolvers.current = { resolve, reject };
    });
  }, []);

  const handleSuccess = useCallback((u: UserProfile) => {
    setUser(u);
    setModalOpen(false);
    pendingResolvers.current?.resolve(u);
    pendingResolvers.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    pendingResolvers.current?.reject(new Error('login cancelado'));
    pendingResolvers.current = null;
  }, []);

  const logout = useCallback(async () => {
    await doLogout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    requireLogin,
    refresh,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && (
        <LoginModal
          reason={reason}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </AuthContext.Provider>
  );
}
