import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { TrilhaEspelhoClient } from '@/app/trilhas-espelho/[slug]/TrilhaEspelhoClient';
import type { TrilhaEspelho } from '@/lib/trilhas-espelho';

const FIXTURE_LIVE: TrilhaEspelho = {
  slug: 'oab-41',
  examName: 'OAB 41ª',
  examEdition: '41ª · 2026',
  baseSlug: 'direito',
  pitch: 'Trilha consolidada da OAB 41.',
  contributorCount: 12,
  publishedAt: '2026-05-19',
  status: 'live',
  modules: [
    {
      slug: 'm-1',
      num: 1,
      title: 'Constitucional',
      summary: 'Fundamentos da CF/88.',
      estimatedMin: 60,
      topics: ['constitucional', 'cf88'],
    },
    {
      slug: 'm-2',
      num: 2,
      title: 'Civil',
      summary: 'Parte Geral do Código Civil.',
      estimatedMin: 90,
      topics: ['civil'],
    },
  ],
};

const FIXTURE_INCUBATING: TrilhaEspelho = {
  ...FIXTURE_LIVE,
  slug: 'cnu-2026',
  examName: 'CNU 2026',
  status: 'incubating',
  contributorCount: 7,
};

describe('<TrilhaEspelhoClient>', () => {
  afterEach(cleanup);

  it('renderiza examName + edition + pitch no hero', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.getByRole('heading', { level: 1, name: /OAB 41/ })).toBeInTheDocument();
    expect(screen.getByText(/41ª · 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Trilha consolidada da OAB 41/)).toBeInTheDocument();
  });

  it('mostra 4 KPI stats (módulos, horas, alunos, base)', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.getByText('Módulos')).toBeInTheDocument();
    expect(screen.getByText(/Horas estimadas/)).toBeInTheDocument();
    expect(screen.getByText(/Alunos contribuintes/)).toBeInTheDocument();
    expect(screen.getByText(/Base origem/)).toBeInTheDocument();
  });

  it('número de módulos aparece corretamente', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    // FIXTURE tem 2 modules
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('horas totais: 60+90=150min → ~3h (arredondado)', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.getByText('~3h')).toBeInTheDocument();
  });

  it('NÃO mostra banner de incubação quando status=live', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.queryByText(/Trilha em incubação/i)).not.toBeInTheDocument();
  });

  it('mostra banner quando status=incubating', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_INCUBATING} />);
    expect(screen.getByText(/Trilha em incubação/i)).toBeInTheDocument();
    expect(screen.getByText(/7 alunos contribuíram/i)).toBeInTheDocument();
  });

  it('lista todos os módulos numerados', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.getByRole('heading', { level: 3, name: /Constitucional/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^Civil$/ })).toBeInTheDocument();
  });

  it('mostra tópicos como chips em cada módulo', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    expect(screen.getByText('constitucional')).toBeInTheDocument();
    expect(screen.getByText('cf88')).toBeInTheDocument();
    expect(screen.getByText('civil')).toBeInTheDocument();
  });

  it('CTA "Solicitar minha trilha personalizada" aponta pra home form', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    const cta = screen.getByRole('link', { name: /Solicitar minha trilha personalizada/i });
    expect(cta).toHaveAttribute('href', '/?nohome=1#solicitar-base');
  });

  it('link da base origem aponta pra /direito', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    const baseLink = screen.getByRole('link', { name: /direito/i });
    expect(baseLink).toHaveAttribute('href', '/direito');
  });

  it('mostra data formatada de "atualizado em"', () => {
    render(<TrilhaEspelhoClient trilha={FIXTURE_LIVE} />);
    // Data 2026-05-19 deve aparecer em formato pt-BR
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
  });
});
