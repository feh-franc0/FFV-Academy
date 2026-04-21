import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('chaos-eng-principios');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "steady-state hypothesis" em chaos engineering?',
    options: [
      'Hipótese sobre a estabilidade política do time',
      'Definição mensurável de comportamento normal do sistema (ex: p99 latency < 300ms, error rate < 0.5%, checkout throughput > 100/min) que serve como baseline contra o qual o experimento é comparado',
      'Garantia de uptime 100%',
      'Nome chique pra monitoramento',
    ],
    correct: 1,
    explanation: 'Steady-state é o primeiro princípio do manifesto Principles of Chaos. Você precisa medir o "normal" em termos de business output (não CPU) antes de injetar falha. Se o experimento não muda a métrica de steady-state, o sistema resistiu. Sem hipótese mensurável, chaos vira teatro.',
  },
  {
    question: 'Por que "minimize blast radius" é regra inegociável?',
    options: [
      'Só por precaução',
      'Chaos experiment é científico, não kamikaze: começa em staging, depois 1% do tráfego canary, depois expande. Abort criteria automático. Objetivo é aprender com mínimo dano — não provar que você "tem coragem"',
      'Pra economizar custo',
      'Pra evitar pager',
    ],
    correct: 1,
    explanation: 'Blast radius = quantos usuários/requests são afetados se o experimento der errado. Netflix começa em 1 instância, não região inteira. Você desenha o experimento com botão de abort e monitoring que dispara rollback automático quando SLI passa do limite. Chaos sem blast radius control é sabotagem.',
  },
  {
    question: 'Quando rodar chaos em produção faz sentido?',
    options: [
      'Nunca',
      'Sempre',
      'Depois que o experimento já passou em staging com steady-state estável, com observabilidade madura, abort automático, comunicação com stakeholders, horário de baixa carga e rollback testado. Produção é o único ambiente onde o sistema é real',
      'Sexta às 17h',
    ],
    correct: 2,
    explanation: 'Staging mente: dados sintéticos, tráfego menor, dependências mockadas. O manifesto defende produção porque só lá você descobre falhas reais (cache cold, DB replication lag, third-party timeout). Mas só depois de maturidade operacional. Começar chaos em prod sem observabilidade é reckless, não engineering.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="chaos-eng-principios"
      title="Chaos engineering: os princípios"
      icon="⚗️"
      xp={45}
      readTime={11}
      trailName="Chaos Engineering"
      trailColor={accent}
      nextSlug="chaos-monkey-gremlin"
      nextTitle="Chaos Monkey, Simian Army, Gremlin"
      quiz={quiz}
    >
      <Section title="Manifesto Principles of Chaos" accent={accent}>
        <p>
          Em 2015 a Netflix publicou <strong>principlesofchaos.org</strong>, transformando "quebrar coisas em prod" em disciplina científica. Chaos engineering é a prática de experimentar em um sistema distribuído para construir confiança em sua capacidade de suportar condições turbulentas de produção.
        </p>
        <CodeBlock lang="markdown">{`# Os 5 princípios avançados

1. Construir hipótese em torno de steady-state behavior
   - Métrica de negócio, não infra (ex: orders/min, não CPU%)
   - Quantitativa, observável, estável antes do experimento

2. Variar eventos do mundo real
   - Falhas que acontecem (instância morre, AZ cai, DNS falha, disco enche)
   - Não ficção (ex: não simular 10x tráfego se nunca acontece)

3. Rodar experimentos em produção
   - É onde o sistema real vive (deps reais, dados reais, concorrência real)
   - Staging mente por omissão

4. Automatizar experimentos continuamente
   - Manual = event, não disciplina
   - CI chaos, scheduled chaos, regression de fixes

5. Minimizar blast radius
   - Menor escopo que gera aprendizado útil
   - Abort automático ao cruzar thresholds`}</CodeBlock>
      </Section>

      <Section title="Anatomia de um experimento" accent={accent}>
        <CodeBlock lang="yaml">{`experiment:
  name: checkout-resiliente-a-latencia-payments
  hypothesis:
    steady_state:
      metric: checkout_success_rate_5m
      baseline: ">= 99.2%"
      abort_threshold: "< 97%"
  method:
    type: inject_latency
    target: payments-service
    latency_ms: 800
    duration: 10m
    scope: "1% of traffic (canary cell)"
  rollback:
    trigger: automatic_on_abort_threshold
    action: remove_chaos_policy
  observability:
    dashboards: [checkout-slo, payments-slo]
    alerts: [PagerDuty team-checkout]
  communication:
    pre: "#eng-chaos 15min antes"
    post: "postmortem em 48h"`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Chaos sem hipótese mensurável é vandalismo. Se você não consegue responder "o que eu esperaria ver se o sistema estivesse resiliente?" antes de apertar o botão, <strong>não aperte</strong>.
        </Callout>
      </Section>

      <Section title="Maturidade por estágios" accent={accent}>
        <CodeBlock lang="markdown">{`Nível 1 — Game day manual em staging
Nível 2 — Automação em staging (LitmusChaos/ChaosToolkit)
Nível 3 — Chaos em canary prod (1% tráfego, off-hours)
Nível 4 — Chaos contínuo em prod (business hours, full traffic)
Nível 5 — Chaos regression em CI (fix não volta a quebrar)`}</CodeBlock>
        <Callout tone="info" icon="🧭">
          A Netflix levou anos pra chegar no nível 4. Pular etapas = incident. A pergunta certa é "qual o próximo nível?", não "como vou direto pro 5?".
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
