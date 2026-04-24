'use client';

import { useState } from 'react';

interface Props {
  price: number;
  freeLimit: number;
  onUnlock: () => void;
}

/**
 * Paywall mostrado quando usuário tentar acessar questão além do limite
 * grátis (FREE_QUESTIONS_LIMIT). Mock de pagamento: clique "libera".
 *
 * TODO(backend): integrar Stripe Checkout. Nunca confiar em cliente pra
 * liberar produto em produção real.
 */
export function PaywallCard({ price, freeLimit, onUnlock }: Props) {
  const [processing, setProcessing] = useState(false);
  const accent = '#f78166';

  async function handleClick() {
    setProcessing(true);
    // Simula round-trip de pagamento
    await new Promise(r => setTimeout(r, 600));
    onUnlock();
    setProcessing(false);
  }

  return (
    <div
      className="p-8 rounded-2xl text-center"
      style={{
        background: 'color-mix(in srgb, #f78166 10%, var(--ffv-bg2))',
        border: `1px solid ${accent}40`,
      }}
    >
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold mb-2">Você terminou as {freeLimit} questões grátis</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
        Desbloqueie o simulado completo — todas as questões restantes, tutor IA em cada uma, e emissão de certificado quando atingir a nota mínima.
      </p>

      <button
        onClick={handleClick}
        disabled={processing}
        className="px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
        style={{ background: accent, color: '#0d1117' }}
      >
        {processing ? 'Processando…' : `Desbloquear por R$ ${price}`}
      </button>

      <p className="text-[11px] mt-4" style={{ color: 'var(--ffv-muted)' }}>
        Acesso vitalício · sem assinatura · pagamento único
      </p>
      <p className="text-[10px] mt-2 font-mono" style={{ color: 'var(--ffv-muted)' }}>
        🧪 MVP: clique simula pagamento — nenhum cartão é cobrado
      </p>
    </div>
  );
}
