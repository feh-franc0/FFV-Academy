import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-search-multimodal');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que dataset de 100k+ items é patamar mínimo pro capstone?',
    options: [
      'Vaidade',
      'Volumes menores (< 10k) não estressam o pipeline — BM25 "achar qualquer coisa" já resolve, latência nunca é problema, diff entre estratégias fica indistinguível. 100k+ força engineering real: indexação eficiente, paginação, aggregations com performance, diferenças mensuráveis entre BM25/vector/hybrid',
      'Pela estética',
      'Não há motivo',
    ],
    correct: 1,
    explanation: 'Dataset toy esconde todos os problemas reais: qualquer busca retorna tudo, qualquer latência é OK, nenhuma otimização importa. 100k+ expõe: cold cache, cost de embedding em batch, HNSW vs IVFFlat trade-offs, aggregations caras, reranker custo por query. É o volume onde decisões de engenharia fazem diferença mensurável — exatamente o que recruiter quer ver. Datasets públicos tipo MS MARCO, Amazon ESCI, BEIR são excelentes pontos de partida.',
  },
  {
    question: 'Qual o entregável que transforma capstone de exercício pessoal em peça de portfólio?',
    options: [
      'Só o código',
      'Write-up estruturado com: decisions + trade-offs, benchmark comparativo (BM25 sozinho vs vector sozinho vs hybrid vs hybrid+reranker) em gráficos, análise de custo (latência, $ por query, infra), limitações honestas, próximos passos. Link pra repo + demo deployed + dashboard',
      'Vídeo de 10s',
      'Tweet',
    ],
    correct: 1,
    explanation: 'Senior/staff não é avaliado por código funcionando — é por pensamento. Write-up de 2-5 páginas no formato de paper/blog demonstra: problema bem definido, metodologia rigorosa, resultados apresentados honestamente (incluindo casos em que método não ganhou), decisões justificadas por métricas, limitations reconhecidas. Esse texto é o que recruiter sênior vai ler primeiro. Código sem narrativa é só código; narrativa + código + deploy é portfólio maduro.',
  },
  {
    question: 'Qual métrica SLO combinada representa busca "de produção" realista?',
    options: [
      'NDCG@10 > 0.9 garantido',
      'NDCG@10 > 0.75 com p95 de latência < 200ms e custo < $X por 1k queries. Três dimensões: qualidade, velocidade, custo. Maximizar uma às custas das outras não é engenharia — é demo. Produção vive no trade-off, e artigos bons deixam isso explícito',
      'Latência < 10ms sempre',
      'Sem SLO',
    ],
    correct: 1,
    explanation: 'Busca em produção tem três eixos irredutíveis: qualidade (NDCG), latência (p95/p99), custo ($/query ou $/month). Ignorar qualquer um é ingenuidade. NDCG > 0.90 é possível com reranker caríssimo em GPU dedicada — inviável economicamente. Latência < 10ms sem reranker perde qualidade. Capstone que apresenta os 3 números juntos e discute trade-offs mostra entendimento de produção real. Alvo pragmático: NDCG@10 ~0.75+, p95 ~200ms, custo razoável pra escala do negócio.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-search-multimodal"
      title="Capstone: search multimodal (texto + filtros + vetor)"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa sistema de busca completo sobre catálogo de e-commerce (ou domínio escolhido) com 100k+ itens. Combine BM25 + vector search + filtros estruturados (preço, categoria, atributos) + aggregations de facets + reranking opcional. Meta: NDCG@10 &gt; 0.75, p95 &lt; 200ms, demo deployed.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone Search — Checklist

## 1. Dataset
- [ ] 100k+ items (real ou sintético com qualidade)
- [ ] Fields: title, description, price, category, brand, rating, tags
- [ ] Public datasets recomendados:
  - Amazon ESCI (Shopping Queries Dataset)
  - MS MARCO v2 (passagens)
  - BEIR (benchmarks IR)
- [ ] Embeddings pre-computados para vector search

## 2. Golden set
- [ ] 50–100 queries anotadas
- [ ] Diversidade: short, long-tail, paráfrase, typos
- [ ] Relevância graduada 0-3
- [ ] Cohen's kappa >= 0.6 entre 2 anotadores

## 3. Backend search
- [ ] BM25 index (Postgres tsvector OU Elasticsearch/OpenSearch)
- [ ] Vector index (pgvector HNSW OU Qdrant/Weaviate)
- [ ] RRF fusion implementado
- [ ] Filtros estruturados (price range, category, brand)
- [ ] Facet aggregations (counts por categoria)
- [ ] (Opcional) Reranker Cohere/BGE no top-50

## 4. API + frontend
- [ ] API REST/GraphQL com parâmetros query+filters+facets
- [ ] Frontend mínimo: search bar, facet sidebar, results
- [ ] Deploy público (Railway, Fly.io, Vercel)

## 5. Eval + write-up
- [ ] Benchmark comparativo BM25 / vector / hybrid / +rerank
- [ ] Tabela NDCG@10, recall@10, p50/p95 latência, custo estimado
- [ ] Gráficos (matplotlib ou Plotly)
- [ ] Blog post/README com metodologia, resultados, limitações
- [ ] Link pra repo + demo live + dashboard de métricas`}</CodeBlock>
      </Section>

      <Section title="Arquitetura de referência" accent={accent}>
        <CodeBlock lang="python">{`# search_service.py — arquitetura sugerida
from dataclasses import dataclass

@dataclass
class SearchRequest:
    query: str
    filters: dict          # {price_min, price_max, category, brand}
    limit: int = 20
    use_vector: bool = True
    use_rerank: bool = False

class SearchService:
    def __init__(self, bm25, vector, reranker=None):
        self.bm25 = bm25
        self.vector = vector
        self.reranker = reranker

    def search(self, req: SearchRequest):
        # 1. Retrieval em paralelo
        bm25_hits = self.bm25.search(req.query, req.filters, top=100)
        vec_hits  = self.vector.search(req.query, req.filters, top=100) \\
                    if req.use_vector else []

        # 2. Fusion via RRF
        fused = rrf_fusion(
            [bm25_hits, vec_hits] if vec_hits else [bm25_hits],
            k=60, top_n=50
        )

        # 3. Rerank opcional
        if req.use_rerank and self.reranker:
            fused = self.reranker.rerank(req.query, fused, top_n=req.limit)
        else:
            fused = fused[:req.limit]

        # 4. Aggregations de facets (separado)
        facets = self.bm25.facets(req.query, req.filters)

        return {"results": fused, "facets": facets}`}</CodeBlock>
      </Section>

      <Section title="Benchmark template" accent={accent}>
        <CodeBlock lang="python">{`# eval.py — rode no golden set antes de cada release
import time, statistics

def evaluate(service, golden_set):
    metrics = {"ndcg10": [], "recall10": [], "latency_ms": []}

    for q in golden_set:
        t0 = time.perf_counter()
        results = service.search(SearchRequest(query=q.text))
        metrics["latency_ms"].append((time.perf_counter() - t0) * 1000)
        metrics["ndcg10"].append(ndcg_at_k(results, q.relevance_map, 10))
        metrics["recall10"].append(recall_at_k(results, q.relevant_ids, 10))

    return {
        "ndcg10_mean":  statistics.mean(metrics["ndcg10"]),
        "recall10_mean": statistics.mean(metrics["recall10"]),
        "latency_p50":   statistics.median(metrics["latency_ms"]),
        "latency_p95":   sorted(metrics["latency_ms"])[int(len(golden_set)*0.95)],
    }

# Tabela final do write-up:
# Config                      | NDCG@10 | Recall@10 | p95 ms
# BM25 sozinho                |   0.55  |   0.72    |  35
# Vector sozinho              |   0.62  |   0.81    |  48
# Hybrid BM25+Vec (RRF)       |   0.71  |   0.88    |  55
# Hybrid + Cohere Rerank      |   0.79  |   0.88    | 195`}</CodeBlock>
      </Section>

      <Section title="Write-up é o entregável principal" accent={accent}>
        <Callout tone="info" icon="📝">
          Estrutura recomendada: (1) Problema e dataset, (2) Metodologia, (3) Baseline BM25, (4) Adição de vector search, (5) Fusion com RRF, (6) Reranking opcional, (7) Resultados tabulados com gráficos, (8) Análise de trade-offs (latência vs qualidade vs custo), (9) Limitações e próximos passos, (10) Links (repo, demo, dashboard).
        </Callout>
        <Callout tone="success" icon="🎓">
          Esse capstone entregue com rigor é cartão de visita sério para posições de search/IR/backend senior. Recruiter vê: arquitetura sólida, métricas reais, trade-offs explicitados, código limpo no repo, demo funcionando. Vale mais que 5 projetos toy.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
