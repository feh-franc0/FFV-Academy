import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { SiteFooter } from '@/components/SiteFooter';

describe('<SiteFooter>', () => {
  afterEach(() => cleanup());

  it('default (tech): mostra HUBS de tecnologia + Conteúdo global', () => {
    render(<SiteFooter />);
    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument();
    expect(screen.getByText('AWS Cloud')).toBeInTheDocument();
    expect(screen.getByText('Simulados')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
  });

  it('com hubLinks custom: substitui a coluna de hubs', () => {
    render(
      <SiteFooter
        hubLinks={[
          { label: 'Fundamentos', href: '/medvet#fundamentos' },
          { label: 'Heranças', href: '/medvet#herancas' },
        ]}
        hubColumnTitle="Hubs temáticos"
      />,
    );
    expect(screen.getByText('Fundamentos')).toBeInTheDocument();
    expect(screen.getByText('Heranças')).toBeInTheDocument();
    expect(screen.getByText('Hubs temáticos')).toBeInTheDocument();
    // tech hubs NÃO aparecem
    expect(screen.queryByText('Inteligência Artificial')).not.toBeInTheDocument();
  });

  it('com contentLinks custom: substitui a coluna de conteúdo (não vaza para tech)', () => {
    render(
      <SiteFooter
        contentLinks={[
          { label: 'Trilha de Genética', href: '/medicina-veterinaria' },
          { label: 'Simulado 100 questões', href: '/medicina-veterinaria/simulado-genetica' },
        ]}
      />,
    );
    expect(screen.getByText('Trilha de Genética')).toBeInTheDocument();
    expect(screen.getByText('Simulado 100 questões')).toBeInTheDocument();
    // /simulados de tech NÃO deve aparecer
    expect(screen.queryByRole('link', { name: 'Simulados' })).not.toBeInTheDocument();
    expect(screen.queryByText('News')).not.toBeInTheDocument();
  });

  it('footer cobre o caso medvet — nenhum link de tech vaza', () => {
    render(
      <SiteFooter
        hubLinks={[
          { label: 'Fundamentos', href: '/medicina-veterinaria#fundamentos' },
          { label: 'Interação Gênica', href: '/medicina-veterinaria#interacao' },
          { label: 'Heranças e Populações', href: '/medicina-veterinaria#herancas' },
          { label: 'Melhoramento Animal', href: '/medicina-veterinaria#melhoramento' },
        ]}
        contentLinks={[
          { label: 'Trilha de Genética', href: '/medicina-veterinaria' },
          { label: 'Simulado 100 questões', href: '/medicina-veterinaria/simulado-genetica' },
          { label: 'Progresso', href: '/progresso' },
          { label: 'Revisar (SRS)', href: '/revisar' },
        ]}
        hubColumnTitle="Hubs temáticos"
      />,
    );
    const links = screen.getAllByRole('link');
    const techPaths = ['/ia', '/aws', '/engenharia', '/claude-anthropic', '/simulados', '/news', '/playlists', '/roadmaps'];
    for (const path of techPaths) {
      const found = links.some(l => l.getAttribute('href') === path);
      expect(found, `link ${path} não deveria aparecer no footer medvet`).toBe(false);
    }
  });
});

import { afterEach } from 'vitest';
