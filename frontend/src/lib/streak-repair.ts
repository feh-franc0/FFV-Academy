'use client';

import { loadState } from '@/lib/engine';

/**
 * Streak Repair — sistema "Duolingo-style" para recuperar streak quebrada
 * pagando uma pequena taxa em XP.
 *
 * Por que arquivo separado em vez de bump no GameState?
 * - O schema do GameState está em v5 e é sensível a migrações.
 * - Os dados aqui são puramente UX (snapshot da última streak quebrada
 *   + flag "modal já mostrado hoje"). Sem necessidade de incluir no export/import.
 * - Persistência leve via localStorage com chave dedicada.
 *
 * Como funciona:
 * 1. Toda vez que `loadState()` é chamado, o engine detecta perda de streak
 *    (em `checkStreak`) e zera `state.streak`. Não temos hook ali — então
 *    o `detectStreakBreak()` deste módulo é chamado pelo HomeClient via
 *    `useStreakRepair` 1x por sessão, comparando o snapshot persistido aqui
 *    com o `state.streak` atual.
 * 2. Quando detecta `previousStreak > 0 && currentStreak === 0` e o usuário
 *    perdeu **apenas 1 dia** (não múltiplos), oferece reparar por 10 XP.
 * 3. `repairStreak()` debita o XP e re-grava o GameState com streak restaurado.
 */

const STORAGE_KEY = 'ffv_streak_repair';
export const REPAIR_COST_XP = 10;

interface StreakRepairData {
  /** Última streak conhecida ANTES de quebrar (snapshot persistente). */
  lastKnownStreak: number;
  /** Data ISO (YYYY-MM-DD) em que vimos a streak pela última vez. */
  lastSeenDate: string | null;
  /** Data ISO (YYYY-MM-DD) em que o modal foi mostrado/dismissado pela última vez. */
  modalShownDate: string | null;
}

const DEFAULT: StreakRepairData = {
  lastKnownStreak: 0,
  lastSeenDate: null,
  modalShownDate: null,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read(): StreakRepairData {
  if (!isBrowser()) return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<StreakRepairData>;
    return {
      lastKnownStreak: typeof parsed.lastKnownStreak === 'number' ? parsed.lastKnownStreak : 0,
      lastSeenDate: typeof parsed.lastSeenDate === 'string' ? parsed.lastSeenDate : null,
      modalShownDate: typeof parsed.modalShownDate === 'string' ? parsed.modalShownDate : null,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function write(data: StreakRepairData) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // fail silent — UX feature, não bloqueia
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface StreakRepairStatus {
  /** Pode oferecer reparo? */
  eligible: boolean;
  /** Streak que pode ser restaurada (se eligible). */
  brokenStreak: number;
  /** Motivo de não ser eligível (debug). */
  reason?: 'no-break' | 'already-shown' | 'multi-day-break' | 'no-xp';
}

/**
 * Detecta se a streak atual foi quebrada e o usuário pode pagar para repará-la.
 *
 * Side-effect: atualiza o snapshot `lastKnownStreak` quando streak atual > 0
 * (mantém histórico fresco para detectar quebras futuras).
 */
export function detectStreakBreak(currentStreak: number, currentXP: number): StreakRepairStatus {
  const data = read();
  const today = todayISO();

  // Mantém snapshot atualizado quando há streak ativa.
  if (currentStreak > 0) {
    write({ ...data, lastKnownStreak: currentStreak, lastSeenDate: today });
    return { eligible: false, brokenStreak: 0, reason: 'no-break' };
  }

  // Streak atual = 0. Verifica se temos um snapshot anterior > 0.
  if (data.lastKnownStreak <= 0) {
    return { eligible: false, brokenStreak: 0, reason: 'no-break' };
  }

  // Já mostramos modal hoje? Não insistir.
  if (data.modalShownDate === today) {
    return { eligible: false, brokenStreak: data.lastKnownStreak, reason: 'already-shown' };
  }

  // Quebrou apenas ontem? Se foi há mais dias, não vale reparar (perdeu o ritmo).
  if (data.lastSeenDate && data.lastSeenDate < yesterdayISO()) {
    return { eligible: false, brokenStreak: data.lastKnownStreak, reason: 'multi-day-break' };
  }

  // Tem XP suficiente?
  if (currentXP < REPAIR_COST_XP) {
    return { eligible: false, brokenStreak: data.lastKnownStreak, reason: 'no-xp' };
  }

  return { eligible: true, brokenStreak: data.lastKnownStreak };
}

/** Marca o modal como exibido hoje (para não reaparecer). */
export function markRepairModalSeen() {
  const data = read();
  write({ ...data, modalShownDate: todayISO() });
}

/**
 * Executa o reparo: debita XP do GameState, restaura streak.
 * Retorna `{ ok: true, restoredStreak }` ou `{ ok: false, error }`.
 *
 * NOTA: escrita direta no localStorage (não passa pelo schedulePush do
 * progress-sync) — não temos uma ação `repairStreak` na engine porque seria
 * um schema bump. Aceitável: o próximo `completeModule` re-persiste tudo via
 * o fluxo normal e sincroniza.
 */
export function repairStreak(): { ok: true; restoredStreak: number; xpSpent: number } | { ok: false; error: string } {
  const state = loadState();
  const data = read();
  if (data.lastKnownStreak <= 0) return { ok: false, error: 'no-streak-to-repair' };
  if (state.xp < REPAIR_COST_XP) return { ok: false, error: 'insufficient-xp' };

  const next = {
    ...state,
    xp: state.xp - REPAIR_COST_XP,
    streak: data.lastKnownStreak,
    lastStudyDate: new Date().toDateString(),
  };

  // Re-grava — usa LZ-string compression igual ao engine.saveState pra manter consistência.
  // Importamos lz-string sob demanda pra não inflar o bundle de testes.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LZString = require('lz-string') as typeof import('lz-string');
    window.localStorage.setItem('ffv_academy', LZString.compress(JSON.stringify(next)));
  } catch {
    // Fallback: grava sem compressão (loadState aceita JSON puro).
    if (isBrowser()) window.localStorage.setItem('ffv_academy', JSON.stringify(next));
  }

  // Atualiza snapshot — streak voltou, modal cumpriu seu papel.
  write({
    lastKnownStreak: data.lastKnownStreak,
    lastSeenDate: todayISO(),
    modalShownDate: todayISO(),
  });

  try {
    window.plausible?.('streak_repaired', { props: { streak: data.lastKnownStreak } });
  } catch { /* fail silent */ }

  return { ok: true, restoredStreak: data.lastKnownStreak, xpSpent: REPAIR_COST_XP };
}

// Test-only helper.
export function __resetStreakRepairForTests() {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT));
  } catch { /* noop */ }
}
