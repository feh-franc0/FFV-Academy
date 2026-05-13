import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('abac-attribute-based');

const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'Segundo NIST SP 800-162, ABAC define autorização como uma função de quatro categorias de atributos. Quais?',
    options: [
      'user, role, permission, resource',
      'subject, resource (object), action, environment — a decisão é f(S, R, A, E) avaliada por uma policy',
      'role, group, tenant, scope',
      'principal, credential, token, claim',
    ],
    correct: 1,
    explanation: 'NIST SP 800-162 (Guide to ABAC, 2014) formaliza: Subject attributes (department, clearance), Resource/Object attributes (sensitivity, owner), Action attributes (read/write), Environment attributes (time, IP, MFA-status). A policy é uma fórmula booleana sobre esses atributos. AWS IAM policies com Condition são ABAC clássico.',
  },
  {
    question: 'Por que XACML perdeu adoção apesar de ser o "padrão" ABAC?',
    options: [
      'XACML não suporta ABAC',
      'XML extremamente verboso, ferramental complexo (PDP/PIP/PEP), curva de aprendizado alta, sem ergonomia para devs — substituído por DSLs modernas (Rego, Cedar)',
      'XACML é proprietário',
      'XACML é mais lento que SQL',
    ],
    correct: 1,
    explanation: 'XACML 3.0 (OASIS, 2013) define arquitetura PEP/PDP/PIP/PAP rigorosa, mas a sintaxe XML é proibitiva (uma policy simples vira 80 linhas). Adotado em ambientes enterprise legacy (banking, healthcare). A alternativa moderna: Rego (OPA), Cedar (AWS), SpiceDB schema — DSLs textuais, type-safe, com testes.',
  },
  {
    question: 'Qual é a diferença prática entre PEP e PDP na arquitetura ABAC?',
    options: [
      'São sinônimos',
      'PEP (Policy Enforcement Point): o ponto que INTERCEPTA o request (middleware, sidecar). PDP (Policy Decision Point): o serviço que AVALIA a policy e retorna permit/deny. PEP chama PDP.',
      'PEP avalia, PDP intercepta',
      'PDP é o storage',
    ],
    correct: 1,
    explanation: 'Modelo NIST: PEP é onde o controle vive (ex: Envoy ext_authz, middleware HTTP). PDP é o cérebro (OPA server, Cedar engine). PIP (Policy Information Point) busca atributos externos (LDAP, DB). PAP (Policy Administration Point) é a UI/API onde admins editam policies. Separação permite reuso do PDP por múltiplos PEPs.',
  },
  {
    question: 'Quando ABAC é genuinamente melhor que RBAC?',
    options: [
      'Sempre — ABAC é "mais moderno"',
      'Quando a decisão depende de ATRIBUTOS DINÂMICOS (hora, IP, MFA), CONTEXTO (mesmo departamento, mesma região) ou RELAÇÃO recurso↔user que RBAC exigiria role explosion para expressar',
      'Apenas em cloud',
      'Apenas em multi-tenant',
    ],
    correct: 1,
    explanation: 'ABAC vence quando a policy é condicional sobre atributos não-organizacionais: "user pode aprovar se NÃO é o solicitante" (atributo de relação), "leitura só de fora do horário comercial requer MFA" (atributo de ambiente), "engineer pode acessar se region == project.region" (atributo cruzado). RBAC pode até expressar via role-per-condição, mas é o anti-pattern de role explosion.',
  },
  {
    question: 'O risco operacional clássico de ABAC mal-modelado é:',
    options: [
      'Performance ruim',
      'Policy explosion + auditabilidade difícil: policies com muitas condições aninhadas viram regex de difícil revisão, e "quem tem acesso a X?" deixa de ser query SQL e vira simulação de policy',
      'Falta de RBAC',
      'Sem suporte a roles',
    ],
    correct: 1,
    explanation: 'Em RBAC, "quem pode ler invoices?" é JOIN simples. Em ABAC, depende de avaliar policy contra TODOS os users — caro e não enumerable. Soluções: ferramentas como OPA + opa eval em batch, Cedar com `--reverse` (em desenvolvimento), ou modelo híbrido (RBAC coarse + ABAC refinements). Não acumule condições — extraia em policies nomeadas e testáveis.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="abac-attribute-based"
      title="ABAC: policies sobre atributos, XACML legado"
      icon="📜"
      xp={60}
      readTime={12}
      trailName="Authorization Engineering"
      trailColor={accent}
      nextSlug="zanzibar-google-rebac"
      nextTitle="Zanzibar: o paper do Google que mudou autorização"
      quiz={quiz}
    >
      <Section title="A definição NIST: f(S, R, A, E)" accent={accent}>
        <p>
          ABAC (Attribute-Based Access Control) foi formalizado pelo NIST em <strong>SP 800-162</strong> (Guide to Attribute Based Access Control Definition and Considerations, 2014). O modelo é uma generalização: <em>access = function(attributes)</em>, onde os atributos se distribuem em quatro categorias canônicas.
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Decisão de acesso ABAC"
          formula="decision = policy(S, R, A, E)"
          parts={[
            { text: 'S', annotation: 'Subject attributes — quem faz: department, clearance, group, MFA-status' },
            { text: 'R', annotation: 'Resource attributes — sobre o quê: owner, sensitivity, tags, project_id' },
            { text: 'A', annotation: 'Action attributes — o que faz: read/write/delete + parâmetros (qty, amount)' },
            { text: 'E', annotation: 'Environment attributes — contexto: time-of-day, IP/geo, threat-level, channel' },
          ]}
        />
        <Callout tone="info" icon="🧠">
          AWS IAM já é ABAC desde o dia zero. Os blocos <InlineCode>Condition</InlineCode> em IAM policies (<InlineCode>aws:CurrentTime</InlineCode>, <InlineCode>aws:SourceIp</InlineCode>, <InlineCode>ec2:ResourceTag/Env</InlineCode>) são atributos de S/R/E avaliados em runtime.
        </Callout>
      </Section>

      <Section title="Arquitetura PEP/PDP/PIP/PAP" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Fluxo canônico XACML / NIST ABAC"
          steps={[
            { label: 'PEP (Enforce)', desc: 'middleware / sidecar intercepta request, monta AttributeRequest' },
            { label: 'PDP (Decide)', desc: 'OPA / Cedar / engine: avalia policy contra atributos' },
            { label: 'PIP (Info)', desc: 'busca atributos faltantes — LDAP, DB, OIDC userinfo' },
            { label: 'Decision', desc: 'permit / deny / not-applicable / indeterminate' },
            { label: 'Obligations', desc: 'PEP executa: log, MFA challenge, watermark' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'PEP — Policy Enforcement Point', v: 'Onde a decisão é APLICADA. Ex: Envoy + ext_authz, middleware Express, Spring AOP.' },
            { k: 'PDP — Policy Decision Point', v: 'Onde a decisão é TOMADA. Ex: opa eval, Cedar engine, AWS Verified Permissions.' },
            { k: 'PIP — Policy Information Point', v: 'Onde os ATRIBUTOS são buscados. Ex: LDAP, banco de usuários, OIDC userinfo, /metadata.' },
            { k: 'PAP — Policy Administration Point', v: 'Onde policies são EDITADAS. Ex: git repo de .rego files, console Cedar, AVP UI.' },
          ]}
        />
      </Section>

      <Section title="XACML: o padrão verboso (e por que ninguém usa em greenfield)" accent={accent}>
        <p>
          XACML 3.0 (OASIS, 2013) é o padrão formal de ABAC. Define linguagem XML para policies, request/response, combining algorithms (deny-overrides, permit-overrides, first-applicable). É excelente teoricamente — péssimo na prática.
        </p>
        <CodeBlock lang="xml">{`<!-- Policy XACML: "permitir leitura se department == owner.department" -->
<Policy PolicyId="dept-match"
        RuleCombiningAlgId="urn:oasis:names:tc:xacml:1.0:rule-combining-algorithm:permit-overrides">
  <Target>
    <AnyOf>
      <AllOf>
        <Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
          <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">read</AttributeValue>
          <AttributeDesignator
            Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action"
            AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id"
            DataType="http://www.w3.org/2001/XMLSchema#string"
            MustBePresent="true"/>
        </Match>
      </AllOf>
    </AnyOf>
  </Target>
  <Rule RuleId="dept-equal" Effect="Permit">
    <Condition>
      <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
        <AttributeDesignator Category=".../subject" AttributeId="department"
          DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="true"/>
        <AttributeDesignator Category=".../resource" AttributeId="owner-department"
          DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="true"/>
      </Apply>
    </Condition>
  </Rule>
</Policy>`}</CodeBlock>
        <Callout tone="warn" icon="📜">
          Essa policy de 25 linhas resolve <strong>uma</strong> regra (&quot;department match&quot;). Em Rego, são 2 linhas. Em Cedar, 1. Por isso XACML caiu — não pela teoria, pela ergonomia.
        </Callout>
        <CodeBlock lang="rego">{`# Mesma regra em Rego (OPA) — 2 linhas reais
package authz
allow {
  input.action == "read"
  input.subject.department == input.resource.owner.department
}`}</CodeBlock>
      </Section>

      <Section title="Atributos: estáticos, dinâmicos, derivados" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Fonte', 'Exemplo', 'Cuidado']}
          rows={[
            ['Estático', 'cadastro (LDAP, DB)', 'department, clearance', 'invalidação ao mudar — sincronização cara'],
            ['Dinâmico (env)', 'request context', 'IP, time, geo, channel', 'spoofable se vindo do client — valide no edge'],
            ['Derivado (PIP)', 'computado em runtime', 'is_oncall, project_member', 'latência adicional — cachear com TTL curto'],
            ['Reivindicado (JWT)', 'claims no token', 'mfa_amr, groups', 'só vale se token assinado e fresh; cuidado com rotação'],
          ]}
        />
      </Section>

      <Section title="ABAC na prática com AWS IAM (você já usa)" accent={accent}>
        <CodeBlock lang="json">{`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::bucket/*",
    "Condition": {
      "StringEquals": {
        "aws:PrincipalTag/Department": "\${s3:ResourceTag/Department}"
      },
      "Bool": { "aws:MultiFactorAuthPresent": "true" },
      "DateGreaterThan": { "aws:CurrentTime": "2026-01-01T00:00:00Z" },
      "IpAddress": { "aws:SourceIp": "10.0.0.0/8" }
    }
  }]
}`}</CodeBlock>
        <p className="text-sm mt-2">
          Note os quatro atributos NIST em ação: <strong>Subject</strong> (<InlineCode>aws:PrincipalTag</InlineCode>), <strong>Resource</strong> (<InlineCode>s3:ResourceTag</InlineCode>), <strong>Action</strong> (<InlineCode>s3:GetObject</InlineCode>), <strong>Environment</strong> (<InlineCode>MFA</InlineCode>, <InlineCode>CurrentTime</InlineCode>, <InlineCode>SourceIp</InlineCode>). É ABAC textbook, escondido sob JSON da AWS.
        </p>
      </Section>

      <Section title="Combining algorithms" accent={accent}>
        <p>
          Quando múltiplas policies se aplicam, qual vence? Algoritmos canônicos:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'deny-overrides', v: 'Se QUALQUER policy diz Deny, resultado é Deny. Padrão de segurança, usado por AWS IAM.' },
            { k: 'permit-overrides', v: 'Se qualquer Permit, vence. Útil em sistemas de exceções; perigoso por padrão.' },
            { k: 'first-applicable', v: 'A primeira policy que dá decisão clara vence. Comportamento de firewall.' },
            { k: 'only-one-applicable', v: 'Erro se mais de uma se aplica. Usado em ambientes regulados.' },
          ]}
        />
        <Callout tone="warn" icon="🛡️">
          <strong>Default deny</strong> é regra: na ausência de policy que permita, negue. Implícito em AWS IAM, OPA (com <InlineCode>default allow := false</InlineCode>), Cedar. Nunca confie em &quot;permit-overrides com fallback&quot;.
        </Callout>
      </Section>

      <Section title="Onde ABAC brilha vs onde falha" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Política: 'engineer pode acessar logs de produção fora do horário comercial APENAS com MFA fresca'"
          winner="ABAC — atributos environment (hora, MFA-amr) + subject (role)"
          why="RBAC não tem como expressar 'fora do horário' nem 'MFA fresca' — seria role para cada combinação. ReBAC modela relações, não condições. ABAC com 3 linhas de Rego resolve."
          alternatives={[
            { name: 'RBAC', note: 'Não expressa atributos dinâmicos — fallback é role-per-condição (anti-pattern)' },
            { name: 'ABAC', note: 'Caso de uso canônico — vence' },
            { name: 'ReBAC', note: 'Não é a ferramenta — modelo de relação, não condição' },
          ]}
        />
        <p className="text-sm mt-3">
          ABAC <em>falha</em> em outro cenário: &quot;quem tem acesso a este documento?&quot;. Em RBAC/ReBAC isso é uma query enumerável. Em ABAC, exige simular a policy contra todos os usuários (caro, não escalável). É o &quot;reverse query problem&quot; — solucionado em ferramentas como OpenFGA (que combina ReBAC + ABAC) ou IAM Access Analyzer (AWS).
        </p>
      </Section>

      <Section title="Modelo híbrido: RBAC + ABAC (o que produção real faz)" accent={accent}>
        <CodeBlock lang="rego">{`package authz

# Default deny
default allow := false

# Camada RBAC: role admin tem acesso total
allow {
  "admin" in input.subject.roles
}

# Camada ABAC: editor pode editar se for owner do recurso
allow {
  "editor" in input.subject.roles
  input.action == "update"
  input.resource.owner_id == input.subject.id
}

# Camada ABAC: viewer só lê e só dentro do horário comercial
allow {
  "viewer" in input.subject.roles
  input.action == "read"
  business_hours
}

business_hours {
  hour := time.clock(time.now_ns())[0]
  hour >= 9
  hour < 18
}`}</CodeBlock>
        <p className="text-sm mt-2">
          Padrão maduro: RBAC para o &quot;quem é&quot; coarse (role:admin/editor/viewer), ABAC para condições refinadas. Implementado em OPA, mantido como código em git, testado com <InlineCode>opa test</InlineCode>.
        </p>
      </Section>

      <Section title="Auditoria: o calcanhar de Aquiles do ABAC" accent={accent}>
        <p>
          Compliance pergunta: <em>&quot;Liste todos os usuários que poderiam ter acessado este recurso entre 2026-01 e 2026-02&quot;</em>. Em RBAC isso é JOIN. Em ABAC, depende do estado dos atributos naquele intervalo — historicidade obrigatória.
        </p>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Log all decisions</strong>: cada decisão PDP em append-only log (S3 + Athena, Loki). Inclua a versão da policy.</li>
          <li><strong>Versione policies em Git</strong>: cada alteração com PR + review. AWS Verified Permissions e OPA bundle suportam isso nativamente.</li>
          <li><strong>Snapshot de atributos</strong>: ao logar a decisão, gravar os atributos avaliados (não só permit/deny). Sem isso, replay é impossível.</li>
          <li><strong>Static analysis</strong>: ferramentas como <InlineCode>opa eval</InlineCode> em batch, Cedar policy analyzer, IAM Access Analyzer simulam &quot;reverse queries&quot;.</li>
        </ul>
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li>ABAC = NIST SP 800-162. Decisão = função sobre atributos de (Subject, Resource, Action, Environment).</li>
          <li>XACML é o padrão formal — verboso e fora de moda. Substituído por DSLs modernas: Rego, Cedar.</li>
          <li>PEP/PDP/PIP/PAP é a arquitetura canônica. Em produção: middleware + OPA sidecar + LDAP/DB + git.</li>
          <li>AWS IAM com <InlineCode>Condition</InlineCode> já é ABAC clássico — você usa há anos sem dar nome.</li>
          <li>ABAC vence em condições dinâmicas (hora, MFA, cross-attribute match) e perde em sharing resource-level e reverse queries (&quot;quem tem acesso?&quot;).</li>
          <li>Produção real usa híbrido: RBAC coarse + ABAC para refinamentos contextuais.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
