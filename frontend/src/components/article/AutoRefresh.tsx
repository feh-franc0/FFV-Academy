'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AutoRefresh — força router.refresh() após N segundos.
 *
 * Quando uma página renderiza um placeholder ("Conteúdo carregando...")
 * porque o backend devolveu null no SSR, o HTML pode ser servido de cache
 * até o próximo ISR revalidate (60s). Este componente garante que o
 * usuário não precise dar Cmd+Shift+R — a página atualiza sozinha em
 * segundos após o carregamento.
 *
 * Mostra um pequeno indicador "Atualizando em X segundos..." pra não
 * deixar o usuário no escuro.
 */
interface AutoRefreshProps {
  delaySeconds?: number;
}

export function AutoRefresh({ delaySeconds = 8 }: AutoRefreshProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          router.refresh();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

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
      Atualizando em {secondsLeft}s…
    </p>
  );
}
