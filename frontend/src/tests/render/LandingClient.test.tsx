import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// jsdom não implementa IntersectionObserver — usado no scroll-reveal hook.
beforeAll(() => {
  // @ts-expect-error global polyfill
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds = [];
  };
});

// Mocks pra evitar dependências reais (form HTTP + auth, next/link).
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/lib/study-request-api', () => ({
  STUDY_REQUEST_LIMITS: {
    maxAttachments: 10,
    maxAttachmentBytes: 25 * 1024 * 1024,
    allowedExtensions: ['.pdf', '.docx', '.txt', '.png', '.jpg'],
  },
  StudyRequestError: class extends Error {
    detail = '';
  },
  submitStudyRequest: vi.fn().mockResolvedValue({ message: 'ok' }),
}));

import { LandingClient } from '@/components/LandingClient';

describe('<LandingClient> — copy de combate após pivot', () => {
  afterEach(cleanup);

  it('Hero mostra stats reais no trust strip (157 + 12)', () => {
    render(<LandingClient />);
    // "157" e "12" aparecem em vários lugares (stats da ProvaViva também) —
    // usar getAllByText pra não quebrar quando houver múltiplos matches.
    expect(screen.getAllByText(/157/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Curadoria humana revisa cada trilha/i)).toBeInTheDocument();
  });

  it('seção comparativa nomeia NotebookLM, ChatGPT e Anki explicitamente', () => {
    render(<LandingClient />);
    expect(screen.getByText('NotebookLM')).toBeInTheDocument();
    expect(screen.getAllByText(/ChatGPT/).length).toBeGreaterThan(0);
    expect(screen.getByText('Anki')).toBeInTheDocument();
  });

  it('headline da comparação foca em "Resumo não é estudo. Chat não é trilha."', () => {
    render(<LandingClient />);
    expect(screen.getByText(/Resumo não é estudo/i)).toBeInTheDocument();
    expect(screen.getByText(/Chat não é trilha/i)).toBeInTheDocument();
  });

  it('FAQ tem 8 itens cobrindo objeções principais', () => {
    render(<LandingClient />);
    // Headings das perguntas — cobrindo: gratuito, SLA, vs concorrência,
    // material aceito, segurança, atendimento humano, nível, áreas.
    expect(screen.getByText(/É gratuito mesmo/i)).toBeInTheDocument();
    expect(screen.getByText(/tempo demora/i)).toBeInTheDocument();
    expect(screen.getByText(/ChatGPT, NotebookLM e Anki/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF da faculdade/i)).toBeInTheDocument();
    expect(screen.getByText(/Meu material é seguro/i)).toBeInTheDocument();
    expect(screen.getByText(/atendimento humano/i)).toBeInTheDocument();
    expect(screen.getByText(/já souber a matéria/i)).toBeInTheDocument();
    // "qualquer área" aparece também no FormSection — múltiplos matches OK.
    expect(screen.getAllByText(/qualquer área/i).length).toBeGreaterThan(0);
  });

  it('FAQ row expande ao clicar e mostra resposta', async () => {
    const user = userEvent.setup();
    render(<LandingClient />);
    const trigger = screen.getByRole('button', { name: /É gratuito mesmo/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Resposta tem "Na V1" ou "100% gratuita" — confere se texto aparece
    expect(screen.getByText(/V1.*100% gratuita|sem cartão.*sem plano/i)).toBeInTheDocument();
  });

  it('FormSection promete SLA visível + revisão humana + garantia honesta', () => {
    render(<LandingClient />);
    expect(screen.getByText(/SLA 24h · revisão humana · gratuita na V1/i)).toBeInTheDocument();
    expect(screen.getByText(/Pronta em até 24h · média de 12h/i)).toBeInTheDocument();
    expect(screen.getByText(/Revisada por engenheiro humano/i)).toBeInTheDocument();
    expect(screen.getByText(/Garantia honesta/i)).toBeInTheDocument();
  });
});
