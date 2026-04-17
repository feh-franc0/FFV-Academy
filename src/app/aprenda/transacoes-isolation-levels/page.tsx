import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata: Metadata = {
  title: 'Transações e isolation levels: ACID sem decoreba — FFV Academy',
  description: 'ACID não é decoreba — é o que evita dirty reads, non-repeatable reads e phantom reads. Read Committed, Repeatable Read, Serializable: quando usar cada um.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é um "dirty read" e por que o PostgreSQL não o permite mesmo no nível mais baixo de isolamento?',
    options: [
      'Dirty read acontece quando uma query retorna dados corrompidos no disco',
      'Dirty read: ler dados de uma transação ainda não commitada — que pode ser revertida. Se T1 faz UPDATE e T2 lê antes do COMMIT de T1, T2 vê dados que podem nunca existir (T1 pode dar ROLLBACK). PostgreSQL não implementa Read Uncommitted — o nível mais baixo efetivo é Read Committed, que garante que você só lê dados confirmados.',
      'Dirty read é permitido em PostgreSQL para melhor performance',
      'Dirty read acontece apenas em bancos de dados NoSQL',
    ],
    correct: 1,
    explanation: 'Os 4 fenômenos de concorrência SQL: Dirty Read (ler uncommitted), Non-Repeatable Read (mesmo SELECT retorna valores diferentes), Phantom Read (novo SELECT retorna linhas novas), Serialization Anomaly (resultado diferente de qualquer execução serial). PostgreSQL garante: Read Committed evita Dirty Read. Repeatable Read evita + Non-Repeatable Read. Serializable evita tudo incluindo anomalias complexas via SSI (Serializable Snapshot Isolation).',
  },
  {
    question: 'Quando você precisa usar o nível de isolamento Serializable em vez de Read Committed?',
    options: [
      'Serializable deve ser sempre usado — é o mais seguro',
      'Serializable quando a lógica de negócio depende de que os dados não mudem durante a transação — ex: verificar saldo antes de debitar (two-step operations). Read Committed é suficiente para operações atômicas simples. Serializable tem overhead de até 30-40% em throughput. Na maioria das aplicações web, Read Committed com SELECT FOR UPDATE resolve.',
      'Serializable só é necessário quando há mais de 10 usuários simultâneos',
      'Serializable é necessário apenas para operações de leitura',
    ],
    correct: 1,
    explanation: 'SSI (Serializable Snapshot Isolation) do PostgreSQL 9.1+ detecta dependências entre transações e aborta se detectar um ciclo que causaria anomalia — muito mais eficiente que locking tradicional. Quando Serializable é necessário: bank transfers (ler saldo → calcular → escrever), geração de IDs sequenciais sem gaps, qualquer "read-modify-write" onde a invariante depende de múltiplas leituras.',
  },
  {
    question: 'O que `SELECT FOR UPDATE` faz e quando usar?',
    options: [
      'SELECT FOR UPDATE permite atualizar os campos selecionados na mesma query',
      'SELECT FOR UPDATE adiciona lock exclusivo nas linhas selecionadas — outras transações não podem atualizar ou fazer SELECT FOR UPDATE nessas linhas até o COMMIT/ROLLBACK. Uso típico: "pegar um trabalho da fila sem que outra instância pegue o mesmo". `SKIP LOCKED` ignora linhas já lockadas — perfeito para filas de trabalho sem conflito.',
      'SELECT FOR UPDATE é equivalente a UPDATE sem WHERE',
      'SELECT FOR UPDATE é apenas uma dica para o planner — não cria locks',
    ],
    correct: 1,
    explanation: 'Padrão de fila com SELECT FOR UPDATE SKIP LOCKED: `BEGIN; SELECT id, dados FROM jobs WHERE status = "pendente" ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED; UPDATE jobs SET status = "processando" WHERE id = $1; COMMIT`. Múltiplos workers podem rodar este padrão concorrentemente sem conflito — cada um pega uma linha diferente. NOWAIT levanta erro imediatamente se a linha estiver lockada.',
  },
];

