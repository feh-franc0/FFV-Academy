import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sqlite-embedded-moderno');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que SQLite voltou ao hype em 2026?',
    options: [
      'Nostalgia',
      'Edge computing + libSQL/Turso: SQLite replicado para a edge, embutido no binário da aplicação, latência sub-ms. Mais rápido que qualquer client-server remoto para read-heavy, e com WAL + concurrent readers resolve write contention razoável para muitos casos',
      'Ficou mais lento',
      'Foi descontinuado',
    ],
    correct: 1,
    explanation: 'SQLite sempre foi excelente mas era ignorado em "produção séria" pela cultura Postgres-first. Em 2026 isso mudou: Turso/libSQL oferece SQLite replicado em edge regions, Cloudflare D1 usa SQLite, LiteFS faz replicação via consensus. Para read-heavy com write-único ou baixo, SQLite on-process bate qualquer banco remoto em latência (nanossegundos vs milissegundos).',
  },
  {
    question: 'O que é WAL mode em SQLite e por que importa?',
    options: [
      'Write Ahead Logger opcional',
      'Write-Ahead Logging: writes vão para arquivo -wal separado, readers continuam lendo a versão anterior do main db sem bloquear. Permite concurrent readers + 1 writer sem bloqueio mútuo. PRAGMA journal_mode=WAL é obrigatório em qualquer app real',
      'Não existe',
      'É só para backup',
    ],
    correct: 1,
    explanation: 'No modo default (DELETE journal), SQLite serializa leituras e escritas — péssimo para concorrência. WAL desacopla: writers escrevem no -wal file, readers continuam vendo o main db consistente. Um writer por vez ainda, mas readers não bloqueiam. Combine com PRAGMA synchronous=NORMAL e busy_timeout=5000 para produção. É a diferença entre SQLite serve 10 req/s ou 50k req/s.',
  },
  {
    question: 'Qual é o trade-off principal do libSQL/Turso vs Postgres?',
    options: [
      'Não há diferença',
      'libSQL/Turso: embed-first, replica leitura para edge (latência sub-ms), writes vão para primary (latência cross-region). Ganha em apps globais read-heavy. Perde em writes concorrentes pesados, extensions ricas (pg_* ecossistema), tipos nativos complexos (jsonb, arrays, geom)',
      'libSQL é mais rápido em tudo',
      'Postgres é sempre melhor',
    ],
    correct: 1,
    explanation: 'libSQL (fork de SQLite com protocolo remoto) e Turso (plataforma) fazem replicação de leitura em dezenas de regions. Leitura de edge = ~1ms. Write vai pro primary = pode ser 100ms+ cross-region. Bom para content sites, apps read-heavy globais. Postgres ganha em write-heavy, ACID transactions complexas, extensions (PostGIS, pgvector maduro, TimescaleDB), tipos ricos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sqlite-embedded-moderno"
      title="SQLite moderno (2026)"
      icon="🪶"
      xp={50}
      readTime={12}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O banco mais subestimado do mundo" accent={accent}>
        <p>
          SQLite é o banco mais deployed da história. Está em todo iPhone, Android, browser, Firefox, Chrome, sistemas de voo da Airbus. Em 2026, renasceu na conversa de backend sério porque: (1) edge computing expôs o custo de round-trip para DB remoto, (2) Turso/libSQL tornou replicação multi-region trivial, (3) Litestream/LiteFS resolveram backup contínuo.
        </p>
      </Section>

      <Section title="Configuração de produção (não default)" accent={accent}>
        <p>
          SQLite default é pensado para uso desktop conservador. Para app server você precisa ligar WAL e tunar alguns pragmas.
        </p>
        <CodeBlock lang="sql">{`-- Rode uma vez ao abrir a conexao
PRAGMA journal_mode = WAL;            -- concurrent readers + 1 writer
PRAGMA synchronous = NORMAL;          -- fsync no checkpoint, nao em cada commit
PRAGMA busy_timeout = 5000;           -- espera 5s se outro writer
PRAGMA cache_size = -64000;           -- 64MB de cache (negativo = KB)
PRAGMA foreign_keys = ON;             -- FKs nao sao ON por default (!)
PRAGMA temp_store = MEMORY;           -- temp tables em RAM
PRAGMA mmap_size = 268435456;         -- 256MB memory-mapped IO`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Sem <strong>journal_mode=WAL</strong>, SQLite serializa leituras e escritas. Você testa localhost com 1 usuário e acha que é rápido; produção com 50 conexões concorrentes trava. Primeira coisa a ligar, sempre.
        </Callout>
      </Section>

      <Section title="Uso moderno com better-sqlite3" accent={accent}>
        <CodeBlock lang="ts">{`import Database from 'better-sqlite3';

const db = new Database('app.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');

// Prepared statement (cache interno, reusa plano)
const insertUser = db.prepare(
  'INSERT INTO users (email, name) VALUES (?, ?) RETURNING id'
);

// Transacao = funcao
const insertMany = db.transaction((users: Array<{email: string; name: string}>) => {
  for (const u of users) insertUser.run(u.email, u.name);
});

// 10k inserts em ~40ms
insertMany(users);

// Query tipada
const getTopPosts = db.prepare(
  'SELECT id, title, score FROM posts WHERE status = ? ORDER BY score DESC LIMIT ?'
);
const rows = getTopPosts.all('published', 10) as Array<{id: number; title: string; score: number}>;`}</CodeBlock>
      </Section>

      <Section title="libSQL / Turso: SQLite distribuído" accent={accent}>
        <CodeBlock lang="ts">{`import { createClient } from '@libsql/client';

// Local replica (le da edge, ~1ms) + sync com primary
const db = createClient({
  url:         'file:local.db',
  syncUrl:     'libsql://my-app.turso.io',
  authToken:   process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 60,  // sync a cada 60s
});

// Reads vao para replica local
const rows = await db.execute('SELECT * FROM posts WHERE slug = ?', ['hello']);

// Writes viajam para o primary (latencia cross-region)
await db.execute('INSERT INTO views (post_id, at) VALUES (?, ?)', [1, Date.now()]);`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Turso cobra por branch (como Neon). Cada branch é um SQLite independente — dá para dev/staging/prod/preview efêmero. Read-latency da edge resolve problema real de app global.
        </Callout>
      </Section>

      <Section title="Quando NÃO usar SQLite" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Writes concorrentes pesados (&gt; 100 writes/s sustentados de múltiplos clients), transações multi-writer, full-text avançado (prefira Postgres + tsvector ou Elasticsearch), extensões pesadas (PostGIS, pgvector maduro). SQLite é 1 writer por vez — assumir isso.
        </Callout>
        <Callout tone="success" icon="✅">
          SQLite + WAL + Litestream resolve 80% dos apps &quot;Postgres-first&quot; com 10% da complexidade operacional. Vale revisitar antes de provisionar RDS.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
