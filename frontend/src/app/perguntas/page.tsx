import type { Metadata } from 'next';
import Link from 'next/link';

import { safeJsonLd } from '@/lib/safe-json';
import { BASE_URL, REF } from '@/lib/site-jsonld';
import { MINIMO_PARA_PAGINA, TEMAS, getTemaStats } from '@/lib/curriculum/temas';
import { PERGUNTAS_POR_TEMA } from '@/lib/curriculum/temas-perguntas';
import indice from '@/lib/perguntas-respondidas.json';
import { social } from '@/lib/metadata-social';

/**
 * `/perguntas` — o hub de conhecimento.
 *
 * ## O que ela resolve
 *
 * A plataforma responde centenas de perguntas por escrito — nas páginas de tema e
 * dentro dos módulos. Espalhadas por dezenas de URLs, elas não somam: não há lugar
 * que diga "isto é o conjunto do que esta escola explica". O total não está
 * escrito aqui de propósito, porque ele cresce a cada lote de conteúdo; a página
 * o calcula, e `perguntas-respondidas.json` é regerado pelo mesmo script que
 * mantém a fila de trabalho.
 *
 * Esta página é esse lugar, e faz três trabalhos ao mesmo tempo:
 *
 *  1. **Para quem chega da busca:** uma pergunta encontrada aqui leva direto à
 *     resposta, sem passar por navegação de trilha.
 *  2. **Para o rastreador:** um link interno por pergunta, com o texto da pergunta
 *     como âncora. Âncora descritiva é o sinal mais barato e mais ignorado de
 *     todos — "clique aqui" não diz nada, a pergunta inteira diz tudo.
 *  3. **Para o assistente de IA:** uma URL que enumera o escopo do que o site
 *     cobre, agrupado por assunto.
 *
 * ## Por que não repete as respostas
 *
 * Repetir os textos aqui criaria duas URLs com o mesmo conteúdo competindo pela
 * mesma consulta — e a que perdesse não desapareceria, só diluiria a outra. O hub
 * lista e encaminha; a resposta mora em um lugar só.
 *
 * As perguntas de módulo vêm de `perguntas-respondidas.json`, GERADO por
 * `scripts/seo/gerar_corpus.py` a partir dos seeds. Seed não é legível em runtime
 * — fica fora do contexto de build do Docker —, mesma razão do
 * `content-manifest.json`.
 */

export const metadata: Metadata = {
  title: 'Perguntas sobre IA, AWS e engenharia — respondidas',
  description:
    'As perguntas que engenheiros fazem sobre IA, agentes, RAG, avaliação, custo de LLM, ' +
    'segurança, Bedrock, certificação AWS e Claude Code — cada uma respondida por escrito, ' +
    'em português, de graça.',
  keywords:
    'perguntas sobre ia, duvidas de inteligencia artificial, faq ia, o que é rag, ' +
    'quando usar agente, custo de llm, certificacao aws duvidas, claude code perguntas',
  alternates: { canonical: `${BASE_URL}/perguntas` },
  ...social({
    titulo: 'Perguntas sobre IA, AWS e engenharia — FFV Academy',
    descricao: 'O hub de conhecimento da FFV Academy: cada pergunta com resposta escrita, agrupada por tema.',
    caminho: '/perguntas',
  }),
};

interface Item {
  q: string;
  href: string;
  onde: string;
}

/** Perguntas por tema: as das páginas de tema primeiro, depois as dos módulos. */
function porTema(): { tema: (typeof TEMAS)[number]; itens: Item[] }[] {
  const deModulo = new Map<string, Item[]>();
  for (const p of indice.perguntas) {
    const lista = deModulo.get(p.tema) ?? [];
    lista.push({ q: p.q, href: `/aprenda/${p.slug}`, onde: p.modulo });
    deModulo.set(p.tema, lista);
  }

  return TEMAS.map(tema => {
    const publicado = getTemaStats(tema.id).modules >= MINIMO_PARA_PAGINA;
    const doTema = publicado
      ? (PERGUNTAS_POR_TEMA[tema.id] ?? []).map(p => ({
          q: p.q,
          href: `/temas/${tema.slug}`,
          onde: tema.name,
        }))
      : [];
    return { tema, itens: [...doTema, ...(deModulo.get(tema.id) ?? [])] };
  })
    .filter(g => g.itens.length > 0)
    .sort((a, b) => b.itens.length - a.itens.length);
}

