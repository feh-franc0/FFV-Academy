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
  /**
   * `true` enquanto a sessão ainda não foi restaurada — e `true` também no
   * SERVIDOR e no primeiro render do cliente, de propósito.
   *
   * Existe porque `RequireAuth` decidia com `typeof window === 'undefined'`
   * dentro do render: o servidor entregava o esqueleto e o primeiro render do
   * cliente entregava a tela de login, o que é exatamente o primeiro item da
   * mensagem de erro de hidratação do React. Estado real de carregamento faz os
   * dois concordarem; ramo por ambiente nunca faz.
   */
  carregando: boolean;
  requireLogin: (reason?: string) => Promise<UserProfile>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
