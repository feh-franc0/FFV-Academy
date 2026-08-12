import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';

/**
 * Substitui o antigo teste de <SearchClient>.
 *
 * `/search` e o SearchClient eram uma segunda implementação de busca, órfã
 * (nenhum link interno apontava para ela) e divergindo da que os usuários de fato
 * usam. Foram removidos, e a rota agora redireciona. Testar a implementação morta
 * dava cobertura falsa: o teste passava sobre código que ninguém alcançava.
 *
 * A busca real é o CommandPalette — aberto por ⌘K, por `/`, pelo botão do header
 * e pelo menu mobile.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

import { CommandPalette, CommandPaletteTrigger } from '@/components/CommandPalette';

describe('a11y · busca (CommandPalette)', () => {
  it('não tem violações críticas com o palette fechado', async () => {
    const { container } = render(<CommandPalette />);
    await expectNoCriticalA11yViolations(container);
  });

  it('o gatilho não tem violações críticas', async () => {
    const { container } = render(<CommandPaletteTrigger />);
    await expectNoCriticalA11yViolations(container);
  });

  it('expõe um gatilho de busca alcançável por mouse, não só por atalho', async () => {
    render(<CommandPaletteTrigger />);
    // Regressão da auditoria: eu havia concluído que não existia afordance visível
    // de busca no desktop porque procurei no componente errado. Existe — e este
    // teste garante que continue existindo.
    const gatilho = screen.getByRole('button', { name: /buscar/i });
    expect(gatilho).toBeInTheDocument();
  });
});
