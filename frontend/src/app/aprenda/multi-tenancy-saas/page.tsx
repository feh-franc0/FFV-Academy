import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  DecisionBox,
  ArchFlow,
  StackFlow,
  NodeGraph,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('multi-tenancy-saas');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre os modelos Pool, Silo e Bridge (Hybrid) do AWS Well-Architected SaaS Lens?',
    options: [
      'São apenas nomes diferentes para a mesma coisa — Stripe usa todos como sinônimo',
      'Pool: todos os tenants compartilham infraestrutura (1 DB, tenant_id em todas as queries, isolamento via app/RLS) — máxima eficiência de custo. Silo: cada tenant tem stack dedicada (1 DB por tenant) — máximo isolamento, custo linear. Bridge/Hybrid: pool padrão + silo opcional para tier enterprise (compliance, isolation, noisy neighbor). AWS recomenda começar Pool para startups e migrar enterprise para Silo quando exigirem.',
      'Pool é para B2C, Silo é para B2B, Hybrid é para freemium',
      'Pool usa Postgres, Silo usa MongoDB, Hybrid usa DynamoDB — é só escolha de banco',
    ],
    correct: 1,
    explanation: 'AWS Well-Architected Framework — SaaS Lens (2020+) define esses 3 padrões como referência. Pool: shared everything, identificação por tenant_id. Silo: dedicated everything (DB, K8s namespace ou conta AWS). Bridge: mix — geralmente pool com compute compartilhado + DB silo para premium. Trade-offs: custo (Pool ganha), isolamento (Silo ganha), noisy neighbor (Silo ganha), DR e custos operacionais (Pool ganha). Referência: docs.aws.amazon.com/wellarchitected/latest/saas-lens.',
  },
  {
    question: 'Por que Postgres Row-Level Security (RLS) é a peça fundamental do modelo Pool e como ele funciona?',
    options: [
      'RLS é só para esconder colunas — não tem nada a ver com tenants',
      'RLS aplica políticas no nível da linha: você define `CREATE POLICY tenant_isolation ON orders USING (tenant_id = current_setting(\'app.tenant_id\')::uuid)`. Antes de cada query, a app faz `SET LOCAL app.tenant_id = \'uuid\'`. Postgres filtra automaticamente todas as queries para retornar só linhas daquele tenant — incluindo joins. Defesa em profundidade: se desenvolvedor esquecer WHERE tenant_id na query, o RLS ainda corta. Combine com FORCE ROW LEVEL SECURITY para que nem o owner do schema escape.',
      'RLS é deprecated em Postgres 16 — use views materializadas',
      'RLS só funciona se você usar pg_dump, não em runtime',
    ],
    correct: 1,
    explanation: 'Postgres RLS (desde 9.5, 2016) é segurança no kernel do banco. Stack típico em pool: (1) middleware extrai tenant_id do JWT/session; (2) SET LOCAL app.tenant_id antes da query; (3) RLS aplica em SELECT/INSERT/UPDATE/DELETE. Performance: index em tenant_id + planner usa filtro como predicado eficiente. Pegadinha: subqueries e CTEs precisam de SECURITY DEFINER cuidado. Ver: postgresql.org/docs/current/ddl-rowsecurity.html.',
  },
  {
    question: 'Quando vale a pena adotar Citus (sharding horizontal do Postgres) num SaaS multi-tenant pool?',
    options: [
      'Sempre, desde o dia 0 — Postgres normal não escala',
      'Quando o single-node Postgres não dá mais conta (geralmente >1-5TB de dados ou >10k QPS em workload com tenants grandes). Citus shardia tabelas por `distribution_column` (você usa tenant_id como o shard key) — queries por tenant ficam em 1 shard (single-node performance), aggregations cross-tenant viram scatter-gather. Aceita até centenas de shards. Boa fit: SaaS com milhares de tenants pequenos + alguns grandes (long tail). Ruim para: workloads OLAP cross-tenant pesados, alto write throughput num único tenant (hot shard).',
      'Citus é só para empresas com mais de 100 funcionários',
      'Citus substitui o Postgres — não é uma extensão',
    ],
    correct: 1,
    explanation: 'Citus (Microsoft, open source, é extensão Postgres) — distribuição transparente por shard key. Para multi-tenant: distribution_column = tenant_id. Tenant query toca 1 worker; cross-tenant analytics toca todos (paralelizado). Alternativas: vanilla Postgres escala muito antes do que se imagina (Plain.com gerencia milhões de tenants em 1 cluster bem tunado). Antes de Citus, escale verticalmente (db.r6i.16xlarge = 512GB RAM, 64 vCPU) e adicione read replicas. Citus quando vertical não dá mais.',
  },
  {
    question: 'Por que o modelo Silo (DB por tenant) é frequentemente exigido por clientes enterprise mesmo custando 10-100x mais?',
    options: [
      'Porque eles confundem com "VIP" e gostam do nome',
      'Compliance e isolamento são requisitos contratuais reais: SOC 2, HIPAA, FedRAMP, contratos com BNDES/grandes bancos exigem comprovação de data isolation (não basta RLS, exigem isolation física). Resolve também: (1) noisy neighbor — tenant pesado não afeta os outros; (2) compliance per-tenant (1 tenant pode estar em região EU, outro em US-EAST); (3) backup/restore por tenant (você pode dar dump do DB do cliente para ele); (4) DROP/escala fácil — DROP DATABASE = offboard completo. Custo: 1 DB Aurora por tenant = $150+/mês mínimo (justificável quando ARR > $50k/tenant).',
      'É deprecated — em 2026 todos os SaaS usam Pool',
      'Silo é mais barato que Pool — o tenant compartilha menos recursos',
    ],
    correct: 1,
    explanation: 'Trade-off econômico: Silo só faz sentido quando ARR do tenant >> custo do silo. SaaS enterprise B2B (Salesforce, Workday) usa silo. SaaS PLG (Linear, Notion) usa pool com RLS. Bridge: maioria dos SaaS bem-sucedidos. Linear migra tenant para silo só quando ele paga $$$+ enterprise plan. SOC 2 Type 2 audit verifica isolation — RLS é aceito mas auditores enterprise às vezes ainda preferem silo demonstrável.',
  },
  {
    question: 'O que é o "noisy neighbor problem" em multi-tenant pool e quais são as 3 mitigações principais?',
    options: [
      'É quando um cliente reclama muito do suporte — resolve com bloqueio',
      'É quando 1 tenant consome desproporcionalmente recursos (queries pesadas, conexões DB, requisições), degradando latência/throughput dos outros tenants no mesmo pool. Mitigações: (1) Rate limiting per-tenant (Redis token bucket por tenant_id, limitando QPS/RPS/concorrência); (2) Connection pooling per-tenant ou per-tier (PgBouncer com pools dimensionados, evitar 1 tenant esgotar conexões); (3) Resource quotas no Postgres (statement_timeout, work_mem por user, ou setting per-tenant via SET LOCAL). Em casos extremos: migrar tenant problemático para silo.',
      'É um problema do AWS Lambda especificamente',
      'Só ocorre em modelo Silo, não em Pool',
    ],
    correct: 1,
    explanation: 'Noisy neighbor é o motivo #1 que SaaS pool migra para hybrid/silo. Exemplo clássico: tenant rodando export que faz SELECT * de 10M linhas trava IO do DB. Defesas em camadas: WAF/CDN (rate limit edge), app middleware (token bucket por tenant), DB (statement_timeout = 30s, idle_in_transaction_session_timeout). Observabilidade: tracing per-tenant (X-Tenant-ID header propagado), alerting "tenant X consumindo > N% CPU".',
  },
  {
    question: 'Como você isola tenants em S3 quando cada tenant pode fazer upload de arquivos?',
    options: [
      'Use 1 bucket por tenant — escala infinitamente sem problema',
      '1 bucket compartilhado + prefixos por tenant (s3://app/{tenant_id}/{key}) + IAM policies via STS AssumeRole (cada tenant pega credenciais temporárias com policy restrita ao seu prefixo) ou pre-signed URLs gerados pelo backend (que valida tenant_id na sessão antes de assinar). Buckets têm limite soft de 1000/conta — não dá para escalar com 1 bucket/tenant em SaaS de massa. Para isolamento real (silo storage), use 1 bucket por tenant em conta AWS separada (caso enterprise).',
      'Não dá para isolar — S3 é público por design',
      'Use S3 Object Tagging e nada mais',
    ],
    correct: 1,
    explanation: 'AWS hard limit 100 buckets/conta (soft, sobe até 1000). Pool S3: 1 bucket, prefixo por tenant_id, pre-signed URLs gerados após auth. Para letting o client uploadar direto: STS AssumeRole com policy "Resource: arn:aws:s3:::app/${tenant_id}/*". Para silo: 1 bucket/tenant em conta AWS separada (AWS Control Tower automatiza). Defesa cruzada: backend SEMPRE valida tenant_id antes de gerar URL — nunca confie no client.',
  },
];

