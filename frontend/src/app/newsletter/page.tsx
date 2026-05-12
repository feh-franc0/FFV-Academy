import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsletterInlineForm } from '@/components/NewsletterInlineForm';

export const metadata: Metadata = {
  title: 'Newsletter — FFV Academy',
  description:
    'Newsletter semanal sobre IA, engenharia e produtos digitais. Um artigo profundo por semana, direto na sua caixa. Sem spam.',
  alternates: { canonical: 'https://fernandofrancovalle.com/newsletter' },
};

const RECENT_TOPICS = [
  {
    week: '#018',
    date: '2026-04-28',
    title: 'Por que microsserviços para times de 5 devs é overengineering',
    desc: 'A armadilha do "começar certo" — quando complexidade arquitetural mata velocidade.',
  },
  {
    week: '#017',
    date: '2026-04-21',
    title: 'O que aprendi rodando RAG em produção por 6 meses',
    desc: 'Chunking, reranking, cache de embeddings, custo real e limitações que ninguém fala.',
  },
  {
    week: '#016',
    date: '2026-04-14',
    title: 'Claude Code Pro: o harness mudou meu fluxo de dev',
    desc: 'System prompts, plugins, hooks — o que entendi depois de 3 meses usando.',
  },
  {
    week: '#015',
    date: '2026-04-07',
    title: 'KV Cache explicado: como modelos respondem 10x mais rápido',
    desc: 'O mecanismo que tornou inferência viável em produção. Por dentro, sem mistério.',
  },
  {
    week: '#014',
    date: '2026-03-31',
    title: 'Engenharia AI-Native: 5 padrões que estão emergindo',
    desc: 'O que stacks modernas com IA no centro estão fazendo diferente das tradicionais.',
  },
];

export default function NewsletterPage() {
  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-green) 14%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-green)', letterSpacing: '0.12em' }}
          >
            Newsletter Semanal
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Um artigo profundo por semana.
            <br />
            <span style={{ color: 'var(--ffv-green)' }}>Direto na sua caixa.</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--ffv-muted)',
              maxWidth: 600,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Toda terça-feira: um artigo técnico inédito sobre IA, engenharia, AWS ou produtos
            digitais. Conteúdo que não foi feito por IA — pesquisa, escrita e revisão humana.
          </p>

          <NewsletterInlineForm />
          <p
            className="font-mono mt-4 text-xs"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
          >
            SEM SPAM · CANCELE QUANDO QUISER
          </p>
        </div>
      </section>

      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-bold mb-2"
            style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Edições recentes
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--ffv-muted)' }}>
            Tópicos cobertos nas últimas 5 semanas. O arquivo completo fica no Buttondown.
          </p>
          <div className="space-y-3">
            {RECENT_TOPICS.map(t => (
              <article
                key={t.week}
                className="p-5 rounded-2xl"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--ffv-green) 15%, transparent)',
                      color: 'var(--ffv-green)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.week}
                  </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
                  >
                    {formatDate(t.date)}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1.5">{t.title}</h3>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                  {t.desc}
                </p>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://buttondown.com/fernandofrancovalle/archive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--ffv-green)' }}
            >
              Ver arquivo completo no Buttondown →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
