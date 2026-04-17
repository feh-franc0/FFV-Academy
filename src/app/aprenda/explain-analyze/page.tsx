import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata: Metadata = {
  title: 'EXPLAIN ANALYZE: lendo o plano e otimizando query — FFV Academy',
  description: 'Seq Scan vs Index Scan vs Bitmap Scan, Nested Loop vs Hash Join vs Merge Join. Como ler o plano de execução PostgreSQL e transformar queries lentas em rápidas.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o planner PostgreSQL às vezes escolhe Seq Scan mesmo tendo um índice disponível?',
    options: [
      'Significa que o índice está corrompido e deve ser recriado',
      'O planner usa estatísticas de custo. Para queries que retornam muitas linhas (ex: 30% da tabela), acessar o heap randomicamente via índice gera muitas I/Os não-sequenciais — mais lento que uma varredura sequencial contígua. O planner estima o custo de cada plano e escolhe o menor. Se a estimativa estiver errada (estatísticas desatualizadas), ANALYZE força atualização.',
      'Seq Scan é sempre mais lento — o planner está errado',
      'O banco usa Seq Scan apenas quando não há índice disponível',
    ],
    correct: 1,
    explanation: 'O custo de um plano é estimado em "unidades de I/O": seq_page_cost=1.0 (padrão), random_page_cost=4.0 (padrão para HDD). Em SSDs, ajuste `random_page_cost=1.1` — isso faz o planner preferir índices mais agressivamente. O planner também considera: número de linhas (rows), largura (width), distinct values (pg_stats). Estatísticas desatualizadas → estimativas ruins → plano subótimo.',
  },
  {
    question: 'Qual algoritmo de JOIN é mais eficiente quando ambas as tabelas têm índice na coluna de join?',
    options: [
      'Hash Join é sempre o mais eficiente independente dos índices',
      'Nested Loop com Index Scan: para cada linha da tabela externa (menor), usa o índice para buscar na interna em O(log n). Eficiente quando a tabela externa é pequena. Hash Join é melhor para tabelas grandes sem índice. Merge Join requer ambas ordenadas pelo join key — eficiente se já ordenadas ou com índice que mantém ordem.',
      'O PostgreSQL sempre usa Merge Join quando há índices',
      'Não há diferença entre os algoritmos de JOIN em termos de performance',
    ],
    correct: 1,
    explanation: 'Nested Loop + Index: O(n × log m) onde n=outer, m=inner. Bom quando n é pequeno. Hash Join: O(n + m) — constrói hash table da menor tabela, faz probe na maior. Ótimo para grandes equi-joins sem índice. Merge Join: O(n log n + m log m) para sort + O(n + m) para merge. Ótimo quando dados já vêm ordenados (index scan mantém ordem). O planner escolhe baseado nos row estimates.',
  },
  {
    question: 'O que significa "actual rows" ser muito diferente de "rows" no output do EXPLAIN ANALYZE?',
    options: [
      'Significa que a query está com bug e retornando linhas erradas',
      'rows = estimativa do planner baseada em estatísticas. actual rows = linhas reais encontradas. Divergência grande significa estatísticas desatualizadas (rode ANALYZE) ou dados com distribuição não-uniforme (crie estatísticas com CREATE STATISTICS). Um erro de estimativa de 10x pode fazer o planner escolher o plano errado — Nested Loop onde Hash Join seria 100x mais rápido.',
      'actual rows é sempre igual a rows — a diferença é sempre zero',
      'Divergência é normal e não afeta a qualidade do plano',
    ],
    correct: 1,
    explanation: 'EXPLAIN ANALYZE executa a query real e mostra tempos reais. Sem ANALYZE, EXPLAIN mostra apenas estimativas. Para queries lentas em produção: use `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` para ver também hits/misses de cache de buffers. Ferramentas úteis: explain.depesz.com, pev2 (visualizador gráfico de planos), auto_explain para logar planos de queries lentas automaticamente.',
  },
];

