import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/link', () => ({
  default: ({ children, href, onClick, ...rest }: React.PropsWithChildren<{
    href: string;
    onClick?: (e: React.MouseEvent) => void;
  }>) => (
    <a href={href} onClick={onClick} {...rest}>{children}</a>
  ),
}));

import { TrailProvider } from '@/components/base/TrailContext';
import { TrailSummaryDrawer } from '@/components/base/TrailSummaryDrawer';
import { FloatingTrailMenuButton } from '@/components/base/FloatingTrailMenuButton';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';
import type { Trail, Module } from '@/lib/bases/types';

function makeModule(slug: string, num: number, title: string): Module {
  return {
    slug, num, icon: '🧬', title,
    summary: '', estimatedMin: 10,
    keyTerms: [], sections: [], quiz: [],
  };
}

const TRAIL: Trail = {
  slug: 'genetica',
  title: 'Genética Veterinária',
  description: 'Teste',
  icon: '🧬',
  modules: [
    makeModule('mod-1', 1, 'Genética de Populações'),
    makeModule('mod-2', 2, 'Leis de Mendel'),
    makeModule('mod-3', 3, 'Ações Gênicas'),
  ],
};

function mount(currentSlug = 'mod-2', completed: string[] = []) {
  const current = TRAIL.modules.find(m => m.slug === currentSlug)!;
  return render(
    <TrailProvider
      trail={TRAIL}
      currentModule={current}
      basePath="/medicina-veterinaria"
      baseName="Medicina Veterinária"
      theme={MEDVET_THEME}
      completedSlugs={completed}
    >
      <FloatingTrailMenuButton />
      <TrailSummaryDrawer />
    </TrailProvider>,
  );
}

describe('<TrailSummaryDrawer> + <FloatingTrailMenuButton>', () => {
  afterEach(cleanup);

  it('FAB renderiza com contagem módulo/total', () => {
    mount('mod-2');
    const btn = screen.getByTestId('floating-trail-menu-button');
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toContain('2/3');
  });

  it('drawer começa fechado (aria-expanded=false)', () => {
    mount();
    const btn = screen.getByTestId('floating-trail-menu-button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    const drawer = screen.getByTestId('trail-summary-drawer');
    expect(drawer).toHaveAttribute('data-state', 'closed');
  });

  it('clicar no FAB abre o drawer', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByTestId('floating-trail-menu-button'));
    const drawer = screen.getByTestId('trail-summary-drawer');
    expect(drawer).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('floating-trail-menu-button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('drawer lista todos os módulos da trilha', () => {
    mount();
    expect(screen.getByText('Genética de Populações')).toBeInTheDocument();
    expect(screen.getByText('Leis de Mendel')).toBeInTheDocument();
    expect(screen.getByText('Ações Gênicas')).toBeInTheDocument();
  });

  it('item atual destacado (aria-current implícito via styling)', async () => {
    const user = userEvent.setup();
    mount('mod-2');
    await user.click(screen.getByTestId('floating-trail-menu-button'));
    const link = screen.getByText('Leis de Mendel').closest('a')!;
    // Verifica que o link existe e tem href correto
    expect(link).toHaveAttribute('href', '/medicina-veterinaria/mod-2');
  });

  it('botão "Fechar sumário" fecha o drawer', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByTestId('floating-trail-menu-button'));
    expect(screen.getByTestId('trail-summary-drawer')).toHaveAttribute('data-state', 'open');
    await user.click(screen.getByRole('button', { name: 'Fechar sumário' }));
    expect(screen.getByTestId('trail-summary-drawer')).toHaveAttribute('data-state', 'closed');
  });

  it('link "Voltar para [Base]" aparece com nome da base', () => {
    mount();
    expect(screen.getByText(/Voltar para Medicina Veterinária/i)).toBeInTheDocument();
  });

  it('mostra contagem de módulos concluídos no footer', () => {
    mount('mod-2', ['mod-1']);
    expect(screen.getByText(/1 concluído/)).toBeInTheDocument();
  });

  it('clicar num módulo navega (link tem href correto)', () => {
    mount('mod-2');
    const link = screen.getByText('Ações Gênicas').closest('a')!;
    expect(link).toHaveAttribute('href', '/medicina-veterinaria/mod-3');
  });
});
