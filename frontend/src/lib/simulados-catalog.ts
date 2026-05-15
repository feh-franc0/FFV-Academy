/**
 * Catálogo de simulados pagos.
 *
 * Cada Simulado inclui questões com explicações em estilo "tutor":
 * - Por que a alternativa correta é correta
 * - Por que cada distrator está errado
 * - Quando aplicável, link pra artigo da FFV
 *
 * Questões são inspiradas em tópicos reais das certificações mas escritas
 * por nós — não são cópias de dumps oficiais (legal/ético).
 */

import type { Simulado } from './simulados';

const AWS_PRACTITIONER: Simulado = {
  id: 'simulado-aws-practitioner',
  certification: 'AWS Certified Cloud Practitioner (CLF-C02)',
  title: 'Simulado AWS Cloud Practitioner',
  description:
    'Avalie seu preparo para a prova oficial AWS CLF-C02 com 65 questões aleatórias nos domínios do exame real: Cloud Concepts, Security & Compliance, Cloud Technology & Services e Billing. Banco com 500+ questões — cada tentativa é única.',
  price: 47,
  questionCount: 65,
  timeLimitMin: 90,
  passingScore: 70,
  topics: [
    'IAM & Segurança',
    'Compute (EC2)',
    'Storage (S3/EBS)',
    'Billing & Pricing',
    'Global Infrastructure',
    'Shared Responsibility',
    'Databases',
    'Networking',
  ],
  questions: [
    {
      id: 'clf-q1',
      stem: 'No modelo de responsabilidade compartilhada da AWS, quem é responsável por patch de sistema operacional em instâncias EC2?',
      options: [
        { id: 'A', text: 'AWS, em todos os casos' },
        { id: 'B', text: 'O cliente' },
        { id: 'C', text: 'AWS, exceto em instâncias Windows' },
        { id: 'D', text: 'Terceiros via Marketplace' },
      ],
      correctId: 'B',
      topic: 'Shared Responsibility',
      difficulty: 'easy',
      explanation:
        'EC2 é IaaS: a AWS é responsável pelo hypervisor, hardware e rede física ("security OF the cloud"); o cliente é responsável pelo SO, patches, runtime, aplicação e dados ("security IN the cloud"). Se fosse ECS Fargate ou Lambda, o runtime seria AWS. A distinção crítica é IaaS vs. managed services. (A) errado pois cliente gerencia o OS; (C) não há distinção entre Windows/Linux; (D) Marketplace fornece AMIs mas patches continuam com o cliente.',
      relatedSlug: 'modelo-responsabilidade-compartilhada',
    },
    {
      id: 'clf-q2',
      stem: 'Qual serviço AWS fornece armazenamento de objetos durável com 99,999999999% (11 noves) de durabilidade?',
      options: [
        { id: 'A', text: 'EBS' },
        { id: 'B', text: 'EFS' },
        { id: 'C', text: 'S3' },
        { id: 'D', text: 'FSx' },
      ],
      correctId: 'C',
      topic: 'Storage (S3/EBS)',
      difficulty: 'easy',
      explanation:
        'S3 é object storage com durabilidade de 11 noves (objetos são replicados em múltiplas AZs automaticamente). EBS é block storage (volume montado em uma única AZ, precisa snapshot pra cross-AZ). EFS é NFS compartilhado (11 noves também mas não é "objeto"). FSx é file system gerenciado pra Windows/Lustre.',
      relatedSlug: 'block-file-storage',
    },
    {
      id: 'clf-q3',
      stem: 'Uma empresa precisa executar cargas batch no menor custo possível e tolera interrupção. Qual modelo de compra EC2 é ideal?',
      options: [
        { id: 'A', text: 'On-Demand' },
        { id: 'B', text: 'Reserved Instance de 3 anos All Upfront' },
        { id: 'C', text: 'Spot Instances' },
        { id: 'D', text: 'Dedicated Host' },
      ],
      correctId: 'C',
      topic: 'Compute (EC2)',
      difficulty: 'easy',
      explanation:
        'Spot oferece até 90% de desconto mas pode ser reclaimed com 2 minutos de aviso — perfeito pra batch/fault-tolerant. On-Demand é caro. RI 3y All Upfront é mais barato que On-Demand mas não bate Spot em preço. Dedicated Host é sobre compliance (traga sua licença), não desconto.',
    },
    {
      id: 'clf-q4',
      stem: 'Qual ferramenta AWS ajuda a estimar custos de uma arquitetura ANTES de criá-la?',
      options: [
        { id: 'A', text: 'AWS Cost Explorer' },
        { id: 'B', text: 'AWS Pricing Calculator' },
        { id: 'C', text: 'AWS Budgets' },
        { id: 'D', text: 'Trusted Advisor' },
      ],
      correctId: 'B',
      topic: 'Billing & Pricing',
      difficulty: 'easy',
      explanation:
        'Pricing Calculator é pré-uso — você descreve a arquitetura (tipos de instância, tráfego, storage) e recebe uma estimativa. Cost Explorer e Budgets analisam gastos reais já ocorridos. Trusted Advisor dá recomendações de otimização, não estimativa prévia.',
    },
    {
      id: 'clf-q5',
      stem: 'Quantas Availability Zones (AZs) existem, no mínimo, em cada AWS Region?',
      options: [
        { id: 'A', text: '1' },
        { id: 'B', text: '2' },
        { id: 'C', text: '3' },
        { id: 'D', text: '4' },
      ],
      correctId: 'C',
      topic: 'Global Infrastructure',
      difficulty: 'medium',
      explanation:
        'Cada Region tem no mínimo 3 AZs (historicamente eram 2, mas desde 2018 todas novas têm 3+). AZs são datacenters isoladas mas interconectadas por fibra de baixa latência. Essa redundância é o que torna multi-AZ o padrão de alta disponibilidade.',
      relatedSlug: 'aws-global-infra',
    },
    {
      id: 'clf-q6',
      stem: 'Qual prática segue o princípio de menor privilégio em IAM?',
      options: [
        { id: 'A', text: 'Dar policy AdministratorAccess a todos os devs' },
        { id: 'B', text: 'Criar role específica por função com apenas as permissões necessárias' },
        { id: 'C', text: 'Usar a conta root para operações diárias' },
        { id: 'D', text: 'Compartilhar access keys entre times' },
      ],
      correctId: 'B',
      topic: 'IAM & Segurança',
      difficulty: 'easy',
      explanation:
        'Princípio de menor privilégio = dar apenas permissões estritamente necessárias. Role específica por função é a implementação clássica. (A) AdministratorAccess universal viola frontalmente; (C) root deve ser usada apenas para billing + MFA setup, nunca rotina; (D) access keys jamais compartilhadas — cada pessoa/serviço com identidade própria.',
      relatedSlug: 'iam-fundamentos',
    },
    {
      id: 'clf-q7',
      stem: 'Qual serviço permite rodar código sem provisionar ou gerenciar servidores?',
      options: [
        { id: 'A', text: 'EC2' },
        { id: 'B', text: 'ECS' },
        { id: 'C', text: 'Lambda' },
        { id: 'D', text: 'Lightsail' },
      ],
      correctId: 'C',
      topic: 'Compute (EC2)',
      difficulty: 'easy',
      explanation:
        'Lambda é serverless clássico: você dá código (função) e a AWS gerencia 100% da infra. EC2 é IaaS (você gerencia OS). ECS é orquestração de containers (você escolhe EC2 launch type ou Fargate). Lightsail é um "VPS simplificado" — ainda é gerenciamento de VM.',
    },
    {
      id: 'clf-q8',
      stem: 'Uma organização tem gastos inesperados e quer receber alertas quando ultrapassar um limite mensal. Qual serviço usar?',
      options: [
        { id: 'A', text: 'CloudWatch' },
        { id: 'B', text: 'AWS Budgets' },
        { id: 'C', text: 'Cost Explorer' },
        { id: 'D', text: 'Savings Plans' },
      ],
      correctId: 'B',
      topic: 'Billing & Pricing',
      difficulty: 'easy',
      explanation:
        'AWS Budgets foi desenhado exatamente pra isso: define um orçamento (custo/uso/RI coverage) e dispara alerta via SNS quando atinge % do target. CloudWatch é métricas operacionais (CPU, rede). Cost Explorer é visualização histórica. Savings Plans é um modelo de compra, não alerta.',
    },
    {
      id: 'clf-q9',
      stem: 'Qual das opções NÃO é benefício da nuvem AWS segundo o framework AWS Well-Architected?',
      options: [
        { id: 'A', text: 'Elasticidade (scale up/down conforme demanda)' },
        { id: 'B', text: 'Economia por trocar CAPEX por OPEX' },
        { id: 'C', text: 'Eliminação completa de riscos de segurança' },
        { id: 'D', text: 'Alcance global em minutos' },
      ],
      correctId: 'C',
      topic: 'Global Infrastructure',
      difficulty: 'medium',
      explanation:
        'Segurança é responsabilidade compartilhada — AWS protege a infraestrutura, mas o cliente continua responsável por configurar IAM, criptografia, redes. Nenhum provedor "elimina" risco, só oferece ferramentas pra mitigá-lo. Os outros três são benefícios genuínos reconhecidos.',
      relatedSlug: 'well-architected-framework',
    },
    {
      id: 'clf-q10',
      stem: 'Qual banco gerenciado da AWS é NoSQL, serverless e com latência single-digit milissegundos?',
      options: [
        { id: 'A', text: 'RDS' },
        { id: 'B', text: 'Aurora' },
        { id: 'C', text: 'DynamoDB' },
        { id: 'D', text: 'Redshift' },
      ],
      correctId: 'C',
      topic: 'Databases',
      difficulty: 'easy',
      explanation:
        'DynamoDB = NoSQL key-value/document, serverless, <10ms de latência em escala massiva. RDS é relacional gerenciado (MySQL/Postgres/etc). Aurora é RDS-compatible MySQL/Postgres mais rápido. Redshift é data warehouse (analítico, colunar).',
      relatedSlug: 'rds-aurora-dynamodb',
    },
    {
      id: 'clf-q11',
      stem: 'Qual serviço fornece CDN (content delivery) distribuída globalmente?',
      options: [
        { id: 'A', text: 'Route 53' },
        { id: 'B', text: 'CloudFront' },
        { id: 'C', text: 'Global Accelerator' },
        { id: 'D', text: 'API Gateway' },
      ],
      correctId: 'B',
      topic: 'Global Infrastructure',
      difficulty: 'easy',
      explanation:
        'CloudFront é o CDN da AWS — cacheia conteúdo em 450+ edge locations. Route 53 é DNS. Global Accelerator roteia tráfego pela rede AWS (não cacheia conteúdo, acelera TCP/UDP). API Gateway gerencia APIs REST/WebSocket.',
      relatedSlug: 'dns-cdn-edge',
    },
    {
      id: 'clf-q12',
      stem: 'Qual dessas é uma responsabilidade da AWS no modelo de responsabilidade compartilhada?',
      options: [
        { id: 'A', text: 'Configurar Security Groups em EC2' },
        { id: 'B', text: 'Patch do SO em instâncias EC2' },
        { id: 'C', text: 'Segurança física dos datacenters' },
        { id: 'D', text: 'Criptografia de dados em S3' },
      ],
      correctId: 'C',
      topic: 'Shared Responsibility',
      difficulty: 'medium',
      explanation:
        'Segurança física (controle de acesso ao datacenter, biometria, guardas) é sempre AWS. Security Groups e patches de EC2 são responsabilidade do cliente. Criptografia em S3 é opção do cliente (SSE-S3/KMS/cliente gerencia chave).',
    },
    {
      id: 'clf-q13',
      stem: 'Qual é a forma mais segura de dar acesso programático da sua aplicação em EC2 a um bucket S3?',
      options: [
        { id: 'A', text: 'Hardcodar access keys no código' },
        { id: 'B', text: 'Usar variáveis de ambiente com secret keys' },
        { id: 'C', text: 'Attachar uma IAM Role na instância EC2' },
        { id: 'D', text: 'Deixar o bucket público' },
      ],
      correctId: 'C',
      topic: 'IAM & Segurança',
      difficulty: 'easy',
      explanation:
        'IAM Role em EC2 → credenciais temporárias rotacionadas automaticamente pela AWS, nunca tocam código nem env. (A) hardcode = vazamento em git/logs é garantido. (B) env var está melhor que hardcode mas chaves longas não rotacionadas. (D) bucket público é desastre de segurança se tem dados sensíveis.',
      relatedSlug: 'iam-fundamentos',
    },
    {
      id: 'clf-q14',
      stem: 'Qual opção NÃO é uma edge location ou ponto de presença da AWS?',
      options: [
        { id: 'A', text: 'Availability Zone' },
        { id: 'B', text: 'Edge Location (CloudFront)' },
        { id: 'C', text: 'Regional Edge Cache' },
        { id: 'D', text: 'Local Zone' },
      ],
      correctId: 'A',
      topic: 'Global Infrastructure',
      difficulty: 'hard',
      explanation:
        'Availability Zone é um datacenter DENTRO de uma Region — não é ponto de edge. Edge Location é onde CloudFront cacheia conteúdo. Regional Edge Cache é um nível intermediário entre origem e edge. Local Zone é uma extensão regional próxima a centros urbanos (baixa latência para gaming/video).',
    },
    {
      id: 'clf-q15',
      stem: 'Um cliente quer reservar capacidade de EC2 por 3 anos para ter o maior desconto e pagar tudo adiantado. Qual modelo?',
      options: [
        { id: 'A', text: 'On-Demand' },
        { id: 'B', text: 'Spot' },
        { id: 'C', text: 'Reserved Instance 3 anos All Upfront' },
        { id: 'D', text: 'Savings Plans 1 ano No Upfront' },
      ],
      correctId: 'C',
      topic: 'Billing & Pricing',
      difficulty: 'medium',
      explanation:
        'RI 3 anos All Upfront tem o maior desconto (até 72%) em troca de pagamento antecipado total. Savings Plans 1 ano No Upfront dá desconto menor. On-Demand e Spot não envolvem reserva por termo.',
    },
    {
      id: 'clf-q16',
      stem: 'Qual serviço permite isolar logicamente uma rede virtual dentro da AWS?',
      options: [
        { id: 'A', text: 'VPC' },
        { id: 'B', text: 'Direct Connect' },
        { id: 'C', text: 'Route 53' },
        { id: 'D', text: 'CloudFront' },
      ],
      correctId: 'A',
      topic: 'Networking',
      difficulty: 'easy',
      explanation:
        'VPC (Virtual Private Cloud) é a rede virtual isolada onde você define subnets, route tables, security groups. Direct Connect é link dedicado físico entre on-prem e AWS. Route 53 é DNS. CloudFront é CDN.',
    },
    {
      id: 'clf-q17',
      stem: 'Qual serviço AWS ajuda a identificar recursos subutilizados e oportunidades de otimização de custo?',
      options: [
        { id: 'A', text: 'AWS Config' },
        { id: 'B', text: 'Trusted Advisor' },
        { id: 'C', text: 'CloudTrail' },
        { id: 'D', text: 'Systems Manager' },
      ],
      correctId: 'B',
      topic: 'Billing & Pricing',
      difficulty: 'medium',
      explanation:
        'Trusted Advisor analisa sua conta e dá recomendações em 5 pilares: custo, performance, segurança, fault tolerance, service limits. AWS Config monitora compliance de configuração. CloudTrail é log de API calls. Systems Manager é gestão operacional (patch, SSM, Parameter Store).',
    },
    {
      id: 'clf-q18',
      stem: 'Um cliente precisa armazenar dados raramente acessados por menor custo possível, mas ainda precisa acesso rápido quando solicitado. Qual classe S3?',
      options: [
        { id: 'A', text: 'S3 Standard' },
        { id: 'B', text: 'S3 Standard-IA (Infrequent Access)' },
        { id: 'C', text: 'S3 Glacier Deep Archive' },
        { id: 'D', text: 'S3 One Zone-IA' },
      ],
      correctId: 'B',
      topic: 'Storage (S3/EBS)',
      difficulty: 'medium',
      explanation:
        'Standard-IA: preço de storage menor que Standard, retrieval instantâneo (millisecond), ideal pra dados raramente acessados mas que quando precisa quer rápido. Glacier Deep Archive tem retrieval de horas. One Zone-IA é IA mas em 1 AZ só (menos durável, mais barato). Standard é pra frequente.',
    },
    {
      id: 'clf-q19',
      stem: 'Qual é uma vantagem de usar AWS Organizations?',
      options: [
        { id: 'A', text: 'Centralizar billing de múltiplas contas' },
        { id: 'B', text: 'Aumentar limites de serviço automaticamente' },
        { id: 'C', text: 'Substituir a necessidade de IAM' },
        { id: 'D', text: 'Acesso ilimitado a todos os serviços sem cobrança' },
      ],
      correctId: 'A',
      topic: 'IAM & Segurança',
      difficulty: 'medium',
      explanation:
        'Organizations permite: consolidated billing (uma fatura para N contas, com descontos por volume agregado), SCPs (Service Control Policies = guardrails em toda a organização), provisionamento automatizado de contas. Não substitui IAM, não altera limites, não dá acesso grátis.',
    },
    {
      id: 'clf-q20',
      stem: 'Qual dos pilares do AWS Well-Architected Framework foca em proteção de informações e controle de acesso?',
      options: [
        { id: 'A', text: 'Operational Excellence' },
        { id: 'B', text: 'Security' },
        { id: 'C', text: 'Reliability' },
        { id: 'D', text: 'Cost Optimization' },
      ],
      correctId: 'B',
      topic: 'IAM & Segurança',
      difficulty: 'easy',
      explanation:
        'São 6 pilares: Operational Excellence (automação, runbooks), Security (proteção + IAM + encryption), Reliability (tolerância a falhas), Performance Efficiency, Cost Optimization, Sustainability. Segurança é especificamente sobre proteção de dados, acesso, incident response.',
      relatedSlug: 'well-architected-framework',
    },
  ],
};

