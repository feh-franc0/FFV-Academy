import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  ExamDomainBadge,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('analytics-bigdata');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Analistas precisam consultar ad-hoc sobre 50TB de logs em S3 usando SQL, sem manter cluster rodando. Qual serviço escolher?',
    options: ['Amazon EMR com Spark', 'Redshift Serverless', 'Athena + Glue Data Catalog', 'QuickSight SPICE'],
    correct: 2,
    explanation: 'Athena é serverless, roda SQL sobre S3 diretamente, paga apenas por TB escaneado, zero infra para gerenciar. Glue Data Catalog expõe schema (crawler extrai automaticamente). EMR exige cluster rodando (e managing). Redshift Serverless funciona mas é mais caro para queries ocasionais sobre data lake — ideal quando você já tem data warehouse estruturado. QuickSight SPICE é camada de BI, não engine de query sobre S3.',
  },
  {
    question: 'Pipeline precisa ingerir 5GB/s de eventos clickstream com latência <1s para dashboard em tempo real. Qual combinação?',
    options: [
      'Kinesis Data Firehose → S3 → Athena',
      'Kinesis Data Streams → Kinesis Data Analytics → OpenSearch',
      'SQS → Lambda → DynamoDB',
      'MSK → EMR Spark → S3',
    ],
    correct: 1,
    explanation: 'Kinesis Data Streams sustenta altíssimo throughput ordenado. Kinesis Data Analytics (agora Managed Apache Flink) processa streams em janelas tumbling/sliding com SQL/Flink. OpenSearch serve dashboards real-time (Kibana). Firehose é batch-oriented (buffer mínimo 60s). SQS não garante ordem. MSK+EMR funciona mas tem overhead operacional maior.',
  },
  {
    question: 'Qual formato de arquivo em S3 maximiza performance e reduz custo de queries Athena?',
    options: ['JSON gzip', 'CSV', 'Parquet particionado', 'Avro'],
    correct: 2,
    explanation: 'Parquet é colunar — Athena lê apenas as colunas selecionadas, reduzindo dados escaneados (e custo) em 5–10×. Compressão nativa (Snappy/GZIP). Particionamento por data/região/etc. limita scope do scan. CSV/JSON são row-oriented — Athena lê o arquivo inteiro. Avro é row-oriented também (bom para streaming, ruim para query ad-hoc).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="analytics-bigdata"
      title="Analytics: Athena, EMR, Kinesis, Glue, Redshift"
      icon="📊"
      xp={60}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="migracao-transferencia-saa"
      nextTitle="Migração para o Arquiteto: DMS, SCT, MGN e DRS"
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
        Analytics no SAA-C03 cobre escolha entre <strong>data lake</strong> (S3 + Athena + Glue) e <strong>data
        warehouse</strong> (Redshift), ingestão (Kinesis vs MSK), ETL (Glue vs EMR) e visualização (QuickSight).
        Não vira DBA — o exame testa se você sabe qual ferramenta resolve qual problema, sem combo errado.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="Arquitetura típica de data lake AWS" accent={ACCENT}>
        <StackFlow
          title="Pipeline end-to-end"
          accent={ACCENT}
          items={[
            {
              icon: '🎯',
              label: 'Sources',
              sub: 'origens',
              detail: 'App logs · RDS CDC · IoT · Clickstream · SaaS · Batch CSV — qualquer origem de dado bruto.',
              connector: 'stream / CDC',
            },
            {
              icon: '🌊',
              label: 'Ingest',
              sub: 'entrada',
              detail: 'Kinesis Streams · Firehose · DMS — coletam e entregam dados ao data lake com buffering e schema-on-write opcional.',
              connector: 'grava em',
            },
            {
              icon: '🪣',
              label: 'Storage',
              sub: 'S3 data lake',
              detail: 'S3 particionado (year/month/day) em Parquet/ORC, lifecycle para Glacier, versionamento, criptografia KMS.',
              connector: 'catalogado por',
            },
            {
              icon: '🗂️',
              label: 'Catalog & ETL',
              sub: 'Glue',
              detail: 'Glue Catalog mantém schemas · Crawlers descobrem estrutura · ETL jobs transformam e normalizam em Parquet.',
              connector: 'expõe pra',
            },
            {
              icon: '🔍',
              label: 'Query & BI',
              sub: 'consumo',
              detail: 'Athena (SQL serverless) · Redshift (DW massivo) · QuickSight (BI) · SageMaker (ML sobre dados catalogados).',
            },
          ]}
        />
      </Section>

      <Section title="Athena — SQL serverless sobre S3" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Engine', v: 'Presto/Trino gerenciado. Query SQL padrão.' },
            { k: 'Cobrança', v: '$5 por TB escaneado (us-east-1, abril/2026). Sem cluster idle.' },
            { k: 'Fontes', v: 'S3 nativo; federation para RDS, DynamoDB, CloudWatch, Elasticache, JDBC.' },
            { k: 'Otimizações', v: 'Colunar (Parquet/ORC) + Partitioning + Compressão + Projection. Redução típica de custo 80%+.' },
            { k: 'CTAS / INSERT', v: 'Create Table As Select para gerar Parquet particionado a partir de CSV/JSON — one-off ETL.' },
            { k: 'Workgroups', v: 'Isolamento de queries + limits + cost tracking por equipe.' },
            { k: 'Federated Query', v: 'Query cross-source usando Lambda data connectors.' },
          ]}
        />
        <CodeBlock lang="sql">{`-- Exemplo: query particionada com projection
SELECT user_id, COUNT(*) AS sessions
FROM logs.events
WHERE year = 2026 AND month = 4
GROUP BY user_id
ORDER BY sessions DESC
LIMIT 100;`}</CodeBlock>
      </Section>

      <Section title="Redshift — data warehouse colunar" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Arquitetura', v: 'Leader node + compute nodes (ra3 com managed storage, escala compute/storage separados).' },
            { k: 'Colunar + MPP', v: 'Armazenamento colunar + paralelismo massivo entre nodes. Compressão automática.' },
            { k: 'Redshift Spectrum', v: 'Query em S3 diretamente sem ingerir. Similar a Athena mas acessando de dentro do cluster.' },
            { k: 'Aurora Zero-ETL', v: 'Replicação quase em tempo real de Aurora para Redshift sem pipeline manual.' },
            { k: 'Serverless', v: 'Escala em RPU automaticamente. Ideal para workloads esporádicos.' },
            { k: 'Concurrency Scaling', v: 'Clusters transparentes absorvem picos de queries concorrentes.' },
            { k: 'Data Sharing', v: 'Share live data read-only entre clusters sem copiar.' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Athena', 'Redshift', 'Redshift Spectrum']}
          rows={[
            ['Serverless', 'Cluster provisionado (ou Serverless)', 'Cluster Redshift acessando S3'],
            ['Pay per TB scanned', 'Pay por node/hora', 'Cobra TB scanned + cluster'],
            ['Ad-hoc queries sobre data lake', 'BI estruturado, dashboards pesados', 'Extender Redshift para S3 externo'],
            ['Latência: segundos–minutos', 'ms–segundos (hot queries)', 'Segundos'],
          ]}
        />
      </Section>

      <Section title="Glue — ETL e Data Catalog" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Glue Data Catalog', v: 'Metastore Hive-compatible central. Athena, EMR, Redshift Spectrum usam o mesmo catálogo.' },
            { k: 'Crawlers', v: 'Detectam schema automaticamente em S3/RDS/DynamoDB e populam Data Catalog.' },
            { k: 'Glue ETL Jobs', v: 'Spark managed. Escala em DPUs. Python shell para jobs pequenos.' },
            { k: 'Glue DataBrew', v: 'Visual data prep (250+ transforms no-code).' },
            { k: 'Glue Studio', v: 'Editor visual para jobs Spark.' },
            { k: 'Glue Streaming', v: 'Spark Structured Streaming sobre Kinesis/MSK.' },
            { k: 'Job Bookmarks', v: 'Rastreio de dados já processados para incremental ETL.' },
          ]}
        />
      </Section>

      <Section title="EMR — Hadoop/Spark gerenciado" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Frameworks', v: 'Spark, Hive, Presto, HBase, Flink, Trino, Hudi, Iceberg.' },
            { k: 'Deployment', v: 'EC2 (mais controle), EKS (containers), Serverless (sem cluster management), Outposts (on-prem).' },
            { k: 'Storage', v: 'EMRFS (S3 com consistency) vs HDFS em EBS (temporário).' },
            { k: 'Instance fleets', v: 'Spot + On-Demand misturados para reduzir custo.' },
            { k: 'Quando escolher', v: 'Transformações custom complexas, migração de Hadoop on-prem, Spark ML pipelines grandes.' },
          ]}
        />
        <Callout tone="info">
          <strong>Glue vs EMR:</strong> Glue é managed sem cluster visível, escolha default para ETL Spark.
          EMR quando você precisa customizar bootstrap, usar frameworks fora do Glue (HBase, Presto standalone, Flink) ou
          ter full control sobre o cluster. Glue é mais caro por DPU mas zero admin.
        </Callout>
      </Section>

      <Section title="Ingestão — Kinesis, DMS, MSK" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Uso']}
          rows={[
            ['Kinesis Data Streams', 'Stream ordenado por shard, retenção até 365 dias.'],
            ['Kinesis Data Firehose', 'Delivery managed para S3/Redshift/OpenSearch/Splunk, buffer mínimo 60s.'],
            ['Managed Apache Flink', 'Analytics em stream (ex-Kinesis Data Analytics).'],
            ['MSK (Managed Kafka)', 'Kafka cluster gerenciado quando ecosystem Kafka é requisito.'],
            ['DMS (Database Migration Service)', 'CDC contínuo de bancos OLTP para S3/Redshift/Kafka. Ideal para Zero-ETL-like replicação.'],
            ['DataSync', 'Transferência agendada on-prem ↔ S3/EFS/FSx.'],
            ['Snow Family', 'Transferência de grandes volumes (TB/PB) via hardware físico.'],
          ]}
        />
      </Section>

      <Section title="OpenSearch, QuickSight, SageMaker" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'OpenSearch Service', v: 'Search + analytics baseado em Elasticsearch fork. Kibana/OpenSearch Dashboards. Ideal para logs, full-text, real-time analytics.' },
            { k: 'QuickSight', v: 'BI serverless. SPICE (in-memory) para performance. ML insights automáticos. Pay-per-session economiza vs licenças fixas.' },
            { k: 'SageMaker', v: 'Plataforma ML completa — treinamento, deployment, ground truth, etc. No SAA entra como consumidor final de data lake.' },
            { k: 'Lake Formation', v: 'Governança + permissões fine-grained sobre Data Catalog (row/column level).' },
          ]}
        />
      </Section>

      <Section title="Cenários arquiteturais do exame" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Empresa quer criar data lake moderno partindo do zero, times distribuídos, custo baixo"
          winner="S3 + Glue Catalog + Athena (+ Lake Formation para governança)"
          why="Serverless ponta-a-ponta. Sem cluster, times podem consumir com SQL familiar. Glue cataloga, Lake Formation governa."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="DW relacional legado on-prem com 20TB sendo migrado; dashboards executivos com SLA <1s"
          winner="Redshift (ra3 com managed storage) + QuickSight"
          why="Redshift otimizado para OLAP estruturado. SLA baixo exige cluster dedicado/quente. QuickSight SPICE para dashboards."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Pipeline real-time de IoT: ingest 1M events/s, enriquecer com dado de RDS, gravar parquet + alertar"
          winner="Kinesis Streams → Managed Flink (enrich + window) → Firehose (S3 Parquet) + SNS alerts"
          why="Streams aguenta throughput. Flink permite join com RDS e janelas temporais. Firehose converte para Parquet nativo e entrega S3."
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Como reduzir custo de queries Athena em 80%?"
          a={
            <span>
              (1) Converter dados para Parquet colunar; (2) Particionar por colunas de filtro frequentes (data, região);
              (3) Compressão Snappy; (4) CTAS para materializar agregados; (5) Workgroup com per-query limit.
            </span>
          }
        />
        <QAItem
          q="Athena ou Redshift Spectrum para consulta ocasional em S3?"
          a={
            <span>
              Athena. É serverless e cobra apenas por TB escaneado. Redshift Spectrum exige cluster Redshift rodando,
              só faz sentido se já tem Redshift e quer estender para dados externos.
            </span>
          }
        />
        <QAItem
          q="Quando escolher Kinesis Firehose vs Data Streams?"
          a={
            <span>
              Firehose = delivery simples para S3/Redshift/OpenSearch, buffer 60s+, sem código. Streams = você quer
              processar com Lambda/Flink/KCL, múltiplos consumers, retention longa.
            </span>
          }
        />
        <QAItem
          q="Glue Crawler está detectando schema errado — fix?"
          a={
            <span>
              Definir schema manualmente na tabela do Data Catalog. Ou ajustar classifier no crawler (custom Grok/XML).
              Ou pré-processar os dados para formato mais limpo.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) Athena não é OLTP — não tem índices, joins custosos; (2) Redshift COPY de S3 é o
        caminho rápido — NÃO use INSERT row-by-row; (3) Firehose tem buffer mínimo (60s ou 1MB) — não é real-time &lt;1s;
        (4) EMR cluster sempre rodando desperdiça dinheiro — use transient clusters ou EMR Serverless; (5) Data Catalog é
        compartilhado — Athena, Spectrum, EMR veem as mesmas tabelas.
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> Data lake moderno = S3 (Parquet particionado) + Glue Catalog + Athena/Redshift Spectrum.
        Data warehouse clássico = Redshift. Streaming = Kinesis/MSK + Flink. ETL = Glue (serverless) ou EMR (custom).
        BI = QuickSight. Governança = Lake Formation.
      </Callout>
    </div>
  );
}
