import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('deno-deploy-bun');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a proposta central do Deno em relação a Node?',
    options: [
      'Só TS first',
      'Secure by default (permissões explícitas pra fs/net/env), TS/JSX nativo sem config, web platform APIs como padrão (fetch, Response), lib stdlib coesa, package imports por URL ou JSR — elimina node_modules hell',
      'Mais rápido',
      'Mesma coisa',
    ],
    correct: 1,
    explanation: 'Deno foi desenhado pelos mesmos autores do Node (Ryan Dahl) pra corrigir arrependimentos: segurança opt-in (--allow-net=example.com), toolchain embutido (fmt, lint, test, bundle), TS nativo, sem node_modules gigante. JSR (registry moderno) substitui npm com semver + provenance. Não é "Node mais rápido" — é modelo mental diferente.',
  },
  {
    question: 'Onde Bun brilha versus Node?',
    options: [
      'Nada muda',
      'Bun é runtime em Zig/JavaScriptCore, 2-4x mais rápido em startup e I/O, com bundler/test runner/package manager integrados; ideal pra dev experience (bun install 10x mais rápido que npm), scripts e workers I/O-heavy',
      'Só em produção',
      'Substitui Node',
    ],
    correct: 1,
    explanation: 'Bun combina Node-compat (roda maioria do ecossistema npm), tooling all-in-one (bun install, bun test, bun build), performance real em startup e I/O. Deploy em prod ainda é território em evolução (estabilidade de edge cases). Em 2026 usado bastante em: monorepo dev speed, scripts CLI, workers dedicados. Cabe se você quer velocidade máxima de ciclo dev.',
  },
  {
    question: 'Quando NÃO migrar pra Deno/Bun?',
    options: [
      'Sempre migrar',
      'Quando ecossistema de libs depende de APIs Node específicas (child_process heavy, addons nativos proprietários), quando o time não tem bandwidth pra lidar com bugs de compat raros, ou quando infra CI/CD é toda desenhada pra Node (Dockerfile, actions, observability)',
      'Nunca migrar',
      'Só legados',
    ],
    correct: 1,
    explanation: 'Migration custa: node-gyp addons podem falhar, libs raramente usadas quebram em edge cases, debugging muda. ROI vale quando ganho concreto (perf, DX, security). Serviço novo greenfield? Vale experimentar. Monolito em produção 5 anos com CI maduro? Provavelmente não. Avalie incremental — pacote isolado primeiro, não a app inteira de uma vez.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="deno-deploy-bun"
      title="Deno Deploy e Bun runtime"
      icon="🦕"
      xp={55}
      readTime={13}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="lambda-edge-cloudfront"
      nextTitle="Lambda@Edge e CloudFront Functions"
      quiz={quiz}
    >
      <Section title="Contexto: três alternativas ao Node" accent={accent}>
        <p>
          2026 tem pelo menos três runtimes JS maduros: Node (padrão histórico), Deno (TS-first, secure by default, global edge via Deno Deploy), Bun (Zig, speed focused, all-in-one). Cada um resolve dores diferentes. Entender trade-offs é mais útil que torcer por time.
        </p>
      </Section>

      <Section title="Deno em 60 segundos" accent={accent}>
        <CodeBlock lang="ts">{`// main.ts — roda sem config, sem tsconfig
import { serve } from 'jsr:@std/http';

serve((req) => {
  const url = new URL(req.url);
  return Response.json({ path: url.pathname, user: Deno.env.get('USER') });
});

// Execução com permissões granulares:
// deno run --allow-net --allow-env=USER main.ts

// Sem --allow-net, tentar abrir servidor falha em runtime com mensagem clara.
// Sem --allow-env, Deno.env.get retorna undefined.`}</CodeBlock>
      </Section>

      <Section title="Deno Deploy: edge global nativo" accent={accent}>
        <CodeBlock lang="ts">{`// Deno Deploy roda seu main.ts em 40+ regions globais.
// Deploy via GitHub integration ou "deployctl deploy".

// KV built-in (strong consistency global em beta):
const kv = await Deno.openKv();
await kv.set(['posts', 'abc'], { label: 'Hello' });
const entry = await kv.get(['posts', 'abc']);

// Queues:
await kv.enqueue({ kind: 'sendEmail', to: 'user@ffv.com' });
kv.listenQueue(async (msg: any) => {
  if (msg.kind === 'sendEmail') { /* ... */ }
});`}</CodeBlock>
        <Callout tone="info">
          Deno Deploy tem cold start comparável a Cloudflare Workers (~1-5ms), KV distribuído, Queues nativas. Ecossistema menor que Workers, mas DX TS-first é impecável pra quem curte.
        </Callout>
      </Section>

      <Section title="Bun: velocidade + DX" accent={accent}>
        <CodeBlock lang="ts">{`// server.ts
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('ola, ' + new URL(req.url).pathname);
  },
});

// Tooling tudo-em-um:
// bun install   (10x mais rápido que npm, compat package.json)
// bun run dev   (runner de scripts)
// bun test      (test runner built-in, sem vitest/jest)
// bun build     (bundler pra web ou server)
// bun --hot     (hot reload nativo)

// SQLite nativo:
import { Database } from 'bun:sqlite';
const db = new Database('app.db');
const rows = db.query('SELECT * FROM notes WHERE id = ?').all(42);`}</CodeBlock>
      </Section>

      <Section title="Benchmarks realistas" accent={accent}>
        <CodeBlock lang="ts">{`// Startup time (hello world HTTP server):
// Node 22:  ~80ms
// Deno 2:   ~40ms
// Bun 1.1:  ~20ms

// Package install (500 deps típicas de app Next):
// npm:      45s
// pnpm:     20s
// bun:       6s

// Throughput (requests/s em GET simples):
// Node:     ~45k
// Deno:     ~60k
// Bun:     ~110k

// Observação: benchmarks sempre dependem de carga real.
// App com Prisma + Postgres geralmente é bottlenecked por DB, não runtime.`}</CodeBlock>
      </Section>

      <Section title="Compat com ecossistema npm" accent={accent}>
        <Callout tone="warn">
          Deno lê package.json + npm: imports (funcional). Bun tem compat ~95% com Node APIs. Ambos quebram com: addons nativos sem binário Bun/Deno pré-compilado, libs que usam APIs obscuras do Node (worker_threads edge cases, vm module), scripts postinstall complexos. Teste seu package.json em runtime alvo antes de mergulhar.
        </Callout>
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <Callout tone="success" icon="✅">
          Greenfield pequeno, TS puro, API HTTP: Deno Deploy. Monorepo com muitos scripts + testes: Bun pra DX. API serverless global com muitos bindings de DB/storage: Cloudflare Workers. Enterprise com ecossistema Node maduro: Node + edge específico (Lambda@Edge, Vercel). Não existe um só vencedor — arquitetura moderna combina runtimes conforme o fit.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
