'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';

/**
 * AuthBadge no header.
 *  - Anônimo: botão "Entrar" → dispara requireLogin (magic-link)
 *  - Logado: avatar com iniciais → dropdown com Progresso / Revisar (SRS) /
 *    Preferências / Sair. Substituiu o link direto pra /preferencias.
 *
 * Decisão de UX (2026-05-26): consolida tudo o que era "stats no header"
 * (XP, streak, conquistas) dentro do dropdown do usuário, pra limpar o
 * header. Agora o aluno vê progresso quando QUERE, não permanentemente.
 */
export function AuthBadge() {
  const { user, isLoggedIn, requireLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (!isLoggedIn || !user) {
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

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0]!.toUpperCase())
    .slice(0, 2)
    .join('');

  async function handleLogout() {
    setOpen(false);
    await logout().catch(() => {});
    window.location.href = '/';
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.email}
        className="inline-flex items-center justify-center text-[11px] font-bold w-7 h-7 rounded-full hover:opacity-90"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 18%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
          color: 'var(--ffv-blue)',
          cursor: 'pointer',
        }}
      >
        {initials || '👤'}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            zIndex: 100,
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--ffv-border)' }}>
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              {user.name || user.email}
            </div>
            {user.name && (
              <div className="text-[11px] truncate" style={{ color: 'var(--ffv-muted)' }}>
                {user.email}
              </div>
            )}
          </div>
          <nav className="py-1">
            <DropdownLink href="/progresso" onClick={() => setOpen(false)} icon="📊">
              Meu progresso
            </DropdownLink>
            <DropdownLink href="/revisar" onClick={() => setOpen(false)} icon="🧠">
              Revisar (SRS)
            </DropdownLink>
            <DropdownLink href="/preferencias" onClick={() => setOpen(false)} icon="⚙️">
              Preferências
            </DropdownLink>
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80"
              style={{
                color: 'var(--ffv-red, #dc2626)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderTop: '1px solid var(--ffv-border)',
              }}
            >
              <span>🚪</span>
              <span className="font-semibold">Sair</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function DropdownLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:opacity-80"
      style={{ color: 'var(--foreground)' }}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
