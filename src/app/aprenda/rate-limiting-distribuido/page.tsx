import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#f78166';

export const metadata: Metadata = {
  title: 'Rate Limiting Distribuído: token bucket, sliding window, Redis | FFV Academy',
  description:
    'Token bucket, leaky bucket, sliding window counter e log: os 4 algoritmos clássicos de rate limiting. Implementação com Redis + Lua script atômico, em produção.',
  keywords:
    'rate limiting distribuido, token bucket, leaky bucket, sliding window, redis rate limit, lua script atomic, api rate limit, throttling',
};

const quiz = [
  {
    question:
      'Qual algoritmo permite "bursts" acima do limite médio, desde que o balde tenha tokens disponíveis?',
    options: [
      'Leaky bucket',
      'Token bucket',
      'Fixed window counter',
      'Sliding window log',
    ],
    correct: 1,
    explanation:
      'Token bucket tem capacidade C e refill rate R: se o balde está cheio, pode consumir C tokens imediatamente (burst). Leaky bucket força taxa constante de saída, sem burst. Por isso APIs públicas (GitHub, AWS) preferem token bucket — clientes bem-comportados podem fazer bursts sem serem punidos.',
  },
  {
    question:
      'O problema principal do "Fixed Window Counter" é:',
    options: [
      'Usa muita memória',
      'Permite até 2x o rate limit se o cliente burst no fim de uma janela e início da próxima',
      'Não funciona em sistemas distribuídos',
      'Requer relógio sincronizado',
    ],
    correct: 1,
    explanation:
      'Fixed window com limite 100/min: cliente faz 100 reqs em 00:00:59 e mais 100 em 00:01:01 — passa 200 reqs em 2 segundos, violando o "espírito" do limite. Sliding window log ou sliding window counter resolvem. Fixed window é simples mas tem esse gap — ok pra casos tolerantes.',
  },
  {
    question:
      'Por que usar Lua script em Redis pra rate limiting?',
    options: [
      'Performance — Lua é mais rápido que TCL',
      'Atomicidade — GET + compute + SET viraria race condition em alta concorrência; Lua roda tudo atômico em uma ida ao servidor',
      'Segurança — Lua é sandboxed',
      'Sintaxe mais limpa que comandos nativos',
    ],
    correct: 1,
    explanation:
      'Rate limiting envolve read-modify-write: pegar contador, validar, incrementar, TTL. Sem atomicidade, dois clientes podem ler 99 simultaneamente, ambos incrementar pra 100, e o limite é estourado. Redis Lua garante que o script inteiro roda atômico, sem interleaving de outros comandos. EVAL + SHA-cached (EVALSHA) pra performance.',
  },
  {
    question:
      'Em rate limiting por API key + endpoint, a chave Redis tipicamente é:',
    options: [
      'rate:<timestamp>',
      'rate:<api_key>:<endpoint>:<window>',
      'rate:ip:<ip>',
      'rate:user',
    ],
    correct: 1,
    explanation:
      'Chave combinada isola buckets por dimensão: por API key (cliente), por endpoint (rota), por janela de tempo. Ex: "rate:key_abc:GET:/users:60s". Permite aplicar limites diferentes por endpoint (GET /search = 100/min, POST /upload = 10/min). TTL na key = tamanho da janela, pra limpar automaticamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rate-limiting-distribuido"
      title="Rate Limiting Distribuído: token bucket, sliding window, Redis"
      icon="🚦"
      xp={75}
      readTime={15}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Rate limiting é o que separa API séria de APIs que caem toda vez que um cliente bugado
        entra em loop. Sem rate limit, você não tem proteção contra:
        (1) thundering herd de retries amplificando incidentes, (2) custo descontrolado em LLM APIs
        ou serviços pagos por uso, (3) DoS de um cliente mal-configurado matando os outros,
        (4) abuse de quota em free tier.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Este módulo fecha a trilha de sistemas distribuídos com <strong>os 4 algoritmos clássicos</strong>
        de rate limiting (token bucket, leaky bucket, fixed window, sliding window),
        uma <strong>implementação real em Redis + Lua</strong> (atômica), e como distribuir o limite
        em cluster de N réplicas de API sem dupla contagem.
      </p>

      <Section title="Por que rate limiting é difícil em sistemas distribuídos" accent={ACCENT}>
        <p>
          Numa única máquina, rate limit é trivial: contador em memória, incrementa e checa. O
          problema vira interessante quando você tem:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>N réplicas da API atrás de load balancer</li>
          <li>Mesma API key pode chegar em qualquer réplica</li>
          <li>Contadores locais divergem — cliente com 100 req/s pode passar pq cada réplica vê só 20</li>
          <li>Usar storage externo (Redis, DynamoDB) introduz latência e ponto de falha</li>
          <li>Precisa ser <strong>atômico</strong> — get+check+incr pode ter race condition</li>
        </ul>
        <Callout tone="info">
          <strong>Duas abordagens</strong>:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Centralized</strong>: estado único em Redis/Memcached. Cada req faz round-trip. Simples, preciso, latência extra.</li>
            <li><strong>Decentralized / sloppy</strong>: cada réplica tem estado local, sincroniza periodicamente. Rápido mas impreciso — tolera overshoot.</li>
          </ul>
          <p className="mt-2">
            Stripe, GitHub e Cloudflare usam híbrido: Redis central pra limites que <em>importam</em>,
            local approximate pra limites soft. Cada um afina pra seu caso.
          </p>
        </Callout>
      </Section>

      <Section title="Os 4 algoritmos clássicos" accent={ACCENT}>
        <ComparisonTable
          headers={['Algoritmo', 'Intuição', 'Permite burst?', 'Memória', 'Precisão']}
          rows={[
            [
              'Fixed Window Counter',
              'Contador por janela (ex: 00:00-00:59)',
              'Sim (mas em boundary — 2x no limite)',
              'O(1) por cliente',
              'Baixa no boundary',
            ],
            [
              'Sliding Window Log',
              'Guarda timestamp de cada req',
              'Conforme limite',
              'O(N) — N reqs na janela',
              'Máxima',
            ],
            [
              'Sliding Window Counter',
              'Interpola entre 2 janelas fixas',
              'Suave',
              'O(1)',
              'Alta (aproximação ótima)',
            ],
            [
              'Token Bucket',
              'Balde com capacidade C, refill R/seg',
              'Sim (até C tokens)',
              'O(1)',
              'Alta',
            ],
            [
              'Leaky Bucket',
              'Fila FIFO com saída constante',
              'Não (saída suave)',
              'O(N) da fila',
              'Alta',
            ],
          ]}
        />
      </Section>

      <Section title="Fixed Window Counter" accent={ACCENT}>
        <ArchDiagram>
{`Limite: 100 req/minuto
Janela: minuto atual (ex: 14:23:00-14:23:59)

Cliente faz req:
  1. key = "rate:\${client_id}:14:23"   (truncado ao minuto)
  2. n = INCR key
  3. se primeira vez: EXPIRE key 60s
  4. se n > 100: reject
  5. else: allow

Pro: simplíssimo
Contra: boundary bug — 100 reqs em 14:23:59 + 100 em 14:24:01 = 200 em 2s`}
        </ArchDiagram>

        <CodeBlock lang="python">{`# fixed_window.py
import time
import redis.asyncio as redis

r = redis.from_url("redis://localhost")

async def allow(client_id: str, limit: int = 100, window_s: int = 60) -> bool:
    now_window = int(time.time()) // window_s
    key = f"rate:{client_id}:{now_window}"

    async with r.pipeline(transaction=True) as pipe:
        pipe.incr(key)
        pipe.expire(key, window_s)        # idempotente
        count, _ = await pipe.execute()

    return count <= limit`}</CodeBlock>
      </Section>

      <Section title="Sliding Window Log" accent={ACCENT}>
        <p>
          Guarda o timestamp de cada req numa estrutura ordenada (Redis sorted set, ZSET). A cada
          req: remove timestamps mais velhos que a janela, conta os restantes, se &lt; limite adiciona.
        </p>
        <CodeBlock lang="python">{`# sliding_window_log.py — preciso mas mais memória
import time
import redis.asyncio as redis
import uuid

r = redis.from_url("redis://localhost")

async def allow(client_id: str, limit: int = 100, window_s: int = 60) -> bool:
    now_ms = int(time.time() * 1000)
    window_start = now_ms - (window_s * 1000)
    key = f"rate:log:{client_id}"

    async with r.pipeline(transaction=True) as pipe:
        pipe.zremrangebyscore(key, 0, window_start)     # expire old
        pipe.zcard(key)                                  # count
        pipe.zadd(key, {f"{now_ms}:{uuid.uuid4()}": now_ms})  # add new
        pipe.expire(key, window_s)
        _, count, _, _ = await pipe.execute()

    return count < limit  # < pq o novo já foi adicionado`}</CodeBlock>

        <Callout tone="warn">
          <strong>Tradeoff</strong>: memoriza até <em>limit</em> timestamps por cliente. Pra limite
          de 100/min e 10k clientes ativos: 1M entries. Em limites altos (10k/s), memória explode.
          Use sliding window counter pra aproximar.
        </Callout>
      </Section>

      <Section title="Sliding Window Counter (o sweet spot)" accent={ACCENT}>
        <p>
          Conceito da Cloudflare (<em>How we built rate limiting capable of scaling to millions of
          domains</em>, 2017): <strong>interpola entre 2 janelas fixas</strong> pra aproximar uma
          janela deslizante sem armazenar cada timestamp.
        </p>
        <ArchDiagram>
{`Limite: 100/min
Janela anterior (14:23): 80 reqs
Janela atual (14:24):    50 reqs
Time: 14:24:30 → 50% da janela atual passou

Estimativa deslizante:
  = (reqs janela anterior * % remanescente anterior) + reqs janela atual
  = 80 * 0.5 + 50
  = 90

90 < 100 → ALLOW

Janela anterior "contribui" menos conforme avança o tempo`}
        </ArchDiagram>

        <CodeBlock lang="python">{`# sliding_window_counter.py
import time

async def allow(client_id: str, limit: int = 100, window_s: int = 60) -> bool:
    now = time.time()
    cur_win = int(now) // window_s
    prev_win = cur_win - 1
    percent_through = (now % window_s) / window_s

    cur_key = f"rate:sw:{client_id}:{cur_win}"
    prev_key = f"rate:sw:{client_id}:{prev_win}"

    cur_count = int(await r.get(cur_key) or 0)
    prev_count = int(await r.get(prev_key) or 0)

    estimated = prev_count * (1 - percent_through) + cur_count

    if estimated >= limit:
        return False

    await r.incr(cur_key)
    await r.expire(cur_key, window_s * 2)   # manter visível 1 janela extra
    return True`}</CodeBlock>

        <Callout tone="info">
          <strong>Precisão</strong>: estudos da Cloudflare mostram erro &lt; 0.003% comparado ao
          sliding window log, com 1 ordem de magnitude menos memória. Hoje é o padrão de fato
          pra APIs de escala — NGINX, Cloudflare, Kong usam variantes.
        </Callout>
      </Section>

      <Section title="Token Bucket (o preferido de APIs públicas)" accent={ACCENT}>
        <p>
          Balde com capacidade C tokens. Refill a R tokens/segundo (até C). Cada req consome 1 token.
          Se o balde está vazio: reject. Permite bursts até C, mantendo taxa média R.
        </p>
        <ArchDiagram>
{`Capacidade C = 10 tokens
Refill R = 5 tokens/s
Balde inicial: cheio (10)

t=0s:  requisição → toma 1 token → balde = 9
t=0.1: 5 requisições rápidas → balde = 4 (burst!)
t=0.5: requisição → balde = 3, mas refill: +2.5 = 5.5 → 5 (cap inteiro)
t=1s:  requisição → balde = 4, refill: +2.5 = 6.5 → 6
...

Cliente bem-comportado: sempre tem tokens
Cliente em burst controlado: funciona até estourar
Cliente em loop infinito: pega C, esvazia, fica bloqueado aguardando refill`}
        </ArchDiagram>

        <CodeBlock lang="lua">{`-- token_bucket.lua — atômico via EVAL no Redis
-- KEYS[1] = chave do bucket
-- ARGV[1] = capacidade (C)
-- ARGV[2] = refill rate (R tokens/seg)
-- ARGV[3] = now (unix seconds, com decimais)
-- ARGV[4] = tokens requested (tipicamente 1)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last')
local tokens = tonumber(data[1])
local last = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last = now
end

-- Refill: adiciona tokens proporcional ao tempo passado, cap em capacity
local elapsed = math.max(0, now - last)
tokens = math.min(capacity, tokens + elapsed * refill_rate)

local allowed = 0
if tokens >= requested then
  tokens = tokens - requested
  allowed = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'last', now)
redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) + 1)

return {allowed, tokens}`}</CodeBlock>

        <CodeBlock lang="python">{`# token_bucket_client.py — chamando o script
import time
import redis.asyncio as redis

r = redis.from_url("redis://localhost")

# Carrega uma vez, reusa via EVALSHA
with open("token_bucket.lua") as f:
    TOKEN_BUCKET_SHA = None

async def init_script():
    global TOKEN_BUCKET_SHA
    with open("token_bucket.lua") as f:
        TOKEN_BUCKET_SHA = await r.script_load(f.read())

async def allow(client_id: str, capacity: int = 10, rate: float = 5.0) -> tuple[bool, float]:
    now = time.time()
    key = f"rate:bucket:{client_id}"
    allowed, remaining = await r.evalsha(
        TOKEN_BUCKET_SHA, 1, key, capacity, rate, now, 1
    )
    return bool(allowed), remaining`}</CodeBlock>

        <Callout tone="info">
          <strong>Por que token bucket é querido de APIs públicas</strong>: AWS, GitHub, Stripe,
          Google Cloud — todos usam variantes. Razão: é <em>amigável pro cliente</em>. Burst é
          permitido até C, então um script bem-escrito que faz 20 reqs rápidas seguidas de silêncio
          não é punido. Clientes mal-escritos (loop sem sleep) sentem rapidinho.
        </Callout>
      </Section>

      <Section title="Leaky Bucket (taxa constante)" accent={ACCENT}>
        <p>
          Fila FIFO de capacidade C com saída constante R/seg. Se a fila está cheia, req é rejeitada.
          Processamento suave — não permite burst na <em>saída</em>. Útil pra proteger backends
          que não aguentam picos (ex: worker thread pool fixo).
        </p>
        <CodeBlock lang="python">{`# leaky_bucket.py — versão educativa em memória
from collections import deque
import time

class LeakyBucket:
    def __init__(self, capacity: int, rate_per_s: float):
        self.capacity = capacity
        self.rate = rate_per_s
        self.queue = deque()
        self.last_leak = time.time()

    def allow(self) -> bool:
        now = time.time()
        # Leak: remove itens proporcional ao tempo passado
        to_leak = int((now - self.last_leak) * self.rate)
        for _ in range(min(to_leak, len(self.queue))):
            self.queue.popleft()
        self.last_leak = now

        if len(self.queue) >= self.capacity:
            return False
        self.queue.append(now)
        return True`}</CodeBlock>

        <Callout tone="warn">
          <strong>Token vs Leaky</strong>: mesmo comportamento em "regime steady state" (R/seg), mas
          token permite burst até C instantaneamente. Leaky força saída suave. Escolha token pra APIs
          públicas (UX amigável), leaky pra gate de sistemas com capacidade fixa.
        </Callout>
      </Section>

      <Section title="Rate limit em HTTP: o que devolver" accent={ACCENT}>
        <p>
          Boas práticas de API (seguindo <em>RFC 6585</em> e padrões Stripe/GitHub):
        </p>
        <CodeBlock lang="http">{`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1744803660

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Try again in 30 seconds.",
  "retry_after": 30
}`}</CodeBlock>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Status 429</strong> pra rate limit. 503 pra overload geral.</li>
          <li><InlineCode>Retry-After</InlineCode> em segundos — SDKs usam isso pra backoff.</li>
          <li><InlineCode>X-RateLimit-Remaining</InlineCode> em <em>todas</em> as respostas (200 e 429) pra cliente ver quanto falta.</li>
          <li><InlineCode>X-RateLimit-Reset</InlineCode> unix timestamp de quando reseta.</li>
        </ul>
      </Section>

      <Section title="Onde aplicar: camadas de rate limit" accent={ACCENT}>
        <ComparisonTable
          headers={['Camada', 'Exemplo', 'Quando usa']}
          rows={[
            [
              'CDN/Edge',
              'Cloudflare Rate Limit, Fastly, AWS WAF',
              'DDoS protection, bots, muito barato pq bloqueia antes do origin',
            ],
            [
              'API Gateway',
              'Kong, AWS API Gateway, Apigee, Traefik',
              'Por API key/plan/tier, rotas diferentes com limites diferentes',
            ],
            [
              'Application (middleware)',
              'Redis + Lua no app',
              'Lógica complexa (quota por feature, limites dinâmicos)',
            ],
            [
              'Database/Storage',
              'Redis connection pool, DB rate limit',
              'Proteger backend caro (LLM API, gateway de pagamento)',
            ],
          ]}
        />
        <Callout tone="info">
          <strong>Camadas combinadas</strong>: na prática, você tem rate limit em múltiplas camadas.
          CDN bloqueia bot scrapers baratos; API gateway aplica plan limits; middleware faz rate
          limit fino por feature; e o DB pool protege contra self-DoS. Cada camada pega o que a
          anterior deixou passar.
        </Callout>
      </Section>

      <Section title="Distribuindo rate limit: estratégias de precisão vs perf" accent={ACCENT}>
        <ComparisonTable
          headers={['Estratégia', 'Precisão', 'Latência', 'Complexidade']}
          rows={[
            [
              'Redis centralized (Lua)',
              'Altíssima',
              '+1-2ms por req',
              'Média — só Redis',
            ],
            [
              'Redis Cluster com hash slot',
              'Alta',
              '+1-2ms',
              'Alta — cluster',
            ],
            [
              'Local cache + periodic sync',
              'Baixa (overshoot)',
              '~0ms',
              'Alta — eventual consistency',
            ],
            [
              'Sticky routing + local',
              'Alta (se sticky funciona)',
              '~0ms',
              'Baixa',
            ],
            [
              'Global DynamoDB with conditional writes',
              'Média-alta',
              '+5-10ms',
              'Média',
            ],
          ]}
        />
        <Callout tone="warn">
          <strong>"Sloppy" rate limit é OK quando overshoot tolerável</strong>. Se limite é 1000/min e
          você tem 10 réplicas fazendo 100/min local, overshoot máximo é 10% (1100/min). Pra
          free tier com monetização por overage, totalmente aceitável. Pra limites críticos (LLM
          API pagando por token), centralize.
        </Callout>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="API pública com múltiplos planos (free, pro, enterprise), precisa ser preciso"
          winner="Token bucket + Redis Lua + API Gateway"
          winnerColor={ACCENT}
          why="Token bucket é amigável pra devs (permite burst), Lua garante atomicidade. API Gateway aplica limite antes da app, liberando CPU do backend. Config por plano via Redis HGET. Esse é o padrão Stripe/GitHub."
          alternatives={[
            { label: 'Sliding window counter', note: 'Se burst não é desejável (controle mais apertado).' },
          ]}
        />
        <DecisionBox
          scenario="Proteger backend caro de LLM API — 1 req custa $0.30, overshoot inaceitável"
          winner="Redis centralized, aceitar +2ms, errar pelo lado conservador"
          winnerColor={ACCENT}
          why="Aqui, +2ms de latência é negligível comparado ao risco de estourar budget. Use Lua script atômico. Se Redis cair, fail-closed (rejeita) — melhor do que abrir floodgate."
          alternatives={[
            { label: 'Sloppy local sync', note: 'NÃO — 10% overshoot = $300 a mais/1000 reqs. Não vale.' },
          ]}
        />
        <DecisionBox
          scenario="Anti-DDoS em edge global, milhões de IPs, perf crítica"
          winner="Local rate limit por worker + global sync assíncrono"
          winnerColor={ACCENT}
          why="Zero round-trip por req. Cada worker tem token bucket local. Sincroniza agregado global a cada 100ms. Overshoot tolerável em anti-DDoS (você ainda bloqueou 99% do ataque). Cloudflare e Fastly operam assim."
          alternatives={[
            { label: 'Centralized', note: 'Latência inaceitável pro tráfego de edge. Não escala.' },
          ]}
        />
        <DecisionBox
          scenario="Gate de job queue: máximo 5 jobs concorrentes por cliente"
          winner="Semáforo distribuído (Redis ZSET ou advisory lock por slot)"
          winnerColor={ACCENT}
          why="Rate limiting é request/time; concurrency limit é active/pending. Use semáforo: ZSET com timestamps, expire ativos após N segundos. Pra precisão estrita, advisory locks no PG (1 por slot). SQS também tem visibility timeout que serve pra isso."
          alternatives={[
            { label: 'Token bucket', note: 'Não serve — não limita paralelismo, só taxa.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Como fazer rate limit multi-dimensional (por key + por IP + global)?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Múltiplos buckets. Uma req chama Lua script que testa cada bucket em sequência. Se
              qualquer um estourar, rejeita. Ex: <InlineCode>rate:key:abc</InlineCode> (100/min),
              <InlineCode> rate:ip:1.2.3.4</InlineCode> (1000/min), <InlineCode>rate:global</InlineCode> (10000/min).
            </p>
          </div>
          <div>
            <p><strong>O que fazer se Redis cair?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Decisão por business: <em>fail-open</em> (deixa passar, prioriza disponibilidade) ou
              <em> fail-closed</em> (rejeita tudo, prioriza proteção). APIs pagas geralmente fail-closed;
              APIs user-facing fail-open mas com circuit breaker. Tenha alerta agressivo em queda do Redis.
            </p>
          </div>
          <div>
            <p><strong>Rate limit por IP é bom?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Razoável pra bots, perigoso pra usuários legítimos (NAT, CG-NAT, corporate proxies,
              mobile carriers compartilham IPs entre milhares). Use como última camada + whitelist
              trusted ranges + combine com API key.
            </p>
          </div>
          <div>
            <p><strong>Como modelar "quota mensal" em vez de rate limit?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Contador em Redis com TTL até fim do mês, ou em Postgres row com UPDATE atômico. Rate
              limit protege bursts; quota protege volume total. Diferente, complementar.
            </p>
          </div>
          <div>
            <p><strong>Cliente bem-comportado recebe 429 às vezes — isso é normal?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Com rate limit preciso e limite justo, sim. SDK deve implementar retry com backoff
              (respeitando Retry-After). Se clientes reclamam, revise se o limite está calibrado
              ou se eles precisam de plano maior.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Token bucket</strong> é o padrão pra APIs públicas — amigável, permite burst.</li>
          <li><strong>Sliding window counter</strong> é o sweet spot precisão/memória — usado pela Cloudflare.</li>
          <li><strong>Fixed window</strong> tem bug de boundary (até 2x no limite). OK pra limites soft.</li>
          <li><strong>Redis + Lua</strong> dá atomicidade sem race condition. Preferir EVALSHA + SHA cached.</li>
          <li>Retornar <strong>429 + Retry-After + X-RateLimit-*</strong> — SDKs dependem disso pra backoff.</li>
          <li>Rate limit em múltiplas camadas: CDN → gateway → app → backend. Cada uma protege a próxima.</li>
          <li>Centralized quando precisão importa (LLM APIs caras); sloppy local quando perf importa (anti-DDoS edge).</li>
          <li>Fail-open vs fail-closed é decisão de negócio — documentar e instrumentar.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Parabéns! Você terminou a trilha de <strong>Sistemas Distribuídos</strong>. Do CAP ao rate
        limit, você tem as bases pra projetar e operar sistemas que sobrevivem à realidade da rede.
      </p>
    </div>
  );
}
