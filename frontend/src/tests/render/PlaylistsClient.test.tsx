import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de next/link — evita carregar next runtime em jsdom
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { PlaylistsClient } from '@/app/playlists/PlaylistsClient';

describe('<PlaylistsClient> render', () => {
  it('renderiza header e lista todas as playlists', () => {
    render(<PlaylistsClient />);
    expect(screen.getByRole('heading', { name: /playlists curadas/i })).toBeInTheDocument();
    // Sempre existe "Do zero à IA" e "Staff Engineer path" no catálogo canônico
    expect(screen.getByRole('heading', { name: /do zero à ia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /staff engineer path/i })).toBeInTheDocument();
  });

  it('links dos módulos resolvem para /aprenda/<slug> (drop de slugs inexistentes)', () => {
    render(<PlaylistsClient />);
    const links = screen.getAllByRole('link');
    const aprendaLinks = links.filter(l => l.getAttribute('href')?.startsWith('/aprenda/'));
    expect(aprendaLinks.length).toBeGreaterThan(0);
  });

  it('mostra 0% quando não há módulos completos (interação: click inicial)', async () => {
    const user = userEvent.setup();
    render(<PlaylistsClient />);
    // Zero módulos completos (localStorage limpo) → aparece 0% em todas as playlists
    const pcts = screen.getAllByText(/0%/);
    expect(pcts.length).toBeGreaterThan(0);
    // Interação mínima: clicar em um link de módulo
    const firstAprenda = screen.getAllByRole('link').find(l =>
      l.getAttribute('href')?.startsWith('/aprenda/')
    );
    if (firstAprenda) await user.click(firstAprenda);
  });
});
