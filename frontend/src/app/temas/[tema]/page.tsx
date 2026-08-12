import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { safeJsonLd } from '@/lib/safe-json';
import {
  MINIMO_PARA_PAGINA,
  TEMAS,
  getTema,
  getTemaModules,
  getTemaStats,
  type Tema,
} from '@/lib/curriculum/temas';
import { PERGUNTAS_POR_TEMA } from '@/lib/curriculum/temas-perguntas';
import { getTrailHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/**
 * `/temas/<tema>` — a página de assunto.
 *
 * ## Por que ela existe
 *
 * O estudo de 1.094 categorias em ChatGPT mede presença por TÓPICO, não por
 * página. Sem uma URL que represente o tópico, não há o que a busca associe ao
 * assunto inteiro — só 415 artigos soltos, cada um respondendo uma pergunta.
 *
 * ## Por que só temas com 3+ módulos
 *
 * `generateStaticParams` filtra por `MINIMO_PARA_PAGINA`. Tema com um ou dois
 * módulos geraria página fina, e página fina dilui o domínio em vez de somar. Os
 * temas abaixo do limiar aparecem em `/temas` com a contagem à vista — a lacuna
 * fica visível no produto em vez de escondida numa planilha.
 */

/** Temas publicáveis. Uma única definição, usada por params e por metadata. */
function temasPublicados(): Tema[] {
  return TEMAS.filter(t => getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA);
}

export function generateStaticParams() {
  return temasPublicados().map(t => ({ tema: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tema: string }>;
}): Promise<Metadata> {
  const { tema: slug } = await params;
  const tema = getTema(slug);
  if (!tema) return { title: 'Tema não encontrado' };

  const stats = getTemaStats(tema.id);
  return {
    title: `${tema.name} — ${stats.modules} módulos`,
    // A descrição é a `tagline` escrita à mão, não texto montado por máquina. A
    // auditoria de ago/2026 encontrou descrição gerada vazando identificador
    // interno ("na trilha trail1"); o remédio foi parar de montar descrição.
    description: `${tema.tagline} ${stats.modules} módulos em ${stats.trails} trilhas, ${Math.round(stats.minutes / 60)} horas de conteúdo gratuito em português.`,
    keywords: `${tema.name.toLowerCase()}, ${tema.slug.replace(/-/g, ' ')}, curso ${tema.name.toLowerCase()} português, ffv academy`,
    alternates: { canonical: `${BASE}/temas/${tema.slug}` },
    ...social({
      titulo: `${tema.name} — FFV Academy`,
      descricao: tema.tagline,
      caminho: `/temas/${tema.slug}`,
    }),
  };
}

export default async function TemaPage({ params }: { params: Promise<{ tema: string }> }) {
  const { tema: slug } = await params;
  const tema = getTema(slug);
  if (!tema) notFound();

  const itens = getTemaModules(tema.id);
  if (itens.length < MINIMO_PARA_PAGINA) notFound();

  const stats = getTemaStats(tema.id);

  /** Módulos agrupados por trilha, preservando a ordem do currículo. */
  const porTrilha = itens.reduce<{ id: string; name: string; color: string; icon: string; modules: typeof itens }[]>(
    (acc, item) => {
      const ultimo = acc.at(-1);
      if (ultimo?.id === item.trilha.id) {
        ultimo.modules.push(item);
        return acc;
      }
      acc.push({
        id: item.trilha.id,
        name: item.trilha.name,
        color: item.trilha.color,
        icon: item.trilha.icon,
        modules: [item],
      });
      return acc;
    },
    [],
  );

  const colecaoLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tema.name} — FFV Academy`,
    description: tema.tagline,
    url: `${BASE}/temas/${tema.slug}`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itens.length,
      itemListElement: itens.map(({ modulo }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: modulo.title,
        url: `${BASE}/aprenda/${modulo.slug}`,
      })),
    },
  };

  const migalhaLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FFV Academy', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Temas', item: `${BASE}/temas` },
      { '@type': 'ListItem', position: 3, name: tema.name, item: `${BASE}/temas/${tema.slug}` },
    ],
  };

  const perguntas = PERGUNTAS_POR_TEMA[tema.id] ?? [];

  const outros = TEMAS.filter(
    t => t.id !== tema.id && getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA,
  ).slice(0, 8);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(colecaoLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(migalhaLd) }} />

      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 30% 0%, color-mix(in srgb, ${tema.color} 16%, transparent) 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-xs mb-6"
            style={{ color: 'var(--ffv-muted)' }}
            aria-label="Migalha de pão"
          >
            <Link href="/" className="transition-colors hover:underline">FFV Academy</Link>
            <span aria-hidden>/</span>
            <Link href="/temas" className="transition-colors hover:underline">Temas</Link>
            <span aria-hidden>/</span>
            <span style={{ color: 'var(--foreground)' }}>{tema.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden style={{ fontSize: 34 }}>{tema.icon}</span>
            <h1
              style={{
                fontSize: 'clamp(1.7rem, 4.4vw, 2.7rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
              }}
            >
              {tema.name}
            </h1>
          </div>

          <p className="text-base md:text-lg mb-6" style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>
            {tema.tagline}
          </p>
          <p className="text-sm md:text-base mb-8" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
            {tema.desc}
          </p>

          <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
            <div>
              <dt style={{ color: 'var(--ffv-muted)' }}>Módulos</dt>
              <dd className="text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>{stats.modules}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--ffv-muted)' }}>Trilhas</dt>
              <dd className="text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>{stats.trails}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--ffv-muted)' }}>Horas</dt>
              <dd className="text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>{Math.round(stats.minutes / 60)}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--ffv-muted)' }}>XP</dt>
              <dd className="text-lg font-bold ffv-acento-texto" style={{ '--ffv-acento': tema.color } as React.CSSProperties}>{stats.xp}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-1">Módulos deste tema</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--ffv-muted)' }}>
            Agrupados pela trilha de origem — o tema atravessa {stats.trails}{' '}
            {stats.trails === 1 ? 'trilha' : 'trilhas'}.
          </p>

          {porTrilha.map(trilha => (
            <div key={`${trilha.id}-${trilha.modules[0].modulo.slug}`} className="mb-9">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <span aria-hidden>{trilha.icon}</span>
                <Link
                  href={getTrailHref(trilha.id)}
                  className="transition-colors hover:underline ffv-acento-texto"
                  style={{ '--ffv-acento': trilha.color } as React.CSSProperties}
                >
                  {trilha.name}
                </Link>
              </h3>
              <ul className="grid gap-2">
                {trilha.modules.map(({ modulo }) => (
                  <li key={modulo.slug}>
                    <Link
                      href={`/aprenda/${modulo.slug}`}
                      className="flex items-start gap-3 rounded-lg p-3 transition-colors"
                      style={{ border: '1px solid var(--ffv-border)', background: 'var(--ffv-surface)' }}
                    >
                      <span aria-hidden style={{ fontSize: 18, lineHeight: 1.3 }}>{modulo.icon}</span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-medium mb-0.5">{modulo.title}</span>
                        <span className="block text-[12px]" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
                          {modulo.desc}
                        </span>
                        <span className="block text-[11px] font-mono mt-1.5" style={{ color: 'var(--ffv-muted)' }}>
                          {modulo.readTime} min · {modulo.xp} XP
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {perguntas.length > 0 && (
        <section className="px-6 pb-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-1">Perguntas frequentes</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--ffv-muted)' }}>
              As consultas de maior intenção deste tema, respondidas aqui.
            </p>
            {/*
              A pergunta é `<h3>` e a resposta vem imediatamente abaixo,
              começando pela conclusão. É o formato que buscador e resumo de IA
              citam — e o motivo de não haver marcação de FAQ: o resultado
              enriquecido de FAQ saiu do Google em maio de 2026. O que faz efeito
              é a estrutura do HTML, e ela está aqui.
            */}
            <div className="grid gap-7">
              {perguntas.map(p => (
                <div key={p.q}>
                  <h3 className="text-[15px] font-semibold mb-2">{p.q}</h3>
                  <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
                    {p.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-base font-semibold mb-4">Outros temas</h2>
          <ul className="flex flex-wrap gap-2">
            {outros.map(t => (
              <li key={t.id}>
                <Link
                  href={`/temas/${t.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors"
                  style={{ border: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}
                >
                  <span aria-hidden>{t.icon}</span>
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
