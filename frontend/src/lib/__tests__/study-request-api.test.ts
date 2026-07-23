import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  submitStudyRequest,
  StudyRequestError,
  STUDY_REQUEST_LIMITS,
  resolveContentType,
  safeFileName,
  type StudyRequestInput,
} from '../study-request-api';

// ──────────────────────────────────────────────────────────────────
// Fake XMLHttpRequest — controla cada cenário (sucesso, network, timeout, etc.)
// ──────────────────────────────────────────────────────────────────

interface FakeUpload {
  onprogress?: (e: ProgressEvent) => void;
}

class FakeXHR {
  static instances: FakeXHR[] = [];
  static reset() { FakeXHR.instances = []; }

  status = 0;
  responseText = '';
  responseHeaders: Record<string, string> = {};
  timeout = 0;
  withCredentials = false;
  upload: FakeUpload = {};
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  sentBody?: FormData;
  method = '';
  url = '';
  aborted = false;

  constructor() {
    FakeXHR.instances.push(this);
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name.toLowerCase()] ?? this.responseHeaders[name] ?? null;
  }
  send(body: FormData) {
    this.sentBody = body;
  }
  abort() {
    this.aborted = true;
    this.onerror?.();
  }

  // Helpers pra simular respostas
  emitProgress(loaded: number, total: number) {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent);
  }
  succeed(payload: unknown, contentType = 'application/json') {
    this.status = 201;
    this.responseText = JSON.stringify(payload);
    this.responseHeaders['Content-Type'] = contentType;
    this.onload?.();
  }
  failHttp(status: number, body: unknown = '', contentType = 'application/json') {
    this.status = status;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.responseHeaders['Content-Type'] = contentType;
    this.onload?.();
  }
  failNetwork() {
    this.status = 0;
    this.onerror?.();
  }
  failTimeout() {
    this.status = 0;
    this.ontimeout?.();
  }
}

function baseInput(over: Partial<StudyRequestInput> = {}): StudyRequestInput {
  return {
    name: 'Maria',
    email: 'maria@gmail.com',
    studyArea: 'tecnologia',
    subject: 'IA',
    description: 'Quero virar engenheira',
    marketingConsent: true,
    ...over,
  };
}

