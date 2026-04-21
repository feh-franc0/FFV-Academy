import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rest-maduro');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre idempotência e segurança em HTTP?',
    options: [
      'São sinônimos',
      'Seguro = não tem side-effects (GET, HEAD). Idempotente = chamar N vezes tem o mesmo efeito que chamar 1 vez (GET, PUT, DELETE). POST nem seguro nem idempotente por default',
      'Segurança é só HTTPS',
      'Idempotência é propriedade do servidor apenas',
    ],
    correct: 1,
    explanation: 'Propriedades ortogonais. GET é seguro E idempotente (só lê, sempre mesma resposta). PUT é idempotente mas não seguro (modifica, mas PUT duplicado = um PUT). DELETE idempotente (recurso já deletado → 404/204 aceitável). POST nem-nem (cada chamada cria novo recurso).',
  },
  {
    question: 'No Richardson Maturity Model, o que é nível 3?',
    options: [
      'Versão da internet',
      'HATEOAS — respostas incluem links pra próximas ações (poucos sistemas atingem porque o ROI raramente justifica)',
      'Usar HTTPS',
      'Responder em JSON',
    ],
    correct: 1,
    explanation: 'Níveis Richardson: 0 (RPC-over-HTTP: um endpoint, tudo POST), 1 (recursos: /users, /users/1), 2 (verbos HTTP corretos + status codes), 3 (HATEOAS: resposta inclui links). Maioria dos sistemas vive em 2 e tá ótimo. HATEOAS brilha em hypermedia puro (browsers, AtomPub); em APIs B2B geralmente não paga o custo.',
  },
  {
    question: 'Quando retornar 201 Created em vez de 200 OK?',
    options: [
      'Nunca',
      'POST que cria recurso novo — 201 com header Location apontando pra URL do recurso criado. GET nunca retorna 201',
      'Qualquer POST',
      'Só em APIs REST nível 3',
    ],
    correct: 1,
    explanation: '201 comunica "criou algo novo". Deve vir com Location: /users/123 pra que cliente saiba onde o recurso vive. Se POST atualizou algo existente, 200 está melhor. Se criou mas você não quer retornar body, 204 No Content.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rest-maduro"
      title="REST maduro: Richardson levels, idempotência e HATEOAS (raramente)"
      icon="🏛️"
      xp={50}
      readTime={12}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="versionamento-sem-dor"
      nextTitle="Versionamento sem dor: URL, header, sunset e estratégia de migração"
      quiz={quiz}
    >
      <Section title="Os 4 níveis de Richardson" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Nível', 'Característica', 'Exemplo']}
          rows={[
            ['0', 'Um endpoint, tudo POST', 'POST /api com body {action:"getUser", id:1}'],
            ['1', 'Recursos distintos por URL', 'POST /users/1/get'],
            ['2', 'Verbos HTTP + status codes', 'GET /users/1 → 200 ou 404'],
            ['3', 'HATEOAS — links na resposta', '{ "self": "/users/1", "posts": "/users/1/posts" }'],
          ]}
        />
        <Callout tone="info" icon="💡">
          A zona sweet da maioria das APIs B2B é <strong>nível 2</strong>: recursos, verbos certos, status corretos. Subir pra 3 raramente compensa — os clientes raramente seguem os links dinamicamente; preferem URL fixa + OpenAPI.
        </Callout>
      </Section>

      <Section title="Verbos e status: a tabela que importa" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Verbo', 'Seguro', 'Idempotente', 'Uso']}
          rows={[
            ['GET', '✅', '✅', 'Ler recurso'],
            ['HEAD', '✅', '✅', 'Ler metadados (sem body)'],
            ['OPTIONS', '✅', '✅', 'Describir capacidades / CORS preflight'],
            ['PUT', '❌', '✅', 'Criar/substituir em URL conhecida'],
            ['DELETE', '❌', '✅', 'Remover recurso'],
            ['POST', '❌', '❌', 'Criar em coleção, ações non-idempotent'],
            ['PATCH', '❌', '❌ (normalmente)', 'Atualização parcial'],
          ]}
        />
        <p>
          Status codes úteis (não decorem todos — aprenda estes):
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>200 OK</strong> / <strong>201 Created</strong> / <strong>204 No Content</strong></li>
          <li><strong>301 Moved</strong> / <strong>304 Not Modified</strong></li>
          <li><strong>400 Bad Request</strong> / <strong>401 Unauthorized</strong> (não autenticado) / <strong>403 Forbidden</strong> (autenticado sem permissão)</li>
          <li><strong>404 Not Found</strong> / <strong>409 Conflict</strong> / <strong>422 Unprocessable Entity</strong></li>
          <li><strong>429 Too Many Requests</strong> (rate limit) / <strong>500/502/503/504</strong></li>
        </ul>
      </Section>

      <Section title="Design de recursos" accent={accent}>
        <CodeBlock lang="text">{`GET    /users              → lista
POST   /users              → cria
GET    /users/123          → um
PUT    /users/123          → substitui
PATCH  /users/123          → parcial
DELETE /users/123          → remove

GET    /users/123/posts    → posts do user
POST   /users/123/posts    → cria post

# Ações sem recurso claro: verbos explícitos como último recurso
POST   /users/123/activate  # OK se não couber em PUT/PATCH
POST   /users/123:archive   # Google-style (action após :)`}</CodeBlock>
      </Section>

      <Section title="HATEOAS — quando vale" accent={accent}>
        <p>
          HATEOAS é poderoso em hipermídia (browser navegando por links) e em sistemas onde o cliente deve descobrir capacidades dinamicamente (ex: <em>AtomPub</em>). Mas a maioria dos clientes modernos (React app, Swift/Kotlin app, backend B2B) usa <strong>OpenAPI</strong> como contrato — sabem os endpoints de antemão.
        </p>
        <Callout tone="warn" icon="⚠️">
          Não se force a HATEOAS por pureza teórica. Se seu cliente não navega por links, o XP de adicionar <InlineCode>_links</InlineCode> em cada resposta é puro overhead. Fique em nível 2 e seja produtivo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
