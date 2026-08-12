'use client';

/**
 * TrailCertificateBanner — banner visível em landings de trilha quando o user
 * concluiu 100% dela. Permite emitir o certificado in-place sem precisar ir
 * para /progresso.
 *
 * Reusa o componente Certificate.tsx (PNG via Canvas + nome local).
 */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameState } from '@/hooks/useGameState';
// Import type-only — apagado no runtime. A trilha chega pronta como prop do
// Server Component (`/aprenda/[slug]/page.tsx`), que já a resolvia para o
// JSON-LD e a descartava. Até 11/ago/2026 este componente reimportava
// `CURRICULUM` completo (~92 KB gz) para achar de novo a mesma trilha, em
// TODA página de artigo.
import type { Trail } from '@/lib/curriculum';
import { readableTextColor } from '@/lib/readable-text';

// Este banner renderiza (com o cedo-return abaixo) em TODA página de artigo,
// mesmo para quem não concluiu a trilha. `Certificate` (canvas + currículo
// completo, para o texto de compartilhar) só é preciso quando o botão é
// clicado — estático, ele arrastava `CURRICULUM` para as 490 páginas.
const Certificate = dynamic(() => import('@/components/Certificate').then(m => ({ default: m.Certificate })), { ssr: false });

interface Props {
  trail: Trail | undefined;
}

export function TrailCertificateBanner({ trail }: Props) {
  const { state } = useGameState();
  const [open, setOpen] = useState(false);

  if (!state) return null;
  if (!trail) return null;
  const completed = new Set(state.completedModules);
  const allDone = trail.modules.every(m => completed.has(m.slug));
  if (!allDone) return null;

  return (
    <>
      <div
        className="my-6 p-5 rounded-xl flex items-center gap-4"
        style={{
          background: `color-mix(in srgb, ${trail.color} 12%, var(--ffv-bg2))`,
          border: `1px solid ${trail.color}50`,
        }}
      >
        <div style={{ fontSize: 38 }}>🏆</div>
        <div className="flex-1">
          <h3 className="text-base font-bold">Trilha concluída — você desbloqueou o certificado</h3>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {trail.name || trail.id} · 100% dos {trail.modules.length} módulos. Compartilhe no LinkedIn.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: trail.color, color: readableTextColor(trail.color) }}
        >
          Emitir certificado
        </button>
      </div>
      {open && <Certificate trailId={trail.id} onClose={() => setOpen(false)} />}
    </>
  );
}
