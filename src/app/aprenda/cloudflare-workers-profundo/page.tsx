import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cloudflare-workers-profundo');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual garantia de consistência cada serviço de storage da Cloudflare oferece?',
    options: [
      'Todos fortes',
      'KV: eventual consistent (~60s pra propagar globalmente); D1: single-region replicado (strongly consistent na região primária); R2: read-after-write consistency; Durable Objects: strong consistency local + serializável por objeto',
      'Todos fracos',
      'Nenhum',
    ],
    correct: 1,
    explanation: 'KV é otimizado pra read-heavy global (config, flags, cached blobs), por isso eventual. D1 é SQLite distribuído com region primária + réplicas read. R2 (S3-compatible sem egress fee) garante read-after-write e list-after-write. Durable Objects são o único storage com strong consistency + transactional — cada objeto vive em um POP, operações são serializadas, ideal pra rate limit, counters, stateful websocket rooms.',
  },
  {
    question: 'Por que usar Durable Objects pra rate limit ao invés de KV?',
    options: [
      'Mais barato',
      'KV é eventual consistent — dois Workers lendo counter simultâneos em POPs diferentes veem valores antigos e passam do limite. Durable Object garante serialização: cada requisição pro mesmo DO entra numa fila, increment é atômico',
      'Mais rápido sempre',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Rate limit exige precisão: se o limite é 100 req/min, você não quer contar 80 por causa de consistência eventual. DO é single-threaded por objeto: instancia-se numa region, todas as chamadas são serializadas. Custa mais que KV (cobra por GB-s + reqs), mas é a única escolha correta pra counters, locks distribuídos, game rooms, chat presence.',
  },
  {
    question: 'D1 vs Postgres tradicional pra CRUD de app web?',
    options: [
      'Igual',
      'D1 é SQLite gerenciado, schema SQL normal, latência baixa no edge, ideal pra apps small-medium (<10GB, single-region primary); Postgres é superior em workloads complexas (joins multi-table, full-text, json ops, replicação multi-região madura)',
      'D1 é NoSQL',
      'Postgres não escala',
    ],
    correct: 1,
    explanation: 'D1 roda SQLite com API HTTP + binding Worker. Você escreve SQL normal, prepared statements, transactions. Limites: 10GB por database (em 2026 expandindo), sem extensions pesadas (postgis, pgvector), queries complexas talvez lentas. Cabe perfeitamente em blog, SaaS pequeno, dashboards internos. Pra tudo que precisa de pgvector ou joins pesados, Neon/Supabase/Turso são alternativas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cloudflare-workers-profundo"
      title="Cloudflare Workers profundo: KV, D1, R2, Durable Objects"
      icon="☁️"
      xp={65}
      readTime={15}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="vercel-edge-functions"
      nextTitle="Vercel Edge Functions + ISR"
      quiz={quiz}
    >
      <Section title="O ecossistema Workers" accent={accent}>
        <p>
          Workers sozinho é compute stateless. A plataforma real são Workers + bindings: KV (kv global), D1 (SQL), R2 (object storage), Durable Objects (stateful), Queues (message queue), Analytics Engine (time-series), AI (inference on-edge). Você compõe isso via <code>wrangler.toml</code> e consome como variáveis injetadas no <code>env</code>.
        </p>
      </Section>

      <Section title="wrangler.toml com bindings" accent={accent}>
        <CodeBlock lang="yaml">{`name = "ffv-api"
main = "src/index.ts"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "CACHE"
id = "abc123"

[[d1_databases]]
binding = "DB"
database_name = "ffv"
database_id = "xyz789"

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "ffv-assets"

[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"

[[queues.producers]]
binding = "JOBS"
queue = "background-jobs"`}</CodeBlock>
      </Section>

      <Section title="Worker típico consumindo bindings" accent={accent}>
        <CodeBlock lang="ts">{`interface Env {
  CACHE: KVNamespace;
  DB: D1Database;
  ASSETS: R2Bucket;
  RATE_LIMITER: DurableObjectNamespace;
  JOBS: Queue;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);

    // KV: cache de config
    const config = await env.CACHE.get('app-config', 'json');

    // D1: query parametrizada
    const { results } = await env.DB.prepare(
      'SELECT id, title FROM posts WHERE slug = ?'
    ).bind(url.pathname).all();

    // R2: servir asset
    if (url.pathname.startsWith('/assets/')) {
      const key = url.pathname.replace('/assets/', '');
      const obj = await env.ASSETS.get(key);
      if (!obj) return new Response('not found', { status: 404 });
      return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType ?? '' } });
    }

    // Queue: enfileirar job pesado
    ctx.waitUntil(env.JOBS.send({ kind: 'email', to: 'user@ffv.com' }));

    return Response.json({ results });
  },
} satisfies ExportedHandler<Env>;`}</CodeBlock>
      </Section>

      <Section title="KV: quando e como" accent={accent}>
        <p>
          KV é key-value distribuído globalmente com eventual consistency (~60s). Read barato e rápido no edge; write se propaga devagar. Use pra: config do app, feature flags, sessões não críticas, caches de resposta, rate-limit best-effort.
        </p>
        <CodeBlock lang="ts">{`// Write global (lento de propagar)
await env.CACHE.put('flag:dark-mode', 'true', { expirationTtl: 3600 });

// Read local no POP (super rápido, eventual)
const flag = await env.CACHE.get('flag:dark-mode');

// List + pagination (não é index SQL — é prefix scan)
const list = await env.CACHE.list({ prefix: 'session:', limit: 100, cursor });`}</CodeBlock>
        <Callout tone="warn">
          Não use KV pra contadores exatos ou locks — eventual consistency fura. Use Durable Objects.
        </Callout>
      </Section>

      <Section title="D1: SQLite no edge" accent={accent}>
        <CodeBlock lang="ts">{`// Criação via wrangler:
// npx wrangler d1 create ffv
// npx wrangler d1 execute ffv --file=./schema.sql

// schema.sql:
// CREATE TABLE posts (id INTEGER PRIMARY KEY, slug TEXT UNIQUE, title TEXT, body TEXT);
// CREATE INDEX idx_slug ON posts(slug);

// Query com prepared statement (SQL injection-safe):
const stmt = env.DB.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug);
const { results } = await stmt.all<Post>();

// Batch em transação:
await env.DB.batch([
  env.DB.prepare('INSERT INTO posts (slug, title) VALUES (?, ?)').bind('a', 'A'),
  env.DB.prepare('INSERT INTO posts (slug, title) VALUES (?, ?)').bind('b', 'B'),
]);`}</CodeBlock>
      </Section>

      <Section title="R2: object storage sem egress" accent={accent}>
        <CodeBlock lang="ts">{`// Upload
await env.ASSETS.put('imagens/hero.jpg', req.body, {
  httpMetadata: { contentType: 'image/jpeg' },
  customMetadata: { uploadedBy: 'admin' },
});

// Download
const obj = await env.ASSETS.get('imagens/hero.jpg');
const data = await obj?.arrayBuffer();

// List
const listed = await env.ASSETS.list({ prefix: 'imagens/', limit: 50 });`}</CodeBlock>
        <Callout tone="info">
          R2 é S3-compatible, sem egress fee. Pra site com tráfego alto de mídia, diferença de custo vs S3 pode ser dramática (AWS cobra ~$0.09/GB, R2 cobra zero).
        </Callout>
      </Section>

      <Section title="Durable Objects: o único stateful" accent={accent}>
        <CodeBlock lang="ts">{`export class RateLimiter {
  state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }

  async fetch(req: Request) {
    const key = 'count';
    const windowMs = 60_000;
    const limit = 100;

    const now = Date.now();
    const stored = await this.state.storage.get<{ count: number; reset: number }>(key);
    const data = stored && stored.reset > now
      ? stored
      : { count: 0, reset: now + windowMs };

    data.count += 1;
    await this.state.storage.put(key, data);

    if (data.count > limit) {
      return new Response('rate limited', { status: 429 });
    }
    return new Response('ok');
  }
}

// No worker:
const id = env.RATE_LIMITER.idFromName(userIp);
const stub = env.RATE_LIMITER.get(id);
const res = await stub.fetch(req);`}</CodeBlock>
      </Section>

      <Section title="Trade-offs e custos" accent={accent}>
        <Callout tone="success" icon="✅">
          Workers Paid ($5/mês): 10M req incluídos, depois $0.30/M. KV: 1M read incluídos. D1: 5M reads, 100k writes. R2: sem egress. DO: 1M req + 1GB-s incluídos. Comparado com Lambda + DynamoDB + S3 em tráfego equivalente, Cloudflare custa geralmente 3-10x menos. Contrapartida: lock-in (DO não tem equivalente AWS nativo).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
