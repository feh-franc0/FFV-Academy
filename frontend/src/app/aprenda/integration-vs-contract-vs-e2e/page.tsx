import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('integration-vs-contract-vs-e2e');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que test-containers permite?',
    options: [
      'Containerizar testes',
      'Rodar dependencies REAIS (Postgres, Redis, Kafka) em Docker containers efêmeros em CI — teste usa DB real, não mock. Descarta ao fim. Mais lento mas confiança alta',
      'Substitui Docker',
      'Só pra produção',
    ],
    correct: 1,
    explanation: 'testcontainers (Java/Node/Python/etc) sobe container, aguarda health, retorna connection string. Integration test usa Postgres real. Evita divergência mock↔real. Trade-off: ~200-500ms de setup por test suite. Ganho: pega bugs de SQL, migrations, transactions que mock nunca pegaria.',
  },
  {
    question: 'Qual o valor principal de contract testing (Pact)?',
    options: [
      'Substitui integration',
      'Consumer escreve expectations; Provider verifica contra implementação — se provider muda shape, Provider test falha ANTES de deploy. Catches breaking changes antes de produção',
      'Substitui unit',
      'Nada',
    ],
    correct: 1,
    explanation: 'Consumer-driven contracts: frontend/mobile (consumer) escreve "espero POST /users retornar {id, email}". Gera contract file. Backend (provider) roda teste que bate — se mudou shape, falha no CI do provider. Bridgework entre times independentes.',
  },
  {
    question: 'Por que e2e tests ficaram a reputação de "flaky"?',
    options: [
      'Bug em Playwright',
      'Dependências: browser real, rede, timing (element demora pra aparecer), shared state, ordem não-determinística. Flaky = passa às vezes, falha às vezes sem mudança. Solução: retry + escopo pequeno + test data isolada',
      'Deprecated',
      'Só em Selenium',
    ],
    correct: 1,
    explanation: 'E2E flakiness é top reclamação em teams. Causas: wait by fixed timer (use getByRole com retry implícito), shared DB/state entre testes, network instability, ordem dependente. Playwright (2020+) reduziu bastante com auto-wait e isolation. Mas nunca elimina — mantenha escopo mínimo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="integration-vs-contract-vs-e2e"
      title="Integration, contract, e2e: fronteiras claras"
      icon="🔗"
      xp={55}
      readTime={12}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="performance-testing"
      nextTitle="Performance testing: k6, artillery e perf budgets"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Escopo', 'Velocidade', 'Confiança']}
          rows={[
            ['Unit', '1 função/classe', '⚡⚡⚡ ms', 'Baixa-Média'],
            ['Integration', 'Módulos + infra real (testcontainers)', '⚡ 100ms-1s', 'Alta'],
            ['Contract', 'API entre serviços', '⚡⚡ ms', 'Alta (pra breaking change)'],
            ['E2E', 'App inteiro via UI', '🐌 segundos-minutos', 'Alta mas flaky'],
          ]}
        />
      </Section>

      <Section title="Integration com testcontainers" accent={accent}>
        <CodeBlock lang="typescript">{`import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, afterAll, test } from 'vitest';

let container: StartedPostgreSqlContainer;
let dbUrl: string;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  dbUrl = container.getConnectionUri();
  // run migrations
});

afterAll(() => container.stop());

test('user can save and retrieve', async () => {
  const db = createDb(dbUrl);
  await db.user.create({ email: 'a@b.co' });
  const found = await db.user.findByEmail('a@b.co');
  expect(found).toBeDefined();
});`}</CodeBlock>
      </Section>

      <Section title="Pact contract test" accent={accent}>
        <CodeBlock lang="typescript">{`// Consumer (frontend) — define contract
pact
  .given('user 1 exists')
  .uponReceiving('GET user by id')
  .withRequest({ method: 'GET', path: '/users/1' })
  .willRespondWith({
    status: 200,
    body: { id: Matchers.like('1'), email: Matchers.like('a@b.co') },
  });

// Pact publica contract file
// Provider (backend) roda teste lendo contract
// Se backend não cumpre, CI falha ANTES de deploy`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra prática: unit (muito), integration com testcontainers (médio), contract entre services (sempre que microservice), e2e (poucos — só smoke dos fluxos críticos).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
