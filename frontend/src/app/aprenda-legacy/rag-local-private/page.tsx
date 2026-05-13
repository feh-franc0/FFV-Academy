import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, CodeBlock, ComparisonTable, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rag-local-private');

const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o principal motivo para fazer RAG 100% local?',
    options: [
      'Sempre mais rápido',
      'Privacidade — dados sensíveis (legal, médico, corporativo) não saem do device/rede; conformidade LGPD/GDPR/HIPAA mais simples; sem custo de API por query; funciona offline',
      'Apenas para hobby',
      'Cumpre OWASP',
    ],
    correct: 1,
    explanation: 'RAG local resolve casos onde mandar dado para OpenAI/Anthropic não é viável: bancos, hospitais, governo, indústria. Custo zero por query depois de instalado. Trade-off: qualidade dos modelos abertos (Qwen 2.5, Llama 3.3) ainda 5-10% atrás dos top closed-source.',
  },
  {
    question: 'BGE-M3 destaca-se por:',
    options: [
      'Ser pago',
      'Multilingual (100+ línguas, incluindo PT-BR de qualidade), multi-granularity (sentence + paragraph + document) e multi-functionality (dense + sparse + colbert) em UM modelo. Estado da arte open-source para embeddings.',
      'Funcionar só em inglês',
      'Não suportar PT-BR',
    ],
    correct: 1,
    explanation: 'BGE-M3 (BAAI, 2024) é o embedding model open-source mais versátil em 2026. Para RAG local em PT-BR, é a escolha default. Alternativas: e5-mistral, jina-embeddings-v3, gte-Qwen2.',
  },
  {
    question: 'LanceDB vs Qdrant para RAG local:',
    options: [
      'São idênticos',
      'LanceDB é embedded (single-file, sem servidor, parquet-like) — ideal para apps desktop/CLI; Qdrant roda em servidor (Docker), com features mais avançadas (filtering complexo, multi-tenancy) — ideal para servidor multi-usuário',
      'Apenas LanceDB suporta vetores',
      'Apenas Qdrant é open-source',
    ],
    correct: 1,
    explanation: 'LanceDB é a opção "SQLite para vetores" — embedded, zero ops, ótimo para apps locais. Qdrant é a opção "Postgres para vetores" — servidor, multi-usuário, features avançadas. Ambos open-source, escolha por shape de deploy.',
  },
  {
    question: 'docling vs Unstructured.io para parsing de PDF:',
    options: [
      'São idênticos',
      'docling (IBM, 2024) faz parsing PDF de qualidade superior (preserva estrutura, tabelas, formulas), open-source, roda local; Unstructured.io tem modelo similar mas com tier comercial. Para RAG local sério, docling é o caminho',
      'docling não existe',
      'Apenas Unstructured suporta tabelas',
    ],
    correct: 1,
    explanation: 'Parsing de PDF é tradicionalmente o ponto fraco de RAG. docling (IBM) e Unstructured.io destravam qualidade de extração — tabelas, formulas LaTeX, código preservado. docling roda 100% local, sem API calls.',
  },
  {
    question: 'Hybrid search no contexto local:',
    options: [
      'Não funciona local',
      'Combina BM25 (keyword) + dense embeddings com Reciprocal Rank Fusion. Útil porque dense puro perde nomes próprios, códigos, IDs específicos; BM25 puro perde paraphrase. LanceDB e Qdrant suportam nativamente.',
      'Só funciona com API paga',
      'Substitui RAG',
    ],
    correct: 1,
    explanation: 'Hybrid search é state-of-the-art para retrieval em 2026, local ou não. RRF combina rankings de BM25 e dense embeddings. Ganho típico: 10-20% MRR sobre dense puro em datasets reais com termos técnicos e códigos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rag-local-private"
      title="RAG 100% local e privado: LanceDB, Ollama, Qdrant local"
      icon="🔒"
      xp={70}
      readTime={14}
      trailName="Local LLMs & Edge AI"
      trailColor={accent}
      nextSlug="eval-offline-local"
      nextTitle="Avaliação offline local"
      quiz={quiz}
    >
      <Section title="Quando RAG precisa ser local" accent={accent}>
        <p className="text-sm leading-6">
          Cenários comuns em 2026 onde dado NÃO pode sair: contratos legais (escritórios), prontuários médicos (hospitais), código proprietário (corporações), documentos confidenciais (defesa, governo). Toda chamada para OpenAI/Anthropic vira incidente de compliance. A alternativa: stack 100% local, do parsing à geração.
        </p>
      </Section>

      <Section title="A pilha em uma página" accent={accent}>
        <FlowDiagram
          title="RAG local end-to-end"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '📄', label: 'Ingest — docling', desc: 'PDF/DOCX/HTML → markdown estruturado' },
            { icon: '✂️', label: 'Chunking semantic', desc: 'Splits semânticos (não fixed-size cego)' },
            { icon: '🧬', label: 'Embed — BGE-M3', desc: 'Local via sentence-transformers' },
            { icon: '🗄️', label: 'Index — LanceDB ou Qdrant', desc: 'Hybrid (dense + BM25)' },
            { icon: '🔍', label: 'Retrieval + rerank', desc: 'RRF + BGE-reranker' },
            { icon: '🤖', label: 'Generate — Ollama (Qwen 2.5)', desc: 'Local, sem rede externa' },
          ]}
        />
      </Section>

      <Section title="Setup mínimo" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Instalar Ollama + modelo
