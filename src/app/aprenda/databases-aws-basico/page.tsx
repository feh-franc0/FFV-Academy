import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('databases-aws-basico');

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma aplicação de e-commerce precisa de escalabilidade horizontal massiva, milhões de itens e latência de milissegundos. Qual banco escolher?',
    options: [
      'Amazon RDS for MySQL',
      'Amazon Aurora',
      'Amazon DynamoDB',
      'Amazon Redshift',
    ],
    correct: 2,
    explanation: 'DynamoDB é NoSQL key-value, totalmente gerenciado, escala horizontalmente de forma transparente, latência de single-digit ms em qualquer escala. Ideal para carrinhos, sessões, catálogos, leaderboards.',
  },
  {
    question: 'Qual serviço AWS é um data warehouse otimizado para consultas analíticas em petabytes?',
    options: [
      'Amazon RDS',
      'Amazon DynamoDB',
      'Amazon Redshift',
      'Amazon ElastiCache',
    ],
    correct: 2,
    explanation: 'Redshift é o data warehouse da AWS. Colunar, massively parallel processing (MPP), integra com S3 (Spectrum), ideal para BI e analytics. Não confundir com RDS (transacional) ou DynamoDB (NoSQL).',
  },
  {
    question: 'Qual banco de dados da AWS foi desenhado pela própria AWS para ser compatível com PostgreSQL/MySQL e oferecer até 5x o desempenho de MySQL?',
    options: [
      'RDS for PostgreSQL',
      'Amazon Aurora',
      'DocumentDB',
      'Neptune',
    ],
    correct: 1,
    explanation: 'Aurora é proprietário AWS, compatível com PostgreSQL e MySQL, com arquitetura de storage distribuído em 6 cópias em 3 AZs. Até 5x MySQL e 3x PostgreSQL vanilla em throughput.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="databases-aws-basico"
      title="Databases: RDS, Aurora, DynamoDB, Redshift"
      icon="🗄️"
      xp={60}
      readTime={12}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="networking-vpc-route53"
      nextTitle="Networking: VPC, Route 53, CloudFront"
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
        A AWS oferece um banco para cada modelo de dados: relacional, key-value, documento, grafo, time-series, in-memory, ledger, data warehouse. Escolher errado gera problemas de performance ou custo proibitivo. O CLF-C02 cobra os fundamentos de cada família — não exige dominar queries, mas sim saber <em>quando usar cada um</em>.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Cloud Technology and Services" weight="34%" color={ACCENT} />
        <p>
          Databases formam cerca de 20% do domínio 3. As questões são de cenário: "qual banco para esta workload?". A chave é reconhecer o padrão de acesso descrito (transacional? analítico? key-value? grafo?) e mapear ao serviço correto.
        </p>
      </Section>

      <Section title="O catálogo AWS de bancos (purpose-built)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Serviço AWS', 'Uso típico']}
          rows={[
            ['Relacional', 'RDS, Aurora', 'ERPs, CRMs, apps transacionais clássicas'],
            ['Key-value / Document', 'DynamoDB', 'Carrinhos, sessões, leaderboards, IoT'],
            ['Document (MongoDB)', 'DocumentDB', 'Apps que já usam MongoDB API'],
            ['In-memory', 'ElastiCache (Redis/Memcached)', 'Cache, session store, real-time leaderboards'],
            ['Graph', 'Neptune', 'Redes sociais, fraud detection, knowledge graphs'],
            ['Time-series', 'Timestream', 'IoT, métricas, dados temporais'],
            ['Ledger (imutável)', 'QLDB', 'Compliance, auditoria, supply chain'],
            ['Wide-column', 'Keyspaces', 'Apps que usam Apache Cassandra'],
            ['Data warehouse', 'Redshift', 'BI, analytics em petabytes'],
            ['Search', 'OpenSearch', 'Busca full-text, logs'],
          ]}
        />
      </Section>

      <Section title="Amazon RDS (Relational Database Service)" accent={ACCENT}>
        <p>
          Bancos relacionais gerenciados. A AWS cuida do SO, patches, backups, réplicas. Engines suportados:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>MySQL</strong>, <strong>PostgreSQL</strong>, <strong>MariaDB</strong> — open source</li>
          <li>• <strong>Oracle</strong>, <strong>SQL Server</strong> — proprietários (BYOL ou license-included)</li>
          <li>• <strong>Aurora</strong> (MySQL/PostgreSQL-compatible) — proprietário AWS</li>
          <li>• <strong>Db2</strong> — desde 2023</li>
        </ul>
        <p><strong>Features essenciais:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Multi-AZ</InlineCode> — standby síncrono em outra AZ (failover &lt;2 min)</li>
          <li>• <InlineCode>Read Replicas</InlineCode> — até 5 réplicas assíncronas para escalar leitura</li>
          <li>• <InlineCode>Automated Backups</InlineCode> — retenção 1-35 dias (point-in-time recovery)</li>
          <li>• <InlineCode>Manual Snapshots</InlineCode> — mantidos indefinidamente</li>
          <li>• <InlineCode>Encryption at rest</InlineCode> — via KMS</li>
        </ul>
      </Section>

      <Section title="Amazon Aurora — o diferencial" accent={ACCENT}>
        <p>
          Proprietário AWS, compatível com PostgreSQL e MySQL. Arquitetura de storage distribuído em <strong>6 cópias em 3 AZs</strong>. Auto-scale de storage até 128 TB. Failover &lt;30s.
        </p>
        <ArchDiagram title="Aurora storage layer" accent={ACCENT}>{`
           ┌─────────────────────────────────────────┐
           │          Aurora Writer (primary)        │
           └─────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────────┐
           │                  │                      │
    AZ-a   ▼          AZ-b    ▼              AZ-c    ▼
     ┌──────────┐      ┌──────────┐         ┌──────────┐
     │ storage  │      │ storage  │         │ storage  │
     │ copy 1/2 │      │ copy 3/4 │         │ copy 5/6 │
     └──────────┘      └──────────┘         └──────────┘
     ┌──────────┐      ┌──────────┐         ┌──────────┐
     │ reader 1 │      │ reader 2 │         │ reader 3 │
     └──────────┘      └──────────┘         └──────────┘
`}</ArchDiagram>
        <p><strong>Benefícios vs RDS vanilla:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Até 5x throughput de MySQL, 3x de PostgreSQL</li>
          <li>• Até 15 réplicas de leitura (vs 5 no RDS)</li>
          <li>• Backup contínuo incremental para S3</li>
          <li>• <InlineCode>Aurora Serverless v2</InlineCode> — escala automaticamente em ACUs</li>
          <li>• <InlineCode>Global Database</InlineCode> — replicação cross-region &lt;1s</li>
        </ul>
      </Section>

      <Section title="Amazon DynamoDB" accent={ACCENT}>
        <p>
          NoSQL key-value e document, serverless, escala horizontal ilimitada, latência single-digit ms. Pagamento por <strong>capacidade provisionada</strong> (leituras/segundo) ou <strong>On-Demand</strong> (paga por requisição).
        </p>
        <p><strong>Features únicas:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Global Tables</InlineCode> — replicação multi-master multi-region</li>
          <li>• <InlineCode>Streams</InlineCode> — dispara Lambda em mudanças</li>
          <li>• <InlineCode>TTL</InlineCode> — apaga itens automaticamente após timestamp</li>
          <li>• <InlineCode>DAX (DynamoDB Accelerator)</InlineCode> — cache in-memory com latência em microssegundos</li>
          <li>• <InlineCode>PITR</InlineCode> — point-in-time recovery últimos 35 dias</li>
        </ul>
        <Callout tone="info">
          <strong>Padrão do exame:</strong> "Escala horizontal massiva, baixa latência, sem schema rígido" → DynamoDB. "Transações ACID complexas com JOINs" → RDS/Aurora.
        </Callout>
      </Section>

      <Section title="Redshift — data warehouse" accent={ACCENT}>
        <p>
          Data warehouse colunar, MPP (Massively Parallel Processing), até petabytes. Baseado em PostgreSQL modificado. Features:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Redshift Spectrum</InlineCode> — query SQL em dados no S3 sem carregar</li>
          <li>• <InlineCode>Redshift Serverless</InlineCode> — sem gerenciar cluster</li>
          <li>• <InlineCode>Concurrency Scaling</InlineCode> — escala transparente em picos de BI</li>
          <li>• Integra com QuickSight, Tableau, Power BI</li>
        </ul>
      </Section>

      <Section title="ElastiCache — cache in-memory" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Engine', 'Uso', 'Recurso principal']}
          rows={[
            ['Redis', 'Cache + estrutura de dados rica + pub/sub', 'Persistência, replicação, clustering'],
            ['Memcached', 'Cache simples, ultra-leve', 'Multi-threaded, particionamento simples'],
          ]}
        />
        <p>ElastiCache é usado como camada de cache na frente de RDS/DynamoDB para reduzir latência e custo.</p>
      </Section>

      <Section title="Bancos especializados" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Modelo', 'Quando usar']}
          rows={[
            ['Neptune', 'Graph (Gremlin, SPARQL)', 'Redes sociais, fraude, recomendação'],
            ['Timestream', 'Time-series', 'IoT, métricas, DevOps observability'],
            ['QLDB', 'Ledger imutável (append-only)', 'Histórico de transações auditável'],
            ['DocumentDB', 'MongoDB-compatible', 'Apps que já usam MongoDB'],
            ['Keyspaces', 'Cassandra-compatible', 'Apps Cassandra sem gerenciar cluster'],
          ]}
        />
      </Section>

      <Section title="Database Migration Service (DMS)" accent={ACCENT}>
        <p>
          Serviço para migrar bancos on-prem ou entre engines. Suporta homogêneo (Oracle → Oracle) e heterogêneo (Oracle → PostgreSQL). Integra com <strong>AWS Schema Conversion Tool (SCT)</strong> para converter stored procedures.
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="E-commerce com carrinho de compras, 100k usuários simultâneos"
          winner="DynamoDB"
          winnerColor={ACCENT}
          why="Carrinho é key-value (userId → items). DynamoDB escala horizontal automático, latência ms, sem schema. Para pedidos finais (ACID), considere Aurora ou RDS."
          alternatives={[
            { name: 'RDS MySQL', note: 'Pode virar gargalo em picos sem arquitetura de cache/read replicas' },
          ]}
        />
        <DecisionBox
          scenario="Sistema bancário transacional (débitos/créditos ACID)"
          winner="Aurora PostgreSQL (ou RDS PostgreSQL)"
          winnerColor={ACCENT}
          why="ACID, transações complexas, JOINs, consistência forte. Aurora tem melhor HA (Multi-AZ built-in + storage distribuído)."
        />
        <DecisionBox
          scenario="Dashboard de BI consultando 500 TB de eventos de vendas históricos"
          winner="Redshift (ou Redshift Spectrum sobre S3)"
          winnerColor={ACCENT}
          why="Consultas analíticas em volumes petabyte exigem storage colunar + MPP. RDS/Aurora são transacionais, lentos para analytics."
        />
        <DecisionBox
          scenario="Feed de rede social (amigos de amigos, recomendações)"
          winner="Neptune"
          winnerColor={ACCENT}
          why="Grafos naturalmente expressam relacionamentos. Queries 'shortest path', 'common neighbors' são lentas em SQL e rápidas em graph DB."
        />
        <DecisionBox
          scenario="Cache de resultado de API externa, TTL 5 minutos"
          winner="ElastiCache Redis"
          winnerColor={ACCENT}
          why="Latência &lt;1ms, TTL nativo, estruturas ricas (lists, sets, sorted sets). Ficar à frente de RDS ou DynamoDB."
        />
      </Section>

      <Section title="Exemplos de CLI" accent={ACCENT}>
        <CodeBlock lang="bash">{`# RDS — criar instância PostgreSQL Multi-AZ
aws rds create-db-instance \\
  --db-instance-identifier meu-pg \\
  --db-instance-class db.t3.medium \\
  --engine postgres \\
  --master-username admin \\
  --master-user-password <senha> \\
  --allocated-storage 100 \\
  --multi-az

# DynamoDB — criar tabela on-demand
aws dynamodb create-table \\
  --table-name Pedidos \\
  --attribute-definitions AttributeName=id,AttributeType=S \\
  --key-schema AttributeName=id,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST

# DynamoDB — inserir item
aws dynamodb put-item \\
  --table-name Pedidos \\
  --item '{"id":{"S":"001"},"valor":{"N":"199.90"}}'`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha:</strong> "RDS é serverless?" — Não por padrão. <InlineCode>Aurora Serverless v2</InlineCode> sim. RDS Multi-AZ é alta disponibilidade, não serverless. Serverless implica: sem provisionar, escala a zero, cobra pelo uso.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual a diferença entre Multi-AZ e Read Replica no RDS?"
          a={<><strong>Multi-AZ</strong> = standby síncrono para HA (não serve tráfego read até virar primary). <strong>Read Replica</strong> = réplica assíncrona que responde reads (para escalar leitura).</>}
        />
        <QAItem
          q="Quando escolher DocumentDB em vez de DynamoDB?"
          a={<>Quando a aplicação já usa API MongoDB. DocumentDB é MongoDB-compatible com storage gerenciado pela AWS. DynamoDB tem API própria, superior em escala mas exige refatoração.</>}
        />
        <QAItem
          q="Qual banco para IoT com milhões de medições por segundo ordenadas no tempo?"
          a={<><strong>Timestream</strong>. Otimizado para time-series: compressão pesada, retenção automática por faixa (hot/cold storage), queries temporais rápidas.</>}
        />
        <QAItem
          q="Qual feature garante recuperação de RDS a qualquer segundo dos últimos 35 dias?"
          a={<>Point-in-time recovery (PITR), habilitado automaticamente com automated backups (retenção 1-35 dias). Snapshots manuais são pontuais, não contínuos.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> RDS/Aurora = relacional. DynamoDB = NoSQL serverless. Redshift = data warehouse. ElastiCache = cache in-memory. Neptune/Timestream/QLDB = especializados. Aurora tem 6 cópias em 3 AZs. Multi-AZ = HA; Read Replicas = escala de leitura. Aurora Serverless v2 = único RDS-like totalmente serverless. Purpose-built: escolha o banco certo para o padrão de acesso, não o que você conhece.
      </Callout>
    </div>
  );
}
