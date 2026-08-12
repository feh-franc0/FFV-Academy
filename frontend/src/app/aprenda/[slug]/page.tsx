/**
 * Rota dinâmica CMS-driven que substitui as 765 page.tsx estáticas que
 * viviam em src/app/aprenda-legacy/<slug>/page.tsx.
 *
 * Todos os módulos agora vêm do banco via GET /api/v1/curriculum/:slug/blocks
 * e são renderizados pelo BlockRenderer usando os mesmos primitives.
 *
 * `output: export` + `generateStaticParams` = no build, Next.js itera por
 * todos os slugs publicados e gera 1 HTML estático por rota. Em produção,
 * o servidor entrega só HTML pré-gerado (rápido + SEO perfeito).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchArticleWithBlocksResult } from '@/lib/curriculum-api';
import { fetchArticleFromSeeds } from '@/lib/curriculum-local';
import { BlockTree } from '@/components/article/BlockRenderer';
import { ViewTracker } from '@/components/article/ViewTracker';
import { ConcluirModulo } from '@/components/article/ConcluirModulo';
import { ConteudoIndisponivel } from '@/components/article/ConteudoIndisponivel';
import type { ArticleWithBlocks } from '@/components/article/blocks/schemas';
import { CommentSection } from '@/components/comments/CommentSection';
import { NextSteps } from '@/components/article/NextSteps';
import { Prerequisites } from '@/components/article/Prerequisites';
import { ArticleToc } from '@/components/article/ArticleToc';
import { MobileToc } from '@/components/article/MobileToc';
import { TrailLeaderboard } from '@/components/ranking/TrailLeaderboard';
import { AnkiExport } from '@/components/article/AnkiExport';
import { TrailCertificateBanner } from '@/components/TrailCertificateBanner';
import { extrairQuizzes, extractQA } from '@/lib/article-extract';

interface PageProps {
  params: Promise<{ slug: string }>;
}

import {
  CURRICULUM,
  HUBS,
  getModuleBySlug,
  getTrailForModule,
  getTrailHref,
  getModuleNextSteps,
  getModulePrerequisites,
} from '@/lib/curriculum';
import { ArticleJsonLd, type QuizParaLd } from '@/components/article/ArticleJsonLd';
import {
  MINIMO_PARA_PAGINA,
  getTemaStats,
  getTemasDoModulo,
} from '@/lib/curriculum/temas';
import { getSeoDescription } from '@/lib/seo-descriptions';

/**
 * Slugs de fallback — extraídos do CURRICULUM constant local.
 *
 * Por que: em CI (`npm run build` sem NEXT_PUBLIC_API_BASE_URL setado),
 * o backend está fora. Sem fallback, generateStaticParams retornaria []
 * e Next.js 16 com `output: export` rejeita a build inteira.
 *
 * Os 765+ slugs estão na fonte de verdade `src/lib/curriculum.ts`,
 * que continua sendo o índice de metadados do frontend. O conteúdo
 * vem do backend em runtime via fetchArticleWithBlocks.
 */
function fallbackSlugs(): Array<{ slug: string }> {
  return CURRICULUM.flatMap(t => t.modules.map(m => ({ slug: m.slug })));
}

