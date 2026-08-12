'use client';

/**
 * Estado de FALHA de carregamento — deliberadamente distinto de "vazio".
 *
 * "Ninguém pontuou ainda" e "não conseguimos carregar" são afirmações
 * diferentes sobre o mundo. Extraído do padrão originado em
 * `RankingClient.tsx` para reuso em qualquer superfície que busca dado
 * remoto (ranking de trilha, comentários, etc) — um `catch` que devolve
 * lista vazia e leva a UI a afirmar ausência de dado é o defeito que este
 * componente existe para impedir.
 */

interface FalhaAoCarregarProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  /** Versão reduzida para contextos estreitos (sidebar, widget embutido). */
  compact?: boolean;
}

export function FalhaAoCarregar({
  title = 'Não conseguimos carregar agora',
  description = 'O servidor não respondeu. Seus dados estão salvos — o que falhou foi a consulta.',
  onRetry,
  compact = false,
}: FalhaAoCarregarProps) {
  if (compact) {
    return (
      <div
        className="p-4 rounded-xl text-center"
        style={{ background: 'var(--ffv-bg2)', border: '1px dashed rgba(210,153,34,0.45)' }}
        role="alert"
      >
        <p className="text-xs font-semibold mb-1">{title}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--ffv-muted)' }}>{description}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ background: 'var(--ffv-bg2)', border: '1px dashed rgba(210,153,34,0.45)' }}
      role="alert"
    >
      <p className="mb-3 text-4xl" aria-hidden="true">🔌</p>
      <p className="mb-2 text-base font-bold">{title}</p>
      <p className="mx-auto mb-6 max-w-md text-sm" style={{ color: 'var(--ffv-muted)' }}>
        {description}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl px-5 py-2.5 text-sm font-semibold"
        style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