describe('submitStudyRequest — sucesso', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('faz POST multipart/form-data com todos os campos', async () => {
    const promise = submitStudyRequest(baseInput({ phone: '11987654321', institution: 'USP', goal: 'X' }));
    expect(FakeXHR.instances).toHaveLength(1);
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toMatch(/\/api\/v1\/study-requests$/);
    expect(xhr.withCredentials).toBe(false);
    expect(xhr.timeout).toBeGreaterThan(0);

    xhr.succeed({ id: 'abc', status: 'received', attachmentCount: 0, message: 'ok' });
    const result = await promise;
    expect(result.id).toBe('abc');

    const fd = xhr.sentBody!;
    expect(fd.get('name')).toBe('Maria');
    expect(fd.get('email')).toBe('maria@gmail.com');
    expect(fd.get('phone')).toBe('11987654321');
    expect(fd.get('institution')).toBe('USP');
    expect(fd.get('goal')).toBe('X');
    expect(fd.get('marketingConsent')).toBe('true');
  });

  it('omite campos opcionais vazios', async () => {
    const promise = submitStudyRequest(baseInput({ marketingConsent: false }));
    const xhr = FakeXHR.instances[0]!;
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
    const fd = xhr.sentBody!;
    expect(fd.get('phone')).toBeNull();
    expect(fd.get('institution')).toBeNull();
    expect(fd.get('marketingConsent')).toBeNull();
  });

  it('anexa cada arquivo individualmente com a chave "attachments"', async () => {
    const pdf = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const csv = new File(['x'], 'b.csv', { type: 'text/csv' });
    const promise = submitStudyRequest(baseInput({ attachments: [pdf, csv] }));
    const xhr = FakeXHR.instances[0]!;
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 2, message: 'ok' });
    await promise;
    const attachments = xhr.sentBody!.getAll('attachments');
    expect(attachments).toHaveLength(2);
    expect((attachments[0] as File).name).toBe('a.pdf');
    expect((attachments[1] as File).name).toBe('b.csv');
  });

  it('chama onProgress com % durante o upload', async () => {
    const onProgress = vi.fn();
    const promise = submitStudyRequest(baseInput(), { onProgress });
    const xhr = FakeXHR.instances[0]!;
    xhr.emitProgress(0, 1000);
    xhr.emitProgress(250, 1000);
    xhr.emitProgress(500, 1000);
    xhr.emitProgress(1000, 1000);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
    expect(onProgress).toHaveBeenCalledWith(0);
    expect(onProgress).toHaveBeenCalledWith(25);
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it('ignora progress events com lengthComputable=false (proxy esquisito)', async () => {
    const onProgress = vi.fn();
    const promise = submitStudyRequest(baseInput(), { onProgress });
    const xhr = FakeXHR.instances[0]!;
    xhr.upload.onprogress!({ lengthComputable: false, loaded: 500, total: 0 } as ProgressEvent);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('respeita timeoutMs custom no xhr.timeout', async () => {
    const promise = submitStudyRequest(baseInput(), { timeoutMs: 30_000 });
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.timeout).toBe(30_000);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });
});

describe('submitStudyRequest — erros HTTP', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('400 com JSON detail: usa detail do servidor; kind=client; não retryable', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(400, { detail: 'email inválido' });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err).toBeInstanceOf(StudyRequestError);
    expect(err.kind).toBe('client');
    expect(err.detail).toBe('email inválido');
    expect(err.retryable).toBe(false);
  });

  it('413: kind=payload-too-large; mensagem acionável', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(413, '<html>nginx</html>', 'text/html');
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('payload-too-large');
    expect(err.retryable).toBe(false);
    expect(err.detail).toMatch(/remova|reduza/i);
  });

  it('415: tipo não permitido — mensagem específica', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(415, { detail: 'tipo não permitido para "x.exe"' });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('client');
    expect(err.detail).toMatch(/x\.exe|não permitido/i);
  });

  it('429: pede aguardar', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(429, { detail: 'rate' });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.detail).toMatch(/aguarde|minuto/i);
    expect(err.retryable).toBe(false);
  });

  it('500: kind=server; retryable', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(500, { detail: 'boom' });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.detail).toBe('boom');
    expect(err.retryable).toBe(true);
  });

  it('502/503: mensagem de deploy; retryable', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(502, '', 'text/html');
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.detail).toMatch(/temporariamente indisponível|deploy/i);
  });

  it('504: kind=timeout; retryable', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(504, '');
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('timeout');
    expect(err.detail).toMatch(/demorou demais|arquivos grandes/i);
  });

  it('JSON inválido em 2xx: rejeita como server error', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 201;
    xhr.responseText = '<<<not json>>>';
    xhr.responseHeaders['Content-Type'] = 'application/json';
    xhr.onload?.();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
  });
});

describe('submitStudyRequest — erros de rede (xhr.onerror)', () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalOnLine) Object.defineProperty(window.navigator, 'onLine', originalOnLine);
  });

  it('onerror sem aborted: kind=network; retryable; mensagem amigável', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failNetwork();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.status).toBe(0);
    expect(err.retryable).toBe(true);
    expect(err.detail).toMatch(/conectar ao servidor|instabilidade/i);
    expect(err.detail).not.toMatch(/Failed to fetch/i);
  });

  it('navigator.onLine=false: mensagem específica de offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failNetwork();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.detail).toMatch(/offline|sem internet/i);
  });

  it('ontimeout: kind=timeout; mensagem com segundos', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0, timeoutMs: 10_000 });
    FakeXHR.instances[0]!.failTimeout();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('timeout');
    expect(err.detail).toMatch(/10 segundos|passou de|rede lenta/i);
  });

  it('AbortController.signal aborta antes de começar: rejeita imediatamente', async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    const promise = submitStudyRequest(baseInput(), { signal: ctrl.signal });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.detail).toMatch(/cancelad/i);
    // Não deve nem ter criado XHR
    expect(FakeXHR.instances).toHaveLength(0);
  });

  it('AbortController.signal aborta durante o upload: cancela com mensagem', async () => {
    const ctrl = new AbortController();
    const promise = submitStudyRequest(baseInput(), { signal: ctrl.signal });
    const xhr = FakeXHR.instances[0]!;
    ctrl.abort();
    expect(xhr.aborted).toBe(true);
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(err.detail).toMatch(/cancelad/i);
  });
});

