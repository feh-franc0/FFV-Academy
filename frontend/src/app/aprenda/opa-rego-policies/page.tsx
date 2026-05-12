import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, StackFlow, DecisionBox, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('opa-rego-policies');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'OPA (Open Policy Agent) atingiu o status CNCF Graduated em qual ano?',
    options: [
      '2018',
      '2021 — promovido de Incubating após adoção massiva em K8s admission control, Envoy ext_authz, Terraform Cloud, e como engine genérica de policy-as-code',
      '2023',
      '2019',
    ],
    correct: 1,
    explanation: 'OPA foi criado pela Styra (2016), entrou CNCF Sandbox 2018, Incubating 2019 e Graduated em fevereiro de 2021. É um dos poucos projetos CNCF Graduated não-Kubernetes-core e o policy engine de fato adotado pela indústria.',
  },
  {
    question: 'Rego é inspirada em qual linguagem clássica?',
    options: [
      'SQL',
      'Datalog (subset de Prolog) — programação declarativa, regras com cabeça + corpo, unificação, query bottom-up. Não é Turing-complete by design (segurança/análise).',
      'JavaScript',
      'Python',
    ],
    correct: 1,
    explanation: 'Rego é Datalog estendida com tipos, funções built-in e iteração sobre estruturas JSON. Decisões: "permite se há tupla X que casa Y". Não-Turing-complete = você pode raciocinar formalmente sobre policies (terminação garantida, análise estática). Datalog vem do mundo de databases (Coral, Datomic).',
  },
  {
    question: 'Como OPA é tipicamente integrado em Kubernetes para admission control?',
    options: [
      'Como sidecar de kubelet',
      'Via Gatekeeper: ValidatingAdmissionWebhook que delega ao OPA com policies escritas em ConstraintTemplates (Rego compilado) — bloqueia recursos não-conformes antes de persistirem em etcd',
      'Via kubectl plugin',
      'Modificando o API server',
    ],
    correct: 1,
    explanation: 'Gatekeeper (CNCF) instala OPA como ValidatingAdmissionWebhook. Você define ConstraintTemplate (Rego policy reutilizável) + Constraint (instância com parâmetros). Ex: "todo Pod deve ter resource limits", "imagens só de registry corporativo". O API server consulta antes de admitir o recurso.',
  },
  {
    question: 'Qual padrão de deployment do OPA é melhor para baixíssima latência em path crítico?',
    options: [
      'OPA centralizado em cluster',
      'OPA sidecar local em cada pod/host: decisão fica no localhost (~1ms), policies sincronizadas via Bundle API (HTTP poll ou push), zero network hop para o decision',
      'OPA serverless lambda',
      'OPA no banco',
    ],
    correct: 1,
    explanation: 'OPA é deliberadamente projetado para deployment sidecar: bundle de policies (.tar.gz com .rego + data.json) é baixado periodicamente; decisões são locais via gRPC/HTTP no localhost. Latência decisão ~sub-ms. O modelo "centralized PDP" gera latência de rede e single point of failure — anti-pattern em microsserviços.',
  },
  {
    question: 'O que faz o operador "iteration with [_]" em Rego?',
    options: [
      'Loop infinito',
      'Itera sobre todos os elementos de um array/objeto via unificação implícita — `users[_].name` retorna conjunto de todos os names; padrão fundamental de Rego',
      'Index zero',
      'Reverte array',
    ],
    correct: 1,
    explanation: '`_` é uma variável anônima que casa qualquer índice. `users[_]` percorre todos os items. Combinado com unificação: `users[_].role == "admin"` testa se ALGUM user tem role admin (lógica existencial). Para todos: `count([u | u := users[_]; u.role != "admin"]) == 0`.',
  },
  {
    question: 'Envoy ext_authz com OPA serve qual propósito?',
    options: [
      'TLS termination',
      'Service mesh / API gateway delega cada request HTTP/gRPC ao OPA, que retorna permit/deny + obligations (headers a injetar) — authz centralizado no mesh, app não muda',
      'Cache HTTP',
      'Load balancing',
    ],
    correct: 1,
    explanation: 'ext_authz é o filtro Envoy que delega a decisão de autorização a um serviço externo. OPA expõe gRPC ExtAuthz protocol. Beneficio: authz fora do código da app, refletindo em todo o mesh. Istio/Consul Connect/AWS App Mesh usam o mesmo padrão. Latência ~1-2ms se OPA é sidecar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="opa-rego-policies"
      title="OPA / Rego: policy as code para infra e API"
      icon="📐"
      xp={70}
      readTime={14}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="cedar-aws-authorization"
      nextTitle="Cedar (AWS): a alternativa nova de policy language"
      quiz={quiz}
    >
      <Section title="OPA: o policy engine universal" accent={accent}>
        <p>
          <strong>Open Policy Agent</strong> (OPA) é um engine de policy <em>genérico</em> criado pela Styra em 2016, CNCF Graduated em 2021. A pergunta que ele responde é simples: <em>&quot;dado este JSON de input, esta decisão é permitida?&quot;</em>. O domínio é livre — pode ser autorização de API, admission control em Kubernetes, validação de Terraform plans, CI/CD gates, banco de dados row-level — qualquer lugar onde uma decisão estruturada precisa ser tomada.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Linguagem', v: 'Rego — Datalog declarativa, não Turing-complete por design' },
            { k: 'Distribuição', v: 'Single binary Go; library, server, WASM module' },
            { k: 'Deployment', v: 'Sidecar (recomendado), library embeddable, ou centralizado' },
            { k: 'Bundle API', v: 'Distribuição de policies via tarball assinado; pull HTTP periodicamente' },
            { k: 'Casos de uso', v: 'API authz, K8s Gatekeeper, Envoy ext_authz, Terraform, CI/CD, microsserviços' },
          ]}
        />
        <Callout tone="info" icon="📐">
          OPA é &quot;policy-as-code&quot; — diferente de SpiceDB/OpenFGA (&quot;policy-as-data&quot;). Você escreve regras textuais versionadas em git, com testes, lint, code review. É excelente para infra e regras de negócio condicionais; complemento (não substituto) de ReBAC para sharing per-resource.
        </Callout>
      </Section>

      <Section title="Rego em 5 minutos" accent={accent}>
        <p>
          Rego é uma linguagem declarativa. A unidade básica é a <em>regra</em>: cabeça + corpo. A regra é verdadeira quando o corpo é satisfeito.
        </p>
        <CodeBlock lang="rego" filename="authz.rego">{`package authz

import future.keywords.in

# Default deny — fundamental
default allow := false

# Admin pode tudo
allow {
  "admin" in input.subject.roles
}

# Owner pode editar próprio recurso
allow {
  input.action == "update"
  input.resource.owner_id == input.subject.id
}

# Viewer pode ler dentro do horário comercial COM MFA
allow {
  "viewer" in input.subject.roles
  input.action == "read"
  input.subject.mfa == true
  business_hours
}

# Helper rule
business_hours {
  hour := time.clock(time.now_ns())[0]
  hour >= 9
  hour < 18
}

# Regra que retorna OBJETO (não só boolean)
decision := {
  "allow": allow,
  "reason": reason,
}

reason := "admin override" {
  "admin" in input.subject.roles
}
reason := "owner of resource" {
  input.resource.owner_id == input.subject.id
}
reason := "outside business hours" {
  not business_hours
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'package', v: 'namespace da policy — análogo a módulo Go' },
            { k: 'default allow := false', v: 'pattern obrigatório: deny se nenhuma regra match' },
            { k: 'Múltiplas regras "allow"', v: 'union implícita — basta uma ser verdadeira' },
            { k: 'in operador', v: 'membership check (Rego v1) — substitui o awkward "_" iteration' },
            { k: 'Helpers (business_hours)', v: 'compor lógica reutilizável; resultado de regra zero-arity é boolean' },
          ]}
        />
      </Section>

      <Section title="Testar policies como código de produção" accent={accent}>
        <CodeBlock lang="rego" filename="authz_test.rego">{`package authz_test

import data.authz

test_admin_allowed {
  authz.allow with input as {
    "subject": { "roles": ["admin"], "id": "u1" },
    "resource": { "owner_id": "u2" },
    "action": "delete"
  }
}

test_viewer_outside_hours_denied {
  not authz.allow with input as {
    "subject": { "roles": ["viewer"], "id": "u1", "mfa": true },
    "resource": { "owner_id": "u2" },
    "action": "read"
  }
    with time.now_ns as 1700000000000000000  # 19:30 UTC — fora horário
}

test_owner_can_update {
  authz.allow with input as {
    "subject": { "roles": [], "id": "u1" },
    "resource": { "owner_id": "u1" },
    "action": "update"
  }
}`}</CodeBlock>
        <CodeBlock lang="bash">{`# CLI nativo
opa test -v ./policies/
# →
# PASS: 3/3 tests
#  authz_test.test_admin_allowed (1.2ms)
#  authz_test.test_viewer_outside_hours_denied (0.9ms)
#  authz_test.test_owner_can_update (0.8ms)

# Coverage
opa test --coverage --format=json ./policies/ | jq '.coverage'`}</CodeBlock>
        <Callout tone="info" icon="✅">
          Testabilidade é o diferencial crítico de OPA contra ABAC ad-hoc. Cada policy é uma unit testable, lintable e coverable. Em ambientes regulados (banco, saúde), isso transforma autorização em código com SLA — não em &quot;se quiser saber, leia o admin panel&quot;.
        </Callout>
      </Section>

      <Section title="Deployment: sidecar é a regra" accent={accent}>
        <NodeGraph
          accent={accent}
          title="OPA sidecar com Bundle API"
          columns={[
            {
              label: 'Control plane',
              nodes: [
                { label: 'Git repo (policies)', sub: 'PR + review + opa test' },
                { label: 'CI build', sub: 'opa build → bundle.tar.gz' },
                { label: 'Bundle server', sub: 'S3 / GCS / styra DAS' },
              ],
            },
            {
              label: 'Data plane',
              nodes: [
                { label: 'App container', sub: 'lib OPA OU client HTTP/gRPC' },
                { label: 'OPA sidecar', sub: 'localhost:8181' },
                { label: 'Bundle puller', sub: 'HTTP poll de 30s — assinado e verificado' },
              ],
            },
            {
              label: 'Observability',
              nodes: [
                { label: 'Decision logs', sub: 'JSON output → Loki/Datadog' },
                { label: 'Prometheus metrics', sub: 'opa_decisions_total' },
                { label: 'OpenTelemetry traces', sub: 'request → decide → return' },
              ],
            },
          ]}
        />
        <CodeBlock lang="yaml" filename="opa-config.yaml">{`services:
  bundles:
    url: https://policies.corp.example/bundles
    credentials:
      bearer:
        token: \${OPA_BUNDLE_TOKEN}

bundles:
  authz:
    service: bundles
    resource: authz.tar.gz
    polling:
      min_delay_seconds: 30
      max_delay_seconds: 60
    signing:
      keyid: prod-bundle-key

decision_logs:
  console: true
  reporting:
    min_delay_seconds: 5
    max_delay_seconds: 10`}</CodeBlock>
      </Section>

      <Section title="Kubernetes Gatekeeper: a aplicação canônica" accent={accent}>
        <p>
          OPA virou padrão em K8s admission control via <strong>Gatekeeper</strong>. Você instala um ValidatingWebhook que delega ao OPA antes de cada recurso ser persistido em etcd.
        </p>
        <CodeBlock lang="yaml" filename="constraint-template.yaml">{`apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names: { kind: K8sRequiredLabels }
      validation:
        openAPIV3Schema:
          properties:
            labels: { type: array, items: { type: string } }
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels

        violation[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("missing required labels: %v", [missing])
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata: { text: ns-must-have-owner }
spec:
  match:
    kinds: [{ apiGroups: [""], kinds: ["Namespace"] }]
  parameters:
    labels: ["owner", "cost-center"]`}</CodeBlock>
        <p className="text-sm mt-2">
          Qualquer <InlineCode>kubectl apply</InlineCode> de Namespace sem labels <InlineCode>owner</InlineCode> e <InlineCode>cost-center</InlineCode> é rejeitado pelo API server, com a mensagem do violation block. Compliance enforced no ponto de entrada — não em scan posterior.
        </p>
      </Section>

      <Section title="Envoy ext_authz: API authz no service mesh" accent={accent}>
        <p>
          O segundo grande uso de OPA é como autorizador externo do Envoy (Istio, Consul, AWS App Mesh, Cloud Run). Filtro <InlineCode>ext_authz</InlineCode> intercepta cada request HTTP/gRPC e consulta um endpoint externo. OPA responde via protocolo gRPC ExtAuthz com permit/deny e obligations (headers a injetar).
        </p>
        <FlowDiagram
          accent={accent}
          title="Request com Envoy + OPA"
          steps={[
            { label: '1. Client → Envoy', desc: 'HTTP request entra no mesh' },
            { label: '2. Envoy → OPA', desc: 'gRPC ExtAuthz com método + path + headers + JWT' },
            { label: '3. OPA decide', desc: 'avalia Rego: allow/deny + headers a injetar' },
            { label: '4. OPA → Envoy', desc: 'response com status + obligations' },
            { label: '5. Envoy → upstream', desc: 'se permit, repassa request; se deny, 403' },
          ]}
        />
        <CodeBlock lang="rego">{`# Policy para Envoy ext_authz
package envoy.authz

default allow := false

# Token JWT parsed do header
claims := payload {
  [_, payload, _] := io.jwt.decode(input.attributes.request.http.headers.authorization)
}

# Allow se token válido e path autorizado
allow {
  claims.sub
  some path
  path := input.attributes.request.http.path
  glob.match(allowed_paths[_], ["/"], path)
}

allowed_paths := ["/api/public/*", "/api/users/me", "/healthz"]`}</CodeBlock>
      </Section>

      <Section title="Beyond authz: Terraform, CI/CD, SQL row filters" accent={accent}>
        <StackFlow
          accent={accent}
          title="OPA aplicado fora de authz tradicional"
          items={[
            { layer: 'Terraform / IaC', items: ['conftest', 'opa eval em plan.json'], description: 'bloqueia plans que criam recursos não-conformes (open S3, IAM *) antes do apply' },
            { layer: 'CI/CD gates', items: ['build artifact valido?', 'imagem assinada?', 'CVE limits?'], description: 'pipelines GitHub Actions / Tekton consultam OPA antes de promover' },
            { layer: 'SQL row-level', items: ['filtered SQL via OPA', 'partial evaluation'], description: 'OPA gera predicado WHERE a partir da policy — Styra DAS faz isso' },
            { layer: 'Microsserviços', items: ['sidecar OPA por pod', 'shared library de decision'], description: 'cada serviço delega authz ao OPA local sem mudar código' },
            { layer: 'Data masking', items: ['payload transformation', 'PII redaction'], description: 'OPA pode retornar transformações ("redact field X") — usado em APIs com diferentes scopes' },
          ]}
        />
      </Section>

      <Section title="OPA vs ReBAC: complemento, não substituto" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="SaaS com sharing per-doc (Drive-like) + policies de infra (K8s, Terraform) + condições dinâmicas (hora, MFA, IP)"
          winner="HÍBRIDO: SpiceDB/OpenFGA para sharing per-resource + OPA para infra e condições"
          why="ReBAC modela RELAÇÕES (quem é editor deste doc); OPA modela CONDIÇÕES (pode fazer isso AGORA, com este contexto, em K8s/TF). São ortogonais — empresas sérias usam ambos."
          alternatives={[
            { name: 'Só OPA', note: 'Sharing per-doc vira reverse query cara; não escala em milhões de recursos' },
            { name: 'Só SpiceDB', note: 'Não cobre policies de infra K8s/TF; condições dinâmicas só via caveats limitados' },
            { name: 'Híbrido OPA + ReBAC', note: 'Padrão maduro — Permit.io e Styra DAS fazem isso' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'OPA / Rego', 'SpiceDB / OpenFGA']}
          rows={[
            ['Paradigma', 'Policy-as-code (texto)', 'Policy-as-data (tuplas)'],
            ['Forte em', 'Infra, condições, RBAC + ABAC', 'Sharing per-resource (ReBAC)'],
            ['Reverse query "quem tem acesso?"', 'Pouco escalável', 'Nativo (LookupSubjects)'],
            ['K8s admission', 'Padrão de fato (Gatekeeper)', 'Não é o domínio'],
            ['Compliance audit', 'Logs de decisão + policy versionada', 'Tuplas + zedtokens + audit'],
            ['Storage', 'Stateless + bundle pull', 'Postgres / MySQL / CRDB'],
          ]}
        />
      </Section>

      <Section title="Padrões avançados: partial evaluation" accent={accent}>
        <p>
          Recurso poderoso e subutilizado: OPA pode <em>avaliar parcialmente</em> uma policy, gerando uma expressão residual. Aplicado: gerar predicado SQL filtrado a partir de policy.
        </p>
        <CodeBlock lang="bash">{`# Policy: "user lê docs do mesmo departamento"
# Partial eval contra subject=alice (dept=eng), sem definir resource
opa eval --partial --data policy.rego --input subject.json \\
  'data.authz.allow'

# Saída (simplificada): "input.resource.dept == 'eng'"
# Esse expression é traduzido para SQL: WHERE resource.dept = 'eng'`}</CodeBlock>
        <Callout tone="info" icon="🧠">
          Styra DAS comercializa isso como &quot;row-level security driven by OPA&quot; — você descreve a policy uma vez em Rego, e o engine gera o WHERE clause apropriado para Postgres/MySQL. Elimina policy lógica duplicada entre app e DB.
        </Callout>
      </Section>

      <Section title="Anti-patterns frequentes" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Centralized OPA server compartilhado</strong>: vira gargalo e SPOF. Use sidecar.</li>
          <li><strong>Sem bundle signing</strong>: bundles em produção devem ser assinados (cosign/keyid) — caso contrário, qualquer comprometimento do CDN/repo pode injetar policy.</li>
          <li><strong>Decisões muito grandes no objeto</strong>: retorne só o necessário (allow + reason + obligations); evite serializar grafos enormes.</li>
          <li><strong>Sem decision logs</strong>: compliance e debug ficam impossíveis. <InlineCode>decision_logs</InlineCode> sempre ligado em produção.</li>
          <li><strong>Reescrever ReBAC em Rego</strong>: caso você esteja modelando &quot;quem tem acesso ao doc X&quot; com tuplas em Rego data + iteração, está reinventando SpiceDB mal. Use a ferramenta certa.</li>
        </ul>
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>OPA = engine universal de policy. CNCF Graduated 2021. Padrão de fato em K8s, Envoy, Terraform.</li>
          <li>Rego é Datalog estendida — declarativa, não Turing-complete, testável (<InlineCode>opa test</InlineCode>).</li>
          <li>Deployment: sidecar com Bundle API + decision logs + Prometheus. Latência sub-ms.</li>
          <li>Gatekeeper (K8s admission) e Envoy ext_authz (service mesh) são os dois usos mais maduros.</li>
          <li>Forte em: RBAC + ABAC + infra policies. Fraco em: reverse queries de sharing per-resource.</li>
          <li>Complemento de SpiceDB/OpenFGA, não substituto. Híbrido é o padrão maduro 2026.</li>
          <li>Partial evaluation permite gerar WHERE SQL a partir de Rego — row-level security driven by policy.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
