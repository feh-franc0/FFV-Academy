'use client';

/**
 * Certificados — emissão e verificação.
 *
 * Modo mock (sem backend): hash client-side + localStorage (MVP).
 * Modo real: hash gerado no servidor + persistência no DB.
 *   - issueCertificate → POST /api/v1/certificates
 *   - getCertificate   → GET  /api/v1/certificates/{hash}  (público, sem auth)
 *   - listCertificates → GET  /api/v1/me/certificates
 */

import { STORAGE_KEYS } from './constants';
import { getJSON, setJSON } from './storage';
import { CertificatesStoredSchema } from './schemas';
import { hasBackend, apiPost, apiGet } from './api-client';

export interface CertificateRecord {
  hash: string;
  name: string;
  simuladoId: string;
  score: number;
  issuedAt: string;
}

// ─── DTO do backend ─────────────────────────────────────────────────────────

interface CertificateDTO {
  hash: string;
  userId: string;
  simuladoId: string;
  attemptId: string;
  holderName: string;
  issuedAt: string;
  verifyUrl: string;
}

function dtoToRecord(dto: CertificateDTO, score: number): CertificateRecord {
  return {
    hash: dto.hash,
    name: dto.holderName,
    simuladoId: dto.simuladoId,
    score,
    issuedAt: dto.issuedAt,
  };
}

// ─── Mock helpers ───────────────────────────────────────────────────────────

function loadCerts(): Record<string, CertificateRecord> {
  const raw = getJSON<unknown>(STORAGE_KEYS.CERTIFICATES, {});
  const parsed = CertificatesStoredSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

async function sha256Short(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  const hex = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 32);
}

export async function buildCertificateHash(
  email: string,
  simuladoId: string,
  issuedAt: string,
): Promise<string> {
  return sha256Short(`${email}|${simuladoId}|${issuedAt}`);
}

// ─── issueCertificate ───────────────────────────────────────────────────────

export async function issueCertificate(input: {
  email: string;
  name: string;
  simuladoId: string;
  score: number;
  attemptId?: string;
}): Promise<CertificateRecord> {
  if (hasBackend() && input.attemptId) {
    const dto = await apiPost<CertificateDTO>('/api/v1/certificates', {
      simuladoId: input.simuladoId,
      attemptId: input.attemptId,
      holderName: input.name,
    });
    const record = dtoToRecord(dto, input.score);
    // Cache local para acesso offline ao PDF
    const certs = loadCerts();
    certs[record.hash] = record;
    setJSON(STORAGE_KEYS.CERTIFICATES, certs);
    return record;
  }

  // Modo mock
  const issuedAt = new Date().toISOString();
  const hash = await buildCertificateHash(input.email, input.simuladoId, issuedAt);
  const record: CertificateRecord = {
    hash,
    name: input.name,
    simuladoId: input.simuladoId,
    score: input.score,
    issuedAt,
  };
  const certs = loadCerts();
  certs[hash] = record;
  setJSON(STORAGE_KEYS.CERTIFICATES, certs);
  return record;
}

// ─── getCertificate ─────────────────────────────────────────────────────────

export async function getCertificate(hash: string): Promise<CertificateRecord | null> {
  if (hasBackend()) {
    try {
      const dto = await apiGet<CertificateDTO>(`/api/v1/certificates/${hash}`, false);
      return dtoToRecord(dto, 0);
    } catch {
      return null;
    }
  }
  return loadCerts()[hash] ?? null;
}

/** Versão síncrona para acesso local (PDF, modal). Não chama backend. */
export function getCertificateLocal(hash: string): CertificateRecord | null {
  return loadCerts()[hash] ?? null;
}

// ─── listCertificates ───────────────────────────────────────────────────────

export async function listCertificates(): Promise<CertificateRecord[]> {
  if (hasBackend()) {
    try {
      const dtos = await apiGet<CertificateDTO[]>('/api/v1/me/certificates');
      return dtos.map(dto => dtoToRecord(dto, 0));
    } catch {
      return Object.values(loadCerts());
    }
  }
  return Object.values(loadCerts());
}
