import { safeJsonLd } from '@/lib/safe-json';
import { BASE_URL, ID } from '@/lib/site-jsonld';

/**
 * Autor e editora carregam `@id` **e** os campos que o resultado enriquecido de
 * artigo exige (nome, logo). O `@id` liga ao nó declarado uma única vez no layout
 * raiz — sem ele, as 415 páginas descreviam 415 organizações homônimas. Os campos
 * continuam porque o validador de artigo os pede na própria declaração; declarar
 * os dois não é redundância, é o que faz a página passar na validação E somar ao
 * grafo.
 */
const AUTOR = {
  '@type': 'Person',
  '@id': ID.autor,
  name: 'Fernando Franco Valle',
  url: `${BASE_URL}/sobre`,
};
const EDITORA = {
  '@type': 'EducationalOrganization',
  '@id': ID.organizacao,
  name: 'FFV Academy',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/icons/icon-512.png`,
    width: 512,
    height: 512,
  },
};

/**
 * Dados estruturados da página de módulo.
 *
 * ## Por que este arquivo foi reescrito em ago/2026
 *
 * Ele existia e **nunca era importado**. A página de módulo tinha o próprio
 * JSON-LD embutido, mais pobre e com um defeito: a `description` era gerada por
 * máquina como `Aprenda X na trilha trail1 (hub hub-ia)` — com os IDENTIFICADORES
 * INTERNOS. O `generateMetadata` da mesma página já havia sido corrigido para usar
 * as descrições escritas à mão; o JSON-LD, que é o que o buscador lê como
 * declaração da própria página sobre si, ficou para trás.
 *
 * ## O que cada tipo faz aqui
 *
 * - **Article** — o básico: título, descrição, autor, editora, idioma, tempo de
 *   leitura. `author` é sinal de experiência e autoria; faltava.
 * - **BreadcrumbList** — Início → Hub → Trilha → Módulo. É resultado enriquecido
 *   suportado, e dá ao buscador a hierarquia que a URL plana `/aprenda/<slug>`
 *   não expressa.
 * - **Quiz** — a plataforma tem 1.247 perguntas com resposta e explicação, e elas
 *   são visíveis na página. Declará-las torna o conteúdo elegível ao carrossel de
 *   perguntas e respostas educacionais. A regra do Google é explícita: todas as
 *   perguntas precisam ser do tipo `Flashcard`, e é literalmente o que elas são —
 *   cada quiz vira uma carta de revisão espaçada nesta plataforma.
 *
 * ## O que deliberadamente NÃO está aqui
 *
 * **FAQPage.** O resultado enriquecido de FAQ deixou de ser exibido no Google em
 * maio de 2026 — e, antes disso, já era restrito a sites de governo e saúde.
 * Marcar FAQ aqui seria trabalho para um recurso que não existe mais. As perguntas
 * ganham visibilidade pelo caminho que funciona: cabeçalho em forma de pergunta no
 * HTML, com a resposta imediatamente abaixo.
 */

export interface QuizParaLd {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  readTime: number;
  datePublished?: string;
  dateModified?: string;
  educationalLevel?: string;
  trailName?: string;
  trailHref?: string;
  hubName?: string;
  hubHref?: string;
  quizzes?: QuizParaLd[];
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  readTime,
  datePublished = '2026-04-16',
  dateModified,
  educationalLevel,
  trailName,
  trailHref,
  hubName,
  hubHref,
  quizzes = [],
}: ArticleJsonLdProps) {
  // Sem barra final, igual à canônica declarada em `generateMetadata`. Duas
  // formas da mesma URL no mesmo HTML é o defeito que o buscador resolve
  // ignorando as duas.
  const articleUrl = `${BASE_URL}/aprenda/${slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: articleUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    author: AUTOR,
    publisher: EDITORA,
    datePublished,
    dateModified: dateModified ?? datePublished,
    timeRequired: `PT${readTime}M`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    learningResourceType: 'Article',
    ...(educationalLevel ? { educationalLevel } : {}),
    ...(trailName ? { isPartOf: { '@type': 'Course', name: trailName } } : {}),
  };

  // Início → Hub → Trilha → Módulo. Os níveis intermediários entram só quando
  // existem: trilha sem hub produziria uma posição pulada, que invalida a lista.
  const trilha: { name: string; item: string }[] = [{ name: 'FFV Academy', item: BASE_URL }];
  if (hubName && hubHref) trilha.push({ name: hubName, item: `${BASE_URL}${hubHref}` });
  if (trailName && trailHref) trilha.push({ name: trailName, item: `${BASE_URL}${trailHref}` });
  trilha.push({ name: title, item: articleUrl });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((bc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: bc.name,
      item: bc.item,
    })),
  };

  // A resposta declarada é a alternativa CORRETA, e o texto de apoio é a
  // explicação — que é a parte que ensina. Sem ela, a resposta seria uma
  // afirmação solta, e o que se quer expor é o raciocínio.
  const quizValidos = quizzes.filter(
    q => q.question && q.options[q.correctIndex],
  );

  const quizLd = quizValidos.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: `Fixando: ${title}`,
        about: { '@type': 'Thing', name: title },
        educationalAlignment: {
          '@type': 'AlignmentObject',
          alignmentType: 'educationalSubject',
          targetName: trailName ?? 'Engenharia de software e IA',
        },
        hasPart: quizValidos.map(q => ({
          '@context': 'https://schema.org',
          '@type': 'Question',
          eduQuestionType: 'Flashcard',
          learningResourceType: 'Practice problem',
          name: q.question,
          text: q.question,
          inLanguage: 'pt-BR',
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.options[q.correctIndex],
            ...(q.explanation ? { comment: { '@type': 'Comment', text: q.explanation } } : {}),
          },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      {quizLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(quizLd) }} />
      )}
    </>
  );
}
