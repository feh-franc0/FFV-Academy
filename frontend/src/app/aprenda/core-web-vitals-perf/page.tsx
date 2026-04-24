import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('core-web-vitals-perf');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que INP substituiu FID em 2024 nos Core Web Vitals?',
    options: [
      'Marketing',
      'FID (First Input Delay) só media o delay da PRIMEIRA interação — benchmark fácil de jogar. INP (Interaction to Next Paint) mede a pior interação ao longo da sessão: reflete experiência real. Se qualquer clique, typing ou tap trava, INP pega. FID não pegava',
      'Sem motivo',
      'FID ficou mais rápido',
    ],
    correct: 1,
    explanation: 'FID era otimizável com truques: defer tudo, pagar preço depois. INP mede interação máxima do usuário na sessão — não tem como esconder. Threshold: bom &lt;200ms, ruim &gt;500ms. INP mudou prioridades reais: long tasks em event handlers, React renders pesados, componentes mal memoizados passaram a doer nos números.',
  },
  {
    question: 'Qual a diferença entre lab data (Lighthouse) e RUM (field data)?',
    options: [
      'Nenhuma',
      'Lab: roda em ambiente controlado (Lighthouse, WebPageTest) com device/rede simulados. Útil em CI mas NÃO representa usuários reais. RUM (Real User Monitoring): coleta métricas de usuários de verdade via web-vitals.js + beacon. CrUX (Chrome User Experience Report) é RUM do Google. Só RUM decide se seu site passa no Core Web Vitals do Search',
      'Lab é melhor',
      'RUM é só para analytics',
    ],
    correct: 1,
    explanation: 'Lab é reproduzível e ótimo para CI. RUM é a verdade sobre seus usuários (devices low-end, 4G instável, aba em background). Google ranking usa RUM (CrUX), não Lighthouse. Produto sério mede os dois: Lighthouse CI em PR para prevenção + RUM em prod para realidade.',
  },
  {
    question: 'Qual a forma mais impactante de melhorar LCP (Largest Contentful Paint)?',
    options: [
      'Comprimir CSS',
      'Otimizar a imagem hero / elemento LCP: dimensões corretas (srcset), formato moderno (AVIF/WebP), preload (<link rel="preload" as="image" fetchpriority="high">), e garantir que não é font-dependent. LCP é quase sempre uma imagem grande ou um bloco de texto aguardando fonte externa',
      'Minificar JS',
      'Remover imagens',
    ],
    correct: 1,
    explanation: 'LCP é dominado pelo maior elemento above-the-fold — geralmente hero image ou heading. Imagem: AVIF (50% menor que JPEG), srcset por viewport, fetchpriority=high, loading eager (NÃO lazy no hero). Texto: preload font + font-display swap. Isso move LCP mais que qualquer "otimização geral".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="core-web-vitals-perf"
      title="Core Web Vitals e performance budget"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="capstone-app-completo-ssr"
      nextTitle="Capstone: app completo com SSR + streaming + perf"
      quiz={quiz}
    >
      <Section title="O que Google mede" accent={accent}>
        <p>
          Core Web Vitals em 2026 são três: <strong>LCP</strong> (Largest Contentful Paint), <strong>INP</strong> (Interaction to Next Paint, substituiu FID em 2024) e <strong>CLS</strong> (Cumulative Layout Shift). Google Search usa thresholds de 75º percentil em RUM como sinal de ranking. Ignorar é deixar dinheiro na mesa.
        </p>
      </Section>

      <Section title="Thresholds" accent={accent}>
        <CodeBlock lang="yaml">{`LCP:
  bom: < 2.5s
  precisa_melhorar: 2.5s - 4s
  ruim: > 4s

INP:
  bom: < 200ms
  precisa_melhorar: 200ms - 500ms
  ruim: > 500ms

CLS:
  bom: < 0.1
  precisa_melhorar: 0.1 - 0.25
  ruim: > 0.25

# Todas medidas no 75º percentil de RUM.
# Mobile e desktop são avaliados separadamente.`}</CodeBlock>
      </Section>

      <Section title="LCP: a batalha é no elemento hero" accent={accent}>
        <CodeBlock lang="html">{`<!-- Preload do hero image -->
<link rel="preload" as="image" href="/hero.avif"
      imagesrcset="/hero-480.avif 480w, /hero-768.avif 768w, /hero-1200.avif 1200w"
      imagesizes="100vw"
      fetchpriority="high" />

<!-- Hero image com srcset + AVIF + loading eager -->
<img src="/hero-768.avif"
     srcset="/hero-480.avif 480w, /hero-768.avif 768w, /hero-1200.avif 1200w"
     sizes="100vw"
     alt="..."
     fetchpriority="high"
     loading="eager"
     width="1200" height="800" />

<!-- Font crítica: preload + font-display swap -->
<link rel="preload" as="font" href="/inter.woff2" type="font/woff2" crossorigin />
<style>
  @font-face {
    font-family: Inter;
    src: url('/inter.woff2') format('woff2');
    font-display: swap;
  }
</style>`}</CodeBlock>
      </Section>

      <Section title="INP: onde long tasks doem" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ event handler pesado trava interação
button.addEventListener('click', () => {
  const data = parseHugeJSON(payload); // 300ms
  render(data);
});

// ✅ quebre trabalho com scheduler + yield
import { scheduler } from 'node:timers';

async function chunked<T>(items: T[], work: (t: T) => void) {
  for (const batch of chunk(items, 500)) {
    for (const item of batch) work(item);
    // cede para browser: input urgente pode preemptar
    await new Promise((r) => setTimeout(r, 0));
  }
}

// ✅ useTransition em React esconde render pesado de dentro do INP
startTransition(() => setExpensiveState(next));

// ✅ move CPU-bound para Worker
const worker = new Worker(new URL('./parser.js', import.meta.url), { type: 'module' });
worker.postMessage(payload);
worker.onmessage = (e) => render(e.data);`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Long tasks (&gt;50ms) bloqueiam main thread e matam INP. Use Performance API para medir:{' '}
          <code>{`new PerformanceObserver((list) => ...).observe({ type: 'longtask', buffered: true })`}</code>. Em React, renders grandes aparecem aqui.
        </Callout>
      </Section>

      <Section title="CLS: reservar espaço é tudo" accent={accent}>
        <CodeBlock lang="html">{`<!-- Imagem com dimensões explícitas — browser reserva espaço -->
<img src="..." alt="..." width="400" height="300" />

<!-- aspect-ratio em CSS quando width/height não são fixos -->
<style>
  .hero { aspect-ratio: 16 / 9; width: 100%; }
</style>

<!-- Placeholder de font com size-adjust / ascent-override reduz CLS -->
<style>
@font-face {
  font-family: Inter;
  src: url('/inter.woff2') format('woff2');
  font-display: swap;
  size-adjust: 107%;
  ascent-override: 90%;
}
</style>

<!-- Nunca inserir banner acima de conteúdo depois do paint -->`}</CodeBlock>
      </Section>

      <Section title="Medindo RUM: web-vitals.js" accent={accent}>
        <CodeBlock lang="ts">{`import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals/attribution';

function sendToBackend(metric: { name: string; value: number; attribution: unknown }) {
  // Use beacon para garantir envio mesmo no unload
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name,
    value: metric.value,
    url: location.pathname,
    conn: (navigator as any).connection?.effectiveType,
    device: innerWidth > 900 ? 'desktop' : 'mobile',
    // attribution traz qual elemento causou (LCP element, long task source)
    attribution: metric.attribution,
  }));
}

