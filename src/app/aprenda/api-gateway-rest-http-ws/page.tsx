import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('api-gateway-rest-http-ws');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando escolher HTTP API em vez de REST API no API Gateway?',
    options: [
      'Sempre REST',
      'HTTP API: quando quer simples, barato (70% mais barato), low latency, apenas JWT/Cognito authorizer. REST API: quando precisa WAF, request validation, API keys + usage plans, mapping templates avançados',
      'HTTP é deprecated',
      'Mesma coisa',
    ],
    correct: 1,
    explanation: 'HTTP API (v2) é a versão moderna e enxuta. REST API tem mais features (WAF, resource policies, cache, private integrations via VPC link). Em 2026 default escolha HTTP; cair em REST só se precisar de feature específica.',
  },
  {
    question: 'O que é Lambda authorizer em API Gateway?',
    options: [
      'Função Lambda que autoriza',
      'Lambda que recebe request (token/header), valida, retorna IAM policy document. API GW cache (default 5min). Flexível pra qualquer auth custom (tokens custom, header signatures, IP-based)',
      'Substitui Cognito',
      'Obrigatório em todos endpoints',
    ],
    correct: 1,
    explanation: 'TOKEN authorizer (só valida Authorization header) vs REQUEST authorizer (acesso a body/query/path). Retorna IAM policy que API GW cacheia. Cache key configurável. Útil quando Cognito não serve (tokens legacy, multi-tenant custom).',
  },
  {
    question: 'Como API Gateway escala?',
    options: [
      'Não escala',
      'Gerenciado; escala automaticamente; throttle default 10k rps/conta (aumentável). Cobra por request + transferência. Se backend (Lambda) é o gargalo, API GW enfileira até backend dar conta',
      'Apenas com reserved concurrency',
      'Cap em 1000 rps',
    ],
    correct: 1,
    explanation: 'Throttling em 2 níveis: account (10k rps soft) e per-API (stage/method). 429 Too Many Requests quando excede. Usage plans associam API keys a throttle + quota diária/mensal.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="api-gateway-rest-http-ws"
      title="API Gateway: REST vs HTTP vs WebSocket"
      icon="🌐"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="dynamodb-para-dev"
      nextTitle="DynamoDB pra dev: partition key, GSI e Streams"
      quiz={quiz}
    >
      <Section title="HTTP API vs REST API" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Feature', 'HTTP API', 'REST API']}
          rows={[
            ['Preço', '~$1/M requests', '~$3.50/M requests'],
            ['Latência', '~30% menor', 'Maior'],
            ['Authorizer', 'JWT, Lambda', 'Cognito, Lambda, IAM'],
            ['WAF integration', 'Não', 'Sim'],
            ['API keys + usage plans', 'Não', 'Sim'],
            ['Request validation', 'Limitada', 'Completa'],
            ['Private APIs (VPC)', 'Não', 'Sim'],
            ['Mapping templates', 'Não', 'Sim (VTL)'],
          ]}
        />
      </Section>

      <Section title="WebSocket API" accent={accent}>
        <p>
          Conexões persistentes pra chat, multiplayer, real-time. Cada connection tem um connectionId. Lambda recebe events: $connect, $disconnect, $default (ou routes custom). Usa <strong>Management API</strong> pra mandar mensagem pra conexão específica: POST /@connections/{'{connectionId}'}.
        </p>
        <Callout tone="info" icon="💡">
          Alternativas: AppSync (GraphQL sub), IoT Core (MQTT), ALB (sticky). WebSocket API é bom pra baixa complexidade; chat real-time em escala massiva considere Redis pubsub + Fargate.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
