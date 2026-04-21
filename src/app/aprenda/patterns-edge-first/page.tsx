import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('patterns-edge-first');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Islands Architecture (Astro, Qwik) e como se relaciona com edge?',
    options: [
      'Tudo SSR',
      'Página é HTML estático com "ilhas" interativas que hidratam independente e lazy; combinado com edge SSR, shell chega em ~30ms do POP e JS só carrega onde é necessário — contraste com SPA full-hydration que trava até JS inteiro baixar',
      'Mesma coisa que SPA',
      'Só CSS',
    ],
    correct: 1,
    explanation: 'Islands é o oposto de "SPA hidrata a página toda no cliente". Astro/Qwik marcam componentes específicos como interativos (client:visible, client:idle); o resto é HTML puro. Ganho em edge: renderizar HTML shell é barato e rápido, streaming chega instantâneo, JS client é pequeno. Paradigm shift depois de anos de "tudo React Client Component".',
  },
  {
    question: 'Data collocation no edge — qual problema resolve?',
    options: [
      'Nenhum',
      'Edge compute é rápido mas se o DB está em região distante (us-east-1), cada query pega 100+ms de round-trip; colocar dados no edge (D1 no POP, Neon branches edge, Turso replicas) faz query completar em 5-20ms — TTFB total &lt; 50ms global',
      'Só cache',
      'Reduz custos',
    ],
    correct: 1,
    explanation: 'Sem collocation, edge compute se torna "edge → origin DB distante → volta → resposta" — perde o ganho. Opções: D1 (SQLite no edge), Neon read-replicas edge, Turso (libSQL distribuído), PlanetScale edge reads, DynamoDB Global Tables. Write geralmente vai pra região primária; reads ficam locais. App com 80% leitura (blog, catálogo, dashboard) beneficia muito.',
  },
  {
    question: 'Rate limiting distribuído no edge — qual o desafio?',
    options: [
      'Nenhum',
      'Contadores precisam ser coerentes globalmente ou em janela aceitável; KV eventual consistent quebra precisão; Durable Objects resolvem com serialização; alternativa: token bucket local por POP + reconciliação async, aceitando overshoot controlado',
      'Impossível',
      'Só cliente faz',
    ],
    correct: 1,
    explanation: 'Escolher abordagem depende de SLA: "limite ESTRITO 100 req/min" → Durable Object (serializa, mas adiciona latência de roteamento). "Limite aproximado 100 req/min" → counter local no POP, aceita +20% de imprecisão por causa de distribuição. Redis Cluster com INCR + EXPIRE também funciona se aceitar latência pro POP central. Sempre defina tolerance antes de arquitetar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="patterns-edge-first"
      title="Patterns edge-first: HTML streaming, data collocation"
      icon="🎯"
      xp={60}
      readTime={14}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="capstone-api-edge-global"
      nextTitle="Capstone: API edge global < 50ms p99"
      quiz={quiz}
    >
      <Section title="Edge-first como arquitetura, não feature" accent={accent}>
        <p>
          "Edge-first" significa começar o design pensando em: onde a decisão acontece, onde os dados vivem, o que pode ser HTML estático, o que precisa ser dinâmico. Muda a forma de compor apps; não é só mudar o deploy do origin pro edge.
        </p>
      </Section>

      <Section title="HTML streaming com Islands" accent={accent}>
        <CodeBlock lang="astro">{`---
// pages/produto/[slug].astro
import Header from '../../components/Header.astro';
import PrecoWatcher from '../../components/PrecoWatcher.tsx';
import Recomendacoes from '../../components/Recomendacoes.astro';

const { slug } = Astro.params;
const produto = await db.prepare('SELECT * FROM produtos WHERE slug = ?').bind(slug).first();
---
<html>
  <body>
    <Header />

    {/* HTML estático, sem JS */}
    <h1>{produto.nome}</h1>
    <p>{produto.descricao}</p>

    {/* Ilha interativa — só hidrata quando visível */}
    <PrecoWatcher client:visible produtoId={produto.id} />

    {/* Outro componente SSR assíncrono */}
    <Recomendacoes produtoId={produto.id} />
  </body>
</html>`}</CodeBlock>
      </Section>

      <Section title="Data collocation: opções reais" accent={accent}>
        <CodeBlock lang="ts">{`// Opção 1: Cloudflare D1
// SQLite distribuído; write em região primária, reads locais.
const { results } = await env.DB.prepare('SELECT * FROM posts LIMIT 10').all();

// Opção 2: Turso (libSQL, fork SQLite)
// Replicação edge-first; cada region tem réplica read;
// writes roteados pra primary com round-trip sync.
import { createClient } from '@libsql/client';
const turso = createClient({ url: 'libsql://ffv.turso.io', authToken: process.env.TURSO_TOKEN });

// Opção 3: Neon read-replicas edge
// Postgres serverless com branches; read em edge, write em primary.
import postgres from 'postgres';
const sql = postgres(process.env.NEON_URL!);

// Opção 4: DynamoDB Global Tables
// Multi-region, eventual consistency cross-region.
// Bom pra stack AWS; custo alto em write-heavy cross-region.`}</CodeBlock>
      </Section>

      <Section title="Cache logic no edge" accent={accent}>
        <CodeBlock lang="ts">{`// Padrão SWR (stale-while-revalidate) no edge:
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const cache = caches.default;
    const cacheKey = new Request(req.url, req);

    let res = await cache.match(cacheKey);
    if (res) {
      // Serve cache imediato; revalida em background se stale
      if (isStale(res)) {
        ctx.waitUntil(revalidate(req, cache, cacheKey));
      }
      return res;
    }

    // Miss total: busca, cacheia, responde
    res = await fetch(req);
    const clone = new Response(res.body, res);
    clone.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    ctx.waitUntil(cache.put(cacheKey, clone.clone()));
    return clone;
  },
};`}</CodeBlock>
      </Section>

      <Section title="A/B testing edge-side" accent={accent}>
        <CodeBlock lang="ts">{`// Middleware decide variant, injeta no header ou cookie
export function middleware(req: Request) {
  const cookie = getCookie(req, 'variant');
  const variant = cookie ?? (Math.random() < 0.5 ? 'a' : 'b');

  const url = new URL(req.url);
  if (url.pathname === '/') {
    url.pathname = variant === 'a' ? '/home-a' : '/home-b';
  }

  const res = fetch(new Request(url, req));
  if (!cookie) setCookie(res, 'variant', variant, { maxAge: 30 * 86400 });
  return res;
}`}</CodeBlock>
        <Callout tone="info">
          Decidir variant no edge mantém ganho de cache — cada variant tem seu cache key. Decidir no cliente após JS carregar introduz FOUC e perde SSR.
        </Callout>
      </Section>

      <Section title="Feature flags e geo-targeting" accent={accent}>
        <CodeBlock lang="ts">{`// Cloudflare Workers injeta headers de geo:
// CF-IPCountry, CF-IPCity, CF-Region
const country = req.headers.get('cf-ipcountry');

if (country === 'BR') {
  // Pricing em BRL, checkout com PIX
} else if (country === 'US') {
  // USD, Stripe
}

// Combine com KV/D1 pra flags por país:
const flag = await env.CACHE.get('feature:pix:' + country);`}</CodeBlock>
      </Section>

      <Section title="Pegadinhas recorrentes" accent={accent}>
        <Callout tone="warn">
          (1) Cache key com query string — ordem dos params muda hit rate; normalize. (2) Vary: Cookie sem controle — cada user vira cache miss; use Vary seletivo. (3) Edge session storage crescendo sem TTL — custo explode. (4) Logs em edge são volumosos; sample pra não encher o log drain. (5) Testes locais (miniflare, wrangler dev) não replicam 100% o comportamento produção — teste em preview environment real antes de promover.
        </Callout>
      </Section>

      <Section title="Quando edge não vale o custo mental" accent={accent}>
        <Callout tone="success" icon="✅">
          App interno com 200 usuários, DB em us-east-1, latência não é reclamação: Vercel/Render/Fly node-side está ótimo. Edge-first brilha quando user é global, quando TTFB impacta receita (e-commerce, media), quando escala precisa sobreviver spike imprevisível. Não force o padrão — arquiteto matura escolhe a pedrada mínima que resolve.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
