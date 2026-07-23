import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { DiffDeConhecimentoClient } from '@/app/diff-de-conhecimento/DiffDeConhecimentoClient';

describe('<DiffDeConhecimentoClient> — feature defensável #1', () => {
  afterEach(cleanup);

  it('renderiza banner de PREVIEW V1 (honestidade)', () => {
    render(<DiffDeConhecimentoClient />);
    expect(screen.getByText(/Preview V1/i)).toBeInTheDocument();
    expect(screen.getByText(/dados mockados/i)).toBeInTheDocument();
  });

  it('hero menciona ChatGPT e Gemini explicitamente', () => {
    render(<DiffDeConhecimentoClient />);
    // Menções podem aparecer em múltiplos lugares (hero + tabela + share)
    expect(screen.getAllByText(/ChatGPT/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gemini/i).length).toBeGreaterThan(0);
  });

  it('mostra 3 blocos de score (Você / ChatGPT 4o / Gemini 2.5)', () => {
    render(<DiffDeConhecimentoClient />);
    // "Você" aparece em vários lugares (header + score + bars) — múltiplos OK
    expect(screen.getAllByText('Você').length).toBeGreaterThan(0);
    expect(screen.getByText('ChatGPT 4o')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.5')).toBeInTheDocument();
  });

  it('renderiza 3 quizzes do MOCK', () => {
    render(<DiffDeConhecimentoClient />);
    expect(screen.getByText('Leis de Mendel')).toBeInTheDocument();
    expect(screen.getByText('Genes Letais')).toBeInTheDocument();
    expect(screen.getByText('Hardy-Weinberg')).toBeInTheDocument();
  });

  it('mostra seção "Onde você passou as IAs"', () => {
    render(<DiffDeConhecimentoClient />);
    expect(screen.getByText(/Onde você passou as IAs/i)).toBeInTheDocument();
  });

  it('mostra seção "Onde precisa estudar mais"', () => {
    render(<DiffDeConhecimentoClient />);
    // "Onde precisa estudar mais" pode aparecer em múltiplos lugares
    expect(screen.getAllByText(/Onde precisa estudar mais/i).length).toBeGreaterThan(0);
    // Gap do MOCK menciona Hardy-Weinberg (frequências alélicas)
    expect(screen.getByText(/frequências alélicas/i)).toBeInTheDocument();
  });

  it('bars têm role="progressbar" com aria atributos corretos', () => {
    render(<DiffDeConhecimentoClient />);
    const bars = screen.getAllByRole('progressbar');
    // 3 quizzes × 3 bars (você/chatgpt/gemini) = 9 mínimo
    expect(bars.length).toBeGreaterThanOrEqual(9);
    bars.forEach(b => {
      expect(b).toHaveAttribute('aria-valuemin', '0');
      expect(b).toHaveAttribute('aria-valuemax', '100');
    });
  });

  it('shareable card mostra acertos do aluno vs ChatGPT no header', () => {
    render(<DiffDeConhecimentoClient />);
    // Header do shareable card menciona "Acertei X%"
    expect(screen.getByText(/Acertei/i)).toBeInTheDocument();
    // Os números 80 e 84 aparecem em vários lugares (bars + score blocks +
    // shareable). Múltiplas matches válidas.
    expect(screen.getAllByText(/80/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/84/).length).toBeGreaterThan(0);
  });

  it('CTAs apontam pra /meu-aprendizado e /bases (multi-base)', () => {
    render(<DiffDeConhecimentoClient />);
    const espelhoLink = screen.getByRole('link', { name: /Ver meu espelho de aprendizado/i });
    expect(espelhoLink).toHaveAttribute('href', '/meu-aprendizado');
    const basesLink = screen.getByRole('link', { name: /Explorar bases/i });
    expect(basesLink).toHaveAttribute('href', '/bases');
  });
});
