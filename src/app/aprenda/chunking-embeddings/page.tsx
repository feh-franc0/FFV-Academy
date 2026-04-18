import { getModuleMetadata } from '@/lib/metadata';
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
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('chunking-embeddings');

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença essencial entre fixed chunking e recursive chunking?',
    options: [
      'Fixed é mais rápido',
      'Fixed corta em N tokens sempre, ignorando estrutura. Recursive tenta cortar em separadores naturais (parágrafo → frase → token) preservando coesão semântica. Recursive ganha em ~90% dos casos',
      'Recursive usa IA',
      'Não há diferença',
    ],
    correct: 1,
    explanation:
      'Fixed chunking (split a cada 500 tokens) corta no meio de frases, tabelas, listas. Recursive chunking (LangChain RecursiveCharacterTextSplitter) tenta primeiro parágrafos (\\n\\n), depois frases (. ! ?), depois palavras — mantém unidade semântica. É o default correto.',
  },
  {
    question: 'O que é Contextual Retrieval (Anthropic, 2024) e por que ajuda?',
    options: [
      'Um novo modelo',
      'Pré-processamento em que cada chunk ganha um prefixo curto explicando seu contexto no documento inteiro (ex: "Este é um trecho do relatório Q3 2024 sobre receita."). Reduz falhas de retrieval em 35-49% segundo benchmark Anthropic',
      'Um tipo de fine-tuning',
      'Um reranker',
    ],
    correct: 1,
    explanation:
      'Chunk isolado perde contexto — "A margem caiu 8%" não diz de qual produto/período. Contextual Retrieval usa LLM barato (Haiku) para gerar um contexto curto para cada chunk, concatenado antes de embedar. Combinado com hybrid search reduz failures drasticamente. É caro no ingest, barato no query.',
  },
  {
    question: 'Quando dot product bate cosine similarity?',
    options: [
      'Nunca',
      'Quando vetores NÃO são normalizados — dot product leva em conta magnitude (pode representar relevância). Com vetores normalizados, cosine = dot. Muitos embedders (OpenAI, BGE) já normalizam: tanto faz',
      'Sempre que possível',
      'Só em PostgreSQL',
    ],
    correct: 1,
    explanation:
      'Se embedder normaliza para norma 1 (OpenAI text-embedding-3, BGE, Voyage), cosine e dot são matematicamente iguais e dot é mais rápido. Se embedder não normaliza, dot pode capturar magnitude como sinal (raro em texto). Na prática: use cosine como default; é o mais comum.',
  },
  {
    question: 'Embedding genérico (OpenAI text-embedding-3-small) vs modelo especializado para português técnico — quando vale o segundo?',
    options: [
      'Sempre',
      'Quando (a) domínio tem jargão forte (jurídico, médico, técnico BR), (b) idioma não é majoritário no treino do modelo, (c) avaliação mostra recall@k baixo. Em textos gerais em pt-BR, text-embedding-3 ou multilingual-e5 já entrega bem',
      'Nunca, é hype',
      'Só quando tem GPU',
    ],
    correct: 1,
    explanation:
      'Regra: meça antes de trocar. Monte um golden set de 50-100 queries com gabarito, rode recall@10 com dois embedders, decida com número. Trocar para modelo "melhor" sem medir é desperdício — muitas vezes o gargalo está no chunking, não no embedding.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="chunking-embeddings"
      title="Chunking e Embeddings: as decisões que fazem ou quebram seu RAG"
      icon="🔪"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="hybrid-search-reranking"
      nextTitle="Hybrid Search + Reranking: do BM25 ao cross-encoder"
      relatedSlugs={['rag-fundamentos','hybrid-search-reranking','context-engineering']}
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
        Se 80% do resultado do RAG vem do ingest, então 80% do ingest vem de duas decisões: <strong>como você corta</strong> (chunking) e <strong>como você codifica</strong> (embedding). Este
        módulo é o mapa das opções reais, os trade-offs e o que a comunidade convergiu em 2024-2026 como default.
      </p>

      <Section title="Estratégias de chunking, lado a lado" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'Como corta', 'Quando usa']}
          rows={[
            ['Fixed-size', 'N tokens ou caracteres, ignora estrutura', 'Texto homogêneo, log streams — quase nunca o certo'],
            ['Recursive', 'Tenta \\n\\n → \\n → . → palavra', 'Default para markdown, artigos, docs — 90% dos casos'],
            ['Document-aware', 'Respeita headings, listas, tabelas (markdown/HTML parsers)', 'Documentação técnica, manuais, KB estruturada'],
            ['Semantic', 'Embeda frases, quebra em saltos de similaridade', 'Texto narrativo longo, transcrições'],
            ['Proposition-based', 'LLM extrai proposições atômicas', 'Bases caras/críticas onde precisão > custo'],
            ['Contextual (Anthropic)', 'Recursive + prefixo gerado por LLM com contexto do doc', 'Bases grandes onde naive retrieval falha muito'],
          ]}
        />
      </Section>

      <Section title="Anatomia do chunk certo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Parâmetro', 'Range comum', 'Por que']}
          rows={[
            ['Tamanho (tokens)', '256 – 1024', 'Pequeno perde contexto, grande dilui sinal. 512 é o sweet spot para maioria.'],
            ['Overlap', '10% – 20%', 'Frase cortada em dois chunks sobrevive. Acima de 25%, duplica demais.'],
            ['Metadata embutida', 'source, title, section, created_at, type', 'Filtragem por metadata no retrieval é barata e potente.'],
            ['Boundary preservation', 'respeitar \\n\\n, listas, code fences', 'Cortar no meio de código é catástrofe.'],
          ]}
        />
        <Callout tone="info">
          Regra prática: 512 tokens / 15% overlap / recursive splitter respeitando markdown. Isso é 95% do que se
          precisa para começar. Otimize depois, com eval harness na mão.
        </Callout>
      </Section>

      <Section title="Contextual Retrieval: o truque de 2024 da Anthropic" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Chunk isolado perde contexto. <InlineCode>A margem operacional caiu 8% no trimestre.</InlineCode> Qual empresa?
          Qual trimestre? Sem o documento original, ninguém sabe — nem o retrieval. Solução: pré-processar.
        </p>
        <CodeBlock lang="python">{`# Para cada chunk, gerar um contexto curto usando LLM barato
from anthropic import Anthropic

client = Anthropic()

def contextualize(doc: str, chunk: str) -> str:
    prompt = f"""<document>{doc}</document>
Here is a chunk from the document:
<chunk>{chunk}</chunk>
Provide a short (50-100 tokens) context situating this chunk within the document.
Output only the context, nothing else."""
    r = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    return r.content[0].text.strip()

# Ingest
for chunk in chunks:
    ctx = contextualize(full_doc, chunk)
    embedded_text = f"{ctx}\\n\\n{chunk}"  # embeda o combinado
    vector = embedder.encode(embedded_text)
    db.insert(chunk=chunk, ctx=ctx, vector=vector)
# Prompt caching no doc full faz o custo cair ~10x`}</CodeBlock>
        <Callout tone="success">
          <strong>Resultado no paper:</strong> redução de 35% em failures de retrieval (49% quando combinado com
          hybrid search + reranking). Custo é pago uma vez no ingest, não por query. Use prompt caching do
          Anthropic para baratear em 10×.
        </Callout>
      </Section>

      <Section title="Escolha de embedding em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Dim', 'Contexto', 'Forte em']}
          rows={[
            ['OpenAI text-embedding-3-small', '1536 (ajustável)', '8191', 'Default barato, multilíngue decente'],
            ['OpenAI text-embedding-3-large', '3072 (ajustável)', '8191', 'Precisão alta; use Matryoshka para comprimir dim'],
            ['Voyage voyage-3-large', '1024', '32000', 'State-of-art em benchmarks independentes'],
            ['Cohere embed-multilingual-v3', '1024', '512', 'Forte em PT, ES, AR'],
            ['BAAI/bge-m3 (open)', '1024', '8192', 'Open-source, multilíngue, multi-funcional (dense+sparse)'],
            ['intfloat/multilingual-e5-large', '1024', '512', 'Open-source, boa base pt-BR'],
          ]}
        />
        <DecisionBox
          scenario="Começar um projeto sem muito budget e base em pt-BR"
          winner="OpenAI text-embedding-3-small OU bge-m3 (self-host)"
          winnerColor={ACCENT}
          why="text-embedding-3-small é barato (US$0.02/1M tokens), 1536-dim configurável via Matryoshka, performance sólida. bge-m3 é opção open-source no mesmo patamar, com bônus de rodar local."
          alternatives={[
            { name: 'Voyage-3-large', note: 'ganha em qualidade, mas mais caro e menos conhecido' },
            { name: 'Cohere v3', note: 'multilíngue bom, mas ecossistema menor' },
          ]}
        />
      </Section>

      <Section title="Matryoshka: reduzir dimensão sem perder precisão" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Modelos Matryoshka (OpenAI text-embedding-3, Voyage) foram treinados de forma que os primeiros N dims já
          capturam o essencial. Truncar para 512 ou 768 dims mantém ~95% da precisão, com storage e search 3-6×
          mais baratos.
        </p>
        <CodeBlock lang="python">{`# OpenAI: pedir dimensão menor na API
embedding = client.embeddings.create(
    model="text-embedding-3-large",
    input="texto",
    dimensions=768,  # default 3072, mas 768 mantém ~95% da quality
).data[0].embedding

# Depois de obter, re-normalizar se for cosine
import numpy as np
v = np.array(embedding)
v_norm = v / np.linalg.norm(v)`}</CodeBlock>
      </Section>

      <Section title="Métricas de similaridade: cosine, dot, L2" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'Fórmula', 'Quando usar']}
          rows={[
            ['Cosine similarity', 'dot(a,b) / (|a|·|b|)', 'Default para texto. Invariante a magnitude.'],
            ['Dot product', 'Σ a_i · b_i', 'Se vetores já normalizados (= cosine, mais rápido).'],
            ['Euclidean (L2)', '√Σ (a_i - b_i)²', 'Raro em texto. Mais comum em imagens/visão.'],
          ]}
        />
        <Callout tone="warn">
          Pegadinha: ao migrar entre vector DBs, confirme a métrica. pgvector aceita <InlineCode>&lt;=&gt;</InlineCode>{' '}
          (cosine), <InlineCode>&lt;#&gt;</InlineCode> (dot negativo), <InlineCode>&lt;-&gt;</InlineCode> (L2). Usar a
          errada degrada silenciosamente a qualidade.
        </Callout>
      </Section>

      <Section title="Código: pipeline de ingest com metadata + chunks + pgvector" accent={ACCENT}>
        <CodeBlock lang="python">{`from langchain_text_splitters import RecursiveCharacterTextSplitter
import psycopg
from openai import OpenAI

oai = OpenAI()
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,            # em tokens aproximados
    chunk_overlap=75,
    separators=["\\n\\n", "\\n", ". ", " ", ""],
)

def embed(text: str) -> list[float]:
    return oai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=768,
    ).data[0].embedding

conn = psycopg.connect("postgresql://...")
with conn.cursor() as cur:
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id BIGSERIAL PRIMARY KEY,
            doc_id TEXT NOT NULL,
            section TEXT,
            chunk TEXT NOT NULL,
            embedding VECTOR(768) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS chunks_emb_idx
          ON chunks USING hnsw (embedding vector_cosine_ops);
    """)

def ingest(doc_id: str, section: str, text: str) -> None:
    for piece in splitter.split_text(text):
        vec = embed(piece)
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO chunks(doc_id,section,chunk,embedding) VALUES (%s,%s,%s,%s)",
                (doc_id, section, piece, vec),
            )
    conn.commit()`}</CodeBlock>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Chunk de 1000 tokens é sempre pior que 512?"
          a={<>Não. Em bases de texto longo e narrativo (ex: transcrições), chunks maiores preservam coesão e melhoram faithfulness. Em bases fragmentadas (FAQ, KB), 256-512 é melhor. Meça com seu golden set.</>}
        />
        <QAItem
          q="Devo guardar o texto original ou só o embedding?"
          a={<>Sempre ambos. Embedding é só para busca; o texto vai para o prompt do LLM. Guardar só embedding é erro comum — você não consegue reconstruir o chunk para citar fonte.</>}
        />
        <QAItem
          q="Como lido com PDFs com tabelas e layout complexo?"
          a={<>Parser importa. Usar <InlineCode>pdfplumber</InlineCode> ou <InlineCode>unstructured.io</InlineCode> ou VLMs (Claude) para extração estruturada. PyPDF básico perde tabelas e colunas. Para PDFs críticos, OCR + VLM é o caminho.</>}
        />
        <QAItem
          q="Re-indexar toda base quando trocar embedder é obrigatório?"
          a={<>Sim. Embeddings de modelos diferentes não são comparáveis — vivem em espaços vetoriais distintos. Migrar embedder = re-embedar tudo. Por isso a escolha inicial importa (e por isso existe Matryoshka: reduzir dim sem trocar modelo).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Recursive chunking de 512/75 overlap é o default correto. Contextual Retrieval
        reduz failures em 35%+ e vale o custo no ingest. Embedding: OpenAI text-embedding-3-small ou bge-m3 cobrem
        95% dos casos — meça antes de trocar. Matryoshka corta dimensão sem perder qualidade. Sempre guarde texto
        original + embedding + metadata. Próximo: hybrid search e reranking para elevar precisão de 60% para 85%+.
      </Callout>
    </div>
  );
}
