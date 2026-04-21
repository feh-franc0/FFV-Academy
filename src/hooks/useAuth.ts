'use client';

/**
 * useAuth — hook de autenticação + gate pra produtos pagos.
 *
 * Expõe:
 * - `user`: perfil atual (ou null se não logado)
 * - `isLoggedIn`: atalho booleano
 * - `requireLogin(reason)`: abre o modal e resolve com UserProfile quando o
 *   user concluir o fluxo. Usado antes de ações que exigem conta (fazer
 *   simulado, emitir certificado).
 * - `logout()`: desloga e limpa storage
 *
 * O Provider vive em layout.tsx (`<AuthProvider>`) e gerencia o modal de login.
 */

import { createContext, useContext } from 'react';
import type { UserProfile } from '@/lib/auth';

export interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  requireLogin: (reason?: string) => Promise<UserProfile>;
  refresh: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
