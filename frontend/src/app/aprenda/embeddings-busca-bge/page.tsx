import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, Timeline, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('embeddings-busca-bge');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'O que BGE-M3 (BAAI 2024) traz de novo em relação a BGE-large-v1.5?',
    options: [
      'Nada relevante',
      'Três modalidades de retrieval num único modelo: dense (vetor único), sparse (pesos por token estilo SPLADE), e multi-vector (ColBERT-like). Multilingual nativo em 100+ línguas. Suporta queries longas (8192 tokens). Permite escolher modalidade na inferência sem reindex',
      'Só multilingual',
      'É menor',
    ],
    correct: 1,
    explanation: 'BGE-M3 (Multi-Functionality, Multi-Linguality, Multi-Granularity) da BAAI (Beijing Academy of AI), publicado em janeiro/2024, foi um marco. Inova em três frentes: (1) Multi-Functionality — mesmo modelo produz embeddings dense, sparse (estilo SPLADE), e multi-vector (estilo ColBERT) numa única passagem forward. (2) Multi-Linguality — treinado em 100+ línguas, com performance competitiva em PT-BR. (3) Multi-Granularity — suporta inputs de poucos tokens até 8192. Em produção: você pode indexar embeddings dense para retrieval inicial e usar a versão sparse ou multi-vector para reranking, sem múltiplos modelos. BAAI Foundation Open RAIL-M license.',
  },
  {
    question: 'O que é Matryoshka Representation Learning (MRL) e por que importa para vector search em produção?',
    options: [
      'Brincadeira russa',
      'Treinamento onde o vetor é otimizado para ser útil em múltiplas dimensões truncadas (e.g., 64, 128, 256, 512, 1024). Permite usar 256-d para retrieval barato e 1024-d para rerank de precisão. Reduz custo de memória/storage drasticamente sem retreinar. OpenAI text-embedding-3 e Voyage usam MRL',
      'Algoritmo de clustering',
      'Quantização',
    ],
    correct: 1,
    explanation: 'Matryoshka Representation Learning (Kusupati et al., NeurIPS 2022) treina o modelo de modo que os primeiros N coeficientes do vetor formem uma representação útil por si só. Ou seja, truncar um vetor de 1024-d para 256-d ainda dá um embedding decente — sem retreinar. Em produção: indexe os 1024-d completos, mas para retrieval inicial use só 256-d (4× menos memória/cálculo), e re-pontue top-K com 1024-d para precisão. OpenAI text-embedding-3 (large e small), Voyage 3, BGE-M3 todos suportam MRL. Reduz custo storage em vector DBs drasticamente quando você tem bilhões de vetores.',
  },
  {
    question: 'Por que Voyage AI venceu MTEB-Retrieval em 2024-2025, em particular voyage-3-large?',
    options: [
      'Marketing',
      'Treinamento focado especificamente em retrieval (não embeddings genéricos), corpus curado, contrastive learning com hard negatives mining agressivo, MRL nativo, instruction-tuning para tarefas. NDCG@10 médio em BEIR ~0.62 vs ~0.55 do OpenAI text-embedding-3-large. Preço similar a OpenAI',
      'É open source',
      'Mais barato',
    ],
    correct: 1,
    explanation: 'Voyage AI (startup de ex-Stanford NLP people) focou laser em embeddings de retrieval, não em embeddings genéricos. Diferenciais: (1) corpus de treinamento curado para tarefas de IR (BEIR-like). (2) Mining agressivo de hard negatives (passagens lexicalmente similares mas irrelevantes — força o modelo a aprender semântica fina). (3) Instruction-tuning permitindo task-specific prompts. (4) MRL nativo. Resultado: voyage-3-large dominou MTEB-Retrieval (média NDCG@10 ~0.62 vs ~0.55 do OpenAI text-embedding-3-large). Voyage também tem variantes especializadas (voyage-code-3 para código, voyage-finance-2 para financeiro).',
  },
  {
    question: 'Quando usar embedding multilingual (BGE-M3, multilingual-e5) vs monolíngue?',
    options: [
      'Sempre multilingual',
      'Multilingual quando: (a) corpus tem mistura de línguas, (b) queries vêm em línguas diferentes dos docs (cross-lingual retrieval), (c) você não quer manter múltiplos índices. Monolíngue quando: corpus 100% PT-BR ou EN, modelos monolíngues podem ganhar 2-5 pontos NDCG no domínio específico',
      'Nunca multilingual',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Embeddings multilingual (BGE-M3, multilingual-e5-large, paraphrase-multilingual-mpnet) sacrificam um pouco de performance por idioma em troca de coerência cross-lingual. Vantagens: cross-lingual retrieval (query em PT-BR, docs em EN), suporta corpora mistos sem múltiplos pipelines. Desvantagens: em corpora 100% PT-BR, modelos monolíngues fine-tuned no domínio podem ganhar +2-5 NDCG. Em 2026, a recomendação prática: comece com BGE-M3 (multilingual, gratuito, ótimo PT-BR). Se medir gap significativo em produção, fine-tune um BGE-M3 ou e5 no seu domínio. Não pule para monolíngue sem dados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="embeddings-busca-bge"
      title="Embeddings de busca: BGE-M3, e5, Voyage, Cohere v3"
      icon="🧬"
      xp={70}
      readTime={14}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="semantic-search-prod"
      nextTitle="Semantic search em produção: indexing, sharding, freshness"
      quiz={quiz}
    >
      <Section title="O ecossistema de embeddings em 2026" accent={accent}>
        <p>
          Em 2026 o mercado de embeddings de busca consolidou em ~6 players principais: BGE-M3 (BAAI, open source), e5
          (Microsoft, open source), Voyage AI (proprietário, API), Cohere embed v3 (proprietário), OpenAI
          text-embedding-3 (proprietário), e Jina Embeddings v3 (open source). Cada um com trade-offs distintos.
        </p>
        <p>
          Este módulo mapeia o ecossistema, explica diferenças arquiteturais (bi-encoder vs multi-vector vs sparse),
          conceitos como Matryoshka, e dá um framework de decisão concreto.
        </p>
        <Callout tone="info" icon="📚">
          Referências: BGE-M3 paper (Chen et al. 2024, arXiv:2402.03216); E5 paper (Wang et al. 2022, &quot;Text Embeddings
          by Weakly-Supervised Contrastive Pre-training&quot;); Matryoshka Representation Learning (Kusupati et al.
          NeurIPS 2022); MTEB Leaderboard em huggingface.co/spaces/mteb/leaderboard.
        </Callout>
      </Section>

      <Section title="Linha do tempo dos embeddings de retrieval" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2013', label: 'word2vec', detail: 'Mikolov et al. — embeddings de palavra. Base do que viria.' },
            { when: '2018', label: 'BERT', detail: 'Devlin et al. — transformers bidirecionais. Embeddings contextuais.' },
            { when: '2019', label: 'Sentence-BERT', detail: 'Reimers & Gurevych — bi-encoder para sentenças, retrieval prático.' },
            { when: '2020', label: 'ColBERT', detail: 'Khattab & Zaharia — multi-vector retrieval. Cada token vira vetor.' },
            { when: '2021', label: 'SPLADE / DPR', detail: 'Embeddings sparse aprendidas. Dense Passage Retrieval (Facebook).' },
            { when: '2022', label: 'E5 (Microsoft)', detail: 'Pré-treino contrastive em web data. Várias variantes (small, base, large, multilingual).' },
            { when: '2023', label: 'BGE-large-v1.5 / Voyage 1 / Cohere v3', detail: 'Embeddings dedicados a retrieval ganham MTEB.' },
            { when: 'Jan/2024', label: 'BGE-M3', detail: 'Multi-funcionalidade (dense + sparse + multi-vector), multilingual, 8k tokens.' },
            { when: 'Jan/2024', label: 'OpenAI text-embedding-3', detail: 'MRL nativo, dimensão configurável (256-3072).' },
            { when: '2024-2025', label: 'Voyage-3-large domina MTEB', detail: 'NDCG@10 médio ~0.62 em BEIR. Hard negatives mining + instruction.' },
            { when: '2026', label: 'Especialização por domínio', detail: 'voyage-code-3, voyage-finance-2, BGE-code, Cohere multilingual v4. Fine-tune fácil.' },
          ]}
        />
      </Section>

      <Section title="Bi-encoder vs Multi-vector vs Sparse" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Bi-encoder (dense)', 'Multi-vector (ColBERT)', 'Sparse aprendida (SPLADE)']}
          rows={[
            ['Como representa', '1 vetor denso por doc/query', 'N vetores (1 por token) por doc/query', 'Vetor esparso com pesos por vocabulário'],
            ['Similaridade', 'Produto escalar (cosseno)', 'Sum of max similarities (MaxSim)', 'Produto escalar sobre vocab'],
            ['Indexação', 'HNSW/IVF', 'Especial (PLAID, etc)', 'Inverted index (como BM25)'],
            ['Tamanho índice (1M docs)', '~1.5 GB (1024-d fp16)', '~30 GB (200 tokens × 128-d)', '~2 GB (esparso comprimido)'],
            ['Precisão típica', 'Boa', 'Excelente (top em benchmarks)', 'Boa-excelente'],
            ['Latência query', '<10ms (ANN)', '20-100ms (mais complexa)', '<20ms (inverted index)'],
            ['Exemplos', 'BGE-M3 (dense mode), e5, Voyage', 'BGE-M3 (multi-vector mode), ColBERTv2', 'BGE-M3 (sparse mode), SPLADE++'],
          ]}
        />
        <Callout tone="info" icon="💡">
          Em 2026, <strong>BGE-M3</strong> é uma das poucas opções que oferece os três modos no mesmo modelo. Você pode
          indexar dense para retrieval barato e usar sparse ou multi-vector para reranker, sem dependências adicionais.
        </Callout>
      </Section>

      <Section title="Matryoshka Representation Learning (MRL)" accent={accent}>
        <p>
          MRL (Kusupati et al., NeurIPS 2022) treina o modelo de modo que truncar o vetor para K dimensões iniciais ainda
          produza uma representação útil. Em produção, isso permite trade-off custo × precisão sem retreinar.
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Loss de treinamento MRL"
          formula="L = Σ_{d ∈ {64, 128, 256, 512, 1024}} L_contrastive(emb[:d])"
          parts={[
            { text: 'emb[:d]', annotation: 'truncamento do embedding para as primeiras d dimensões' },
            { text: 'L_contrastive', annotation: 'loss contrastive padrão (InfoNCE) aplicada a cada nível de truncamento' },
            { text: 'Σ_d', annotation: 'soma sobre múltiplas dimensões — força o modelo a "concentrar" informação no início do vetor' },
          ]}
        />
        <CodeBlock lang="python">{`# OpenAI text-embedding-3-large suporta MRL nativo
from openai import OpenAI
client = OpenAI()

resp_full = client.embeddings.create(
    model="text-embedding-3-large",
    input=["semântica de busca em produção"],
    dimensions=3072,  # default
)
resp_small = client.embeddings.create(
    model="text-embedding-3-large",
    input=["semântica de busca em produção"],
    dimensions=256,   # MRL truncado — ainda útil!
)

# Vantagem: 256-d ocupa 12× menos memória que 3072-d
# - Vector DB: 1B vetores × 3072-d × 4 bytes = 12 TB
# - Vector DB: 1B vetores × 256-d × 4 bytes  = 1 TB
# Ou com int8 quantização: 256 bytes → 250 GB
# Trade-off: NDCG@10 cai ~2-3 pontos em 256-d`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          <strong>Padrão em produção</strong>: dual indexing. Indexe 256-d (ou 384-d) para retrieval rápido (top-100),
          re-pontue top-K com 1024-d (ou 3072-d) para precisão final. Cohere v3, OpenAI v3, BGE-M3 e Voyage 3 suportam.
        </Callout>
      </Section>

      <Section title="Comparativo dos top 6 embeddings de busca em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Origem', 'Open?', 'Dim', 'Max tokens', 'MTEB-R médio', 'Custo']}
          rows={[
            ['BGE-M3', 'BAAI (China, 2024)', 'Sim (MIT)', '1024', '8192', '~0.59', 'Self-host (GPU)'],
            ['e5-large-v2', 'Microsoft (2023)', 'Sim (MIT)', '1024', '512', '~0.57', 'Self-host (GPU)'],
            ['multilingual-e5-large', 'Microsoft (2023)', 'Sim (MIT)', '1024', '512', '~0.56', 'Self-host'],
            ['Voyage-3-large', 'Voyage AI (2024)', 'Não (API)', '1024 (MRL)', '32k', '~0.62', '$0.12/1M tokens'],
            ['Cohere embed-v3', 'Cohere (2023)', 'Não (API)', '1024 (MRL)', '512', '~0.58', '$0.10/1M tokens'],
            ['OpenAI text-embedding-3-large', 'OpenAI (2024)', 'Não (API)', '3072 (MRL)', '8191', '~0.55', '$0.13/1M tokens'],
            ['Jina v3', 'Jina AI (2024)', 'Sim (CC-BY-NC)', '1024 (MRL)', '8192', '~0.56', 'Self-host'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          MTEB-R médio é uma média global em BEIR. Performance varia muito por domínio. Para PT-BR especificamente,
          BGE-M3 e Cohere multilingual lideram em benchmarks da comunidade brasileira.
        </Callout>
      </Section>

      <Section title="Como escolher na prática" accent={accent}>
        <DecisionBox
          scenario="RAG corporativo, dados sensíveis, on-prem obrigatório"
          winner="BGE-M3 self-hosted"
          winnerColor={accent}
          why="Open source MIT, sem licenciamento; Multilingual nativo (excelente PT-BR); Multi-functionality (dense + sparse + multi-vec no mesmo modelo); Roda em GPU L4/A10 com throughput decente (~500 docs/s)"
          alternatives={[
            { name: 'multilingual-e5-large — mais antigo, dimensão menor, mas estável e testado' }, { name: 'Jina v3 — boa qualidade, mas licença não-comercial restritiva' }
          ]}
        />
        <DecisionBox
          scenario="Startup com pouco volume, prioridade DX, sem ops de GPU"
          winner="Voyage-3-large ou Cohere embed-v3"
          winnerColor={accent}
          why="API simples, zero ops; Estado-da-arte em benchmark (Voyage); Variantes especializadas (code, finance, multilingual); Pricing previsível por tokens"
          alternatives={[
            { name: 'OpenAI text-embedding-3 — competitivo, integração trivial com stack OpenAI' }
          ]}
        />
        <DecisionBox
          scenario="Volume massivo (>10B tokens/mês), custo crítico"
          winner="BGE-M3 self-hosted em GPU própria"
          winnerColor={accent}
          why="Custo por 1M tokens via API: $0.10-0.15 = $10-15 por bilhão de tokens; 10B tokens via Voyage = $1k-1.5k por mês; GPU A10/L4 dedicada amortizada: $300-500/mês, processa muito mais que isso; Economia escala com volume"
          alternatives={[]}
        />
      </Section>

      <Section title="Código: BGE-M3 com sentence-transformers e FlagEmbedding" accent={accent}>
        <CodeBlock lang="python">{`# Opção 1: FlagEmbedding (oficial BAAI, suporta os 3 modos)
from FlagEmbedding import BGEM3FlagModel

model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)
output = model.encode(
    ["query: como ajustar autovacuum em postgres",
     "passage: O autovacuum do Postgres elimina tuplas mortas..."],
    return_dense=True,
    return_sparse=True,
    return_colbert_vecs=True,
)
# output["dense_vecs"]:    matriz (N, 1024)
# output["lexical_weights"]: lista de dicts {token_id: peso} (sparse)
# output["colbert_vecs"]:  lista de matrizes (tokens_doc, 128)

# Opção 2: sentence-transformers (dense only, mas integração trivial)
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-m3")
embeddings = model.encode(
    ["docs aqui..."],
    normalize_embeddings=True,
    batch_size=32,
    show_progress_bar=False,
)

# Throughput típico em A10 (24GB):
# - BGE-M3 dense: ~500 docs/s (batch 32, sequência média 256)
# - Custo por bilhão de docs: ~$0.30 amortizado (24h × $13/h)
# - Equivalente via Voyage API: ~$120 (1B docs × 200 tokens × $0.12/1M / 200)`}</CodeBlock>
      </Section>

      <Section title="Tarefas de instrução e prompt prefixing" accent={accent}>
        <p>
          Modelos modernos (e5, BGE, Voyage, Cohere) foram treinados com prefixes específicos para indicar tipo de input.
          Ignorar isso degrada performance em 2-5 pontos NDCG.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'e5 family', v: 'queries devem ter prefixo "query: ", passages devem ter "passage: "' },
            { k: 'BGE-M3', v: 'queries com "Represent this sentence for searching relevant passages: " ou versão simplificada' },
            { k: 'Voyage', v: 'Parâmetro input_type="query" ou "document" na API' },
            { k: 'Cohere v3', v: 'Parâmetro input_type="search_query" ou "search_document"' },
            { k: 'OpenAI v3', v: 'Sem prefixo necessário (sem instruction tuning para retrieval específico)' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Sempre leia o model card antes de usar. Trocar prefixos errados ou esquecê-los é o erro #1 em projetos de
          RAG amador. Pode fazer NDCG cair pela metade.
        </Callout>
      </Section>

      <Section title="Fine-tuning para domínio" accent={accent}>
        <p>
          Embeddings genéricos atingem ~0.55-0.62 NDCG@10 em benchmarks como BEIR. Para seu domínio específico,
          fine-tuning com 1-10k pares (query, doc_relevante, doc_irrelevante) pode subir esse número para 0.70-0.80.
        </p>
        <CodeBlock lang="python">{`# Fine-tuning de BGE-M3 com contrastive loss (didático)
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

model = SentenceTransformer("BAAI/bge-m3")

# Triplets: (query, doc_relevante, doc_irrelevante)
triplets = [
    InputExample(texts=["como tunar autovacuum", "postgres autovacuum settings...", "react state management..."]),
    # ... 1k-10k triplets do seu domínio
]
loader = DataLoader(triplets, shuffle=True, batch_size=16)
loss = losses.TripletLoss(model=model)

model.fit(
    train_objectives=[(loader, loss)],
    epochs=3,
    warmup_steps=100,
    output_path="./bge-m3-postgres-domain",
)

# Hard negative mining (recomendado):
# - Para cada query relevante, busque top-50 com modelo base
# - Pegue exemplos top que NÃO são relevantes (anotação manual ou heurística)
# - Esses são "hard negatives" — força o modelo a aprender distinções finas`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="Embedding de tamanho menor é sempre pior?"
          a="Com MRL, a degradação é suave: passar de 1024-d para 256-d perde ~2-3 NDCG. Para muitos casos, vale o trade-off de 4× menos memória."
        />
        <QAItem
          q="Posso misturar embeddings de modelos diferentes no mesmo índice?"
          a="Não — vetores de modelos diferentes vivem em espaços incomparáveis. Toda comparação semântica viraria ruído. Use UM modelo por índice."
        />
        <QAItem
          q="Quantização int8 ou binário compromete muito?"
          a="int8 (4× menos memória): NDCG cai ~1-2 pontos, ainda excelente. Binary (32× menos): NDCG cai ~5-10 pontos, viável para retrieval grosso (top-1000) + rerank fino com float."
        />
        <QAItem
          q="E para código fonte, qual embedding?"
          a="Voyage-code-3 lidera benchmarks. Alternativas open: jina-embeddings-v2-base-code, CodeBERT, ou BGE-code (2024)."
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          Em 2026, BGE-M3 é a escolha default para times pragmáticos: open source, multilingual, multi-funcional. Voyage
          e Cohere lideram em benchmarks mas custam por API. OpenAI v3 é &quot;competitivo&quot; — não líder, mas integração
          trivial.
        </Callout>
        <Callout tone="info" icon="💡">
          Próximo: semantic search em produção — ingest pipelines, sharding, freshness, blue-green reindex, custo de
          embedding em escala bilhão.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
