import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('indices-avancados');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando BRIN índice é a escolha certa?',
    options: [
      'Em tudo',
      'Tabelas MUITO grandes com dados naturalmente ORDENADOS (logs por timestamp, timeseries). BRIN é minúsculo (~0.1% do tamanho B-tree) e eficiente em range scans. Em dados random, inútil',
      'Deprecated',
      'Só em SQL Server',
    ],
    correct: 1,
    explanation: 'BRIN (Block Range INdex) agrupa blocks e guarda min/max por bloco. Se dados físicos são ordenados (INSERT sempre no fim por time), queries por range usam poucos blocks. Tabela 500GB de logs por dia → BRIN 10MB. Em hash/random data, B-tree vence.',
  },
  {
    question: 'Pra que serve INCLUDE em índice (covering index)?',
    options: [
      'Cosmético',
      'Adiciona colunas EXTRAS ao índice sem serem chaves — permite "index only scan" onde resposta vem só do índice, sem tocar heap (tabela). Dramático pra queries que leem poucas colunas',
      'Deprecated',
      'Só pra PK',
    ],
    correct: 1,
    explanation: 'CREATE INDEX idx_users_email ON users (email) INCLUDE (name, created_at). Query: SELECT name, created_at FROM users WHERE email = ?. Se planner escolher Index Only Scan, retorna TUDO do índice sem buscar row na tabela. Cuidado: índice fica maior.',
  },
  {
    question: 'O que partial index resolve?',
    options: [
      'Nada útil',
      'Indexa só rows que MATCH um WHERE — dramático em datasets grandes com small minority qualificando. Ex: WHERE deleted_at IS NULL em tabela onde 99% são deletadas: índice fica 100x menor',
      'Substitui GIN',
      'Só em MySQL',
    ],
    correct: 1,
    explanation: 'CREATE INDEX idx_active_users ON users (email) WHERE deleted_at IS NULL. Índice só contém rows ativas. Uso: soft delete, status-specific queries. Economia de espaço + writes mais rápidos (não indexa rows que não importam). Query deve usar MESMO predicate pra usar o índice.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="indices-avancados"
      title="Índices avançados: B-tree, BRIN, GIN, GiST, partial, covering"
      icon="🔍"
      xp={60}
      readTime={14}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="vacuum-autovacuum-bloat"
      nextTitle="Vacuum, autovacuum e bloat: causa #1 de DB morrendo"
      quiz={quiz}
    >
      <Section title="Tipos de índice" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Uso', 'Tamanho']}
          rows={[
            ['B-tree', 'Equality, range, sort (default 90% casos)', 'Médio'],
            ['BRIN', 'Tabelas grandes ordenadas (logs, timeseries)', 'Minúsculo'],
            ['GIN', 'Array, jsonb, tsvector (full-text)', 'Grande'],
            ['GiST', 'Geometric, range types, proximity', 'Médio'],
            ['Hash', 'Equality only (raramente usado — B-tree cobre)', 'Pequeno'],
            ['SP-GiST', 'Dados space-partitioning (IPs, phone numbers)', 'Variável'],
          ]}
        />
      </Section>

      <Section title="Index tipos especiais" accent={accent}>
        <CodeBlock lang="sql">{`-- Partial index — só active users
CREATE INDEX idx_users_active
ON users (email) WHERE deleted_at IS NULL;

-- Expression index — lowercased email (case-insensitive search)
CREATE INDEX idx_users_email_lower
ON users (LOWER(email));
-- Query precisa usar MESMA expression:
SELECT * FROM users WHERE LOWER(email) = 'a@b.co';

-- Covering index — evita heap fetch
CREATE INDEX idx_orders_user_covering
ON orders (user_id) INCLUDE (total, status);

-- Composite index — prefix rule: (a, b, c) serve (a), (a,b), (a,b,c) mas NÃO (b) ou (c)
CREATE INDEX idx_orders_uset ON orders (user_id, status, created_at);

-- JSONB GIN
CREATE INDEX idx_events_data ON events USING GIN (data);
SELECT * FROM events WHERE data @> '{"action": "login"}';`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO indexar" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Tabela muito pequena (&lt; 1k rows): Seq Scan &gt; índice</li>
          <li>Coluna com baixa cardinalidade (ex: boolean sem partial)</li>
          <li>Coluna muito mutável (índice retarda writes)</li>
          <li>Em prod sem dor — índice adicional custa storage + writes.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Regra: meça com EXPLAIN ANALYZE ANTES e DEPOIS. Às vezes o índice criado não é usado pelo planner (estatísticas ruins, coluna low-cardinality). pg_stat_user_indexes mostra uso real.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
