import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-sre-slo-runbook');
const accent = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é multi-burn-rate alerting?',
    options: [
      'Alerta triplicado',
      'Dois alertas: FAST (queima rápido — 14.4x em 1h = incident agora) + SLOW (queima gradual — 6x em 6h = warning, budget estoura em semana). Reduz noise sem perder sinal',
      'Só fast',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Google SRE workbook — alert based on burn rate, não threshold. Fast burn (ataque/incident) pings on-call. Slow burn (degradação silenciosa) vira ticket. Sem multi-burn: alertam no começo (falso positivo) ou no fim (muito tarde).',
  },
  {
    question: 'O que runbook DEVE conter?',
    options: [
      'Só URL do dashboard',
      'Sintomas observáveis, diagnóstico step-by-step, mitigações testadas, comando pra rollback, escalation path, links pra postmortems relacionados',
      'Todo o código do sistema',
      'Política HR',
    ],
    correct: 1,
    explanation: 'Runbook é "on-call ao 3am sabe o que fazer". Sintoma observado → causa provável → comando concreto pra mitigar. Nada de "investigar" genérico. Atualizar após cada incident (post-mortem → runbook).',
  },
  {
    question: 'Por que gameday?',
    options: [
      'Diversão',
      'Simular outage controladamente (chaos engineering leve) pra validar: alertas disparam? runbook funciona? time sabe responder? sem gameday, descobre no incident real',
      'Team building só',
      'Substitui monitoring',
    ],
    correct: 1,
    explanation: 'Gameday (Netflix popularizou) = exercício planejado: "vou matar um serviço em X horas; vejam o que acontece". Testa alertas, runbook, time, rollback. Chaos Monkey automatiza. Sem gameday, seu disaster recovery é teoria.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-sre-slo-runbook"
      title="Capstone: SLO + error budget + runbook reais"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Observabilidade & SRE"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Entregável" accent={accent}>
        <CodeBlock lang="yaml">{`# slo.yaml — definição formal (Nobl9 / Pyrra / sloth format)
service: checkout-api
slos:
  - name: availability
    sli: 'ratio(http_requests{status=~"2..|3.."}, http_requests)'
    target: 0.999  # 99.9%
    window: 30d
    alerts:
      fast: { burn_rate: 14.4, for: 5m, severity: page }
      slow: { burn_rate: 6, for: 1h, severity: ticket }
  - name: latency
    sli: 'histogram_quantile(0.99, http_duration)'
    target: 0.500  # p99 < 500ms
    target_ratio: 0.99`}</CodeBlock>
      </Section>

      <Section title="Runbook template" accent={accent}>
        <CodeBlock lang="markdown">{`# Runbook: checkout-api-high-latency

## Symptom
p99 latency > 500ms por > 5min (alert: checkout-latency-fast-burn)

## Diagnosis
1. Grafana → checkout dashboard → latency breakdown
2. Se DB query slow: SELECT * FROM pg_stat_activity WHERE state != 'idle';
3. Se upstream lento: verify payments-api SLO
4. Se deploy recente: rollback (kubectl rollout undo deploy/checkout)

## Mitigations
- **DB slow query**: kill query, escalate DBA
- **Upstream lento**: circuit breaker manual (feature flag)
- **Deploy ruim**: kubectl rollout undo deploy/checkout -n prod

## Escalation
- 15min sem mitigation → Incident Commander
- Cross-team → Slack #sre-incidents + PagerDuty

## Related postmortems
- 2026-03-14 (DB connection exhaust)
- 2026-02-08 (payments timeout cascade)`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Gameday: combine team, anuncie janela. Mate uma dependency (ex: stop payments-api). Cronometre: alertas disparam? runbook ajuda? time mitiga em &lt; 15min? Retrospective.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
