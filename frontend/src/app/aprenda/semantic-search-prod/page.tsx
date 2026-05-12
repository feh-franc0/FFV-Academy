import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, ArchFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('semantic-search-prod');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que blue-green reindex é o padrão para mudanças não-triviais em embedding pipelines?',
    options: [
      'Tradição',
      'Embeddings de modelo A não são comparáveis com modelo B — vivem em espaços vetoriais distintos. Não dá para misturar parcialmente. Blue-green: indexar tudo num índice novo em paralelo, validar qualidade no golden set, depois trocar atomicamente via alias. Zero downtime, rollback trivial',
      'É mais barato',
      'É mais lento',
    ],
    correct: 1,
    explanation: 'Quando você troca o modelo de embedding (e.g., de BGE-large-v1.5 para BGE-M3), ou muda a chunking strategy, ou faz fine-tune do encoder, os vetores antigos viram inúteis — vivem em espaço diferente. Não dá para fazer "rolling update". Solução padrão: blue-green. (1) Criar índice "green" novo. (2) Reindex todo o corpus com novo modelo em paralelo (pode levar horas-dias). (3) Validar NDCG/MRR no golden set entre blue e green. (4) Trocar alias atomic: agora "search" aponta para green. (5) Manter blue por N dias para rollback. Zero downtime, sem inconsistência. Mesma estratégia usada em deploys de DB.',
  },
  {
    question: 'O que é freshness lag em semantic search e como gerenciá-lo?',
    options: [
      'Velocidade da query',
      'Delta entre quando um doc é criado/atualizado e quando vira buscável no índice vetorial. Causado por pipeline de embedding (batch ou stream), indexação no vector DB, e refresh interval. Lag típico: minutos (stream) a horas (batch). Estratégias: hot tier com batch curto + cold tier com reindex periódico',
      'Tempo de embedding',
      'TTL do cache',
    ],
    correct: 1,
    explanation: 'Diferente de BM25 (onde update vira segment imediatamente no Lucene), embeddings exigem inferência adicional. Pipeline típico: doc novo → fila Kafka/SQS → worker gera embedding via GPU → upsert no vector DB. Cada estágio adiciona latência. Em batch (e.g., embedding diário do delta), freshness pode ser horas. Em streaming (Kafka + workers contínuos), minutos. Estratégias avançadas: hot tier (docs últimas 24h) com embedding por streaming + cold tier (resto) com reindex periódico. Ou hybrid: índice keyword (BM25, real-time) + índice vetorial (com lag) — queries combinam ambos via RRF, escondendo o lag do vetorial.',
  },
  {
    question: 'Custo de embedding 1B documentos via API vs self-hosted GPU',
    options: [
      'Igual',
      'Via API (Voyage/Cohere ~$0.10-0.15/1M tokens, doc médio 200 tokens): 1B docs × 200t = 200B tokens → $20k-30k. Self-hosted GPU (A10 amortizada $300/mês, ~500 docs/s = 43M docs/dia): 1B docs em ~23 dias = ~$230. Economia 100× em escala, mas exige ops de GPU',
      'API mais barato',
      'Não há diferença',
    ],
    correct: 1,
    explanation: 'Em escala, self-hosted vence drasticamente. Cálculo real: doc médio ~200 tokens. 1B docs = 200B tokens. Via Voyage v3 ($0.12/1M tokens): 200 × $0.12 = $24k. Via Cohere v3 ($0.10/1M): $20k. Self-hosted: A10 24GB amortizada $0.40/h × 24h × 30 = $288/mês. Throughput BGE-M3 batch=32: ~500 docs/s = 43M/dia. 1B em 23 dias. Custo: $288/30 × 23 = $221. Diferença 100×. Mas exige: K8s/GPU operator, batch system (Ray/Modal/Truss), monitoring, retries. Para volumes < 1B, API é mais simples e justificável. Acima de 5B-10B/mês, GPU self-host é mandatório.',
  },
  {
    question: 'Estratégia de chunking — fixed-size vs semantic vs hierarchical — qual escolher?',
    options: [
      'Sempre fixed',
      'Depende: fixed-size (200-500 tokens, overlap 50-100) é o default razoável. Semantic (split por parágrafo/seção) preserva contexto melhor mas é mais frágil. Hierarchical (chunk + parent doc) brilha em RAG longo — retrieval no chunk, expansão para parent context. Sempre validar no golden set',
      'Sempre semantic',
      'Sempre hierarchical',
    ],
    correct: 1,
    explanation: 'Chunking é uma das decisões mais impactantes em RAG e raramente discutida. Estratégias: (1) Fixed-size — divide em janelas de N tokens com overlap. Simples, robusto, default em LangChain/LlamaIndex. (2) Semantic — divide em parágrafos/seções respeitando estrutura. Melhor coerência, mas frágil em docs mal estruturados. (3) Hierarchical (recursive) — chunk pequeno para retrieval + chunk pai (ou doc inteiro) para contexto na resposta. Brilha em RAG longo onde você precisa de localização precisa do match + contexto amplo. Em 2026, é tendência em frameworks (LlamaIndex AutoMergingRetriever, etc). Sempre A/B testar via golden set.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="semantic-search-prod"
      title="Semantic search em produção: indexing, sharding, freshness"
      icon="🚢"
      xp={70}
      readTime={14}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="vector-dbs-comparados"
      nextTitle="Vector DBs em 2026: Qdrant, Weaviate, Pinecone, pgvector"
      quiz={quiz}
    >
      <Section title="Do POC ao billion-scale" accent={accent}>
        <p>
          Em demo é fácil: 1k docs, embed com OpenAI, push no pgvector, query. Em produção sério, é outro mundo:
          bilhões de docs, freshness em minutos, latência sub-100ms p99, custo controlado, reindex sem downtime, golden
          set evoluindo.
        </p>
        <p>
          Este módulo cobre o que separa demo de produção: pipelines de ingest (Airflow/Prefect), sharding strategy,
          hot/cold tiers, freshness lag, blue-green reindex, e o custo real de embedding 1B docs.
        </p>
        <Callout tone="info" icon="📚">
          Referências: Pinecone, Qdrant, Weaviate engineering blogs (todos têm posts excelentes sobre escala);
          &quot;Designing Data-Intensive Applications&quot; (Kleppmann) cap. 11 (stream processing) e 12 (future of data
          systems).
        </Callout>
      </Section>

      <Section title="Arquitetura completa de produção" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Stack típica em escala"
          columns={[
            {
              title: 'Source',
              items: [
                'CRM / CMS / DB — Docs originais',
                'CDC (Debezium) — Postgres → Kafka',
                'Files (S3/GCS) — PDFs, HTML, docs',
              ],
            },
            {
              title: 'Ingest',
              items: [
                'Kafka / Pulsar — Stream de mudanças',
                'Airflow / Prefect — Batch reindex',
                'Parser workers — PDF → texto, HTML clean',
              ],
            },
            {
              title: 'Transform',
              items: [
                'Chunker — Fixed / semantic / hierarchical',
                'Embedder (GPU) — BGE-M3, Voyage, Cohere',
                'Metadata enrichment — lang, date, tags',
              ],
            },
            {
              title: 'Index',
              items: [
                'Vector DB — Qdrant / Weaviate / pgvector',
                'Search engine — Elasticsearch / OpenSearch',
                'Cache — Redis para query results',
              ],
            },
            {
              title: 'Serve',
              items: [
                'Retrieval API — gRPC / REST, hybrid + rerank',
                'Observability — Prometheus + golden set CI',
                'A/B testing — split traffic, mede NDCG',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Ingestion: stream vs batch" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'Stream (Kafka + workers)', 'Batch (Airflow / Spark)']}
          rows={[
            ['Freshness', 'Minutos', 'Horas a dias'],
            ['Throughput', 'Limitado por workers ativos', 'Pode escalar massivamente'],
            ['Complexidade', 'Alta (state, retries, exactly-once)', 'Média (DAGs)'],
            ['Custo', 'GPUs sempre ligadas (caro)', 'GPUs sob demanda (mais barato)'],
            ['Falha tolerance', 'Kafka retém eventos, retry trivial', 'Idempotente, reprocessa partições'],
            ['Quando usar', 'Hot data (últimas 24-48h), updates críticos', 'Backfill, cold data, reindex periódico'],
          ]}
        />
        <Callout tone="info" icon="💡">
          <strong>Padrão híbrido</strong>: stream para dados quentes (últimos 7 dias) + batch noturno para cold tier
          (corpus completo, reembed se modelo mudou). Equilibra freshness, custo e ops.
        </Callout>
      </Section>

      <Section title="Chunking: a decisão mais subestimada" accent={accent}>
        <CodeBlock lang="python">{`# Estratégia 1: Fixed-size com overlap (default razoável)
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,         # tokens, não chars (usar tiktoken)
    chunk_overlap=100,      # 20% típico
    separators=["\\n\\n", "\\n", ". ", " "],  # tenta quebrar em fronteiras naturais
)
chunks = splitter.split_text(doc_text)

# Estratégia 2: Semantic (sentence + semantic similarity)
from llama_index.core.node_parser import SemanticSplitterNodeParser

splitter = SemanticSplitterNodeParser(
    buffer_size=1,
    breakpoint_percentile_threshold=95,
    embed_model=OpenAIEmbedding(),
)
# Quebra onde a similaridade entre sentenças vizinhas cai abruptamente

# Estratégia 3: Hierarchical (chunk + parent context)
from llama_index.core.node_parser import HierarchicalNodeParser

parser = HierarchicalNodeParser.from_defaults(
    chunk_sizes=[2048, 512, 128],  # 3 níveis
)
# Retrieval no chunk de 128t (preciso)
# Resposta inclui parent de 512t ou 2048t (contexto)
# AutoMergingRetriever junta automaticamente`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Chunk muito pequeno (< 100t)', v: 'Falta contexto. Match relevante perde semântica.' },
            { k: 'Chunk muito grande (> 1500t)', v: 'Dilui sinal. Muitos tópicos no mesmo vetor. NDCG cai.' },
            { k: 'Sweet spot empírico', v: '300-600 tokens com 10-20% overlap. Funciona em 80% dos casos.' },
            { k: 'Quando usar hierarchical', v: 'RAG com docs longos (papers, manuais) onde contexto amplo importa' },
            { k: 'Validação', v: 'Sempre A/B testar 2-3 estratégias no golden set antes de commit' },
          ]}
        />
      </Section>

      <Section title="Sharding em vector DBs" accent={accent}>
        <p>
          Vector DBs modernos sharding por hash ou por range. Trade-offs distintos do mundo SQL/ES:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'Como funciona', 'Quando usar']}
          rows={[
            ['Hash shard (default)', 'hash(doc_id) % N → shard', 'Distribuição uniforme, sem hot shards'],
            ['Range / tenant shard', 'shard por tenant_id ou date range', 'Multi-tenancy isolado, queries filtradas por tenant'],
            ['Geo shard', 'shard por região do usuário', 'Latência baixa por região, compliance (GDPR)'],
            ['Tiered (hot/cold)', 'Hot tier: SSD/RAM; cold tier: HDD/S3', 'Corpora com long tail temporal (logs, news)'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Vector queries com filtros (e.g., &quot;buscar entre docs do tenant X criados em Y&quot;) podem degradar
          performance se o filtro reduzir muito o set candidato — ANN HNSW é desenhado para corpus inteiro. Vector DBs
          modernos (Qdrant, Weaviate) implementam &quot;filterable HNSW&quot; ou payload-filtered search para mitigar.
        </Callout>
      </Section>

      <Section title="Freshness lag: o trade-off escondido" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Caminho de freshness"
          steps={[
            { label: '1. Doc criado/atualizado', desc: 'T=0 no source system' },
            { label: '2. CDC captura mudança', desc: 'T+1s via Debezium / triggers' },
            { label: '3. Kafka topic', desc: 'T+2s, ordenado por partition' },
            { label: '4. Worker consome', desc: 'T+5s, parse e chunk' },
            { label: '5. Embedding (GPU batch)', desc: 'T+30s-2min, depende do batch size' },
            { label: '6. Upsert no vector DB', desc: 'T+35s, mas refresh do índice HNSW pode adicionar segundos' },
            { label: '7. Visível em queries', desc: 'T+1-5 minutos, depende do throughput de updates' },
          ]}
        />
        <Callout tone="info" icon="💡">
          Lag típico em pipelines streaming bem feitos: <strong>30s a 5min</strong>. Em batch noturno: <strong>até 24h</strong>.
          Decida pelo SLA: chat de suporte aguenta 5min? Probably. Catálogo e-commerce aguenta 24h? Probably not.
        </Callout>
      </Section>

      <Section title="Blue-green reindex (mudança de modelo)" accent={accent}>
        <CodeBlock lang="python">{`# Exemplo: troca de BGE-large-v1.5 para BGE-M3 sem downtime
# Vector DB: Qdrant

from qdrant_client import QdrantClient
client = QdrantClient(url="https://qdrant.internal")

# Step 1: criar coleção "green" com mesmo schema
client.create_collection(
    collection_name="docs_v2_green",
    vectors_config={"size": 1024, "distance": "Cosine"},
)

# Step 2: reindex corpus em "green" com novo modelo (job batch separado)
# Pode levar horas-dias. Roda em paralelo com tráfego em "blue" (atual).
# - Worker pool de N GPUs lendo do source
# - Embeddings com BGE-M3
# - Upsert em docs_v2_green

# Step 3: golden set validation (CI step antes do switch)
# Roda N=100 queries no green e no blue, compara NDCG@10 e MRR.
# Bloqueio: green precisa estar >= blue em pelo menos 3/4 métricas.

# Step 4: switch atomic via alias
client.update_collection_aliases(
    change_aliases_operations=[
        {"delete_alias": {"alias_name": "docs"}},
        {"create_alias": {"collection_name": "docs_v2_green", "alias_name": "docs"}},
    ]
)
# A partir daqui, todas as queries para "docs" atingem v2.

# Step 5: manter blue por N dias para rollback
# Se algo der errado: reverter o alias é uma chamada API.
# Após N dias estáveis, drop blue: client.delete_collection("docs_v1_blue")`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Este padrão é aplicável a qualquer mudança não-trivial: troca de modelo, troca de chunking, mudança de schema,
          re-fine-tune do encoder. Zero downtime, rollback em 1 chamada API, validação rigorosa antes do switch.
        </Callout>
      </Section>

      <Section title="Custo real: embedding 1B documentos" accent={accent}>
        <CodeBlock lang="text">{`Cenário: 1B documentos, doc médio 200 tokens
=============================================

OPÇÃO A: Voyage AI v3 ($0.12 / 1M tokens)
  Total tokens: 1B × 200 = 200B
  Custo: 200,000 × $0.12 = $24,000
  Tempo: paralelo de chamadas API, ~1-2 dias com 100 workers concorrentes

OPÇÃO B: Cohere embed v3 ($0.10 / 1M tokens)
  Total tokens: 200B
  Custo: $20,000
  Tempo: similar a Voyage

OPÇÃO C: OpenAI text-embedding-3-large ($0.13 / 1M tokens)
  Custo: $26,000

OPÇÃO D: Self-hosted BGE-M3 em GPU AWS g5.xlarge ($1.006/h)
  Throughput BGE-M3 fp16 batch 32: ~500 docs/s
  Tempo: 1B / 500 = 2M segundos = 23 dias single-GPU
  Custo: 23 × 24 × $1.006 = $555
  COM 10 GPUs em paralelo (autoscale): 2.3 dias, ~$555 total

OPÇÃO E: Self-hosted BGE-M3 em A100 (g5 não é o ideal)
  Throughput: ~2000 docs/s em A100 (4× mais)
  10× A100 em paralelo: 1B em ~14 horas
  Custo (Lambda Labs A100 $1.10/h): 14 × 10 × $1.10 = $154

CONCLUSÃO:
- < 100M docs: API é simples e custo aceitável
- 100M - 1B: avaliar caso a caso (DX vs custo)
- > 1B: self-hosted GPU vence por ~100x em custo`}</CodeBlock>
      </Section>

      <Section title="Hot/cold tier strategy" accent={accent}>
        <p>
          Em corpora com distribuição temporal (notícias, logs, tickets), 95% das queries atingem 5% dos docs (mais
          recentes). Não faz sentido manter tudo em SSD/RAM.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Hot tier', v: 'Últimos 30-90 dias. NVMe + RAM. ANN HNSW. Latência sub-50ms.' },
            { k: 'Warm tier', v: '90 dias - 2 anos. SSD. Indexado, mas com cache menor.' },
            { k: 'Cold tier', v: '> 2 anos. Object storage (S3) + lazy load. Latência segundos quando atingido.' },
            { k: 'Routing', v: 'Query primeiro hot; se < K resultados, expande para warm; cold só sob demanda explícita' },
            { k: 'Economia', v: 'Reduz custo de RAM/SSD em 5-10× para corpora de bilhões' },
          ]}
        />
      </Section>

      <Section title="Observabilidade essencial" accent={accent}>
        <CodeBlock lang="text">{`Métricas que TODO pipeline de semantic search deve emitir:

INGESTION
  ingest_lag_seconds         (T_doc_chegou_at_index - T_doc_criado_no_source)
  embedding_queue_depth      (backlog do worker pool)
  embedding_throughput_dps   (docs/segundo embarcados)
  embedding_error_rate       (% de docs que falharam)

INDEX
  index_size_bytes           (por shard)
  index_doc_count
  index_segments_count       (Lucene: alerta se > 100 por shard)
  hnsw_recall_proxy          (recall vs força bruta em sample)

QUERY
  query_latency_p50/p95/p99  (separar BM25 / dense / rerank / total)
  query_qps
  query_error_rate
  cache_hit_rate
  golden_set_ndcg_at_10      (rolling, calculado por CI)
  golden_set_mrr             (rolling)

ALERTAS CRÍTICOS
  ingest_lag > 5min          → page (freshness SLA quebrado)
  golden_set_ndcg drop > 10%  → page (regressão de qualidade)
  query_latency_p99 > 500ms  → page (UX comprometida)`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar vector search" accent={accent}>
        <DecisionBox
          scenario="Busca em produção"
          winner="Hybrid (BM25 + vector + rerank)"
          winnerColor={accent}
          why="Vector sozinho falha em out-of-vocabulary; BM25 sozinho falha em paráfrase; Hybrid + rerank é estado da arte sem trade-offs"
          alternatives={[
            { name: 'Só BM25: ok para busca em logs, código fonte, dados estruturados onde queries são literais' }, { name: 'Sem busca, só filtros: às vezes basta filtrar por metadados (tag, data, autor)' }, { name: 'Vector puro: ok para corpora puramente conversacionais, mas raramente competitivo' }
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="Quanto tempo leva um reindex em produção?"
          a="Depende do tamanho do corpus e GPUs disponíveis. 100M docs em 1 GPU A100: ~20-30 horas. 1B em 10× A100: ~14 horas. Sempre paralelizar embeddings em workers, não fazer single-thread."
        />
        <QAItem
          q="Vector DB ou Postgres pgvector?"
          a="pgvector ok para até dezenas de milhões de vetores e quando você já tem Postgres. Acima disso, vector DBs dedicados (Qdrant, Weaviate) ganham em throughput, features (named vectors, payload filtering, multi-tenant) e ops."
        />
        <QAItem
          q="Como sei se meu chunking está bom?"
          a="Métrica indireta: NDCG@10 no golden set. Métrica qualitativa: amostrar 20 queries, ver se os chunks retornados fazem sentido como standalone. Chunks que perdem contexto são red flag."
        />
        <QAItem
          q="Reranker antes ou depois do hybrid?"
          a="Depois. Pipeline: hybrid retrieval (top-100 cada, RRF top-50) → reranker (top-50 → top-10). Rerankear antes do hybrid não faz sentido — você quer aumentar recall primeiro, refinar depois."
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          Produção em semantic search exige pipeline robusto: stream + batch híbrido, chunking validado, sharding
          estratégico, blue-green para mudanças não-triviais, hot/cold tiers para corpora temporais, observabilidade
          que detecta regressões antes do user reclamar.
        </Callout>
        <Callout tone="info" icon="💡">
          Próximo: comparativo dos principais vector DBs — Qdrant, Weaviate, Pinecone, pgvector, LanceDB — e quando
          escolher cada um.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
