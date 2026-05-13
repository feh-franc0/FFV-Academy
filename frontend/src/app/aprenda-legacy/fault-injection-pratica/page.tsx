import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('fault-injection-pratica');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual ferramenta Linux permite injetar latência, packet loss e corrupção de rede?',
    options: [
      'iptables sozinho',
      'tc (traffic control) com qdisc netem — parte do iproute2. Aplica regras por interface: tc qdisc add dev eth0 root netem delay 200ms 50ms distribution normal loss 1%. É a base do que Gremlin e Litmus fazem por trás',
      'ping',
      'curl',
    ],
    correct: 1,
    explanation: 'tc + netem é a lingua franca de chaos de rede no Linux. Gremlin, LitmusChaos, Chaos Mesh, ToxiProxy, todos eventualmente terminam em tc qdisc netem. Saber usar direto é útil pra debug e pra ambientes onde você não pode instalar agente. iptables dropa pacotes mas não simula latência/jitter.',
  },
  {
    question: 'O que é AWS FIS e qual seu diferencial?',
    options: [
      'Lambda',
      'AWS Fault Injection Service: serviço managed de chaos integrado com IAM, CloudWatch, EventBridge. Cria ExperimentTemplate com actions (StopInstances, APIThrottle, NetworkDisruption via SSM) e stopConditions baseadas em CloudWatch alarms. Auditado e governado',
      'Ferramenta beta',
      'Substituto do Chaos Monkey open source',
    ],
    correct: 1,
    explanation: 'AWS FIS (GA 2021) é chaos nativo com tudo que empresa regulada precisa: IAM granular, stopCondition via alarm (aborta experiment automaticamente), tags de escopo, CloudTrail logging. Actions vão de aws:ec2:stop-instances a aws:fis:inject-api-internal-error pra APIs AWS — simula falha do próprio control plane.',
  },
  {
    question: 'Como Istio faz fault injection sem mudar código do serviço?',
    options: [
      'Muda o código',
      'Via VirtualService com http.fault (delay ou abort), o sidecar Envoy aplica a falha antes de chegar no serviço alvo. Você pode atingir percentual (percentage.value: 10) e por header match — isolando o blast radius a requests específicos',
      'Só em dev',
      'Requer rebuild',
    ],
    correct: 1,
    explanation: 'Sidecar-based fault injection é elegante: service mesh intercepta o tráfego e aplica a falha. Zero mudança no serviço alvo, rollback é deletar VirtualService, escopo é por regex/header (ex: só requests com x-chaos: true do user-agent de teste). Linkerd e Consul Service Mesh têm equivalentes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="fault-injection-pratica"
      title="Fault injection prática"
      icon="💉"
      xp={55}
      readTime={13}
      trailName="Chaos Engineering"
      trailColor={accent}
      nextSlug="capstone-chaos-experiment-real"
      nextTitle="Capstone: chaos experiment end-to-end"
      quiz={quiz}
    >
      <Section title="Network chaos com tc qdisc netem" accent={accent}>
        <CodeBlock lang="bash">{`# Latência 200ms +/- 50ms (distribuição normal) + 1% packet loss em eth0
sudo tc qdisc add dev eth0 root netem delay 200ms 50ms distribution normal loss 1%

# Packet corruption 0.1% + reordering 25% 50%
sudo tc qdisc change dev eth0 root netem corrupt 0.1% reorder 25% 50%

# Bandwidth cap 1mbit
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# Regra SEGMENTADA (só pra IP 10.0.0.5) via filter
sudo tc qdisc add dev eth0 root handle 1: prio
sudo tc qdisc add dev eth0 parent 1:3 handle 30: netem delay 500ms
sudo tc filter add dev eth0 protocol ip parent 1:0 prio 3 u32 \\
  match ip dst 10.0.0.5/32 flowid 1:3

# SEMPRE salvar antes e remover depois
sudo tc qdisc show dev eth0
sudo tc qdisc del dev eth0 root`}</CodeBlock>
        <Callout tone="danger" icon="🚨">
          <strong>tc qdisc del dev eth0 root</strong> é o seu botão de abort. Teste o rollback ANTES de aplicar o chaos. Se você aplicar em host remoto sem rollback timer, pode perder a sessão SSH.
        </Callout>
      </Section>

      <Section title="stress-ng — pressão de CPU/memória/IO" accent={accent}>
        <CodeBlock lang="bash">{`# 4 workers CPU a 80% por 60s
stress-ng --cpu 4 --cpu-load 80 --timeout 60s --metrics

# Memory pressure: 2 workers alocando 1GB cada
stress-ng --vm 2 --vm-bytes 1G --vm-method all --timeout 120s

# IO pressure: 4 workers fazendo sync/read/write
stress-ng --io 4 --hdd 2 --hdd-bytes 512M --timeout 90s

# Fork storm (teste de limites de processo)
stress-ng --fork 8 --timeout 30s

# Cache thrashing
stress-ng --cache 4 --cache-level 3 --timeout 60s`}</CodeBlock>
      </Section>

      <Section title="AWS FIS — ExperimentTemplate" accent={accent}>
        <CodeBlock lang="yaml">{`description: "Derruba 50% das EC2 do ASG checkout e aborta se SLO cair"
roleArn: arn:aws:iam::123:role/fis-role-checkout
stopConditions:
  - source: aws:cloudwatch:alarm
    value: arn:aws:cloudwatch:us-east-1:123:alarm:checkout-slo-breach
targets:
  checkoutInstances:
    resourceType: aws:ec2:instance
    resourceTags:
      app: checkout
      env: prod
    selectionMode: PERCENT(50)
    filters:
      - path: State.Name
        values: [running]
actions:
  stopInstances:
    actionId: aws:ec2:stop-instances
    parameters:
      startInstancesAfterDuration: PT5M
    targets:
      Instances: checkoutInstances
tags:
  chaos: "true"
  ticket: CHAOS-1427`}</CodeBlock>
        <Callout tone="info" icon="🔒">
          O stopCondition ancorado em CloudWatch alarm é o que faz FIS seguro em prod: se o SLO quebra, AWS aborta o experiment automaticamente, sem humano no loop.
        </Callout>
      </Section>

      <Section title="Istio fault injection — VirtualService" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: payments-chaos
  namespace: prod
spec:
  hosts: [payments]
  http:
    - match:
        - headers:
            x-chaos-ring:
              exact: canary
      fault:
        delay:
          percentage:
            value: 100
          fixedDelay: 800ms
        abort:
          percentage:
            value: 10
          httpStatus: 503
      route:
        - destination:
            host: payments
    - route:
        - destination:
            host: payments`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Match por header <strong>x-chaos-ring: canary</strong> isola o blast radius: só requests sintéticos (ou usuários internos) sofrem a falha. Usuário final não vê nada.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
