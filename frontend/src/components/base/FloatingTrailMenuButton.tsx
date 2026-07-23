'use client';

import { Menu } from 'lucide-react';
import { useTrailOptional } from './TrailContext';

/**
 * FloatingTrailMenuButton — FAB (Floating Action Button) no canto inferior
 * direito que abre o `TrailSummaryDrawer` em mobile/tablet.
 *
 * Só renderiza se houver um `TrailProvider` ativo. Esconde no desktop (≥lg)
 * porque a sidebar fixa esquerda já mostra o sumário.
 *
 * Acessível: aria-controls aponta pro drawer, aria-expanded reflete o estado.
 */

export function FloatingTrailMenuButton() {
  const trail = useTrailOptional();

  if (!trail) return null;

  const { drawerOpen, toggleDrawer, theme, currentIndex, trail: trailData } = trail;

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-label={drawerOpen ? 'Fechar sumário da trilha' : 'Abrir sumário da trilha'}
      aria-controls="trail-summary-drawer"
      aria-expanded={drawerOpen}
      data-testid="floating-trail-menu-button"
      className="lg:hidden fixed flex items-center justify-center rounded-full transition-transform active:scale-95"
      style={{
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', // acima da MobileNav
        width: 56,
        height: 56,
        background: theme.accent,
        color: theme.paper,
        border: `1px solid ${theme.accent}`,
        boxShadow: '0 8px 24px rgba(28, 25, 23, 0.24)',
        zIndex: 60,
      }}
    >
      <Menu size={22} strokeWidth={2.2} aria-hidden />
      {/* Contador discreto: módulo atual / total. Útil pro usuário se orientar. */}
      <span
        className="font-mono"
        style={{
          position: 'absolute',
          bottom: -6,
          right: -6,
          minWidth: 24,
          height: 24,
          padding: '0 6px',
          fontSize: 10,
          fontWeight: 700,
          background: theme.paper,
          color: theme.accent,
          borderRadius: 12,
          border: `2px solid ${theme.accent}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '0.04em',
        }}
        aria-hidden
      >
        {currentIndex >= 0 ? currentIndex + 1 : '·'}/{trailData.modules.length}
      </span>
    </button>
  );
}
