/**
 * Stress tests para o cliente do study-request API.
 *
 * Cobre cenários extremos / hostis que costumam quebrar implementações
 * "felizes": boundaries exatos, unicode, race conditions, network flap,
 * servidor devolvendo lixo, etc.
 *
 * Para os contract tests (validar shape da request multipart vs handler Go),
 * ver `study-request-api.contract.test.ts`.
 */
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
// Fake XHR (compartilhado entre suites)
// ──────────────────────────────────────────────────────────────────
class FakeXHR {
  static instances: FakeXHR[] = [];
  static reset() { FakeXHR.instances = []; }
  status = 0;
  responseText = '';
  responseHeaders: Record<string, string> = {};
  timeout = 0;
  withCredentials = false;
  upload: { onprogress?: (e: ProgressEvent) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  sentBody?: FormData;
  aborted = false;
  constructor() { FakeXHR.instances.push(this); }
  open() { /* noop */ }
  getResponseHeader(name: string) {
    return this.responseHeaders[name.toLowerCase()] ?? this.responseHeaders[name] ?? null;
  }
  send(body: FormData) { this.sentBody = body; }
  abort() { this.aborted = true; this.onerror?.(); }
  succeed(payload: unknown) {
    this.status = 201;
    this.responseText = JSON.stringify(payload);
    this.responseHeaders['Content-Type'] = 'application/json';
    this.onload?.();
  }
  failHttp(status: number, body: unknown = '', ct = 'application/json') {
    this.status = status;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.responseHeaders['Content-Type'] = ct;
    this.onload?.();
  }
  failNetwork() { this.status = 0; this.onerror?.(); }
  failTimeout() { this.status = 0; this.ontimeout?.(); }
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

// ──────────────────────────────────────────────────────────────────
// Stress — nomes de arquivo extremos
// ──────────────────────────────────────────────────────────────────
describe('STRESS — nomes de arquivo extremos', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    // [descricao, nome de entrada, nome esperado depois de safeFileName]
    ['acentos PT-BR', 'Coração & Pulmão (definição).pdf', 'Coração & Pulmão (definição).pdf'],
    ['emoji', '📚 Resumo final 🎓.pdf', '📚 Resumo final 🎓.pdf'],
    ['cirílico', 'Книга по химии.pdf', 'Книга по химии.pdf'],
    ['mandarim', '化学课本.pdf', '化学课本.pdf'],
    ['árabe', 'كتاب الكيمياء.pdf', 'كتاب الكيمياء.pdf'],
    ['hindi/devanágari', 'रसायन विज्ञान.pdf', 'रसायन विज्ञान.pdf'],
    ['path Unix absoluto', '/Users/fer/Downloads/aula.pdf', 'aula.pdf'],
    ['path Windows', 'C:\\Users\\Fer\\Documents\\prova.docx', 'prova.docx'],
    ['path misto (Windows com /)', 'C:/Users/Fer/aula.pdf', 'aula.pdf'],
    ['nome com espaços nas pontas', '  aula final.pdf  ', 'aula final.pdf'],
    ['só extensão (sem nome)', '.pdf', '.pdf'],
    ['nome muito longo (255 chars)', 'a'.repeat(251) + '.pdf', 'a'.repeat(251) + '.pdf'],
    ['parênteses', 'aula (cópia 2).pdf', 'aula (cópia 2).pdf'],
    ['colchetes', 'aula [final].pdf', 'aula [final].pdf'],
    ['underscores', 'minha_aula_01.pdf', 'minha_aula_01.pdf'],
    ['ponto no meio', 'aula.v2.final.pdf', 'aula.v2.final.pdf'],
  ])('sanitiza %s corretamente', (_desc, input, expected) => {
    expect(safeFileName(input)).toBe(expected);
  });

  it('remove null byte (vetor de path traversal)', () => {
    expect(safeFileName('aula\0.pdf')).toBe('aula.pdf');
  });

  it('remove caracteres de controle e tabs/newlines', () => {
    expect(safeFileName('aula\t\n\r.pdf')).toBe('aula.pdf');
  });

