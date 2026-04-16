import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, StackFlow, LayerStack, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'IAM Avançado: Policies JSON, STS e Organizations — FFV Academy',
  description: 'Policies JSON em profundidade, STS AssumeRole, cross-account access, AWS Organizations, SCPs e Identity Center para o SAA-C03.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa precisa permitir que uma Lambda na conta A chame uma função Lambda em outra conta B. Qual combinação é a correta?',
    options: [
      'Lambda A usa access keys IAM User da conta B',
      'Lambda A assume uma IAM Role na conta B via STS AssumeRole (trust policy permite conta A)',
      'Cria um IAM User compartilhado entre as contas',
      'Usa resource-based policy no IAM User',
    ],
    correct: 1,
    explanation: 'Cross-account access padrão: conta B cria um IAM Role cuja trust policy permite a conta A (ou a Role específica da Lambda A) fazer sts:AssumeRole. Lambda A então chama STS, recebe credenciais temporárias, e usa para invocar a Lambda B. Access keys em Lambdas é anti-pattern — viola least-privilege e é não-rotatable.',
  },
  {
    question: 'Qual elemento JSON de uma IAM Policy define a condição sob a qual a permissão se aplica (ex: só se MFA estiver presente)?',
    options: [
      'Resource',
      'Action',
      'Principal',
      'Condition',
    ],
    correct: 3,
    explanation: 'Condition permite restringir a permissão: aws:MultiFactorAuthPresent, aws:SourceIp, aws:RequestedRegion, aws:PrincipalTag, s3:x-amz-server-side-encryption, etc. É o elemento mais poderoso para construir policies precisas no SAA.',
  },
  {
    question: 'Em AWS Organizations, o que acontece se uma SCP nega uma ação mas a IAM policy do usuário permite?',
    options: [
      'A ação é permitida (IAM policy prevalece)',
      'A ação é negada (SCPs são o teto — se negar, ninguém passa)',
      'Depende do flag explicit-allow',
      'A política mais recente vence',
    ],
    correct: 1,
    explanation: 'SCPs funcionam como guardrails: definem o TETO de permissões de uma conta/OU. Mesmo que o IAM User/Role tenha permissão explícita, se a SCP negar, a ação é bloqueada. SCPs não CONCEDEM permissões — só restringem. É usada para compliance obrigatório ("ninguém nesta OU pode criar buckets S3 públicos").',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="iam-avancado-organizations"
      title="IAM Avançado: Policies JSON, STS e Organizations"
      icon="🔑"
      xp={75}
      readTime={14}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="vpc-avancado"
      nextTitle="VPC em Profundidade: NAT, Peering e Transit Gateway"
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
        No CLF-C02 você aprendeu o que é IAM. No SAA-C03, espera-se que você <em>leia uma policy JSON</em> e responda se ela é restritiva demais, permissiva demais, ou incompleta. Também espera-se entender <strong>cross-account access</strong>, <strong>STS</strong>, <strong>Organizations</strong> e <strong>Identity Center</strong> — o tripé de identidade em ambientes multi-conta.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 1 — Design Secure Architectures" weight="30%" color={ACCENT} />
        <p>
          Identidade é o maior bloco do domínio mais pesado. Espere pelo menos 8–10 questões envolvendo: leitura de policies JSON, cross-account via Role Assumption, SCPs em Organizations, trust policies, least privilege.
        </p>
      </Section>

      <Section title="Anatomia de uma IAM Policy JSON" accent={ACCENT}>
        <CodeBlock lang="json">{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadOnly",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/DataReader" },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-data-bucket",
        "arn:aws:s3:::my-data-bucket/*"
      ],
      "Condition": {
        "Bool": { "aws:MultiFactorAuthPresent": "true" },
        "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }
      }
    }
  ]
}`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'Função']}
          rows={[
            ['Version', 'Sempre "2012-10-17" (versão mais recente da policy language)'],
            ['Sid', 'Statement ID — label opcional para identificar'],
            ['Effect', '"Allow" ou "Deny"'],
            ['Principal', 'QUEM pode fazer a ação (obrigatório em resource policies; proibido em identity policies)'],
            ['Action', 'O QUE pode fazer (s3:GetObject, ec2:*, iam:PassRole)'],
            ['Resource', 'EM QUAIS recursos (ARN específico, wildcard, array)'],
            ['Condition', 'SOB QUAIS condições (MFA, IP, região, tag, etc.)'],
          ]}
        />
      </Section>

      <Section title="Identity-based vs Resource-based policies" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Identity-based', 'Resource-based']}
          rows={[
            ['Attached a', 'User, Group, Role', 'Recurso (S3 bucket, SQS queue, SNS topic, KMS key, Lambda)'],
            ['Define', 'O que esta identidade pode fazer', 'Quem pode usar este recurso'],
            ['Principal element', '❌ Proibido', '✅ Obrigatório'],
            ['Cross-account', 'Não concede acesso de outra conta', 'Pode conceder (ex: S3 bucket policy)'],
            ['Uso típico', 'Policies padrão, permissões de roles', 'Bucket policies, KMS keys, SQS cross-account'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra de avaliação:</strong> uma ação é permitida se há Allow em qualquer policy aplicável (identity OU resource) E não há Deny explícito. Qualquer Deny explícito em qualquer policy bloqueia tudo.
        </Callout>
      </Section>

      <Section title="Ordem de avaliação — a árvore de decisão IAM" accent={ACCENT}>
        <StackFlow
          title="Árvore de decisão IAM: a requisição é permitida?"
          accent={ACCENT}
          items={[
            { icon: '🛑', label: 'Deny explícito?', sub: 'qualquer policy aplicável', detail: 'Se qualquer Deny explícito bater → NEGA imediatamente. Deny sempre vence.' },
            { icon: '🏛️', label: 'SCP (Org)', sub: 'guardrail da Organization', detail: 'Se SCP da conta não permitir a ação → NEGA, mesmo com Allow em IAM.' },
            { icon: '👤', label: 'Allow em identity OU resource?', sub: 'policy union', detail: 'Precisa existir Allow em pelo menos uma policy aplicável. Sem Allow → implicit deny.' },
            { icon: '🧱', label: 'Permission boundary', sub: 'se houver', detail: 'Boundary define o TETO da identidade. Boundary deve permitir — senão NEGA.' },
            { icon: '✅', label: 'PERMITIDO', sub: 'todas as camadas passaram', detail: 'Sem Deny, SCP permitindo, Allow presente, boundary permitindo → ação executa.' },
          ]}
        />
      </Section>

      <Section title="STS — Security Token Service" accent={ACCENT}>
        <p>
          STS emite <strong>credenciais temporárias</strong> (Access Key ID + Secret + Session Token) para IAM Roles. É o mecanismo por trás de cross-account, federated login e EC2 Instance Profiles.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['API STS', 'Uso']}
          rows={[
            ['AssumeRole', 'Role → Role (cross-account, escalação de privilégio)'],
            ['AssumeRoleWithSAML', 'Identity Provider SAML 2.0 (AD FS, Okta enterprise)'],
            ['AssumeRoleWithWebIdentity', 'OpenID Connect (Google, Facebook, Cognito)'],
            ['GetSessionToken', 'Gerar credenciais temporárias para IAM User (geralmente com MFA)'],
            ['GetFederationToken', 'Broker emite credenciais para app customizado'],
            ['DecodeAuthorizationMessage', 'Decodificar mensagens de negação encriptadas'],
          ]}
        />
        <Callout tone="info">
          <strong>Duração:</strong> tokens temporários duram de 15 min a 12 horas (configurável por role). Quando expiram, você re-assume. Isso é mais seguro que IAM User access keys (perpetuais até rotação manual).
        </Callout>
      </Section>

      <Section title="Cross-Account Access — o pattern mais cobrado" accent={ACCENT}>
        <StackFlow
          title="Cross-account via AssumeRole"
          accent={ACCENT}
          items={[
            { icon: '👷', label: 'Conta A: Lambda', sub: 'precisa ler bucket de B', detail: 'Role de execução de Lambda tem sts:AssumeRole para a Role de B.' },
            { icon: '🔄', label: 'sts:AssumeRole', sub: 'A → B', detail: 'STS valida Trust Policy da Role B (Principal = A). Se bate, emite credenciais temporárias (15min–12h).' },
            { icon: '🎫', label: 'Credenciais temporárias', sub: 'AccessKey + Secret + SessionToken', detail: 'Lambda recebe o token e o usa como qualquer credencial AWS.' },
            { icon: '🪣', label: 'S3 bucket de B', sub: 's3:GetObject', detail: 'Permission policy da Role B autoriza a ação. Lambda opera em bucket de outra conta.' },
          ]}
        />
        <p><strong>Passos:</strong></p>
        <ol className="flex flex-col gap-1 text-xs pl-6 list-decimal">
          <li>Na conta B: crie uma IAM Role &ldquo;DataAccess&rdquo; com permission policy (ex: S3 GetObject).</li>
          <li>Trust policy da Role: <InlineCode>Principal: arn:aws:iam::111122223333:root</InlineCode> (conta A inteira) ou ARN específico da Role/User de A.</li>
          <li>Na conta A: Role/User precisa ter permissão <InlineCode>sts:AssumeRole</InlineCode> para o ARN da Role da conta B.</li>
          <li>Em runtime, conta A chama <InlineCode>sts:AssumeRole</InlineCode>, recebe credenciais temporárias, usa para operar em B.</li>
        </ol>
        <CodeBlock lang="json">{`// Trust policy em Conta B — Role "DataAccess"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::111122223333:role/LambdaRole" },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": { "sts:ExternalId": "unique-secret-id" }
    }
  }]
}`}</CodeBlock>
        <Callout tone="warn">
          <strong>ExternalId:</strong> quando um 3rd party (ex: SaaS de monitoramento) assume sua role, use ExternalId para evitar &ldquo;confused deputy&rdquo;. O 3rd party fornece um ID único que você coloca na trust policy — sem ele, o AssumeRole falha.
        </Callout>
      </Section>

      <Section title="AWS Organizations" accent={ACCENT}>
        <LayerStack
          title="Estrutura de AWS Organizations"
          accent={ACCENT}
          layers={[
            { label: 'ROOT', content: 'Management Account', note: 'Billing consolidado · dona da Org', tone: 'base' },
            { label: 'OU', content: 'Prod · Dev · Security', note: 'Organizational Units agrupam contas por função', tone: 'default' },
            { label: 'ACCOUNTS', content: 'Prod: Acc1 · Acc2  |  Dev: Acc3 · Acc4  |  Security: LogArchive · AuditAccount', note: 'SCPs herdam da OU para as contas-filhas', tone: 'writable' },
          ]}
        />
        <p><strong>Componentes:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Management Account</strong> — dona da Organization, paga a fatura consolidada</li>
          <li>• <strong>Member Accounts</strong> — contas invitadas ou criadas dentro</li>
          <li>• <strong>Organizational Units (OUs)</strong> — agrupam contas por função (Prod, Dev, Security)</li>
          <li>• <strong>Service Control Policies (SCPs)</strong> — guardrails aplicados a OU/conta</li>
          <li>• <strong>Consolidated Billing</strong> — fatura única, soma de volume para descontos</li>
          <li>• <strong>RI/Savings Plans sharing</strong> — RIs compradas em uma conta beneficiam outras</li>
        </ul>
      </Section>

      <Section title="Service Control Policies (SCPs)" accent={ACCENT}>
        <p>
          SCPs definem o <strong>teto</strong> de permissões de uma conta. Não <em>concedem</em> nada — apenas restringem o que IAM permissions da conta podem fazer.
        </p>
        <CodeBlock lang="json">{`// SCP: impedir que qualquer conta na OU saia de us-east-1 e sa-east-1
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyOtherRegions",
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {
        "aws:RequestedRegion": ["us-east-1", "sa-east-1"]
      }
    }
  }]
}`}</CodeBlock>
        <Callout tone="danger">
          <strong>Atenção:</strong> SCPs NÃO se aplicam à Management Account — ela é imune por design. Nunca rode workloads de produção lá.
        </Callout>
      </Section>

      <Section title="IAM Identity Center (ex-AWS SSO)" accent={ACCENT}>
        <p>
          Single Sign-On centralizado para múltiplas contas AWS. Usuários autenticam uma vez (via AD, Okta ou Identity Store interno) e recebem um portal com acesso pré-configurado a contas/roles.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Função']}
          rows={[
            ['Identity Source', 'AWS nativo, Active Directory (AD Connector ou Managed AD), ou external IdP (Okta, Azure AD)'],
            ['Permission Set', 'Coleção de policies que vira uma Role IAM em cada conta'],
            ['Account Assignment', 'Usuário/grupo + Permission Set + Conta'],
            ['User Portal', 'URL única (d-xxx.awsapps.com/start) — login e lista de contas/roles'],
          ]}
        />
      </Section>

      <Section title="Identity Federation" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Protocolo', 'Uso']}
          rows={[
            ['Enterprise (SAML)', 'SAML 2.0', 'AD FS, corporate IdP'],
            ['Web Identity', 'OIDC (OpenID Connect)', 'Google, Facebook, Apple (via Cognito)'],
            ['Amazon Cognito', 'User pools + Identity pools', 'Usuários finais de apps mobile/web'],
            ['Custom broker', 'STS GetFederationToken', 'Legacy apps com lógica customizada'],
          ]}
        />
      </Section>

      <Section title="Permission Boundaries" accent={ACCENT}>
        <p>
          Permission Boundary é uma policy anexada a uma IAM Role/User que define o <strong>máximo</strong> de permissões que ela pode ter, independente do que suas policies conceda. Usada em delegated administration — o admin pode criar Roles, mas elas nunca passam do limite do boundary.
        </p>
        <Callout tone="info">
          <strong>Regra:</strong> permissão efetiva = <em>policies</em> ∩ <em>permission boundary</em> ∩ <em>SCPs</em>. Qualquer um bloqueia, bloqueia tudo.
        </Callout>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Empresa tem 20 contas AWS e quer política única proibindo criação de recursos fora das regiões BR"
          winner="Organizations + SCP com aws:RequestedRegion"
          winnerColor={ACCENT}
          why="SCP aplicada na OU cobre todas as contas automaticamente. Tentativa de criar recurso em outra região falha antes mesmo de chegar no IAM. Usar IAM policies em cada conta seria impossível de manter."
        />
        <DecisionBox
          scenario="Lambda em Conta A precisa ler objeto em S3 da Conta B"
          winner="Opção 1: Bucket Policy (B) permite ARN da Lambda Role (A). Opção 2: IAM Role em B com trust da Lambda Role (A)."
          winnerColor={ACCENT}
          why="Opção 1 é mais simples (só modificar bucket policy). Opção 2 é melhor se Lambda precisa de várias actions em B ou cross-region. SAA-C03 testa ambos — leia o cenário."
        />
        <DecisionBox
          scenario="Dev team quer criar seus próprios IAM Roles, mas você quer garantir que nenhuma role criada tenha mais que S3:* e DynamoDB:*"
          winner="Permission Boundary obrigatório para todas as Roles criadas pelo team"
          winnerColor={ACCENT}
          why="Você concede iam:CreateRole CONDICIONADO a um boundary específico. Mesmo se o dev tentar attach AdministratorAccess, o boundary limita as permissões efetivas."
        />
        <DecisionBox
          scenario="Empresa usa Okta como IdP. Quer que cada funcionário acesse a AWS sem ter IAM User"
          winner="IAM Identity Center + Okta como external Identity Source"
          winnerColor={ACCENT}
          why="Sem credenciais permanentes. Usuários vêm do Okta (MFA, onboarding/offboarding automático). Identity Center mapeia grupos Okta em Permission Sets nas contas AWS."
        />
      </Section>

      <Section title="Exemplos de CLI" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Assumir role cross-account
aws sts assume-role \\
  --role-arn arn:aws:iam::444455556666:role/DataAccess \\
  --role-session-name my-session \\
  --external-id unique-secret-id

# Listar OUs e contas de uma Organization
aws organizations list-organizational-units-for-parent \\
  --parent-id r-examplerootid
aws organizations list-accounts

# Attach SCP a uma OU
aws organizations attach-policy \\
  --policy-id p-examplepolicy \\
  --target-id ou-exampleou

# Simular avaliação de IAM policy
aws iam simulate-principal-policy \\
  --policy-source-arn arn:aws:iam::111122223333:role/MyRole \\
  --action-names s3:GetObject \\
  --resource-arns arn:aws:s3:::my-bucket/file.txt`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas clássicas do SAA-C03:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• <strong>Principal</strong> só existe em resource-based policies (bucket policy, KMS key policy). Em identity policies é proibido.</li>
          <li>• <strong>Deny explícito vence qualquer Allow</strong> — sempre.</li>
          <li>• <strong>SCP não concede</strong> — só restringe.</li>
          <li>• <strong>IAM Instance Profile</strong> é o container que injeta Role credentials em EC2 — não é a Role em si.</li>
          <li>• <strong>PassRole</strong>: dar permissão para alguém criar um serviço que USE uma Role exige <InlineCode>iam:PassRole</InlineCode>.</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como garantir que um recurso só é acessível se MFA estiver ativo?"
          a={<>Adicionar Condition <InlineCode>aws:MultiFactorAuthPresent: true</InlineCode> na policy (ou Deny explícito se false). Muitas empresas restringem ações sensíveis (ex: deletar RDS, criar IAM User) apenas com MFA.</>}
        />
        <QAItem
          q="Qual a diferença entre IAM Role e IAM User?"
          a={<>User = identidade permanente com credenciais de longo prazo (access keys, senha). Role = identidade <strong>assumível</strong> que emite credenciais temporárias via STS. Best practice moderna: use Roles sempre; Users só quando realmente necessário (ex: integração externa legada).</>}
        />
        <QAItem
          q="Como proteger a Management Account de uma Organization?"
          a={<>MFA em root, bloquear/excluir access keys do root, não rodar workloads lá, usar CloudTrail + GuardDuty com alertas, limitar IAM Users, delegar administration para conta separada (delegated admin for services).</>}
        />
        <QAItem
          q="Qual a ordem de avaliação quando uma requisição envolve S3 de outra conta?"
          a={<>Deny explícito (em qualquer policy) → SCP da Org → Resource policy (bucket policy) → Identity policy (IAM) → Permission boundary → Session policy. Qualquer Deny bloqueia. Para Allow, precisa ter Allow em pelo menos uma das policies aplicáveis.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Policy JSON tem 7 elementos-chave (Version, Sid, Effect, Principal, Action, Resource, Condition). Identity vs Resource policies diferem em onde ficam anexadas e se precisam de Principal. STS emite credenciais temporárias (AssumeRole é a estrela). Organizations + SCPs = guardrails multi-conta. Identity Center = SSO corporativo. Permission Boundary = teto para roles delegadas. Cross-account = AssumeRole ou resource-based policy com Principal.
      </Callout>
    </div>
  );
}
