import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox } from '@/components/article/primitives';
import { CodePlayground } from '@/components/article/CodePlayground';

export const metadata = getModuleMetadata('sd-rate-limiter');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre fixed window e sliding window em rate limiting?',
    options: [
      'São iguais',
      'Fixed window reseta a contagem em intervalos fixos (00:00, 00:01) → burst duplo no limite (100 req no segundo 59 + 100 req no segundo 0). Sliding window usa buffer deslizante ou algoritmo proporcional → distribuição mais justa, custa mais memória',
      'Fixed é mais preciso',
      'Sliding só funciona em memória',
    ],
    correct: 1,
    explanation: 'Com fixed window de 100 req/min começando 00:00: se cliente envia 100 req entre 00:00:59 e 00:01:00 + 100 req entre 00:01:00 e 00:01:01, total 200 req em 2s — rompe contrato. Sliding window (ou sliding log) considera janela contínua, evita burst doubling. Trade-off: memória (sliding precisa manter timestamps recentes).',
  },
  {
    question: 'Por que token bucket é o algoritmo favorito em APIs?',
    options: [
      'Foi inventado primeiro',
      'Permite burst controlado — bucket acumula tokens até capacity, user pode consumir em rajada quando precisa. Fixed/sliding window negam qualquer burst. Token bucket casa com padrões reais (load pulsado)',
      'É mais simples',
      'Usa menos memória',
    ],
    correct: 1,
    explanation: 'Token bucket: bucket de capacity N tokens, refill R tokens/s. Request consome 1 token. Se bucket vazio → rate-limit. Permite burst até N (capacity) quando bucket cheio, depois sustenta R/s steady. Sliding window nega burst mesmo quando sistema está ocioso. Cliente real tem tráfego pulsado (batch jobs, sync periódico) — token bucket acomoda isso.',
  },
  {
    question: 'Rate limiter centralizado (Redis) vs descentralizado (local) — quando cada?',
    options: [
      'Sempre centralizado',
      'Local: baixa latência (0 round-trip) mas inconsistente entre nodes. Centralizado (Redis): consistência global mas custa 1-3ms de round-trip. Escolha: API externa → centralizado; função interna ultra-latência → local com tolerância de over-limit',
      'Sempre local',
      'Centralizado é mais barato',
    ],
    correct: 1,
    explanation: 'Decisão prática: se você tem 10 servidores e limit de 1000 req/min por IP, local em cada servidor permite até 10k req/min (10x o limite). Centralizado em Redis garante 1000 req/min global. Custo: Redis INCR + EXPIRE (~1ms). Em API pública, consistência vale a pena. Em endpoint interno crítico (< 10ms p99), local + algum slack aceitável.',
  },
  {
    question: 'Por que devolver HTTP 429 com header Retry-After é melhor que só 429?',
    options: [
      'Polidez',
      'Cliente inteligente respeita Retry-After (ex: 60s) e evita reenviar, reduz carga no servidor. Sem header, cliente retry agressivo piora o problema. Pattern: exponential backoff + jitter no cliente + Retry-After server-side',
      'Não faz diferença',
      'Só melhora SEO',
    ],
    correct: 1,
    explanation: 'Header Retry-After permite cliente recuperar graciosamente. SDK maduros (AWS, Stripe, OpenAI) respeitam automaticamente. Sem header, cliente faz retry exponencial cego — pode demorar mais pra voltar. Boa prática server: retornar 429 + Retry-After: <segundos> + body JSON com detalhes.',
  },
  {
    question: 'Qual o maior risco em implementar rate limiting mal?',
    options: [
      'Performance',
      'Falso positivo em traffic legítimo: aplicação rate-limita user real (perda de receita, bug de UX) OU não rate-limita ataque (DDoS colapsa sistema). Sempre testar com: carga sintética + shadow mode (log only) antes de enforce',
      'Complexidade',
      'Só afeta dev',
    ],
    correct: 1,
    explanation: 'Rate limiter mal calibrado: limite muito baixo bloqueia user legítimo (webhook burst, sync app); muito alto não protege contra abuse. Rollout seguro: (1) Shadow mode — conta mas não bloqueia, loga quem seria bloqueado. (2) Canary enforce 1% → 10% → 100%. (3) Feature flag pra desabilitar rápido. (4) Dashboard com baseline de tráfego normal.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-rate-limiter"
      title="Case: Rate limiter distribuído"
      icon="🚦"
      xp={65}
      readTime={15}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-distributed-cache"
      nextTitle="Case: Distributed cache"
      quiz={quiz}
    >
      <Section title="Por que rate limiter é pergunta padrão em entrevista sênior" accent={accent}>
        <p>
          Rate limiter testa 4 skills simultaneamente: <strong>escolha de algoritmo</strong> (fixed vs sliding vs token bucket), <strong>consistência distribuída</strong> (Redis atomic ops), <strong>operação</strong> (rollout seguro, observability), e <strong>APIs</strong> (headers HTTP corretos, semântica).
        </p>
        <p>
          Quase toda API pública (Stripe, Twitter, GitHub, OpenAI) tem. Saber construir uma é requisito pra qualquer engenheiro de backend sênior.
        </p>
      </Section>

      <Section title="Os 4 algoritmos clássicos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Algoritmo', 'Memória', 'Precisão', 'Burst', 'Complexidade']}
          rows={[
            ['Fixed window', 'O(1) contador', 'Baixa (burst doubling)', 'Não permite', 'Baixíssima'],
            ['Sliding window log', 'O(N req)', 'Alta', 'Limitado', 'Média'],
            ['Sliding window counter', 'O(1) + interpolação', 'Alta', 'Limitado', 'Média'],
            ['Token bucket', 'O(1) tokens + last_refill', 'Alta', 'Permite (até capacity)', 'Baixa'],
            ['Leaky bucket', 'O(N queue)', 'Alta (smoothing)', 'Não permite', 'Média'],
          ]}
        />
      </Section>

      <Section title="Token bucket na prática — o padrão vencedor" accent={accent}>
        <CodePlayground
          lang="python"
          title="Token bucket simples (single-node)"
          accent={accent}
          initial={`import time

class TokenBucket:
    def __init__(self, capacity: int, refill_per_sec: float):
        self.capacity = capacity
        self.refill = refill_per_sec
        self.tokens = capacity           # começa cheio
        self.last_refill = time.time()

    def allow(self, cost: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        # Refill proporcional ao tempo decorrido
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill)
        self.last_refill = now
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False


# Capacity 10, refill 2 tokens/s (steady 2/s, burst até 10)
bucket = TokenBucket(capacity=10, refill_per_sec=2)

# Simulação: 15 requests em burst
for i in range(15):
    print(f"req {i+1:2d}: {'✓ allow' if bucket.allow() else '✗ LIMIT'}  tokens={bucket.tokens:.2f}")

# Após 3 segundos de pausa, bucket refill
time.sleep(3)
print(f"\\nApós 3s sleep: tokens={bucket.tokens + 3*2:.2f} (até cap=10)")
print(f"req 16: {'✓ allow' if bucket.allow() else '✗ LIMIT'}")
`}
        />
      </Section>

      <Section title="Rate limiter distribuído com Redis atômico" accent={accent}>
        <p>
          Em cluster com múltiplos servidores, cada um mantendo bucket local = limite global X vezes maior que desejado. Solução: bucket em Redis compartilhado, operação atômica via Lua script.
        </p>
        <CodeBlock lang="python">{`# Lua script atômico — evita race condition entre GET + SET
TOKEN_BUCKET_LUA = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1]) or capacity
local last_refill = tonumber(data[2]) or now

-- Refill proporcional
local elapsed = math.max(0, now - last_refill)
tokens = math.min(capacity, tokens + elapsed * refill)

if tokens >= cost then
  tokens = tokens - cost
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  redis.call('EXPIRE', key, 3600)  -- garbage collect chaves inativas
  return {1, tokens}
else
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  redis.call('EXPIRE', key, 3600)
  return {0, tokens}
end
"""

import redis, time
r = redis.Redis()
allow_script = r.register_script(TOKEN_BUCKET_LUA)

def allow(user_id: str, capacity: int, refill: float, cost: int = 1):
    result = allow_script(
        keys=[f"rl:{user_id}"],
        args=[capacity, refill, time.time(), cost],
    )
    allowed, remaining = result[0] == 1, result[1]
    return allowed, remaining`}</CodeBlock>
        <Callout tone="info" icon="⚡">
          Lua script no Redis é <strong>atômico</strong> — roda no thread único do Redis, zero race condition. Custa ~1ms round-trip + ~0.1ms execução. Escala para milhões de usuários com cluster Redis.
        </Callout>
      </Section>

      <Section title="Decisão: limites por chave (user, IP, API key, endpoint?)" accent={accent}>
        <DecisionBox
          scenario="Como identificar quem rate-limitar?"
          winner="Múltiplas chaves combinadas em camadas"
          winnerColor={accent}
          why="Abuse pode vir de ângulos diferentes: mesmo user batendo rápido, mesmo IP gerando contas descartáveis, endpoint específico sobrecarregando DB. Aplicar uma camada por vez: global → por IP → por user → por endpoint."
          alternatives={[
            { label: 'Só por user_id', note: 'ataca com contas descartáveis e bypassa' },
            { label: 'Só por IP', note: 'affeta NAT corporativo (muitos users atrás de 1 IP)' },
            { label: 'Só por endpoint', note: 'não isola abuser individual' },
          ]}
        />
        <p><strong>Headers HTTP corretos</strong>:</p>
        <CodeBlock>{`HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 783
X-RateLimit-Reset: 1714068000

# Quando ultrapassa:
HTTP/1.1 429 Too Many Requests
Retry-After: 42
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1714068042
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "retry_after": 42,
  "docs": "https://docs.api.com/rate-limits"
}`}</CodeBlock>
      </Section>

      <Section title="Rollout: como não fazer outage com seu próprio rate limiter" accent={accent}>
        <ol className="list-decimal pl-5 my-2 text-sm space-y-2">
          <li>
            <strong>Shadow mode primeiro</strong> — lógica conta e loga mas não bloqueia. Compara baseline real de tráfego: quantos users seriam bloqueados no limite proposto? Ajusta limite antes de enforçar.
          </li>
          <li>
            <strong>Canary enforce</strong> — 1% do tráfego → 10% → 100% com pausas de 1h entre. Monitor: taxa de 429, reclamações, regressões em métricas de negócio.
          </li>
          <li>
            <strong>Feature flag kill switch</strong> — desabilitar em 30s se comportamento inesperado (spike de 429 em tráfego normal = bug no limiter, não abuse).
          </li>
          <li>
            <strong>Allowlist pra integrações críticas</strong> — webhooks de parceiros, serviços internos. Nada pior que rate-limit bloquear sua própria infra.
          </li>
        </ol>
      </Section>

      <Section title="Observability obrigatória" accent={accent}>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>Métrica por chave</strong>: taxa de 429 por (endpoint, tier de user). Se subir inesperado → ou abuse ou bug.</li>
          <li><strong>Top-N blocked</strong>: quem está mais perto do limite? IPs/users mais bloqueados nas últimas 24h → candidatos a suspender ou aumentar tier.</li>
          <li><strong>Latency do rate check</strong>: rate-limiter adicionou 3ms p99? Redis pode estar degradado.</li>
          <li><strong>Baseline automática</strong>: alerta se taxa de 429 desvia &gt; 2σ do normal — detecta problema cedo.</li>
        </ul>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <Callout tone="success" icon="🎓">
          Rate limiter bem feito é invisível — user legítimo nunca sente, abuser é bloqueado antes de causar dano. Mal feito, é causa de incidente próprio. Token bucket via Redis Lua + shadow mode + canary é a receita conservadora que nunca te trai.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
