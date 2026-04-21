import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('feature-stores-feast');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é training/serving skew e por que feature store resolve?',
    options: [
      'Nome chique para overfitting',
      'É a divergência entre como features são computadas em training (batch em warehouse) e em serving (tempo real). Feature store centraliza a definição: mesma transformação roda offline (histórico) e online (tempo real), eliminando a divergência',
      'É bug de hardware em GPU',
      'É quando o modelo é maior que a memória',
    ],
    correct: 1,
    explanation: 'Training/serving skew é a maior fonte de degradação silenciosa em ML de produção. O time de data escreve a feature em SQL para treinar; o time de backend reimplementa em Python em serving; nunca ficam exatamente iguais. Feature store define a transformação uma vez e materializa em offline store (para training, warehouse) e online store (para inference, Redis/DynamoDB), garantindo consistência.',
  },
  {
    question: 'Qual é a arquitetura canônica do Feast?',
    options: [
      'Monolito com banco único',
      'Feature definitions em Python como código + offline store (BigQuery, Snowflake, Parquet) para training + online store (Redis, DynamoDB, SQLite) para inference de baixa latência + feature server (REST/gRPC) para serving',
      'Apenas um Redis compartilhado',
      'Um notebook Jupyter na nuvem',
    ],
    correct: 1,
    explanation: 'Feast é declarativo: você define Entity, FeatureView e FeatureService em Python. O offline store persiste histórico para point-in-time correct joins em training. O online store serve o valor mais recente em p99 menor que 10ms. O feature server expõe API para backends consumirem. Materialization job copia offline para online na cadência definida.',
  },
  {
    question: 'Quando um feature store vale o custo operacional?',
    options: [
      'Sempre, mesmo para 1 modelo',
      'Quando há mais de um modelo reusando features, ou quando training/serving skew já causou incidente, ou quando há requisito regulatório de lineage e governança. Para 1 modelo simples com 5 features, adicionar Feast é engenharia prematura',
      'Nunca, é hype',
      'Só se o time tiver mais de 50 pessoas',
    ],
    correct: 1,
    explanation: 'Feature store tem custo real: mais um componente para operar, mais um lugar para rodar materialization, mais um SLA. O retorno vem de reuso (features caras de computar viram bem comum), consistência (mesma SQL em training e serving) e governança (lineage, ownership, descoberta). Para um único modelo pequeno, armazenar features no próprio serviço ainda é racional.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="feature-stores-feast"
      title="Feature stores: Feast e alternativas"
      icon="🗃️"
      xp={55}
      readTime={13}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="model-registry-mlflow"
      nextTitle="Experiment tracking + registry: MLflow"
      quiz={quiz}
    >
      <Section title="Por que feature store existe" accent={accent}>
        <p>
          Quando o segundo modelo do time começa a reusar features do primeiro, você descobre três problemas ao mesmo tempo: cada time reimplementa a mesma transformação de jeito ligeiramente diferente, o SQL de training não bate com o código Python de serving, e ninguém consegue responder quem é dono daquela coluna. Feature store resolve isso centralizando o contrato de features.
        </p>
      </Section>

      <Section title="Definindo features no Feast" accent={accent}>
        <CodeBlock lang="python">{`from datetime import timedelta
from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64

cliente = Entity(name="cliente_id", join_keys=["cliente_id"])

source = FileSource(
    path="s3://ffv-ml/features/cliente_agregados.parquet",
    timestamp_field="event_timestamp",
)

cliente_fv = FeatureView(
    name="cliente_agregados",
    entities=[cliente],
    ttl=timedelta(days=7),
    schema=[
        Field(name="ticket_medio_30d", dtype=Float32),
        Field(name="pedidos_90d", dtype=Int64),
        Field(name="dias_desde_ultima_compra", dtype=Int64),
    ],
    source=source,
    online=True,
    tags={"owner": "growth-ml", "pii": "false"},
)`}</CodeBlock>
        <p>
          O mesmo objeto serve training (via <code>get_historical_features</code>) e serving (via <code>get_online_features</code>). O contrato de nome, tipo e semântica fica em um só lugar versionado em Git.
        </p>
      </Section>

      <Section title="Point-in-time correctness" accent={accent}>
        <p>
          A parte pedagogicamente crítica: ao montar dataset de training, você precisa buscar o valor da feature que existia no instante do evento, não o valor mais recente. Caso contrário, vaza informação do futuro e o modelo fica otimista em eval e fraco em produção.
        </p>
        <CodeBlock lang="python">{`from feast import FeatureStore
import pandas as pd

store = FeatureStore(repo_path=".")

entity_df = pd.DataFrame({
    "cliente_id": [101, 202, 303],
    "event_timestamp": pd.to_datetime([
        "2026-01-10 14:00", "2026-01-11 09:30", "2026-01-12 18:45",
    ]),
})

training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "cliente_agregados:ticket_medio_30d",
        "cliente_agregados:pedidos_90d",
    ],
).to_df()`}</CodeBlock>
        <Callout tone="warn">
          Sem point-in-time join, você está treinando com data leakage. O modelo parece ótimo em validação e decepciona em produção.
        </Callout>
      </Section>

      <Section title="Serving online em tempo real" accent={accent}>
        <CodeBlock lang="python">{`features = store.get_online_features(
    features=[
        "cliente_agregados:ticket_medio_30d",
        "cliente_agregados:pedidos_90d",
    ],
    entity_rows=[{"cliente_id": 101}],
).to_dict()

# features['ticket_medio_30d'] = [182.5]
# Latencia tipica p99 &lt; 10ms com Redis online store`}</CodeBlock>
      </Section>

      <Section title="Alternativas e quando escolher cada" accent={accent}>
        <ul className="text-sm leading-6 list-disc pl-6">
          <li><strong>Feast:</strong> open-source, leve, bom para começar. Não tem transformations server-side fortes.</li>
          <li><strong>Tecton:</strong> comercial, transformations streaming nativas, operação gerenciada.</li>
          <li><strong>Hopsworks:</strong> open-core, integra bem com Spark e Flink, forte em EU/regulado.</li>
          <li><strong>DIY (tabela + Redis):</strong> racional para um único modelo — mas documente o contrato.</li>
        </ul>
        <Callout tone="success" icon="✅">
          Comece com Feast se já há 2+ modelos compartilhando features. Evolua para Tecton quando transformations em streaming virarem gargalo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
