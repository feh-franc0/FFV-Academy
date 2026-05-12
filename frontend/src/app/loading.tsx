/**
 * Loading global — fallback genérico durante navegação entre rotas.
 * Skeleton minimal para não causar layout shift.
 */
export default function Loading() {
  return (
    <div
      className="max-w-5xl mx-auto px-6 py-12"
      role="status"
      aria-live="polite"
      aria-label="Carregando página"
    >
      <div className="space-y-4 animate-pulse">
        <div
          className="h-10 rounded-md"
          style={{ background: 'var(--ffv-bg2)', width: '40%' }}
        />
        <div
          className="h-4 rounded-md"
          style={{ background: 'var(--ffv-bg2)', width: '70%' }}
        />
        <div
          className="h-4 rounded-md"
          style={{ background: 'var(--ffv-bg2)', width: '85%' }}
        />
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 animate-pulse"
      >
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-40 rounded-2xl"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          />
        ))}
      </div>
    </div>
  );
}
