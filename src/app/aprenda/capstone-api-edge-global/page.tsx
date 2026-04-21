import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-api-edge-global');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Meta "p99 < 50ms global" — o que torna isso difícil?',
    options: [
      'Nada',
      'p99 pega as piores requests: cold starts, cache miss, DB query rara, POP longe do DO primário; precisa de instrumentação distribuída (traces com request-ID propagado), cache multi-layer e data collocation real — média enganosa, p99 revela gargalos',
      'Só ter bom servidor',
      'Caching trivial',
    ],
    correct: 1,
    explanation: 'p50 baixo é fácil (maioria vai em cache hit edge). p99 requer atenção obsessiva: cache miss que demora, query lenta, Durable Object que acordou "frio", JWKs sendo re-fetched. Ferramenta obrigatória: tracing com timestamps em cada etapa (edge receive, cache check, DB, response send). Aí você vê onde o tail está.',
  },
  {
    question: 'Load test geo-distribuído — por que não usa só wrk local?',
    options: [
      'Local é suficiente',
      'Testar de uma única região dá perfil falso — sempre hit no POP local rápido; load test real dispara de múltiplas regiões (São Paulo, Frankfurt, Tokyo, Sydney) simultaneamente pra medir p99 global e comportamento de routing dos DOs',
      'Só fazer em prod',
      'Não importa',
    ],
    correct: 1,
    explanation: 'k6 Cloud, Artillery Cloud ou BrowserStack/Gatling distribuído — disparam de 4-10 regions em paralelo. Você vê assimetria: POP SP com p99 20ms, Tokyo p99 180ms porque DO vive em us-east. Aí decide: replicar DO por região? Cache key agressivo? Routing? Sem load geo, o número p99 da sua primeira medição mente confortavelmente.',
  },
  {
    question: 'O que entregar pro portfolio além do código?',
    options: [
      'Só repo',
      'Repo + README com arquitetura (Mermaid), benchmarks (k6 scripts + gráficos p50/p95/p99 por região), trade-offs documentados, demo deployed com URL pública, dashboard com métricas em tempo real (Grafana Cloud, Cloudflare Analytics)',
      'PDF',
      'Só slides',
    ],
    correct: 1,
    explanation: 'Recruiter vê código em 30 segundos; decisão vem do writeup. "p99 global 42ms" com gráfico + método + código reproduzível diferencia. Arquitetura visual mostra thinking. Dashboard público prova que funciona em prod. Link demo permite testar. Esse é o nível de entregável que passa filtro senior em 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-api-edge-global"
      title="Capstone: API edge global < 50ms p99"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto: API de encurtador de links globais" accent={accent}>
        <p>
          Escopo: endpoint <code>GET /:code</code> redireciona pra URL salva (rápido, global, rate-limited); <code>POST /links</code> cria novo link (autenticado); <code>GET /stats/:code</code> retorna hits agregados. Meta explícita: p99 &lt; 50ms de SP, Frankfurt, Tokyo, Sydney simultaneamente.
        </p>
      </Section>

      <Section title="Stack sugerida" accent={accent}>
        <CodeBlock lang="ts">{`// Cloudflare Workers (TS) como compute global
// D1 como source of truth (links)
// KV pra cache de lookup (read-heavy, eventual consistent ok pra redirect)
// Durable Objects: rate limit (por IP) + counters de hit
// R2 pra exports de dados (relatórios diários)
// Queues pra analytics async (flush de hits pra D1 em batch)
// Cloudflare Analytics Engine pra time-series de requests
// Sentry pro error tracking
// k6 Cloud pra load test geo-distribuído`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone Edge API — Checklist

## 1. API
- [ ] POST /links (auth JWT, valida URL, gera code curto, INSERT D1, PUT KV)
- [ ] GET /:code (lookup KV → fallback D1, 302 redirect, enqueue hit)
- [ ] GET /stats/:code (auth, SELECT agregado D1 + DO counters)
- [ ] DELETE /links/:code (auth owner-only)

## 2. Performance
- [ ] Cache KV first, D1 fallback only on miss
- [ ] Hit tracking via Queue (async, não bloqueia redirect)
- [ ] Rate limit 100 req/min por IP via Durable Object
- [ ] Prepared statements D1, sem N+1

## 3. Auth
- [ ] JWT com JWKS endpoint cacheado em KV (TTL 1h)
- [ ] Validation em Worker antes de lógica
- [ ] Rate limit separado pra endpoints autenticados

## 4. Observability
- [ ] Tracing com request-id em todos os logs
- [ ] Métricas custom via Analytics Engine (latency p99 por endpoint)
- [ ] Sentry pra erros não previstos
- [ ] Dashboard público (Cloudflare Analytics + Grafana Cloud opcional)

## 5. Load test geo
- [ ] k6 script rodando de 4 regiões: sa-east, eu-central, ap-northeast, ap-southeast
- [ ] Cenários: sustained 500 RPS, spike 5000 RPS, cold start test
- [ ] Relatório p50/p95/p99 por region
- [ ] Prova de p99 < 50ms em sustained load

## 6. Writeup
- [ ] Architecture diagram (Mermaid)
- [ ] Trade-off doc (por que KV + D1, por que DO pra rate limit, custos)
- [ ] Benchmarks com gráficos (matplotlib/Plotly)
- [ ] Demo URL pública + repo público
- [ ] Blog post ou LinkedIn article estruturado`}</CodeBlock>
      </Section>

      <Section title="Núcleo do Worker" accent={accent}>
        <CodeBlock lang="ts">{`interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  RATE: DurableObjectNamespace;
  JOBS: Queue<{ code: string; ip: string; ua: string }>;
  ANALYTICS: AnalyticsEngineDataset;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const start = Date.now();
    const reqId = crypto.randomUUID();
    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';

    try {
      // Rate limit
      const rlId = env.RATE.idFromName('ip:' + ip);
      const rl = await env.RATE.get(rlId).fetch('https://rl/check');
      if (rl.status === 429) return rl;

      const url = new URL(req.url);
      const code = url.pathname.slice(1);

      if (req.method === 'GET' && code && !code.includes('/')) {
        return await handleRedirect(code, req, env, ctx);
      }
      if (req.method === 'POST' && url.pathname === '/links') {
        return await handleCreate(req, env);
      }
      return new Response('not found', { status: 404 });
    } finally {
      const duration = Date.now() - start;
      env.ANALYTICS.writeDataPoint({
        blobs: [reqId, req.method, new URL(req.url).pathname],
        doubles: [duration],
        indexes: [ip],
      });
    }
  },
} satisfies ExportedHandler<Env>;

