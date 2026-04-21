import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('test-pyramid-realista');
const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que test pyramid clássica (muitos unit, poucos E2E) ainda faz sentido em 2026?',
    options: [
      'Tradição',
      'Unit tests: rápidos (ms), isolados, capturam regressão em lógica. E2E: lentos (segundos), frágeis, mas únicos capazes de validar integração real. Inverter a pirâmide (muitos E2E, poucos unit) = CI lento + flakiness devastadora',
      'Unit é mais preciso',
      'E2E não funciona',
    ],
    correct: 1,
    explanation: 'Pirâmide: unit (70%), integration (20%), E2E (10%). Motivos matemáticos: (1) unit em ms roda toda compilação — feedback imediato; E2E em segundos só roda em CI/pre-release. (2) Unit isola a falha (qual função?); E2E diz "falhou em algum lugar". (3) E2E flaky (network, timing) bloqueia CI se for maioria. Ice-cream cone (inversão) é anti-pattern.',
  },
  {
    question: 'Qual a crítica legítima à test pyramid, e qual a resposta moderna?',
    options: [
      'Pirâmide é sempre ruim',
      'Crítica: unit tests com muito mock testam a própria mock, não a realidade. Resposta moderna (testing trophy / diamond): mais integration tests com DB real em Docker, menos mocks. Pirâmide ainda certa no formato, conteúdo de cada camada evoluiu',
      'Deveriam ser todos E2E',
      'Crítica inválida',
    ],
    correct: 1,
    explanation: 'Kent C. Dodds (testing trophy) e outros argumentam: muitos unit com mock testam contratos imaginários. Moderno = preferir integration tests com serviço real (Testcontainers, Docker Compose) sobre mocks excessivos. A pirâmide permanece (unit ainda é base, E2E ainda é topo fino), mas o meio (integration) ganhou peso. "Testing diamond": menos unit-com-mock, mais integration real.',
  },
  {
    question: 'Quando usar E2E test em vez de integration test?',
    options: [
      'Sempre',
      'Quando a jornada cruza múltiplos serviços/UIs (ex: user cria conta → recebe email → confirma → faz primeiro pagamento) e você precisa validar a experiência completa. Integration test cobre 1 serviço + deps; E2E cobre fluxo de negócio',
      'Nunca',
      'Só em produção',
    ],
    correct: 1,
    explanation: 'E2E é caro (lento, flaky), então reserve pras jornadas críticas de negócio: fluxo de checkout, onboarding, recovery de senha. Cada E2E deve responder "se isso quebra, usuário sente HOJE". Se resposta é "talvez" — vira integration. Típico: 5-15 E2E críticos + centenas de integration + milhares de unit.',
  },
  {
    question: 'Por que "cobertura de 100%" não é objetivo saudável?',
    options: [
      '100% é impossível',
      '100% de cobertura de linhas não garante qualidade — você pode testar código óbvio e deixar lógica complexa sem teste. Melhor: 80-90% como guardrail, mas com foco em caminhos de negócio críticos e edge cases (null, empty, overflow)',
      'Demora muito',
      'Chatos de escrever',
    ],
    correct: 1,
    explanation: 'Cobertura é métrica de quantidade, não qualidade. 100% pode esconder tests que só exercitam, não assertam. Melhor: mutation testing (Stryker) mede SE os tests detectariam bugs. Prática madura: gate mínimo (ex: 80%) como guardrail + revisão humana sobre o que realmente está testado. Branch coverage + mutation > line coverage isoladamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="test-pyramid-realista"
      title="Test pyramid realista (e suas críticas modernas)"
      icon="📐"
      xp={55}
      readTime={13}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="tdd-bdd-quando-funcionam"
      nextTitle="TDD e BDD: quando funcionam (e quando não)"
      quiz={quiz}
    >
      <Section title="A pirâmide não é dogma — é trade-off com motivação matemática" accent={accent}>
        <p>
          A pirâmide de testes (Mike Cohn, 2009) sugere: <strong>muitos unit tests na base, menos integration no meio, poucos E2E no topo</strong>. Não é opinião estética — é consequência de 3 propriedades que escalam em direções opostas.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Propriedade', 'Unit', 'Integration', 'E2E']}
          rows={[
            ['Velocidade', '&lt; 10 ms', '100ms-5s', '5s-30s'],
            ['Escopo de falha', 'função ruim', 'módulo quebrado', 'fluxo inteiro falhou'],
            ['Flakiness', 'quase zero', 'média (DB race)', 'alta (network, timing)'],
            ['Debug quando falha', 'fácil (1 função)', 'médio (trace)', 'difícil (onde?)'],
            ['Custo de CI', 'roda em todo commit', 'roda em PR', 'roda em release'],
            ['Confidence em user real', 'baixa', 'média', 'alta'],
          ]}
        />
        <p>
          Se 90% dos tests são E2E, CI leva 30 minutos, flakiness é 5%+ (quase todo run falha por motivo não-relacionado ao código), debug é pesadelo. Por isso a base larga de unit: feedback rápido, isolamento de falha, baixo flakiness.
        </p>
      </Section>

      <Section title="O que cada camada realmente deve testar" accent={accent}>
        <h3 className="font-bold mt-4 mb-2">Unit tests (base da pirâmide)</h3>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Funções puras</strong>: cálculos, transformações, validações. Sem I/O.</li>
          <li><strong>Lógica de negócio</strong>: &quot;se user é premium, desconto = 20%&quot;. Testa a regra, não a integração.</li>
          <li><strong>Edge cases</strong>: null, empty, zero, overflow, Unicode, timezone.</li>
          <li><strong>NÃO testar</strong>: código trivial (getter/setter), framework boilerplate, mocks extensos.</li>
        </ul>

        <h3 className="font-bold mt-4 mb-2">Integration tests (meio — ganhou peso)</h3>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Serviço + DB real</strong> (Testcontainers, Docker Compose). Schema + queries reais.</li>
          <li><strong>API HTTP</strong>: 2-3 endpoints encadeados com DB. Valida contratos.</li>
          <li><strong>Message flow</strong>: publica em Kafka/SQS → consome → grava. Pattern realista.</li>
          <li><strong>NÃO testar</strong>: UI complexa, integrações externas reais (use contract tests).</li>
        </ul>

        <h3 className="font-bold mt-4 mb-2">E2E tests (topo fino)</h3>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Jornadas críticas de negócio</strong>: signup → primeiro pagamento, checkout, password recovery.</li>
          <li><strong>5-15 tests no total</strong> — cada um é caro, cada um deve valer.</li>
          <li><strong>NÃO testar</strong>: variações cosméticas de UI, edge cases (use unit), cada endpoint isolado.</li>
        </ul>
      </Section>

      <Section title="As 3 críticas modernas e como responder" accent={accent}>
        <DecisionBox
          scenario="&quot;Unit tests com mock testam só a mock, não a realidade&quot;"
          winner="Integration test com DB real via Testcontainers"
          winnerColor={accent}
          why="Mocks excessivos testam o contrato imaginado, não o real. Integration test com Postgres em container captura schema drift, queries inválidas, deadlocks — coisas que mock oculta."
          alternatives={[
            { label: 'Mock o DB', note: 'rápido mas testa ficção; risco alto em ORMs complexos' },
            { label: 'DB real em dev pessoal', note: 'flakiness alta, cada dev sofre setup diferente' },
            { label: 'Testcontainers (Docker on-demand)', note: 'padrão moderno; 2-5s por container, worth it' },
          ]}
        />
        <DecisionBox
          scenario="&quot;Frontend moderno muda rápido, unit test quebra toda semana&quot;"
          winner="Component tests + visual regression, menos unit granular"
          winnerColor={accent}
          why="Component test (React Testing Library, @testing-library) roda no DOM real, testa interação do usuário. Visual regression (Percy, Chromatic) captura mudança cosmética sem teste manual. Unit no frontend é pra lógica pura."
          alternatives={[
            { label: 'Unit test em cada componente', note: 'quebra toda refactor de estilo' },
            { label: 'Sem test de UI', note: 'regressão visual sai em produção' },
          ]}
        />
        <DecisionBox
          scenario="&quot;E2E é lento e flaky, por que ter?&quot;"
          winner="Manter 5-15 E2E críticos com infraestrutura robusta"
          winnerColor={accent}
          why="E2E captura bugs que nenhuma outra camada captura — integração de serviços, config de produção, ordem real de eventos. Flakiness vem de infraestrutura ruim (timing racy, ambiente compartilhado) — investir em isolamento (por-PR env) paga."
          alternatives={[
            { label: 'Zero E2E', note: 'bugs de integração escapam até produção' },
            { label: 'E2E pra tudo', note: 'CI impraticável' },
          ]}
        />
      </Section>

      <Section title="Métricas que importam (e as que enganam)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Métrica', 'Útil?', 'Observação']}
          rows={[
            ['Line coverage', 'Parcialmente', 'Fácil de inflar; não garante qualidade do teste'],
            ['Branch coverage', 'Melhor', 'Exercita if/else — mais honesta'],
            ['Mutation score', 'Muito útil', 'Stryker/PIT injeta bugs — se tests não pegam, são fracos'],
            ['Test count por módulo', 'Parcial', 'Contar volume, não qualidade'],
            ['Flakiness rate', 'Crítica', '&gt; 1% indica infra ruim ou tests sujos'],
            ['Tempo de execução', 'Crítica', 'CI &gt; 10min = ninguém roda local'],
          ]}
        />
        <Callout tone="info" icon="🎯">
          <strong>Boa regra de cobertura</strong>: 80% line coverage como guardrail (bloqueia PR abaixo), com <em>foco humano</em> em caminhos críticos. Mutation testing 1x/semana detecta tests fracos. Nunca mire 100% — dá retorno marginal e cria dependência em test lixo.
        </Callout>
      </Section>

      <Section title="Exemplo: distribuição saudável em API Node.js" accent={accent}>
        <CodeBlock>{`# Estrutura de tests em backend Node.js moderno
tests/
├── unit/                    # ~70% — rápidos, isolados
│   ├── payment-calculator.test.ts     # função pura
│   ├── auth-validator.test.ts         # regras de negócio
│   └── url-parser.test.ts              # transformação
│
├── integration/             # ~25% — Testcontainers
│   ├── user-repository.test.ts        # Postgres real
│   ├── order-api.test.ts              # HTTP + DB + cache
│   └── stripe-webhook.test.ts         # webhook + DB
│
└── e2e/                     # ~5% — playwright + staging
    ├── signup-to-purchase.spec.ts     # jornada completa
    ├── password-recovery.spec.ts      # fluxo crítico
    └── checkout-critical-path.spec.ts # business critical

# CI pipeline:
# - unit: roda em 30s, toda branch, bloqueia PR
# - integration: 5min, toda PR, bloqueia merge
# - e2e: 15min, só em main branch, bloqueia release`}</CodeBlock>
      </Section>

      <Section title="Quando quebrar a regra — e como justificar" accent={accent}>
        <p>
          Contexts onde a pirâmide pura não serve:
        </p>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Prototipagem / MVP</strong>: 0 tests é válido por 2-3 semanas. Escreva depois que produto fechar forma.</li>
          <li><strong>Código gerado (ORM, codegen)</strong>: não teste o generator, teste o output. Unit sobre generated code = trabalho em dobro.</li>
          <li><strong>Infra-as-code</strong>: Terraform e similares usam integration/E2E (terraform plan validation, smoke test pós-apply). Unit puro quase inexiste.</li>
          <li><strong>Data pipelines</strong>: integration test com sample dataset é a forma — unit de transformação + end-to-end com subset real.</li>
        </ul>
        <Callout tone="warn">
          <strong>Todo desvio da pirâmide precisa de justificativa escrita</strong> na docs do projeto. &quot;Não usamos pirâmide porque X&quot; + plano de monitoramento pra detectar problema. Desvio informal vira dívida técnica invisível.
        </Callout>
      </Section>

      <Section title="Take-away" accent={accent}>
        <Callout tone="success" icon="🎓">
          A pirâmide clássica ainda é certa no <em>formato</em> (base larga, topo fino), mas o <em>conteúdo</em> evoluiu: menos unit com mock excessivo, mais integration com DB real via Testcontainers. Mutation testing substitui obsessão por line coverage. E2E existe pra jornadas de negócio, não pra testar endpoints.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
