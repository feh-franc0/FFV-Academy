import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('multi-tenant-auth-patterns');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  { question: 'Em SaaS B2B típico, a hierarquia de autorização mais comum é:', options: ['User → permission', 'Org → Team → Project → Resource, com roles em cada nível, sharing cruzado entre orgs, guests externos, role customization por org', 'User → Resource', 'Resource → User'], correct: 1, explanation: 'Linear, Notion, Vercel — modelo padrão. Org top, teams dentro, projects no team, resources no project. Cada nível tem roles próprios. Sharing externo + guests adiciona complexidade.' },
  { question: 'Postgres RLS (Row-Level Security) é boa solução para multi-tenant?', options: ['Nunca', 'Para isolation simples (cada tenant não vê dados do outro), sim — RLS aplica WHERE tenant_id = current_setting filter automaticamente. Limitações: queries complexas de admin, performance em escala alta, debugging difícil', 'Apenas para SQLite', 'Apenas com schemas separados'], correct: 1, explanation: 'RLS é "tenant isolation" elegante no Postgres. Define policy USING (tenant_id = current_setting(\'app.tenant_id\')) e queries filtradas automaticamente. Ótimo para pool model multi-tenant. Limitação: cada query precisa setear app.tenant_id; admin queries são wonk.' },
  { question: 'Quando trocar Postgres RLS por ReBAC engine (SpiceDB/OpenFGA)?', options: ['Nunca', 'Quando a lógica de sharing fica não-trivial: sharing inter-org (recurso de org A acessível por user de org B), inheritance complexa (project A → folder → workspace), permission por tipo de relationship (owner vs viewer vs commenter)', 'Sempre', 'Apenas em fintech'], correct: 1, explanation: 'RLS resolve "vejo só do meu tenant". ReBAC resolve "qual conjunto exato de recursos eu vejo dada esse grafo de relacionamentos". Sharing inter-org cruzado é o sinal claro de migrar para ReBAC engine.' },
  { question: 'Custom roles por org — implementação:', options: ['Hardcoded global', 'Cada org define roles próprias, mapping role → permissions. Stored como dados (não código). Auth check: dado user X em org Y, quais permissions tem? Lookup hierárquico considerando custom + default roles', 'Não é possível', 'Apenas Owner / Member'], correct: 1, explanation: 'Custom roles dão flexibilidade enterprise. Implementação: tabela permissions; tabela role_permissions (role_id, permission, scope); tabela user_role (user_id, role_id, org_id). Cache resolution. Para complexidade alta, ReBAC engine.' },
  { question: 'Guests externos e cross-tenant sharing:', options: ['Bloquear sempre', 'Padrão moderno: invite cria User com flag is_guest=true para o tenant; sharing externo via signed links com revocation; auditoria pesada. Modelo "external collaboration" virou must-have em B2B', 'Apenas internos', 'Email pessoal proibido'], correct: 1, explanation: 'Notion, Linear, Figma — todos suportam external collaborators. Padrão: invite → cria user no tenant com is_guest=true; permissões limitadas; revogação fácil; audit log de tudo que guest acessa.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="multi-tenant-auth-patterns" title="Multi-tenant authorization: orgs, teams, projects, sharing" icon="🏢" xp={75} readTime={15}
      trailName="Authorization Engineering" trailColor={accent} quiz={quiz}>
      <Section title="O modelo padrão SaaS B2B" accent={accent}>
        <p className="text-sm leading-6">Você está construindo Linear/Notion/Vercel-like. A hierarquia consolidada: <b>Org → Team → Project → Resource</b>. Cada nível tem roles, sharing inter-níveis, guests externos. Implementar errado = dor permanente. Implementar bem destrava enterprise sales.</p>
      </Section>
      <Section title="A hierarquia visualizada" accent={accent}>
        <NodeGraph title="Modelo Linear/Notion/Vercel-like" accent={accent} columns={[
          { label: 'Top level', nodes: [
            { icon: '🏢', label: 'Organization', sub: 'Billing entity, top scope', tone: 'emphasis' },
            { icon: '👤', label: 'Owner / Admin', sub: 'Full control da org' },
            { icon: '🎫', label: 'Plan / Billing', sub: 'Stripe customer' },
          ]},
          { label: 'Middle', nodes: [
            { icon: '👥', label: 'Team / Workspace', sub: 'Subdivisão dentro da org' },
            { icon: '⚙️', label: 'Team roles', sub: 'Admin, Member, Viewer' },
            { icon: '🔗', label: 'Cross-team sharing', sub: 'Project visível em N teams' },
          ]},
          { label: 'Resource level', nodes: [
            { icon: '📦', label: 'Project / Workspace', sub: 'Container de recursos' },
            { icon: '📄', label: 'Document / Issue / Resource', sub: 'O conteúdo' },
            { icon: '🤝', label: 'Sharing externo', sub: 'Guest, link público, link com senha', tone: 'emphasis' },
          ]},
        ]} />
      </Section>
      <Section title="Schema relacional baseline" accent={accent}>
        <CodeBlock lang="sql">{`-- Hierarchy
CREATE TABLE organizations (id UUID PRIMARY KEY, name TEXT, plan TEXT);
CREATE TABLE teams (id UUID PRIMARY KEY, org_id UUID REFERENCES organizations);
CREATE TABLE projects (id UUID PRIMARY KEY, team_id UUID REFERENCES teams);
CREATE TABLE documents (id UUID PRIMARY KEY, project_id UUID REFERENCES projects);

-- Users + memberships
CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE);
CREATE TABLE org_members (
  org_id UUID REFERENCES organizations,
  user_id UUID REFERENCES users,
  role TEXT NOT NULL,  -- 'owner', 'admin', 'member', 'guest'
  is_guest BOOLEAN DEFAULT false,
  PRIMARY KEY (org_id, user_id)
);
CREATE TABLE team_members (
  team_id UUID REFERENCES teams,
  user_id UUID REFERENCES users,
  role TEXT NOT NULL,  -- 'admin', 'member', 'viewer'
  PRIMARY KEY (team_id, user_id)
);

-- Sharing externo (granular por resource)
CREATE TABLE resource_shares (
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  shared_with_user_id UUID REFERENCES users,
  shared_with_email TEXT,
  role TEXT NOT NULL,           -- 'editor', 'commenter', 'viewer'
  invited_by UUID REFERENCES users,
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (resource_type, resource_id, COALESCE(shared_with_user_id, NULL), COALESCE(shared_with_email, NULL))
);`}</CodeBlock>
      </Section>
      <Section title="Postgres RLS para isolation simples" accent={accent}>
        <CodeBlock lang="sql">{`-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: só vê documents da org dele
CREATE POLICY tenant_isolation ON documents
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON p.team_id = t.id
    WHERE t.org_id = current_setting('app.current_org_id')::UUID
  )
);

-- App seta o context antes de cada query
SET LOCAL app.current_org_id = 'org-uuid-aqui';
SELECT * FROM documents WHERE id = 'doc-uuid';  -- RLS aplica filter automaticamente`}</CodeBlock>
      </Section>
      <Section title="ReBAC engine para sharing complexo" accent={accent}>
        <CodeBlock lang="text">{`# SpiceDB schema para SaaS B2B
definition user {}

definition organization {
  relation owner: user
  relation admin: user
  relation member: user

  permission manage = owner + admin
  permission view = manage + member
}

definition project {
  relation parent: organization
  relation editor: user
  relation viewer: user

  // Sharing externo
  relation guest_editor: user
  relation guest_viewer: user

  permission edit = editor + guest_editor + parent->manage
  permission view = edit + viewer + guest_viewer + parent->view
}

definition document {
  relation project: project
  relation external_editor: user
  relation external_viewer: user

  permission edit = external_editor + project->edit
  permission view = edit + external_viewer + project->view
}`}</CodeBlock>
      </Section>
      <Section title="Checks em produção" accent={accent}>
        <CodeBlock lang="typescript">{`// SpiceDB SDK
import { v1 } from '@authzed/authzed-node';

const client = v1.NewClient(process.env.AUTHZED_TOKEN!);

async function canViewDocument(userId: string, docId: string): Promise<boolean> {
  const resp = await client.checkPermission({
    resource: { objectType: 'document', objectId: docId },
    permission: 'view',
    subject: { object: { objectType: 'user', objectId: userId } },
  });
  return resp.permissionship === v1.CheckPermissionResponse_Permissionship.HAS_PERMISSION;
}

// Em route handler
app.get('/documents/:id', async (req, res) => {
  const canView = await canViewDocument(req.user.id, req.params.id);
  if (!canView) return res.status(403).send('Forbidden');
  // ... resto
});`}</CodeBlock>
      </Section>
      <Section title="Trade-offs RLS vs ReBAC" accent={accent}>
        <ComparisonTable accent={accent} headers={['Aspecto', 'Postgres RLS', 'ReBAC engine']} rows={[
          ['Isolation simples por tenant', '✅ Excelente', '✅ Mas overkill'],
          ['Sharing cruzado inter-tenant', '❌ Complicado', '✅ Natural'],
          ['Roles customizadas por org', '⚠️ Aplicação implementa', '✅ Schema flexível'],
          ['Performance sub-ms', '✅ Filter em SQL', '✅ Cache distribuído'],
          ['Operacional', '✅ Já tem Postgres', '⚠️ Mais um serviço'],
          ['Debug', '⚠️ EXPLAIN com policy', '✅ ZedToken + tracing'],
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Authorization Engineering concluída. Badge <b>Authz Architect</b> desbloqueado.</Callout>
    </ModuleLayout>
  );
}
