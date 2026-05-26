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
  /**
   * Fallback de safety — se o IntersectionObserver não disparar em N ms
   * (porque o elemento monta sempre fora da viewport, como uma lista
   * grande abaixo da fold no mobile), força `data-reveal="in"` mesmo
   * assim pra não deixar conteúdo invisível por bug de IO. Default 800ms.
   *
   * Bug que isso resolve (2026-05-25): em /bases no mobile, o <ul> dos
   * cards monta abaixo da fold inicial. Listas grandes (filter "Todas"
   * com 17 itens) sobravam invisíveis até o user scrollar pra elas —
   * o que muitos usuários nunca faziam, achando que a aba estava vazia.
   * Listas menores (8-9 itens) ainda apareciam porque cabiam na primeira
   * dobra após qualquer scroll mínimo do hero, então o bug parecia ser
   * "só na aba Todas". Setar 0 desabilita o fallback.
   */
  fallbackMs?: number;
}

export function useReveal<T extends HTMLElement = HTMLElement>(
  opts: UseRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = '0px 0px -8% 0px', fallbackMs = 800 } = opts;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (node: T | null) => {
      // Limpa qualquer observer/timer pendente — callback ref pode rodar
      // múltiplas vezes (cleanup de unmount, re-mount em outro nó, etc).
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
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
              if (fallbackTimerRef.current) {
                clearTimeout(fallbackTimerRef.current);
                fallbackTimerRef.current = null;
              }
            }
          });
        },
        { threshold, rootMargin },
      );
      io.observe(node);
      observerRef.current = io;

      // Safety net: se IO não disparar em fallbackMs, força "in".
      // Evita conteúdo permanentemente invisível em listas abaixo da fold.
      if (fallbackMs > 0) {
        fallbackTimerRef.current = setTimeout(() => {
          if (node.dataset.reveal !== 'in') {
            node.dataset.reveal = 'in';
            io.disconnect();
            observerRef.current = null;
          }
          fallbackTimerRef.current = null;
        }, fallbackMs);
      }
    },
    [threshold, rootMargin, fallbackMs],
  );
}