describe('submitStudyRequest — retry automático', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retry após network failure: 1 retry default, sucesso na segunda', async () => {
    const promise = submitStudyRequest(baseInput());
    expect(FakeXHR.instances).toHaveLength(1);
    FakeXHR.instances[0]!.failNetwork();
    // Avança o backoff de 800ms
    await vi.advanceTimersByTimeAsync(800);
    expect(FakeXHR.instances).toHaveLength(2);
    FakeXHR.instances[1]!.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    const result = await promise;
    expect(result.id).toBe('x');
  });

  it('retry em 502: classifica como server (retryable)', async () => {
    const promise = submitStudyRequest(baseInput());
    FakeXHR.instances[0]!.failHttp(502, '', 'text/html');
    await vi.advanceTimersByTimeAsync(800);
    expect(FakeXHR.instances).toHaveLength(2);
    FakeXHR.instances[1]!.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    const result = await promise;
    expect(result.id).toBe('x');
  });

  it('retry em 504/timeout: kind=timeout é retryable', async () => {
    const promise = submitStudyRequest(baseInput());
    FakeXHR.instances[0]!.failTimeout();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[1]!.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    const result = await promise;
    expect(result.id).toBe('x');
  });

  it('NÃO faz retry em 400 (client): falha imediatamente', async () => {
    const promise = submitStudyRequest(baseInput());
    FakeXHR.instances[0]!.failHttp(400, { detail: 'email inválido' });
    await expect(promise).rejects.toMatchObject({ kind: 'client' });
    expect(FakeXHR.instances).toHaveLength(1);
  });

  it('NÃO faz retry em 413: payload-too-large não é retryable', async () => {
    const promise = submitStudyRequest(baseInput());
    FakeXHR.instances[0]!.failHttp(413, '');
    await expect(promise).rejects.toMatchObject({ kind: 'payload-too-large' });
    expect(FakeXHR.instances).toHaveLength(1);
  });

  it('maxRetries=0: nenhum retry, mesmo em erro retryable', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failNetwork();
    await expect(promise).rejects.toMatchObject({ kind: 'network' });
    expect(FakeXHR.instances).toHaveLength(1);
  });

  it('maxRetries=2: tenta total 3 vezes; falha final mantém última mensagem', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 2 });
    FakeXHR.instances[0]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[1]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[2]!.failNetwork();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(FakeXHR.instances).toHaveLength(3);
  });

  it('retry: onProgress é resetado pra 0 antes de cada nova tentativa', async () => {
    const onProgress = vi.fn();
    const promise = submitStudyRequest(baseInput(), { onProgress });
    FakeXHR.instances[0]!.emitProgress(500, 1000); // 50% na 1ª
    FakeXHR.instances[0]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    // 0% logo no começo da 2ª tentativa
    expect(onProgress).toHaveBeenLastCalledWith(0);
    FakeXHR.instances[1]!.emitProgress(1000, 1000);
    FakeXHR.instances[1]!.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it('abort durante retry: para no signal abort sem nova tentativa', async () => {
    const ctrl = new AbortController();
    // Anexa .catch() ANTES de qualquer rejection pra evitar unhandled rejection.
    const promise = submitStudyRequest(baseInput(), { signal: ctrl.signal, maxRetries: 3 });
    const caught = promise.catch(e => e as StudyRequestError);
    FakeXHR.instances[0]!.failNetwork();
    ctrl.abort();
    await vi.advanceTimersByTimeAsync(800);
    const err = await caught;
    expect(err.kind).toBe('network');
    expect(FakeXHR.instances).toHaveLength(1); // não tentou de novo
  });
});

