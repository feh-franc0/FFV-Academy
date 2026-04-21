import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cost-optimization-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Savings Plans: Compute vs EC2 Instance — diferença real?',
    options: [
      'Igual',
      'Compute SP aplica a EC2, Fargate e Lambda em qualquer region/family (flexível, menor desconto ~66%). EC2 Instance SP é específico a family+region (ex: m5 em us-east-1), desconto maior (~72%) mas menos flexível. SageMaker SP é dedicado a SageMaker — usualmente necessário em workload de ML',
      'São a mesma',
      'Só EC2 serve',
    ],
    correct: 1,
    explanation: 'Compute SP é o default recomendado — cobre maioria do compute com flexibilidade (muda família, region, migrou pra Fargate, ainda vale). EC2 Instance SP ganha desconto extra mas trava: se workload muda de m5 pra c6, commitment vira custo morto. Regra: 70-80% Compute SP + 10-20% EC2 Instance SP pra baseline estável + 10% on-demand pra spikes.',
  },
  {
    question: 'Spot fleet em produção: viável?',
    options: [
      'Nunca',
      'Sim em workloads tolerantes a interruption (2min warning): batch, CI, workers async, ML training com checkpoints, backend stateless atrás de ALB com capacity mista on-demand + spot. Usar diversified allocation (múltiplos instance types + AZs) reduz risco de interrupção simultânea',
      'Só dev',
      'Só Windows',
    ],
    correct: 1,
    explanation: 'Spot economiza 60-90% mas sai com 2min notice. Vai bem onde interruption = retry: batch jobs (AWS Batch on Spot), Fargate Spot em workloads stateless escaláveis, EKS com node groups Spot + Karpenter. Evitar: DBs, stateful sessions long-lived, jobs single-instance críticos. Diversified allocation (capacity-optimized) protege contra spike de interrupção em um pool.',
  },
  {
    question: 'Compute Optimizer é confiável?',
    options: [
      'Não',
      'Sim, com cautela: recomendações baseadas em 14 dias de CloudWatch + memory metrics (agent). Rightsizing pode economizar 20-40% mas exige validação — algumas cargas têm picos mensais/trimestrais. Combine Compute Optimizer + Cost Explorer + business context antes de aplicar',
      'Sempre 100%',
      'Só EC2',
    ],
    correct: 1,
    explanation: 'Compute Optimizer cobre EC2, EBS, Lambda, ECS Fargate, RDS (recente). Sugestões são estatísticas — não conhece picos raros nem compliance de overprovision. Workflow: Compute Optimizer gera hipótese → revisar em staging ou canary → rollback ready. Sem validação, cortar por recomendação cega causa degradation em produção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cost-optimization-sap"
      title="Cost optimization avançado: rightsizing, purchasing, monitoring"
      icon="💸"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="simulado-sap-c03"
      nextTitle="Capstone: simulado SAP-C03 comentado"
      quiz={quiz}
    >
      <Section title="Os 3 alavancas principais" accent={accent}>
        <CodeBlock lang="yaml">{`1. Rightsizing (corta desperdício):
   Compute Optimizer recommendations (EC2, Lambda, EBS, RDS)
   EBS gp2 → gp3 (mesma perf, 20% mais barato)
   S3 Intelligent-Tiering (auto move entre tiers)
   Idle resource cleanup (EIPs não-attached, snapshots órfãos)

2. Purchasing (comprar certo):
   Reserved Instances (DB/cache onde standard faz sentido)
   Savings Plans (Compute, EC2, SageMaker)
   Spot (batch, stateless worker, ML training)
   Enterprise Discount Program (EDP) com AWS direto

3. Architecture (consumir menos):
   Graviton (ARM) ~40% melhor price/perf
   Serverless quando tráfego variável
   S3 Lifecycle policies (Standard → IA → Glacier)
   CloudFront caching (menos origin hits)
   Data transfer optimization (VPC endpoints, same-AZ)`}</CodeBlock>
      </Section>

      <Section title="Automação de cleanup" accent={accent}>
        <p>
          Cost leaks típicos: EBS snapshots antigos órfãos, EIPs não-associados (cobram quando idle), NAT Gateways desnecessários (um por VPC em vez de por AZ), volumes EBS unattached, Load Balancers sem target, RDS stopped 7+ dias (AWS reinicia e cobra). Automatize via Lambda + EventBridge scheduled + Tag-based rules.
        </p>
        <CodeBlock lang="yaml">{`# Pipeline automatizado de cleanup
EventBridge (cron weekly)
  ↓
Lambda cost-cleanup:
  - Lista EBS snapshots idade > 90d sem tag "retain"
  - Lista EIPs idle (não-associated)
  - Lista RDS stopped 6 dias
  - Gera report SNS + Slack
  - Aguarda approval (Step Functions)
  - Deleta após approval

# Trusted Advisor (Business/Enterprise Support)
#  roda checks: Low Utilization EC2, Idle RDS, unused EIP
#  integra com Security Hub + EventBridge`}</CodeBlock>
      </Section>

      <Section title="Portfolio de commitments" accent={accent}>
        <p>
          Mix saudável em org AWS madura: 60-70% cobertura por Savings Plans/RIs, 10-20% Spot (onde possível), 10-20% on-demand (pra spikes imprevistos). Revisão mensal olhando Cost Explorer Coverage + Utilization reports. Compra incremental (1yr no-upfront pra preservar cash flow, 3yr all-upfront só em baseline cristalizado).
        </p>
        <Callout tone="success" icon="✅">
          Receita de 20-40% de redução em org típica: Compute Optimizer (rightsizing) + Compute SP 1yr (baseline estável) + Spot em workers batch + Graviton em stacks compatíveis + S3 Lifecycle + auto-cleanup de recursos órfãos + Reserved DB. Em 3-6 meses, economia compensa salário de FinOps engineer dedicado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
