import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('resolvers-dataloader-n-plus-1');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o problema N+1 aparece naturalmente em GraphQL?',
    options: [
      'Por culpa do cliente',
      'Cada resolver é chamado de forma independente pelo runtime. Para uma query que lista 100 posts e resolve author em cada post, o resolver de author roda 100 vezes — 100 queries no banco, mesmo que fossem ids distintos. Em REST o dev agrupa; em GraphQL precisa de DataLoader',
      'GraphQL é lento',
      'É bug do Apollo',
    ],
    correct: 1,
    explanation: 'O runtime resolve a árvore node a node. Sem batching, um resolver author(post) dispara SELECT * FROM users WHERE id = $1 cem vezes. DataLoader intercepta as chamadas dentro do mesmo tick, deduplica ids e faz um SELECT ... WHERE id IN (...) único.',
  },
  {
    question: 'Qual a regra de escopo do DataLoader?',
    options: [
      'Singleton global',
      'Uma instância por request. Cache dentro do loader dura apenas o request — reusar entre requests causa stale data e vazamento de dados entre usuários. Cria-se no context factory a cada request',
      'Dura uma semana',
      'Por sessão',
    ],
    correct: 1,
    explanation: 'DataLoader guarda cache em Map interno. Se compartilhado entre requests, um usuário vê dados de outro (e mutations não invalidam). Padrão: context({ req }) cria novos loaders por request. Caching cross-request deve ser Redis explícito, não DataLoader.',
  },
  {
    question: 'Quando DataLoader sozinho não basta?',
    options: [
      'Sempre basta',
      'Joins complexos com filtros diferentes por parent (ex.: últimos 5 posts por user), campos que dependem de agregação (counts), ou quando o custo do fetch individual não é proporcional ao id. Nesses casos: query batcher custom, prepared statements com UNION, ou prefetch no resolver raiz',
      'Nunca falha',
      'Só em MongoDB',
    ],
    correct: 1,
    explanation: 'DataLoader resolve 1-N simples (id → row). Top-N por parent exige window functions (ROW_NUMBER OVER PARTITION BY) ou lateral joins. Agregações (post.commentCount) precisam de cache explícito ou contador materializado. Conhecer o limite evita forçar DataLoader onde não cabe.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="resolvers-dataloader-n-plus-1"
      title="Resolvers + DataLoader (evitando N+1)"
      icon="⚙️"
      xp={55}
      readTime={13}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="apollo-server-client"
      nextTitle="Apollo server + client em produção"
      quiz={quiz}
    >
      <Section title="Anatomia de um resolver" accent={accent}>
        <p>
          Resolver recebe quatro argumentos: parent (valor resolvido do pai), args (argumentos do campo),
          context (per-request — user, loaders, db) e info (AST da query, útil para projeção seletiva).
          O valor retornado pode ser sync, Promise ou async iterator (subscriptions).
        </p>
        <CodeBlock lang="ts">{`const resolvers = {
  Post: {
    author: (post, _args, ctx) =&gt; ctx.loaders.userById.load(post.authorId),
    comments: (post, { first = 10 }, ctx) =&gt; ctx.loaders.commentsByPostId.load(post.id),
  },
};`}</CodeBlock>
      </Section>

      <Section title="O problema N+1 em carne viva" accent={accent}>
        <p>
          Query lista 100 posts. Cada post resolve author. Sem DataLoader: 1 SELECT de posts + 100 SELECTs
          de users. Com DataLoader: 1 + 1. Mesma query, latência 100x menor. Isso é a diferença entre GraphQL
          usável e GraphQL que derruba o banco.
        </p>
        <Callout tone="danger" icon="🚨">
          Métrica obrigatória em produção: query count por request. Sem isso, N+1 aparece só quando o banco
          cai. Logue ctx.db.queryCount ao fim de cada request, alerte acima de um threshold por complexidade.
        </Callout>
      </Section>

      <Section title="DataLoader na prática" accent={accent}>
        <CodeBlock lang="ts">{`import DataLoader from 'dataloader';

export function createLoaders(db) {
  return {
    userById: new DataLoader(async (ids: readonly string[]) =&gt; {
      const rows = await db.query(
        'SELECT * FROM users WHERE id = ANY($1)',
        [ids as string[]],
      );
      const byId = new Map(rows.map(r =&gt; [r.id, r]));
      return ids.map(id =&gt; byId.get(id) ?? null);
    }),
  };
}

// Apollo Server context
const server = new ApolloServer({ schema });
await startStandaloneServer(server, {
  context: async ({ req }) =&gt; ({
    user: await authenticate(req),
    loaders: createLoaders(db),
    db,
  }),
});`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O array retornado precisa ter o mesmo length e ordem dos ids. Se um id não existe, devolva null
          naquela posição — nunca filter. Senão DataLoader liga ids errados a resultados errados.
        </Callout>
      </Section>

      <Section title="Quando DataLoader não resolve" accent={accent}>
        <p>
          Top-N por parent (últimos 5 posts de cada user) exige janela SQL ou lateral join. Agregações exigem
          contador materializado. Filtros dinâmicos por parent exigem query batcher custom (encode filter + id
          no key, rehydrate no batch). Se o resolver precisa de contexto além do id, considere resolver no pai.
        </p>
      </Section>
    </ModuleLayout>
  );
}