export default function MultiTenancySaaSPage() {
  return (
    <ModuleLayout
      slug="multi-tenancy-saas"
      title="Multi-tenancy SaaS: pool vs silo vs hybrid"
      icon="🏢"
      xp={70}
      readTime={14}
      trailName="Solo SaaS / Indie Hacker Stack 2026"
      trailColor={accent}
      nextSlug="onboarding-flows-saas"
      nextTitle="Onboarding flows: time-to-value < 5 minutos"
      quiz={quiz}
    >
      <Section title="A decisão arquitetural que define seu SaaS" accent={accent}>
        <p>
          Antes do primeiro cliente, você precisa decidir como separa os dados dele dos outros. Essa
          escolha cascateia em <strong>tudo</strong>: custo de infra, complexidade operacional, ciclo
          de release, compliance, vendabilidade enterprise. Errar aqui não mata — só obriga você a
          gastar 6 meses reescrevendo depois.
        </p>
        <p>
          O <strong>AWS Well-Architected Framework — SaaS Lens</strong> codificou três padrões:{' '}
          <strong>Pool</strong>, <strong>Silo</strong> e <strong>Bridge</strong> (que a gente chama
          de Hybrid). Cada um é uma decisão sobre o que compartilhar e o que isolar.
        </p>
        <Callout tone="info" icon="📖">
          Documentação canônica:{' '}
          <InlineCode>docs.aws.amazon.com/wellarchitected/latest/saas-lens</InlineCode>. Vale ler
          mesmo se você não está na AWS — os princípios valem em qualquer cloud.
        </Callout>
      </Section>

      <Section title="Os 3 modelos lado a lado" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Pool vs Silo vs Bridge — visão estrutural"
          columns={[
            {
              title: 'Pool (Shared)',
              nodes: [
                '1 App — Compartilhado',
                '1 DB — tenant_id em tudo',
                '1 Bucket S3 — prefixo por tenant',
                'RLS — isolamento via app + DB',
              ],
            },
            {
              title: 'Bridge (Hybrid)',
              nodes: [
                '1 App — Compartilhado',
                'Pool DB — small/medium tenants',
                'Silo DBs — enterprise tenants',
                'Tier routing — app escolhe DB por tenant',
              ],
            },
            {
              title: 'Silo (Dedicated)',
              nodes: [
                '1 App por tenant — ou 1 instance',
                '1 DB por tenant — isolamento físico',
                '1 Bucket por tenant — ou conta AWS',
                'Full isolation — compliance pronto',
              ],
            },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Dimensão', 'Pool', 'Bridge', 'Silo']}
          rows={[
            ['Custo /tenant', 'Muito baixo (1/N)', 'Médio', 'Alto (linear)'],
            ['Time-to-onboard', 'Segundos (INSERT)', 'Segundos a minutos', 'Minutos a horas (provisiona DB)'],
            ['Isolamento', 'Lógico (RLS, app)', 'Misto', 'Físico'],
            ['Noisy neighbor', 'Alto', 'Médio', 'Zero'],
            ['Compliance enterprise', 'Difícil (precisa provar RLS)', 'Médio', 'Trivial'],
            ['Deploy', '1 release atinge todos', '1 release + per-tenant migrations', 'N releases ou auto'],
            ['Backup/restore por tenant', 'Difícil (extract com tenant_id)', 'Médio', 'Trivial (pg_dump do DB)'],
            ['DR cross-region', 'Replicação global', 'Misto', 'Replicação por tenant'],
            ['Schema migration', 'Atômica', 'Atômica no pool + N nos silos', 'N execuções'],
            ['Operacionalmente', 'Simples', 'Complexo', 'Trabalhoso em escala'],
          ]}
        />
      </Section>

      <Section title="Pool: o modelo padrão para começar" accent={accent}>
        <p>
          O modelo Pool é o &quot;Postgres com <InlineCode>tenant_id</InlineCode> em todas as
          tabelas&quot;. Toda query tem um filtro <InlineCode>WHERE tenant_id = ?</InlineCode>.
          Isolamento é feito por <strong>defesa em camadas</strong>: app (middleware injeta filtro)
          + DB (RLS força a regra).
        </p>
        <ArchFlow
          accent={accent}
          title="Anatomia Pool"
          columns={[
            {
              title: 'Edge',
              items: [
                'WAF/CDN — Rate limit por IP',
                'Auth Gateway — JWT → tenant_id + user_id',
              ],
            },
            {
              title: 'App',
              items: [
                'Middleware — Extrai tenant_id do JWT',
                'SET LOCAL — app.tenant_id no início da transação',
                'ORM — Queries SEMPRE filtram tenant_id',
              ],
            },
            {
              title: 'Banco',
              items: [
                'Postgres — Tabelas com tenant_id UUID',
                'RLS Policy — Filtra automaticamente',
                'Indexes — (tenant_id, ...) composto',
              ],
            },
          ]}
        />
        <h4 style={{ color: accent, marginTop: 24 }}>Schema típico</h4>
        <CodeBlock lang="sql">{`-- 1. Toda tabela tem tenant_id (UUID, com FK pra tenants)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  total NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index composto começando por tenant_id (planner usa como filtro inicial)
CREATE INDEX orders_tenant_created_idx ON orders (tenant_id, created_at DESC);

-- 3. Habilita RLS na tabela
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY; -- pega até o owner

-- 4. Policy: cada SELECT/INSERT/UPDATE/DELETE filtra pelo session setting
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);`}</CodeBlock>
        <h4 style={{ color: accent, marginTop: 24 }}>Middleware da app (Node/Postgres)</h4>
        <CodeBlock lang="ts">{`// middleware/tenant.ts
import { db } from '@/lib/db';

export async function withTenant<T>(
  tenantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // SET LOCAL escopa o setting à transação — limpa no commit/rollback
    await tx.execute(\`SET LOCAL app.tenant_id = '\${tenantId}'\`);
    return fn();
  });
}

// uso em route handler
export async function GET(req: Request) {
  const tenantId = await getTenantFromJWT(req);
  return withTenant(tenantId, async () => {
    const orders = await db.select().from(orders); // RLS filtra automaticamente
    return Response.json(orders);
  });
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Defesa em camadas, não única.</strong> Aplique tenant_id na ORM/query manualmente
          (não confie só no RLS). RLS é a rede de segurança contra o bug do dev que esqueceu. Se
          algum dia você desabilitar RLS para uma migration de massa, a app continua segura porque o
          WHERE explícito ainda está lá.
        </Callout>
      </Section>

      <Section title="Connection pooling e tenant context" accent={accent}>
        <p>
          Em pool, um problema comum: você usa PgBouncer (transaction mode) e os settings{' '}
          <InlineCode>SET LOCAL</InlineCode> ficam confusos. Soluções:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'PgBouncer session mode', v: 'Mais simples, mas conexões não são reusáveis entre tenants. Caro em escala.' },
            { k: 'PgBouncer transaction mode + SET LOCAL', v: 'SET LOCAL escopa por transação — funciona. Só não use prepared statements globais.' },
            { k: 'Search path por tenant', v: 'Schema-per-tenant (pseudo-silo dentro do mesmo DB). SET LOCAL search_path = tenant_xyz. Funciona para até ~500 tenants antes do catálogo ficar pesado.' },
            { k: 'JWT no DB role', v: 'Avançado: cada tenant tem seu DB role. SET ROLE no início. RLS via current_user. Funciona, mas operacionalmente complexo.' },
          ]}
        />
      </Section>

      <Section title="Silo: quando enterprise exige (e paga por) isolamento real" accent={accent}>
        <p>
          Silo é &quot;1 stack por tenant&quot;. Pode ser:
        </p>
        <StackFlow
          accent={accent}
          title="Variações do modelo Silo"
          items={[
            'Silo leve — 1 DB por tenant — Pool de DBs Aurora Serverless v2 ou RDS, 1 banco por tenant, mesma app compartilhada. App roteia connection string por tenant_id. Onboard novo tenant = CREATE DATABASE.',
            'Silo médio — 1 cluster K8s namespace — Cada tenant tem namespace dedicado com pods isolados (resource quotas, network policies). DB pode ser shared ou dedicated.',
            'Silo pesado — 1 conta AWS por tenant — AWS Organizations + Control Tower. Cada tenant em conta separada. Máximo isolamento, compliance pronto (SOC 2, HIPAA, FedRAMP). Usado por SaaS enterprise B2B/regulado (saúde, financeiro, gov).',
          ]}
        />
        <DecisionBox
          scenario="Cliente Fortune 500 exige 'banco de dados dedicado' como condição para fechar contrato de $300k/ano"
          winner="Silo leve (1 RDS dedicado, mesma app)"
          winnerColor={accent}
          why="ARR $300k justifica $300-500/mês de DB dedicado. Mesma app code-base (deploy continua atômico). Cliente pode pedir audit do isolamento e você mostra: 'cluster RDS Aurora dedicado, KMS key específica, backup separado'. Compliance: troca de auditor satisfeito em horas."
          alternatives={[
            { name: 'Silo pesado (conta AWS dedicada)' }, { name: 'Overkill para 1 cliente, vira pesadelo operacional. Vale quando há 5+ clientes enterprise.' }, { name: 'Pool + RLS' }, { name: 'Cliente pode recusar audit. Você perde o contrato. Não vale brigar.' }
          ]}
        />
      </Section>

      <Section title="Bridge / Hybrid: o que SaaS de verdade fazem" accent={accent}>
        <p>
          Quase nenhum SaaS bem-sucedido é 100% pool ou 100% silo. O modelo Bridge (Hybrid) é:
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Roteamento por tenant em Bridge"
          steps={[
            { label: '1. Request chega', desc: 'JWT contém tenant_id' },
            { label: '2. Lookup em tabela tenants', desc: 'tenants.tier = "free" | "pro" | "enterprise"; tenants.db_url = null (pool) ou string (silo)' },
            { label: '3. Roteamento', desc: 'tier ∈ {free, pro} → conecta no DB pool com SET LOCAL app.tenant_id. tier = "enterprise" → conecta no DB silo dedicado.' },
            { label: '4. Mesma app code', desc: 'Apenas a connection string muda. Migrations rodam em todos os DBs (pool + silos) via job/release.' },
            { label: '5. Migração tenant pool → silo', desc: 'Script: pg_dump do filtro tenant_id no pool, restore num DB novo, update tenants.db_url, drop linhas no pool.' },
          ]}
        />
        <Callout tone="success" icon="🏗️">
          <strong>Pragmatismo:</strong> Linear, Notion, Vercel — todos começaram pool e introduziram
          silo só para top 5-10% dos clientes que pagavam $50k+/ano e exigiam isolation. Bridge
          permite isso sem reescrever a app.
        </Callout>
      </Section>

      <Section title="Citus: quando o Postgres pool não dá mais" accent={accent}>
        <p>
          <strong>Antes de Citus, escale vertical.</strong> Postgres em <InlineCode>db.r6i.16xlarge</InlineCode>{' '}
          (64 vCPU, 512GB RAM) aguenta absurdamente. Plain.com publicou em 2024 que rodam{' '}
          <em>milhões</em> de tenants em 1 cluster vanilla Postgres com tuning.
        </p>
        <p>
          Quando o vertical não dá (tipicamente {'>'}1-5TB ou {'>'}10k QPS sustentado), Citus entra:
        </p>
        <CodeBlock lang="sql">{`-- Habilita extensão Citus
CREATE EXTENSION citus;

-- Marca tabela como distribuída por tenant_id
SELECT create_distributed_table('orders', 'tenant_id');
SELECT create_distributed_table('events', 'tenant_id');

-- Tabelas de referência (pequenas, replicadas em todos os shards)
SELECT create_reference_table('countries');

-- Query típica: por tenant_id → vai pra 1 shard só (single-node performance)
SELECT * FROM orders WHERE tenant_id = '...' AND created_at > now() - interval '7 days';

-- Cross-tenant: scatter-gather paralelizado
SELECT count(*) FROM orders WHERE created_at > now() - interval '1 day';`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Cenário', 'Citus bom?', 'Por quê']}
          rows={[
            ['Muitos tenants pequenos', '✅ Excelente', 'Distribuídos uniformemente, todas queries por tenant_id = single-shard'],
            ['Poucos tenants enormes', '⚠️ Cuidado', 'Hot shard — 1 worker sobrecarregado. Force a redistribuição manual ou migre para silo.'],
            ['Analytics cross-tenant', '✅ Bom', 'Citus parallelize scatter-gather; OLAP workloads se beneficiam.'],
            ['Joins entre tenants', '❌ Ruim', 'Joins não-colocados = movimento de dados entre shards = lento. Evite design.'],
            ['Real-time / OLTP intenso', '🟡 Médio', 'Funciona, mas adiciona latência de rede entre coordinator e workers.'],
          ]}
        />
      </Section>

      <Section title="Schema migrations em multi-tenant" accent={accent}>
        <p>
          Migrations em SaaS pool são triviais — 1 ALTER TABLE atinge tudo. Em silo / bridge, vira
          orquestração:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Pool', v: 'ALTER TABLE atomic. Cuidado com locks em tabelas grandes (use pg_repack, CREATE INDEX CONCURRENTLY).' },
            { k: 'Silo / Bridge', v: 'Job rota por todos os DBs aplicando migration. Tolerância a falha (1 falha = retry, não bloqueia os outros). Track versão por DB.' },
            { k: 'Backwards compatibility', v: 'Sempre 2 deploys: (1) migration aditiva (ADD COLUMN nullable); (2) deploy app que usa; (3) backfill; (4) ALTER COLUMN NOT NULL. Nunca breaking direto.' },
            { k: 'Tools', v: 'Atlas, Drizzle kit, Flyway, Sqitch. Para silo, geralmente custom script Go/Python iterando DBs.' },
          ]}
        />
      </Section>

      <Section title="Noisy neighbor: o pesadelo do pool em escala" accent={accent}>
        <p>
          Cliente A faz <InlineCode>SELECT * FROM events</InlineCode> sem LIMIT, varre 50M linhas, IO
          do banco satura, todos os outros tenants veem p99 subindo. Esse é o noisy neighbor.
          Defesas:
        </p>
        <StackFlow
          accent={accent}
          title="Mitigações em camadas"
          items={[
            '1. Edge — Rate limit per-tenant — Cloudflare Workers ou nginx + Redis token bucket. Limite por tenant_id, não por IP (1 tenant = N IPs). Ex: 100 req/s, 10 concurrent.',
            '2. App — Resource quotas — Middleware: timeout por request (10-30s), max payload, max query complexity (GraphQL depth limit).',
            '3. DB — Postgres settings per-user — ALTER ROLE tenant_app SET statement_timeout = "30s", idle_in_transaction_session_timeout = "60s", work_mem = "16MB".',
            '4. Observabilidade per-tenant — Trace com X-Tenant-ID propagado (OpenTelemetry). Datadog/Honeycomb mostra "top 10 tenants por p99". Alert quando 1 tenant > 30% do total.',
            '5. Auto-escalation para silo — Política: tenant gera >X% load por Y dias → conversão para silo (manual ou via job). Vira upsell ("você precisa do plano enterprise para esse volume").',
          ]}
        />
      </Section>

      <Section title="Storage (S3/Blob) multi-tenant" accent={accent}>
        <p>
          Arquivos seguem mesma lógica: pool (1 bucket, prefixo por tenant) vs silo (1 bucket/conta
          por tenant). Em pool:
        </p>
        <CodeBlock lang="ts">{`// Backend gera pre-signed URL com tenant_id validado
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getUploadUrl(tenantId: string, filename: string) {
  // tenant_id na key — backend SEMPRE controla
  const key = \`\${tenantId}/uploads/\${crypto.randomUUID()}-\${filename}\`;
  const cmd = new PutObjectCommand({
    Bucket: 'meu-saas-prod',
    Key: key,
    ContentType: 'application/octet-stream',
  });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: 300 });
  return { url, key };
}

// Cliente uploada direto para S3 com PUT
// Servidor só sabe da key — armazena em DB ligada ao tenant_id
// Nunca aceita key que o cliente envia (poderia escrever em outro tenant)`}</CodeBlock>
        <Callout tone="warn" icon="🔒">
          <strong>Erro clássico:</strong> aceitar uma <InlineCode>key</InlineCode> do client. Sempre
          gere a key no backend, prefixada com o <InlineCode>tenant_id</InlineCode> da sessão. Caso
          contrário, cliente A pode escrever em <InlineCode>tenant_B/secret.json</InlineCode>.
        </Callout>
      </Section>

      <Section title="Observabilidade multi-tenant" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Logs com tenant_id', v: 'Propague tenant_id em logs estruturados (Datadog, Pino). Cada log tem { tenant_id, user_id, request_id }. Permite filtrar "todos os erros do tenant X".' },
            { k: 'Tracing W3C com baggage', v: 'OpenTelemetry baggage transporta tenant_id ao longo de microservices. Visualiza "spans do tenant X" em qualquer serviço.' },
            { k: 'Métricas com label', v: 'Prometheus / OTLP metrics com label tenant_id — cuidado com cardinalidade (1000 tenants = 1000 timeseries por métrica). Para SaaS com 10k+ tenants, sample ou agregue.' },
            { k: 'Dashboards per-tenant', v: 'Cliente enterprise frequentemente pede dashboard "uptime do meu tenant". Geralmente Grafana com variable tenant_id na URL.' },
          ]}
        />
      </Section>

      <Section title="O caminho recomendado para solo SaaS" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Evolução típica de arquitetura multi-tenant"
          steps={[
            { label: 'Dia 0 → 100 tenants', desc: 'Pool simples. 1 Postgres pequeno (db.t3.medium $60/mo). tenant_id em todas as tabelas. RLS opcional (foca em correctness via ORM). PgBouncer básico.' },
            { label: '100 → 1k tenants', desc: 'Pool + RLS habilitado + rate limit por tenant. Postgres médio (db.r6g.large). Read replicas para analytics. Métricas per-tenant.' },
            { label: '1k → 10k tenants', desc: 'Bridge: pool continua para maioria, primeiros silos para enterprise (1 RDS por cliente $200k+ ARR). Migrations orquestradas.' },
            { label: '10k+ tenants + clientes regulados', desc: 'Hybrid pesado: pool + silos + conta AWS dedicada para fed/health/banks. Citus se vertical não dá mais. Time de SRE dedicado (não é mais solo).' },
          ]}
        />
        <Callout tone="success" icon="🎯">
          <strong>Para solo SaaS começando agora:</strong> Pool com tenant_id + RLS, hospedado em
          Neon ou Supabase. Vai aguentar até alguns milhares de tenants antes de você precisar
          pensar em silo. Resista à tentação de over-engineer.
        </Callout>
      </Section>

      <Section title="Perguntas reais da trincheira" accent={accent}>
        <QAItem
          q="Tenant_id como UUID ou string slug ('acme')?"
          a="UUID. Nunca exponha. Slugs visíveis (acme.seusaas.com) viram um campo separado tenants.slug com UNIQUE, mas o tenant_id real é UUID interno. Evita enumeration attack e permite renomear cliente."
        />
        <QAItem
          q="Como faço soft delete em multi-tenant?"
          a="Coluna deleted_at TIMESTAMPTZ + WHERE deleted_at IS NULL em todas as queries (ou RLS adicional). Para offboard de tenant completo: DELETE FROM tenants WHERE id = '...' com ON DELETE CASCADE — apaga tudo. Em silo: DROP DATABASE."
        />
        <QAItem
          q="Posso fazer backup de 1 tenant específico em pool?"
          a={
            <>
              Sim, mas é trabalhoso. <InlineCode>pg_dump --table=... --where=&quot;tenant_id=...&quot;</InlineCode>{' '}
              <em>não existe</em> nativamente — pg_dump não filtra linhas. Você roda{' '}
              <InlineCode>COPY (SELECT * FROM ... WHERE tenant_id = ...) TO STDOUT</InlineCode> por
              tabela, ou usa uma view/snapshot lógica. Em silo: trivial,{' '}
              <InlineCode>pg_dump tenantdb</InlineCode>.
            </>
          }
        />
        <QAItem
          q="Como gerencio limites por plano (storage, MAU) em multi-tenant?"
          a="Tabela tenants com colunas como max_users, max_storage_gb, etc. Middleware/job que valida a cada operação. Tabela tenant_usage atualizada via trigger ou job assíncrono (count(*) batido contra max no plano). Stripe Tax codes ou metered prices também podem refletir esses limites (módulo anterior)."
        />
        <QAItem
          q="Tenant pediu 'data residency UE' — como atender em pool?"
          a="Pool global em UE não escala — você precisa de bridge. Ou: separar pool por região (pool-us-east, pool-eu-west) e tenant.region determina qual cluster usa. Quando UE pediu silo, cria o silo na region certa. Ver compliance: GDPR Art. 44+ exige adequate guarantees para transfer of data."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'AWS Well-Architected SaaS Lens', v: 'docs.aws.amazon.com/wellarchitected/latest/saas-lens — bíblia oficial. Lê e relê.' },
            { k: 'AWS SaaS Factory', v: 'aws.amazon.com/partners/programs/saas-factory — patterns, reference architectures.' },
            { k: 'Postgres RLS docs', v: 'postgresql.org/docs/current/ddl-rowsecurity.html' },
            { k: 'Citus docs', v: 'docs.citusdata.com — Microsoft mantém, open source.' },
            { k: 'Plain.com engineering blog', v: 'Posts sobre scaling Postgres multi-tenant em produção. plain.com/blog.' },
            { k: 'Linear engineering blog', v: 'linear.app/blog — referência de pool moderno (sync engine + RLS).' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          <strong>Próximo módulo:</strong> arquitetura pronta. Agora o cliente precisa
          <em>entender</em> seu produto em &lt;5 minutos. Onboarding flows: time-to-value, empty
          states, product tours, activation rate.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
