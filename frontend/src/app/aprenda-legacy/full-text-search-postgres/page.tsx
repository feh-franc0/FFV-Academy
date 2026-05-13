import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('full-text-search-postgres');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que tsvector faz diferente de um LIKE simples?',
    options: [
      'Nada',
      'tsvector normaliza: tokeniza, aplica stemming (correr → corr), remove stop words, e converte para representação otimizada para indexação GIN. Busca por "correndo" acha "corrida", "correr", "corredor" — LIKE acha só literal "correndo"',
      'Só é mais rápido',
      'Usa regex',
    ],
    correct: 1,
    explanation: 'LIKE "%correndo%" é string matching literal — perde casos de flexão verbal, plural, acentuação. tsvector (com configuração português) aplica dictionary-based stemming: reduz palavras à raiz e compara raízes. Também normaliza acentos (configurável com unaccent). O resultado é busca que "entende" morfologia básica do idioma. Combinado com índice GIN, é production-ready pra milhões de documentos.',
  },
  {
    question: 'Quando usar índice GIN vs GiST em FTS Postgres?',
    options: [
      'Sempre GiST',
      'GIN é mais rápido em busca (default para FTS) e aceita queries mais complexas; GiST é mais rápido para INSERT/UPDATE e ocupa menos espaço. Regra prática: dados read-heavy (corpus estável) use GIN; dados write-heavy (conteúdo atualiza constantemente) considere GiST',
      'Sempre GIN',
      'São idênticos',
    ],
    correct: 1,
    explanation: 'GIN (Generalized Inverted Index) é inverted index clássico: rápido pra lookup, lento pra update, espaço moderado. GiST (Generalized Search Tree) é mais genérico, update mais barato, mas busca mais lenta e menos features. Docs do Postgres recomendam GIN pra FTS em 95% dos casos. Considere GiST quando seu corpus tem churn extremo (tweets, chat em tempo real) ou quando já usa GiST pra outro tipo (geometries).',
  },
  {
    question: 'Para que serve pg_trgm e como complementa tsvector?',
    options: [
      'Substitui tsvector',
      'pg_trgm (trigram matching) fornece similaridade fuzzy — "databse" acha "database", útil pra typos e autocomplete. Não substitui tsvector; complementa: tsvector pra busca semântica/morfológica, pg_trgm pra tolerar erro de digitação e ordenação "did you mean"',
      'Só para índices',
      'É obsoleto',
    ],
    correct: 1,
    explanation: 'tsvector normaliza por stemming — bom pra flexão, ruim pra typo. pg_trgm trabalha com trigramas (substrings de 3 chars): quebra "database" em {dat, ata, tab, aba, bas, ase}, mede Jaccard similarity entre conjuntos. Palavras com typo compartilham maioria dos trigramas, então similaridade alta apesar do erro. Stack típica: tsvector no ranking principal + pg_trgm como fallback/"did you mean" / fuzzy suggestion.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="full-text-search-postgres"
      title="Full-text search em Postgres: tsvector + GIN"
      icon="🐘"
      xp={55}
      readTime={13}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="elasticsearch-opensearch-basico"
      nextTitle="Elasticsearch/OpenSearch: quando sair de Postgres"
      quiz={quiz}
    >
      <Section title="Postgres FTS é surpreendentemente capaz" accent={accent}>
        <p>
          Muito time salta pra Elasticsearch na primeira feature de busca, carregando complexidade operacional desnecessária. Para corpus abaixo de ~10M documentos e queries moderadamente complexas, Postgres com tsvector + GIN entrega resultado sólido com zero infra adicional. Só saia de Postgres quando o FTS dele deixar de servir.
        </p>
      </Section>

      <Section title="Setup básico" accent={accent}>
        <CodeBlock lang="sql">{`-- Estender capacidades do Postgres
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabela exemplo
CREATE TABLE articles (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  published_at timestamptz DEFAULT now(),
  -- Coluna generated mantém tsvector sincronizado
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')),  'A') ||
    setweight(to_tsvector('portuguese', coalesce(body, '')),   'B') ||
    setweight(to_tsvector('portuguese', array_to_string(tags, ' ')), 'C')
  ) STORED
);

-- Índice GIN é o coração da performance
CREATE INDEX articles_search_idx ON articles USING GIN (search_vector);

-- Índice trigram pra fuzzy / similarity
CREATE INDEX articles_title_trgm_idx ON articles USING GIN (title gin_trgm_ops);`}</CodeBlock>
      </Section>

      <Section title="Query básica com ranking" accent={accent}>
        <CodeBlock lang="sql">{`-- Busca simples
SELECT id, title,
       ts_rank_cd(search_vector, query) AS rank
FROM articles,
     websearch_to_tsquery('portuguese', 'react server components') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- websearch_to_tsquery entende sintaxe tipo Google:
--   "aspas" exato, -exclude, OR
-- Alternativas: plainto_tsquery (simples), to_tsquery (bruto)

-- ts_rank (conta frequência) vs ts_rank_cd (cover density, proximidade)
-- Em geral ts_rank_cd produz melhor ranking para humanos.`}</CodeBlock>
      </Section>

      <Section title="Weights A/B/C/D" accent={accent}>
        <p>
          Cada token pode receber peso (A {'>'} B {'>'} C {'>'} D). Convenção prática: título = A, corpo = B, tags/categorias = C, metadata = D. ts_rank aceita array <code>{'{0.1, 0.2, 0.4, 1.0}'}</code> (índices D, C, B, A) pra ajustar impacto. Resultado: matches em título pesam muito mais que no corpo — reflete intuição de relevância.
        </p>
      </Section>

      <Section title="Fuzzy fallback com pg_trgm" accent={accent}>
        <CodeBlock lang="sql">{`-- "Did you mean" — quando a busca FTS não retornar nada
SELECT title, similarity(title, 'databse') AS sim
FROM articles
WHERE title % 'databse'           -- operador trigram
ORDER BY sim DESC
LIMIT 5;

-- Workflow híbrido no backend:
-- 1. Tenta tsvector @@ websearch_to_tsquery
-- 2. Se zero resultado, roda similarity fallback
-- 3. UI sugere "Você quis dizer: <top match>?"

-- Autocomplete com pg_trgm:
-- trigram index permite WHERE title ILIKE 'prefix%' rápido em milhões de rows`}</CodeBlock>
      </Section>

      <Section title="Limites e quando migrar" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Postgres FTS começa a doer em: corpus {'>'} ~10M docs, necessidade de sharding pesado, queries com aggregations/facets complexas (faceted navigation e-commerce), ou quando relevance tuning com learning-to-rank vira prioridade. Nessas horas, Elasticsearch/OpenSearch ou Typesense fazem sentido.
        </Callout>
        <Callout tone="success" icon="✅">
          Mas até esse ponto, Postgres FTS evita um banco inteiro de infra paralela — e mantém consistência transacional com seus dados. Economia operacional real.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
