import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

const mockSyncProfileFromServer = vi.fn();
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, syncProfileFromServer: () => mockSyncProfileFromServer() };
});

import AdminLayout from '@/app/admin/layout';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import type { UserProfile } from '@/lib/auth';

function makeUser(role: string): UserProfile {
  return {
    id: 'user_1',
    email: 'tester@exemplo.com',
    name: 'Tester',
    phone: '+5511987654321',
    createdAt: new Date().toISOString(),
    marketingConsent: true,
    role,
    paidProducts: [],
  };
}

function renderWithAuth(ctxOverrides: Partial<AuthContextValue>) {
  const ctx: AuthContextValue = {
    user: null,
    isLoggedIn: false,
    carregando: false,
    requireLogin: vi.fn().mockResolvedValue(makeUser('user')),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...ctxOverrides,
  };
  return render(
    <AuthContext.Provider value={ctx}>
      <AdminLayout>
        <div data-testid="admin-page-content">conteúdo admin real</div>
      </AdminLayout>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  mockSyncProfileFromServer.mockReset();
});

describe('<AdminLayout> — gate server-side (achado P-06)', () => {
  it('não logado: mostra "Acesso restrito" e nunca chama syncProfileFromServer', () => {
    renderWithAuth({ isLoggedIn: false, user: null });
    expect(screen.getByText(/acesso restrito/i)).toBeInTheDocument();
    expect(mockSyncProfileFromServer).not.toHaveBeenCalled();
    expect(screen.queryByTestId('admin-page-content')).not.toBeInTheDocument();
  });

  it('logado, servidor confirma admin: renderiza o shell', async () => {
    mockSyncProfileFromServer.mockResolvedValue(makeUser('admin'));
    renderWithAuth({ isLoggedIn: true, user: makeUser('admin') });

    await waitFor(() => expect(mockSyncProfileFromServer).toHaveBeenCalled());
    expect(await screen.findByTestId('admin-page-content')).toBeInTheDocument();
  });

  it('logado, servidor confirma NÃO-admin: mostra "Sem permissão", mesmo que o AuthContext cacheado diga role=admin', async () => {
    // Simula perfil cacheado (localStorage) com role='admin' tampered — o
    // AuthContext em memória confia nele, mas o gate NÃO PODE: precisa da
    // confirmação fresca do servidor. Este é o teste que trava o achado P-06.
    mockSyncProfileFromServer.mockResolvedValue(makeUser('user'));
    renderWithAuth({ isLoggedIn: true, user: makeUser('admin') });

    await waitFor(() => expect(mockSyncProfileFromServer).toHaveBeenCalled());
    expect(await screen.findByText(/sem permissão/i)).toBeInTheDocument();
    expect(screen.queryByTestId('admin-page-content')).not.toBeInTheDocument();
  });

  it('logado, syncProfileFromServer falha (rede/backend fora): falha fechado — "Sem permissão", nunca o shell', async () => {
    mockSyncProfileFromServer.mockResolvedValue(null);
    renderWithAuth({ isLoggedIn: true, user: makeUser('admin') });

    await waitFor(() => expect(mockSyncProfileFromServer).toHaveBeenCalled());
    expect(await screen.findByText(/sem permissão/i)).toBeInTheDocument();
    expect(screen.queryByTestId('admin-page-content')).not.toBeInTheDocument();
  });

  it('enquanto aguarda a confirmação do servidor, não mostra nem o shell nem "sem permissão"', () => {
    mockSyncProfileFromServer.mockReturnValue(new Promise(() => {})); // nunca resolve
    renderWithAuth({ isLoggedIn: true, user: makeUser('admin') });

    expect(screen.queryByTestId('admin-page-content')).not.toBeInTheDocument();
    expect(screen.queryByText(/sem permissão/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/confirmando permissão/i)).toBeInTheDocument();
  });
});