onLCP(sendToBackend);
onINP(sendToBackend);
onCLS(sendToBackend);
onTTFB(sendToBackend);
onFCP(sendToBackend);`}</CodeBlock>
      </Section>

      <Section title="Performance budget em CI" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/perf.yml
name: Performance
on: pull_request

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/produto/abc
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true`}</CodeBlock>
        <CodeBlock lang="json">{`// lighthouse-budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "interaction-to-next-paint", "budget": 200 },
      { "metric": "cumulative-layout-shift", "budget": 100 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "total", "budget": 800 }
    ]
  }
]`}</CodeBlock>
      </Section>

      <Section title="Resource hints e estratégia de loading" accent={accent}>
        <CodeBlock lang="html">{`<!-- DNS/TCP para domínio crítico de asset -->
<link rel="preconnect" href="https://cdn.exemplo.com" crossorigin />

<!-- Prefetch low priority para rota provável -->
<link rel="prefetch" href="/produto/abc" />

<!-- Priority hints -->
<img src="decorativo.jpg" fetchpriority="low" loading="lazy" />
<img src="hero.jpg" fetchpriority="high" />

<!-- module preload para JS crítico -->
<link rel="modulepreload" href="/app/critical.js" />`}</CodeBlock>
      </Section>

      <Section title="Fechamento" accent={accent}>
        <Callout tone="success" icon="✅">
          Core Web Vitals é SEO: LCP, INP, CLS em 75º percentil RUM. LCP se ganha no hero image + font. INP cai quando você quebra long tasks e move CPU para Worker. CLS some reservando dimensões. Meça com web-vitals.js em prod, budget em Lighthouse CI no PR. Ter budget faz você dizer não a feature que quebra performance — a conversa fica objetiva.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
