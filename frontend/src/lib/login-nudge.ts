/**
 * Login nudge — gerencia quando mostrar prompts de "crie sua conta" pra
 * usuário anônimo SEM ser chato.
 *
 * Princípios:
 *  - Só mostra após sinal real de engajamento (3+ módulos OU 1 quiz feito)
 *  - Dismiss do sticky persiste 24h (não fica reaparecendo no mesmo dia)
 *  - Dismiss do inline persiste só na sessão (volta a aparecer no próximo
 *    quiz/módulo pra capturar momento de pico)
 *  - Logado nunca vê nada (early return em todos os hooks)
 *  - SSR-safe (todas as leituras são em useEffect/cliente)
 *
 * Storage (localStorage):
 *   ffv_nudge_modules_seen   — contador de módulos vistos (incrementa em
 *                              PageTracker quando kind=module e anônimo)
 *   ffv_nudge_quizzes_done   — contador de quizzes completados
 *   ffv_nudge_sticky_until   — timestamp até quando o sticky fica oculto
 *   ffv_nudge_inline_session — flag de dismiss inline da sessão atual
 *
 * Logout limpa TODAS as chaves ffv_* (auth.ts:logout) — então estes contadores
 * resetam a cada signin/signout. Comportamento desejado.
 */

const KEY_MODULES = 'ffv_nudge_modules_seen';
const KEY_QUIZZES = 'ffv_nudge_quizzes_done';
const KEY_STICKY_HIDE_UNTIL = 'ffv_nudge_sticky_until';
const KEY_INLINE_SESSION = 'ffv_nudge_inline_session';

const STICKY_COOLDOWN_HOURS = 24;
const TRIGGER_MIN_MODULES = 3;
const TRIGGER_MIN_QUIZZES = 1;

function readInt(key: string): number {
  if (typeof window === 'undefined') return 0;
  const v = window.localStorage.getItem(key);
  if (!v) return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function writeInt(key: string, n: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(n));
}

export interface NudgeState {
  modulesSeen: number;
  quizzesDone: number;
  stickyHidden: boolean; // true quando dismissou e ainda está no cooldown
  inlineDismissedThisSession: boolean;
}

export function readNudgeState(): NudgeState {
  if (typeof window === 'undefined') {
    return { modulesSeen: 0, quizzesDone: 0, stickyHidden: false, inlineDismissedThisSession: false };
  }
  const hideUntil = parseInt(window.localStorage.getItem(KEY_STICKY_HIDE_UNTIL) ?? '0', 10);
  return {
    modulesSeen: readInt(KEY_MODULES),
    quizzesDone: readInt(KEY_QUIZZES),
    stickyHidden: Number.isFinite(hideUntil) && hideUntil > Date.now(),
    inlineDismissedThisSession: window.sessionStorage?.getItem(KEY_INLINE_SESSION) === '1',
  };
}

export function incrementModulesSeen(): number {
  const next = readInt(KEY_MODULES) + 1;
  writeInt(KEY_MODULES, next);
  return next;
}

export function incrementQuizzesDone(): number {
  const next = readInt(KEY_QUIZZES) + 1;
  writeInt(KEY_QUIZZES, next);
  return next;
}

/**
 * Dismiss do sticky — hide por 24h. Aparece de novo amanhã.
 * Cooldown intencionalmente curto: o nudge tem valor real (revisão espaçada),
 * vale ser persistente. Se dismissou 3x, considerar uplift no cooldown (TODO).
 */
export function dismissStickyNudge(): void {
  if (typeof window === 'undefined') return;
  const until = Date.now() + STICKY_COOLDOWN_HOURS * 3600 * 1000;
  window.localStorage.setItem(KEY_STICKY_HIDE_UNTIL, String(until));
}

/**
 * Dismiss do inline (fim de módulo) — só na sessão atual via sessionStorage.
 * Próxima aba/refresh, volta a aparecer no fim de outro módulo. Não é
 * persistente porque o momento de pico (acabou de acertar quizzes) é raro.
 */
export function dismissInlineNudge(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(KEY_INLINE_SESSION, '1');
  } catch {
    // sessionStorage pode falhar em iframe sandboxed — ignora.
  }
}

export function shouldShowSticky(state: NudgeState): boolean {
  if (state.stickyHidden) return false;
  return state.modulesSeen >= TRIGGER_MIN_MODULES || state.quizzesDone >= TRIGGER_MIN_QUIZZES;
}

export function shouldShowInline(state: NudgeState): boolean {
  return !state.inlineDismissedThisSession;
}

/**
 * Reset — chamado pelo flow de signup/login pra limpar contadores.
 * (logout em auth.ts já limpa todas as chaves ffv_*, então só precisa ser
 * chamado explicitamente em casos de teste ou se quisermos resetar manual.)
 */
export function resetNudgeCounters(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY_MODULES);
  window.localStorage.removeItem(KEY_QUIZZES);
  window.localStorage.removeItem(KEY_STICKY_HIDE_UNTIL);
  try {
    window.sessionStorage.removeItem(KEY_INLINE_SESSION);
  } catch {
    // ignora
  }
}
