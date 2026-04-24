import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, NodeGraph, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('seguranca-aws-servicos');

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual serviço AWS gerencia chaves de criptografia permitindo rotação automática e auditoria completa via CloudTrail?',
    options: [
      'AWS Secrets Manager',
      'AWS KMS',
      'AWS CloudHSM',
      'AWS Certificate Manager',
    ],
    correct: 1,
    explanation: 'AWS KMS (Key Management Service) gerencia chaves de criptografia. Integra nativamente com 100+ serviços AWS, suporta rotação automática (anual), e audita todo uso via CloudTrail. Secrets Manager gerencia segredos (senhas, API keys), não chaves de criptografia em si.',
  },
  {
    question: 'Qual serviço detecta ameaças (mineração de cripto, comunicação com IP malicioso, escalação de privilégios) usando ML e threat intelligence?',
    options: [
      'AWS WAF',
      'Amazon GuardDuty',
      'AWS Config',
      'Amazon Macie',
    ],
    correct: 1,
    explanation: 'GuardDuty é o serviço de threat detection da AWS. Analisa logs CloudTrail, VPC Flow Logs e DNS Logs com ML + threat intelligence. Gera findings priorizados. Macie detecta dados sensíveis (PII) em S3, diferente.',
  },
  {
    question: 'Qual serviço protege aplicações web contra ataques OWASP Top 10 como SQL injection e XSS?',
    options: [
      'AWS Shield',
      'AWS WAF',
      'Amazon GuardDuty',
      'AWS Firewall Manager',
    ],
    correct: 1,
    explanation: 'AWS WAF (Web Application Firewall) inspeciona requisições HTTP na camada 7 e bloqueia ataques OWASP Top 10 (SQL injection, XSS, bots). Shield protege contra DDoS nas camadas 3/4. WAF integra com CloudFront, ALB e API Gateway.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="seguranca-aws-servicos"
      title="Segurança AWS: KMS, GuardDuty, Shield, WAF"
      icon="🛡️"
      xp={60}
      readTime={11}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="monitoramento-cloudwatch"
      nextTitle="Monitoramento: CloudWatch, CloudTrail, Config"
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
        A AWS tem um catálogo extenso de serviços de segurança, cada um com um propósito específico. O CLF-C02 não exige que você configure nenhum deles na mão — mas espera que você saiba <em>qual serviço resolve qual problema</em>. Confundir KMS com Secrets Manager, ou Shield com WAF, é erro comum em prova.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 2 — Security and Compliance" weight="30%" color={ACCENT} />
        <p>
          Segurança é 30% do CLF-C02 — o maior peso. Depois de IAM e do modelo de responsabilidade compartilhada, este é o terceiro pilar: conhecer o catálogo. Espera-se que você reconheça, para cada cenário descrito, qual serviço AWS se aplica.
        </p>
      </Section>

      <Section title="Mapa mental: o catálogo de segurança" accent={ACCENT}>
        <NodeGraph
          title="Catálogo de segurança AWS por função"
          accent={ACCENT}
          columns={[
            {
              label: '🔑 Identidade',
              nodes: [
                { label: 'IAM', sub: 'Identity Center · Cognito · Directory Service' },
              ],
            },
            {
              label: '🔒 Criptografia',
              nodes: [
                { label: 'KMS', sub: 'CloudHSM · Secrets Manager · ACM · Parameter Store' },
              ],
            },
            {
              label: '👀 Detecção',
              nodes: [
                { label: 'GuardDuty', sub: 'Inspector · Macie · Detective · Security Hub', tone: 'emphasis' },
              ],
            },
            {
              label: '🌐 Rede / App',
              nodes: [
                { label: 'Shield (DDoS)', sub: 'WAF · Network Firewall · Firewall Manager' },
              ],
            },
            {
              label: '📋 Compliance',
              nodes: [
                { label: 'Artifact', sub: 'Audit Manager · Compliance reports' },
              ],
            },
            {
              label: '📜 Governança',
              nodes: [
                { label: 'Config', sub: 'CloudTrail · Trusted Advisor · Control Tower · Organizations' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Criptografia: KMS, CloudHSM, ACM" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que faz', 'Uso típico']}
          rows={[
            ['AWS KMS', 'Gerencia chaves simétricas e assimétricas com HSM multi-tenant', 'Criptografar S3, EBS, RDS, Lambda env vars'],
            ['AWS CloudHSM', 'HSM dedicado single-tenant (FIPS 140-2 Level 3)', 'Compliance que exige HSM próprio, PKI'],
            ['ACM (Certificate Manager)', 'Emite e renova certificados SSL/TLS gratuitos', 'HTTPS em ALB, CloudFront, API Gateway'],
          ]}
        />
        <p><strong>Customer Master Keys (CMKs) no KMS — 3 tipos:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>AWS managed</InlineCode> — criada e rotacionada pela AWS (ex: aws/s3)</li>
          <li>• <InlineCode>Customer managed</InlineCode> — você cria, controla policies, rotação automática anual</li>
          <li>• <InlineCode>AWS owned</InlineCode> — invisível para você (usada internamente pelos serviços AWS)</li>
        </ul>
      </Section>

      <Section title="Secrets Manager vs Parameter Store" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Secrets Manager', 'Parameter Store (SSM)']}
          rows={[
            ['Preço', '$0,40/segredo/mês + API calls', 'Grátis (standard) / $0,05/10k API calls (advanced)'],
            ['Rotação automática', 'Sim (com Lambda rotator)', 'Não'],
            ['Integração RDS/Redshift', 'Nativa', 'Manual'],
            ['Tamanho max', '64 KB', '4 KB (standard) / 8 KB (advanced)'],
            ['Uso típico', 'Senhas DB com rotação, API keys críticas', 'Config values, feature flags, endpoints'],
          ]}
        />
      </Section>

      <Section title="Detecção: GuardDuty, Inspector, Macie" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que detecta', 'Fontes de dados']}
          rows={[
            ['GuardDuty', 'Ameaças ativas (mineração cripto, malware, recon)', 'CloudTrail, VPC Flow Logs, DNS Logs, EKS audit'],
            ['Inspector', 'Vulnerabilidades (CVEs) em EC2 e containers (ECR)', 'Agent + scan automatizado'],
            ['Macie', 'Dados sensíveis (PII, PHI) em S3', 'Scan ML do conteúdo dos objetos'],
            ['Detective', 'Investigação de ameaça (root cause)', 'Consolida GuardDuty, CloudTrail, VPC Flow'],
          ]}
        />
      </Section>

      <Section title="Proteção: Shield, WAF, Network Firewall" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Camada', 'Protege contra']}
          rows={[
            ['Shield Standard', 'L3/L4', 'DDoS volumétrico (grátis, automático)'],
            ['Shield Advanced', 'L3/L4/L7', 'DDoS sofisticado + SLA + equipe DRT ($3k/mês)'],
            ['AWS WAF', 'L7 (HTTP/S)', 'OWASP Top 10, SQL injection, XSS, bots'],
            ['Network Firewall', 'L3/L4/L7 em VPC', 'Firewall stateful/stateless na borda da VPC'],
            ['Firewall Manager', 'Meta', 'Administra WAF/Shield/Network Firewall em Organization'],
          ]}
        />
      </Section>

      <Section title="Governança e compliance" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que faz']}
          rows={[
            ['AWS CloudTrail', 'Audita chamadas de API (quem, quando, de onde, o quê)'],
            ['AWS Config', 'Avalia configurações de recursos vs regras (drift, compliance)'],
            ['AWS Organizations', 'Multi-conta com Service Control Policies (SCPs)'],
            ['AWS Control Tower', 'Landing zone automatizada com guardrails'],
            ['AWS Trusted Advisor', 'Recomendações em 5 áreas (custo, segurança, perf, HA, limites)'],
            ['AWS Security Hub', 'Dashboard único agregando findings de múltiplos serviços'],
            ['AWS Artifact', 'Portal de compliance reports (SOC, ISO, PCI)'],
            ['AWS Audit Manager', 'Automatiza coleta de evidências para auditorias'],
            ['Amazon Detective', 'Investigação de incidentes (root cause)'],
          ]}
        />
      </Section>

      <Section title="Identidades além do IAM" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Para quem']}
          rows={[
            ['Amazon Cognito', 'Usuários finais de aplicações (login social, MFA, JWT)'],
            ['AWS Directory Service', 'Active Directory gerenciado / AD Connector'],
            ['IAM Identity Center', 'SSO corporativo multi-account (antes AWS SSO)'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Armazenar senha de RDS com rotação automática a cada 30 dias"
          winner="AWS Secrets Manager"
          winnerColor={ACCENT}
          why="Rotação automática via Lambda integrada com RDS, integração nativa, auditoria via CloudTrail."
          alternatives={[
            { name: 'Parameter Store', note: 'Mais barato mas sem rotação automática nativa' },
          ]}
        />
        <DecisionBox
          scenario="E-commerce sofreu ataque DDoS de 500 Gbps"
          winner="AWS Shield Advanced + CloudFront + WAF"
          winnerColor={ACCENT}
          why="Shield Advanced tem mitigação dedicada para ataques grandes, acesso 24/7 à DRT (DDoS Response Team), cobertura de custos de scaling emergencial. Combinado com WAF para camada 7."
        />
        <DecisionBox
          scenario="Compliance LGPD — identificar CPFs armazenados indevidamente em buckets S3"
          winner="Amazon Macie"
          winnerColor={ACCENT}
          why="Macie usa ML para identificar PII/PHI em objetos S3. Gera alertas e relatórios. Nativamente integrado com S3."
        />
        <DecisionBox
          scenario="Usuários finais de um app mobile precisam fazer login social (Google, Apple)"
          winner="Amazon Cognito User Pools"
          winnerColor={ACCENT}
          why="Cognito é purpose-built para identidades de aplicação. Suporta login social, MFA, JWT tokens. IAM é para credenciais AWS, não para usuários finais."
        />
        <DecisionBox
          scenario="Auditoria exige que toda chave de criptografia seja gerada em HSM dedicado certificado FIPS 140-2 Level 3"
          winner="AWS CloudHSM"
          winnerColor={ACCENT}
          why="HSM single-tenant exclusivamente seu. KMS é multi-tenant (compartilhado com outros clientes). Use CloudHSM quando a compliance exige controle absoluto do material criptográfico."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha clássica:</strong> Shield ≠ WAF. Shield protege contra DDoS (volume, protocolo). WAF protege contra ataques de aplicação (SQL injection, XSS). Shield Standard é grátis em todas as contas; Shield Advanced é $3k/mês com benefícios extra.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual serviço permite baixar relatórios SOC 2 da AWS?"
          a={<><strong>AWS Artifact</strong>. Portal self-service de compliance docs (SOC 1/2/3, ISO 27001, PCI-DSS AOC, HIPAA BAA). Alguns exigem clique em NDA antes do download.</>}
        />
        <QAItem
          q="Diferença entre CloudTrail e Config?"
          a={<><strong>CloudTrail</strong> = API calls ("quem fez o quê"). <strong>Config</strong> = estado dos recursos e mudanças ("o que mudou em 15/abr às 14:32?"). Use os dois em combinação.</>}
        />
        <QAItem
          q="Serviço que consolida findings de GuardDuty, Inspector, Macie em um único dashboard?"
          a={<><strong>AWS Security Hub</strong>. Agrega, prioriza e correlaciona findings. Também avalia postura contra frameworks (CIS AWS Benchmark, PCI-DSS).</>}
        />
        <QAItem
          q="Trusted Advisor — quais são as 5 categorias de checks?"
          a={<>Cost Optimization, Security, Fault Tolerance, Performance, Service Limits. Planos Basic/Developer recebem subset; Business/Enterprise recebem todos.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> KMS (chaves) ≠ Secrets Manager (senhas/tokens) ≠ ACM (certificados TLS). GuardDuty (threat detection) ≠ Inspector (CVEs) ≠ Macie (PII em S3). Shield (DDoS L3/L4) ≠ WAF (L7 OWASP). CloudTrail (API audit) + Config (state drift) + Security Hub (dashboard). Organizations + Control Tower = governance multi-account. Artifact = compliance reports. Decore o "qual serviço resolve X" — é o padrão das questões.
      </Callout>
    </div>
  );
}