const AWS_SAA_PLACEHOLDER: Simulado = {
  id: 'simulado-aws-saa',
  certification: 'AWS Solutions Architect Associate (SAA-C03)',
  title: 'Simulado AWS SAA-C03',
  description:
    'Em desenvolvimento. Simulado completo da certificação Solutions Architect Associate chegando em breve. Por enquanto, confira 5 questões de preview pra sentir o nível.',
  price: 97,
  questionCount: 5,
  timeLimitMin: 10,
  passingScore: 72,
  comingSoon: true,
  topics: ['Design of Resilient Architectures', 'High-Performing Architectures', 'Secure Applications', 'Cost-Optimized'],
  questions: [
    {
      id: 'saa-q1',
      stem: 'Qual padrão é mais apropriado pra desacoplar microserviços síncronos em fila assíncrona?',
      options: [
        { id: 'A', text: 'SNS + SQS fanout' },
        { id: 'B', text: 'Direct invocation' },
        { id: 'C', text: 'Kinesis Data Firehose' },
        { id: 'D', text: 'EventBridge' },
      ],
      correctId: 'A',
      topic: 'Design of Resilient Architectures',
      difficulty: 'medium',
      explanation:
        'SNS + SQS fanout é o clássico: SNS notifica tópico, SQS subscribers bufferizam mensagens pra processamento assíncrono. EventBridge também funciona pra event-driven (com schema registry e rules avançadas). Direct invocation acopla. Firehose é pra streaming para storage/analytics.',
    },
    {
      id: 'saa-q2',
      stem: 'Qual serviço é mais apropriado para pipelines ETL batch em escala petabyte?',
      options: [
        { id: 'A', text: 'AWS Glue' },
        { id: 'B', text: 'Lambda' },
        { id: 'C', text: 'Step Functions' },
        { id: 'D', text: 'AppFlow' },
      ],
      correctId: 'A',
      topic: 'High-Performing Architectures',
      difficulty: 'medium',
      explanation:
        'Glue é ETL serverless gerenciado com Spark por baixo, feito pra escalas grandes e integrado com Data Catalog, S3, Redshift. Lambda tem limite de 15min (inviável para ETL petabyte). Step Functions orquestra workflows. AppFlow é integração SaaS→AWS.',
    },
    {
      id: 'saa-q3',
      stem: 'Como implementar encryption at rest em um volume EBS?',
      options: [
        { id: 'A', text: 'Não é possível, EBS é sempre plaintext' },
        { id: 'B', text: 'Ativar encryption at creation time com KMS key' },
        { id: 'C', text: 'Apenas manualmente via OpenSSL' },
        { id: 'D', text: 'Só em instâncias Windows' },
      ],
      correctId: 'B',
      topic: 'Secure Applications',
      difficulty: 'easy',
      explanation:
        'EBS suporta encryption at-rest via AWS KMS (default AWS-managed key ou CMK sua). Habilitar na criação do volume ou policy de account-level (padrão encrypted). É transparente ao OS. Snapshots encrypted também.',
    },
    {
      id: 'saa-q4',
      stem: 'Qual opção reduz custo de um fleet de EC2 com carga previsível rodando 24/7?',
      options: [
        { id: 'A', text: 'Compute Savings Plans 3 anos' },
        { id: 'B', text: 'Spot Instances' },
        { id: 'C', text: 'On-Demand' },
        { id: 'D', text: 'Burstable (T3) unlimited mode' },
      ],
      correctId: 'A',
      topic: 'Cost-Optimized',
      difficulty: 'medium',
      explanation:
        'Savings Plans são ideais para carga previsível (commit de $/h): até 72% off em 3 anos. Spot é pra carga tolerante a interrupção. On-Demand é baseline sem desconto. Burstable T3 é pra workloads variáveis, não 24/7 steady.',
    },
    {
      id: 'saa-q5',
      stem: 'Qual combinação garante alta disponibilidade multi-AZ para uma aplicação web?',
      options: [
        { id: 'A', text: 'ALB + Auto Scaling Group com instâncias em 2+ AZs' },
        { id: 'B', text: 'Instance única em m5.xlarge' },
        { id: 'C', text: 'EC2 com EBS encrypted' },
        { id: 'D', text: 'Lambda sem VPC' },
      ],
      correctId: 'A',
      topic: 'Design of Resilient Architectures',
      difficulty: 'easy',
      explanation:
        'Application Load Balancer + Auto Scaling Group spanning 2+ AZs é padrão-ouro de HA. ALB distribui tráfego, ASG substitui instâncias que falham, múltiplas AZs resistem a falha de datacenter. Instance única = SPOF.',
    },
  ],
};

