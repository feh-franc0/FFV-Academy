import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('feature-flags-growthbook');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual diferenca pratica entre GrowthBook e LaunchDarkly?',
    options: [
      'Nenhuma',
      'GrowthBook e open source com foco em experimentacao estatistica (engine Bayesian/Frequentist built-in). LaunchDarkly e SaaS enterprise com foco em feature management em escala (audit, RBAC, SDKs 30+)',
      'LaunchDarkly e gratis',
      'GrowthBook nao suporta SDK',
    ],
    correct: 1,
    explanation: 'GrowthBook self-hosted roda com Docker, integra com warehouse (Snowflake, BigQuery, Postgres) e faz analise estatistica in-app. LaunchDarkly cobra por seat e entrega confiabilidade enterprise. Escolha depende do tamanho do time e budget — nao de hype.',
  },
  {
    question: 'O que e flag debt?',
    options: [
      'Flag que custa caro',
      'Flags que ficaram no codigo apos experimento/release terminar — geram branches mortos, cobertura de teste enganosa e regressoes em rollback',
      'Flag em producao',
      'Flag de permissao',
    ],
    correct: 1,
    explanation: 'Netflix, Uber e Shopify publicaram postmortems onde flag esquecida serviu variante antiga a subgrupo de usuarios por meses. Regra: toda flag de experimento ou release tem data de expiracao. CI quebra se flag passar da data sem decisao documentada.',
  },
  {
    question: 'Para que serve um kill switch?',
    options: [
      'Desligar a aplicacao',
      'Flag binaria sempre presente que permite desativar feature de risco (pagamento, ML model, integracao externa) em segundos, sem deploy, quando algo quebra em producao',
      'Trocar de regiao',
      'Logout de usuario',
    ],
    correct: 1,
    explanation: 'Kill switch e flag permission-like que fica para sempre. Incident chega 2am, on-call flip kill_switch_payment_v2 = off, problema isolado sem precisar achar commit, abrir PR, esperar CI, fazer deploy. Toda feature de risco merece um.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="feature-flags-growthbook"
      title="Feature flags: GrowthBook + Unleash"
      icon="🚩"
      xp={55}
      readTime={13}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="ab-testing-rigoroso"
      nextTitle="A/B testing estatisticamente rigoroso"
      quiz={quiz}
    >
      <Section title="Os tres tipos de flag" accent={accent}>
        <p>
          Release flag desacopla deploy de launch. Experiment flag roteia trafego entre variantes com random assignment. Permission flag gata por plano, role ou beta. Mesma ferramenta serve aos tres, mas governanca e ciclo de vida diferem.
        </p>
      </Section>

      <Section title="Definicao em GrowthBook (YAML config)" accent={accent}>
        <CodeBlock lang="yaml">{`# growthbook/checkout-cta-copy.yaml
id: checkout-cta-copy
type: experiment
owner: fernando@ffv.dev
description: Testar copy do botao de checkout
hypothesis: Copy com verbo de urgencia aumenta conversao
status: running

variations:
  - id: control
    name: Finalizar compra
    weight: 0.5
  - id: treatment
    name: Comprar agora
    weight: 0.5

targeting:
  - attribute: country
    operator: in
    values: [BR, PT]
  - attribute: plan
    operator: not_in
    values: [enterprise]

guardrails:
  - metric: checkout_error_rate
    max_delta: 0.005
  - metric: p95_latency_ms
    max_delta: 50

expires_at: 2026-06-01
kill_switch: true`}</CodeBlock>
        <Callout tone="info">
          YAML versionado em repo vira fonte de verdade. GrowthBook tem UI, mas times serios tratam flag como config as code — revisao em PR, audit via git log.
        </Callout>
      </Section>

      <Section title="SDK client-side com assignment estavel" accent={accent}>
        <CodeBlock lang="ts">{`import { GrowthBook } from '@growthbook/growthbook';

const gb = new GrowthBook({
  apiHost: 'https://flags.ffv.dev',
  clientKey: process.env.NEXT_PUBLIC_GB_KEY,
  attributes: {
    id: user.id,
    country: user.country,
    plan: user.plan,
  },
  trackingCallback: (experiment, result) => {
    analytics.track('experiment_viewed', {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

await gb.loadFeatures();

const variant = gb.getFeatureValue('checkout-cta-copy', 'control');
// hash determinista por user.id garante que mesmo usuario ve mesma variante sempre`}</CodeBlock>
      </Section>

      <Section title="Quando escolher cada stack" accent={accent}>
        <CodeBlock lang="markdown">{`GrowthBook (open source, stats-first)
  - Time pequeno/medio, quer self-host
  - Precisa de analise Bayesian/Frequentist integrada
  - Budget zero, warehouse proprio

Unleash (open source, feature management)
  - Foco em release/permission, experimentacao e basica
  - Simples, bom RBAC, multi-project

LaunchDarkly (SaaS enterprise)
  - Escala grande, compliance rigido
  - 30+ SDKs oficiais, suporte enterprise
  - Budget USD 15-30 por seat/mes

Vercel Flags (SaaS, Next-nativo)
  - Stack Vercel/Next, edge runtime
  - Leve, integra com analytics Vercel`}</CodeBlock>
      </Section>

      <Section title="Higiene de flag" accent={accent}>
        <Callout tone="warn">
          Toda flag de release ou experimento nasce com expires_at. CI falha se hoje &gt; expires_at sem decisao (promoted/reverted). Sem esse job, em 12 meses voce tem 80 flags zumbis.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
