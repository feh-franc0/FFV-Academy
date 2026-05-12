import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, StackFlow, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('spicedb-implementacao');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o "ZedToken" no SpiceDB e qual sua função?',
    options: [
      'Um JWT de autenticação',
      'O equivalente ao Zookie do Zanzibar: token opaco com Postgres/CRDB timestamp que garante consistência at_least_as_fresh ≥ ponto da escrita — usado para evitar new enemy problem',
      'Cache key compartilhada',
      'API key do tenant',
    ],
    correct: 1,
    explanation: 'ZedToken é o port direto do Zookie. Toda WriteRelationships retorna um ZedToken. O cliente persiste e envia em CheckPermission com consistency: { atLeastAsFresh: { token } }. Sem isso, leituras podem usar replicas stale e retornar permit pós-revogação.',
  },
  {
    question: 'Na schema language do SpiceDB, o que faz a definição "permission read = reader + writer + parent->read"?',
    options: [
      'Cria três tabelas',
      'Define que "read" é union de: relação direta reader, relação direta writer, e read recursivo via parent (tuple-to-userset) — o "->" é o operador de indireção',
      'Cria três permissões separadas',
      'Define alias',
    ],
    correct: 1,
    explanation: 'É userset rewrite do Zanzibar com sintaxe enxuta. `+` é union, `&` é intersection, `-` é exclusion. `parent->read` significa: para cada tupla com relação parent neste objeto, segue para o objeto pai e avalia sua permission read — base da herança hierárquica (folder→doc).',
  },
  {
    question: 'Qual storage é recomendado para SpiceDB em produção?',
    options: [
      'SQLite',
      'PostgreSQL ou CockroachDB com Watch API ativa (CDC/logical replication) — necessário para consistência ZedToken e invalidação de cache',
      'Redis only',
      'MongoDB',
    ],
    correct: 1,
    explanation: 'SpiceDB suporta múltiplos drivers: memory (dev), Postgres (mais comum, via logical decoding), CockroachDB (escala horizontal nativa), Spanner (paridade Zanzibar), MySQL (limited). Para produção: Postgres com `wal_level=logical` ou CRDB. Watch API depende de CDC do datastore.',
  },
  {
    question: 'Qual API SpiceDB você usa para responder "Quais documentos Tom pode ler?"',
    options: [
      'CheckPermission em loop',
      'LookupResources(subject=user:tom, permission=read, resourceType=doc) — retorna stream de doc IDs com permissão. Reverse query.',
      'ExpandPermission',
      'WriteRelationships',
    ],
    correct: 1,
    explanation: 'CheckPermission é forward (Tom + doc:X → bool). ExpandPermission retorna a árvore de userset para debug (quem tem perm em X). LookupResources é reverse query (Tom → lista de docs). LookupSubjects vai pelo outro lado (doc:X → lista de users). É o que viabiliza UI tipo "Meus documentos".',
  },
  {
    question: 'Sobre caveats (conditional relationships) em SpiceDB:',
    options: [
      'São impossíveis em ReBAC',
      'Permitem expressar ABAC dentro do ReBAC: a tupla carrega uma expressão CEL avaliada em runtime — ex: viewer apenas se request.ip em allowed_cidr. Combina os mundos.',
      'São apenas para debug',
      'Substituem zedtokens',
    ],
    correct: 1,
    explanation: 'Caveats foram adicionados em 2023 — resolvem a maior limitação histórica do ReBAC puro. Você declara `caveat ip_allowlist(user_ip string, allowed list<string>) { user_ip in allowed }` e adiciona a relação com contexto. No check, envia o contexto e o caveat é avaliado via CEL. É ABAC-em-cima-de-ReBAC.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="spicedb-implementacao"
      title="SpiceDB: Zanzibar open-source na prática"
      icon="🌶️"
      xp={70}
      readTime={14}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="openfga-pratica"
      nextTitle="OpenFGA: alternativa Auth0/Okta para Zanzibar"
      quiz={quiz}
    >
      <Section title="A implementação Zanzibar mais madura" accent={accent}>
        <p>
          <strong>SpiceDB</strong> é o produto da <a className="underline" href="https://authzed.com">Authzed</a>, fundada por engenheiros vindos do Red Hat/CoreOS. Open-source desde 2021, Apache 2.0. É hoje a implementação ReBAC mais alinhada ao paper Zanzibar — mantém zookies (rebatizados ZedTokens), userset rewrites, namespaces, APIs Check/Expand/Lookup, e ainda adicionou caveats (ABAC condicional).
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Linguagem', v: 'Go — single binary spicedb, fácil de containerizar' },
            { k: 'Storage', v: 'Postgres, CockroachDB, Spanner, MySQL (em ordem de maturidade)' },
            { k: 'API', v: 'gRPC primário + HTTP/JSON gateway; SDKs em Go, Java, Node, Python, Ruby' },
            { k: 'Performance', v: 'sub-ms checks em cache hot, p99 < 10ms em produção típica' },
            { k: 'Cloud', v: 'Authzed Dedicated / Serverless — managed; SpiceDB self-host livre' },
          ]}
        />
      </Section>

      <Section title="Schema Language: declarando o domínio" accent={accent}>
        <p>
          A primeira coisa a desenhar é o schema. SpiceDB tem uma DSL própria, type-safe, com tooling (zed CLI, playground.authzed.com). Exemplo de schema Drive-like:
        </p>
        <CodeBlock lang="text" filename="schema.zed">{`definition user {}

definition organization {
  relation admin: user
  relation member: user

  permission manage = admin
  permission view = admin + member
}

definition folder {
  relation parent: folder | organization
  relation owner: user
  relation editor: user
  relation viewer: user

  permission write = owner + editor + parent->write
  permission read  = viewer + write + parent->read
}

definition document {
  relation parent: folder
  relation owner: user
  relation editor: user
  relation viewer: user

  permission write = owner + editor + parent->write
  permission read  = viewer + write + parent->read
  permission share = owner + parent->write
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'definition X {}', v: 'declara o tipo de objeto (user, folder, document)' },
            { k: 'relation r: T', v: 'aceita tuplas vinculando este objeto a usuários do tipo T' },
            { k: '+ / & / -', v: 'union, intersection, exclusion na composição de permissions' },
            { k: 'parent->read', v: 'tuple-to-userset: para cada tupla parent, avalia read no objeto pai' },
            { k: '| (pipe)', v: 'union de tipos aceitos: parent: folder | organization' },
          ]}
        />
        <Callout tone="info" icon="🎯">
          Essa DSL substitui o protobuf de namespace config do paper Zanzibar — mesma expressividade, leitura humana. <InlineCode>zed schema write</InlineCode> aplica em prod; versionado em git.
        </Callout>
      </Section>

      <Section title="Os 4 verbos da API" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['API', 'Quando usar', 'Latência alvo']}
          rows={[
            ['WriteRelationships', 'Criar/deletar tuplas (compartilhar doc, adicionar membro)', '~10-30ms (storage commit)'],
            ['CheckPermission', 'Pode user X fazer ação Y no recurso Z? — path do request HTTP', '<10ms p99 (cache hot)'],
            ['LookupResources', '"Quais docs Tom pode ler?" — UI de listagem do user', 'Stream; depende do fan-out'],
            ['LookupSubjects', '"Quem tem acesso ao doc X?" — UI de admin/share', 'Stream; depende do grafo'],
            ['ExpandPermission', 'Debug: quem deriva essa perm e por quê', '~50ms; uso esporádico'],
            ['ReadRelationships', 'Listar tuplas brutas (compliance, audit)', 'Stream paginado'],
          ]}
        />
      </Section>

      <Section title="Exemplo end-to-end: compartilhar e checar" accent={accent}>
        <CodeBlock lang="typescript" filename="app/share.ts">{`import { v1 } from '@authzed/authzed-node';

const client = v1.NewClient('YOUR_API_TOKEN', 'spicedb.example.com:50051');

// 1. Alice compartilha doc:report-q1 com Bob como editor
const writeResp = await client.promises.writeRelationships(
  v1.WriteRelationshipsRequest.create({
    updates: [
      v1.RelationshipUpdate.create({
        operation: v1.RelationshipUpdate_Operation.CREATE,
        relationship: v1.Relationship.create({
          resource: { objectType: 'document', objectId: 'report-q1' },
          relation: 'editor',
          subject: { object: { objectType: 'user', objectId: 'bob' } },
        }),
      }),
    ],
  }),
);

// IMPORTANTE: guardar o zedToken retornado
const zedToken = writeResp.writtenAt;  // ex: 'GhUKEzE2Nz...'
await db.documents.update({
  where: { id: 'report-q1' },
  data: { authzZedToken: zedToken.token },
});

// 2. Bob faz GET /docs/report-q1 — middleware checa
const check = await client.promises.checkPermission(
  v1.CheckPermissionRequest.create({
    resource: { objectType: 'document', objectId: 'report-q1' },
    permission: 'read',
    subject: { object: { objectType: 'user', objectId: 'bob' } },
    consistency: v1.Consistency.create({
      requirement: { oneofKind: 'atLeastAsFresh',
        atLeastAsFresh: { text: doc.authzZedToken },
      },
    }),
  }),
);

if (check.permissionship !== v1.CheckPermissionResponse_Permissionship.HAS_PERMISSION) {
  throw new ForbiddenError();
}`}</CodeBlock>
        <Callout tone="warn" icon="🔐">
          O <InlineCode>authzZedToken</InlineCode> persistido junto ao recurso é o que garante consistência. Sem ele, você pode ler dados com permissões obsoletas — exatamente o new enemy problem.
        </Callout>
      </Section>

      <Section title="Caveats: ABAC dentro de ReBAC" accent={accent}>
        <p>
          A maior limitação histórica do ReBAC puro: como expressar &quot;Bob pode ler MAS apenas do escritório (IP no CIDR corporativo)&quot;? Em SpiceDB pós-2023, caveats resolvem isso via expressões CEL avaliadas em runtime.
        </p>
        <CodeBlock lang="text" filename="schema.zed">{`caveat ip_allowlist(user_ip string, allowed_cidrs list<string>) {
  user_ip.isIpAddress() && user_ip.ipInCidrList(allowed_cidrs)
}

definition document {
  relation viewer: user with ip_allowlist
  permission read = viewer
}`}</CodeBlock>
        <CodeBlock lang="typescript">{`// Write da tupla COM contexto fixo
await client.promises.writeRelationships({
  updates: [{
    operation: 'CREATE',
    relationship: {
      resource: { objectType: 'document', objectId: 'sensitive' },
      relation: 'viewer',
      subject: { object: { objectType: 'user', objectId: 'bob' } },
      optionalCaveat: {
        caveatName: 'ip_allowlist',
        context: { allowed_cidrs: ['10.0.0.0/8', '192.168.0.0/16'] },
      },
    },
  }],
});

// Check passando contexto runtime
await client.promises.checkPermission({
  resource: { objectType: 'document', objectId: 'sensitive' },
  permission: 'read',
  subject: { object: { objectType: 'user', objectId: 'bob' } },
  context: { user_ip: req.ip },  // contexto dinâmico do request
});`}</CodeBlock>
      </Section>

      <Section title="Arquitetura de deployment" accent={accent}>
        <NodeGraph
          accent={accent}
          title="SpiceDB em produção (multi-region)"
          columns={[
            {
              label: 'App tier',
              nodes: [
                { label: 'API service', sub: 'gRPC client ao SpiceDB' },
                { label: 'GraphQL gateway', sub: 'middleware authz' },
              ],
            },
            {
              label: 'SpiceDB',
              nodes: [
                { label: 'spicedb (stateless)', sub: 'N réplicas atrás de LB' },
                { label: 'Dispatcher (consistent hashing)', sub: 'co-locate subqueries' },
                { label: 'Cache (Ristretto)', sub: 'in-memory por nó' },
              ],
            },
            {
              label: 'Storage',
              nodes: [
                { label: 'Postgres / CRDB', sub: 'tuplas + logical replication' },
                { label: 'Watch API', sub: 'CDC para invalidação' },
              ],
            },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Dispatcher', v: 'roteia subqueries de uma expansão para o mesmo nó via consistent hashing — maximiza cache locality' },
            { k: 'Cache Ristretto', v: 'caches in-memory (Go); decisões + intermediate usersets — TTL invalidado por Watch' },
            { k: 'Logical replication', v: 'Postgres `wal_level=logical` + slot dedicado; cuidado com lag' },
            { k: 'Read replicas', v: 'Postgres replicas para Lookup* APIs (caras) — main pra Check' },
          ]}
        />
      </Section>

      <Section title="Performance: como tirar sub-ms" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Fluxo do check no SpiceDB (path otimista)"
          steps={[
            { label: 'Receive Check', desc: 'gRPC handler, parse request' },
            { label: 'Cache lookup', desc: 'Ristretto: hit → retorna em ~100µs' },
            { label: 'Dispatch', desc: 'miss → consistent-hash para nó dono do (resource, perm)' },
            { label: 'Expand userset', desc: 'recursivo: avalia rewrite, busca tuplas, fan-out' },
            { label: 'Storage read', desc: 'Postgres: at_exact_snapshot via xmin (TID-based)' },
            { label: 'Cache store', desc: 'subtree cacheada para próximas queries' },
          ]}
        />
        <Callout tone="info" icon="⚡">
          Tuning crítico: <InlineCode>--dispatch-cluster-enabled</InlineCode> e <InlineCode>--dispatch-cache-*</InlineCode>. Sem isso, você não chega aos números do paper. Em single-node dev é fine, mas em produção dispatch cluster é obrigatório.
        </Callout>
      </Section>

      <Section title="Modelagem real: multi-tenant SaaS" accent={accent}>
        <CodeBlock lang="text" filename="schema-saas.zed">{`definition user {}

definition organization {
  relation admin: user
  relation billing_admin: user
  relation member: user

  permission manage = admin
  permission view_billing = admin + billing_admin
  permission view = admin + billing_admin + member
}

definition project {
  relation org: organization
  relation owner: user
  relation contributor: user

  permission manage = owner + org->admin
  permission write = manage + contributor
  permission read  = write + org->member
}

definition issue {
  relation project: project
  relation assignee: user
  relation reporter: user

  permission manage = reporter + project->manage
  permission write  = manage + assignee + project->write
  permission read   = project->read
}`}</CodeBlock>
        <p className="text-sm mt-2">
          Note como herança org → project → issue é declarativa. Adicionar &quot;guest&quot; ao projeto não exige role nova nem mudança de schema — basta tupla <InlineCode>project:web#contributor@user:guest</InlineCode>. Esse é o ganho fundamental sobre RBAC.
        </p>
      </Section>

      <Section title="Operando: zed CLI, dev container, testing" accent={accent}>
        <StackFlow
          accent={accent}
          title="Workflow de desenvolvimento SpiceDB"
          items={[
            { layer: 'Local dev', items: ['spicedb serve-testing', 'in-memory', 'auto-reload schema'], description: 'roda como container ou binário; sem persistência' },
            { layer: 'Schema mgmt', items: ['zed schema read/write', 'arquivos .zed versionados', 'PR review do schema'], description: 'mudanças de schema são revisadas como código' },
            { layer: 'Testing', items: ['zed validate', 'assertions YAML', 'snapshot tests'], description: 'validação declarativa: "user:tom + read + doc:x = permit"' },
            { layer: 'CI/CD', items: ['validate em PR', 'apply schema staging', 'canary prod'], description: 'schema migrations são append-mostly; backward compat' },
            { layer: 'Observability', items: ['OpenTelemetry traces', 'prometheus metrics', 'zed CLI debug'], description: 'cada Check traceado; expand para auditoria' },
          ]}
        />
        <CodeBlock lang="yaml" filename="validation.yaml">{`schema: |
  definition user {}
  definition doc {
    relation viewer: user
    relation editor: user
    permission read = viewer + editor
  }

relationships: |
  doc:report#editor@user:alice
  doc:report#viewer@user:bob

assertions:
  assertTrue:
    - doc:report#read@user:alice  # editor pode ler
    - doc:report#read@user:bob    # viewer pode ler
  assertFalse:
    - doc:report#read@user:charlie  # nem editor nem viewer`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar SpiceDB" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>App pequeno com RBAC puro</strong>: 5 roles fixas, sem sharing → SQL bem modelado é mais simples e tem 1 dependência a menos.</li>
          <li><strong>Decisões puramente sobre código/infra</strong>: K8s admission, terraform — use OPA, é o nicho dele.</li>
          <li><strong>Sem orçamento de operação para storage stateful</strong>: SpiceDB precisa de Postgres com replication. Se você não tem time/orçamento, considere OpenFGA managed (Auth0 FGA) ou AVP.</li>
          <li><strong>Compliance que exige policy-as-code legível por auditor</strong>: Cedar e OPA escrevem regras em texto. SpiceDB é estrutural + dado — alguns auditores estranham.</li>
        </ul>
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>SpiceDB (Authzed, Apache 2.0) é a implementação Zanzibar mais madura — fiel ao paper.</li>
          <li>Schema language declarativa, type-safe, versionada em git. Substitui o protobuf do paper.</li>
          <li>APIs Check/Expand/Lookup{'{'}Resources,Subjects{'}'}/Write — 4 verbos resolvem o caso de uso completo.</li>
          <li>ZedTokens portam Zookies: persistir junto ao recurso, enviar em CheckPermission para consistência.</li>
          <li>Caveats (2023) trazem ABAC condicional via CEL — preenchem o gap histórico do ReBAC puro.</li>
          <li>Storage: Postgres ou CockroachDB. Dispatch cluster + cache Ristretto = sub-ms checks.</li>
          <li>Use para: SaaS multi-tenant com sharing, Drive/Notion-like, IAM granular. Evite para: 5 roles fixas, infra-policy.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
