import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('bm25-tf-idf-sem-misticismo');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a intuição por trás de TF-IDF?',
    options: [
      'Fórmula aleatória',
      'TF (Term Frequency) mede quanto um termo aparece no documento (mais ocorrências = mais relevante). IDF (Inverse Document Frequency) penaliza termos comuns no corpus (aparecer em 90% dos docs = pouco discriminativo). Multiplicação destaca termos frequentes no doc E raros no corpus',
      'Só contagem',
      'Machine learning',
    ],
    correct: 1,
    explanation: 'Exemplo: palavra "o" aparece em toda página — TF alta, IDF baixa → score baixo, corretamente ignorada. Palavra "kubernetes" aparece 5x no doc e em 0.5% do corpus — TF moderada, IDF alta → score alto, sinalizando que este doc fala sério de k8s. A multiplicação faz balanço: não é só "palavra aparece muito", é "aparece muito aqui e raramente em outros lugares". Fundamento de toda busca por keywords.',
  },
  {
    question: 'O que BM25 ajusta em relação a TF-IDF puro?',
    options: [
      'Nada, é igual',
      'Dois ajustes críticos: (1) saturação de TF — ocorrência 20 vs 10 não vale o dobro (diminishing returns via parâmetro k1); (2) normalização por length — documentos longos não ganham automaticamente só por serem longos (parâmetro b). Resultado: ranking mais estável e realista',
      'Adiciona cor',
      'É mais lento',
    ],
    correct: 1,
    explanation: 'TF-IDF puro tem problema: documento com "kubernetes" 100x vence um com 10x drasticamente. Intuição: depois de 3-5 menções, contexto já é claro. BM25 satura TF via k1 (tipicamente 1.2): ganho marginal diminui. Segundo problema: artigo longo com blablá vence artigo focado curto só por volume. BM25 normaliza por length média do corpus via b (tipicamente 0.75). Resultado: ranking estável em corpora com documentos heterogêneos. Default em Lucene/Elastic/OpenSearch desde ~2015.',
  },
  {
    question: 'Quando BM25 começa a falhar e precisa de vector search como complemento?',
    options: [
      'Nunca',
      'Quando queries usam sinônimos ou paráfrase não lexicamente presentes ("como lidar com memória cheia" vs doc "troubleshooting OOM kills") ou quando intent é semântica alta. BM25 é literal-lexical; não "entende" que OOM = out of memory = memória cheia. Embeddings semânticos capturam isso',
      'Só em inglês',
      'Sempre falha',
    ],
    correct: 1,
    explanation: 'BM25 brilha em match exato e morfológico; falha em equivalência semântica. "dog" e "cachorro" são tokens diferentes — BM25 não reconhece. Vector search (embeddings) mapeia ambos para vizinhança próxima no espaço. Solução moderna: hybrid search — BM25 pega matches lexicais (alta precision em termos técnicos: SKU, nome exato) + vector pega semântica (alta recall em paráfrase) + fusion combina. +30% de NDCG típico vs BM25 ou vector sozinho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="bm25-tf-idf-sem-misticismo"
      title="BM25 e TF-IDF sem misticismo"
      icon="📏"
      xp={50}
      readTime={12}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="vector-search-profundo-indexes"
      nextTitle="Vector search: HNSW, IVF, indexes aproximados"
      quiz={quiz}
    >
      <Section title="Não é magia — é contagem inteligente" accent={accent}>
        <p>
          BM25 (Best Matching 25, Stephen Robertson et al, 1994) é a base de ranking lexical em Lucene, Elasticsearch, OpenSearch, Solr, tantivy. Apesar do nome assustador, é apenas TF-IDF com dois ajustes pragmáticos. Entender a fórmula permite tunar parâmetros com intenção, não por superstição.
        </p>
      </Section>

      <Section title="TF-IDF clássico" accent={accent}>
        <CodeBlock lang="python">{`import math
from collections import Counter

def tf(term: str, doc_tokens: list[str]) -> float:
    """Term Frequency — quantas vezes o termo aparece no doc"""
    return doc_tokens.count(term) / len(doc_tokens)

def idf(term: str, corpus: list[list[str]]) -> float:
    """Inverse Document Frequency — quão raro no corpus"""
    n_docs_with_term = sum(1 for doc in corpus if term in doc)
    if n_docs_with_term == 0:
        return 0.0
    return math.log(len(corpus) / n_docs_with_term)

def tfidf(term: str, doc: list[str], corpus: list[list[str]]) -> float:
    return tf(term, doc) * idf(term, corpus)

# Interpretação:
#   TF alta → termo é tema do doc
#   IDF alta → termo é informativo no corpus
#   Produto → doc específico sobre esse tema`}</CodeBlock>
      </Section>

      <Section title="BM25 — os dois ajustes" accent={accent}>
        <CodeBlock lang="python">{`import math
from collections import Counter

def bm25_score(query_terms, doc_tokens, corpus, k1=1.2, b=0.75):
    """
    k1: saturação de TF (tipicamente 1.2–2.0)
    b: normalização por length (tipicamente 0.75)
    """
    avgdl = sum(len(d) for d in corpus) / len(corpus)
    dl = len(doc_tokens)
    score = 0.0

    for term in query_terms:
        n_docs_with = sum(1 for d in corpus if term in d)
        if n_docs_with == 0:
            continue

        # IDF suavizado (Robertson/Sparck Jones)
        idf = math.log(
            (len(corpus) - n_docs_with + 0.5) /
            (n_docs_with + 0.5) + 1
        )

        freq = doc_tokens.count(term)
        # TF com saturação + length normalization
        tf_component = (freq * (k1 + 1)) / (
            freq + k1 * (1 - b + b * (dl / avgdl))
        )

        score += idf * tf_component

    return score`}</CodeBlock>
      </Section>

      <Section title="Tunando k1 e b" accent={accent}>
        <Callout tone="info" icon="🎛️">
          <strong>k1 alto</strong> (ex: 2.0) — TF importa mais, documentos que repetem termo ganham.
          <strong>k1 baixo</strong> (ex: 0.5) — saturação rápida, primeira ocorrência já conta quase tudo.
          <br /><br />
          <strong>b = 1.0</strong> — length normalization total; docs curtos dominam.
          <strong>b = 0.0</strong> — ignora length; docs longos ganham por volume.
          <strong>b = 0.75</strong> — balanço default, funciona para maioria.
        </Callout>
        <p>
          Use golden set (ver aula anterior) pra medir impacto real de tuning. Mudanças de k1/b de 0.1 podem mexer 2–5% em NDCG@10 — vale a pena experimentar.
        </p>
      </Section>

      <Section title="Em ação no Elasticsearch" accent={accent}>
        <CodeBlock lang="json">{`PUT /articles/_settings
{
  "index": {
    "similarity": {
      "my_bm25": {
        "type": "BM25",
        "k1": 1.5,
        "b": 0.7
      }
    }
  }
}

// E no mapping do campo:
{
  "mappings": {
    "properties": {
      "body": {
        "type": "text",
        "analyzer": "pt_custom",
        "similarity": "my_bm25"
      }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Limites do lexical" accent={accent}>
        <p>
          BM25 é literal: &quot;cachorro&quot; e &quot;dog&quot; são tokens distintos. Paráfrase (&quot;como evitar OOM&quot; vs &quot;gerenciar memória cheia&quot;) escapa. É por isso que stack moderna combina BM25 (forte em termos exatos, nomes próprios, códigos) com vector search (forte em semântica). Próxima aula cobre vectors.
        </p>
        <Callout tone="success" icon="✅">
          Entender BM25 de verdade — fórmula, intuição, parâmetros — é o que separa engineer de search de quem &quot;usa Elasticsearch&quot;. Com isso, debug de relevância vira trabalho engenhoso, não chute.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
