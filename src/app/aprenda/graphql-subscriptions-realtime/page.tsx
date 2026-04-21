import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('graphql-subscriptions-realtime');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que graphql-ws substituiu subscriptions-transport-ws?',
    options: [
      'Nome melhor',
      'subscriptions-transport-ws foi arquivado: tinha problema de keep-alive, sem ack de conexão robusto, e sem reutilização sobre HTTP/2. graphql-ws implementa o novo protocolo oficial com ConnectionInit/Ack, Ping/Pong explícito e suporte a queries/mutations pelo mesmo socket',
      'Mais rápido só',
      'Gera JSON',
    ],
    correct: 1,
    explanation: 'O protocolo legado (sw-ws) tem bugs conhecidos de reconnection e foi formalmente deprecated. graphql-ws (enisdenjo/graphql-ws) é o padrão atual, suportado por Apollo Server 4, GraphQL Yoga, Hasura, Hot Chocolate. Apollo Client tem GraphQLWsLink.',
  },
  {
    question: 'Como escalar subscriptions em múltiplas instâncias do servidor?',
    options: [
      'Só vertical',
      'PubSub externo (Redis pubsub, NATS, Kafka). Cada instância publica eventos ao PubSub e assina os tópicos dos clientes conectados. Sem isso, publish num pod não chega nos clientes conectados em outro pod',
      'Load balancer sticky basta',
      'Impossível escalar',
    ],
    correct: 1,
    explanation: 'Sticky session mantém o cliente num pod, mas publishes vêm de qualquer pod (mutation chega onde o LB entregar). Sem pubsub central, evento some. Padrão: graphql-redis-subscriptions ou Yoga + Redis. Cuidado com fan-out — não publique para todos os clientes; filtre por filter function.',
  },
  {
    question: 'Quando SSE (Server-Sent Events) é melhor que WebSocket para subscriptions?',
    options: [
      'Nunca',
      'Fluxo unidirecional server→cliente, HTTP normal (atravessa proxies/corporate firewalls sem upgrade), reconnect automático nativo do EventSource, tipado como text/event-stream. GraphQL sobre SSE via graphql-sse funciona bem para notificações/feeds',
      'Sempre',
      'Igual',
    ],
    correct: 1,
    explanation: 'WebSocket é duplex e exige upgrade — alguns proxies corporativos bloqueiam. SSE roda em GET HTTP normal, tem reconnect automático com Last-Event-ID, e GraphQL Yoga suporta nativamente. Para chat bidirecional, WS ainda vence. Para notificações de 1 via, SSE é mais simples e resiliente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="graphql-subscriptions-realtime"
      title="Subscriptions real-time"
      icon="⚡"
      xp={50}
      readTime={12}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="graphql-federation"
      nextTitle="GraphQL Federation para múltiplos times"
      quiz={quiz}
    >
      <Section title="Subscriptions na spec GraphQL" accent={accent}>
        <p>
          Subscription é a terceira operation root (além de Query e Mutation). Retorna um stream de eventos
          ao invés de um valor único. Transport padrão hoje é WebSocket via protocolo graphql-ws, com
          alternativa SSE via graphql-sse.
        </p>
        <CodeBlock lang="graphql">{`type Subscription {
  messageAdded(channelId: ID!): Message!
  postUpdated(postId: ID!): Post!
}`}</CodeBlock>
      </Section>

      <Section title="Servidor com graphql-ws" accent={accent}>
        <CodeBlock lang="ts">{`import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createPubSub } from 'graphql-yoga';

const pubsub = createPubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: (_, { channelId }) =&gt;
        pubsub.subscribe('message:' + channelId),
      resolve: (payload) =&gt; payload,
    },
  },
  Mutation: {
    sendMessage: async (_, { channelId, text }, ctx) =&gt; {
      const msg = await ctx.db.message.create({ channelId, text, userId: ctx.user.id });
      pubsub.publish('message:' + channelId, msg);
      return msg;
    },
  },
};

const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
useServer({ schema, context: authContext }, wsServer);`}</CodeBlock>
      </Section>

      <Section title="Cliente com Apollo Client" accent={accent}>
        <CodeBlock lang="ts">{`import { split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(createClient({
  url: 'wss://api.exemplo.com/graphql',
  connectionParams: () =&gt; ({ authToken: getToken() }),
  retryAttempts: Infinity,
}));

const link = split(
  ({ query }) =&gt; {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpLink,
);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Auth em WebSocket: mande o token no connectionParams, valide no onConnect do servidor. Nunca
          dependa de cookie — muitos clientes WS não enviam. Rotacione token em reconexão.
        </Callout>
      </Section>

      <Section title="Scaling cross-instance" accent={accent}>
        <p>
          Redis pubsub (graphql-redis-subscriptions) é o padrão: cada pod publica e assina pelo Redis. NATS e
          Kafka servem quando há necessidade de persistência ou replay. Filtre fan-out: um tópico por canal,
          não broadcast global.
        </p>
        <Callout tone="info" icon="💡">
          Backpressure importa: cliente lento com muitos eventos vaza memória no servidor. Feche socket após
          N eventos pendentes ou use bounded channel por cliente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
