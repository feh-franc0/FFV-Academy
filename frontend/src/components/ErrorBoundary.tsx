'use client';

// Error Boundary raiz — captura erros de render em qualquer árvore cliente.
// Sem serviço externo (free tier): apenas console.error estruturado.

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log estruturado — facilita debug local e eventual ingestão futura.
    console.error('[FFV ErrorBoundary]', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            gap: '1rem',
            background: 'var(--ffv-bg, #faf6ee)',
            color: 'var(--foreground, #1f3a30)',
          }}
        >
          <div
            aria-hidden
            style={{
              fontSize: '4rem',
              marginBottom: '0.5rem',
              filter: 'grayscale(0.2)',
            }}
          >
            🛟
          </div>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--ffv-muted, #5f6b62)',
              fontWeight: 700,
              marginBottom: '0.25rem',
            }}
          >
            Imprevisto técnico
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              maxWidth: 560,
              margin: 0,
            }}
          >
            Algo travou aqui dentro — mas seu progresso está salvo.
          </h1>
          <p style={{ maxWidth: 480, opacity: 0.75, lineHeight: 1.55, fontSize: 15 }}>
            Sua sessão e seu XP ficam intactos no localStorage. Recarregue a página pra continuar de onde parou,
            ou volte pra home se preferir.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                maxWidth: 640,
                marginTop: '0.5rem',
                fontSize: 12,
                textAlign: 'left',
                background: 'var(--ffv-bg2, #f5efe0)',
                border: '1px solid var(--ffv-border, #e0d4ba)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Detalhe técnico (dev)</summary>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: 'none',
                background: 'var(--ffv-ink, #1f3a30)',
                color: 'var(--ffv-paper, #faf6ee)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Recarregar página
            </button>
            {/* Em ErrorBoundary (Class Component) o roteamento do Next ainda é confiável,
                mas pra navegar fora de uma árvore quebrada, full reload via <a> é
                mais seguro que router.push. ESLint flag para next/link aqui é
                falso-positivo — o objetivo é evitar manter o estado bugado. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: '1px solid var(--ffv-border, #e0d4ba)',
                background: 'transparent',
                color: 'var(--foreground, #1f3a30)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Voltar pra home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
