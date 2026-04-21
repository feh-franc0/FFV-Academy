import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('authn-vs-authz');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença essencial entre autenticação e autorização?',
    options: [
      'Autenticação é mais segura que autorização',
      'Autenticação (authn): quem é você — prova de identidade (senha, MFA, cert). Autorização (authz): o que pode fazer — política de acesso. Camadas diferentes, cada uma pode falhar independentemente',
      'São sinônimos',
      'Autenticação é cliente, autorização é servidor',
    ],
    correct: 1,
    explanation: 'Authn produz identidade verificada (um "sujeito"). Authz decide se esse sujeito pode acessar o recurso. Um sistema autenticado sem authz = qualquer user logado faz tudo (clássico bug de MVP). Authz sem authn = acesso anônimo que não devia existir.',
  },
  {
    question: 'Qual é a diferença prática entre RBAC e ABAC?',
    options: [
      'Nenhuma',
      'RBAC: user tem role; role tem permissões fixas (user→role→perm). ABAC: políticas condicionais baseadas em atributos do user, recurso e contexto (if user.dept==resource.owner.dept então permit)',
      'ABAC é só em cloud',
      'RBAC é antigo e não se usa mais',
    ],
    correct: 1,
    explanation: 'RBAC é simples e suficiente pra maioria das apps. ABAC ganha em cenários complexos (multi-tenant, contexto de rede, owner-based). AWS IAM é ABAC híbrido (policies com conditions). OPA/Rego popularizou ABAC como código.',
  },
  {
    question: 'O que é ReBAC (Relationship-Based Access Control)?',
    options: [
      'RBAC com cache',
      'Modelo baseado em GRAFOS de relação — Google Zanzibar, SpiceDB. Ideal pra "quem pode editar este documento?" onde a resposta depende de relações complexas (folder parent, shared with team, etc.)',
      'Novo nome pra ABAC',
      'Protocolo de rede',
    ],
    correct: 1,
    explanation: 'ReBAC (popularizado pelo Google Zanzibar) modela autorização como grafo: "user#tom is:editor folder#docs, folder#docs parent doc#readme" → Tom pode editar readme. SpiceDB e OpenFGA são implementações open. Ideal pra Notion/Figma/Google Drive-style sharing.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="authn-vs-authz"
      title="Authn vs Authz: a diferença e as armadilhas"
      icon="🔑"
      xp={50}
      readTime={11}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="oauth2-oidc-do-zero"
      nextTitle="OAuth2 e OIDC do zero: fluxos e PKCE"
      quiz={quiz}
    >
      <Section title="A ordem importa" accent={accent}>
        <p>
          Pipeline correto de request protegido:
        </p>
        <CodeBlock lang="typescript">{`// 1. Authn (quem é?) — middleware JWT, session, etc.
const user = await authenticate(req);
if (!user) return 401;

// 2. Authz (pode?) — check policy pro recurso
const canEdit = await authorize(user, 'edit', resource);
if (!canEdit) return 403;

// 3. Handler — assume identity e permission válidas
await handleEdit(req, user, resource);`}</CodeBlock>
        <p>
          <strong>401 vs 403</strong>: 401 Unauthorized (mal nomeado — na verdade "unauthenticated"). 403 Forbidden (autenticado mas sem permissão). Não misture.
        </p>
      </Section>

      <Section title="Modelos de authz comparados" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Quando usar', 'Exemplo']}
          rows={[
            ['RBAC (role-based)', '90% dos apps — simples', 'admin, editor, viewer com perms fixas'],
            ['ABAC (attribute-based)', 'Multi-tenant, contexto', 'AWS IAM com Condition, OPA/Rego'],
            ['ReBAC (relationship)', 'Sharing-heavy (Drive, Notion)', 'Zanzibar, SpiceDB, OpenFGA'],
            ['PBAC (policy-based)', 'Compliance complexa', 'OPA Gatekeeper em Kubernetes'],
          ]}
        />
      </Section>

      <Section title="Tipar authn no TS — nunca esquecer" accent={accent}>
        <CodeBlock lang="typescript">{`// Request padrão: user pode ser undefined — falha silenciosa
type UnauthenticatedRequest = Request;

// Branded: só existe APÓS middleware authn
type AuthenticatedRequest = Request & {
  user: User;
  readonly __authenticated: true;
};

// Handler protegido só aceita o tipo branded
function editDocument(req: AuthenticatedRequest) {
  req.user // ← garantido existir, TS prova
}

// Middleware transforma
function requireAuth(req: Request): AuthenticatedRequest {
  const user = verifyToken(req);
  if (!user) throw new HttpError(401);
  return Object.assign(req, { user, __authenticated: true as const });
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Este padrão elimina a classe inteira de bugs "esqueci de checar autenticação". O TS não compila sem o middleware primeiro.
        </Callout>
      </Section>

      <Section title="Armadilhas clássicas" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>IDOR (Insecure Direct Object Reference)</strong>: <InlineCode>/users/123/orders</InlineCode> sem checar se 123 é o user logado. Sempre comparar: <InlineCode>resource.ownerId === user.id</InlineCode>.</li>
          <li><strong>Authz em client</strong>: esconder botão no front não protege. Toda regra vai no server.</li>
          <li><strong>Race na autorização</strong>: checar perm e executar em steps separados. Entre os dois, estado pode mudar. Use transação ou check dentro do UPDATE.</li>
          <li><strong>Escalation lateral</strong>: user nível N pode editar dados de outro user nível N. Se o recurso tem dono, a perm PRECISA incluir owner check.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
