import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('edge-vs-cloud-mental-model');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que V8 isolates (Workers) têm cold start "quase zero" versus Lambda containers?',
    options: [
      'Magia',
      'V8 isolate é sandbox leve (memória isolada dentro do mesmo process V8); cria em 1-5ms vs container Lambda que sobe micro-VM Firecracker (100-500ms). Trade-off: isolates compartilham runtime, daí restrições (sem Node APIs nativos, memória limitada)',
      'Servidor mais rápido',
      'Rede melhor',
    ],
    correct: 1,
    explanation: 'Isolate é construção do V8: objetos isolados no mesmo runtime JS, acesso separado. Workers spawna milhares no mesmo process sem overhead de container. Lambda precisa de container (ou micro-VM no Lambda SnapStart), inicializa runtime do zero. Por isso Workers cobra por ms de CPU ativa (não por invocação) e escala pra milhões sem pré-warm. Limite: 128MB RAM, 30s CPU, sem fs/child_process/net raw sockets.',
  },
  {
    question: 'Latência real de edge (POP próximo) vs cloud central (us-east-1)?',
    options: [
      'Igual',
      'Edge: 5-30ms até o POP na cidade/região do user. Cloud central: 100-250ms de round-trip transatlântico + cold start. Pra TTFB de SSR ou validação de auth, edge é diferença percebida — página "aparece" instantânea',
      'Cloud é mais rápido',
      'Depende só de DNS',
    ],
    correct: 1,
    explanation: 'Cloudflare/Fastly/Vercel têm 200-300 POPs globais; user brasileiro bate em POP SP/RJ com RTT ~10ms. us-east-1 do Brasil é ~140ms one-way. Pra middleware (auth header check, redirect, geo-based routing), executar no edge elimina round-trip pro datacenter central. Pra compute pesado ou DB query, vale rotear do edge pra origin — edge serve de CDN + front controller.',
  },
  {
    question: 'Quando edge NÃO é a resposta?',
    options: [
      'Sempre usar',
      'Workload CPU-heavy (image processing, ML inference), long-running (websocket com estado grande, video encoding), precisa de filesystem persistente, SDK nativo específico (Playwright, puppeteer), database em região distante do edge (latência DB domina)',
      'Sempre cloud',
      'Só front',
    ],
    correct: 1,
    explanation: 'Edge brilha em I/O leve e curto: auth, routing, SSR, cache logic, API gateway. Cai em: (a) CPU limit — Workers tem 30s CPU, Lambda@Edge 5s, (b) state — sem disk persistente (usar Durable Objects/KV), (c) libs nativas — isolates não rodam binários, (d) latência DB — se seu Postgres tá só em us-east-1, edge global vira edge-para-origem-lento. Data collocation (D1, Neon edge branches) resolve parte disso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="edge-vs-cloud-mental-model"
      title="Edge vs cloud: mental model e trade-offs"
      icon="🗺️"
      xp={45}
      readTime={11}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="cloudflare-workers-profundo"
      nextTitle="Cloudflare Workers profundo: KV, D1, R2, Durable Objects"
      quiz={quiz}
    >
      <Section title="O que edge realmente significa" accent={accent}>
        <p>
          Edge computing = executar código em datacenters distribuídos globalmente (POPs — points of presence) geograficamente próximos ao usuário. Não é cloud "mais rápido"; é um modelo de execução diferente, com trade-offs próprios. Cloudflare tem ~320 POPs, Fastly ~100, Vercel delega pra Cloudflare+AWS Local Zones.
        </p>
      </Section>

      <Section title="V8 isolates vs Lambda container" accent={accent}>
        <CodeBlock lang="ts">{`// Lambda clássico (container Firecracker):
// - Spawn de micro-VM: 100-500ms cold start
// - 512MB-10GB RAM, 15min execução
// - Runtime Node/Python/Go completo (libs nativas ok)
// - Cobra por invocação + duração

// Workers / Vercel Edge / Deno Deploy (V8 isolate):
// - Spawn de isolate: ~1-5ms
// - 128MB RAM, 30s CPU (Cloudflare), 30s wall clock (Vercel)
// - Runtime é subset Web Platform (fetch, Response, crypto.subtle)
//   — NÃO tem fs, net, child_process, node:buffer puro
// - Cobra por ms de CPU efetivamente usado`}</CodeBlock>
      </Section>

      <Section title="Latência: números reais" accent={accent}>
        <CodeBlock lang="ts">{`// TTFB (Time To First Byte) típico de SP, BR:
//
// A) Página estática em CDN (Cloudflare/Vercel):      20-40ms
// B) SSR em edge (Workers/Vercel Edge):               40-80ms
// C) SSR em us-east-1 (Lambda + CloudFront):         150-250ms
// D) SSR em us-east-1 sem CDN (ELB direto):          250-400ms
//
// Numa página com 10 requests async, diferença composta vira segundos.
// Edge cabe em middleware e SSR; origin ainda precisa pra DB/compute pesado.`}</CodeBlock>
      </Section>

      <Section title="Restrições que você vai encontrar" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ NÃO existe em Workers/edge:
// - fs/promises                 (sem disco)
// - child_process              (sem subprocess)
// - net.createServer           (sem raw TCP, só fetch)
// - Libs que compilam nativas  (sharp, canvas puro, bcrypt binário)
// - setInterval longo           (isolate pode ser reciclado)
// - require('node:*')          (subset limitado)

// ✅ O que existe (Web Platform + extensões):
// - fetch, Request, Response, Headers, URL
// - crypto.subtle (WebCrypto)
// - Streams (ReadableStream, WritableStream)
// - WebSocket (CF Workers, Durable Objects)
// - AsyncLocalStorage (AL Node compat layer)`}</CodeBlock>
        <Callout tone="info">
          Cloudflare Workers hoje tem "Node compat" (flag nodejs_compat) que emula node:buffer, node:stream, crypto, process etc. Cobre ~70% de libs Node populares. Quando lib usa child_process ou fs real, não tem jeito.
        </Callout>
      </Section>

      <Section title="Patterns edge vs origin" accent={accent}>
        <CodeBlock lang="ts">{`// Edge faz bem:
// - Autenticação (validar JWT com JWKs cacheado)
// - A/B testing e feature flags (decisão em ms)
// - Geo-routing (Accept-Language, CF-IPCountry)
// - Rewrite/redirect com regras dinâmicas
// - SSR de páginas com dados cacheáveis
// - Image transforms (Cloudflare Images, Vercel Image)
// - Rate limiting (com Durable Objects)

// Origin (Lambda/Fargate/EC2/container) faz bem:
// - DB writes (queries longas, transações)
// - Processing pesado (ML inference, video, ETL)
// - SDK proprietário / libs nativas
// - Conexões persistentes específicas (gRPC bidirectional)
// - Cron jobs longos (batch analytics)`}</CodeBlock>
      </Section>

      <Section title="Arquitetura híbrida moderna" accent={accent}>
        <Callout tone="success" icon="✅">
          Padrão 2026: CDN de assets + edge worker como "front controller" (auth, rewrite, A/B, cache) + API centralizada em uma ou duas regiões + database primário em região próxima da maioria dos users + réplicas read em edge (D1, Neon, Turso, PlanetScale read-only regions). Edge não substitui origin — orquestra tráfego e absorve lógica curta.
        </Callout>
      </Section>

      <Section title="Quando evitar edge" accent={accent}>
        <Callout tone="warn">
          Se toda operação precisa de DB em outra região, latência edge→DB + DB→edge pode ficar PIOR que cliente→origin direto (3 round-trips vs 1). Mede antes de migrar. Também evite se seu time não tem familiaridade com Web Platform APIs — debugging Workers sem fs/child_process é experiência diferente do Node tradicional.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
