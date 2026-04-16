import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Compute AWS: EC2, Lambda, Containers — FFV Academy',
  description: 'EC2 instance families, pricing models, Lambda serverless, ECS vs EKS vs Fargate. Tudo sobre compute cobrado no CLF-C02.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma workload tem carga estável 24/7 por 3 anos. Qual modelo de compra EC2 oferece o maior desconto?',
    options: [
      'On-Demand',
      'Spot Instances',
      'Reserved Instances (3-year, All Upfront)',
      'Savings Plans (1-year, No Upfront)',
    ],
    correct: 2,
    explanation: 'RIs de 3 anos com pagamento total antecipado oferecem até 72% de desconto sobre On-Demand. Savings Plans dão descontos similares mas com mais flexibilidade (instance family/region). Spot é mais barato mas pode ser interrompido.',
  },
  {
    question: 'Qual serviço executa código sem gerenciar servidores, cobra por milissegundo de execução e tem limite de 15 minutos por invocação?',
    options: [
      'Amazon EC2',
      'AWS Lambda',
      'Amazon ECS',
      'AWS Batch',
    ],
    correct: 1,
    explanation: 'Lambda é o serviço serverless da AWS. Paga-se por invocação + duração em ms. Limite de execução: 15 min. Memória: 128MB a 10GB. Suporta runtimes Node, Python, Java, Go, Ruby, .NET, e containers customizados.',
  },
  {
    question: 'Uma empresa quer rodar containers Kubernetes sem gerenciar os nós do cluster. Qual combinação?',
    options: [
      'EKS + EC2 worker nodes',
      'EKS + Fargate',
      'ECS + EC2',
      'Docker Swarm em EC2',
    ],
    correct: 1,
    explanation: 'Fargate é o modo serverless para containers (ECS ou EKS). Você entrega a imagem de container; AWS cuida do provisionamento, escalabilidade e patching dos nós. EKS + EC2 ainda exige gerenciar os worker nodes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="compute-ec2-lambda"
      title="Compute: EC2, Lambda e Containers"
      icon="💻"
      xp={60}
      readTime={12}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="storage-s3-ebs-efs"
      nextTitle="Storage: S3, EBS, EFS, Glacier"
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
        Compute é a categoria de serviços que executa seu código. A AWS tem o catálogo mais vasto do mercado: VMs tradicionais (EC2), serverless (Lambda), containers (ECS/EKS/Fargate), Edge (Lambda@Edge), HPC (ParallelCluster) e mais. O exame CLF-C02 cobra os fundamentos de cada família e quando usar cada um.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Cloud Technology and Services" weight="34%" color={ACCENT} />
        <p>
          Compute é o coração do domínio 3 (o maior em peso). Espera-se que você identifique a família EC2 correta para um workload, entenda os modelos de pricing, saiba quando trocar EC2 por Lambda, e reconheça ECS/EKS/Fargate quando a questão mencionar containers.
        </p>
      </Section>

      <Section title="O espectro compute da AWS" accent={ACCENT}>
        <ArchDiagram title="Do mais controle → menos controle" accent={ACCENT}>{`
┌────────────────────────────────────────────────────────────┐
│  mais controle ←────────────────────────→ mais gerenciado │
│                                                            │
│  EC2         →  ECS/EKS  →  Fargate  →  Lambda            │
│  (VMs)          (cont.)     (cont.       (funções)        │
│                              serverless)                   │
│                                                            │
│  patch SO    patch img   nada             nada           │
│  escolha     escolha     nada             nada           │
│  AMI         image                                        │
└────────────────────────────────────────────────────────────┘
`}</ArchDiagram>
      </Section>

      <Section title="Amazon EC2 (Elastic Compute Cloud)" accent={ACCENT}>
        <p>
          VMs sob demanda. Você escolhe SO (AMI), tamanho (instance type), storage (EBS), rede (VPC/Security Group). Base de quase tudo na AWS — tanto que muitos serviços gerenciados rodam EC2 por trás dos panos.
        </p>
        <p><strong>Famílias de instância (letra inicial):</strong></p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Família', 'Letra', 'Otimizado para', 'Exemplo de uso']}
          rows={[
            ['General Purpose', 'T, M', 'Balanço CPU/RAM/rede', 'Web servers, dev/test'],
            ['Compute Optimized', 'C', 'CPU intensiva', 'Batch, encoding, HPC, jogos'],
            ['Memory Optimized', 'R, X, Z', 'RAM intensiva', 'In-memory DBs (Redis), SAP HANA'],
            ['Storage Optimized', 'I, D, H', 'I/O sequencial e aleatório', 'Data warehouses, NoSQL distribuído'],
            ['Accelerated Computing', 'P, G, F, Trn/Inf', 'GPU/FPGA/TPU', 'ML training, inferência, render'],
          ]}
        />
        <Callout tone="info">
          <strong>Mnemônica:</strong> <em>"Try Memory, Compute Ram, Storage HDDs, Graphics Power"</em> — T/M = general, C = compute, R = RAM, I/D/H = storage, G/P = GPU.
        </Callout>
      </Section>

      <Section title="Modelos de compra EC2 (pricing)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Desconto', 'Compromisso', 'Uso ideal']}
          rows={[
            ['On-Demand', '0% (preço cheio)', 'Nenhum', 'Cargas imprevisíveis, curtas'],
            ['Reserved (1-year)', 'Até 40%', '1 ano, instância específica', 'Carga estável por 1+ ano'],
            ['Reserved (3-year)', 'Até 72%', '3 anos, instância específica', 'Carga muito estável por 3+ anos'],
            ['Savings Plans', 'Até 72%', '1 ou 3 anos de $/h', 'Como RI mas flexível (família/região)'],
            ['Spot', 'Até 90%', 'Pode ser terminada a qualquer momento', 'Batch tolerante a falha, CI/CD'],
            ['Dedicated Hosts', 'Preço premium', 'Servidor físico exclusivo', 'Compliance (BYOL Windows Server)'],
            ['Capacity Reservations', 'Preço On-Demand', 'Reserva capacidade mesmo sem descontar', 'Garantir capacidade em picos'],
          ]}
        />
      </Section>

      <Section title="AWS Lambda (serverless)" accent={ACCENT}>
        <p>
          Lambda executa funções sem você gerenciar servidores. Paga-se por <strong>invocação</strong> + <strong>duração em ms</strong> + memória alocada.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Característica', 'Limite / Detalhe']}
          rows={[
            ['Duração máxima por invocação', '15 minutos'],
            ['Memória', '128 MB a 10.240 MB (em incrementos de 1 MB)'],
            ['Tamanho do deploy package', '50 MB (zipado) / 250 MB (descompactado) / 10 GB (container)'],
            ['Execuções concorrentes', '1.000 por região (soft limit)'],
            ['Runtimes suportados', 'Node.js, Python, Java, Go, Ruby, .NET, PowerShell, Rust (via custom runtime)'],
            ['Preço (exemplo)', '~$0.20 por 1M requisições + $0.0000166667 por GB-segundo'],
            ['Free Tier', '1M requisições + 400K GB-segundo por mês (eterno)'],
          ]}
        />
        <CodeBlock lang="python — handler Lambda">{`import json

def lambda_handler(event, context):
    nome = event.get('nome', 'mundo')
    return {
        'statusCode': 200,
        'body': json.dumps({'mensagem': f'Olá, {nome}!'})
    }`}</CodeBlock>
      </Section>

      <Section title="Triggers do Lambda" accent={ACCENT}>
        <p>
          Lambda é event-driven. Qualquer um destes pode invocar uma função:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>API Gateway</InlineCode> — requisições HTTP/REST/WebSocket</li>
          <li>• <InlineCode>S3</InlineCode> — upload, delete ou modificação de objeto</li>
          <li>• <InlineCode>DynamoDB Streams</InlineCode> — mudanças em tabela</li>
          <li>• <InlineCode>EventBridge</InlineCode> — eventos custom ou cron</li>
          <li>• <InlineCode>SQS / SNS</InlineCode> — mensagens em fila ou tópico</li>
          <li>• <InlineCode>Kinesis</InlineCode> — streams de dados</li>
          <li>• <InlineCode>Cognito</InlineCode> — hooks de autenticação</li>
          <li>• <InlineCode>ALB</InlineCode> — target de Application Load Balancer</li>
        </ul>
      </Section>

      <Section title="Containers na AWS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que é', 'Quem gerencia']}
          rows={[
            ['Amazon ECS', 'Orquestrador proprietário AWS', 'AWS (plano de controle); você gerencia EC2 workers OU usa Fargate'],
            ['Amazon EKS', 'Kubernetes gerenciado', 'AWS (plano de controle K8s); você gerencia EC2 workers OU usa Fargate'],
            ['AWS Fargate', 'Execução serverless de containers', 'AWS (100% — sem nós para você gerenciar)'],
            ['Amazon ECR', 'Container registry privado', 'AWS (guarda imagens Docker)'],
            ['App Runner', 'PaaS para containers web', 'AWS (tudo — você só dá a imagem)'],
          ]}
        />
        <Callout tone="info">
          <strong>ECS vs EKS:</strong> ECS é mais simples e integrado com AWS. EKS é Kubernetes padrão (portabilidade, ecossistema). Fargate é um modo de compute debaixo dos dois — você escolhe se os pods rodam em EC2 (você gerencia) ou Fargate (AWS gerencia).
        </Callout>
      </Section>

      <Section title="Outros serviços compute que aparecem no CLF-C02" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>AWS Batch</InlineCode> — jobs batch em EC2/Fargate/Spot (bioinformática, Monte Carlo)</li>
          <li>• <InlineCode>AWS Elastic Beanstalk</InlineCode> — PaaS: você entrega código, AWS provisiona EC2/ALB/Auto Scaling</li>
          <li>• <InlineCode>AWS Lightsail</InlineCode> — VPS simplificado para iniciantes ($3-$10/mês)</li>
          <li>• <InlineCode>AWS Outposts</InlineCode> — racks AWS no seu DC (já vimos)</li>
          <li>• <InlineCode>AWS Wavelength</InlineCode> — compute em rede 5G</li>
          <li>• <InlineCode>AWS ParallelCluster</InlineCode> — HPC com Slurm em EC2</li>
        </ul>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="API REST com picos imprevisíveis e baixa latência"
          winner="API Gateway + Lambda"
          winnerColor={ACCENT}
          why="Zero gestão, escala de 0 a milhares de reqs/s automaticamente, paga só pelo uso. Free Tier eterno cobre projetos pequenos."
          alternatives={[
            { name: 'EC2 + ALB', note: 'Viável se você quer controle total, mas custo fixo mesmo sem uso' },
          ]}
        />
        <DecisionBox
          scenario="Processamento noturno pesado (ETL de logs) por 4h"
          winner="AWS Batch em Spot"
          winnerColor={ACCENT}
          why="Spot economiza até 90% vs On-Demand. Batch retry-automático lida com interrupções. Tolerância a falha nativa."
          alternatives={[
            { name: 'EMR', note: 'Se envolver Hadoop/Spark diretamente, EMR simplifica' },
            { name: 'Lambda', note: 'Limite de 15 min inviabiliza jobs longos' },
          ]}
        />
        <DecisionBox
          scenario="Aplicação monolítica .NET legada migrando do on-prem"
          winner="EC2 (ou Elastic Beanstalk)"
          winnerColor={ACCENT}
          why="Migração lift-and-shift preserva o binário. Depois de estabilizar, considere containerizar (ECS) ou refatorar para serverless."
        />
        <DecisionBox
          scenario="Cluster Kubernetes multi-time, múltiplos microsserviços"
          winner="EKS + Fargate (para cargas leves) + EC2 (para cargas pesadas)"
          winnerColor={ACCENT}
          why="EKS dá o ecossistema K8s completo. Fargate elimina gestão de nós para workloads típicas; EC2 worker nodes quando você precisa DaemonSets, GPU ou customização."
        />
      </Section>

      <Section title="Exemplos práticos" accent={ACCENT}>
        <CodeBlock lang="bash — EC2">{`# Lançar uma t3.micro (Free Tier elegível)
aws ec2 run-instances \\
  --image-id ami-0c55b159cbfafe1f0 \\
  --instance-type t3.micro \\
  --key-name minha-chave \\
  --security-group-ids sg-012345 \\
  --subnet-id subnet-abc123 \\
  --count 1`}</CodeBlock>
        <CodeBlock lang="bash — Lambda">{`# Criar função
aws lambda create-function \\
  --function-name olaMundo \\
  --runtime python3.12 \\
  --role arn:aws:iam::123:role/lambda-role \\
  --handler app.lambda_handler \\
  --zip-file fileb://deploy.zip

# Invocar
aws lambda invoke \\
  --function-name olaMundo \\
  --payload '{"nome":"AWS"}' resposta.json`}</CodeBlock>
        <CodeBlock lang="bash — ECS Fargate">{`# Criar task definition + rodar tarefa
aws ecs run-task \\
  --cluster meu-cluster \\
  --task-definition minha-task:1 \\
  --launch-type FARGATE \\
  --network-configuration "awsvpcConfiguration={subnets=[subnet-abc],securityGroups=[sg-012]}"`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Armadilha clássica:</strong> "Serverless não tem servidor" é meia-verdade. O servidor existe (AWS gerencia). O ponto é que VOCÊ não gerencia. Para o exame, serverless = Lambda + Fargate + DynamoDB + Aurora Serverless + API Gateway + SQS + SNS.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual instance family usar para uma aplicação que cacheia Redis em memória (50 GB de dados)?"
          a={<><strong>Memory Optimized</strong> (família R ou X). Um <InlineCode>r6i.4xlarge</InlineCode> tem 128 GB RAM — suficiente para 50 GB de cache com folga.</>}
        />
        <QAItem
          q="Qual é a menor unidade de cobrança do Lambda?"
          a={<>Com o billing moderno, é por <strong>milissegundo</strong> (antes eram 100ms). Memória é cobrada em GB-segundos. Invocação cobrada por requisição.</>}
        />
        <QAItem
          q="Empresa precisa BYOL (Bring Your Own License) Windows Server. Qual modelo EC2?"
          a={<><InlineCode>Dedicated Hosts</InlineCode>. Fornece o host físico dedicado, permitindo reuso de licenças Microsoft antigas que exigem socket físico.</>}
        />
        <QAItem
          q="Para proteger sua EC2 contra interrupções Spot, qual alternativa balanceia custo e estabilidade?"
          a={<><strong>Savings Plans</strong> ou <strong>Reserved Instances</strong>. Ambos dão desconto grande (até 72%) mas sem risco de interrupção como Spot.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> EC2 = VMs com 5 famílias (general/compute/memory/storage/accelerated) e 5 modelos de compra (On-Demand/Reserved/Savings Plans/Spot/Dedicated). Lambda = serverless, 15 min máx, paga por ms. ECS/EKS = containers; Fargate = modo serverless deles. Beanstalk/Lightsail = PaaS. Spot = 90% off mas interrompível. Savings Plans = flexibilidade + desconto.
      </Callout>
    </div>
  );
}
