'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AutoRefresh — força router.refresh() após N segundos.
 *
 * Quando uma página renderiza um placeholder porque o backend devolveu
 * null no SSR, o HTML pode ser servido de cache até o próximo ISR
 * revalidate (60s). Este componente garante que o usuário não precise dar
 * Cmd+Shift+R — a página atualiza sozinha em segundos após o carregamento.
 *
 * Mostra um pequeno indicador "Atualizando em X segundos..." pra não
 * deixar o usuário no escuro.
 *
 * IMPORTANTE: só dispara refresh UMA vez (não fica em loop infinito).
 * Quando o módulo tem só metadata permanentemente (caso de seed gerado
 * sem pipeline rodando), a página deve renderizar o conteúdo de fallback
 * direto sem chamar este componente — não tentar refresh.
 */
interface AutoRefreshProps {
  delaySeconds?: number;
}

export function AutoRefresh({ delaySeconds = 8 }: AutoRefreshProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);
  const refreshedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dispara refresh UMA vez quando contador chega a 0. Fora do setState
  // updater (que precisa ser puro — chamar router.refresh() lá causa
  // warning React "Cannot update a component while rendering another").
  useEffect(() => {
    if (secondsLeft === 0 && !refreshedRef.current) {
      refreshedRef.current = true;
      router.refresh();
    }
  }, [secondsLeft, router]);

  return (
    <p
      className="text-xs mt-3 inline-flex items-center gap-2"
      style={{ color: 'var(--ffv-muted)' }}
      aria-live="polite"
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: 'var(--ffv-amber)' }}
        aria-hidden
      />
      {secondsLeft > 0 ? `Atualizando em ${secondsLeft}s…` : 'Recarregando…'}
    </p>
  );
}
