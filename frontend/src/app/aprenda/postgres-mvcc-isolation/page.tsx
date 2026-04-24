import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#f78166';

export const metadata = getModuleMetadata('postgres-mvcc-isolation');

const quiz = [
  {
    question:
      'MVCC (Multi-Version Concurrency Control) no Postgres funciona através de:',
    options: [
      'Locks de leitura e escrita em cada linha',
      'Cada UPDATE/DELETE cria uma nova versão da linha (tuple); versões antigas ficam visíveis a transações mais velhas até VACUUM',
      'Snapshots on-demand solicitados pela aplicação',
      'Replicação síncrona entre leaders',
    ],
    correct: 1,
    explanation:
      'MVCC no Postgres: toda tupla tem xmin (txid que criou) e xmax (txid que deletou). UPDATE cria nova tupla e seta xmax do original. Readers não bloqueiam writers e vice-versa — cada transação vê o snapshot consistente com seu próprio txid. Versões mortas (dead tuples) são recuperadas por VACUUM.',
  },
  {
    question:
      'Qual é o isolation level DEFAULT do Postgres?',
    options: [
      'Read Uncommitted',
      'Read Committed',
      'Repeatable Read',
      'Serializable',
    ],
    correct: 1,
    explanation:
      'Postgres default é Read Committed — cada comando dentro de uma tx vê um novo snapshot (não a tx inteira). Read Committed permite non-repeatable reads e phantom reads. Apps que precisam de garantia mais forte devem setar Repeatable Read ou Serializable explicitamente (BEGIN ISOLATION LEVEL REPEATABLE READ).',
  },
  {
    question:
      'A diferença entre SELECT FOR UPDATE e SELECT FOR SHARE é:',
    options: [
      'FOR UPDATE é mais rápido',
      'FOR UPDATE bloqueia outras transações de ler ou escrever; FOR SHARE permite outras lerem com FOR SHARE, só bloqueia escritas',
      'FOR SHARE só existe em Oracle',
      'FOR UPDATE exige índice; FOR SHARE não',
    ],
    correct: 1,
    explanation:
      'FOR UPDATE = lock exclusivo na linha (outras txs que tentem FOR UPDATE, FOR SHARE ou UPDATE bloqueiam). FOR SHARE = lock compartilhado (outras FOR SHARE coexistem, mas qualquer escrita bloqueia). Use FOR UPDATE quando vai escrever; FOR SHARE pra ler com garantia que a linha não vai mudar no meio da tx.',
  },
  {
    question:
      'O que causa table bloat no Postgres?',
    options: [
      'Muitos índices',
      'Tabelas com muitas UPDATEs/DELETEs sem VACUUM eficiente — versões mortas acumulam ocupando espaço',
      'WAL muito grande',
      'Muitas conexões simultâneas',
    ],
    correct: 1,
    explanation:
      'Bloat = espaço ocupado por tuplas mortas que não foram recuperadas. Causas: UPDATEs frequentes sem autovacuum dando conta, long-running transactions que mantêm tuplas visíveis, unused replication slots. Solução: autovacuum tuning agressivo em tabelas quentes, VACUUM FULL (com lock) ou pg_repack (sem lock). Bloat degrada queries por varrer mais páginas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="postgres-mvcc-isolation"
      title="Postgres Profundo: MVCC, Isolation Levels e Locks"
      icon="🐘"
      xp={85}
      readTime={17}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="rate-limiting-distribuido"
      nextTitle="Rate Limiting Distribuído: token bucket, sliding window, Redis"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Postgres é o banco favorito do mundo moderno — e você provavelmente usa sem saber o que
        acontece por baixo. Este módulo é sobre o que todo engenheiro sério precisa entender:
        como o <strong>MVCC</strong> permite leituras e escritas concorrentes sem locks recíprocos,
        a diferença real entre os 4 <strong>isolation levels</strong>, quando usar
        <InlineCode> SELECT FOR UPDATE</InlineCode> vs <strong>advisory locks</strong>, e por
        que sua tabela de 2GB virou 15GB (<strong>bloat</strong>).
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Saber isso separa dev que copia código do StackOverflow do engenheiro que diagnostica
        deadlock em produção às 3 da manhã.
      </p>

      <Section title="MVCC: o coração do Postgres" accent={ACCENT}>
        <p>
          MVCC (Multi-Version Concurrency Control) é a técnica que permite:
          <strong> readers não bloqueiam writers, writers não bloqueiam readers</strong>.
          Cada linha pode existir em múltiplas versões simultaneamente, cada versão visível
          apenas pras transações cuja "visão" do mundo inclui essa versão.
        </p>

        <ArchDiagram>
{`Toda tupla no Postgres tem campos de controle:

┌────────────────────────────────────────────────────────────┐
│ ctid     │ xmin    │ xmax    │ ... dados da linha ...      │
│ (ptr)    │ (criou) │ (deletou│                              │
│          │         │  /null) │                              │
└────────────────────────────────────────────────────────────┘

UPDATE user SET balance = 150 WHERE id = 42;
  → marca tupla antiga com xmax = txid (me)
  → INSERE nova tupla com xmin = txid (me), xmax = null
  → resultado: DUAS tuplas no mesmo id, com xmin/xmax diferentes

Outra tx (txid menor) lendo:
  → vê a tupla antiga (a nova foi criada por txid maior que o snapshot dela)
  → resultado: não vê a mudança até commit + refresh do seu snapshot`}
        </ArchDiagram>

        <p><strong>Visibility rule simplificada</strong>: uma tupla é visível pra uma tx se:</p>
        <ol className="list-decimal space-y-1 pl-6">
          <li>xmin foi committed <em>antes</em> do snapshot da tx (e não é ela mesma)</li>
          <li>xmax é null, ou aborted, ou ainda não committed</li>
        </ol>

        <Callout tone="info">
          <strong>Consequência prática</strong>: <em>SELECT nunca bloqueia outro SELECT ou
          um UPDATE/DELETE</em>, e vice-versa. Só operações na mesma tupla entre si (ex: 2 UPDATEs)
          disputam lock. É por isso que Postgres aguenta carga altíssima de leitura concorrente.
        </Callout>
      </Section>

      <Section title="Os 4 isolation levels (e as anomalias que previnem)" accent={ACCENT}>
        <p>
          SQL standard define 4 níveis + 3 anomalias. Postgres <strong>na prática oferece 3</strong>
          (Read Uncommitted é tratado como Read Committed).
        </p>
        <ComparisonTable
          headers={['Isolation Level', 'Dirty read', 'Non-repeatable read', 'Phantom read', 'Serialization anomaly']}
          rows={[
            ['Read Uncommitted', '(não aplica no PG)', 'Sim', 'Sim', 'Sim'],
            ['Read Committed (DEFAULT)', 'Não', 'Sim', 'Sim', 'Sim'],
            ['Repeatable Read', 'Não', 'Não', 'Não (PG)', 'Sim'],
            ['Serializable', 'Não', 'Não', 'Não', 'Não'],
          ]}
        />

        <ComparisonTable
          headers={['Anomalia', 'Descrição', 'Exemplo']}
          rows={[
            [
              'Dirty read',
              'Tx1 lê um valor que Tx2 escreveu mas ainda não fez commit',
              'Ler saldo 100 que Tx2 está prestes a rollback',
            ],
            [
              'Non-repeatable read',
              'Tx1 lê a mesma linha duas vezes e vê valores diferentes (Tx2 commitou entre as leituras)',
              'SELECT balance FROM a WHERE id=1 → 100, depois 150',
            ],
            [
              'Phantom read',
              'Tx1 executa o mesmo query com WHERE duas vezes e recebe linhas diferentes (Tx2 inseriu novas)',
              'SELECT COUNT(*) FROM a WHERE balance>0 → 5, depois 6',
            ],
            [
              'Serialization anomaly',
              'Dois txs concurrent, cada um passa sozinho, mas juntos violam invariante',
              'Constraint "total >= 0": 2 débitos concorrentes que individualmente passam mas juntos estouram',
            ],
          ]}
        />

        <Callout tone="warn">
          <strong>Postgres Repeatable Read &gt; SQL standard</strong>: o PG também previne phantom reads
          no nível RR (graças ao MVCC — usa snapshot inteiro da tx). Serializable no PG é "Serializable
          Snapshot Isolation (SSI)", detecta conflitos via predicado e aborta uma das txs com erro
          <InlineCode> 40001</InlineCode> — você deve retriar.
        </Callout>

        <p><strong>Setar isolation level</strong>:</p>
        <CodeBlock lang="sql">{`-- Por transação:
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT balance FROM accounts WHERE id = 42;
UPDATE accounts SET balance = balance - 50 WHERE id = 42;
COMMIT;

-- Setar default da sessão:
SET default_transaction_isolation = 'repeatable read';

-- Setar como default do banco (não recomendado — caso a caso):
ALTER DATABASE mydb SET default_transaction_isolation = 'read committed';`}</CodeBlock>
      </Section>

      <Section title="Exemplo real: lost update com Read Committed" accent={ACCENT}>
        <p>
          Clássico bug em CRUD: dois usuários editando o mesmo registro concorrentemente.
          Read Committed <em>não previne</em>.
        </p>
        <CodeBlock lang="sql">{`-- Cenário: 2 usuários editando perfil do user 42 (balance inicial: 100)

-- Tx1 e Tx2 ambas em Read Committed (default)

-- Tx1:
BEGIN;
SELECT balance FROM accounts WHERE id = 42;   -- lê 100
-- ... app calcula novo valor: 100 + 50 = 150

-- Tx2:
BEGIN;
SELECT balance FROM accounts WHERE id = 42;   -- lê 100
-- ... app calcula novo valor: 100 + 30 = 130

-- Tx1:
UPDATE accounts SET balance = 150 WHERE id = 42;
COMMIT;                                        -- OK

-- Tx2:
UPDATE accounts SET balance = 130 WHERE id = 42;   -- sobrescreve!
COMMIT;                                        -- Tx1 foi PERDIDA. Balance: 130 (deveria ser 180).`}</CodeBlock>

        <p><strong>3 soluções</strong>:</p>

        <CodeBlock lang="sql">{`-- Solução 1: SELECT FOR UPDATE (pessimistic lock)
BEGIN;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;   -- bloqueia a linha
UPDATE accounts SET balance = balance + 50 WHERE id = 42;
COMMIT;
-- Tx2 trava no SELECT FOR UPDATE até Tx1 commitar; depois lê 150 e segue.

-- Solução 2: UPDATE atômico (não precisa de lock se a lógica cabe em SQL)
UPDATE accounts SET balance = balance + 50 WHERE id = 42;
-- Postgres executa atomicamente. Sem race, sem lock manual.

-- Solução 3: Optimistic lock (version column)
-- schema: ALTER TABLE accounts ADD COLUMN version INT DEFAULT 0;
BEGIN;
SELECT balance, version FROM accounts WHERE id = 42;   -- lê (100, 3)
UPDATE accounts
  SET balance = 150, version = version + 1
  WHERE id = 42 AND version = 3;                       -- CAS
-- Se rowcount = 0, alguém mudou antes → erro pro cliente / retry.
COMMIT;`}</CodeBlock>

        <Callout tone="info">
          <strong>Regra</strong>: se você pode expressar a lógica <em>inteira</em> em um único
          UPDATE atômico (ex: <InlineCode>balance = balance + :amount</InlineCode>), essa é a
          solução mais simples e performante. Só recorra a FOR UPDATE ou optimistic quando a
          lógica envolve decisões na aplicação.
        </Callout>
      </Section>

      <Section title="Tipos de lock no Postgres" accent={ACCENT}>
        <p>
          Postgres tem múltiplos níveis de lock — linha (tuple) e tabela.
        </p>

        <p><strong>Locks de linha</strong>:</p>
        <ComparisonTable
          headers={['Lock', 'SQL', 'O que bloqueia']}
          rows={[
            [
              'FOR UPDATE',
              'SELECT ... FOR UPDATE',
              'Outras FOR UPDATE, FOR SHARE, UPDATE, DELETE nessa linha',
            ],
            [
              'FOR NO KEY UPDATE',
              'SELECT ... FOR NO KEY UPDATE',
              'Mais leve — permite outros FOR KEY SHARE concorrentes (usado em FKs)',
            ],
            [
              'FOR SHARE',
              'SELECT ... FOR SHARE',
              'Outras UPDATE, DELETE, FOR UPDATE. Permite outras FOR SHARE.',
            ],
            [
              'FOR KEY SHARE',
              'SELECT ... FOR KEY SHARE',
              'Apenas UPDATE da key. Mais leve. Usado internamente por FKs.',
            ],
          ]}
        />

        <p><strong>Locks de tabela</strong>:</p>
        <ComparisonTable
          headers={['Lock', 'Quando acontece', 'Bloqueia o quê']}
          rows={[
            ['ACCESS SHARE', 'SELECT simples', 'Só ACCESS EXCLUSIVE (ex: DROP TABLE)'],
            ['ROW SHARE', 'SELECT FOR UPDATE/SHARE', 'EXCLUSIVE, ACCESS EXCLUSIVE'],
            ['ROW EXCLUSIVE', 'UPDATE, DELETE, INSERT', 'SHARE e acima'],
            ['SHARE', 'CREATE INDEX', 'ROW EXCLUSIVE e acima'],
            ['EXCLUSIVE', 'REFRESH MATERIALIZED VIEW CONCURRENTLY', 'SHARE, ROW EXCLUSIVE e acima'],
            ['ACCESS EXCLUSIVE', 'DROP TABLE, TRUNCATE, ALTER TABLE (maioria), VACUUM FULL', 'TUDO, inclusive SELECT'],
          ]}
        />

        <Callout tone="danger">
          <strong>Gotcha clássico de migration</strong>: <InlineCode>ALTER TABLE ADD COLUMN
          NOT NULL DEFAULT &apos;x&apos;</InlineCode> em tabelas grandes adquire ACCESS EXCLUSIVE
          e reescreve tudo. Quebra produção em tabelas de milhões. Solução:
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>ADD COLUMN sem default (instantâneo no PG 11+)</li>
            <li>UPDATE em batches pra preencher o default</li>
            <li>ALTER COLUMN SET NOT NULL (sem reescrita no PG 12+)</li>
          </ol>
          O projeto <em>pg-osc</em> ou <em>pgroll</em> automatizam migrations zero-downtime.
        </Callout>
      </Section>

      <Section title="Advisory locks: locks application-level" accent={ACCENT}>
        <p>
          Advisory locks não protegem linhas — protegem <em>conceitos</em>. Você passa um id
          (int64 ou par de int32), Postgres garante que só uma sessão detém aquele lock.
        </p>
        <CodeBlock lang="sql">{`-- Exclusivo, session-level (dura até sessão terminar ou unlock explícito)
SELECT pg_advisory_lock(12345);
-- ... faz algo crítico ...
SELECT pg_advisory_unlock(12345);

-- Exclusivo, transaction-level (libera no COMMIT/ROLLBACK — preferido)
BEGIN;
SELECT pg_advisory_xact_lock(12345);
-- ... faz algo crítico ...
COMMIT;  -- lock liberado automaticamente

-- Non-blocking (try)
SELECT pg_try_advisory_xact_lock(12345);
-- retorna true se pegou, false se já tá preso — pra padrões "rodar 1 de N"`}</CodeBlock>

        <p><strong>Casos de uso clássicos</strong>:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Leader election leve</strong>: quem pegar o lock 42 é o "leader" naquele momento (cron singleton, job runner).</li>
          <li><strong>Rate limit global</strong>: gate pra operações idempotentes custosas.</li>
          <li><strong>Migration coordination</strong>: apenas uma réplica executa a migration.</li>
          <li><strong>Evitar thundering herd</strong>: só uma tx faz o trabalho caro, outras esperam.</li>
        </ul>

        <Callout tone="warn">
          <strong>Advisory locks não sobrevivem a failover</strong>. Se Postgres master cai e um replica vira master, locks se perdem. Pra leader election em cluster, use etcd/Consul/ZooKeeper.
        </Callout>
      </Section>

      <Section title="VACUUM e bloat: o lixo que ninguém limpa" accent={ACCENT}>
        <p>
          MVCC cobra preço: cada UPDATE/DELETE deixa tuplas mortas. Sem recuperação, disco
          enche e queries degradam.
        </p>
        <ArchDiagram>
{`Tabela com 1000 rows, todos recebem UPDATE 10x sem VACUUM:

Disco:
  ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐ ... 10000 tuplas
  │live ││dead ││dead ││dead ││live │     (1000 vivas + 9000 mortas)
  └─────┘└─────┘└─────┘└─────┘└─────┘

SELECT * FROM t WHERE ... → varre 10000 tuplas, filtra dead ones, retorna live
→ 10x mais lento que tabela limpa (scan fica caro, cache miss, etc.)

VACUUM (normal):
  → Marca tuplas mortas como reutilizáveis pra novos INSERTs
  → NÃO devolve espaço ao SO (arquivo não encolhe)
  → Não segura ACCESS EXCLUSIVE — concorrência OK

VACUUM FULL:
  → Reescreve a tabela inteira, elimina espaço morto
  → Segura ACCESS EXCLUSIVE — tabela inacessível até terminar
  → DON'T em produção em tabelas grandes. Use pg_repack.`}
        </ArchDiagram>

        <p><strong>Autovacuum</strong>: daemon que roda VACUUM automaticamente. Por default, ativado. Mas configurado conservadoramente demais pra muitas workloads.</p>

        <CodeBlock lang="sql">{`-- Ver estatísticas de bloat (approximação)
SELECT schemaname, relname,
       n_live_tup, n_dead_tup,
       round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Tunar autovacuum pra tabela hot específica:
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.02,    -- 2% de dead → roda (default 20%)
  autovacuum_vacuum_cost_limit = 2000       -- mais IO permitido (default 200)
);

-- Forçar VACUUM imediato (sem ACCESS EXCLUSIVE):
VACUUM (VERBOSE, ANALYZE) orders;`}</CodeBlock>

        <Callout tone="danger">
          <strong>Long-running transactions são inimigas do VACUUM</strong>. Enquanto uma
          transação antiga tá aberta, o PG não pode recuperar tuplas mortas mais novas que
          ela (pra manter snapshot consistente). Resultado: bloat explodindo em tabelas hot
          porque alguém esqueceu <InlineCode>BEGIN</InlineCode> aberto no psql. Monitor
          <InlineCode> pg_stat_activity</InlineCode> em <em>state=idle in transaction</em>.
        </Callout>
      </Section>

      <Section title="Dicas práticas de troubleshooting" accent={ACCENT}>
        <CodeBlock lang="sql">{`-- 1. Ver queries rodando agora
SELECT pid, usename, application_name, state, wait_event_type, wait_event,
       now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- 2. Ver locks e quem espera quem
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_query,
       blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
     ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
     ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity
     ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 3. Matar query (com cuidado):
SELECT pg_cancel_backend(pid);     -- pede educadamente
SELECT pg_terminate_backend(pid);  -- força — aborta tx

-- 4. Ver tamanho real das tabelas + bloat:
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS total,
       pg_size_pretty(pg_relation_size(relid)) AS "table only"
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC LIMIT 20;`}</CodeBlock>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="Preciso de contador global (hits por produto) com alta concorrência"
          winner="UPDATE atômico (counter += 1), nunca SELECT + UPDATE"
          winnerColor={ACCENT}
          why="UPDATE é atômico por natureza no PG. SELECT seguido de UPDATE na app exige FOR UPDATE ou optimistic lock. Em volumes altos, contadores viram hot row e ainda assim gargalam — nesse caso, considere sharding do contador (10 rows, agrega no SELECT)."
          alternatives={[
            { label: 'Redis INCR', note: 'Muito mais rápido pra contador puro. Sincroniza com PG em batch.' },
            { label: 'Table-level counter ser shardado', note: 'counter_id % 10 → 10 rows. Reduz contenção.' },
          ]}
        />
        <DecisionBox
          scenario="Leader election leve pra worker que só deve ter 1 ativo"
          winner="pg_try_advisory_xact_lock em um id fixo"
          winnerColor={ACCENT}
          why="Se você já tem Postgres, é 1 linha de código e 0 dependência nova. Em cada iteração do worker, tenta pegar o lock — se falhar, ele não é o leader, pula. Se master do PG cair, o replacement assume, lock se perde e outro worker pega. Perfeito pra cron singleton."
          alternatives={[
            { label: 'Redis lease (TTL)', note: 'Se já tem Redis. Cuidado com split-brain em failover.' },
            { label: 'etcd lease', note: 'Se já tem K8s/etcd. Mais robusto que advisory lock.' },
          ]}
        />
        <DecisionBox
          scenario="Transação de e-commerce: preciso subtrair estoque sem vender negativo"
          winner="UPDATE com WHERE stock >= qty, checando rowcount"
          winnerColor={ACCENT}
          why="UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1. Se rowcount = 0, não havia estoque — retorna erro. Atomicidade nativa, zero lock explícito, performance excelente. Nem FOR UPDATE nem optimistic é necessário."
          alternatives={[
            { label: 'SELECT FOR UPDATE + UPDATE', note: 'Funciona mas mais lento e mais código.' },
          ]}
        />
        <DecisionBox
          scenario="Preciso Serializable Snapshot Isolation pra invariantes complexas"
          winner="BEGIN ISOLATION LEVEL SERIALIZABLE + retry loop"
          winnerColor={ACCENT}
          why="SSI no PG é a melhor implementação comercial de serializable — performance quase RR, mas previne anomalias. Custo: txs podem abortar com 40001 — sua app precisa retriar. Ótimo pra regras complexas (ex: 'soma de todas as fatias ≤ 100')."
          alternatives={[
            { label: 'Repeatable Read + locks explícitos', note: 'Mais controle, mais código, mais bugs.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Por que minha query lenta ficou rápida depois de VACUUM?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Tabela tava cheia de tuplas mortas — cada SELECT varria muito lixo. VACUUM marcou
              tuplas mortas como reutilizáveis + atualizou visibility map. Bônus: ANALYZE (roda
              junto) atualizou estatísticas do planner, que pode ter escolhido plano melhor.
            </p>
          </div>
          <div>
            <p><strong>O que é "deadlock"?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Duas txs esperando cada uma o lock da outra. PG detecta (via grafo de wait) em 1s
              por default e aborta uma das duas com erro 40P01. App deve retriar. Pra prevenir:
              sempre adquirir locks na mesma ordem (ex: ordenar por id).
            </p>
          </div>
          <div>
            <p><strong>Transação ROLLBACK "perde" o txid?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim — PG consome txids pra toda tx (mesmo abortada). Txid é uint32, wrap-around em ~4B.
              Autovacuum faz "freeze" pra evitar apocalipse de wraparound. Se autovacuum não dá conta,
              cluster entra em read-only. Monitor <InlineCode>datfrozenxid</InlineCode>.
            </p>
          </div>
          <div>
            <p><strong>FOR UPDATE funciona em SELECT com JOIN?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim, mas por default trava linhas de todas as tabelas joinadas. Você pode restringir com <InlineCode>FOR UPDATE OF tablename</InlineCode> pra travar só uma.
            </p>
          </div>
          <div>
            <p><strong>Qual isolation level usar por default?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Read Committed (default) é suficiente pra 95% dos casos se você escrever SQL atômico
              (UPDATE com expressões, SELECT FOR UPDATE onde precisa). Suba pra Repeatable Read só
              quando precisa de snapshot consistente da tx inteira, e Serializable quando tem
              invariante multi-row complexo.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>MVCC</strong>: cada tupla tem xmin/xmax, múltiplas versões coexistem. Readers não bloqueiam writers.</li>
          <li><strong>Read Committed</strong> é o default; Repeatable Read ou Serializable quando invariantes importam.</li>
          <li><strong>UPDATE atômico</strong> sempre que possível. FOR UPDATE só quando lógica na app decide.</li>
          <li><strong>Advisory locks</strong> pra leader election, gate de jobs, dedup — application-level, não protege linhas.</li>
          <li><strong>Bloat</strong> mata performance. Monitor pg_stat_user_tables, tune autovacuum em tabelas hot.</li>
          <li><strong>Long-running txs</strong> bloqueiam VACUUM — monitor idle-in-transaction religiosamente.</li>
          <li><strong>Serializable no PG</strong> = SSI, melhor implementação comercial. Aceite retry com 40001.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo (e último) módulo dessa trilha: quando você tem <em>muito tráfego</em> — rate limiting distribuído.
      </p>
    </div>
  );
}
