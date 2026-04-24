'use client';

/**
 * Auth adapter — suporta modo mock (dev/testes) e modo real (backend Go).
 *
 * Modo mock:  NEXT_PUBLIC_API_BASE_URL ausente ou vazio.
 *             Token "000000" é aceito; sem chamadas HTTP.
 * Modo real:  NEXT_PUBLIC_API_BASE_URL definido.
 *             Chama POST /api/v1/auth/request-token e /api/v1/auth/verify.
 *             JWT access token guardado em memória via api-client.
 *             Refresh token chega via cookie HttpOnly (browser gerencia).
 *
 * A interface pública é idêntica nos dois modos — consumidores (LoginModal,
 * useAuth, AuthProvider) não precisam mudar.
 */

import { getUser, setUser, clearUser } from './storage';
import { emailSchema, phoneBRSchema } from './schemas';
import {
  hasBackend,
  apiPost,
  apiPatch,
  apiDelete,
  setAccessToken,
  clearAccessToken,
  ApiError,
} from './api-client';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  marketingConsent: boolean;
  /** Slugs de produtos pagos (ex: ["simulado-aws-practitioner"]). */
  paidProducts: string[];
}

/** DTO retornado pelo backend em /api/v1/me e /api/v1/auth/verify. */
interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  referralId: string;
  products: string[];
  marketingConsent: boolean;
  createdAt: string;
}

function dtoToProfile(dto: UserDTO, existingPhone?: string): UserProfile {
  // Backend não retorna phone — preserva do cache local ou usa placeholder válido
  const phone = existingPhone || getUser()?.phone || '+5500000000000';
  return {
    name: dto.name,
    email: dto.email,
    phone,
    createdAt: dto.createdAt,
    marketingConsent: dto.marketingConsent,
    paidProducts: dto.products,
  };
}

/** Token fixo aceito no modo mock — visível intencionalmente. */
export const MOCK_TOKEN = '000000';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── requestToken ──────────────────────────────────────────────────────────

/**
 * Solicita o token de login.
 * Mock: simula envio (log + 400ms).
 * Real: POST /api/v1/auth/request-token → email + SMS via Resend/Twilio.
 */
export async function requestToken(email: string, phone: string): Promise<{ ok: true }> {
  if (!emailSchema.safeParse(email).success) throw new Error('email inválido');
  if (!phoneBRSchema.safeParse(phone).success) throw new Error('telefone inválido');

  if (!hasBackend()) {
    // eslint-disable-next-line no-console
    console.info(`[MOCK] token ${MOCK_TOKEN} enviado para ${email} / ${phone}`);
    await delay(400);
    return { ok: true };
  }

  await apiPost('/api/v1/auth/request-token', { email, phone }, false);
  return { ok: true };
}

// ─── verifyToken ───────────────────────────────────────────────────────────

interface PendingRegistration {
  name: string;
  phone: string;
  marketingConsent: boolean;
}

/**
 * Verifica o token.
 * Mock: aceita apenas "000000".
 * Real: POST /api/v1/auth/verify → recebe accessToken + UserDTO.
 */
export async function verifyToken(
  email: string,
  token: string,
  pendingRegistration?: PendingRegistration,
): Promise<{ ok: boolean; user?: UserProfile }> {
  if (!emailSchema.safeParse(email).success) return { ok: false };

  if (!hasBackend()) {
    await delay(300);
    if (token !== MOCK_TOKEN) return { ok: false };

    const existing = getUser();
    if (existing && existing.email === email) return { ok: true, user: existing };
    if (!pendingRegistration) return { ok: false };

    const user: UserProfile = {
      name: pendingRegistration.name.trim(),
      email,
      phone: pendingRegistration.phone,
      createdAt: new Date().toISOString(),
      marketingConsent: pendingRegistration.marketingConsent,
      paidProducts: [],
    };
    if (!setUser(user)) return { ok: false };
    return { ok: true, user };
  }

  // Modo real
  try {
    const body: Record<string, unknown> = { email, token };
    if (pendingRegistration) {
      body.name = pendingRegistration.name.trim();
      body.marketingConsent = pendingRegistration.marketingConsent;
    }
    const res = await apiPost<{ accessToken: string; user: UserDTO }>(
      '/api/v1/auth/verify',
      body,
      false,
    );
    setAccessToken(res.accessToken);
    const profile = dtoToProfile(res.user);
    setUser(profile);
    return { ok: true, user: profile };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return { ok: false };
    throw err;
  }
}

