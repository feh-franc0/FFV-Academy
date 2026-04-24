'use client';

/**
 * Cloud sync do GameState com o backend via /api/v1/progress.
 *
 * Estratégia offline-first:
 * - Pull on login: se servidor tem estado mais recente, substitui localStorage.
 * - Push debounced: após qualquer mudança de estado, enfileira push 3s depois.
 * - Conflict (409): servidor ganhou — pull automático.
 * - Rede indisponível: continua local, tenta na próxima oportunidade.
 *
 * Não depende de React — pode ser chamado de useGameState.ts.
 */

import { hasBackend, apiGet, apiPut, ApiError } from './api-client';
import { getJSON, setJSON, getRaw, setRaw } from './storage';
import { STORAGE_KEYS } from './constants';
import { GameStateSchema } from './schemas';
import type { z } from 'zod';

export type GameState = z.infer<typeof GameStateSchema>;

export const GAME_STATE_SCHEMA_VERSION = 2;

interface ProgressPayload {
  schemaVersion: number;
  state: GameState;
  clientUpdatedAt: string;
}

interface ProgressResponse {
  state: GameState;
  serverUpdatedAt: string;
}

/** Lê o GameState do localStorage (sem validação — usa o hook). */
function readLocalState(): GameState | null {
  const raw = getJSON<unknown>(STORAGE_KEYS.GAME_STATE, null);
  if (!raw) return null;
  const parsed = GameStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Persiste GameState no localStorage. */
function writeLocalState(state: GameState): void {
  setJSON(STORAGE_KEYS.GAME_STATE, state);
}

// Timestamp da última sync bem-sucedida via storage adapter (SSR-safe + error reporting).
function getLastSyncAt(): string | null {
  return getRaw(STORAGE_KEYS.PROGRESS_LAST_SYNC);
}

function setLastSyncAt(ts: string): void {
  setRaw(STORAGE_KEYS.PROGRESS_LAST_SYNC, ts);
}

// ─── Pull ──────────────────────────────────────────────────────────────────

/**
 * Busca o estado do servidor.
 * Se o servidor tiver estado mais recente que o local, substitui localStorage.
 * Retorna 'pulled' | 'local' | 'error'.
 */
export async function pullProgress(): Promise<'pulled' | 'local' | 'error'> {
  if (!hasBackend()) return 'local';
  try {
    const res = await apiGet<ProgressResponse>('/api/v1/progress');
    if (!res.state) return 'local';

    const local = readLocalState();
    const lastSync = getLastSyncAt();

    // Se local não tem estado ou servidor é posterior ao último sync → usa servidor
    const serverIsNewer =
      !local || !lastSync || new Date(res.serverUpdatedAt) > new Date(lastSync);

    if (serverIsNewer) {
      const parsed = GameStateSchema.safeParse(res.state);
      if (parsed.success) {
        writeLocalState(parsed.data);
        setLastSyncAt(res.serverUpdatedAt);
        return 'pulled';
      }
    }
    return 'local';
  } catch {
    return 'error';
  }
}

// ─── Push ──────────────────────────────────────────────────────────────────

/**
 * Envia o estado local para o servidor.
 * Em caso de conflito (409), faz pull automático.
 * Retorna 'pushed' | 'conflict_pulled' | 'error'.
 */
export async function pushProgress(): Promise<'pushed' | 'conflict_pulled' | 'error'> {
  if (!hasBackend()) return 'pushed';

  const state = readLocalState();
  if (!state) return 'error';

  const payload: ProgressPayload = {
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    state,
    clientUpdatedAt: new Date().toISOString(),
  };

  try {
    await apiPut('/api/v1/progress', payload);
    setLastSyncAt(new Date().toISOString());
    return 'pushed';
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      // Servidor tem versão mais nova — pull
      await pullProgress();
      return 'conflict_pulled';
    }
    return 'error';
  }
}

// ─── Debounced push ────────────────────────────────────────────────────────

let _pushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Agenda um push com debounce de 3s.
 * Chame após qualquer mutação de GameState.
 */
export function schedulePush(): void {
  if (!hasBackend()) return;
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => {
    _pushTimer = null;
    pushProgress();
  }, 3000);
}
