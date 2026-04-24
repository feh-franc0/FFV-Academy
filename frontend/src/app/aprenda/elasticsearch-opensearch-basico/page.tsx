import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('elasticsearch-opensearch-basico');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual foi o motivo do fork OpenSearch a partir do Elasticsearch?',
    options: [
      'Performance',
      'Em 2021, Elastic mudou licença de Apache 2.0 pra SSPL (impede revenda como serviço gerenciado). AWS, que oferecia Elasticsearch gerenciado, forkou a última versão Apache 2.0 como OpenSearch. Hoje são projetos separados, com APIs similares mas divergindo progressivamente',
      'Eram produtos diferentes',
      'Decisão técnica apenas',
    ],
    correct: 1,
    explanation: 'SSPL (Server Side Public License) é licença copyleft agressiva que exige quem oferecer o software como serviço abrir o stack inteiro — inviável para AWS. Elastic queria bloquear "free rider" AWS. AWS respondeu com fork OpenSearch. 3 anos depois, APIs ainda são largely compatíveis, mas features divergem: Elastic tem Machine Learning mais maduro, OpenSearch tem neural search/reranker integrados. Escolha pragmática envolve licença preferida + feature set + gestão (self-host vs managed).',
  },
  {
    question: 'O que são shards e replicas em Elasticsearch/OpenSearch e por que importam?',
    options: [
      'Só backups',
      'Shards: partições horizontais do índice (um índice de 100GB = 5 shards de 20GB distribuídos). Permitem paralelismo e escala. Replicas: cópias de cada shard em outros nodes, garantem HA e adicionam leitura paralela. Escolha errada de shard count é dor comum — poucos = gargalo, muitos = overhead',
      'Só failover',
      'Termos intercambiáveis',
    ],
    correct: 1,
    explanation: 'Shards decidem escala; replicas decidem disponibilidade. Regra prática: shard entre 10–50GB de dados é sweet spot. Índice que vai crescer a 500GB em 2 anos precisa ~10-30 shards desde o início (shards não podem ser aumentados pós-criação sem reindexar). 1 replica é mínimo pra HA; 2 replicas melhoram leitura em read-heavy. Erro clássico: default 5 shards x 1 replica pra índice de 50MB — overhead > dado.',
  },
  {
    question: 'Qual o papel de mapping em Elasticsearch e por que defini-lo explicitamente é crítico em produção?',
    options: [
      'Decoração',
      'Mapping define tipo de cada campo e analisador usado para tokenização — equivalente a schema. Auto-detection é traiçoeiro: campo "codigo" com valor "12345" vira long, quebra busca por "01234". Mapping explícito com analyzer português, keyword vs text, e multi-fields (title + title.raw) é essencial pra search comportar',
      'Só performance',
      'Só visual',
    ],
    correct: 1,
    explanation: 'Auto-mapping é conveniente em dev, desastroso em prod: primeiro documento define tipo de cada campo — se primeiro "age" vem "25", todo o resto falha com "25 anos". Boa prática: criar índice com mapping explícito antes de indexar. Campos "text" com analyzer (português) pra busca, "keyword" pra agregações/filtros exatos. Multi-field permite ter title analisado + title.raw bruto. Template de index + aliases orquestram migrations sem downtime.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="elasticsearch-opensearch-basico"
      title="Elasticsearch/OpenSearch: quando sair de Postgres"
      icon="🔍"
      xp={55}
      readTime={13}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="bm25-tf-idf-sem-misticismo"
      nextTitle="BM25 e TF-IDF sem misticismo"
      quiz={quiz}
    >
      <Section title="Quando FTS Postgres não dá mais" accent={accent}>
        <p>
          Sinais de que é hora de Elasticsearch/OpenSearch: corpus passando de ~10M documentos, necessidade de facetas/aggregations complexas (e-commerce de milhões de produtos), relevance tuning avançado com learning-to-rank, queries em &gt;50/s com latência exigida &lt;100ms, multi-tenancy por índice. Sob esses sintomas, investir em stack dedicada vale.
        </p>
      </Section>

      <Section title="Conceitos fundamentais" accent={accent}>
        <CodeBlock lang="bash">{`# Índice: equivalente a tabela (coleção de documentos JSON)
# Shard: partição horizontal de um índice (Lucene segment na prática)
# Replica: cópia redundante de um shard em outro node
# Node: processo Elasticsearch/OpenSearch
# Cluster: conjunto de nodes cooperando

# Regra de dimensionamento:
# - Shard tamanho alvo: 10–50 GB
# - Shards / node: 20 * heap_size_gb (heap típica 32GB → 640 shards max)
# - Replicas: 1 mínimo (HA), 2 se leitura pesada
# - Nodes dedicados: master (3), data, ingest, coordinating

# Anti-padrão:
# - 100 shards pra 100MB de dado (overhead destrói performance)
# - 1 shard gigante pra 500GB (hot shard, impossível escalar)`}</CodeBlock>
      </Section>

      <Section title="Mapping explícito é obrigatório" accent={accent}>
        <CodeBlock lang="json">{`PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "pt_custom": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "portuguese_stop", "portuguese_stemmer"]
        }
      },
      "filter": {
        "portuguese_stemmer": { "type": "stemmer", "language": "portuguese" },
        "portuguese_stop":    { "type": "stop", "stopwords": "_portuguese_" }
      }
    }
  },
  "mappings": {
    "properties": {
      "title":       { "type": "text", "analyzer": "pt_custom",
                       "fields": { "raw": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "pt_custom" },
      "price":       { "type": "double" },
      "category":    { "type": "keyword" },
      "tags":        { "type": "keyword" },
      "created_at":  { "type": "date" }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Query DSL básico" accent={accent}>
        <CodeBlock lang="json">{`POST /products/_search
{
  "size": 20,
  "query": {
    "bool": {
      "must":   [{ "multi_match": { "query": "tenis corrida",
                                    "fields": ["title^3", "description"] } }],
      "filter": [{ "term":  { "category": "calcados" } },
                 { "range": { "price": { "gte": 100, "lte": 500 } } }]
    }
  },
  "aggs": {
    "by_brand": { "terms": { "field": "brand.raw", "size": 10 } },
    "price_hist": { "histogram": { "field": "price", "interval": 50 } }
  },
  "sort": [{ "_score": "desc" }, { "created_at": "desc" }]
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Campo com ^N no multi_match dá boost: "title^3" significa match no título pesa 3x vs description. Tuning de boost é 40% do trabalho de relevância inicial.
        </Callout>
      </Section>

      <Section title="Aliases pra reindexar sem downtime" accent={accent}>
        <CodeBlock lang="json">{`// Mapping é imutável em campos existentes.
// Padrão: índices versionados + alias estável
// App sempre escreve/lê via alias "products"

// 1. Cria índice novo
PUT /products_v2 { "mappings": { ... novo schema ... } }

// 2. Reindexa
POST /_reindex { "source": { "index": "products_v1" },
                 "dest":   { "index": "products_v2" } }

// 3. Troca alias atomicamente
POST /_aliases {
  "actions": [
    { "remove": { "index": "products_v1", "alias": "products" } },
    { "add":    { "index": "products_v2", "alias": "products" } }
  ]
}

// 4. Deleta o velho quando confortável
DELETE /products_v1`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Aliases + reindex é padrão industrial. Código da app só conhece o alias. Mudanças de schema são operação sem downtime percebida pelo usuário.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
