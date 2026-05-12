import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vector-dbs-pgvector-pinecone');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o operador <=> faz em pgvector?',
    options: [
      'Comparação de igualdade',
      'Distância de cosine entre dois vetores (1 - cosine similarity). Também existem <-> (L2/euclidean) e <#> (inner product negativo). O operador certo depende de como os embeddings foram treinados — OpenAI e a maior parte das APIs modernas usam cosine',
      'Operador de atribuição',
      'Só funciona com inteiros',
    ],
    correct: 1,
    explanation: 'pgvector expõe 3 operadores de distância: <-> (L2), <=> (cosine), <#> (inner product negado). O índice HNSW/IVFFlat precisa ser criado com a ops class correspondente (vector_cosine_ops, vector_l2_ops, vector_ip_ops). Usar o operador errado para o índice força sequential scan. OpenAI text-embedding-3 e a maioria usa cosine — é o default razoável.',
  },
  {
    question: 'Quando escolher pgvector vs Pinecone/Qdrant dedicado?',
    options: [
      'Pinecone sempre',
      'pgvector quando volume < ~5M vetores e você já tem Postgres — evita infra extra, permite join com metadata relacional, transação ACID. Pinecone/Qdrant/Weaviate quando > 10M vetores, precisa de multi-tenancy nativo, hybrid search, ou latência p99 < 50ms em escala',
      'pgvector sempre',
      'Não importa',
    ],
    correct: 1,
    explanation: 'pgvector + HNSW entrega latência excelente até alguns milhões de vetores num Postgres razoável. Vantagem: você faz WHERE tenant_id = X AND embedding <=> :q LIMIT 10 com filtro relacional nativo. Pinecone/Qdrant são especializados: metadata filtering, sparse+dense hybrid, disk-based indexes para bilhões de vetores, replicação geo. Escolha por escala e requirements, não por hype.',
  },
  {
    question: 'Por que rerankear resultados depois de ANN?',
    options: [
      'Não precisa',
      'Embeddings capturam similaridade semântica genérica — recuperam candidatos relevantes mas nem sempre o melhor no topo. Reranker cross-encoder (Cohere Rerank, BGE-reranker) compara query-documento em conjunto e ordena por relevância real. Recall alto do ANN + precision do reranker = RAG decente',
      'Para gastar mais',
      'Reranker é o mesmo que embedding',
    ],
    correct: 1,
    explanation: 'Bi-encoders (embeddings) codificam query e documento separadamente — escalável mas perde interação. Cross-encoder (reranker) recebe [query, doc] junto e produz score calibrado — lento mas preciso. Pipeline correto: (1) ANN busca top-50 com embeddings, (2) reranker reordena e mantém top-5. Salto de qualidade em RAG é real e mensurável em eval.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vector-dbs-pgvector-pinecone"
      title="Vector DBs: pgvector + Pinecone"
      icon="🧬"
      xp={65}
      readTime={15}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Vector DB é infra especializada" accent={accent}>
        <p>
          Um vetor de embedding é um ponto num espaço de 384 a 3072 dimensões. Buscar &quot;os 10 mais próximos desta query&quot; num milhão de pontos por força bruta é O(N) com cálculo denso — inviável em latência de produto. Vector DBs resolvem isso com indexes ANN (Approximate Nearest Neighbor): HNSW, IVF, PQ. Recall &lt; 100% trocado por latência p99 de milissegundos.
        </p>
      </Section>

      <Section title="pgvector em Postgres real" accent={accent}>
        <CodeBlock lang="sql">{`-- Habilita extensao
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela com embedding + metadata relacional
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   INT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    embedding   vector(1536) NOT NULL,    -- OpenAI text-embedding-3-small
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indice HNSW (Hierarchical Navigable Small World)
-- Melhor recall/latencia em 2026. IVFFlat e alternativa mais barata de build.
CREATE INDEX documents_embedding_hnsw
    ON documents
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Index combinado para filtro por tenant (partial index)
CREATE INDEX documents_tenant ON documents (tenant_id);

-- Analyze para planner usar estatisticas
ANALYZE documents;`}</CodeBlock>
      </Section>

      <Section title="Busca: ANN + filtro + rerank" accent={accent}>
        <CodeBlock lang="sql">{`-- Top 50 mais proximos do embedding da query, dentro do tenant
-- ef_search controla qualidade vs latencia (default 40, prod 100+)
SET LOCAL hnsw.ef_search = 100;

SELECT id, title, content,
       1 - (embedding <=> $1::vector) AS cosine_similarity
FROM documents
WHERE tenant_id = $2
ORDER BY embedding <=> $1::vector
LIMIT 50;`}</CodeBlock>
        <CodeBlock lang="ts">{`import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';

const openai = new OpenAI();
const cohere = new CohereClient({ text: process.env.COHERE_API_KEY! });

async function semanticSearch(query: string, tenantId: number) {
  // 1) Embed a query
  const emb = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const vec = emb.data[0].embedding;

  // 2) Top-50 via pgvector
  const candidates = await db.query(
    'SELECT id, title, content FROM documents WHERE tenant_id = $1 ' +
    'ORDER BY embedding <=> $2::vector LIMIT 50',
    [tenantId, toPgVector(vec)]
  );

  // 3) Rerank cross-encoder -> top-5 reais
  const rerank = await cohere.rerank({
    model: 'rerank-multilingual-v3.0',
    query,
    documents: candidates.rows.map(r => r.content),
    topN: 5,
  });

  return rerank.results.map(r => candidates.rows[r.index]);
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O pipeline de 2 estágios (ANN recall + reranker precision) é o que separa RAG de brinquedo de RAG que responde bem. Sem reranker, você devolve documentos semanticamente próximos mas não necessariamente relevantes para a intenção.
        </Callout>
      </Section>

      <Section title="Quando migrar de pgvector para dedicado" accent={accent}>
        <CodeBlock lang="yaml">{`# Regras de migração

pgvector basta se:
  - < 5M vetores
  - ja tem Postgres gerenciado
  - filtro metadata relacional importa
  - p99 < 200ms tolerado

considere Pinecone/Qdrant/Weaviate se:
  - > 10M vetores
  - multi-tenant com isolamento hard
  - hybrid search (BM25 + dense) nativo
  - p99 < 50ms obrigatorio
  - replicacao geografica gerenciada

considere Milvus/Vespa se:
  - > 100M vetores, self-hosted
  - features avancadas (filtering DSL, analytics)
  - time dedicado pra operar`}</CodeBlock>
      </Section>

      <Section title="Anti-patterns comuns" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Embeddings de modelos diferentes não são comparáveis — nunca misture OpenAI com Cohere no mesmo índice. Chunks muito grandes (&gt; 1000 tokens) viram embedding genérico. Chunks muito pequenos (&lt; 50 tokens) perdem contexto. Metadata filter mal indexado degrada ANN. Reranker custa dinheiro — use apenas no top-50, não em tudo.
        </Callout>
        <Callout tone="success" icon="✅">
          Vector DB é infraestrutura de busca semântica. Dominar pgvector primeiro (simples, barato) e migrar para dedicado quando a dor chegar é o caminho sensato em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
