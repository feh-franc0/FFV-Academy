'use client';

/**
 * Sistema de referral via URL: ?ref=<id>
 *
 * Funcionamento:
 * - Quando o usuário chega com ?ref=<id>, o ID é salvo em localStorage (uma única vez por device).
 * - Na primeira visita, ganha bônus de XP (REFERRAL_BONUS_XP) e badge "Convidado".
 * - O ID do referrer é apenas tracking — não há identidade verificada (sem backend).
 * - Quando user gera link próprio (via getMyReferralLink), usa hash do startedAt + xp inicial.
 *
 * Limitações conscientes (sem backend):
 * - Não há contagem real de quantos usuários foram referidos por X.
 * - O bônus pra quem REFERIU só é visível se ele compartilhar e os referidos voltarem ao link.
 *   Quando tivermos backend, contadores reais. Por agora, o sistema é puramente client-side
 *   e serve pra: (1) tracking básico via Plausible custom events,
 *               (2) gamificação (badges + XP bonus) que motiva sharing,
 *               (3) infra preparada pra quando tiver backend.
 */

import { STORAGE_KEYS } from './constants';
import { GAME_CONFIG } from './constants';
import { getJSON, getRaw, setJSON, setRaw } from './storage';

export const REFERRAL_BONUS_XP = GAME_CONFIG.REFERRAL_BONUS_XP;
export const REFERRER_BONUS_XP = GAME_CONFIG.REFERRER_BONUS_XP;

export interface ReferralRecord {
  refId: string;          // ID de quem referiu
  receivedAt: string;     // ISO timestamp
  bonusGranted: boolean;  // se já recebeu o bônus
}

/** Gera ou recupera o ID único deste usuário (estável no device). */
export function getMyReferralId(): string {
  if (typeof window === 'undefined') return '';
  let id = getRaw(STORAGE_KEYS.MY_REFERRAL_ID);
  if (!id) {
    id = generateRefId();
    setRaw(STORAGE_KEYS.MY_REFERRAL_ID, id);
  }
  return id;
}

function generateRefId(): string {
  // 8 chars alfanuméricos lowercase: ~36^8 = 2.8 trilhões (suficiente)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Lê ?ref= da URL atual e armazena se primeira vez.
 *
 * Validação de segurança:
 * - Comprimento entre 3 e 32 caracteres
 * - Whitelist estrita: /^[a-z0-9]{3,32}$/
 *   Bloqueia tentativas de injection (ex: `<img src=x>`, `javascript:`, etc.)
 *   antes que entrem no localStorage.
 */
export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const refId = params.get('ref');
  if (!refId || !GAME_CONFIG.REFERRAL_ID_REGEX.test(refId)) return null;

  if (getRaw(STORAGE_KEYS.REFERRAL)) return null;
  if (getRaw(STORAGE_KEYS.MY_REFERRAL_ID) === refId) return null;

  const record: ReferralRecord = {
    refId,
    receivedAt: new Date().toISOString(),
    bonusGranted: false,
  };
  setJSON(STORAGE_KEYS.REFERRAL, record);

  try {
    window.plausible?.('referral-captured', { props: { refId } });
  } catch {}

  return refId;
}

/** Retorna o registro de referral atual (ou null se não há). */
export function getReferralRecord(): ReferralRecord | null {
  return getJSON<ReferralRecord | null>(STORAGE_KEYS.REFERRAL, null);
}

/** Marca bônus como entregue (chamado pela engine após dar XP). */
export function markReferralBonusGranted(): void {
  const record = getReferralRecord();
  if (!record) return;
  setJSON(STORAGE_KEYS.REFERRAL, { ...record, bonusGranted: true });
}

const BASE_ORIGIN = 'https://fernandofrancovalle.com';

/**
 * Sanitiza `targetPath` para evitar open-redirect.
 * - Só aceita path começando com `/` e sem `//` (evita protocol-relative URL).
 * - Remove qualquer tentativa de passar URL absoluta com origem própria.
 */
function safePath(input: string): string {
  if (!input || typeof input !== 'string') return '/';
  if (!input.startsWith('/') || input.startsWith('//')) return '/';
  // Desmonta qualquer ":" que possa forjar protocolo após path
  if (input.includes(':')) return '/';
  return input;
}

/** Constrói link de convite com referral próprio — à prova de open-redirect. */
export function getMyReferralLink(targetPath: string = '/'): string {
  const id = getMyReferralId();
  const path = safePath(targetPath);
  const url = new URL(path, BASE_ORIGIN);
  if (id) url.searchParams.set('ref', id);
  return url.toString();
}

/** Pre-composed share text para refer-a-friend. */
export function buildReferralShareText(): string {
  const link = getMyReferralLink();
  return `Estou estudando IA, AWS e Claude Code de graça na FFV Academy. Vem com a gente — você ganha XP bônus se entrar pelo meu link 🚀\n\n${link}`;
}
