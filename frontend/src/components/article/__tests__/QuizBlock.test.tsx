/**
 * QuizBlock — testes do quiz interativo single-question da rota dinâmica.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizBlock } from '../QuizBlock';

const baseData = {
  question: 'Qual é a capital do Brasil?',
  options: ['Rio de Janeiro', 'Brasília', 'São Paulo'],
  correctIndex: 1,
  explanation: 'Brasília é a capital desde 1960.',
};

describe('QuizBlock', () => {
  it('renderiza a pergunta e as opções', () => {
    render(<QuizBlock data={baseData} />);
    expect(screen.getByText(/Qual é a capital do Brasil\?/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Rio de Janeiro/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Brasília/ })).toBeInTheDocument();
  });

  it('marca a opção selecionada com aria-checked', () => {
    render(<QuizBlock data={baseData} />);
    const option = screen.getByRole('radio', { name: /Brasília/ });
    fireEvent.click(option);
    expect(option).toHaveAttribute('aria-checked', 'true');
  });

  it('mostra feedback de acerto e a explicação ao responder corretamente', () => {
    render(<QuizBlock data={baseData} />);
    fireEvent.click(screen.getByRole('radio', { name: /Brasília/ }));
    fireEvent.click(screen.getByRole('button', { name: /Responder/ }));
    expect(screen.getByText(/Resposta correta/)).toBeInTheDocument();
    expect(screen.getByText(/Brasília é a capital desde 1960/)).toBeInTheDocument();
  });

  it('mostra feedback de erro ao responder incorretamente', () => {
    render(<QuizBlock data={baseData} />);
    fireEvent.click(screen.getByRole('radio', { name: /Rio de Janeiro/ }));
    fireEvent.click(screen.getByRole('button', { name: /Responder/ }));
    expect(screen.getByText(/Não foi dessa vez/)).toBeInTheDocument();
  });

  it('não renderiza nada se faltarem options', () => {
    const { container } = render(
      <QuizBlock data={{ question: 'x', options: [], correctIndex: 0 }} />,
    );
    expect(container.textContent).toBe('');
  });
});
