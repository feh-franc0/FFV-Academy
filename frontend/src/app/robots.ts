import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // `/admin` também recebe `X-Robots-Tag: noindex` por header (ver
        // next.config.ts): robots.txt impede o rastreamento, o header impede a
        // indexação de URL descoberta por outro caminho. Rotas pessoais
        // (`/progresso`, `/perfil`, `/revisar`) ficam FORA desta lista de
        // propósito: elas declaram `noindex` na própria página, e proibir o
        // rastreamento impediria o buscador de LER esse noindex.
        disallow: [
          '/admin',
          '/preferencias',
          '/preferencias-aprendizado',
          '/api/',
          '/dev-preview',
          '/simulados/*/attempts',
        ],
      },
      // AI crawlers — explicitamente permitidos
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      // Acrescentados em ago/2026. Um agente não listado cai na regra '*', que já
      // permite tudo — então listar é declaração de intenção, não permissão nova:
      // deixa explícito que este conteúdo PODE ser citado por assistente de IA,
      // que é o público da plataforma. `ClaudeBot` rastreia; `Claude-User` busca
      // durante uma conversa; `Claude-SearchBot` indexa para busca.
      { userAgent: 'Claude-User', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
    ],
    sitemap: 'https://fernandofrancovalle.com/sitemap.xml',
    host: 'https://fernandofrancovalle.com',
  };
}
