import Link from 'next/link';
import type { Metadata } from 'next';
import { HUBS } from '@/lib/curriculum';
import { NotFoundSearchButton } from '@/components/NotFoundSearchButton';

/**
 * 404 genérico da plataforma.
 *
 * Antes não existia `not-found.tsx`, então qualquer URL inexistente caía no
 * padrão do Next: "404: This page could not be found." — em inglês, numa
 * plataforma inteiramente em PT-BR, sem nenhuma ajuda para o usuário se
 * reorientar. O layout renderizava em volta, então havia header e footer, mas a
 * mensagem era texto de sistema cru.
 *
 * A rota /aprenda/[slug] tem tratamento próprio (e melhor, porque conhece o
 * módulo); esta página cobre todo o resto.
 */

export const metadata: Metadata = {
  // sem sufixo: o layout aplica o template '%s — FFV Academy'
  title: 'Página não encontrada',
  description: 'Esta página não existe. Explore os hubs, use a busca ou volte para a home.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p
        className="font-mono text-xs uppercase tracking-[0.18em]"
        style={{ color: 'var(--ffv-muted)' }}
      >
        Erro 404
      </p>

      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        Esta página não existe
      </h1>

      <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        O endereço pode ter mudado, ou o link que te trouxe até aqui está
        desatualizado. Nada do seu progresso foi perdido — ele fica salvo no seu
        navegador e na sua conta.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          Voltar para a home
        </Link>
        <Link
          href="/explorar"
          className="rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          Explorar trilhas
        </Link>
        <NotFoundSearchButton />
      </div>

      <section className="mt-14" aria-labelledby="nf-hubs">
        <h2
          id="nf-hubs"
          className="font-mono text-xs uppercase tracking-[0.16em]"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Ou comece por um hub
        </h2>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {HUBS.map(hub => (
            <li key={hub.id}>
              <Link
                href={hub.href}
                className="flex h-full gap-3 rounded-2xl p-4 transition-colors"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  textDecoration: 'none',
                }}
              >
                <span aria-hidden="true" className="text-xl leading-none ffv-acento-texto" style={{ '--ffv-acento': hub.color } as React.CSSProperties}>
                  {hub.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9rem] font-semibold" style={{ color: 'var(--foreground)' }}>
                    {hub.name}
                  </span>
                  <span
                    className="mt-1 block text-[0.78rem] leading-snug"
                    style={{ color: 'var(--ffv-muted)' }}
                  >
                    {hub.tagline}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
