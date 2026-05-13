import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('bm25-tfidf-fundamentos');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que BM25 introduz saturação de term frequency (TF) via parâmetro k1, em vez de usar TF puro como o TF-IDF clássico?',
    options: [
      'Para deixar a fórmula mais complexa',
      'Porque relevância não cresce linearmente com TF: um documento que menciona "Postgres" 30 vezes não é 3× mais relevante do que um que menciona 10 vezes. A função tf / (tf + k1) cria uma curva côncava que satura — primeiras ocorrências contam muito, ocorrências extras quase nada. k1 típico = 1.2',
      'Para economizar memória',
      'Porque o TF-IDF foi proibido pela ACM',
    ],
    correct: 1,
    explanation: 'Robertson e Sparck Jones, ao formalizar o modelo probabilístico de relevância (BM25, BM = Best Match, série de experimentos no TREC nos anos 90), notaram empiricamente que TF puro super-pondera documentos longos com muita repetição. A solução matemática elegante foi a saturação: f(tf) = (k1+1) · tf / (k1 + tf). Para tf=0 a função vale 0; para tf → ∞ ela tende a k1+1, ou seja, satura. k1 controla a velocidade de saturação: k1=0 ignora TF (binário); k1 alto se aproxima de TF linear. O default 1.2 vem de calibração em corpora TREC e funciona bem em texto natural.',
  },
  {
    question: 'O que o parâmetro b ∈ [0,1] do BM25 controla?',
    options: [
      'A cor do ranking',
      'Length normalization: o quanto a fórmula penaliza documentos mais longos que a média. b=0 ignora tamanho (favorece docs longos que naturalmente contém mais termos). b=1 normaliza totalmente. Default b=0.75 é um meio-termo calibrado em corpora de texto natural',
      'O número de shards',
      'A taxa de aprendizado',
    ],
    correct: 1,
    explanation: 'O termo de normalização é 1 - b + b · (|D| / avgdl), onde |D| é o tamanho do documento e avgdl é o tamanho médio dos documentos da coleção. Se b=0, esse termo vira 1 e não há penalização. Se b=1, documentos acima da média recebem peso menor. b=0.75 é o sweet spot empírico: docs longos NÃO são linearmente mais relevantes só por serem longos, mas também não devem ser zerados — afinal, podem cobrir o tópico melhor. Em corpora muito heterogêneos (mistura de tweets e papers), considere ajustar b por campo.',
  },
  {
    question: 'Por que BM25 ainda é relevante em 2026, mesmo com embeddings densos como BGE-M3 dominando benchmarks?',
    options: [
      'Por tradição',
      'BM25 é insuperável em matches lexicais exatos: SKUs, nomes próprios, error codes, acrônimos novos, jargão técnico fora da distribuição do encoder. Embeddings densos generalizam semântica mas falham em out-of-vocabulary. Por isso pipelines state-of-the-art (Elasticsearch, Vespa, Qdrant hybrid) combinam BM25 + dense + reranker via RRF',
      'Porque é o único algoritmo grátis',
      'Porque foi padronizado pela ISO',
    ],
    correct: 1,
    explanation: 'Embeddings densos (BGE-M3, e5, Voyage) projetam texto em ℝ^d e medem similaridade via cosseno. Funcionam excelentemente em paráfrase, sinônimo, intent, multilingual. Mas: se o usuário busca "ERR_NXDOMAIN" e nenhum doc do corpus foi visto pelo encoder com esse acrônimo, ele será mapeado para um vetor próximo de outros erros genéricos — e o match relevante pode ficar em rank 50. BM25 acerta de cara porque vê o termo literal. Em produção, BM25 é o piso de robustez; densos somam recall semântico; reranker cross-encoder corrige top-k. Por isso BM25 não morre — só vira componente do pipeline.',
  },
  {
    question: 'Por que IDF (Inverse Document Frequency) usa logaritmo na fórmula?',
    options: [
      'Estética',
      'Sem o log, palavras raríssimas (df=1 num corpus de 1B docs) teriam peso 10^9, dominando o ranking de forma instável. O log comprime a escala: termos que aparecem em poucos docs ainda recebem peso muito maior que termos comuns, mas a curva é suave. A variante "probabilistic IDF" do BM25 usa log((N − df + 0.5) / (df + 0.5)) com smoothing para evitar log de zero e valores negativos',
      'Por causa do C++',
      'Para o cálculo ser mais lento',
    ],
    correct: 1,
    explanation: 'IDF clássico (Spärck Jones, 1972) é log(N/df). Intuição: termos raros são mais informativos. O log é fundamental — se "Postgres" aparece em 100 docs e "o" em 10M, sem log "Postgres" pesaria 100.000× mais que "o" e qualquer doc com Postgres dominaria, mesmo sem mérito. Com log, a razão vira ~5 (log10(10M/100) ≈ 5 vs log10(10M/10M) ≈ 0): muito mais peso, mas estável. BM25 ainda adiciona smoothing (+0.5) para tratar df=0 e evitar IDF negativo em palavras hipercomuns. Detalhes no paper Robertson 1994 "Okapi at TREC-3".',
  },
  {
    question: 'No Lucene/Elasticsearch, qual é o efeito prático de aumentar k1 de 1.2 (default) para 2.0 num corpus de artigos longos com muita repetição de termos?',
    options: [
      'Nenhum',
      'Reduz a saturação, permitindo que documentos com TF muito alto recebam scores ainda maiores. Útil quando repetição realmente sinaliza relevância (ex: títulos técnicos onde o tópico é mencionado dezenas de vezes legitimamente). Mas pode introduzir bias contra docs concisos. Sempre validar no golden set',
      'Diminui o número de shards',
      'Aumenta o índice em disco',
    ],
    correct: 1,
    explanation: 'k1 controla a velocidade com que a função TF satura. k1=1.2 satura rápido (após ~5 ocorrências o ganho marginal é ínfimo). k1=2.0 dá mais peso para TF alto sustentado. Em corpora onde docs longos genuinamente discutem tópicos em profundidade (papers, artigos técnicos extensos), aumentar k1 pode melhorar ranking. Em corpora onde repetição é spam (SEO, descrições de produto stuffed), manter k1 baixo. Combinado com b, formam o "tuning" clássico do BM25. Em produção: nunca ajuste no escuro — sempre meça NDCG@10 e MRR no seu golden set antes/depois.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="bm25-tfidf-fundamentos"
      title="BM25 e TF-IDF: a math da busca clássica"
      icon="📐"
      xp={65}
      readTime={13}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="elasticsearch-internals"
      nextTitle="Elasticsearch internals: Lucene, segments, shards"
      quiz={quiz}
    >
      <Section title="Por que entender BM25 em 2026" accent={accent}>
        <p>
          Em 2026, busca virou sinônimo de embeddings densos. Toda startup quer &quot;RAG com pgvector&quot;.
          E quase todas redescobrem a mesma verdade que a literatura de Information Retrieval (IR) tem desde os anos 90:
          <strong> BM25 é insuperável em matches lexicais exatos</strong> — códigos SKU, nomes próprios, error codes,
          acrônimos novos, jargão técnico que o encoder nunca viu. Por isso pipelines state-of-the-art (Elasticsearch,
          Vespa, Qdrant hybrid) combinam BM25 + dense + reranker.
        </p>
        <p>
          Este módulo desmistifica a matemática: de onde vem TF-IDF (Spärck Jones 1972), por que BM25 (Robertson 1994
          no TREC-3) ganhou, e o que <InlineCode>k1</InlineCode> e <InlineCode>b</InlineCode> significam de verdade.
          Sem isso, você só copia &quot;Elasticsearch defaults&quot; sem saber tunar quando produção começar a doer.
        </p>
        <Callout tone="info" icon="📚">
          Referências de cabeceira: Robertson &amp; Walker (1994) &quot;Some Simple Effective Approximations to the
          2-Poisson Model&quot;; Robertson &amp; Zaragoza (2009) &quot;The Probabilistic Relevance Framework: BM25 and Beyond&quot;;
          Manning, Raghavan &amp; Schütze, &quot;Introduction to Information Retrieval&quot; (Stanford, gratuito online).
        </Callout>
      </Section>

      <Section title="Linha do tempo: TF-IDF → BM25 → híbrido" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '1972', label: 'Spärck Jones publica IDF', detail: 'Karen Spärck Jones formaliza Inverse Document Frequency. Termos raros valem mais. Base estatística da busca por palavra-chave.' },
            { when: '1975-1985', label: 'Modelo vetorial de Salton', detail: 'Gerard Salton (Cornell) consolida o vector space model: documento como vetor de pesos TF-IDF, similaridade via cosseno.' },
            { when: '1994', label: 'BM25 no TREC-3', detail: 'Stephen Robertson et al. apresentam o Okapi BM25 na TREC-3. Saturação de TF (k1) + length normalization (b). Vence baselines por margem larga.' },
            { when: '2009', label: 'BM25F e probabilistic relevance framework', detail: 'Robertson & Zaragoza generalizam: BM25F para campos múltiplos (title, body, anchor). Ainda é o backbone do Lucene.' },
            { when: '2013-2018', label: 'Embeddings densos', detail: 'word2vec, GloVe, BERT. Comunidade IR explora densos para retrieval, mas BM25 segue dominando em produção.' },
            { when: '2020-2024', label: 'Hybrid search vira default', detail: 'Vespa, Elasticsearch 8, Qdrant introduzem hybrid retrieval out-of-the-box. BM25 + densos via RRF. Cross-encoder rerank no topo.' },
            { when: '2026', label: 'BM25 sobrevive — como componente', detail: 'BGE-M3, Voyage-3, Cohere-v3 dominam recall semântico. BM25 segue insuperável em out-of-vocabulary e exact match. Pipelines híbridos são o estado da arte.' },
          ]}
        />
      </Section>

      <Section title="TF-IDF: a fórmula original" accent={accent}>
        <p>
          A intuição é simples e elegante. Um termo <InlineCode>t</InlineCode> num documento <InlineCode>d</InlineCode> tem
          peso proporcional a:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-slate-300">
          <li><strong>TF (term frequency)</strong> — quantas vezes <InlineCode>t</InlineCode> aparece em <InlineCode>d</InlineCode>. Mais vezes → mais provável que o doc seja sobre o termo.</li>
          <li><strong>IDF (inverse document frequency)</strong> — log(N / df<sub>t</sub>), onde N é o total de docs e df<sub>t</sub> é em quantos docs o termo aparece. Termos raros são mais informativos.</li>
        </ul>
        <AnnotatedFormula
          accent={accent}
          title="TF-IDF clássico"
          formula="score(d, q) = Σ TF(t, d) · log(N / df(t))"
          parts={[
            { text: 'TF(t, d)', annotation: 'contagem do termo t no documento d' },
            { text: 'N', annotation: 'total de documentos do corpus' },
            { text: 'df(t)', annotation: 'document frequency: quantos docs contêm t' },
            { text: 'log', annotation: 'comprime escala — sem ele, termos raros teriam peso explosivo' },
          ]}
        />
        <p>
          Funciona surpreendentemente bem como baseline. Mas tem dois problemas que BM25 resolve:
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm text-slate-300">
          <li><strong>TF linear é injusto</strong> — um doc com 30 ocorrências do termo não é 3× mais relevante que outro com 10.</li>
          <li><strong>Não normaliza tamanho</strong> — documentos longos naturalmente acumulam TF maior sem necessariamente serem mais relevantes.</li>
        </ol>
      </Section>

      <Section title="BM25: a evolução probabilística" accent={accent}>
        <p>
          Robertson e Sparck Jones derivaram BM25 do modelo probabilístico de relevância (Probabilistic Relevance
          Framework). A ideia: dado uma query, qual é a probabilidade de um documento ser relevante? A derivação completa
          envolve o modelo 2-Poisson e simplificações práticas. O resultado:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="BM25 — fórmula canônica"
          formula="score(d, q) = Σ IDF(t) · [ TF(t,d) · (k₁+1) ] / [ TF(t,d) + k₁ · (1 − b + b · |d|/avgdl) ]"
          parts={[
            { text: 'IDF(t)', annotation: 'log((N − df + 0.5) / (df + 0.5)) — variante probabilística com smoothing' },
            { text: 'k₁', annotation: 'saturação de TF. Default 1.2. Alto = TF importa muito; baixo = quase binário' },
            { text: 'b', annotation: 'length normalization ∈ [0,1]. Default 0.75. b=0 ignora tamanho; b=1 penaliza totalmente' },
            { text: '|d|', annotation: 'tamanho do documento (em tokens)' },
            { text: 'avgdl', annotation: 'tamanho médio dos documentos do corpus' },
          ]}
        />
        <Callout tone="info" icon="💡">
          A peça mais elegante é <strong>TF · (k₁+1) / (TF + k₁)</strong>. Para TF=0 dá 0; para TF→∞ tende a k₁+1.
          Curva côncava: primeiras ocorrências contam muito, repetições marginais quase nada. É exatamente como humanos
          julgam relevância.
        </Callout>
      </Section>

      <Section title="Visualizando saturação de TF" accent={accent}>
        <CodeBlock lang="python">{`import numpy as np
import matplotlib.pyplot as plt

def bm25_tf_component(tf, k1, b, dl, avgdl):
    """Componente de TF do BM25, sem o IDF."""
    return (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avgdl))

tf_range = np.arange(0, 30)
plt.figure(figsize=(8, 5))
for k1 in [0.0, 0.5, 1.2, 2.0, 5.0]:
    y = [bm25_tf_component(tf, k1, 0.75, 100, 100) for tf in tf_range]
    plt.plot(tf_range, y, label=f"k1={k1}")
plt.xlabel("TF (term frequency)")
plt.ylabel("Componente BM25 (sem IDF)")
plt.title("Saturação de TF para diferentes k1")
plt.legend(); plt.grid(True); plt.show()

# Observações:
# k1=0    → função binária (TF importa só se ≥1)
# k1=0.5  → satura muito rápido, basicamente binária
# k1=1.2  → default Lucene, saturação suave
# k1=2.0  → mais peso para TF alto
# k1=5.0  → quase linear (TF puro)`}</CodeBlock>
        <p>
          Esse gráfico explica visualmente por que <InlineCode>k1=1.2</InlineCode> virou default: ele dá peso a
          primeiras ocorrências, mas após ~5 menções o ganho marginal é insignificante. Isso bate com a intuição
          humana de relevância.
        </p>
      </Section>

      <Section title="Length normalization: por que b importa" accent={accent}>
        <p>
          Sem normalizar tamanho, um livro de 800 páginas sobre &quot;Postgres&quot; sempre venceria um post de blog
          focado no tópico — só porque o livro tem TF maior em absoluto. Mas o post pode ser mais útil para o usuário.
          O parâmetro <InlineCode>b</InlineCode> ajusta isso:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['b', 'Comportamento', 'Quando usar']}
          rows={[
            ['0', 'Sem normalização — favorece docs longos', 'Corpora homogêneo em tamanho (logs, tweets)'],
            ['0.25', 'Penalização leve', 'Documentos curtos a médios (FAQs, descrições)'],
            ['0.75', 'Default Lucene/ES — sweet spot empírico', 'Corpora natural mista (Wikipedia, blogs, artigos)'],
            ['1.0', 'Penalização total — TF normalizado por avgdl', 'Quando você quer ranking quase TF-relativo'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Em corpora muito heterogêneo (mistura de docs de 50 tokens e 50.000), considere indexar em campos separados
          (title, body, abstract) com BM25F — cada campo com seu próprio b — em vez de tunar um b global no escuro.
        </Callout>
      </Section>

      <Section title="IDF probabilístico do BM25" accent={accent}>
        <p>
          A variante de IDF do BM25 não é o log(N/df) clássico. É:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="IDF probabilístico"
          formula="IDF(t) = log((N − df + 0.5) / (df + 0.5))"
          parts={[
            { text: 'N', annotation: 'total de documentos' },
            { text: 'df', annotation: 'document frequency do termo' },
            { text: '+ 0.5', annotation: 'smoothing — evita log(0) e log(∞)' },
          ]}
        />
        <p>
          Note o detalhe perigoso: se um termo aparece em mais de N/2 documentos, esse IDF fica <strong>negativo</strong>.
          Isso significaria que conter o termo <em>diminui</em> o score do doc. Em Lucene moderno, isso é clampado a zero
          (via <InlineCode>log(1 + (N − df + 0.5) / (df + 0.5))</InlineCode>) para evitar comportamento contraintuitivo.
          É um detalhe que pega muita gente desavisada que tenta &quot;reimplementar BM25 do zero&quot; sem ler o source
          do Lucene.
        </p>
      </Section>

      <Section title="BM25 em código Python (didático)" accent={accent}>
        <CodeBlock lang="python">{`from collections import Counter
from math import log
from typing import Sequence

class BM25:
    """
    Implementação didática de BM25. Não use em produção —
    use Lucene/Elasticsearch/OpenSearch, que tem otimizações
    de índice invertido, posting lists comprimidas, skip lists.
    """
    def __init__(self, corpus: Sequence[Sequence[str]], k1: float = 1.2, b: float = 0.75):
        self.corpus = corpus
        self.k1 = k1
        self.b = b
        self.N = len(corpus)
        self.avgdl = sum(len(d) for d in corpus) / self.N
        # document frequency por termo
        self.df: dict[str, int] = {}
        for doc in corpus:
            for term in set(doc):
                self.df[term] = self.df.get(term, 0) + 1
        # IDF pré-calculado (com clamp ≥ 0)
        self.idf = {
            t: max(log((self.N - df + 0.5) / (df + 0.5) + 1.0), 0.0)
            for t, df in self.df.items()
        }

    def score(self, query: Sequence[str], doc_idx: int) -> float:
        doc = self.corpus[doc_idx]
        tf = Counter(doc)
        dl = len(doc)
        score = 0.0
        for t in query:
            if t not in tf:
                continue
            idf = self.idf.get(t, 0.0)
            tf_t = tf[t]
            norm = 1 - self.b + self.b * dl / self.avgdl
            score += idf * (tf_t * (self.k1 + 1)) / (tf_t + self.k1 * norm)
        return score

    def search(self, query: Sequence[str], top_k: int = 10):
        scores = [(i, self.score(query, i)) for i in range(self.N)]
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


# Exemplo de uso
corpus = [
    ["postgres", "mvcc", "vacuum", "vacuum", "tuple"],
    ["mysql", "innodb", "redo", "log"],
    ["postgres", "wal", "wal", "checkpoint"],
    ["sqlite", "wal", "journal"],
]
bm25 = BM25(corpus)
print(bm25.search(["postgres", "wal"], top_k=3))`}</CodeBlock>
      </Section>

      <Section title="Por que BM25 + BGE-M3 ainda combinam em 2026" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Pipeline híbrido moderno"
          steps={[
            { label: '1. Query do usuário', desc: '"como configurar autovacuum em postgres com workload OLTP"' },
            { label: '2a. BM25 retrieval', desc: 'top-100 lexical. Acerta "autovacuum", "postgres", "OLTP" como tokens.' },
            { label: '2b. Dense retrieval (BGE-M3)', desc: 'top-100 semântico. Acerta paráfrases ("tunar limpeza automática", "vacuum tuning").' },
            { label: '3. Fusion (RRF)', desc: 'Reciprocal Rank Fusion combina os dois rankings sem normalizar scores.' },
            { label: '4. Cross-encoder rerank', desc: 'BGE-reranker ou Cohere Rerank pontua os top-50 com modelo mais caro mas preciso.' },
            { label: '5. Top-10 final', desc: 'Resultado mostrado ao usuário ou injetado em contexto LLM (RAG).' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'BM25 ganha em', v: 'SKUs, nomes próprios, error codes, acrônimos novos, jargão out-of-vocabulary do encoder' },
            { k: 'BGE-M3 ganha em', v: 'paráfrase, sinônimos, multilingual, intent matching, queries conversacionais' },
            { k: 'Ambos perdem em', v: 'queries ambíguas ou underspecified — aí entra reranker cross-encoder' },
            { k: 'Custo BM25', v: 'baixíssimo: posting lists comprimidas, índice em disco, ~5ms p99' },
            { k: 'Custo dense', v: 'embedding na ingestão + ANN query (~10-30ms com HNSW)' },
          ]}
        />
      </Section>

      <Section title="Quando NÃO usar BM25" accent={accent}>
        <DecisionBox
          scenario="Busca em produção"
          winner="BM25 + dense híbrido (RRF + rerank)"
          winnerColor={accent}
          why="BM25 sozinho falha em paráfrase e sinônimo; dense sozinho falha em out-of-vocabulary e exact match. Pipeline híbrido é estado da arte — Elasticsearch 8, Vespa, Qdrant, Weaviate todos suportam."
          alternatives={[
            { name: 'Só BM25', note: 'ok para busca interna em logs/tickets onde tokens são exatos' },
            { name: 'Só dense', note: 'ok para Q&A puramente conversacional em domínio fechado e bem coberto pelo encoder' },
            { name: 'Sem busca', note: 'às vezes basta filtrar por metadados (data, tag, autor) — não force retrieval onde não há query' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="Posso treinar BM25?"
          a="Não no sentido de gradient descent. Mas você tuna k1, b, e (em BM25F) pesos por campo. Tuning rigoroso usa golden set + grid search ou Bayesian optimization."
        />
        <QAItem
          q="BM25 lida com stemming, stop words, lowercase?"
          a="Não diretamente. Isso é trabalho do analyzer do Lucene/Elasticsearch (tokenizer + filters). BM25 opera sobre tokens já normalizados."
        />
        <QAItem
          q="E sobre busca em outras línguas?"
          a="BM25 é language-agnostic — opera sobre tokens. Para PT-BR, configure analyzer com stemmer português (Snowball, RSLP) e stop words. Para japonês/chinês, tokenizer específico (Kuromoji, IK)."
        />
        <QAItem
          q="Como BM25 trata frases ('exact match')?"
          a='Não trata. BM25 é bag-of-words. Para frases, Lucene oferece phrase queries que usam positions das posting lists. Combina-se BM25 (recall) com phrase boosting (precision em queries com aspas).'
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          BM25 é uma fórmula de ~6 termos calibrada empiricamente desde 1994 e ainda é o estado da arte em retrieval
          lexical. Tem 2 hiperparâmetros (k1, b), defaults sensatos (1.2, 0.75), e funciona out-of-the-box em
          Lucene, Elasticsearch, OpenSearch, Vespa, Solr, MeiliSearch (em parte) e Postgres tsvector (parcialmente).
        </Callout>
        <Callout tone="info" icon="💡">
          Em 2026, o piso de qualquer pipeline de busca sério é: BM25 + dense embeddings + RRF + cross-encoder rerank.
          Quem ignora BM25 reaprende na pele que embeddings densos falham em out-of-vocabulary. Próximo módulo:
          como o Lucene/Elasticsearch implementa BM25 internamente — segments, inverted index, posting lists.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
