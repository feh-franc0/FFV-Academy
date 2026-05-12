'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** CSS selector for the element whose scroll progress we want to track. */
  containerSelector: string;
  color: string;
  onProgress?: (progress: number) => void;
}

export function ReadingProgressBar({ containerSelector, color, onProgress }: Props) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(containerSelector);
    if (!el) return;

    let lastReported = 0;
    let ticking = false;

    function compute() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = el.offsetHeight;
      if (total <= 0) return;
      // Fraction of the article that is already past the top of the viewport.
      const passed = Math.min(total, Math.max(0, -rect.top + viewport * 0.35));
      const ratio = Math.min(1, passed / total);
      setPct(Math.round(ratio * 100));
      if (onProgress && Math.abs(ratio - lastReported) > 0.02) {
        lastReported = ratio;
        onProgress(ratio);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    }

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [containerSelector, onProgress]);

  return (
    <div
      aria-hidden
      className="fixed top-14 left-0 right-0 z-40 pointer-events-none"
      style={{ height: 'clamp(2px, 0.4vh, 4px)', background: 'transparent' }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          transition: 'width 0.1s linear',
          boxShadow: `0 0 12px color-mix(in srgb, ${color} 60%, transparent)`,
        }}
      />
    </div>
  );
}
