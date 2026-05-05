import type { Metadata } from 'next';
import { CURRICULUM } from './curriculum';

const BASE_URL = 'https://fernandofrancovalle.com';

/**
 * Gera metadata completo (title, description, keywords, OpenGraph, Twitter)
 * para um artigo a partir do slug definido em curriculum.ts.
 */
export function getModuleMetadata(slug: string): Metadata {
  let mod;

  for (const trail of CURRICULUM) {
    const found = trail.modules.find(m => m.slug === slug);
    if (found) {
      mod = found;
      break;
    }
  }

  if (!mod) {
    return { title: 'FFV Academy' };
  }

  const title = `${mod.title} — FFV Academy`;
  const description = mod.seoDesc || mod.desc;
  const url = `${BASE_URL}/aprenda/${slug}`;

  return {
    title,
    description,
    keywords: mod.keywords,
    openGraph: {
      title: mod.title,
      description,
      url,
      siteName: 'FFV Academy',
      locale: 'pt_BR',
      type: 'article',
      images: [
        {
          // Per-module OG é gerado por `npm run generate-og` em out/og/.
          // Se ainda não foi gerado, crawler cai em 404 e usa o opengraph-image
          // padrão (raiz do app) como fallback.
          url: `${BASE_URL}/og/${slug}.png`,
          width: 1200,
          height: 630,
          alt: mod.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: mod.title,
      description,
      images: [`${BASE_URL}/og/${slug}.png`],
    },
    alternates: {
      canonical: url,
    },
  };
}
