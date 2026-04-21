'use client';

import { useState, useEffect, useCallback } from 'react';
import { PresentationMode } from './PresentationMode';

interface Props {
  title: string;
  slug: string;
  accent: string;
  trailName: string;
}

export function ModuleActions({ title, slug, accent, trailName }: Props) {
  const [presenting, setPresenting] = useState(false);

  const handlePrint = useCallback(() => {
    document.body.classList.add('ffv-printing');
    try {
      window.plausible?.('pdf-download', { props: { module: slug } });
    } catch { /* analytics opcional */ }
    window.print();
    setTimeout(() => document.body.classList.remove('ffv-printing'), 200);
  }, [slug]);

  const handlePresent = useCallback(() => {
    setPresenting(true);
    try {
      window.plausible?.('present-mode', { props: { module: slug } });
    } catch { /* analytics opcional */ }
  }, [slug]);

  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPresenting(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting]);

  return (
    <>
      <div className="flex items-center gap-2 ffv-no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors hover:opacity-90 active:scale-95"
          style={{
            borderColor: `${accent}40`,
            color: accent,
            background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          }}
          aria-label="Baixar PDF do módulo"
          title="Baixar como PDF (abre diálogo de impressão — escolha 'Salvar como PDF')"
        >
          <span aria-hidden>📄</span>
          <span>PDF</span>
        </button>
        <button
          type="button"
          onClick={handlePresent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors hover:opacity-90 active:scale-95"
          style={{
            borderColor: `${accent}40`,
            color: accent,
            background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          }}
          aria-label="Apresentar módulo em tela cheia"
          title="Apresentação fullscreen (setas pra navegar, ESC pra sair)"
        >
          <span aria-hidden>🖥️</span>
          <span>Apresentar</span>
        </button>
      </div>
      {presenting && (
        <PresentationMode
          title={title}
          trailName={trailName}
          accent={accent}
          onClose={() => setPresenting(false)}
        />
      )}
    </>
  );
}
