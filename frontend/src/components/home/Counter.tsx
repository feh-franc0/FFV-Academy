'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counter — anima de 0 até `to` com easeOutCubic quando entra no viewport.
 * Respeita prefers-reduced-motion e degrada em SSR/test (mostra valor final).
 *
 * O estado inicial é `to`, não 0: o HTML servido anunciava "0 artigos, 0
 * trilhas, 0 badges" — a escola inteira zerada — porque a animação começava
 * do zero ANTES do observer confirmar que o elemento entrou na tela. Só quem
 * rola até o número vê a contagem; quem não rola, ou o rastreador de busca
 * lendo o HTML estático, vê o valor real desde o primeiro render.
 */
export function Counter({
  to,
  duration = 1400,
  suffix = '',
  className,
  style,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [val, setVal] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined' || !ref.current) {
      setVal(to);
      return;
    }
    const run = () => {
      if (started.current) return;
      started.current = true;
      setVal(0);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {val.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}
