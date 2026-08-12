'use client';

/**
 * Ponte de resultado entre SimuladoRunner (finaliza) e ResultadoClient (exibe).
 *
 * O score agora vem do SERVIDOR (POST /attempts/{id}/finish) — não há mais
 * cálculo local. sessionStorage é o mecanismo mais simples para levar esse
 * resultado de uma tela para a outra sem inventar um endpoint "get attempt by
 * id" só para isso: é de uso único (a tela de resultado limpa ao ler) e não
 * sobrevive a uma aba nova por design — ResultadoClient tem fallback via
 * listAttemptsApi() para quando o usuário chega direto (reload, link salvo).
 */

import type { ScoreDTO } from './simulados-api';

const KEY_PREFIX = 'ffv_sim_result_';

export interface StashedResult {
  attemptId: string;
  simuladoId: string;
  score: ScoreDTO;
  weakTopics: string[];
  questionIds: string[];
  answers: Record<string, string>;
  finishedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function stashResult(simuladoId: string, result: StashedResult): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(KEY_PREFIX + simuladoId, JSON.stringify(result));
  } catch { /* sessionStorage indisponível/cheio — ResultadoClient cai no fallback */ }
}

/** Lê o resultado e o REMOVE (uso único — evita reexibir um resultado velho). */
export function readAndClearResult(simuladoId: string): StashedResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + simuladoId);
    if (!raw) return null;
    sessionStorage.removeItem(KEY_PREFIX + simuladoId);
    return JSON.parse(raw) as StashedResult;
  } catch {
    return null;
  }
}
