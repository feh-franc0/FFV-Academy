/**
 * study-request-tracking — persistência local da solicitação ativa do usuário.
 *
 * Objetivo: quando o usuário envia o form, o ID + timestamp ficam guardados
 * pra que o SLA tracker reabra com estado correto se ele voltar (mesmo dispositivo).
 *
 * V1: localStorage. V2 (Onda 2 backend): cruzar com `GET /study-requests/{id}/status`
 * pro estado canônico vir do servidor.
 *
 * Etapa derivada de tempo decorrido:
 *  - 0-30min     → "Recebida"    (etapa 1 active)
 *  - 30min-24h   → "Curadoria"   (etapa 2 active)
 *  - >24h        → "Trilha pronta" (etapa 3 active — assume entregue se >24h)
 *
 * Isso evita ficar mostrando "Curadoria em andamento" eternamente. Quando
 * backend vier, override com status real.
 */

import { z } from 'zod';

export interface TrackedStudyRequest {
  id: string;
  email: string;
  attachmentCount: number;
  submittedAt: string; // ISO
  status?: 'received' | 'curating' | 'delivered'; // override do backend (futuro)
}

const STORAGE_KEY = 'ffv_active_study_request_v1';

const Schema = z.object({
  id: z.string().min(1),
  email: z.string(),
  attachmentCount: z.number().int().nonnegative(),
  submittedAt: z.string(),
  status: z.enum(['received', 'curating', 'delivered']).optional(),
});

export function saveActiveRequest(req: TrackedStudyRequest): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(req));
  } catch {
    // localStorage cheio / safari modo privado — silenciamos
  }
}

export function loadActiveRequest(): TrackedStudyRequest | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return Schema.parse(JSON.parse(raw));
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

export function clearActiveRequest(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/** Etapas do SLA tracker visíveis pro usuário. */
export type SlaStep = 'received' | 'curating' | 'delivered';

/**
 * Deriva a etapa atual a partir do tempo decorrido desde o submit.
 * Override pelo `status` se backend fornecer.
 */
export function deriveSlaStep(req: TrackedStudyRequest, now: Date = new Date()): SlaStep {
  if (req.status) return req.status;

  const submitted = new Date(req.submittedAt).getTime();
  const elapsedMin = (now.getTime() - submitted) / (1000 * 60);

  if (elapsedMin < 30) return 'received';
  if (elapsedMin < 24 * 60) return 'curating';
  return 'delivered';
}

/** Texto humanizado de "tempo decorrido" — "2h 14min atrás", "agora mesmo". */
export function humanizeElapsed(submittedAt: string, now: Date = new Date()): string {
  const submitted = new Date(submittedAt).getTime();
  const diffMs = now.getTime() - submitted;
  const min = Math.floor(diffMs / 1000 / 60);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const hours = Math.floor(min / 60);
  if (hours < 24) {
    const remMin = min % 60;
    return remMin > 0
      ? `há ${hours}h ${remMin}min`
      : `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
}
