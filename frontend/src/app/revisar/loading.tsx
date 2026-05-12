export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12" role="status" aria-live="polite" aria-label="Carregando cards de revisão">
      <div className="animate-pulse space-y-6">
        <div className="h-8 rounded w-40" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="rounded-2xl p-8 space-y-4 h-64" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }} />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-12 rounded-xl" style={{ background: 'var(--ffv-bg2)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
