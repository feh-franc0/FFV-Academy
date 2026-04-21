import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('openapi-como-contrato-vivo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre "spec-first" e "code-first" em OpenAPI?',
    options: [
      'São o mesmo processo',
      'Spec-first: você escreve YAML primeiro, gera client/server skeleton. Code-first: anota funções TS/Java, gera spec. Spec-first tende a dar APIs mais consistentes',
      'Spec-first é obrigatório em REST',
      'Code-first não valida contratos',
    ],
    correct: 1,
    explanation: 'Code-first (NestJS decorators, FastAPI, Spring) gera OpenAPI a partir do código — fácil mas casa spec com implementação. Spec-first (YAML primeiro, Stoplight/Swagger Editor) separa design do código, força revisão de contrato antes de codar. Default pragmático: code-first em startup; spec-first em times grandes com clientes externos.',
  },
  {
    question: 'Para que serve contract testing (ex: Pact)?',
    options: [
      'Substituir testes unitários',
      'Garantir que provider e consumer concordam sobre o contrato — consumer escreve expectations, provider valida — descobre breaking change antes de produção',
      'Testar performance',
      'Verificar HTTPS',
    ],
    correct: 1,
    explanation: 'Pact: consumer (frontend) escreve "quando chamo GET /users/1 espero {id, email}". Gera contract file. Provider (backend) roda teste que SERVE aquilo. Se provider muda shape, Pact test quebra — antes de deploy. É a única forma robusta de evitar breaking entre times independentes.',
  },
  {
    question: 'O que um mock server (Prism, Wiremock) permite?',
    options: [
      'Substituir produção',
      'Frontend dev com backend em construção: servidor fake serve respostas baseadas no OpenAPI schema; exemplos no próprio spec controlam dados',
      'Compilar TypeScript',
      'Deploy automático',
    ],
    correct: 1,
    explanation: 'Prism lê openapi.yaml e sobe um servidor que responde conforme o schema. Frontend desenvolve em paralelo sem esperar backend. Combina perfeitamente com examples no spec (examples: são dados mockados contextuais). É o pulo do gato de times modernos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="openapi-como-contrato-vivo"
      title="OpenAPI como contrato vivo: codegen, mock server e contract testing"
      icon="📜"
      xp={50}
      readTime={11}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="paginacao-filtros-ordenacao"
      nextTitle="Paginação, filtros e ordenação profissionais"
      quiz={quiz}
    >
      <Section title="OpenAPI como fonte única de verdade" accent={accent}>
        <p>
          Em times maduros, o <InlineCode>openapi.yaml</InlineCode> é <strong>o contrato</strong>. Dele saem:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Client SDK em TS/Python/Go (via openapi-generator, orval, kubb)</li>
          <li>Server stubs (rotas tipadas, validação)</li>
          <li>Mock server (Prism, stoplight-studio, wiremock)</li>
          <li>Documentação interativa (Swagger UI, Scalar, ReDoc)</li>
          <li>Testes de contrato (Dredd, Schemathesis)</li>
        </ul>
      </Section>

      <Section title="Estrutura mínima" accent={accent}>
        <CodeBlock lang="yaml">{`openapi: 3.1.0
info:
  title: Users API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      operationId: getUser
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
              examples:
                default:
                  value: { id: "u1", email: "a@b.c", age: 30 }
        '404':
          description: Not Found
components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id: { type: string }
        email: { type: string, format: email }
        age: { type: integer, minimum: 0 }`}</CodeBlock>
      </Section>

      <Section title="Codegen em TypeScript" accent={accent}>
        <CodeBlock lang="bash">{`# Orval — gera client com TanStack Query + Zod schemas
npx orval --config orval.config.ts

# Kubb — gera tipos + client + Zod em uma passada
npx kubb generate

# openapi-typescript — só tipos
npx openapi-typescript openapi.yaml -o types.ts`}</CodeBlock>
        <CodeBlock lang="typescript">{`// Após codegen
import { client } from './gen/api';
const user = await client.getUser({ path: { id: 'u1' } });
//    ^? User (tipado a partir do spec)`}</CodeBlock>
      </Section>

      <Section title="Mock server: frontend sem esperar backend" accent={accent}>
        <CodeBlock lang="bash">{`# Prism: mock dinâmico baseado em schema
npx @stoplight/prism-cli mock openapi.yaml
# → http://localhost:4010 responde conforme o spec

# MSW (frontend-only): intercepta fetch no browser durante dev
# handlers gerados automaticamente a partir do OpenAPI`}</CodeBlock>
      </Section>

      <Section title="Contract testing com Pact" accent={accent}>
        <CodeBlock lang="typescript">{`// consumer test (frontend)
provider
  .uponReceiving('get user by id')
  .withRequest({ method: 'GET', path: '/users/1' })
  .willRespondWith({
    status: 200,
    body: { id: like('1'), email: like('a@b.c') }
  });

// CI publica contract. Provider roda:
// pact-provider-verifier --provider-base-url=http://localhost:3000
// Se backend não cumpre, CI falha — antes de deploy.`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Contract testing é o que permite microservices independentes evoluírem sem quebrar um ao outro. É barato de adicionar, caro de não ter.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
