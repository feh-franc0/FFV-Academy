'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import {
  getCurrentUser,
  handleGoogleCallback,
  logout as doLogout,
  refreshSession,
  type UserProfile,
} from '@/lib/auth';
import { LoginModal } from './LoginModal';

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

  // Tenta restaurar sessão: primeiro verifica callback do Google OAuth (hash),
  // depois tenta renovar via refresh token (cookie HttpOnly) ou localStorage.
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      // Callback do Google: #access_token=... presente na URL?
      const googleUser = await handleGoogleCallback();
      if (googleUser) {
        if (!cancelled) setUser(googleUser);
        return;
      }
      const restored = await refreshSession();
      if (!cancelled) setUser(restored);
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

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
