import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rightsizing-sem-medo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que rightsizing falha em muitas orgs?',
    options: [
      'Impossível',
      'Medo legítimo de degradation em prod + falta de dados de memory (CloudWatch default não coleta), workload com picos mensais invisíveis em 14 dias, ausência de rollback rápido. Metodologia: observability completa (memory agent) → canary → rollback pronto',
      'Só falta vontade',
      'Tools ruins',
    ],
    correct: 1,
    explanation: 'Rightsizing mal feito causa incident. Sem memory metrics (precisa CloudWatch agent), Compute Optimizer só olha CPU. Sem janela de observação incluindo picos (mínimo 30 dias), cortes pegam workload em baixa temporária. Metodologia protege: canary de 10% por 48h, monitoring apertado, rollback automático se latency p99 degrada.',
  },
  {
    question: 'Memory vs CPU bottleneck: como identificar?',
    options: [
      'É chute',
      'CloudWatch agent instala memory metrics no EC2 (não vem default). Para Kubernetes, metrics-server + VPA em recommend mode. Se memory usage > 80% + swap, memory bound. Se CPU > 70% sustained, CPU bound. Escolha instance family otimizada pro bottleneck identificado',
      'Só CPU importa',
      'Google',
    ],
    correct: 1,
    explanation: 'Instance families otimizadas: compute (c-series, c6i/c7i), memory (r-series, r6i), general (m-series), storage (i-series/d-series). Rodar workload memory-bound em c-series é waste e degrada. Analisar primeiro, depois trocar family. Graviton (c7g/m7g/r7g) costuma entregar ~40% melhor price/perf — considerar em paralelo.',
  },
  {
    question: 'Qual é o safety buffer razoável pós-rightsizing?',
    options: [
      '0%',
      '20-30% de headroom em CPU e memory na instance nova. Workloads imprevisíveis ou com picos temporais → 40%+. Stateless behind autoscaling podem ter buffer menor (~15%) pois scaling absorve. Stateful crítico preserva headroom maior — falha de capacity cascata em prod',
      '100%',
      'Nenhum',
    ],
    correct: 1,
    explanation: 'Buffer 0% é irreal (qualquer spike quebra). 100% anula o ganho do rightsizing. 20-30% é sweet spot pra maioria. Banco de dados sobe pra 40% (read spike mata). Workers async com queue tolerante podem descer pra 10%. Pra Lambda, cold start compensa margem mental extra.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rightsizing-sem-medo"
      title="Rightsizing sem medo: metodologia de cortar sem quebrar"
      icon="✂️"
      xp={50}
      readTime={12}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="reservas-savings-plans-spot"
      nextTitle="Reservas, Savings Plans e Spot: estratégia de portfolio"
      quiz={quiz}
    >
      <Section title="Metodologia em 6 passos" accent={accent}>
        <CodeBlock lang="markdown">{`# Rightsizing Playbook

## 1. Observability completa (1-2 semanas)
- CloudWatch agent em EC2 com memory/disk metrics
- VPA em EKS (mode recommend, não apply)
- 30+ dias de histórico incluindo picos mensais

## 2. Identificar candidatos
- Compute Optimizer findings (filtrar "over-provisioned")
- Baseline: CPU < 30%, memory < 50% sustained 30d

## 3. Priorizar por impacto
- Top 20 candidatos por potential savings
- Tag-based: começar por non-prod antes de prod

## 4. Canary
- Apply em 1 instance (ou 10% do service)
- Monitoring apertado por 48-72h
- Métricas: latency p95/p99, error rate, CPU/mem

## 5. Rollout gradual
- 10% → 25% → 50% → 100% com check entre
- Rollback automático em alarm trigger

## 6. Validação pós
- Revisão 1 semana: economia real vs estimada
- Documentar aprendizados no runbook`}</CodeBlock>
      </Section>

      <Section title="Chaos testing para confiança" accent={accent}>
        <p>
          Antes de rightsize crítico, rode chaos test: FIS (Fault Injection Service) simulando load spike 2x baseline. Se workload atual aguenta sem stress mas rightsized quebra, buffer foi mal calibrado. Esse teste barato antes de deploy prod evita incident depois.
        </p>
        <CodeBlock lang="yaml">{`# AWS FIS: experiment stress CPU em instance candidata
Experiment:
  Name: rightsize-validation-stress
  Targets:
    ec2-instances:
      ResourceTags: { team: checkout, env: staging }
  Actions:
    stress-cpu:
      ActionId: aws:ssm:send-command
      Parameters:
        documentArn: arn:aws:ssm::aws:document/AWSFIS-Run-CPU-Stress
        duration: PT10M
        cpu-load: 80
  StopConditions:
    - CloudWatchAlarm em error-rate spike`}</CodeBlock>
      </Section>

      <Section title="Rightsizing contínuo, não evento" accent={accent}>
        <p>
          Rightsizing one-shot volta a overprovision em 6 meses — workloads mudam, features acumulam. Maturidade: Compute Optimizer review mensal automático + alerts de drift (workload rodando com CPU &lt; 20% 60 dias dispara review), policy "toda nova workload entra com instance menor possível, escala se necessário". Cultura, não projeto.
        </p>
        <Callout tone="success" icon="✅">
          Combinação vencedora: Compute Optimizer + memory metrics via CWA + EKS VPA + FIS chaos test + canary deployment + rollback automation. Economia 20-40% sustentável sem trazer risco de prod incident.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
