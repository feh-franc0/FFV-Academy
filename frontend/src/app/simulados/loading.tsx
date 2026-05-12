export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" role="status" aria-live="polite" aria-label="Carregando simulados">
      <div className="animate-pulse space-y-6">
        <div className="h-8 rounded w-48" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="h-4 rounded w-72" style={{ background: 'var(--ffv-bg2)' }} />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 h-48" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
