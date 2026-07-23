/**
 * GameStateStorage — abstração de persistência do GameState.
 *
 * Implementação primária: IndexedDB via biblioteca `idb` (Promise-based wrapper).
 * Fallback: localStorage (browsers muito antigos, SSR ou contextos sem IndexedDB).
 *
 * MIGRAÇÃO AUTOMÁTICA: Na primeira execução, lê dados do localStorage,
 * escreve no IndexedDB e limpa o localStorage (evita duplicação).
 *
 * Por que IndexedDB?
 * - localStorage.setItem() é SÍNCRONO — bloqueia a main thread.
 * - Com GameState crescendo (570 artigos × cards SRS × progresso), cada
 *   escrita pode causar jank perceptível no input do usuário.
 * - IndexedDB é assíncrono — escritas não bloqueiam a thread principal.
 */
import { openDB, type IDBPDatabase } from 'idb';
import { STORAGE_KEYS } from './constants';

const DB_NAME = 'ffv_academy_db';
const DB_VERSION = 1;
const STORE_NAME = 'game_state';

// Chave de migração — marca que a migração do localStorage foi concluída.
const MIGRATION_DONE_KEY = 'ffv_idb_migrated_v1';

/** Verifica se IndexedDB está disponível (SSR-safe, browsers antigos). */
function isIndexedDBAvailable(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      'indexedDB' in window &&
      window.indexedDB !== null
    );
  } catch {
    return false;
  }
}

/**
 * Cache da conexão com o banco — evita reabrir a cada operação.
 * É lazy: só é criado na primeira chamada a openDatabase().
 */
let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Abre (ou reutiliza) a conexão com o IndexedDB.
 *
 * O `upgrade` cria o object store na primeira execução ou quando
 * DB_VERSION incrementa. A chave é simples (string), sem keyPath,
 * porque usamos o padrão key-value igual ao localStorage.
 *
 * @returns Promise com o banco aberto.
 */
