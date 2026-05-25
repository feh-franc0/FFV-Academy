import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  submitStudyRequest,
  StudyRequestError,
  STUDY_REQUEST_LIMITS,
  type StudyRequestInput,
} from '../study-request-api';

// Helper — input mínimo válido pro endpoint público
function baseInput(over: Partial<StudyRequestInput> = {}): StudyRequestInput {
  return {
    name: 'Maria',
    email: 'maria@gmail.com',
    studyArea: 'tecnologia',
    subject: 'IA aplicada',
    description: 'Quero virar engenheira de IA',
    marketingConsent: true,
    ...over,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function emptyResponse(status: number): Response {
  return new Response('', { status });
}

function htmlResponse(status: number): Response {
  return new Response('<html><body>nginx</body></html>', {
    status,
    headers: { 'Content-Type': 'text/html' },
  });
}

describe('submitStudyRequest — sucesso', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('manda multipart/form-data com todos os campos obrigatórios e opcionais', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, {
        id: 'abc-12345',
        status: 'received',
        attachmentCount: 0,
        message: 'ok',
      }),
    );

    const res = await submitStudyRequest(
      baseInput({
        phone: '11987654321',
        institution: 'USP',
        goal: 'Passar na prova',
      }),
    );

    expect(res.id).toBe('abc-12345');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0]!;
    expect(url).toMatch(/\/api\/v1\/study-requests$/);
    expect(opts.method).toBe('POST');
    expect(opts.credentials).toBe('omit');
    // FormData não tem Content-Type manual — browser preenche com boundary
    expect(opts.headers).toBeUndefined();

    const fd = opts.body as FormData;
    expect(fd.get('name')).toBe('Maria');
    expect(fd.get('email')).toBe('maria@gmail.com');
    expect(fd.get('phone')).toBe('11987654321');
    expect(fd.get('studyArea')).toBe('tecnologia');
    expect(fd.get('institution')).toBe('USP');
    expect(fd.get('subject')).toBe('IA aplicada');
    expect(fd.get('goal')).toBe('Passar na prova');
    expect(fd.get('description')).toBe('Quero virar engenheira de IA');
    expect(fd.get('marketingConsent')).toBe('true');
  });

  it('NÃO inclui campos opcionais vazios no FormData', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, { id: 'x', status: 'received', attachmentCount: 0, message: 'ok' }),
    );

    await submitStudyRequest(baseInput({ marketingConsent: false }));

    const fd = fetchMock.mock.calls[0]![1].body as FormData;
    expect(fd.get('phone')).toBeNull();
    expect(fd.get('institution')).toBeNull();
    expect(fd.get('goal')).toBeNull();
    expect(fd.get('marketingConsent')).toBeNull();
  });

  it('anexa cada arquivo individualmente com a chave "attachments"', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, { id: 'x', status: 'received', attachmentCount: 3, message: 'ok' }),
    );

    const pdf = new File(['fake pdf bytes'], 'apostila.pdf', { type: 'application/pdf' });
    const xlsx = new File(['fake xlsx bytes'], 'planilha.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const png = new File(['fake png bytes'], 'foto.png', { type: 'image/png' });

    await submitStudyRequest(baseInput({ attachments: [pdf, xlsx, png] }));

    const fd = fetchMock.mock.calls[0]![1].body as FormData;
    const attachments = fd.getAll('attachments');
    expect(attachments).toHaveLength(3);
    expect((attachments[0] as File).name).toBe('apostila.pdf');
    expect((attachments[1] as File).name).toBe('planilha.xlsx');
    expect((attachments[2] as File).name).toBe('foto.png');
  });
});