// Pré-gera 1 HTML por slug publicado no banco.
// Backend tem cap de 100/página — paginamos até pegar todos.
export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  if (!apiBase) {
    // CI / dev sem backend: usa CURRICULUM local como fonte de slugs.
    // O conteúdo de cada página vem do backend em runtime, mas a LISTA
    // de slugs estática é suficiente pra Next.js gerar HTML placeholder.
    return fallbackSlugs();
  }
  try {
    const all: Array<{ slug: string }> = [];
    let offset = 0;
    const pageSize = 100;
    // Safety brake em 50 páginas = 5000 slugs
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${apiBase}/api/v1/curriculum?limit=${pageSize}&offset=${offset}`, {
        cache: 'no-store',
      });
      if (!res.ok) break;
      const json = await res.json();
      const items: Array<{ slug: string }> = json.data ?? [];
      if (items.length === 0) break;
      all.push(...items);
      if (items.length < pageSize) break;
      offset += pageSize;
    }
    if (all.length === 0) {
      // Backend respondeu vazio — usa fallback pra não quebrar build.
      return fallbackSlugs();
    }
    console.info(`[aprenda/generateStaticParams] ${all.length} slugs do backend`);
    return all.map(item => ({ slug: item.slug }));
  } catch (err) {
    console.warn('[aprenda/generateStaticParams] erro, usando fallback:', err);
    return fallbackSlugs();
  }
}

// SSR Docker: slugs novos no banco que ainda não estavam no build do frontend
// são renderizados em runtime (SSR on-demand). Sem isso, qualquer artigo criado
// no admin após o último deploy do frontend daria 404 imediato — o que é o oposto
// do que faz sentido em CMS-driven com SSR.
//
// Em build estático (output: export) o valor deveria ser `false`, mas migramos
// pra `output: "standalone"` em 845eddb (15/mai/2026).
export const dynamicParams = true;

/**
 * Nível em português. O campo vem do banco em inglês, e era exibido cru — o
 * leitor de um site em português via "advanced" no cabeçalho.
 */
const NIVEL_PT: Record<string, string> = {
  foundational: 'Fundamental',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};


/**
 * Busca o artigo no backend e, em DESENVOLVIMENTO, cai para os seeds em disco
 * quando o backend não está de pé. Sem isso, /aprenda/<slug> retorna 404 em
 * máquina de dev e parece que o conteúdo não existe.
 */
type ArticleOutcome =
  | { kind: 'ok'; article: ArticleWithBlocks }
  | { kind: 'not-found' }
  | { kind: 'unavailable' };

/**
 * Distingue "não existe" de "não deu pra buscar agora" — a rota abaixo
 * responde 404 real só para o primeiro caso. Ver `curriculum-api.ts` para o
 * porquê da distinção (achado: backend fora derrubava 490 páginas em 404).
 */
async function getArticleOutcome(slug: string): Promise<ArticleOutcome> {
  const result = await fetchArticleWithBlocksResult(slug);
  if (result.status === 'ok') return { kind: 'ok', article: result.article };

  const seedArticle = await fetchArticleFromSeeds(slug);
  if (seedArticle) return { kind: 'ok', article: seedArticle };

  return result.status === 'not-found' ? { kind: 'not-found' } : { kind: 'unavailable' };
}

// Metadata para SEO — também do banco.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const outcome = await getArticleOutcome(slug);

  if (outcome.kind === 'not-found') {
    // 404 real precisa de noindex explícito — sem isso, o <meta robots> da
    // rota conflita com o status HTTP (achado: dois `<meta robots>` na
    // mesma resposta, um deles herdado do layout).
    return { title: 'Módulo não encontrado', robots: { index: false, follow: false } };
  }
  if (outcome.kind === 'unavailable') {
    // O módulo existe (ou pode existir) — só não deu pra confirmar agora.
    // Não é "não encontrado", mas também não é uma página pronta pra indexar.
    const meta = getModuleBySlug(slug);
    return {
      title: meta?.title ?? 'Conteúdo indisponível',
      description: 'Este conteúdo está temporariamente indisponível.',
      robots: { index: false, follow: true },
    };
  }
  const article = outcome.article;

  const modulo = getModuleBySlug(slug);

  /**
   * Dois defeitos que estavam em todas as 388 páginas de artigo — a rota de
   * maior tráfego da plataforma:
   *
   * 1. TÍTULO DUPLICADO. Era `${article.title} — FFV Academy`, e o layout raiz
   *    aplica o template '%s — FFV Academy' por cima: a aba e o resultado do
   *    Google mostravam "Tokens e Tokenização — FFV Academy — FFV Academy".
   *
   * 2. DESCRIPTION GERADA POR MÁQUINA, COM ID INTERNO. Era "Aprenda Tokens e
   *    Tokenização na trilha trail1 do hub hub-ia." — `trail1` e `hub-ia`
   *    aparecendo no snippet de busca. E os 415 `seoDesc` escritos à mão eram
   *    ignorados. O de tokens, por exemplo, já existia: "O que são tokens em IA,
   *    como funciona tokenização BPE, por que contexto é medido em tokens e como
   *    isso afeta o custo."
   */
  const description =
    getSeoDescription(slug) ??
    modulo?.desc ??
    `${article.title} — módulo da FFV Academy, escola de engenharia para a era da IA.`;

  return {
    title: article.title,
    description,
    keywords: modulo?.keywords,
    // SEM barra final. O servidor não usa `trailingSlash`, então `/aprenda/x/`
    // responde 308 para `/aprenda/x` — e canônica apontando para redirect é
    // sinal conflitante: o buscador descarta a declaração e escolhe sozinho.
    // Eram 415 páginas entregando essa decisão de graça.
    alternates: { canonical: `/aprenda/${slug}` },
    openGraph: {
      // aqui o título completo é o certo: rede social não aplica template
      title: `${article.title} — FFV Academy`,
      description,
      url: `/aprenda/${slug}`,
      type: 'article',
      siteName: 'FFV Academy',
      locale: 'pt_BR',
      /**
       * TERCEIRO defeito desta rota, achado lendo o `<head>` SERVIDO em
       * 05/ago/2026: não saía `og:image` nenhum nas 426 páginas.
       *
       * Declarar o objeto `openGraph` sem `images` não faz a imagem da
       * convenção do segmento raiz virar `og:image` — só o `twitter:image` do
       * layout raiz sobrevivia, e ele serve ao X e a mais nada. Facebook,
       * LinkedIn, WhatsApp, Slack, Telegram e Discord leem `og:image`: todo
       * link de módulo compartilhado neles aparecia sem imagem.
       *
       * Apontar explicitamente é determinístico. A imagem é gerada por
       * `opengraph-image.tsx` nesta mesma pasta, com o título do módulo.
       */
      images: [{
        url: `/aprenda/${slug}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: article.title,
      }],
    },
    /**
     * QUARTO defeito: `twitter:title` e `twitter:description` vinham do layout
     * raiz — "FFV Academy — Escola de Engenharia para a Era da IA" — em TODAS as
     * 426 páginas. Quem compartilhava um módulo no X anunciava o site, não o
     * módulo. `twitter` não herda de `openGraph`: precisa ser declarado.
     */
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} — FFV Academy`,
      description,
      images: [`/aprenda/${slug}/opengraph-image`],
    },
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const outcome = await getArticleOutcome(slug);

  if (outcome.kind === 'not-found') {
    notFound();
  }

  if (outcome.kind === 'unavailable') {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const meta = CURRICULUM.flatMap(t =>
      t.modules.map(m => ({ ...m, trailId: t.id })),
    ).find(m => m.slug === slug);

    if (!apiBase) {
      // Sem backend configurado (CI/build local) — não é uma indisponibilidade
      // temporária real, então "tentar novamente" não faria sentido. Renderiza
      // placeholder rico com a metadata do CURRICULUM local pra ter title +
      // hub + trail + xp reais (E2E precisa de um <h1> real pra validar nav).
      if (meta) {
        return (
          <article className="max-w-3xl mx-auto px-6 py-12">
            <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
              <div className="flex gap-2 mb-2 text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                <span>{meta.trailId}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{meta.title}</h1>
              <div className="flex gap-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
                <span>⏱ {meta.readTime ?? 5} min</span>
                <span>·</span>
                <span>⭐ {meta.xp ?? 10} XP</span>
              </div>
            </header>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
              Conteúdo deste módulo será carregado do CMS quando o backend estiver disponível.
            </p>
          </article>
        );
      }
      return (
        <article className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-3">Módulo: {slug}</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Conteúdo será carregado do backend quando disponível.
          </p>
        </article>
      );
    }

    // Backend CONFIGURADO mas a consulta falhou agora (rede, 5xx, payload
    // inválido) — indisponibilidade real, não ausência de conteúdo. Achado
    // #5: sem esta distinção, o backend fora derrubava as 490 páginas de
    // módulo em 404, e o rastreador de busca via "esta página não existe".
    return <ConteudoIndisponivel title={meta?.title} />;
  }

  const article = outcome.article;

  /**
   * Dados estruturados: delegados a `ArticleJsonLd`.
   *
   * O bloco que ficava aqui era mais pobre e tinha um defeito — a `description`
   * era montada como `Aprenda X na trilha trail1 (hub hub-ia)`, com os
   * IDENTIFICADORES INTERNOS. O `generateMetadata` acima já usava as descrições
   * escritas à mão; o JSON-LD, que é a declaração da página sobre si mesma para
   * o buscador, tinha ficado para trás. Existia até um componente correto no
   * repositório, nunca importado.
   */
  const modulo = getModuleBySlug(slug);
  const trilha = getTrailForModule(slug);
  const hub = trilha ? HUBS.find(h => h.trailIds.includes(trilha.id)) : undefined;
  // Calculado aqui (servidor) e passado como prop — `NextSteps` não chama mais
  // `getModuleNextSteps` no cliente, o que evitava arrastar `CURRICULUM`
  // completo para o bundle de TODA página de artigo.
  const proximosPassos = getModuleNextSteps(slug);
  // Mesmo padrão para `Prerequisites` (religado em 12/ago/2026 — ver o
  // componente para o achado). `completedSlugs=[]` porque o servidor não tem
  // acesso ao GameState (localStorage); o componente recomputa `completed` no
  // cliente a partir do estado real do leitor.
  const prerequisitos = getModulePrerequisites(slug, []);
  // Extraídos aqui (servidor) e passados já prontos para `ConcluirModulo` e
  // `AnkiExport` — que antes recebiam `article.blocks` inteiro (a árvore do
  // artigo) só para rodar esta mesma extração no cliente. Como os dois são
  // `'use client'`, isso duplicava o conteúdo do módulo no payload RSC — e é
  // fatia direta do 61% de payload RSC medido nas páginas `lab-*`.
  const quizzesParaConcluir = extrairQuizzes(article.blocks);
  const itemsAnki = extractQA(article.blocks);
  const descricao =
    getSeoDescription(slug) ??
    modulo?.desc ??
    `${article.title} — módulo da FFV Academy, escola de engenharia para a era da IA.`;

  // As perguntas do módulo, achatadas da árvore de blocos. Elas são visíveis na
  // página e cada uma vira carta de revisão espaçada — declará-las como
  // flashcard descreve o que existe, não uma promessa.
  const quizzes: QuizParaLd[] = [];
  const colher = (bs: typeof article.blocks) => {
    for (const b of bs) {
      if (b.type === 'quiz') {
        const d = b.data as { question?: string; options?: string[]; correctIndex?: number; explanation?: string };
        if (d?.question && Array.isArray(d.options) && typeof d.correctIndex === 'number') {
          quizzes.push({
            question: d.question,
            options: d.options,
            correctIndex: d.correctIndex,
            explanation: d.explanation,
          });
        }
      }
      if (b.children?.length) colher(b.children);
    }
  };
  colher(article.blocks);

  const temasDoModulo = getTemasDoModulo(slug).filter(
    t => getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA,
  );

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <ArticleJsonLd
        title={article.title}
        description={descricao}
        slug={slug}
        readTime={article.read_time}
        datePublished={article.updated_at}
        dateModified={article.updated_at}
        educationalLevel={article.difficulty}
        trailName={trilha?.name}
        trailHref={trilha ? getTrailHref(trilha.id) : undefined}
        hubName={hub?.name}
        hubHref={hub?.href}
        quizzes={quizzes}
      />
      {/*
        Trilha de navegação com NOMES, e navegável.
        Ela mostrava `hub-engenharia · trail10 · advanced` — identificadores de
        banco e o nível em inglês, nas 415 páginas de módulo. Era o que o leitor
        via e o que o buscador indexava, no lugar mais visível da página, logo
        acima do título. Agora são os nomes reais, com link, e o `nav` casa com a
        BreadcrumbList declarada em JSON-LD: o que o buscador lê e o que a pessoa
        vê passam a ser a mesma coisa.
      */}
      <header className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <nav aria-label="Você está em" className="mb-2">
          <ol className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            {hub?.href && hub.name && (
              <li>
                <Link href={hub.href} style={{ color: 'inherit' }}>{hub.name}</Link>
              </li>
            )}
            {trilha && (
              <>
                <li aria-hidden="true">·</li>
                <li>
                  <Link href={getTrailHref(trilha.id)} style={{ color: 'inherit' }}>{trilha.name}</Link>
                </li>
              </>
            )}
            <li aria-hidden="true">·</li>
            <li>{NIVEL_PT[article.difficulty] ?? article.difficulty}</li>
          </ol>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
        <div className="flex gap-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
          <span>⏱ {article.read_time} min</span>
          <span>·</span>
          <span>⭐ {article.xp} XP</span>
        </div>
        {/*
          `objetivo` — resultado, não conteúdo (achado da auditoria
          pedagógica de 12/ago/2026: 96% dos `desc` listavam conteúdo).
          Campo opcional e ainda raro (38 de 490 módulos, os de entrada de
          cada trilha — ver `validate_cobertura_objetivo.py`); some quando
          ausente, não deixa vazio no lugar.
        */}
        {modulo?.objetivo && (
          <p
            className="mt-4 text-sm"
            style={{ color: 'var(--foreground)' }}
          >
            <strong style={{ color: trilha?.color ?? 'var(--ffv-blue)' }}>Ao terminar: </strong>
            {modulo.objetivo}
          </p>
        )}
      </header>

      {/*
        Sumário do artigo — religado em 12/ago/2026 (auditoria pedagógica).
        `ArticleToc`/`MobileToc` existiam prontos desde o `ModuleLayout` legado
        (que a rota CMS-driven substituiu) e ficaram órfãos: nenhuma rota os
        importava. Medido: HTML servido de módulo típico tem mediana de 19
        headings (h2+h3) e até 45, sem nenhum sumário — 490 de 490 páginas.
        `containerSelector` mira o wrapper marcado `data-article-content`
        abaixo; a posição flutuante replica a matemática do layout legado
        (coluna central 768px = `max-w-3xl`, sumário à direita dela).
      */}
      <aside
        className="hidden xl:block"
        style={{
          position: 'fixed',
          top: 80,
          right: 'max(24px, calc((100vw - 768px) / 2 - 260px))',
          width: 220,
          zIndex: 10,
        }}
      >
        <ArticleToc containerSelector="[data-article-content]" accent={trilha?.color} />
      </aside>
      <MobileToc containerSelector="[data-article-content]" accent={trilha?.color} />

      {/*
        Pré-requisitos — religado em 12/ago/2026 (mesma auditoria). 364 de 490
        módulos (74%) declaram `prerequisites`, mas o dado só chegava ao
        JSON-LD (`coursePrerequisites`); a tela nunca mostrava. Antes do
        conteúdo, de propósito: é o que o leitor precisa saber ANTES de ler,
        não depois.
      */}
      <Prerequisites prereqs={prerequisitos} accent={trilha?.color} />

      <article className="prose prose-invert max-w-none" data-article-content>
        <BlockTree blocks={article.blocks} />
      </article>

      <ViewTracker slug={slug} hubId={article.hub_id} trailId={article.trail_id} />

      {/*
        Fecha o laço de gamificação, que estava desconectado desta rota:
        `markComplete` só era chamado pelo ModuleLayout legado, então ler qualquer
        um dos 393 módulos não dava XP, não movia streak e — o mais grave — não
        criava nenhum card de revisão espaçada, porque `addCardsFromQuiz` é a única
        fonte de cards. O SM-2 nunca recebia material.
      */}
      <ConcluirModulo
        slug={slug}
        title={article.title}
        readTime={article.read_time ?? 5}
        trail={trilha}
        quizzes={quizzesParaConcluir}
      />

      <TrailCertificateBanner trail={trilha} />

      <div className="mt-8 flex justify-end">
        <AnkiExport slug={slug} title={article.title} items={itemsAnki} />
      </div>

      <NextSteps steps={proximosPassos} />

      {/*
        Temas do módulo — o eixo de assunto, transversal a hub e trilha.
        Cada módulo passa a linkar para as páginas de tema a que pertence, o que
        dá ao assunto uma URL que a busca pode associar ao conjunto em vez de a
        415 artigos soltos. Só entra tema publicado: `MINIMO_PARA_PAGINA` é o
        mesmo limiar de `generateStaticParams`, e chip que aponta para rota não
        gerada é 404 com aparência de navegação.
      */}
      {temasDoModulo.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Temas deste módulo
          </h2>
          <ul className="flex flex-wrap gap-2">
            {temasDoModulo.map(t => (
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
        </section>
      )}

      <section className="mt-12">
        <TrailLeaderboard trailId={article.trail_id} />
      </section>

      <section className="mt-12">
        <CommentSection targetType="article" targetId={slug} />
      </section>
    </article>
  );
}
