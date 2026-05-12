import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cedar-aws-authorization');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'Cedar foi lançado pela AWS como open-source em qual ano e linguagem?',
    options: [
      '2020, Go',
      '2023, Rust — focado em correção formal (formally verified), com type system explícito de entities, schema e policies',
      '2021, Java',
      '2024, Python',
    ],
    correct: 1,
    explanation: 'Cedar foi anunciado em maio de 2023 (re:Inforce). Implementado em Rust por motivos de correctness e performance. Diferencial técnico: a engine tem partes formalmente verificadas (Lean/Dafny) — o que importa para clientes regulados (govcloud, financeiro). É o policy language por trás do serviço Amazon Verified Permissions.',
  },
  {
    question: 'Qual diferença filosófica fundamental entre Cedar e Rego (OPA)?',
    options: [
      'Nenhuma',
      'Cedar é fortemente tipado com schema obrigatório (entities, actions, principals declarados); Rego é dinâmico, qualquer JSON. Cedar troca flexibilidade por análise estática + decidibilidade.',
      'Cedar é Turing-complete',
      'Cedar não suporta condições',
    ],
    correct: 1,
    explanation: 'O schema Cedar declara entity types, actions e seus contextos. O compiler valida policies contra o schema — erros em tempo de design, não runtime. Trade-off: você não pode escrever policies sobre estruturas arbitrárias como em Rego. O ganho: análise estática (find unreachable, detect overlapping, equivalence check).',
  },
  {
    question: 'A sintaxe de uma policy Cedar tem três blocos principais. Quais?',
    options: [
      'subject, verb, object',
      'effect (permit/forbid), scope (principal, action, resource) e when/unless (condições) — sintaxe SQL-like com type-checking estático',
      'package, rule, default',
      'definition, relation, permission',
    ],
    correct: 1,
    explanation: 'Ex: `permit (principal in Group::"eng", action == Action::"read", resource in Folder::"docs") when { resource.owner == principal };`. Effect declara permit/forbid (forbid sempre vence); scope é o "header" tipado; when/unless são condições booleanas. Sintaxe explicitamente projetada para legibilidade humana e análise estática.',
  },
  {
    question: 'Amazon Verified Permissions (AVP) é:',
    options: [
      'Versão proprietária do Cedar',
      'Serviço AWS managed que hospeda Cedar — policy store, schema, identity sources (Cognito), API IsAuthorized. Para devs que querem Cedar sem operar a engine.',
      'Replacement do IAM',
      'Console de IAM',
    ],
    correct: 1,
    explanation: 'AVP (re:Invent 2022, GA 2023) usa Cedar como engine subjacente. Você cria um Policy Store, define schema, sobe policies, integra com Cognito user pool ou identity próprio. App chama IsAuthorized via SDK. Pricing por authorization request. Use cases: SaaS multi-tenant on AWS sem operar SpiceDB/OPA.',
  },
  {
    question: 'Cedar suporta autorização hierárquica via:',
    options: [
      'Apenas RBAC',
      'Entity hierarchy via `parents` — uma User pode pertencer a Group, que pertence a Org; relação `in` é transitiva (User in Org se User in Group in Org). Cobre RBAC, ReBAC e parte de ABAC.',
      'Network ACLs',
      'IAM roles',
    ],
    correct: 1,
    explanation: 'No Cedar, cada entity pode declarar parents (lista). A relação `principal in Resource` é avaliada recursivamente. Isso permite modelar: groups (User in Group), folders (Doc in Folder in Folder), org hierarchy. Combinado com when {}, é RBAC + ABAC + parcialmente ReBAC numa policy só.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cedar-aws-authorization"
      title="Cedar (AWS): a alternativa nova de policy language"
      icon="🌲"
      xp={60}
      readTime={12}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="multi-tenant-auth-patterns"
      nextTitle="Multi-tenant authorization: orgs, teams, projects, sharing"
      quiz={quiz}
    >
      <Section title="Cedar em uma frase" accent={accent}>
        <p>
          <strong>Cedar</strong> é a policy language open-source da AWS (lançada em maio de 2023, Apache 2.0), implementada em Rust, com type system explícito e partes <em>formalmente verificadas</em>. É o motor por trás do serviço Amazon Verified Permissions. Foi desenhado para preencher um espaço específico: <em>tipagem forte e analisabilidade estática</em> — algo que Rego (dinâmico) e SpiceDB (data-centric) não oferecem do mesmo jeito.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Origem', v: 'AWS — re:Inforce 2023. Time inclui pesquisadores da AWS Automated Reasoning Group.' },
            { k: 'Linguagem', v: 'Rust. Disponível como crate, CLI, binding Java/Python/Go/JS via FFI.' },
            { k: 'Schema', v: 'Obrigatório — define entities, actions, contexts. Type-checked.' },
            { k: 'Modelos', v: 'RBAC + ABAC + (parte de) ReBAC via entity hierarchy.' },
            { k: 'Managed cloud', v: 'Amazon Verified Permissions (AVP) — Cedar como serviço com Cognito integration.' },
            { k: 'Formal verification', v: 'Lemmas em Lean/Dafny para core semantics. Crítico para compliance regulada.' },
          ]}
        />
        <Callout tone="info" icon="🌲">
          Cedar não é &quot;mais um&quot; — é a primeira policy language mainstream com <strong>análise estática rigorosa</strong>: você pode provar que duas policies são equivalentes, encontrar policies inalcançáveis, verificar &quot;esta mudança nega acesso a alguém que tinha antes?&quot; via diferencial. Para fintech/govcloud/saúde, isso é o que torna Cedar relevante.
        </Callout>
      </Section>

      <Section title="A sintaxe: legibilidade > densidade" accent={accent}>
        <CodeBlock lang="text" filename="policies.cedar">{`// Permit explícito com scope e condições
permit (
  principal in Group::"engineering",
  action in [Action::"viewDocument", Action::"editDocument"],
  resource in Folder::"engineering-docs"
)
when {
  resource.owner == principal ||
  principal in resource.collaborators
}
unless {
  resource.classification == "secret" &&
  !context.mfa_authenticated
};

// Forbid sempre vence — guard absoluto
forbid (
  principal,
  action,
  resource
)
when {
  context.ip_address.isInRange("0.0.0.0/0") &&
  resource.classification in ["secret", "top-secret"]
};

// Policy template (parametrizada)
permit (
  principal == ?principal,
  action in [Action::"viewDocument"],
  resource == ?resource
);`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'effect', v: 'permit ou forbid. Forbid > permit (forbid sempre nega; permit autoriza se nenhum forbid match).' },
            { k: 'scope (header tipado)', v: 'principal, action, resource — declarados com tipos. == ou in. Validados contra schema.' },
            { k: 'when / unless', v: 'expressões booleanas. unless = negação semântica de when. Avaliam atributos e context.' },
            { k: 'Templates', v: '?principal e ?resource são placeholders — instanciados em runtime via API. Caso de uso: sharing per-resource.' },
            { k: 'Comentários', v: '// como em C/Rust. Markdown-friendly em PRs.' },
          ]}
        />
      </Section>

      <Section title="Schema: o que distingue Cedar" accent={accent}>
        <CodeBlock lang="json" filename="schema.cedarschema.json">{`{
  "FFV": {
    "entityTypes": {
      "User": {
        "memberOfTypes": ["Group", "Organization"],
        "shape": {
          "type": "Record",
          "attributes": {
            "department": { "type": "String" },
            "level": { "type": "Long" }
          }
        }
      },
      "Group": { "memberOfTypes": ["Organization"] },
      "Organization": {},
      "Document": {
        "memberOfTypes": ["Folder"],
        "shape": {
          "type": "Record",
          "attributes": {
            "owner": { "type": "Entity", "name": "User" },
            "collaborators": { "type": "Set", "element": { "type": "Entity", "name": "User" } },
            "classification": { "type": "String" }
          }
        }
      }
    },
    "actions": {
      "viewDocument": {
        "appliesTo": {
          "principalTypes": ["User"],
          "resourceTypes": ["Document"],
          "context": {
            "type": "Record",
            "attributes": {
              "mfa_authenticated": { "type": "Boolean" },
              "ip_address": { "type": "String" }
            }
          }
        }
      }
    }
  }
}`}</CodeBlock>
        <Callout tone="warn" icon="🧪">
          O compiler Cedar valida cada policy contra esse schema: <em>existe Action::&quot;viewDocument&quot;? Aceita principal do tipo Group? resource.classification é String?</em> Erros saem antes de chegar em produção — ao contrário de Rego, onde campo inexistente vira <InlineCode>undefined</InlineCode> e a policy passa silenciosamente.
        </Callout>
      </Section>

      <Section title="Fluxo de avaliação" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="IsAuthorized — Cedar engine"
          steps={[
            { label: '1. Request', desc: 'principal, action, resource, context vindos da app' },
            { label: '2. Slice', desc: 'engine filtra policies relevantes pelo scope (otimização)' },
            { label: '3. Eval forbids', desc: 'qualquer forbid match → DENY imediato' },
            { label: '4. Eval permits', desc: 'algum permit match → ALLOW; nenhum → DENY default' },
            { label: '5. Result', desc: 'Decision + matched policies + diagnostics' },
          ]}
        />
        <CodeBlock lang="rust">{`use cedar_policy::{Authorizer, Context, Entities, PolicySet, Request, Schema};

let schema: Schema = serde_json::from_str(SCHEMA_JSON)?.try_into()?;
let policies: PolicySet = POLICIES_TEXT.parse()?;
let entities: Entities = Entities::from_json_str(ENTITIES_JSON, Some(&schema))?;

let request = Request::new(
    Some(r#"User::"alice""#.parse()?),
    Some(r#"Action::"viewDocument""#.parse()?),
    Some(r#"Document::"report-q1""#.parse()?),
    Context::from_json_value(json!({
        "mfa_authenticated": true,
        "ip_address": "10.0.0.5"
    }), Some((&schema, &"Action::\\"viewDocument\\"".parse()?)))?,
    Some(&schema),
)?;

let authorizer = Authorizer::new();
let response = authorizer.is_authorized(&request, &policies, &entities);

match response.decision() {
    Decision::Allow => println!("granted"),
    Decision::Deny => println!("denied: {:?}", response.diagnostics().reason()),
}`}</CodeBlock>
      </Section>

      <Section title="Amazon Verified Permissions (AVP): Cedar managed" accent={accent}>
        <NodeGraph
          accent={accent}
          title="AVP arquitetura típica"
          columns={[
            {
              label: 'Identity',
              nodes: [
                { label: 'Amazon Cognito', sub: 'user pool emite JWT' },
                { label: 'Custom IdP (OIDC)', sub: 'identity source no AVP' },
              ],
            },
            {
              label: 'App',
              nodes: [
                { label: 'Backend service', sub: 'middleware authz' },
                { label: 'AVP SDK', sub: 'IsAuthorizedWithToken' },
              ],
            },
            {
              label: 'AVP',
              nodes: [
                { label: 'Policy Store', sub: 'schema + policies + templates' },
                { label: 'Cedar engine', sub: 'managed, multi-AZ' },
                { label: 'Audit (CloudTrail)', sub: 'cada decision logged' },
              ],
            },
          ]}
        />
        <p className="text-sm mt-2">
          AVP cobra por <em>authorization request</em>. Para SaaS B2B on AWS, é a maneira mais rápida de adicionar autorização fine-grained sem operar engine. Limitações: latência ~10-30ms (call AWS), tier máximo por policy store ~10k policies, sem multi-region active-active (replicação assíncrona).
        </p>
      </Section>

      <Section title="Cedar vs Rego vs SpiceDB/OpenFGA" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Cedar', 'Rego (OPA)', 'SpiceDB / OpenFGA']}
          rows={[
            ['Paradigma', 'Policy-as-code, tipado', 'Policy-as-code, dinâmico', 'Policy-as-data (tuplas)'],
            ['Schema obrigatório', '✓ entities + actions', '✗ (qualquer JSON)', '✓ schema language'],
            ['Type safety', 'Forte (compile-time)', 'Fraca (runtime)', 'Forte (schema)'],
            ['Análise estática', 'Excelente (verified)', 'Boa (opa parse)', 'Boa (schema validation)'],
            ['Reverse query', 'Limitada', 'Via partial eval', 'Nativa (LookupSubjects)'],
            ['Linguagem', 'Rust', 'Go', 'Go'],
            ['Managed cloud', 'AVP (AWS)', 'Styra DAS', 'Authzed / Auth0 FGA'],
            ['Casos de uso fortes', 'SaaS, fintech, compliance', 'Infra/K8s, condições, ABAC', 'Sharing per-resource'],
            ['Maturidade (2026)', 'Crescendo rápido', 'CNCF Graduated, padrão', 'Maduro, adoção alta'],
          ]}
        />
      </Section>

      <Section title="Onde Cedar vence" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="SaaS B2B fintech: compliance audit exige provar que policies estão corretas + multi-tenant + on AWS"
          winner="Cedar via Amazon Verified Permissions"
          why="Formal verification + type safety + schema validation + audit nativo no CloudTrail. Auditores aceitam policies analisáveis estaticamente. Managed AVP reduz ops. Integra com Cognito sem ginástica."
          alternatives={[
            { name: 'OPA', note: 'Mais flexível mas sem análise formal — auditor exige mais provas' },
            { name: 'SpiceDB', note: 'Excelente para sharing mas você ainda precisa de algo para condições; cloud não-AWS' },
            { name: 'IAM puro', note: 'Não modela autorização aplicacional fine-grained' },
          ]}
        />
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Compliance regulada</strong>: govcloud, fintech, healthcare — auditor exige policies provadamente corretas.</li>
          <li><strong>Time pequeno, app on AWS</strong>: AVP managed elimina ops.</li>
          <li><strong>Stack Rust ou edge</strong>: Cedar é a única engine Rust mainstream — fácil embedar em Lambda@Edge, Cloudflare Workers (via WASM).</li>
          <li><strong>Análise estática crítica</strong>: cedar-policy-cli faz validação completa antes de deploy; perfeita para CI.</li>
        </ul>
      </Section>

      <Section title="Anti-patterns Cedar" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Schema-less &quot;por enquanto&quot;</strong>: você perde 70% do valor do Cedar. Defina o schema desde o dia zero.</li>
          <li><strong>Misturar regras de negócio em policies</strong>: policies devem expressar acesso, não lógica de domínio. Cálculo de preço não vai em Cedar.</li>
          <li><strong>Forbid usado como &quot;remove permission&quot;</strong>: forbid é guard absoluto. Para revogação granular, remova entity hierarchy (User out of Group) — não escreva forbid específico.</li>
          <li><strong>Templates para tudo</strong>: templates instanciados crescem rápido; para sharing per-doc com 100k+ docs, considere ReBAC engine ao lado.</li>
        </ul>
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>Cedar = AWS, 2023, open-source Rust. Policy language tipada com análise estática rigorosa.</li>
          <li>Schema obrigatório (entities + actions) → policies validadas em compile-time.</li>
          <li>Sintaxe SQL-like: <InlineCode>permit/forbid (principal, action, resource) when {'{...}'} unless {'{...}'};</InlineCode></li>
          <li>Cobre RBAC + ABAC + parte de ReBAC via entity hierarchy (parents transitivos).</li>
          <li>Amazon Verified Permissions = Cedar managed. Integra Cognito; pricing por authorization request.</li>
          <li>Formal verification (Lean/Dafny) — diferencial para compliance regulada.</li>
          <li>Vence em: fintech/govcloud, time pequeno on AWS, stack Rust/edge. Complementa: ReBAC engine para sharing per-resource em massa.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
