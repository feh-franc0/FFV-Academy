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
 * SEGURANÇA: Em build de produção (NODE_ENV=production), o bloco que usa
 * MOCK_TOKEN é dead code e o tree-shaker do webpack o remove do bundle final.
 * A verificação dupla (!hasBackend && !isProduction) garante que mesmo um
 * ambiente de staging sem NEXT_PUBLIC_API_BASE_URL não aceite o token mock.
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
 * Mock: simula envio (log + 400ms). Retorna isNewUser=true se não houver user salvo.
 * Real: POST /api/v1/auth/request-token → email via Resend.
 */
export async function requestToken(email: string): Promise<{ ok: true; isNewUser: boolean }> {
  if (!emailSchema.safeParse(email).success) throw new Error('email inválido');

  if (!hasBackend()) {
    const existing = getUser();
    const isNewUser = !existing || existing.email !== email;
    console.info(`[MOCK] token ${MOCK_TOKEN} enviado para ${email}`);
    await delay(400);
    return { ok: true, isNewUser };
  }

  try {
    const res = await apiPost<{ message: string; isNewUser: boolean }>(
      '/api/v1/auth/request-token', { email }, false,
    );
    return { ok: true, isNewUser: res.isNewUser };
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new Error('Limite de tentativas atingido. Aguarde 15 minutos antes de tentar novamente.');
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
 */
export async function verifyToken(
  email: string,
  token: string,
  pendingRegistration?: PendingRegistration,
): Promise<{ ok: boolean; user?: UserProfile }> {
  if (!emailSchema.safeParse(email).success) return { ok: false };

  if (!hasBackend()) {
    await delay(300);
    // Dupla guarda: sem backend E sem produção.
    // Previne que staging sem NEXT_PUBLIC_API_BASE_URL aceite o token mock.
    if (IS_PRODUCTION || token !== MOCK_TOKEN) return { ok: false };

    const existing = getUser();
    if (existing && existing.email === email) return { ok: true, user: existing };
    if (!pendingRegistration) return { ok: false };

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

/** Logout — invalida refresh token no servidor e limpa TODO o estado local.
 *
 * Importante: device compartilhado (faculdade, kiosk) — usuário B não pode
 * ver progresso/XP/streak/SRS do usuário A. Audit de integridade identificou
 * que `clearAccessToken + clearUser` ANTIGO deixava `ffv_academy` (GameState),
 * bookmarks, daily, base counters, comment-tags etc. intactos.
 *
 * Agora limpa TODAS as chaves `ffv_*` do localStorage (exceto `ffv_theme`,
 * que é UX setting do device, não do user).
 */
export async function logout(): Promise<void> {
  if (hasBackend()) {
    try {
      await apiPost('/api/v1/auth/logout', undefined, true);
    } catch { /* ignora falhas de rede no logout */ }
  }
  clearAccessToken();
  clearUser();
  clearAllUserStorage();
}

/** Limpa localStorage de chaves do usuário. Preserva `ffv_theme` (preferência
 *  de UX do device) e `ffv_migration_done` (flag de migração one-time). */
function clearAllUserStorage(): void {
  if (typeof window === 'undefined') return;
  const PRESERVE = new Set(['ffv_theme', 'ffv_migration_done']);
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ffv_') && !PRESERVE.has(k)) {
        keys.push(k);
      }
    }
    for (const k of keys) localStorage.removeItem(k);
    // IndexedDB onde o GameState migra — limpa também.
    import('./game-state-storage').then(m => m.clearGameStorage?.()).catch(() => { /* ok */ });
  } catch {
    /* storage bloqueado / privacy mode — ignorar */
  }
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
