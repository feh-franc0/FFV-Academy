import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, NodeGraph, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ec2-autoscaling-elb');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma app HTTP faz roteamento por path (/api → servidor1, /admin → servidor2). Qual load balancer AWS?',
    options: [
      'Classic Load Balancer',
      'Application Load Balancer (ALB)',
      'Network Load Balancer (NLB)',
      'Gateway Load Balancer (GWLB)',
    ],
    correct: 1,
    explanation: 'ALB opera em L7 (HTTP/HTTPS) e permite host-based e path-based routing. NLB é L4 (TCP/UDP) — sem inspeção HTTP. GWLB é para appliances de rede (firewalls). CLB é legacy.',
  },
  {
    question: 'Qual Auto Scaling policy é melhor para manter CPU médio em 70% automaticamente?',
    options: [
      'Simple scaling',
      'Step scaling',
      'Target tracking scaling',
      'Scheduled scaling',
    ],
    correct: 2,
    explanation: 'Target tracking: você define métrica (CPU) + target value (70%), o ASG ajusta instâncias automaticamente. Simples e efetivo. Step scaling é mais granular (diferentes ações por faixa). Scheduled é para horários previsíveis.',
  },
  {
    question: 'Uma empresa roda HPC com alta comunicação inter-nó, precisa baixa latência entre instâncias. Qual placement group?',
    options: [
      'Cluster',
      'Spread',
      'Partition',
      'Default',
    ],
    correct: 0,
    explanation: 'Cluster placement group agrupa instâncias em uma única AZ com proximidade física — latência <1ms, 10 Gbps bandwidth. Spread distribui em hosts diferentes (HA). Partition agrupa em partições (Hadoop/Kafka). Cluster é para HPC/ML training.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ec2-autoscaling-elb"
      title="EC2 Profissional: Auto Scaling e Load Balancers"
      icon="⚖️"
      xp={80}
      readTime={15}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="containers-ecs-eks"
      nextTitle="ECS vs EKS: Orquestração de Containers"
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
        EC2 + Auto Scaling + Load Balancer é o padrão de referência do SAA-C03 para workloads escaláveis. Não basta saber que existem — você precisa escolher tipo de instância, purchasing model, LB adequado, scaling policy e placement group para cada cenário. Este módulo mapeia todas as decisões.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 2 + 3 — Resilient & High-Performing" weight="50%" color={ACCENT} />
        <p>
          Auto Scaling e ELB aparecem em 80% das questões de resiliência. ASG provê elasticidade; ELB distribui e faz health check. É a dupla inseparável.
        </p>
      </Section>

      <Section title="EC2 Instance Families — leitura de nomenclatura" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Família', 'Caso de uso', 'Exemplo']}
          rows={[
            ['T (burstable)', 'Workloads intermitentes com CPU credits', 't3.medium'],
            ['M (general)', 'Web, apps balanceadas CPU/memória/rede', 'm6i.large'],
            ['C (compute)', 'HPC, batch, scientific, gaming server', 'c7g.xlarge'],
            ['R (memory)', 'Caching (Redis), in-memory analytics', 'r6i.2xlarge'],
            ['X / u- (high memory)', 'SAP HANA, in-memory DBs enormes', 'x2idn.32xlarge'],
            ['I / D / H (storage)', 'NoSQL, data warehouse, Hadoop', 'i4i.xlarge'],
            ['P / G / Trn / Inf (accelerated)', 'ML training/inference, gráficos', 'p5.48xlarge, g5.xlarge'],
            ['A (ARM/Graviton)', '20-40% mais barato para mesmas cargas', 'a1.medium, c7g (Graviton3)'],
          ]}
        />
        <Callout tone="info">
          <strong>Nomenclatura:</strong> <InlineCode>m6g.large</InlineCode> = família M, geração 6, Graviton (g), tamanho large. Sufixos: <InlineCode>g</InlineCode>=Graviton, <InlineCode>a</InlineCode>=AMD, <InlineCode>i</InlineCode>=Intel, <InlineCode>n</InlineCode>=network-optimized, <InlineCode>d</InlineCode>=NVMe SSD local.
        </Callout>
      </Section>

      <Section title="Purchasing Options — deep dive SAA" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Opção', 'Desconto', 'Compromisso', 'Quando usar']}
          rows={[
            ['On-Demand', '0%', 'Nenhum', 'Workloads imprevisíveis, POCs'],
            ['Reserved Standard', 'Até 72%', '1 ou 3 anos, instância fixa', 'Carga estável e previsível'],
            ['Reserved Convertible', 'Até 66%', '1 ou 3 anos, pode trocar família', 'Carga estável mas evolutiva'],
            ['Savings Plans Compute', 'Até 66%', '$/h por 1 ou 3 anos', 'Flexibilidade entre EC2/Lambda/Fargate'],
            ['Savings Plans EC2 Instance', 'Até 72%', '$/h família específica', 'Família fixa, mas muda tamanho/AZ'],
            ['Spot Instances', 'Até 90%', 'Pode ser interrompido com 2 min aviso', 'Batch, CI/CD, stateless, tolerante'],
            ['Dedicated Host', 'Varia', 'Por host físico', 'Compliance, BYOL Windows'],
            ['Dedicated Instance', 'Varia', 'Isolamento de hardware', 'Compliance menos estrito'],
            ['Capacity Reservation', 'Preço on-demand', 'Reserva de capacidade específica', 'Garantia de availability, sem desconto'],
          ]}
        />
        <Callout tone="warn">
          <strong>Savings Plans vs Reserved:</strong> Savings Plans são mais flexíveis — commit em $/h, não em instância. Cobrem EC2 + Lambda + Fargate. RIs são mais granulares e podem dar descontos ligeiramente maiores em casos específicos. Para SAA: default recomenda Savings Plans salvo questão explicitamente dizer &ldquo;commit em instância&rdquo;.
        </Callout>
      </Section>

      <Section title="EC2 Lifecycle e User Data" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>User Data</strong> — script executado na primeira boot (bash/cloud-init). Usado para instalar software, configurar app.</li>
          <li>• <strong>AMI</strong> — snapshot de EC2 para criar novas. Custom AMI acelera boot vs User Data.</li>
          <li>• <strong>Instance Metadata Service (IMDS)</strong> — endpoint <InlineCode>169.254.169.254</InlineCode> com info da instância. IMDSv2 é obrigatório em novas instâncias (tokens, SSRF-safe).</li>
          <li>• <strong>EC2 Instance Connect</strong> — SSH browser-based sem precisar chave pública permanente.</li>
          <li>• <strong>Session Manager (SSM)</strong> — acesso shell sem expor SSH (usa agent + IAM role).</li>
        </ul>
      </Section>

      <Section title="Auto Scaling Groups (ASG)" accent={ACCENT}>
        <NodeGraph
          title="Auto Scaling Group conectado a ALB"
          accent={ACCENT}
          legend="ASG mantém min/desired/max instâncias, distribuídas entre AZs, com health checks via ALB"
          columns={[
            {
              label: 'Internet → ALB',
              nodes: [
                { icon: '⚖️', label: 'Application Load Balancer', sub: 'health check + routing', tone: 'emphasis' },
                { icon: '🎯', label: 'Target Group', sub: 'instâncias registradas', tone: 'default' },
              ],
            },
            {
              label: 'AZ-a',
              nodes: [
                { label: 'EC2-1', sub: 'Auto Scaling', tone: 'default' },
                { label: 'EC2-2', sub: 'Auto Scaling', tone: 'default' },
              ],
            },
            {
              label: 'AZ-b',
              nodes: [
                { label: 'EC2-3', sub: 'Auto Scaling', tone: 'default' },
                { label: 'EC2-4', sub: 'Auto Scaling', tone: 'default' },
              ],
            },
          ]}
        />
        <p><strong>Componentes:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Launch Template</strong> (preferido) ou Launch Configuration (legacy) — template da instância</li>
          <li>• <strong>Min / Desired / Max</strong> — limites da capacidade</li>
          <li>• <strong>Subnets</strong> — ASG distribui entre AZs das subnets</li>
          <li>• <strong>Health Check</strong> — EC2 (status check) ou ELB (target group)</li>
          <li>• <strong>Cooldown</strong> — período antes de próxima scaling action (default 300s)</li>
          <li>• <strong>Termination Policy</strong> — qual instância terminar primeiro (OldestInstance, NewestInstance, etc.)</li>
        </ul>
      </Section>

      <Section title="Scaling Policies" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Policy', 'Como funciona', 'Uso']}
          rows={[
            ['Target Tracking', 'Mantém métrica em valor-alvo (CPU=70%)', 'Padrão recomendado — simples'],
            ['Step Scaling', 'Ações diferentes por faixa (CPU 60-70 → +1; 70-90 → +3)', 'Controle fino de ajuste'],
            ['Simple Scaling', 'Uma ação por threshold, com cooldown', 'Casos simples, legacy'],
            ['Scheduled Scaling', 'Muda capacidade em horário (scale up 9h, down 18h)', 'Padrões previsíveis (business hours)'],
            ['Predictive Scaling', 'ML prevê demanda e escala antecipadamente', 'Padrões cíclicos (daily/weekly)'],
          ]}
        />
        <Callout tone="info">
          <strong>Warm pools:</strong> ASG pode manter pool de instâncias pre-baked em estado stopped. Quando precisa scale up, start é mais rápido que launch (segundos vs minutos). Ideal para apps com boot lento.
        </Callout>
      </Section>

      <Section title="Os 4 Elastic Load Balancers" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['LB', 'Camada', 'Protocolos', 'Features-chave']}
          rows={[
            ['Application LB (ALB)', 'L7', 'HTTP, HTTPS, gRPC, WebSocket', 'Host/path routing, cognito auth, WAF integration, HTTP/2'],
            ['Network LB (NLB)', 'L4', 'TCP, UDP, TLS', 'Ultra-low latency, static IP por AZ, 1M+ req/s'],
            ['Gateway LB (GWLB)', 'L3/4', 'IP (GENEVE)', 'Insere appliances 3rd party (firewall, IDS) na rota'],
            ['Classic LB (CLB)', 'L4/L7', 'TCP, SSL, HTTP', 'LEGACY — evitar em deployments novos'],
          ]}
        />
      </Section>

      <Section title="ALB vs NLB — quando usar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Critério', 'ALB', 'NLB']}
          rows={[
            ['HTTP inspection', '✅ Header/path/host routing', '❌ É só L4'],
            ['WebSocket / gRPC', '✅', '✅ (TCP passthrough)'],
            ['UDP', '❌', '✅'],
            ['Static IP', '❌ (DNS só)', '✅ 1 por AZ (+ Elastic IP)'],
            ['Preserve client IP', 'Via X-Forwarded-For', '✅ Nativo'],
            ['Latência', '~400 ms overhead', '~100 µs overhead'],
            ['TLS termination', '✅', '✅ (TLS listener)'],
            ['Cross-zone LB', 'Grátis (default)', 'Pago (opcional)'],
            ['Uso típico', 'Web apps, APIs', 'Gaming, IoT, voIP, TCP/UDP'],
          ]}
        />
      </Section>

      <Section title="Target Groups e Health Checks" accent={ACCENT}>
        <p>
          LBs roteiam para <strong>target groups</strong>. Um TG pode ter targets: EC2 instances, IPs (ENIs, on-prem via DX), Lambda functions, ALB (para chainear ALB atrás de NLB).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Target type', 'Uso']}
          rows={[
            ['instance', 'EC2 IDs (LB usa private IP)'],
            ['ip', 'IPs específicos (cross-VPC via peering, on-prem via DX)'],
            ['lambda', 'Invoca Lambda diretamente (ALB only)'],
            ['alb', 'ALB como target de NLB (pattern híbrido)'],
          ]}
        />
        <Callout tone="info">
          <strong>Health check detalhes:</strong> path (ALB: HTTP path; NLB: TCP port), interval, timeout, healthy threshold (N sucessos para marcar healthy), unhealthy threshold. Instância unhealthy é removida do LB mas não terminada pelo ASG (a menos que health check type seja ELB).
        </Callout>
      </Section>

      <Section title="Placement Groups — quando cada um" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Layout', 'Uso']}
          rows={[
            ['Cluster', 'Instâncias em mesmo rack/AZ', 'HPC, ML training — baixa latência, 10 Gbps bandwidth'],
            ['Spread', 'Cada instância em host físico distinto (max 7/AZ)', 'Aplicações críticas, evita failure shared'],
            ['Partition', 'Grupos lógicos em racks separados (até 7 partitions/AZ)', 'Hadoop, Cassandra, Kafka — isolamento por partition'],
          ]}
        />
      </Section>

      <Section title="Elastic IP (EIP)" accent={ACCENT}>
        <p>
          IPv4 público estático. Free enquanto associado a recurso em uso; pago se não associado ou em EC2 stopped ($0,005/h). Use para NAT Gateway, NLB em private mode, failover automático (reassociate).
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="API HTTP com 3 microservices (/users, /orders, /payments) atrás de um único domínio"
          winner="ALB com listener rules por path"
          winnerColor={ACCENT}
          why="ALB faz path-based routing nativamente. Listener rules: /users → TG-users, /orders → TG-orders, etc. Cada target group escalar independente."
        />
        <DecisionBox
          scenario="Gaming server UDP com 100k conexões simultâneas"
          winner="NLB"
          winnerColor={ACCENT}
          why="ALB não suporta UDP. NLB aguenta milhões de conexões, latência <100µs, preserva client IP nativamente."
        />
        <DecisionBox
          scenario="Workload de data processing que roda 1x por dia por 2h, tolerante a falha"
          winner="ASG com mix de Spot + On-Demand (80/20)"
          winnerColor={ACCENT}
          why="Spot dá até 90% off. Mix com On-Demand garante mínimo funcional se Spot for reclaimed. Launch template com multiple instance types diversifica."
        />
        <DecisionBox
          scenario="Cluster de ML training de 32 GPUs que precisa alta bandwidth inter-nó"
          winner="Instâncias p5 em Cluster Placement Group + EFA (Elastic Fabric Adapter)"
          winnerColor={ACCENT}
          why="Cluster PG garante proximidade física + 10 Gbps. EFA acelera RDMA para frameworks como NCCL. Single-AZ é aceitável pois workload é efêmero."
        />
        <DecisionBox
          scenario="App web com tráfego previsível: 9-18h alto, resto do dia baixo"
          winner="ASG com Scheduled Scaling + Target Tracking"
          winnerColor={ACCENT}
          why="Scheduled pre-escalar antes das 9h (warmup), scale down após 18h. Target tracking cuida de picos não-previstos. Combinação dá custo otimizado + reatividade."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas EC2/ELB no SAA:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• <strong>Sticky sessions (ALB)</strong> via cookie — útil para apps stateful, mas limita LB.</li>
          <li>• <strong>Connection draining / Deregistration delay</strong> — tempo para requests em flight terminarem (default 300s).</li>
          <li>• <strong>Health check path deve retornar 200</strong> — confundir 302/404 marca unhealthy.</li>
          <li>• <strong>NLB preserva source IP nativamente</strong>; ALB coloca em X-Forwarded-For.</li>
          <li>• <strong>Lifecycle hooks</strong> — ASG pode pausar antes de terminate para drenar connections (muito cobrado).</li>
          <li>• <strong>Termination protection</strong> na EC2 e no ASG são distintos.</li>
          <li>• <strong>Tenancy</strong>: Shared (default), Dedicated Instance (isolated HW), Dedicated Host (físico BYOL).</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como dar deploy zero-downtime com ASG e ALB?"
          a={<>Use <strong>Rolling update</strong>: ASG cria novas instâncias com nova AMI, desregistra velhas do TG após novas estarem healthy. Ou Blue/Green com CodeDeploy/Elastic Beanstalk: cria novo ASG, switch no ALB, destrói antigo.</>}
        />
        <QAItem
          q="Como lidar com armazenamento local em ASG (logs, cache)?"
          a={<>Stateless é o padrão. Logs → CloudWatch Logs Agent. Cache → ElastiCache. Arquivos compartilhados → EFS. Dados persistentes não devem viver em disco da EC2 (que somem no scale-in).</>}
        />
        <QAItem
          q="O que acontece se Spot for interrompido?"
          a={<>AWS envia notification 2 minutos antes via Instance Metadata. Sua app deve ter graceful shutdown (flush buffers, finish current work). ASG substitui automaticamente. Use Spot Fleet / Mixed Instances para diversificar e reduzir risco.</>}
        />
        <QAItem
          q="ALB ou CloudFront para HTTPS com certificado custom?"
          a={<>Ambos suportam via ACM. CloudFront tem cache + edge; ALB é regional. Para web global: CloudFront na frente, ALB atrás. Para API regional interna: ALB direto já resolve.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> EC2 families: T/M (burst/general), C (compute), R/X (memory), I/D (storage), P/G/Trn/Inf (GPU/ML), A (ARM). Savings Plans &gt; RIs em flexibilidade. ASG com target tracking é o default. ALB (L7, HTTP/HTTPS, path routing) vs NLB (L4, TCP/UDP, static IP, ultra-low latency) vs GWLB (appliances L3). Placement groups: Cluster (HPC), Spread (HA crítica), Partition (distributed DB). Stateless em ASG — tudo persistente fora (EFS, S3, RDS, ElastiCache).
      </Callout>
    </div>
  );
}
