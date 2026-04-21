import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox } from '@/components/article/primitives';
import { CodePlayground } from '@/components/article/CodePlayground';

export const metadata = getModuleMetadata('sd-url-shortener');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que hash direto (MD5/SHA) não é boa estratégia para URL shortener?',
    options: [
      'É lento',
      'Hash é longo (MD5 = 32 chars) — você cortaria parte dele, perdendo garantia de unicidade. Collision handling vira lógica extra. Melhor: counter + base62 encoding (garante unicidade, ~7 chars)',
      'Hash é inseguro',
      'Qualquer um funciona igual',
    ],
    correct: 1,
    explanation: 'Hash corta vs counter+base62: hash criptográfico truncado tem 1 em 62^7 (~3.5 trilhões) chance de colisão, precisa checar antes de inserir (round-trip extra). Counter + base62 é O(1) geração, zero colisão por design, 7 chars suporta 3.5 trilhões de URLs. Padrão usado por Bit.ly, TinyURL.',
  },
  {
    question: 'Qual o gargalo em 100k redirects/s?',
    options: [
      'CPU',
      'Latency de DB: se consulta DB a cada redirect, p95 fica > 50ms. Solução: cache (Redis) em frente ao DB. Hit rate típico > 95% por causa de power law (poucas URLs dominam tráfego)',
      'Rede',
      'Storage',
    ],
    correct: 1,
    explanation: 'Redirects são read-heavy com power law: 1% das URLs recebe 99% dos cliques (Kardashian effect). Cache Redis com TTL + LRU serve quase tudo em < 1ms. DB fica pra warm (raro). Sem cache, DB connections esgotam em minutos de tráfego pesado.',
  },
  {
    question: 'Quando precisa de counter distribuído em vez de AUTO_INCREMENT?',
    options: [
      'Sempre',
      'Quando escala além de single-DB. AUTO_INCREMENT serializa escritas no primário = gargalo. Solução: Snowflake ID (timestamp + machine_id + seq) ou Zookeeper/Redis counter batched por worker',
      'Nunca',
      'Só com ElasticSearch',
    ],
    correct: 1,
    explanation: 'Single-DB AUTO_INCREMENT funciona até ~5k inserts/s. Além disso: Twitter Snowflake (41 bits timestamp + 10 bits machine + 12 bits seq) gera IDs únicos sem coordenação. Ou Redis INCR com batch (worker pega 1000 IDs de uma vez) reduz round-trips. Padrão em sistemas distribuídos.',
  },
  {
    question: 'Por que armazenar short_code como PRIMARY KEY é melhor que long_url?',
    options: [
      'Estética',
      'short_code é fixo e curto (7 chars = ~56 bits), gera index compacto e cache-friendly. long_url pode ter 2KB, index gigante, lookup mais lento. PK deve ser pequena e estável',
      'Long_url é lento',
      'Depende do DB',
    ],
    correct: 1,
    explanation: 'PK vira index clustered em PostgreSQL/MySQL. short_code fixo VARCHAR(7) → index eficiente, cabe mais na memória. Long URL (~200 bytes média, até 2KB) como PK = index inflacionado + lookup mais lento. Outra vantagem: short_code é hash-friendly pra sharding futuro.',
  },
  {
    question: 'Analytics de cliques (geo, user-agent, referrer) — síncrono ou assíncrono?',
    options: [
      'Síncrono',
      'Assíncrono obrigatório. Cada click loga muito metadata. Síncrono bloqueia redirect (UX ruim) e cria contenção no DB de analytics. Solução: fire-and-forget em Kafka/SQS, worker processa offline pra warehouse',
      'Em log de texto',
      'Depende do volume',
    ],
    correct: 1,
    explanation: 'Redirect precisa ser < 50ms p95. Gravar analytics rich (geo lookup, user-agent parsing, referrer) sincronamente adiciona 20-100ms. Solução canônica: emite evento em Kafka/Kinesis/SQS, worker assíncrono enriquece e grava em warehouse (Snowflake/BigQuery). Desacopla hot path (redirect) de cold path (analytics).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-url-shortener"
      title="Case: URL shortener (tipo bit.ly)"
      icon="🔗"
      xp={65}
      readTime={15}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-rate-limiter"
      nextTitle="Case: Rate limiter distribuído"
      quiz={quiz}
    >
      <Section title="Por que essa pergunta é quase universal em entrevista" accent={accent}>
        <p>
          URL shortener é a questão canônica de System Design porque toca em <strong>todos os trade-offs essenciais</strong> em 45 minutos: geração de ID única em escala, read-heavy caching, counter distribuído, analytics assíncrona. Se você domina isso, Twitter feed e Instagram também caem.
        </p>
        <p>
          O teste não é se você &quot;sabe fazer&quot; — é se você consegue <strong>defender decisões</strong> quando o entrevistador aumenta escala progressivamente: &quot;e se forem 100M URLs? 1B? 10B?&quot;
        </p>
      </Section>

      <Section title="Passo 1: estabelecer escala (back-of-envelope)" accent={accent}>
        <p>Sempre começa com premissas. Nunca pule. Premissas típicas:</p>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li>100M URLs criadas/mês (~40/s média, ~120/s pico)</li>
          <li>Razão read:write <strong>100:1</strong> — cada URL criada é clicada 100x</li>
          <li>~10k QPS de redirect médio, ~30k pico</li>
          <li>Retenção 5 anos = 6B URLs totais</li>
          <li>Short code 7 chars base62 = 62⁷ ≈ 3.5 trilhões (espaço largo pra 6B)</li>
        </ul>
      </Section>

      <Section title="Passo 2: geração de short code — 3 estratégias" accent={accent}>
        <DecisionBox
          scenario="Como gerar short codes únicos em escala?"
          winner="Counter distribuído + base62 encode"
          winnerColor={accent}
          why="Garante unicidade sem colisão, sem round-trip extra pra checar DB. Counter pode ser auto_increment (até 5k/s) ou Snowflake/Redis batched (milhões/s)."
          alternatives={[
            { label: 'Hash(long_url) truncado (MD5 → 7 chars)', note: 'risco colisão 1/62⁷, precisa checar. Problema: mesmo URL gera mesmo short (user quer controlar)' },
            { label: 'Random 7 chars base62', note: 'simples, mas precisa checar colisão em DB antes de inserir. ~1% collision rate após 300M URLs' },
            { label: 'Pre-generated batch (10B códigos pré-gerados, pick sequencial)', note: 'usado por Bit.ly. Zero latência. Complicado de operar' },
          ]}
        />
        <CodePlayground
          lang="python"
          title="Base62 encoding — converter counter em short code"
          accent={accent}
          initial={`ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(n: int) -> str:
    if n == 0:
        return ALPHABET[0]
    digits = []
    while n > 0:
        digits.append(ALPHABET[n % 62])
        n //= 62
    return "".join(reversed(digits))


def decode_base62(s: str) -> int:
    n = 0
    for ch in s:
        n = n * 62 + ALPHABET.index(ch)
    return n


# Counter em produção vem de Snowflake/Redis INCR
for counter in [1, 1000, 1_000_000, 62**6, 62**7 - 1]:
    code = encode_base62(counter)
    print(f"{counter:>20,} → {code:>7s}  (decode: {decode_base62(code):>20,})")

# 7 chars base62 = 62^7 = 3.5 trilhões — bastante espaço
print(f"\\n7 chars → {62**7:,} combinações ({62**7/1e12:.1f} trilhões)")
`}
        />
      </Section>

      <Section title="Passo 3: storage — schema e escolha de DB" accent={accent}>
        <CodeBlock lang="sql">{`-- Postgres / MySQL — serve confortavelmente até ~1B rows
CREATE TABLE short_urls (
  short_code    VARCHAR(7) PRIMARY KEY,        -- PK compacta, index clustered
  long_url      TEXT NOT NULL,
  user_id       BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,                   -- opcional; TTL
  click_count   BIGINT DEFAULT 0,              -- updated async
  last_clicked  TIMESTAMPTZ
);

CREATE INDEX idx_short_urls_user ON short_urls (user_id, created_at DESC);
CREATE INDEX idx_short_urls_expires ON short_urls (expires_at) WHERE expires_at IS NOT NULL;`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Escala', 'DB sugerido', 'Por quê']}
          rows={[
            ['< 100M URLs', 'Postgres single primary + read replica', 'Simples, transacional, aguenta até ~5k write/s'],
            ['100M-1B', 'Postgres com table partitioning por mês', 'Partition pruning acelera queries; drop partition é limpeza instantânea'],
            ['1B-10B', 'Cassandra ou Vitess (MySQL sharded)', 'Escala linear em writes; consistente com quórum'],
            ['> 10B', 'DynamoDB (key-value) + CDC pra analytics', 'Escala horizontal sem ops de sharding; custo justifica em escala'],
          ]}
        />
      </Section>

      <Section title="Passo 4: caching — onde está o leverage" accent={accent}>
        <p>
          Com 100:1 read:write e <strong>power law</strong> no tráfego (poucas URLs dominam), cache em frente ao DB é decisão óbvia. Sem cache: 10k QPS no DB — viável mas caro. Com cache: 10k QPS no Redis, 50-500 QPS no DB.
        </p>
        <CodeBlock lang="python">{`# Redis cache-aside pattern
def resolve(short_code: str) -> str | None:
    cached = redis.get(f"url:{short_code}")
    if cached:
        return cached
    row = db.query("SELECT long_url FROM short_urls WHERE short_code = %s", short_code)
    if not row:
        return None
    redis.setex(f"url:{short_code}", 86400, row.long_url)  # TTL 1 dia
    return row.long_url`}</CodeBlock>
        <Callout tone="info" icon="💡">
          <strong>TTL matters</strong>: sem TTL, cache cresce infinitamente. Com TTL de 1 dia + LRU eviction, Redis de 16GB cabe ~16M URLs hot. Power law garante hit rate &gt; 95%.
        </Callout>
      </Section>

      <Section title="Passo 5: analytics de cliques — fire and forget" accent={accent}>
        <CodeBlock lang="python">{`async def redirect_handler(short_code: str, request):
    long_url = await resolve(short_code)
    if not long_url:
        return Response(status=404)

    # Fire-and-forget
    asyncio.create_task(emit_click_event({
        "short_code": short_code,
        "ts": time.time(),
        "ip": request.headers.get("X-Forwarded-For"),
        "ua": request.headers.get("User-Agent"),
        "referer": request.headers.get("Referer"),
    }))
    return RedirectResponse(long_url, status_code=301)


async def emit_click_event(event: dict):
    await kafka_producer.send("url.click", event)
    # Worker offline enriquece (geo via IP), grava em BigQuery/Snowflake`}</CodeBlock>
      </Section>

      <Section title="Passo 6: o que entrevistador aumenta progressivamente" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Pergunta', 'Resposta esperada']}
          rows={[
            ['&quot;E se forem 100B URLs?&quot;', 'Sharding por hash(short_code). 100+ shards. Consistent hashing para rebalance. DynamoDB ou Cassandra.'],
            ['&quot;E se quiser custom alias?&quot;', 'Nova tabela custom_aliases (code → url), lookup primeiro em custom depois em generated. Validação contra palavrões.'],
            ['&quot;E se URL tiver malware?&quot;', 'Scan async (Google Safe Browsing) no write. Bloom filter na hot path para known-bad. Quarantine queue.'],
            ['&quot;E se DB cair?&quot;', 'Read replica pra redirect (read-only degrade), fila pra writes (Kafka buffer), graceful degrade. RTO/RPO definidos.'],
          ]}
        />
      </Section>

      <Section title="Armadilhas que eliminam candidato" accent={accent}>
        <Callout tone="danger" icon="🚫">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Usar hash criptográfico sem justificar</strong> — MD5 truncado tem colisão, precisa round-trip. Prefira counter + base62.</li>
            <li><strong>Esquecer cache</strong> — discutir DB scaling antes de cache = sinal de imaturidade.</li>
            <li><strong>Bloquear redirect com analytics</strong> — SLO quebrado por decisão errada.</li>
            <li><strong>Propor NoSQL sem justificar</strong> — &quot;é escalável&quot; não basta. Escalável em quê?</li>
            <li><strong>Não mencionar rate limiting</strong> — sem isso, alguém gera 1M URLs em 1min como abuse.</li>
          </ul>
        </Callout>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <Callout tone="success" icon="🎓">
          URL shortener é canônica porque a resposta sênior mostra <strong>4 habilidades simultaneamente</strong>: (1) quantificar com back-of-envelope, (2) escolher geração de ID correta, (3) isolar hot path (redirect) de cold path (analytics), (4) adicionar cache onde há power law.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
