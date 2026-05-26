import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Entrar — FFV Academy',
  description:
    'Entre na FFV Academy pra acompanhar suas trilhas, solicitações de base e progresso de estudo.',
  alternates: { canonical: 'https://fernandofrancovalle.com/login' },
  robots: { index: false, follow: false },
};

/**
 * Página `/login` — wrapper SSR-friendly do LoginPageClient.
 *
 * Aceita query params via URL — usados pelo botão "Confirmar e acompanhar"
 * do email de boas-vindas pós-submit de study-request:
 *   /login?email=alice@gmail.com&code=123456
 *
 * Quando ambos vêm pré-preenchidos, o modal já abre no passo "código" com
 * tudo digitado — basta 1 clique pra entrar. Sem params, mostra o passo
 * inicial de email normalmente.
 *
 * `<Suspense>` necessário porque LoginPageClient usa useSearchParams() (CSR).
 */
export default function LoginPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <Suspense
        fallback={
          <div className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Carregando...
          </div>
        }
      >
        <LoginPageClient />
      </Suspense>
    </main>
  );
}
