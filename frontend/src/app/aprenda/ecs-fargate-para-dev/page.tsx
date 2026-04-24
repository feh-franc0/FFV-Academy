import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ecs-fargate-para-dev');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando escolher Fargate em vez de Lambda?',
    options: [
      'Sempre Lambda',
      'Fargate: quando precisa > 15min, app com estado local (WebSocket pool), runtime custom (gRPC server), imagem > 10GB. Lambda: requests curtos, escala zero, menor custo em baixo volume',
      'Fargate só pra Java',
      'Ambos iguais',
    ],
    correct: 1,
    explanation: 'Lambda = function. Fargate = container. Fargate sem gerenciar EC2 (serverless container). Trade-off: Fargate sem cold start extremo mas SEM escala zero (paga task rodando). Lambda paga por invocação mas tem cold start em cargas baixas.',
  },
  {
    question: 'O que é Task Definition em ECS?',
    options: [
      'Descrição de trabalho',
      'JSON que define: container image, CPU/memória, env, ports, IAM role, log config. "Blueprint" de task. Service usa Task Definition pra rodar N tasks com Load Balancer',
      'Só Fargate',
      'Substitui Dockerfile',
    ],
    correct: 1,
    explanation: 'Task Def = spec imutável da execução (revisão a cada mudança, ex: nginx:1.25-r3). Service = desired count + deployment strategy + ALB integration. Task = instância rodando. Service reconcilia: desired 3, current 2 → lança 1.',
  },
  {
    question: 'Por que Fargate Spot?',
    options: [
      'Fargate normal',
      'Até 70% desconto pra tasks interruptible — AWS pode matar com 2min aviso. Bom pra batch, workers, dev. Não use pra serving público SLA-critical',
      'Mais rápido',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Fargate Spot é equivalente a EC2 Spot — capacidade ociosa da AWS a 30% do preço. Pode ser interrompido. Tasks precisam handle SIGTERM graceful shutdown. Uso: pipelines de dados, workers SQS, ambientes de dev.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ecs-fargate-para-dev"
      title="ECS Fargate pra dev: quando escolher vs Lambda"
      icon="🐳"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="cloudformation-sam-cdk"
      nextTitle="IaC: CloudFormation vs SAM vs CDK"
      quiz={quiz}
    >
      <Section title="Anatomia de um deployment" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Cluster</strong>: agrupamento lógico de services.</li>
          <li><strong>Task Definition</strong>: JSON com container specs (revisões imutáveis).</li>
          <li><strong>Service</strong>: mantém N tasks rodando; integra com ALB target group; deploy strategy (rolling/blue-green).</li>
          <li><strong>Task</strong>: instância rodando a Task Def.</li>
        </ul>
      </Section>

      <Section title="ECR — Elastic Container Registry" accent={accent}>
        <Callout tone="info" icon="💡">
          ECR hospeda imagens privadas. Lifecycle policies removem versões antigas automaticamente (manter últimas 10, ou &lt; 30 dias). Scan on push detecta CVEs. CodeBuild pushes → Task Def referencia → Service faz deploy.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
