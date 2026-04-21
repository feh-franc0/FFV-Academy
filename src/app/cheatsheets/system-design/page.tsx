import type { Metadata } from 'next';
import { CheatsheetLayout } from '@/components/CheatsheetLayout';

export const metadata: Metadata = {
  title: 'Cheatsheet System Design — FFV Academy',
  description: 'Framework de interview, back-of-envelope, números-chave de latência e throughput, padrões canônicos.',
  keywords: 'cheatsheet system design, sd interview framework, latency numbers, back of envelope sd',
};

export default function Page() {
  return (
    <CheatsheetLayout
      title="System Design prep"
      subtitle="O que levar pra qualquer whiteboard de staff-level."
      accent="#ea580c"
      emoji="🧩"
    >
      <section>
        <h2>Framework FRAME</h2>
        <pre><code>{`1. Functional requirements  → o que o sistema faz (features, APIs)
2. non-functional Requirements → scale, latency, consistency, availability
3. API design               → endpoints, payloads, idempotency
4. Model (data)             → schema, escolha DB (relacional/KV/docs/vector)
5. Estimate & Evaluate      → QPS, storage, bandwidth → decisões arquiteturais

Sempre: clarify antes de desenhar. Trade-offs > respostas prontas.`}</code></pre>
      </section>

      <section>
        <h2>Números que você precisa memorizar</h2>
        <pre><code>{`# Latências (Jeff Dean / Peter Norvig, atualizado)
L1 cache reference               0.5   ns
L2 cache reference               7     ns
Mutex lock/unlock                25    ns
Main memory reference            100   ns
SSD random read                  150   us   (microsegundos)
Network 1 Gbps 1KB               10    us
HDD seek                         10    ms
Network round-trip same DC       0.5   ms
Network round-trip cross-region  150   ms

# Escala humana: imagine 1ns = 1s → L1 = 0.5s, disk seek = 115 dias, cross-region = 4700 anos.

# Throughput típico
- Postgres (bom hardware): 10-50k QPS simple lookup, 1-5k QPS em writes
- Redis: 100k+ ops/s por instância
- Kafka: milhões msg/s por cluster
- CDN edge: bilhões req/s globalmente

# Storage
- 1M usuários × 1KB profile = 1 GB
- 1B eventos × 100B each = 100 GB
- Vídeo 1080p ~5 Mbps → 1 hora = 2.25 GB`}</code></pre>
      </section>

      <section>
        <h2>Back-of-envelope template</h2>
        <pre><code>{`DAU = 100M; cada user 10 actions/dia
→ 1B actions/dia
→ 1B / 86400 s ≈ 11.5k QPS avg
→ Peak = 3× avg = 35k QPS
→ Cada action 1 KB → 1 TB/dia storage
→ 1 TB × 365 × 3 anos = ~1 PB (precisa tier)

Redundância: × replication factor (3× comum)
Cache: 80/20 rule → 20% quentes = cachear`}</code></pre>
      </section>

      <section>
        <h2>Padrões canônicos</h2>
        <pre><code>{`CAP (partition tolerance dada) — escolha: CP ou AP
- CP: Postgres, Spanner, ZooKeeper (consistência > disponibilidade)
- AP: DynamoDB, Cassandra (disponibilidade > consistência forte)
- PACELC: + latency trade-off quando não há partição

Cache patterns
- Cache-aside (lazy): app lê cache, miss → DB, popula cache
- Write-through: escrita vai DB + cache
- Write-behind: escrita cache, async → DB (risco de perda)

Consistent hashing (Dynamo, Cassandra, Redis Cluster)
- N nodes em ring, hash(key) → node; remover/adicionar move só 1/N das chaves

Rate limiting
- Token bucket (bursty) vs Leaky bucket (smooth) vs Sliding window counter

Idempotency
- Chave idempotent-id do cliente; server dedupe em window. Essencial em retries.

Outbox pattern — evita dual write (DB + queue)
- Tabela outbox no mesmo TX; CDC (Debezium) publica no Kafka.`}</code></pre>
      </section>

      <section>
        <h2>Design decisions (matriz rápida)</h2>
        <pre><code>{`Relacional vs Document vs KV:
- Transações + queries complexas joins → relacional (Postgres)
- Schema flexível + workload write-heavy → document (Mongo)
- Lookup chave → value simples + alta escala → KV (DynamoDB, Redis)
- Analytics em bilhões de rows → columnar (ClickHouse, BigQuery)
- Semantic search → vector (pgvector, Pinecone)

Sync vs Async:
- UX crítico (login, pagamento) → sync
- Email, notifs, analytics → async (queue)

Pull vs Push:
- Feed com celebs (fanout on read) vs social normal (fanout on write)
- Hybrid: push pra "normal users", pull pra celebs

Monolito vs Microserviços:
- Time < 50 devs, produto novo: monolito modular
- Microserviços só com razão concreta (domínios muito diferentes, scaling independente)`}</code></pre>
      </section>

      <section>
        <h2>Cases canônicos (saber de cabeça)</h2>
        <pre><code>{`URL shortener   → hash vs counter + base62, cache, analytics
Twitter feed    → fanout on write vs read, celeb problem
Chat system     → WS + delivery semantics at-least-once + E2E
Rate limiter    → token bucket Redis + Lua atomic
Distributed cache → consistent hashing + replication
Uber-like       → geo-hash / S2 cells + matching
Newsfeed rank   → ML scoring + cache + freshness
Notification sys → priority queue + user prefs + dedupe`}</code></pre>
      </section>

      <section>
        <h2>Comunicação</h2>
        <pre><code>{`- Clarify ambiguity antes de desenhar
- Diga o que vai assumir; pergunte "este é o foco?"
- Pense alto: "estou inclinado a X porque Y, trade-off é Z"
- Recuperação de falha: staff é sobre se corrigir no meio do caminho
- Termine com: o que deixou de fora + como escalaria próximo nível`}</code></pre>
      </section>
    </CheatsheetLayout>
  );
}
