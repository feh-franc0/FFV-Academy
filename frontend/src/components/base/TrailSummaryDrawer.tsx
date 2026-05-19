'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useTrail } from './TrailContext';

/**
 * TrailSummaryDrawer — sumário da trilha que escorrega da direita em mobile.
 *
 * Disparado pelo `FloatingTrailMenuButton` (FAB no canto inferior direito).
 * Em desktop a sidebar fixa à esquerda continua existindo (renderizada pelo
 * `BaseModule` diretamente); este drawer é a versão mobile-first do mesmo
 * conteúdo.
 *
 * UX:
 *  - Abre da direita com slide-in
 *  - Backdrop semi-transparente fecha ao clicar
 *  - ESC fecha
 *  - Bloqueia scroll do body enquanto aberto
 *  - Item atual destacado + check em módulos concluídos
 */

export function TrailSummaryDrawer() {
  const {
    trail,
    currentModule,
    basePath,
    baseName,
    theme,
    completedSlugs,
    drawerOpen,
    closeDrawer,
  } = useTrail();

  // ESC fecha
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closeDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(28, 25, 23, 0.5)',
          backdropFilter: 'blur(2px)',
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 70,
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Sumário da trilha ${trail.title}`}
        data-testid="trail-summary-drawer"
        data-state={drawerOpen ? 'open' : 'closed'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(86vw, 360px)',
          background: theme.paper,
          color: theme.ink,
          borderLeft: `1px solid ${theme.border}`,
          boxShadow: '-12px 0 32px rgba(28, 25, 23, 0.12)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <header
          className="flex items-start justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div>
            <Link
              href={basePath}
              onClick={closeDrawer}
              className="inline-flex items-center gap-1 text-[11px] font-mono uppercase"
              style={{
                color: theme.muted,
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              ← Voltar para {baseName}
            </Link>
            <div className="flex items-center gap-2 mt-3">
              <span style={{ fontSize: 22 }}>{trail.icon}</span>
              <div>
                <p
                  className="font-mono uppercase"
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    color: theme.accent,
                    fontWeight: 700,
                  }}
                >
                  Trilha
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.15,
                    marginTop: 2,
                  }}
                >
                  {trail.title}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fechar sumário"
            className="rounded-md p-1.5 transition-colors"
            style={{
              color: theme.muted,
              border: `1px solid ${theme.border}`,
              background: theme.cream,
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        {/* Lista */}
        <ol className="flex flex-col gap-0.5 list-none p-3 m-0 flex-1">
          {trail.modules.map((mod, idx) => {
            const isCurrent = mod.slug === currentModule.slug;
            const isCompleted = completedSlugs.has(mod.slug);
            return (
              <li key={mod.slug}>
                <Link
                  href={`${basePath}/${mod.slug}`}
                  onClick={closeDrawer}
                  className="flex items-start gap-2 px-3 py-2 rounded-md transition-colors"
                  style={{
                    textDecoration: 'none',
                    color: isCurrent ? theme.ink : isCompleted ? theme.muted : '#44403c',
                    background: isCurrent ? theme.cream : 'transparent',
                    fontWeight: isCurrent ? 600 : 400,
                    borderLeft: isCurrent
                      ? `3px solid ${theme.accent}`
                      : '3px solid transparent',
                    paddingLeft: 9,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: isCurrent ? theme.accent : theme.muted,
                      minWidth: 24,
                      marginTop: 3,
                    }}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={2.5} /> : String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.4 }}>{mod.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* Footer attribution-style */}
        <footer
          className="px-5 py-4 text-[10px] italic"
          style={{
            color: theme.muted,
            borderTop: `1px solid ${theme.border}`,
            fontFamily: 'var(--font-serif)',
            lineHeight: 1.5,
          }}
        >
          {trail.modules.length} {trail.modules.length === 1 ? 'módulo' : 'módulos'} ·{' '}
          {completedSlugs.size > 0
            ? `${completedSlugs.size} concluído${completedSlugs.size === 1 ? '' : 's'}`
            : 'comece pelo módulo 01'}
        </footer>
      </aside>
    </>
  );
}
