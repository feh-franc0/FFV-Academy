import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-multi-db-arquitetura');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o princípio que guia escolha de múltiplos bancos numa arquitetura?',
    options: [
      'Usar o máximo possível de bancos diferentes para o currículo',
      'Polyglot persistence baseado em access patterns: cada store resolve um padrão específico onde ganha por ordem de grandeza — e o custo operacional é justificável. Não adote um novo banco sem dor medida',
      'Sempre usar Postgres',
      'Sempre usar NoSQL',
    ],
    correct: 1,
    explanation: 'Polyglot persistence (termo de Fowler, 2011) é a ideia de combinar stores especializados. Em 2026, a disciplina é: cada banco adicional traz custo operacional (backup, monitor, incident, expertise no time). Justifique por access pattern onde o especializado ganha 10x+ em latência, custo ou throughput. Postgres resolve 70% dos casos — comece por ele.',
  },
  {
    question: 'Como manter consistência entre Postgres (source of truth) e stores derivados (ClickHouse, vector DB, Redis)?',
    options: [
      'Escrever duplicado na aplicação',
      'Change Data Capture (CDC) com Debezium capturando WAL do Postgres e publicando em Kafka. Consumidores específicos alimentam cada store derivado. Outbox pattern para garantir que events publicados = writes commitados. Eventualmente consistente',
      'Não precisa consistência',
      'Snapshot batch noturno',
    ],
    correct: 1,
    explanation: 'Dual-write na aplicação (escreve Postgres e Kafka) tem race conditions que geram divergência. O padrão robusto é: app escreve só Postgres (com outbox table na mesma transação), Debezium lê o WAL e publica em Kafka, consumers (ClickHouse via Kafka engine, serviço que reindexa embeddings, invalidator de cache) processam. Garante que todo evento publicado = write commitado. Batch noturno funciona só para analytics tolerante a 24h de atraso.',
  },
  {
    question: 'Como um capstone convincente de polyglot persistence deve ser entregue?',
    options: [
      'Só código',
      'Diagrama C4 de componentes + ADR explicando cada escolha (por que Redis aqui e não ZSET em Postgres?), SLOs alvo (p99 por endpoint), pipeline de CDC rodando, observability por store (métricas, alertas), plano de failover documentado, cost breakdown mensal',
      'Só README',
      'Screenshot do dashboard',
    ],
    correct: 1,
    explanation: 'Senior engineer entrega reasoning, não só código. ADRs (Architectural Decision Records) mostram trade-offs considerados e rejeitados. SLOs por endpoint mostram maturidade. CDC rodando prova que você entendeu consistência. Observability por store (latência p99, taxa de erro, custo) prova operação real. Cost breakdown fecha: engenheiro sênior pensa em dinheiro. Repo + writeup estruturado + dashboard live.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-multi-db-arquitetura"
      title="Capstone: arquitetura multi-DB"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Projete e implemente uma arquitetura polyglot realista para um SaaS de suporte ao cliente com IA. Requisitos: OLTP transacional, analytics em dashboards live, busca semântica em base de conhecimento (RAG), rate limiting + sessão, histórico de tickets pesquisável.
        </p>
        <p>
          O capstone vale como peça de portfolio sênior: não é um CRUD, é decisão de arquitetura documentada com trade-offs reais.
        </p>
      </Section>

      <Section title="Stack alvo" accent={accent}>
        <CodeBlock lang="yaml">{`# Mapa de stores por responsabilidade

postgres:              # source of truth transacional
  responsabilidade: users, orgs, tickets, messages, billing
  por_que: ACID, FKs, JSONB flexivel, ecossistema
  exemplos_tables: users, tickets, messages, audit_log, outbox_events

redis:                 # latencia sub-ms, structures
  responsabilidade: session, rate limit, presence, cache hot
  por_que: estruturas (ZSET, Stream), TTL nativo, Lua atomico

clickhouse:            # analytics OLAP
  responsabilidade: eventos, metricas de produto, relatorios
  por_que: colunar + compressao, queries agregadas em bilhoes de rows
  ingestao: via CDC + Kafka engine

pgvector (mesmo Postgres): # busca semantica ate 5M vetores
  responsabilidade: knowledge base, similaridade entre tickets
  por_que: sem infra extra, join com tenant_id nativo, ACID

s3 + athena:           # cold storage / audit
  responsabilidade: logs > 18 meses, backup bruto
  por_que: custo marginal zero, query ad-hoc SQL`}</CodeBlock>
      </Section>

      <Section title="Fluxo CDC (consistência eventual)" accent={accent}>
        <CodeBlock lang="sql">{`-- Outbox pattern no Postgres
CREATE TABLE outbox_events (
    id          BIGSERIAL PRIMARY KEY,
    aggregate   TEXT NOT NULL,
    event_type  TEXT NOT NULL,
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Na mesma transacao do business write
BEGIN;
INSERT INTO tickets (id, org_id, subject, status)
  VALUES ($1, $2, $3, 'open');
INSERT INTO outbox_events (aggregate, event_type, payload)
  VALUES ('ticket', 'ticket.opened', jsonb_build_object(
    'ticketId', $1, 'orgId', $2, 'subject', $3
  ));
COMMIT;`}</CodeBlock>
        <CodeBlock lang="yaml">{`# Debezium connector captura WAL e publica no Kafka
name: pg-outbox-connector
config:
  connector.class: io.debezium.connector.postgresql.PostgresConnector
  database.hostname: pg-primary
  database.dbname: app
  plugin.name: pgoutput
  publication.name: dbz_pub
  table.include.list: public.outbox_events
  transforms: outbox
  transforms.outbox.type: io.debezium.transforms.outbox.EventRouter
  transforms.outbox.route.topic.replacement: events.\${routedByValue}`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone multi-DB — Entregáveis

## 1. Arquitetura
- Diagrama C4 (context, container, component)
- Data flow com CDC e stores derivados
- ADRs numerados: por que Postgres, por que Redis (e nao ZSET em Postgres), por que ClickHouse (e nao materialized views), por que pgvector (e nao Pinecone), quando migrar cada um

## 2. Implementação
- Postgres com schema real (users, orgs, tickets, messages, outbox)
- Redis com ZSET para sliding rate limit + Lua script versionado
- ClickHouse com MergeTree particionado + materialized view para rollup
- pgvector com HNSW + pipeline de reranker
- Debezium + Kafka (ou Redpanda) para CDC
- Dockerfile + docker-compose para reproducao local

## 3. Observability
- Metricas por store (latencia p50/p99, error rate, conexoes, cost/day estimado)
- Dashboard Grafana ou similar
- Alertas (p99 acima do SLO, lag de CDC > 30s, too many parts no CH)

## 4. SLOs e failover
- SLO por endpoint (ex: GET /tickets p99 < 150ms)
- Runbook de failover Postgres (promote replica)
- Runbook de degradacao Redis (cache bypass)
- Teste de chaos simples (matar replica, matar Debezium)

## 5. Writeup
- README principal com diagrama e decisoes
- Blog post ou doc de 2-4k palavras explicando o reasoning
- Cost breakdown mensal estimado (infra + observability)
- Limitations honestas e next iterations`}</CodeBlock>
      </Section>

      <Section title="O que separa sênior de pleno aqui" accent={accent}>
        <Callout tone="info" icon="🎯">
          Pleno entrega o código funcionando. Sênior entrega o código + ADRs mostrando alternativas rejeitadas + SLO + observability + cost awareness + runbook. Um hiring manager lendo esse writeup sabe em 10 minutos que você opera sistema real.
        </Callout>
        <Callout tone="success" icon="🎓">
          Arquitetura polyglot é sobre disciplina, não sobre usar muitos bancos. Cada store a mais é custo operacional. Este capstone prova que você escolhe cada um por razão justificável — e sabe como manter consistência entre eles.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
