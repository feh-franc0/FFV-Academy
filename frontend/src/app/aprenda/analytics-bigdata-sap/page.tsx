import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('analytics-bigdata-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Redshift vs Athena: quando cada?',
    options: [
      'Equivalentes',
      'Redshift é data warehouse MPP com compute dedicado — alta performance pra dashboards regulares e queries complexas recorrentes. Athena é serverless SQL sobre S3 — custo por query, ideal pra exploração ad-hoc e workloads intermitentes sem escala prevista',
      'Redshift é grátis',
      'Athena é só ETL',
    ],
    correct: 1,
    explanation: 'Padrão: dashboards de BI diários/horários rodando sobre dados estruturados → Redshift (cluster dedicado, compressão colunar, zone maps). Exploração ad-hoc, queries raras, dados em S3 parquet → Athena. Redshift Serverless borra essa linha pra quem quer warehouse sem gerir cluster.',
  },
  {
    question: 'Qual papel Lake Formation cumpre?',
    options: [
      'Storage',
      'Governança sobre data lake em S3: define catalog (via Glue), permissões granulares (row/column-level security) que Athena/Redshift Spectrum/EMR respeitam, tags LF de dados, audit trail. Resolve o problema de "buckets em free-for-all" em lake maduro',
      'Substitui S3',
      'Só queries',
    ],
    correct: 1,
    explanation: 'Sem Lake Formation, lake em S3 vira caos de permissions IAM. LF unifica: pessoa tem acesso a "tabela sales.orders", não a bucket X prefix Y. Row-level filtering ("vendedor só vê orders dele"), column masking (PII mascarado para analistas), tag-based policies. Compatível com query engines AWS — não funciona pra ferramentas externas sem integração.',
  },
  {
    question: 'EMR vs Glue: quando EMR ainda vale?',
    options: [
      'Nunca',
      'Glue (serverless Spark) cobre 80% dos ETLs. EMR serve quando: 1) cluster long-running com customização (Hive, Presto, HBase, Flink com packages específicos), 2) cargas massivas recorrentes onde reservar capacidade sai mais barato que serverless, 3) controle fino de configuração Spark',
      'Sempre EMR',
      'Só Hadoop',
    ],
    correct: 1,
    explanation: 'Glue é "Spark como serviço" — rápido pra ETL batch sem gerir infra. EMR é Hadoop/Spark cluster completo com customization total. Em 2026 a tendência é Glue pra maioria dos ETLs + EMR Serverless pra cargas pesadas. EMR on EC2 tradicional só quando precisa de add-ons específicos ou capacidade reservada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="analytics-bigdata-sap"
      title="Analytics em escala: Redshift, EMR, Athena, Lake Formation"
      icon="📊"
      xp={60}
      readTime={14}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="seguranca-sap-avancada"
      nextTitle="Segurança enterprise: GuardDuty, Detective, Security Hub"
      quiz={quiz}
    >
      <Section title="Arquitetura Lakehouse moderna" accent={accent}>
        <CodeBlock lang="yaml">{`Ingestion:
  Kinesis Data Streams / Firehose    — eventos real-time
  DMS                                — CDC de DBs transacionais
  DataSync / Transfer Family         — bulk batch

Storage (data lake):
  S3 (parquet/iceberg, particionado por data)
  S3 Lifecycle: Standard → IA → Glacier

Catalog & governança:
  Glue Data Catalog                   — schemas e partições
  Lake Formation                      — permissões finas + audit

Processing:
  Glue ETL (Spark serverless)        — batch ETL padrão
  EMR Serverless / EMR on EC2        — Spark/Flink customizado
  Lambda                              — ETL leve event-driven
  Step Functions                      — orquestração com retry

Query/analytics:
  Athena (serverless SQL)            — ad-hoc em S3
  Redshift + Spectrum                — warehouse + leitura S3
  QuickSight / Tableau / Looker      — BI layer

Real-time:
  Kinesis Data Analytics (Flink)     — stream processing
  Managed Service for Apache Kafka   — event backbone`}</CodeBlock>
      </Section>

      <Section title="Decisões que caem em prova" accent={accent}>
        <p>
          Cenários típicos do SAP: "time precisa fazer queries ad-hoc de 50GB/dia com orçamento apertado" → Athena + S3 parquet. "Dashboards corporativos com 200 usuários simultâneos" → Redshift RA3 ou Serverless. "Pipeline batch noturno de 5TB de logs" → Glue ou EMR Serverless. "Stream de cliques em tempo quase-real pra fraud detection" → Kinesis Data Streams + Flink (KDA) + DynamoDB.
        </p>
        <Callout tone="info" icon="💡">
          Truque de formato: parquet/iceberg comprimido + particionamento correto corta 80-95% do custo de Athena. "S3 em JSON cru" é antipattern — custa 10x mais pra queries.
        </Callout>
      </Section>

      <Section title="Governança com Lake Formation" accent={accent}>
        <CodeBlock lang="sql">{`-- Lake Formation: fine-grained access
GRANT SELECT ON "sales"."orders"
  TO DATA_LAKE_PRINCIPAL "analyst-role"
  WITH GRANT OPTION;

-- Row-level filter: vendedor só vê orders dele
CREATE DATA FILTER vendor_filter
  ON DATABASE sales
  TABLE orders
  ROW FILTER "vendor_id = current_user_vendor_id()";

-- Column masking para PII
GRANT SELECT (order_id, total, vendor_id) ON "sales"."orders"
  TO "analyst-role";
-- colunas omitidas (customer_email, customer_cpf) ficam invisíveis

-- Tag-based policies
CREATE LF_TAG confidentiality = ['public', 'internal', 'restricted'];
ASSIGN LF_TAG confidentiality='restricted' ON "sales"."orders"."customer_cpf";
GRANT SELECT ON columns with LF_TAG confidentiality='public'
  TO "analyst-role";`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Checklist de lakehouse pro SAP: ingestão Kinesis/DMS, storage S3 parquet/iceberg particionado, catalog Glue, governança Lake Formation, processing Glue/EMR Serverless, query Athena/Redshift, BI QuickSight. Cada peça tem quando aparece em prova.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
