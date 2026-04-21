import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-graphql-api-completa');

const accent = '#e535ab';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia uma API GraphQL portfolio-grade de um toy?',
    options: [
      'Ter muitos types',
      'Schema com conventions consistentes (Node, Connection, Payload), DataLoader em todo lookup, auth via directive + context, cache em duas camadas (Redis response cache + client normalized), testes (schema snapshot + integration com graphql-tools), observability (Apollo Studio ou Hive) e docs auto-geradas',
      'Estar online',
      'Ter 100 queries',
    ],
    correct: 1,
    explanation: 'Toy roda. Portfolio-grade sobrevive em produção: observability por campo, complexity limit, depth limit, rate limit, schema check em PR, error codes tipados, migrations versionadas. Recruiter senior lê README e entende em 2 minutos o que foi pensado.',
  },
  {
    question: 'Como implementar autorização por campo sem poluir resolvers?',
    options: [
      'If em cada resolver',
      'Schema directive @auth(role: ADMIN) aplicada no SDL, implementada via graphql-shield ou mapper que envolve o resolver e valida contra ctx.user antes de executar. Centraliza policy num lugar e o schema documenta o requisito',
      'Não fazer auth',
      'Só auth no gateway',
    ],
    correct: 1,
    explanation: 'Ifs espalhados divergem. graphql-shield compõe regras (and/or/chain) e aplica por type/field. Alternativa: custom directive com mapSchema do graphql-tools. Em qualquer caso, a regra aparece no SDL — clientes veem qual permissão cada campo exige.',
  },
  {
    question: 'Qual o entregável que mais impressiona em um capstone GraphQL?',
    options: [
      'Só código',
      'README que explica decisões (por que DataLoader aqui, por que cache ali), link para Apollo Studio (schema + usage), deploy live (Railway/Fly), docs auto-geradas, CI com schema check bloqueando breaking change, e um writeup curto sobre um trade-off não óbvio (ex.: escolher BFF ou Federation)',
      'PDF bonito',
      'Logo animado',
    ],
    correct: 1,
    explanation: 'Engineer sênior demonstra raciocínio. Mostrar que você escolheu não usar Federation (e justificou) vale mais que implementar Federation sem motivo. Deploy live + observability + CI rigoroso sinalizam prontidão para produção, não só conhecimento teórico.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-graphql-api-completa"
      title="Capstone: API GraphQL completa em produção"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="GraphQL completo"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa uma API GraphQL completa para um produto real (fórum, task manager, e-commerce enxuto).
          Pense como feature review: cada decisão documentada, cada limite testado. Stack sugerido: Apollo
          Server 4, Postgres, Prisma ou Drizzle, Redis, Apollo Client no front.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="yaml">{`# 1. Schema
- Conventions: Node interface, Relay Connections, Payload types com UserError
- Pelo menos 8 types, 3 mutations, 1 subscription
- @deprecated usado em pelo menos um campo com reason

# 2. Resolvers
- DataLoader em todo lookup 1-N
- Context por request (user, loaders, db, redis)
- Error classes tipadas (AuthError, NotFoundError, ValidationError)

# 3. Auth
- JWT no Authorization header
- Directive @auth(role: ADMIN) aplicada via graphql-shield ou mapSchema
- Subscription auth via connectionParams

# 4. Cache
- APQ habilitado (persisted queries) com GET em CDN
- Response cache plugin com hints @cacheControl no SDL
- Apollo Client com typePolicies para Connections

# 5. Subscriptions
- graphql-ws no transport
- Redis pubsub para escalar cross-instance
- Pelo menos 1 subscription real (chat, notificacao)

# 6. Testes
- Schema snapshot em CI (detecta breaking change)
- Integration tests com @apollo/server/testing
- Testes de auth negativos (unauthorized, forbidden)

# 7. Observability
- Apollo Studio ou Hive conectado
- Logs estruturados por request (query count, duration)
- Complexity limit + depth limit configurados

# 8. Deploy
- Railway/Fly/Render para API
- Vercel/Netlify para web client
- Health check + readiness probe

# 9. Writeup (README ou blog)
- Diagrama do schema
- Decisoes justificadas (por que nao Federation, por que DataLoader, etc.)
- Limites conhecidos + next steps`}</CodeBlock>
      </Section>

      <Section title="Critérios de aceitação" accent={accent}>
        <p>
          Queries do happy path respondem em menos de 100ms p95 local. Query count por request monitorado e
          nunca supera o teórico (DataLoader funcionando). Breaking change em schema é bloqueada em PR. Token
          inválido retorna UNAUTHENTICATED, sem vazar stack. Subscription reconecta sozinha após kill do pod.
        </p>
        <Callout tone="success" icon="🎓">
          Capstone que demonstra GraphQL usável em produção. Recruiter que leu Apollo docs reconhece cada
          decisão e sabe que você não vai derrubar o banco no primeiro release. Esse nível é diferencial real
          em vaga sênior de plataforma ou API.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
