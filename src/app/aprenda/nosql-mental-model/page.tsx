import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('nosql-mental-model');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "NoSQL" é um rótulo pobre em 2026?',
    options: [
      'Porque NoSQL nunca existiu',
      'Agrupa tecnologias muito diferentes (document, KV, wide-column, graph, time-series, vector) sob uma negação do modelo relacional. O que importa é o modelo de dados e o trade-off de consistência, não a ausência de SQL — inclusive Mongo e DynamoDB têm SQL-like APIs hoje',
      'Porque todos os bancos hoje são SQL',
      'Porque NoSQL é mais lento que SQL sempre',
    ],
    correct: 1,
    explanation: 'O termo surgiu em 2009 como marketing contra RDBMS. Em 2026 é ruído: MongoDB tem aggregation pipeline relacional, DynamoDB tem PartiQL, Cassandra tem CQL. O que define escolha é modelo de dados (documento vs KV vs grafo vs vetor), padrão de acesso (point lookup vs scan vs analytics) e trade-off CAP/PACELC — não se usa SQL ou não.',
  },
  {
    question: 'Qual categoria escolher para feed de eventos com busca temporal (ex: métricas de servidor)?',
    options: [
      'Document store (Mongo)',
      'Time-series database como InfluxDB, TimescaleDB ou ClickHouse. Otimizam compressão por timestamp, downsampling automático e queries de janela. Usar Postgres puro vira gargalo em 10M+ pontos/dia',
      'Graph database',
      'Key-value puro',
    ],
    correct: 1,
    explanation: 'Time-series têm padrão de escrita append-only ordenado por tempo e leitura por janela (last 1h, last 7d, rollup por minuto). TSDBs têm colunar + compressão delta-of-delta + retention policy nativos. Postgres com índice btree em timestamp funciona até ~10M rows; depois compressão e downsampling viram obrigatórios — TimescaleDB resolve sem sair do Postgres.',
  },
  {
    question: 'Quando Vector DB (Pinecone/pgvector/Qdrant) é a escolha correta?',
    options: [
      'Para substituir Postgres em OLTP',
      'Para busca semântica por embedding: RAG, recomendação por similaridade, dedup fuzzy. Você tem embeddings de 384-3072 dims e precisa de top-k por cosine/L2 em milhões de vetores — HNSW/IVF indexam isso, btree não',
      'Para cache de sessão',
      'Para relatórios analíticos',
    ],
    correct: 1,
    explanation: 'Vector DB é especializado em ANN (approximate nearest neighbor) sobre vetores densos. Usos: RAG (busca por similaridade semântica), recomendação, detecção de duplicatas. pgvector é suficiente até ~1M vetores; Pinecone/Qdrant/Weaviate escalam para 100M+. Não é substituto de OLTP nem de analytics.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="nosql-mental-model"
      title="NoSQL: mental model 2026"
      icon="🧩"
      xp={45}
      readTime={10}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O termo NoSQL envelheceu mal" accent={accent}>
        <p>
          Em 2009, NoSQL era um movimento contra RDBMS. Em 2026, é um balaio que junta tecnologias incompatíveis entre si. MongoDB (document) não tem nada em comum com Neo4j (graph), que não tem nada em comum com Redis (KV), que não tem nada em comum com Pinecone (vector). O rótulo confunde mais do que ajuda.
        </p>
        <p>
          A pergunta útil em 2026 é: <strong>qual modelo de dados e qual padrão de acesso</strong>. O nome do produto vem depois.
        </p>
      </Section>

      <Section title="As 6 categorias que importam" accent={accent}>
        <CodeBlock lang="yaml">{`# Mapa de categorias (2026)

document:
  exemplos: [MongoDB, Couchbase, Firestore]
  dado: JSON/BSON com schema flexível
  acesso: find por campo, aggregation pipeline
  quando: domínio com estrutura variável, CMS, catálogo de produtos

key_value:
  exemplos: [Redis, DynamoDB, etcd, Memcached]
  dado: chave -> blob (string, hash, set, stream)
  acesso: O(1) por chave (point lookup)
  quando: cache, session store, rate limit, leaderboard

wide_column:
  exemplos: [Cassandra, ScyllaDB, HBase, BigTable]
  dado: tabela particionada por chave composta
  acesso: scan por partition key
  quando: write-heavy, multi-região, time-series escala massiva

graph:
  exemplos: [Neo4j, Memgraph, DGraph]
  dado: nodes + edges com propriedades
  acesso: traversal (Cypher, Gremlin)
  quando: social graph, fraud detection, knowledge graph

time_series:
  exemplos: [InfluxDB, TimescaleDB, ClickHouse, Prometheus]
  dado: (timestamp, tags, value)
  acesso: janela temporal, downsample, rollup
  quando: metricas, IoT, telemetria, logs estruturados

vector:
  exemplos: [Pinecone, Qdrant, Weaviate, pgvector, Milvus]
  dado: vetores densos (384-3072 dims) + metadata
  acesso: top-k ANN por cosine/L2/dot
  quando: RAG, recomendacao semantica, dedup fuzzy`}</CodeBlock>
      </Section>

      <Section title="Eixos de decisão reais" accent={accent}>
        <Callout tone="info" icon="🧭">
          Antes de escolher tecnologia, responda: (1) qual modelo de dados casa com o domínio, (2) qual é o padrão de acesso dominante (point lookup, range, full-text, similarity), (3) quanto de consistência o negócio tolera, (4) escala alvo em 12 meses.
        </Callout>
        <p>
          Regra prática: comece com Postgres. Ele resolve document (JSONB), KV (hstore), time-series (TimescaleDB), full-text (tsvector), vector (pgvector) e graph simples (recursive CTE). Troque por especializado quando o gargalo for real e medido, não teórico.
        </p>
      </Section>

      <Section title="Anti-patterns clássicos" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Usar Mongo porque "schema flexível": domínios estáveis ganham de JSONB em Postgres com muito menos operação. Usar DynamoDB sem entender single-table design: custo explode. Usar Vector DB sem reranker: top-k vira lixo semântico.
        </Callout>
        <Callout tone="success" icon="✅">
          Pergunta certa: "qual modelo representa meu domínio e qual acesso é dominante?" A tecnologia é consequência.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