export function openDatabase(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cria o store se ainda não existir.
        // keyPath: null + autoIncrement: false = chave fornecida explicitamente (string).
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
      // Se outra aba abriu uma versão mais nova do schema, fecha esta conexão
      // graciosamente para não bloquear a migração.
      blocked() {
        console.warn('[GameStateStorage] IndexedDB bloqueado por versão mais antiga em outra aba');
      },
      blocking() {
        // Esta aba está bloqueando outra com versão mais nova — fechar.
        dbPromise?.then(db => db.close());
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/**
 * Lê um valor do IndexedDB.
 *
 * @param key  - Chave de storage (ex: 'ffv_academy').
 * @returns Valor tipado como T, ou null se não existir.
 */
export async function get<T>(key: string): Promise<T | null> {
  if (!isIndexedDBAvailable()) {
    // Fallback para localStorage em SSR ou browsers sem IndexedDB.
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  try {
    const db = await openDatabase();
    const value = await db.get(STORE_NAME, key);
    return value !== undefined ? (value as T) : null;
  } catch (err) {
    console.error('[GameStateStorage] Erro ao ler IndexedDB — fallback para localStorage', err);
    // Fallback: tenta localStorage como último recurso.
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
}

/**
 * Escreve um valor no IndexedDB.
 *
 * A escrita é assíncrona — não bloqueia a main thread.
 * O objeto é armazenado diretamente (sem JSON.stringify), porque
 * o IndexedDB serializa automaticamente via structured clone algorithm.
 *
 * @param key   - Chave de storage.
 * @param value - Valor a persistir (qualquer tipo serializável).
 */
export async function set<T>(key: string, value: T): Promise<void> {
  if (!isIndexedDBAvailable()) {
    // Fallback síncrono para localStorage.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('[GameStateStorage] Erro ao escrever localStorage', err);
    }
    return;
  }

  try {
    const db = await openDatabase();
    await db.put(STORE_NAME, value, key);
  } catch (err) {
    console.error('[GameStateStorage] Erro ao escrever IndexedDB — fallback para localStorage', err);
    // Fallback: salva no localStorage se IndexedDB falhar.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (fallbackErr) {
      console.error('[GameStateStorage] Fallback localStorage também falhou', fallbackErr);
    }
  }
}

/**
 * Remove uma chave do IndexedDB (e do localStorage por segurança).
 *
 * @param key - Chave a remover.
 */
export async function remove(key: string): Promise<void> {
  if (!isIndexedDBAvailable()) {
    localStorage.removeItem(key);
    return;
  }

  try {
    const db = await openDatabase();
    await db.delete(STORE_NAME, key);
  } catch (err) {
    console.error('[GameStateStorage] Erro ao remover do IndexedDB', err);
  }

  // Remove do localStorage também — garante limpeza completa independente
  // do estado da migração.
  try {
    localStorage.removeItem(key);
  } catch {
    // ignora erros de localStorage (raro, mas possível em Safari privado)
  }
}

/**
 * Migra dados existentes do localStorage para o IndexedDB.
 *
 * Executa apenas uma vez (controlado pela flag MIGRATION_DONE_KEY no localStorage).
 * Após migrar, limpa as chaves de jogo do localStorage para evitar duplicação.
 *
 * Chaves migradas: GAME_STATE (ffv_academy) e outras chaves de progresso.
 * Chaves NÃO migradas: THEME (ffv_theme) — permanece no localStorage porque
 * o script inline de anti-FOUC no <head> lê do localStorage diretamente.
 *
 * Por que não migrar o tema? O script de anti-FOUC em layout.tsx roda
 * ANTES do React e só conhece localStorage — se movermos o tema para IndexedDB,
 * o usuário vai ver FOUC (flash of unstyled content) até o React montar.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  // Verifica se já migramos (flag no localStorage — intencionalmente não migrada).
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_DONE_KEY) === '1') return;
  if (!isIndexedDBAvailable()) return;

  // Chaves de jogo para migrar (todas exceto THEME e a flag de migração).
  const keysToMigrate = [
    STORAGE_KEYS.GAME_STATE,
    STORAGE_KEYS.USER_NAME,
    STORAGE_KEYS.DAILY_MODULE,
    STORAGE_KEYS.REFERRAL,
    STORAGE_KEYS.MY_REFERRAL_ID,
    STORAGE_KEYS.ONBOARDING_DISMISSED,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.SIMULADO_ATTEMPTS,
    STORAGE_KEYS.SIMULADO_TIMER,
    STORAGE_KEYS.CERTIFICATES,
    STORAGE_KEYS.PROGRESS_LAST_SYNC,
  ] as const;

  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');

    for (const key of keysToMigrate) {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          // Tenta parsear como JSON para armazenar o objeto diretamente
          // (aproveita o structured clone do IndexedDB).
          const parsed = JSON.parse(raw);
          await tx.store.put(parsed, key);
        } catch {
          // Se não é JSON válido, armazena a string bruta.
          await tx.store.put(raw, key);
        }
        // NÃO remover do localStorage: loadState() em engine.ts é síncrono e
        // depende do localStorage como fonte primária. O IndexedDB serve como
        // backup/sync mirror via debouncedSaveToIDB. Remover quebraria a leitura
        // inicial do app após migração (state cairia para DEFAULT_STATE).
      }
    }

    await tx.done;

    // Marca migração como concluída. Usa localStorage intencionalmente:
    // é uma flag de controle leve que deve persistir mesmo se o IndexedDB
    // for limpo pelo browser (ex: limpeza de dados do site).
    localStorage.setItem(MIGRATION_DONE_KEY, '1');

    console.info('[GameStateStorage] Migração localStorage → IndexedDB concluída');
  } catch (err) {
    // Migração falhou — não é crítico. Na próxima vez, tentará novamente
    // (a flag não foi gravada). O app continua funcionando com localStorage.
    console.warn('[GameStateStorage] Migração falhou — continuando com localStorage', err);
  }
}

/**
 * Limpa TODAS as chaves de jogo persistidas no IndexedDB.
 *
 * Chamado por `auth.logout()` em device compartilhado — sem isso, GameState,
 * bookmarks, certificates locais e simulados ficam no IndexedDB e o próximo
 * usuário a logar vê tudo do anterior.
 *
 * Idempotente — sucesso silencioso se IndexedDB indisponível.
 */
export async function clearGameStorage(): Promise<void> {
  if (typeof window === 'undefined' || !isIndexedDBAvailable()) return;
  try {
    const db = await openDatabase();
    return new Promise<void>(resolve => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // best-effort — não falha logout
    });
  } catch {
    return;
  }
}

/**
 * Namespace exportado como objeto para uso conveniente.
 * Permite: import { GameStateStorage } from './game-state-storage'
 * Uso: await GameStateStorage.get('ffv_academy')
 */
export const GameStateStorage = {
  get,
  set,
  remove,
  openDatabase,
  migrateFromLocalStorage,
  clear: clearGameStorage,
  isIndexedDBAvailable,
} as const;
