import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata = getModuleMetadata('indices-que-funcionam');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um índice em (a, b) NÃO é usado para `WHERE b = 1` mas é usado para `WHERE a = 1`?',
    options: [
      'O banco sempre usa todos os índices disponíveis',
      'Índices B-tree compostos são ordenados pela primeira coluna, depois pela segunda. Para buscar por b=1 sem fixar a, o banco teria que varrer todas as entradas do índice (equivalente a Seq Scan). Já `WHERE a = 1` usa o índice porque as entradas de a=1 estão agrupadas. Regra: um índice composto (a, b, c) pode ser usado por prefixos: (a), (a,b), (a,b,c).',
      'O PostgreSQL usa índices compostos de trás para frente automaticamente',
      'Índices compostos só funcionam com INNER JOIN',
    ],
    correct: 1,
    explanation: 'É o "leftmost prefix rule": índice em (sobrenome, nome) funciona para buscar por sobrenome ou por (sobrenome, nome), mas não só por nome. Solução: criar índice separado em (b) se queries por b são frequentes. Em PostgreSQL, você pode criar índices parciais: `CREATE INDEX idx_status ON pedidos(criado_em) WHERE status = \'pendente\'` — índice menor e mais eficiente para queries filtradas.',
  },
  {
    question: 'O que é um "covering index" e por que ele é mais rápido que um índice regular?',
    options: [
      'Covering index é apenas um nome diferente para índice composto',
      'Covering index contém todos os campos necessários pela query — o banco satisfaz a query lendo apenas o índice, sem acessar o heap (tabela principal). Um "Index-Only Scan" é 2-10x mais rápido que "Index Scan + Heap Fetch". Crie com INCLUDE: `CREATE INDEX idx ON tabela(id) INCLUDE (nome, email)` — id no índice, nome e email incluídos mas sem fazer parte da ordenação.',
      'Covering index bloqueia a tabela durante a criação',
      'Covering index só funciona para queries com SELECT *',
    ],
    correct: 1,
    explanation: 'Cada acesso ao heap (tabela principal) é uma I/O potencial. Para queries SELECT id, nome FROM tabela WHERE id = 42, se o índice contém (id, nome), o banco lê apenas o índice — sem tocar na tabela. INCLUDE adiciona colunas "extras" no índice sem incluí-las na ordenação B-tree (economiza espaço e mantém o índice menor). Cuidado: índices maiores ocupam mais memória cache.',
  },
  {
    question: 'Quando usar um índice GIN em vez de B-tree no PostgreSQL?',
    options: [
      'GIN é sempre preferível ao B-tree por ser mais rápido',
      'GIN (Generalized Inverted Index) é para buscas dentro de coleções: arrays, JSONB, tsvector (full-text search), e hstore. Um índice B-tree em uma coluna JSONB não consegue buscar por campos internos. GIN indexa cada elemento/chave individualmente, permitindo `atributos @> \'{"cor": "azul"}\'` ou `tags @> ARRAY[\'python\']`. Custo: mais lento para atualizar, mais memória.',
      'GIN é específico para busca geoespacial',
      'GIN só funciona em PostgreSQL 14 e superior',
    ],
    correct: 1,
    explanation: 'Tipos de índice no PostgreSQL: B-tree (padrão, =, <, >, BETWEEN, LIKE "prefix%"), Hash (apenas =, mais rápido que B-tree para equality), GIN (arrays, JSONB, full-text), GiST (geometrias, ranges, full-text alternativo), BRIN (Block Range Index, para tabelas huge com dados naturalmente ordenados como timestamps). Para full-text: `CREATE INDEX idx_fts ON artigos USING GIN (to_tsvector(\'portuguese\', titulo || \' \' || corpo))`.',
  },
];

