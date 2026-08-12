'use client';

import Link from 'next/link';

interface Props {
  title: string;
  description: string;
  reset: () => void;
}

/**
 * Boundary de erro de SEGMENTO — nomeia o que falhou e preserva navegação,
 * em vez de derrubar a app inteira para o `error.tsx` genérico da raiz.
 * Antes havia só 1 boundary para 96 páginas: qualquer `throw` em
 * `/aprenda/[slug]`, `/simulados` ou `/revisar` levava ao mesmo texto
 * genérico, sem contexto de qual jornada quebrou.
 */
export function SegmentError({ title, description, reset }: Props) {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center"
      role="alert"
    >
      <span style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">⚠️</span>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm mb-6 mx-auto" style={{ color: 'var(--ffv-muted)', maxWidth: 420 }}>
        {description}
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          Voltar para a home
        </Link>
        <Link
          href="/explorar"
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          Explorar conteúdo
        </Link>
      </div>
    </div>
  );
}
