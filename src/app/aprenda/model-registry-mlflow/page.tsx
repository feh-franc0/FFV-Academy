import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('model-registry-mlflow');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre MLflow Tracking e MLflow Registry?',
    options: [
      'São sinônimos',
      'Tracking registra experimentos (runs, params, metrics, artifacts) — é log append-only do processo de treino. Registry promove modelos para um ciclo de vida governado (None → Staging → Production → Archived) com quem aprovou, quando e por quê',
      'Tracking é comercial, Registry é open-source',
      'Registry só guarda dados, Tracking só guarda código',
    ],
    correct: 1,
    explanation: 'Tracking é sobre experimentação reproduzível: cada run fica logado com params, metrics, código e artifacts. Registry é sobre governança: um modelo treinado vira ModelVersion com stage e pode ter transition aprovada por outra pessoa. Os dois trabalham juntos — o modelo do experimento vencedor vira a version nova no registry.',
  },
  {
    question: 'Por que autolog sozinho não é suficiente?',
    options: [
      'Autolog funciona sempre perfeitamente',
      'Autolog captura só o que o framework expõe. Custom metrics de negócio (uplift, revenue per user), dataset hash, feature snapshot, eval em golden set e model card precisam ser logados explicitamente. Sem isso, o experiment tracking é bonito mas não responde "por que esse modelo é melhor?"',
      'Autolog é proibido em produção',
      'Autolog só funciona com TensorFlow',
    ],
    correct: 1,
    explanation: 'mlflow.autolog() é excelente para capturar o básico (loss, accuracy, hyperparams de sklearn/xgboost/pytorch). Mas decisões de promoção exigem contexto que o framework não conhece: qual dataset foi usado, qual golden set foi avaliado, qual o impacto estimado em métrica de negócio, qual a regressão vs baseline. Log essas coisas manualmente.',
  },
  {
    question: 'Qual política faz sentido para promover modelo para Production?',
    options: [
      'Qualquer um que tenha acurácia melhor',
      'Gate automatizado + review humano: melhora estatisticamente significativa no golden set, sem regressão em slices sensíveis, cost/latency dentro do orçamento, model card atualizado e aprovação de 2 pessoas (dono do modelo + dono do produto)',
      'O último treinado sempre ganha',
      'Só o engenheiro mais sênior decide sozinho',
    ],
    correct: 1,
    explanation: 'Promoção para Production é decisão de produto, não só de métrica agregada. Acurácia global pode subir enquanto acurácia de slice minoritário cai (viés). Cost por inferência pode explodir. A política correta combina métricas objetivas com review humano explícito e documentado no registry.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="model-registry-mlflow"
      title="Experiment tracking + registry: MLflow"
      icon="📋"
      xp={55}
      readTime={13}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="training-pipelines-kubeflow"
      nextTitle="Training pipelines: Airflow, Kubeflow, Prefect"
      quiz={quiz}
    >
      <Section title="Dois problemas, duas peças" accent={accent}>
        <p>
          MLflow cobre dois problemas distintos. O primeiro é <strong>reprodutibilidade</strong>: você precisa voltar no tempo e saber exatamente qual código, qual dataset e quais hyperparams produziram aquele modelo. O segundo é <strong>governança</strong>: você precisa controlar qual versão está em produção, quem promoveu, quando e com qual evidência.
        </p>
      </Section>

      <Section title="Tracking — cada experimento logado" accent={accent}>
        <CodeBlock lang="python">{`import mlflow
import mlflow.sklearn
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import f1_score

mlflow.set_tracking_uri("http://mlflow.ffv.internal")
mlflow.set_experiment("churn-v2")

with mlflow.start_run(run_name="gbm-baseline"):
    params = {"n_estimators": 300, "max_depth": 4, "learning_rate": 0.05}
    model = GradientBoostingClassifier(**params).fit(X_train, y_train)

    mlflow.log_params(params)
    mlflow.log_metric("f1_val", f1_score(y_val, model.predict(X_val)))
    mlflow.log_metric("f1_golden", f1_score(y_golden, model.predict(X_golden)))

    mlflow.log_dict({"feature_snapshot": features_meta}, "features.json")
    mlflow.set_tag("dataset_hash", dataset_hash)
    mlflow.set_tag("owner", "growth-ml")

    mlflow.sklearn.log_model(
        model, artifact_path="model", registered_model_name="ffv-churn",
    )`}</CodeBlock>
      </Section>

      <Section title="Registry — ciclo de vida do modelo" accent={accent}>
        <CodeBlock lang="python">{`from mlflow.tracking import MlflowClient

client = MlflowClient()

# Promover ModelVersion 7 para Staging apos CI verde
client.transition_model_version_stage(
    name="ffv-churn",
    version=7,
    stage="Staging",
    archive_existing_versions=False,
)

# Apos review humano e metrica validada, promover para Production
client.transition_model_version_stage(
    name="ffv-churn",
    version=7,
    stage="Production",
    archive_existing_versions=True,
)

client.update_model_version(
    name="ffv-churn", version=7,
    description="Gate: +2.1pp F1 golden set, sem regressao em slice age_60+, cost/1k igual",
)`}</CodeBlock>
        <Callout tone="warn">
          Use <code>archive_existing_versions=True</code> apenas em Production. Em Staging, mantenha histórico para comparação lado a lado.
        </Callout>
      </Section>

      <Section title="Model Card como artifact" accent={accent}>
        <CodeBlock lang="yaml">{`# model_card.yaml anexado como artifact do run
model_name: ffv-churn
version: 7
intended_use: priorizar campanhas de retencao B2C
training_data:
  window: 2025-07 a 2025-12
  rows: 1_240_000
  drift_check: passed
metrics:
  f1_golden: 0.781
  auc_golden: 0.892
  cost_per_1k_inferences_usd: 0.012
slices:
  idade_60_plus: {f1: 0.742, delta_vs_geral: -0.039}
  novos_clientes_30d: {f1: 0.612, delta_vs_geral: -0.169}
limitations:
  - nao validado para clientes b2b
  - baixa performance em novos clientes &lt; 30 dias
owners: [growth-ml@ffv]`}</CodeBlock>
      </Section>

      <Section title="Alternativas e integração" accent={accent}>
        <ul className="text-sm leading-6 list-disc pl-6">
          <li><strong>Weights &amp; Biases:</strong> UI mais rica, sweeps built-in, ótimo para deep learning research.</li>
          <li><strong>Neptune:</strong> foco em experiment management de larga escala e metadata queryável.</li>
          <li><strong>MLflow:</strong> open-source, padrão de mercado, integra com quase tudo.</li>
        </ul>
        <Callout tone="success" icon="✅">
          Para a maioria dos times em 2026, MLflow self-hosted (ou managed via Databricks) resolve tracking + registry com custo baixo e zero lock-in.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
