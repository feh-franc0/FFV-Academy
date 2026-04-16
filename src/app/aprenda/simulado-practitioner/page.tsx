import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Simulado CLF-C02 Comentado — FFV Academy',
  description: 'Simulado completo do AWS Cloud Practitioner CLF-C02 com 20 questões estilo exame, todas comentadas em profundidade.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: '[Domínio 1 — Cloud Concepts] Qual benefício do cloud computing permite trocar gastos fixos com data center por gastos variáveis baseados em uso?',
    options: [
      'Economies of scale',
      'Trade CapEx for variable expense',
      'Stop guessing capacity',
      'Go global in minutes',
    ],
    correct: 1,
    explanation: '"Trade CapEx for variable expense" é o primeiro dos 6 benefícios oficiais do cloud: você deixa de investir upfront em servidores e paga apenas pelo que consumir. "Economies of scale" é o segundo (AWS repassa economia de escala). "Stop guessing capacity" é o terceiro. "Go global in minutes" é o sexto.',
  },
  {
    question: '[Domínio 1] Uma empresa quer hospedar dados que precisam estar fisicamente em país específico por lei. Qual conceito de infraestrutura global AWS garante isso?',
    options: [
      'Availability Zone',
      'Edge Location',
      'AWS Region',
      'Placement Group',
    ],
    correct: 2,
    explanation: 'Cada AWS Region é um cluster isolado de data centers em uma geografia específica (ex: sa-east-1 em São Paulo). Dados ficam dentro da Region a menos que você replique. Availability Zones são subdivisões dentro da Region. Edge Locations servem caches (CloudFront), não armazenam dados principais. Placement Group é estratégia de posicionamento de EC2 dentro de uma AZ.',
  },
  {
    question: '[Domínio 2 — Security] No modelo de responsabilidade compartilhada, de quem é a responsabilidade de aplicar patches no sistema operacional de uma instância EC2?',
    options: [
      'Sempre da AWS',
      'Sempre do cliente',
      'AWS para serviços gerenciados (RDS, Lambda); cliente para EC2',
      'Depende do tipo da região',
    ],
    correct: 2,
    explanation: 'EC2 é IaaS — você gerencia o OS, incluindo patches. Já serviços gerenciados como RDS, Lambda, Fargate e DynamoDB têm o OS/runtime mantido pela AWS. Regra geral: quanto mais gerenciado o serviço, menos responsabilidade sua.',
  },
  {
    question: '[Domínio 2] Qual prática de segurança é fortemente recomendada para a conta root da AWS?',
    options: [
      'Usar para todas as operações administrativas diárias',
      'Compartilhar credenciais com o time de DevOps',
      'Habilitar MFA e não usar para operações do dia-a-dia',
      'Criar access keys e armazenar no CI/CD',
    ],
    correct: 2,
    explanation: 'A conta root tem poder absoluto e deve ser protegida ao máximo: MFA habilitado, senha forte, bloqueio de access keys (delete se existirem), uso somente para tarefas que EXIGEM root (ex: fechar conta, mudar support plan). Para o dia-a-dia, use IAM Users/Roles com least privilege.',
  },
  {
    question: '[Domínio 2] Qual serviço permite centralizar e gerenciar chaves de criptografia com rotação automática e auditoria via CloudTrail?',
    options: [
      'AWS Secrets Manager',
      'AWS Certificate Manager (ACM)',
      'AWS Key Management Service (KMS)',
      'AWS Systems Manager Parameter Store',
    ],
    correct: 2,
    explanation: 'KMS é o serviço gerenciado de chaves de criptografia (simétricas e assimétricas). Integra nativamente com S3, EBS, RDS, Lambda, etc. Secrets Manager gerencia SEGREDOS (senhas, tokens), não chaves em si. ACM gerencia certificados TLS. Parameter Store armazena configurações.',
  },
  {
    question: '[Domínio 3 — Technology] Uma aplicação precisa de storage que seja montado simultaneamente por várias instâncias EC2 em Linux, compartilhando arquivos. Qual serviço usar?',
    options: [
      'Amazon S3',
      'Amazon EBS (gp3)',
      'Amazon EFS',
      'Amazon FSx for Windows',
    ],
    correct: 2,
    explanation: 'EFS é NFS gerenciado — múltiplas EC2 Linux podem montar o mesmo filesystem simultaneamente. EBS é block storage single-AZ, geralmente ligado a UMA EC2 (multi-attach existe mas com limites). S3 é object storage (não é montável como disco). FSx for Windows seria a escolha se fosse SMB/Windows.',
  },
  {
    question: '[Domínio 3] Qual serviço é o mais adequado para rodar código sem provisionar servidores, escalando automaticamente de 0 a milhares de execuções simultâneas?',
    options: [
      'Amazon EC2 Auto Scaling',
      'AWS Lambda',
      'Amazon ECS com EC2 launch type',
      'AWS Elastic Beanstalk',
    ],
    correct: 1,
    explanation: 'Lambda é serverless: você traz o código, a AWS cuida do resto. Paga por invocação + duração em ms. Escala de 0 a milhares automaticamente. EC2 Auto Scaling escala instâncias (com warm-up time). ECS com EC2 launch type exige você gerenciar as EC2. Beanstalk simplifica deploy mas ainda usa EC2 por trás.',
  },
  {
    question: '[Domínio 3] Qual banco AWS é multi-região, multi-master, single-digit millisecond latency, e dimensionável para bilhões de linhas?',
    options: [
      'Amazon RDS (MySQL)',
      'Amazon Aurora',
      'Amazon Redshift',
      'Amazon DynamoDB',
    ],
    correct: 3,
    explanation: 'DynamoDB é NoSQL serverless key-value. Global Tables replicam entre regiões com modo multi-master. Latência P99 single-digit ms. Suporta bilhões de linhas, trilhões de requests/dia. RDS e Aurora são relacionais. Redshift é data warehouse (queries analíticas em minutos, não milissegundos).',
  },
  {
    question: '[Domínio 3] Qual serviço faz audit de TODAS as chamadas de API feitas em uma conta AWS (quem, quando, o quê)?',
    options: [
      'Amazon CloudWatch',
      'AWS CloudTrail',
      'AWS Config',
      'AWS Trusted Advisor',
    ],
    correct: 1,
    explanation: 'CloudTrail registra cada API call na conta: quem (ARN do caller), quando (timestamp), de onde (source IP), o quê (API + parameters). 90 dias grátis em Event History, ilimitado se criar um Trail em S3. CloudWatch é métricas/logs de aplicação. Config rastreia ESTADO de recursos. Trusted Advisor dá recomendações.',
  },
  {
    question: '[Domínio 3] Qual serviço AWS é usado para distribuir conteúdo estático globalmente com baixa latência via 450+ pontos de presença?',
    options: [
      'AWS Global Accelerator',
      'Amazon CloudFront',
      'Amazon Route 53',
      'AWS Direct Connect',
    ],
    correct: 1,
    explanation: 'CloudFront é o CDN da AWS — cacheia conteúdo em Edge Locations próximas dos usuários. Global Accelerator roteia TCP/UDP pela rede AWS (melhora performance mas não cacheia). Route 53 é DNS. Direct Connect é link físico dedicado entre on-prem e AWS.',
  },
  {
    question: '[Domínio 3] Uma empresa precisa migrar 500 TB de dados para AWS rapidamente, mas a internet corporativa tem 100 Mbps. Qual solução?',
    options: [
      'AWS DataSync via VPN',
      'AWS Snowball',
      'Amazon S3 Transfer Acceleration',
      'AWS Storage Gateway',
    ],
    correct: 1,
    explanation: 'Em 100 Mbps, 500 TB levariam ~500 dias. Snowball é um dispositivo físico (80 TB por unidade) que a AWS envia, você copia os dados localmente, devolve. Para 500 TB, use Snowball Edge ou Snowmobile (truck). DataSync melhora transferência por rede mas ainda depende da banda. Transfer Acceleration usa CloudFront para uploads.',
  },
  {
    question: '[Domínio 2] Qual serviço detecta ameaças (mineração de criptomoeda, acessos suspeitos, comunicação com IPs maliciosos) via ML e threat intelligence?',
    options: [
      'AWS WAF',
      'Amazon GuardDuty',
      'AWS Shield',
      'Amazon Macie',
    ],
    correct: 1,
    explanation: 'GuardDuty analisa CloudTrail, VPC Flow Logs e DNS Logs com ML + threat intelligence feeds (IPs maliciosos conhecidos). WAF protege apps web contra OWASP Top 10 (SQL injection, XSS). Shield protege contra DDoS. Macie detecta PII/PHI em S3.',
  },
  {
    question: '[Domínio 4 — Billing] Uma empresa tem 20 contas AWS e quer gerenciar cobrança consolidada + SCPs centralizadas. Qual serviço?',
    options: [
      'AWS Budgets',
      'AWS Cost Explorer',
      'AWS Organizations',
      'AWS Control Tower',
    ],
    correct: 2,
    explanation: 'Organizations é o serviço core de multi-account: consolidated billing, SCPs (Service Control Policies), compartilhamento de RIs/Savings Plans. Control Tower SENTA EM CIMA de Organizations para prover uma landing zone (setup opinativo). Budgets e Cost Explorer são ferramentas de análise.',
  },
  {
    question: '[Domínio 4] Qual modelo de compra de EC2 oferece descontos de até 72%, em troca de commitment de 1 ou 3 anos para instância/região específicas?',
    options: [
      'On-Demand',
      'Spot Instances',
      'Reserved Instances (Standard)',
      'Dedicated Hosts',
    ],
    correct: 2,
    explanation: 'Reserved Instances Standard: commitment de 1 ou 3 anos, desconto até 72%, instância/região fixa. Savings Plans são mais flexíveis (66-72%). Spot é até 90% mas pode ser interrompido. Dedicated Hosts são para compliance/BYOL, preço varia.',
  },
  {
    question: '[Domínio 4] Qual plano de suporte AWS é o menor que inclui "24/7 suporte por telefone, chat e email"?',
    options: [
      'Basic',
      'Developer',
      'Business',
      'Enterprise',
    ],
    correct: 2,
    explanation: 'Business Support ($100/mês ou 10% do uso) é o menor plano com suporte 24/7 por todos os canais. Developer ($29/mês) só tem email em horário comercial. Enterprise On-Ramp e Enterprise também têm 24/7 mas são mais caros. Basic só tem documentação/fórum.',
  },
  {
    question: '[Domínio 4] Qual ferramenta estima o custo de uma arquitetura ANTES de provisioná-la?',
    options: [
      'AWS Cost Explorer',
      'AWS Budgets',
      'AWS Pricing Calculator',
      'AWS Cost and Usage Report',
    ],
    correct: 2,
    explanation: 'Pricing Calculator é pre-emptivo: você configura serviços, ele estima custo mensal. Útil para apresentações/aprovações. Cost Explorer analisa custos JÁ INCORRIDOS. Budgets alerta proativamente quando passar de threshold. CUR é dump detalhado em S3.',
  },
  {
    question: '[Domínio 1] Dos 6 pilares do Well-Architected Framework, qual foi o mais recente (2021) e foca em reduzir impacto ambiental?',
    options: [
      'Operational Excellence',
      'Reliability',
      'Cost Optimization',
      'Sustainability',
    ],
    correct: 3,
    explanation: 'Sustainability foi adicionado em dez/2021 na re:Invent, tornando-se o 6º pilar. Foca em minimizar CO2 das cargas: escolher Regions com energia limpa, usar ARM (Graviton), descomissionar recursos ociosos, serverless. Os outros 5 são: Op Excellence, Security, Reliability, Performance Efficiency, Cost Optimization.',
  },
  {
    question: '[Domínio 1] Qual das 7 estratégias de migração ("7 Rs") descreve reescrever uma aplicação monolítica para microservices cloud-native?',
    options: [
      'Rehost',
      'Replatform',
      'Refactor',
      'Repurchase',
    ],
    correct: 2,
    explanation: 'Refactor (ou Re-architect) significa reescrever a arquitetura para aproveitar o máximo dos benefícios cloud-native. Rehost é lift-and-shift (sem mudanças). Replatform é "lift-tinker-and-shift" (pequenas otimizações). Repurchase é abandonar e adotar SaaS.',
  },
  {
    question: '[Domínio 3] Em uma VPC, qual componente permite que instâncias em subnet privada acessem a internet para atualizações, mas bloqueia conexões inbound vindas da internet?',
    options: [
      'Internet Gateway',
      'NAT Gateway',
      'VPN Gateway',
      'VPC Endpoint',
    ],
    correct: 1,
    explanation: 'NAT Gateway (em subnet pública) permite instâncias privadas iniciarem conexões outbound para a internet (ex: apt update). Internet Gateway é bidirecional e exigiria IP público. VPN Gateway conecta VPC a redes on-prem. VPC Endpoint permite acesso privado a serviços AWS sem passar pela internet.',
  },
  {
    question: '[Domínio 1] Quais são as 6 perspectivas do AWS Cloud Adoption Framework (CAF)?',
    options: [
      'Strategy, Finance, Engineering, Operations, Compliance, Training',
      'Business, People, Governance, Platform, Security, Operations',
      'Plan, Build, Deploy, Monitor, Operate, Optimize',
      'Compute, Storage, Networking, Security, Database, Analytics',
    ],
    correct: 1,
    explanation: 'AWS CAF tem 6 perspectivas: Business, People, Governance, Platform, Security e Operations. Mnemônica: "Business People Govern Platforms with Security and Operations". Cada perspectiva agrupa capacidades específicas para adoção cloud bem-sucedida.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="simulado-practitioner"
      title="Simulado CLF-C02 Comentado"
      icon="🎯"
      xp={80}
      readTime={20}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="saa-c03-intro"
      nextTitle="SAA-C03: Da Teoria à Arquitetura Real"
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
        Este é o simulado final da trilha Practitioner. <strong>20 questões</strong> estilo exame CLF-C02, cobrindo os 4 domínios oficiais. Depois de responder, cada pergunta tem explicação profunda: não só o porquê da resposta certa, mas também por que as outras estão erradas. Meta: acertar pelo menos <strong>70% (14/20)</strong> — score mínimo aproximado do exame real.
      </p>

      <Section title="O que você vai encontrar" accent={ACCENT}>
        <ExamDomainBadge domain="Cobertura: todos os 4 domínios" weight="100%" color={ACCENT} />
        <p>A distribuição das 20 questões reflete os pesos oficiais do exame:</p>
        <ul className="flex flex-col gap-1 text-xs pl-4 mt-2">
          <li>• <strong>Domain 1 — Cloud Concepts</strong> (24%) → ~5 questões</li>
          <li>• <strong>Domain 2 — Security &amp; Compliance</strong> (30%) → ~6 questões</li>
          <li>• <strong>Domain 3 — Cloud Technology &amp; Services</strong> (34%) → ~6-7 questões</li>
          <li>• <strong>Domain 4 — Billing, Pricing &amp; Support</strong> (12%) → ~2-3 questões</li>
        </ul>
      </Section>

      <Callout tone="info">
        <strong>Como usar este simulado:</strong> responda com tempo limitado (~20 min para simular o ritmo). Anote as questões em que você hesitou, mesmo as que acertou. Depois, revise a explicação de TODAS as opções (certas e erradas) — é aí que você aprende os distratores mais comuns.
      </Callout>

      <Section title="Dicas de estratégia para o exame real" accent={ACCENT}>
        <ul className="flex flex-col gap-2 text-xs pl-4">
          <li>• <strong>Leia cada palavra.</strong> Enunciados como &ldquo;<em>mais econômico</em>&rdquo;, &ldquo;<em>maior performance</em>&rdquo;, &ldquo;<em>menor esforço operacional</em>&rdquo; mudam tudo. Muitas questões têm 2 respostas tecnicamente possíveis; a correta é a melhor <em>sob o critério pedido</em>.</li>
          <li>• <strong>Elimine distratores óbvios.</strong> Geralmente 2 opções são absurdas, sobram 2 candidatas. Entre elas, foque nas palavras-chave: &ldquo;multi-AZ&rdquo; (high availability), &ldquo;cheapest&rdquo; (Spot/Glacier), &ldquo;serverless&rdquo; (Lambda/Fargate/DynamoDB).</li>
          <li>• <strong>Desconfie de &ldquo;Sempre&rdquo; e &ldquo;Nunca&rdquo;.</strong> Questões com absolutos raramente são a resposta certa (exceto em shared responsibility, onde a AWS ou o cliente realmente tem responsabilidade clara).</li>
          <li>• <strong>Marcar para revisar.</strong> Se você travou em uma questão, marque e avance. Você vai ter mais clareza depois de ver 50 outras.</li>
          <li>• <strong>Confie no primeiro instinto.</strong> Estudos com questões de múltipla escolha mostram que trocar respostas sem novo insight costuma piorar o score.</li>
        </ul>
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas recorrentes no CLF-C02:</strong>
        <ul className="flex flex-col gap-1 mt-2">
          <li>• <InlineCode>KMS</InlineCode> ≠ <InlineCode>Secrets Manager</InlineCode> ≠ <InlineCode>ACM</InlineCode> — chaves, segredos, certificados</li>
          <li>• <InlineCode>Shield</InlineCode> (DDoS L3/4) ≠ <InlineCode>WAF</InlineCode> (OWASP L7)</li>
          <li>• <InlineCode>GuardDuty</InlineCode> (ameaças) ≠ <InlineCode>Inspector</InlineCode> (CVEs) ≠ <InlineCode>Macie</InlineCode> (PII em S3)</li>
          <li>• <InlineCode>CloudTrail</InlineCode> (API calls) ≠ <InlineCode>Config</InlineCode> (estado de recursos) ≠ <InlineCode>CloudWatch</InlineCode> (métricas/logs)</li>
          <li>• <InlineCode>EBS</InlineCode> (block, 1 AZ) ≠ <InlineCode>EFS</InlineCode> (file, multi-AZ, Linux) ≠ <InlineCode>S3</InlineCode> (object)</li>
          <li>• <InlineCode>Savings Plans</InlineCode> (flexível entre EC2/Lambda/Fargate) ≠ <InlineCode>Reserved Instances</InlineCode> (instância específica)</li>
          <li>• TAM dedicado = só <InlineCode>Enterprise Support</InlineCode></li>
        </ul>
      </Callout>

      <Section title="Antes de começar, revise mentalmente" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>✅ Os <strong>6 benefícios</strong> do cloud (CapEx→OpEx, economies of scale, stop guessing, speed, stop running DCs, go global)</li>
          <li>✅ Os <strong>6 pilares</strong> Well-Architected (Op Excellence, Security, Reliability, Performance, Cost, Sustainability)</li>
          <li>✅ Os <strong>7 Rs</strong> (Rehost, Replatform, Refactor, Repurchase, Retire, Retain, Relocate)</li>
          <li>✅ Os <strong>6 perspectivas</strong> do CAF (Business, People, Governance, Platform, Security, Operations)</li>
          <li>✅ Os <strong>4 planos de suporte</strong> (Basic / Developer $29 / Business $100 / Enterprise On-Ramp $5.5k / Enterprise $15k)</li>
          <li>✅ O princípio de <strong>responsabilidade compartilhada</strong> (AWS: security OF the cloud; Cliente: security IN the cloud)</li>
          <li>✅ Diferença entre <strong>Region, AZ, Edge Location</strong></li>
          <li>✅ Catálogo de <strong>segurança</strong> (IAM, KMS, GuardDuty, Shield, WAF, etc.)</li>
        </ul>
      </Section>

      <Callout tone="success">
        <strong>Pronto?</strong> Role para baixo e clique em "Começar quiz". Boa sorte — e lembre-se: errar aqui é de graça, errar no exame real custa $100 USD.
      </Callout>
    </div>
  );
}
