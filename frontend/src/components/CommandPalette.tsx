'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

import { useIsMac, SearchIcon } from './palette-ui';

/**
 * Casca do palette de busca — leve de propósito.
 *
 * ## O problema, medido
 *
 * Este componente vive no layout raiz, então ele entra no primeiro
 * carregamento de TODAS as rotas. Enquanto importava `CURRICULUM` de forma
 * estática, as 95 rotas do site carregavam os 224 KB do currículo completo —
 * incluindo `/verificar`, `/sobre` e `/newsletter`, que não têm busca. Medido
 * no `route-bundle-stats.json` do build: 95 de 95 rotas com o pedaço do
 * currículo no primeiro load.
 *
 * ## A divisão
 *
 * Aqui ficam apenas o estado de aberto/fechado e o atalho de teclado. O corpo
 * — que constrói o índice de busca a partir do currículo — é importado sob
 * demanda e só desce quando alguém realmente abre a busca.
 *
 * O atalho de teclado precisa ficar NESTA metade. Se ele morasse no corpo, só
 * passaria a funcionar depois que o corpo tivesse sido carregado — e como é o
 * atalho que carrega o corpo, ele nunca funcionaria.
 */

const CommandPaletteBody = dynamic(
  () => import('./CommandPaletteBody').then(m => ({ default: m.CommandPaletteBody })),
  { ssr: false },
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Uma vez aberto, mantemos o corpo montado: fechar e reabrir não deve pagar
  // outro carregamento de rede.
  const [jaAbriu, setJaAbriu] = useState(false);
  const abrir = useCallback((v: boolean | ((o: boolean) => boolean)) => {
    setOpen(prev => {
      const proximo = typeof v === 'function' ? v(prev) : v;
      if (proximo) setJaAbriu(true);
      return proximo;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        abrir(o => !o);
      }
      if (e.key === '/' && !open) {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          abrir(true);
        }
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        abrir(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, abrir]);

  // O botão do cabeçalho abre por aqui. A referência global existia antes desta
  // divisão e é mantida para não mexer no HUD.
  useEffect(() => {
    type W = Window & { __ffvOpenPalette?: () => void };
    (window as W).__ffvOpenPalette = () => abrir(true);
    return () => {
      (window as W).__ffvOpenPalette = undefined;
    };
  }, [abrir]);

  if (!jaAbriu) return null;
  return <CommandPaletteBody open={open} setOpen={abrir} />;
}

/** Botão que abre o palette — usado no HUD. */
export function CommandPaletteTrigger() {
  const isMac = useIsMac();
  function open() {
    type W = Window & { __ffvOpenPalette?: () => void };
    (window as W).__ffvOpenPalette?.();
  }
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Buscar no Hub"
      // `h-11` (44px) no mobile: era `height: 32` fixo — abaixo do alvo de
      // toque mínimo (44px), e no mobile o botão é só o ícone (texto/kbd
      // saem via `hidden md:inline`/`hidden sm:inline`), então a área
      // tocável inteira era o quadrado pequeno. Desktop mantém 32px (mouse
      // não tem o mesmo piso de alvo).
      className="inline-flex items-center gap-2 rounded-md transition-colors h-11 sm:h-8"
      style={{
        padding: '0 10px 0 10px',
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        color: 'var(--ffv-muted)',
        fontSize: 12,
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-blue)';
        e.currentTarget.style.color = 'var(--foreground)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-border)';
        e.currentTarget.style.color = 'var(--ffv-muted)';
      }}
    >
      <SearchIcon />
      <span className="hidden md:inline">Buscar</span>
      <kbd
        className="font-mono hidden sm:inline"
        style={{
          fontSize: 10,
          padding: '1px 5px',
          borderRadius: 3,
          border: '1px solid var(--ffv-border)',
          background: 'var(--ffv-bg3)',
          color: 'var(--ffv-muted)',
          lineHeight: 1,
        }}
      >
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
