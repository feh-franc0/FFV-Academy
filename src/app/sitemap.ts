import { MetadataRoute } from 'next';
import { CURRICULUM, HUBS } from '@/lib/curriculum';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';

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
    { url: `${base}/claude-code-vs-cursor`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/melhores-ferramentas-ia-codigo-2026`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/cheatsheet`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${base}/playlists`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${base}/simulados`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.9 },
    ...SIMULADOS_CATALOG.map(s => ({
      url: `${base}/simulados/${s.id.replace(/^simulado-/, '')}`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${base}/verificar`, lastModified: BUILD_DATE, changeFrequency: 'yearly' as const, priority: 0.4 },
    // Sprint 2 — novas trilhas
    { url: `${base}/ds-algoritmos`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/security-engineering`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/aws-developer-associate`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/python-engenheiros`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    // Sprint 3A
    { url: `${base}/testing-engineering`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/acessibilidade`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    // Sprint 3B
    { url: `${base}/dados`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${base}/data-engineering`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/fine-tuning`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/llm-evals`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/mapa`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${base}/roadmaps`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${base}/postgres-internals`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.8 },
    ...hubs,
    ...trails,
    ...articles,
  ];
}
