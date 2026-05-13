import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('performance-testing');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre load, stress e soak tests?',
    options: [
      'Nomes diferentes',
      'Load: carga esperada (SLA). Stress: além do esperado até quebrar (descobre limite). Soak: carga normal por MUITAS horas (24h+) pra pegar memory leak, DB connection exhaust',
      'São iguais',
      'Só stress importa',
    ],
    correct: 1,
    explanation: 'Load: "suporta o esperado?". Stress: "em que ponto quebra?". Soak: "aguenta 24h sem degradar?". Spike: "aguenta burst súbito?". Cada um pega tipo diferente de problema. Soak especialmente valioso — memory leaks só aparecem em long runs.',
  },
  {
    question: 'Por que k6 é preferido em 2026 vs JMeter/Locust?',
    options: [
      'Moda',
      'Scripts em JavaScript (dev-friendly), binary Go (eficiente — uma instância simula milhares VUs), integra nativamente com Prometheus/Grafana, cloud service gerenciado',
      'Mais features',
      'JMeter é deprecated',
    ],
    correct: 1,
    explanation: 'k6 (Grafana Labs, 2017) virou default em load testing moderno. JS/TS pra scripts (ex: dev escreve cenário familiar). Binary Go escalável. Cloud platform pra run distribuído. JMeter ainda vale em legacy Java; Locust em Python-heavy; Artillery em YAML-simples.',
  },
  {
    question: 'O que "perf budget" significa em CI?',
    options: [
      'Budget financeiro',
      'Limites automatizados: p99 < 500ms, LCP < 2.5s, bundle < 300kb. CI FALHA se mudança piora além do budget. Evita regressão gradual de performance',
      'Só pra frontend',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Sem budget, perf degrada silenciosamente — "só mais 10ms" × 50 PRs = 500ms a mais em 1 ano. Lighthouse-ci, web-vitals-budget, artillery/k6 com thresholds. Budgets por rota/endpoint. Cultura: melhorar é bônus; piorar bloqueia PR.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="performance-testing"
      title="Performance testing: k6, artillery e perf budgets"
      icon="⚡"
      xp={55}
      readTime={12}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="capstone-harness-testes-produto-real"
      nextTitle="Capstone: harness de testes completo pra um produto"
      quiz={quiz}
    >
      <Section title="Tipos de perf test" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Carga', 'Objetivo']}
          rows={[
            ['Load', 'Esperada (SLA)', 'Confirma que aguenta'],
            ['Stress', 'Escalonando além', 'Descobrir breaking point'],
            ['Soak', 'Normal, por 24h+', 'Memory leak, connection exhaust'],
            ['Spike', 'Burst súbito', 'Autoscaling, rate limit'],
            ['Volume', 'Muitos dados (DB grande)', 'Query perf em escala real'],
          ]}
        />
      </Section>

      <Section title="k6 script exemplo" accent={accent}>
        <CodeBlock lang="typescript">{`import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // ramp to 100 VUs
    { duration: '5m', target: 100 },  // stay at 100
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],  // < 1% errors
  },
};

export default function () {
  const res = http.get('https://api.app.com/users');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

// Rodar: k6 run --out experimental-prometheus-rw script.js
// Output em Grafana dashboard`}</CodeBlock>
      </Section>

      <Section title="Perf budget em CI" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/perf.yml
- name: k6 smoke test
  run: |
    k6 run --quiet \\
      --out json=results.json \\
      scripts/smoke.js
- name: Check budget
  run: |
    p99=$(jq '.metrics.http_req_duration.values."p(99)"' results.json)
    if (( $(echo "$p99 > 500" | bc -l) )); then
      echo "p99 $p99ms > budget 500ms" && exit 1
    fi`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Pra frontend: Lighthouse-ci com budget.json. LCP &lt; 2.5s, FID &lt; 100ms, CLS &lt; 0.1. Bundle size com bundlewatch. PR bloqueia se regressão.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
