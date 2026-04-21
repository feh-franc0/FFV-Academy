import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('hybrid-search-reranking-de-verdade');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Reciprocal Rank Fusion (RRF) é a fórmula dominante pra combinar BM25 + vector?',
    options: [
      'É bonita',
      'RRF trabalha com ranks (posições), não scores — resolve problema de scores BM25 (0-∞) e coseno (0-1) serem incomparáveis. Fórmula simples: 1/(k+rank), tipicamente k=60. Robusta sem tuning, produz ranking sólido em quase todo caso — por isso é default em Elasticsearch, Qdrant, Weaviate',
      'Aleatória',
      'Só funciona em inglês',
    ],
    correct: 1,
    explanation: 'O desafio de hybrid: BM25 produz scores como 23.7, 18.2, 9.1 (escala absoluta). Vector coseno: 0.92, 0.88, 0.81 (bounded). Somar ou ponderar essas escalas é tuning frágil. RRF ignora magnitude: olha só posição. Doc ranked 1 em BM25 e 3 em vector vira 1/61 + 1/63 ≈ 0.032. Robusto, simples, sem tuning — por isso é default em produção. Alternativa weighted fusion exige calibração. k=60 vem de paper Cormack et al, 2009.',
  },
  {
    question: 'Qual o papel do reranker cross-encoder (tipo Cohere Rerank ou BGE) em pipeline de busca?',
    options: [
      'Redundante',
      'Re-pontua top 50-100 resultados do retrieval com modelo mais caro porém preciso (cross-encoder lê query + doc juntos, não só similarity de embeddings pré-calculados). Retrieval barato filtra universo; reranker caro refina os finalistas. Ganho de NDCG típico +20-40%',
      'Só em inglês',
      'Obrigatório sempre',
    ],
    correct: 1,
    explanation: 'Embeddings são bi-encoders: query e doc são codificados separadamente, similaridade via produto escalar. Rápido (pode pré-calcular tudo), mas representa query e doc independentemente. Cross-encoder recebe ambos e produz score contextualizado — caro (não dá pra pré-computar com todo corpus), mas muito mais preciso. Pipeline: retrieval vai 1M→50 (barato), reranker vai 50→10 (caro mas só 50 chamadas). Cohere Rerank e BGE-reranker são APIs/modelos state-of-the-art em 2026.',
  },
  {
    question: 'Como saber se reranking "vale a pena" no seu caso?',
    options: [
      'Sempre vale',
      'Medir no golden set: compare NDCG@10 antes e depois do reranker. Se ganho é < 5%, custo extra de latência (+100-300ms) e API ($) pode não compensar. Se ganho > 15%, reranker é must-have. Meça antes de adotar',
      'Sempre vale',
      'Nunca vale',
    ],
    correct: 1,
    explanation: 'Reranker adiciona latência (call API ou inferência local) e custo. Impacto varia enormemente por domínio: queries técnicas com termos exatos ganham pouco (BM25 já resolve); queries conversacionais/paráfrase ganham muito. Golden set com 100 queries anotadas responde objetivamente: rode pipeline com e sem reranker, compare NDCG@10 e MRR. Decisão data-driven. Também considere reranker local (BGE-reranker em GPU própria) vs API (Cohere) — trade-off custo x ops.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="hybrid-search-reranking-de-verdade"
      title="Hybrid search + reranking: RRF e cross-encoder"
      icon="🎯"
      xp={55}
      readTime={13}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="capstone-search-multimodal"
      nextTitle="Capstone: search multimodal (texto + filtros + vetor)"
      quiz={quiz}
    >
      <Section title="BM25 e vector têm forças complementares" accent={accent}>
        <p>
          BM25 domina em matches lexicais exatos — nomes próprios, códigos SKU, termos técnicos raros, acrônimos. Falha em paráfrase. Vector search domina em semântica — captura sinônimos, intent, idiomas diferentes. Falha em termos fora da distribuição do modelo de embedding (jargão novo, nomes únicos). Hybrid search combina os dois estágios e bate ambos sozinhos.
        </p>
      </Section>

      <Section title="Arquitetura típica em 3 estágios" accent={accent}>
        <CodeBlock lang="python">{`# ┌────────────────────────────────────────┐
# │ Query: "como ajustar memoria do heap"  │
# └────────────────────────────────────────┘
#         │
#  ┌──────┴──────┐  paralelo
#  ▼             ▼
# BM25         Vector Search
# top-100      top-100
#  │             │
#  └──────┬──────┘
#         ▼
#   RRF Fusion
#   (merge top-100 de cada)
#         │
#         ▼
#  Reranker cross-encoder
#  (top-50 → top-10)
#         │
#         ▼
#   Resultado final`}</CodeBlock>
      </Section>

      <Section title="Reciprocal Rank Fusion em código" accent={accent}>
        <CodeBlock lang="python">{`from collections import defaultdict

def rrf_fusion(rankings: list[list[str]], k: int = 60, top_n: int = 100) -> list[tuple[str, float]]:
    """
    rankings: lista de rankings, cada ranking é lista de doc_ids ordenada
    k: constante RRF (60 é default do paper Cormack 2009)
    top_n: quantos resultados finais devolver
    """
    scores = defaultdict(float)
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] += 1 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

# Uso
bm25_ranking   = bm25_search(query, top=100)
vector_ranking = vector_search(query_emb, top=100)
fused = rrf_fusion([bm25_ranking, vector_ranking], k=60, top_n=50)

# Observações:
# - RRF ignora magnitude dos scores originais
# - Robusto em qualquer escala
# - Pode receber N rankings (ex: + reranker pré-fusion)
# - k=60 funciona bem; tuning marginal via golden set`}</CodeBlock>
      </Section>

      <Section title="Reranking com cross-encoder" accent={accent}>
        <CodeBlock lang="python">{`# Opção 1: API gerenciada (Cohere Rerank)
import cohere
co = cohere.Client()

candidates = [d["text"] for d in fused[:50]]  # top-50 pós-fusão
reranked = co.rerank(
    model="rerank-multilingual-v3.0",
    query=query,
    documents=candidates,
    top_n=10,
)
final = [fused[r.index] for r in reranked.results]

# Opção 2: Modelo local (BGE-reranker, Qwen Reranker, etc)
from sentence_transformers import CrossEncoder
model = CrossEncoder("BAAI/bge-reranker-v2-m3")
pairs = [[query, doc["text"]] for doc in fused[:50]]
scores = model.predict(pairs)
final = sorted(zip(fused[:50], scores), key=lambda x: x[1], reverse=True)[:10]

# Custo/latência:
# - Cohere API: ~50-100ms + $$ por 1k calls
# - Local BGE em GPU: ~20-50ms, sem custo por query
# - Trade-off: ops vs custo fixo`}</CodeBlock>
      </Section>

      <Section title="Medir o ganho honestamente" accent={accent}>
        <Callout tone="info" icon="📊">
          Benchmark clássico em corpus real: BM25 sozinho NDCG@10 ~0.55. Vector sozinho ~0.60. Hybrid com RRF ~0.68. Hybrid + reranker ~0.78. Ganhos compostos reais — mas variam por domínio. Meça SEMPRE no seu golden set, não no benchmark de outro.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          Não adicione reranker sem medir impacto. Adiciona latência (100-300ms) e custo. Em queries técnicas bem formuladas (SKU, error code), pode não mudar quase nada — e aí só custa. Decida com dados.
        </Callout>
        <Callout tone="success" icon="✅">
          Stack completa: BM25 (Postgres tsvector ou Elasticsearch) + vector (pgvector ou Qdrant) em paralelo + RRF em memória + reranker opcional no topo. Esse é o state of the art 2026 em busca que não é só hype.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
