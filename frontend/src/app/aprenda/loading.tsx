/**
 * Loading skeleton para qualquer /aprenda/<slug> — preview do article layout.
 */
export default function Loading() {
  return (
    <article
      className="max-w-2xl mx-auto px-6 py-12"
      role="status"
      aria-live="polite"
      aria-label="Carregando artigo"
    >
      {/* Breadcrumb skeleton */}
      <div
        className="h-3 rounded mb-8 animate-pulse"
        style={{ background: 'var(--ffv-bg2)', width: '40%' }}
      />
      {/* Title skeleton */}
      <div
        className="h-10 rounded mb-3 animate-pulse"
        style={{ background: 'var(--ffv-bg2)', width: '85%' }}
      />
      {/* Meta */}
      <div className="flex gap-3 mb-10 animate-pulse">
        <div className="h-3 w-16 rounded" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="h-3 w-12 rounded" style={{ background: 'var(--ffv-bg2)' }} />
      </div>
      {/* Body */}
      <div className="space-y-3 animate-pulse">
        {[100, 96, 88, 92, 78, 100, 84].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded"
            style={{ background: 'var(--ffv-bg2)', width: `${w}%` }}
          />
        ))}
      </div>
      <div
        className="h-32 rounded-2xl mt-8 animate-pulse"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      />
    </article>
  );
}
