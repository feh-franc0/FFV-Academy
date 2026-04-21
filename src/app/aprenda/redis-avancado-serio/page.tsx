import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('redis-avancado-serio');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que rodar operações compostas como script Lua em Redis?',
    options: [
      'Para deixar mais lento',
      'Para garantir atomicidade: o script roda single-threaded no servidor, sem interrupção por outro comando. Substitui MULTI/EXEC quando há condicionais que dependem de leitura intermediária (ex: rate limiter, compare-and-set). Zero round-trips extras',
      'Só porque Lua é bonita',
      'Para bypassar autenticação',
    ],
    correct: 1,
    explanation: 'Redis é single-threaded no dispatch de comandos, então qualquer script EVAL roda até o fim sem ser preemptado. Isso é essencial quando a lógica precisa ler-decidir-escrever (rate limit, leaderboard com TTL, token bucket). MULTI/EXEC agrupa comandos mas não permite condicional baseada em leitura intermediária — Lua permite. Mantenha scripts curtos; são bloqueantes.',
  },
  {
    question: 'O que um ZSET (sorted set) resolve que um SET não resolve?',
    options: [
      'Nada, são iguais',
      'Ordenação por score numérico com operações O(log N): ZADD, ZRANGE, ZRANGEBYSCORE, ZINCRBY. Base de leaderboard, fila com prioridade, delayed jobs, trending content. Também permite ranking por posição sem sort em memória no app',
      'Menos memória',
      'Mais segurança',
    ],
    correct: 1,
    explanation: 'ZSET mantém elementos ordenados por um score float. Operações são O(log N) via skip list + hash. Leaderboard de jogo: ZADD leaderboard 1500 "user:42"; ZREVRANGE leaderboard 0 9 WITHSCORES dá top 10. Para delayed jobs: score = timestamp de execução; worker faz ZRANGEBYSCORE até now. SET é só conjunto sem ordem.',
  },
  {
    question: 'Qual estrutura usar para rate limiting por sliding window preciso?',
    options: [
      'STRING com INCR',
      'ZSET onde score = timestamp e member = request id. ZREMRANGEBYSCORE remove entradas fora da janela, ZCARD conta as atuais. Atômico via Lua. INCR com TTL é fixed window — sofre burst na virada',
      'HASH sem TTL',
      'LIST simples',
    ],
    correct: 1,
    explanation: 'Fixed window com INCR+EXPIRE deixa passar 2x o limite na virada (último segundo de uma janela + primeiro da próxima). Sliding window com ZSET: score = epoch ms, member = request id único. Lua atomicamente: (1) ZREMRANGEBYSCORE remove requests antigos, (2) ZCARD conta, (3) se abaixo do limite ZADD e retorna OK. Custo em memória proporcional à taxa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="redis-avancado-serio"
      title="Redis avançado sério"
      icon="🔴"
      xp={55}
      readTime={13}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Redis não é só cache" accent={accent}>
        <p>
          A maior parte dos times usa Redis como cache de string com TTL. É desperdiçar 80% da ferramenta. Redis é uma estrutura de dados remota: hashes, listas, sets, sorted sets, streams, bitmaps, HyperLogLog, geo. Cada um resolve um problema específico sem ter que mover dados para o app.
        </p>
      </Section>

      <Section title="Leaderboard com SORTED SET" accent={accent}>
        <CodeBlock lang="bash">{`# ZADD adiciona/atualiza score em O(log N)
ZADD leaderboard:global 1500 "user:42"
ZADD leaderboard:global 2100 "user:17"
ZADD leaderboard:global 980  "user:99"

# Top 10 (descending)
ZREVRANGE leaderboard:global 0 9 WITHSCORES

# Posicao do usuario 42 (rank)
ZREVRANK leaderboard:global "user:42"

# Incrementar score atomicamente (ex: +50 XP)
ZINCRBY leaderboard:global 50 "user:42"

# Slice por score (scores entre 1000 e 2000)
ZRANGEBYSCORE leaderboard:global 1000 2000 WITHSCORES`}</CodeBlock>
        <Callout tone="info" icon="💡">
          ZSET é a estrutura mais poderosa do Redis. Leaderboards, delayed jobs, sliding window rate limit, priority queue, trending content — tudo vira ZSET com score bem escolhido.
        </Callout>
      </Section>

      <Section title="Rate limiter atômico com Lua" accent={accent}>
        <p>
          Implementação de sliding window rate limit em um único EVAL. Atomicidade garantida, zero race condition.
        </p>
        <CodeBlock lang="lua">{`-- KEYS[1] = chave da janela (ex: "rl:user:42")
-- ARGV[1] = now em ms
-- ARGV[2] = janela em ms
-- ARGV[3] = limite
-- ARGV[4] = request id unico

local key    = KEYS[1]
local now    = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit  = tonumber(ARGV[3])
local reqId  = ARGV[4]

-- 1) Remove requests fora da janela
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

-- 2) Conta requests dentro da janela
local count = redis.call('ZCARD', key)

if count < limit then
  redis.call('ZADD', key, now, reqId)
  redis.call('PEXPIRE', key, window)
  return { 1, limit - count - 1 }  -- ok, restantes
else
  return { 0, 0 }                    -- bloqueado
end`}</CodeBlock>
        <CodeBlock lang="ts">{`// Uso no Node (ioredis)
const script = await fs.readFile('rate_limit.lua', 'utf8');
const sha = await redis.script('LOAD', script);

async function allow(userId: string) {
  const now = Date.now();
  const result = await redis.evalsha(
    sha, 1,
    'rl:user:' + userId,
    now, 60000, 100, crypto.randomUUID()
  ) as [number, number];
  return { allowed: result[0] === 1, remaining: result[1] };
}`}</CodeBlock>
      </Section>

      <Section title="Streams: log persistente tipo Kafka-lite" accent={accent}>
        <CodeBlock lang="bash">{`# Producer
XADD events * type signup userId 42
XADD events * type purchase userId 42 amount 99.90

# Consumer group (processamento exactly-once-ish)
XGROUP CREATE events analytics $ MKSTREAM
XREADGROUP GROUP analytics worker-1 COUNT 10 BLOCK 5000 STREAMS events >

# Ack apos processar
XACK events analytics 1738000000000-0`}</CodeBlock>
        <Callout tone="neutral" icon="📌">
          Streams substitui filas pub/sub simples quando você precisa de replay, consumer groups e retention. Não substitui Kafka em escala massiva (GB/s).
        </Callout>
      </Section>

      <Section title="Persistence real: AOF vs RDB" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>RDB</strong> é snapshot periódico — rápido no restart, mas perde os writes entre snapshots. <strong>AOF</strong> (append-only file) loga cada write com fsync configurável — durability real. Em produção séria: AOF com appendfsync everysec + RDB semanal para backup. Nunca rodar Redis sem persistence se o dado importa.
        </Callout>
        <Callout tone="success" icon="✅">
          Redis bem usado substitui 3-4 serviços: cache, fila, rate limiter, pub/sub, session store, leaderboard. Dominar estruturas vale mais que saber 10 bancos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
