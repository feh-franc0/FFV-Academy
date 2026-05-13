import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('disaster-recovery-estrategias');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'RTO e RPO significam o quê?',
    options: [
      'Igual',
      'RTO (Recovery Time Objective) = quanto tempo até voltar online. RPO (Recovery Point Objective) = quanto dado posso perder. App de trading: RPO=0, RTO segundos. App batch interno: RPO=24h, RTO=4h. Decisão de custo brutal — os dois definem estratégia',
      'Só RTO importa',
      'Igual a SLA',
    ],
    correct: 1,
    explanation: 'RPO puxa replicação: zero-data-loss exige sync replication (Aurora Global, Multi-AZ sync). 5min aceita async. 24h aceita snapshot diário. RTO puxa capacity quente em DR: zero RTO exige multi-site active; 10min exige warm standby; 1h aceita pilot light. RPO/RTO por tier de app é conversa de product + eng, não só infra.',
  },
  {
    question: 'Qual é a diferença entre Pilot Light e Warm Standby?',
    options: [
      'Nenhuma',
      'Pilot Light mantém só componentes core ligados (DB replicado, AMIs prontas), app layer desligado — escala sob demanda no DR (RTO minutos). Warm Standby mantém versão reduzida do app rodando em DR, pronta pra scale out (RTO &lt; 5min)',
      'Igual a Multi-Site',
      'Só backup',
    ],
    correct: 1,
    explanation: 'Pilot Light = "chama acesa" no DB, app desliga. Warm Standby = app em versão menor rodando 24/7 no DR. Custo cresce (Pilot Light ~5-10% do primário, Warm ~30-50%), RTO cai (10min vs 3min). Decisão por tier: tier-1 crítico = Warm ou Multi-Site; tier-2 = Pilot Light; tier-3 = Backup/Restore.',
  },
  {
    question: 'Route 53 + health checks em DR entrega o quê?',
    options: [
      'Só DNS',
      'Failover automático baseado em health check: DNS resolve pra região primária enquanto saudável; se health check falha (3 consecutivos), resolve pra secundária. Combinado com TTL baixo (60s) dá cutover em 1-3 minutos sem intervenção manual',
      'Backup',
      'Load balancer',
    ],
    correct: 1,
    explanation: 'Route 53 failover policy é o trigger clássico de multi-region DR. Health check pode ser HTTP/TCP no endpoint principal, ou CloudWatch alarm composite. TTL 60s balanceia: menor é responsivo mas pressiona resolvers; maior atrasa failover. Alternativa moderna: Route 53 Application Recovery Controller com routing controls booleanos controlados por IaC.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="disaster-recovery-estrategias"
      title="Disaster Recovery: 4 estratégias (backup a multi-site)"
      icon="🚨"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="edge-hibrido-sap"
      nextTitle="Edge e híbrido: Outposts, Wavelength, Local Zones"
      quiz={quiz}
    >
      <Section title="As 4 estratégias clássicas" accent={accent}>
        <CodeBlock lang="yaml">{`Backup & Restore:
  RTO: horas a dia
  RPO: horas (snapshot frequency)
  Custo: baixo (~0 em standby, só storage)
  Uso: tier-3 apps, dev, conteúdo estático

Pilot Light:
  RTO: 10-60 min
  RPO: minutos (DB replicação contínua)
  Custo: 5-15% do primário
  Uso: tier-2 apps corporativos

Warm Standby:
  RTO: 1-10 min
  RPO: segundos
  Custo: 30-50% do primário
  Uso: tier-1 apps de negócio

Multi-Site Active/Active:
  RTO: segundos (zero no ideal)
  RPO: zero (DB sync replication)
  Custo: 2x primário (ou mais)
  Uso: missão-crítica (trading, payments)`}</CodeBlock>
      </Section>

      <Section title="Serviços AWS por camada de DR" accent={accent}>
        <CodeBlock lang="yaml">{`Data replication:
  - S3 Cross-Region Replication (CRR) + Same-Region (SRR)
  - RDS cross-region read replicas (async)
  - Aurora Global Database (write forwarding, RPO ~1s)
  - DynamoDB Global Tables (multi-region multi-master)

Compute capacity:
  - AMI cross-region copy (pipeline em CodeBuild)
  - Launch Templates versionados, EC2 Image Builder

Orchestration:
  - AWS Elastic Disaster Recovery (DRS, ex-CloudEndure)
    replica bloco-nível pra região/AZ target, RPO segundos
  - AWS Backup pra snapshots centralizados cross-account
    cross-region (RDS/EBS/EFS/FSx/DynamoDB)

Traffic steering:
  - Route 53 health checks + failover routing
  - Route 53 Application Recovery Controller (ARC)
  - Global Accelerator (anycast IP, cross-region)

Tests:
  - AWS Fault Injection Service (FIS) pra game days
  - Resilience Hub avalia RPO/RTO declarados vs realidade`}</CodeBlock>
      </Section>

      <Section title="DR que funciona de verdade" accent={accent}>
        <p>
          DR não testado não existe. Game days regulares (trimestral mínimo), com cenários: falha de AZ inteira, falha de região, data corruption (requer restore point-in-time, não só failover), credenciais comprometidas. Automatizar o possível com playbook em Step Functions + SSM Automation — humano sob stress erra.
        </p>
        <Callout tone="warn" icon="⚠️">
          Antipattern: declarar "RTO 5 minutos" no SLA sem nunca ter testado failover real. Em incidente, descobre que IAM roles não existem na região DR, que DNS TTL é 3600s, que CDK nunca fez deploy lá. Teste trimestral não-negociável.
        </Callout>
        <Callout tone="success" icon="✅">
          AWS Elastic Disaster Recovery (DRS) + Resilience Hub + FIS cobrem a maior parte do stack DR moderno. Combine com automação em Step Functions pra runbook executável, não PDF estacionado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
