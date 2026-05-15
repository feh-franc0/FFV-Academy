/**
 * Layout do painel /admin — sidebar fixa + área de conteúdo.
 *
 * Gate de acesso: usuário precisa estar logado E ter role='admin'.
 * Não-admins veem mensagem clara e botão pra voltar pra home. Não há rota
 * "secreta" — quem chega aqui sem permissão entende por quê.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Usuários' },
  { href: '/admin/questions', label: 'Questões CLF' },
  { href: '/admin/curriculum', label: 'Currículo' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/cheatsheets', label: 'Cheatsheets' },
  { href: '/admin/playlists', label: 'Playlists' },
  { href: '/admin/audit', label: 'Audit Log' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, requireLogin } = useAuth();
  const pathname = usePathname();

  const handleLogin = useCallback(() => {
    requireLogin('acessar o painel admin').catch(() => {});
  }, [requireLogin]);

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-sm text-center flex flex-col items-center gap-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold">Acesso restrito</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Esta área é apenas para administradores.
          </p>
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)', color: '#0d1117' }}
          >
            Fazer login →
          </button>
          <Link href="/" className="text-sm underline" style={{ color: 'var(--ffv-muted)' }}>
            Voltar pra home
          </Link>
        </div>
      </main>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Sem permissão</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)' }}>
            Sua conta não tem permissão de administrador. Se você acredita
            que isso é um erro, entre em contato com o time.
          </p>
          <Link href="/" className="underline" style={{ color: 'var(--ffv-blue)' }}>
            Voltar pra home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--background)' }}>
      {/* Mobile top bar — sticky com nav horizontal */}
      <header
        className="md:hidden border-b p-3 flex items-center gap-3 overflow-x-auto sticky top-0 z-10"
        style={{ borderColor: 'var(--ffv-border)', background: 'var(--ffv-bg2)' }}
      >
        <Link href="/" className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--ffv-muted)' }}>
          ← FFV
        </Link>
        <span className="text-sm font-bold flex-shrink-0">Admin</span>
        <nav className="flex gap-1 flex-shrink-0">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1 rounded-md text-xs whitespace-nowrap"
                style={{
                  background: active ? 'var(--ffv-blue)' : 'transparent',
                  color: active ? 'white' : 'var(--foreground)',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:block w-56 flex-shrink-0 border-r p-4"
        style={{ borderColor: 'var(--ffv-border)', background: 'var(--ffv-bg2)' }}
      >
        <div className="mb-6">
          <Link href="/" className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--ffv-muted)' }}>
            ← FFV Academy
          </Link>
          <h2 className="text-lg font-bold mt-1">Admin</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm"
                style={{
                  background: active ? 'var(--ffv-blue)' : 'transparent',
                  color: active ? 'white' : 'var(--foreground)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 pt-4 border-t text-xs" style={{ borderColor: 'var(--ffv-border)', color: 'var(--ffv-muted)' }}>
          Logado como <strong>{user.email}</strong>
        </div>
      </aside>
      <div className="flex-1 p-6 sm:p-8 overflow-x-auto">{children}</div>
    </div>
  );
}
