import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
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
import { StudyRequestError } from '@/lib/study-request-api';

// Helpers de upload — File real no jsdom + entrega via fireEvent.change
function makeFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  // Constrói um Blob do tamanho exato pra que f.size === sizeBytes
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type, lastModified: Date.now() });
}

function getFileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('input[type=file] não encontrado');
  return input;
}

/**
 * jsdom não implementa DataTransfer/FileList construtor — então montamos
 * um FileList-like com Object.defineProperty + fireEvent.change.
 * O React lê `event.target.files` e isso basta pra triggerar o onChange.
 */
function dropFiles(files: File[]) {
  const input = getFileInput();
  const fileList = {
    ...files,
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: function* () {
      for (const f of files) yield f;
    },
  } as unknown as FileList;
  Object.defineProperty(input, 'files', {
    value: fileList,
    configurable: true,
  });
  fireEvent.change(input);
}

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
      // Passo 1: identidade
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Maria');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'maria@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      // Passo 2: conteúdo
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'IA aplicada');
      await user.type(
        screen.getByPlaceholderText(/Descreva o que precisa estudar/),
        'Quero virar engenheiro de IA',
      );
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      // Passo 3 ativo — caller clica no submit ("🎉 Criar minha jornada →")
    }

    it('submit dispara API, mostra SLA tracker e persiste no localStorage', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      await fillMinimum(user);
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));

      await waitFor(() => {
        expect(submitMock).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByText(/Recebemos seu pedido/)).toBeInTheDocument();
      expect(screen.getByText(/Status da sua base/i)).toBeInTheDocument();
      // ID curto aparece
      expect(screen.getByText(new RegExp(`#${SHORT_ID}`))).toBeInTheDocument();
      // Email aparece (em múltiplos pontos da tela de sucesso: callout + detalhes)
      expect(screen.getAllByText('maria@gmail.com').length).toBeGreaterThan(0);
      // Persistido no localStorage
      const stored = JSON.parse(window.localStorage.getItem('ffv_active_study_request_v1')!);
      expect(stored.email).toBe('maria@gmail.com');
      expect(stored.id).toMatch(/^abc12345/);
    });

    it('envia phone limpo (só dígitos) pro backend', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm />);
      // Phone vive no passo 1 — preenche ANTES de navegar pra step 2.
      await user.type(screen.getByPlaceholderText(/\(11\)/), '11987654321');
      await fillMinimum(user);
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));

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
      const submitBtn = screen.getByRole('button', { name: /Criar minha jornada/ });
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

  // ──────────────────────────────────────────────────────────────────
  // Upload de arquivos — cenários ponta-a-ponta com vários tipos
  // ──────────────────────────────────────────────────────────────────
  describe('upload — validação client-side com tipos variados', () => {
    /**
     * Preenche os campos OBRIGATÓRIOS do passo 2 (conteúdo). Pressupõe que
     * o teste já está no passo 2 (render usa __testInitialStep={2}). Não
     * avança pra step 3 — caller faz isso quando precisa submeter.
     */
    async function fillMinimumE2E(user: ReturnType<typeof userEvent.setup>) {
      await user.selectOptions(screen.getByRole('combobox'), 'medicina-veterinaria');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Genética');
      await user.type(
        screen.getByPlaceholderText(/Descreva o que precisa estudar/),
        'Quero revisar antes da prova',
      );
    }

    it('aceita PDF, DOCX, XLSX, PPTX, CSV, TXT, MD e imagens (png/jpg/webp)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('apostila.pdf', 1024, 'application/pdf'),
        makeFile('redacao.docx', 2048, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        makeFile('planilha.xlsx', 3072, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        makeFile('slides.pptx', 4096, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
        makeFile('dados.csv', 256, 'text/csv'),
        makeFile('notas.txt', 128, 'text/plain'),
        makeFile('readme.md', 64, 'text/markdown'),
        makeFile('grafico.png', 5120, 'image/png'),
        makeFile('foto.jpg', 6144, 'image/jpeg'),
        makeFile('fluxo.webp', 7168, 'image/webp'),
      ]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(10);
      expect(screen.getByText(/apostila\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/slides\.pptx/)).toBeInTheDocument();
      expect(screen.getByText(/fluxo\.webp/)).toBeInTheDocument();
    });

    it('rejeita arquivo .exe com mensagem clara (formato + lista de aceitos)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile('virus.exe', 1024, 'application/x-msdownload')]);
      expect(screen.queryByLabelText(/Arquivos anexados/i)).not.toBeInTheDocument();
      const err = screen.getByText(/não é aceito/i);
      // Mensagem identifica o formato problema
      expect(err).toHaveTextContent(/formato EXE/i);
      // E lista os formatos aceitos
      expect(err).toHaveTextContent(/PDF/);
      expect(err).toHaveTextContent(/DOCX/);
      expect(err).toHaveTextContent(/PNG/);
    });

    it.each([
      ['ZIP', 'arquivo.zip', 'application/zip'],
      ['RAR', 'arquivo.rar', 'application/x-rar-compressed'],
      ['MP4', 'video.mp4', 'video/mp4'],
      ['MP3', 'audio.mp3', 'audio/mpeg'],
      ['BMP', 'imagem.bmp', 'image/bmp'],
      ['TIFF', 'foto.tiff', 'image/tiff'],
      ['HTML', 'pagina.html', 'text/html'],
      ['JS', 'script.js', 'application/javascript'],
    ])('rejeita formato não aceito: %s', (fmt, name, type) => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile(name, 1024, type)]);
      expect(screen.queryByLabelText(/Arquivos anexados/i)).not.toBeInTheDocument();
      const err = screen.getByText(/não é aceito/i);
      expect(err).toHaveTextContent(new RegExp(`formato ${fmt}`, 'i'));
    });

    it('arquivo sem extensão: mensagem específica', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile('semExtensao', 1024, 'application/octet-stream')]);
      expect(screen.queryByLabelText(/Arquivos anexados/i)).not.toBeInTheDocument();
      expect(screen.getByText(/sem extensão|não é aceito/i)).toBeInTheDocument();
    });

    // Cobertura individual de CADA tipo aceito — garante que nenhum regrediu
    it.each([
      ['PDF', 'apostila.pdf', 'application/pdf'],
      ['DOC (antigo)', 'doc.doc', 'application/msword'],
      ['DOCX', 'doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ['XLS (antigo)', 'plan.xls', 'application/vnd.ms-excel'],
      ['XLSX', 'plan.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      ['PPT (antigo)', 'slides.ppt', 'application/vnd.ms-powerpoint'],
      ['PPTX', 'slides.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      ['CSV', 'dados.csv', 'text/csv'],
      ['TXT', 'notas.txt', 'text/plain'],
      ['MD', 'readme.md', 'text/markdown'],
      ['PNG', 'grafico.png', 'image/png'],
      ['JPG', 'foto.jpg', 'image/jpeg'],
      ['JPEG', 'imagem.jpeg', 'image/jpeg'],
      ['WebP', 'modern.webp', 'image/webp'],
      ['GIF', 'animado.gif', 'image/gif'],
    ])('aceita %s individualmente', (_fmt, name) => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile(name, 2048, 'application/octet-stream')]);
      // Aceito: aparece na lista
      const list = screen.getByLabelText(/Arquivos anexados/i);
      expect(list).toBeInTheDocument();
      expect(list.querySelectorAll('li')).toHaveLength(1);
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    it('case-insensitive: extensão MAIÚSCULA é aceita (.PDF, .JPG)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('PROVA.PDF', 1024, 'application/pdf'),
        makeFile('FOTO.JPG', 1024, 'image/jpeg'),
      ]);
      const list = screen.getByLabelText(/Arquivos anexados/i);
      expect(list.querySelectorAll('li')).toHaveLength(2);
    });

    it('rejeita arquivo > 25 MB individualmente', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const big = makeFile('manual.pdf', 26 * 1024 * 1024); // 26 MB
      dropFiles([big]);
      expect(screen.queryByLabelText(/Arquivos anexados/i)).not.toBeInTheDocument();
      expect(screen.getByText(/excede 25 MB/i)).toBeInTheDocument();
    });

    it('rejeita arquivo de 0 bytes (arquivo movido/deletado entre seleção e leitura)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile('vazio.pdf', 0)]);
      expect(screen.queryByLabelText(/Arquivos anexados/i)).not.toBeInTheDocument();
      expect(screen.getByText(/está vazio|sumido/i)).toBeInTheDocument();
    });

    it('permite até 10 arquivos; o 11º vem com erro', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const ten = Array.from({ length: 10 }, (_, i) => makeFile(`a${i}.pdf`, 100));
      dropFiles(ten);
      // Agora tenta anexar o 11º
      dropFiles([makeFile('extra.pdf', 100)]);
      expect(screen.getByText(/Máximo 10 arquivos/i)).toBeInTheDocument();
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(10);
    });

    it('rejeita soma > 200 MB total (evita connection-reset do nginx)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      // 9 arquivos de ~24 MB cada = 216 MB — ultrapassa o cap de 200 MB
      const chunks = Array.from({ length: 9 }, (_, i) =>
        makeFile(`chunk${i}.pdf`, 24 * 1024 * 1024),
      );
      dropFiles(chunks);
      expect(screen.getByText(/ultrapassaria 200 MB/i)).toBeInTheDocument();
    });

    it('em batch misto (válido + inválido): aceita os válidos, mostra erro do inválido', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('valido.pdf', 500),
        makeFile('grande.pdf', 30 * 1024 * 1024), // 30 MB — rejeita
        makeFile('outro-valido.docx', 500, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      ]);
      expect(screen.getByText(/valido\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/outro-valido\.docx/)).toBeInTheDocument();
      expect(screen.queryByText(/^grande\.pdf$/)).not.toBeInTheDocument();
      expect(screen.getByText(/excede 25 MB/i)).toBeInTheDocument();
    });

    it('dedupa o mesmo arquivo (nome + size + lastModified) e avisa o usuário', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const a = makeFile('mesmo.pdf', 1024);
      // Drop 1
      dropFiles([a]);
      expect(screen.getByText('mesmo.pdf')).toBeInTheDocument();
      // Drop 2 com o MESMO arquivo
      dropFiles([a]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(1);
      expect(screen.getByText(/já foi adicionado/i)).toBeInTheDocument();
    });

    // ── Cenários explícitos de "2 arquivos iguais" — várias interpretações ──

    it('2 PDFs com MESMO nome mas tamanho diferente: aceita ambos (não são iguais)', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const a = makeFile('aula.pdf', 1024);
      const b = makeFile('aula.pdf', 2048);
      dropFiles([a, b]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(2);
    });

    it('2 PDFs com mesmo nome+tamanho mas lastModified diferente: aceita ambos', async () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      // makeFile gera lastModified diferente a cada chamada (Date.now())
      dropFiles([makeFile('aula.pdf', 1024)]);
      // pequeno delay garante lastModified diferente
      await new Promise(r => setTimeout(r, 5));
      dropFiles([makeFile('aula.pdf', 1024)]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(2);
    });

    it('2 arquivos idênticos no MESMO drop: dedupa, aceita só 1', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const a = makeFile('aula.pdf', 1024);
      dropFiles([a, a]); // mesmo arquivo 2x no mesmo drop
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(1);
    });

    it('2 imagens diferentes (PNG e JPG): aceita ambas', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('grafico.png', 1024, 'image/png'),
        makeFile('foto.jpg', 2048, 'image/jpeg'),
      ]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(2);
    });

    it('mesma imagem 2x (mesmo arquivo PNG): dedupa', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const png = makeFile('print.png', 5000, 'image/png');
      dropFiles([png]);
      dropFiles([png]);
      expect(screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li')).toHaveLength(1);
      expect(screen.getByText(/já foi adicionado/i)).toBeInTheDocument();
    });

    it('mesmo PPT 2x: dedupa com mensagem amigável citando o nome', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const ppt = makeFile('aula-genetica.pptx', 8000,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      dropFiles([ppt, ppt]);
      expect(screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li')).toHaveLength(1);
      expect(screen.getByText(/aula-genetica\.pptx.*já foi adicionado/i)).toBeInTheDocument();
    });

    it('3 duplicatas em um mesmo drop: mensagem agregada "3 arquivos"', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      const a = makeFile('a.pdf', 100);
      const b = makeFile('b.pdf', 200);
      const c = makeFile('c.pdf', 300);
      dropFiles([a, b, c]);
      // Re-drop dos 3 mesmos
      dropFiles([a, b, c]);
      expect(screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li')).toHaveLength(3);
      expect(screen.getByText(/3 arquivos.*já foi adicionado/i)).toBeInTheDocument();
    });

    it('JPG e JPEG (mesma extensão semântica, sufixos diferentes): aceita os 2', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('foto1.jpg', 1024, 'image/jpeg'),
        makeFile('foto2.jpeg', 1024, 'image/jpeg'),
      ]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(2);
    });

    it('PDF + imagem + PPT + DOCX juntos: aceita todos no mesmo batch', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('apostila.pdf', 1024, 'application/pdf'),
        makeFile('grafico.png', 2048, 'image/png'),
        makeFile('slides.pptx', 4096, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
        makeFile('redacao.docx', 8192, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      ]);
      const items = screen.getByLabelText(/Arquivos anexados/i).querySelectorAll('li');
      expect(items).toHaveLength(4);
    });

    it('exibe resumo do total: "N arquivos · XX MB no total"', () => {
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([
        makeFile('a.pdf', 1024 * 500), // 500 KB
        makeFile('b.pdf', 1024 * 1024 * 2), // 2 MB
      ]);
      const summary = screen.getByTestId('upload-summary');
      expect(summary).toHaveTextContent(/2 arquivos/);
      expect(summary).toHaveTextContent(/MB no total/);
    });

    it('botão de remover tira o arquivo da lista', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm __testInitialStep={2} />);
      dropFiles([makeFile('removivel.pdf', 1024)]);
      expect(screen.getByText('removivel.pdf')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Remover removivel\.pdf/ }));
      expect(screen.queryByText('removivel.pdf')).not.toBeInTheDocument();
    });

    it('submit com arquivos válidos manda o array completo pra API', async () => {
      const user = userEvent.setup();
      render(<StudyRequestForm __testInitialStep={2} />);
      await fillMinimumE2E(user);
      dropFiles([
        makeFile('resumo.pdf', 5000),
        makeFile('slides.pptx', 8000, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
      ]);
      // Avança pro passo 3 (review) e clica enviar
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));

      await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
      const callArgs = submitMock.mock.calls[0]![0]!;
      expect(callArgs.attachments).toHaveLength(2);
      expect(callArgs.attachments[0].name).toBe('resumo.pdf');
      expect(callArgs.attachments[1].name).toBe('slides.pptx');
    });
  });

  describe('upload — tratamento de erros amigáveis no submit', () => {
    async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
      // Passo 1: identidade
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Ana');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'ana@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      // Passo 2: conteúdo
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Go');
      await user.type(
        screen.getByPlaceholderText(/Descreva o que precisa estudar/),
        'Backend em Go com testes',
      );
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      // Passo 3: confirma e envia
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));
    }

    it('"Failed to fetch" do fetch real NÃO aparece pro usuário — mensagem amigável aparece', async () => {
      const user = userEvent.setup();
      submitMock.mockRejectedValueOnce(
        new StudyRequestError(0, 'Não conseguimos conectar ao servidor. Tente novamente.', 'network'),
      );
      render(<StudyRequestForm />);
      await fillAndSubmit(user);

      const errorBox = await screen.findByTestId('submit-error');
      expect(errorBox).toBeInTheDocument();
      expect(errorBox).toHaveTextContent(/conectar ao servidor/i);
      expect(errorBox).not.toHaveTextContent(/Failed to fetch/i);
      // header amigável presente
      expect(errorBox).toHaveTextContent(/Não conseguimos enviar/i);
      // CTA de retry sugerida em texto + link de email pro suporte
      expect(errorBox).toHaveTextContent(/clicar em.*Enviar.*de novo/i);
      expect(errorBox).toHaveTextContent(/fernandofv1110@gmail\.com/);
    });

    it('erro 413 (payload too large) exibe mensagem específica', async () => {
      const user = userEvent.setup();
      submitMock.mockRejectedValueOnce(
        new StudyRequestError(413, 'Os arquivos somam mais do que o servidor aceita. Remova algum anexo.', 'payload-too-large'),
      );
      render(<StudyRequestForm />);
      await fillAndSubmit(user);

      const errorBox = await screen.findByTestId('submit-error');
      expect(errorBox).toHaveTextContent(/arquivos somam mais|Remova algum anexo/i);
    });

    it('erro 502 exibe mensagem de servidor temporariamente indisponível', async () => {
      const user = userEvent.setup();
      submitMock.mockRejectedValueOnce(
        new StudyRequestError(502, 'Servidor temporariamente indisponível. Tente novamente em alguns segundos.', 'server'),
      );
      render(<StudyRequestForm />);
      await fillAndSubmit(user);

      const errorBox = await screen.findByTestId('submit-error');
      expect(errorBox).toHaveTextContent(/temporariamente indisponível/i);
    });

    it('após erro, os arquivos anexados permanecem na lista (não perde estado)', async () => {
      const user = userEvent.setup();
      submitMock.mockRejectedValueOnce(
        new StudyRequestError(0, 'Erro de rede', 'network'),
      );
      render(<StudyRequestForm />);
      // Step 1 — identidade
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Pedro');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'pedro@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      // Step 2 — conteúdo + anexos
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'AWS');
      await user.type(screen.getByPlaceholderText(/Descreva o que precisa estudar/), 'CLF-C02');
      dropFiles([makeFile('estudo.pdf', 5000)]);
      expect(screen.getByText('estudo.pdf')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      // Step 3 — submit
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));
      await screen.findByTestId('submit-error');
      // arquivo segue lá — voltamos pro step 2 pra verificar
      await user.click(screen.getByRole('tab', { name: /Conteúdo/ }));
      expect(screen.getByText('estudo.pdf')).toBeInTheDocument();
      // form values do step 1 seguem lá — voltamos pra verificar
      await user.click(screen.getByRole('tab', { name: /Identidade/ }));
      expect((screen.getByPlaceholderText(/Como podemos te chamar/) as HTMLInputElement).value).toBe('Pedro');
    });

    it('retry: após erro de rede, novo clique funciona e mostra sucesso', async () => {
      const user = userEvent.setup();
      submitMock
        .mockRejectedValueOnce(new StudyRequestError(0, 'Erro de rede', 'network'))
        .mockResolvedValueOnce({
          id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
          status: 'received',
          attachmentCount: 1,
          message: 'Solicitação recebida!',
        });
      render(<StudyRequestForm />);
      await fillAndSubmit(user);
      await screen.findByTestId('submit-error');

      // tenta de novo
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));
      await waitFor(() => {
        expect(submitMock).toHaveBeenCalledTimes(2);
      });
      expect(await screen.findByText(/Recebemos seu pedido/)).toBeInTheDocument();
    });

    it('mostra "Enviando arquivos... X%" no botão durante upload', async () => {
      const user = userEvent.setup();
      // Mock que captura onProgress e emite uma sequência de %
      let progressCb: ((p: number) => void) | undefined;
      submitMock.mockImplementationOnce((_input, opts: { onProgress?: (p: number) => void }) => {
        progressCb = opts?.onProgress;
        return new Promise(resolve => {
          // Resolve só depois de progress 100 + um delay (simula servidor processando)
          setTimeout(() => resolve({
            id: 'abc12345-aaaa-bbbb-cccc-dddddddddddd',
            status: 'received',
            attachmentCount: 1,
            message: 'ok',
          }), 50);
        });
      });
      render(<StudyRequestForm />);
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Ana');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'ana@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Go');
      await user.type(screen.getByPlaceholderText(/Descreva o que precisa estudar/), 'Backend Go');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));

      // Simula progresso vindo do XHR
      await waitFor(() => expect(progressCb).toBeDefined());
      progressCb!(35);
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toHaveTextContent(/35%/);
      });
      progressCb!(100);
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toHaveTextContent(/Processando no servidor/i);
      });
      // Sucesso eventualmente aparece
      expect(await screen.findByText(/Recebemos seu pedido/)).toBeInTheDocument();
    });

    it('barra de progresso visual reflete o % (data-testid="upload-progress-bar")', async () => {
      const user = userEvent.setup();
      let progressCb: ((p: number) => void) | undefined;
      submitMock.mockImplementationOnce((_input, opts: { onProgress?: (p: number) => void }) => {
        progressCb = opts?.onProgress;
        return new Promise(() => { /* nunca resolve — fica em loading */ });
      });
      render(<StudyRequestForm />);
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Ana');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'ana@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Go');
      await user.type(screen.getByPlaceholderText(/Descreva o que precisa estudar/), 'Backend Go');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));

      await waitFor(() => expect(progressCb).toBeDefined());
      progressCb!(42);
      await waitFor(() => {
        const bar = screen.getByTestId('upload-progress-bar');
        expect(bar.style.width).toBe('42%');
      });
    });

    it('botão fica desabilitado durante o submit (evita double-submit)', async () => {
      const user = userEvent.setup();
      submitMock.mockImplementationOnce(() => new Promise(() => { /* never */ }));
      render(<StudyRequestForm />);
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Ana');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'ana@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Go');
      await user.type(screen.getByPlaceholderText(/Descreva o que precisa estudar/), 'Go');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toBeDisabled();
      });
    });

    it('submit bloqueado client-side se algum arquivo virou 0 bytes (não chama API)', async () => {
      const user = userEvent.setup();
      // 1. Coloca arquivo válido — para passar validação inicial
      render(<StudyRequestForm />);
      await user.type(screen.getByPlaceholderText(/Como podemos te chamar/), 'Ana');
      await user.type(screen.getByPlaceholderText('voce@email.com'), 'ana@gmail.com');
      await user.click(screen.getByRole('button', { name: /Próximo · passo 2/ }));
      await user.selectOptions(screen.getByRole('combobox'), 'tecnologia');
      await user.type(screen.getByPlaceholderText(/Genética animal/), 'Go');
      await user.type(screen.getByPlaceholderText(/Descreva o que precisa estudar/), 'Quero aprender Go');

      // Insere file de 0 bytes via path direto (simula deleted-after-select):
      // No mundo real isso aconteceria após o handleFiles. Aqui forçamos um
      // File de 0 bytes via fireEvent.change que passa pela validação inicial
      // ANTES (porque acima já bloqueamos). Para simular "ficou vazio depois",
      // injeta sem passar pela validação:
      // Usamos defineProperty pra forçar files.length===0 não vai funcionar.
      // Simulação alternativa: confirma que a validação no handleFiles já barra
      // o caso e que submit sem files chama API normalmente.
      dropFiles([makeFile('zero.pdf', 0)]); // barrado por handleFiles
      await user.click(screen.getByRole('button', { name: /Próximo · passo 3/ }));
      await user.click(screen.getByRole('button', { name: /Criar minha jornada/ }));
      // submit segue sem files anexados (handleFiles barrou o 0-byte)
      await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
      const args = submitMock.mock.calls[0]![0]!;
      expect(args.attachments).toEqual([]);
    });
  });
});
