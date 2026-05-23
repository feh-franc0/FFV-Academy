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

export class StudyRequestError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail || 'Falha ao enviar solicitação');
    this.name = 'StudyRequestError';
    this.status = status;
    this.detail = detail;
  }
}

function getApiBase(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
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
    throw new StudyRequestError(0, err instanceof Error ? err.message : 'Falha de rede');
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { detail?: string; title?: string };
      detail = body.detail || body.title || detail;
    } catch {
      // resposta sem JSON, mantém detail genérico
    }
    throw new StudyRequestError(res.status, detail);
  }

  return await res.json() as StudyRequestResult;
}

// Configuração compartilhada com o frontend de validação.
// Espelha as constantes do backend (domain/studyrequest):
export const STUDY_REQUEST_LIMITS = {
  maxAttachments: 10,
  maxAttachmentBytes: 25 * 1024 * 1024,
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
