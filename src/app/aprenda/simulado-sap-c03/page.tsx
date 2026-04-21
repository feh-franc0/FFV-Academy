import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('simulado-sap-c03');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a abordagem correta em questão de 280 palavras com 4 opções plausíveis?',
    options: [
      'Ler rápido, chutar na mais longa',
      'Ler enunciado, extrair requisitos (RPO/RTO, budget, compliance, scale), eliminar opções que violam algum requisito, escolher entre remanescentes pela "most cost-effective" ou "least operational overhead" conforme pedido',
      'Escolher primeira opção técnica',
      'Decorar resposta',
    ],
    correct: 1,
    explanation: 'SAP tem 3-4 opções todas tecnicamente viáveis. O filtro é requisito quantitativo ou operacional. Ler "RPO de 5 minutos" elimina backup/restore. "Menor overhead operacional" elimina self-managed. "Auditoria PCI DSS" puxa Security Hub + Config + CloudTrail org trail. Extrair requisitos antes de olhar opções é a chave.',
  },
  {
    question: 'Pra cenário "empresa multi-account precisa block regions não-autorizadas", melhor ação?',
    options: [
      'IAM policy por usuário',
      'SCP no Root OU com Deny aws:RequestedRegion não em allowlist, combinado com IAM Identity Center permission sets revisados. SCP garante teto mesmo se IAM policy permitir; centraliza enforcement sem depender de cada admin local',
      'Config rule',
      'Manual audit',
    ],
    correct: 1,
    explanation: 'SCP é guardrail organizacional. Config rule só detecta violations pós-fato. IAM policy por conta é distribuído e drifta. SCP no Root ou Workloads OU com Deny conditional em aws:RequestedRegion é preventive, uniforme, auditable. Combinar com Region Deny list em IAM Identity Center reforça.',
  },
  {
    question: 'Workload on-prem com requisito de migração: 500 VMs, inventário desconhecido, 12 meses timeline — primeiro passo?',
    options: [
      'Rehost imediato',
      'Application Discovery Service + Migration Hub pra descoberta e análise de dependências (2-4 semanas). Portfolio analysis decide 7 Rs por app. Wave planning. Depois executa waves incrementais com MGN/DMS',
      'Comprar Outposts',
      'Refactor tudo',
    ],
    correct: 1,
    explanation: 'Sem descoberta, migração vira chute. Discovery Service coleta CPU, memory, network flows de cada VM, identifica dependências (app A chama DB B chama cache C). Sem isso, apps migram em ordem errada, quebram. Discovery + Portfolio Analysis + Wave Plan é pré-condição — tecnicamente é o "domínio migration planning" do SAP (20% da prova).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="simulado-sap-c03"
      title="Capstone: simulado SAP-C03 comentado"
      icon="🏁"
      xp={95}
      readTime={22}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="10 questões comentadas por domínio" accent={accent}>
        <CodeBlock lang="markdown">{`# Simulado SAP-C03 — 10 questões + raciocínio

## Q1 (Design Complexity - SCPs)
Cenário: Empresa com 80 contas em Organization. Security team quer impedir
criação de recursos fora de 3 regiões aprovadas, mesmo se admin local tentar.

A) IAM policy global aplicada em cada conta  ❌ distribuído, drifta
B) SCP no Workloads OU com Deny em aws:RequestedRegion ✅
C) Config rule + SNS alert  ❌ detective only
D) Service Catalog restringindo products ❌ só cobre provisioning via catalog

Resposta: B — guardrail preventive, uniforme em todas contas da OU.

## Q2 (New Solutions - Event-driven)
Cenário: pipeline de 100k eventos/min, processamento idempotente,
tolerante a retry, custo é crítico, latência 2s aceitável.

A) Kinesis Data Streams + Lambda consumers  ✅
B) MSK Serverless + ECS workers  ❌ overkill para 100k/min
C) SQS FIFO + Lambda  ❌ FIFO tem limite 3k/shard, caro em alto volume
D) SNS + Lambda fanout  ❌ sem ordering/replay

Resposta: A — KDS shard ~1000 rec/s, 100 shards cobre pico com margem,
Lambda Event Source Mapping paraleliza, cost-effective.

## Q3 (Migration Planning)
(... 7 questões a mais cobrindo os domínios restantes)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Prática recomendada: Tutorials Dojo (6 simulados completos ~$15) + AWS Official Practice Exam + re-leitura de whitepapers Well-Architected. Simulados cronometrados em condições reais (180min, sem pausa).
        </Callout>
      </Section>

      <Section title="Time management e heurísticas" accent={accent}>
        <p>
          Primeira passada: leia todas 75, responda as 40-50 que parecem claras (~90min), marque dúvidas. Segunda passada: revise marcadas (~60min). Últimos 30min: revisão final das com menor confidence. Se bater confusão total em alguma, marque qualquer e move on — obsessão custa 3 outras.
        </p>
        <CodeBlock lang="yaml">{`Heurísticas pra distratores:
  "most cost-effective"    → elimina soluções mais caras (Outposts, EKS)
  "least operational"      → favorece managed (Bedrock, Athena, Fargate)
  "minimize downtime"      → puxa CDC/replication, blue/green
  "HIPAA/PCI compliance"   → exige BAA, encryption, audit trail
  "global low latency"     → CloudFront / Global Accelerator / Lattice
  "pay-per-use"            → serverless, Spot, on-demand

Red flags de opção errada:
  - "Usar IAM user long-lived com access key"
  - "CloudFront pra tráfego interno VPC-to-VPC"
  - "Deploy manual sem IaC em ambiente prod"
  - "Sem backup multi-region pra workload crítico"`}</CodeBlock>
      </Section>

      <Section title="Pós-simulado: o que fazer com o resultado" accent={accent}>
        <p>
          Revise TODAS as questões — inclusive as acertadas (pode ter acertado por sorte). Para cada errada, leia documentação oficial AWS sobre o serviço + whitepaper relacionado. Anote padrão de erro (domínio específico, tipo de distrator). Refaça simulado 2 semanas depois — progresso mede aprendizado real.
        </p>
        <Callout tone="success" icon="🎓">
          SAP-C03 é maratona não sprint. Score inicial em simulado sério costuma ser 50-60% após SAA recente — normal. Com 2-3 meses dedicados (labs + leitura + simulados), sobe pra 75-85%. Fazendo a prova real: passar com 750 é metas pragmática; score 800+ vem naturalmente se estudo foi conceitual, não decoreba.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
