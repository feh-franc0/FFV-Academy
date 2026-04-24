import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('litmuschaos-k8s');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é LitmusChaos e qual seu status na CNCF?',
    options: [
      'Produto comercial',
      'Projeto CNCF Incubating de chaos engineering cloud-native, com CRDs (ChaosEngine, ChaosExperiment, ChaosResult), ChaosHub (biblioteca pública de experiments reutilizáveis), ChaosCenter (GUI) e integração nativa Prometheus/Grafana',
      'Fork de Chaos Monkey',
      'Ferramenta de teste de carga',
    ],
    correct: 1,
    explanation: 'Litmus virou incubating na CNCF em 2022, mantido pela MayaData/Harness. A arquitetura por CRD é a razão de ser cloud-native: você define experiments como recurso Kubernetes, versiona em Git, executa via GitOps. ChaosHub funciona como "Docker Hub pra chaos": pod-delete, node-drain, pod-cpu-hog, network-chaos etc.',
  },
  {
    question: 'Diferença entre ChaosEngine e ChaosExperiment?',
    options: [
      'Sinônimos',
      'ChaosExperiment: definição reutilizável do "como" (imagem, rbac, parâmetros default). ChaosEngine: instância que aplica o experiment a um target específico (appinfo, namespace, labels), com probes de hipótese e schedule. Um Experiment → N Engines',
      'Experiment é deprecated',
      'Engine é GUI apenas',
    ],
    correct: 1,
    explanation: 'Separação limpa: Experiment = template, Engine = execução. Isso permite versionar Experiments no ChaosHub e ter múltiplas Engines com parâmetros diferentes (duration, chaosInterval, targetPods) sem duplicar definição. Probes dentro do Engine fazem o papel de steady-state hypothesis do manifesto.',
  },
  {
    question: 'Qual o papel do ChaosResult e das Probes?',
    options: [
      'Só log',
      'ChaosResult é CRD que guarda verdict (Pass/Fail/Awaited) e phase. Probes são checks (httpProbe, k8sProbe, promProbe, cmdProbe) avaliadas em pontos do lifecycle (PreChaos, DuringChaos, PostChaos) — elas traduzem steady-state hypothesis em assertions executáveis',
      'Dashboard bonito',
      'Nada importante',
    ],
    correct: 1,
    explanation: 'Probes são o coração científico do Litmus. Você declara promProbe consultando checkout_success_rate antes, durante e depois do chaos — se violar threshold, ChaosResult vira Fail e a experiment é abortada. Sem probes, Litmus seria só "mata pod aleatório". Com probes, virou ciência.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="litmuschaos-k8s"
      title="LitmusChaos no Kubernetes"
      icon="☸️"
      xp={55}
      readTime={13}
      trailName="Chaos Engineering"
      trailColor={accent}
      nextSlug="game-days-estruturados"
      nextTitle="Game days estruturados"
      quiz={quiz}
    >
      <Section title="Instalação e arquitetura" accent={accent}>
        <CodeBlock lang="bash">{`# Install via Helm
helm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/
helm install chaos litmuschaos/litmus \\
  --namespace litmus --create-namespace \\
  --set portal.frontend.service.type=ClusterIP

# Instala experiments do ChaosHub
kubectl apply -f https://hub.litmuschaos.io/api/chaos/3.0.0?file=charts/generic/experiments.yaml -n prod`}</CodeBlock>
        <Callout tone="info" icon="🏗️">
          Arquitetura: ChaosCenter (control plane) + Subscriber (agent por cluster) + Experiments (CRDs no namespace target). RBAC isolado por experiment — pod-delete não tem permissão de node-drain.
        </Callout>
      </Section>

      <Section title="Pod delete — experiment básico" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: checkout-pod-delete
  namespace: prod
spec:
  appinfo:
    appns: prod
    applabel: "app=checkout"
    appkind: deployment
  chaosServiceAccount: litmus-admin
  engineState: active
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: "60"
            - name: CHAOS_INTERVAL
              value: "10"
            - name: FORCE
              value: "false"
            - name: PODS_AFFECTED_PERC
              value: "50"
        probe:
          - name: checkout-slo
            type: promProbe
            mode: Continuous
            runProperties:
              probeTimeout: 5
              interval: 5
              retry: 2
            promProbe/inputs:
              endpoint: "http://prometheus.monitoring:9090"
              query: "sum(rate(checkout_success_total[1m])) / sum(rate(checkout_total[1m])) * 100"
              comparator:
                type: float
                criteria: ">="
                value: "99.0"`}</CodeBlock>
      </Section>

      <Section title="Network chaos — pod-network-latency" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: payments-network-latency
spec:
  appinfo: { appns: prod, applabel: "app=payments", appkind: deployment }
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-network-latency
      spec:
        components:
          env:
            - name: NETWORK_LATENCY
              value: "800"
            - name: TOTAL_CHAOS_DURATION
              value: "120"
            - name: CONTAINER_RUNTIME
              value: "containerd"
            - name: SOCKET_PATH
              value: "/run/containerd/containerd.sock"`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Experiments de rede usam <strong>tc qdisc netem</strong> via init container com NET_ADMIN capability. Em clusters managed (EKS/GKE) confirme se nodes permitem essa capability — senão o experiment falha com "permission denied".
        </Callout>
      </Section>

      <Section title="Catálogo essencial do ChaosHub" accent={accent}>
        <CodeBlock lang="markdown">{`Generic (pod/node)
- pod-delete, pod-kill, pod-cpu-hog, pod-memory-hog
- pod-network-loss, pod-network-latency, pod-network-corruption
- node-drain, node-cpu-hog, node-memory-hog, node-taint, kubelet-service-kill

Cloud specific
- ec2-terminate-by-id, ec2-terminate-by-tag
- ebs-loss-by-id
- azure-instance-stop
- gcp-vm-instance-stop

Infra
- kube-proxy-service-down, coredns-pod-delete
- docker-service-kill, containerd-kill`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
