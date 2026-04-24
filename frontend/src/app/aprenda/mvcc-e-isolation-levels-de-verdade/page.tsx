import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mvcc-e-isolation-levels-de-verdade');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Como MVCC permite reads sem locks?',
    options: [
      'Não permite',
      'Cada row tem xmin (transação que criou) e xmax (que deletou). Read verifica visibility baseado em snapshot da transação — vê versões ANTIGAS se forem válidas pro seu snapshot. Reads nunca bloqueiam writes',
      'Locks otimistas',
      'Apenas em replicas',
    ],
    correct: 1,
    explanation: 'Multi-Version Concurrency Control: Postgres mantém múltiplas versões de cada row. Transação começa, pega snapshot (xact ID). Reads veem versões válidas pra aquele snapshot. UPDATE cria NEW row (marcando xmin = current xact); velha fica até vacuum. Isso é por que reads não travam com writes.',
  },
  {
    question: 'Qual é o isolation level PADRÃO do Postgres?',
    options: [
      'Serializable',
      'Read Committed — cada query vê o último committed. Pode pegar "non-repeatable reads" (query roda duas vezes, retorna diferentes resultados se outro commit entre elas)',
      'Repeatable Read',
      'Read Uncommitted',
    ],
    correct: 1,
    explanation: 'READ COMMITTED é default em PG (e Oracle). Cada STATEMENT vê novo snapshot — commit de outra tx durante sua aparece. REPEATABLE READ (snapshot isolation) congela visão no início da tx. SERIALIZABLE adiciona SSI (detecta dangerous concurrent patterns). Postgres NUNCA permite dirty read.',
  },
  {
    question: 'O que SSI (Serializable Snapshot Isolation) detecta?',
    options: [
      'Nada especial',
      'Patterns perigosos entre transações concorrentes que viria a resultado inconsistente se fossem sequenciais. Quando detecta, ABORTA uma com SerializationFailure — aplicação deve retry',
      'Deadlock',
      'Locks fracos',
    ],
    correct: 1,
    explanation: 'SSI (PostgreSQL 9.1+) é isolation mais forte sem lock de leitura. Detecta "dangerous structures" (read-write conflicts que formam ciclo). Quando detecta, abort + retry é expected. Trade-off: zero-lock reads + retry logic. Ótimo pra apps com heavy read + esporádica conflict write.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mvcc-e-isolation-levels-de-verdade"
      title="MVCC e isolation levels de verdade (sem simplificação)"
      icon="🔀"
      xp={60}
      readTime={14}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="query-planner-e-explain-analyze-ninja"
      nextTitle="Query planner: EXPLAIN ANALYZE ninja"
      quiz={quiz}
    >
      <Section title="MVCC em 1 query" accent={accent}>
        <CodeBlock lang="sql">{`-- Inspect xmin/xmax diretamente
SELECT xmin, xmax, * FROM users WHERE id = 1;

-- UPDATE cria NOVA versão
BEGIN;
UPDATE users SET email = 'new' WHERE id = 1;
-- Row antiga: xmax = current_xact
-- Row nova: xmin = current_xact
-- Outras txs ainda veem antiga até COMMIT

-- Dead tuples acumulam → vacuum periódico
VACUUM ANALYZE users;`}</CodeBlock>
      </Section>

      <Section title="Isolation levels em Postgres" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Level', 'Dirty read', 'Non-repeatable read', 'Phantom', 'Serialization anomaly']}
          rows={[
            ['Read Uncommitted*', 'Possível em padrão', 'Sim', 'Sim', 'Sim'],
            ['Read Committed (default)', 'Impossível', 'Sim', 'Sim', 'Sim'],
            ['Repeatable Read', 'Impossível', 'Impossível', 'Impossível (em PG)', 'Sim'],
            ['Serializable', 'Impossível', 'Impossível', 'Impossível', 'Impossível'],
          ]}
        />
        <Callout tone="info" icon="💡">
          *No PG, Read Uncommitted é tratado como Read Committed — dirty read NUNCA acontece. Em MySQL/SQL Server dirty read é real em RU.
        </Callout>
      </Section>

      <Section title="Quando usar cada level" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Read Committed</strong> (default): web CRUD — 95% dos casos.</li>
          <li><strong>Repeatable Read</strong>: report que faz múltiplas queries e quer snapshot consistente (ex: dashboard).</li>
          <li><strong>Serializable + retry</strong>: transações financeiras sensíveis onde consistência &gt; throughput.</li>
          <li><strong>SELECT FOR UPDATE</strong>: locking explícito em Read Committed pra evitar lost update.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
