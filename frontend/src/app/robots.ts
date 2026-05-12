import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/preferencias', '/api/', '/simulados/*/attempts'],
      },
      // AI crawlers — explicitamente permitidos
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
    ],
    sitemap: 'https://fernandofrancovalle.com/sitemap.xml',
    host: 'https://fernandofrancovalle.com',
  };
}
