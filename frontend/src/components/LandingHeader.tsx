'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FfvLogo } from '@/components/ui/ffv-logo';

// LandingHeader v5 — smart hide/show on scroll.
//
// Comportamento:
//   - Scroll pra baixo (>= SCROLL_DELTA) → header esconde (translateY -100%).
//   - Scroll pra cima (>= SCROLL_DELTA) → header reaparece imediatamente.
//   - Sempre visível quando scrollY <= TOP_THRESHOLD.
//   - Transição suave (220ms ease).
//
// Padrão usado em Medium, YouTube mobile, Apple, Anthropic.

const TOP_THRESHOLD = 80; // sempre mostra header acima disso
const SCROLL_DELTA = 6;   // ignora scroll involuntário de poucos px

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const prev = lastScrollY.current;
      const delta = y - prev;

      setScrolled(y > 8);

      if (y <= TOP_THRESHOLD) {
        // Acima do threshold → sempre mostra
        setHidden(false);
      } else if (Math.abs(delta) >= SCROLL_DELTA) {
        // Movimento relevante → esconder se descendo, mostrar se subindo
        setHidden(delta > 0);
      }

      lastScrollY.current = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: 'var(--ffv-paper)',
        // Linha ink fina SEMPRE visível abaixo do header — vibe editorial.
        borderBottom: '1px solid var(--ffv-ink)',
        boxShadow: scrolled && !hidden
          ? '0 4px 16px -8px rgba(28, 25, 23, 0.12)'
          : 'none',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 200ms ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center group"
          style={{ textDecoration: 'none' }}
          aria-label="FFV Academy — voltar para a home"
        >
          {/* Mesma paleta do headline "pronta amanhã" — ink + amber editorial */}
          <FfvLogo size="md" accentColor="var(--ffv-amber)" textColor="var(--ffv-ink)" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          {/* "Bases" SEMPRE visível (era hidden sm:) — mobile precisa de hit-target ≥44px.
              Padding lateral compacto pra não brigar com o CTA dark no celular pequeno. */}
          <Link
            href="/bases"
            className="inline-flex items-center text-sm font-medium transition-colors min-h-[44px] px-3 sm:px-0 rounded"
            style={{ color: 'var(--ffv-muted)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--ffv-ink)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--ffv-muted)')}
          >
            Bases
          </Link>
          <Link
            href="/sobre"
            className="hidden md:inline-flex items-center text-sm transition-colors"
            style={{ color: 'var(--ffv-muted)', fontWeight: 500 }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--ffv-ink)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--ffv-muted)')}
          >
            Sobre
          </Link>
          <Link
            href="#solicitar-base"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: 'var(--ffv-ink)',
              color: '#fff',
              borderRadius: 8,
              letterSpacing: '-0.005em',
              boxShadow: '0 4px 14px -4px rgba(28, 25, 23, 0.4)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(28, 25, 23, 0.5)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 14px -4px rgba(28, 25, 23, 0.4)';
            }}
          >
            <span className="sm:hidden">Gerar jornada</span>
            <span className="hidden sm:inline">Criar minha jornada</span>
            <span aria-hidden style={{ fontSize: 12 }}>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