export default function TransacoesIsolationLevelsPage() {
  return (
    <ModuleLayout
      slug="transacoes-isolation-levels"
      title="Transações e isolation levels: ACID sem decoreba"
      icon="🔒"
      xp={75}
      readTime={15}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="normalizacao-modelagem"
      nextTitle="Modelagem e normalização: 1NF–3NF + quando desnormalizar"
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
        ACID é a garantia que diferencia um banco de dados de um arquivo de texto. Atomicidade, Consistência, Isolamento, Durabilidade — não são decoreba, são propriedades com implementação concreta que você precisa entender para não introduzir bugs de concorrência sutis.
      </p>

      <Section accent={accent} title="ACID: o que cada propriedade garante">
        <CodeBlock>{`-- Atomicidade: tudo ou nada
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;  -- debita Alice
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;  -- credita Bob
-- Se o segundo UPDATE falhar, o primeiro é REVERTIDO automaticamente
COMMIT;   -- ambos ou nenhum

-- Consistência: constraints são verificadas no COMMIT
BEGIN;
UPDATE contas SET saldo = saldo - 1000 WHERE id = 1;
-- CHECK (saldo >= 0) é violado → ROLLBACK automático ao tentar COMMIT
COMMIT;

-- Isolamento: transações concorrentes não se veem (depende do nível)
-- Ver seção de Isolation Levels abaixo

-- Durabilidade: após COMMIT, dado está no disco (WAL garante)
-- PostgreSQL usa Write-Ahead Log: toda mudança vai para WAL antes do heap
-- Em caso de crash, recovery reproduz o WAL
-- synchronous_commit = on (default): COMMIT espera WAL estar em disco`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Isolation Levels: o trade-off consistência × performance">
        <ComparisonTable
          headers={['Nível', 'Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Anomalias seriais']}
          rows={[
            ['Read Uncommitted', 'Possível*', 'Possível', 'Possível', 'Possível'],
            ['Read Committed (padrão PG)', 'Impossível', 'Possível', 'Possível', 'Possível'],
            ['Repeatable Read', 'Impossível', 'Impossível', 'Impossível*', 'Possível'],
            ['Serializable', 'Impossível', 'Impossível', 'Impossível', 'Impossível'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- Alterar isolation level para uma transação:
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... operações ...
COMMIT;

-- Ou para a sessão inteira:
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Exemplo de Non-Repeatable Read (Read Committed):
-- T1: BEGIN; SELECT saldo FROM contas WHERE id=1;  → retorna 1000
-- T2: BEGIN; UPDATE contas SET saldo=500 WHERE id=1; COMMIT;
-- T1: SELECT saldo FROM contas WHERE id=1;  → retorna 500 (mudou!)
-- Com Repeatable Read, T1 veria 1000 na segunda leitura

-- Serialization Anomaly (detectada pelo Serializable PG):
-- T1: SELECT SUM(quantidade) FROM estoque; → 100
-- T2: SELECT SUM(quantidade) FROM estoque; → 100
-- T1: INSERT INTO movimentos (tipo, qtd) VALUES ('entrada', 50) WHERE 100 < 200;
-- T2: INSERT INTO movimentos (tipo, qtd) VALUES ('saida', 100) WHERE 100 >= 50;
-- Ambas commitam — mas qualquer execução serial teria comportamento diferente!
-- Serializable aborta uma delas com: ERROR: could not serialize access`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Locking: FOR UPDATE, FOR SHARE, SKIP LOCKED">
        <CodeBlock>{`-- SELECT FOR UPDATE: lock exclusivo nas linhas (para update ou delete)
BEGIN;
SELECT id, saldo FROM contas WHERE id = 1 FOR UPDATE;
-- Agora: nenhuma outra transação pode UPDATE/DELETE/FOR UPDATE nessa linha
-- até este COMMIT/ROLLBACK
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
COMMIT;

-- SELECT FOR SHARE: lock compartilhado (múltiplos leitores, bloqueia writers)
-- Útil quando você lê dado que outros não devem modificar mas podem ler

-- SKIP LOCKED: ignora linhas lockadas (fila de trabalho)
-- Padrão de job queue sem conflito entre workers:
BEGIN;
SELECT id, payload
FROM jobs
WHERE status = 'pendente'
ORDER BY prioridade DESC, id
LIMIT 1
FOR UPDATE SKIP LOCKED;  -- pega o próximo não-lockado
-- ... processar job ...
UPDATE jobs SET status = 'concluido' WHERE id = $1;
COMMIT;

-- NOWAIT: falha imediatamente se não conseguir o lock
SELECT * FROM tabela WHERE id = 1 FOR UPDATE NOWAIT;
-- ERROR: could not obtain lock on row in relation "tabela"
-- Útil para detectar contention sem esperar timeout

-- Advisory locks: locks customizados no nível de aplicação
SELECT pg_advisory_lock(42);        -- lock exclusivo de id 42
-- ... operação crítica ...
SELECT pg_advisory_unlock(42);`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Guia prático:</strong> use <strong>Read Committed</strong> (padrão) para operações CRUD simples. Use <strong>Repeatable Read</strong> para relatórios que precisam de snapshot consistente. Use <strong>Serializable</strong> quando a lógica tem read-modify-write complexo. Use <code>SELECT FOR UPDATE SKIP LOCKED</code> para filas de trabalho. Nunca faça read-modify-write sem transação em sistemas concorrentes.
      </Callout>

      <Callout>
        Próximo: <strong>Normalização e modelagem</strong> — 1NF, 2NF, 3NF e quando desnormalizar intencionalmente.
      </Callout>
    </div>
  );
}
