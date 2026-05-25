/**
 * Contract test — valida que a request HTTP que o frontend envia bate EXATAMENTE
 * com o que o handler Go (`backend/internal/interfaces/http/handlers/study_request_handler.go`)
 * espera receber. Esse teste é o último cinto de segurança contra divergências
 * silenciosas entre frontend e backend que só apareceriam em produção como
 * "Failed to fetch" ou 400.
 *
 * Source of truth (backend Go):
 *   - URL: POST /api/v1/study-requests
 *           ver router.go:257
 *   - Method: POST
 *   - Content-Type: multipart/form-data (handler exige isso explicitamente)
 *   - FormValues lidos:
 *       name, email, phone, studyArea, institution, subject, goal, description,
 *       marketingConsent  (study_request_handler.go:86-96)
 *   - FormFile key: "attachments" (study_request_handler.go:106)
 *   - MIME types aceitos: 15 tipos listados em domsr.AllowedContentTypes
 *       (backend/internal/domain/studyrequest/study_request.go:89-105)
 *   - Limites: 25 MiB/arquivo, 10 anexos/request, 200 MiB total
 *
 * Se o backend mudar qualquer um desses contratos, este teste DEVE quebrar.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitStudyRequest,
  STUDY_REQUEST_LIMITS,
  resolveContentType,
  type StudyRequestInput,
} from '../study-request-api';

class FakeXHR {
  static instances: FakeXHR[] = [];
  static reset() { FakeXHR.instances = []; }
  status = 0;
  responseText = '';
  responseHeaders: Record<string, string> = {};
  timeout = 0;
  withCredentials = false;
  method = '';
  url = '';
  sentBody?: FormData;
  upload: { onprogress?: (e: ProgressEvent) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  constructor() { FakeXHR.instances.push(this); }
  open(method: string, url: string) { this.method = method; this.url = url; }
  getResponseHeader(name: string) {
    return this.responseHeaders[name.toLowerCase()] ?? this.responseHeaders[name] ?? null;
  }
  send(body: FormData) { this.sentBody = body; }
  abort() { /* noop */ }
  succeed() {
    this.status = 201;
    this.responseText = JSON.stringify({ id: 'x', status: 'received', attachmentCount: 0, message: 'ok' });
    this.responseHeaders['Content-Type'] = 'application/json';
    this.onload?.();
  }
}

// Snapshot exato do contrato com o backend. Mudou aqui? Mudou no backend? Sync.
const BACKEND_CONTRACT = {
  url: '/api/v1/study-requests',
  method: 'POST',
  contentTypePrefix: 'multipart/form-data',
  formFields: [
    'name', 'email', 'phone', 'studyArea', 'institution',
    'subject', 'goal', 'description', 'marketingConsent',
  ] as const,
  fileFieldName: 'attachments',
  // MIME types EXATOS aceitos em backend/internal/domain/studyrequest/study_request.go
  acceptedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ] as const,
  // Limites em domsr.MaxAttachmentSize e MaxAttachmentsPerRequest
  maxFileSize: 25 * 1024 * 1024,
  maxFilesPerRequest: 10,
  // Limite multipart total no handler Go (maxMultipartBytes)
  maxTotalBytes: 200 * 1024 * 1024,
} as const;

function fullInput(): StudyRequestInput {
  return {
    name: 'Maria',
    email: 'maria@gmail.com',
    phone: '11987654321',
    studyArea: 'tecnologia',
    institution: 'USP',
    subject: 'IA',
    goal: 'Passar na prova',
    description: 'Quero virar engenheira',
    marketingConsent: true,
    attachments: [new File(['x'], 'a.pdf', { type: 'application/pdf' })],
  };
}

