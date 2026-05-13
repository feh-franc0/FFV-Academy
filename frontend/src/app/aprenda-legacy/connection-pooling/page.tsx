import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('connection-pooling');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Postgres sofre com muitas conexões?',
    options: [
      'Limitation global',
      'Cada conexão = PROCESS separado (not thread) com ~10MB memória base + work_mem overhead. 500 conns = 5GB+ só de overhead. Max_connections geralmente ~100-200 em hardware normal',
      'Só em versões antigas',
      'Mesmo que MySQL',
    ],
    correct: 1,
    explanation: 'Postgres fork per-connection é herança histórica. Scale issue quando apps modernas (Lambda, autoscaled pods) abrem conns sem limite. Solução: pgbouncer (ou RDS Proxy, Supavisor) — app → pooler (muitos) → PG (poucas). Conns fisicas limitadas, logicas infinitas.',
  },
  {
    question: 'Qual modo pgbouncer é default recomendado?',
    options: [
      'session',
      'transaction — cada transaction reusa conexão PG. 100 client conns compartilham 10 PG conns. Session mode (default tradicional) não escala',
      'statement',
      'pooler',
    ],
    correct: 1,
    explanation: 'Session mode: 1 client conn = 1 PG conn exclusiva (não é pool real). Transaction: múltiplos clients compartilham pool, cada tx pega/devolve. Statement: extreme (cada query devolve) — limita features (prepared statements, etc). Transaction é sweet spot.',
  },
  {
    question: 'Qual é o problema Lambda + Postgres sem pooler?',
    options: [
      'Nenhum',
      'Lambda spawn N concurrent → cada Lambda abre conn → exhaust max_connections. Fix: RDS Proxy (AWS managed pooler) ou Supabase Supavisor ou pgbouncer em front. Não confie em reusar conn (Lambda frio/warm imprevisível)',
      'Só em VPC',
      'Impossível',
    ],
    correct: 1,
    explanation: 'Caso clássico: Lambda com pg client direto, autoescala pra 1000 invocs concorrentes = 1000 conns. PG quebra. RDS Proxy entre: mantém pool de conns fisicas, aceita N lógicas. Supabase Supavisor (Rust) é alternative moderno. Planetscale/Neon têm pooler nativo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="connection-pooling"
      title="Connection pooling: pgbouncer e a trap serverless"
      icon="🔌"
      xp={50}
      readTime={11}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="replication-primary-replica"
      nextTitle="Replication: streaming, logical, failover"
      quiz={quiz}
    >
      <Section title="Pgbouncer modos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Mode', 'Quando libera conn', 'Trade-off']}
          rows={[
            ['session', 'No DISCONNECT do client', 'Sem pooling real; só middleman'],
            ['transaction', 'No COMMIT/ROLLBACK', 'Default moderno; perde LISTEN/NOTIFY, session temp tables, prepared statements (PG 14+ ajuda)'],
            ['statement', 'Após cada statement', 'Maior pooling; perde prepared, multi-statement tx'],
          ]}
        />
      </Section>

      <Section title="Config pgbouncer exemplo" accent={accent}>
        <CodeBlock lang="ini">{`# pgbouncer.ini
[databases]
mydb = host=pg-primary port=5432 dbname=mydb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
pool_mode = transaction
max_client_conn = 10000      # clients lógicos
default_pool_size = 20       # conns físicas por database
reserve_pool_size = 5
reserve_pool_timeout = 3

# App conecta em pgbouncer:6432 em vez de pg:5432`}</CodeBlock>
      </Section>

      <Section title="Serverless options" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>RDS Proxy</strong>: AWS managed pooler. Preço: $0.015/vCPU/hr. Integra IAM + Secrets Manager.</li>
          <li><strong>Neon Pooler</strong>: embutido em Neon (serverless Postgres).</li>
          <li><strong>Supabase Supavisor</strong>: open-source, Rust. Multi-tenant scale.</li>
          <li><strong>Prisma Accelerate</strong>: pooler + cache em cima, tier free até 10M queries/mês.</li>
          <li><strong>PlanetScale</strong> (MySQL): nativo scale-out com vtgate.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Em 2026, se você escolhe Postgres pra serverless (Lambda, Cloudflare Workers, Vercel Edge), pooler é obrigatório. Ignorar vai estourar em produção mais cedo ou mais tarde.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
