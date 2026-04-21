import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('well-architected-aplicado');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Sustainability é o 6º pilar (desde 2021)?',
    options: [
      'Marketing',
      'Decisões arquiteturais têm footprint energético/carbono mensurável. O pilar pede: rightsizing (idle é CO2), scale em região de grid limpo, managed services (economia de escala), lifecycle de dados (tiering, deleção), efficient runtimes (Graviton)',
      'Só compliance',
      'Não é relevante',
    ],
    correct: 1,
    explanation: 'Sustainability liga engenharia a ESG. Escolha de região afeta footprint (eu-north-1 em hidrelétrica é cleaner que us-east-1). Graviton gasta ~60% menos energia que x86 equivalente. S3 Lifecycle movendo fria pra Glacier Deep Archive economiza CO2 por ser menos replicada. Faz parte da prova — não decorar, entender lógica.',
  },
  {
    question: 'Como o WA Tool é usado na prática?',
    options: [
      'Auditoria externa',
      'Self-assessment: time responde questionário por pilar, identifica high-risk items (HRIs) e medium-risk items (MRIs), prioriza remediation. Rodar trimestralmente ou em marcos. Integra com Trusted Advisor + Business Support pra recomendações quantitativas',
      'Só marketing',
      'Nunca se usa',
    ],
    correct: 1,
    explanation: 'WA Tool é guia estruturado de auto-reflexão, não auditoria. Cada workload cadastrado responde 40+ questões. Output: lista priorizada de melhorias. Times experientes fazem WA review a cada ciclo trimestral. Lenses especializados (Serverless, ML, SaaS) trazem questões adicionais por domínio.',
  },
  {
    question: 'Qual é antipattern comum em Operational Excellence?',
    options: [
      'Automação',
      'Runbooks documentados mas nunca testados, chaos engineering ausente, alertas ruidosos que ninguém lê. WA pede: playbook automatizado, game days recorrentes, MTTR rastreado, post-mortems blame-free com action items acompanhados',
      'IaC',
      'Monitoramento',
    ],
    correct: 1,
    explanation: 'OpEx é sobre aprender com operação. Time que só reage a incident sem capturar pattern não evolui. WA questiona: "vocês fazem game day? runbook foi testado last 90d? post-mortem gera PRs concretos?". Diferença entre ops apagando fogo e ops aprendendo sistematicamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="well-architected-aplicado"
      title="Well-Architected Framework aplicado em review"
      icon="🏛️"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="disaster-recovery-estrategias"
      nextTitle="Disaster Recovery: 4 estratégias (backup a multi-site)"
      quiz={quiz}
    >
      <Section title="Os 6 pilares" accent={accent}>
        <CodeBlock lang="yaml">{`Operational Excellence:
  Executar workloads com eficiência e melhorar continuamente.
  Práticas: IaC, runbooks, game days, post-mortems, deploy frequente
  e pequeno, rollback automático.

Security:
  Proteger sistemas e dados, habilitar delivery segura.
  Práticas: least privilege, defense in depth, encryption
  at-rest/in-transit, automated response (GuardDuty + Lambda).

Reliability:
  Workloads performam corretamente mesmo em falhas.
  Práticas: multi-AZ, auto-recovery, throttling, circuit breakers,
  chaos engineering, RPO/RTO definidos por tier.

Performance Efficiency:
  Usar recursos computacionais de forma eficiente.
  Práticas: escolha informada de instance types, managed
  services onde cabem, caching, async onde possível.

Cost Optimization:
  Evitar gasto desnecessário, pagar pelo que entrega valor.
  Práticas: rightsizing contínuo, commitments, Spot onde tolera,
  storage tiering, automation pra desligar dev à noite.

Sustainability:
  Minimizar impacto ambiental de workloads cloud.
  Práticas: região limpa, Graviton/ARM, managed efficient,
  data lifecycle, código eficiente (menos ciclos CPU = menos CO2).`}</CodeBlock>
      </Section>

      <Section title="Review estruturada em ciclo" accent={accent}>
        <p>
          WA review não é evento único. Cadence realista: workload novo → review inicial pré-prod; workloads em operação → review trimestral leve; pós-incidente grande → review focada no pilar afetado. Cada review gera backlog concreto, com owner, deadline e follow-up na próxima.
        </p>
        <CodeBlock lang="yaml">{`Output típico de WA review (workload "checkout-api"):

High-Risk Items (HRI):
  - [Security] Secrets ainda em env vars (não Secrets Manager)
  - [Reliability] Single-AZ RDS em prod
  - [CostOpt] No commitments em workload stable de 18 meses

Medium-Risk Items (MRI):
  - [OpEx] Runbook de rollback não testado em 2024
  - [PerfEff] EC2 m5.2xlarge em workload que usa 15% CPU
  - [Sustain] Logs retention 7 anos em bucket sem lifecycle

Improvement plan (Q2):
  - Migrate secrets to SM (owner: security, due: M+30d)
  - Enable RDS Multi-AZ (owner: checkout-team, due: M+14d)
  - Purchase 1-year Compute Savings Plan (owner: finops)`}</CodeBlock>
      </Section>

      <Section title="Lenses e integrações" accent={accent}>
        <p>
          Lenses adicionam perguntas específicas por domínio sem duplicar os 6 pilares: Serverless Lens, Machine Learning Lens, SaaS Lens, IoT Lens, Hybrid Networking Lens. Você ativa lens por workload. WA Tool também puxa findings automáticos de Trusted Advisor (com Business Support) e Config — reduz trabalho manual.
        </p>
        <Callout tone="success" icon="✅">
          Regra prática: cada workload tem entry no WA Tool + lens relevante ativada + review agendada no calendário. Sem isso, "fazemos Well-Architected" é folclore corporativo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
