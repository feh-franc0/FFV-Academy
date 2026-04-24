'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GLOSSARY } from '@/lib/glossary';

interface GlossaryTermProps {
  id: string;
  children: React.ReactNode;
}

export function GlossaryTerm({ id, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = GLOSSARY[id];

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="border-b border-dotted transition-colors"
        style={{ borderColor: 'var(--ffv-muted)', color: 'inherit' }}
        aria-label={`Definição: ${id}`}
      >
        {children}
      </button>
      {open && (
        <span
          className="absolute left-0 top-full mt-1 z-50 p-3 rounded-lg text-xs leading-5 shadow-lg"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            width: 280,
            maxWidth: '90vw',
          }}
        >
          <span className="font-bold block mb-1">{entry.term}</span>
          <span style={{ color: 'var(--ffv-muted)' }}>{entry.short}</span>
          <Link
            href={`/glossario#${id}`}
            className="block mt-2 text-xs underline"
            style={{ color: 'var(--ffv-blue)' }}
          >
            Ver no glossário →
          </Link>
        </span>
      )}
    </span>
  );
}
