import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  NodeGraph,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rds-aurora-dynamodb');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma aplicação web tem carga 90% leitura, 10% escrita, e sofre lentidão nas leituras. O DBA quer escalar leituras horizontalmente mantendo MySQL. Qual estratégia é correta no RDS?',
    options: [
      'Habilitar Multi-AZ — instancia standby absorve leituras',
      'Criar Read Replicas e rotear SELECTs via leitor',
      'Aumentar instance class para db.r6g.16xlarge',
      'Habilitar RDS Proxy para cachear queries',
    ],
    correct: 1,
    explanation: 'Multi-AZ é para ALTA DISPONIBILIDADE — o standby NÃO recebe tráfego, ele só assume em failover. Read Replicas sim replicam o banco de forma assíncrona e aceitam SELECTs. RDS Proxy gerencia pool de conexões mas não cacheia queries. Escalar vertical tem limite. Read Replicas é a resposta padrão do exame para escalar leituras.',
  },
  {
    question: 'Em uma tabela DynamoDB modelada com partition key = UserId, você precisa consultar com frequência por e-mail. Qual recurso usar?',
    options: [
      'Local Secondary Index (LSI) com e-mail como sort key',
      'Global Secondary Index (GSI) com e-mail como partition key',
      'Scan com filter expression',
      'DynamoDB Streams + Lambda',
    ],
    correct: 1,
    explanation: 'LSI compartilha a mesma partition key da tabela base — não serve para trocar a PK. GSI permite PK/SK totalmente diferentes. Scan varre toda a tabela (custoso e lento). Streams dispara em mudanças, não para query. GSI com e-mail como PK é a resposta canônica para "query por atributo não-chave".',
  },
  {
    question: 'Qual a menor RPO que você pode atingir em um cenário de DR com RDS PostgreSQL?',
    options: [
      'Zero, com RDS Multi-AZ cross-region',
      'Poucos segundos, com Aurora Global Database',
      '1 hora, com automated backups',
      '15 minutos, com cross-region snapshot copy',
    ],
    correct: 1,
    explanation: 'Aurora Global Database promete <1s RPO cross-region e <1min RTO via replicação no storage layer — única opção "near-zero" na AWS para RDS-like. RDS Multi-AZ é intra-region. Snapshots copy tem RPO = frequência do job. Backups automatizados tem RPO de 5min point-in-time mas restore leva tempo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rds-aurora-dynamodb"
      title="Bancos: Multi-AZ, Read Replicas e DynamoDB"
      icon="🗄️"
      xp={90}
      readTime={17}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="caching-performance"
      nextTitle="Caching: ElastiCache, DAX e Padrões"
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
        Bancos são o tópico mais denso e o segundo mais cobrado no SAA-C03 (depois de networking). O exame cobra a distinção
        clara entre <strong>disponibilidade</strong> (Multi-AZ), <strong>escalabilidade de leitura</strong> (Read
        Replicas), <strong>performance extrema</strong> (Aurora, DAX), <strong>DR cross-region</strong> (Global Database,
        Global Tables) e <strong>modelagem NoSQL</strong> (LSI vs GSI). Cada um resolve um problema diferente.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="RDS — bancos relacionais gerenciados" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          RDS suporta MySQL, PostgreSQL, MariaDB, Oracle, SQL Server. AWS gerencia patching, backup, failover; você
          controla schema e queries. Não confunda RDS com <em>Aurora</em> — Aurora é um engine proprietário da AWS
          compatível com MySQL e Postgres, com storage layer separada e reescrita.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Multi-AZ', 'Read Replica']}
          rows={[
            ['Objetivo', 'Alta disponibilidade', 'Escalar leituras'],
            ['Sincronização', 'Síncrona', 'Assíncrona (lag em ms–s)'],
            ['Standby aceita reads?', 'Não (exceto Multi-AZ cluster, 2 readers)', 'Sim, é endpoint separado'],
            ['Failover', 'Automático, <60s típico', 'Manual: promover a standalone'],
            ['Cross-region?', 'Não (intra-region)', 'Sim (MySQL/Postgres/MariaDB)'],
            ['Custo', '2× (standby cobrado)', '1× por réplica'],
            ['Até', '1 standby', 'Até 15 réplicas por primário'],
          ]}
        />
        <Callout tone="info">
          <strong>Multi-AZ Cluster (lançado 2022):</strong> variante para MySQL e Postgres com <strong>2 readers</strong>{' '}
          secundários que aceitam tráfego de leitura via cluster endpoint. Cobre HA e um pouco de escalabilidade de
          leitura ao mesmo tempo. Mas ainda assim, para 10 réplicas, use Read Replicas.
        </Callout>
        <NodeGraph
          title="Multi-AZ Standard vs Multi-AZ Cluster"
          accent={ACCENT}
          columns={[
            {
              label: 'Multi-AZ Standard',
              nodes: [
                { icon: '🅿️', label: 'P1 (AZ-a)', sub: 'Primary — aceita reads e writes' },
                { icon: '🅢', label: 'S1 (AZ-b)', sub: 'Standby sync — NÃO aceita reads, só failover' },
                { icon: '🔗', label: 'Endpoint', sub: 'Um único endpoint aponta sempre para o primary atual' },
              ],
            },
            {
              label: 'Multi-AZ Cluster',
              nodes: [
                { icon: '✍️', label: 'W (AZ-a)', sub: 'Writer — aceita writes', tone: 'emphasis' },
                { icon: '👁️', label: 'R1 (AZ-b)', sub: 'Reader ativo — aceita reads', tone: 'emphasis' },
                { icon: '👁️', label: 'R2 (AZ-c)', sub: 'Reader ativo — aceita reads', tone: 'emphasis' },
                { icon: '🔗', label: 'Endpoints', sub: 'writer-endpoint + reader-endpoint (balanceia entre R1/R2)', tone: 'emphasis' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Aurora — o banco AWS reinventado" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Aurora separa compute (nodes MySQL/Postgres compatíveis) de storage (cluster volume replicado 6× em 3 AZs,
          storage auto-expanding até 128TB). Até 15 read replicas, failover &lt; 30s, writer endpoint + reader endpoint.
          3× a performance de MySQL, 5× de Postgres (segundo AWS).
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Storage layer', v: 'SSD distribuído, auto-heal, tolera perda de 2 cópias em escrita e 3 em leitura.' },
            { k: 'Endpoints', v: 'Writer (primário), Reader (load balance entre réplicas), Custom (subset específico), Instance (uma réplica).' },
            { k: 'Aurora Serverless v2', v: 'Escala fine-grained em ACUs (0.5–128). Bom para workloads variáveis ou novos apps sem benchmark.' },
            { k: 'Aurora Global Database', v: 'Replicação cross-region em storage layer: RPO <1s, RTO <1min. Até 5 regiões secundárias leitoras + 1 primária.' },
            { k: 'Fast Database Cloning', v: 'Clone de um cluster em segundos com copy-on-write. Ideal para testes destrutivos.' },
            { k: 'Backtrack', v: 'Rewind do cluster inteiro até 72h atrás, sem restore (apenas Aurora MySQL).' },
            { k: 'RDS Proxy', v: 'Pool de conexões gerenciado. Reduz conexões para DB e sobrevive a failovers sem deixar apps reconectar.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="SaaS multi-tenant global, usuários em 4 continentes, precisa consistência <1s em reads globais"
          winner="Aurora Global Database"
          why="Storage-layer replication cross-region com RPO <1s. Leitores regionais servem read traffic localmente. Promoção em <1min se primário cair."
          alternatives={[
            { name: 'DynamoDB Global Tables', note: 'se o modelo permite NoSQL; multi-active write.' },
          ]}
        />
      </Section>

      <Section title="DynamoDB — NoSQL serverless key-value e document" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          DynamoDB é o NoSQL da AWS: schema-less, partitioned by hash, SLA de latência single-digit-ms em qualquer
          escala, multi-AZ sempre, sem admin de instâncias. Paga por consumo (RCU/WCU) ou on-demand.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modo de capacity', 'Cobrança', 'Caso']}
          rows={[
            ['On-Demand', 'Por request ($/milhão)', 'Tráfego imprevisível, novos apps, spikes'],
            ['Provisioned', 'RCU/WCU provisionadas', 'Carga previsível, custo menor em escala'],
            ['Auto Scaling', 'Provisioned com ajuste automático', 'Intermediário entre os dois'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Índice', 'LSI', 'GSI']}
          rows={[
            ['Partition Key', 'Mesma da tabela base', 'Qualquer atributo'],
            ['Sort Key', 'Diferente', 'Qualquer atributo (opcional)'],
            ['Criação', 'Só na criação da tabela', 'A qualquer momento'],
            ['Capacity', 'Compartilhada com tabela base', 'Própria (RCU/WCU separadas)'],
            ['Consistência', 'Forte suportada', 'Apenas eventual (nunca strongly consistent)'],
            ['Limite', '5 LSIs por tabela', '20 GSIs por tabela (padrão)'],
          ]}
        />
        <Callout tone="warn">
          <strong>Pegadinha clássica do exame:</strong> &ldquo;preciso consultar por outro atributo que não é a PK da tabela&rdquo;
          → GSI. &ldquo;preciso consultar com mesma PK mas outra sort key&rdquo; → LSI. Se o enunciado diz &ldquo;strongly
          consistent reads&rdquo; em índice, LSI é a única opção.
        </Callout>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'DAX (DynamoDB Accelerator)', v: 'Cache in-memory ms→μs. Transparente para aplicação, compatível com a API DynamoDB. Para workloads read-heavy extremos.' },
            { k: 'DynamoDB Streams', v: 'Ordered change log por partição. Retenção 24h. Trigger natural para Lambda (CDC).' },
            { k: 'Global Tables', v: 'Multi-region active-active. Usa Streams. Last-writer-wins em conflito. Até 5 regiões.' },
            { k: 'TTL', v: 'Atributo timestamp → DynamoDB apaga item automaticamente (delay de até 48h). Grátis.' },
            { k: 'Transactions', v: 'ACID em até 100 items entre tabelas. Custa 2× RCU/WCU.' },
            { k: 'PITR', v: 'Point-in-time recovery de 35 dias. Roll-back por timestamp. Não é o mesmo que backup.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Criar tabela on-demand com PK composta
aws dynamodb create-table \\
  --table-name Orders \\
  --attribute-definitions \\
    AttributeName=UserId,AttributeType=S \\
    AttributeName=OrderId,AttributeType=S \\
  --key-schema \\
    AttributeName=UserId,KeyType=HASH \\
    AttributeName=OrderId,KeyType=RANGE \\
  --billing-mode PAY_PER_REQUEST

# Query por PK com condição na SK
aws dynamodb query --table-name Orders \\
  --key-condition-expression "UserId = :u AND begins_with(OrderId, :p)" \\
  --expression-attribute-values '{":u":{"S":"u123"},":p":{"S":"2026"}}'`}</CodeBlock>
      </Section>

      <Section title="Cálculo de RCU/WCU (nível SAA)" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1 RCU', v: '1 strongly-consistent read de 4KB/s OU 2 eventually-consistent de 4KB/s OU 0.5 transactional de 4KB/s.' },
            { k: '1 WCU', v: '1 write de 1KB/s. Transacional = 2 WCU.' },
            { k: 'Round-up', v: 'Sempre arredonda para cima. Ler item de 5KB = 2 RCU (não 1,25).' },
          ]}
        />
        <Callout tone="info">
          <strong>Exemplo:</strong> aplicação faz 300 reads eventualmente consistentes de 8KB/s + 100 writes de 2KB/s.
          <br/>Reads: 300 × 2KB (arredondar 8KB = 2×4KB) × 0,5 (eventual) = 300 RCU.
          <br/>Writes: 100 × 2 (2KB arredonda para 2×1KB) = 200 WCU.
        </Callout>
      </Section>

      <Section title="Estratégias de DR para bancos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'RPO', 'RTO', 'Custo']}
          rows={[
            ['Backup & Restore (snapshot cross-region)', 'minutos–horas', 'horas', '$'],
            ['Pilot Light (standby mínimo replicando)', 'segundos–minutos', '10–30 min', '$$'],
            ['Warm Standby (stack reduzida ativa)', 'segundos', 'minutos', '$$$'],
            ['Multi-Site Active-Active', '~0', 'segundos', '$$$$'],
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="E-commerce grande: checkout não pode cair, tolera 5s de stale reads em catálogo"
          winner="Aurora Global Database (checkout) + DynamoDB Global Tables (catálogo)"
          why="Checkout precisa de consistência e failover rápido → Aurora Global. Catálogo tolera eventual consistency e pode escalar multi-master → DynamoDB Global."
          alternatives={[
            { name: 'Tudo em Aurora Global', note: 'simpler mas perde multi-active write para catálogo.' },
          ]}
        />
      </Section>

      <Section title="Q&A de exame" accent={ACCENT}>
        <QAItem
          q="RDS Read Replica promovida — o que acontece com o primário original?"
          a={
            <span>
              Réplica vira primário standalone. O antigo primário segue normal, mas a replicação entre eles para. Você
              normalmente re-apontaria a aplicação para a nova primária em cenário de DR.
            </span>
          }
        />
        <QAItem
          q="Por que escolher Aurora Serverless v2 em vez de instances provisioned?"
          a={
            <span>
              Workload variável (ex: staging usado em horário comercial). v2 escala em ACUs finas em segundos, sem gap de
              capacity. v1 (legacy) tinha cold start longo — v2 é hot. Ideal também quando você não sabe ainda o tamanho
              certo.
            </span>
          }
        />
        <QAItem
          q="DynamoDB retornou ProvisionedThroughputExceededException — causa e fix?"
          a={
            <span>
              Ultrapassou RCU/WCU provisionado ou &ldquo;hot partition&rdquo; (chave de partição mal distribuída). Fixes:
              (1) migrar para On-Demand; (2) melhorar distribuição da PK (adicionar hash prefix); (3) ativar Auto Scaling
              com alvo 70%.
            </span>
          }
        />
        <QAItem
          q="Qual a diferença entre DAX e ElastiCache na frente do DynamoDB?"
          a={
            <span>
              DAX é transparente e compatível com a SDK do DynamoDB — só trocar endpoint. Não exige mudança de código
              nem estratégia de invalidação. ElastiCache exige cache-aside: você lê cache, fallback para Dynamo, escreve
              cache. Muito mais código e edge cases.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas recorrentes:</strong> (1) Multi-AZ standby NÃO serve reads; (2) LSI exige criação no create-table
        — não dá para adicionar depois; (3) Aurora Global RPO &ldquo;near-zero&rdquo;, não &ldquo;zero&rdquo;; (4) DAX é
        para DynamoDB apenas, não Aurora; (5) PITR em DynamoDB não é backup — pode ser deletado com a tabela se não
        houver backup separado.
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> Multi-AZ = HA, Read Replicas = escalar leituras, Aurora = performance + cluster
        volume, Aurora Global = DR cross-region relacional, DynamoDB = NoSQL serverless com GSI/LSI/DAX/Global Tables.
        Escolha pelo workload: OLTP relacional transacional → RDS/Aurora; key-value altíssima escala → DynamoDB.
      </Callout>
    </div>
  );
}