// ─── refreshSession ────────────────────────────────────────────────────────

/**
 * Tenta renovar a sessão via refresh token (cookie HttpOnly).
 * Retorna o UserProfile se sucesso, null se não há sessão.
 */
export async function refreshSession(): Promise<UserProfile | null> {
  if (!hasBackend()) {
    return getUser();
  }
  try {
    const res = await apiPost<{ accessToken: string; user: UserDTO }>(
      '/api/v1/auth/refresh',
      undefined,
      false,
    );
    setAccessToken(res.accessToken);
    const profile = dtoToProfile(res.user);
    setUser(profile);
    return profile;
  } catch {
    return null;
  }
}

// ─── getCurrentUser ────────────────────────────────────────────────────────

/** Lê o user da sessão local (ou null). SSR-safe. */
export function getCurrentUser(): UserProfile | null {
  return getUser();
}

// ─── logout ────────────────────────────────────────────────────────────────

/** Logout — invalida refresh token no servidor e limpa estado local. */
export async function logout(): Promise<void> {
  if (hasBackend()) {
    try {
      await apiPost('/api/v1/auth/logout', undefined, true);
    } catch { /* ignora falhas de rede no logout */ }
  }
  clearAccessToken();
  clearUser();
}

// ─── isPaidFor / grantProduct ───────────────────────────────────────────────

/** Checa se o usuário pagou por um produto (lê do perfil local em cache). */
export function isPaidFor(productId: string): boolean {
  return getUser()?.paidProducts.includes(productId) ?? false;
}

/**
 * Mock de pagamento (usado apenas em testes / sem backend).
 * Em produção o grant vem do webhook Stripe via servidor.
 */
export function grantProduct(productId: string): boolean {
  if (hasBackend()) return false;
  const user = getUser();
  if (!user) return false;
  if (user.paidProducts.includes(productId)) return true;
  return setUser({ ...user, paidProducts: [...user.paidProducts, productId] });
}

// ─── updateProfile ─────────────────────────────────────────────────────────

/** Atualiza dados do usuário. Em modo real chama PATCH /api/v1/me. */
export async function updateProfile(patch: { name?: string; phone?: string }): Promise<boolean> {
  if (!hasBackend()) {
    const user = getUser();
    if (!user) return false;
    return setUser({
      ...user,
      name: patch.name?.trim() || user.name,
      phone: patch.phone || user.phone,
    });
  }
  try {
    const dto = await apiPatch<UserDTO>('/api/v1/me', {
      name: patch.name?.trim(),
    });
    return setUser(dtoToProfile(dto));
  } catch {
    return false;
  }
}

// ─── updateMarketingConsent ─────────────────────────────────────────────────

/** Atualiza consentimento de marketing. */
export async function updateMarketingConsent(consent: boolean): Promise<boolean> {
  if (!hasBackend()) {
    const user = getUser();
    if (!user) return false;
    return setUser({ ...user, marketingConsent: consent });
  }
  try {
    const dto = await apiPatch<UserDTO>('/api/v1/me', { marketingConsent: consent });
    return setUser(dtoToProfile(dto));
  } catch {
    return false;
  }
}

// ─── deleteAccount ─────────────────────────────────────────────────────────

/** Exclui a conta no servidor e limpa estado local (LGPD). */
export async function deleteAccount(): Promise<boolean> {
  if (hasBackend()) {
    try {
      await apiDelete('/api/v1/me');
    } catch {
      return false;
    }
  }
  clearAccessToken();
  clearUser();
  return true;
}

// ─── syncProductsFromServer ────────────────────────────────────────────────

/**
 * Busca perfil atualizado do servidor e sincroniza paidProducts no cache local.
 * Útil após retorno do Stripe Checkout.
 */
export async function syncProfileFromServer(): Promise<UserProfile | null> {
  if (!hasBackend()) return getUser();
  try {
    const dto = await apiPost<{ accessToken: string; user: UserDTO }>(
      '/api/v1/auth/refresh',
      undefined,
      false,
    );
    setAccessToken(dto.accessToken);
    const profile = dtoToProfile(dto.user);
    setUser(profile);
    return profile;
  } catch {
    return null;
  }
}
