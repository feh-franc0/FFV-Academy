'use client';

/**
 * TrailCertificateBanner — banner visível em landings de trilha quando o user
 * concluiu 100% dela. Permite emitir o certificado in-place sem precisar ir
 * para /progresso.
 *
 * Reusa o componente Certificate.tsx (PNG via Canvas + nome local).
 */
import { useState } from 'react';
import { Certificate } from '@/components/Certificate';
import { useGameState } from '@/hooks/useGameState';
import { CURRICULUM } from '@/lib/curriculum';

interface Props {
  trailId: string;
}

export function TrailCertificateBanner({ trailId }: Props) {
  const { state } = useGameState();
  const [open, setOpen] = useState(false);

  if (!state) return null;
  const trail = CURRICULUM.find(t => t.id === trailId);
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
          style={{ background: trail.color, color: 'white' }}
        >
          Emitir certificado
        </button>
      </div>
      {open && <Certificate trailId={trailId} onClose={() => setOpen(false)} />}
    </>
  );
}
