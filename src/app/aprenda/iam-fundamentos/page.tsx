import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, NodeGraph, StackFlow } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'AWS IAM: Identidade, Grupos, Roles e Policies — FFV Academy',
  description: 'Users, groups, roles, policies JSON, MFA, principle of least privilege. O sistema que controla QUEM pode fazer O QUÊ em TODA a AWS.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma EC2 precisa ler dados de um bucket S3. Qual é a forma CORRETA e recomendada de dar essa permissão?',
    options: [
      'Armazenar access keys da AWS em um arquivo .env dentro da EC2',
      'Criar um IAM User e colocar as credenciais como variável de ambiente',
      'Anexar uma IAM Role à EC2 com policy de leitura ao bucket',
      'Abrir o bucket como público',
    ],
    correct: 2,
    explanation: 'IAM Roles são a forma recomendada para serviços AWS (EC2, Lambda, ECS) acessarem outros serviços AWS. Sem credenciais longevas, rotação automática de credenciais temporárias pelo STS, menos risco de vazamento.',
  },
  {
    question: 'Qual dos itens abaixo é uma boa prática de IAM defendida pela AWS?',
    options: [
      'Usar a conta root para tarefas do dia a dia',
      'Compartilhar access keys entre membros do time',
      'Habilitar MFA especialmente na conta root e em usuários privilegiados',
      'Dar permissão de AdministratorAccess para todos os desenvolvedores',
    ],
    correct: 2,
    explanation: 'MFA é obrigatório em qualquer prática defensiva. A conta root deve ter MFA habilitada imediatamente e só ser usada para as ~6 tarefas que exigem root (fechar conta, alterar método de pagamento, mudar suporte, etc.). Princípio do menor privilégio: dar só o necessário.',
  },
  {
    question: 'Um desenvolvedor precisa acessar a AWS temporariamente para debugar um incidente em outra conta AWS. Qual mecanismo é o correto?',
    options: [
      'Criar um IAM User permanente na outra conta',
      'Usar AWS STS para assumir uma Role com sessão temporária (ex: 1h)',
      'Copiar as access keys da outra conta',
      'Desabilitar IAM temporariamente',
    ],
    correct: 1,
    explanation: 'AWS STS (Security Token Service) emite credenciais temporárias ao "assumir uma Role". Ideal para acesso cross-account, federated identity (SAML/OIDC), ou acesso temporário a recursos. Nunca criar Users permanentes para casos temporários.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="iam-fundamentos"
      title="IAM: Identidade, Grupos, Roles e Policies"
      icon="🔐"
      xp={60}
      readTime={12}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="compute-ec2-lambda"
      nextTitle="Compute: EC2, Lambda e Containers"
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
        IAM (Identity and Access Management) é o núcleo de tudo na AWS. Cada chamada de API — criar EC2, ler S3, modificar DNS — passa por uma verificação IAM. Entender IAM bem é a diferença entre uma arquitetura segura e um vazamento de dados que custa milhões. É também um dos tópicos mais cobrados do CLF-C02.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 2 — Security and Compliance" weight="30%" color={ACCENT} />
        <p>
          IAM é o maior sub-tópico do domínio 2. Espera-se que você saiba: diferença entre Users, Groups e Roles; como funciona uma Policy (JSON: Effect/Action/Resource); quando usar Roles vs Users; boas práticas (MFA, root protection, least privilege); e o papel do STS em credenciais temporárias.
        </p>
      </Section>

      <Section title="A hierarquia IAM" accent={ACCENT}>
        <StackFlow
          title="Identidades, permissões e o fluxo de avaliação"
          accent={ACCENT}
          items={[
            {
              icon: '👑',
              label: 'Root user',
              sub: 'dono absoluto',
              detail: 'Criado com a conta, acessa tudo. Nunca usar no dia-a-dia — habilita MFA e guarda as credenciais num cofre.',
              connector: 'cria as identidades abaixo',
            },
            {
              icon: '👤',
              label: 'IAM User · Group · Role',
              sub: '3 identidades',
              detail: 'User = pessoa permanente · Group = coleção lógica de Users · Role = identidade assumida temporariamente (por serviço ou acesso cross-account).',
              connector: 'recebem permissões via',
            },
            {
              icon: '📜',
              label: 'Policy (JSON)',
              sub: 'Allow/Deny',
              detail: 'Effect + Action + Resource (+ Condition opcional). Anexada a User, Group ou Role — é a única coisa que concede permissão na AWS.',
            },
          ]}
        />
      </Section>

      <Section title="Os 4 componentes centrais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'O que é', 'Uso típico']}
          rows={[
            ['IAM User', 'Identidade permanente (nome + credenciais)', 'Funcionário acessando o console ou CLI'],
            ['IAM Group', 'Coleção lógica de Users', 'Agrupar permissões por função: "Devs", "Ops", "FinOps"'],
            ['IAM Role', 'Identidade assumida temporariamente', 'Serviço AWS (EC2→S3) ou acesso cross-account'],
            ['IAM Policy', 'Documento JSON definindo permissões', 'Anexada a Users/Groups/Roles para conceder Allow/Deny'],
          ]}
        />
      </Section>

      <Section title="Anatomia de uma Policy JSON" accent={ACCENT}>
        <p>
          Toda permissão IAM é expressa como um documento JSON. Os campos essenciais:
        </p>
        <CodeBlock lang="json">{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermitirLeituraS3Bucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::meu-bucket",
        "arn:aws:s3:::meu-bucket/*"
      ],
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}`}</CodeBlock>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Version</InlineCode>: sempre <InlineCode>2012-10-17</InlineCode> (versão da linguagem)</li>
          <li>• <InlineCode>Effect</InlineCode>: <InlineCode>Allow</InlineCode> ou <InlineCode>Deny</InlineCode></li>
          <li>• <InlineCode>Action</InlineCode>: operação da API — formato <InlineCode>serviço:Operação</InlineCode></li>
          <li>• <InlineCode>Resource</InlineCode>: ARN do recurso (ou <InlineCode>*</InlineCode> para "todos")</li>
          <li>• <InlineCode>Condition</InlineCode>: opcional — restringe quando a permissão aplica (IP, data, tag, MFA)</li>
        </ul>
      </Section>

      <Section title="Regra de ouro: Explicit Deny &gt; Explicit Allow &gt; Default Deny" accent={ACCENT}>
        <StackFlow
          title="Fluxo de avaliação IAM"
          accent={ACCENT}
          items={[
            {
              icon: '📡',
              label: 'Request API',
              sub: 'entrada',
              detail: 'Qualquer chamada (console, CLI, SDK) dispara a avaliação do IAM antes de o serviço executar a ação.',
              connector: '1º teste',
            },
            {
              icon: '⛔',
              label: 'Explicit Deny?',
              sub: 'short-circuit',
              detail: 'Se QUALQUER policy aplicável tem um Deny explícito → bloqueia imediatamente e para aqui. Deny sempre vence.',
              color: '#f78166',
              connector: 'se não, segue',
            },
            {
              icon: '✅',
              label: 'Explicit Allow?',
              sub: 'concede',
              detail: 'Pelo menos uma policy precisa ter Allow para a combinação Action + Resource (respeitando Condition, se houver).',
              color: '#3fb950',
              connector: 'se nenhum Allow bater',
            },
            {
              icon: '🔒',
              label: 'Default Deny',
              sub: 'regra silenciosa',
              detail: 'Toda chamada começa negada. Sem Allow explícito, a AWS recusa — mesmo que não exista Deny algum.',
              color: 'var(--ffv-muted)',
            },
          ]}
        />
        <p>
          Toda chamada começa <strong>negada por padrão</strong>. Você precisa de pelo menos um <InlineCode>Allow</InlineCode> em alguma policy aplicável. Mas um <InlineCode>Deny</InlineCode> explícito em QUALQUER policy sempre vence — é uma ferramenta poderosa para bloquear ações mesmo que outra policy permita.
        </p>
      </Section>

      <Section title="Tipos de Policies" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Descrição', 'Exemplo']}
          rows={[
            ['AWS Managed', 'Criada e mantida pela AWS', 'AmazonS3ReadOnlyAccess, AdministratorAccess'],
            ['Customer Managed', 'Você cria, reutiliza entre entidades', 'ReadOnlyCompanyBuckets'],
            ['Inline', 'Embutida em um único User/Group/Role', 'Ad hoc, não reutilizável'],
            ['Identity-based', 'Anexada a User/Group/Role (quem pode fazer o quê)', 'A maioria das policies'],
            ['Resource-based', 'Anexada a um recurso (quem pode acessar ele)', 'Bucket policy do S3, policy do KMS'],
            ['Permission boundary', 'Teto máximo de permissões para um User/Role', 'Usada por times FinOps/Security'],
            ['SCP (Service Control Policy)', 'Limite em nível de Organization', 'Bloqueia ações em todas as contas-filhas'],
          ]}
        />
      </Section>

      <Section title="User vs Role — a diferença que mais cai" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'IAM User', 'IAM Role']}
          rows={[
            ['Duração', 'Permanente', 'Temporária (sessão com tempo limite)'],
            ['Credenciais', 'Access key + secret longevas', 'Tokens STS renovados automaticamente'],
            ['Para quem', 'Pessoa específica', 'Serviço, aplicação ou usuário federado'],
            ['Risco', 'Chave vazada = acesso indefinido', 'Token vazado = válido por minutos/horas'],
            ['Boa prática', 'Minimizar (preferir IAM Identity Center)', 'Preferir sempre que possível'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra mental:</strong> toda vez que um serviço AWS precisa acessar outro serviço AWS, use Role. Toda vez que uma pessoa precisa acesso temporário ou federado, use Role via STS. Use Users apenas para humanos com acesso contínuo (e mesmo assim, IAM Identity Center é melhor).
        </Callout>
      </Section>

      <Section title="IAM Identity Center (antes AWS SSO)" accent={ACCENT}>
        <p>
          A forma moderna de gerenciar identidades humanas na AWS. Em vez de criar IAM Users um por um, você conecta seu provedor de identidade (Google Workspace, Azure AD, Okta) ao IAM Identity Center, que:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Faz login único (SSO) entre todas as contas da sua Organization</li>
          <li>• Gerencia permissões por conjuntos de permissões (<em>permission sets</em>)</li>
          <li>• Elimina a necessidade de IAM Users permanentes em cada conta</li>
          <li>• Revoga acesso instantaneamente quando alguém sai da empresa (só desativa no IdP)</li>
        </ul>
      </Section>

      <Section title="Multi-Factor Authentication (MFA)" accent={ACCENT}>
        <p>
          MFA adiciona um segundo fator (código TOTP de app como Google Authenticator, ou hardware token) ao login. Proteções recomendadas:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Root account</strong> — obrigatório MFA de hardware ou virtual</li>
          <li>• <strong>Usuários privilegiados</strong> (Administrators, Billing) — obrigatório</li>
          <li>• <strong>Todos os IAM Users com console access</strong> — fortemente recomendado</li>
          <li>• Pode ser exigido via policy com <InlineCode>{'aws:MultiFactorAuthPresent": "true"'}</InlineCode></li>
        </ul>
      </Section>

      <Section title="As ~6 coisas que SÓ a root pode fazer" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Fechar a conta AWS</li>
          <li>• Mudar o endereço de email da conta</li>
          <li>• Mudar o plano de suporte (Basic, Developer, Business, Enterprise)</li>
          <li>• Restaurar permissões IAM que foram completamente revogadas</li>
          <li>• Gerenciar configurações de faturamento raízes</li>
          <li>• Registrar-se em GovCloud</li>
        </ul>
        <Callout tone="danger">
          <strong>A root não é para o dia a dia.</strong> Crie um IAM User com AdministratorAccess para uso diário, habilite MFA na root, guarde a credencial em cofre físico e só a use nas ~6 tarefas acima.
        </Callout>
      </Section>

      <Section title="Princípio do menor privilégio (Least Privilege)" accent={ACCENT}>
        <p>
          Conceda apenas as permissões necessárias para a tarefa, nem mais, nem menos. Implementação prática:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Passo', 'Ferramenta']}
          rows={[
            ['Começar negando tudo', 'Default Deny — padrão AWS'],
            ['Conceder por grupos, não usuários', 'IAM Groups'],
            ['Revisar permissões não usadas', 'IAM Access Analyzer'],
            ['Validar policies antes de aplicar', 'IAM Access Analyzer — policy validation'],
            ['Limitar dano de comprometimento', 'Permission Boundaries + SCPs'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Aplicação rodando em EC2 precisa ler do bucket S3"
          winner="EC2 Instance Role"
          winnerColor={ACCENT}
          why="Sem access keys hardcoded, credenciais rotacionadas automaticamente pelo STS, acesso auditável via CloudTrail."
          alternatives={[
            { name: 'Access keys em variáveis de ambiente', note: 'Má prática — qualquer dump de memória ou process list expõe' },
          ]}
        />
        <DecisionBox
          scenario="Desenvolvedor precisa acesso a duas contas AWS (dev e prod)"
          winner="IAM Identity Center + permission sets"
          winnerColor={ACCENT}
          why="Login único, acesso granular por conta, revogação instantânea ao sair da empresa. Elimina IAM Users duplicados em cada conta."
        />
        <DecisionBox
          scenario="Parceiro externo precisa acessar um bucket S3 específico"
          winner="Cross-account Role + Bucket Policy"
          winnerColor={ACCENT}
          why="Parceiro tem sua própria conta AWS. Você cria uma Role confiando na conta dele; ele assume via STS. Sem compartilhar credenciais."
        />
        <DecisionBox
          scenario="Funcionário que saiu da empresa tinha acesso AWS"
          winner="IAM Identity Center: desativa no IdP → propaga tudo"
          winnerColor={ACCENT}
          why="Em vez de caçar Users em N contas, uma desativação no provedor de identidade revoga acesso em toda Organization."
        />
      </Section>

      <Section title="Prática: criar um usuário e anexar policy" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Criar um grupo
aws iam create-group --group-name Devs

# Anexar policy gerenciada ao grupo
aws iam attach-group-policy \\
  --group-name Devs \\
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Criar usuário
aws iam create-user --user-name alice

# Adicionar ao grupo
aws iam add-user-to-group --user-name alice --group-name Devs

# Habilitar MFA
aws iam create-virtual-mfa-device --virtual-mfa-device-name alice-mfa \\
  --outfile qr.png --bootstrap-method QRCodePNG`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Armadilha do exame:</strong> "IAM é regional ou global?" — <strong>Global</strong>. IAM não tem seletor de Região. Usuários, Roles, Policies criados valem para toda a conta em qualquer Região.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Um IAM User tem 3 policies: uma Allow s3:*, uma Allow ec2:*, e uma Deny s3:DeleteBucket. O user pode deletar buckets?"
          a={<><strong>Não</strong>. Explicit Deny sempre vence, mesmo em face de múltiplos Allows. Essa é a regra mais cobrada em questões de policy evaluation.</>}
        />
        <QAItem
          q="Qual é o tempo máximo padrão de uma sessão STS assumindo uma Role?"
          a={<>1 hora (3600s) por padrão. Pode ser estendido até 12h via configuração da Role. Para IAM Identity Center, o padrão é 8h (configurável).</>}
        />
        <QAItem
          q="Diferença entre IAM Policy e S3 Bucket Policy?"
          a={<>IAM Policy é <strong>identity-based</strong> — anexa a quem pode fazer. Bucket Policy é <strong>resource-based</strong> — anexa ao bucket definindo quem pode acessar. Útil para conceder acesso cross-account sem criar IAM User lá.</>}
        />
        <QAItem
          q="Como dar permissão a um usuário externo (sem conta AWS) para acessar recursos?"
          a={<>Via <strong>identity federation</strong>: SAML 2.0 (Okta, Azure AD), OIDC (Google, Cognito), ou AWS IAM Identity Center. Eles recebem credenciais temporárias via STS após autenticação no provedor externo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> IAM tem 4 componentes — Users, Groups, Roles, Policies. Policies JSON definem Effect/Action/Resource/Condition. Deny &gt; Allow &gt; Default Deny. Roles &gt; Users sempre que possível. MFA obrigatório na root e em privilegiados. Least privilege + Access Analyzer. IAM é global. STS gera credenciais temporárias para Roles. Identity Center &gt; IAM Users para acesso humano em Organizations.
      </Callout>
    </div>
  );
}
