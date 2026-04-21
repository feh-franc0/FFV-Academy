import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('graphql-mental-model');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o diferencial real do GraphQL vs REST bem desenhado?',
    options: [
      'Sempre mais rápido',
      'Cliente declara exatamente os campos que precisa num único round-trip tipado. Elimina over-fetching (REST devolve tudo) e under-fetching (REST exige múltiplas chamadas encadeadas). Vence quando cliente tem N views diferentes sobre os mesmos recursos',
      'Substitui SQL',
      'Não precisa de backend',
    ],
    correct: 1,
    explanation: 'REST maduro com sparse fieldsets (JSON:API) reduz over-fetching, e REST com expand/include reduz under-fetching — GraphQL formaliza isso num schema tipado. O ganho real aparece quando o mesmo backend serve mobile, web e widgets, cada um precisando de um subset diferente. Para CRUD simples com 1 cliente, REST é mais barato operacionalmente.',
  },
  {
    question: 'Quando GraphQL claramente perde para REST?',
    options: [
      'Quando o time não gosta de JSON',
      'APIs públicas com cache HTTP pesado (CDN), CRUD simples com 1 consumidor, file upload puro, streaming binário. GraphQL complica cache (POST default), rate limit por complexidade e debugging via curl',
      'Nunca perde',
      'Só em Java',
    ],
    correct: 1,
    explanation: 'Cache HTTP em GraphQL exige APQ (Automatic Persisted Queries) + GET — setup não trivial. Rate limit por endpoint não funciona: precisa calcular custo por query (complexity analysis). Stripe, GitHub e Shopify oferecem GraphQL mas o tráfego core segue em REST. Não é religião: é trade-off.',
  },
  {
    question: 'O que GraphQL NÃO resolve magicamente?',
    options: [
      'Autenticação',
      'N+1 no resolver (precisa DataLoader), autorização por campo (precisa directive ou shield), versionamento (deprecation via @deprecated), cache server-side (response cache ou APQ), DoS por queries pesadas (depth/complexity limit)',
      'Todos os problemas',
      'Nada',
    ],
    correct: 1,
    explanation: 'GraphQL é apenas uma especificação de query + schema. Tudo que é operacional — N+1, auth, cache, DoS — continua sendo responsabilidade do engenheiro. Times que adotam GraphQL pensando "agora fica fácil" quebram em produção no primeiro mês. Veremos cada um desses problemas em módulos seguintes desta trilha.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="graphql-mental-model"
      title="GraphQL mental model: quando vale a pena"
      icon="🔺"
      xp={45}
      readTime={11}
      trailName="GraphQL completo"
      trailColor={accent}
      nextSlug="schema-design-serio"
      nextTitle="Schema design sério"
      quiz={quiz}
    >
      <Section title="O que GraphQL realmente é" accent={accent}>
        <p>
          GraphQL é três coisas: (1) uma query language, (2) um sistema de tipos, (3) um runtime que resolve a query
          contra o seu backend. Não é um banco, não é transport (roda sobre HTTP, WebSocket ou qualquer coisa).
          É um contrato entre cliente e servidor onde o cliente declara o shape dos dados que quer.
        </p>
        <CodeBlock lang="graphql">{`# Query: cliente pede só o que precisa
query PerfilUsuario($id: ID!) {
  user(id: $id) {
    id
    name
    avatar(size: SMALL)
    posts(last: 5) {
      edges {
        node { id title publishedAt }
      }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Over-fetching e under-fetching" accent={accent}>
        <p>
          Over-fetching: REST devolve 40 campos, você usa 3. Mobile paga em bytes e bateria. Under-fetching:
          para montar a tela você chama /user, depois /user/id/posts, depois /post/id/comments — 3 round-trips
          sequenciais. GraphQL colapsa em uma chamada tipada.
        </p>
        <Callout tone="info" icon="🎯">
          Regra prática: se a mesma API serve 3+ clientes (mobile iOS, mobile Android, web, widget, watch) com
          necessidades diferentes, GraphQL paga o overhead. Se serve 1 cliente CRUD, REST + OpenAPI é mais barato.
        </Callout>
      </Section>

      <Section title="Quando GraphQL vence" accent={accent}>
        <p>
          Times com múltiplos clientes heterogêneos (Meta, GitHub, Shopify Storefront). Produtos com UI rica
          que muda shape por tela. BFFs que agregam microsserviços para clientes. Exploração rápida do dado
          (introspection + GraphiQL destroi Postman).
        </p>
      </Section>

      <Section title="Quando GraphQL perde" accent={accent}>
        <p>
          CRUD público com cache pesado em CDN. Upload binário. Streaming grande (use HTTP range). APIs
          internas simples com 1 consumidor. Teams sem cultura de schema review (schema vira lixão em 6 meses).
        </p>
        <Callout tone="warn" icon="⚠️">
          Não adote GraphQL porque é moda. Adote porque um problema concreto (over/under-fetching real em
          múltiplos clientes) está doendo. Caso contrário o custo operacional (N+1, cache, auth, DoS) come
          todo o ganho.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
