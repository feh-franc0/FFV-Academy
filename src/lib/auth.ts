'use client';

/**
 * Auth adapter — MVP MOCK client-side.
 *
 * Em produção real, as funções `requestToken` e `verifyToken` viram chamadas
 * HTTP (POST /api/auth/request-token, POST /api/auth/verify). A interface fica
 * igual, o consumidor (LoginModal, useAuth) não precisa mudar.
 *
 * Contrato do mock:
 * - `requestToken(email, phone)` — simula envio (log em console, 400ms delay).
 * - `verifyToken(email, token)` — aceita apenas o token "000000" nesse modo dev.
 * - Perfil persistido em `STORAGE_KEYS.USER` via `storage.ts`.
 *
 * NUNCA chamar localStorage direto aqui — sempre via storage adapter.
 */

import { getUser, setUser, clearUser } from './storage';
import { emailSchema, phoneBRSchema } from './schemas';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  marketingConsent: boolean;
  /** Slugs de produtos pagos (ex: ["simulado-aws-practitioner"]). */
  paidProducts: string[];
}

/** Token fixo aceito durante o experimento — visível intencionalmente. */
export const MOCK_TOKEN = '000000';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Solicita o token de login. No mock, apenas loga. Em produção, chama
 * POST /api/auth/request-token que dispara email + SMS.
 *
 * TODO(backend): trocar mock por fetch real, respeitar rate-limit por IP.
 */
export async function requestToken(email: string, phone: string): Promise<{ ok: true }> {
  if (!emailSchema.safeParse(email).success) {
    throw new Error('email inválido');
  }
  if (!phoneBRSchema.safeParse(phone).success) {
    throw new Error('telefone inválido');
  }
  // eslint-disable-next-line no-console
  console.info(`[MOCK] token ${MOCK_TOKEN} enviado para ${email} / ${phone}`);
  await delay(400);
  return { ok: true };
}

interface PendingRegistration {
  name: string;
  phone: string;
  marketingConsent: boolean;
}

/**
 * Verifica o token. No mock, qualquer valor diferente de "000000" retorna
 * `{ ok: false }`. Se ok, cria/atualiza o UserProfile persistido.
 *
 * A assinatura exposta pelo adapter aceita email + token; o UI (LoginModal)
 * precisa ter coletado os outros campos antes. Passamos esses dados via
 * `pendingRegistration` (in-memory, não persiste até verificar).
 *
 * TODO(backend): trocar por POST /api/auth/verify; server cria sessão JWT.
 */
export async function verifyToken(
  email: string,
  token: string,
  pendingRegistration?: PendingRegistration,
): Promise<{ ok: boolean; user?: UserProfile }> {
  await delay(300);
  if (token !== MOCK_TOKEN) return { ok: false };
  if (!emailSchema.safeParse(email).success) return { ok: false };

  const existing = getUser();
  if (existing && existing.email === email) {
    return { ok: true, user: existing };
  }

  // Primeira autenticação — precisa do cadastro pendente.
  if (!pendingRegistration) return { ok: false };

  const user: UserProfile = {
    name: pendingRegistration.name.trim(),
    email,
    phone: pendingRegistration.phone,
    createdAt: new Date().toISOString(),
    marketingConsent: pendingRegistration.marketingConsent,
    paidProducts: [],
  };
  const saved = setUser(user);
  if (!saved) return { ok: false };
  return { ok: true, user };
}

/** Lê o user da sessão (ou null). SSR-safe. */
export function getCurrentUser(): UserProfile | null {
  return getUser();
}

/** Logout — remove o perfil do localStorage. */
export function logout(): void {
  clearUser();
}

/** Checa se o usuário pagou por um produto específico. */
export function isPaidFor(productId: string): boolean {
  const user = getUser();
  if (!user) return false;
  return user.paidProducts.includes(productId);
}

/**
 * MOCK de pagamento — marca produto como pago.
 *
 * TODO(backend): substituir por fluxo real (Stripe Checkout, webhook,
 * confirmação server-side). Nunca, jamais, confiar em grantProduct
 * client-side em produção.
 */
export function grantProduct(productId: string): boolean {
  const user = getUser();
  if (!user) return false;
  if (user.paidProducts.includes(productId)) return true;
  const next: UserProfile = { ...user, paidProducts: [...user.paidProducts, productId] };
  return setUser(next);
}

/** Atualiza consentimento de marketing. */
export function updateMarketingConsent(consent: boolean): boolean {
  const user = getUser();
  if (!user) return false;
  return setUser({ ...user, marketingConsent: consent });
}

/** Atualiza dados do usuário (nome/telefone). Mantém email e paidProducts. */
export function updateProfile(patch: { name?: string; phone?: string }): boolean {
  const user = getUser();
  if (!user) return false;
  const next: UserProfile = {
    ...user,
    name: patch.name?.trim() || user.name,
    phone: patch.phone || user.phone,
  };
  return setUser(next);
}
