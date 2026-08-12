import type { Metadata } from 'next';
import Link from 'next/link';

import { safeJsonLd } from '@/lib/safe-json';
import { BASE, social } from '@/lib/metadata-social';
import { TEMAS, getTemaStats, MINIMO_PARA_PAGINA } from '@/lib/curriculum/temas';

/**
 * `/temas` — índice do eixo de assunto.
 *
 * Hub e trilha respondem "onde estou na jornada". Tema responde "qual assunto".
 * Quem chega da busca pergunta a segunda coisa, e a plataforma não tinha resposta
 * — o levantamento de demanda de ago/2026 (`PESQUISA_DEMANDA_BUSCA_2026-08.md`)
 * é o registro do porquê.
 *
 * Esta página lista os 21 temas e diz, sem maquiar, quais ainda não têm ensino
 * suficiente para ter página própria. Tema anunciado com dois módulos parece
 * cobertura e não é.
 */

export const metadata: Metadata = {
  // Sem "FFV Academy": o template do layout raiz acrescenta o sufixo, e a frase
  // antiga já continha a marca — o resultado servido era
  // "Temas — todos os assuntos da FFV Academy — FFV Academy".
  title: 'Temas — todos os assuntos, atravessando trilhas',
  description:
    'Os 21 temas da FFV Academy: agentes, RAG, evals, custo de LLM, segurança de IA, Bedrock, certificação AWS, Claude Code, carreira e mais. O currículo organizado por assunto, atravessando trilhas.',
  keywords:
    'temas ffv academy, assuntos de ia, agentes de ia, rag, evals de llm, custo de llm, seguranca de ia, certificacao aws, claude code',
  alternates: { canonical: `${BASE}/temas` },
  ...social({
    titulo: 'Temas — todos os assuntos da FFV Academy',
    descricao: 'O currículo organizado por assunto, atravessando trilhas: 21 temas, de agentes a conformidade.',
    caminho: '/temas',
  }),
};

export default function TemasPage() {
  const comStats = TEMAS.map(tema => ({ tema, stats: getTemaStats(tema.id) }));
  const publicados = comStats
    .filter(t => t.stats.modules >= MINIMO_PARA_PAGINA)
    .sort((a, b) => b.stats.modules - a.stats.modules);
  const emProducao = comStats
    .filter(t => t.stats.modules < MINIMO_PARA_PAGINA)
    .sort((a, b) => b.stats.modules - a.stats.modules);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Temas — FFV Academy',
    description: 'O currículo da FFV Academy organizado por assunto, atravessando trilhas.',
    url: 'https://fernandofrancovalle.com/temas',
    inLanguage: 'pt-BR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: publicados.length,
      itemListElement: publicados.map(({ tema }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: tema.name,
        description: tema.tagline,
        url: `https://fernandofrancovalle.com/temas/${tema.slug}`,
      })),
    },
  };

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(ld) }} />

      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 0%, color-mix(in srgb, var(--ffv-purple) 12%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <nav
            className="flex items-center gap-1.5 text-xs mb-6"
            style={{ color: 'var(--ffv-muted)' }}
            aria-label="Migalha de pão"
          >
            <Link href="/" className="transition-colors hover:underline">FFV Academy</Link>
            <span aria-hidden>/</span>
            <span style={{ color: 'var(--foreground)' }}>Temas</span>
          </nav>

          <h1
            style={{
              fontSize: 'clamp(1.9rem, 4.6vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.12,
              marginBottom: 18,
            }}
          >
            O currículo por assunto
          </h1>
          <p className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--ffv-muted)', lineHeight: 1.65 }}>
            Trilha é ordem de estudo. <strong style={{ color: 'var(--foreground)' }}>Tema é assunto</strong> — e
            atravessa trilhas. &quot;Como medir alucinação em produção&quot; mora em três
            trilhas diferentes; aqui mora em um lugar.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <ul className="grid gap-3 sm:grid-cols-2">
            {publicados.map(({ tema, stats }) => (
              <li key={tema.id}>
                <Link
                  href={`/temas/${tema.slug}`}
                  className="block rounded-xl p-4 h-full transition-transform hover:-translate-y-0.5"
                  style={{
                    border: '1px solid var(--ffv-border)',
                    background: 'var(--ffv-surface)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span aria-hidden style={{ fontSize: 20 }}>{tema.icon}</span>
                    <h2 className="font-semibold text-[15px] ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>
                      {tema.name}
                    </h2>
                  </div>
                  <p className="text-[13px] mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                    {tema.tagline}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--ffv-muted)' }}>
                    {stats.modules} módulos · {stats.trails} trilhas · {Math.round(stats.minutes / 60)} h
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {emProducao.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-2">Em produção</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Estes temas têm demanda de busca mapeada e ainda não têm ensino suficiente
                para uma página própria — o limiar é {MINIMO_PARA_PAGINA} módulos. Página de
                tema com dois módulos parece cobertura e não é, então ela não existe até
                existir o conteúdo.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {emProducao.map(({ tema, stats }) => (
                  <li
                    key={tema.id}
                    className="rounded-xl p-4"
                    style={{
                      border: '1px dashed var(--ffv-border)',
                      background: 'transparent',
                      opacity: 0.75,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span aria-hidden style={{ fontSize: 20 }}>{tema.icon}</span>
                      <h3 className="font-semibold text-[15px]">{tema.name}</h3>
                    </div>
                    <p className="text-[13px] mb-2" style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                      {tema.tagline}
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: 'var(--ffv-muted)' }}>
                      {stats.modules} de {MINIMO_PARA_PAGINA} módulos
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
