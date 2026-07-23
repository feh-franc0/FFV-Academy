'use client';

/**
 * motion.tsx — componentes leves de motion design.
 *
 * Princípios:
 *   - Listeners SÓ rodam em desktop (pointer:fine). Touch ignora pra evitar
 *     conflito com scroll + tap.
 *   - Respeita prefers-reduced-motion — componentes degradam pra static.
 *   - Performance: usa CSS variables + transform, sem state React em pointer
 *     moves (evita re-renders).
 *   - Cleanup correto em unmount.
 *
 * Os utilities CSS correspondentes vivem em globals.css (ffv-tilt, ffv-magnetic,
 * ffv-spotlight, ffv-ripple, ffv-word-reveal).
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

// ─── Helpers ───────────────────────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

// ─── TiltCard ──────────────────────────────────────────────────────────────

interface TiltCardProps {
  children: ReactNode;
  /** Intensidade do tilt em graus (default 8). */
  maxTilt?: number;
  /** Scale durante hover (default 1.02). */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  /** Forçar HTML tag (default 'div'). */
  as?: 'div' | 'article' | 'section';
}

/**
 * Card que reage à posição do mouse com rotação 3D suave. WOW factor
 * sem ser exagerado (limite de 8° por default, totalmente customizável).
 *
 * Mobile: degrada gracefully — sem tilt em touch devices.
 */
export function TiltCard({
  children,
  maxTilt = 8,
  scale = 1.02,
  className,
  style,
  as: Tag = 'div',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0..1
      const py = (e.clientY - rect.top) / rect.height;  // 0..1
      const rotY = (px - 0.5) * 2 * maxTilt;            // -maxTilt..maxTilt
      const rotX = -(py - 0.5) * 2 * maxTilt;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--tilt-x', `${rotX.toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${rotY.toFixed(2)}deg`);
        el.style.setProperty('--tilt-scale', String(scale));
      });
    };
    const handleLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      el.style.setProperty('--tilt-scale', '1');
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(raf);
    };
  }, [maxTilt, scale]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      className={['ffv-tilt', className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </Comp>
  );
}

// ─── MagneticButton ────────────────────────────────────────────────────────

interface MagneticButtonProps {
  children: ReactNode;
  /** Força da atração em px (default 8). */
  strength?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * Botão magnético — o conteúdo desliza levemente em direção ao cursor
 * quando ele entra na área. Subtle mas chama atenção. Bom pra CTAs primários.
 */
export function MagneticButton({
  children,
  strength = 8,
  href,
  onClick,
  className,
  style,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mag-x', `${(dx * strength).toFixed(1)}px`);
        el.style.setProperty('--mag-y', `${(dy * strength).toFixed(1)}px`);
      });
    };
    const handleLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  const inner = (
    <span
      ref={ref}
      className={['ffv-magnetic inline-flex items-center justify-center gap-2', className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
      {inner}
    </button>
  );
}

// ─── Spotlight ─────────────────────────────────────────────────────────────

interface SpotlightProps {
  children: ReactNode;
  /** Cor da luz (default: var(--ffv-amber)). */
  color?: string;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'article' | 'section';
}

/**
 * Área cuja iluminação radial segue o cursor. Idem TiltCard — wow no desktop,
 * neutro no mobile.
 */
export function Spotlight({ children, color, className, style, as: Tag = 'div' }: SpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x.toFixed(1)}%`);
        el.style.setProperty('--my', `${y.toFixed(1)}%`);
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const styleWithSpot: CSSProperties = color
    ? { ...style, ['--spot' as string]: color }
    : style ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      className={['ffv-spotlight', className].filter(Boolean).join(' ')}
      style={styleWithSpot}
    >
      {children}
    </Comp>
  );
}

// ─── AnimatedHeadline ──────────────────────────────────────────────────────

interface AnimatedHeadlineProps {
  /** O texto a animar. Será dividido por espaços em palavras. */
  text: string;
  /** Tag HTML (default h1). */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  style?: CSSProperties;
  /** Habilita caret piscando no final do texto. */
  withCaret?: boolean;
}

/**
 * Headline em que cada PALAVRA aparece sequencialmente com 60ms de delay.
 * Conecta com o data-reveal/data-reveal-words do CSS.
 */
export function AnimatedHeadline({
  text,
  as: Tag = 'h1',
  className,
  style,
  withCaret = false,
}: AnimatedHeadlineProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = 'in';
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(/(\s+)/); // mantém espaços
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      data-reveal
      data-reveal-words
      className={[withCaret ? 'ffv-caret' : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} className="ffv-word-reveal">
            {w}
          </span>
        ),
      )}
    </Comp>
  );
}

// ─── Ripple effect on click ────────────────────────────────────────────────

/**
 * Hook helper — adiciona efeito ripple Material-style a um elemento ao clicar.
 * Use em qualquer elemento clickable. Cleanup é automático.
 */
export function useRipple<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    if (!el.classList.contains('ffv-ripple')) el.classList.add('ffv-ripple');

    const handleClick = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'ffv-ripple-wave';
      const size = Math.max(rect.width, rect.height);
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - rect.left - size / 2}px`;
      wave.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(wave);
      setTimeout(() => wave.remove(), 800);
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []);

  return ref;
}
