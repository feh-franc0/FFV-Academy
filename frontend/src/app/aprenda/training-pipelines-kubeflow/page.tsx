import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('training-pipelines-kubeflow');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Kubeflow Pipelines ganha em ambientes K8s-native?',
    options: [
      'Por ser o mais antigo',
      'Cada step é um Pod isolado com recursos declarados (CPU, GPU, memória), retry e caching por step, artifact passing tipado, e o scheduler do K8s já resolve escalonamento. Integra direto com GPUs A100/H100 e nodes spot',
      'Porque é mais simples que Airflow',
      'Porque não precisa de YAML',
    ],
    correct: 1,
    explanation: 'A vantagem estrutural do Kubeflow é tratar ML pipeline como workload K8s-native. Cada componente vira container, K8s escalona, retry é nativo, GPUs são alocadas via resource requests e o artifact passing entre steps é tipado. Airflow resolve orquestração geral mas não foi desenhado para dependência dura entre treino e GPU scheduling.',
  },
  {
    question: 'Quando escolher Airflow, Prefect ou Kubeflow?',
    options: [
      'Sempre Kubeflow',
      'Airflow para orquestração cross-domain (data eng + ML) com operators maduros; Prefect quando DX em Python puro importa e dynamic tasks são frequentes; Kubeflow quando training em K8s com GPUs + artifact lineage ML é o caso central',
      'Sempre Airflow',
      'Escolher por cor do logo',
    ],
    correct: 1,
    explanation: 'Airflow brilha em empresas que já orquestram ETL, dbt e ML no mesmo lugar — a biblioteca de operators é imbatível. Prefect acerta em Python-first, dynamic mapping e observability moderna. Kubeflow é opinativo para ML em K8s com foco em experimento, métricas e artefatos. Os três são válidos, a escolha é contextual.',
  },
  {
    question: 'Qual prática protege pipelines de training de desperdiçar horas de GPU?',
    options: [
      'Rodar sem caching para garantir frescor',
      'Step-level caching baseado em hash de inputs + idempotência em cada step + retry com backoff exponencial em falhas transitórias + timeout por step + checkpointing em training longo',
      'Sempre usar spot instances sem checkpoint',
      'Ignorar falhas intermitentes',
    ],
    correct: 1,
    explanation: 'Training pipeline é caro: caching evita reprocessar feature engineering quando só hyperparams mudam; idempotência permite retry seguro; timeout evita step preso consumindo GPU; checkpointing em training longo permite retomar de epoch N em vez de zero. Sem essas práticas, uma instância spot revogada vira horas de GPU descartadas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="training-pipelines-kubeflow"
      title="Training pipelines: Airflow, Kubeflow, Prefect"
      icon="⚙️"
      xp={60}
      readTime={14}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="model-serving-triton"
      nextTitle="Model serving: Triton, TorchServe, BentoML"
      quiz={quiz}
    >
      <Section title="Training pipeline como cidadão de primeira classe" accent={accent}>
        <p>
          Notebook é ótimo para exploração. Produção pede pipeline declarativo: cada passo reproduzível, com inputs versionados, outputs nomeados, logs centralizados e retry automático. O objetivo é que qualquer pessoa do time consiga retreinar o modelo com um comando, e que o CI consiga disparar isso sem humano no loop.
        </p>
      </Section>

      <Section title="Kubeflow Pipelines — componente a componente" accent={accent}>
        <CodeBlock lang="python">{`from kfp import dsl
from kfp.dsl import Input, Output, Dataset, Model, Metrics

@dsl.component(base_image="python:3.12", packages_to_install=["pandas", "pyarrow"])
def extract_features(dataset_out: Output[Dataset]):
    import pandas as pd
    df = pd.read_parquet("s3://ffv-ml/raw/events.parquet")
    df.to_parquet(dataset_out.path, index=False)

@dsl.component(base_image="ffv/ml-train:2.1")
def train_model(dataset_in: Input[Dataset], model_out: Output[Model], metrics: Output[Metrics]):
    import pandas as pd, joblib
    from sklearn.ensemble import GradientBoostingClassifier
    df = pd.read_parquet(dataset_in.path)
    X, y = df.drop(columns=["label"]), df["label"]
    m = GradientBoostingClassifier(n_estimators=300).fit(X, y)
    joblib.dump(m, model_out.path)
    metrics.log_metric("train_rows", len(df))

@dsl.pipeline(name="churn-training")
def pipeline():
    feats = extract_features()
    train = train_model(dataset_in=feats.outputs["dataset_out"])
    train.set_cpu_limit("4").set_memory_limit("16Gi").set_gpu_limit(1)`}</CodeBlock>
      </Section>

      <Section title="Configuração de pipeline em YAML" accent={accent}>
        <CodeBlock lang="yaml">{`# kubeflow pipeline spec (trecho compilado)
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: churn-training-
spec:
  entrypoint: pipeline
  templates:
    - name: train-model
      retryStrategy:
        limit: 3
        backoff:
          duration: 60s
          factor: 2
      container:
        image: ffv/ml-train:2.1
        resources:
          limits:
            cpu: "4"
            memory: 16Gi
            nvidia.com/gpu: "1"
        env:
          - name: MLFLOW_TRACKING_URI
            value: http://mlflow.ffv.internal
      timeout: 2h`}</CodeBlock>
        <Callout tone="warn">
          Sem <code>retryStrategy</code>, cada falha transitória (node evicted, imagem lenta para puxar) vira pipeline vermelho que precisa ser replanejado à mão.
        </Callout>
      </Section>

      <Section title="Airflow — quando é a escolha certa" accent={accent}>
        <CodeBlock lang="python">{`from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from datetime import datetime, timedelta

with DAG(
    "churn_retraining",
    start_date=datetime(2026, 1, 1),
    schedule="0 3 * * 1",  # toda segunda 03:00
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=10)},
):
    extract = PythonOperator(task_id="extract", python_callable=extract_features)
    train = KubernetesPodOperator(
        task_id="train",
        image="ffv/ml-train:2.1",
        cmds=["python", "-m", "train"],
        container_resources={"limits": {"nvidia.com/gpu": "1"}},
    )
    extract &gt;&gt; train`}</CodeBlock>
      </Section>

      <Section title="Prefect 2.x — DX em Python puro" accent={accent}>
        <CodeBlock lang="python">{`from prefect import flow, task

@task(retries=3, retry_delay_seconds=30, cache_expiration=3600)
def build_features() -&gt; str:
    return "s3://ffv-ml/features/churn.parquet"

@task
def train(path: str) -&gt; str:
    return "s3://ffv-ml/models/churn-v7.joblib"

@flow(name="churn-retraining")
def retraining():
    feats = build_features()
    return train(feats)`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Prefect brilha quando os steps são dinâmicos (mapping sobre lista de shards, por exemplo) e o time quer escrever Python idiomático sem ceder ao YAML.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
