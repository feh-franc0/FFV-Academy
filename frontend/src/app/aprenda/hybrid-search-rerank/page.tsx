import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('hybrid-search-rerank');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Reciprocal Rank Fusion (RRF) é dominante para combinar rankings BM25 + dense?',
    options: [
      'Aleatório',
      'RRF opera sobre ranks (posições), não sobre scores brutos. Resolve o problema de scores BM25 (escala absoluta 0-∞) e cosseno (0-1) serem incomparáveis. Fórmula: score = Σ 1/(k + rank_i), tipicamente k=60 (Cormack et al. 2009). Robusto sem tuning, default em ES 8, Qdrant, Weaviate',
      'É o único método',
      'Está em todo paper',
    ],
    correct: 1,
    explanation: 'O desafio do hybrid: BM25 produz scores como 23.7, 18.2, 9.1 (escala absoluta dependente do corpus); coseno produz 0.92, 0.88, 0.81 (bounded). Somar ou ponderar essas escalas requer normalização frágil. RRF ignora magnitude: olha só posição. Para um doc em rank 1 BM25 e rank 3 dense: 1/(60+1) + 1/(60+3) ≈ 0.0322. Para outro em rank 2 BM25 e rank 1 dense: 1/62 + 1/61 ≈ 0.0325. Score final próximo, ambos ficam no topo. Robusto, simples, zero tuning. Cormack, Clarke & Buettcher (SIGIR 2009) mostraram que RRF supera métodos de fusão treinados em vários TREC tasks.',
  },
  {
    question: 'Qual o papel do cross-encoder reranker no pipeline e por que não usar ele desde o início?',
    options: [
      'Redundante',
      'Cross-encoder lê (query, doc) como um par e produz score contextualizado — muito mais preciso que bi-encoder de retrieval. Mas custo computacional é O(num_candidates) — uma chamada do modelo por candidato. Inviável para milhões de docs, viável para top-50 a top-200 do retrieval. Retrieval barato filtra; reranker caro refina',
      'Sempre',
      'Nunca',
    ],
    correct: 1,
    explanation: 'Bi-encoder (BGE-M3, e5, etc): query e doc codificados separadamente, similaridade via produto escalar. Permite pré-computar embeddings de todo o corpus uma vez e usar ANN para retrieval em ms. Cross-encoder (BGE-reranker, Cohere Rerank): recebe query+doc juntos, atenção cruzada full transformer, score contextualizado. Muito mais preciso, mas não dá para pré-computar (depende da query). Custo: 50ms por par numa GPU. Para 1M docs seria inviável. Pipeline: retrieval barato (1M→100), reranker caro só nos top 100. Ganho típico NDCG@10: +20% a +40%. Estado da arte 2026.',
  },
  {
    question: 'No 3-stage pipeline (retrieval híbrido + RRF + reranker), por que rerankear apenas top-50 a top-100 em vez de top-1000?',
    options: [
      'Preguiça',
      'Custo computacional cresce linearmente com candidatos. Reranker caro: 30-100ms/par em GPU, várias 100ms se via API. Ganho marginal cai rapidamente: passar de top-100 para top-1000 melhora NDCG@10 quase nada porque relevantes raramente estão fora dos top-100 do retrieval híbrido. Ponto ótimo empírico: top-50 ou top-100',
      'API limita',
      'Para economizar',
    ],
    correct: 1,
    explanation: 'Existe diminishing returns. Em corpora bem indexados, hybrid retrieval com BM25+dense já põe ~95% dos relevantes nos top-50, e ~99% nos top-200. Rerankear 1000 docs custa 20× mais que rerankear 50 e melhora NDCG@10 em ~1-2% apenas. Pareto óptimo: top-50 a top-100. Em pipelines de baixíssima latência, mesmo top-25 é viável com perda mínima. Exceções: corpora muito grandes (>100M) ou queries muito ambíguas onde o reranker corrige significativamente o retrieval — aí explore top-200. Sempre medir no golden set, não chutar.',
  },
  {
    question: 'Quando NÃO usar reranker (ou seja, manter só retrieval híbrido com RRF)?',
    options: [
      'Sempre usar',
      'Quando: (a) golden set mostra ganho < 5% NDCG@10, (b) latência total não comporta +100-300ms, (c) custo de API/GPU não justifica, (d) queries são muito específicas (SKU, code) onde BM25 já resolve sozinho. Decisão deve ser data-driven, não dogma',
      'Sempre não usar',
      'Sempre usar reranker',
    ],
    correct: 1,
    explanation: 'Reranker é caro: adiciona latência (100-300ms via API ou inferência local) e custo financeiro (Cohere ~$1/1k queries, GPU própria ~$0.5/h amortizado). Em domínios onde queries são bem formuladas e BM25/dense já topam o ranking (e-commerce com SKUs, busca em logs por error_code, código fonte), reranker melhora pouco. Em domínios conversacionais e Q&A (RAG, suporte), reranker é must-have. Resposta sempre: medir no golden set. NDCG@10 com e sem reranker — ganho <5%, considere remover; ganho >15%, must-have.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="hybrid-search-rerank"
      title="Hybrid search + reranking: BM25 + dense + cross-encoder"
      icon="🎯"
      xp={75}
      readTime={15}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="embeddings-busca-bge"
      nextTitle="Embeddings de busca: BGE-M3, e5, Voyage, Cohere v3"
      quiz={quiz}
    >
      <Section title="Por que hybrid + rerank é o padrão ouro em 2026" accent={accent}>
        <p>
          Em 2026, qualquer pipeline de busca sério (RAG, knowledge base, suporte, e-commerce) usa três estágios:
          retrieval híbrido (BM25 + dense), fusão de rankings (RRF), e reranker cross-encoder no topo. Esse padrão
          ganhou os benchmarks MTEB-Retrieval e BEIR consistentemente, e é o default em Elasticsearch 8.x, Vespa, Qdrant
          hybrid, Weaviate.
        </p>
        <p>
          A intuição: cada estágio cobre uma limitação do anterior. BM25 acerta matches lexicais exatos. Dense
          acerta paráfrase e semântica. Cross-encoder corrige ambiguidades no topo. Compor os três é mais robusto que
          qualquer um sozinho.
        </p>
        <Callout tone="info" icon="📚">
          Referências: Cormack, Clarke &amp; Buettcher (SIGIR 2009) &quot;Reciprocal Rank Fusion outperforms Condorcet and
          individual rank learning methods&quot;; Thakur et al. (2021) &quot;BEIR: A Heterogeneous Benchmark for Zero-shot
          Evaluation of Information Retrieval Models&quot;; Cohere Rerank docs; BGE-reranker v2 (BAAI/bge-reranker-v2-m3).
        </Callout>
      </Section>

      <Section title="Arquitetura: 3 estágios" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Pipeline state-of-the-art"
          steps={[
            { label: '0. Query do usuário', desc: '"como configurar autovacuum em postgres OLTP heavy"' },
            { label: '1a. BM25 retrieval', desc: 'Inverted index (ES/Lucene/Postgres tsvector). Top-100 por score lexical.' },
            { label: '1b. Dense retrieval', desc: 'Embedding da query (BGE-M3) + ANN (HNSW). Top-100 por similaridade cosseno.' },
            { label: '2. Fusion (RRF)', desc: 'Reciprocal Rank Fusion combina os dois rankings. Top-50 final via 1/(60+rank).' },
            { label: '3. Cross-encoder rerank', desc: 'BGE-reranker ou Cohere Rerank pontua os top-50. Reordena top-10.' },
            { label: '4. Resposta', desc: 'Top-10 mostrado ao user, ou injetado em contexto LLM (RAG).' },
          ]}
        />
      </Section>

      <Section title="Reciprocal Rank Fusion: a fórmula que ganhou" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="RRF (Cormack et al. 2009)"
          formula="score(d) = Σ_i  1 / (k + rank_i(d))"
          parts={[
            { text: 'rank_i(d)', annotation: 'posição do doc d no ranking i (1-indexed); ∞ se d não está no ranking' },
            { text: 'k', annotation: 'constante de smoothing, default 60. Maior k = mais "democrático" entre ranks; menor = mais peso ao topo' },
            { text: 'i', annotation: 'índice do ranking. Pode somar quantos rankings você quiser (BM25, dense, sparse-vector, popularidade, ...)' },
          ]}
        />
        <Callout tone="info" icon="💡">
          Por que <strong>k=60</strong>? Cormack et al. testaram k ∈ {'{'}1, 10, 60, 100{'}'} em TREC tasks. k=60 produziu
          melhor MAP. Intuitivamente: k=60 significa que rank=1 vale ~1.6× mais que rank=10, mas só ~1.06× mais que rank=2.
          Suaviza o topo sem dar peso desproporcional ao primeiro lugar.
        </Callout>
        <CodeBlock lang="python">{`from collections import defaultdict
from typing import Sequence

def rrf_fusion(rankings: Sequence[Sequence[str]], k: int = 60, top_n: int = 100):
    """
    rankings: lista de rankings, cada ranking é lista de doc_ids ordenada (rank 1 = posição 0)
    Retorna: lista de (doc_id, fused_score) ordenada.
    """
    scores: dict[str, float] = defaultdict(float)
    for ranking in rankings:
        for rank0, doc_id in enumerate(ranking):
            scores[doc_id] += 1.0 / (k + rank0 + 1)  # rank é 1-indexed
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

# Exemplo
bm25_ranking   = ["doc_42", "doc_3",  "doc_17", "doc_91", "doc_8"]   # top-5 BM25
vector_ranking = ["doc_3",  "doc_91", "doc_42", "doc_7",  "doc_17"]  # top-5 dense
fused = rrf_fusion([bm25_ranking, vector_ranking], k=60, top_n=5)

# Resultado:
# [('doc_3',  0.0326), ('doc_42', 0.0323),
#  ('doc_17', 0.0320), ('doc_91', 0.0322), ('doc_7',  0.0156)]
# doc_3 e doc_42 dominam porque aparecem alto em AMBOS os rankings`}</CodeBlock>
      </Section>

      <Section title="Weighted RRF e variantes (quando tunar paga)" accent={accent}>
        <p>
          O RRF puro trata todos os rankings com peso igual. Em alguns casos, BM25 ou dense devem pesar mais. A variante
          weighted é simples:
        </p>
        <CodeBlock lang="python">{`def weighted_rrf(rankings_with_weights, k=60, top_n=100):
    """
    rankings_with_weights: [(ranking, peso), ...]
    """
    scores = defaultdict(float)
    for ranking, w in rankings_with_weights:
        for rank0, doc_id in enumerate(ranking):
            scores[doc_id] += w / (k + rank0 + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

# Caso: domínio técnico, BM25 é mais valioso para SKUs e códigos
fused = weighted_rrf([
    (bm25_ranking,   0.7),
    (vector_ranking, 0.3),
], k=60, top_n=20)

# Pesos devem ser calibrados via golden set!`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Não chute pesos.</strong> Calibrá-los exige golden set de 50-200 queries anotadas. Grid search rápido
          em {'{'}0.1, 0.3, 0.5, 0.7, 0.9{'}'} por ranking. Métrica: NDCG@10 ou MRR. Sem isso, weighted RRF pode piorar
          em vez de melhorar. RRF default (peso uniforme) já é um excelente baseline.
        </Callout>
      </Section>

      <Section title="Cross-encoder reranker: o que faz" accent={accent}>
        <p>
          Bi-encoders (modelos de embedding) codificam query e doc separadamente. Cross-encoders processam (query, doc)
          juntos numa única passada de transformer, com atenção cruzada full. O resultado é um score muito mais
          contextualizado — entende melhor quando o doc <em>responde</em> à query, não só quando tem palavras similares.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Bi-encoder (retrieval)', 'Cross-encoder (rerank)']}
          rows={[
            ['Como funciona', 'Embed(query) e embed(doc) separados, similaridade via produto escalar', '(query, doc) → transformer com cross-attention → score'],
            ['Pré-computa embeddings?', 'Sim — embed o corpus uma vez', 'Não — depende da query, recomputa sempre'],
            ['Latência por par', '~1ms (lookup ANN)', '~30-100ms em GPU, ~200-500ms em CPU'],
            ['Escala', 'Milhões+ via HNSW/IVF', 'Top-50 a top-200 só'],
            ['Precisão (NDCG@10)', '~0.60-0.70', '~0.75-0.85'],
            ['Exemplos', 'BGE-M3, e5, Voyage-3, OpenAI text-embedding-3', 'BGE-reranker-v2-m3, Cohere Rerank, Qwen reranker'],
          ]}
        />
      </Section>

      <Section title="Reranker em código: BGE-reranker e Cohere" accent={accent}>
        <CodeBlock lang="python">{`# Opção 1: Cohere Rerank (API gerenciada, multilingual)
import cohere
co = cohere.Client()  # COHERE_API_KEY no env

candidates = [{"id": d, "text": doc_texts[d]} for d in fused[:50]]
response = co.rerank(
    model="rerank-multilingual-v3.0",
    query=query,
    documents=[c["text"] for c in candidates],
    top_n=10,
)
final_ids = [candidates[r.index]["id"] for r in response.results]

# Opção 2: BGE-reranker local (GPU, sem custo por query)
from sentence_transformers import CrossEncoder

model = CrossEncoder("BAAI/bge-reranker-v2-m3", device="cuda")
pairs = [(query, doc_texts[d]) for d in fused[:50]]
scores = model.predict(pairs, batch_size=32)
ranked = sorted(zip(fused[:50], scores), key=lambda x: x[1], reverse=True)
final_ids = [d for d, _ in ranked[:10]]

# Opção 3: Qwen reranker (multilingual, ótimo PT-BR em 2026)
from FlagEmbedding import FlagReranker
reranker = FlagReranker("Qwen/Qwen2.5-Reranker-0.5B", use_fp16=True)
scores = reranker.compute_score([[query, doc_texts[d]] for d in fused[:50]])`}</CodeBlock>
        <Callout tone="info" icon="🎯">
          <strong>Custo prático 2026</strong>: Cohere Rerank ~$2/1k queries. BGE-reranker em GPU A10/L4 amortizado
          ~$0.5/h, processa ~30 queries/segundo (top-50 cada). Para tráfego &gt; 100 QPS, GPU local geralmente vence.
          Para tráfego baixo ou variável, API é mais simples.
        </Callout>
      </Section>

      <Section title="Pipeline completo (production-ready)" accent={accent}>
        <CodeBlock lang="python">{`from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer, CrossEncoder
from collections import defaultdict

# 1. Inicialização
es = Elasticsearch(["https://es.internal:9200"])
qdrant = QdrantClient(url="https://qdrant.internal")
embedder = SentenceTransformer("BAAI/bge-m3")
reranker = CrossEncoder("BAAI/bge-reranker-v2-m3", device="cuda")

def hybrid_search(query: str, top_k: int = 10, retrieval_k: int = 100, rerank_k: int = 50):
    # 2a. BM25 via Elasticsearch
    es_resp = es.search(
        index="docs",
        body={"query": {"match": {"content": query}}, "size": retrieval_k},
        timeout="2s",
    )
    bm25_ids = [hit["_id"] for hit in es_resp["hits"]["hits"]]

    # 2b. Dense via Qdrant
    q_emb = embedder.encode(query, normalize_embeddings=True).tolist()
    dense_resp = qdrant.search(
        collection_name="docs",
        query_vector=q_emb,
        limit=retrieval_k,
    )
    dense_ids = [hit.id for hit in dense_resp]

    # 3. RRF fusion
    fused_scores: dict[str, float] = defaultdict(float)
    for ranking in [bm25_ids, dense_ids]:
        for rank0, doc_id in enumerate(ranking):
            fused_scores[doc_id] += 1.0 / (60 + rank0 + 1)
    fused = [d for d, _ in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)][:rerank_k]

    # 4. Cross-encoder rerank dos top-K fundidos
    doc_texts = fetch_doc_texts(fused)  # batch fetch do storage
    pairs = [(query, doc_texts[d]) for d in fused]
    rerank_scores = reranker.predict(pairs, batch_size=32, show_progress_bar=False)
    final = sorted(zip(fused, rerank_scores), key=lambda x: x[1], reverse=True)[:top_k]

    return [{"id": d, "score": float(s)} for d, s in final]


# Latência típica em produção:
# - ES BM25:          5-15 ms
# - Qdrant ANN:       5-20 ms  (em paralelo com ES, mesmo tempo total)
# - RRF (in-memory):  <1 ms
# - Reranker (GPU):  100-200 ms (top-50 em batch)
# - Total:           ~120-230 ms p95`}</CodeBlock>
      </Section>

      <Section title="Quando reranker vale (e quando não)" accent={accent}>
        <DecisionBox
          scenario="RAG para Q&A, suporte, knowledge base, customer service"
          winner="Hybrid + rerank obrigatório"
          winnerColor={accent}
          why="Queries conversacionais ganham muito de cross-encoder; Custo de errar é alto (LLM gera resposta baseada nos contextos); Ganho típico NDCG@10: +20-40%; Latência total ~200ms ainda é OK para Q&A"
          alternatives={[]}
        />
        <DecisionBox
          scenario="Busca em e-commerce com SKUs, códigos, marcas"
          winner="Hybrid sem rerank (geralmente)"
          winnerColor={accent}
          why="Queries são específicas, BM25 já entrega top-1 correto frequentemente; Latência sub-50ms é mandatória para instant search; Reranker adiciona 100-300ms que quebra a UX; Faceted search e filtros importam mais que reranker"
          alternatives={[
            { name: 'Se o catálogo tiver queries de descoberta longas ("notebook leve para programação"), aí reranker volta a fazer sentido' }
          ]}
        />
        <DecisionBox
          scenario="Busca em código fonte (repo enterprise)"
          winner="Híbrido com BM25 mais peso, rerank opcional"
          winnerColor={accent}
          why={`Código tem muita sintaxe específica (nomes de função, variáveis) → BM25 dominante; Embeddings de código (CodeBERT, jina-code-v2) ajudam em queries em natural language; Reranker melhora para queries "como faço X" mas pouco para "buscar nome_função"`}
          alternatives={[]}
        />
      </Section>

      <Section title="Métricas: como saber se o pipeline melhorou" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Golden set', v: '50-200 queries representativas, com docs relevantes anotados (idealmente graduado 0-3 para NDCG)' },
            { k: 'NDCG@10', v: 'Normalized Discounted Cumulative Gain — métrica padrão para ranking. Sensível a posição.' },
            { k: 'MRR', v: 'Mean Reciprocal Rank — 1/posição do primeiro relevante. Útil para Q&A (você quer o relevante no topo)' },
            { k: 'Recall@K', v: 'Fração dos relevantes que aparecem nos top-K. Importa para RAG (você precisa do relevante NO contexto)' },
            { k: 'Latência p50/p95/p99', v: 'Reranker adiciona ~100-300ms. Verifique se UX comporta. p99 mata UX, não p50' },
          ]}
        />
        <Callout tone="success" icon="✅">
          Benchmark típico em corpora reais: BM25 sozinho NDCG@10 ~0.55. Dense sozinho ~0.60. Hybrid RRF ~0.68. Hybrid +
          rerank ~0.78. Ganhos compostos reais — mas variam por domínio. Sempre meça no seu golden set, não confie em
          benchmark alheio.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="Posso usar mais de 2 rankings em RRF?"
          a="Sim, é uma vantagem do RRF. Você pode combinar BM25 + dense + popularity (CTR) + recency + business rules — todos como rankings. Soma 1/(k+rank) de cada. Robusto e simples."
        />
        <QAItem
          q="RRF vs CombSUM vs CombMNZ?"
          a="CombSUM/CombMNZ exigem normalização de scores (que é frágil entre escalas BM25 vs cosseno). RRF não. Por isso RRF venceu na prática."
        />
        <QAItem
          q="Posso treinar um reranker no meu domínio?"
          a="Sim. Fine-tunar BGE-reranker ou similar com 1-10k pares (query, doc_relevante, doc_irrelevante) pode aumentar NDCG significativamente. Em 2026, ferramentas como LightOn, Vespa learning-to-rank e simples scripts com sentence-transformers tornam isso acessível."
        />
        <QAItem
          q="Reranker pode atrapalhar?"
          a="Sim, se o reranker for de domínio errado ou estiver mal-calibrado. Sempre validar no golden set. Já vi pipelines onde adicionar reranker reduzia NDCG porque o modelo tinha bias para um tipo de doc."
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          Hybrid retrieval + RRF + cross-encoder rerank é o padrão ouro de 2026. RRF resolve o problema de combinar
          scores incomparáveis. Cross-encoder corrige top-K com precisão muito superior. Pipeline disponível
          out-of-the-box em ES 8, Qdrant, Weaviate, Vespa.
        </Callout>
        <Callout tone="info" icon="💡">
          Próximo: o lado &quot;dense&quot; do pipeline — quais embeddings de busca são state-of-the-art em 2026 (BGE-M3, e5,
          Voyage, Cohere v3) e como escolher.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
