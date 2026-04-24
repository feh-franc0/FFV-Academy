/**
 * Storage Adapter — camada única de persistência.
 *
 * Objetivo: todos os acessos a localStorage (ou, no futuro, API/IndexedDB)
 * passam por este módulo. Swap de backend = trocar a implementação aqui, sem
 * mexer em engine.ts, referral.ts, dailyModule.ts, hooks etc.
 *
 * Regras:
 * - Não tocar `window`/`localStorage` diretamente em nenhum outro arquivo.
 * - SSR-safe: todas as operações retornam o default seguro quando `window` é undefined.
 * - Erros de quota (QuotaExceededError) são reportados via `onStorageError`.
 */

import type { StorageKey } from './constants';
import { STORAGE_KEYS } from './constants';

type ErrorCallback = (msg: string, key: StorageKey) => void;
let errorCallback: ErrorCallback | null = null;

/** Registra callback para erros de persistência (ex: quota estourada). */
export function onStorageError(cb: ErrorCallback): void {
  errorCallback = cb;
}

function reportError(err: unknown, key: StorageKey): void {
  const msg = err instanceof Error ? err.message : 'Erro de storage desconhecido';
  errorCallback?.(msg, key);
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Lê string bruta de uma chave conhecida. Retorna null se ausente ou SSR. */
export function getRaw(key: StorageKey): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    reportError(err, key);
    return null;
  }
}

/** Escreve string bruta em chave conhecida. Retorna true em sucesso. */
export function setRaw(key: StorageKey, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    reportError(err, key);
    return false;
  }
}

/** Remove chave conhecida. */
export function removeKey(key: StorageKey): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    reportError(err, key);
    return false;
  }
}

/** Lê JSON. Devolve fallback se inexistente, corrompido ou SSR. */
export function getJSON<T>(key: StorageKey, fallback: T): T {
  const raw = getRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Escreve JSON. Retorna true em sucesso. */
export function setJSON<T>(key: StorageKey, value: T): boolean {
  try {
    return setRaw(key, JSON.stringify(value));
  } catch (err) {
    reportError(err, key);
    return false;
  }
}

/** Whitelist dos keys conhecidos — evita vazamento de chaves ad-hoc. */
export function listKnownKeys(): readonly StorageKey[] {
  return Object.values(STORAGE_KEYS);
}

/** Remove todos os dados persistidos pela aplicação. Usado em "reset de conta". */
export function clearAll(): void {
  if (!isBrowser()) return;
  for (const key of Object.values(STORAGE_KEYS)) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

// ─────────────────────────────────────────────────────────────────
// Helpers tipados para entidades do domínio (validados com Zod)
// ─────────────────────────────────────────────────────────────────

import { UserProfileSchema } from './schemas';
import type { z } from 'zod';

type UserProfile = z.infer<typeof UserProfileSchema>;

/** Lê o perfil do usuário. Retorna null se ausente ou inválido. */
export function getUser(): UserProfile | null {
  const raw = getJSON<unknown>(STORAGE_KEYS.USER, null);
  if (!raw) return null;
  const parsed = UserProfileSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Persiste perfil do usuário, validando com Zod antes. Retorna ok. */
export function setUser(user: UserProfile): boolean {
  const parsed = UserProfileSchema.safeParse(user);
  if (!parsed.success) return false;
  return setJSON(STORAGE_KEYS.USER, parsed.data);
}

/** Remove perfil do usuário (logout). */
export function clearUser(): boolean {
  return removeKey(STORAGE_KEYS.USER);
}
