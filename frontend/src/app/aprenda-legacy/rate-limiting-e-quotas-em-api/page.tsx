import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rate-limiting-e-quotas-em-api');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que fixed-window rate limiting tem "burst" indesejado?',
    options: [
      'Bug em implementações antigas',
      'Contador zera no minuto — cliente pode bater limite no fim de 12:00 e novamente no início de 12:01, dobrando taxa na virada. Sliding window mitiga',
      'Porque usa Redis',
      'Só acontece em HTTP/1',
    ],
    correct: 1,
    explanation: 'Limit: 100 req/min. Cliente manda 100 às 12:00:59 (permitido) e 100 às 12:01:00 (janela nova, também permitido) — 200 em 1 segundo. Sliding window ajusta o cálculo para últimos 60s de forma contínua. Token bucket tem efeito similar (burst controlado).',
  },
  {
    question: 'Como token bucket lida com burst legítimo?',
    options: [
      'Bloqueia tudo',
      'Bucket acumula até capacidade (ex: 100 tokens) em velocidade fixa (ex: 10/s); cliente pode gastar 100 de uma vez se estava inativo, depois fica limitado a 10/s. Permite burst sem abandonar steady state',
      'Só funciona em cache',
      'Só em UDP',
    ],
    correct: 1,
    explanation: 'Bucket tem capacidade C e refill rate R. Cada request consome 1 token; se bucket vazio, 429. Cliente silencioso acumula tokens até C; pode gastar burst. Depois fica limitado ao refill rate. É o modelo mais usado em produção (AWS, Cloudflare, nginx).',
  },
  {
    question: 'O que o header `Retry-After` comunica em 429?',
    options: [
      'Horário atual do servidor',
      'Quanto esperar antes de retry — segundos ou HTTP-date. Cliente bem comportado respeita; evita retry storm que piora rate limit',
      'ID da conexão',
      'Versão da API',
    ],
    correct: 1,
    explanation: 'Retry-After: 60 significa "espere 60s antes de tentar de novo". HTTP semantic definido em RFC 9110. SDKs como @smithy (AWS) respeitam automaticamente. Ignorar dobra carga no servidor e pode virar DoS auto-infligido.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rate-limiting-e-quotas-em-api"
      title="Rate limiting e quotas: token bucket, leaky bucket e fairness"
      icon="🚦"
      xp={50}
      readTime={11}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="capstone-api-rest-produto-completo"
      nextTitle="Capstone: API REST completa de um produto real"
      quiz={quiz}
    >
      <Section title="Algoritmos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Algoritmo', 'Ideia', 'Uso']}
          rows={[
            ['Fixed window', 'Contador zera a cada minuto', 'Simples, mas com burst na virada'],
            ['Sliding window log', 'Lista timestamps recentes (últimos 60s)', 'Preciso, caro em memória'],
            ['Sliding window counter', 'Mistura 2 janelas fixas com peso', 'Compromisso aceitável'],
            ['Token bucket', 'Bucket enche a taxa fixa, request consome token', 'Default moderno (AWS, Cloudflare)'],
            ['Leaky bucket', 'Fila drena a taxa fixa', 'Suaviza tráfego, latência previsível'],
          ]}
        />
      </Section>

      <Section title="Token bucket em Redis (atômico)" accent={accent}>
        <CodeBlock lang="lua">{`-- Lua script em Redis — atômico
-- KEYS[1] = bucket key
-- ARGV[1] = capacity, ARGV[2] = refill_rate, ARGV[3] = now_ms
local capacity = tonumber(ARGV[1])
local refill   = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])

local data = redis.call('HMGET', KEYS[1], 'tokens', 'last')
local tokens = tonumber(data[1]) or capacity
local last   = tonumber(data[2]) or now

-- Refill
local elapsed = (now - last) / 1000
tokens = math.min(capacity, tokens + elapsed * refill)

if tokens < 1 then
  redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last', now)
  return {0, math.ceil((1 - tokens) / refill)}  -- rejeita, Retry-After
end

redis.call('HMSET', KEYS[1], 'tokens', tokens - 1, 'last', now)
return {1, 0}  -- permite`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Redis + Lua = atomicidade barata. Alternativas: <InlineCode>cloudflare/redis-rate-limiter</InlineCode>, <InlineCode>upstash/ratelimit</InlineCode>, <InlineCode>@nestjs/throttler</InlineCode>.
        </Callout>
      </Section>

      <Section title="Headers padronizados" accent={accent}>
        <CodeBlock lang="http">{`HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 60
Retry-After: 60
Content-Type: application/json

{"error":"rate_limit_exceeded","retry_after_s":60}`}</CodeBlock>
        <p>
          Draft IETF <InlineCode>draft-ietf-httpapi-ratelimit-headers</InlineCode> padroniza <InlineCode>RateLimit-*</InlineCode>. Inclua em toda resposta (não só 429) pra cliente saber quanto tem.
        </p>
      </Section>

      <Section title="Fairness multi-tenant" accent={accent}>
        <p>
          Rate limit global (1000 req/s pra toda a API) permite que um cliente agressivo afame os outros. Solução: <strong>bucket por tenant</strong> (API key, user, IP). Key: <InlineCode>ratelimit:{'{tenantId}'}</InlineCode>.
        </p>
        <p>
          Quota (diária/mensal) é limite de volume, não de taxa. Ex: plano free = 10k req/dia. Rate limit (req/s) ataca burst; quota ataca uso total.
        </p>
      </Section>
    </ModuleLayout>
  );
}