export default function PerguntasPage() {
  const grupos = porTema();
  const total = grupos.reduce((a, g) => a + g.itens.length, 0);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Perguntas sobre IA, AWS e engenharia — FFV Academy',
    description: 'O conjunto de perguntas que a plataforma responde por escrito, agrupado por tema.',
    url: `${BASE_URL}/perguntas`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    publisher: REF.organizacao,
    // `ItemList` das perguntas, apontando para onde cada uma é RESPONDIDA.
    // Sem `FAQPage`: o resultado enriquecido de FAQ saiu do Google em maio de
    // 2026, e a resposta não está nesta URL — declará-la aqui descreveria algo
    // que a página não tem.
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: grupos.flatMap(g => g.itens).map((i, n) => ({
        '@type': 'ListItem',
        position: n + 1,
        name: i.q,
        url: `${BASE_URL}${i.href}`,
      })),
    },
  };

  const migalha = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FFV Academy', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Perguntas', item: `${BASE_URL}/perguntas` },
    ],
  };

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(migalha) }} />

      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <nav
            className="flex items-center gap-1.5 text-xs mb-6"
            style={{ color: 'var(--ffv-muted)' }}
            aria-label="Migalha de pão"
          >
            <Link href="/" className="transition-colors hover:underline">FFV Academy</Link>
            <span aria-hidden>/</span>
            <span style={{ color: 'var(--foreground)' }}>Perguntas</span>
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
            {total} perguntas respondidas
          </h1>
          <p className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--ffv-muted)', lineHeight: 1.65 }}>
            As dúvidas que aparecem de verdade sobre IA, agentes, RAG, custo de LLM,
            segurança, AWS e Claude Code — cada uma com{' '}
            <strong style={{ color: 'var(--foreground)' }}>resposta escrita</strong>, não
            com uma promessa de curso.
          </p>
        </div>
      </section>

      <nav aria-label="Temas" className="px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <ul className="flex flex-wrap gap-2">
            {grupos.map(({ tema, itens }) => (
              <li key={tema.id}>
                <a
                  href={`#${tema.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors"
                  style={{ border: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}
                >
                  <span aria-hidden>{tema.icon}</span>
                  {tema.name}
                  <span>{itens.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {grupos.map(({ tema, itens }) => (
            <div key={tema.id} id={tema.slug} className="mb-12 scroll-mt-20">
              <div className="flex items-center gap-2 mb-1">
                <span aria-hidden style={{ fontSize: 22 }}>{tema.icon}</span>
                <h2 className="text-xl font-bold ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>
                  {tema.name}
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)' }}>
                {itens.length} {itens.length === 1 ? 'pergunta' : 'perguntas'} ·{' '}
                {getTemaStats(tema.id).modules >= MINIMO_PARA_PAGINA ? (
                  <Link href={`/temas/${tema.slug}`} className="hover:underline">
                    ver o tema
                  </Link>
                ) : (
                  'tema em produção'
                )}
              </p>
              <ul className="grid gap-1.5">
                {itens.map(i => (
                  <li key={`${i.href}-${i.q}`}>
                    {/*
                      A âncora é a PERGUNTA inteira. É o sinal mais barato e mais
                      ignorado de link interno: "clique aqui" não diz nada ao
                      rastreador, a pergunta diz exatamente sobre o que é a
                      página de destino.
                    */}
                    <div className="flex items-baseline gap-2 px-3 py-2 text-[14px] ffv-acento-texto">
                      <span aria-hidden style={{ '--ffv-acento': tema.color, opacity: 0.7 } as React.CSSProperties}>→</span>
                      <Link href={i.href} className="flex-1 transition-colors hover:underline">
                        {i.q}
                      </Link>
                      {/*
                        O nome do destino fica FORA do link, de propósito. Dentro,
                        ele entraria no texto da âncora — e a âncora deixaria de
                        ser exatamente a pergunta, que é o sinal inteiro do valor
                        desta página. A varredura pega essa regressão: ela exige
                        que exista âncora cujo texto termine em "?".
                      */}
                      <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--ffv-muted)' }}>
                        {i.onde.length > 28 ? `${i.onde.slice(0, 28)}…` : i.onde}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
