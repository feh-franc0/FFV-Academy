import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock da API antes do import — vitest.mock é hoisted.
const submitMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
    status: 'received',
    attachmentCount: 0,
    message: 'Solicitação recebida! Em até 24h sua base de estudo estará pronta.',
  }),
);

vi.mock('@/lib/study-request-api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/study-request-api')>('@/lib/study-request-api');
  return {
    ...actual,
    submitStudyRequest: submitMock,
  };
});

import { StudyRequestForm } from '@/components/home/StudyRequestForm';

const SHORT_ID = 'ABC12345';

describe('<StudyRequestForm>', () => {
  beforeEach(() => {
    window.localStorage.clear();
    submitMock.mockClear();
    submitMock.mockResolvedValue({
      id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
      status: 'received',
      attachmentCount: 0,
      message: 'Solicitação recebida! Em até 24h sua base de estudo estará pronta.',
    });
  });
  afterEach(() => cleanup());

  describe('máscara WhatsApp', () => {
    it('formata enquanto digita: dígitos → (XX) XXXXX-XXXX', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const phoneInput = screen.getByPlaceholderText(/\(11\)/) as HTMLInputElement;
      await user.type(phoneInput, '11987654321');
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('trunca dígitos após 11', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const phoneInput = screen.getByPlaceholderText(/\(11\)/) as HTMLInputElement;
      await user.type(phoneInput, '119876543210000');
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('aceita parcial: 5 dígitos → "(11) 987"', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const phoneInput = screen.getByPlaceholderText(/\(11\)/) as HTMLInputElement;
      await user.type(phoneInput, '11987');
      expect(phoneInput.value).toBe('(11) 987');
    });
  });

  describe('sugestão de domínio email', () => {
    it('sugere correção on blur quando há typo (gmial → gmail)', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const emailInput = screen.getByPlaceholderText('voce@email.com');
      await user.type(emailInput, 'aluno@gmial.com');
      await user.tab(); // dispara onBlur
      expect(screen.getByText(/Você quis dizer/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'aluno@gmail.com' })).toBeInTheDocument();
    });

    it('clicar na sugestão substitui o email + esconde a sugestão', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const emailInput = screen.getByPlaceholderText('voce@email.com') as HTMLInputElement;
      await user.type(emailInput, 'aluno@gmial.com');
      await user.tab();
      await user.click(screen.getByRole('button', { name: 'aluno@gmail.com' }));
      expect(emailInput.value).toBe('aluno@gmail.com');
      expect(screen.queryByText(/Você quis dizer/i)).not.toBeInTheDocument();
    });

    it('não sugere nada quando o email está correto', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      const emailInput = screen.getByPlaceholderText('voce@email.com');
      await user.type(emailInput, 'aluno@gmail.com');
      await user.tab();
      expect(screen.queryByText(/Você quis dizer/i)).not.toBeInTheDocument();
    });
  });

  describe('submit + persistência', () => {
    async function fillMinimum(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Maria');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'maria@gmail.com');
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'IA aplicada');
      await user.type(
        screen.getByPlaceholderText(/Descreva o que precisa estudar/),
        'Quero virar engenheiro de IA',
      );
    }

    it('submit dispara API, mostra SLA tracker e persiste no localStorage', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      await fillMinimum(user);
      await user.click(screen.getByRole('button', { name: /Enviar minha solicitação/ }));

      await waitFor(() => {
        expect(submitMock).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByText(/Solicitação recebida\./)).toBeInTheDocument();
      expect(screen.getByText(/Status da sua base/i)).toBeInTheDocument();
      // ID curto aparece
      expect(screen.getByText(new RegExp(`#${SHORT_ID}`))).toBeInTheDocument();
      // Email aparece
      expect(screen.getByText('maria@gmail.com')).toBeInTheDocument();
      // Persistido no localStorage
      const stored = JSON.parse(window.localStorage.getItem('ffv_active_study_request_v1')!);
      expect(stored.email).toBe('maria@gmail.com');
      expect(stored.id).toMatch(/^abc12345/);
    });

    it('envia phone limpo (só dígitos) pro backend', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      await fillMinimum(user);
      await user.type(screen.getByPlaceholderText(/\(11\)/), '11987654321');
      await user.click(screen.getByRole('button', { name: /Enviar minha solicitação/ }));

      await waitFor(() => {
        expect(submitMock).toHaveBeenCalledTimes(1);
      });
      const callArgs = submitMock.mock.calls[0]![0]!;
      expect(callArgs.phone).toBe('11987654321');
    });

    it('idempotência: clicar 2x no submit dispara API só 1x', async () => {
      const user = userEvent.setup();
      // Simula API lenta pra dar tempo de duplo-clique
      let resolve!: (v: unknown) => void;
      submitMock.mockImplementationOnce(
        () => new Promise(r => { resolve = r; }),
      );

      render(<StudyRequestForm />);
      await fillMinimum(user);
      const submitBtn = screen.getByRole('button', { name: /Enviar minha solicitação/ });
      await user.click(submitBtn);
      // Tenta clicar de novo (botão já está disabled mas defensa em profundidade)
      await user.click(submitBtn);

      expect(submitMock).toHaveBeenCalledTimes(1);

      // Limpa
      resolve!({
        id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
        status: 'received',
        attachmentCount: 0,
        message: 'ok',
      });
    });
  });

  describe('SLA tracker dinâmico', () => {
    it('quando carrega com solicitação muito recente (<30min) — etapa "Recebida" ativa', () => {
      const recent = new Date(Date.now() - 5 * 60_000).toISOString(); // 5min atrás
      window.localStorage.setItem(
        'ffv_active_study_request_v1',
        JSON.stringify({
          id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
          email: 'maria@gmail.com',
          attachmentCount: 2,
          submittedAt: recent,
        }),
      );
      render(<StudyRequestForm />);
      // SLA tracker renderiza
      expect(screen.getByText(/Status da sua base/i)).toBeInTheDocument();
      // Anexos aparecem
      expect(screen.getByText(/2 arquivos/i)).toBeInTheDocument();
    });

    it('quando carrega com >30min — etapa "Curadoria humana" em andamento', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
      window.localStorage.setItem(
        'ffv_active_study_request_v1',
        JSON.stringify({
          id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
          email: 'maria@gmail.com',
          attachmentCount: 0,
          submittedAt: oneHourAgo,
        }),
      );
      render(<StudyRequestForm />);
      // "em andamento" microcopy aparece — pode estar em múltiplos lugares
      // (header de retomada + badge da etapa 2)
      expect(screen.getAllByText(/em andamento/i).length).toBeGreaterThan(0);
    });

    it('limpar localStorage ao clicar "Enviar outra solicitação"', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(
        'ffv_active_study_request_v1',
        JSON.stringify({
          id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
          email: 'maria@gmail.com',
          attachmentCount: 0,
          submittedAt: new Date().toISOString(),
        }),
      );
      render(<StudyRequestForm />);
      await user.click(screen.getByRole('button', { name: /Enviar outra solicitação/ }));
      expect(window.localStorage.getItem('ffv_active_study_request_v1')).toBeNull();
    });
  });
});
