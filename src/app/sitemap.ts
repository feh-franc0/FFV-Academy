import { MetadataRoute } from 'next';
import { CURRICULUM, HUBS } from '@/lib/curriculum';

export const dynamic = 'force-static';

const BUILD_DATE = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fernandofrancovalle.com';

  const articles = CURRICULUM.flatMap(trail =>
    trail.modules.map(mod => ({
      url: `${base}/aprenda/${mod.slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );

  const trails = CURRICULUM.filter(t => t.href).map(trail => ({
    url: `${base}${trail.href}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const hubs = HUBS.map(hub => ({
    url: `${base}${hub.href}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    { url: base, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${base}/progresso`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/revisar`, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/glossario`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    ...hubs,
    ...trails,
    ...articles,
  ];
}
