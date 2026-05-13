import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('chaos-monkey-gremlin');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o objetivo original do Chaos Monkey da Netflix?',
    options: [
      'Fazer barulho em TechCrunch',
      'Forçar engenheiros a projetar serviços resilientes a morte aleatória de instâncias, matando VMs EC2 em horário comercial. Se matar instância quebra o serviço, o serviço era frágil — a ferramenta transforma fragilidade latente em falha observável',
      'Testar auto-scaling',
      'Reduzir custo de AWS',
    ],
    correct: 1,
    explanation: 'Chaos Monkey (2010) nasceu do princípio "failure is inevitable, better make it happen on your terms". Matar instâncias em dia útil força devs a escrever código stateless, com health checks e reconnection logic. Depois dele veio a Simian Army (Chaos Kong, Chaos Gorilla, Latency Monkey, Janitor Monkey).',
  },
  {
    question: 'Diferença entre Simian Army, Gremlin e ChaosToolkit?',
    options: [
      'Mesmo produto',
      'Simian Army: suite open source Netflix especializada em AWS (Chaos Monkey, Kong, Gorilla). Gremlin: SaaS comercial com GUI, agente cross-platform, attack library pronta. ChaosToolkit: framework open source declarativo (JSON/YAML experiments) agnóstico de plataforma',
      'Apenas nome diferente',
      'Todos são k8s-only',
    ],
    correct: 1,
    explanation: 'Cada ferramenta resolve escopo diferente. Simian Army virou histórico (parcialmente deprecated, substituído por Spinnaker + ChaosMonkey 2.0). Gremlin vende "chaos as a service" (bom pra empresa sem time de SRE). ChaosToolkit é o padrão OSS declarativo. A escolha é sobre maturidade do time, não sobre melhor ferramenta.',
  },
  {
    question: 'Chaos Kong vs Chaos Gorilla vs Chaos Monkey?',
    options: [
      'Ordem alfabética',
      'Monkey: mata instância individual. Gorilla: derruba Availability Zone inteira. Kong: derruba Region inteira. Escala crescente de blast radius, usado em game days trimestrais pra validar multi-AZ / multi-region failover',
      'Só Monkey existe',
      'Todos matam pods',
    ],
    correct: 1,
    explanation: 'Hierarquia de falhas geográficas da Simian Army. Monkey (instância) valida auto-healing e load balancer. Gorilla (AZ) valida que você replicou dados e tráfego cross-AZ. Kong (region) valida DR real (Route53 failover, replicação inter-região). Netflix roda Chaos Kong de verdade, trimestralmente, em produção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="chaos-monkey-gremlin"
      title="Chaos Monkey, Simian Army, Gremlin"
      icon="🐒"
      xp={50}
      readTime={12}
      trailName="Chaos Engineering"
      trailColor={accent}
      nextSlug="litmuschaos-k8s"
      nextTitle="LitmusChaos no Kubernetes"
      quiz={quiz}
    >
      <Section title="Netflix Simian Army" accent={accent}>
        <p>
          A Simian Army foi o primeiro ecossistema de chaos em produção. Cada "macaco" ataca camada diferente: do processo à região.
        </p>
        <CodeBlock lang="markdown">{`Chaos Monkey     — mata instância EC2 aleatória (horário comercial)
Chaos Gorilla    — derruba Availability Zone inteira
Chaos Kong       — derruba Region AWS inteira
Latency Monkey   — injeta latência artificial em chamadas
Conformity Monkey— flagra instâncias fora do padrão (tags, SG)
Security Monkey  — audita violações de security group
Doctor Monkey    — detecta instâncias unhealthy, tira de rotação
Janitor Monkey   — limpa recursos órfãos (EBS, ELB sem target)
10-18 Monkey     — testa i18n/l10n em tempo de execução`}</CodeBlock>
        <Callout tone="info" icon="📜">
          Em 2020 a Netflix reorganizou: Chaos Monkey 2.0 integrou com Spinnaker. Security/Janitor/Conformity viraram parte do Swabbie. Mas a filosofia — matar coisas de propósito pra forçar resiliência — virou padrão da indústria.
        </Callout>
      </Section>

      <Section title="Chaos Monkey 2.0 — config" accent={accent}>
        <CodeBlock lang="yaml">{`# chaos.properties (Spinnaker)
chaos:
  enabled: true
  leashed: false
  schedule:
    enabled: true
    startHour: 9
    endHour: 15
    timeZone: America/Sao_Paulo
  exceptions:
    - account: prod-critical
      stack: payments
      detail: "*"
  outage:
    durationMinutes: 5
  trackers:
    email:
      enabled: true
      address: chaos@ffv.local`}</CodeBlock>
      </Section>

      <Section title="Gremlin — SaaS com GUI" accent={accent}>
        <CodeBlock lang="bash">{`# Instala agente Gremlin em host
curl https://rpm.gremlin.com/gremlin.repo -o /etc/yum.repos.d/gremlin.repo
sudo yum install -y gremlin gremlind

# Configura team id e secret
sudo gremlin init

# Dispara resource attack: 80% CPU por 60s em 2 cores
gremlin attack cpu -l 60 -c 2 -p 80

# Network attack: 200ms latency pra 10.0.0.0/24 por 5m
gremlin attack latency -l 300 -m 200 -h 10.0.0.0/24

# Blackhole: bloqueia tráfego pra porta 5432 (Postgres) por 2m
gremlin attack blackhole -l 120 -p 5432`}</CodeBlock>
        <Callout tone="success" icon="💡">
          Gremlin é ótimo quando o time ainda não tem SRE maduro: UI, RBAC, audit log, "halt all" de emergência e attack library pronta (CPU, memory, disk, latency, packet loss, blackhole, DNS, time travel).
        </Callout>
      </Section>

      <Section title="ChaosToolkit — declarativo e open source" accent={accent}>
        <CodeBlock lang="yaml">{`version: 1.0.0
title: "checkout resiliente a falha do serviço de cupom"
description: "checkout deve funcionar mesmo com coupon-service down"
steady-state-hypothesis:
  title: "checkout success rate saudável"
  probes:
    - type: probe
      name: checkout-success-rate
      tolerance: [99.0, 100.0]
      provider:
        type: http
        url: "http://prom/api/v1/query?query=checkout_success_rate_5m"
method:
  - type: action
    name: kill-coupon-service
    provider:
      type: process
      path: kubectl
      arguments: ["delete", "pod", "-l", "app=coupon", "-n", "prod"]
    pauses:
      after: 120
rollbacks: []`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
