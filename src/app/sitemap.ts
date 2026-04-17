import { MetadataRoute } from 'next';
import { CURRICULUM, HUBS } from '@/lib/curriculum';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fernandofrancovalle.com';

  const articles = CURRICULUM.flatMap(trail =>
    trail.modules.map(mod => ({
      url: `${base}/aprenda/${mod.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );

  const trails = CURRICULUM.filter(t => t.href).map(trail => ({
    url: `${base}${trail.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const hubs = HUBS.map(hub => ({
    url: `${base}${hub.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    { url: base, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${base}/progresso`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/revisar`, changeFrequency: 'weekly' as const, priority: 0.7 },
    ...hubs,
    ...trails,
    ...articles,
  ];
}
