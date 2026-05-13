import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('model-serving-triton');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é dynamic batching e por que Triton entrega bem?',
    options: [
      'Batch fixo definido em build time',
      'Triton acumula requests individuais em janela curta (ms), forma um batch dinâmico e envia para a GPU de uma vez. Melhora throughput drasticamente sem mexer no cliente, que continua mandando 1 request por vez',
      'Significa rodar sem GPU',
      'É só outro nome para multi-threading',
    ],
    correct: 1,
    explanation: 'GPU é eficiente com batch, mas clientes enviam requests individuais. Dynamic batching é a ponte: o servidor espera alguns ms para juntar requests compatíveis (mesmo modelo, shapes compatíveis) e processa como batch. Em modelos CNN e transformers o ganho de throughput pode ser 5-10x mantendo latência p99 controlada via max_queue_delay_microseconds.',
  },
  {
    question: 'Quando escolher BentoML em vez de Triton?',
    options: [
      'Sempre, BentoML é melhor',
      'BentoML encaixa quando o modelo é de CPU (sklearn, xgboost, lightgbm), o time é Python-first, e lógica custom pré/pós é significativa. Triton encaixa em inference de GPU pesada (PyTorch/ONNX/TensorRT) com múltiplos modelos em ensemble',
      'Nunca, BentoML é obsoleto',
      'Só em laptops',
    ],
    correct: 1,
    explanation: 'BentoML é excelente DX para servir modelos de CPU com lógica Python custom, Service API rica e packaging como Bento. Triton é o padrão NVIDIA para inference de GPU em escala, com ensemble scheduling, model repository versionado e suporte nativo a múltiplos backends (ONNX, TensorRT, PyTorch, Python). Os dois coexistem no mesmo time.',
  },
  {
    question: 'Qual é o papel de ensemble scheduling em Triton?',
    options: [
      'Executar modelos em paralelo sem coordenação',
      'Encadear múltiplos modelos (ex: tokenizer → embedding → classifier) como um pipeline declarativo server-side. O cliente envia input bruto uma vez, Triton roteia internamente entre os steps. Evita round-trips de rede entre cada modelo',
      'Treinar ensemble de modelos',
      'Cachear respostas',
    ],
    correct: 1,
    explanation: 'Ensemble declara o DAG de inference server-side. Cliente envia texto, Triton passa por tokenizer (Python backend), embedding (ONNX), classifier (TensorRT) sem round-trip intermediário. Latência cai, código cliente fica trivial e cada step pode ter throughput e hardware próprio.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="model-serving-triton"
      title="Model serving: Triton, TorchServe, BentoML"
      icon="🚀"
      xp={60}
      readTime={14}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="data-versioning-dvc"
      nextTitle="Data versioning: DVC, lakeFS"
      quiz={quiz}
    >
      <Section title="Serving é engenharia, não afterthought" accent={accent}>
        <p>
          Um modelo vale zero até servir. Serving resolve três pressões em conflito: <strong>latência</strong> (p99 do SLA), <strong>throughput</strong> (requests por segundo por GPU) e <strong>custo</strong> (USD por 1k inferências). Boas escolhas de servidor, batching e hardware definem se o modelo é lucrativo ou não.
        </p>
      </Section>

      <Section title="Triton Inference Server — config.pbtxt" accent={accent}>
        <CodeBlock lang="yaml">{`# model_repository/churn_xgb/config.pbtxt
name: "churn_xgb"
platform: "onnxruntime_onnx"
max_batch_size: 128

input [
  { text: "features", data_type: TYPE_FP32, dims: [ 42 ] }
]
output [
  { text: "probability", data_type: TYPE_FP32, dims: [ 1 ] }
]

dynamic_batching {
  preferred_batch_size: [ 16, 64 ]
  max_queue_delay_microseconds: 5000
}

instance_group [
  { count: 2, kind: KIND_GPU, gpus: [ 0 ] }
]

version_policy { specific: { versions: [ 7 ] } }`}</CodeBlock>
        <Callout tone="warn">
          <code>max_queue_delay_microseconds</code> é o contrato com o SLA de p99: quanto mais espera, melhor o batching, mas pior a cauda de latência.
        </Callout>
      </Section>

      <Section title="Cliente HTTP mínimo" accent={accent}>
        <CodeBlock lang="python">{`import numpy as np
import tritonclient.http as httpclient

client = httpclient.InferenceServerClient("triton.ffv.internal:8000")

features = np.array([[0.1, 0.2, 0.3] + [0.0] * 39], dtype=np.float32)
inp = httpclient.InferInput("features", features.shape, "FP32")
inp.set_data_from_numpy(features)

res = client.infer(model_name="churn_xgb", inputs=[inp])
proba = res.as_numpy("probability")
print(proba)`}</CodeBlock>
      </Section>

      <Section title="BentoML — quando DX Python pesa" accent={accent}>
        <CodeBlock lang="python">{`import bentoml
from bentoml.io import JSON

churn_runner = bentoml.sklearn.get("ffv-churn:latest").to_runner()
svc = bentoml.Service("ffv-churn-api", runners=[churn_runner])

@svc.api(input=JSON(), output=JSON())
async def predict(payload: dict) -&gt; dict:
    # validacao, feature enrichment, feature store lookup, etc.
    vec = build_feature_vector(payload["cliente_id"])
    proba = await churn_runner.async_run([vec])
    return {"score": float(proba[0]), "model_version": "7"}`}</CodeBlock>
      </Section>

      <Section title="Ensemble em Triton — DAG server-side" accent={accent}>
        <CodeBlock lang="yaml">{`# model_repository/text_pipeline/config.pbtxt
name: "text_pipeline"
platform: "ensemble"
max_batch_size: 32
input  [ { text: "raw_text", data_type: TYPE_STRING, dims: [ 1 ] } ]
output [ { text: "label",   data_type: TYPE_FP32,   dims: [ 3 ] } ]

ensemble_scheduling {
  step [
    { model_name: "tokenizer", model_version: -1,
      input_map: { key: "text", value: "raw_text" },
      output_map: { key: "ids", value: "token_ids" } },
    { model_name: "encoder", model_version: -1,
      input_map: { key: "ids", value: "token_ids" },
      output_map: { key: "emb", value: "embedding" } },
    { model_name: "classifier", model_version: -1,
      input_map: { key: "emb", value: "embedding" },
      output_map: { key: "out", value: "label" } }
  ]
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Para pipeline com 3 modelos, ensemble reduz latência em 30-50% vs orquestrar os três pelo cliente via rede.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
