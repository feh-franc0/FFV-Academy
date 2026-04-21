import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('containers-serverless-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'ECS vs EKS: critério de escolha real?',
    options: [
      'EKS sempre',
      'ECS quando time quer menor operational overhead e não precisa de ecossistema Kubernetes (Helm, operators, CRDs). EKS quando workload já é K8s em outras clouds, ou quando precisa do ecossistema (ArgoCD, service mesh custom, operator pattern). Ambos rodam em Fargate ou EC2',
      'ECS é legado',
      'Custo igual',
    ],
    correct: 1,
    explanation: 'ECS é simples e barato — task definition + service, AWS-native, menos peças. EKS é Kubernetes completo com todo poder/complexidade. Se time já tem skills K8s, EKS ganha portabilidade. Se time é pequeno e workload AWS-only, ECS economiza operational cost. Fargate remove gestão de EC2 em ambos — em 2026 é default para workloads novos.',
  },
  {
    question: 'App Runner tem nicho?',
    options: [
      'Não',
      'Sim: deploy simples de aplicações web/API containerizadas com zero config (git push → URL HTTPS), autoscaling automático, HTTPS nativo. Ideal pra prototipos, microserviços simples, SaaS empresarial — elimina config de ALB, task def, SG, ECR pipeline. Trade-off: menos flexibilidade que ECS Fargate',
      'Substitui EKS',
      'Só dev',
    ],
    correct: 1,
    explanation: 'App Runner é "Heroku da AWS". Entrega container rodando atrás de HTTPS com 3 cliques ou PR merge. Cobra por CPU/memória/requests. Limite: menos tuning de networking (sem VPC customizado por padrão), sem customização profunda. Bom match pra API stateless que não justifica ECS completo.',
  },
  {
    question: 'App Mesh + Cloud Map: quando?',
    options: [
      'Sempre',
      'Arquiteturas com 10+ microserviços que se beneficiam de service mesh (mTLS entre serviços, observability tracing, traffic shifting canary, retries/timeouts centralizados). Cloud Map é o service discovery (DNS-based). Em arquitetura simples (3-4 serviços), é overkill',
      'Só ECS',
      'Só legado',
    ],
    correct: 1,
    explanation: 'Service mesh (Envoy-based no App Mesh) vale quando complexidade de rede entre serviços justifica: mTLS automático, traces com X-Ray, canaries sem mudar código app. Em stack pequena, Istio/App Mesh adicionam complexidade sem retorno. VPC Lattice é alternativa mais simples para mesh L7 AWS-nativo sem Envoy.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="containers-serverless-sap"
      title="Containers e serverless em arquitetura enterprise"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="hibrido-direct-connect"
      nextTitle="Híbrido: Direct Connect, Site-to-Site VPN, Storage Gateway"
      quiz={quiz}
    >
      <Section title="Spectrum de compute AWS" accent={accent}>
        <CodeBlock lang="yaml">{`Lambda:
  Runtime managed, ideal event-driven, cold start milisegundos
  Limites: 15min, 10GB RAM, /tmp 10GB
  Container image support (até 10GB)
  SnapStart pra Java reduzir cold start

ECS Fargate:
  Containers sem EC2 (serverless compute)
  Task definitions, services, autoscaling
  Ideal long-running APIs, batch jobs

ECS on EC2:
  Mais controle (GPU, custom AMI, Spot)
  Mais operational overhead

EKS Fargate:
  Kubernetes sem gerir nodes (limites: sem DaemonSets,
  alguns operators exigem EC2)

EKS on EC2 (+ Karpenter):
  K8s completo com scaling por Karpenter (fora do ASG)

App Runner:
  Git/ECR → container rodando com HTTPS, zero infra

Batch:
  Queue de jobs batch, escolhe compute (Fargate/EC2/Spot)
  automaticamente. Perfeito pra ML training, rendering`}</CodeBlock>
      </Section>

      <Section title="Padrões modernos 2026" accent={accent}>
        <p>
          Default pra API stateless: Fargate (ECS ou EKS dependendo do skill do time). Default pra event-driven/async: Lambda + EventBridge + SQS. Default pra batch: Batch on Fargate Spot. Default pra prototipos/SaaS simples: App Runner. EC2 bare continua relevante apenas em cenários específicos (GPU, requisitos legados, licenciamento per-core).
        </p>
        <CodeBlock lang="yaml">{`# Exemplo CDK: ECS Fargate service autoescalado
const cluster = new ecs.Cluster(this, 'C', { vpc });

const taskDef = new ecs.FargateTaskDefinition(this, 'T', {
  cpu: 512, memoryLimitMiB: 1024,
});
taskDef.addContainer('api', {
  image: ecs.ContainerImage.fromRegistry('111.dkr.ecr.us-east-1.amazonaws.com/api:v1.2'),
  logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'api' }),
  portMappings: [{ containerPort: 8080 }],
});

const svc = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Svc', {
  cluster, taskDefinition: taskDef,
  desiredCount: 2, minHealthyPercent: 100,
  circuitBreaker: { rollback: true },
});

svc.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 50 })
  .scaleOnCpuUtilization('cpu', { targetUtilizationPercent: 60 });`}</CodeBlock>
      </Section>

      <Section title="Quando mesh e service discovery agregam" accent={accent}>
        <p>
          Cloud Map dá service discovery AWS-nativo: registra instância de serviço num namespace, clients descobrem via DNS ou API. App Mesh adiciona camada Envoy pra L7 routing, retries declarativos, mTLS, observability tracing. VPC Lattice é a alternativa mais recente — mesh L7 managed sem precisar rodar Envoy, com IAM-based auth nativo.
        </p>
        <Callout tone="success" icon="✅">
          Escolha de compute em SAP-C03 é quase sempre: Lambda (event small), Fargate (container pequeno-médio), EC2 (requisito específico), Batch (job massa), App Runner (prototipo). Raramente EKS ganha se time não é K8s-native.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
