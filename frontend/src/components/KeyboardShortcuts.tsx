'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const SHORTCUTS = [
  { keys: ['?'], desc: 'Mostrar/ocultar este painel' },
  { keys: ['/'], desc: 'Busca rápida (Command Palette)' },
  { keys: ['b'], desc: 'Marcar/desmarcar favorito' },
  { keys: ['f'], desc: 'Modo foco (oculta navegação)' },
  { keys: ['Esc'], desc: 'Fechar modal / sair do foco' },
  { keys: ['j'], desc: 'Próximo módulo na trilha' },
  { keys: ['k'], desc: 'Módulo anterior na trilha' },
  { keys: ['g', 'p'], desc: 'Ir para /progresso' },
  { keys: ['g', 'r'], desc: 'Ir para /revisar' },
  { keys: ['g', 'h'], desc: 'Ir para o início' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
      tabIndex={-1}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'color-mix(in srgb, #000 55%, transparent)', backdropFilter: 'blur(8px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="relative rounded-2xl w-full max-w-md"
        style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', padding: '28px 24px' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md"
          style={{ color: 'var(--ffv-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <Keyboard size={18} style={{ color: 'var(--ffv-blue)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Atalhos de teclado</h2>
        </div>

        <div className="flex flex-col gap-2">
          {SHORTCUTS.map(({ keys, desc }) => (
            <div key={keys.join('+')} className="flex items-center justify-between gap-4">
              <span style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>{desc}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {keys.map((k, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {i > 0 && <span style={{ fontSize: 10, color: 'var(--ffv-muted)' }}>then</span>}
                    <kbd
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-roboto-mono, monospace)',
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: 'var(--ffv-bg2)',
                        border: '1px solid var(--ffv-border)',
                        color: 'var(--foreground)',
                        fontWeight: 500,
                      }}
                    >
                      {k}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Pressione <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>?</kbd> para abrir a qualquer momento
        </p>
      </div>
    </div>
  );
}
