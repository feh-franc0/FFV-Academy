import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  it('renderiza children corretamente', () => {
    const { container } = render(<StatusBadge>NOVOS ARTIGOS</StatusBadge>);
    expect(container.textContent).toContain('NOVOS ARTIGOS');
  });

  it('aplica tom live por default (verde + pulse)', () => {
    const { container } = render(<StatusBadge>ATIVO</StatusBadge>);
    const badge = container.querySelector('span') as HTMLElement;
    expect(badge.style.color).toContain('ffv-green');
  });

  it('tom gold usa cor dourada', () => {
    const { container } = render(<StatusBadge tone="gold">DESTAQUE</StatusBadge>);
    const badge = container.querySelector('span') as HTMLElement;
    expect(badge.style.color).toContain('ffv-gold');
  });

  it('tons sem pulse não animam', () => {
    const { container } = render(<StatusBadge tone="warning">AVISO</StatusBadge>);
    const dot = container.querySelector('span[aria-hidden]') as HTMLElement;
    expect(dot.style.animation).toBe('');
  });

  it('dot decorativo é aria-hidden (a11y)', () => {
    const { container } = render(<StatusBadge tone="info">INFO</StatusBadge>);
    const dot = container.querySelector('[aria-hidden]');
    expect(dot).not.toBeNull();
  });
});
