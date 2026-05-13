import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('graphql-quando-faz-sentido');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o "problema N+1" em GraphQL?',
    options: [
      'Limite de requests por segundo',
      'Resolver aninhado executa query individual por item — ex: lista de 100 posts carrega 100 queries de autor — causa explosão de latência e carga no banco',
      'Erro de versão',
      'Limite do schema',
    ],
    correct: 1,
    explanation: 'Você pede { posts { author { name } } } esperando 1 query, mas cada resolver de author roda uma. 100 posts = 100 queries SELECT author WHERE id = ?. Solução clássica: DataLoader — batcha dentro de um tick, executa um WHERE id IN (...) só.',
  },
  {
    question: 'O que DataLoader faz?',
    options: [
      'Renderiza loader animado',
      'Batcha requisições individuais durante o mesmo tick do event loop em uma query agregada + faz cache por request',
      'Carrega schema do banco',
      'Converte REST em GraphQL',
    ],
    correct: 1,
    explanation: 'DataLoader (criado pelo Facebook) acumula pedidos de ID. No próximo tick, chama sua função batcher UMA vez com todos os IDs. Retorna na ordem certa. Cache dedupe idêntico. É O padrão anti N+1.',
  },
  {
    question: 'Em quais cenários GraphQL geralmente PERDE pra REST?',
    options: [
      'Sempre perde',
      'APIs públicas de alto tráfego (cache HTTP granular importa), payload pequeno previsível, arquiteturas onde over-fetching não é problema real',
      'Em mobile',
      'Com TypeScript',
    ],
    correct: 1,
    explanation: 'GraphQL brilha em BFF (cliente rico pedindo combinações), federação de microservices (Apollo Federation), apps móveis heterogêneos. Em APIs B2B onde clientes querem o mesmo shape e CDN cacheia por URL, REST é mais simples e barato.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="graphql-quando-faz-sentido"
      title="GraphQL quando faz sentido: N+1, DataLoader e federation"
      icon="◈"
      xp={60}
      readTime={14}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="grpc-e-protobuf"
      nextTitle="gRPC + Protobuf: RPC tipado e streaming bidirecional"
      quiz={quiz}
    >
      <Section title="O que GraphQL resolve" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Over-fetching</strong>: REST devolve campos demais; cliente pede só o que usa.</li>
          <li><strong>Under-fetching</strong>: REST obriga N requests (user + posts + comments); GraphQL traz tudo em 1.</li>
          <li><strong>Agregação multi-fonte</strong>: um schema combina vários backends (BFF pattern).</li>
          <li><strong>Evolução sem versionamento</strong>: adicione campos livremente; clientes só quebram se removerem algo que usavam.</li>
        </ul>
      </Section>

      <Section title="N+1 — o problema fundamental" accent={accent}>
        <CodeBlock lang="typescript">{`// Query do cliente
{ posts { title, author { name } } }

// Resolvers naïve — DESASTRE
const resolvers = {
  Query: { posts: () => db.posts.findMany() },  // 1 query
  Post: {
    author: (post) => db.user.findUnique({ id: post.authorId }) // N queries!
  }
};
// 100 posts → 1 + 100 = 101 queries`}</CodeBlock>
      </Section>

      <Section title="DataLoader — a solução canônica" accent={accent}>
        <CodeBlock lang="typescript">{`import DataLoader from 'dataloader';

// Cria UM loader por request (não reuse entre requests!)
const userLoader = new DataLoader(async (ids: readonly string[]) => {
  const users = await db.user.findMany({ where: { id: { in: [...ids] } } });
  // IMPORTANTE: retornar NA ORDEM dos ids
  return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId) // batcha
  }
};
// 100 posts → 1 + 1 = 2 queries`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Regra crítica: loader por request (geralmente criado em context). Reusar entre requests vaza cache e dados de outros users.
        </Callout>
      </Section>

      <Section title="Persisted queries e segurança" accent={accent}>
        <p>
          APIs GraphQL públicas são vetor de DoS — um query com 10 níveis de nesting derruba o servidor. Defesas:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Persisted queries</strong>: cliente manda hash de query pré-registrada; servidor resolve. Bloqueia queries ad-hoc.</li>
          <li><strong>Query depth limit</strong>: graphql-depth-limit rejeita queries &gt; N níveis.</li>
          <li><strong>Query complexity scoring</strong>: cada campo tem custo; total máximo por request.</li>
          <li><strong>Rate limiting por operação</strong>: não só por request.</li>
        </ul>
      </Section>

      <Section title="Federation: schema unificado de múltiplos serviços" accent={accent}>
        <p>
          Apollo Federation (v2) permite que serviços independentes publiquem &quot;subgraphs&quot; que o gateway combina em um schema unificado. Cada time é dono do seu subgraph. É o padrão moderno pra GraphQL em escala.
        </p>
        <Callout tone="info" icon="💡">
          Alternativas: <strong>schema stitching</strong> (mais manual, legado) e <strong>BFF dedicado</strong> (um serviço GraphQL que chama REST por baixo — padrão pragmático quando só tem um cliente).
        </Callout>
      </Section>

      <Section title="Quando REST vence" accent={accent}>
        <p>
          GraphQL é <em>ferramenta</em>, não religião. Preferir REST quando:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Cache HTTP importa muito (GraphQL é 1 endpoint POST, CDN não cacheia por URL).</li>
          <li>Clientes querem o mesmo shape (over-fetching é teórico, não real).</li>
          <li>Payload pequeno previsível (o ganho de GraphQL é marginal).</li>
          <li>Time pequeno — GraphQL tem custo operacional (DataLoader, complexity limit, caching específico).</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
