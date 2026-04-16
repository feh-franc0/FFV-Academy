'use client';

import { useEffect, useState } from 'react';

type Heading = { id: string; title: string };

interface ArticleTocProps {
  /** CSS selector of the content container to scan for sections. */
  containerSelector: string;
  accent?: string;
}

export function ArticleToc({ containerSelector, accent = 'var(--ffv-blue)' }: ArticleTocProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    function scan() {
      const nodes = container!.querySelectorAll<HTMLElement>('section[id][data-section-title]');
      const list: Heading[] = [];
      nodes.forEach(n => {
        const id = n.id;
        const title = n.getAttribute('data-section-title') ?? '';
        if (id && title) list.push({ id, title });
      });
      setHeadings(list);
      return list;
    }

    const list = scan();
    if (list.length === 0) return;

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          setActiveId(id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0, 1],
      }
    );

    list.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [containerSelector]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Sumário do artigo" style={{ width: '100%' }}>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--ffv-muted)',
          marginBottom: 10,
        }}
      >
        Neste artigo
      </div>
      <ul className="flex flex-col gap-1" style={{ borderLeft: '1px solid var(--ffv-border)' }}>
        {headings.map(h => {
          const active = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className="block py-1.5 pl-3 transition-colors"
                style={{
                  fontSize: 12,
                  color: active ? 'var(--foreground)' : 'var(--ffv-muted)',
                  borderLeft: `2px solid ${active ? accent : 'transparent'}`,
                  marginLeft: -1,
                  fontWeight: active ? 600 : 400,
                  lineHeight: 1.5,
                }}
              >
                {h.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
