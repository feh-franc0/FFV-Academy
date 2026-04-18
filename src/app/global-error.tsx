'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 48, marginBottom: 16 }}>⚠️</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Algo deu errado</h2>
          <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 420, marginBottom: 24 }}>
            Ocorreu um erro inesperado. Seus dados de progresso estão seguros no navegador.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              background: '#58a6ff',
              color: '#0d1117',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
