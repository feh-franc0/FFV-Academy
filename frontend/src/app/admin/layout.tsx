/**
 * Layout do painel /admin — sidebar fixa + área de conteúdo.
 *
 * Gate de acesso: usuário precisa estar logado E ter role='admin'.
 * Não-admins veem mensagem clara e botão pra voltar pra home. Não há rota
 * "secreta" — quem chega aqui sem permissão entende por quê.
 *
 * A ENFORCEMENT real é o backend: toda rota `/api/v1/admin*` está atrás de
 * `middleware.RequireAdmin` (fail-closed), então ninguém sem o JWT correto
 * consegue de fato ler ou mudar dado nenhum — este gate aqui é sobre não
 * MOSTRAR a casca da UI administrativa pra quem não devia vê-la (achado P-06
 * da auditoria de segurança de 11/ago/2026).
 *
 * Antes desta correção, o gate confiava em `user.role` do AuthContext, que
 * pode vir do PERFIL CACHEADO em localStorage (`refreshSession` cai pra
 * cache em erro de rede — ver `lib/auth.ts`). Alguém editando `role` pra
 * `'admin'` direto no localStorage via devtools via o console do navegador
 * fazia o shell inteiro renderizar (sem poder fazer nada real, já que o
 * backend recusa, mas a casca aparecia). Agora o shell só renderiza depois
 * de `syncProfileFromServer()` — uma chamada de rede de verdade
 * (`POST /api/v1/auth/refresh`), sem fallback pra cache — confirmar
 * `role==='admin'` a partir do que o servidor diz agora.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { syncProfileFromServer } from '@/lib/auth';
import { useCallback, useEffect, useState } from 'react';

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
  const { user, isLoggedIn, carregando, requireLogin } = useAuth();
  const pathname = usePathname();
  // null = ainda não confirmado pelo servidor; true/false = resultado real
  // de syncProfileFromServer(). Nunca decide o gate por `user.role` sozinho.
  const [adminConfirmado, setAdminConfirmado] = useState<boolean | null>(null);

  const handleLogin = useCallback(() => {
    requireLogin('acessar o painel admin').catch(() => {});
  }, [requireLogin]);

  useEffect(() => {
    if (carregando || !isLoggedIn) return;
    let cancelled = false;
    syncProfileFromServer().then(profile => {
      if (!cancelled) setAdminConfirmado(profile?.role === 'admin');
    });
    return () => { cancelled = true; };
  }, [carregando, isLoggedIn]);

  // Mesma guarda de RequireAuth.tsx: sem isto, um admin abrindo /admin por URL
  // direta via reload vê "🔒 Acesso restrito" por um instante antes da sessão
  // restaurar — carregando===true nos dois lados (servidor e cliente) até o
  // AuthProvider terminar restoreSession.
  if (carregando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true" aria-label="Verificando autenticação…">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--ffv-border)', borderTopColor: 'var(--ffv-red)' }}
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-sm text-center flex flex-col items-center gap-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold">Acesso restrito</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Esta área é apenas para administradores.
          </p>
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, var(--ffv-blue) 0%, var(--ffv-purple) 100%)', color: 'var(--primary-foreground)' }}
          >
            Fazer login →
          </button>
          <Link href="/" className="text-sm underline" style={{ color: 'var(--ffv-muted)' }}>
            Voltar pra home
          </Link>
        </div>
      </div>
    );
  }

  // adminConfirmado === null: ainda esperando syncProfileFromServer(). Não
  // renderiza o shell nem "sem permissão" enquanto não houver uma resposta
  // REAL do backend — evita tanto o flash de "sem permissão" pra um admin
  // de verdade quanto o vazamento do shell pra alguém com cache tampered.
  if (adminConfirmado === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true" aria-label="Confirmando permissão de administrador…">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--ffv-border)', borderTopColor: 'var(--ffv-red)' }}
        />
      </div>
    );
  }

  if (!adminConfirmado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--background)' }}>
      {/* Mobile top bar — sticky com nav horizontal */}
      <header
        tabIndex={0}
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
                  color: active ? 'var(--primary-foreground)' : 'var(--foreground)',
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
                  color: active ? 'var(--primary-foreground)' : 'var(--foreground)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 pt-4 border-t text-xs" style={{ borderColor: 'var(--ffv-border)', color: 'var(--ffv-muted)' }}>
          Logado como <strong>{user?.email}</strong>
        </div>
      </aside>
      <div tabIndex={0} className="flex-1 p-6 sm:p-8 overflow-x-auto">{children}</div>
    </div>
  );
}
