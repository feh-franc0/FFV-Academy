import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, LayerStack, StackFlow, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('containers-ecs-eks');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa já usa Kubernetes on-prem e quer migrar para AWS mantendo manifestos kubectl. Qual serviço escolher?',
    options: [
      'Amazon ECS com Fargate',
      'Amazon EKS',
      'AWS Elastic Beanstalk',
      'AWS App Runner',
    ],
    correct: 1,
    explanation: 'EKS é Kubernetes gerenciado AWS. Manifestos YAML, kubectl, Helm — tudo compatível. ECS é orquestrador proprietário AWS (mais simples mas não-portável para fora). Beanstalk/App Runner são PaaS para apps simples, sem Kubernetes.',
  },
  {
    question: 'Qual a diferença entre ECS launch type Fargate e EC2?',
    options: [
      'Fargate: você não gerencia EC2, paga por vCPU/GB/segundo. EC2: você gerencia cluster de EC2 e paga pelas instâncias',
      'Fargate suporta só Linux; EC2 suporta Windows',
      'Fargate é mais caro em todos os cenários',
      'EC2 não suporta Auto Scaling',
    ],
    correct: 0,
    explanation: 'Fargate é serverless para containers: zero host management, paga por vCPU-segundo + GB-segundo. Launch type EC2 usa cluster de EC2 que VOCÊ provisiona/mantém (escolhe instâncias, patches, etc.) — mais controle, possivelmente mais barato em cargas grandes/constantes.',
  },
  {
    question: 'Em ECS, qual componente define "como rodar um container" (imagem, CPU, memória, portas)?',
    options: [
      'Cluster',
      'Service',
      'Task Definition',
      'Container Agent',
    ],
    correct: 2,
    explanation: 'Task Definition é a "receita" — JSON que define containers, imagem, CPU/RAM, network mode, volumes, env vars, IAM task role. Task é uma INSTÂNCIA em execução dessa definition. Service mantém N tasks rodando + integra com LB. Cluster agrupa capacity.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="containers-ecs-eks"
      title="ECS vs EKS: Orquestração de Containers"
      icon="📦"
      xp={70}
      readTime={13}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="serverless-lambda-avancado"
      nextTitle="Serverless Avançado: Lambda, API GW e Step Functions"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Containers dominaram deploys modernos. A AWS oferece 3 serviços principais: <strong>ECS</strong> (orquestrador proprietário), <strong>EKS</strong> (Kubernetes gerenciado) e <strong>ECR</strong> (registry). Cada um pode rodar sobre <strong>EC2</strong> ou <strong>Fargate</strong>. O SAA-C03 exige saber quando cada combinação faz sentido.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — High-Performing Architectures" weight="24%" color={ACCENT} />
        <p>
          Container questions foram muito expandidas no SAA-C03 vs SAA-C02. Esperar: ECS vs EKS trade-offs, launch type decisions, service discovery, task vs service, IAM roles (task role vs execution role).
        </p>
      </Section>

      <Section title="A família de serviços de container" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Função']}
          rows={[
            ['Amazon ECR', 'Container Registry (armazena images, tipo Docker Hub privado)'],
            ['Amazon ECS', 'Orquestrador proprietário AWS'],
            ['Amazon EKS', 'Kubernetes gerenciado (upstream K8s)'],
            ['AWS Fargate', 'Serverless compute para containers (usado por ECS e EKS)'],
            ['AWS App Runner', 'PaaS "deploy de container" para apps simples web'],
            ['AWS Copilot', 'CLI que abstrai ECS/Fargate setup'],
            ['AWS Proton', 'Templates de infra para dev platforms (internal PaaS)'],
          ]}
        />
      </Section>

      <Section title="Amazon ECS — conceitos" accent={ACCENT}>
        <LayerStack
          title="Hierarquia ECS"
          accent={ACCENT}
          layers={[
            { label: 'Cluster', content: 'Agrupamento lógico de capacity (EC2 ou Fargate)', note: 'top-level', tone: 'default' },
            { label: 'Task Def', content: 'Receita JSON: imagem, CPU, RAM, portas, env, IAM roles', note: 'imutável' },
            { label: 'Task', content: '1+ containers rodando da task definition (mesmo network ns)', note: 'análogo a Pod' },
            { label: 'Service', content: 'Mantém N tasks desejadas, integra com ALB/NLB, rolling deploy', note: 'controller' },
            { label: 'Capacity', content: 'Fargate · EC2 · Fargate Spot · EC2 Spot', note: 'providers', tone: 'base' },
          ]}
        />
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Cluster</strong> — agrupamento lógico de capacity (EC2 ou Fargate)</li>
          <li>• <strong>Task Definition</strong> — JSON: containerDefinitions[], cpu, memory, networkMode, taskRole, executionRole</li>
          <li>• <strong>Task</strong> — 1 ou mais containers rodando juntos (mesmo network namespace). Análogo a Pod do K8s.</li>
          <li>• <strong>Service</strong> — gerencia tasks desejadas, replacement em falha, integração com ALB/NLB.</li>
          <li>• <strong>Capacity Provider</strong> — estratégia de capacity (mix Fargate + Fargate Spot + EC2).</li>
        </ul>
      </Section>

      <Section title="ECS Launch Types" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'EC2 launch type', 'Fargate launch type']}
          rows={[
            ['Host management', 'Você gerencia EC2', 'AWS gerencia (serverless)'],
            ['Pricing', 'Por EC2 (horas de instância)', 'Por vCPU-segundo + GB-segundo'],
            ['Scaling', 'ASG de EC2 + ECS service scaling', 'Service scaling (0→N tasks diretamente)'],
            ['Patching/OS', 'Você mantém', 'AWS mantém'],
            ['GPU support', 'Sim (via EC2 GPU)', 'Não'],
            ['Windows containers', 'Sim', 'Sim (desde 2021)'],
            ['Daemon tasks (1 per host)', 'Sim', 'Não'],
            ['Uso', 'Cargas grandes/constantes, controle granular', 'Variável, pequena/média, sem overhead'],
          ]}
        />
      </Section>

      <Section title="Network Modes do ECS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Mode', 'Uso']}
          rows={[
            ['awsvpc (default Fargate)', 'Cada task tem ENI própria com IP privado da VPC — ideal, mais isolamento'],
            ['bridge (EC2 only)', 'Docker bridge network — port mapping tradicional'],
            ['host (EC2 only)', 'Task usa network stack do host — latência mínima, mas colisão de portas'],
            ['none', 'Sem networking externo'],
          ]}
        />
      </Section>

      <Section title="IAM Roles em ECS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Role', 'Função']}
          rows={[
            ['Task Role', 'Permissões do CÓDIGO da task (acessar S3, DynamoDB, etc.)'],
            ['Task Execution Role', 'Permissões do ECS Agent para pull de ECR, enviar logs a CloudWatch, fetch de secrets'],
            ['EC2 Instance Role (EC2 launch only)', 'Permissões da EC2 onde o ECS agent roda'],
          ]}
        />
        <Callout tone="warn">
          <strong>Confusão comum:</strong> pergunta &ldquo;qual role dar para task poder ler bucket S3?&rdquo; — resposta é <strong>Task Role</strong> (não Execution Role). Execution Role é para infraestrutura do ECS (pull image, push logs).
        </Callout>
      </Section>

      <Section title="Service Discovery no ECS" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>AWS Cloud Map</strong> — registry de serviços com DNS privado (service.local)</li>
          <li>• <strong>ECS Service Connect</strong> — service mesh leve nativo para ECS, com observability automática</li>
          <li>• <strong>ALB</strong> — atrás de ALB, target group tipo IP para Fargate</li>
        </ul>
      </Section>

      <Section title="Amazon EKS — Kubernetes gerenciado" accent={ACCENT}>
        <LayerStack
          title="Arquitetura EKS"
          accent={ACCENT}
          separatorLabel="control ↔ data plane"
          layers={[
            { label: 'Control Plane', content: 'API Server · etcd · Scheduler · Controller · Cloud Controller', note: 'AWS gerencia', tone: 'default', separatorAfter: true },
            { label: 'Managed NG', content: 'AWS provisiona e atualiza EC2 no cluster (autoscaling, patch)', note: 'gerenciado' },
            { label: 'Self-managed', content: 'Você cria ASG, registra no cluster, controla tudo', note: 'full control' },
            { label: 'Fargate Profile', content: 'Pods rodam em Fargate serverless, selecionados por namespace/labels', note: 'serverless', tone: 'writable' },
          ]}
        />
        <p><strong>3 tipos de worker nodes:</strong></p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Descrição']}
          rows={[
            ['Managed Node Groups', 'AWS provisiona/updata EC2 no seu EKS cluster'],
            ['Self-managed Nodes', 'Você cria ASG, registra no cluster, controla tudo'],
            ['Fargate Profile', 'Pods rodam em Fargate (serverless), selecionados por namespace/labels'],
          ]}
        />
        <Callout tone="info">
          <strong>EKS Auto Mode (2024):</strong> AWS lançou modo em que a AWS gerencia nodes + Karpenter + componentes de rede, deixando EKS quase tão zero-ops quanto ECS + Fargate. Tendência do exame: esperar questões nesse modelo.
        </Callout>
      </Section>

      <Section title="ECS vs EKS — a decisão" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Critério', 'ECS', 'EKS']}
          rows={[
            ['Complexidade', 'Baixa — tudo AWS-native', 'Alta — Kubernetes tem learning curve'],
            ['Portabilidade', 'Locked-in AWS', 'Portátil (K8s upstream)'],
            ['Ecossistema', 'AWS-only', 'Helm charts, operators, tooling vasto'],
            ['Preço control plane', 'Grátis', '$0,10/h por cluster (~$73/mês)'],
            ['Hybrid/Multi-cloud', 'Não', 'EKS Anywhere (on-prem), integração com outros K8s'],
            ['Quando escolher', 'Greenfield AWS, time pequeno', 'Time K8s experiente, workloads portáveis, multi-cloud'],
          ]}
        />
      </Section>

      <Section title="Ingress em EKS" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>AWS Load Balancer Controller</strong> — cria ALB/NLB a partir de Ingress / Service objects</li>
          <li>• <strong>Service type: LoadBalancer</strong> → provisiona NLB (L4)</li>
          <li>• <strong>Ingress → ALB</strong> (L7, path/host routing)</li>
          <li>• Target mode <InlineCode>ip</InlineCode> (pods recebem tráfego direto) ou <InlineCode>instance</InlineCode> (via NodePort)</li>
        </ul>
      </Section>

      <Section title="ECR — Elastic Container Registry" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Registry privado para Docker/OCI images</li>
          <li>• Integrado com IAM (authN via <InlineCode>aws ecr get-login-password</InlineCode>)</li>
          <li>• Scanning básico gratuito (CVE) + scanning avançado via Inspector</li>
          <li>• Lifecycle policies (ex: deletar images não-usadas há 30 dias)</li>
          <li>• Replicação cross-region e cross-account</li>
          <li>• <strong>ECR Public</strong> — registry público (aparecem em gallery.ecr.aws)</li>
        </ul>
      </Section>

      <Section title="App Runner — alternativa simples" accent={ACCENT}>
        <p>
          Para apps web HTTP simples, App Runner pega uma imagem de ECR (ou source do GitHub) e deploya com scaling automático, TLS gerenciado, custom domain. Zero orquestração visível. Ideal para MVP, side projects, APIs que não justificam ECS/EKS.
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Startup com time pequeno, quer deploy de microservices em Docker sem overhead"
          winner="ECS + Fargate + ALB"
          winnerColor={ACCENT}
          why="Zero gestão de cluster, Fargate cobra por uso, ALB faz roteamento. Setup simples com CodeDeploy/Copilot. EKS adicionaria complexidade desnecessária."
        />
        <DecisionBox
          scenario="Empresa usa Kubernetes on-prem há 3 anos, quer migrar para AWS mantendo Helm charts"
          winner="EKS (Managed Node Groups ou Fargate Profile)"
          winnerColor={ACCENT}
          why="EKS é Kubernetes upstream — zero mudança em manifests, Helm, operators. Migração acontece com kubectl apply. ECS exigiria re-arquitetar."
        />
        <DecisionBox
          scenario="Batch job que roda 4x/dia por 30min, processa filas SQS"
          winner="ECS Fargate Spot (ou EKS Fargate Spot)"
          winnerColor={ACCENT}
          why="Fargate Spot dá até 70% off. Batch é tolerante a interrupção. ECS Service configurado com capacity provider mix resolve."
        />
        <DecisionBox
          scenario="App simples em Python/Go que precisa estar online 24/7 com HTTPS"
          winner="AWS App Runner"
          winnerColor={ACCENT}
          why="App Runner cuida de tudo: cert TLS, scaling, custom domain, deploy automático do GitHub. Não precisa pensar em cluster. Custo proporcional ao uso."
        />
        <DecisionBox
          scenario="Cluster EKS com pods que precisam de GPUs para ML inference"
          winner="EKS + Managed Node Groups com g5 instances"
          winnerColor={ACCENT}
          why="Fargate não suporta GPU. Managed Node Group com instance family g5 (NVIDIA A10G). Pod spec seleciona GPU via node selector + device plugin."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas ECS/EKS no SAA:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• <strong>Task Role vs Execution Role</strong> — confusão clássica.</li>
          <li>• Fargate NÃO suporta GPU, daemon tasks, privileged containers, alguns network modes.</li>
          <li>• EKS control plane custa $0,10/h mesmo sem workloads.</li>
          <li>• Para secrets em containers: use SSM Parameter Store ou Secrets Manager referenciado na task definition (não hardcode).</li>
          <li>• ECS Anywhere e EKS Anywhere rodam on-prem com controle AWS.</li>
          <li>• App Mesh (service mesh) foi descontinuado em 2024 — ECS Service Connect ou Istio/Linkerd no EKS são as alternativas.</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como passar env vars secretas para um container?"
          a={<>Na task definition, use <InlineCode>secrets</InlineCode> section referenciando ARN de SSM Parameter Store ou Secrets Manager. ECS Agent resolve em runtime e injeta como env var. Precisa execution role ter permissão de leitura.</>}
        />
        <QAItem
          q="Como deploy zero-downtime em ECS?"
          a={<>ECS Service com <strong>deployment configuration</strong>: <InlineCode>minimumHealthyPercent</InlineCode> e <InlineCode>maximumPercent</InlineCode>. Rolling update substitui tasks gradualmente. Ou use <strong>CodeDeploy Blue/Green</strong> para troca atômica via listener.</>}
        />
        <QAItem
          q="ECS em EC2 launch type — como a instância sabe que faz parte do cluster?"
          a={<>ECS Agent (container) roda na EC2. AMI <strong>ECS-optimized</strong> já inclui agent. Config em <InlineCode>/etc/ecs/ecs.config</InlineCode>: <InlineCode>ECS_CLUSTER=meu-cluster</InlineCode>. Instância precisa IAM role com permissões ECS.</>}
        />
        <QAItem
          q="EKS — como dar permissão IAM a um pod específico?"
          a={<>IRSA (IAM Roles for Service Accounts): associa IAM Role a Kubernetes ServiceAccount via OIDC. Pod assume a role via tokens projetados. Melhor que dar role na instância (que daria a todos os pods).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> ECS = orquestrador AWS-native simples (Cluster/Service/Task Definition/Task). EKS = Kubernetes upstream gerenciado. Ambos rodam em EC2 ou Fargate (serverless). Fargate = sem gestão de host, pay-per-use; EC2 = controle + possível menor custo em scale. Task Role (código) ≠ Execution Role (agent). Service Discovery via Cloud Map ou Service Connect. ECR = registry privado. App Runner = PaaS para apps simples sem orquestração.
      </Callout>
    </div>
  );
}
