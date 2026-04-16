import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Testes Profissionais: pirâmide, contrato, property-based, fuzz — FFV Academy',
  description:
    'Tipos de testes em 2026: pirâmide moderna, unit, integração, contrato, E2E, property-based, snapshot, mutation, fuzz, chaos. Qual usar e onde.',
};

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que "cobertura 100%" é métrica enganosa?',
    options: [
      'Não é enganosa, é o padrão',
      'Porque cobre LINHAS, não COMPORTAMENTO. Você pode ter 100% de cobertura sem ter verificado um único assertion que importa. Mutation testing mede a qualidade real dos testes, não a cobertura',
      'Porque é difícil de calcular',
      'Porque CI trava',
    ],
    correct: 1,
    explanation:
      'Cobertura é só um piso (nunca menos que X%). O teto é mutation testing: injeta bugs e vê se os testes pegam. Cobertura 100% + mutation score 30% = seus testes são superficiais. Mutation 90% + cobertura 70% = você testa o que importa, onde importa.',
  },
  {
    question:
      'Quando property-based testing supera o teste baseado em exemplo?',
    options: [
      'Nunca',
      'Quando existe uma INVARIANTE universal: ex. "parse(toJSON(x)) deve ser x" para todo x; ou "ordenar(ordenar(x)) == ordenar(x)". Property-test gera milhares de inputs aleatórios e procura contraexemplos — pega edge cases humanos nunca pensariam',
      'Só em Haskell',
      'Quando não há assertions',
    ],
    correct: 1,
    explanation:
      'Property-based (fast-check, Hypothesis, QuickCheck) gera inputs automaticamente e reduz ao menor contraexemplo. Descobre bugs de overflow, unicode, timezone, null em campo opcional, ordem de execução — coisas que ninguém lembra em exemplo manual.',
  },
  {
    question:
      'Qual é o papel de Contract Testing (ex.: Pact, OpenAPI) em sistemas distribuídos?',
    options: [
      'Cerimônia inútil',
      'Garante que provider e consumer respeitam o mesmo contrato. Evita o pesadelo de "integração funciona em dev, quebra em prod quando provider muda campo." Consumer define expectativa; provider valida; CI de ambos garante compatibilidade',
      'Substitui todos outros testes',
      'Só para microserviços em Java',
    ],
    correct: 1,
    explanation:
      'Em sistemas com múltiplos serviços/deploys independentes, contract test detecta breaking change do lado provider ANTES do deploy matar o consumer. Pact (consumer-driven) ou schema test (OpenAPI, Avro, Protobuf com compatibility check) são obrigatórios em stack distribuído sério.',
  },
  {
    question:
      'Qual tipo de teste pega bug que só aparece com input malicioso/inesperado (caractere unicode raro, payload gigante, buffer overflow)?',
    options: [
      'Teste manual',
      'Fuzz testing (libFuzzer, AFL, go-fuzz): gera inputs aleatórios até o programa crashar ou violar asserção. Combinado com sanitizers (ASan, UBSan), encontra vulns que escapam de code review humano',
      'Teste visual',
      'Unit test normal',
    ],
    correct: 1,
    explanation:
      'Fuzz é a arma pra achar bug de segurança e robustez. Google usa OSS-Fuzz em centenas de projetos open source. Hoje todo software que parse input não-confiável (JSON, protobuf, imagem, áudio) DEVE ter fuzz — senão vira CVE.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="testes-profissionais"
      title="Testes Profissionais: pirâmide, propriedades, contrato e fuzz"
      icon="🧪"
      xp={85}
      readTime={18}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
      nextSlug="seguranca-software-real"
      nextTitle="Segurança de Software de Verdade: threat model ao SBOM"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Teste não é esporte. Não é rito. É <strong>sistema de garantia</strong> que permite mudar código sem medo. Em 2026, com
        agents escrevendo muito mais código do que humanos, o valor de testes bons <em>subiu</em>: eles são o contrato entre
        intenção humana e execução do agent. Teste bom hoje &gt; cobertura alta. Este módulo mapeia os tipos que importam, onde
        cada um brilha e onde é cerimônia vazia.
      </p>

      <Section title="A pirâmide moderna (Honeycomb/Diamante)" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Do barato/muitos ao caro/poucos"
          items={[
            { icon: '🔬', label: 'Unit tests', sub: '70-75%', detail: 'Funções puras, lógica de negócio isolada. ms. Use mock com moderação.', connector: 'sustenta' },
            { icon: '🔗', label: 'Integração', sub: '15-20%', detail: 'DB real (Testcontainers), queue real, API real. Cobre o glue.', connector: 'valida contrato' },
            { icon: '📜', label: 'Contract tests', sub: '5-8%', detail: 'Pact/OpenAPI. Entre serviços. Rápidos, decisivos.', connector: 'simula usuário' },
            { icon: '🌐', label: 'E2E / UI', sub: '2-5%', detail: 'Playwright, Cypress. Golden paths apenas. Caro, flaky por natureza.', connector: 'estressa' },
            { icon: '⚡', label: 'Chaos / Load', sub: 'setup separado', detail: 'K6, Gatling, Chaos Mesh. Produção-like. Não no CI normal.' },
          ]}
        />
        <Callout tone="info">
          <strong>Pirâmide vs Diamante.</strong> Times modernos inflam integração (&ldquo;diamante&rdquo;) porque DB em
          Docker/Testcontainers ficou barato e integração pega bugs reais que unit puro ignora. Regra: se seu código é 80% glue
          (chama outras APIs/DB), teste de integração é o caminho.
        </Callout>
      </Section>

      <Section title="Unit: rápido, puro, opinativo" accent={ACCENT}>
        <CodeBlock lang="typescript">{`// src/money.ts
export function splitBill(total: number, people: number): number[] {
  if (people <= 0) throw new Error('people must be > 0');
  const perHead = Math.floor((total * 100) / people) / 100;
  const remainder = +(total - perHead * people).toFixed(2);
  const shares = Array(people).fill(perHead);
  shares[0] = +(shares[0] + remainder).toFixed(2);
  return shares;
}

// tests/money.spec.ts
import { describe, it, expect } from 'vitest';
import { splitBill } from '../src/money';

describe('splitBill', () => {
  it('divides evenly when possible', () => {
    expect(splitBill(100, 4)).toEqual([25, 25, 25, 25]);
  });

  it('puts remainder on the first payer', () => {
    expect(splitBill(10, 3)).toEqual([3.34, 3.33, 3.33]);
  });

  it('throws on invalid people', () => {
    expect(() => splitBill(100, 0)).toThrow();
  });

  it('handles zero total', () => {
    expect(splitBill(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });
});`}</CodeBlock>
        <Callout tone="warn">
          <strong>Sinais de unit test ruim.</strong> (1) Mock gigante de 30 linhas — seu código tem acoplamento demais. (2)
          Testa implementação (&ldquo;foi chamado N vezes&rdquo;) em vez de resultado. (3) Quebra toda refatoração. Bom unit
          testa comportamento público, não detalhe interno.
        </Callout>
      </Section>

      <Section title="Integração com Testcontainers" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Testcontainers (disponível em Java, Node, Go, Python) sobe Postgres, Redis, Kafka real num container efêmero pro
          teste. Fim do &ldquo;funciona no mock, quebra em prod&rdquo;.
        </p>
        <CodeBlock lang="typescript">{`import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { Pool } from 'pg';
import { createOrder, findOrder } from '../src/orders';

describe('orders (integration)', () => {
  let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
  let pool: Pool;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    await pool.query(\`CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )\`);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  it('persists and retrieves order', async () => {
    const order = await createOrder(pool, { userId: 'u_1', amount: 99.9 });
    const found = await findOrder(pool, order.id);
    expect(found).toMatchObject({ userId: 'u_1', amount: '99.90' });
  });
});`}</CodeBlock>
      </Section>

      <Section title="Property-Based Testing (a arma secreta)" accent={ACCENT}>
        <CodeBlock lang="typescript">{`import fc from 'fast-check';
import { splitBill } from '../src/money';

// propriedade 1: soma das partes bate o total
test('sum of shares equals total', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 1_000_000, noNaN: true }),
      fc.integer({ min: 1, max: 100 }),
      (total, people) => {
        const shares = splitBill(total, people);
        const sum = shares.reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - total)).toBeLessThan(0.01);
      }
    )
  );
});

// propriedade 2: nenhuma parte é negativa
test('no negative share', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 1000, noNaN: true }),
      fc.integer({ min: 1, max: 50 }),
      (total, people) => splitBill(total, people).every(s => s >= 0)
    )
  );
});`}</CodeBlock>
        <Callout tone="success">
          <strong>Por que vira obsessão depois que experimenta.</strong> Property-based gera milhares de inputs, encontra o menor
          contraexemplo (shrinking) e reproduz deterministicamente. Em 30 minutos, pega bug de precisão, overflow, sinal,
          unicode, null implícito — coisas que você nunca pensaria em testar manualmente.
        </Callout>
      </Section>

      <Section title="Contract Testing (Pact / OpenAPI)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Dois serviços (consumer e provider) têm contrato. Pact faz o consumer declarar a expectativa; provider roda contra
          essas expectativas em CI.
        </p>
        <CodeBlock lang="typescript">{`// CONSUMER (mobile-app) declara expectativa
import { PactV3, MatchersV3 as M } from '@pact-foundation/pact';

const provider = new PactV3({ consumer: 'mobile-app', provider: 'orders-api' });

it('GET /orders/:id returns 200 with body', async () => {
  provider
    .given('order o_1 exists')
    .uponReceiving('a request for order o_1')
    .withRequest({ method: 'GET', path: '/orders/o_1' })
    .willRespondWith({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        id: 'o_1',
        amount: M.decimal(99.9),
        status: M.regex(/^(paid|pending|cancelled)$/, 'paid'),
      },
    });

  await provider.executeTest(async (mock) => {
    const res = await fetch(\`\${mock.url}/orders/o_1\`);
    expect(res.status).toBe(200);
  });
});

// gera um arquivo pact.json que o PROVIDER vai rodar no CI dele`}</CodeBlock>
        <Callout tone="info">
          <strong>Variações.</strong> (1) <strong>OpenAPI/Swagger contract test</strong> com ferramentas como Dredd ou
          Schemathesis valida que implementação bate com spec. (2) <strong>Schema compatibility</strong> em Avro/Protobuf é
          obrigatório em Kafka — quebra de contrato em event streaming é caos operacional.
        </Callout>
      </Section>

      <Section title="Snapshot (com moderação)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Snapshot salva o output esperado. Útil para JSON, HTML, CLI output. Ruim quando vira lixo que ninguém lê.
        </p>
        <CodeBlock lang="typescript">{`test('invoice PDF structure', () => {
  const json = buildInvoiceJson({ user: 'u1', total: 100 });
  expect(json).toMatchSnapshot();
});`}</CodeBlock>
        <Callout tone="warn">
          <strong>Regras.</strong> (1) Snapshot sempre passa em code review — atualizar snapshot sem ler é bug entrando. (2) Use
          <InlineCode>toMatchInlineSnapshot()</InlineCode> pra snapshots pequenos ficarem no próprio teste. (3) Nunca snapshot de
          estrutura com timestamps/UUIDs sem masking.
        </Callout>
      </Section>

      <Section title="Mutation Testing (teste dos testes)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Mutation testing modifica seu código (troca <InlineCode>&gt;</InlineCode> por <InlineCode>&gt;=</InlineCode>, remove
          linha, inverte boolean) e verifica se algum teste quebra. Se não quebra = seus testes são cegos para aquele mutante.
        </p>
        <CodeBlock lang="bash">{`# JS/TS: stryker-mutator
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
npx stryker init
npx stryker run

# Output esperado:
# Mutation score: 87.5%  (pegamos 140/160 mutantes)
# Surviving mutants:
#   src/money.ts:12 - trocou \`>\` por \`>=\` — nenhum teste detectou
#   src/money.ts:18 - removeu linha de remainder — testes ainda passaram`}</CodeBlock>
        <Callout tone="success">
          <strong>Target de mutation score.</strong> 70%+ é bom, 85%+ é excelente, 100% é overkill. Prefira mutation alto em
          módulos críticos (pagamento, auth) e mutation razoável em CRUD.
        </Callout>
      </Section>

      <Section title="Fuzz Testing" accent={ACCENT}>
        <CodeBlock lang="go">{`// Go 1.18+ tem fuzz nativo
// fuzz_test.go
func FuzzParseCPF(f *testing.F) {
    f.Add("12345678909")
    f.Add("111.111.111-11")
    f.Add("")

    f.Fuzz(func(t *testing.T, input string) {
        _, err := ParseCPF(input)
        // o invariante: não pode panicar mesmo em input lixo
        if err == nil && !IsValidCPF(input) {
            t.Errorf("parse aceitou CPF inválido: %q", input)
        }
    })
}

// Rodar: go test -fuzz=FuzzParseCPF -fuzztime=60s ./...`}</CodeBlock>
        <CodeBlock lang="python">{`# Python com Hypothesis (property-based + fuzz-like)
from hypothesis import given, strategies as st
from mymodule import parse_cpf, is_valid

@given(st.text())
def test_parse_cpf_never_panics(s):
    try:
        result = parse_cpf(s)
        if result is not None:
            assert is_valid(result)
    except ValueError:
        pass  # expected for bad input`}</CodeBlock>
        <Callout tone="warn">
          <strong>Quando fuzz vira obrigatório.</strong> Código que parseia input não-confiável: JSON, protobuf, imagem, áudio,
          URL, CSV, regex customizado. Fuzz pega crash, infinite loop, consumo exponencial de memória — bugs que viram CVE se
          escaparem.
        </Callout>
      </Section>

      <Section title="E2E: poucos, mas de verdade" accent={ACCENT}>
        <CodeBlock lang="typescript">{`// Playwright — golden path de checkout
import { test, expect } from '@playwright/test';

test('user completes checkout', async ({ page }) => {
  await page.goto('/products/camisa-ffv');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('link', { name: 'Carrinho' }).click();
  await page.getByRole('button', { name: 'Finalizar' }).click();

  await page.getByLabel('E-mail').fill('test@ffv.com');
  await page.getByLabel('Cartão').fill('4242 4242 4242 4242');
  await page.getByLabel('CVV').fill('123');
  await page.getByRole('button', { name: 'Pagar' }).click();

  await expect(page.getByText('Pedido confirmado')).toBeVisible({ timeout: 10_000 });
});`}</CodeBlock>
        <Callout tone="warn">
          <strong>Regras pra não odiar E2E.</strong> (1) Só golden paths (top 5 fluxos). (2) Dados determinísticos (seeds, não
          produção). (3) Retry em flakiness + quarentena de teste instável. (4) Roda em stage, não em preview efêmero. (5)
          Falhou? Quem shipou conserta — não deixa apodrecer.
        </Callout>
      </Section>

      <Section title="Chaos & Load" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Load test (K6, Gatling)', v: 'Simula N users concorrentes. Mede p50/p99, erro, throughput. Roda em ambiente semelhante a prod.' },
            { k: 'Soak test', v: 'Carga baixa por muito tempo (6-24h). Pega memory leak, connection pool exhaustion, cron bugs.' },
            { k: 'Stress test', v: 'Sobe carga até quebrar. Identifica capacity ceiling.' },
            { k: 'Chaos (Chaos Mesh, LitmusChaos)', v: 'Mata pod, corta rede, adiciona latência. Testa se o sistema aguenta falha parcial.' },
            { k: 'Onde rodar', v: 'Preview env ou staging. NÃO no CI normal — demora demais. Pipeline separado, noturno.' },
          ]}
        />
      </Section>

      <Section title="Escolhendo testes para cada tipo de código" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Código', 'Obrigatório', 'Útil', 'Talvez']}
          rows={[
            ['Função pura (parse, format, calc)', 'Unit + Property-based', 'Mutation', 'Snapshot'],
            ['Handler/Controller', 'Integração (DB real)', 'Contract test', 'E2E golden path'],
            ['Gateway/Adapter de API externa', 'Contract test + Unit', 'Pact', 'Fuzz no parsing de resposta'],
            ['UI (React/Vue)', 'Component test (Testing Library)', 'Visual regression (Chromatic)', 'E2E Playwright'],
            ['Worker/Job', 'Integração (queue real)', 'Chaos (kill pod mid-job)', 'Soak test'],
            ['Migration SQL', 'Teste "aplica + reverte" no CI', 'Dry-run em snapshot de prod', '-'],
            ['Parser de input externo', 'Unit + Fuzz', 'Property-based', 'Mutation'],
          ]}
        />
      </Section>

      <Section title="Flaky tests: o cancro silencioso" accent={ACCENT}>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>
            • <strong>Causas comuns</strong>: timing (setTimeout, sleep), ordem de execução, estado compartilhado, timezone,
            Date.now(), aleatoriedade sem seed, rede não mockada, recurso não limpo.
          </li>
          <li>
            • <strong>Política sã</strong>: teste flaky entra em quarentena por 48h; dono conserta ou remove. Test com retry
            ilimitado é lixo que erode a confiança.
          </li>
          <li>
            • <strong>Detecte</strong>: CI que roda mesmo teste 3× em PR para detectar instabilidade antes do merge.
          </li>
        </ul>
      </Section>

      <Section title="Dois cenários reais de decisão" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="API de cálculo de frete com 15 regras regionais e faixas de peso"
          winner="Unit + Property-based massivo + Snapshot de response"
          why="Lógica pura com muita combinação. Property-test verifica invariantes (frete nunca negativo, pesos maiores = fretes maiores-ou-iguais). Unit cobre regras nomeadas. Snapshot confere forma da resposta."
          alternatives={[{ name: 'E2E', note: 'exagero aqui; testar via UI 500 combinações de frete é masoquismo.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Microserviço de pagamento que integra com Stripe via webhook"
          winner="Contract test + Integration + Fuzz"
          why="Webhook é input não-confiável (fuzz), contrato com Stripe pode mudar (contract test contra sandbox), persistência e side effects precisam de integração com DB real."
          alternatives={[{ name: 'Só unit', note: 'ignoraria os bugs reais que aparecem em produção.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="TDD é obrigatório?"
          a="Não. TDD é uma técnica entre várias. Escreva o teste ANTES quando o design está claro, DEPOIS quando está explorando. O que importa é que o teste exista e teste comportamento, não a ordem."
        />
        <QAItem
          q="Posso confiar em agent para escrever todos os testes?"
          a="Agent escreve rápido, mas tende a testar implementação e cobrir o óbvio. Humano revisa se testa invariante certa, edge case real, integração com DB/queue. Mutation score é o filtro de qualidade."
        />
        <QAItem
          q="Qual cobertura mínima razoável?"
          a="Depende do módulo. Crítico (auth, pagamento): 85-95% linha + 80% mutation. Rota CRUD padrão: 70-80% linha. Log/aux scripts: não precisa meta."
        />
        <QAItem
          q="Mock ou real em integração?"
          a="Real sempre que barato (Postgres em Testcontainers, Redis em Docker). Mock só onde não dá (Stripe, Salesforce, serviço interno caro de subir). Quanto mais mock, menos o teste representa prod."
        />
        <QAItem
          q="Tests em produção?"
          a={
            <>
              Sim, chama-se <em>synthetic monitoring</em>: roda E2E reduzido contra produção a cada 5 minutos e alerta. Datadog
              Synthetics e Checkly fazem isso. Não substitui teste antes de deploy, mas pega bug que escapou.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Cobertura é piso, mutation é teto. (2) Property-based pega bugs que humano não pensa.
        (3) Contract test é obrigatório em sistema distribuído. (4) Fuzz em parser é não-negociável. (5) E2E só em golden paths.
        (6) Flaky test é bug. (7) Próximo: segurança real, onde muita dessa estrutura vai ser testada seriamente.
      </Callout>
    </div>
  );
}