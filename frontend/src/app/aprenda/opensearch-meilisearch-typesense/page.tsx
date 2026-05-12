import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, DecisionBox, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('opensearch-meilisearch-typesense');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental de stack entre Meilisearch e Typesense vs Elasticsearch/OpenSearch?',
    options: [
      'Nenhuma',
      'Meilisearch (Rust, single-binary) e Typesense (C++, single-binary) são otimizados para "instant search" — typo tolerance, prefix search, sub-50ms p99 — com setup minimalista. Não usam Lucene/JVM. ES/OpenSearch são engines IR completas com Lucene/JVM, sharding pesado, agregações analíticas. Trade-off: simplicidade e velocidade vs escala e features',
      'Linguagem',
      'Cor do logo',
    ],
    correct: 1,
    explanation: 'Meilisearch e Typesense focam num caso de uso bem definido: search-as-you-type em e-commerce, catálogos, documentação. Não tentam ser engines analíticos. Por isso conseguem ser drasticamente mais simples: single binary, sem JVM, sem cluster coordination obrigatório, defaults sensatos. Elasticsearch/OpenSearch são ferramentas de propósito geral — full-text, agregações, vector, time-series, logs, security. Mais poderosos, mas com custo operacional alto: JVM tuning, sharding, ILM, snapshots. Para "instant search" em produto pequeno-médio, MeiliSearch/Typesense fazem em horas o que ES levaria semanas.',
  },
  {
    question: 'Por que OpenSearch existe se já tem Elasticsearch?',
    options: [
      'Acidente',
      'OpenSearch é fork da AWS (abril/2021) da última versão Apache 2.0 do ES (7.10), após Elastic NV relicenciar para SSPL/Elastic License. Hoje é governado pela Linux Foundation, com participação AWS, SAP, Red Hat. Roadmap divergente: foco em integrações AWS, ML/observability, e licença permissiva',
      'Idêntico ao ES',
      'Sucessor oficial',
    ],
    correct: 1,
    explanation: 'O fork OpenSearch é o resultado da batalha de licenciamento entre Elastic NV e AWS. Após o relicenciamento de jan/2021, AWS forkou e renomeou (ES → OpenSearch, Kibana → OpenSearch Dashboards) sob Apache 2.0. Em ago/2024, Elastic voltou a oferecer AGPL também. Mas o fork persiste com governance independente. Diferenças hoje: OpenSearch tem plugins de ML/observability AWS-native (Neural Search com Sagemaker, alerting AWS-style); ES tem features comerciais (Elastic AI Assistant, Enterprise Search, machine learning anomaly detection) e roadmap próprio. Em 2026: ES é melhor se você quer features premium da Elastic NV; OpenSearch é melhor se está em AWS e quer Apache 2.0 estrita.',
  },
  {
    question: 'Em que cenário Typesense supera Elasticsearch para instant search?',
    options: [
      'Sempre',
      'Catálogos pequenos-médios (< 10M docs) onde latência sub-50ms e typo tolerance built-in importam mais que agregações analíticas pesadas. Setup minutos vs horas, faceted search nativo, defaults perfeitos para e-commerce. ES exige tunar analyzer, fuzzy queries, e cluster para alcançar mesma UX',
      'Nunca',
      'Em time-series',
    ],
    correct: 1,
    explanation: 'Typesense foi desenhado para um caso específico: instant search com typo tolerance, faceted filtering, prefix matching, e latência consistente sub-50ms. Tudo isso é default. Em ES, você precisa configurar: analyzer com edge_ngram para prefix, fuzzy queries com prefix_length, multi_fields para faceting eficiente, query_string ou multi_match com tuning fino, e ainda dimensionar cluster. Typesense entrega isso out-of-the-box em single binary. Para um catálogo de 1M produtos e-commerce, Typesense entrega UX superior em uma tarde. Mas escalar para 1B docs com agregações pesadas? ES vence sem discussão.',
  },
  {
    question: 'Meilisearch suporta vector search?',
    options: [
      'Não',
      'Sim desde v1.3 (julho/2024). Implementação com hnswlib, suporta híbrido (BM25 + vector com semantic_ratio configurável). Mais simples que ES/Qdrant mas adequado para casos sub-50M vetores. Não é uma vector DB completa, é "vector dentro do engine de search"',
      'Apenas com plugin',
      'Só BM25',
    ],
    correct: 1,
    explanation: 'Meilisearch adicionou vector search nativo na versão 1.3. A implementação usa hnswlib internamente, suporta embedders (OpenAI, HuggingFace, Cohere, modelo customizado via REST), e oferece hybrid search com semantic_ratio (0=puro BM25, 1=puro vector, valores intermediários combinam). Em 2026 a feature está madura. Adequado para corpora até dezenas de milhões de vetores. Para bilhões, vector DBs dedicadas (Qdrant, Weaviate, Pinecone) ainda vencem em throughput e memória. Mas para 90% dos casos de instant search com semântica, Meilisearch é solução completa em single binary.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="opensearch-meilisearch-typesense"
      title="OpenSearch vs Meilisearch vs Typesense: qual escolher"
      icon="⚖️"
      xp={65}
      readTime={13}
      trailName="Search & IR Profundo"
      trailColor={accent}
      nextSlug="hybrid-search-rerank"
      nextTitle="Hybrid search + reranking: BM25 + dense + cross-encoder"
      quiz={quiz}
    >
      <Section title="Três engines, três filosofias" accent={accent}>
        <p>
          OpenSearch, Meilisearch e Typesense são os três engines open source mais escolhidos em 2026 fora do
          Elasticsearch. Cada um nasceu para resolver um problema diferente:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-slate-300">
          <li><strong>OpenSearch</strong> — fork da AWS, identidade próxima do ES. Para times que precisam de engine completa com agregações, observability, security analytics, e querem licença permissiva (Apache 2.0).</li>
          <li><strong>Meilisearch</strong> — instant search com typo tolerance, escrito em Rust. Single binary, defaults perfeitos para e-commerce e documentação. Adicionou vector e hybrid em 2024.</li>
          <li><strong>Typesense</strong> — instant search com foco em faceted search, escrito em C++. Single binary, latência sub-50ms consistente, GraphQL-like query DSL.</li>
        </ul>
        <Callout tone="info" icon="📚">
          Documentações oficiais: opensearch.org, meilisearch.com/docs, typesense.org/docs. Para benchmarks
          independentes, ver MTEB (Massive Text Embedding Benchmark) para retrieval e o blog post anual de Vespa sobre
          large-scale IR.
        </Callout>
      </Section>

      <Section title="Comparativo de alto nível" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'OpenSearch', 'Meilisearch', 'Typesense']}
          rows={[
            ['Linguagem', 'Java (JVM)', 'Rust', 'C++'],
            ['Engine de IR', 'Apache Lucene (fork ES 7.10)', 'Próprio (charabia, hnswlib)', 'Próprio (forwardindex + posting list)'],
            ['Setup mínimo', 'Cluster de 3 nós típico, JVM tuning', 'Single binary, ~1 min', 'Single binary, ~1 min'],
            ['Typo tolerance', 'Manual (fuzzy queries)', 'Default, configurável por threshold', 'Default, configurável (num_typos)'],
            ['Faceted search', 'Aggregations, requer tuning', 'Nativo (filterable attributes)', 'Nativo (best-in-class)'],
            ['Vector search', 'kNN com Lucene HNSW', 'hnswlib, hybrid com semantic_ratio', 'HNSW, hybrid via vector_query'],
            ['Sharding', 'Nativo, automático', 'Não tem (single node) — v2 promete', 'Cluster com raft, sharding manual'],
            ['Linguagem da query', 'Query DSL JSON', 'REST simples + filtros estilo SQL', 'REST + GraphQL-like'],
            ['Latência p99', '20-200 ms (depende de cluster)', '5-50 ms', '5-30 ms'],
            ['Escala típica', '10⁸+ docs', '10⁷-10⁸ docs', '10⁷-10⁸ docs'],
            ['Licença', 'Apache 2.0', 'MIT', 'GPL v3 (Apache 2.0 para client SDKs)'],
            ['Managed cloud', 'AWS OpenSearch Service, Aiven, Bonsai', 'Meilisearch Cloud', 'Typesense Cloud'],
          ]}
        />
      </Section>

      <Section title="OpenSearch: a evolução do ES forkado" accent={accent}>
        <p>
          OpenSearch é praticamente um ES 7.10 com 5 anos de divergência. O coração ainda é Lucene, segments imutáveis,
          refresh interval, translog, sharding. A REST API é altamente compatível com ES 7.x. Diferenças notáveis em
          2026:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'OpenSearch ML Commons', v: 'Plugin para deployar modelos ML (BERT, BGE, custom) dentro do cluster, com Neural Search end-to-end' },
            { k: 'Anomaly Detection', v: 'Random Cut Forest nativo, alerting integrado' },
            { k: 'Security Analytics', v: 'SIEM-like com detectors de rules Sigma' },
            { k: 'Compatibilidade SDK', v: 'Clientes oficiais opensearch-py, opensearch-js, opensearch-java. NÃO use elasticsearch-client com OS (quebra em v8)' },
            { k: 'AWS integration', v: 'OpenSearch Service (gerenciado), Serverless mode, integração com Sagemaker, S3 snapshots' },
            { k: 'Governance', v: 'Linux Foundation desde 2024, com Steering Committee independente' },
          ]}
        />
        <Callout tone="info" icon="💡">
          Se você está em AWS, OpenSearch Service é a opção default — managed, integrado, IAM-native. Se está em GCP/Azure
          ou self-hosted, Elasticsearch managed (Elastic Cloud) ou OpenSearch self-hosted são alternativas igualmente
          válidas. A licença é hoje menos diferencial do que a integração com seu cloud provider.
        </Callout>
      </Section>

      <Section title="Meilisearch: search em Rust" accent={accent}>
        <p>
          Meilisearch nasceu em 2018 com uma promessa simples: search-as-you-type sub-50ms com typo tolerance e zero
          configuração. Escrito em Rust, single binary, defaults sensatos. Em 2024 adicionou vector + hybrid. Hoje é
          escolha popular para SaaS B2B, documentação, e e-commerce médio.
        </p>
        <CodeBlock lang="bash">{`# Setup em 30 segundos
docker run -p 7700:7700 getmeili/meilisearch:v1.10

# Indexar
curl -X POST 'http://localhost:7700/indexes/produtos/documents' \\
  -H 'Content-Type: application/json' \\
  --data-binary '[
    { "id": 1, "nome": "Notebook Dell XPS 13", "preco": 7990, "marca": "Dell" },
    { "id": 2, "nome": "MacBook Pro M4", "preco": 14990, "marca": "Apple" }
  ]'

# Buscar com typo tolerance
curl 'http://localhost:7700/indexes/produtos/search?q=notbook'
# → Encontra "Notebook Dell XPS 13" mesmo com typo

# Configurar facetable attributes
curl -X POST 'http://localhost:7700/indexes/produtos/settings/filterable-attributes' \\
  -H 'Content-Type: application/json' \\
  --data-binary '["marca", "preco"]'

# Faceted search com filtro
curl 'http://localhost:7700/indexes/produtos/search' \\
  -H 'Content-Type: application/json' \\
  --data-binary '{"q":"laptop", "filter":"preco < 10000", "facets":["marca"]}'`}</CodeBlock>
        <Callout tone="success" icon="🚀">
          Em produção: Meilisearch single-node aguenta tranquilamente catálogos de 10-50M docs com p99 &lt; 50ms.
          Para mais, espere v2 com sharding (em desenvolvimento em 2026) ou migre para Elasticsearch/Qdrant.
        </Callout>
      </Section>

      <Section title="Typesense: faceted search rei" accent={accent}>
        <p>
          Typesense foi criado por Jason Bourasaw em 2017 explicitamente como &quot;Algolia open source&quot;. Escrito em C++,
          focado em latência consistente e faceted search excepcional. Hoje é favorito de e-commerce e documentação
          dev-first (Hashicorp, AlgoliaDocs, vários SaaS usam Typesense).
        </p>
        <CodeBlock lang="bash">{`# Setup
docker run -p 8108:8108 -e TYPESENSE_API_KEY=xyz \\
  -e TYPESENSE_DATA_DIR=/data \\
  typesense/typesense:0.27.0

# Criar schema (esquema explícito, similar a ES mapping)
curl 'http://localhost:8108/collections' \\
  -X POST -H 'X-TYPESENSE-API-KEY: xyz' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "produtos",
    "fields": [
      {"name":"nome",   "type":"string"},
      {"name":"marca",  "type":"string", "facet": true},
      {"name":"preco",  "type":"float",  "facet": true},
      {"name":"embedding", "type":"float[]", "num_dim": 384,
       "embed": {"from": ["nome"], "model_config": {"model_name": "ts/all-MiniLM-L12-v2"}}}
    ]
  }'

# Indexar
curl 'http://localhost:8108/collections/produtos/documents' \\
  -X POST -H 'X-TYPESENSE-API-KEY: xyz' \\
  -d '{"id":"1","nome":"Notebook Dell XPS 13","marca":"Dell","preco":7990}'

# Hybrid search (BM25 + vector)
curl 'http://localhost:8108/collections/produtos/documents/search?q=laptop+leve&\\
query_by=nome,embedding&\\
prefix=true&\\
num_typos=2&\\
facet_by=marca&\\
filter_by=preco:<10000'`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Diferencial Typesense: <strong>auto-embedding</strong>. Você define <InlineCode>embed.from</InlineCode> no
          schema e ele gera embeddings automaticamente no índice. Não precisa de pipeline separado de embeddings.
          Para casos simples, isso elimina toda complexidade de ETL.
        </Callout>
      </Section>

      <Section title="Latência: benchmarks reais (catálogo 1M produtos)" accent={accent}>
        <CodeBlock lang="text">{`Benchmark: catálogo 1M produtos, hardware c6i.2xlarge, query simples
=====================================================================

OpenSearch (single node, default config)
  p50: 25 ms    p99: 120 ms    QPS: ~800
  + agregação por categoria adiciona ~20ms

Meilisearch (v1.10, single binary)
  p50:  4 ms    p99:  18 ms    QPS: ~3500
  + facets ~2ms a mais

Typesense (v0.27, single node)
  p50:  3 ms    p99:  12 ms    QPS: ~4200
  + facets ~1ms a mais

Observações:
- ES/OS são "engines completas" — overhead intrínseco
- MS/TS são single-purpose — overhead mínimo
- Em escala 10M+ docs com agregações pesadas, ES/OS escalam linear; MS/TS começam a apertar
- p99 baixo e consistente é vantagem real de MS/TS para UX de instant search`}</CodeBlock>
      </Section>

      <Section title="Vector e hybrid search nos três" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Capacidade', 'OpenSearch', 'Meilisearch', 'Typesense']}
          rows={[
            ['Vector field nativo', '✅ knn_vector (Lucene HNSW)', '✅ embedder + hnswlib', '✅ float[] + num_dim'],
            ['Auto-embedding na ingestão', '🟡 via Neural Search plugin', '✅ Embedder via OpenAI/HF/REST', '✅ Built-in com modelo local'],
            ['Hybrid (BM25 + vector)', '✅ neural sparse + dense, RRF', '✅ semantic_ratio configurável', '✅ vector_query + text_query'],
            ['Reranker integrado', '🟡 ML Commons (BGE, custom)', '❌ external', '❌ external'],
            ['Max dim suportada', '~16k', '~4096', '~16k'],
            ['Quantização (int8/bin)', '✅ via Lucene', '🟡 Roadmap', '🟡 Beta'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Importante: vector dentro desses engines de search é &quot;bom o suficiente&quot; para 10M-100M vetores. Para
          bilhões de vetores com requisitos de QPS extremo, vector DBs dedicadas (Qdrant, Weaviate, Milvus) ainda vencem
          em memória, throughput e features avançadas (named vectors, payload-filtered HNSW, multi-tenant).
        </Callout>
      </Section>

      <Section title="Decisão prática: qual escolher" accent={accent}>
        <DecisionBox
          scenario="E-commerce com catálogo 100k-10M produtos, instant search obrigatório"
          winner="Typesense ou Meilisearch"
          winnerColor={accent}
          why="Setup minutos vs dias; Typo tolerance e faceted nativos (UX de instant search default); p99 < 50ms consistente sem cluster tuning; Auto-embedding simplifica RAG/hybrid"
          alternatives={[
            { name: 'Algolia — managed, melhor DX, mas caro em escala' }, { name: 'Elasticsearch/OpenSearch — overkill aqui, mas se já tem cluster, reusa' }
          ]}
        />
        <DecisionBox
          scenario="Log analytics, observability, SIEM, agregações complexas"
          winner="OpenSearch (ou Elasticsearch)"
          winnerColor={accent}
          why="Lucene + agregações ricas (date_histogram, terms, percentiles, cardinality); ILM/rollover para time-series; Plugins: Kibana, Logstash, Beats, Security Analytics; Escala horizontal real (10⁹+ docs)"
          alternatives={[
            { name: 'ClickHouse — colunar, agregações brutalmente rápidas, mas full-text é segundário' }, { name: 'Loki/Grafana — log-specific, custo menor mas features de search limitadas' }
          ]}
        />
        <DecisionBox
          scenario="Documentação técnica, busca em docs internos, knowledge base"
          winner="Meilisearch + hybrid embeddings"
          winnerColor={accent}
          why="Setup trivial em single container; Hybrid search nativo (BM25 + dense); Embedders integrados (OpenAI, HF, Cohere); Tipograma e prefix matching default"
          alternatives={[
            { name: 'Typesense — equivalente, depende mais de preferência da equipe' }, { name: 'pgvector + Postgres FTS — se já tem Postgres e quer evitar mais um serviço' }
          ]}
        />
      </Section>

      <Section title="Custo operacional comparado" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'OpenSearch self-hosted', v: '3 nós m6i.large = ~$240/mês AWS + ops (JVM, snapshot, monitoring)' },
            { k: 'OpenSearch managed (AWS)', v: '$0.10-0.30/h por nó + storage. Cluster 3 nós: ~$300-700/mês' },
            { k: 'Meilisearch self-hosted', v: '1 nó c6i.large = ~$60/mês. Quase zero ops.' },
            { k: 'Meilisearch Cloud', v: '$30-300/mês conforme plano. Pago por search ops + storage' },
            { k: 'Typesense self-hosted', v: '1 nó c6i.large = ~$60/mês. Cluster raft de 3 nós ~$180/mês para HA' },
            { k: 'Typesense Cloud', v: 'Pricing por throughput + storage, similar a Meilisearch Cloud' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={accent}>
        <QAItem
          q="Meilisearch suporta cluster?"
          a="Não no sentido tradicional. Em 2026 segue single-node com snapshots. Versão 2 promete sharding. Para HA hoje, use snapshots + replicação manual ou Meilisearch Cloud."
        />
        <QAItem
          q="Typesense escala para bilhões de docs?"
          a="Não confortavelmente. Para 10B+ docs prefira Vespa, Elasticsearch ou OpenSearch. Typesense brilha em 1M-100M com latência ultra-consistente."
        />
        <QAItem
          q="Migrar de ES para OpenSearch é trivial?"
          a="Para versões compatíveis (até ES 7.10), sim — snapshots e clients são intercambiáveis. De ES 8.x para OS 2.x, há divergências de API/mapping. Não é drop-in."
        />
        <QAItem
          q="Posso usar Meilisearch ou Typesense para RAG?"
          a="Sim. Ambos suportam vector + hybrid. Para corpora médios (até dezenas de milhões de chunks), são opções válidas e mais simples que vector DBs dedicadas. Para bilhões de chunks, vá de Qdrant/Weaviate."
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <Callout tone="success" icon="✅">
          Não existe &quot;melhor engine&quot;. Existe melhor encaixe para seu caso. OpenSearch para engines completas com
          agregações e escala; Meilisearch e Typesense para instant search com UX premium e setup simples.
        </Callout>
        <Callout tone="info" icon="💡">
          Próximo módulo: hybrid search profundo — como combinar BM25 + dense + cross-encoder via Reciprocal Rank Fusion
          e atingir state-of-the-art em retrieval.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
