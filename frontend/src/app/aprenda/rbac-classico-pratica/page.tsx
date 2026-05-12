import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rbac-classico-pratica');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'No modelo RBAC NIST (Sandhu 1996), qual é a relação canônica entre as entidades?',
    options: [
      'users → permissions (direto, sem intermediário)',
      'users ↔ roles ↔ permissions: roles são o intermediário many-to-many que desacopla quem (user) do que pode (permission)',
      'roles herdam de permissions',
      'permissions são atributos de users',
    ],
    correct: 1,
    explanation: 'O paper seminal de Sandhu, Coyne, Feinstein e Youman (1996) define 4 níveis: RBAC0 (flat — users-roles-perms), RBAC1 (adiciona role hierarchy), RBAC2 (adiciona constraints como SoD), RBAC3 (combina 1+2). A força do RBAC é o desacoplamento via roles — admin sai da empresa, troca a atribuição user→role, não precisa reescrever permissions.',
  },
  {
    question: 'O que é "Separation of Duties (SoD)" estático no RBAC2?',
    options: [
      'Cada user só tem uma role',
      'Constraint que impede um mesmo user de ser atribuído a duas roles conflitantes — ex: quem submete pagamento não pode ser quem aprova',
      'Roles têm permissões separadas',
      'Cada permission é exclusiva de uma role',
    ],
    correct: 1,
    explanation: 'SoD estático (SSD): no momento de atribuir role ao user, valida-se que não há conflito com outra já atribuída. SoD dinâmico (DSD): mesmo user pode TER as duas roles, mas não pode ATIVAR ambas na mesma sessão. SoD existe em SOX/PCI-DSS/auditoria financeira — é por isso que ERPs sérios (SAP, Oracle) implementam até hoje.',
  },
  {
    question: 'Por que RBAC clássico "quebra" em multi-tenancy real com sharing por recurso?',
    options: [
      'RBAC é lento',
      'Roles são globais por natureza — não conseguem expressar "user X é editor APENAS no projeto Y do tenant Z", a não ser por explosão combinatória de roles (role-per-resource)',
      'RBAC não suporta SQL',
      'RBAC não tem hierarquia',
    ],
    correct: 1,
    explanation: 'O sintoma clássico: 50 projetos × 4 roles = 200 roles distintas, e nenhuma se aplica a um doc específico compartilhado com guest externo. A resposta correta NÃO é "mais RBAC" — é ABAC (atributos sobre o recurso) ou ReBAC (relação user-recurso como dado). RBAC continua excelente para perms organizacionais coarse-grained (admin/staff/viewer).',
  },
  {
    question: 'Numa role hierarchy (RBAC1), se "editor" herda de "viewer", o que vale?',
    options: [
      'editor tem MENOS permissões que viewer',
      'editor automaticamente possui todas as permissões de viewer + as próprias (relação de herança = sobreconjunto)',
      'viewer herda de editor',
      'são roles isoladas',
    ],
    correct: 1,
    explanation: 'Role hierarchy é DAG (não ciclo): editor ≥ viewer significa que toda perm de viewer está em editor. Modelagem comum: admin ≥ editor ≥ viewer. A SQL implementação típica usa CTE recursiva para resolver herança ao calcular permissões efetivas — atenção a performance em hierarquias profundas, costuma ser materializada em cache.',
  },
  {
    question: 'Qual o pior anti-pattern de RBAC em produção?',
    options: [
      'Usar UUIDs nas tabelas',
      '"Role explosion": criar uma role nova para cada combinação fina de permissões (editor_billing_readonly_us_west_2), o que destrói o desacoplamento que RBAC oferece',
      'Ter 3 roles',
      'Cache de permissões',
    ],
    correct: 1,
    explanation: 'Role explosion é o sinal de que RBAC já não cabe — você está usando role como container de tuplas fine-grained. Solução: migrar parte da decisão para ABAC (condições sobre atributos) ou ReBAC (relações). Mantenha RBAC para coarse-grained ("admin pode tudo", "viewer pode ler") e mova fine-grained para policy engine.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rbac-classico-pratica"
      title="RBAC clássico: roles, permissions, e seus limites"
      icon="👥"
      xp={55}
      readTime={11}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="abac-attribute-based"
      nextTitle="ABAC: policies sobre atributos, XACML legado"
      quiz={quiz}
    >
      <Section title="O paper que fundou tudo" accent={accent}>
        <p>
          RBAC não é uma ideia da Microsoft nem do AWS IAM. É um modelo formal publicado em 1996 por <strong>Ravi Sandhu et al.</strong> no IEEE Computer (&quot;Role-Based Access Control Models&quot;) e padronizado pelo NIST em 2004 (ANSI INCITS 359-2004). A contribuição central é uma observação simples:
        </p>
        <Callout tone="info" icon="🧠">
          <strong>Atribuir permissões diretamente a usuários não escala.</strong> Atribuir <em>papéis</em> (roles) a usuários, e permissões a papéis, sim — porque o conjunto de papéis numa organização é pequeno, mas o de usuários é grande e rotativo.
        </Callout>
        <p>
          O paper define quatro níveis incrementais — conhecidos como família RBAC:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'RBAC0 (flat)', v: 'users ↔ roles ↔ permissions. Núcleo mínimo. Maioria dos apps para aqui.' },
            { k: 'RBAC1', v: 'RBAC0 + role hierarchy (herança entre roles, DAG)' },
            { k: 'RBAC2', v: 'RBAC0 + constraints (SoD estático, cardinality, prerequisite roles)' },
            { k: 'RBAC3', v: 'RBAC1 + RBAC2 — modelo completo, base da NIST RBAC' },
          ]}
        />
      </Section>

      <Section title="Modelagem em SQL (3 tabelas, não 4)" accent={accent}>
        <p>
          O esquema canônico em Postgres — apenas três tabelas associativas além das entidades. Atenção ao índice composto na tabela de associação:
        </p>
        <CodeBlock lang="sql">{`-- Entidades base
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,        -- 'admin', 'editor', 'viewer'
  parent_role_id UUID REFERENCES roles(id)  -- RBAC1 hierarchy
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  resource TEXT NOT NULL,           -- 'invoices', 'users'
  action TEXT NOT NULL,             -- 'read', 'write', 'delete'
  UNIQUE (resource, action)
);

-- Associações N:N
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Erro comum: criar tabela <InlineCode>user_permissions</InlineCode> direta &quot;para casos especiais&quot;. Em 2 anos você tem 30% das perms via role e 70% via overrides — RBAC virou bagunça. Se precisa de override, modele como uma role pessoal por user (anti-pattern, mas pelo menos consistente) ou migre para ABAC/ReBAC.
        </Callout>
      </Section>

      <Section title="Resolver permissões efetivas com hierarquia" accent={accent}>
        <p>
          A query &quot;quais permissões esse user tem?&quot; precisa atravessar a hierarquia. Em Postgres, CTE recursiva resolve elegantemente:
        </p>
        <CodeBlock lang="sql">{`-- Dado um user_id, retornar todas as perms efetivas (incluindo herdadas)
WITH RECURSIVE role_tree AS (
  -- base: roles diretas do user
  SELECT r.id, r.parent_role_id
  FROM roles r
  JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = $1

  UNION

  -- step: sobe na hierarquia, mas espera, herança é DESCENDENTE
  -- se editor herda de viewer, queremos perms de viewer ao olhar editor
  SELECT child.id, child.parent_role_id
  FROM roles child
  JOIN role_tree rt ON child.parent_role_id = rt.id
)
SELECT DISTINCT p.resource, p.action
FROM role_tree rt
JOIN role_permissions rp ON rp.role_id = rt.id
JOIN permissions p ON p.id = rp.permission_id;`}</CodeBlock>
        <Callout tone="info" icon="⚡">
          Em produção, a query acima é resolvida no path de cada request — cache obrigatório. Padrão: redis com TTL curto (60s) chave <InlineCode>perms:user:{'{id}'}</InlineCode>, invalidação em writes de <InlineCode>user_roles</InlineCode>/<InlineCode>role_permissions</InlineCode>.
        </Callout>
      </Section>

      <Section title="Anatomia de uma decisão de acesso" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Fluxo RBAC clássico no path do request"
          steps={[
            { label: '1. Authn', desc: 'middleware valida JWT/session e popula req.user' },
            { label: '2. Load roles', desc: 'busca roles efetivas (cache redis ou query SQL)' },
            { label: '3. Expand hierarchy', desc: 'resolve roles ancestrais via CTE recursiva' },
            { label: '4. Match permission', desc: 'verifica se (resource, action) existe no conjunto' },
            { label: '5. Decision', desc: 'permit / deny (default deny) → 200 ou 403' },
          ]}
        />
      </Section>

      <Section title="Separation of Duties (RBAC2)" accent={accent}>
        <p>
          SoD vem de auditoria financeira: a pessoa que <em>cria</em> uma transação não pode ser a mesma que <em>aprova</em>. Em SOX/PCI-DSS isso é requisito legal, não best practice.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Quando se verifica', 'Exemplo']}
          rows={[
            ['Static SoD (SSD)', 'Na atribuição da role ao user', 'User com role "submitter_payment" não pode receber "approver_payment"'],
            ['Dynamic SoD (DSD)', 'Na ativação da role na sessão', 'User tem ambas, mas só pode ativar uma por sessão'],
            ['Cardinality constraint', 'Quando role é atribuída', 'Apenas 2 usuários podem ter role "ceo"'],
            ['Prerequisite role', 'Antes de atribuir', 'Só pode receber "team_lead" se já tiver "senior_eng"'],
          ]}
        />
        <CodeBlock lang="sql">{`-- SoD estática modelada em SQL via tabela de pares conflitantes
CREATE TABLE role_conflicts (
  role_a UUID REFERENCES roles(id),
  role_b UUID REFERENCES roles(id),
  PRIMARY KEY (role_a, role_b)
);

-- Trigger que bloqueia INSERT em user_roles violando conflito
CREATE FUNCTION check_sod() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_conflicts rc
      ON (rc.role_a = NEW.role_id AND rc.role_b = ur.role_id)
      OR (rc.role_b = NEW.role_id AND rc.role_a = ur.role_id)
    WHERE ur.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'SoD violation: conflicting role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_sod BEFORE INSERT ON user_roles
  FOR EACH ROW EXECUTE FUNCTION check_sod();`}</CodeBlock>
      </Section>

      <Section title="Onde RBAC vence: arquitetura típica" accent={accent}>
        <StackFlow
          accent={accent}
          title="Stack RBAC em SaaS B2B coarse-grained"
          items={[
            { layer: 'Identity Provider', items: ['Auth0 / Clerk / Cognito'], description: 'emite JWT com claim "roles":["admin"]' },
            { layer: 'API Gateway', items: ['middleware authn', 'extrai roles do JWT'], description: 'valida assinatura e popula contexto' },
            { layer: 'Authz middleware', items: ['decorator @requires("invoices:read")'], description: 'consulta cache de perms efetivas' },
            { layer: 'Persistence', items: ['Postgres tabelas RBAC', 'Redis cache de perms'], description: 'source of truth + cache' },
            { layer: 'Audit log', items: ['append-only log de decisões', 'Loki / Datadog'], description: 'compliance SOX/PCI' },
          ]}
        />
      </Section>

      <Section title="Onde RBAC quebra (e o porquê)" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Notion/Drive-like sharing: 'compartilhar este doc com fulano@externo como editor'"
          winner="ReBAC (Zanzibar/SpiceDB/OpenFGA) — relacionamento user-recurso como dado"
          why="RBAC exigiria uma role por documento ('editor_doc_xyz') — role explosion. ABAC tentaria condição sobre atributo, mas o atributo 'shared_with_users' vira lista que cresce sem bound. ReBAC modela a relação diretamente."
          alternatives={[
            { name: 'RBAC puro', note: 'Não escala — role per resource é anti-pattern' },
            { name: 'ABAC', note: 'Funciona até umas 5 condições; depois fica intratável' },
            { name: 'ReBAC', note: 'Modelo natural para sharing — próximos módulos' },
          ]}
        />
        <p className="text-sm mt-3">
          Os três sinais de que você precisa sair do RBAC puro:
        </p>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Role explosion</strong>: mais de ~50 roles ativas, com nomes contendo IDs de recurso</li>
          <li><strong>Conditional perms</strong>: &quot;editor SE recurso for do mesmo departamento&quot; — isso é ABAC</li>
          <li><strong>Resource-level sharing</strong>: usuário externo precisa de acesso a UM recurso — isso é ReBAC</li>
        </ul>
      </Section>

      <Section title="Implementação enxuta em TypeScript" accent={accent}>
        <CodeBlock lang="typescript">{`// Decorator-style authz middleware
import type { Request, Response, NextFunction } from 'express';

type Permission = \`\${string}:\${string}\`;  // 'invoices:read'

export function requires(perm: Permission) {
  const [resource, action] = perm.split(':');
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;  // garantido por authn middleware anterior
    if (!user) return res.status(401).json({ error: 'unauthenticated' });

    const perms = await getEffectivePermissions(user.id);  // cache redis
    const allowed = perms.has(\`\${resource}:\${action}\`);

    // Audit log — sempre, permitido ou não
    audit.log({
      user_id: user.id,
      resource, action,
      decision: allowed ? 'permit' : 'deny',
      ts: new Date(),
    });

    if (!allowed) return res.status(403).json({ error: 'forbidden' });
    return next();
  };
}

// Uso
app.get('/invoices/:id', requires('invoices:read'), handleGetInvoice);
app.delete('/users/:id', requires('users:delete'), handleDeleteUser);`}</CodeBlock>
      </Section>

      <Section title="ArchFlow: integração Postgres + Redis + audit" accent={accent}>
        <NodeGraph
          accent={accent}
          title="RBAC em produção com cache e auditoria"
          columns={[
            {
              label: 'Edge',
              nodes: [
                { label: 'Request HTTP', sub: 'JWT no Authorization header' },
                { label: 'API Gateway', sub: 'verifica assinatura JWT' },
              ],
            },
            {
              label: 'Authz',
              nodes: [
                { label: 'Middleware @requires', sub: 'extrai (resource, action)' },
                { label: 'Cache lookup', sub: 'Redis perms:user:{id}' },
                { label: 'DB fallback', sub: 'CTE recursiva role hierarchy' },
              ],
            },
            {
              label: 'Audit',
              nodes: [
                { label: 'Decision log', sub: 'append-only, queryable' },
                { label: 'Compliance', sub: 'SOX / PCI / SOC2 evidence' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>RBAC = padrão NIST formal desde 1996 (Sandhu). RBAC0/1/2/3 são camadas, não &quot;versões&quot;.</li>
          <li>3 tabelas associativas em SQL resolvem 90% dos casos. Não invente uma quarta.</li>
          <li>Role hierarchy (RBAC1) via CTE recursiva, sempre com cache redis na frente.</li>
          <li>SoD (RBAC2) é requisito de compliance financeira — modele com trigger SQL ou policy no app.</li>
          <li>RBAC quebra em: sharing resource-level, conditional permissions e role explosion. A saída é ABAC + ReBAC — próximos módulos.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
