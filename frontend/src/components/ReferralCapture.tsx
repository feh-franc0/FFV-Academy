'use client';

import { useEffect, useRef } from 'react';
import { captureReferralFromUrl, getReferralRecord, markReferralBonusGranted } from '@/lib/referral';
import { awardBadge } from '@/lib/engine';

/**
 * Componente client-only que captura ?ref=<id> da URL no mount.
 * Renderiza nada — efeito apenas em localStorage.
 *
 * Quando o user chega via link `?ref=xpto`, fica registrado.
 * Os bônus de XP serão aplicados pela engine quando ela detectar
 * referral pendente (lógica futura na engine.ts ou hook).
 */
export function ReferralCapture() {
  // Guard pra StrictMode (React 19 em dev executa effects 2x).
  // awardBadge já é idempotente via estado, e `bonusGranted` no record
  // protege duplicação entre sessões — este ref evita o re-fire no mesmo mount.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    captureReferralFromUrl();
    const record = getReferralRecord();
    if (record && !record.bonusGranted) {
      awardBadge('invited');
      markReferralBonusGranted();
    }
  }, []);

  return null;
}
