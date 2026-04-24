import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-tuning-de-workload-real');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o primeiro lugar pra olhar em query lenta?',
    options: [
      'Aumentar RAM',
      'EXPLAIN ANALYZE + BUFFERS — mostra plan, cost estimado vs actual, rows, I/O. 80% das queries lentas têm explicação óbvia no plan (Seq Scan em vez de Index, estimativa 1000x off, etc.)',
      'Criar índice random',
      'Trocar DB',
    ],
    correct: 1,
    explanation: 'Diagnóstico antes de tratamento. EXPLAIN ANALYZE com BUFFERS mostra: qual plan foi escolhido, estimados vs actual rows, tempo por node, I/O (cache hit/miss). Diferença grande estimado/actual = ANALYZE. Seq Scan em tabela grande com WHERE seletivo = índice faltando.',
  },
  {
    question: 'O que pg_stat_statements fornece?',
    options: [
      'Tickets de suporte',
      'Estatísticas CUMULATIVAS de cada query (normalizada) — total_time, calls, mean_time, rows. Permite identificar top queries por tempo total OU por média. É a ferramenta #1 pra encontrar onde tunar',
      'Só histórico recente',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'pg_stat_statements é extension (enable em shared_preload_libraries). Cada query (normalizada — $1 em vez de literal) tem linha com stats cumulativos. Query TOP: "quais queries consomem mais tempo TOTAL no banco?" ORDER BY total_exec_time DESC. Resto é detail.',
  },
  {
    question: 'Quanto uma otimização BEM feita pode ganhar?',
    options: [
      '10%',
      '10-1000x em casos de query errada. Ex: Seq Scan em 10M rows → Index Scan = 30s → 5ms. Adicionar INCLUDE colunas pra Index Only Scan = 50ms → 2ms. Em production impact é gigante',
      '1%',
      '2x',
    ],
    correct: 1,
    explanation: 'Big wins em tuning: (1) índice faltando em coluna WHERE (100-1000x). (2) Stats desatualizadas (planner escolhe Seq Scan por estimativa errada). (3) Rewrite query (subquery → CTE → JOIN right). (4) Particionamento em tabela huge. Ganho é exponencial quando algo está fundamentalmente errado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-tuning-de-workload-real"
      title="Capstone: tuning de workload — query de 30s pra 50ms"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto" accent={accent}>
        <p>
          Dataset real (100M+ rows), query inicial lenta (30s+). Diagnosticar, tunar, documentar antes/depois.
        </p>
      </Section>

      <Section title="Workflow de tuning" accent={accent}>
        <CodeBlock lang="sql">{`-- 1. IDENTIFIQUE (pg_stat_statements)
SELECT query, calls, round(total_exec_time::numeric, 2) AS total_ms,
       round((total_exec_time / calls)::numeric, 2) AS mean_ms,
       rows
FROM pg_stat_statements
WHERE total_exec_time > 10000
ORDER BY total_exec_time DESC LIMIT 20;

-- 2. DIAGNOSTIQUE (EXPLAIN ANALYZE)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(*) FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.country = 'BR' AND o.created_at > '2026-01-01'
GROUP BY u.name ORDER BY 2 DESC LIMIT 10;

-- Ler plano: Seq Scan? Rows estimate off 100x? Sort external?

-- 3. HIPÓTESE + AÇÃO
-- Hipótese A: falta índice em (country, created_at)
CREATE INDEX CONCURRENTLY idx_users_country ON users (country);
CREATE INDEX CONCURRENTLY idx_orders_created_user ON orders (created_at, user_id);

-- 4. MEDIR depois
ANALYZE users; ANALYZE orders;
EXPLAIN ANALYZE ...

-- 5. DOCUMENTAR
-- Query: SELECT u.name, COUNT(*) ...
-- Before: 28.5s, Seq Scan users, Nested Loop
-- After: 45ms, Index Scan both sides, Hash Join
-- Change: 2 indexes added, ANALYZE run
-- Impact: 633x speedup in total db time (pg_stat_statements)`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Relatório MD: cada query com before/after plan (EXPLAIN ANALYZE)</li>
          <li>Mudança schema (ALTER/INDEX) em migration SQL rastreável</li>
          <li>pg_stat_statements antes vs depois — tempo total economizado</li>
          <li>Graphite/Prometheus dashboard (se prod) mostrando latency drop</li>
          <li>Post-mortem escrito: o que aprendeu, padrão pra replicar em outros projetos</li>
        </ul>
        <Callout tone="success" icon="🎓">
          Projeto que paga o salário: DB tuning em prod pode economizar milhares em infra/mês. Este capstone te prepara pra conversa real de performance engineering.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