describe('submitStudyRequest — erros HTTP do backend', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('400 com detail JSON: usa o detail do servidor e classifica como "client"', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { detail: 'email inválido' }),
    );

    await expect(submitStudyRequest(baseInput())).rejects.toMatchObject({
      name: 'StudyRequestError',
      status: 400,
      detail: 'email inválido',
      kind: 'client',
      retryable: false,
    });
  });

  it('400 sem detail JSON: usa mensagem genérica de cliente', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(400));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err).toBeInstanceOf(StudyRequestError);
    expect(err.kind).toBe('client');
    expect(err.detail).toMatch(/verifique os dados/i);
  });

  it('413 Payload Too Large: classifica como "payload-too-large" com dica acionável', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse(413));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('payload-too-large');
    expect(err.retryable).toBe(false);
    expect(err.detail).toMatch(/remova/i);
    expect(err.detail).toMatch(/anexo|arquivo|PDF/i);
  });

  it('429 Too Many Requests: pede pra aguardar', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429, { detail: 'rate limited' }));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('client');
    expect(err.detail).toMatch(/aguarde|minuto/i);
  });

  it('500: classifica como "server" e marca retryable', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { detail: 'boom' }));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.retryable).toBe(true);
    expect(err.detail).toBe('boom');
  });

  it('500 sem detail: usa fallback amigável', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(500));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.detail).toMatch(/erro no servidor|notificada/i);
  });

  it('502 Bad Gateway: server + mensagem específica de deploy', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse(502));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.retryable).toBe(true);
    expect(err.detail).toMatch(/temporariamente indisponível|deploy/i);
  });

  it('503 Service Unavailable: server retryable', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(503));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.retryable).toBe(true);
  });

  it('504 Gateway Timeout: classifica como network (envio demorou demais)', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse(504));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.retryable).toBe(true);
    expect(err.detail).toMatch(/demorou demais|arquivos grandes|rede/i);
  });

  it('408 Request Timeout: tratado como network/timeout', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(408));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.retryable).toBe(true);
  });

  it('usa "title" se "detail" estiver ausente no payload Problem+JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(422, { title: 'validation-error', type: 'about:blank' }),
    );

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.detail).toBe('validation-error');
  });
});

describe('submitStudyRequest — erros de rede (fetch lança)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalOnLine = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restaura navigator.onLine
    if (originalOnLine) {
      Object.defineProperty(window.navigator, 'onLine', originalOnLine);
    } else {
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: true,
        writable: true,
      });
    }
  });

  it('TypeError "Failed to fetch" (Chrome): vira mensagem amigável de rede', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err).toBeInstanceOf(StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.status).toBe(0);
    expect(err.retryable).toBe(true);
    expect(err.detail).not.toMatch(/Failed to fetch/i);
    expect(err.detail).toMatch(/conectar|instabilidade|rede/i);
  });

  it('TypeError "Load failed" (Safari): também é network', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Load failed'));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.detail).not.toMatch(/Load failed/i);
  });

  it('TypeError "NetworkError when attempting to fetch" (Firefox): network', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('NetworkError when attempting to fetch resource'));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
  });

  it('quando navigator.onLine=false: mensagem específica de offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
      writable: true,
    });
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.detail).toMatch(/offline|sem internet/i);
    expect(err.detail).toMatch(/dados continuam preenchidos/i);
  });

  it('AbortError (rede cancelada): ainda é network', async () => {
    const abort = new Error('The user aborted a request');
    abort.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(abort);

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
  });

  it('erro inesperado não-Error: cai em "network" como fallback seguro', async () => {
    fetchMock.mockRejectedValueOnce('algo deu errado');

    const err = await submitStudyRequest(baseInput()).catch(e => e as StudyRequestError);
    expect(err).toBeInstanceOf(StudyRequestError);
    expect(err.kind).toBe('network');
  });
});

describe('STUDY_REQUEST_LIMITS', () => {
  it('expõe limite total de upload espelhando o backend (200 MiB)', () => {
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBe(200 * 1024 * 1024);
  });

  it('limite individual de 25 MiB bate com o backend', () => {
    expect(STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBe(25 * 1024 * 1024);
  });

  it('limite total >= limite individual (multi-arquivo precisa caber)', () => {
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBeGreaterThan(
      STUDY_REQUEST_LIMITS.maxAttachmentBytes,
    );
  });

  it('extensões aceitas incluem todos os tipos críticos esperados', () => {
    const exts = STUDY_REQUEST_LIMITS.allowedExtensions as readonly string[];
    expect(exts).toContain('.pdf');
    expect(exts).toContain('.docx');
    expect(exts).toContain('.xlsx');
    expect(exts).toContain('.pptx');
    expect(exts).toContain('.png');
    expect(exts).toContain('.jpg');
    expect(exts).toContain('.csv');
  });
});

describe('StudyRequestError', () => {
  it('kind=unknown como padrão; não é retryable', () => {
    const err = new StudyRequestError(0, 'oops');
    expect(err.kind).toBe('unknown');
    expect(err.retryable).toBe(false);
  });

  it('kind=network ⇒ retryable=true', () => {
    expect(new StudyRequestError(0, 'rede', 'network').retryable).toBe(true);
  });

  it('kind=server ⇒ retryable=true', () => {
    expect(new StudyRequestError(500, 'oops', 'server').retryable).toBe(true);
  });

  it('kind=client ⇒ retryable=false', () => {
    expect(new StudyRequestError(400, 'oops', 'client').retryable).toBe(false);
  });

  it('kind=payload-too-large ⇒ retryable=false (usuário precisa remover arquivos)', () => {
    expect(new StudyRequestError(413, 'oops', 'payload-too-large').retryable).toBe(false);
  });
});
