import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('paginacao-filtros-ordenacao');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que cursor-based pagination é preferido em APIs modernas?',
    options: [
      'Mais rápido de codar',
      'Offset grande (OFFSET 100000) é custoso no banco e instável (inserções entre páginas duplicam ou pulam registros). Cursor é baseado em valor (ex: WHERE id > last_id) — estável e rápido',
      'Funciona sem índice',
      'É o único padrão REST',
    ],
    correct: 1,
    explanation: 'OFFSET 100000 força o banco a ler e descartar 100k linhas a cada página. Pior: se alguém insere/deleta entre duas leituras, usuário vê item duplicado ou pulado. Cursor (token opaco com chave de ordenação) vai direto, estável. Stripe, Twitter, GraphQL relay — todos usam.',
  },
  {
    question: 'O que é "keyset pagination"?',
    options: [
      'Pagination por senha',
      'Forma específica de cursor: WHERE created_at > last + AND id > last_id — usa índice composto, permite ordenação estável mesmo em valores empatados',
      'Só no MySQL',
      'Pagination que gera chave de API',
    ],
    correct: 1,
    explanation: 'Keyset é cursor implementado corretamente em SQL: ordena por (created_at, id) com tiebreaker. Cursor opaco codifica os dois valores. Garante estabilidade quando várias linhas têm mesmo created_at (id desempata). Sem o tiebreaker você perde/repete linhas.',
  },
  {
    question: 'Por que evitar filtros estilo eval() (aceitar query arbitrária)?',
    options: [
      'São lentos',
      'Abre superfície de SQL injection e permite DoS via queries caras. Use DSL fechada (RSQL, Google AIP filter, Prisma-like whitelist)',
      'Navegadores não suportam',
      'Quebra CORS',
    ],
    correct: 1,
    explanation: 'Aceitar "filter=raw SQL" é suicídio. DSLs como RSQL (name==John;age>18) ou whitelist por campo (name_eq, age_gt) dão poder sem expor. Google AIP-160 tem a spec mais completa. Prisma-like shape ({ where: { text: { eq: "x" } } }) é moderno em TS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="paginacao-filtros-ordenacao"
      title="Paginação, filtros e ordenação profissionais"
      icon="📑"
      xp={45}
      readTime={10}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="idempotency-keys-e-webhooks"
      nextTitle="Idempotency keys e webhooks: exactly-once na prática"
      quiz={quiz}
    >
      <Section title="Offset vs Cursor" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Offset (LIMIT/OFFSET)', 'Cursor (keyset)']}
          rows={[
            ['Performance em página alta', 'Lenta (full scan até offset)', 'Constante (usa índice)'],
            ['Estabilidade', '❌ Duplica/pula em inserts', '✅ Estável'],
            ['Total de páginas', '✅ Fácil (COUNT(*))', '❌ Difícil (não tem sentido)'],
            ['Pular pra página N', '✅ Direto', '❌ Não suporta'],
            ['URL debuggável', '✅ ?page=3', '❌ Token opaco'],
          ]}
        />
        <Callout tone="info" icon="💡">
          Default pragmático: <strong>cursor pra feed/lista infinita</strong> (scroll, timeline), <strong>offset pra admin/relatório</strong> (&quot;ir pra página 87&quot;).
        </Callout>
      </Section>

      <Section title="Cursor: como implementar" accent={accent}>
        <CodeBlock lang="typescript">{`// Query: GET /posts?limit=20&after=eyJpZCI6MTIz...
// after é base64(JSON({ createdAt, id }))

async function listPosts(after: string | null, limit: number) {
  const cursor = after ? decodeCursor(after) : null;
  const posts = await db.post.findMany({
    where: cursor ? {
      OR: [
        { createdAt: { lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, id: { lt: cursor.id } }, // tiebreak
      ],
    } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1, // pega 1 extra pra saber se tem next
  });
  const hasNext = posts.length > limit;
  const items = posts.slice(0, limit);
  const nextCursor = hasNext
    ? encodeCursor({ createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id })
    : null;
  return { items, nextCursor };
}`}</CodeBlock>
      </Section>

      <Section title="Filter DSL" accent={accent}>
        <CodeBlock lang="text">{`# Whitelist simples (tá ótimo pra 80% dos casos)
GET /users?name_eq=Fernando&age_gt=18&role=admin

# RSQL (mais expressivo)
GET /users?filter=name==Fernando;age>18;(role==admin,role==owner)

# Google AIP-160
GET /users?filter=name = "Fernando" AND age > 18

# Prisma-like (em corpo de request)
POST /users:search
{ where: { text: { eq: "Fernando" }, age: { gt: 18 } } }`}</CodeBlock>
        <p>
          Regra: enumere os campos filtráveis no OpenAPI. Cliente não deve conseguir filtrar por qualquer campo — isso vira DoS (ordenar por campo sem índice, filtro que escaneia tabela toda).
        </p>
      </Section>

      <Section title="Ordenação estável" accent={accent}>
        <CodeBlock lang="text">{`GET /users?sort=-created_at,id

# Prefixo '-' = desc. Múltiplos campos = ordem.
# O id como último tiebreaker é OBRIGATÓRIO em cursor pagination`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Nunca ordene só por <InlineCode>created_at</InlineCode> sem tiebreaker. Se duas linhas têm o mesmo timestamp (comum em inserções em lote), a ordem é indefinida e você perde/duplica na paginação.
        </Callout>
      </Section>

      <Section title="Response envelope" accent={accent}>
        <CodeBlock lang="json">{`{
  "items": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIz...",
    "hasMore": true
  },
  "meta": {
    "requestId": "req_abc123",
    "took": "42ms"
  }
}`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
