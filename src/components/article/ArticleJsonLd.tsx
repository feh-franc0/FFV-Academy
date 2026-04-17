interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  readTime: number;
  datePublished?: string;
}

export function ArticleJsonLd({ title, description, slug, readTime, datePublished = '2026-04-16' }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `https://fernandofrancovalle.com/aprenda/${slug}`,
    author: {
      '@type': 'Person',
      name: 'Fernando Franco Valle',
      url: 'https://fernandofrancovalle.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: 'https://fernandofrancovalle.com',
    },
    datePublished,
    dateModified: datePublished,
    timeRequired: `PT${readTime}M`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
