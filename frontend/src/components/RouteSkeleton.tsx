/**
 * Skeleton compartilhado para `loading.tsx` de rota.
 *
 * Rotas que buscam dado do backend não tinham estado de carregamento — só 5 de 99
 * tinham `loading.tsx`. Sem ele, a navegação parece travada até o HTML chegar: o
 * usuário clica e nada acontece por um tempo indeterminado.
 *
 * `role="status"` + `aria-live="polite"` para que leitor de tela anuncie o
 * carregamento em vez de ficar em silêncio.
 */
export function RouteSkeleton({
  titulo,
  linhas = 6,
  colunas = 1,
}: {
  titulo: string;
  linhas?: number;
  colunas?: 1 | 2 | 3;
}) {
  const grid = colunas === 3 ? 'sm:grid-cols-3' : colunas === 2 ? 'sm:grid-cols-2' : '';

  return (
    <div
      className="mx-auto max-w-5xl px-6 py-12"
      role="status"
      aria-live="polite"
      aria-label={`Carregando ${titulo}`}
    >
      <div
        className="mb-4 h-9 animate-pulse rounded"
        style={{ background: 'var(--ffv-bg2)', width: '52%' }}
      />
      <div
        className="mb-10 h-4 animate-pulse rounded"
        style={{ background: 'var(--ffv-bg2)', width: '34%' }}
      />
      <div className={`grid gap-4 ${grid}`}>
        {Array.from({ length: linhas }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl"
            style={{
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
              // atraso escalonado: o olho lê como carregamento, não como travado
              animationDelay: `${i * 70}ms`,
            }}
          />
        ))}
      </div>
      <span className="sr-only">Carregando {titulo}…</span>
    </div>
  );
}