const AWS_DEVELOPER: Simulado = {
  id: 'simulado-aws-developer',
  certification: 'AWS Certified Developer Associate (DVA-C02)',
  title: 'Simulado AWS Developer Associate',
  description:
    'Simulado completo pra certificação AWS DVA-C02. 15 questões reais inspiradas no exame: Lambda profundo (cold start, SnapStart, concurrency), DynamoDB (GSI, Streams, transactions), API Gateway (REST vs HTTP, authorizers), S3 features, Step Functions, EventBridge/SQS/SNS, Cognito, KMS, CI/CD nativo, X-Ray e IaC (CFN/SAM/CDK). Explicações densas com referência pros FAQs oficiais.',
  price: 67,
  questionCount: 15,
  timeLimitMin: 30,
  passingScore: 72,
  topics: [
    'Lambda',
    'DynamoDB',
    'API Gateway',
    'S3',
    'Step Functions',
    'EventBridge/SQS/SNS',
    'Cognito',
    'KMS',
    'CI/CD',
    'X-Ray',
    'IaC (CFN/SAM/CDK)',
  ],
  questions: [
    {
      id: 'dva-q1',
      stem: 'Uma Lambda em VPC tem cold start de 8-10s. Qual é a mitigação mais eficaz em 2026?',
      options: [
        { id: 'A', text: 'Aumentar memória pra 10GB' },
        { id: 'B', text: 'Remover Lambda da VPC (se possível), usar VPC endpoints pra DynamoDB/S3; ou aplicar Provisioned Concurrency' },
        { id: 'C', text: 'Trocar pra EC2' },
        { id: 'D', text: 'Diminuir timeout' },
      ],
      correctId: 'B',
      topic: 'Lambda',
      difficulty: 'medium',
      explanation:
        'Desde Hyperplane ENI (2019), Lambda VPC cold start caiu drasticamente (~1s), mas ainda existe. Se não precisa recursos privados da VPC, tire a Lambda de lá — acesse DynamoDB/S3 via VPC Endpoint. Pra apps que PRECISAM VPC, Provisioned Concurrency mantém N instâncias warm. Memória alta (10GB) dá mais CPU mas não remove o custo de ENI setup.',
    },
    {
      id: 'dva-q2',
      stem: 'Você tem DynamoDB com partition key = "tenantId". Cliente major tem 80% do tráfego. O que acontecer e como resolver?',
      options: [
        { id: 'A', text: 'Nada, DynamoDB escala automaticamente' },
        { id: 'B', text: 'Hot partition — throttled em 3000 RCU / 1000 WCU por partition. Fix: adicionar suffix ao PK (tenantId#00-NN) e write-shard; DynamoDB Streams + aggregation' },
        { id: 'C', text: 'Aumentar capacity total resolve' },
        { id: 'D', text: 'Migrar pra RDS' },
      ],
      correctId: 'B',
      topic: 'DynamoDB',
      difficulty: 'medium',
      explanation:
        'DynamoDB divide em partitions por hash da PK. Uma PK concentrando 80% do tráfego = hot partition (throttled). Aumentar capacity da tabela não resolve porque o limite é POR partition. Técnica: write sharding (tenantId#RANDOM0..9 como PK) e agregação downstream via Streams ou Query com FilterExpression.',
    },
    {
      id: 'dva-q3',
      stem: 'Pra minimizar custo, você quer API Gateway com apenas JWT auth e sem WAF. Qual escolher?',
      options: [
        { id: 'A', text: 'REST API (mais features)' },
        { id: 'B', text: 'HTTP API — 70% mais barato, latência menor, suporta JWT/Cognito authorizer nativamente' },
        { id: 'C', text: 'Ambos iguais' },
        { id: 'D', text: 'WebSocket' },
      ],
      correctId: 'B',
      topic: 'API Gateway',
      difficulty: 'easy',
      explanation:
        'HTTP API (v2) é versão moderna, enxuta, barata. Suporta JWT authorizer (nativo OIDC/Cognito), CORS, VPC Link. Falta: WAF, API keys + usage plans, mapping templates, private APIs. Se nada disso é necessário, HTTP API é default. Preço: ~$1/M vs $3.50/M do REST.',
    },
    {
      id: 'dva-q4',
      stem: 'Qual é a forma correta de dar segurança a upload direto do cliente pra S3 sem expor IAM credentials?',
      options: [
        { id: 'A', text: 'Deixar bucket público' },
        { id: 'B', text: 'Presigned URL gerada no server com TTL curto (minutos); cliente faz PUT direto ao S3' },
        { id: 'C', text: 'Configurar CORS permissivo' },
        { id: 'D', text: 'Enviar access keys no browser' },
      ],
      correctId: 'B',
      topic: 'S3',
      difficulty: 'easy',
      explanation:
        'Presigned URL (SigV4) é padrão. Server autorizado gera URL com GetObject/PutObject e expiresIn (ex: 600s). Cliente usa URL direto ao S3 — zero exposição de credencial, zero passagem pelo server (grande arquivo não consome banda do backend). Multipart idem pra arquivos grandes.',
    },
    {
      id: 'dva-q5',
      stem: 'Step Functions workflow precisa aguardar aprovação humana antes de prosseguir. Qual padrão usar?',
      options: [
        { id: 'A', text: 'Wait state por 24h' },
        { id: 'B', text: 'Callback pattern: Task state com waitForTaskToken — pausa até SendTaskSuccess(token) ser chamado (via API GW quando user aprova)' },
        { id: 'C', text: 'Polling em Lambda' },
        { id: 'D', text: 'Retry até sucesso' },
      ],
      correctId: 'B',
      topic: 'Step Functions',
      difficulty: 'hard',
      explanation:
        'Callback pattern é feature específica: state com "Type": "Task" + "Parameters": {..., "TaskToken.$": "$$.Task.Token"}. Workflow pausa (horas/dias/semanas até 1 ano). External caller (user clicando email link → API Gateway → Lambda → SendTaskSuccess) retoma workflow. Wait sem token não permite desbloqueio externo.',
    },
    {
      id: 'dva-q6',
      stem: 'Você tem 100k mensagens/dia entrando em SQS. Quer processar em Lambda em paralelo controlado. Como configurar?',
      options: [
        { id: 'A', text: 'Sem configuração especial — Lambda escala por si só' },
        { id: 'B', text: 'Event source mapping com BatchSize 10 e MaximumConcurrency pra limitar Lambdas simultâneas (evita overwhelm de downstream)' },
        { id: 'C', text: 'Usar EC2 em vez de Lambda' },
        { id: 'D', text: 'SNS em vez de SQS' },
      ],
      correctId: 'B',
      topic: 'EventBridge/SQS/SNS',
      difficulty: 'medium',
      explanation:
        'SQS → Lambda event source mapping tem BatchSize (msgs por invocation, padrão 10, até 10k em FIFO) e MaximumConcurrency (lançado 2022, limita concurrent Lambdas lendo fila). Sem MaximumConcurrency, Lambda escala até account limit — overwhelm downstream. Combine com visibility timeout adequado + DLQ.',
    },
    {
      id: 'dva-q7',
      stem: 'Qual é o fluxo de auth padrão (mais seguro) em Cognito User Pool?',
      options: [
        { id: 'A', text: 'USER_PASSWORD_AUTH (senha plain)' },
        { id: 'B', text: 'USER_SRP_AUTH — Secure Remote Password, senha nunca trafega' },
        { id: 'C', text: 'Admin flow' },
        { id: 'D', text: 'Client Credentials' },
      ],
      correctId: 'B',
      topic: 'Cognito',
      difficulty: 'medium',
      explanation:
        'USER_SRP_AUTH (Secure Remote Password protocol) é default pra app clients. Senha nunca viaja — uma chave derivada sim. Contrast: USER_PASSWORD_AUTH envia senha cleartext (só pra server-to-server confiável). ADMIN_USER_PASSWORD_AUTH exige admin credentials. CUSTOM_AUTH pra fluxo custom via Lambda triggers.',
    },
    {
      id: 'dva-q8',
      stem: 'Você tem IAM policy allowing kms:Decrypt, mas app recebe access denied. Qual é a causa provável?',
      options: [
        { id: 'A', text: 'IAM policy tem bug' },
        { id: 'B', text: 'KMS key policy não concede acesso ao principal — KMS requer AMBAS (key policy + IAM). Fix: adicionar principal na key policy ou delegate pra IAM' },
        { id: 'C', text: 'Network issue' },
        { id: 'D', text: 'Key rotation' },
      ],
      correctId: 'B',
      topic: 'KMS',
      difficulty: 'hard',
      explanation:
        'KMS é único service que exige interseção: IAM policy AND key policy. Key policy default só permite root account. Pra outro principal: EITHER adicionar explicitamente na key policy, OR key policy delega pra IAM ("Principal: AWS: arn:...:root" com delegation). Clássico pegadinha DVA.',
    },
    {
      id: 'dva-q9',
      stem: 'CodeDeploy pra Lambda com blue/green. Quer 10% tráfego por 5min e depois 100%. Qual config?',
      options: [
        { id: 'A', text: 'AllAtOnce' },
        { id: 'B', text: 'Canary10Percent5Minutes — preset CodeDeploy' },
        { id: 'C', text: 'Linear10PercentEvery5Minutes' },
        { id: 'D', text: 'Manual' },
      ],
      correctId: 'B',
      topic: 'CI/CD',
      difficulty: 'medium',
      explanation:
        'Canary = 2 steps (10% por N min, depois 100%). Linear = incrementos iguais (10% a cada N min até 100%). AllAtOnce = 100% imediato. Combine com CloudWatch Alarm — CodeDeploy rollback automático se alarm disparar durante shift.',
    },
    {
      id: 'dva-q10',
      stem: 'X-Ray sampling default: qual?',
      options: [
        { id: 'A', text: '100%' },
        { id: 'B', text: 'Reservoir 1 req/s + 5% do excedente — balanceia coverage vs custo' },
        { id: 'C', text: '0%' },
        { id: 'D', text: '10% fixo' },
      ],
      correctId: 'B',
      topic: 'X-Ray',
      difficulty: 'medium',
      explanation:
        'Default rule: reservoir (1 trace/s garantido, barato) + fixed rate (5% do resto). Ajusta via Sampling Rules no console/CLI — custom rules por service, URL, method. 100% em high-volume explode custo; 5% default é bom trade-off pra troubleshooting.',
    },
    {
      id: 'dva-q11',
      stem: 'Secrets Manager vs Parameter Store — quando escolher Secrets Manager?',
      options: [
        { id: 'A', text: 'Sempre' },
        { id: 'B', text: 'Quando precisa rotation automática (RDS/Redshift), cross-region replication ou cross-account sharing' },
        { id: 'C', text: 'Só pra texto curto' },
        { id: 'D', text: 'Parameter Store é obsoleto' },
      ],
      correctId: 'B',
      topic: 'Secrets Manager',
      difficulty: 'easy',
      explanation:
        'Secrets Manager: $0.40/secret/mês mas tem rotation nativa (Lambda AWS-managed pra RDS/DocDB/Redshift/DynamoDB), replicação cross-region, resource policy cross-account. Parameter Store: grátis (std tier) ou $0.05 (advanced) mas SEM rotation automática. Escolha Secrets Manager só se as features justificam o custo.',
    },
    {
      id: 'dva-q12',
      stem: 'Qual é o principal motivo pra escolher ECS Fargate em vez de Lambda?',
      options: [
        { id: 'A', text: 'Fargate é mais barato em idle' },
        { id: 'B', text: 'Workload > 15min, runtime custom (gRPC, WebSocket server), container > 10GB, ou app com estado local (connection pool grande)' },
        { id: 'C', text: 'Fargate tem menos cold start' },
        { id: 'D', text: 'Apenas estética' },
      ],
      correctId: 'B',
      topic: 'ECS',
      difficulty: 'medium',
      explanation:
        'Lambda limita: 15min timeout, 10GB image, HTTP/Lambda event-driven. Pra > 15min (ETL longo), gRPC server persistente, imagem > 10GB (ML model grande), connection pool que precisa warming long-running — Fargate. Fargate paga task rodando continuamente (não escala zero).',
    },
    {
      id: 'dva-q13',
      stem: 'Qual IaC permite código real (loops, condicionais, funções) em TypeScript/Python?',
      options: [
        { id: 'A', text: 'CloudFormation puro' },
        { id: 'B', text: 'AWS CDK — sintetiza pra CFN, mas você escreve em TS/Python/Java/Go/C#' },
        { id: 'C', text: 'SAM' },
        { id: 'D', text: 'Somente Terraform' },
      ],
      correctId: 'B',
      topic: 'IaC',
      difficulty: 'easy',
      explanation:
        'CDK = camada de código acima do CFN. cdk synth gera CFN JSON/YAML. cdk deploy sobe via CFN. L1 constructs = mapping 1:1 com CFN. L2 = defaults sensatos. L3 = patterns (ex: ApplicationLoadBalancedFargateService). SAM é macro de CFN pra serverless; não dá loops de código.',
    },
    {
      id: 'dva-q14',
      stem: 'Como ler DynamoDB Streams em Lambda automaticamente?',
      options: [
        { id: 'A', text: 'Polling manual',
 },
        { id: 'B', text: 'Event source mapping com ARN do Stream → Lambda é invocada com batch de records (INSERT/MODIFY/REMOVE)' },
        { id: 'C', text: 'SNS em cima do DynamoDB' },
        { id: 'D', text: 'Apenas via CloudWatch' },
      ],
      correctId: 'B',
      topic: 'DynamoDB',
      difficulty: 'medium',
      explanation:
        'Event source mapping liga Stream ao Lambda. Configurar: BatchSize, ParallelizationFactor (até 10, para múltiplas Lambdas por shard), StartingPosition (LATEST ou TRIM_HORIZON), MaximumBatchingWindowInSeconds. Lambda recebe Records com NewImage/OldImage. Use pra replicate pra Elasticsearch, materialize views, notify downstream.',
    },
    {
      id: 'dva-q15',
      stem: 'CI pipeline precisa invalidar CloudFront cache após deploy. Como fazer via API?',
      options: [
        { id: 'A', text: 'Não é possível',
 },
        { id: 'B', text: 'CreateInvalidation API do CloudFront com paths ["/*"] ou específicos. Cost: primeiras 1000 paths/mês free, depois $0.005/path' },
        { id: 'C', text: 'Deletar distribuição' },
        { id: 'D', text: 'Mudar S3 bucket' },
      ],
      correctId: 'B',
      topic: 'CI/CD',
      difficulty: 'easy',
      explanation:
        'aws cloudfront create-invalidation --distribution-id ABC --paths "/*". ConstCache invalidations é parte de deploy flow padrão. Para apps SPA (index.html sempre atualiza), invalida só index.html (demais assets têm hash no nome = cached forever).',
    },
  ],
};

