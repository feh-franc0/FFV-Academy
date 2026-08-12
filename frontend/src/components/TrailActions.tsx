'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Trail } from '@/lib/curriculum';

interface Props {
  trail: Trail;
}

export function TrailActions({ trail }: Props) {
  const router = useRouter();
  const accent = trail.color;

  const handlePrint = useCallback(() => {
    document.body.classList.add('ffv-printing');
    try { window.plausible?.('pdf-trail-download', { props: { trail: trail.id } }); } catch {}
    window.print();
    setTimeout(() => document.body.classList.remove('ffv-printing'), 200);
  }, [trail.id]);

  const handlePresent = useCallback(() => {
    const first = trail.modules[0];
    if (!first) return;
    try { window.plausible?.('present-trail', { props: { trail: trail.id } }); } catch {}
    router.push(`/aprenda/${first.slug}?present=trail`);
  }, [trail, router]);

  return (
    <div className="flex items-center gap-2 ffv-no-print mt-4 flex-wrap">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors hover:opacity-90 active:scale-95"
        style={{
          borderColor: `${accent}40`,
          color: accent,
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
        }}
        title="Baixar sumário da trilha como PDF"
      >
        <span aria-hidden>📄</span>
        <span>PDF da trilha</span>
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
        title="Iniciar apresentação pelo primeiro módulo"
      >
        <span aria-hidden>🖥️</span>
        <span>Apresentar trilha</span>
      </button>
    </div>
  );
}
