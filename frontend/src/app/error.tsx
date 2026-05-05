'use client';

export default function Error({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center"
      style={{ color: 'var(--foreground)' }}
    >
      <span style={{ fontSize: 48, marginBottom: 16 }}>⚠️</span>
      <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)', maxWidth: 420 }}>
        Ocorreu um erro inesperado. Seus dados de progresso estão seguros no navegador.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          background: 'var(--ffv-blue)',
          color: 'var(--primary-foreground)',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
