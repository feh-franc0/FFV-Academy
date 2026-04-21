import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vercel-edge-functions');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Diferença entre Edge Runtime e Node Runtime no Next.js?',
    options: [
      'Só marketing',
      'Edge Runtime é subset da Web Platform (fetch, Request, crypto.subtle) rodando em V8 isolates globalmente; Node Runtime é Node.js completo em regiões AWS — edge tem cold start quase zero e limits mais apertados (sem fs, sem binários nativos)',
      'Edge é mais lento',
      'Node tem menos libs',
    ],
    correct: 1,
    explanation: 'Você escolhe por rota/middleware via export const runtime = "edge" ou "nodejs". Edge: middleware, APIs leves, SSR latency-sensitive. Node: rotas que usam Prisma com driver TCP, libs que compilam nativo (sharp), operações longas. Vercel permite misturar — middleware edge + API node + página SSR edge.',
  },
  {
    question: 'ISR (Incremental Static Regeneration) — o que faz?',
    options: [
      'Só build time',
      'Gera página estática no build (fast), revalida on-demand (revalidateTag, revalidatePath) ou por tempo (revalidate: 60); primeira request após revalidate recebe resposta stale imediata, background re-renderiza',
      'Renderiza em runtime sempre',
      'Só redireciona',
    ],
    correct: 1,
    explanation: 'ISR combina vantagem de estático (TTFB baixíssimo via CDN) com frescor controlado. Cada página tem timestamp/tag; após TTL ou invalidation explícita, próxima request dispara re-gen em background. Antiga continua servindo durante — zero downtime de build. Ideal pra blog, e-commerce, docs: atualiza sem redeploy.',
  },
  {
    question: 'Streaming SSR no Edge Runtime traz qual ganho real?',
    options: [
      'Nenhum',
      'Enviar HTML em chunks conforme componentes resolvem (Suspense boundaries); shell aparece em ~50ms, conteúdo async chega depois — TTFB drop dramático mesmo com data fetching caro',
      'Só estilo',
      'Só em dev',
    ],
    correct: 1,
    explanation: 'SSR clássico espera data 100% pronto antes de mandar byte. Streaming + Suspense: server manda shell HTML com placeholders de &lt;Suspense fallback&gt;; quando dado chega, manda chunk HTML substituindo fallback + script que swap DOM. User vê navbar e skeleton em 50ms, conteúdo em 300ms — percepção de velocidade grande. React Server Components orquestra isso nativamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vercel-edge-functions"
      title="Vercel Edge Functions + ISR"
      icon="▲"
      xp={55}
      readTime={13}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="deno-deploy-bun"
      nextTitle="Deno Deploy e Bun runtime"
      quiz={quiz}
    >
      <Section title="Dois runtimes na mesma app" accent={accent}>
        <p>
          Vercel permite decidir por rota/handler qual runtime usar. Middleware sempre edge. Page/API podem ser edge ou node. Você mistura conforme a natureza do código: auth check no edge, query Prisma em node, página estática com ISR.
        </p>
        <CodeBlock lang="ts">{`// app/api/geo/route.ts — edge
export const runtime = 'edge';
export async function GET(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') ?? 'BR';
  return Response.json({ country });
}

// app/api/checkout/route.ts — node (Stripe SDK, Prisma)
export const runtime = 'nodejs';
export async function POST(req: Request) {
  // lib nativa que não roda em edge
}`}</CodeBlock>
      </Section>

      <Section title="Middleware edge: gate universal" accent={accent}>
        <CodeBlock lang="ts">{`// middleware.ts — roda em TODO request (edge, ~10-30ms)
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Auth check sem bater em origin
  const token = req.cookies.get('session')?.value;
  if (!token && req.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // A/B assign
  if (!req.cookies.get('variant')) {
    const variant = Math.random() < 0.5 ? 'a' : 'b';
    const res = NextResponse.next();
    res.cookies.set('variant', variant, { maxAge: 30 * 24 * 3600 });
    return res;
  }

  return NextResponse.next();
}

export const config = { matcher: ['/app/:path*', '/((?!_next/static).*)'] };`}</CodeBlock>
      </Section>

      <Section title="ISR: estático vivo" accent={accent}>
        <CodeBlock lang="tsx">{`// app/blog/[slug]/page.tsx
export const revalidate = 300; // 5 minutos

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await fetch('https://cms/api/posts/' + params.slug, {
    next: { tags: ['post:' + params.slug] },
  }).then(r => r.json());

  return <article dangerouslySetInnerHTML={{ __html: post.html }} />;
}

// Invalidação on-demand em webhook do CMS:
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
export async function POST(req: Request) {
  const { slug } = await req.json();
  revalidateTag('post:' + slug);
  return Response.json({ ok: true });
}`}</CodeBlock>
      </Section>

      <Section title="Streaming SSR com Suspense" accent={accent}>
        <CodeBlock lang="tsx">{`import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </div>
  );
}

// Feed e Sidebar podem ser async Server Components — resolvem em paralelo,
// shell HTML sai em ~50ms, chunks chegam depois conforme data.`}</CodeBlock>
      </Section>

      <Section title="Caching de fetch server-side" accent={accent}>
        <CodeBlock lang="ts">{`// fetch no Next tem cache layer integrado
// Default: cache persistente (equivalente getStaticProps antigo)
const a = await fetch(url); // cache: 'force-cache'

// Sem cache (SSR fresco a cada request)
const b = await fetch(url, { cache: 'no-store' });

// Cache com revalidate time
const c = await fetch(url, { next: { revalidate: 60 } });

// Cache com tags (pra revalidateTag)
const d = await fetch(url, { next: { tags: ['user:42'] } });`}</CodeBlock>
      </Section>

      <Section title="Observabilidade e logs" accent={accent}>
        <Callout tone="info">
          Vercel Analytics (Web Vitals automático), Log Drains (push logs pra Datadog/Axiom/Logtail), Speed Insights. Edge Functions têm log console.log visível no dashboard + via CLI (<code>vercel logs</code>). Pra production real, configure log drain — logs da Vercel expiram rápido.
        </Callout>
      </Section>

      <Section title="Custos e limites" accent={accent}>
        <Callout tone="warn">
          Edge: 1M invocations grátis Hobby; 1M depois ~$2. Middleware invocation cobra por request, então matcher mal definido explode conta. Node Functions têm duration limit (30s Hobby, 300s Pro). ISR on-demand revalidation tem quota. Em apps de tráfego alto, compare Vercel vs Cloudflare Workers direto — mesmos padrões, preços muito diferentes em escala.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