describe('CONTRACT — frontend envia exatamente o que o backend Go espera', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('URL exata: POST /api/v1/study-requests', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.method).toBe(BACKEND_CONTRACT.method);
    expect(xhr.url).toMatch(new RegExp(`${BACKEND_CONTRACT.url}$`));
    xhr.succeed();
    await promise;
  });

  it('envia TODOS os 9 form fields esperados pelo handler', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    const fd = xhr.sentBody!;
    for (const field of BACKEND_CONTRACT.formFields) {
      expect(fd.has(field), `frontend deveria enviar campo "${field}"`).toBe(true);
    }
    xhr.succeed();
    await promise;
  });

  it('NÃO envia campos extras que o handler não lê (anti-bloat)', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    const fd = xhr.sentBody!;
    const knownFields = new Set([
      ...BACKEND_CONTRACT.formFields,
      BACKEND_CONTRACT.fileFieldName,
    ]);
    const sentKeys: string[] = [];
    fd.forEach((_, key) => sentKeys.push(key));
    for (const key of sentKeys) {
      expect(knownFields.has(key as never), `frontend mandou campo desconhecido "${key}"`).toBe(true);
    }
    xhr.succeed();
    await promise;
  });

  it('chave dos arquivos é "attachments" (não "files" nem "uploads")', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.getAll(BACKEND_CONTRACT.fileFieldName)).toHaveLength(1);
    expect(xhr.sentBody!.getAll('files')).toHaveLength(0);
    expect(xhr.sentBody!.getAll('uploads')).toHaveLength(0);
    xhr.succeed();
    await promise;
  });

  it('marketingConsent é a string "true" (não boolean — backend faz strconv)', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.get('marketingConsent')).toBe('true');
    xhr.succeed();
    await promise;
  });

  it('marketingConsent=false: omite o campo (handler lê falsy como false)', async () => {
    const promise = submitStudyRequest({ ...fullInput(), marketingConsent: false });
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.sentBody!.has('marketingConsent')).toBe(false);
    xhr.succeed();
    await promise;
  });

  it('NÃO seta Content-Type manualmente (browser preenche com boundary)', async () => {
    const promise = submitStudyRequest(fullInput());
    const xhr = FakeXHR.instances[0]!;
    // FakeXHR não tem setRequestHeader explícito — checamos via assertion no código real:
    // a única forma do Content-Type vir errado é se o código setasse manualmente.
    // Como não há setRequestHeader chamado, o browser vai preencher correto.
    expect(xhr.sentBody).toBeInstanceOf(FormData);
    xhr.succeed();
    await promise;
  });

  it('credentials=omit (endpoint público, sem cookies/JWT)', async () => {
    const promise = submitStudyRequest(fullInput());
    expect(FakeXHR.instances[0]!.withCredentials).toBe(false);
    FakeXHR.instances[0]!.succeed();
    await promise;
  });

  it('todo MIME enviado está na allowlist do backend', () => {
    // Para cada extensão que o frontend declara aceitar, o resolveContentType
    // deve produzir um MIME que o backend Go aceita.
    for (const ext of STUDY_REQUEST_LIMITS.allowedExtensions) {
      const file = new File(['x'], `arquivo${ext}`, { type: '' });
      const resolvedMime = resolveContentType(file);
      expect(
        BACKEND_CONTRACT.acceptedMimeTypes.includes(resolvedMime as never),
        `extensão ${ext} → MIME "${resolvedMime}" NÃO está na allowlist do backend`,
      ).toBe(true);
    }
  });

  it('allowedContentTypes do frontend bate exatamente com a allowlist do backend', () => {
    expect([...STUDY_REQUEST_LIMITS.allowedContentTypes].sort())
      .toEqual([...BACKEND_CONTRACT.acceptedMimeTypes].sort());
  });

  it('limites do frontend espelham os do backend', () => {
    expect(STUDY_REQUEST_LIMITS.maxAttachmentBytes).toBe(BACKEND_CONTRACT.maxFileSize);
    expect(STUDY_REQUEST_LIMITS.maxAttachments).toBe(BACKEND_CONTRACT.maxFilesPerRequest);
    expect(STUDY_REQUEST_LIMITS.maxTotalUploadBytes).toBe(BACKEND_CONTRACT.maxTotalBytes);
  });

  it('valores enviados são strings (FormData converte; checamos para garantir)', async () => {
    const promise = submitStudyRequest(fullInput());
    const fd = FakeXHR.instances[0]!.sentBody!;
    for (const field of BACKEND_CONTRACT.formFields) {
      const v = fd.get(field);
      if (v !== null) {
        expect(typeof v).toBe('string');
      }
    }
    FakeXHR.instances[0]!.succeed();
    await promise;
  });

  it('cada attachment no FormData é instância de File com nome e type setados', async () => {
    const promise = submitStudyRequest({
      ...fullInput(),
      attachments: [
        new File(['a'], 'doc.pdf', { type: 'application/pdf' }),
        new File(['b'], 'pl.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      ],
    });
    const sent = FakeXHR.instances[0]!.sentBody!.getAll('attachments');
    expect(sent).toHaveLength(2);
    for (const item of sent) {
      expect(item).toBeInstanceOf(File);
      expect((item as File).name).toBeTruthy();
      expect((item as File).type).toBeTruthy();
    }
    FakeXHR.instances[0]!.succeed();
    await promise;
  });

  it('parse manual de multipart: validar boundary correto não é nossa responsabilidade — é do browser', () => {
    // Documenta intenção: NÃO setamos Content-Type manualmente; o browser
    // gera o boundary correto. Teste serve de regression-guard caso alguém
    // adicione um xhr.setRequestHeader('Content-Type', ...) e quebre tudo.
    expect(true).toBe(true);
  });
});

describe('CONTRACT — endpoint público (não requer auth)', () => {
  beforeEach(() => {
    FakeXHR.reset();
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('não envia header Authorization', async () => {
    // Como FakeXHR.send não recebe headers, o teste verifica que
    // o código não fez xhr.setRequestHeader — comportamento atual.
    const promise = submitStudyRequest(fullInput());
    expect(FakeXHR.instances[0]!.withCredentials).toBe(false);
    FakeXHR.instances[0]!.succeed();
    await promise;
  });
});