const CKA: Simulado = {
  id: 'simulado-cka',
  certification: 'Certified Kubernetes Administrator (CKA)',
  title: 'Simulado CKA — Kubernetes Administrator',
  description:
    'Avalie seu preparo para o CKA (Linux Foundation/CNCF). 10 questões cobrindo workloads, storage, networking, cluster ops, troubleshooting. Foco em kubectl e YAML real, não teórico.',
  price: 67,
  questionCount: 10,
  timeLimitMin: 30,
  passingScore: 66,
  topics: ['Workloads', 'Storage', 'Networking', 'Troubleshooting', 'Cluster ops', 'Security'],
  questions: [
    { id: 'cka-q1', stem: 'Como escalar um Deployment chamado "api" para 5 réplicas via kubectl?', options: [{ id: 'A', text: 'kubectl resize deployment/api --count=5' }, { id: 'B', text: 'kubectl scale deployment/api --replicas=5' }, { id: 'C', text: 'kubectl set replicas api 5' }, { id: 'D', text: 'kubectl edit deployment api' }], correctId: 'B', topic: 'Workloads', difficulty: 'easy', explanation: 'kubectl scale é o comando canônico para escalar Deployments/ReplicaSets/StatefulSets. --replicas=N ajusta o campo .spec.replicas. Alternativa declarativa: editar o manifest e aplicar. Para autoscaling, usa-se HPA (HorizontalPodAutoscaler).' },
    { id: 'cka-q2', stem: 'PVC está em status "Pending". Qual o primeiro check?', options: [{ id: 'A', text: 'Reinstalar Kubernetes' }, { id: 'B', text: 'Verificar se existe StorageClass disponível e se o PVC referencia uma válida; se for manual, checar se há PV compatível (size, accessMode)' }, { id: 'C', text: 'Deletar o pod' }, { id: 'D', text: 'Aumentar CPU' }], correctId: 'B', topic: 'Storage', difficulty: 'medium', explanation: 'Pending em PVC geralmente significa sem bind: ou StorageClass não existe / não tem provisioner, ou não há PV pré-provisionado com size/accessMode compatível. kubectl describe pvc mostra events. Para dynamic provisioning, verificar storageClassName e se CSI driver está rodando.' },
    { id: 'cka-q3', stem: 'NetworkPolicy para bloquear TODO tráfego egress do namespace "prod"?', options: [{ id: 'A', text: 'Não é possível' }, { id: 'B', text: 'NetworkPolicy com podSelector {} e policyTypes [Egress] sem egress rules = deny all egress' }, { id: 'C', text: 'Firewall do host' }, { id: 'D', text: 'Remover networking' }], correctId: 'B', topic: 'Networking', difficulty: 'hard', explanation: 'NetworkPolicy com podSelector vazio seleciona todos os pods. policyTypes: [Egress] sem regras egress = implicit deny all. Requer CNI com suporte (Calico, Cilium). Lembre: se só houver ingress rules, egress continua permitido por padrão.' },
    { id: 'cka-q4', stem: 'Pod em CrashLoopBackOff. Primeiro comando útil?', options: [{ id: 'A', text: 'kubectl delete pod' }, { id: 'B', text: 'kubectl logs POD --previous (se disponível) para ver output do container que crashou, e kubectl describe pod POD para events e exit code' }, { id: 'C', text: 'Restart do node' }, { id: 'D', text: 'Nada' }], correctId: 'B', topic: 'Troubleshooting', difficulty: 'easy', explanation: 'CrashLoopBackOff = container morrendo e kubelet aplicando backoff. --previous pega logs do container anterior que crashou. describe mostra events (pull error, probe failure, OOM kill via Last State, exit code). Delete apaga sintoma, não causa.' },
    { id: 'cka-q5', stem: 'Backup de etcd em cluster kubeadm?', options: [{ id: 'A', text: 'kubectl backup etcd' }, { id: 'B', text: 'ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db com endpoints, cacert, cert, key apontando para /etc/kubernetes/pki/etcd' }, { id: 'C', text: 'tar /var/lib/kubelet' }, { id: 'D', text: 'Não precisa' }], correctId: 'B', topic: 'Cluster ops', difficulty: 'medium', explanation: 'etcd é a source of truth. Snapshot via etcdctl v3 API. Restore requer stop kube-apiserver, etcdctl snapshot restore com --data-dir, start. Produção: backup agendado + test de restore mensal.' },
    { id: 'cka-q6', stem: 'RBAC: criar Role que permita list/get de pods no namespace "dev" para um ServiceAccount.', options: [{ id: 'A', text: 'ClusterRoleBinding global' }, { id: 'B', text: 'Role (namespace-scoped) com rules apiGroups [""], resources ["pods"], verbs ["get","list"] + RoleBinding amarrando ServiceAccount' }, { id: 'C', text: 'Editar kubelet config' }, { id: 'D', text: 'Não é possível' }], correctId: 'B', topic: 'Security', difficulty: 'medium', explanation: 'Role é namespace-scoped (vs ClusterRole cluster-wide). RoleBinding dentro do namespace "dev" amarra o SA à Role. Princípio: menor privilégio. ClusterRole seria overkill e concederia acesso em todos namespaces.' },
    { id: 'cka-q7', stem: 'Node com disco cheio mostra pods em status "Evicted". Solução?', options: [{ id: 'A', text: 'Ignorar' }, { id: 'B', text: 'Liberar disco (logs, imagens), ajustar kubelet evictionHard/Soft thresholds, considerar storage dedicado pra /var/lib/containerd e kubelet' }, { id: 'C', text: 'Reboot e torcer' }, { id: 'D', text: 'Desabilitar kubelet' }], correctId: 'B', topic: 'Troubleshooting', difficulty: 'medium', explanation: 'Eviction é mecanismo do kubelet quando node está sob pressão (disk, memory, pid). Limpeza de imagens (crictl rmi), logs rotativos, e partição separada pro kubelet evitam impacto. evictionHard default é agressivo em prod.' },
    { id: 'cka-q8', stem: 'Upgrade de cluster kubeadm: ordem correta dos nodes?', options: [{ id: 'A', text: 'Todos ao mesmo tempo' }, { id: 'B', text: 'Control plane primeiro (1 por vez, drain + upgrade + uncordon), depois worker nodes um a um com drain/upgrade/uncordon' }, { id: 'C', text: 'Workers antes' }, { id: 'D', text: 'Random' }], correctId: 'B', topic: 'Cluster ops', difficulty: 'hard', explanation: 'Control plane primeiro garante API compatível para workers novos. Drain move pods, respeita PDBs. kubeadm upgrade plan/apply. Workers dependem da mesma kubelet ou uma minor abaixo.' },
    { id: 'cka-q9', stem: 'Service tipo NodePort expõe pod em qual range de portas por padrão?', options: [{ id: 'A', text: '1-1024' }, { id: 'B', text: '30000-32767' }, { id: 'C', text: '8080-9090' }, { id: 'D', text: 'Qualquer' }], correctId: 'B', topic: 'Networking', difficulty: 'easy', explanation: 'Range padrão NodePort é 30000-32767 (configurável via --service-node-port-range no apiserver). Cada node abre a porta e proxy para o Service. LoadBalancer normalmente cria NodePort + cloud LB na frente.' },
    { id: 'cka-q10', stem: 'Init container: quando usar?', options: [{ id: 'A', text: 'Nunca' }, { id: 'B', text: 'Tarefas de setup que precisam rodar ANTES do container principal: migrations, wait-for-db, config download, permission fix — cada init roda sequencialmente até sucesso' }, { id: 'C', text: 'Logging' }, { id: 'D', text: 'Debugging' }], correctId: 'B', topic: 'Workloads', difficulty: 'medium', explanation: 'Init containers permitem setup ordenado. Se um falha, pod reinicia desde o primeiro init. Útil para wait-for-service (netcat loop), schema migration, decrypt secrets. Container principal só inicia após todos os inits OK.' },
  ],
};

