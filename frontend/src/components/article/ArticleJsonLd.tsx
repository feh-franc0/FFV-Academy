const BASE_URL = 'https://fernandofrancovalle.com';
import { safeJsonLd } from '@/lib/safe-json';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  readTime: number;
  datePublished?: string;
  trailName?: string;
  trailHref?: string;
  hubName?: string;
  hubHref?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  readTime,
  datePublished = '2026-04-16',
  trailName,
  trailHref,
  hubName,
  hubHref,
}: ArticleJsonLdProps) {
  const articleUrl = `${BASE_URL}/aprenda/${slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: articleUrl,
    author: {
      '@type': 'Person',
      name: 'Fernando Franco Valle',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: BASE_URL,
    },
    datePublished,
    dateModified: datePublished,
    timeRequired: `PT${readTime}M`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
  };

  // BreadcrumbList: Home → Hub → Trail → Article
  const breadcrumbItems: { id: string; name: string; item: string }[] = [
    { id: '1', name: 'FFV Academy', item: BASE_URL },
  ];
  if (hubName && hubHref) {
    breadcrumbItems.push({ id: '2', name: hubName, item: `${BASE_URL}${hubHref}` });
  }
  if (trailName && trailHref) {
    breadcrumbItems.push({ id: String(breadcrumbItems.length + 1), name: trailName, item: `${BASE_URL}${trailHref}` });
  }
  breadcrumbItems.push({ id: String(breadcrumbItems.length + 1), name: title, item: articleUrl });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((bc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: bc.name,
      item: bc.item,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
    </>
  );
}
