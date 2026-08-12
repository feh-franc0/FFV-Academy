'use client';

// Error Boundary raiz — captura erros de render em qualquer árvore cliente.
// Sem serviço externo (free tier): apenas console.error estruturado.

import React from 'react';
import Link from 'next/link';

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
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Algo deu errado.
          </h1>
          <p style={{ maxWidth: 480, opacity: 0.8 }}>
            Recarregue a página. Se o erro persistir, volte mais tarde.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: '1px solid currentColor',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Recarregar
            </button>
            <Link
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: '1px solid currentColor',
                fontWeight: 600,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Voltar para a home
            </Link>
            <Link
              href="/explorar"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: '1px solid currentColor',
                fontWeight: 600,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Explorar conteúdo
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
