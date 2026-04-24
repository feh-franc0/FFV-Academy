import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('object-detection-yolo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre two-stage e one-stage detectors?',
    options: [
      'Nenhuma relevante hoje',
      'Two-stage (Faster R-CNN): primeiro propõe regiões candidatas (RPN), depois classifica cada uma — mais preciso, mais lento. One-stage (YOLO, SSD, RetinaNet): prediz bbox + classe numa passada só direto da grade — mais rápido, historicamente menos preciso. Em 2024–2026, one-stage modernos (YOLOv10, RT-DETR) fecharam o gap e dominam produção real-time',
      'Cor vs escala de cinza',
      'Só CPU vs GPU',
    ],
    correct: 1,
    explanation: 'Faster R-CNN (2015) era o padrão de acurácia mas caro. YOLO v1 (2016) priorizou velocidade com queda de acurácia. Em 2024, YOLOv10 e RT-DETR alcançam mAP competitivo com Faster R-CNN rodando a 60+ FPS. Para produção real-time (vídeo, robótica), one-stage venceu. Two-stage ainda aparece em aerial/medical onde acurácia &gt; latência.',
  },
  {
    question: 'O que é NMS (Non-Maximum Suppression) e por que é necessário?',
    options: [
      'Uma função de perda',
      'Post-processamento que remove bboxes duplicadas: para cada classe, ordena por confidence, mantém a top-1 e descarta vizinhas com IoU &gt; threshold (tipicamente 0.5). Detectores emitem múltiplas predições sobrepostas para o mesmo objeto — sem NMS, um gato vira 12 gatos. DETR/RT-DETR eliminam NMS via Hungarian matching no treino',
      'Uma arquitetura de backbone',
      'Técnica de augmentation',
    ],
    correct: 1,
    explanation: 'Sem NMS, output parece “spam”: 15 caixas sobre o mesmo objeto. NMS resolve de forma heurística. O grande apelo de DETR (2020) e RT-DETR (2023) é que o set-based loss no treino já garante 1 predição por objeto — zero NMS em inferência, end-to-end puro. Isso remove um hiperparâmetro (IoU threshold) que sempre dava dor de cabeça.',
  },
  {
    question: 'Como ler a métrica mAP@0.5:0.95 reportada pelo COCO?',
    options: [
      'Média de accuracy',
      'Média da Average Precision calculada em 10 IoU thresholds (0.50, 0.55, ..., 0.95) e depois média entre todas as classes. Recompensa localização precisa: detectar com bbox quase perfeita conta mais. mAP@0.5 isolado é métrica mais “frouxa” (basta bbox razoável). Publicações modernas reportam ambos',
      'Só pixel accuracy',
      'Tempo de inferência',
    ],
    correct: 1,
    explanation: 'mAP@0.5 permissivo: bbox com IoU&gt;0.5 já conta. mAP@0.5:0.95 (COCO primary metric) exige qualidade geométrica — uma bbox com IoU=0.6 só conta no threshold 0.5 e 0.55. Comparar modelos? Use mAP@0.5:0.95. Demo visual pra cliente? mAP@0.5 é mais “vendável”. Seja explícito sobre qual número você está citando.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="object-detection-yolo"
      title="Object detection: YOLO, DETR, RT-DETR"
      icon="🎯"
      xp={55}
      readTime={13}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Estado da arte prático em 2026" accent={accent}>
        <p>
          Ultralytics YOLO (v8 em 2023, v10 em 2024) virou o padrão de facto para treino e deploy rápidos: API pythônica, export nativo pra ONNX/TensorRT/CoreML, suporta detection + segmentation + pose + classification. RT-DETR (Baidu 2023) é a alternativa transformer sem NMS, ótima quando latência é crítica e hardware é GPU moderna.
        </p>
        <Callout tone="info" icon="💡">
          Ultralytics tem licença AGPL-3.0 — uso interno ou com fonte aberta é fine; SaaS fechado precisa de licença comercial paga. Leia antes de embarcar em produto.
        </Callout>
      </Section>

      <Section title="Fine-tune YOLOv10 em dataset próprio" accent={accent}>
        <CodeBlock lang="yaml">{`# dataset.yaml
path: ./datasets/meu-dataset
train: images/train
val: images/val
test: images/test

names:
  0: capacete
  1: colete
  2: pessoa-sem-epi`}</CodeBlock>
        <CodeBlock lang="python">{`from ultralytics import YOLO

model = YOLO("yolov10s.pt")  # pretrained COCO

results = model.train(
    data="dataset.yaml",
    epochs=100,
    imgsz=640,
    batch=32,
    device=0,
    patience=20,        # early stopping
    optimizer="AdamW",
    lr0=1e-3,
    cos_lr=True,
    augment=True,
    project="runs/epi",
    name="v10s-640",
)`}</CodeBlock>
      </Section>

      <Section title="Validação e métricas" accent={accent}>
        <CodeBlock lang="python">{`metrics = model.val(data="dataset.yaml", split="test")
print(f"mAP@0.5     = {metrics.box.map50:.3f}")
print(f"mAP@0.5:.95 = {metrics.box.map:.3f}")
print(f"precision   = {metrics.box.mp:.3f}")
print(f"recall      = {metrics.box.mr:.3f}")
# Por classe
for i, name in model.names.items():
    print(f"{name}: AP50={metrics.box.ap50[i]:.3f}")`}</CodeBlock>
      </Section>

      <Section title="Export ONNX e inferência em produção" accent={accent}>
        <CodeBlock lang="python">{`# Export pra ONNX com NMS embutido
model.export(format="onnx", imgsz=640, dynamic=True, simplify=True, nms=True)
# Gera best.onnx pronto pra Triton, onnxruntime ou TensorRT`}</CodeBlock>
        <CodeBlock lang="python">{`import onnxruntime as ort
import numpy as np, cv2

sess = ort.InferenceSession("best.onnx", providers=["CUDAExecutionProvider"])

def infer(img_bgr):
    img = cv2.resize(img_bgr, (640, 640))
    x = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    x = x.transpose(2, 0, 1)[None]
    outputs = sess.run(None, {"images": x})
    return outputs[0]   # [N, 6] = x1, y1, x2, y2, conf, class`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Ciclo realista: coletar 500–2000 imagens rotuladas → fine-tune por 100 epochs → validar com mAP@0.5:0.95 em split de teste held-out → exportar ONNX com NMS embutido → benchmark latência em GPU alvo → só então decidir se precisa TensorRT.
        </Callout>
      </Section>

      <Section title="Quando escolher RT-DETR" accent={accent}>
        <p>
          RT-DETR entrega mAP comparável a YOLOv8-L com menor latência em GPUs modernas e sem NMS. Vale quando: (1) pipeline não pode ter NMS como hiperparâmetro, (2) GPU alvo é A100/H100, (3) licença AGPL da Ultralytics é problema (RT-DETR tem Apache-2.0 via PaddleDetection).
        </p>
      </Section>
    </ModuleLayout>
  );
}
