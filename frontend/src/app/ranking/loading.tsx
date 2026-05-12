export default function Loading() {
  return (
    <div
      className="max-w-5xl mx-auto px-6 py-12"
      role="status"
      aria-live="polite"
      aria-label="Carregando ranking"
    >
      <div
        className="h-10 rounded mb-4 animate-pulse"
        style={{ background: 'var(--ffv-bg2)', width: '60%' }}
      />
      <div
        className="h-4 rounded mb-12 animate-pulse"
        style={{ background: 'var(--ffv-bg2)', width: '40%' }}
      />
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
        {[180, 240, 160].map((h, i) => (
          <div
            key={i}
            className="rounded-2xl animate-pulse"
            style={{
              height: h,
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
            }}
          />
        ))}
      </div>
      <div
        className="rounded-2xl mt-8 animate-pulse"
        style={{
          height: 400,
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
        }}
      />
    </div>
  );
}
