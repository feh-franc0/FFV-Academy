import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-pipeline-analytics-completo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o caminho pragmático pra começar pipeline analytics?',
    options: [
      'Kafka + Flink + Spark cluster',
      'Start small: Postgres OLTP + Debezium CDC → S3 Iceberg → dbt (transforma) → Metabase (visualiza). Dagster orquestra. 1 semana pra MVP vs meses pra cluster Spark/Flink',
      'Só Excel',
      'Sem pipeline',
    ],
    correct: 1,
    explanation: 'Overengineering é o inimigo. Start: Postgres → Debezium → S3/Iceberg → dbt → BI. Quando escala exigir: add Spark/Flink. Maioria dos times nunca precisa passar de Postgres + dbt + DuckDB. "Big data is dead" era uma verdade — dataset cabe em laptop moderno.',
  },
  {
    question: 'Qual é a medida de sucesso de um pipeline?',
    options: [
      'Volume de dados processado',
      'SLA de freshness (dashboard ≤ 2h atrás?) + data quality tests verdes + zero produção paging à noite. Stakeholders confiam nos dados — métrica final',
      'Complexity',
      'Número de steps',
    ],
    correct: 1,
    explanation: 'Pipeline bem-sucedido é invisível: sempre fresh, sempre correto, sem acorda time 3am. Medida real: analyst abre dashboard, confia, decide. Pipeline com SLA 99% pode parecer OK, mas se falhar na manhã de review executive = desastre. Prefira simples e confiável.',
  },
  {
    question: 'Qual componente do capstone é facilmente esquecido?',
    options: [
      'Ingestão',
      'OBSERVABILITY — pipeline precisa alertar quando falha. Métricas (volume processado, latency), logs estruturados, data quality em dashboard. Sem isso, problema só aparece quando stakeholder complain',
      'Transform',
      'UI',
    ],
    correct: 1,
    explanation: 'Dev foca em code, esquece observabilidade. Fail silently = descoberto tarde. Dagster UI + Elementary (dbt) + Grafana métricas. Alertas em Slack: "orders row count 50% menor que ontem", "freshness SLA broken". Isso diferencia pipeline amador de pro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-pipeline-analytics-completo"
      title="Capstone: pipeline analytics end-to-end"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Stack proposta" accent={accent}>
        <CodeBlock lang="text">{`┌─────────────┐    Debezium    ┌──────────┐    dbt + Dagster    ┌─────────┐
│ Postgres    │ ─────────────▶ │ S3/      │ ──────────────────▶│ Iceberg │
│ OLTP (prod) │   CDC stream   │ Kafka    │   transform         │ marts   │
└─────────────┘                └──────────┘                     └─────────┘
                                                                       │
                                                                       ▼
                                                             ┌──────────────┐
                                                             │ Metabase     │
                                                             │ dashboards   │
                                                             └──────────────┘
                                                                       │
                                                            Alerts em Slack
                                                         (Great Expectations)`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Debezium connector Kafka Connect — config em terraform/helm</li>
          <li>dbt project com 3-5 staging + 2-3 marts models, tests em coluna-chave</li>
          <li>Dagster repo com assets, schedule diário, freshness policies</li>
          <li>Iceberg tables em S3, partitioned por date</li>
          <li>Great Expectations suite em pontos críticos (OLTP→lake)</li>
          <li>Metabase dashboard com 3-4 KPIs (DAU, revenue, conversão)</li>
          <li>Alertas: dbt test fail, freshness breach, anomalia volume → Slack</li>
          <li>README com arquitetura + diagrama + instruções rodar local (docker-compose)</li>
        </ul>
        <Callout tone="success" icon="🎓">
          Capstone que vale portfolio real — monstra a camada inteira de data pipeline moderno. Excelente pra vagas data engineer/platform.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