// ──────────────────────────────────────────────────────────────────
// resolveContentType — MIME mapping pra tipos que o browser detecta mal
// ──────────────────────────────────────────────────────────────────
describe('resolveContentType', () => {
  it('mantém o type detectado se já está na allowlist', () => {
    const f = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    expect(resolveContentType(f)).toBe('application/pdf');
  });

  it('mapeia .md sem type detectado pra text/markdown', () => {
    const f = new File(['x'], 'README.md', { type: '' });
    expect(resolveContentType(f)).toBe('text/markdown');
  });

  it('mapeia .docx com type incorreto (octet-stream) pro MIME oficial', () => {
    const f = new File(['x'], 'doc.docx', { type: 'application/octet-stream' });
    expect(resolveContentType(f)).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });

  it('mapeia .xlsx com type vazio pro MIME oficial', () => {
    const f = new File(['x'], 'sheet.xlsx', { type: '' });
    expect(resolveContentType(f)).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });

  it('mapeia .pptx com type vazio pro MIME oficial', () => {
    const f = new File(['x'], 'slides.pptx', { type: '' });
    expect(resolveContentType(f)).toBe(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
  });

  it('case-insensitive: .PDF maiúsculo funciona', () => {
    const f = new File(['x'], 'DOC.PDF', { type: '' });
    expect(resolveContentType(f)).toBe('application/pdf');
  });

  it('extensão desconhecida: devolve o type original ou octet-stream', () => {
    const f = new File(['x'], 'a.zzz', { type: '' });
    expect(resolveContentType(f)).toBe('application/octet-stream');
  });

  it('jpg e jpeg ambos mapeiam pra image/jpeg', () => {
    expect(resolveContentType(new File(['x'], 'a.jpg', { type: '' }))).toBe('image/jpeg');
    expect(resolveContentType(new File(['x'], 'b.jpeg', { type: '' }))).toBe('image/jpeg');
  });
});

describe('safeFileName', () => {
  it('preserva acentos e espaços (válidos em S3 e R2)', () => {
    expect(safeFileName('Apostila de Anatomia (2026).pdf')).toBe('Apostila de Anatomia (2026).pdf');
  });

  it('remove path absoluto Unix — só basename fica', () => {
    expect(safeFileName('/home/user/documento.pdf')).toBe('documento.pdf');
  });

  it('remove path Windows — só basename fica', () => {
    expect(safeFileName('C:\\Users\\Fer\\arquivo.docx')).toBe('arquivo.docx');
  });

  it('remove null bytes e caracteres de controle', () => {
    expect(safeFileName('arq uivo.pdf')).toBe('arquivo.pdf');
  });

  it('fallback para "arquivo" se vier vazio', () => {
    expect(safeFileName('')).toBe('arquivo');
    expect(safeFileName(' ')).toBe('arquivo');
  });
});

describe('STUDY_REQUEST_LIMITS', () => {
  it('limite total = 200 MiB (espelha backend)', () => {
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBe(200 * 1024 * 1024);
  });
  it('limite por arquivo = 25 MiB', () => {
    expect(STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBe(25 * 1024 * 1024);
  });
  it('limite total > limite por arquivo', () => {
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBeGreaterThan(
      STUDY_REQUEST_LIMITS.maxAttachmentBytes,
    );
  });
});

describe('StudyRequestError', () => {
  it.each([
    ['unknown', false],
    ['network', true],
    ['server', true],
    ['timeout', true],
    ['client', false],
    ['payload-too-large', false],
  ])('kind=%s ⇒ retryable=%s', (kind, expected) => {
    const err = new StudyRequestError(0, 'msg', kind as never);
    expect(err.retryable).toBe(expected);
  });
});
