import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BackButton } from '@/components/BackButton';

describe('Breadcrumb', () => {
  it('renderiza nav>ol semântico com aria-label', () => {
    render(<Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Atual' }]} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.querySelector('ol')).toBeInTheDocument();
  });

  it('marca o último item com aria-current=page e sem link', () => {
    render(<Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Atual' }]} />);
    const atual = screen.getByText('Atual');
    expect(atual.tagName).not.toBe('A');
    expect(atual).toHaveAttribute('aria-current', 'page');
  });

  it('itens com href viram link', () => {
    render(<Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Atual' }]} />);
    const link = screen.getByRole('link', { name: 'Início' });
    expect(link).toHaveAttribute('href', '/');
  });
});

describe('BackButton', () => {
  it('renderiza link para o href com o texto do children', () => {
    render(<BackButton href="/progresso">Voltar</BackButton>);
    const link = screen.getByRole('link', { name: /Voltar/i });
    expect(link).toHaveAttribute('href', '/progresso');
  });

  it('ícone é aria-hidden (o texto do link já descreve o destino)', () => {
    const { container } = render(<BackButton href="/x">Voltar</BackButton>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
