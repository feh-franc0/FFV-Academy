import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, NodeGraph, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('zanzibar-google-rebac');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'O paper Zanzibar (Pang et al, USENIX ATC 2019) propõe modelar autorização como:',
    options: [
      'Árvore de roles hierárquicas',
      'Tuplas de RELAÇÃO entre objetos: "user:tom is editor of doc:readme", armazenadas como dado mutável e consultáveis via API check/expand',
      'Grafo de policies XACML',
      'Tabela SQL de permissions',
    ],
    correct: 1,
    explanation: 'A insight central do paper é mover a autorização de POLICY (estática) para DADO (relação como fato). Cada fato é uma tupla `<object>#<relation>@<user>` — ex: `doc:readme#editor@user:tom`. Permissões viram derivações sobre essas relações (userset rewrites). É o que permite Google Drive/YouTube/Photos compartilharem a mesma engine.',
  },
  {
    question: 'O que é um "userset rewrite" no Zanzibar?',
    options: [
      'Reescrita do JWT',
      'Regra que define uma permissão derivada a partir de relações — ex: viewer = direct_viewer ∪ editor ∪ owner ∪ parent_folder.viewer. Permite herança e composição.',
      'Cache de usuários',
      'Migração de schema',
    ],
    correct: 1,
    explanation: 'Userset rewrites são o "engine de derivação" do Zanzibar. Definem permissões compostas via união, interseção, exclusão e indireção através de relações tuple-to-userset. Exemplo do paper: `comment_view` = `comment_owner ∪ comment_parent.viewer` — viewer de um comentário = quem é dono OU quem vê o post pai. É como views materializadas para autorização.',
  },
  {
    question: 'O que é um "Zookie" e por que é crucial em Zanzibar?',
    options: [
      'Cookie de sessão',
      'Token opaco que representa um SNAPSHOT consistente do estado da autorização — permite "new enemy problem" mitigation: garantir que a leitura reflete um estado pós-revogação',
      'Cache key',
      'JWT customizado',
    ],
    correct: 1,
    explanation: 'O "new enemy problem": Alice revoga acesso de Bob ao doc, e adiciona conteúdo sensível. Sem consistency, Bob ainda lê (cache stale). Zookie codifica um Spanner timestamp e diz: "leia com consistência ≥ este momento". Aplicações pegam zookie no write e enviam no read subsequente. Sem zookies, ReBAC pode vazar dados — é a contribuição mais sutil do paper.',
  },
  {
    question: 'Como Zanzibar atinge sub-10ms p99 em escala global?',
    options: [
      'Tudo em RAM no master',
      'Leopard caching layer (cache de userset expansion) + Spanner como source of truth + replicação geográfica + fan-out estratégia para nested groups',
      'Sharding por user_id',
      'GPUs para grafo',
    ],
    correct: 1,
    explanation: 'Stack do paper: Spanner (storage globalmente consistente, atomic timestamps), Leopard indexing system (cache de userset rewrites pré-computados, evita expandir grafo recursivamente em cada check), spanner reads com bounded staleness para reads non-zookie, fan-out paralelo em expansões grandes. p50 ~3ms, p99 ~20ms a 10M+ QPS.',
  },
  {
    question: 'Qual API NÃO faz parte do Zanzibar canonical?',
    options: [
      'check(user, relation, object) → boolean',
      'expand(object, relation) → userset tree',
      'read/write tuples',
      'evaluate-policy-as-code(rego) → decision',
    ],
    correct: 3,
    explanation: 'Zanzibar é DADO-cêntrico, não policy-as-code. APIs canônicas: Read/Write (CRUD em tuplas), Check (decisão pontual), Expand (debug — retorna a árvore de derivação), Watch (mudanças em tempo real). Avaliação de policy escrita em DSL (Rego, Cedar) é o domínio de OPA/Cedar, NÃO de Zanzibar — ferramentas complementares, não substitutas.',
  },
  {
    question: 'O modelo de namespaces em Zanzibar serve para:',
    options: [
      'Multi-tenancy de aplicações',
      'Separar schemas de relações por aplicação (drive, youtube, photos) — cada namespace define seus objects, relations e userset rewrites. Permite uma engine compartilhada com semânticas distintas.',
      'Cache key prefixes',
      'Rotação de tokens',
    ],
    correct: 1,
    explanation: 'Cada namespace é um schema: define objetos (`doc`, `folder`), relações (`viewer`, `editor`, `parent`) e rewrites. Google roda Drive, YouTube, Calendar, Photos em UMA instância Zanzibar com namespaces distintos. SpiceDB e OpenFGA mantêm o conceito — você define schemas separados por domínio dentro do mesmo cluster.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="zanzibar-google-rebac"
      title="Zanzibar: o paper do Google que mudou autorização"
      icon="📄"
      xp={75}
      readTime={15}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="spicedb-implementacao"
      nextTitle="SpiceDB: Zanzibar open-source na prática"
      quiz={quiz}
    >
      <Section title="O paper que reordenou o campo" accent={accent}>
        <p>
          <strong>&quot;Zanzibar: Google&apos;s Consistent, Global Authorization System&quot;</strong> — Pang, Hoffmann, Wesołowski et al, <em>USENIX ATC 2019</em>. É o paper de autorização mais influente da década. Resolveu, em produção real, três problemas que ninguém mais tinha resolvido junto:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Escala global', v: '~10M QPS, 95% sub-10ms p99, durante uma década rodando Drive/YouTube/Photos/Cloud' },
            { k: 'Consistência forte', v: 'Spanner por baixo + Zookies para evitar "new enemy problem" sem custo de coordenação global em todo read' },
            { k: 'Modelo flexível', v: 'Uma engine roda RBAC, ABAC e ReBAC com schemas customizáveis por namespace' },
          ]}
        />
        <Callout tone="info" icon="📄">
          Leitura obrigatória: <strong>research.google/pubs/pub48190</strong>. Após o paper, surgiram SpiceDB (2021), OpenFGA (2022, Auth0/CNCF), e o próprio AWS Verified Permissions (Cedar, 2023) absorveu ideias. ReBAC virou mainstream — antes era hipotético.
        </Callout>
      </Section>

      <Section title="O insight: relação como dado, não como policy" accent={accent}>
        <p>
          Em RBAC/ABAC clássicos, autorização é <em>regra</em>: &quot;admins podem editar invoices&quot;. Em Zanzibar, é <em>fato</em>: <InlineCode>doc:readme#editor@user:tom</InlineCode> — isto é uma tupla, gravada no banco, mutável como qualquer linha. A engine apenas <em>navega</em> o grafo dessas tuplas.
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Tupla canônica Zanzibar"
          formula="⟨object⟩#⟨relation⟩@⟨user-or-userset⟩"
          parts={[
            { text: 'object', annotation: 'recurso identificado: doc:readme, folder:planning, video:42' },
            { text: 'relation', annotation: 'tipo de vínculo: viewer, editor, owner, parent, member' },
            { text: 'user-or-userset', annotation: 'sujeito direto (user:tom) ou conjunto (group:eng#member — todos membros do group eng)' },
          ]}
        />
        <CodeBlock lang="text">{`# Exemplos de tuplas em produção
doc:readme#owner@user:tom
doc:readme#editor@user:alice
doc:readme#parent@folder:planning
folder:planning#viewer@group:eng#member
group:eng#member@user:bob

# Pergunta: Bob pode ler doc:readme?
# Resposta: SIM. doc:readme tem parent folder:planning;
#           folder:planning tem viewer = group:eng#member;
#           user:bob é member do group:eng. ✓`}</CodeBlock>
      </Section>

      <Section title="Userset rewrites: o engine de derivação" accent={accent}>
        <p>
          O modelo &quot;tupla é fato&quot; não basta — você precisa derivar &quot;viewer&quot; a partir de &quot;editor&quot; (todo editor é viewer), &quot;viewer&quot; a partir de &quot;folder.viewer&quot; (herança), etc. Isso é o userset rewrite — descrito no schema do namespace.
        </p>
        <CodeBlock lang="text">{`# Schema do namespace 'doc' (sintaxe simplificada do paper)
name: "doc"
relation { text: "owner" }
relation { text: "editor"
  userset_rewrite {
    union {
      child { _this {} }                       # tuplas diretas
      child { computed_userset { relation: "owner" } }  # owner ⊆ editor
    }
  }
}
relation { text: "viewer"
  userset_rewrite {
    union {
      child { _this {} }
      child { computed_userset { relation: "editor" } }
      child { tuple_to_userset {               # herança do folder pai
        tupleset { relation: "parent" }
        computed_userset { object: "$TUPLE_USERSET_OBJECT" relation: "viewer" }
      }}
    }
  }
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'union / intersection / exclusion', v: 'operações de conjunto sobre usersets — sintaxe puramente declarativa' },
            { k: 'computed_userset', v: 'indireção em MESMO objeto: owner ⊆ editor ⊆ viewer' },
            { k: 'tuple_to_userset', v: 'indireção via tupla intermediária — base da herança hierárquica (folder→doc, org→project)' },
            { k: '_this', v: 'tuplas diretas atribuídas explicitamente — o "raw data"' },
          ]}
        />
      </Section>

      <Section title="A API: 4 verbos que bastam" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['API', 'Pergunta', 'Latência alvo']}
          rows={[
            ['Read / Write', 'CRUD em tuplas — alterar fatos', 'Spanner consistente, ~10ms'],
            ['Check(user, rel, obj) → bool', 'usuário pode? — single decision', 'p95 < 10ms global'],
            ['Expand(obj, rel) → userset tree', 'quem tem essa relação? — debug', 'p95 < 50ms (recursivo)'],
            ['Watch(namespace) → stream', 'mudanças em tempo real — cache invalidation', 'streaming Spanner'],
          ]}
        />
        <p className="text-sm mt-2">
          Note o que <em>NÃO</em> existe: avaliação de policy escrita em DSL. Zanzibar não tem Rego/Cedar. A &quot;policy&quot; está no schema do namespace (rewrites). Para condições dinâmicas (ABAC), você combina Zanzibar com OPA/Cedar — não é &quot;substituição&quot;, é complemento.
        </p>
      </Section>

      <Section title="O 'new enemy problem' e os Zookies" accent={accent}>
        <p>
          Cenário: Alice tem doc compartilhado com Bob. Alice <em>remove</em> Bob, <em>depois</em> adiciona conteúdo confidencial. Sem garantias de ordenação, um read de Bob pode usar cache stale (ainda com Bob como editor) e ler o novo conteúdo. Esse é o <strong>new enemy problem</strong>.
        </p>
        <FlowDiagram
          accent={accent}
          title="Por que reads ingênuos vazam dados pós-revogação"
          steps={[
            { label: 't0', desc: 'Alice escreve: doc#editor@bob (Bob é editor)' },
            { label: 't1', desc: 'Alice remove tupla: doc#editor@bob (Bob não é mais)' },
            { label: 't2', desc: 'Alice adiciona conteúdo secreto ao doc' },
            { label: 't3', desc: 'Bob faz check(bob, viewer, doc) — réplica stale retorna PERMIT → vaza' },
          ]}
        />
        <Callout tone="warn" icon="🛡️">
          A solução naïve seria fazer todo read globalmente consistente — caro. Zanzibar inventou os <strong>Zookies</strong>: token opaco que codifica um Spanner timestamp. Cliente recebe zookie no write e envia no read; engine garante <em>&quot;reads ≥ esse momento&quot;</em>. Custo amortizado ~zero.
        </Callout>
        <CodeBlock lang="typescript">{`// Padrão de uso aplicacional
// 1. Write retorna zookie
const { zookie } = await zanzibar.write({
  tuple: 'doc:readme#editor@user:bob',
  op: 'delete',
});

// 2. App propaga zookie junto com o doc atualizado (cookie, header, db field)
await db.docs.update({ id: 'readme', content: secret, authz_zookie: zookie });

// 3. Próximo read SEMPRE envia zookie — garante consistência ≥ momento do delete
const allowed = await zanzibar.check({
  user: 'bob', rel: 'viewer', obj: 'doc:readme',
  consistency: { at_least_as_fresh: doc.authz_zookie }
});
// allowed === false, mesmo que a réplica local ainda tivesse a tupla antiga`}</CodeBlock>
      </Section>

      <Section title="Arquitetura interna: Spanner + Leopard + aclservers" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Stack interna do Zanzibar (paper §3)"
          columns={[
            {
              label: 'Client',
              nodes: [
                { label: 'aclserver', sub: 'ponto de entrada gRPC' },
                { label: 'Frontend cache', sub: 'caches L1 de checks recentes' },
              ],
            },
            {
              label: 'Compute',
              nodes: [
                { label: 'Check evaluator', sub: 'expande userset paralelo, fan-out' },
                { label: 'Leopard index', sub: 'pre-computed userset cache, atualiza via Watch' },
              ],
            },
            {
              label: 'Storage',
              nodes: [
                { label: 'Spanner', sub: 'tuplas, globalmente consistente, TrueTime' },
                { label: 'Zookie = timestamp', sub: 'token opaco com Spanner TS embutido' },
              ],
            },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'aclserver', v: 'process stateless de entrada, faz routing por namespace e paraleliza expansões' },
            { k: 'Leopard', v: 'sistema de indexação que pré-materializa userset expansions para nested groups grandes (group hierarchies em empresas com milhares de membros). Crítico para perf.' },
            { k: 'Spanner', v: 'storage tuplas + TrueTime API. Reads com bounded staleness para perf, strong reads quando zookie é fornecido.' },
            { k: 'Watch API', v: 'stream de mudanças usado por Leopard para invalidar caches em ~ms' },
          ]}
        />
      </Section>

      <Section title="Performance no paper (mídia comum)" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Números canônicos do paper (production data)"
          columns={[
            {
              title: 'QPS',
              nodes: [
                { label: '~10M+ QPS pico', tone: 'normal' },
                { label: 'fan-out paralelo em nested groups', tone: 'normal' },
              ],
            },
            {
              title: 'Latência',
              nodes: [
                { label: 'p50 ~3ms', tone: 'success' },
                { label: 'p99 ~20ms global', tone: 'success' },
                { label: 'p99.9 ~93ms', tone: 'normal' },
              ],
            },
            {
              title: 'Disponibilidade',
              nodes: [
                { label: '> 99.999% durante 3 anos', tone: 'success' },
                { label: 'graceful degradation', tone: 'normal' },
              ],
            },
          ]}
        />
        <Callout tone="info" icon="📊">
          Esses números foram o &quot;reality check&quot; do paper: ReBAC <em>funciona</em> em escala Google, não é só teoria. SpiceDB e OpenFGA não chegam a 10M QPS, mas alcançam sub-10ms p99 em escalas SaaS típicas (milhares de QPS por tenant).
        </Callout>
      </Section>

      <Section title="O que os filhos do Zanzibar herdaram" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Sistema', 'Mantém do paper', 'Diverge']}
          rows={[
            ['SpiceDB', 'Schema language, tuplas, check/expand, zookies (ZedTokens)', 'Postgres/CockroachDB como storage; sintaxe própria de schema'],
            ['OpenFGA', 'Tuplas, namespaces, modeling, check', 'Adiciona conditional tuples (ABAC), mais simples, foco em DX'],
            ['Auth0 FGA', 'OpenFGA gerenciado', 'SaaS-only, multi-region cloud-hosted'],
            ['AWS Verified Permissions', 'Conceito de policy-as-data + per-resource', 'Cedar (não Zanzibar — política como código), schema separado'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes do paper" accent={accent}>
        <QAItem
          q="Zanzibar substitui banco de dados?"
          a={<>Não. Zanzibar é só metadados de autorização. Os recursos (docs, vídeos) continuam em outros sistemas. Zanzibar guarda apenas tuplas <InlineCode>obj#rel@user</InlineCode>.</>}
        />
        <QAItem
          q="Como Zanzibar lida com ABAC (atributos dinâmicos)?"
          a={<>O paper original não lida — é puro ReBAC. Implementações modernas como OpenFGA adicionaram <em>conditional relationships</em> (tupla com CEL expression). Para produção, padrão é: ReBAC para sharing, OPA/Cedar paralelo para condições.</>}
        />
        <QAItem
          q="Por que zookies em vez de simplesmente strong reads?"
          a={<>Strong reads globalmente consistentes via Spanner custam ~100ms (round-trip TrueTime). Zookies amortizam: 90% dos reads são bounded staleness (~3ms). Só quando há propagação de revogação você paga consistência forte.</>}
        />
        <QAItem
          q="ReBAC torna RBAC obsoleto?"
          a={<>Não. RBAC continua ótimo para perms organizacionais coarse-grained (admin/staff/viewer). ReBAC vence para per-resource sharing (Drive, Notion, Figma). Maioria das produções usa híbrido: RBAC para roles organizacionais, ReBAC para resource sharing.</>}
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>Zanzibar (Pang et al, USENIX ATC 2019) é o paper-base de ReBAC moderno. Leitura obrigatória.</li>
          <li>Insight central: autorização vira <strong>dado</strong> (tuplas obj#rel@user), não regra estática.</li>
          <li>Userset rewrites (union/intersection/computed/tuple-to-userset) modelam herança e composição declarativamente.</li>
          <li>APIs: Check / Expand / Read-Write / Watch. Sem DSL de policy — combina-se com OPA/Cedar para ABAC.</li>
          <li>Zookies (tokens com Spanner TS) resolvem o &quot;new enemy problem&quot; sem custo de strong reads em todo path.</li>
          <li>Performance produção Google: ~10M QPS, p99 ~20ms global, 99.999% disponibilidade durante anos.</li>
          <li>Filhos: SpiceDB, OpenFGA (próximos módulos). Cedar diverge — policy-as-code, não data.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
