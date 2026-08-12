'use client';
import { safeJsonLd } from '@/lib/safe-json';

import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { useGameState } from '@/hooks/useGameState';
import { Progress } from '@/components/ui/progress';
import { CURRICULUM, type Trail } from '@/lib/curriculum';

interface Props {
  trail: Trail;
}

import { TrailActions } from './TrailActions';

export function TrailBlogClient({ trail }: Props) {
  const { state, trailsProgress } = useGameState();

  const trailProgress = trailsProgress.find(t => t.id === trail.id);
  const completedModules = state?.completedModules ?? [];
  const totalXP = trail.modules.reduce((acc, m) => acc + m.xp, 0);

  /**
   * `Course` da trilha. Duas correções de semântica em ago/2026:
   *
   * 1. Os módulos estavam declarados como `hasCourseInstance`. Uma instância de
   *    curso é uma OFERTA — uma turma, com modalidade e datas —, não uma aula. O
   *    módulo é parte do programa, e o campo correto é `syllabusSections`, com
   *    `Syllabus`. Declarar aula como turma dizia ao buscador que a trilha tem
   *    cinco ofertas simultâneas, o que é falso.
   *
   * 2. `numberOfCredits` recebia a contagem de módulos. Crédito é unidade
   *    acadêmica; a plataforma não emite crédito nenhum. Removido — e a carga de
   *    trabalho, que é o que existe de verdade, entrou como `timeRequired`.
   *
   * Também passou a listar TODOS os módulos, e não os cinco primeiros: o programa
   * é o argumento da página, e cortá-lo em cinco escondia o tamanho da trilha.
   */
  const minutosTotais = trail.modules.reduce((acc, m) => acc + (m.readTime ?? 0), 0);
  const urlTrilha = trail.href
    ? `https://fernandofrancovalle.com${trail.href}`
    : 'https://fernandofrancovalle.com';

  // Nomes das trilhas que esta exige antes — `prerequisites` guarda ids.
  const prereqs = (trail.prerequisites ?? [])
    .map(id => CURRICULUM.find(t => t.id === id)?.name)
    .filter((n): n is string => Boolean(n));

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: trail.name,
    description: trail.desc,
    provider: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: 'https://fernandofrancovalle.com',
    },
    url: urlTrilha,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    educationalLevel: trail.level,
    timeRequired: `PT${minutosTotais}M`,
    // `coursePrerequisites` estava vazio até ago/2026 embora o dado exista em
    // `trail.prerequisites` desde sempre. É o campo que diz ao buscador que o
    // site tem um PERCURSO ordenado, e não uma coleção de cursos avulsos —
    // exatamente o que a jornada em `curriculum/jornada.ts` organiza.
    ...(prereqs.length ? { coursePrerequisites: prereqs } : {}),
    // A trilha seguinte na jornada. `isPartOf` amarra cada trilha ao curso
    // completo, dando ao rastreador o caminho de volta para /jornada.
    isPartOf: {
      '@type': 'Course',
      '@id': 'https://fernandofrancovalle.com/jornada#curso',
      name: 'De zero a arquiteto de soluções de IA na AWS',
      url: 'https://fernandofrancovalle.com/jornada',
    },
    // Gratuito é diferencial declarado da plataforma, e `offers` com preço zero é
    // como isso se diz de forma legível por máquina.
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      category: 'Free',
    },
    syllabusSections: trail.modules.map((m, i) => ({
      '@type': 'Syllabus',
      position: i + 1,
      name: m.title,
      url: `https://fernandofrancovalle.com/aprenda/${m.slug}/`,
      ...(m.readTime ? { timeRequired: `PT${m.readTime}M` } : {}),
    })),
  };

  // A migalha visual existia desde sempre; a legível por máquina não. Sem ela o
  // buscador não sabe que a trilha está sob um hub, e a linha de contexto no
  // resultado de busca sai como URL crua.
  const migalhaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FFV Academy', item: 'https://fernandofrancovalle.com' },
      { '@type': 'ListItem', position: 2, name: 'A jornada', item: 'https://fernandofrancovalle.com/jornada' },
      { '@type': 'ListItem', position: 3, name: trail.name, item: urlTrilha },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(migalhaJsonLd) }} />

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs pt-10 mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" className="inline-flex items-center min-h-[24px] hover:text-white transition-colors">FFV Academy</Link>
        <span>/</span>
        {/* `ffv-acento-texto` em todo texto que usa cor de trilha: a paleta é dark
            e falha WCAG AA como texto em tema claro. Medido em 07/ago/2026 nesta
            página: 5 nós entre 2,12:1 e 2,26:1. Ver globals.css. */}
        <span className="ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>{trail.name}</span>
      </nav>

      {/* ── Header do blog ── */}
      <header className="pb-10" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${trail.color}15`, border: `1px solid ${trail.color}25` }}
          >
            {trail.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>
              Blog
            </p>
            <h1 className="text-xl font-bold">{trail.name}</h1>
          </div>
        </div>

        {/**
         * O parágrafo de abertura vem do DADO da trilha, não do código.
         *
         * Aqui havia dois textos escritos no componente, escolhidos por
         * `trail.id === 'trail1'`. Consequência medida em 06/ago/2026: as outras
         * **39 trilhas** caíam no `else` e mostravam todas o mesmo parágrafo —
         * "Para quem já sabe o básico… memória, roteamento, ferramentas, agentes" —
         * que não descreve nenhuma delas, e menos ainda as certificações AWS, o
         * Postgres Internals ou o Go.
         *
         * Dois danos ao mesmo tempo: o leitor lia uma promessa que a trilha não
         * cumpria, e 39 páginas de prioridade 0,9 no sitemap compartilhavam o
         * primeiro parágrafo de texto — sinal de conteúdo duplicado justamente nas
         * páginas que mais importam.
         *
         * O mais revelador: a linha 47 deste arquivo JÁ usava `trail.desc` para a
         * descrição do `Course` em JSON-LD. O rastreador recebia o texto certo e
         * específico; só o humano recebia o genérico.
         */}
        <p className="text-sm leading-7 mb-6" style={{ color: 'var(--ffv-muted)' }}>
          {trail.desc}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div>
            <span className="font-bold ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>{trail.modules.length}</span>
            <span className="ml-1" style={{ color: 'var(--ffv-muted)' }}>artigos</span>
          </div>
          <div>
            <span className="font-bold ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>{totalXP}</span>
            <span className="ml-1" style={{ color: 'var(--ffv-muted)' }}>XP total</span>
          </div>
          {trailProgress && trailProgress.done > 0 && (
            <div className="flex items-center gap-2 flex-1 min-w-32">
              <Progress value={trailProgress.pct} className="h-1.5 flex-1" />
              <span className="text-xs tabular-nums ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>
                {trailProgress.done}/{trail.modules.length}
              </span>
            </div>
          )}
        </div>

        <TrailActions trail={trail} />
      </header>

      {/* ── Lista de artigos ── */}
      <div className="mt-2">
        {trail.modules.map((mod, idx) => {
          const isCompleted = completedModules.includes(mod.slug);
          const quizScore = state?.quizScores[mod.slug];

          return (
            <Link
              key={mod.slug}
              href={`/aprenda/${mod.slug}`}
              className="group flex items-start gap-4 py-6 transition-all"
              style={{ borderBottom: '1px solid var(--ffv-border)' }}
            >
              {/* Número / check */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-all group-hover:scale-105"
                style={{
                  background: isCompleted ? `${trail.color}18` : 'var(--ffv-bg2)',
                  border: `1px solid ${isCompleted ? trail.color + '40' : 'var(--ffv-border)'}`,
                  color: isCompleted ? trail.color : 'var(--ffv-muted)',
                }}
              >
                {isCompleted ? '✓' : String(idx + 1).padStart(2, '0')}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <h2
                  className="font-semibold text-sm leading-snug transition-colors group-hover:text-white"
                  style={{ color: isCompleted ? 'var(--ffv-muted)' : 'var(--foreground)' }}
                >
                  {mod.icon} {mod.title}
                  {isCompleted && (
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--ffv-green)' }}>
                      lido
                    </span>
                  )}
                </h2>
                <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--ffv-muted)' }}>
                  {mod.desc}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    ⏱ {mod.readTime} min
                  </span>
                  <span aria-hidden="true" style={{ color: 'var(--ffv-muted)' }}>·</span>
                  <span
                    className="text-xs font-semibold ffv-acento-texto"
                    style={{ '--ffv-acento': trail.color } as React.CSSProperties}
                  >
                    +{mod.xp} XP
                  </span>
                  {quizScore && (
                    <>
                      <span aria-hidden="true" style={{ color: 'var(--ffv-muted)' }}>·</span>
                      <span className="text-xs" style={{ color: quizScore.perfect ? 'var(--ffv-green)' : 'var(--ffv-muted)' }}>
                        {quizScore.perfect ? '🎯' : '📝'} Quiz {quizScore.score}/{quizScore.total}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Seta. O axe não a acusa porque ela nasce com `opacity-0`, mas
                  quem passa o mouse vê o mesmo contraste ruim — a regra vale pelo
                  que fica na tela, não pelo que o medidor alcança. */}
              <span
                className="text-sm mt-1 flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 ffv-acento-texto"
                style={{ '--ffv-acento': trail.color } as React.CSSProperties}
              >
                →
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Footer do blog ── */}
      <div className="mt-12 pt-8 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <BackButton href="/" className="inline-flex items-center gap-1.5 py-1 text-xs transition-colors hover:text-white">
          Voltar à home
        </BackButton>
        {trail.id === 'trail1' && (
          <Link
            href="/ia-alem-do-llm"
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--ffv-purple)' }}
          >
            Ver também: IA Além do LLM 🏗️
          </Link>
        )}
        {trail.id === 'trail2' && (
          <Link
            href="/fundamentos-da-ia"
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--ffv-blue)' }}
          >
            Ver também: Fundamentos da IA 🧠
          </Link>
        )}
      </div>
    </div>
  );
}
