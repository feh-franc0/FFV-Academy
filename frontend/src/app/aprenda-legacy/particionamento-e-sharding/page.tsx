import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('particionamento-e-sharding');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre particionamento e sharding?',
    options: [
      'Sinônimos',
      'Particionamento: divide tabela em partições no MESMO server (gerenciado pelo PG nativamente). Sharding: divide dados em MÚLTIPLOS servers (precisa camada extra — Citus, vitess). Particionamento é 10x mais fácil',
      'Deprecated ambos',
      'Só em MySQL',
    ],
    correct: 1,
    explanation: 'Particionamento: 1 PG, N partitions (cada uma é heap físico separado). Ganho: manutenção mais fácil (drop partition velha = drop table), partition pruning (planner ignora partitions irrelevantes). Sharding: N PGs, dados divididos. Ganho: escala horizontal. Custo: complexity gigante.',
  },
  {
    question: 'Quando RANGE partitioning ganha vs HASH?',
    options: [
      'RANGE é sempre melhor',
      'RANGE: dados com ordem natural (time-series por date, prices por faixa). Permite drop-partition pra cleanup, queries por range usam poucos partitions. HASH: distribuição uniforme de load quando não há dimensão de range natural',
      'Hash é deprecated',
      'São iguais',
    ],
    correct: 1,
    explanation: 'RANGE (ex: PARTITION BY RANGE (created_at) em meses): cada mês = partition. Cleanup DROP PARTITION 2025_01 = instant. Query WHERE created_at > "2026-01-01" ignora partitions antigas (pruning). HASH pra distribuir write load sem range natural (ex: user_id).',
  },
  {
    question: 'Qual extensão transforma Postgres em sharding-capable?',
    options: [
      'Não existe',
      'Citus (Microsoft adquiriu 2019) — distribui tabelas em N PG nodes. Coordinator + workers. Queries são roteadas. Azure Cosmos DB for PostgreSQL usa Citus',
      'pg_partman',
      'Só via fork',
    ],
    correct: 1,
    explanation: 'Citus é extensão open-source (+ Azure managed). create_distributed_table() shard por PK. Queries coordinator → workers → merge. Boa pra OLAP em escala, multi-tenant com millions de customers. Alternativa: Greenplum (fork full do PG), pgdog.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="particionamento-e-sharding"
      title="Particionamento e sharding: quando e como"
      icon="🧩"
      xp={60}
      readTime={14}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="capstone-tuning-de-workload-real"
      nextTitle="Capstone: tuning de workload — query de 30s pra 50ms"
      quiz={quiz}
    >
      <Section title="Partitioning declarativo (PG 10+)" accent={accent}>
        <CodeBlock lang="sql">{`-- RANGE: por mês
CREATE TABLE events (id BIGINT, created_at TIMESTAMP, ...)
PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_01 PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE events_2026_02 PARTITION OF events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- pg_partman automatiza creation de novas partitions
CREATE EXTENSION pg_partman;
SELECT partman.create_parent('public.events', 'created_at', 'range', 'monthly');

-- Cleanup instantâneo
DROP TABLE events_2025_01;  -- data de 2025 jan some em 50ms`}</CodeBlock>
      </Section>

      <Section title="HASH partition (distribuir writes)" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE users (id BIGINT, ...) PARTITION BY HASH (id);

CREATE TABLE users_0 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_1 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE users_2 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE users_3 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Inserts distribuem uniformemente`}</CodeBlock>
      </Section>

      <Section title="Quando sharding (Citus)" accent={accent}>
        <Callout tone="info" icon="💡">
          Particionamento: até ~1TB por tabela ou até server max (8TB instance AWS). Sharding: &gt;10TB ou &gt;100k writes/s sustentado. Antes de pegar sharding, verifique: vertical scale esgotado? Cache layer? Read replicas? Sharding é último recurso — complexity cost enorme.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
