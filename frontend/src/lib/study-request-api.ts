// study-request-api: cliente para o endpoint público de captação de solicitações
// de experiência de estudo personalizada (POST /api/v1/study-requests).
//
// Endpoint é multipart/form-data — não passa pelo wrapper apiFetch JSON porque
// precisa enviar arquivos como FormData. Sem auth header.

export interface StudyRequestInput {
  name: string;
  email: string;
  phone?: string;
  studyArea: string;
  institution?: string;
  subject: string;
  goal?: string;
  description: string;
  marketingConsent?: boolean;
  attachments?: File[];
}

export interface StudyRequestResult {
  id: string;
  status: string;
  attachmentCount: number;
  message: string;
}

/**
 * Categoria de erro — permite que a UI escolha ícone/CTA apropriado e que
 * testes assertam o tipo sem depender da mensagem exata em português.
 *
 * - network: falha antes do servidor responder (offline, DNS, CORS, conn reset).
 *   Tipicamente safe pra retry automático.
 * - payload-too-large: 413 ou conn reset por exceder limite (nginx/proxy).
 *   NÃO retry — o usuário precisa remover arquivos.
 * - server: 5xx — servidor com problema. Retry manual recomendado.
 * - client: 4xx (exceto 413) — input inválido. Mostrar mensagem do server.
 * - unknown: fallback — não classificado.
 */
export type StudyRequestErrorKind =
  | 'network'
  | 'payload-too-large'
  | 'server'
  | 'client'
  | 'unknown';

export class StudyRequestError extends Error {
  readonly status: number;
  readonly detail: string;
  readonly kind: StudyRequestErrorKind;
  /** Se true, faz sentido oferecer "Tentar novamente" sem o usuário mudar nada. */
  readonly retryable: boolean;
  constructor(status: number, detail: string, kind: StudyRequestErrorKind = 'unknown') {
    super(detail || 'Falha ao enviar solicitação');
    this.name = 'StudyRequestError';
    this.status = status;
    this.detail = detail;
    this.kind = kind;
    this.retryable = kind === 'network' || kind === 'server';
  }
}

function getApiBase(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
}

/**
 * Detecta TypeErrors do fetch (ex: "Failed to fetch", "NetworkError",
 * "Load failed" no Safari) e os traduz para mensagem amigável. Esses erros
 * não revelam ao usuário o motivo real (CORS, DNS, conexão resetada por
 * payload grande, etc) — todos chegam como TypeError com mensagem genérica.
 */
function isNetworkLevelError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === 'TypeError') return true;
  // Alguns ambientes lançam DOMException com "NetworkError"
  if (err.name === 'NetworkError') return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load failed') ||
    msg.includes('networkerror')
  );
}

/**
 * Mapeia erro de rede para mensagem amigável. Tenta dar uma dica acionável
 * em vez de só "deu ruim".
 */
function friendlyNetworkMessage(): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Você parece estar offline. Conecte à internet e tente novamente — seus dados continuam preenchidos.';
  }
  return 'Não conseguimos conectar ao servidor. Pode ser instabilidade momentânea ou problema na sua rede. Tente novamente em alguns segundos — seus dados continuam preenchidos.';
}

/**
 * Mapeia status HTTP para mensagens amigáveis em PT-BR. O backend devolve
 * RFC 7807 com `detail` em português, mas alguns 4xx/5xx vêm sem JSON
 * (ex: 413 do nginx antes de chegar no Go, 502/504 do reverse proxy).
 * Nesses casos preferimos uma mensagem nossa em vez de "HTTP 502".
 */
function friendlyHttpMessage(status: number, serverDetail: string): {
  detail: string;
  kind: StudyRequestErrorKind;
} {
  if (status === 413) {
    return {
      detail: 'Os arquivos somam mais do que o servidor aceita. Remova algum anexo ou reduza o tamanho dos PDFs e tente de novo.',
      kind: 'payload-too-large',
    };
  }
  if (status === 408 || status === 504) {
    return {
      detail: 'O envio demorou demais e o servidor encerrou a conexão. Costuma acontecer com arquivos grandes em rede instável — tente novamente.',
      kind: 'network',
    };
  }
  if (status === 502 || status === 503) {
    return {
      detail: 'Servidor temporariamente indisponível. Pode ser deploy em andamento — tente novamente em alguns segundos.',
      kind: 'server',
    };
  }
  if (status === 429) {
    return {
      detail: 'Muitas tentativas seguidas. Aguarde 1 minuto antes de tentar de novo.',
      kind: 'client',
    };
  }
  if (status >= 500) {
    return {
      detail: serverDetail && !serverDetail.startsWith('HTTP ')
        ? serverDetail
        : 'Erro no servidor. Nossa equipe foi notificada — tente novamente em alguns instantes.',
      kind: 'server',
    };
  }
  // 4xx genérico: backend já manda mensagem útil no `detail`.
  return {
    detail: serverDetail || 'Não foi possível enviar — verifique os dados e tente novamente.',
    kind: 'client',
  };
}

export async function submitStudyRequest(input: StudyRequestInput): Promise<StudyRequestResult> {
  const fd = new FormData();
  fd.append('name', input.name);
  fd.append('email', input.email);
  if (input.phone) fd.append('phone', input.phone);
  fd.append('studyArea', input.studyArea);
  if (input.institution) fd.append('institution', input.institution);
  fd.append('subject', input.subject);
  if (input.goal) fd.append('goal', input.goal);
  fd.append('description', input.description);
  if (input.marketingConsent) fd.append('marketingConsent', 'true');
  if (input.attachments) {
    for (const file of input.attachments) {
      fd.append('attachments', file, file.name);
    }
  }

  const base = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${base}/api/v1/study-requests`, {
      method: 'POST',
      body: fd,
      // NÃO setar Content-Type — o browser preenche com o boundary correto.
      credentials: 'omit',
    });
  } catch (err) {
    // fetch() falhou ANTES de receber resposta: rede off, CORS, DNS,
    // conexão resetada pelo proxy por payload grande, etc.
    // Browser não nos dá o motivo real — sempre TypeError "Failed to fetch".
    if (isNetworkLevelError(err)) {
      throw new StudyRequestError(0, friendlyNetworkMessage(), 'network');
    }
    throw new StudyRequestError(
      0,
      err instanceof Error ? err.message : 'Falha de rede desconhecida',
      'network',
    );
  }

  if (!res.ok) {
    let serverDetail = '';
    try {
      const body = await res.json() as { detail?: string; title?: string };
      serverDetail = body.detail || body.title || '';
    } catch {
      // resposta sem JSON (ex: 413/502 do nginx, HTML de erro)
    }
    const { detail, kind } = friendlyHttpMessage(res.status, serverDetail);
    throw new StudyRequestError(res.status, detail, kind);
  }

  return await res.json() as StudyRequestResult;
}

// Configuração compartilhada com o frontend de validação.
// Espelha as constantes do backend (domain/studyrequest):
export const STUDY_REQUEST_LIMITS = {
  maxAttachments: 10,
  maxAttachmentBytes: 25 * 1024 * 1024,
  /**
   * Soma máxima de todos os anexos. Espelha `maxMultipartBytes` (200 MiB) do
   * handler Go (`study_request_handler.go`). Validamos client-side pra dar
   * mensagem amigável em vez de connection reset (que vira "Failed to fetch").
   */
  maxTotalUploadBytes: 200 * 1024 * 1024,
  allowedContentTypes: [
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
  ],
  allowedExtensions: [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.txt',
    '.md',
    '.csv',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
  ],
} as const;
