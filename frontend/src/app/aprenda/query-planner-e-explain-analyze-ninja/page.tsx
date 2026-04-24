import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('query-planner-e-explain-analyze-ninja');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre EXPLAIN e EXPLAIN ANALYZE?',
    options: [
      'Nomes diferentes',
      'EXPLAIN: planner mostra plano ESTIMADO com cost. EXPLAIN ANALYZE: EXECUTA a query e mostra custos REAIS + rows actual. Diferença entre estimado e real sinaliza stats desatualizadas',
      'ANALYZE substitui',
      'Só em Oracle',
    ],
    correct: 1,
    explanation: 'EXPLAIN é análise estática — cheap. EXPLAIN ANALYZE executa de verdade (incluindo writes — use BEGIN...ROLLBACK pra safety). ANALYZE sozinho (sem EXPLAIN) atualiza statistics do planner. EXPLAIN ANALYZE BUFFERS também mostra I/O (cache hits/misses) — super útil.',
  },
  {
    question: 'Qual nó é pior em plano?',
    options: [
      'Index Scan',
      'Seq Scan em tabela grande sem WHERE seletivo — lê TODAS as rows. Às vezes é OK (pequena tabela, agregação de tudo). Em tabela de 100M rows buscando 1 row, é desastre — planner escolheu errado, geralmente falta de índice ou stats desatualizadas',
      'Index Scan Only',
      'Nested Loop',
    ],
    correct: 1,
    explanation: 'Seq Scan não é intrinsecamente ruim (tabela pequena é optimization legítima). Ruim: Seq Scan em tabela grande com predicate muito seletivo (retornaria poucas rows se tivesse índice). Fix: criar índice + ANALYZE. Bitmap Scan é híbrido — bom pra selectividade média.',
  },
  {
    question: 'Por que Nested Loop é ótimo pra tabelas pequenas mas péssimo em grandes?',
    options: [
      'Não tem diferença',
      'Nested Loop: pra cada row na tabela A, busca match em B — O(A*B). Em tabelas pequenas/seletivas (A=10 rows com index em B), rápido. Em A=1M × B=1M sem index, é 1 trilhão de operações. Hash Join é melhor pra equi-joins grandes',
      'Deprecated',
      'Só pra writes',
    ],
    correct: 1,
    explanation: 'Nested Loop, Hash Join, Merge Join são os 3 algoritmos principais. Nested: ótimo pra seletivos (lado esquerdo pequeno + index no lado direito). Hash: melhor pra join grande sem ordem. Merge: ideal se ambos já sorted. Planner escolhe baseado em cost estimado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="query-planner-e-explain-analyze-ninja"
      title="Query planner: EXPLAIN ANALYZE ninja"
      icon="🗺️"
      xp={65}
      readTime={15}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="indices-avancados"
      nextTitle="Índices avançados: B-tree, BRIN, GIN, GiST, partial, covering"
      quiz={quiz}
    >
      <Section title="Anatomia de um plano" accent={accent}>
        <CodeBlock lang="sql">{`EXPLAIN ANALYZE BUFFERS
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2026-01-01'
GROUP BY u.id
ORDER BY COUNT(o.id) DESC
LIMIT 10;

-- Output:
-- Limit (cost=X rows=10 ... actual time=1.2..2.3 rows=10 ...)
--   -> Sort (...)
--      -> HashAggregate (...)
--         -> Hash Left Join (...)
--            -> Seq Scan on users u (... Filter: created_at > ...)
--               Rows Removed by Filter: 500
--            -> Hash (...)
--               -> Seq Scan on orders o (...)`}</CodeBlock>
      </Section>

      <Section title="O que procurar" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>cost=X..Y</strong>: custo estimado (startup..total). Planner minimiza total.</li>
          <li><strong>rows=N</strong>: estimativa vs actual. Divergência 10x+ = stats desatualizadas → ANALYZE.</li>
          <li><strong>actual time</strong>: tempo real (ms). Preste atenção em nós com tempo alto.</li>
          <li><strong>Buffers: shared hit/read</strong>: hit = cache, read = disk. Read alto = baixa cache locality.</li>
          <li><strong>Rows Removed by Filter</strong>: se alto, predicate não usa índice — candidate a index.</li>
          <li><strong>Sort Method: external merge</strong>: spilled pra disk (work_mem baixo) — aumenta ou adicione índice que evite sort.</li>
        </ul>
      </Section>

      <Section title="Stats desatualizadas" accent={accent}>
        <CodeBlock lang="sql">{`-- Rows estimadas vs actual divergiu 100x?
-- Auto-analyze não rodou ou está atrás.

ANALYZE users;  -- atualiza stats

-- Config autovacuum mais agressivo por tabela quente
ALTER TABLE users SET (autovacuum_analyze_scale_factor = 0.01);

-- Distribution de valor pode precisar stats maiores
ALTER TABLE users ALTER COLUMN country SET STATISTICS 1000;  -- default 100
ANALYZE users;`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Query lenta + estimado-vs-actual muito diferente = 70% das vezes. Antes de criar índice, rode ANALYZE. Muitas vezes resolve sem mudar schema.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
