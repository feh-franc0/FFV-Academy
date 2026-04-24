import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-harness-testes-produto-real');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a estratégia pra CI testing ser rápido?',
    options: [
      'Só rodar unit',
      'Paralelismo + cache inteligente. Jobs independentes rodam concorrentes. Cache de node_modules, testcontainers images, build artifacts. Test distribution (Jest shard, vitest --shard)',
      'Reduzir testes',
      'Pagar mais runner',
    ],
    correct: 1,
    explanation: 'GitHub Actions (ou similar): matrix strategy pra paralelizar. Actions cache pra dependencies. Retry automático pra flakiness residual. Target: PR completo em < 10min. Vitest e Jest suportam --shard pra dividir suite entre N runners.',
  },
  {
    question: 'Quando rodar mutation testing em vez de só unit/integration?',
    options: [
      'Sempre',
      'Nightly (ou weekly) — demora demais pra PR. Mede qualidade dos tests ao longo do tempo; regressão em mutation score é sinal de testes fracos novos',
      'Nunca',
      'Só em demo',
    ],
    correct: 1,
    explanation: 'Mutation custo × valor: rodar a cada PR inviável (10-100x tempo de test normal). Nightly com relatório em Slack/dashboard; baseline score; alert se score cair. Job separado, não bloqueante, mas monitorado.',
  },
  {
    question: 'Qual é o papel de smoke test em produção?',
    options: [
      'Substituir integration',
      'Testes MÍNIMOS (5-10 cenários) que rodam PÓS-DEPLOY validando health básico. Se falham, rollback automático. Diferente de e2e completos — smoke é rápido e sempre executa',
      'Só em dev',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Smoke = "smoke detector" — detecta fogo antes da casa queimar. Post-deploy: "API responde /healthz? User consegue logar? Checkout completa?". 5 cenários em < 30s. Se falha, CodeDeploy/Argo faz rollback automático. Complementar ao e2e full.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-harness-testes-produto-real"
      title="Capstone: harness de testes completo pra um produto"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="Testing Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto" accent={accent}>
        <p>
          Pegue um app (próprio ou open-source médio) e construa harness completo em 6 camadas:
        </p>
      </Section>

      <Section title="Estrutura" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/test.yml
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm vitest run --coverage

  integration:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, ports: ['5432:5432'] }
      redis: { image: redis:7 }
    steps:
      - run: pnpm test:integration

  contract:
    runs-on: ubuntu-latest
    steps:
      - run: pact-broker publish pacts/
      - run: pact-provider-verifier

  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix: { shard: [1, 2, 3, 4] }
    steps:
      - run: pnpm playwright test --shard=\${{ matrix.shard }}/4

  perf-budget:
    runs-on: ubuntu-latest
    steps:
      - run: k6 run --threshold "p95<500" scripts/smoke.js

# Job weekly (cron):
  mutation:
    runs-on: ubuntu-latest
    steps:
      - run: npx stryker run
      - run: ./check-mutation-baseline.sh`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Unit (vitest) com cobertura &gt; 80% em módulos críticos</li>
          <li>Integration (testcontainers) pra DB + cache</li>
          <li>Contract (Pact) se microservices</li>
          <li>E2E (Playwright) — 5-10 fluxos críticos, sharded</li>
          <li>Property-based (fast-check) em funções puras</li>
          <li>Mutation (Stryker) nightly com baseline</li>
          <li>Perf (k6) com budget em CI</li>
          <li>Smoke test post-deploy com auto-rollback</li>
        </ul>
        <Callout tone="success" icon="🎓">
          Entregável: repo com CI verde, coverage badge, mutation score &gt; 75%, relatório de perf. Isso é qualidade engineering real — não marketing.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
