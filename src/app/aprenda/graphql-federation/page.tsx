import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('graphql-federation');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema Federation 2 resolve que schema stitching não resolvia bem?',
    options: [
      'Nenhum',
      'Ownership distribuída com contratos explícitos: cada subgraph declara @key e estende types de outros subgraphs via @external/@requires/@provides. Composição é validada em build time pelo router, incompatibilidades viram erro de schema check antes de deploy',
      'Só nome diferente',
      'Mais lento',
    ],
    correct: 1,
    explanation: 'Stitching era runtime e opaco: o gateway adivinhava como juntar. Federation 2 é build-time: rover subgraph check compara contra o grafo atual, bloqueia breaking change. Directives (@key, @shareable, @override, @tag) formalizam quem é dono do quê. Ferramenta: Apollo Router (Rust) + rover CLI.',
  },
  {
    question: 'Quando Federation é exagero e BFF é suficiente?',
    options: [
      'Sempre Federation',
      'Times e produtos poucos (um ou dois times, uma ou duas UIs). Nesse caso um BFF (GraphQL que agrega REST/serviços) entrega o ganho de cliente sem a complexidade do router+subgraph+schema registry. Federation paga quando há 5+ times owning data distinto',
      'Federation é grátis',
      'BFF é anti-pattern',
    ],
    correct: 1,
    explanation: 'Federation tem overhead: schema registry (Apollo GraphOS ou Hive), CI para subgraph check, router em front. Isso só compensa quando múltiplos times precisam de autonomia para deploy. Para times pequenos, BFF monolítico GraphQL que chama microsserviços REST é mais simples e cobre 80% dos casos.',
  },
  {
    question: 'O que significa @key(fields: "id") num type federado?',
    options: [
      'Index do banco',
      'Declara a chave primária daquele entity naquele subgraph. O router usa essa chave para fazer entity resolution — se outro subgraph referencia o type, o router chama _entities(representations) no subgraph dono para hidratar',
      'Auth',
      'Cache',
    ],
    correct: 1,
    explanation: '@key torna o type uma entity federada. Users subgraph: type User @key(fields:"id") { id name }. Reviews subgraph: type User @key(fields:"id") { id reviews: [Review!] }. Router ao resolver User.reviews pega o id do Users subgraph e chama o Reviews subgraph com aquela representation.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="graphql-federation"
      title="GraphQL Federation para múltiplos times"
      icon="🌐"
      xp={55}
      readTime={13}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="capstone-graphql-api-completa"
      nextTitle="Capstone: API GraphQL completa"
      quiz={quiz}
    >
      <Section title="Por que Federation existe" accent={accent}>
        <p>
          Um schema monolítico com 800 tipos owned por 20 times vira inferno de merge. Federation fatia o grafo
          em subgraphs, cada um owned por um time, compostos por um router em runtime. Contrato explícito:
          @key marca entities, @external/@requires/@provides coordenam extensões cross-subgraph.
        </p>
      </Section>

      <Section title="Subgraph Users" accent={accent}>
        <CodeBlock lang="graphql">{`extend schema @link(
  url: "https://specs.apollo.dev/federation/v2.3",
  import: ["@key", "@shareable"]
)

type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String
}

type Query {
  me: User
  user(id: ID!): User
}`}</CodeBlock>
      </Section>

      <Section title="Subgraph Reviews estendendo User" accent={accent}>
        <CodeBlock lang="graphql">{`extend schema @link(
  url: "https://specs.apollo.dev/federation/v2.3",
  import: ["@key", "@external"]
)

type Review {
  id: ID!
  body: String!
  author: User!
}

type User @key(fields: "id") {
  id: ID! @external
  reviews: [Review!]!
}`}</CodeBlock>
        <p>
          O subgraph Reviews não é dono de User, apenas estende. O router resolve user.reviews chamando
          _entities no Reviews com a representation id. Users subgraph nem sabe que Reviews existe.
        </p>
      </Section>

      <Section title="Router + schema check em CI" accent={accent}>
        <CodeBlock lang="bash">{`# Publicar subgraph
rover subgraph publish my-graph@prod \\
  --name users \\
  --schema ./users.graphql \\
  --routing-url https://users.internal/graphql

# Schema check em PR (bloqueia breaking)
rover subgraph check my-graph@prod \\
  --name users \\
  --schema ./users.graphql`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Apollo Router (Rust) substituiu Apollo Gateway (Node). Mais rápido, query planner melhor, suporta
          plugins via Rhai/Wasm. GraphOS ou Hive gerenciam o schema registry; em on-prem dá para rodar o router
          standalone apontando para supergraph.graphql estático.
        </Callout>
      </Section>

      <Section title="Armadilhas" accent={accent}>
        <p>
          Federation não elimina N+1 cross-subgraph — o router faz entity fetch batching, mas queries com
          muitos hops saltam entre subgraphs. @requires que puxa campos de outro subgraph vira lookup extra.
          Autorização deve viver no subgraph dono, nunca no router (router não conhece regras de negócio).
        </p>
        <Callout tone="warn" icon="⚠️">
          Não adote Federation para fatiar monolito prematuro. Sem times distintos, você só ganhou complexidade.
          O problema que Federation resolve é organizacional; a solução é técnica.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
