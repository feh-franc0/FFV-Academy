'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { track } from '@/lib/analytics';

const DISMISS_KEY = 'ffv:syncBannerDismissedAt';
const RE_SHOW_AFTER_DAYS = 7;

/**
 * SyncBanner — Aparece quando:
 *   1. Usuário tem progresso (>0 módulos completos)
 *   2. NÃO está logado (progresso só no localStorage)
 *   3. Não dispensou o banner nos últimos 7 dias
 *
 * Mensagem honesta: "Seu progresso está salvo só neste navegador. Crie conta
 * grátis para sincronizar entre dispositivos e acompanhar seu progresso."
 *
 * Posicionamento: top sticky, abaixo do header, dentro de uma faixa
 * gradient-soft que respeita a hierarquia visual.
 */
export function SyncBanner() {
  const { state } = useGameState();
  const { isLoggedIn } = useAuth();
  const [dismissed, setDismissed] = useState(true); // start true to avoid flash

  useEffect(() => {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) {
      setDismissed(false);
      return;
    }
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) {
      setDismissed(false);
      return;
    }
    const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    setDismissed(days < RE_SHOW_AFTER_DAYS);
  }, []);

  const hasProgress = state ? state.completedModules.length > 0 : false;

  if (isLoggedIn) return null;
  if (!hasProgress) return null;
  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
    track('cta_clicked', { id: 'sync_banner_dismiss' });
  }

  return (
    <div
      role="region"
      aria-label="Aviso de sincronização de progresso"
      className="px-4 md:px-6 py-3 flex items-center gap-3 flex-wrap"
      style={{
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--ffv-blue) 15%, var(--ffv-bg)), color-mix(in srgb, var(--ffv-purple) 15%, var(--ffv-bg)))',
        borderBottom: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
      }}
    >
      <span style={{ fontSize: 18 }} aria-hidden>
        💾
      </span>
      <p className="text-xs md:text-sm flex-1" style={{ color: 'var(--foreground)' }}>
        <strong>Seu progresso está salvo só neste navegador.</strong>{' '}
        <span style={{ color: 'var(--ffv-muted)' }}>
          Crie conta grátis para sincronizar entre dispositivos e acompanhar seu progresso.
        </span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/preferencias?tab=conta"
          onClick={() => track('signup_clicked', { from: 'sync_banner' })}
          className="px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-transform hover:scale-[1.04]"
          style={{
            background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          Sincronizar →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dispensar aviso de sincronização"
          className="px-2 py-1.5 rounded-lg text-xs transition-colors"
          style={{
            background: 'transparent',
            color: 'var(--ffv-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
