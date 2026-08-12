'use client';

import { useRouter } from 'next/navigation';

interface Props {
  /** Título do módulo, quando conhecido pelo índice local do currículo. */
  title?: string;
}

/**
 * Estado de "backend fora do ar" para uma rota de artigo que EXISTE.
 *
 * Distinto de 404: o slug está no currículo, só não deu pra buscar o
 * conteúdo agora. Antes, `fetchArticleWithBlocks` colapsava 404 e erro de
 * rede no mesmo `null`, e a rota levava os dois direto para `notFound()` —
 * com o backend fora, as 490 páginas de módulo respondiam 404 real.
 */
export function ConteudoIndisponivel({ title }: Props) {
  const router = useRouter();

  return (
    <article className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="text-5xl mb-4" aria-hidden="true">🔌</p>
      {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
      <p className="text-base font-semibold mb-2">Conteúdo temporariamente indisponível</p>
      <p className="text-sm mb-6 mx-auto" style={{ color: 'var(--ffv-muted)', maxWidth: 420 }}>
        Não conseguimos carregar este módulo agora. O conteúdo existe — o que falhou foi a
        consulta ao servidor. Tente de novo em instantes.
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="px-4 py-2 rounded-md text-sm font-semibold"
        style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
      >
        Tentar novamente
      </button>
    </article>
  );
}