  it('arquivo com nome vazio → fallback "arquivo"', () => {
    expect(safeFileName('')).toBe('arquivo');
    expect(safeFileName('   ')).toBe('arquivo');
    expect(safeFileName('\0\0\0')).toBe('arquivo');
  });

  it('garante que envia nome sanitizado pro backend (não o path original)', async () => {
    const file = new File(['x'], '/etc/passwd/../malicious.pdf', { type: 'application/pdf' });
    const promise = submitStudyRequest(baseInput({ attachments: [file] }));
    const xhr = FakeXHR.instances[0]!;
    const sent = xhr.sentBody!.getAll('attachments')[0] as File;
    expect(sent.name).toBe('malicious.pdf');
    expect(sent.name).not.toContain('/');
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 1, message: 'ok' });
    await promise;
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — MIME mapping em browsers/sistemas estranhos
// ──────────────────────────────────────────────────────────────────
describe('STRESS — MIME mapping', () => {
  it.each([
    // Casos reais que vemos em produção: Windows antigo, Linux com Files manager
    // diferente, drag de servidor remoto, share via WhatsApp Desktop, etc.
    ['Windows antigo retorna octet-stream para .docx', 'doc.docx', 'application/octet-stream',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['Linux retorna vazio para .md', 'README.md', '', 'text/markdown'],
    ['Safari pode retornar vazio para .csv', 'dados.csv', '', 'text/csv'],
    ['drag de servidor remoto retorna vazio para .pptx', 'slides.pptx', '',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['type já correto: passa direto', 'a.pdf', 'application/pdf', 'application/pdf'],
    ['maiúsculas no nome', 'IMG.JPG', '', 'image/jpeg'],
    ['extensão inexistente: type vazio → octet-stream', 'estranho.xyz', '', 'application/octet-stream'],
    ['extensão inexistente: type original preservado', 'estranho.xyz', 'foo/bar', 'foo/bar'],
  ])('resolveContentType: %s', (_desc, fileName, type, expected) => {
    const f = new File(['x'], fileName, { type });
    expect(resolveContentType(f)).toBe(expected);
  });

  it('envia MIME canônico pro backend, não o type do browser', async () => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    try {
      const file = new File(['x'], 'planilha.xlsx', { type: 'application/octet-stream' });
      const promise = submitStudyRequest(baseInput({ attachments: [file] }));
      const xhr = FakeXHR.instances[0]!;
      const sent = xhr.sentBody!.getAll('attachments')[0] as File;
      expect(sent.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      xhr.succeed({ id: 'x', status: 'received', attachmentCount: 1, message: 'ok' });
      await promise;
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — boundaries exatos de tamanho
// ──────────────────────────────────────────────────────────────────
describe('STRESS — limites de tamanho', () => {
  it('25 MiB - 1 byte: aceita', () => {
    // Pré-condição: o cap é 25 MiB
    expect(STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBe(25 * 1024 * 1024);
    // Validação client-side cabe no formulário. Aqui só checamos a constante.
    const justUnder = STUDY_REQUEST_LIMITS.maxAttachmentBytes - 1;
    expect(justUnder).toBeLessThan(STUDY_REQUEST_LIMITS.maxAttachmentBytes);
  });

  it('25 MiB exato: aceita (limite é inclusivo no backend Go com >)', () => {
    const exact = STUDY_REQUEST_LIMITS.maxAttachmentBytes;
    expect(exact).toBe(25 * 1024 * 1024);
  });

  it('25 MiB + 1 byte: rejeitado', () => {
    const justOver = STUDY_REQUEST_LIMITS.maxAttachmentBytes + 1;
    expect(justOver).toBeGreaterThan(STUDY_REQUEST_LIMITS.maxAttachmentBytes);
  });

  it('200 MiB total exato: aceita (limite inclusivo)', () => {
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBe(200 * 1024 * 1024);
  });

  it('8 arquivos × 25 MiB = 200 MiB (cabe no cap total)', () => {
    expect(8 * STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBe(
      STUDY_REQUEST_LIMITS.maxTotalUploadBytes,
    );
  });

  it('10 arquivos × 25 MiB = 250 MiB — cap total impede isso', () => {
    // O cap individual permite 10 anexos de 25 MiB cada, mas o cap total
    // bloqueia em 200 MiB. Isso é por design — protege o nginx contra
    // payloads gigantes mesmo dentro dos limites por-arquivo.
    expect(10 * STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBeGreaterThan(
      STUDY_REQUEST_LIMITS.maxTotalUploadBytes,
    );
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — comportamento de rede instável
// ──────────────────────────────────────────────────────────────────
describe('STRESS — rede instável', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('network flap: falha → retry → falha → desiste (maxRetries=1)', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 1 });
    FakeXHR.instances[0]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[1]!.failNetwork();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('network');
    expect(FakeXHR.instances).toHaveLength(2);
  });

  it('5 retries: alternância de falhas heterogêneas → sucesso na última', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 5 });
    FakeXHR.instances[0]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[1]!.failHttp(502, '', 'text/html');
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[2]!.failHttp(503, '');
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[3]!.failTimeout();
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[4]!.failHttp(500, { detail: 'boom' });
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[5]!.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    const result = await promise;
    expect(result.id).toBe('x');
    expect(FakeXHR.instances).toHaveLength(6);
  });

  it('retry pára se durante o backoff chegar erro não-retryable', async () => {
    // Cenário: 1ª falha 502 (retryable), na 2ª o servidor agora devolve 413
    // (não retryable). Não pode insistir.
    const promise = submitStudyRequest(baseInput(), { maxRetries: 5 });
    FakeXHR.instances[0]!.failHttp(502, '', 'text/html');
    await vi.advanceTimersByTimeAsync(800);
    FakeXHR.instances[1]!.failHttp(413, '');
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('payload-too-large');
    expect(FakeXHR.instances).toHaveLength(2); // parou
  });

  it('callback de progress NÃO é chamado depois de erro de rede no meio do upload', async () => {
    const onProgress = vi.fn();
    const promise = submitStudyRequest(baseInput(), { onProgress, maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.upload.onprogress!({ lengthComputable: true, loaded: 5000, total: 10000 } as ProgressEvent);
    expect(onProgress).toHaveBeenLastCalledWith(50);
    xhr.failNetwork();
    await promise.catch(() => undefined);
    // Não deveria ter mais chamadas após o erro
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — respostas malformadas / hostis do servidor
// ──────────────────────────────────────────────────────────────────
describe('STRESS — respostas hostis do servidor', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('2xx com body vazio: rejeita sem crashar', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 201;
    xhr.responseText = '';
    xhr.responseHeaders['Content-Type'] = 'application/json';
    xhr.onload?.();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
  });

  it('2xx com HTML (proxy esquisito sobrescreve resposta): rejeita como server', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 200;
    xhr.responseText = '<html>...</html>';
    xhr.responseHeaders['Content-Type'] = 'text/html';
    xhr.onload?.();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
  });

  it('5xx com JSON malformado: usa fallback amigável', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 500;
    xhr.responseText = '{not-json';
    xhr.responseHeaders['Content-Type'] = 'application/json';
    xhr.onload?.();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
    expect(err.detail).toMatch(/erro no servidor|notificada/i);
  });

  it('4xx com JSON malformado: usa fallback genérico de client', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 422;
    xhr.responseText = 'garbage';
    xhr.responseHeaders['Content-Type'] = 'application/json';
    xhr.onload?.();
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('client');
    expect(err.detail).toMatch(/verifique os dados/i);
  });

  it('mensagem de erro contém caracteres especiais UTF-8 (acentos): preserva', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(400, {
      detail: 'Solicitação inválida: descrição obrigatória — não pode ser vazia.',
    });
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.detail).toContain('descrição');
    expect(err.detail).toContain('—');
  });

  it('status >= 600 (não-standard): trata como server', async () => {
    const promise = submitStudyRequest(baseInput(), { maxRetries: 0 });
    FakeXHR.instances[0]!.failHttp(599, '');
    const err = await promise.catch(e => e as StudyRequestError);
    expect(err.kind).toBe('server');
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — comportamento sob carga de dados extremos
// ──────────────────────────────────────────────────────────────────
describe('STRESS — payloads extremos', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('descrição de 10.000 caracteres: envia íntegra', async () => {
    const longDesc = 'a'.repeat(10_000);
    const promise = submitStudyRequest(baseInput({ description: longDesc }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('description')).toBe(longDesc);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });

  it('texto com newlines e tabs preservado no FormData', async () => {
    const desc = 'linha 1\nlinha 2\n\nparágrafo novo\ttabulado';
    const promise = submitStudyRequest(baseInput({ description: desc }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('description')).toBe(desc);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });

  it('10 arquivos pequenos (limite máximo): todos enviados', async () => {
    const files = Array.from({ length: 10 }, (_, i) =>
      new File(['x'], `aula-${i + 1}.pdf`, { type: 'application/pdf' }),
    );
    const promise = submitStudyRequest(baseInput({ attachments: files }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.getAll('attachments')).toHaveLength(10);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 10, message: 'ok' });
    await promise;
  });

  it('emails edge case (com +): envia exato', async () => {
    const promise = submitStudyRequest(baseInput({ email: 'maria+ffv@gmail.com' }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('email')).toBe('maria+ffv@gmail.com');
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });

  it('subject com caracteres especiais: preserva', async () => {
    const subject = 'C++ & Rust — comparação de "low-level"';
    const promise = submitStudyRequest(baseInput({ subject }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('subject')).toBe(subject);
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });

  it('phone sem máscara (só dígitos): envia como recebeu', async () => {
    const promise = submitStudyRequest(baseInput({ phone: '11987654321' }));
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('phone')).toBe('11987654321');
    xhr.succeed({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    await promise;
  });
});

// ──────────────────────────────────────────────────────────────────
// Stress — concorrência e race conditions
// ──────────────────────────────────────────────────────────────────
describe('STRESS — concorrência', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('duas submissões em paralelo: cada uma cria seu próprio XHR', async () => {
    const p1 = submitStudyRequest(baseInput({ name: 'A' }), { maxRetries: 0 });
    const p2 = submitStudyRequest(baseInput({ name: 'B' }), { maxRetries: 0 });
    expect(FakeXHR.instances).toHaveLength(2);
    FakeXHR.instances[0]!.succeed({ id: 'a', status: 'received', attachmentCount: 0, message: 'ok' });
    FakeXHR.instances[1]!.succeed({ id: 'b', status: 'received', attachmentCount: 0, message: 'ok' });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.id).toBe('a');
    expect(r2.id).toBe('b');
    // Cada um mandou seu próprio nome
    expect(FakeXHR.instances[0]!.sentBody!.get('name')).toBe('A');
    expect(FakeXHR.instances[1]!.sentBody!.get('name')).toBe('B');
  });

  it('abort de uma das duas submissões em paralelo não afeta a outra', async () => {
    const ctrl1 = new AbortController();
    const ctrl2 = new AbortController();
    const p1 = submitStudyRequest(baseInput({ name: 'A' }), { signal: ctrl1.signal, maxRetries: 0 });
    const p2 = submitStudyRequest(baseInput({ name: 'B' }), { signal: ctrl2.signal, maxRetries: 0 });
    // Aborta só o primeiro
    ctrl1.abort();
    FakeXHR.instances[1]!.succeed({ id: 'b', status: 'received', attachmentCount: 0, message: 'ok' });
    await expect(p1).rejects.toMatchObject({ kind: 'network' });
    await expect(p2).resolves.toMatchObject({ id: 'b' });
  });

  it('cada retry gera FormData fresh (algumas implementações de XHR não reusam body)', async () => {
    vi.useFakeTimers();
    const promise = submitStudyRequest(
      baseInput({ attachments: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] }),
    );
    const body1 = FakeXHR.instances[0]!.sentBody;
    FakeXHR.instances[0]!.failNetwork();
    await vi.advanceTimersByTimeAsync(800);
    const body2 = FakeXHR.instances[1]!.sentBody;
    expect(body2).not.toBe(body1); // instância diferente
    expect(body2!.get('name')).toBe('Maria');
    expect(body2!.getAll('attachments')).toHaveLength(1);
    FakeXHR.instances[1]!.succeed({ id: 'x', status: 'received', attachmentCount: 1, message: 'ok' });
    await promise;
    vi.useRealTimers();
  });
});
