import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vacuum-autovacuum-bloat');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Postgres precisa de vacuum?',
    options: [
      'Limpeza geral',
      'MVCC: cada UPDATE/DELETE deixa DEAD TUPLE (versão antiga). Sem vacuum, tabela cresce mesmo com DELETEs, índices ficam bloated, queries desaceleram. Vacuum recupera espaço e atualiza visibility map',
      'Só estético',
      'Só em replica',
    ],
    correct: 1,
    explanation: 'MVCC é elegante mas cria lixo. Tabela nunca "shrink" naturalmente — dead tuples ocupam espaço até vacuum remover. Autovacuum roda em background, mas em workloads update-heavy pode ficar atrás. Bloat = espaço wasted = I/O wasted = slow.',
  },
  {
    question: 'Qual é a diferença entre VACUUM e VACUUM FULL?',
    options: [
      'Cosmético',
      'VACUUM: marca espaço reusável (novo INSERT preenche), não bloqueia reads/writes. VACUUM FULL: bloqueio EXCLUSIVO, recria tabela compacta, devolve espaço ao SO. Use FULL só em janela de manutenção',
      'São iguais',
      'FULL é deprecated',
    ],
    correct: 1,
    explanation: 'VACUUM normal é safe online — marca slots reusáveis dentro dos pages. Tabela não shrink mas para de crescer. VACUUM FULL recria (grabs ACCESS EXCLUSIVE lock — TUDO bloqueia). Alternativa online: pg_repack (compacta sem lock), pg_squeeze. VACUUM FULL em prod 24/7 = suicídio.',
  },
  {
    question: 'Como identificar tabela com bloat alto?',
    options: [
      'Adivinhar',
      'pg_stat_user_tables (n_dead_tup / n_live_tup ratio) + ext pgstattuple pra análise detalhada. Tools: pganalyze, pg_bloat_check. Se dead/live > 20%, investigar autovacuum config',
      'Só via backup',
      'Impossível',
    ],
    correct: 1,
    explanation: 'pg_stat_user_tables mostra n_dead_tup (mortos aguardando vacuum), n_live_tup (ativos). Ratio alto = bloat provável. pgstattuple extension (não built-in) dá análise detalhada por tabela. Dashboards (pganalyze, Datadog DB Monitoring) alertam automaticamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vacuum-autovacuum-bloat"
      title="Vacuum, autovacuum e bloat: causa #1 de DB morrendo"
      icon="🧹"
      xp={55}
      readTime={13}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="connection-pooling"
      nextTitle="Connection pooling: pgbouncer e a trap serverless"
      quiz={quiz}
    >
      <Section title="Diagnosticar bloat" accent={accent}>
        <CodeBlock lang="sql">{`-- Tabelas com mais dead tuples
SELECT
  schemaname, relname,
  n_live_tup, n_dead_tup,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) AS dead_pct,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Extension pgstattuple (mais precisa)
CREATE EXTENSION pgstattuple;
SELECT * FROM pgstattuple('orders');
-- mostra tuple_count, dead_tuple_count, free_space, etc`}</CodeBlock>
      </Section>

      <Section title="Tuning autovacuum por tabela" accent={accent}>
        <CodeBlock lang="sql">{`-- Tabela hot (muitos updates): autovacuum mais agressivo
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.05,   -- default 0.2
  autovacuum_analyze_scale_factor = 0.02,  -- default 0.1
  autovacuum_vacuum_cost_delay = 10        -- ms entre chunks
);

-- Desliga autovacuum em tabela static (append-only arquivo)
ALTER TABLE immutable_logs SET (autovacuum_enabled = false);

-- Monitor: não autovacuum em 1h+ com muitos dead?
SELECT relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000 AND (last_autovacuum < now() - INTERVAL '1 hour' OR last_autovacuum IS NULL);`}</CodeBlock>
      </Section>

      <Section title="pg_repack — compactação online" accent={accent}>
        <CodeBlock lang="bash">{`# Extensão + tool CLI (não built-in)
# Recria tabela sem lock exclusivo — trigger mantém consistência durante

pg_repack -h localhost -U postgres -d mydb -t orders

# Pré-requisitos: PRIMARY KEY, espaço em disk (cria cópia antes de swap)
# Alternativa: pg_squeeze (nativo PG13+ em algumas distros)`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          VACUUM FULL bloqueia &gt; 1h em tabela grande. Use pg_repack em prod. Planeje window mesmo assim — usa ~2x espaço durante swap.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
