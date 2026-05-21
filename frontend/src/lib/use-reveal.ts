'use client';

/**
 * useReveal — hook compartilhado de scroll-triggered reveal.
 *
 * Versão callback ref (2026-05-21) — corrige bug onde elementos que montavam
 * APÓS o primeiro render (ex.: BasesClient renderiza <ul> dos cards só
 * depois do fetch async) ficavam com `opacity: 0` permanentemente porque o
 * IntersectionObserver era criado no `useEffect([])` quando ref.current
 * ainda era null.
 *
 * Callback ref:
 *   - React invoca o callback com o nó DOM assim que ele monta
 *   - Invoca de novo com `null` quando desmonta (cleanup)
 *   - Suporta nodes que aparecem/desaparecem condicionalmente
 *
 * Padrão de uso:
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} data-reveal>…</div>
 *
 * Quando o elemento entra em ~15% da viewport, `data-reveal="in"` é setado
 * e o CSS dispara as animações (fade-up, stagger, word-reveal, etc.).
 */

import { useCallback, useRef } from 'react';

export interface UseRevealOptions {
  /** Threshold do IntersectionObserver (0..1). Default 0.15. */
  threshold?: number;
  /** rootMargin do IntersectionObserver. Default `'0px 0px -8% 0px'`. */
  rootMargin?: string;
}

export function useReveal<T extends HTMLElement = HTMLElement>(
  opts: UseRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = opts;
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      // jsdom não implementa IntersectionObserver — fallback marca como
      // "in" imediatamente. Em produção/dev no browser, observer real roda.
      if (typeof IntersectionObserver === 'undefined') {
        node.dataset.reveal = 'in';
        return;
      }

      const io = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).dataset.reveal = 'in';
              io.unobserve(e.target);
            }
          });
        },
        { threshold, rootMargin },
      );
      io.observe(node);
      observerRef.current = io;
    },
    [threshold, rootMargin],
  );
}
