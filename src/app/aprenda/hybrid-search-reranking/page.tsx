import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Hybrid Search + Reranking: do BM25 ao cross-encoder — FFV Academy',
  description:
    'Pipeline profissional de retrieval: BM25 + vetor fundidos com RRF, cross-encoder reranking (Cohere, Jina, Voyage), HyDE e query expansion para levar RAG de 60% para 85%+ de precisão.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que hybrid search (BM25 + vector) quase sempre vence cada um isolado?',
    options: [
      'Porque BM25 é mais rápido',
      'Porque BM25 captura match lexical exato (IDs, nomes próprios, siglas, jargão raro) e vetor captura similaridade semântica. Erros de cada um são parcialmente independentes — fundindo os rankings (via RRF) você recupera o que cada abordagem sozinha perderia',
      'Porque vetor é melhor',
      'Porque reduz custo',
    ],
    correct: 1,
    explanation:
      'Vetor falha em "procure pelo SKU AX-7742" porque embeddings quebram em tokens raros. BM25 falha em "como resolvo lentidão no sistema?" porque palavras sinônimas não batem. Juntos, cobrem os dois modos de falha — essa é a única razão pela qual hybrid vira default em produção.',
  },
  {
    question: 'O que é RRF (Reciprocal Rank Fusion) e por que é o padrão para fundir rankings?',
    options: [
      'Um modelo de reranking',
      'Uma fórmula simples — score_rrf(d) = Σ 1/(k + rank_i(d)) — que combina múltiplos rankings sem precisar calibrar escalas de score. Não requer treino, não sofre com escalas heterogêneas (BM25 é 0-N, cosine é 0-1), e empiricamente vence somas ponderadas ingênuas',
      'Um algoritmo de embedding',
      'Um tipo de cache',
    ],
    correct: 1,
    explanation:
      'O problema de fundir BM25 + vetor é que os scores vivem em escalas diferentes. Normalizar é frágil. RRF ignora scores absolutos e usa só o ranking (posição). k=60 é o default empírico. Uma linha de código, resultado robusto — é por isso que virou padrão em Elasticsearch, OpenSearch, Weaviate.',
  },
  {
    question: 'Por que usar cross-encoder no rerank em vez de só pegar top-k do bi-encoder?',
    options: [
      'Porque é mais barato',
      'Porque bi-encoder (embedder) codifica query e doc separadamente — perde interação entre os dois. Cross-encoder processa query+doc juntos no mesmo forward pass, capturando relação fina. Custo é muito maior, então usa-se em cima do top-50/100 do primeiro estágio, reordenando para top-5',
      'Porque roda em GPU',
      'Porque é multilíngue',
    ],
    correct: 1,
    explanation:
      'Bi-encoder dá velocidade (embed offline, busca vetorial rápida). Cross-encoder dá qualidade (compara cada par query-doc com atenção cruzada). Pipeline típico: bi-encoder retrieve top-100 → cross-encoder rerank top-10. Cohere Rerank 3.5, Jina reranker-v2, Voyage rerank-2 são APIs que entregam isso pronto.',
  },
  {
    question: 'Quando HyDE (Hypothetical Document Embeddings) vale a pena?',
    options: [
      'Sempre',
      'Quando queries são curtas, ambíguas ou em formato diferente dos documentos indexados (ex: pergunta curta vs docs longos e formais). LLM gera um "documento hipotético" respondendo a query; você embeda esse doc em vez da query. O embedding resultante fica mais próximo dos docs reais',
      'Só para queries em inglês',
      'Para reduzir custo',
    ],
    correct: 1,
    explanation:
      'HyDE tira o descompasso de estilo entre pergunta ("como reset?") e resposta indexada (parágrafos explicativos). Funciona bem em FAQ, help docs e suporte. Custo: 1 chamada de LLM a mais por query. Quando não vale: bases com queries longas e bem formadas, ou domínio técnico onde o LLM inventa termos errados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="hybrid-search-reranking"
      title="Hybrid Search + Reranking: do BM25 ao cross-encoder"
      icon="🎯"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="rag-evaluation"
      nextTitle="Avaliando RAG: recall@k, nDCG e LLM-as-judge"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Naive RAG (embed + top-k + prompt) bate em ~50-60% de precisão em bases reais. Para chegar nos 85%+ que
        produção exige, o retrieval deixa de ser <strong>uma</strong> busca e vira um <strong>pipeline de três
        estágios</strong>: recuperação por múltiplos métodos, fusão de rankings, e reranking fino. Este módulo mostra
        cada peça, quando ela entra e quanto ela custa.
      </p>

      <Section title="A anatomia de um retrieval de produção" accent={ACCENT}>
        <ArchDiagram title="Pipeline RAG 2025-2026 (three-stage retrieval)" accent={ACCENT}>{`
   Query
     │
     ├────────────┬────────────────┬─────────────┐
     ▼            ▼                ▼             ▼
  BM25       Dense vector     Sparse (SPLADE)   Metadata filter
  (lexical)  (semantic)       (learned sparse)  (date, type, acl)
     │            │                │             │
     └────────────┴────────────────┴─────────────┘
                     │
                     ▼
           ┌──────────────────────┐
           │  Rank fusion (RRF)   │   → top-50/100
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Cross-encoder       │   → top-5/10
           │  rerank (Cohere/Jina)│
           └──────────┬───────────┘
                      │
                      ▼
              Contexto final
              p/ LLM gerar
`}</ArchDiagram>
        <Callout tone="info">
          Três estágios não é overkill — é o que separa "funciona na demo" de "funciona no cliente". Cada estágio tem
          um trade-off claro: recall (BM25+vector), diversidade (MMR/RRF), precisão (rerank).
        </Callout>
      </Section>

      <Section title="BM25: o clássico que se recusa a morrer" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          BM25 (Best Matching 25) é um refinamento de TF-IDF dos anos 90. Pontua documento pela frequência dos termos
          da query, com saturação (mais ocorrências não crescem linear) e normalização por tamanho do doc. Em 2026
          ainda é o sparse baseline contra o qual todos os denses são comparados — e em muitos casos ganha.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Cenário', 'BM25', 'Dense (embedding)']}
          rows={[
            ['Match por sigla/ID/SKU', 'Excelente — casa literalmente', 'Ruim — token raro some no embedding'],
            ['Sinônimos ("carro" vs "automóvel")', 'Falha (lexical)', 'Excelente (semântico)'],
            ['Domínio técnico com jargão raro', 'Forte', 'Depende do treino do embedder'],
            ['Paráfrase ("como faço" vs "processo de")', 'Fraco', 'Forte'],
            ['Custo de indexação', 'Quase zero (Lucene/tantivy)', 'Alto (embed cada chunk)'],
            ['Latência de busca', '<5ms em milhões de docs', '<10ms com HNSW bem tunado'],
            ['Multilíngue', 'OK com stemmer/tokenizer correto', 'Depende do modelo'],
          ]}
        />
        <CodeBlock lang="python">{`# BM25 com PostgreSQL full-text search (ts_rank_cd é BM25-like)
import psycopg

def bm25_search(conn, query: str, k: int = 50) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, chunk, ts_rank_cd(
              to_tsvector('portuguese', chunk),
              plainto_tsquery('portuguese', %s)
            ) AS score
            FROM chunks
            WHERE to_tsvector('portuguese', chunk)
                  @@ plainto_tsquery('portuguese', %s)
            ORDER BY score DESC
            LIMIT %s
        """, (query, query, k))
        return [{"id": r[0], "chunk": r[1], "score": r[2]} for r in cur.fetchall()]

# Para controle maior, use a extensão pg_bm25 (ParadeDB) ou
# um engine dedicado: Elasticsearch, OpenSearch, Tantivy, Meilisearch`}</CodeBlock>
      </Section>

      <Section title="Reciprocal Rank Fusion (RRF): o truque de uma linha" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Depois de ter dois (ou mais) rankings — um do BM25, outro do vetor — você precisa fundir. Normalizar scores
          é frágil: a escala do BM25 muda com o corpus, a do cosine já é limitada [0,1]. RRF resolve ignorando o score
          e usando só a <strong>posição</strong>.
        </p>
        <CodeBlock lang="python">{`# RRF: uma função de 10 linhas que bate esquemas elaborados
from collections import defaultdict

def rrf(rankings: list[list[str]], k: int = 60) -> list[tuple[str, float]]:
    """rankings: lista de listas de doc_ids ordenados por relevância."""
    scores: dict[str, float] = defaultdict(float)
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] += 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# Uso
bm25_ids   = [r["id"] for r in bm25_search(conn, query, k=50)]
vector_ids = [r["id"] for r in vector_search(conn, query, k=50)]

fused = rrf([bm25_ids, vector_ids], k=60)
top_candidates = [doc_id for doc_id, _ in fused[:50]]`}</CodeBlock>
        <Callout tone="success">
          <strong>k=60 é o default empírico</strong> (do paper original de Cormack, Clarke e Büttcher, 2009). Valores
          menores privilegiam top positions; maiores diluem. Na prática, 40-80 funcionam; não perca tempo tunando
          fino sem eval harness.
        </Callout>
      </Section>

      <Section title="Cross-encoder rerank: o ganho de 10-20% em recall@5" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Embedders (bi-encoders) codificam query e doc separadamente — isso permite pré-computar embeddings e buscar
          rápido, mas perde informação de interação. Cross-encoder lê <InlineCode>[query, doc]</InlineCode> juntos,
          com atenção cruzada, e emite um score de relevância fino. É caro (chamada de rede por par) — por isso só
          roda em cima de top-50/100, reordenando para top-5/10.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['API', 'Modelo', 'Multilíngue', 'Preço aproximado']}
          rows={[
            ['Cohere', 'rerank-v3.5', 'Sim (100+ idiomas)', 'US$2/1k docs reordenados'],
            ['Jina', 'jina-reranker-v2-base-multilingual', 'Sim', 'US$0.02/1M tokens (mais barato)'],
            ['Voyage', 'rerank-2', 'Sim', 'US$0.05/1M tokens'],
            ['BAAI/bge-reranker-v2-m3 (open)', 'Self-host', 'Sim', 'Só infra (GPU small OK)'],
            ['mixedbread-ai/mxbai-rerank-large (open)', 'Self-host', 'Limitado', 'Só infra'],
          ]}
        />
        <CodeBlock lang="python">{`# Cohere rerank — simples, multilíngue, produção-ready
import cohere

co = cohere.ClientV2()

def rerank(query: str, docs: list[dict], top_n: int = 10) -> list[dict]:
    r = co.rerank(
        model="rerank-v3.5",
        query=query,
        documents=[d["chunk"] for d in docs],
        top_n=top_n,
    )
    # r.results: lista ordenada com índice do doc original + score
    return [
        {**docs[item.index], "rerank_score": item.relevance_score}
        for item in r.results
    ]

# Self-host com sentence-transformers
from sentence_transformers import CrossEncoder
ce = CrossEncoder("BAAI/bge-reranker-v2-m3", max_length=512)

def rerank_local(query: str, docs: list[dict], top_n: int = 10) -> list[dict]:
    pairs = [(query, d["chunk"]) for d in docs]
    scores = ce.predict(pairs, batch_size=32)
    ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
    return [{**d, "rerank_score": float(s)} for d, s in ranked[:top_n]]`}</CodeBlock>
        <Callout tone="warn">
          Cross-encoder não substitui retrieval — ele refina. Se top-100 do primeiro estágio não contém o doc certo,
          nenhum rerank salva. Recall no primeiro estágio é condição necessária.
        </Callout>
      </Section>

      <Section title="Transformações de query: HyDE, expansion, multi-query" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Query curta + doc longo = descompasso de estilo, e embedder sofre. Três técnicas atacam isso em tempo de
          query (antes do retrieval).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como funciona', 'Quando vale']}
          rows={[
            ['HyDE', 'LLM gera um "doc hipotético" respondendo à query; você embeda esse doc em vez da query', 'Queries curtas/ambíguas, FAQ, help docs'],
            ['Query expansion', 'LLM expande a query em sinônimos e termos relacionados, concatenados', 'Domínio com jargão variado'],
            ['Multi-query', 'LLM gera N versões diferentes da query; você busca com cada uma e funde com RRF', 'Queries ambíguas com múltiplas interpretações'],
            ['Step-back', 'LLM gera uma pergunta mais genérica (contexto) + original; busca as duas e une', 'Queries muito específicas em base esparsa'],
            ['Decomposição', 'LLM quebra query complexa em sub-perguntas; busca cada uma', 'Queries analíticas/multi-hop'],
          ]}
        />
        <CodeBlock lang="python">{`# HyDE: Hypothetical Document Embedding
from anthropic import Anthropic

client = Anthropic()

def hyde_query(user_query: str) -> str:
    r = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": (
                "Escreva um parágrafo que responderia a esta pergunta como se "
                "fosse um trecho de documentação interna. 100-150 palavras, tom "
                "técnico e direto.\\n\\nPergunta: " + user_query
            ),
        }],
    )
    return r.content[0].text

# Pipeline com HyDE
def retrieve_with_hyde(query: str, k: int = 50) -> list[dict]:
    hypothetical_doc = hyde_query(query)        # LLM barato
    q_vec = embedder.encode(hypothetical_doc)    # embeda o doc, não a query
    return vector_search_by_vec(q_vec, k=k)

# Custo: +1 chamada Haiku (~US$0.0003 por query). Em alto volume,
# cacheie o HyDE por hash da query normalizada.`}</CodeBlock>
      </Section>

      <Section title="MMR: diversidade no top-k" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Problema comum: 5 chunks quase idênticos do mesmo parágrafo dominam o top-5. O LLM recebe redundância em vez
          de cobertura. MMR (Maximal Marginal Relevance) resolve re-rankeando por{' '}
          <InlineCode>λ·relevância - (1-λ)·similaridade com já selecionados</InlineCode>.
        </p>
        <CodeBlock lang="python">{`import numpy as np

def mmr(query_vec, doc_vecs, doc_ids, k: int = 5, lambda_: float = 0.7):
    """Maximal Marginal Relevance: rerank por relevância + diversidade."""
    sim_q = doc_vecs @ query_vec               # similaridade com query
    selected: list[int] = []
    candidates = list(range(len(doc_ids)))
    for _ in range(min(k, len(candidates))):
        if not selected:
            best = int(np.argmax(sim_q[candidates]))
        else:
            sim_sel = doc_vecs[candidates] @ doc_vecs[selected].T   # vs já escolhidos
            max_sim_sel = sim_sel.max(axis=1)
            score = lambda_ * sim_q[candidates] - (1 - lambda_) * max_sim_sel
            best = int(np.argmax(score))
        selected.append(candidates.pop(best))
    return [doc_ids[i] for i in selected]

# lambda=1 → recall puro (sem diversificar). lambda=0 → só diversidade (sem relevância).
# 0.6-0.8 é o range útil.`}</CodeBlock>
      </Section>

      <Section title="Pipeline completo: código de produção" accent={ACCENT}>
        <CodeBlock lang="python">{`# Retrieval de 3 estágios: BM25 + vector → RRF → cross-encoder rerank
from collections import defaultdict

def retrieve(query: str, k_final: int = 8) -> list[dict]:
    # 1) Query transform (opcional — HyDE se query curta)
    search_query = query if len(query.split()) > 6 else hyde_query(query)

    # 2) Multi-method retrieve (paralelize com asyncio em prod)
    bm25_hits   = bm25_search(conn, search_query, k=50)
    vector_hits = vector_search(conn, search_query, k=50)
    by_id = {h["id"]: h for h in (*bm25_hits, *vector_hits)}

    # 3) RRF fusion
    fused = rrf(
        [[h["id"] for h in bm25_hits], [h["id"] for h in vector_hits]],
        k=60,
    )
    candidates = [by_id[doc_id] for doc_id, _ in fused[:50]]

    # 4) Cross-encoder rerank (top-50 → top-8)
    reranked = rerank(query, candidates, top_n=k_final)  # usa query original
    return reranked`}</CodeBlock>
        <DecisionBox
          scenario="Base pequena (<100k chunks), orçamento apertado"
          winner="BM25 + vector + RRF (sem rerank)"
          winnerColor={ACCENT}
          why="RRF de BM25 + dense já tira 80% do ganho. Cross-encoder rerank custa dinheiro por query e em base pequena o ganho absoluto pode não compensar. Meça antes de adicionar."
          alternatives={[
            { name: 'Só vector + top-k', note: 'não recomendado, vai ficar em 50-60% de precisão' },
            { name: '3 estágios completos', note: 'se latência e custo permitirem, sempre melhor' },
          ]}
        />
        <DecisionBox
          scenario="Base grande (>1M chunks), suporte/help center em PT-BR"
          winner="3 estágios completos com Cohere rerank-v3.5"
          winnerColor={ACCENT}
          why="Volume alto justifica o custo marginal do rerank. Cohere v3.5 é multilíngue de alto nível em PT-BR. HyDE costuma ajudar porque queries de suporte são curtas."
          alternatives={[
            { name: 'Jina reranker-v2', note: 'mais barato, performance similar em pt-BR' },
            { name: 'bge-reranker-v2-m3 self-host', note: 'se tiver infra GPU e quiser zerar custo recorrente' },
          ]}
        />
      </Section>

      <Section title="Latência e orçamento de tokens" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estágio', 'Latência típica', 'Custo por query']}
          rows={[
            ['BM25 (Postgres FTS)', '5-20 ms', '~0'],
            ['Dense vector (pgvector HNSW)', '10-30 ms', '+custo do embed (~US$0.00002)'],
            ['RRF fusion', '<1 ms', '0'],
            ['HyDE (Haiku 4.5)', '300-600 ms', '~US$0.0003'],
            ['Cohere rerank top-50', '100-300 ms', '~US$0.0001 (50 docs)'],
            ['Pipeline total', '~500-900 ms', '~US$0.0005-0.001'],
          ]}
        />
        <Callout tone="info">
          Paralelize BM25 e vector search (são I/O independentes). HyDE é sequencial à query — se for crítico em p95,
          use só quando a query tiver &lt;6 palavras. Cache de query normalizada (hash → resultado) elimina 30-50% de
          custo em bases com cauda longa repetitiva (FAQ).
        </Callout>
      </Section>

      <Section title="Metadata filtering: o filtro barato que todo mundo esquece" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Antes de qualquer ML, filtre por metadata estruturada. <InlineCode>WHERE tenant_id = ? AND lang = 'pt' AND
          created_at &gt; now() - interval '90 days'</InlineCode> reduz o espaço de busca em 90%+ e aumenta recall
          efetivo gratuitamente.
        </p>
        <CodeBlock lang="sql">{`-- pgvector com filtro ANTES da busca vetorial
SELECT id, chunk,
       1 - (embedding <=> $1::vector) AS sim
FROM chunks
WHERE tenant_id = $2
  AND lang = 'pt'
  AND doc_type = ANY($3::text[])
  AND created_at > now() - interval '90 days'
ORDER BY embedding <=> $1::vector
LIMIT 50;

-- Para HNSW pré-filtrar bem, use índice parcial ou partitioning.
-- Em Pinecone/Weaviate, metadata filter é campo estruturado no payload.`}</CodeBlock>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="RRF vence sempre uma soma ponderada calibrada?"
          a={<>Não, mas a soma ponderada exige calibração por corpus (normalizar BM25 entre 0-1, por exemplo) e re-calibra toda vez que o corpus muda. RRF é zero-config e robusto — vale a pequena perda de ótimo teórico pela estabilidade operacional.</>}
        />
        <QAItem
          q="Posso rodar cross-encoder no top-500 em vez de top-50?"
          a={<>Pode, mas a curva de ganho achata rápido. Cohere/Jina cobram por doc reordenado. Em benchmarks públicos, top-100 captura ~95% do ganho que top-500 daria. Use top-100 como default; só suba se eval mostrar que o doc certo vive além disso.</>}
        />
        <QAItem
          q="SPLADE e outros sparse learned valem a complicação?"
          a={<>Em alguns domínios, sim — SPLADE combina match lexical com expansão semântica aprendida. Mas custo de indexação e integração é alto. Para 95% dos casos, BM25 + dense + RRF cobre bem. Considere SPLADE só depois de ter eval harness e identificar gap específico.</>}
        />
        <QAItem
          q="Reranker multilíngue tem perda em PT-BR?"
          a={<>Pequena. Cohere rerank-v3.5 e Jina reranker-v2 são fortes em PT-BR. bge-reranker-v2-m3 open-source também. Sempre valide no seu domínio — um golden set de 100 queries pt-BR é suficiente para decidir.</>}
        />
        <QAItem
          q="Hybrid search funciona em vector DB dedicado (Pinecone, Weaviate)?"
          a={<>Depende. Weaviate e Qdrant têm hybrid nativo (BM25 + vetor + RRF built-in). Pinecone historicamente é só vetor — hybrid exige sparse vector separado ou engine externo. Em pgvector, BM25 vem do próprio Postgres FTS, por isso é o combo mais simples e completo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Retrieval de produção é três estágios: multi-method retrieve (BM25+dense),
        RRF fusion, cross-encoder rerank. RRF é uma função de 10 linhas que substitui calibração frágil. Reranker
        (Cohere, Jina, Voyage ou bge self-host) entrega o ganho final de 10-20% em recall@5. HyDE e query expansion
        ajudam em queries curtas. Metadata filter é de graça e dobra a qualidade efetiva. Próximo: como medir tudo
        isso com eval harness sério — recall@k, nDCG, faithfulness e LLM-as-judge.
      </Callout>
    </div>
  );
}
