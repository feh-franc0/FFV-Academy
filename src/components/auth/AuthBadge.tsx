'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

/**
 * Badge discreto no GameHUD mostrando estado de auth.
 * - Logado: iniciais do user → link pra /preferencias
 * - Deslogado: ícone "entrar" → dispara requireLogin
 */
export function AuthBadge() {
  const { user, isLoggedIn, requireLogin } = useAuth();

  if (isLoggedIn && user) {
    const initials = user.name
      .split(/\s+/)
      .filter(Boolean)
      .map(p => p[0]!.toUpperCase())
      .slice(0, 2)
      .join('');

    return (
      <Link
        href="/preferencias"
        title={`Preferências (${user.email})`}
        className="inline-flex items-center justify-center text-[11px] font-bold w-7 h-7 rounded-full hover:opacity-90"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 18%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
          color: 'var(--ffv-blue)',
        }}
      >
        {initials || '👤'}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => requireLogin('acessar sua conta').catch(() => {})}
      className="text-[11px] font-semibold px-2.5 py-1 rounded-md hover:opacity-90"
      style={{
        background: 'transparent',
        color: 'var(--ffv-muted)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      Entrar
    </button>
  );
}
