'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reveal — entrada fade-up ao entrar no viewport (IntersectionObserver).
 * Padrão de landing pages premium (Linear, Vercel, Stripe).
 * Respeita prefers-reduced-motion: reduce → aparece sem animação.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Atraso do stagger em ms. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Sem IntersectionObserver (jsdom/SSR) ou com reduced-motion → aparece direto.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
