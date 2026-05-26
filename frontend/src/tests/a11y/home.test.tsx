import '@testing-library/jest-dom/vitest';
import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';

// next/link → <a> simples (evita runtime do Next em jsdom)
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// useGameState — sem progresso (caminho inicial do hero)
vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({ state: null, refresh: vi.fn() }),
}));

// useAuth — usuário deslogado
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isLoggedIn: false }),
}));

// usePreferences — sem dados (deslogado)
vi.mock('@/hooks/usePreferences', () => ({
  usePreferences: () => ({ preferences: null, status: 'idle', refresh: vi.fn() }),
}));

import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';

describe('a11y · <KnowledgeBaseHome>', () => {
  it('não tem violações de a11y críticas no estado inicial', async () => {
    const { container } = render(
      <KnowledgeBaseHome
        hero={{
          totalArticles: 157,
          totalTrails: 16,
        }}
      />,
    );
    await expectNoCriticalA11yViolations(container);
  });
});
