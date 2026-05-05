import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-resolver-5-problemas-reais');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'No problema de dedup com Bloom, qual é a estratégia?',
    options: [
      'Sempre consultar DB',
      'Checar Bloom: se "NÃO contém" (100% certo), skip; se "SIM" (possível falso positivo), confirma no DB. Reduz ~95% das queries em streams com alta repetição',
      'Usar só hashmap',
      'Bloom não serve pra dedup',
    ],
    correct: 1,
    explanation: 'Bloom como cache invertido: confirma AUSÊNCIA (barato). Falso positivo raro força DB check — aceitável. Kafka consumer exactly-once usa Bloom na frente do DB idempotency key check.',
  },
  {
    question: 'Como implementar top-10 queries lentas com min-heap?',
    options: [
      'Sort completo',
      'Min-heap de tamanho 10; para cada query, se heap tem < 10 insere; se tem 10 e query > min, pop + insere. O(n log 10) = O(n)',
      'Lista em array e sort toda hora',
      'SQL com LIMIT 10',
    ],
    correct: 1,
    explanation: 'Manter só os K maiores/menores com heap de tamanho K é padrão clássico. O(n log k) vs O(n log n) de sort completo. Quando K pequeno (top 10, top 100), ganho é substancial.',
  },
  {
    question: 'Por que tiebreaker em cursor pagination?',
    options: [
      'Para estética',
      'Se ordenar por created_at e duas linhas têm o mesmo timestamp, cursor "after_at=X" não distingue → pula/duplica. Tiebreaker (id) garante ordem estrita',
      'Não é necessário',
      'Só em GraphQL',
    ],
    correct: 1,
    explanation: 'Ordenar por (created_at, id) e cursor por (created_at + id) resolve. Sem isso, linhas com timestamps duplicados causam bug sutil. Postgres/MySQL aceitam composite cursor nativamente via WHERE (a, b) > (x, y).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-resolver-5-problemas-reais"
      title="Capstone: resolver 5 problemas reais (não-LeetCode)"
      icon="🏁"
      xp={75}
      readTime={16}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Problema 1 — Dedup de 10M eventos com Bloom" accent={accent}>
        <CodeBlock lang="typescript">{`import { BloomFilter } from 'bloom-filters';

const seen = new BloomFilter(10_000_000, 0.001);  // 1MB, 0.1% FP

async function processEvent(event: Event) {
  if (!seen.has(event.id)) {
    seen.add(event.id);
    return await persistNew(event);
  }
  // Possível duplicata (ou falso positivo) — confirma no DB
  const exists = await db.events.findUnique({ where: { id: event.id } });
  if (exists) return;  // dup real
  seen.add(event.id);
  await persistNew(event);
}`}</CodeBlock>
      </Section>

      <Section title="Problema 2 — Top 10 queries lentas com min-heap" accent={accent}>
        <CodeBlock lang="typescript">{`import TinyQueue from 'tinyqueue';

interface QueryStat { sql: string; duration: number; }

function topSlow(stream: QueryStat[], k = 10): QueryStat[] {
  const heap = new TinyQueue<QueryStat>([], (a, b) => a.duration - b.duration);
  for (const q of stream) {
    if (heap.length < k) heap.push(q);
    else if (q.duration > heap.peek()!.duration) {
      heap.pop();
      heap.push(q);
    }
  }
  return [...heap].sort((a, b) => b.duration - a.duration);
}`}</CodeBlock>
      </Section>

      <Section title="Problema 3 — Ciclo em deps de pacote" accent={accent}>
        <CodeBlock lang="typescript">{`type Deps = Map<string, string[]>;

function findCycle(deps: Deps): string[] | null {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const parent = new Map<string, string>();

  function dfs(u: string): string[] | null {
    color.set(u, GRAY);
    for (const v of deps.get(u) ?? []) {
      if (color.get(v) === GRAY) {
        // Reconstrói ciclo
        const cycle = [v, u];
        let cur = u;
        while (parent.get(cur) !== v) {
          cur = parent.get(cur)!;
          cycle.push(cur);
        }
        return cycle.reverse();
      }
      if (color.get(v) === WHITE || !color.has(v)) {
        parent.set(v, u);
        const c = dfs(v);
        if (c) return c;
      }
    }
    color.set(u, BLACK);
    return null;
  }

  for (const u of deps.keys()) {
    if (!color.has(u)) {
      const cycle = dfs(u);
      if (cycle) return cycle;
    }
  }
  return null;
}`}</CodeBlock>
      </Section>

      <Section title="Problema 4 — Cursor pagination com tiebreaker" accent={accent}>
        <CodeBlock lang="typescript">{`// SQL (PG)
// SELECT * FROM posts
// WHERE (created_at, id) < ($lastAt, $lastId)
// ORDER BY created_at DESC, id DESC
// LIMIT 20;

function encodeCursor(row: { createdAt: string; id: string }): string {
  return Buffer.from(JSON.stringify(row)).toString('base64url');
}

function decodeCursor(s: string): { createdAt: string; id: string } {
  return JSON.parse(Buffer.from(s, 'base64url').toString());
}`}</CodeBlock>
      </Section>

      <Section title="Problema 5 — Rate limit sliding window" accent={accent}>
        <CodeBlock lang="lua">{`-- Redis Lua — sliding window counter
-- KEYS[1] = key, ARGV[1] = window_s, ARGV[2] = max, ARGV[3] = now_ms

local window_ms = tonumber(ARGV[1]) * 1000
local max = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove entries antigos
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window_ms)

local count = redis.call('ZCARD', KEYS[1])
if count >= max then
  return {0, count}  -- rate limited
end

redis.call('ZADD', KEYS[1], now, now .. '-' .. math.random())
redis.call('EXPIRE', KEYS[1], ARGV[1])
return {1, count + 1}`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Esses 5 exemplos cobrem Bloom, heap, DFS/cycle, sorted compound cursor e Redis ZSET+Lua. Todos aparecem diariamente em produção de verdade — nada de permutação de strings.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
