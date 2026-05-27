import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// next/link e next/navigation precisam de mock pra rodar em jsdom
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {} }),
}));

// AuthBadge usa useAuth (requer provider) — mockamos o hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    requireLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/sounds', () => ({
  unlockAudio: vi.fn(),
}));

import { GameHUD } from '@/components/GameHUD';

/**
 * GameHUD foi drasticamente simplificado em 2026-05-26 (commit de header limpo).
 * O header agora tem apenas: Logo, BaseSwitcher, Busca, AuthBadge, ThemeToggle.
 * Tudo que era pill (XP, streak, conquistas, meta, cards) foi pro dropdown
 * do AuthBadge ou removido.
 *
 * Testes antigos cobriam navegação por hubs, streak pill, XP pill, etc. —
 * todos removidos do header. Os comportamentos preservados (Progresso, Revisar)
 * agora vivem dentro do dropdown do AuthBadge (que é testado em outro lugar).
 */
describe('<GameHUD>', () => {
  it('renderiza logo FFV Academy', () => {
    render(<GameHUD />);
    expect(screen.getByText('FFV')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
  });

  it('renderiza botão Entrar quando anônimo', () => {
    render(<GameHUD />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('clique no logo não joga erro', async () => {
    const user = userEvent.setup();
    render(<GameHUD />);
    const logo = screen.getByText('Academy').closest('a')!;
    await user.click(logo);
  });

  it('NÃO renderiza navegação de hubs (removida em 2026-05-26)', () => {
    render(<GameHUD />);
    // Nenhum link pra /ia, /aws, /engenharia, /simulados deve aparecer NO HEADER.
    // Esses agora vivem nas home das bases via Explorar/hubs.
    const links = screen.queryAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/ia')).toBe(false);
    expect(links.some(l => l.getAttribute('href') === '/aws')).toBe(false);
    expect(links.some(l => l.getAttribute('href') === '/engenharia')).toBe(false);
    expect(links.some(l => l.getAttribute('href') === '/simulados')).toBe(false);
  });

  it('NÃO renderiza XP/streak/nível/conquistas (foram pro dropdown do avatar)', () => {
    render(<GameHUD />);
    // Header não mostra mais stats do usuário — só logo + auth.
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nv\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });
});
