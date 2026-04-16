import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ExamDomainBadge,
} from '@/components/article/primitives';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Simulado SAA-C03 Comentado (25 questões) — FFV Academy',
  description: 'Simulado final AWS Solutions Architect Associate SAA-C03 com 25 questões distribuídas pelos 4 domínios oficiais e explicações profundas de cada alternativa.',
  keywords: 'simulado SAA-C03, questões AWS, solutions architect, exame comentado, prática',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Aplicação críticamente sensível a latência serve usuários em 5 continentes. Qual combinação minimiza latência global?',
    options: [
      'ALB único em us-east-1',
      'CloudFront + Global Accelerator + ALBs regionais + Route 53 latency routing',
      'Route 53 geo routing apontando para região mais próxima',
      'API Gateway regional em us-east-1',
    ],
    correct: 1,
    explanation: 'CloudFront para cache estático, Global Accelerator para anycast IP (rota pelo backbone AWS), ALBs regionais, Route 53 latency routing como DNS. Stack completa de edge. Route 53 sozinho não reduz latência de conexão — só decide endpoint. Single-region sempre tem latência ruim para usuários distantes.',
  },
  {
    question: 'Aplicação três-camadas precisa isolar DB (sem acesso à internet) mas permitir patch download via yum/apt.',
    options: [
      'DB em public subnet com SG restrito',
      'DB em private subnet, route para NAT Gateway em public subnet',
      'DB em private subnet, Gateway Endpoint para S3',
      'DB em private subnet, Internet Gateway attached',
    ],
    correct: 1,
    explanation: 'NAT Gateway permite outbound para internet (patches) mas bloqueia inbound. Padrão ouro para private instances. Public subnet expõe o DB — nunca fazer. Gateway Endpoint S3 só serve para tráfego S3, não yum/apt. Internet Gateway em private subnet não faz sentido arquitetural.',
  },
  {
    question: 'App serverless precisa salvar 200KB de estado por usuário, acessado ms por chamada, com 1 milhão de usuários.',
    options: ['DynamoDB On-Demand', 'RDS Postgres Single-AZ', 'S3 com prefixos', 'ElastiCache Redis'],
    correct: 0,
    explanation: 'DynamoDB é perfeito: single-digit-ms, escala serverless, 200KB < 400KB limit. On-Demand cobra por request, ideal para acesso variável. RDS exige management. S3 tem latência de 50–200ms (não ms). Redis é in-memory com custo/GB alto para 200GB total.',
  },
  {
    question: 'Auditoria financeira exige que logs CloudTrail sejam imutáveis e retidos por 7 anos em outra conta AWS.',
    options: [
      'CloudTrail local + S3 bucket policy deny delete',
      'Organization trail em bucket centralizado com Object Lock Compliance + MFA Delete',
      'CloudWatch Logs com retention 2555 dias',
      'CloudTrail Lake com retention máxima',
    ],
    correct: 1,
    explanation: 'Organization trail captura de todas as contas. Bucket em conta separada (segregation of duties) com Object Lock em modo Compliance garante WORM mesmo contra root. CloudWatch Logs max retention 10 anos mas não é imutável. CloudTrail Lake bom para query, mas compliance exige S3+Lock tipicamente.',
  },
  {
    question: 'Aplicação legada em 50 EC2 com bibliotecas compartilhadas via NFS em uma VM Linux. Migrar mantendo NFS.',
    options: [
      'EC2 Windows compartilhando via SMB',
      'FSx for Windows File Server',
      'EFS (NFSv4)',
      'S3 com s3fs',
    ],
    correct: 2,
    explanation: 'EFS é NFSv4 managed, multi-AZ, elastic. Substituto direto para VM NFS Linux. FSx Windows é SMB (não NFS). s3fs é workaround ruim para arquivos pequenos/muitos. EC2 manual não é managed.',
  },
  {
    question: 'API REST exposta publicamente. Operação mais crítica é rate-limit de 100 req/s por token de usuário para prevenir abuso.',
    options: [
      'WAF rate-based rule por IP',
      'API Gateway usage plan com API key',
      'CloudFront rate limit',
      'ALB listener rule',
    ],
    correct: 1,
    explanation: 'API Gateway usage plans permitem rate + burst por API key (identifica usuário). WAF rate-based é por IP — problemático com NAT (usuários compartilham IP) e não identifica usuário. CloudFront rate limit é L7 DDoS mais amplo. ALB listener rule não tem quota por usuário.',
  },
  {
    question: 'Cluster Aurora MySQL com 3 leitores. Um leitor consistentemente retorna dados ~200ms atrasados — qual a causa provável?',
    options: [
      'Leitor em AZ diferente do writer',
      'Replication lag — normal em Aurora sob carga pesada',
      'Query cache desabilitado',
      'Aurora não tem leitores, só primário',
    ],
    correct: 1,
    explanation: 'Aurora replica via storage layer (shared volume) mas writes à memória do reader são assíncronas. Sob carga pesada, lag de ms é normal. Para strong consistency leia do writer ou use Aurora com global consistency options. Aurora SIM tem até 15 readers.',
  },
  {
    question: 'Batch de processamento overnight, 500 máquinas, tolera interrupção, precisa reduzir custo ao máximo.',
    options: [
      'On-Demand EC2',
      'Savings Plans 1 ano',
      'Spot Fleet com múltiplos instance types + Spot Blocks',
      'Spot Fleet com múltiplos instance types sem Spot Blocks',
    ],
    correct: 3,
    explanation: 'Spot dá até 90% off. Diversificar types reduz risco de terminação em massa. Spot Blocks foi descontinuado em 2021 (pegadinha!). Cenários que permitem interrupção devem usar Spot com handling de aviso de 2min.',
  },
  {
    question: 'Compliance exige que tráfego entre duas VPCs em contas separadas NUNCA transite pela internet pública.',
    options: [
      'VPN site-to-site entre as VPCs',
      'VPC Peering',
      'Transit Gateway com attachments nas duas VPCs',
      'NAT Gateway em ambas',
    ],
    correct: 2,
    explanation: 'Transit Gateway é o hub moderno para interconectar VPCs cross-account, mantém tráfego no backbone AWS. VPC Peering também funciona mas não escala bem (n² connections) e não é transitivo. VPN é desnecessário dentro de AWS. NAT Gateway é para outbound internet.',
  },
  {
    question: 'Lambda precisa acessar RDS Aurora em private subnet. Qual configuração correta?',
    options: [
      'Lambda sem VPC, com RDS endpoint público',
      'Lambda em VPC, subnets mesmas do RDS (ou rotáveis), SG do RDS permitindo SG da Lambda',
      'Lambda em VPC + NAT Gateway para alcançar RDS',
      'Lambda usa IAM auth para RDS sem VPC',
    ],
    correct: 1,
    explanation: 'Lambda em VPC com ENIs nas subnets corretas e SG do RDS permitindo SG da Lambda. RDS público é anti-pattern grave. NAT Gateway é para outbound internet, não para alcançar RDS privado. IAM auth para RDS funciona mas ainda exige rota de rede.',
  },
  {
    question: 'S3 bucket tem 100 milhões objetos e você precisa aplicar tags adicionais a todos eles.',
    options: [
      'Script Python com boto3 para iterar e tagar',
      'S3 Batch Operations',
      'Lambda triggered por ObjectCreated',
      'Re-upload com novos headers',
    ],
    correct: 1,
    explanation: 'S3 Batch Operations foi feito exatamente para isso — aplica operação (copy, tag, ACL, Lambda invoke, restore) em milhões de objetos via manifest. Script Python com iteração levaria dias. Lambda por evento só pega novos. Re-upload é absurdo.',
  },
  {
    question: 'Aplicação precisa descobrir endpoint de outro serviço dinamicamente sem hardcode. Qual padrão AWS-native?',
    options: [
      'DNS externo hardcoded',
      'AWS Cloud Map (Service Discovery)',
      'Parameter Store com polling',
      'Route 53 com CNAMEs manuais',
    ],
    correct: 1,
    explanation: 'Cloud Map é service discovery nativo: serviços registram endpoints, clientes consultam via DNS ou API. ECS/EKS integram nativamente. Parameter Store funciona mas requer polling e não atualiza dinamicamente. Route 53 manual é quase isso mas sem service mesh pattern.',
  },
  {
    question: 'Qual diferença crítica entre SQS FIFO e Kinesis Data Streams em um pipeline de ordem?',
    options: [
      'SQS FIFO suporta múltiplos consumers; Kinesis não',
      'Kinesis tem retention configurável e suporta múltiplos consumers independentes; SQS FIFO é fila 1:1',
      'SQS FIFO escala ilimitado; Kinesis limitado a 10 shards',
      'Não há diferença significativa',
    ],
    correct: 1,
    explanation: 'Kinesis é stream: N consumers leem o mesmo dado com checkpoint independente, retention até 365d. SQS FIFO é fila: 1 consumer por msg (ou mais mas msg some após delete). Ambos ordenam. Para analytics com múltiplos pipelines → Kinesis; para worker queue → SQS.',
  },
  {
    question: 'Aplicação read-heavy sobre DynamoDB está perto do limit de RCU. Opção mais simples para escalar leitura sem mudar código.',
    options: [
      'DynamoDB DAX',
      'ElastiCache Redis com cache-aside',
      'Read replica DynamoDB',
      'Aumentar provisioned RCU',
    ],
    correct: 0,
    explanation: 'DAX é write-through cache compatível com SDK DynamoDB — trocar endpoint e código não muda. Redis exige implementar cache-aside. DynamoDB não tem "read replica" (Global Tables é multi-region active-active, não read replica). Aumentar RCU custa mais, mas pode ser combinado.',
  },
  {
    question: 'Empresa tem 50 contas AWS. Quer aplicar política "ninguém pode criar S3 bucket público" em TODAS as contas.',
    options: [
      'IAM policy em cada conta',
      'Config rule em cada conta',
      'SCP (Service Control Policy) em Organization OU',
      'Security Hub standard',
    ],
    correct: 2,
    explanation: 'SCP é guardrail no nível Organization — bloqueia ações em todas as contas do OU, incluindo root da conta. Config rule detecta (não previne). IAM policy exige aplicação manual em 50 contas. Security Hub alerta mas não impede.',
  },
  {
    question: 'Aplicação serverless precisa orquestrar 15 passos com retries, branches condicionais, error handling.',
    options: [
      'Lambda chamando outras Lambdas',
      'Step Functions Standard',
      'SQS + Lambda chain',
      'EventBridge Pipes',
    ],
    correct: 1,
    explanation: 'Step Functions Standard é o padrão para workflows complexos com retries/error/parallel/choice. Standard cobra por state transition (cada passo), até 1 ano de duração. Lambda chain é frágil. SQS chain não tem visibilidade de workflow. Pipes é para source→target simples.',
  },
  {
    question: 'Backup de 50 servidores on-prem para AWS, replicação contínua para failover em minutos.',
    options: [
      'AWS Backup com agent',
      'AWS Elastic Disaster Recovery (DRS)',
      'DataSync com schedule',
      'Storage Gateway Volume Gateway',
    ],
    correct: 1,
    explanation: 'DRS replica continuamente VMs on-prem para EC2 dormente, failover em minutos, RPO de segundos. Único serviço AWS para esse cenário. Backup é snapshot-based (RPO horas). DataSync é file transfer agendado. Storage Gateway é híbrido para acesso, não DR de servers.',
  },
  {
    question: 'Secrets rotation automática para senha de Aurora PostgreSQL.',
    options: [
      'Parameter Store com Lambda custom',
      'Secrets Manager com rotation Lambda template',
      'KMS rotation',
      'IAM DB Authentication',
    ],
    correct: 1,
    explanation: 'Secrets Manager oferece templates Lambda prontos para RDS/Aurora que conectam, alteram senha no banco e atualizam o secret. Rotation nativa. Parameter Store exige código custom. KMS rotation é de chaves criptográficas, não credenciais. IAM DB Auth é alternativa (sem senha), mas a pergunta pediu rotation de senha.',
  },
  {
    question: 'ALB público recebe tráfego que causa picos de 5 Gbps intermitentes. Qual proteção automática já existe sem configurar nada?',
    options: [
      'WAF', 'Shield Advanced', 'Shield Standard', 'GuardDuty'],
    correct: 2,
    explanation: 'Shield Standard já está ativo em todos os serviços AWS (CloudFront, ALB, Route 53, GA) sem custo ou configuração. Protege contra DDoS L3/L4 comuns. Advanced exige subscription ($3000/mês). WAF precisa regras configuradas. GuardDuty detecta mas não previne.',
  },
  {
    question: 'EBS gp2 de 500GB está saturando em IOPS. Opção mais custo-efetiva.',
    options: [
      'Aumentar tamanho para 2TB (herdando mais IOPS)',
      'Migrar para io2 com 20.000 IOPS',
      'Migrar para gp3 e provisionar IOPS extras',
      'Adicionar RAID 0 com 2 volumes gp2',
    ],
    correct: 2,
    explanation: 'gp3 desacopla IOPS de tamanho. Paga exatamente pelos IOPS necessários. Aumentar gp2 para 2TB desperdiça capacidade. io2 é para databases críticos com IOPS massivo sustentado — overkill para maioria. RAID adiciona complexidade sem resolver root cause.',
  },
  {
    question: 'DynamoDB ProvisionedThroughputExceededException mesmo com 10.000 RCU provisionado. Causa provável.',
    options: [
      'Hot partition (skew na partition key)',
      'KMS throttle',
      'IAM quota',
      'Region endpoint errado',
    ],
    correct: 0,
    explanation: '10k RCU é dividido entre partitions. Se uma PK específica concentra acesso (ex: "admin" ou "default"), aquela partition excede sua fatia ~3000 RCU. Fix: distribuir PK (hash prefix), migrar para On-Demand, ou rever modelo.',
  },
  {
    question: 'Aplicação serverless precisa processar batch de 500 imagens por dia, cada uma levando 5min para transformar.',
    options: [
      'Lambda única invocada 500x',
      'Step Functions + Lambda com Map state',
      'Fargate task batch',
      'EC2 Auto Scaling group',
    ],
    correct: 1,
    explanation: 'Lambda limite de 15min serve para 5min. Step Functions Map state paraleliza 500 items com controle de concurrency. Alternativa: AWS Batch com Fargate. EC2 ASG é overkill para batch serverless. Lambda única sem orquestração perde tracking de falhas.',
  },
  {
    question: 'Time quer evitar que desenvolvedores criem recursos em regiões não aprovadas.',
    options: [
      'SCP deny actions fora das regiões permitidas',
      'Config rule regional',
      'CloudTrail alerting',
      'Budget com limit',
    ],
    correct: 0,
    explanation: 'SCP com condition aws:RequestedRegion bloqueia preventivamente. Config detecta após criação. CloudTrail é log (pós-facto). Budget é custo, não governança regional.',
  },
  {
    question: 'Dados sensíveis (CPF, e-mail) em buckets S3. Queremos detectar qual bucket contém PII automaticamente.',
    options: ['GuardDuty', 'Macie', 'Inspector', 'Security Hub'],
    correct: 1,
    explanation: 'Macie usa ML para classificar PII/PCI/PHI em objetos S3. GuardDuty é comportamental (ameaças). Inspector é vulnerabilidades de EC2/ECR/Lambda. Security Hub agrega findings.',
  },
  {
    question: 'Aplicação legada requer acesso a filesystem compartilhado entre 10 EC2 Windows com ACL NTFS e integração AD.',
    options: [
      'EFS com daemons SMB',
      'FSx for Windows File Server',
      'FSx for Lustre',
      'S3 Gateway File',
    ],
    correct: 1,
    explanation: 'FSx for Windows é SMB nativo + NTFS + AD integration. EFS é NFS (Linux). Lustre é HPC. Storage Gateway é para ponte on-prem/cloud.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="simulado-saa-c03"
      title="Simulado SAA-C03 Comentado (25 questões)"
      icon="🎯"
      xp={100}
      readTime={25}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="saa-c03-intro"
      nextTitle="Revisar trilha SAA-C03"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Você completou a trilha SAA-C03. Este simulado traz <strong>25 questões</strong> no estilo do exame oficial,
        distribuídas proporcionalmente pelos 4 domínios (Secure 30%, Resilient 26%, High-Performing 24%, Cost 20%).
        Após cada tentativa, estude as explicações — entender <em>por que</em> a resposta errada está errada é o que
        transforma conhecimento em capacidade de passar no exame real.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Secure" weight="30%" color={ACCENT} />
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="Como abordar cada questão do SAA-C03 real" accent={ACCENT}>
        <Steps>
          <Step n={1}>
            <strong>Leia a pergunta duas vezes</strong>: 70% das pegadinhas vêm de detalhes escondidos (&ldquo;minimize
            cost&rdquo;, &ldquo;NOT managed by AWS&rdquo;, &ldquo;most resilient&rdquo;). Sublinhe mentalmente o qualificador.
          </Step>
          <Step n={2}>
            <strong>Elimine 2 alternativas óbvias</strong> primeiro. Geralmente são soluções muito mais caras/complexas
            do que a pergunta pede, ou recursos que não resolvem o problema específico.
          </Step>
          <Step n={3}>
            <strong>Entre as 2 restantes</strong>, escolha a que é <em>AWS best practice</em>: mais serverless, mais
            managed, mais compatível com Well-Architected.
          </Step>
          <Step n={4}>
            <strong>Marque para revisar</strong> se hesitou mais de 30 segundos. Volte depois — você geralmente descobre
            padrões em questões posteriores que ajudam.
          </Step>
          <Step n={5}>
            <strong>Gestão de tempo</strong>: 65 questões em 130min = 2min por questão. Não trave em uma. Marque e volta.
          </Step>
        </Steps>
      </Section>

      <Section title="Checklist de revisão pré-exame" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Se você está inseguro em algum desses tópicos, revisite o módulo correspondente desta trilha antes do exame real.
        </p>
        <ul className="flex flex-col gap-1 text-sm pl-4" style={{ color: 'var(--ffv-muted)', listStyle: 'disc' }}>
          <li>Diferença exata entre Multi-AZ e Read Replica (HA vs escala de leitura)</li>
          <li>LSI vs GSI em DynamoDB e quando cada um suporta strongly consistent reads</li>
          <li>Os 6 pilares do Well-Architected (Security, Reliability, Performance, Cost, Operational Excellence, Sustainability)</li>
          <li>VPC: NAT Gateway vs Internet Gateway vs VPC Endpoints (Gateway vs Interface)</li>
          <li>S3: 8 storage classes + mínimos cobrados + casos de uso</li>
          <li>Route 53: 7 routing policies (Simple, Weighted, Latency, Failover, Geo, Geoproximity, Multi-value)</li>
          <li>Load balancers: ALB vs NLB vs GWLB</li>
          <li>Caching: DAX (DynamoDB only) vs ElastiCache (universal)</li>
          <li>Encryption: SSE-S3, SSE-KMS, SSE-C, CSE — e quando usar qual</li>
          <li>DR: os 4 patterns (Backup & Restore, Pilot Light, Warm Standby, Multi-Site)</li>
          <li>Purchase options: On-Demand, Savings Plans (Compute/EC2), RI (Standard/Convertible), Spot</li>
          <li>Kinesis: Streams vs Firehose vs Managed Flink</li>
          <li>Storage: EBS (gp3/io2/st1/sc1), EFS, FSx (Windows/Lustre/NetApp/OpenZFS)</li>
          <li>Security: IAM policy evaluation logic, SCP, Permission Boundaries</li>
        </ul>
      </Section>

      <Callout tone="info">
        <strong>Formato do exame real:</strong> 65 questões em 130 minutos, 50 scored + 15 não-scored (inseridas para
        calibração). Score mínimo de aprovação: 720/1000. Custo: $150. Vale por 3 anos. Pode ser feito online (remote
        proctored) ou presencial em test center Pearson VUE.
      </Callout>

      <Callout tone="warn">
        <strong>Pegadinhas recorrentes do SAA-C03:</strong>
        <ul className="flex flex-col gap-1 pl-4 mt-2" style={{ listStyle: 'disc' }}>
          <li>&ldquo;Most cost-effective&rdquo; — pode ser serverless, pode ser Spot, depende de contexto (stateful?)</li>
          <li>&ldquo;Least operational overhead&rdquo; — quase sempre aponta para serverless ou fully managed</li>
          <li>&ldquo;With minimal application changes&rdquo; — DAX beats ElastiCache; RDS Proxy beats rewriting pool</li>
          <li>&ldquo;Encrypt in transit AND at rest&rdquo; — verifica se resposta cobre ambos</li>
          <li>&ldquo;Compliance&rdquo; — Object Lock Compliance, KMS CMK customer-managed, CloudTrail org-wide</li>
          <li>&ldquo;Global low-latency&rdquo; — CloudFront + Global Accelerator + Route 53 latency</li>
          <li>&ldquo;Replicate to another region&rdquo; — S3 CRR, RDS cross-region read replica, Aurora Global</li>
        </ul>
      </Callout>

      <Callout tone="success">
        <strong>Boa sorte!</strong> Se você chegou até aqui, tem a base conceitual necessária. O que falta é prática
        em questões. Recomendações: faça o simulado oficial da AWS (grátis), faça no mínimo 3 simulados de 65 questões
        cada antes do dia do exame, e tente recriar mentalmente a arquitetura de cada cenário. No exame, confie nos
        instintos treinados — eles vêm do entendimento, não da memorização.
      </Callout>

      <p className="text-sm leading-6 mt-4" style={{ color: 'var(--ffv-muted)' }}>
        Responda as 25 questões abaixo e use as explicações para identificar seus pontos fracos antes do exame oficial.
      </p>
    </div>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {children}
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>
        {n}
      </span>
      <div>{children}</div>
    </div>
  );
}
