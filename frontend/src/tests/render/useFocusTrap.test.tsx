import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * Testa o hook isolado com um modal mínimo — não depende de nenhum dos 13
 * componentes reais que o usam. Cobre os dois requisitos do
 * `consistencia-visual-e-acessibilidade`: Tab não vaza, e o foco volta ao
 * gatilho quando o modal fecha.
 */
function TestModal() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        abrir
      </button>
      {open && (
        <div ref={ref} role="dialog" aria-modal="true" aria-label="teste" tabIndex={-1}>
          <button type="button">primeiro</button>
          <button type="button">segundo</button>
          <button type="button" onClick={() => setOpen(false)}>
            fechar
          </button>
        </div>
      )}
    </div>
  );
}

describe('useFocusTrap', () => {
  it('foca o primeiro elemento focável do modal ao abrir', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('abrir'));
    expect(document.activeElement).toBe(screen.getByText('primeiro'));
  });

  it('Tab a partir do último elemento cicla de volta para o primeiro (não vaza)', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('abrir'));
    screen.getByText('fechar').focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('primeiro'));
  });

  it('Shift+Tab a partir do primeiro elemento cicla para o último (não vaza pra trás)', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('abrir'));
    expect(document.activeElement).toBe(screen.getByText('primeiro'));
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('fechar'));
  });

  it('devolve o foco ao gatilho quando o modal fecha', () => {
    render(<TestModal />);
    const trigger = screen.getByText('abrir');
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByText('primeiro'));

    fireEvent.click(screen.getByText('fechar'));
    expect(document.activeElement).toBe(trigger);
  });

  it('não quebra quando isOpen nunca vira true', () => {
    expect(() => render(<TestModal />)).not.toThrow();
  });
});