async function handleRedirect(code: string, req: Request, env: Env, ctx: ExecutionContext) {
  // KV first
  let url = await env.CACHE.get('link:' + code);
  if (!url) {
    const row = await env.DB.prepare('SELECT url FROM links WHERE code = ?').bind(code).first<{ url: string }>();
    if (!row) return new Response('not found', { status: 404 });
    url = row.url;
    ctx.waitUntil(env.CACHE.put('link:' + code, url, { expirationTtl: 3600 }));
  }

  // Hit async
  ctx.waitUntil(env.JOBS.send({
    code,
    ip: req.headers.get('cf-connecting-ip') ?? '',
    ua: req.headers.get('user-agent') ?? '',
  }));

  return Response.redirect(url, 302);
}`}</CodeBlock>
      </Section>

      <Section title="Load test com k6" accent={accent}>
        <CodeBlock lang="js">{`// k6 script — rodar via k6 cloud com distribuição geo
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  ext: {
    loadimpact: {
      distribution: {
        'amazon:br:sao paulo':     { loadZone: 'amazon:br:sao paulo', percent: 25 },
        'amazon:de:frankfurt':     { loadZone: 'amazon:de:frankfurt', percent: 25 },
        'amazon:jp:tokyo':         { loadZone: 'amazon:jp:tokyo', percent: 25 },
        'amazon:au:sydney':        { loadZone: 'amazon:au:sydney', percent: 25 },
      },
    },
  },
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(99)<50'],
    http_req_failed: ['rate<0.001'],
  },
};

export default function () {
  const res = http.get('https://api.ffv.com/abc123', { redirects: 0 });
  check(res, { 'is 302': (r) => r.status === 302 });
  sleep(1);
}`}</CodeBlock>
      </Section>

      <Section title="Armadilhas de p99" accent={accent}>
        <Callout tone="warn">
          (1) DO primário em us-east → requests de Tokyo pagam 150ms ida-volta. Mitigue com rate limit local por POP (trade accuracy por latência). (2) KV cold write aparece como spike — pré-warm keys populares. (3) waitUntil sem timeout pode segurar isolate e afetar próximos requests — sempre use Promise.race com timeout. (4) D1 prepared statement compila toda vez se não reutilizar — declare no módulo scope.
        </Callout>
      </Section>

      <Section title="Entrega final" accent={accent}>
        <Callout tone="success" icon="✅">
          Repo público com README rico (architecture + benchmarks + trade-offs). Demo URL pública funcionando. Dashboard compartilhado com métricas em tempo real. Blog post estruturado contando a jornada: hipótese inicial, experimentos, números reais. Link pra k6 cloud report mostrando p99 por region. Esse conjunto dispara convite pra entrevista senior em stack edge com frequência alta.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