const TERRAFORM: Simulado = {
  id: 'simulado-terraform',
  certification: 'HashiCorp Certified Terraform Associate (003)',
  title: 'Simulado Terraform Associate',
  description:
    'Prova HashiCorp Terraform Associate 003. 10 questões sobre state, providers, modules, workspaces, variables, sentinel, Terraform Cloud. Foco em conceitos que caem e armadilhas reais.',
  price: 57,
  questionCount: 10,
  timeLimitMin: 30,
  passingScore: 70,
  topics: ['State', 'Providers', 'Modules', 'Workspaces', 'Variables', 'Terraform Cloud', 'CLI'],
  questions: [
    { id: 'tf-q1', stem: 'Onde o state é armazenado por padrão em Terraform local?', options: [{ id: 'A', text: 'Em ~/.terraform' }, { id: 'B', text: 'Arquivo terraform.tfstate no diretório corrente' }, { id: 'C', text: 'No Git' }, { id: 'D', text: 'Em memória' }], correctId: 'B', topic: 'State', difficulty: 'easy', explanation: 'Local backend default cria terraform.tfstate no working dir. NUNCA commitar este arquivo (contém secrets como passwords). Produção: remote backend (S3 + DynamoDB lock, Terraform Cloud, Azure Storage, GCS).' },
    { id: 'tf-q2', stem: 'Como importar recurso existente sem recriar?', options: [{ id: 'A', text: 'terraform apply --force' }, { id: 'B', text: 'terraform import RESOURCE ID (adiciona ao state sem tocar infra); depois escrever o bloco resource correspondente' }, { id: 'C', text: 'Recriar e torcer' }, { id: 'D', text: 'Não é possível' }], correctId: 'B', topic: 'CLI', difficulty: 'medium', explanation: 'terraform import liga recurso existente ao state. No TF 1.5+, o bloco import {} permite fazer isso declarativamente. Essencial para adoção em infra legada.' },
    { id: 'tf-q3', stem: 'Workspaces em Terraform são usados para?', options: [{ id: 'A', text: 'Multi-tenant completo' }, { id: 'B', text: 'Múltiplos estados paralelos para mesma configuração (ex: dev/staging/prod); não é ambiente isolado por perfil de credenciais' }, { id: 'C', text: 'Nada' }, { id: 'D', text: 'Controle de acesso' }], correctId: 'B', topic: 'Workspaces', difficulty: 'medium', explanation: 'Workspaces = múltiplos states da mesma config (terraform.tfstate.d/WS). Bom para dev/stage/prod quando infra é idêntica. NÃO substitui separar por diretório+backend se credenciais/variáveis diferem muito.' },
    { id: 'tf-q4', stem: 'Como evitar leak de credenciais AWS em terraform.tfstate?', options: [{ id: 'A', text: 'Não é possível' }, { id: 'B', text: 'Remote backend com criptografia em repouso (S3 SSE-KMS), IAM policies restritas, state lock via DynamoDB, e nunca commitar state' }, { id: 'C', text: 'base64 encode' }, { id: 'D', text: 'Ignore file' }], correctId: 'B', topic: 'State', difficulty: 'hard', explanation: 'State contém plaintext de attributes sensíveis. S3 + SSE-KMS + bucket policy restritiva + DynamoDB para lock é padrão AWS. Alternativa: Terraform Cloud com tokens. sensitive = true em variables ajuda em output mas não no state.' },
    { id: 'tf-q5', stem: 'Diferença entre count e for_each?', options: [{ id: 'A', text: 'São iguais' }, { id: 'B', text: 'count cria lista indexada (remove/move do meio é destrutivo); for_each cria map por chave (mais estável para modificações)' }, { id: 'C', text: 'for_each é obsoleto' }, { id: 'D', text: 'count funciona só em providers' }], correctId: 'B', topic: 'CLI', difficulty: 'medium', explanation: 'Armadilha clássica: com count, deletar item do meio da lista causa re-creation dos subsequentes (index shift). for_each usa chaves estáveis. Prefira for_each para coleções modificáveis.' },
    { id: 'tf-q6', stem: 'Variable com default sensitive = true. O que muda?', options: [{ id: 'A', text: 'Nada' }, { id: 'B', text: 'Valor é omitido de plan/apply output e mensagens; ainda aparece em state (state precisa de proteção separada)' }, { id: 'C', text: 'Encripta globalmente' }, { id: 'D', text: 'Gera erro' }], correctId: 'B', topic: 'Variables', difficulty: 'medium', explanation: 'sensitive esconde de CLI output. NÃO encripta, não esconde do state. Produção: passar via env var TF_VAR_xxx ou secrets manager, nunca commitar tfvars com secret.' },
    { id: 'tf-q7', stem: 'Módulo publicado em Terraform Registry. Como referenciar?', options: [{ id: 'A', text: 'URL direta' }, { id: 'B', text: 'source = "NAMESPACE/NAME/PROVIDER" com version = "~> 3.0". Terraform baixa e cacheia.' }, { id: 'C', text: 'Git clone manual' }, { id: 'D', text: 'Não é suportado' }], correctId: 'B', topic: 'Modules', difficulty: 'easy', explanation: 'Registry format: hashicorp/consul/aws. Sempre pinar version com ~> ou explicit. terraform init baixa. Alternativas: git::, http::, local path (../modules/x).' },
    { id: 'tf-q8', stem: 'Terraform Cloud: qual benefício principal vs local?', options: [{ id: 'A', text: 'Mais rápido' }, { id: 'B', text: 'Remote state com lock nativo, run history, plan/apply em workers Cloud, integração com VCS, policy-as-code (Sentinel/OPA), collaboration' }, { id: 'C', text: 'GUI bonita' }, { id: 'D', text: 'Grátis sempre' }], correctId: 'B', topic: 'Terraform Cloud', difficulty: 'medium', explanation: 'TFC resolve state remote + lock + collaboration sem DIY. Sentinel (ou OPA via TF Enterprise) para guard rails. Free tier limitado, paid pra teams. Alternativas: Spacelift, env0, Scalr.' },
    { id: 'tf-q9', stem: 'terraform fmt faz o quê?', options: [{ id: 'A', text: 'Deleta arquivos' }, { id: 'B', text: 'Formata arquivos .tf para canonical style (indent, spacing, alinhamento de =) — deve rodar em CI para consistency' }, { id: 'C', text: 'Apply dry-run' }, { id: 'D', text: 'Download modules' }], correctId: 'B', topic: 'CLI', difficulty: 'easy', explanation: 'fmt = formatador. Rodar em pre-commit hook. terraform fmt -recursive percorre subdirs. Combinado com terraform validate é o mínimo de CI sanity.' },
    { id: 'tf-q10', stem: 'Data source em Terraform: para quê?', options: [{ id: 'A', text: 'Criar recursos' }, { id: 'B', text: 'LER informação de infra existente (não criada pelo TF) e usar em resources. Ex: data "aws_ami" para AMI dinâmica' }, { id: 'C', text: 'Gerar relatórios' }, { id: 'D', text: 'Nada' }], correctId: 'B', topic: 'CLI', difficulty: 'easy', explanation: 'data source = read-only lookup. Útil para AMI mais recente, account_id, availability_zones, recursos criados fora do TF. Avaliado em plan. Não modifica nada.' },
  ],
};