export default function IndicesQueFuncionamPage() {
  return (
    <ModuleLayout
      slug="indices-que-funcionam"
      title="Índices que funcionam: B-tree, hash, GIN, covering, composto"
      icon="📇"
      xp={80}
      readTime={16}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="explain-analyze"
      nextTitle="EXPLAIN ANALYZE: lendo o plano e otimizando query"
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
        Um índice mal criado pode ser tão ruim quanto nenhum índice. Entender quando o planner usa um índice, quando não usa (e por quê), e como criar índices que realmente eliminam o trabalho do banco — essa é a diferença entre queries de 100ms e 10s.
      </p>

      <Section accent={accent} title="Como funciona um índice B-tree">
        <p>
          Um índice B-tree é uma árvore balanceada onde as folhas contêm os valores indexados e ponteiros para as linhas na tabela (heap). Buscar por um valor é O(log n) — varrer a tabela seria O(n). O banco mantém o índice atualizado em toda inserção, atualização e deleção.
        </p>
        <CodeBlock>{`-- Criando índices básicos
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_criado ON pedidos(criado_em);

-- Verificar índices de uma tabela:
\d pedidos   -- no psql
-- ou:
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'pedidos';

-- Quando o índice É usado:
-- ✅ WHERE cliente_id = 42          -- equality
-- ✅ WHERE cliente_id IN (1, 2, 3)  -- IN list
-- ✅ WHERE criado_em > '2024-01-01' -- range scan
-- ✅ ORDER BY cliente_id LIMIT 10   -- sort com limit (index scan evita sort)
-- ✅ COUNT(*) com WHERE indexado    -- pode usar index scan

-- Quando o índice NÃO é usado (ou não deveria ser):
-- ❌ WHERE UPPER(email) = 'USER@EX.COM'   -- função na coluna destrói índice
-- ❌ WHERE id + 1 = 42                    -- expressão na coluna indexada
-- ❌ WHERE status LIKE '%pendente%'        -- % no início impede uso de índice
-- ❌ SELECT * FROM pedidos               -- sem WHERE, Seq Scan é melhor
-- ❌ Tabelas muito pequenas (Seq Scan é mais rápido)

-- Para funções na coluna — índice funcional/expressão:
CREATE INDEX idx_email_lower ON clientes(LOWER(email));
-- Agora funciona: WHERE LOWER(email) = 'user@ex.com'`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Índices compostos: a ordem importa">
        <CodeBlock>{`-- Índice composto — leftmost prefix rule
CREATE INDEX idx_pedidos_cliente_status ON pedidos(cliente_id, status);

-- Usa o índice ✅ (prefixo da esquerda):
SELECT * FROM pedidos WHERE cliente_id = 42;
SELECT * FROM pedidos WHERE cliente_id = 42 AND status = 'pendente';

-- NÃO usa o índice ❌ (só coluna da direita):
SELECT * FROM pedidos WHERE status = 'pendente';
-- Solução: criar índice separado em (status)

-- Ordem das colunas no índice composto importa:
-- (cliente_id, status): bom para queries por cliente, ou (cliente, status)
-- (status, cliente_id): bom para queries por status, ou (status, cliente)
-- Regra: coluna mais seletiva (menos valores repetidos) primeiro — geralmente

-- Índice composto para ORDER BY eficiente:
CREATE INDEX idx_criado_status ON pedidos(criado_em DESC, status);
-- Agora: SELECT * FROM pedidos ORDER BY criado_em DESC LIMIT 10
-- usa Index Scan sem Sort adicional!`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tipos de índice e casos especiais">
        <ComparisonTable
          headers={['Tipo', 'Operadores suportados', 'Melhor para', 'Cuidado']}
          rows={[
            ['B-tree (padrão)', '=, <, >, <=, >=, BETWEEN, LIKE prefix', 'Tudo que é comparável', 'Não serve para @> @? no JSONB'],
            ['Hash', '= apenas', 'Equality pura, mais rápido que B-tree', 'Não suporta range, ORDER BY'],
            ['GIN', '@>, @?, @@, &&', 'Arrays, JSONB, full-text (tsvector)', 'Update lento, maior em memória'],
            ['GiST', '&&, @>, @<, <<, |>>', 'Geospatial, ranges, exclusão', 'Mais complexo de criar'],
            ['BRIN', '=, <, >, BETWEEN', 'Tabelas enormes ordenadas (logs, IoT)', 'Muito impreciso, lê mais blocos'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- Índice parcial — indexa só parte da tabela
CREATE INDEX idx_pedidos_pendentes ON pedidos(criado_em)
WHERE status = 'pendente';
-- Índice menor, mais rápido, menos memória
-- Só funciona para queries que incluem o WHERE do índice

-- Índice GIN para JSONB e arrays
CREATE INDEX idx_produtos_jsonb ON produtos USING GIN (atributos);
-- Habilita: WHERE atributos @> '{"cor": "azul"}'
-- e: WHERE atributos ? 'desconto'  (chave existe)

CREATE INDEX idx_artigos_tags ON artigos USING GIN (tags);
-- Habilita: WHERE tags @> ARRAY['python', 'sql']

-- Índice GIN para full-text search
CREATE INDEX idx_artigos_fts ON artigos
USING GIN (to_tsvector('portuguese', titulo || ' ' || corpo));
-- Habilita: WHERE to_tsvector('portuguese', titulo || ' ' || corpo)
--           @@ to_tsquery('portuguese', 'sql & performance')

-- Covering index com INCLUDE
CREATE INDEX idx_pedidos_covering ON pedidos(cliente_id)
INCLUDE (total, status, criado_em);
-- Query: SELECT total, status FROM pedidos WHERE cliente_id = 42
-- Resultado: Index-Only Scan — não toca no heap

-- Criar índice sem bloquear produção (CONCURRENTLY)
CREATE INDEX CONCURRENTLY idx_novo ON tabela_grande(coluna);
-- Demora mais, mas não bloqueia writes durante a criação`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras práticas:</strong> índice em foreign keys é obrigatório (PostgreSQL não cria automaticamente, ao contrário do MySQL). Índice em colunas frequentes no WHERE e ORDER BY. Use INCLUDE para covering indexes em queries de leitura intensa. Crie CONCURRENTLY em produção. Monitore índices não usados: <code>pg_stat_user_indexes</code> mostra <code>idx_scan = 0</code>.
      </Callout>

      <Callout>
        Próximo: <strong>EXPLAIN ANALYZE</strong> — como ler o plano de execução e transformar queries lentas em rápidas.
      </Callout>
    </div>
  );
}
