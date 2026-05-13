import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('schema-design-serio');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que non-null por padrão é uma armadilha em campos de negócio?',
    options: [
      'É sempre seguro',
      'Erro em resolver de campo non-null propaga null para o parent non-null e pode derrubar a query inteira. Regra: non-null apenas quando impossível faltar (id, createdAt). Campos que dependem de external service ou join devem ser nullable, retornando erro granular',
      'Nullable é errado',
      'GraphQL não tem null',
    ],
    correct: 1,
    explanation: 'Spec GraphQL faz null propagation: se campo non-null retorna null, o runtime anula o parent até encontrar nullable. Se toda a árvore é non-null, a query inteira falha. Princípio: generoso em saída, rigoroso em entrada (inputs non-null faz sentido, outputs quase sempre nullable).',
  },
  {
    question: 'O que o padrão Relay Connections resolve?',
    options: [
      'Nada relevante',
      'Paginação estável por cursor (não por offset — que quebra com inserts), edges com metadata de relacionamento, pageInfo com hasNextPage, e totalCount opcional. Consistente entre listas do schema, o que permite UI genérica',
      'Só aparência',
      'Evita auth',
    ],
    correct: 1,
    explanation: 'offset/limit quebra: se alguém insere item na página 1, você vê o mesmo item duas vezes entre páginas. Cursor é opaco (base64 geralmente encoda id+timestamp) e estável. Connections também reservam espaço para metadata de edge (ex.: relationshipType, weight em graphs).',
  },
  {
    question: 'Como evoluir schema sem quebrar clientes antigos?',
    options: [
      'Mudar sempre',
      'Aditivo primeiro (novos campos, novos types, novas queries). @deprecated com reason para remover depois. Nunca renomear: criar novo, deprecated no antigo, remover após métrica de uso cair a zero. Breaking changes: major version do endpoint (/graphql/v2)',
      'Quebrar quando precisar',
      'Usar versionamento como REST',
    ],
    correct: 1,
    explanation: 'GraphQL foi desenhado para ser versionless por aditivos. Apollo Studio e similares dão observability de uso por campo — decide remoção com dado, não opinião. @deprecated(reason: "Use fullName") aparece em IDEs. Breaking change só em caso extremo, e mesmo assim em endpoint separado coexistindo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="schema-design-serio"
      title="Schema design sério"
      icon="📐"
      xp={55}
      readTime={13}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="resolvers-dataloader-n-plus-1"
      nextTitle="Resolvers + DataLoader (evitando N+1)"
      quiz={quiz}
    >
      <Section title="Tipos, interfaces, unions, enums" accent={accent}>
        <p>
          Schema bem desenhado fala a linguagem do domínio, não do banco. Use interface quando há comportamento
          comum (Node com id), union quando tipos não compartilham campos (SearchResult = User | Post | Tag),
          enum para valores fechados (Role, Status).
        </p>
        <CodeBlock lang="graphql">{`interface Node { id: ID! }

type User implements Node {
  id: ID!
  name: String!
  email: String           # nullable: pode ser oculto por privacidade
  role: Role!
}

enum Role { ADMIN EDITOR VIEWER }

union SearchResult = User | Post | Tag`}</CodeBlock>
      </Section>

      <Section title="Nullable vs non-null: generoso em saída" accent={accent}>
        <p>
          Null propagation do GraphQL derruba parents. Marque non-null apenas quando não há cenário de falha:
          id, createdAt, campos calculados puros. Campos que dependem de join, external service ou autorização
          condicional devem ser nullable — cliente trata ausência sem perder o resto da query.
        </p>
        <Callout tone="warn" icon="⚠️">
          Princípio Stripe/GitHub: inputs são rigorosos (non-null, validados), outputs são generosos
          (nullable por padrão, exceto identidade). Isso permite retornar parcial quando um subserviço cai.
        </Callout>
      </Section>

      <Section title="Connections pattern (Relay)" accent={accent}>
        <CodeBlock lang="graphql">{`type Query {
  posts(first: Int, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}`}</CodeBlock>
      </Section>

      <Section title="Input types e naming" accent={accent}>
        <p>
          Mutations recebem um único input type (não argumentos soltos) — facilita evolução. Convenção:
          CreatePostInput, UpdatePostInput, com campos explícitos. Retorne um payload com erros de domínio
          tipados, não apenas o objeto criado.
        </p>
        <CodeBlock lang="graphql">{`input CreatePostInput {
  title: String!
  body: String!
  tags: [String!] = []
}

type CreatePostPayload {
  post: Post
  errors: [UserError!]!
}

type UserError { field: [String!]! message: String! code: String! }`}</CodeBlock>
      </Section>

      <Section title="Evolução sem quebrar" accent={accent}>
        <p>
          Aditivo por padrão. Deprecate antes de remover. Métrica de uso por campo (Apollo Studio, Hive) decide
          quando é seguro apagar. Schema review obrigatório em PR — schema é API pública e dívida eterna.
        </p>
      </Section>
    </ModuleLayout>
  );
}
