import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('guardrails-experiments');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'O que distingue metrica primaria de guardrail?',
    options: [
      'Cor no dashboard',
      'Metrica primaria e a que voce ESPERA mover (hipotese). Guardrail e a que nao pode regredir significativamente (latency, crash, revenue, refund) — vigiamos para garantir que o ganho nao vem as custas de algo critico',
      'Nome',
      'Tempo de coleta',
    ],
    correct: 1,
    explanation: 'Netflix e LinkedIn descrevem guardrails como "metricas de seguranca" que NAO sao o objetivo, mas travam o experimento se regredirem. Promover variante com lift de 2% em conversao que aumentou 50ms no p95 e quebrou push notification e vitoria pirrica.',
  },
  {
    question: 'Por que usar two-sided test em guardrail?',
    options: [
      'Moda estatistica',
      'Porque em guardrail voce se importa com regressao em qualquer direcao — latency aumentando e problema, mas crash rate caindo misteriosamente tambem merece investigacao (pode indicar bug de logging, nao melhoria real)',
      'So por causa da calculadora',
      'Nao precisa',
    ],
    correct: 1,
    explanation: 'Metrica primaria tipicamente tem hipotese direcional (one-sided ok). Guardrail e defensivo: quero saber se mudou em qualquer direcao. Queda misteriosa em crash rate quase sempre e instrumentacao quebrada, nao milagre.',
  },
  {
    question: 'Qual e o mecanismo de fail-fast em guardrail?',
    options: [
      'Email semanal',
      'Sequential monitoring com alpha-spending em cada guardrail: ao detectar regressao com significancia antes do tempo previsto, experimento e pausado ou rollback automatico — sem esperar sample size completo',
      'Revisao trimestral',
      'Nao existe',
    ],
    correct: 1,
    explanation: 'Netflix publicou que 10-15% dos experimentos sao pausados cedo por guardrail. Sequential test em guardrail (alpha-spending ou mSPRT) permite parar com seguranca estatistica. Sem esse mecanismo, voce so descobre o estrago depois que o experimento acabou.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="guardrails-experiments"
      title="Guardrails em experiments"
      icon="🚧"
      xp={50}
      readTime={12}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="posthog-mixpanel-analytics"
      nextTitle="Product analytics: PostHog, Mixpanel, Amplitude"
      quiz={quiz}
    >
      <Section title="Anatomia de um experimento saudavel" accent={accent}>
        <CodeBlock lang="markdown">{`Primary metric (1):    conversion_rate_checkout
  - hipotese direcional (espero aumentar)
  - power analysis baseado nela

Secondary metrics (2-3): AOV, items_per_order
  - nao param experimento, enriquecem decisao

Guardrails (3-5):
  - p95_latency_ms        (max delta +30 ms)
  - crash_rate            (max delta +0.001)
  - revenue_per_user      (max delta -1%)
  - refund_rate           (max delta +0.002)
  - support_ticket_rate   (max delta +0.01)`}</CodeBlock>
      </Section>

      <Section title="Definicao declarativa" accent={accent}>
        <CodeBlock lang="yaml">{`experiment: new-checkout-layout
primary_metric:
  name: checkout_conversion
  direction: increase
  mde: 0.02

guardrails:
  - metric: p95_latency_ms
    direction: two_sided
    max_regression: 30
    action: auto_rollback

  - metric: crash_rate
    direction: two_sided
    max_regression_relative: 0.05
    action: pause_and_alert

  - metric: revenue_per_user
    direction: two_sided
    max_regression_relative: 0.01
    action: alert_only

monitoring:
  sequential_test: alpha_spending_obf
  check_frequency_hours: 6`}</CodeBlock>
      </Section>

      <Section title="Playbook Netflix/LinkedIn" accent={accent}>
        <Callout tone="info">
          Netflix: todo experimento passa por bateria de guardrails globais (streaming bitrate, startup time, playback errors) alem dos locais. LinkedIn: guardrails de engajamento de longo prazo (messages_sent, sessions_7d) para evitar otimizar clique curto as custas de retencao.
        </Callout>
      </Section>

      <Section title="Decisao final com guardrail" accent={accent}>
        <CodeBlock lang="python">{`def decide(primary, guardrails):
    # guardrail em rollback -> reject imediato
    for g in guardrails:
        if g.action == 'auto_rollback' and g.regressed:
            return 'REJECT_GUARDRAIL_BROKEN'

    # guardrail em pause -> decisao manual
    for g in guardrails:
        if g.action == 'pause_and_alert' and g.regressed:
            return 'PAUSE_REVIEW'

    # primary nao atingiu significancia
    if not primary.significant:
        return 'INCONCLUSIVE'

    # primary positivo mas guardrail levemente regrediu
    soft_regression = any(
        g.action == 'alert_only' and g.regressed for g in guardrails
    )
    if soft_regression and primary.lift < 0.01:
        return 'REJECT_NOT_WORTH_IT'

    return 'PROMOTE'`}</CodeBlock>
      </Section>

      <Section title="Anti-patterns" accent={accent}>
        <Callout tone="warn">
          Ignorar guardrail porque &quot;so regrediu 40ms&quot;. Em escala de milhoes, 40ms p95 e incidente de performance. Registre a regressao, faca trade-off explicito documentado, nao esconda em nota de rodape.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
