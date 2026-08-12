import type { Metadata } from 'next';
import Link from 'next/link';
import { CURRICULUM, JORNADA, trilhasDaEtapa } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';
import { safeJsonLd } from '@/lib/safe-json';

/**
 * A jornada de ponta a ponta — AWS, depois IA, depois a união.
 *
 * ## Por que esta página existe
 *
 * Auditoria de 09/ago/2026: 31 das 38 trilhas terminavam sem apontar para
 * nenhuma outra. O objetivo declarado da plataforma é um PERCURSO, e o produto
 * entregava 38 cursos soltos. Esta página é a expressão navegável do percurso, e
 * a fonte é `curriculum/jornada.ts` — a mesma que gera o `nextSuggested` do
 * último módulo de cada trilha, para que a ordem não divirja entre os dois.
 *
 * ## O que ela faz por busca
 *
 * É a página de maior intenção do site: quem procura "como aprender AWS e IA do
 * zero" está procurando exatamente um caminho ordenado, e nenhuma página
 * respondia isso. Ela também é o único lugar que liga as 38 trilhas a partir de
 * uma URL só, o que dá ao rastreador um mapa do domínio em um salto.
 */

const DESCRICAO =
  'O caminho completo, em cinco etapas: base técnica, AWS do básico ao avançado, IA do básico ao avançado, a união dos dois em soluções reais, e a operação em produção.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/jornada` },
  ...social({ titulo: 'A jornada completa — FFV Academy', descricao: DESCRICAO, caminho: '/jornada' }),
  title: 'A jornada: de zero a arquiteto de IA na AWS',
  description: DESCRICAO,
  keywords:
    'como aprender aws do zero, roteiro aws e ia, trilha completa aws, aprender ia na aws, caminho arquiteto de solucoes, ordem para estudar aws',
};

/** Total de módulos de uma lista de ids de trilha. */
function contarModulos(ids: string[]): number {
  return ids.reduce((soma, id) => soma + (CURRICULUM.find(t => t.id === id)?.modules.length ?? 0), 0);
}

export default function JornadaPage() {
  const totalModulos = JORNADA.reduce(
    (s, e) => s + contarModulos(e.trilhas) + contarModulos(e.opcionais),
    0,
  );

  // `Course` com `hasPart` por etapa: declara ao buscador que o site tem um
  // percurso ordenado, e não uma coleção de artigos. `coursePrerequisites`
  // encadeia as etapas na ordem em que precisam ser feitas.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${BASE}/jornada#curso`,
    name: 'De zero a arquiteto de soluções de IA na AWS',
    description: DESCRICAO,
    url: `${BASE}/jornada`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    provider: { '@id': `${BASE}/#organizacao` },
    numberOfCredits: undefined,
    hasPart: JORNADA.map(etapa => ({
      '@type': 'Course',
      name: `Etapa ${etapa.numero} — ${etapa.titulo}`,
      description: etapa.resultado,
      url: `${BASE}/jornada#etapa-${etapa.id}`,
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      provider: { '@id': `${BASE}/#organizacao` },
      ...(etapa.numero > 0
        ? { coursePrerequisites: `Etapa ${etapa.numero - 1} — ${JORNADA[etapa.numero - 1].titulo}` }
        : {}),
      hasPart: trilhasDaEtapa(etapa).principais.map(t => ({
        '@type': 'Course',
        name: t.name,
        url: `${BASE}${t.href}`,
        description: t.desc,
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        provider: { '@id': `${BASE}/#organizacao` },
      })),
    })),
  };

  const migalhas = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'A jornada', item: `${BASE}/jornada` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(migalhas) }} />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            De zero a arquiteto de soluções de IA na AWS
          </h1>
          <p className="text-lg mb-3" style={{ color: 'var(--ffv-muted)' }}>
            {DESCRICAO}
          </p>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {JORNADA.length} etapas · {CURRICULUM.length} trilhas · {totalModulos} módulos · gratuito,
            sem cadastro
          </p>
        </header>

        <ol className="space-y-12">
          {JORNADA.map(etapa => {
            const { principais, opcionais } = trilhasDaEtapa(etapa);
            return (
              <li key={etapa.id} id={`etapa-${etapa.id}`} className="scroll-mt-24">
                <div className="flex items-start gap-3 mb-3">
                  <span aria-hidden className="text-2xl leading-none mt-0.5">
                    {etapa.icone}
                  </span>
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1 ffv-acento-texto"
                      style={{ '--ffv-acento': etapa.cor } as React.CSSProperties}
                    >
                      Etapa {etapa.numero}
                    </p>
                    <h2 className="text-2xl font-bold">{etapa.titulo}</h2>
                  </div>
                </div>

                <p className="mb-2 italic" style={{ color: 'var(--ffv-muted)' }}>
                  {etapa.pergunta}
                </p>
                <p className="mb-5">
                  <strong>Ao terminar:</strong> {etapa.resultado}
                </p>

                <ul className="space-y-2">
                  {principais.map((t, i) => (
                    <li key={t.id}>
                      <Link
                        href={t.href ?? '/explorar'}
                        className="flex items-baseline gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--ffv-bg2)]"
                        style={{ border: '1px solid var(--ffv-border)' }}
                      >
                        <span
                          className="text-xs font-mono shrink-0"
                          style={{ color: 'var(--ffv-muted)' }}
                        >
                          {etapa.numero}.{i + 1}
                        </span>
                        <span>
                          <span className="font-semibold">{t.name}</span>{' '}
                          <span className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                            · {t.modules.length} módulos
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {opcionais.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm mb-2" style={{ color: 'var(--ffv-muted)' }}>
                      Aprofundamentos desta etapa — não bloqueiam a etapa seguinte:
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {opcionais.map(t => (
                        <li key={t.id}>
                          <Link
                            href={t.href ?? '/explorar'}
                            className="inline-block text-sm px-3 py-1.5 rounded-full transition-colors hover:bg-[var(--ffv-bg2)]"
                            style={{ border: '1px solid var(--ffv-border)' }}
                          >
                            {t.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
