import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SimuladoQuestion } from '@/lib/simulados';

vi.mock('@/lib/api-client', () => ({
  hasBackend: () => false,
}));
vi.mock('@/lib/features', () => ({
  FEATURES: { billing: false, tutorAI: false, phoneAuth: false },
}));

import { TutorAsk } from '../TutorAsk';

const question: SimuladoQuestion = {
  id: 'q-tutor-1',
  stem: 'Qual é a melhor forma de hospedar site estático?',
  options: [
    { id: 'A', text: 'EC2' },
    { id: 'B', text: 'S3 + CloudFront' },
    { id: 'C', text: 'Lambda' },
    { id: 'D', text: 'Beanstalk' },
  ],
  correctId: 'B',
  explanation: {
    tutorSeeds: ['Por que S3 + CloudFront ganha?', 'Custo aproximado de hospedar 1GB?'],
  } as unknown as string,
  topic: 'Cloud Technology & Services',
  difficulty: 'easy',
};

beforeEach(() => {
  localStorage.clear();
});

describe('TutorAsk', () => {
  it('não renderiza nada quando open=false', () => {
    const { container } = render(<TutorAsk question={question} open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza seeds do schema rico quando aberto', () => {
    render(<TutorAsk question={question} open onClose={() => {}} />);
    expect(screen.getByText('Por que S3 + CloudFront ganha?')).toBeInTheDocument();
    expect(screen.getByText('Custo aproximado de hospedar 1GB?')).toBeInTheDocument();
  });

  it('clicar em seed registra Q&A com fallback local', async () => {
    const user = userEvent.setup();
    render(<TutorAsk question={question} open onClose={() => {}} />);
    await user.click(screen.getByText('Por que S3 + CloudFront ganha?'));
    expect(await screen.findByText(/releia a "Por que está errado"/i)).toBeInTheDocument();
  });

  it('preencher textarea e clicar perguntar registra Q&A', async () => {
    const user = userEvent.setup();
    render(<TutorAsk question={question} open onClose={() => {}} />);
    const textarea = screen.getByLabelText(/Sua pergunta/i);
    await user.type(textarea, 'Por que não Beanstalk?');
    await user.click(screen.getByRole('button', { name: /^Perguntar$/i }));
    expect(await screen.findByText('Por que não Beanstalk?')).toBeInTheDocument();
  });

  it('mostra banner de modo demo quando tutor IA está off', () => {
    render(<TutorAsk question={question} open onClose={() => {}} />);
    expect(screen.getByText(/Tutor IA em breve/i)).toBeInTheDocument();
  });

  it('usa seeds default quando schema é string simples', () => {
    const plainQuestion: SimuladoQuestion = { ...question, explanation: 'plain' };
    render(<TutorAsk question={plainQuestion} open onClose={() => {}} />);
    expect(screen.getByText('Por que essa opção está certa?')).toBeInTheDocument();
  });
});
