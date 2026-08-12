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

  it('aplica variant primary por default (gradient azul-roxo)', () => {
    render(<FfvButton href="/x">Default</FfvButton>);
    const el = screen.getByText('Default');
    expect(el.getAttribute('style')).toContain('linear-gradient');
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

  /**
   * Regressão do defeito medido em 11/ago/2026: a variante `primary` (o
   * botão que esta change elegeu como ÚNICO) fixava `color: '#fff'` sobre um
   * gradient `var(--ffv-blue)→var(--ffv-purple)`. No tema ESCURO (padrão do
   * site), essas variáveis são claras (#58a6ff/#d2a8ff) — branco sobre elas
   * mede 2,53:1 e 1,95:1, os dois abaixo do mínimo. Funcionava só no tema
   * claro, onde as mesmas variáveis são escuras. `var(--primary-foreground)`
   * inverte junto com o tema; não pode voltar a ser hex literal.
   */
  it('variant primary usa var(--primary-foreground), não hex literal', () => {
    render(<FfvButton href="/x">CTA</FfvButton>);
    const style = screen.getByText('CTA').getAttribute('style') ?? '';
    expect(style).toContain('var(--primary-foreground)');
    expect(style).not.toMatch(/color:\s*#fff/i);
    expect(style).not.toMatch(/color:\s*white/i);
  });
});
