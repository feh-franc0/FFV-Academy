'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import { getCurrentUser, logout as doLogout, type UserProfile } from '@/lib/auth';
import { LoginModal } from './LoginModal';

/**
 * Provider global de auth. Mantém o UserProfile em state e orquestra o
 * modal de login via promise: `requireLogin(reason)` abre o modal e resolve
 * quando o usuário conclui (ou rejeita se cancelar).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();

  // Promise pendente — resolvida quando o modal fecha com sucesso ou rejeitada se cancelar.
  const pendingResolvers = useRef<{
    resolve: (user: UserProfile) => void;
    reject: (err: Error) => void;
  } | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
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

  const logout = useCallback(() => {
    doLogout();
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
