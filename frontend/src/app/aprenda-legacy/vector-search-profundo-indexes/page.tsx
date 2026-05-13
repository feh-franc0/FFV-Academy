import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vector-search-profundo-indexes');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que brute force nearest neighbor é inviável acima de ~1M vetores?',
    options: [
      'É rápido',
      'Cada query exige calcular distância (dot product ou coseno) contra todos os N vetores de 1536 dims — O(N·D). Em 10M × 1536, cada query é ~15 bilhões de ops, latência multi-segundos em CPU moderna. Aceitável para prototipo (< 100k) mas impossível em produção',
      'Não é inviável',
      'Só em GPU',
    ],
    correct: 1,
    explanation: 'Em 1M de vetores × 1536 dims × 4 bytes = 6GB de dados. Cada query precisa 1.5 bilhões de multiplicações. Em CPU moderna (~100 GFLOPS efetivos), isso é ~15ms em single query — mas escala linearmente: 10M seria 150ms, 100M 1.5s. Além disso, cache misses destroem performance. ANN (Approximate Nearest Neighbor) sacrifica exatidão perfeita (95-99% recall vs 100%) por 100-1000x speedup via HNSW/IVF.',
  },
  {
    question: 'Como HNSW (Hierarchical Navigable Small World) consegue p99 ~10ms em 10M vetores?',
    options: [
      'Random',
      'Constrói grafo hierárquico multi-layer: camada topo tem poucos nodes com conexões longas (pulos grandes), camadas baixas densas com conexões locais. Query navega greedy do topo: aproxima rápido em escala, refina na base. Trade-off: build lento, memória alta, query logarítmica',
      'Só ordena',
      'Clusteriza',
    ],
    correct: 1,
    explanation: 'HNSW (Malkov & Yashunin, 2016) é hoje o ANN dominante. Analogia: atlas rodoviário. Mapa-mundi (layer alto) tem só capitais conectadas por grandes rotas — rápido pra saber "em que continente". Mapa local (layer 0) tem todas as ruas. Query: começa em ponto aleatório do topo, caminha pelo vizinho mais próximo do alvo, desce de layer quando não há vizinho melhor. Total navegação é O(log N). Parâmetros: M (vizinhos por node), efConstruction (cuidado no build), ef (cuidado no query).',
  },
  {
    question: 'Quando pgvector vs DB dedicado (Pinecone/Qdrant/Weaviate)?',
    options: [
      'Sempre dedicado',
      'pgvector dentro do Postgres: ideal quando volume < 10M vetores, queries envolvem joins com dados relacionais (filtros compostos: user_id + vector), e overhead operacional de stack adicional não compensa. DB dedicado: volumes maiores, sharding, features específicas (hybrid nativo, metadata complexa, multi-tenancy massivo)',
      'Sempre Postgres',
      'Tanto faz',
    ],
    correct: 1,
    explanation: 'pgvector amadureceu muito (suporta HNSW desde 0.5, IVFFlat antes disso): até ~5–10M vetores com filtros relacionais complexos, é escolha sólida. Zero infra adicional. Dedicados vencem em: volumes massivos (100M+), sharding transparente, quando latência P99 precisa ser < 10ms consistentemente, features de hybrid nativo (Weaviate, Qdrant), ou multi-tenancy com isolamento forte. Em dúvida, comece com pgvector e migre se doer.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vector-search-profundo-indexes"
      title="Vector search: HNSW, IVF, indexes aproximados"
      icon="🧭"
      xp={60}
      readTime={14}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="hybrid-search-reranking-de-verdade"
      nextTitle="Hybrid search + reranking: RRF e cross-encoder"
      quiz={quiz}
    >
      <Section title="Por que ANN é obrigatório em escala" accent={accent}>
        <p>
          Embeddings modernos têm 768–3072 dimensões. Calcular similaridade contra 10M vetores em tempo de query é matematicamente impossível em latência humana. Approximate Nearest Neighbor (ANN) aceita 95–99% de recall em troca de 100–1000x speedup — trade-off que viabilizou vector search em produção.
        </p>
      </Section>

      <Section title="HNSW — o padrão atual" accent={accent}>
        <CodeBlock lang="python">{`# Analogia: atlas rodoviário hierárquico
#
# Layer 2 (topo):      cidades principais, conexões longas
#    SP ─────────── RJ ──── BH
#      \\                   /
#       ──── Curitiba ─────
#
# Layer 1:             cidades médias, conexões moderadas
#
# Layer 0 (base):      todos os pontos, conexões curtas densas
#
# Query "bairro X":
#   1. Entry point aleatório em Layer 2
#   2. Greedy: anda pro vizinho mais próximo do target
#   3. Quando nenhum vizinho é melhor, desce de layer
#   4. Repete até layer 0
#   5. ef nearest nos vizinhos finais = resultado

# Parâmetros-chave:
# M = 16             # vizinhos por node (trade-off mem vs qualidade)
# efConstruction=200 # esforço no build (maior = melhor grafo, build lento)
# ef (runtime)       # esforço no query (maior = recall maior, latency +)`}</CodeBlock>
      </Section>

      <Section title="IVF (Inverted File) — alternativa por clustering" accent={accent}>
        <CodeBlock lang="python">{`# IVF divide espaço em K clusters (k-means inicial)
# Cada vetor é atribuído ao cluster mais próximo
# Query: encontra nprobe clusters mais próximos, busca neles

# Trade-off vs HNSW:
# - Build mais rápido
# - Menos memória
# - Update mais barato
# - Recall tipicamente menor que HNSW bem tunado
# - Precisa escolher K (tipicamente sqrt(N))

# Uso comum: FAISS (Facebook), IVFFlat ou IVFPQ com compressão

# Postgres pgvector (IVFFlat):
# CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops)
# WITH (lists = 100);  -- nprobe default runtime

# pgvector (HNSW, preferido desde 0.5):
# CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops)
# WITH (m = 16, ef_construction = 64);`}</CodeBlock>
      </Section>

      <Section title="Comparativo de bancos vetoriais" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Solução', 'Sweet spot', 'Pró', 'Contra']}
          rows={[
            ['pgvector', '< 10M, dados relacionais juntos', 'Zero infra extra, transactional', 'Escala limitada, menos hybrid'],
            ['Qdrant', 'Self-hosted ou cloud, até 500M', 'Rust rápido, filtering nativo, hybrid', 'Mais jovem ecossistema'],
            ['Weaviate', 'Hybrid search first-class', 'BM25+vector nativo, GraphQL', 'Operacionalmente complexo'],
            ['Pinecone', 'Managed, escala massiva', 'Serverless, multi-region, SLA', 'Caro, vendor lock-in'],
            ['Elasticsearch + dense_vector', 'Já usa ES', 'Single stack, hybrid fácil', 'ANN menos otimizado que dedicados'],
            ['Milvus', 'Volumes gigantescos (bilhões)', 'Muito escalável, GPU-aware', 'Overkill pra maioria'],
          ]}
        />
      </Section>

      <Section title="pgvector na prática" accent={accent}>
        <CodeBlock lang="sql">{`-- Setup
CREATE EXTENSION vector;

-- Tabela com embedding
CREATE TABLE docs (
  id bigserial PRIMARY KEY,
  content text,
  embedding vector(1536)  -- OpenAI ada-002 dim
);

-- Índice HNSW (preferido em 2026)
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Query top-10 semântico
SELECT id, content,
       1 - (embedding <=> '[0.01, 0.23, ...]'::vector) AS cosine_sim
FROM docs
ORDER BY embedding <=> '[0.01, 0.23, ...]'::vector
LIMIT 10;

-- Operadores:
--   <->  distância euclidiana
--   <=>  distância coseno (mais comum)
--   <#>  produto interno negativo

-- Filtro + vector (onde pgvector brilha: combinado com SQL normal)
SELECT * FROM docs
WHERE tenant_id = 42 AND created_at > now() - interval '30 days'
ORDER BY embedding <=> :query
LIMIT 20;`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Padrão prático 2026: começa com pgvector + HNSW no mesmo Postgres da aplicação. Só migra pra DB dedicado quando volume passar de ~10M ou latência P99 virar requisito duro. Simplicidade operacional vale muito.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
