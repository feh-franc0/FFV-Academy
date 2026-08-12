'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * useFocusTrap — contém o foco por Tab dentro de `ref` enquanto `isOpen`, e
 * devolve o foco ao elemento que tinha foco antes de abrir (o gatilho, na
 * prática quase sempre o botão que abriu o modal).
 *
 * Medido em 11/ago/2026: nenhum dos 13 `role="dialog"` da plataforma prendia
 * o foco — Tab vazava para trás do modal (a página por trás continua
 * navegável por teclado enquanto o modal está "aberto" visualmente) e,
 * fechado, o foco ficava perdido no topo do documento em vez de voltar ao
 * controle que abriu.
 *
 * Uso: `const ref = useRef<HTMLDivElement>(null); useFocusTrap(ref, isOpen);`
 * — passar a MESMA ref no elemento raiz do modal (o que tem `role="dialog"`).
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, isOpen: boolean) {
  const gatilhoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    gatilhoRef.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    if (!node) return;

    // Foca o primeiro elemento focável do modal (ou o próprio container, se
    // nenhum existir) — sem isso, o foco fica no botão que abriu, atrás do
    // overlay, e a primeira tecla Tab do usuário "vaza" antes do trap notar.
    const focaveis = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const primeiro = focaveis()[0];
    (primeiro ?? node).focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !node) return;
      const items = focaveis();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Devolve o foco ao gatilho — só se ele ainda estiver no documento
      // (não foi ele mesmo removido/trocado enquanto o modal estava aberto).
      if (gatilhoRef.current && document.contains(gatilhoRef.current)) {
        gatilhoRef.current.focus({ preventScroll: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `ref` é estável (useRef)
  }, [isOpen]);
}
