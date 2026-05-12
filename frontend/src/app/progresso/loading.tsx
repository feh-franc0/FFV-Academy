export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6" role="status" aria-live="polite" aria-label="Carregando progresso">
      {/* Hero skeleton */}
      <div className="px-0 pt-14 pb-12 animate-pulse" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <div className="h-4 rounded w-24 mb-5" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-[20px]" style={{ background: 'var(--ffv-bg2)' }} />
          <div className="flex-1 space-y-3">
            <div className="h-8 rounded w-64" style={{ background: 'var(--ffv-bg2)' }} />
            <div className="h-3 rounded w-48" style={{ background: 'var(--ffv-bg2)' }} />
            <div className="h-1.5 rounded-full w-full max-w-[520px]" style={{ background: 'var(--ffv-bg2)' }} />
          </div>
        </div>
      </div>
      {/* Stats grid skeleton */}
      <div className="py-12 animate-pulse">
        <div className="h-3 rounded w-20 mb-4" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 h-24" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }} />
          ))}
        </div>
      </div>
      {/* Heatmap skeleton */}
      <div className="pb-12 animate-pulse">
        <div className="h-3 rounded w-48 mb-3" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="rounded-xl h-32" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }} />
      </div>
    </div>
  );
}
