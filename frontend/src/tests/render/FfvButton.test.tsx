import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FfvButton } from '@/components/ui/ffv-button';

describe('FfvButton', () => {
  it('renderiza como link quando href é fornecido', () => {
    render(<FfvButton href="/test">Clique aqui</FfvButton>);
    const link = screen.getByRole('link', { name: /Clique aqui/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renderiza como button quando sem href', () => {
    render(<FfvButton onClick={() => {}}>Botão</FfvButton>);
    const el = screen.getByText('Botão');
    expect(el.tagName).toBe('BUTTON');
  });

  it('aplica variant primary por default (indigo sólido — pivot 2026-05)', () => {
    render(<FfvButton href="/x">Default</FfvButton>);
    const el = screen.getByText('Default');
    const style = el.getAttribute('style') ?? '';
    expect(style).toContain('var(--ffv-blue)');
    expect(style).not.toContain('linear-gradient');
  });

  it('aplica variant gold com gradient diferente', () => {
    render(<FfvButton variant="gold" href="/x">Gold</FfvButton>);
    const el = screen.getByText('Gold');
    expect(el.getAttribute('style')).toContain('linear-gradient');
    expect(el.getAttribute('style')).toContain('var(--ffv-gold)');
  });

  it('variant ghost não aplica gradient inline', () => {
    render(<FfvButton variant="ghost" href="/x">Ghost</FfvButton>);
    const el = screen.getByText('Ghost');
    const style = el.getAttribute('style') ?? '';
    expect(style).not.toContain('linear-gradient');
  });

  it('renderiza link externo com target=_blank quando external=true', () => {
    render(<FfvButton href="https://example.com" external>External</FfvButton>);
    const link = screen.getByRole('link', { name: /External/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('aceita size customizado', () => {
    const { rerender } = render(<FfvButton size="sm" href="/x">SM</FfvButton>);
    expect(screen.getByText('SM').className).toContain('px-4');

    rerender(<FfvButton size="xl" href="/x">XL</FfvButton>);
    expect(screen.getByText('XL').className).toContain('px-8');
  });
});
