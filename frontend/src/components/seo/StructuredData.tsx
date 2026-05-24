/**
 * StructuredData — JSON-LD pra Schema.org.
 *
 * Por que importa: rich results no Google (cards de curso, sitelinks,
 * knowledge panel), AI crawlers (ChatGPT, Claude, Perplexity) que entendem
 * estrutura preferem JSON-LD sobre HTML solto.
 *
 * Schemas emitidos pelo `<RootStructuredData />`:
 * - Organization (FFV Academy)
 * - WebSite com SearchAction (caixa de busca nos resultados Google)
 * - BreadcrumbList (na landing aponta pra bases live)
 *
 * Cada base/módulo pode emitir Course/LearningResource via componentes
 * próprios (BaseStructuredData, ModuleStructuredData).
 */

const ORG_ID = 'https://fernandofrancovalle.com/#organization';
const SITE_ID = 'https://fernandofrancovalle.com/#website';

export function RootStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'FFV Academy',
        url: 'https://fernandofrancovalle.com',
        logo: 'https://fernandofrancovalle.com/icons/icon-512.png',
        description:
          'FFV — Formação Focada em Você. Plataforma de educação personalizada por IA. Transforma PDFs, slides e anotações em uma base de estudo completa (trilhas, módulos, exercícios, revisão espaçada) no mesmo dia.',
        founder: {
          '@type': 'Person',
          name: 'Fernando Franco Valle',
          url: 'https://fernandofrancovalle.com',
          sameAs: [
            'https://github.com/feh-franc0',
            'https://www.linkedin.com/in/fehfranco/',
            'https://twitter.com/feh_franc0',
          ],
        },
        sameAs: [
          'https://github.com/feh-franc0',
          'https://www.linkedin.com/in/fehfranco/',
          'https://twitter.com/feh_franc0',
        ],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'BR',
        },
        knowsLanguage: ['Portuguese', 'pt-BR'],
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        url: 'https://fernandofrancovalle.com',
        name: 'FFV Academy',
        description:
          'FFV — Formação Focada em Você. IA + curadoria humana que transforma seus arquivos em uma escola completa no mesmo dia. Tecnologia e Medicina Veterinária já no ar.',
        publisher: { '@id': ORG_ID },
        inLanguage: 'pt-BR',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://fernandofrancovalle.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      // Bases live como Course — destaca pra Google que existem cursos prontos.
      {
        '@type': 'Course',
        '@id': 'https://fernandofrancovalle.com/tecnologia#course',
        name: 'Base de Tecnologia — Engenharia para a era da IA',
        description:
          'Curso completo de tecnologia: IA aplicada, AWS, engenharia de software, sistemas distribuídos, dados e frontend. 157 módulos com teoria, exercícios e revisão espaçada SM-2.',
        url: 'https://fernandofrancovalle.com/tecnologia',
        provider: { '@id': ORG_ID },
        inLanguage: 'pt-BR',
        educationalLevel: 'intermediate to advanced',
        teaches: 'Programação · IA · AWS · Engenharia de Software',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT200H',
          inLanguage: 'pt-BR',
        },
      },
      {
        '@type': 'Course',
        '@id': 'https://fernandofrancovalle.com/medicina-veterinaria#course',
        name: 'Medicina Veterinária — Genética Animal',
        description:
          'Duas trilhas de Medicina Veterinária: Genética (Mendel a Hardy-Weinberg) + Métodos de Seleção e Testes (CPP, CPT, Pedigree, Progênie). 16 módulos sequenciais com teoria, exercícios resolvidos, simulado de 100 questões e revisão espaçada.',
        url: 'https://fernandofrancovalle.com/medicina-veterinaria',
        provider: { '@id': ORG_ID },
        inLanguage: 'pt-BR',
        educationalLevel: 'undergraduate to graduate',
        teaches: 'Genética Veterinária · Leis de Mendel · Hardy-Weinberg · Melhoramento Animal',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT30H',
          inLanguage: 'pt-BR',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Schema Course pra uma base específica — usado em /tecnologia e
 * /medicina-veterinaria via <BaseStructuredData base={...} />.
 */
export function BaseStructuredData({
  slug,
  name,
  description,
  url,
  modules,
  workloadHours,
  teaches,
}: {
  slug: string;
  name: string;
  description: string;
  url: string;
  modules: number;
  workloadHours: number;
  teaches: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${url}#course`,
    name,
    description,
    url,
    provider: { '@id': ORG_ID },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    teaches,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${workloadHours}H`,
      inLanguage: 'pt-BR',
    },
    numberOfCredits: modules,
    educationalCredentialAwarded: 'FFV Academy Certificate of Completion',
    // Permite o Google indicar "base atualizada recentemente"
    dateModified: new Date().toISOString().slice(0, 10),
    keywords: [slug, name, 'curso gratuito', 'estudo personalizado'].join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Schema LearningResource pra um módulo individual. Usado em /aprenda/<slug>
 * e /medicina-veterinaria/<slug> futuramente.
 */
export function ModuleStructuredData({
  slug,
  title,
  description,
  url,
  estimatedMinutes,
  baseSlug,
  baseName,
}: {
  slug: string;
  title: string;
  description: string;
  url: string;
  estimatedMinutes: number;
  baseSlug: string;
  baseName: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${url}#module`,
    name: title,
    description,
    url,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    learningResourceType: 'Module',
    educationalLevel: 'intermediate',
    timeRequired: `PT${estimatedMinutes}M`,
    isPartOf: {
      '@type': 'Course',
      '@id': `https://fernandofrancovalle.com/${baseSlug}#course`,
      name: baseName,
    },
    provider: { '@id': ORG_ID },
    keywords: [slug, title, baseName].join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
