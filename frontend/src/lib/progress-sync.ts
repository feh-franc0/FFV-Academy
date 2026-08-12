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
import { getRaw, setRaw } from './storage';
import { STORAGE_KEYS } from './constants';
// Import TYPE-ONLY — apagado no runtime. `GameStateSchema` (Zod, ~61,5 KB gz)
// só é carregado de fato dentro de `getGameStateSchema()`, abaixo, via import
// dinâmico. Este módulo é alcançável de `useGameState` → GameHUD (layout
// raiz), então um `import` estático de `zod` aqui ia para TODA rota, mesmo as
// que nunca leem nem gravam GameState.
import type { GameStateSchema } from './schemas';
import { encodeGameState, decodeGameState } from './game-state-codec';
import { CURRENT_SCHEMA } from './engine';
import type { z } from 'zod';

export type GameState = z.infer<typeof GameStateSchema>;

let _schemaPromise: Promise<typeof GameStateSchema> | null = null;
/** Carrega `GameStateSchema` (e o `zod` runtime) sob demanda, uma vez só. */
function getGameStateSchema(): Promise<typeof GameStateSchema> {
  if (!_schemaPromise) {
    _schemaPromise = import('./schemas').then(m => m.GameStateSchema);
  }
  return _schemaPromise;
}

// Importado de engine.ts, não duplicado — um número hardcoded aqui foi
// exatamente como o schemaVersion enviado à nuvem (2) divergiu do real (6)
// antes desta correção: ninguém lembrou de atualizar as duas constantes juntas.
export const GAME_STATE_SCHEMA_VERSION = CURRENT_SCHEMA;

interface ProgressPayload {
  schemaVersion: number;
  state: GameState;
  clientUpdatedAt: string;
}

interface ProgressResponse {
  state: GameState;
  serverUpdatedAt: string;
}

/**
 * Lê o GameState do localStorage no MESMO formato que a engine grava
 * (LZ-string comprimido — ver game-state-codec.ts). Ler com JSON.parse cru
 * era o defeito raiz que fazia o push nunca completar: o parse falhava
 * sempre contra um payload comprimido, `readLocalState` devolvia null, e
 * `pushProgress` desistia antes de sequer chamar a API.
 */
async function readLocalState(): Promise<GameState | null> {
  const raw = getRaw(STORAGE_KEYS.GAME_STATE);
  const decoded = decodeGameState(raw);
  if (!decoded) return null;
  const schema = await getGameStateSchema();
  const parsed = schema.safeParse(decoded);
  return parsed.success ? parsed.data : null;
}

/** Persiste GameState no localStorage, comprimido — mesmo formato da engine. */
function writeLocalState(state: GameState): void {
  setRaw(STORAGE_KEYS.GAME_STATE, encodeGameState(state));
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

    const local = await readLocalState();
    const lastSync = getLastSyncAt();

    // Se local não tem estado ou servidor é posterior ao último sync → usa servidor
    const serverIsNewer =
      !local || !lastSync || new Date(res.serverUpdatedAt) > new Date(lastSync);

    if (serverIsNewer) {
      const schema = await getGameStateSchema();
      const parsed = schema.safeParse(res.state);
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

/** Progresso "real" o bastante para não poder ser silenciosamente descartado. */
function hasMeaningfulProgress(state: GameState | null): boolean {
  if (!state) return false;
  return state.xp > 0 || state.completedModules.length > 0 || state.streak > 0;
}

/**
 * Pull específico do momento de LOGIN — não pode apagar progresso anônimo.
 *
 * `pullProgress()` trata "nunca sincronizou" (`!lastSync`) como "servidor
 * vence", o que é correto quando o servidor tem dado real mas ERRADO no login
 * de um usuário anônimo com progresso local: ele NUNCA teve `lastSync`, então
 * um snapshot do servidor — vazio, ou de outra sessão — sobrescreveria XP,
 * streak e badges reais sem aviso. Aqui, se o local tem progresso real e
 * nunca sincronizou, o local SOBE em vez de ser substituído; só entra em jogo
 * a resolução por data quando os dois lados já têm histórico de sync.
 */
export async function pullProgressOnLogin(): Promise<'pulled' | 'local_kept' | 'error'> {
  if (!hasBackend()) return 'local_kept';

  const local = await readLocalState();
  const lastSync = getLastSyncAt();

  if (hasMeaningfulProgress(local) && !lastSync) {
    const result = await pushProgress();
    return result === 'error' ? 'error' : 'local_kept';
  }

  const result = await pullProgress();
  return result === 'local' ? 'local_kept' : result;
}

// ─── Push ──────────────────────────────────────────────────────────────────

/**
 * Envia o estado local para o servidor.
 * Em caso de conflito (409), faz pull automático.
 * Retorna 'pushed' | 'conflict_pulled' | 'error'.
 */
export async function pushProgress(): Promise<'pushed' | 'conflict_pulled' | 'error'> {
  if (!hasBackend()) return 'pushed';

  const state = await readLocalState();
  if (!state) return 'error';

  const payload: ProgressPayload = {
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    state,
    clientUpdatedAt: new Date().toISOString(),
  };

  try {
    await apiPut('/api/v1/progress', payload);
    setLastSyncAt(new Date().toISOString());
    _needsRetryOnReconnect = false;
    return 'pushed';
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      // Servidor tem versão mais nova — pull
      await pullProgress();
      return 'conflict_pulled';
    }
    // Falha de rede (offline, timeout, 5xx): marca para reenviar quando a
    // conectividade voltar — ver ensureOnlineRetryListener(). Sem isso, um
    // push que falha por estar offline nunca mais é tentado (o timer de
    // schedulePush já disparou e não se repete sozinho).
    _needsRetryOnReconnect = true;
    return 'error';
  }
}

// ─── Debounced push + retry ao reconectar ──────────────────────────────────

let _pushTimer: ReturnType<typeof setTimeout> | null = null;
let _needsRetryOnReconnect = false;
let _onlineListenerRegistered = false;

/** Registra (uma única vez) o listener que reenvia o push perdido por falta de rede. */
function ensureOnlineRetryListener(): void {
  if (_onlineListenerRegistered || typeof window === 'undefined') return;
  _onlineListenerRegistered = true;
  window.addEventListener('online', () => {
    if (_needsRetryOnReconnect) pushProgress();
  });
}

/**
 * Agenda um push com debounce de 3s.
 * Chame após qualquer mutação de GameState.
 */
export function schedulePush(): void {
  if (!hasBackend()) return;
  ensureOnlineRetryListener();
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => {
    _pushTimer = null;
    pushProgress();
  }, 3000);
}
