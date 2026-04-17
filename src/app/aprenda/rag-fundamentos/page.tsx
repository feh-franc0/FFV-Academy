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
  title: 'RAG: por que "só jogar tudo no LLM" não funciona — FFV Academy',
  description:
    'RAG (Retrieval-Augmented Generation) na prática: limite de contexto, alucinação, arquitetura em dois estágios. Quando RAG vence fine-tuning e por que naive RAG falha em produção.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o problema central que RAG resolve?',
    options: [
      'O LLM roda devagar',
      'Conhecimento congelado (cutoff de treino), janela de contexto finita e alucinação — RAG injeta trechos relevantes em tempo de query, transformando conhecimento estático em dinâmico',
      'O LLM não fala português',
      'Reduzir o custo da GPU',
    ],
    correct: 1,
    explanation:
      'LLM treinado para em uma data e tem contexto limitado. RAG separa conhecimento (externo, atualizável) de raciocínio (modelo). Você indexa seus documentos, recupera os trechos relevantes à pergunta e injeta como contexto. Isso atualiza sem re-treinar, reduz alucinação e permite citar fontes.',
  },
  {
    question: 'Por que "naive RAG" (top-k embedding search + prompt) falha em produção?',
    options: [
      'Porque é lento',
      'Porque (1) similaridade vetorial ignora intenção, (2) chunks ruins retornam ruído, (3) top-k fixo perde contexto longo, (4) sem reranking, relevância baixa passa junto com a alta. Na prática, precisão cai abaixo de 50% em bases não triviais',
      'Porque o LLM não entende embeddings',
      'Porque exige GPU',
    ],
    correct: 1,
    explanation:
      'Cosine similarity entre embeddings não é relevância — é similaridade lexical/semântica superficial. "Como cancelo minha conta?" e "Como criar conta?" têm embeddings próximos e sentidos opostos. Por isso pipelines sérios fazem hybrid search + reranking + query transformation, não só top-k vector.',
  },
  {
    question: 'Quando fine-tuning supera RAG?',
    options: [
      'Sempre que possível',
      'Quando você precisa de (a) estilo/tom específico, (b) formato estrito de saída, (c) tarefa onde o modelo base não sabe o skill, não o fato. Conhecimento factual atualizável é território do RAG',
      'Quando o conteúdo é em inglês',
      'Quando você tem poucos documentos',
    ],
    correct: 1,
    explanation:
      'Regra prática: RAG para fatos (atualizáveis, com citação). Fine-tuning para comportamento (tom, formato, skill ausente). Misturar os dois é comum — LoRA para estilo + RAG para conhecimento. Fine-tuning para ensinar fatos é caro, frágil e desatualiza junto com o modelo.',
  },
  {
    question: 'Por que a arquitetura em dois estágios (retrieve + generate) é mais robusta que single-pass?',
    options: [
      'Single-pass não existe',
      'Porque separa duas responsabilidades: "quais trechos são relevantes?" (retrieve) e "o que respondo?" (generate). Cada uma tem métricas próprias (recall@k vs faithfulness) e falhas independentes — isso dá observability e debug. Single-pass junta tudo numa caixa-preta',
      'Por questão de custo de GPU',
      'Porque dá dois níveis de cache',
    ],
    correct: 1,
    explanation:
      'Separação de concerns é a base de debug em RAG. Quando a resposta sai errada, você olha: o retrieval trouxe o trecho certo? (recall@k, context precision). O generate usou o contexto? (faithfulness, answer relevance). Sem essa separação, debug vira adivinhação.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rag-fundamentos"
      title='RAG: por que "só jogar tudo no LLM" não funciona'
      icon="🧩"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="chunking-embeddings"
      nextTitle="Chunking e Embeddings: as decisões que fazem ou quebram seu RAG"
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
        &quot;Mas por que não jogo o documento todo no contexto do LLM?&quot; é a primeira pergunta de quem começa a trabalhar com
        IA em produção. A resposta envolve três limites duros — <strong>cutoff de treino</strong>, <strong>janela de contexto</strong>, <strong>alucinação</strong> — que juntos
        formam a parede onde RAG (Retrieval-Augmented Generation) se encaixa como solução. Este é o mapa do território.
      </p>

      <Section title="Os três limites que criam a necessidade de RAG" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Limite', 'O que é', 'Por que quebra na prática']}
          rows={[
            ['Cutoff de treino', 'Modelo só sabe o que existia até a data em que o dataset foi congelado', 'Pergunta sobre evento de ontem? Ele inventa. Dados internos do seu sistema? Nunca viu.'],
            ['Janela de contexto', 'Limite físico de tokens por request (200k, 1M, 2M — depende do modelo)', 'Sua base tem 10GB. Mesmo modelo de 2M tokens não encaixa. E custo cresce linear no input.'],
            ['Alucinação', 'LLM gera texto plausível, não verdadeiro. Sem âncora factual, inventa.', 'Respostas confiantes e erradas. Em suporte, compliance ou medicina, isso é inaceitável.'],
          ]}
        />
      </Section>

      <Section title="A arquitetura em dois estágios" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          RAG separa duas responsabilidades. Primeiro, <strong>recupera</strong> os trechos relevantes à pergunta a partir
          de uma base indexada. Depois, <strong>gera</strong> a resposta usando esses trechos como contexto. O modelo vira
          um raciocinador sobre evidência fornecida, não uma enciclopédia.
        </p>
        <ArchDiagram title="Pipeline RAG básico" accent={ACCENT}>{`
            ┌──────────────────────┐
            │  Pergunta do usuário │
            └─────────┬────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  1. Retrieve         │
           │  embed → vector DB   │
           │  top-k trechos       │
           └─────────┬────────────┘
                     │
                     ▼
           ┌──────────────────────┐
           │  2. Augment Prompt   │
           │  [pergunta + trechos]│
           └─────────┬────────────┘
                     │
                     ▼
           ┌──────────────────────┐
           │  3. Generate (LLM)   │
           │  resposta + citações │
           └──────────────────────┘
`}</ArchDiagram>
      </Section>

      <Section title="Pipeline de indexação (offline)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Antes que qualquer pergunta seja feita, a base precisa ser preparada. Isso roda em batch — hora em hora,
          diário, ou via event-driven quando documentos mudam.
        </p>
        <ArchDiagram title="Indexing pipeline" accent={ACCENT}>{`
  Documento  →  Parser  →  Chunker  →  Embedding  →  Vector DB
   (.pdf,        (texto     (pedaços    (modelo        (pgvector,
   .md, html)    limpo)     com overlap) de embedding)  Pinecone,
                                                         Qdrant,
                                                         Weaviate)
`}</ArchDiagram>
        <Callout tone="warn">
          <strong>80% do resultado vem do pipeline de ingestão.</strong> Parser ruim (PDF mal extraído), chunks do
          tamanho errado (muito grande dilui sinal, muito pequeno corta contexto), embedding fraco (genérico para
          domínio técnico) — qualquer um dos três quebra o RAG. Na prática, a maior parte do tempo de engenharia de
          RAG está no ingestion, não no generate.
        </Callout>
      </Section>

      <Section title="RAG vs Fine-tuning: quando usar cada um" accent={ACCENT}>
        <DecisionBox
          scenario="Time quer atualizar respostas com base em documentos que mudam toda semana"
          winner="RAG"
          winnerColor={ACCENT}
          why="Atualizar RAG = re-indexar. Barato, rápido, sem downtime. Fine-tuning para base que muda semanalmente é retraining contínuo — caro e frágil."
          alternatives={[
            { name: 'Fine-tuning', note: 'desatualiza junto com o modelo; custo por release' },
            { name: 'Longo contexto direto', note: 'só funciona se a base cabe em contexto e custo por query compensa' },
          ]}
        />
        <DecisionBox
          scenario='Produto precisa de tom específico ("responda como um médico sênior, formal e cauteloso")'
          winner="Fine-tuning (LoRA)"
          winnerColor={ACCENT}
          why="Tom e formato são skill, não fato. Fine-tuning com exemplos de estilo grava o comportamento no modelo. RAG para tom é prompt-engineering frágil."
          alternatives={[
            { name: 'System prompt detalhado', note: 'funciona para estilo simples; degrada com complexidade' },
            { name: 'RAG', note: 'errada — tom não é conteúdo recuperável' },
          ]}
        />
        <DecisionBox
          scenario="Assistente de suporte com base de conhecimento interna + tom de marca"
          winner="RAG + Fine-tuning leve (ambos)"
          winnerColor={ACCENT}
          why="LoRA captura tom da marca e formato das respostas (skill). RAG fornece conteúdo atualizado da base (fato). Separação clara de responsabilidades."
        />
      </Section>

      <Section title="Por que naive RAG (top-k + embedding) falha em produção" accent={ACCENT}>
        <Callout tone="danger">
          O tutorial de RAG que você leu na internet (embed + Pinecone + top-k=5 + prompt) bate em ~40-60% de
          precisão em bases reais. Para chegar em 85%+, precisa de pipeline sério: chunking inteligente, hybrid
          search (BM25+vector), reranking, query transformation, metadados estruturados.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Problema', 'Sintoma', 'Mitigação']}
          rows={[
            ['Chunks do tamanho errado', 'Resposta falta contexto (chunk pequeno) ou dilui o sinal (chunk grande)', 'Recursive chunking + contextual retrieval (Anthropic)'],
            ['Embedding ignora intenção', '"Cancelar conta" e "Criar conta" têm similaridade alta', 'Hybrid search (BM25 + vector) com RRF'],
            ['Top-k fixo', 'Documento denso devolve 5 chunks quase idênticos', 'MMR (maximal marginal relevance) para diversidade'],
            ['Sem reranking', 'Posição 1-5 tem ruído misturado com relevante', 'Cross-encoder rerank (Cohere, Voyage, Jina)'],
            ['Query ambígua', '"Como isso funciona?" sem contexto volta tudo genérico', 'HyDE, query expansion, multi-query'],
          ]}
        />
      </Section>

      <Section title="Código mínimo: naive RAG em Python" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Exemplo pedagógico — serve para ver o fluxo, não para produção.
        </p>
        <CodeBlock lang="python">{`# Pipeline mínimo: docs → embeddings → query → LLM
from anthropic import Anthropic
import numpy as np
from sentence_transformers import SentenceTransformer

client = Anthropic()
embedder = SentenceTransformer("BAAI/bge-m3")

# 1. Indexação (offline)
docs = [
    "Para cancelar conta, acesse Configurações → Conta → Encerrar.",
    "Para criar conta nova, vá em cadastrar.com/novo e preencha email.",
    "Senha esquecida? Use o link 'recuperar' na tela de login.",
]
doc_vecs = embedder.encode(docs, normalize_embeddings=True)

# 2. Retrieval (online)
def retrieve(query: str, k: int = 2) -> list[str]:
    q_vec = embedder.encode(query, normalize_embeddings=True)
    scores = doc_vecs @ q_vec  # cosine (vetores já normalizados)
    top_idx = np.argsort(-scores)[:k]
    return [docs[i] for i in top_idx]

# 3. Generate
def answer(query: str) -> str:
    context = "\\n\\n".join(retrieve(query))
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"Responda a partir do contexto. Se não estiver no contexto, diga que não sabe.\\n\\nContexto:\\n{context}\\n\\nPergunta: {query}"
        }],
    )
    return msg.content[0].text

print(answer("Esqueci minha senha, o que faço?"))`}</CodeBlock>
        <Callout tone="info">
          Rode isso, veja funcionar, e entenda: é o degrau zero. Em produção você troca o embedder genérico por
          domain-tuned, adiciona reranker, metadata filtering, chunking com overlap contextual, citações, e um
          evaluation harness que mede recall@k e faithfulness a cada deploy.
        </Callout>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="RAG funciona com modelo local (Llama, Mistral)?"
          a={<>Sim. O pipeline de retrieval é independente do modelo. O que muda é qualidade do generate — modelos menores (7B-13B) precisam de chunks melhores e prompts mais explícitos. Em geral, vale mais investir em retrieval bom do que em modelo maior.</>}
        />
        <QAItem
          q="Janela de contexto grande (1M+ tokens) mata RAG?"
          a={<>Não. Custo cresce linear no input — 1M tokens a cada query é caro e lento. Além disso, &quot;needle in haystack&quot; ainda tem degradação em modelos long-context. RAG continua sendo a estratégia econômica e precisa. Long-context é complementar, não substituto.</>}
        />
        <QAItem
          q="Preciso de vector DB dedicado (Pinecone, Weaviate, Qdrant) ou pgvector serve?"
          a={<>Para &lt;1M de vetores, <InlineCode>pgvector</InlineCode> no Postgres que você já tem é quase sempre o certo. Acima disso, ou se precisar de filtragem/metadata muito complexa, vector DB dedicada ganha. Não comece com Pinecone &quot;só porque&quot; — custo e vendor lock-in sem justificativa.</>}
        />
        <QAItem
          q="E se a pergunta exige sintetizar 30 documentos? Top-k=5 não basta."
          a={<>Dois caminhos: (1) recursive/agentic RAG — o modelo decide sub-perguntas e faz múltiplos retrievals; (2) map-reduce — resumir em paralelo os 30 docs e depois sintetizar. Para queries estruturadas (analíticas), considere SQL direto — RAG não é martelo universal.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> RAG = separar fato (externo, atualizável) de raciocínio (modelo). Pipeline tem dois
        estágios (retrieve + generate) com métricas próprias. Naive RAG é degrau zero, não produção. Qualidade vem do
        ingestion (parser + chunker + embedder + metadata), não do generate. Os próximos módulos vão fundo em cada
        peça — chunking, hybrid search, reranking e evaluation.
      </Callout>
    </div>
  );
}
