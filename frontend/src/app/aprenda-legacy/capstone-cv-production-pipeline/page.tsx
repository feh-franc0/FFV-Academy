import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-cv-production-pipeline');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que exportar pra ONNX antes de servir em produção?',
    options: [
      'Modelo fica menor',
      'ONNX é formato intermediário neutro a framework: desacopla treino (PyTorch/TF) de serving (onnxruntime, Triton, TensorRT, CoreML). Permite otimizações de grafo (operator fusion, constant folding) e execução em runtime C++ sem carregar Python. Resultado: latência 2–5x menor, memória menor, binário deployável sem dependências pesadas',
      'Só roda em NVIDIA',
      'Aumenta acurácia',
    ],
    correct: 1,
    explanation: 'Servir PyTorch em produção significa carregar Python + torch + todas as deps (~2GB). ONNX + onnxruntime-gpu cabe em ~200MB e roda em C++ puro. TensorRT extrai ainda mais performance num passo adicional. ONNX também vira CoreML (iOS), TFLite (Android), NNAPI (edge) — mesmo modelo, múltiplos alvos. É o formato lingua franca de deploy em 2026.',
  },
  {
    question: 'Qual a vantagem de dynamic batching no Triton?',
    options: [
      'Menos código',
      'Triton agrupa requisições individuais que chegam em janela de tempo curta (~ms) num único batch e roda uma inferência só na GPU. Throughput sobe 3–10x sem mudar código do cliente, aproveitando paralelismo massivo do SIMT. Trade-off: latência p99 sobe um pouco (espera da janela) mas p50 e throughput melhoram. Configurável via preferred_batch_size e max_queue_delay_microseconds',
      'Salva memória',
      'Aumenta acurácia',
    ],
    correct: 1,
    explanation: 'GPU só é eficiente com batch — kernel de convolução numa imagem só desperdiça 95% dos CUDA cores. Dynamic batching no Triton junta requests concorrentes automaticamente. Latência cresce pouco (~5–20ms de wait), mas throughput pode decuplicar. Essencial para APIs com QPS alto. Configuração típica: max_queue_delay=5000us, preferred_batch_size=[4, 8, 16].',
  },
  {
    question: 'O que monitorar em produção CV além de latência e erro?',
    options: [
      'Só uptime',
      'Data drift (distribuição de inputs mudando vs treino — brightness média, resolução, aspect ratio), prediction drift (distribuição de classes/confidences), e outcome drift quando possível. Alertas quando confidence média cai &gt;10% em janela 24h. Amostra de 1–5% dos inputs pra human review periódica. Sem isso, modelo degrada silenciosamente em semanas',
      'Só RAM da GPU',
      'Versão do Python',
    ],
    correct: 1,
    explanation: 'Covariate shift é o inimigo silencioso: câmera foi trocada, iluminação da loja mudou, produto novo entrou no catálogo — distribuição de input deslocou. Monitore estatísticas básicas de input (brightness, contrast, shape) e de output (entropia das predições, fração de baixa confidence). Evidently, Arize e WhyLabs automatizam isso. Shadow deploy de modelo novo contra produção valida antes de troca.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-cv-production-pipeline"
      title="Capstone: pipeline CV em produção"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa pipeline end-to-end de detecção de objetos em um domínio escolhido por você (EPI em canteiro, contagem de carros, produtos em gôndola). Entregáveis: dataset rotulado, modelo YOLO fine-tuned, API FastAPI, ONNX + Triton com dynamic batching, benchmark de latência e monitoramento de drift. Esse nível de entrega é exatamente o que distingue engenheiro júnior de sênior em CV.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="yaml">{`# Checklist do capstone
dataset:
  - 500-2000 imagens rotuladas (LabelStudio ou CVAT)
  - split 80/10/10 (train/val/test) estratificado
  - dataset.yaml (Ultralytics) ou COCO JSON
  - card de dataset documentando fonte, bias e limitações

modelo:
  - YOLOv10s ou v10m fine-tuned
  - mAP@0.5:0.95 >= baseline pretrained
  - confusion matrix por classe em notebook

export:
  - best.pt -> best.onnx (dynamic axes, NMS embutido)
  - best.onnx -> best.engine (TensorRT FP16)
  - validação numérica: MAE < 1e-3 entre PyTorch e ONNX

serving:
  - FastAPI com /predict (multipart/form-data)
  - Triton Inference Server com model_repository
  - dynamic batching: max_queue_delay 5000us, preferred [4, 8]
  - Dockerfile multi-stage (build + runtime slim)

benchmark:
  - p50/p95/p99 latency em 1/4/8/16 concurrent clients
  - throughput (images/sec) em GPU alvo
  - comparação PyTorch vs ONNX vs TensorRT FP16
  - tabela de resultados no README

observabilidade:
  - Prometheus metrics (request_count, latency_histogram, gpu_util)
  - Grafana dashboard commitado como JSON
  - drift monitoring com Evidently (brightness média, confidence média)
  - alerta: confidence_mean drop > 10% em 24h

writeup:
  - README com problema, dataset, modelo, trade-offs
  - seção "limitações e próximos passos" honesta
  - link do repo, Docker Hub image, vídeo demo`}</CodeBlock>
      </Section>

      <Section title="API FastAPI + Triton" accent={accent}>
        <CodeBlock lang="python">{`from fastapi import FastAPI, File, UploadFile
from tritonclient.http import InferenceServerClient, InferInput, InferRequestedOutput
import numpy as np, cv2

app = FastAPI()
triton = InferenceServerClient(url="triton:8000")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    x = preprocess(img)  # importa preprocess.py único

    inp = InferInput("images", x.shape, "FP32")
    inp.set_data_from_numpy(x)
    out = InferRequestedOutput("output0")
    resp = triton.infer(model_name="yolov10s", inputs=[inp], outputs=[out])
    detections = resp.as_numpy("output0")
    return {"detections": detections.tolist()}`}</CodeBlock>
      </Section>

      <Section title="Triton model_repository" accent={accent}>
        <CodeBlock lang="yaml">{`# model_repository/yolov10s/config.pbtxt
name: "yolov10s"
platform: "onnxruntime_onnx"
max_batch_size: 16

input [
  { text: "images"  data_type: TYPE_FP32  dims: [ 3, 640, 640 ] }
]
output [
  { text: "output0"  data_type: TYPE_FP32  dims: [ -1, 6 ] }
]

dynamic_batching {
  preferred_batch_size: [ 4, 8 ]
  max_queue_delay_microseconds: 5000
}

instance_group [
  { count: 1  kind: KIND_GPU }
]`}</CodeBlock>
      </Section>

      <Section title="Benchmark de latência" accent={accent}>
        <CodeBlock lang="bash">{`# Benchmark com perf_analyzer oficial da NVIDIA
perf_analyzer \\
  -m yolov10s \\
  -u triton:8000 \\
  --concurrency-range 1:16:1 \\
  --measurement-interval 5000 \\
  --shape images:3,640,640 \\
  -f benchmark.csv`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Report latência honesta: p50, p95, p99 em concurrency 1, 4, 8, 16. Throughput sozinho engana — uma API a 1000 req/s com p99 de 2s é inutilizável.
        </Callout>
      </Section>

      <Section title="Observabilidade e drift" accent={accent}>
        <CodeBlock lang="python">{`from prometheus_client import Counter, Histogram

REQUESTS = Counter("cv_requests_total", "Total requests", ["status"])
LATENCY  = Histogram("cv_latency_seconds", "Request latency", buckets=[.01, .05, .1, .25, .5, 1, 2])
CONF_MEAN = Histogram("cv_confidence_mean", "Mean confidence", buckets=[.3, .5, .7, .9])

@app.middleware("http")
async def metrics_mw(request, call_next):
    with LATENCY.time():
        resp = await call_next(request)
    REQUESTS.labels(status=resp.status_code).inc()
    return resp`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Entregar o repo com dataset card, benchmark reproduzível, Docker image pública e dashboard Grafana commitado fala mais alto que um currículo de 3 páginas. É esse capstone que vira conversa com hiring manager sênior em vaga de CV engineer.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