const SECURITY_PLUS: Simulado = {
  id: 'simulado-security-plus',
  certification: 'CompTIA Security+ (SY0-701)',
  title: 'Simulado CompTIA Security+ SY0-701',
  description:
    'Prova CompTIA Security+ 701. 10 questões nos 5 domínios: Attacks/Vulnerabilities, Architecture, Operations, Risk Management, Governance. Para quem está começando em security.',
  price: 47,
  questionCount: 10,
  timeLimitMin: 30,
  passingScore: 70,
  topics: ['Attacks', 'Cryptography', 'IAM', 'Network Security', 'Risk', 'GRC'],
  questions: [
    { id: 'sec-q1', stem: 'Ataque "pass-the-hash" explora qual fraqueza?', options: [{ id: 'A', text: 'Senha fraca' }, { id: 'B', text: 'Autenticação NTLM que aceita hash direto sem re-digitar a senha — atacante que roubou o hash (via LSASS dump) autentica sem conhecer a senha plaintext' }, { id: 'C', text: 'DNS' }, { id: 'D', text: 'Buffer overflow' }], correctId: 'B', topic: 'Attacks', difficulty: 'medium', explanation: 'PtH é clássico em redes Windows. Mitigações: desabilitar NTLM onde possível, LSA protection (Credential Guard), LAPS (local admin senha por máquina), network segmentation.' },
    { id: 'sec-q2', stem: 'Qual algoritmo é apropriado para armazenar senhas em 2026?', options: [{ id: 'A', text: 'MD5' }, { id: 'B', text: 'Argon2id (ou bcrypt/scrypt) com salt único por user e work factor calibrado para ~100ms' }, { id: 'C', text: 'SHA-256 puro' }, { id: 'D', text: 'Base64' }], correctId: 'B', topic: 'Cryptography', difficulty: 'easy', explanation: 'Hash de senha precisa ser LENTO e adaptativo. Argon2id venceu PHC (2015), recomendado por OWASP. bcrypt/scrypt são aceitáveis. SHA/MD5 são rápidos demais (atacante computa bilhões/s). Sempre salt único.' },
    { id: 'sec-q3', stem: 'Zero-trust architecture: princípio central?', options: [{ id: 'A', text: 'Firewall de perímetro forte' }, { id: 'B', text: '"Never trust, always verify": autenticar e autorizar CADA request independente da origem (interna ou externa), baseado em identity + context + device posture' }, { id: 'C', text: 'VPN obrigatória' }, { id: 'D', text: 'Bloquear tudo' }], correctId: 'B', topic: 'Network Security', difficulty: 'medium', explanation: 'Zero-trust abandona modelo perímetro/castelo. Google BeyondCorp foi pioneiro. Implementação: IdP + MFA + device trust + micro-segmentation + policy engine (OPA) + mTLS service-to-service.' },
    { id: 'sec-q4', stem: 'Phishing vs Spear Phishing?', options: [{ id: 'A', text: 'São sinônimos' }, { id: 'B', text: 'Phishing é mass (spray-and-pray); spear phishing é targeted a indivíduo ou pequeno grupo, usa OSINT para personalizar (CEO fraud, whale phishing)' }, { id: 'C', text: 'Spear usa email, phishing não' }, { id: 'D', text: 'Phishing é legal' }], correctId: 'B', topic: 'Attacks', difficulty: 'easy', explanation: 'Spear investe tempo em reconhecimento: LinkedIn, calendário público, brand voice. Taxa de sucesso maior. BEC (Business Email Compromise) é variante cara.' },
    { id: 'sec-q5', stem: 'MFA: qual combinação conta como "dois fatores" reais?', options: [{ id: 'A', text: 'Senha + pergunta de segurança' }, { id: 'B', text: 'Senha (knowledge) + token/app TOTP ou hardware key (possession) — dois fatores DIFERENTES' }, { id: 'C', text: 'Duas senhas' }, { id: 'D', text: 'SMS sempre' }], correctId: 'B', topic: 'IAM', difficulty: 'easy', explanation: 'MFA real: 2+ de fatores DIFERENTES (knowledge/possession/inherence). Pergunta de segurança é knowledge = mesmo fator. SMS é possession fraco (SIM swap). Hardware key (WebAuthn/FIDO2) é o padrão-ouro.' },
    { id: 'sec-q6', stem: 'Residual risk depois de implementar controles é?', options: [{ id: 'A', text: 'Zero' }, { id: 'B', text: 'O risco que sobra após os controles — precisa ser aceito pela gestão (accept) ou transferido (seguro, terceiro)' }, { id: 'C', text: 'Mesmo do inicial' }, { id: 'D', text: 'Ignorável' }], correctId: 'B', topic: 'Risk', difficulty: 'medium', explanation: 'Risk management: avoid / mitigate / transfer / accept. Nenhum controle elimina 100%. Accept formal via sign-off do owner. Seguro cibernético transfere financeiramente. Documentar em risk register.' },
    { id: 'sec-q7', stem: 'SIEM: função principal?', options: [{ id: 'A', text: 'Firewall' }, { id: 'B', text: 'Coletar logs de múltiplas fontes (apps, rede, endpoints), correlacionar eventos, detectar padrões suspeitos, alertar — central pra SOC' }, { id: 'C', text: 'Antivírus' }, { id: 'D', text: 'Backup' }], correctId: 'B', topic: 'Operations', difficulty: 'easy', explanation: 'SIEM = Security Information and Event Management. Splunk, QRadar, Elastic Security, Wazuh (open). Complementa com SOAR (automation/playbooks) e XDR (endpoint+network+cloud).' },
    { id: 'sec-q8', stem: 'GDPR/LGPD "right to erasure" (direito ao esquecimento) significa?', options: [{ id: 'A', text: 'Deletar toda a base' }, { id: 'B', text: 'Titular pode solicitar deleção de seus dados pessoais quando a base legal caducou ou consent foi revogado; não é absoluto (há exceções legais)' }, { id: 'C', text: 'Só afeta marketing' }, { id: 'D', text: 'Apenas UE' }], correctId: 'B', topic: 'GRC', difficulty: 'medium', explanation: 'LGPD art. 18 (semelhante GDPR art. 17). Exceções: cumprimento de lei, exercício regular de direitos, estudo com anonimização, etc. Implementação requer inventário de onde dados estão (data discovery).' },
    { id: 'sec-q9', stem: 'Supply chain attack: definição?', options: [{ id: 'A', text: 'Ataque físico a loja' }, { id: 'B', text: 'Comprometimento via fornecedor terceiro (código, build pipeline, dependência). Exemplos: SolarWinds 2020, event-stream npm, Log4Shell, xz-utils 2024' }, { id: 'C', text: 'Phishing' }, { id: 'D', text: 'DDoS' }], correctId: 'B', topic: 'Attacks', difficulty: 'hard', explanation: 'Supply chain é vetor moderno crítico. Defesas: SBOM (Software Bill of Materials), dependency pinning + verification, reproducible builds, signing (sigstore/cosign), minimize transitive deps.' },
    { id: 'sec-q10', stem: 'DLP (Data Loss Prevention): foco?', options: [{ id: 'A', text: 'Backup' }, { id: 'B', text: 'Detectar e bloquear exfiltração de dados sensíveis via egress (email, upload, USB) usando pattern matching, classification, context' }, { id: 'C', text: 'Firewall' }, { id: 'D', text: 'Encryption' }], correctId: 'B', topic: 'Operations', difficulty: 'medium', explanation: 'DLP inspeciona traffic procurando CPF, cartão, PII, código fonte. Endpoint DLP no cliente, Network DLP no gateway, Cloud DLP no CASB. Falsos positivos são comuns — requer tuning.' },
  ],
};