export default function ExplainAnalyzePage() {
  return (
    <ModuleLayout
      slug="explain-analyze"
      title="EXPLAIN ANALYZE: lendo o plano e otimizando query"
      icon="🔬"
      xp={85}
      readTime={17}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="transacoes-isolation-levels"
      nextTitle="Transações e isolation levels: ACID sem decoreba"
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
        EXPLAIN ANALYZE é o raio-X de uma query PostgreSQL. Saber ler o output — identificar Seq Scans desnecessários, JOINs com estimativas ruins, sorts evitáveis — transforma debug de performance de tentativa e erro em diagnóstico preciso.
      </p>

      <Section accent={accent} title="EXPLAIN vs EXPLAIN ANALYZE">
        <CodeBlock>{`-- EXPLAIN — só estima, NÃO executa
EXPLAIN SELECT * FROM pedidos WHERE cliente_id = 42;
-- Seq Scan on pedidos  (cost=0.00..850.00 rows=12 width=48)
--   Filter: (cliente_id = 42)

-- EXPLAIN ANALYZE — executa e mede tempos reais
EXPLAIN ANALYZE SELECT * FROM pedidos WHERE cliente_id = 42;
-- Seq Scan on pedidos  (cost=0.00..850.00 rows=12 width=48)
--                      (actual time=0.015..8.234 rows=156 loops=1)
--   Filter: (cliente_id = 42)
--   Rows Removed by Filter: 9844
-- Planning Time: 0.3 ms
-- Execution Time: 8.5 ms

-- ⚠️ EXPLAIN ANALYZE EXECUTA a query — cuidado com INSERT/UPDATE/DELETE!
-- Para mutations: envolver em transação e ROLLBACK
BEGIN;
EXPLAIN ANALYZE DELETE FROM pedidos WHERE status = 'cancelado';
ROLLBACK;

-- Opções completas para diagnóstico:
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
SELECT p.id, c.nome, SUM(ip.preco * ip.quantidade) AS total
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
JOIN itens_pedido ip ON ip.pedido_id = p.id
WHERE p.criado_em >= '2024-01-01'
GROUP BY p.id, c.nome;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Lendo o output: nós e custos">
        <CodeBlock>{`-- Exemplo de output anotado:
-- Hash Join  (cost=125.00..890.00 rows=1250 width=60)
--            (actual time=5.2..45.8 rows=1180 loops=1)
--   Hash Cond: (p.cliente_id = c.id)
--   ->  Seq Scan on pedidos p  (cost=0.00..750.00 rows=10000 width=32)
--                               (actual time=0.01..12.3 rows=10000 loops=1)
--   ->  Hash  (cost=75.00..75.00 rows=4000 width=28)
--             (actual time=2.1..2.1 rows=4000 loops=1)
--         ->  Seq Scan on clientes c  (cost=0.00..75.00 rows=4000 width=28)
--                                     (actual time=0.01..1.2 rows=4000 loops=1)
-- Planning Time: 1.2 ms
-- Execution Time: 46.5 ms

-- Interpretação das colunas:
-- cost=startup..total: unidades de "custo I/O estimado"
-- rows: número de linhas estimado
-- width: largura média em bytes por linha
-- actual time=startup..total: milissegundos reais (min..max se loops>1)
-- actual rows: linhas reais retornadas
-- loops: quantas vezes o nó foi executado (nested loop pode ser 1000x)

-- BUFFERS mostra:
-- shared hit: leituras do shared_buffers (cache em memória) ← bom
-- shared read: leituras do disco ← ruim se muito alto
-- shared written: blocos sujos escritos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Scan types e quando cada um aparece">
        <ComparisonTable
          headers={['Scan Type', 'Quando aparece', 'Custo relativo']}
          rows={[
            ['Seq Scan', 'Sem índice, ou muitas linhas retornadas (>10-20% da tabela)', 'Baixo por linha, alto total'],
            ['Index Scan', 'Índice existe, poucas linhas, random_page_cost baixo', 'Alto por linha, baixo total'],
            ['Index Only Scan', 'Covering index — não precisa acessar heap', 'Mais eficiente que Index Scan'],
            ['Bitmap Index Scan', 'Índice existe mas retorna muitas linhas — agrupa I/Os', 'Intermediário'],
            ['Bitmap Heap Scan', 'Após Bitmap Index Scan — acessa heap por bloco', 'Melhor que Index Scan para médias quantidades'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- Identificar queries lentas automaticamente:
-- postgresql.conf:
-- log_min_duration_statement = 1000  (loga queries > 1s)
-- auto_explain.log_min_duration = 500  (loga planos de queries > 500ms)

-- Encontrar tabelas sem autovacuum recente (estatísticas desatualizadas):
SELECT
    schemaname,
    relname,
    n_live_tup,
    n_dead_tup,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE last_autoanalyze < NOW() - INTERVAL '1 day'
   OR last_autoanalyze IS NULL
ORDER BY n_dead_tup DESC;

-- Forçar atualização de estatísticas:
ANALYZE tabela;      -- atualiza estatísticas da tabela
VACUUM ANALYZE;      -- vacuum + analyze em todo o banco

-- pg_stat_statements — queries mais lentas:
SELECT
    query,
    calls,
    total_exec_time / calls AS avg_ms,
    rows / calls AS avg_rows
FROM pg_stat_statements
WHERE calls > 100
ORDER BY avg_ms DESC
LIMIT 20;`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Workflow de otimização:</strong> (1) identifique a query lenta com <code>pg_stat_statements</code>. (2) rode <code>EXPLAIN (ANALYZE, BUFFERS)</code>. (3) procure: Seq Scans em tabelas grandes, loops muito altos em Nested Loop, estimativas muito diferentes dos reais. (4) crie índices ou ANALYZE para estatísticas. (5) verifique melhora. Não otimize sem medir — o planner frequentemente está certo.
      </Callout>

      <Callout>
        Próximo: <strong>Transações e isolation levels</strong> — ACID de verdade: o que dirty read, phantom read e serialization anomaly significam na prática.
      </Callout>
    </div>
  );
}
