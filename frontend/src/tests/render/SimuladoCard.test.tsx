import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de next/link pra renderizar um <a> simples (next/navigation real quebra em jsdom)
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { SimuladoCard } from '@/components/SimuladoCard';
import type { Simulado } from '@/lib/simulados';

const fakeSimulado: Simulado = {
  id: 'simulado-aws-practitioner',
  certification: 'AWS CLF-C02',
  title: 'Simulado AWS Cloud Practitioner',
  description: 'Descrição do simulado.',
  price: 47,
  questionCount: 20,
  timeLimitMin: 30,
  passingScore: 70,
  topics: ['IAM', 'EC2', 'S3', 'Billing'],
  questions: [],
};

describe('<SimuladoCard> render', () => {
  it('renderiza título, preço e topics principais', () => {
    render(<SimuladoCard simulado={fakeSimulado} />);
    expect(screen.getByRole('heading', { name: /aws cloud practitioner/i })).toBeInTheDocument();
    expect(screen.getByText(/R\$ 47/)).toBeInTheDocument();
    expect(screen.getByText('IAM')).toBeInTheDocument();
  });

  it('mostra "Em breve" quando comingSoon', () => {
    render(<SimuladoCard simulado={{ ...fakeSimulado, comingSoon: true }} />);
    expect(screen.getByText(/em breve · preview/i)).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('link navega para a página do simulado ao clicar', async () => {
    const user = userEvent.setup();
    render(<SimuladoCard simulado={fakeSimulado} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/simulados/aws-practitioner');
    // clique não quebra (interação mínima)
    await user.click(link);
  });
});