brew install ollama
ollama pull qwen2.5:14b           # ou llama3.3:70b se tiver VRAM
ollama pull bge-m3                # embedding model

# 2. Python env
uv venv && source .venv/bin/activate
uv pip install docling lancedb sentence-transformers FlagEmbedding`}</CodeBlock>
        <CodeBlock lang="python">{`from docling import DocumentConverter
from sentence_transformers import SentenceTransformer
import lancedb

# 1. Parse PDF mantendo estrutura
converter = DocumentConverter()
doc = converter.convert('contrato.pdf')
chunks = doc.export_to_markdown().split('\\n\\n')  # simplificado

# 2. Embed local (sem API)
embedder = SentenceTransformer('BAAI/bge-m3')
vectors = embedder.encode(chunks)

# 3. Index local em LanceDB
db = lancedb.connect('./vault')
table = db.create_table('docs', data=[
    {'text': c, 'vector': v.tolist()} for c, v in zip(chunks, vectors)
])

# 4. Query
query_vec = embedder.encode('cláusula de rescisão')
results = table.search(query_vec).limit(5).to_list()

# 5. Generate com Ollama local
import ollama
ctx = '\\n\\n'.join(r['text'] for r in results)
response = ollama.chat(
    model='qwen2.5:14b',
    messages=[{
        'role': 'user',
        'content': f'Contexto:\\n{ctx}\\n\\nPergunta: O que diz a cláusula de rescisão?'
    }]
)
print(response['message']['content'])`}</CodeBlock>
      </Section>

      <Section title="Hybrid search — código" accent={accent}>
        <CodeBlock lang="python">{`# LanceDB suporta hybrid nativamente com FTS + vector
import lancedb
from lancedb.rerankers import LinearCombinationReranker

db = lancedb.connect('./vault')
table = db.open_table('docs')

# Cria índice FTS (BM25-like) sobre 'text'
table.create_fts_index('text')

# Hybrid search
reranker = LinearCombinationReranker(weight=0.7)
results = (
    table.search('cláusula rescisão contratual', query_type='hybrid')
    .vector(embedder.encode('cláusula rescisão contratual').tolist())
    .rerank(reranker=reranker)
    .limit(10)
    .to_list()
)`}</CodeBlock>
      </Section>

      <Section title="Reranking com cross-encoder local" accent={accent}>
        <CodeBlock lang="python">{`from FlagEmbedding import FlagReranker

# Roda local — sem API
reranker = FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=True)

# Pair-wise scoring
pairs = [['cláusula rescisão', candidate['text']] for candidate in results[:50]]
scores = reranker.compute_score(pairs, normalize=True)

# Reorder
reranked = sorted(zip(scores, results), reverse=True)[:5]`}</CodeBlock>
      </Section>

      <Section title="Casos onde isso resolve" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Setor', 'Dado típico', 'Por que precisa ser local']}
          rows={[
            ['Jurídico', 'Contratos, peças processuais, jurisprudência interna', 'Privilege, LGPD, segredo profissional'],
            ['Médico', 'Prontuários, exames, protocolos', 'HIPAA, LGPD Art. 11 (dado sensível)'],
            ['Corporativo (M&A, jurídico)', 'Due diligence, comitês', 'NDA estrito, vazamento = lawsuit'],
            ['Defesa/Governo', 'Documentos classificados', 'Regulação setorial específica'],
            ['Banking/Fintech', 'Transações, modelagem de risco', 'Compliance + custo de API em escala'],
          ]}
        />
      </Section>

      <Section title="Performance esperada (M3 Ultra 128GB)" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Embed throughput (BGE-M3)', v: '~200-500 chunks/segundo' },
            { k: 'Search latency LanceDB local', v: '<50ms para 100k docs' },
            { k: 'Rerank 50 candidates', v: '~200-500ms' },
            { k: 'Generate (Qwen 2.5 14B)', v: '20-40 tokens/segundo' },
            { k: 'Total per-query end-to-end', v: '~2-5 segundos para resposta completa' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
