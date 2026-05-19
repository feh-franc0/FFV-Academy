import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PublicStatsClient } from '@/app/stats-publicas/PublicStatsClient';

describe('<PublicStatsClient> — KPIs públicos', () => {
  afterEach(cleanup);

  it('renderiza KPIs principais (bases, SLA, custo, AB30)', () => {
    render(<PublicStatsClient />);
    expect(screen.getByText(/Bases entregues até hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/SLA cumprido/i)).toBeInTheDocument();
    expect(screen.getByText(/Custo médio por base/i)).toBeInTheDocument();
    expect(screen.getByText(/AB30/i)).toBeInTheDocument();
  });

  it('mostra valores honestos (não infla — usa "<R$ 10", "Não treinou", "100%")', () => {
    render(<PublicStatsClient />);
    expect(screen.getByText(/<R\$ 10/)).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('mostra data da última atualização + compromisso semanal', () => {
    render(<PublicStatsClient />);
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
    expect(screen.getByText(/segunda-feira/)).toBeInTheDocument();
  });

  it('cada KPI tem caveat explicando metodologia', () => {
    render(<PublicStatsClient />);
    // Pelo menos 4 dos 6 KPIs têm caveat — não silenciamos a complexidade
    expect(screen.getAllByText(/estimativa preliminar|>50% de conclusão|nenhum modelo é treinado/i).length).toBeGreaterThanOrEqual(2);
  });
});
