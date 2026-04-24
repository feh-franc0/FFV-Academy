'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  accent: string;
  emoji: string;
  children: ReactNode;
}

export function CheatsheetLayout({ title, subtitle, accent, emoji, children }: Props) {
  const handlePrint = useCallback(() => {
    document.body.classList.add('ffv-printing');
    window.print();
    setTimeout(() => document.body.classList.remove('ffv-printing'), 200);
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-6 py-10" data-article-root>
      <nav className="text-xs mb-6 ffv-no-print" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <Link href="/cheatsheets" style={{ color: 'var(--ffv-muted)' }}>Cheatsheets</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>{title}</span>
      </nav>

      <header className="mb-8 flex items-start gap-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2" style={{ color: accent }}>{title}</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="ffv-no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors hover:opacity-90"
          style={{
            borderColor: `${accent}40`,
            color: accent,
            background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          }}
        >
          <span aria-hidden>📄</span><span>Baixar PDF</span>
        </button>
      </header>

      <div className="h-px mb-6" style={{ background: 'var(--ffv-border)' }} />
      <div className="prose-ffv" data-article-content>{children}</div>
    </article>
  );
}
