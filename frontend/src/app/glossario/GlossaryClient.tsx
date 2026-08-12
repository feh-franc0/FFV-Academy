'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GLOSSARY, GLOSSARY_SORTED } from '@/lib/glossary';

export function GlossaryClient() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? GLOSSARY_SORTED.filter(([id, entry]) =>
        entry.term.toLowerCase().includes(search.toLowerCase()) ||
        entry.short.toLowerCase().includes(search.toLowerCase()) ||
        id.includes(search.toLowerCase())
      )
    : GLOSSARY_SORTED;

  return (
    <div className="max-w-2xl mx-auto px-6 pb-20">
      <nav
        className="flex items-center gap-1.5 text-xs pt-8 mb-8"
        style={{ color: 'var(--ffv-muted)' }}
        aria-label="Migalha de pão"
      >
        <Link href="/" className="inline-flex items-center min-h-[24px] transition-colors hover:underline">FFV Academy</Link>
        <span aria-hidden>/</span>
        <span style={{ color: 'var(--foreground)' }}>Glossário</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">📖 Glossário Técnico</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {GLOSSARY_SORTED.length} termos — IA, cloud, engenharia e sistemas distribuídos em PT-BR.
        </p>
      </header>

      <input
        type="text"
        aria-label="Buscar termo no glossário"
        placeholder="Buscar termo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-8 px-4 py-2.5 rounded-lg text-sm transition-colors"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          color: 'var(--foreground)',
        }}
      />

      {filtered.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>Nenhum termo encontrado.</p>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map(([id, entry]) => (
          <div
            key={id}
            id={id}
            className="p-4 rounded-xl scroll-mt-24"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <h2 className="text-sm font-bold mb-1">{entry.term}</h2>
            <p className="text-xs leading-5" style={{ color: 'var(--ffv-muted)' }}>{entry.short}</p>
            {entry.long && (
              <p className="text-xs leading-5 mt-2">{entry.long}</p>
            )}
            {entry.related && entry.related.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {entry.related.map(r => {
                  const rel = GLOSSARY[r];
                  return rel ? (
                    <a
                      key={r}
                      href={`#${r}`}
                      className="inline-flex items-center min-h-[24px] text-xs px-2.5 py-1 rounded-full transition-colors"
                      style={{
                        background: 'var(--ffv-bg3)',
                        border: '1px solid var(--ffv-border)',
                        color: 'var(--ffv-blue)',
                      }}
                    >
                      {rel.term}
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
