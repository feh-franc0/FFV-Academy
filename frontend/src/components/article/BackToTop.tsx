'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTop — botão flutuante que aparece após 50% scroll na página.
 *
 * Particularmente útil em /aprenda onde artigos passam de 2000 linhas e
 * voltar ao topo manualmente vira fricção. Mobile-friendly (54×54px) com
 * label visualmente oculta para screen readers.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return setVisible(false);
      setVisible(scrolled / docHeight > 0.5);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo da página"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed z-40 transition-all"
      style={{
        bottom: 'calc(132px + env(safe-area-inset-bottom, 0px))',
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-full)',
        background: 'color-mix(in srgb, var(--ffv-bg2) 96%, transparent)',
        border: '1px solid var(--ffv-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: 'var(--foreground)',
        boxShadow: 'var(--ffv-shadow-lift)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ArrowUp size={20} strokeWidth={2.2} />
    </button>
  );
}
