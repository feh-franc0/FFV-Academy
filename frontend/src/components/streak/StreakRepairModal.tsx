'use client';

import { useEffect } from 'react';
import { playPop } from '@/lib/sounds';

export interface StreakRepairModalProps {
  open: boolean;
  /** Streak quebrada que pode ser restaurada. */
  streak: number;
  /** Custo em XP para reparar. */
  cost: number;
  /** XP atual do usuário (para mostrar estado desabilitado se não tiver suficiente). */
  currentXP: number;
  onConfirm: () => void;
  onDismiss: () => void;
}

/**
 * Modal "Duolingo Streak Freeze"-style: oferece restaurar a streak quebrada
 * em troca de uma pequena quantidade de XP. Único gatilho: streak quebrou
 * exatamente ontem (não há reparo de quebras de >1 dia).
 *
 * Dispara o som de pop ao abrir (chamada de atenção emocional).
 */
export function StreakRepairModal({
  open,
  streak,
  cost,
  currentXP,
  onConfirm,
  onDismiss,
}: StreakRepairModalProps) {
  useEffect(() => {
    if (!open) return;
    playPop();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  if (!open) return null;
  const canAfford = currentXP >= cost;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Sua sequência de ${streak} dias está em risco`}
      data-testid="streak-repair-modal"
      className="fixed inset-0 z-[95] flex items-center justify-center px-4"
      style={{
        background: 'color-mix(in srgb, #000 65%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--ffv-bg)',
          border: '1px solid color-mix(in srgb, var(--ffv-orange) 40%, transparent)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 64px color-mix(in srgb, var(--ffv-orange) 18%, transparent)',
        }}
      >
        <div
          style={{
            padding: '32px 24px 18px',
            textAlign: 'center',
            borderBottom: '1px solid var(--ffv-border)',
            background: 'radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--ffv-orange) 18%, transparent), transparent 70%)',
          }}
        >
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>🔥</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Sua streak de {streak} dia{streak !== 1 ? 's' : ''} está em risco!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ffv-muted)', marginTop: 6 }}>
            Você não estudou ontem. Salve sua sequência por <b>{cost} XP</b>.
          </p>
        </div>

        <div style={{ padding: '18px 20px 22px' }}>
          <button
            type="button"
            onClick={canAfford ? onConfirm : undefined}
            disabled={!canAfford}
            data-testid="streak-repair-confirm"
            className="w-full py-3 rounded-xl font-semibold mb-2"
            style={{
              background: canAfford ? 'var(--ffv-orange)' : 'var(--ffv-bg2)',
              color: canAfford ? '#0d1117' : 'var(--ffv-muted)',
              fontSize: 14,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.6,
              border: 'none',
            }}
          >
            {canAfford ? `🔥 Salvar streak (−${cost} XP)` : `XP insuficiente (precisa ${cost})`}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            data-testid="streak-repair-dismiss"
            className="w-full py-2.5 rounded-xl font-medium"
            style={{
              background: 'transparent',
              color: 'var(--ffv-muted)',
              fontSize: 12,
              border: '1px solid var(--ffv-border)',
            }}
          >
            Tudo bem, perder
          </button>
        </div>
      </div>
    </div>
  );
}
