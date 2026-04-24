'use client';

/**
 * Certificados — emissão e verificação (MVP mockado client-side).
 *
 * Fluxo:
 * 1. Usuário passa em um simulado (score >= passingScore)
 * 2. Abre CertificateModal, confirma nome
 * 3. Geramos hash determinístico (SHA-256 trunc) de userId+simuladoId+date
 * 4. Persistimos em STORAGE_KEYS.CERTIFICATES (map hash → record)
 * 5. PDF é gerado via canvas → toDataURL → download
 * 6. /verificar/[hash] procura o hash no localStorage (client-side only)
 *
 * TODO(backend): mover o registro para o servidor. Hash deve vir de endpoint
 * assinado pra impedir forjar certificado fake. Página /verificar bate em
 * /api/certificates/:hash e retorna autoridade real.
 */

import { STORAGE_KEYS } from './constants';
import { getJSON, setJSON } from './storage';
import { CertificatesStoredSchema } from './schemas';

export interface CertificateRecord {
  hash: string;
  name: string;
  simuladoId: string;
  score: number;
  issuedAt: string;
}

function loadCerts(): Record<string, CertificateRecord> {
  const raw = getJSON<unknown>(STORAGE_KEYS.CERTIFICATES, {});
  const parsed = CertificatesStoredSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

/** Calcula hash SHA-256 truncado (32 hex chars) de uma string. */
async function sha256Short(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  const hex = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 32);
}

/** Gera hash único pra um certificado (determinístico por user+simulado+date). */
export async function buildCertificateHash(
  email: string,
  simuladoId: string,
  issuedAt: string,
): Promise<string> {
  return sha256Short(`${email}|${simuladoId}|${issuedAt}`);
}

export async function issueCertificate(input: {
  email: string;
  name: string;
  simuladoId: string;
  score: number;
}): Promise<CertificateRecord> {
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

export function getCertificate(hash: string): CertificateRecord | null {
  const certs = loadCerts();
  return certs[hash] ?? null;
}

export function listCertificates(): CertificateRecord[] {
  return Object.values(loadCerts());
}
