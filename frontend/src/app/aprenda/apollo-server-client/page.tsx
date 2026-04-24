import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('apollo-server-client');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Para que serve APQ (Automatic Persisted Queries)?',
    options: [
      'Cache no banco',
      'Cliente envia apenas um hash SHA-256 da query; se servidor ainda não viu, cliente reenvia o texto e ambos persistem. Reduz payload de upload e permite GET com cache HTTP em CDN, já que o hash estável vira chave',
      'Autenticar',
      'Compilar resolvers',
      ],
    correct: 1,
    explanation: 'Query GraphQL via POST não cachea em CDN. Com APQ + GET, URL vira /graphql?extensions={persistedQuery:{sha256Hash}}&variables=... — CDN cacheia por chave. Apollo Server 4 tem plugin nativo, Apollo Client também. Combinado com response cache, reduz drasticamente carga.',
  },
  {
    question: 'Por que o normalized cache do Apollo Client é poderoso?',
    options: [
      'É bonito',
      'Objetos com __typename + id são indexados globalmente. Atualizar um campo do User:42 numa mutation propaga automaticamente para toda query que o referencia. Elimina refetch manual e sincroniza a UI',
      'Não faz nada',
      'Só serializa',
    ],
    correct: 1,
    explanation: 'Apollo Client armazena a resposta em cache flat indexado por User:42, Post:17 etc. Uma mutation que retorna o objeto atualizado reflete em todas as views. Se o shape muda (lista), usar update function ou refetchQueries. Fragment matching com possibleTypes permite interfaces/unions.',
  },
  {
    question: 'Quando usar Relay ou urql em vez de Apollo?',
    options: [
      'Nunca',
      'Relay: projetos grandes com colocation forte (fragmentos por componente) e codegen rigoroso. urql: bundle menor, arquitetura de exchanges customizável, bom para apps pequenas ou edge. Apollo: middleground com maior ecossistema e DX',
      'Só Relay vale',
      'Todos iguais',
    ],
    correct: 1,
    explanation: 'Relay impõe disciplina (compiler + convenções) que escala em apps Meta-style. urql é minimalista e pluggable, popular em Remix/SvelteKit. Apollo domina em DX e ferramentas (Studio, Rover). Decisão técnica, não religiosa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="apollo-server-client"
      title="Apollo server + client em produção"
      icon="🚀"
      xp={55}
      readTime={13}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="graphql-subscriptions-realtime"
      nextTitle="Subscriptions real-time"
      quiz={quiz}
    >
      <Section title="Apollo Server 4 em produção" accent={accent}>
        <p>
          Apollo Server 4 é framework-agnostic: você pluga em Express, Fastify, Koa, ou roda standalone. Plugins
          cobrem landing page, usage reporting, response cache, APQ, complexity. Error formatting é explícito:
          classifique erros (AuthenticationError, ValidationError, InternalError) e nunca vaze stack trace para o cliente.
        </p>
        <CodeBlock lang="ts">{`import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import responseCachePlugin from '@apollo/server-plugin-response-cache';

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginCacheControl({ defaultMaxAge: 60 }),
    responseCachePlugin(),
  ],
  formatError: (formatted, err) =&gt; {
    if (formatted.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      logger.error(err);
      return { message: 'Internal error', extensions: { code: 'INTERNAL' } };
    }
    return formatted;
  },
});

await server.start();
app.use('/graphql', expressMiddleware(server, { context }));`}</CodeBlock>
      </Section>

      <Section title="Caching: APQ + response cache" accent={accent}>
        <p>
          APQ tira o texto da query da URL/body e deixa apenas o hash — CDN cacheia por hash. Response cache
          guarda a resposta inteira por chave (hash + variáveis + hints de cacheControl do schema). Combine:
          campos marcados com @cacheControl(maxAge: 300, scope: PUBLIC) viram cacheáveis em CDN.
        </p>
        <Callout tone="info" icon="💡">
          Regra: campos com scope PUBLIC são cacheáveis globalmente; PRIVATE apenas por-usuário. Nunca marque
          dados sensíveis como PUBLIC. A política mais restritiva da query vence.
        </Callout>
      </Section>

      <Section title="Apollo Client normalized cache" accent={accent}>
        <CodeBlock lang="ts">{`import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';

const client = new ApolloClient({
  link: from([
    createPersistedQueryLink({ sha256, useGETForHashedQueries: true }),
    new HttpLink({ uri: '/graphql' }),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Post: {
        fields: {
          comments: { keyArgs: ['orderBy'], merge: mergeConnection },
        },
      },
    },
  }),
});`}</CodeBlock>
        <p>
          typePolicies customizam merge de paginação e campos computados. Sem keyArgs correto, cache confunde
          listas paginadas. merge function concatena edges e preserva pageInfo.
        </p>
      </Section>

      <Section title="Optimistic UI e fragment matching" accent={accent}>
        <p>
          Mutation com optimisticResponse pinta a UI antes da resposta chegar. Se o servidor diverge, Apollo
          reconcilia. Para unions/interfaces, configure possibleTypes (gerado via Apollo CLI a partir do schema)
          — caso contrário fragments em abstract types falham silenciosamente.
        </p>
      </Section>
    </ModuleLayout>
  );
}
