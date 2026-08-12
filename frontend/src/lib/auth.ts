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
import { emailSchema } from './schemas';
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
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  marketingConsent: boolean;
  role: string;
  /** Slugs de produtos pagos (ex: ["simulado-aws-practitioner"]). */
  paidProducts: string[];
}

/** DTO retornado pelo backend em /api/v1/me e /api/v1/auth/verify. */
interface UserDTO {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  referralId: string;
  products: string[];
  marketingConsent: boolean;
  avatarUrl?: string;
  createdAt: string;
}

function dtoToProfile(dto: UserDTO): UserProfile {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? '',
    createdAt: dto.createdAt,
    marketingConsent: dto.marketingConsent,
    role: dto.role ?? 'user',
    paidProducts: dto.products,
  };
}

/**
 * Token fixo aceito no modo mock — visível intencionalmente em desenvolvimento.
 *
 * SEGURANÇA (corrigido 11/ago/2026, achado P-05 da auditoria): a alegação
 * anterior aqui — "o tree-shaker remove esse bloco em produção" — era falsa.
 * `hasBackend()` é uma checagem de RUNTIME (lê `NEXT_PUBLIC_API_BASE_URL`), não
 * um `NODE_ENV` estático, então nenhum minificador elimina o bloco por DCE.
 * O literal `'000000'` permanece no bundle de produção.
 *
 * A garantia real tem duas camadas independentes:
 * 1. `deploy.yml` sempre injeta `NEXT_PUBLIC_API_BASE_URL` como build arg —
 *    `hasBackend()` é `true` em todo deploy real, então este bloco nunca
 *    executa em produção, apesar de presente no bundle.
 * 2. Mesmo que (1) falhasse (staging mal configurado), `verifyToken` tem a
 *    guarda explícita `if (IS_PRODUCTION || token !== MOCK_TOKEN)` — o token
 *    mock nunca é aceito quando `NODE_ENV==='production'`, sem depender de
 *    `hasBackend()`.
 * Travado por `auth-backend.test.ts` — "MOCK_TOKEN não recebe tratamento
 * especial": com backend configurado, o token é apenas repassado ao servidor
 * real, que o rejeita como qualquer outro token inválido.
 */
export const MOCK_TOKEN = '000000';

// Flag avaliada em tempo de build pelo compilador — constante para tree-shaking efetivo.
// E2E override: o build estático usado pelos testes do Playwright roda com
// NODE_ENV=production (Next.js força isso em `npm run build`), mas precisa do
// caminho mock pra autenticar com token "000000". A flag NEXT_PUBLIC_E2E_TESTING
// é setada APENAS no build do job E2E do CI — nunca em produção real.
const IS_E2E_BUILD = process.env.NEXT_PUBLIC_E2E_TESTING === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' && !IS_E2E_BUILD;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── requestToken ──────────────────────────────────────────────────────────

/**
 * Solicita o token de login por email.
 * Mock: simula envio (log + 400ms).
 * Real: POST /api/v1/auth/request-token → email via Resend.
 *
 * NÃO retorna isNewUser: este endpoint é público e não prova posse do email
 * (só o endereço). A distinção "email novo" só é revelada por verifyToken,
 * que exige o código correto (prova de posse) — ver ErrRegistrationRequired
 * no backend. Responder diferente aqui para email cadastrado vs. não seria
 * enumeração de conta.
 */
export async function requestToken(email: string): Promise<{ ok: true }> {
  if (!emailSchema.safeParse(email).success) throw new Error('email inválido');

  if (!hasBackend()) {
    console.info(`[MOCK] token ${MOCK_TOKEN} enviado para ${email}`);
    await delay(400);
    return { ok: true };
  }

  try {
    await apiPost<{ message: string }>('/api/v1/auth/request-token', { email }, false);
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new Error('Limite de tentativas atingido. Aguarde 10 minutos antes de tentar novamente.');
    }
    throw err;
  }
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
 *
 * `registrationRequired: true` significa que o CÓDIGO foi validado (posse do
 * email provada) mas o email é de conta nova sem nome/telefone — reenvie o
 * MESMO código com `pendingRegistration` preenchido. O token não é queimado
 * nesse caso (ver backend: Peek antes de Consume), então o retry funciona.
 */
export async function verifyToken(
  email: string,
  token: string,
  pendingRegistration?: PendingRegistration,
): Promise<{ ok: boolean; user?: UserProfile; registrationRequired?: boolean }> {
  if (!emailSchema.safeParse(email).success) return { ok: false };

  if (!hasBackend()) {
    await delay(300);
    // Dupla guarda: sem backend E sem produção.
    // Previne que staging sem NEXT_PUBLIC_API_BASE_URL aceite o token mock.
    if (IS_PRODUCTION || token !== MOCK_TOKEN) return { ok: false };

    const existing = getUser();
    if (existing && existing.email === email) return { ok: true, user: existing };
    if (!pendingRegistration) return { ok: false, registrationRequired: true };

    const user: UserProfile = {
      id: `mock-${email}`,
      name: pendingRegistration.name.trim(),
      email,
      phone: pendingRegistration.phone,
      createdAt: new Date().toISOString(),
      marketingConsent: pendingRegistration.marketingConsent,
      role: 'user',
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
      body.phone = pendingRegistration.phone;
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
    if (err instanceof ApiError && err.type === 'registration-required') {
      return { ok: false, registrationRequired: true };
    }
    if (err instanceof ApiError && err.status === 401) return { ok: false };
    throw err;
  }
}

// ─── refreshSession ────────────────────────────────────────────────────────

/**
 * Tenta renovar a sessão via refresh token (cookie HttpOnly).
 * Retorna o UserProfile se sucesso, null se não há sessão.
 *
 * Distingue falhas permanentes (401 = token expirado) de transitórias (5xx, rede):
 * - 401 → token inválido → retorna null (AuthProvider fará logout)
 * - 5xx / rede → problema temporário → retorna null MAS preserva localStorage
 *   (AuthProvider não faz logout, próxima tentativa pode funcionar)
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
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Token de refresh expirado ou revogado — sessão encerrada legitimamente.
      // Limpa storage local para que getCurrentUser() também retorne null.
      clearAccessToken();
      clearUser();
      return null;
    }
    // Erro transitório (5xx, rede, timeout): não encerra a sessão.
    // Retorna o usuário do cache local para manter UX consistente.
    // O próximo request autenticado vai tentar refresh novamente via apiFetch.
    return getUser();
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
