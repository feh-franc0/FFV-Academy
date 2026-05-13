import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox } from '@/components/article/primitives';

export const metadata = getModuleMetadata('openfga-pratica');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a relação entre OpenFGA, Auth0 e CNCF?',
    options: [
      'São produtos independentes',
      'OpenFGA foi criado pela Auth0 (Okta) em 2022, doado ao CNCF Sandbox em 2022 — open-source Apache 2.0; Auth0 FGA é a versão SaaS gerenciada por cima',
      'CNCF criou OpenFGA',
      'Okta comprou OpenFGA',
    ],
    correct: 1,
    explanation: 'OpenFGA = "Fine-Grained Authorization", inspirado no Zanzibar (sem afiliação Google). Auth0 (parte da Okta) liderou a criação, doou ao CNCF para garantir neutralidade. Auth0 FGA é o serviço gerenciado. Por DX-first (modeling DSL simples, Playground), ganhou tração rápida em alternativa ao SpiceDB.',
  },
  {
    question: 'Qual a diferença prática entre o "modeling language" do OpenFGA e o schema do SpiceDB?',
    options: [
      'Idênticos',
      'OpenFGA usa sintaxe DSL simplificada (tipo: define X as Y or Z); SpiceDB tem DSL mais expressiva (operadores +/-/&, type pipes). OpenFGA é mais fácil de escrever, SpiceDB de modelar casos complexos.',
      'OpenFGA usa YAML',
      'SpiceDB usa JSON',
    ],
    correct: 1,
    explanation: 'Ambos compilam pro mesmo modelo Zanzibar. OpenFGA: `define viewer: [user] or editor` — declarativo e legível. SpiceDB: `permission view = viewer + editor`. OpenFGA tem Playground (UI online) e foco em DX para devs sem background formal; SpiceDB tem ferramental mais maduro para CI/CD e validação.',
  },
  {
    question: 'O que são "conditional tuples" no OpenFGA?',
    options: [
      'Tuplas condicionais opcionais',
      'Equivalente a caveats do SpiceDB: a tupla carrega expressão CEL (Common Expression Language) avaliada no check com contexto runtime — permite ABAC dentro do ReBAC',
      'Tuplas com TTL',
      'Cache hints',
    ],
    correct: 1,
    explanation: 'Adicionadas em 2023 ao OpenFGA. Você define um type com `condition` block (CEL), e cada tupla pode amarrar uma condição. No CheckRequest, envia o context. Caso de uso clássico: time-bound access ("Bob é viewer ATÉ 2026-01-01") ou IP-restrict.',
  },
  {
    question: 'Auth0 FGA cloud difere do OpenFGA self-host como?',
    options: [
      'Não difere',
      'Auth0 FGA é o mesmo OpenFGA gerenciado — multi-region, SLA, console UI, pricing por checks. OpenFGA self-host é gratuito Apache 2.0 — você opera o cluster e storage.',
      'Auth0 FGA não suporta Zanzibar',
      'Auth0 FGA é proprietário fechado',
    ],
    correct: 1,
    explanation: 'Auth0 FGA = OpenFGA + cloud ops (storage gerenciado, replicação, autoscaling, SLA, dashboards). API idêntica — você troca endpoint e adiciona credenciais. Use FGA managed se não quer operar Postgres/MySQL para tuplas. Para grandes volumes (1B+ tuplas) ou compliance restrita, self-host vence.',
  },
  {
    question: 'Qual API OpenFGA é equivalente ao LookupResources do SpiceDB?',
    options: [
      'Read',
      'ListObjects(user, relation, type) → lista de IDs de recurso onde o user tem a relação — reverse query usada em UIs de listagem',
      'Check em batch',
      'BatchAuthorization',
    ],
    correct: 1,
    explanation: 'OpenFGA: ListObjects e ListUsers (equivalentes a LookupResources/LookupSubjects). BatchCheck também existe — N checks em uma chamada. Trade-off: ListObjects depende do fan-out do grafo; para tipos com muitos recursos, considere paginação + indexação no app, não dependa só do FGA.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="openfga-pratica"
      title="OpenFGA: alternativa Auth0/Okta para Zanzibar"
      icon="🔓"
      xp={65}
      readTime={13}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="opa-rego-policies"
      nextTitle="OPA / Rego: policy as code para infra e API"
      quiz={quiz}
    >
      <Section title="OpenFGA em uma frase" accent={accent}>
        <p>
          <strong>OpenFGA</strong> (Open Fine-Grained Authorization) é a implementação ReBAC criada pela <strong>Auth0/Okta</strong> em 2022 e doada ao <strong>CNCF</strong> (Sandbox) no mesmo ano. Apache 2.0. Inspirada no Zanzibar do Google, com foco em DX (Developer Experience) — modeling language simplificada, Playground online, SDKs em 9+ linguagens.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Origem', v: 'Auth0 / Okta — Andres Aguiar, equipe de plataforma. Doado ao CNCF.' },
            { k: 'Linguagem', v: 'Go — single binary openfga' },
            { k: 'Storage', v: 'Postgres, MySQL, memory (dev). Sem CockroachDB nativo (use Citus se quiser HA).' },
            { k: 'Cloud', v: 'Auth0 FGA — versão gerenciada com SLA e UI' },
            { k: 'Quando escolher OpenFGA vs SpiceDB', v: 'OpenFGA: DX-first, Playground online, gerenciado via Auth0. SpiceDB: modeling mais expressivo, CRDB nativo, alinhamento estrito ao paper.' },
          ]}
        />
      </Section>

      <Section title="Modeling Language: simples por design" accent={accent}>
        <CodeBlock lang="text" filename="model.fga">{`model
  schema 1.1

type user

type organization
  relations
    define admin: [user]
    define member: [user]
    define can_view: admin or member

type folder
  relations
    define parent: [folder, organization]
    define owner: [user]
    define editor: [user]
    define viewer: [user]
    define can_edit: owner or editor or parent.can_edit
    define can_view: viewer or can_edit or parent.can_view

type document
  relations
    define parent: [folder]
    define owner: [user]
    define editor: [user]
    define viewer: [user]
    define can_edit: owner or editor or parent.can_edit
    define can_view: viewer or can_edit or parent.can_view`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'type X', v: 'declara o tipo de objeto. Sem chaves nem ponto-e-vírgula.' },
            { k: 'relations', v: 'bloco onde definimos tuplas e permissões derivadas (não há separação semântica entre os dois — tudo é "relation")' },
            { k: 'define rel: [type]', v: 'aceita tuplas diretas vinculando este objeto a sujeitos do tipo declarado' },
            { k: 'or / and / but not', v: 'union, intersection, exclusion — sintaxe textual, sem operadores' },
            { k: 'parent.can_edit', v: 'tuple-to-userset: para cada parent, avalia can_edit no objeto pai' },
          ]}
        />
        <Callout tone="info" icon="💡">
          A diferença DX é tangível: <InlineCode>can_view: viewer or can_edit or parent.can_view</InlineCode> lê como inglês. Comparado ao SpiceDB <InlineCode>permission view = viewer + write + parent-&gt;view</InlineCode> — equivalentes, mas o primeiro é mais didático.
        </Callout>
      </Section>

      <Section title="API: 5 verbos canônicos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['API', 'Função', 'Quando']}
          rows={[
            ['Write', 'CRUD em tuplas (compartilhar, adicionar membro)', 'A cada ação de share/role mgmt'],
            ['Check', 'user pode fazer ação? — single decision', 'Path do request HTTP, middleware'],
            ['BatchCheck', 'N checks em paralelo numa chamada', 'GraphQL com N entidades, dashboard'],
            ['ListObjects', 'Quais recursos do tipo T user pode acessar?', 'UI de listagem ("Meus docs")'],
            ['ListUsers', 'Quem tem acesso a este recurso?', 'UI de compartilhamento, admin'],
            ['Expand', 'Árvore de derivação da permission', 'Debug, auditoria'],
            ['Read', 'Listar tuplas brutas (paginated)', 'Compliance, export'],
          ]}
        />
      </Section>

      <Section title="Exemplo end-to-end: SDK Node" accent={accent}>
        <CodeBlock lang="typescript" filename="app/fga.ts">{`import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';

const fga = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL!,
  storeId: process.env.FGA_STORE_ID!,
  authorizationModelId: process.env.FGA_MODEL_ID!,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: process.env.FGA_CLIENT_ID!,
      clientSecret: process.env.FGA_CLIENT_SECRET!,
      apiTokenIssuer: 'auth.fga.dev',
      apiAudience: 'https://api.us1.fga.dev/',
    },
  },
});

// 1. Compartilhar doc com Bob como editor
await fga.write({
  writes: [
    { user: 'user:bob', relation: 'editor', object: 'document:report-q1' },
  ],
});

// 2. Checar permissão de Bob no doc
const { allowed } = await fga.check({
  user: 'user:bob',
  relation: 'can_view',
  object: 'document:report-q1',
});

if (!allowed) throw new ForbiddenError();

// 3. Listar documents que Bob pode visualizar
const { objects } = await fga.listObjects({
  user: 'user:bob',
  relation: 'can_view',
  type: 'document',
});
// → ['document:report-q1', 'document:notes', ...]`}</CodeBlock>
      </Section>

      <Section title="Conditional tuples (ABAC dentro do ReBAC)" accent={accent}>
        <p>
          Como em SpiceDB caveats, OpenFGA permite anexar condições CEL às tuplas. Use case clássico: acesso temporário (até timestamp X) ou IP-restricted.
        </p>
        <CodeBlock lang="text" filename="model-conditional.fga">{`model
  schema 1.1

type user

type document
  relations
    define viewer: [user, user with non_expired_grant]
    define can_view: viewer

condition non_expired_grant(current_time: timestamp, grant_expires_at: timestamp) {
  current_time < grant_expires_at
}`}</CodeBlock>
        <CodeBlock lang="typescript">{`// Adicionar viewer COM condição
await fga.write({
  writes: [{
    user: 'user:guest',
    relation: 'viewer',
    object: 'document:demo',
    condition: {
      name: 'non_expired_grant',
      context: { grant_expires_at: '2026-12-31T23:59:59Z' },
    },
  }],
});

// Check passando o contexto runtime
await fga.check({
  user: 'user:guest',
  relation: 'can_view',
  object: 'document:demo',
  context: { current_time: new Date().toISOString() },
});`}</CodeBlock>
      </Section>

      <Section title="Consistência: ImplicitTuples vs OpenFGA ConsistencyPreference" accent={accent}>
        <p>
          OpenFGA tem opção <InlineCode>consistency</InlineCode> no Check: <strong>MINIMIZE_LATENCY</strong> (default — pode usar cache stale) e <strong>HIGHER_CONSISTENCY</strong> (força leitura recente do storage). Não há &quot;ZedToken/Zookie&quot; explícito; a mitigação do new enemy problem fica por conta dessa flag.
        </p>
        <CodeBlock lang="typescript">{`// Path crítico (após write de revogação) — força consistência
const result = await fga.check({
  user: 'user:bob',
  relation: 'can_view',
  object: 'document:sensitive',
  consistency: 'HIGHER_CONSISTENCY',
});`}</CodeBlock>
        <Callout tone="warn" icon="⚖️">
          Trade-off vs SpiceDB: ZedTokens permitem consistência granular &quot;at_least_as_fresh ≥ X&quot;; OpenFGA é binário (latency vs strict). Em prática, sufficient na maioria dos casos, mas conheça a diferença ao desenhar.
        </Callout>
      </Section>

      <Section title="Playground: o killer feature DX" accent={accent}>
        <p>
          <strong>play.fga.dev</strong> é o playground oficial — UI online onde você cola o modelo, adiciona tuplas, executa checks e visualiza o grafo. Não exige login para uso básico. É a melhor maneira de prototipar autorização sem instalar nada — superior em DX ao zed CLI para iteração inicial.
        </p>
        <FlowDiagram
          accent={accent}
          title="Workflow Playground → Produção"
          steps={[
            { label: 'Prototype', desc: 'Modela tipos e relações no Playground; testa com tuplas mock' },
            { label: 'Export model', desc: 'Copia o JSON do authorization model gerado' },
            { label: 'Version control', desc: 'Salva model.fga no repo; CI valida com fga CLI' },
            { label: 'Deploy', desc: 'CreateAuthorizationModel — model é versionado, IDs imutáveis' },
            { label: 'App integration', desc: 'SDK aponta para o modelId; rollback = trocar modelId' },
          ]}
        />
      </Section>

      <Section title="OpenFGA vs SpiceDB: a decisão" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="SaaS B2B precisando ReBAC com 10-50k usuários e 1-5 desenvolvedores no time"
          winner="OpenFGA (especialmente Auth0 FGA managed)"
          why="DX superior (Playground, modeling simples), managed cloud reduz ops, conditional tuples cobrem casos ABAC. SpiceDB ganha quando você precisa de CockroachDB nativo, ZedTokens granulares, ou já tem time forte em SRE."
          alternatives={[
            { name: 'OpenFGA self-host', note: 'Bom equilíbrio gratuito; Postgres simples; sem managed overhead' },
            { name: 'Auth0 FGA cloud', note: 'Zero ops; pricing por checks; ideal para time pequeno' },
            { name: 'SpiceDB', note: 'Mais maduro em modeling complexo; CRDB; ZedTokens granulares' },
            { name: 'Permit.io', note: 'PDP gerenciado com OpenFGA por baixo + RBAC/ABAC; B2B com no-code admin' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'OpenFGA', 'SpiceDB']}
          rows={[
            ['Linguagem core', 'Go', 'Go'],
            ['Origem', 'Auth0/Okta → CNCF', 'Authzed (Red Hat alumni)'],
            ['Modeling', 'DSL declarativa, prosa-like', 'DSL com operadores +/-/&'],
            ['Playground online', 'play.fga.dev (✓)', 'authzed.com/playground (✓)'],
            ['CockroachDB nativo', '— (use Citus)', '✓'],
            ['Conditional rules', 'Conditional tuples (CEL)', 'Caveats (CEL)'],
            ['Consistência granular', 'Latency vs HigherConsistency (binário)', 'ZedTokens (at_least_as_fresh granular)'],
            ['Managed cloud', 'Auth0 FGA', 'Authzed Dedicated / Serverless'],
            ['CNCF', 'Sandbox (2022)', '— (governança Authzed)'],
            ['Maturidade modeling complexo', 'Boa', 'Excelente'],
          ]}
        />
      </Section>

      <Section title="Operando OpenFGA self-host" accent={accent}>
        <CodeBlock lang="bash">{`# Docker — desenvolvimento
docker run -p 8080:8080 -p 8081:8081 -p 3000:3000 \\
  openfga/openfga:latest run

# Postgres backend — produção
docker run -e OPENFGA_DATASTORE_ENGINE=postgres \\
  -e OPENFGA_DATASTORE_URI=postgres://user:pass@host/openfga \\
  -p 8080:8080 -p 8081:8081 \\
  openfga/openfga:latest run

# Health
curl http://localhost:8080/healthz
# → {"status":"SERVING"}

# CLI
fga store create --name "saas-prod"
fga model write --store-id 01H... --file model.fga`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Portas', v: '8080 HTTP, 8081 gRPC, 3000 Playground UI' },
            { k: 'Stores', v: 'isolamento por tenant — um store por organização-cliente em SaaS multi-tenant' },
            { k: 'Models', v: 'imutáveis, com ID; deploy de model novo cria versão; rollback = mudar modelId no app' },
            { k: 'Observability', v: 'Prometheus metrics nativo, OTel traces, gRPC reflection' },
          ]}
        />
      </Section>

      <Section title="Padrões anti-pattern em OpenFGA" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Um store global compartilhado entre tenants</strong>: difícil isolar, vaza tuplas em queries de admin. Use 1 store por tenant em SaaS sério.</li>
          <li><strong>ListObjects em tipos com 100k+ objetos</strong>: o fan-out pode demorar segundos. Combine com indexação no app (search engine) e use FGA só para checagem fina.</li>
          <li><strong>Não versionar o modelo no git</strong>: o JSON do authorization model deve estar no repo; mudanças via PR. Sem isso, evoluir o schema vira aventura.</li>
          <li><strong>Tuplas geradas dinamicamente em batch sem dedup</strong>: writes são idempotentes mas tem custo; use BatchWrite e cheque se a tupla já existe quando relevante.</li>
        </ul>
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>OpenFGA = implementação Zanzibar do Auth0/Okta, CNCF Sandbox 2022, Apache 2.0.</li>
          <li>Modeling DSL legível como prosa: <InlineCode>define can_view: viewer or editor or parent.can_view</InlineCode>.</li>
          <li>API: Check / BatchCheck / Write / ListObjects / ListUsers / Expand / Read.</li>
          <li>Conditional tuples (CEL) trazem ABAC para dentro do ReBAC — paridade com caveats SpiceDB.</li>
          <li>Auth0 FGA cloud = OpenFGA gerenciado: zero ops, ideal para times pequenos.</li>
          <li>Playground online (play.fga.dev) é o killer DX para prototipar autorização.</li>
          <li>Escolha vs SpiceDB: OpenFGA por DX e managed cloud; SpiceDB por modeling complexo, CRDB e ZedTokens.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
