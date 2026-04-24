'use client';

import { useEffect, useState } from 'react';
import { List, X } from 'lucide-react';

type Heading = { id: string; title: string };

interface MobileTocProps {
  containerSelector: string;
  accent?: string;
}

export function MobileToc({ containerSelector, accent = 'var(--ffv-blue)' }: MobileTocProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const nodes = container.querySelectorAll<HTMLElement>('section[id][data-section-title]');
    const list: Heading[] = [];
    nodes.forEach(n => {
      const id = n.id;
      const title = n.getAttribute('data-section-title') ?? '';
      if (id && title) list.push({ id, title });
    });
    setHeadings(list);

    if (list.length < 2) return;

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 1] },
    );

    list.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [containerSelector]);

  // Don't render if too few headings
  if (headings.length < 3) return null;

  return (
    <>
      {/* Floating trigger button — bottom right, above MobileNav */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Sumário do artigo"
        className="xl:hidden fixed z-30 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
        style={{
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          width: 44,
          height: 44,
          background: accent,
          color: 'var(--background)',
        }}
      >
        {open ? <X size={20} strokeWidth={2} /> : <List size={20} strokeWidth={2} />}
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <>
          <div
            className="xl:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setOpen(false)}
          />
          <div
            className="xl:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'var(--ffv-bg2)',
              borderTop: '1px solid var(--ffv-border)',
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <span
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ffv-muted)' }}
              >
                Neste artigo
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar sumário"
                className="p-1 rounded-md"
                style={{ color: 'var(--ffv-muted)' }}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <nav aria-label="Sumário do artigo" className="px-3 pb-2">
              <ul className="flex flex-col gap-0.5">
                {headings.map(h => {
                  const active = h.id === activeId;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2.5 rounded-lg transition-colors"
                        style={{
                          fontSize: 13,
                          lineHeight: 1.4,
                          color: active ? 'var(--foreground)' : 'var(--ffv-muted)',
                          background: active ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'transparent',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {h.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
