import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('reservas-savings-plans-spot');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Reserved Instance Standard vs Convertible — trade-off real?',
    options: [
      'Só nome',
      'Standard: desconto maior (~72% 3yr all-upfront) mas travado em instance type+region. Convertible: desconto menor (~66%) mas permite trocar family/OS dentro do valor do commitment. Convertible vale em stacks em evolução; Standard em workloads estáveis com family cristalizada (ex: RDS)',
      'São idênticos',
      'Só Standard conta',
    ],
    correct: 1,
    explanation: 'Standard lock-in premia quem tem certeza do workload. Convertible dá flexibilidade (upgrade m5 → m6g Graviton 1 ano depois, preservando commitment). Em AWS, RI é mais usado pra RDS/ElastiCache/Redshift onde Savings Plans não aplicam. Savings Plans são a escolha moderna pra EC2/Fargate/Lambda.',
  },
  {
    question: 'Spot interruption handling: patterns viáveis?',
    options: [
      'Esperar',
      '2min warning → graceful shutdown (drenar conexões, checkpoint, job retry via SQS message not deleted). Padrões: Karpenter em EKS, EC2 Auto Scaling com mixed instances policy (on-demand base + Spot), Fargate Spot com ECS capacity provider. Diversified allocation (capacity-optimized) minimiza interrupção simultânea',
      'Ignorar',
      'Só um tipo',
    ],
    correct: 1,
    explanation: 'Aplicação resiliente a Spot: stateless (ou state em storage externo), operações idempotentes, SQS/EventBridge garantindo que mensagem volta se worker morrer, health check que remove instance drenada do LB. Karpenter em EKS automatiza handoff pra nova Spot instance. Evitar: DBs em Spot, workload single-node crítico.',
  },
  {
    question: 'Portfolio saudável de commitments cobrindo compute:',
    options: [
      '100% SP',
      '60-70% Compute Savings Plans baseline estável + 10-15% EC2 Instance SP onde family está cristalizada + 10-20% Spot onde workload tolera + 5-10% on-demand pra spikes. Revisão mensal ajusta coverage rate target 75-85%',
      '0% commitment',
      'Só on-demand',
    ],
    correct: 1,
    explanation: 'Portfolio misto maximiza economia sem travar em curva que talvez mude. Coverage < 50% deixa dinheiro na mesa; > 90% vira risco (paga commitment não usado). Sweet spot 75-85%. Revisão mensal com Cost Explorer Coverage + Utilization reports. Compra incremental, não mega-deal anual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="reservas-savings-plans-spot"
      title="Reservas, Savings Plans e Spot: estratégia de portfolio"
      icon="💸"
      xp={55}
      readTime={13}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="finops-cultura-e-time"
      nextTitle="FinOps cultura: team accountability + processes"
      quiz={quiz}
    >
      <Section title="Spectrum de commitments AWS" accent={accent}>
        <CodeBlock lang="yaml">{`Savings Plans:
  Compute SP:
    Desconto ~66% (1yr) / ~72% (3yr)
    Cobre: EC2, Fargate, Lambda
    Flexível: family, region, OS, tenancy
  EC2 Instance SP:
    Desconto ~72% (1yr) / ~78% (3yr)
    Fixa: family + region
    Flexível: size, OS
  SageMaker SP:
    Dedicado SageMaker training + inference

Reserved Instances (legacy mas ainda usado):
  Standard: desconto máximo, locked em instance type
  Convertible: desconto menor, permite trocar family
  Uso principal: RDS, ElastiCache, Redshift, OpenSearch
  (onde Savings Plans não aplica)

Spot:
  Desconto 60-90% vs on-demand
  Interrupção com 2min warning
  Capacity optimized allocation recomendado
  Padrão pra batch, ML training, CI, workers stateless

Ondemand:
  Full price, paga só pelo que usa
  Buffer pra spikes imprevistos

Enterprise Discount Program (EDP):
  Negociação direta com AWS em gasto alto
  Usualmente 5-15% off em cima de tudo
  Commitment plurianual significativo`}</CodeBlock>
      </Section>

      <Section title="Algoritmo de decisão simples" accent={accent}>
        <CodeBlock lang="yaml">{`Passo 1 — analise baseline estável (12+ meses):
  Identifique compute que está presente 24/7 por 1+ anos
  Exemplo: 50 m5.xlarge prod backend, 10 c5.large workers

Passo 2 — cobertura SP proporcional:
  Compute SP 1yr no-upfront pra ~70% dessa baseline
  EC2 Instance SP pra famílias cristalizadas (RDS)

Passo 3 — Spot onde workload tolera:
  Batch jobs, ML training, ECS/EKS worker nodes
  Karpenter em EKS com provisioner Spot
  AWS Batch com compute environment Fargate Spot

Passo 4 — on-demand pra spikes:
  Autoscaling que cresce além do commitment coberto
  Workloads novos ainda em descoberta de padrão

Passo 5 — revisão mensal:
  Cost Explorer → Coverage % target 75-85%
  Utilization % target > 90% (evitar commitment idle)
  Ajustar nas próximas compras`}</CodeBlock>
      </Section>

      <Section title="Pitfalls comuns" accent={accent}>
        <p>
          Comprar 3yr all-upfront cedo demais (trava workload que pode mudar, queima caixa), underutilizar commitment (paga por hora que não usa), Spot em workload não preparado (incidents por interrupção), ignorar RI sharing em Organization (cada conta compra sozinha, perde escala), overcommit só em Compute SP sem análise de stability.
        </p>
        <Callout tone="warn" icon="⚠️">
          Nunca compre 3yr em workload com menos de 12 meses de histórico. Comece com 1yr no-upfront — em 12 meses você tem dados pra justificar (ou não) upgrade pra 3yr.
        </Callout>
        <Callout tone="success" icon="✅">
          Portfolio maduro em org AWS 2026: 60% Compute SP 1yr + 15% EC2 Instance SP 3yr baseline crítico + 15% Spot em workers/batch + 10% on-demand. Coverage 80%+, Utilization 95%+. Economia 25-40% sustentável sem virar projeto anual.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
