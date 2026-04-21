'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

interface Slide {
  title: string;
  html: string;
}

interface Props {
  title: string;
  trailName: string;
  accent: string;
  onClose: () => void;
}

export function PresentationMode({ title, trailName, accent, onClose }: Props) {
  const slides = useMemo<Slide[]>(() => {
    if (typeof document === 'undefined') return [];
    const root = document.querySelector('[data-article-content]');
    if (!root) return [];
    const cover: Slide = {
      title,
      html: `<div class="ffv-present-cover">
        <div class="ffv-present-trail">${escapeHtml(trailName)}</div>
        <div class="ffv-present-cover-title">${escapeHtml(title)}</div>
        <div class="ffv-present-hint">setas ← → · ESC fecha</div>
      </div>`,
    };
    const sections = Array.from(root.querySelectorAll('section[data-section-title]'));
    const contentSlides: Slide[] = sections.map(s => {
      const secTitle = s.getAttribute('data-section-title') ?? '';
      const inner = s.innerHTML;
      return { title: secTitle, html: inner };
    });
    return [cover, ...contentSlides];
  }, [title, trailName]);

  const [idx, setIdx] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setIdx(i => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIdx(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') setIdx(0);
      else if (e.key === 'End') setIdx(total - 1);
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [next, prev, total]);

  if (total === 0) return null;
  const slide = slides[idx];

  return (
    <div
      role="dialog"
      aria-label="Modo apresentação"
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}
    >
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--ffv-border)' }}
      >
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {trailName}
        </div>
        <div className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          {idx + 1} / {total} · ← → navega · ESC fecha · F fullscreen
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1 rounded-md border hover:opacity-80"
          style={{ borderColor: 'var(--ffv-border)' }}
          aria-label="Sair da apresentação"
        >
          ✕ Sair
        </button>
      </header>

      <main className="flex-1 overflow-auto flex items-start justify-center py-10 px-8">
        <article className="max-w-4xl w-full">
          {idx > 0 && (
            <h2 className="text-2xl font-bold mb-6" style={{ color: accent }}>
              {slide.title}
            </h2>
          )}
          <div
            className="ffv-present-content prose-ffv"
            style={{ fontSize: idx === 0 ? undefined : '1.125rem', lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        </article>
      </main>

      <footer
        className="flex items-center justify-between px-6 py-3 border-t"
        style={{ borderColor: 'var(--ffv-border)' }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0}
          className="px-4 py-1.5 text-sm rounded-md border disabled:opacity-40"
          style={{ borderColor: 'var(--ffv-border)' }}
        >
          ← Anterior
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className="w-2 h-2 rounded-full transition-opacity"
              style={{
                background: i === idx ? accent : 'var(--ffv-border)',
                opacity: i === idx ? 1 : 0.5,
              }}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={idx === total - 1}
          className="px-4 py-1.5 text-sm rounded-md border disabled:opacity-40"
          style={{ borderColor: 'var(--ffv-border)' }}
        >
          Próximo →
        </button>
      </footer>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] ?? c));
}