const AZURE_FUND: Simulado = {
  id: 'simulado-azure-fundamentals',
  certification: 'Microsoft Azure Fundamentals (AZ-900)',
  title: 'Simulado AZ-900 — Azure Fundamentals',
  description:
    'Prova AZ-900 da Microsoft. 10 questões sobre cloud concepts, Azure services (compute, storage, networking), Azure management, governance, cost management. Entry-level Azure.',
  price: 47,
  questionCount: 10,
  timeLimitMin: 30,
  passingScore: 70,
  topics: ['Cloud Concepts', 'Azure Services', 'Management', 'Governance', 'Cost'],
  questions: [
    { id: 'az-q1', stem: 'IaaS vs PaaS vs SaaS: qual exemplo é PaaS?', options: [{ id: 'A', text: 'VM no Azure' }, { id: 'B', text: 'Azure App Service — runtime gerenciado (deploy código, Microsoft cuida do OS/runtime/load balancer)' }, { id: 'C', text: 'Office 365' }, { id: 'D', text: 'Azure Resource Manager' }], correctId: 'B', topic: 'Cloud Concepts', difficulty: 'easy', explanation: 'PaaS = Platform as a Service: você foca no código, provider cuida da infra. App Service, Azure Functions, Container Apps são PaaS. IaaS = VM (cliente cuida de OS). SaaS = app completo pronto (M365).' },
    { id: 'az-q2', stem: 'Azure Resource Manager (ARM) é?', options: [{ id: 'A', text: 'Um tipo de VM' }, { id: 'B', text: 'A API/plane de controle do Azure — todas operações (portal, CLI, SDK, Bicep, Terraform) passam pelo ARM para CRUD de recursos' }, { id: 'C', text: 'Database' }, { id: 'D', text: 'CDN' }], correctId: 'B', topic: 'Management', difficulty: 'easy', explanation: 'ARM é a layer uniforme. Templates ARM (JSON) ou Bicep (DSL mais limpa) descrevem recursos declarativamente. Resource Group agrupa recursos (deletar RG apaga tudo).' },
    { id: 'az-q3', stem: 'Azure AD (agora Microsoft Entra ID) é?', options: [{ id: 'A', text: 'DNS service' }, { id: 'B', text: 'Identity provider cloud-based — IAM, SSO, MFA, conditional access. Core da segurança Azure/M365' }, { id: 'C', text: 'Active Directory on-prem' }, { id: 'D', text: 'VPN' }], correctId: 'B', topic: 'Management', difficulty: 'easy', explanation: 'Entra ID (renomeado de Azure AD em 2023). Sincroniza com AD on-prem via Entra Connect. Não é LDAP por padrão (é REST/OIDC/SAML). Conditional access é feature killer.' },
    { id: 'az-q4', stem: 'Azure Cost Management permite?', options: [{ id: 'A', text: 'Só ver fatura' }, { id: 'B', text: 'Ver/analisar custos, criar budgets com alertas, recomendações de otimização (Advisor), reservas/savings plans' }, { id: 'C', text: 'Nada' }, { id: 'D', text: 'Só exportar CSV' }], correctId: 'B', topic: 'Cost', difficulty: 'easy', explanation: 'Cost Management + Billing é free add-on. Budgets alertam via email/action group. Reserved Instances (1/3 anos) dão descontos significativos em cargas estáveis. Spot VMs para batch tolerante a interrupção.' },
    { id: 'az-q5', stem: 'Azure Policy serve para?', options: [{ id: 'A', text: 'Firewall' }, { id: 'B', text: 'Governance: definir regras que recursos devem seguir (ex: só regiões permitidas, tags obrigatórias, SKU proibida) — audit ou deny' }, { id: 'C', text: 'Backup' }, { id: 'D', text: 'Identity' }], correctId: 'B', topic: 'Governance', difficulty: 'medium', explanation: 'Policy aplica guard rails. Effect: audit (reporta), deny (bloqueia), append (adiciona), modify. Initiative agrupa policies (ISO, PCI-DSS). Blueprint foi deprecated em favor de Template Specs + Policy.' },
    { id: 'az-q6', stem: 'Azure Availability Zone vs Region?', options: [{ id: 'A', text: 'Mesma coisa' }, { id: 'B', text: 'Region = área geográfica (ex: East US). AZ = datacenters fisicamente isolados dentro da region (3 por region suportada). VM zonal tem SLA 99.99%' }, { id: 'C', text: 'AZ é menor que rack' }, { id: 'D', text: 'Só Europa tem AZ' }], correctId: 'B', topic: 'Cloud Concepts', difficulty: 'medium', explanation: 'AZ = pareamento de datacenters independentes (power, cooling, network). Resource zonal (AZ específico) vs zone-redundant (replica entre AZ). Nem toda region tem AZ — verificar.' },
    { id: 'az-q7', stem: 'Azure Blob Storage tiers?', options: [{ id: 'A', text: 'Só um' }, { id: 'B', text: 'Hot (acesso frequente), Cool (pouco acesso), Cold (raro), Archive (arquival, latência em horas). Lifecycle policy move automaticamente' }, { id: 'C', text: 'Hot e Cold só' }, { id: 'D', text: 'Standard e Premium' }], correctId: 'B', topic: 'Azure Services', difficulty: 'medium', explanation: 'Cost trade-off: Hot paga mais storage + menos acesso, Archive é barato mas re-hydrate leva tempo. Lifecycle management policies automatizam transição baseada em idade.' },
    { id: 'az-q8', stem: 'Azure Monitor + Log Analytics servem para?', options: [{ id: 'A', text: 'VM provisioning' }, { id: 'B', text: 'Observabilidade: coleta métricas + logs + traces, query via KQL (Kusto Query Language), alerts, workbooks, Application Insights para apps' }, { id: 'C', text: 'Networking' }, { id: 'D', text: 'Identity' }], correctId: 'B', topic: 'Management', difficulty: 'medium', explanation: 'Log Analytics é o data store; Monitor a interface. KQL é linguagem declarativa poderosa. App Insights é SDK para observability de apps (.NET, Java, Node). Integra com Grafana também.' },
    { id: 'az-q9', stem: 'Azure subscription: papel?', options: [{ id: 'A', text: 'É o usuário' }, { id: 'B', text: 'Billing boundary + security boundary. Recursos vivem em subscriptions, que vivem em management groups. Separar prod/dev em subs diferentes é padrão' }, { id: 'C', text: 'Tipo de VM' }, { id: 'D', text: 'Não tem uso' }], correctId: 'B', topic: 'Management', difficulty: 'easy', explanation: 'Subscription = unidade de billing e quota. Multi-subscription via management groups para org grande. RBAC aplicável em sub, RG ou resource. Enterprise Agreement permite N subs.' },
    { id: 'az-q10', stem: 'Azure Key Vault: casos de uso?', options: [{ id: 'A', text: 'VPN' }, { id: 'B', text: 'Gerenciar secrets (passwords, API keys), keys (criptografia), certificates; integrado com Managed Identity pra apps acessarem sem credenciais hardcoded' }, { id: 'C', text: 'Storage account' }, { id: 'D', text: 'Apenas keys SSH' }], correctId: 'B', topic: 'Azure Services', difficulty: 'medium', explanation: 'Key Vault é o HashiCorp Vault do Azure. Premium tier usa HSM. Certificate auto-rotation (Let\'s Encrypt ou CA interna). Managed Identity elimina credenciais em código.' },
  ],
};

export const SIMULADOS_CATALOG: readonly Simulado[] = [
  AWS_PRACTITIONER,
  AWS_DEVELOPER,
  AWS_SAA_PLACEHOLDER,
  CKA,
  TERRAFORM,
  SECURITY_PLUS,
  AZURE_FUND,
] as const;
