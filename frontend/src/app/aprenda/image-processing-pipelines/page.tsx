import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('image-processing-pipelines');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Albumentations é o padrão para augmentation em detection/segmentation?',
    options: [
      'É mais rápido que torchvision.transforms',
      'É a única biblioteca que transforma imagem + bounding boxes + masks + keypoints de forma consistente numa única chamada. torchvision tradicional só mexe na imagem — bbox e mask ficariam dessincronizados. Além disso, usa OpenCV por baixo (2–10x mais rápido que PIL) e integra com PyTorch DataLoader',
      'Tem mais filtros artísticos',
      'Não precisa de GPU',
    ],
    correct: 1,
    explanation: 'Bug silencioso: aplicar RandomCrop na imagem mas não nas bboxes quebra o dataset — modelo aprende “objeto ausente” como sinal válido. Albumentations recebe image + bboxes + masks + keypoints e aplica a mesma transformação geométrica em todos. torchvision.transforms.v2 (2023+) também faz, mas Albumentations ainda lidera em ecossistema (YOLO, Detectron2, MMDetection).',
  },
  {
    question: 'Quando usar CuPy vs numpy para preprocessing?',
    options: [
      'Sempre CuPy, é mais rápido',
      'CuPy quando batch grande (>64 imagens) e operação é paralelizável (resize, normalização, color jitter). Para batch pequeno, overhead de transferência CPU→GPU mata o ganho. CuPy só compensa se o dado já está na GPU ou será consumido imediatamente lá (ex: feed direto pro modelo)',
      'Nunca, é instável',
      'Só em produção',
    ],
    correct: 1,
    explanation: 'Regra empírica: transferência CPU↔GPU custa ~10ms para imagem 1080p. Se sua operação numpy leva 5ms, CuPy vira lento. CuPy ganha quando batch é grande e várias operações encadeadas permanecem na GPU. NVIDIA DALI é ainda melhor: faz decode JPEG na GPU, evitando totalmente o caminho CPU.',
  },
  {
    question: 'Qual o maior ganho do NVIDIA DALI em produção?',
    options: [
      'Melhor qualidade de imagem',
      'Desloca decode JPEG + resize + normalização do CPU para GPU, liberando CPU para outras tarefas e acabando com o gargalo clássico de “GPU ociosa esperando data loader”. Em treinos grandes (ImageNet-scale), dobra throughput ao saturar a GPU em vez de esperar PIL.Image.open',
      'Menor consumo de memória',
      'Roda sem CUDA',
    ],
    correct: 1,
    explanation: 'Em treinos de CNN pesada (ResNet-152, EfficientNet-B7), o bottleneck real costuma ser data loading, não forward pass. nvidia-smi mostra GPU em 40% — é CPU não dando conta do decode JPEG. DALI resolve isso. Em inferência, TensorRT + DALI formam pipeline 100% GPU do byte JPEG até o logit.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="image-processing-pipelines"
      title="Image processing em pipeline"
      icon="🔄"
      xp={50}
      readTime={12}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Pipeline = contrato treino↔inferência" accent={accent}>
        <p>
          Regra de ouro: a mesma normalização usada no treino precisa ser aplicada em inferência, pixel por pixel. Discrepância aqui é a causa mais comum de modelo “bom em validação, ruim em produção”.
        </p>
        <Callout tone="danger" icon="🚨">
          Se seu treino normaliza com mean=[0.485, 0.456, 0.406] e std=[0.229, 0.224, 0.225] (ImageNet) mas a inferência esquece — acurácia cai 5–15% silenciosamente. Commit no repositório: arquivo <code>preprocess.py</code> único importado pelo treino e pela API.
        </Callout>
      </Section>

      <Section title="Augmentation com Albumentations" accent={accent}>
        <CodeBlock lang="python">{`import albumentations as A
from albumentations.pytorch import ToTensorV2

train_transform = A.Compose([
    A.LongestMaxSize(max_size=640),
    A.PadIfNeeded(min_height=640, min_width=640, border_mode=0),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.3),
    A.HueSaturationValue(p=0.3),
    A.GaussNoise(p=0.2),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
], bbox_params=A.BboxParams(format="yolo", label_fields=["class_labels"]))

val_transform = A.Compose([
    A.LongestMaxSize(max_size=640),
    A.PadIfNeeded(min_height=640, min_width=640, border_mode=0),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
], bbox_params=A.BboxParams(format="yolo", label_fields=["class_labels"]))`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Validação/inferência nunca têm augmentation aleatório — só resize + normalize determinísticos. Violar isso destrói comparabilidade entre épocas.
        </Callout>
      </Section>

      <Section title="Data loading: CPU vs DALI" accent={accent}>
        <CodeBlock lang="python">{`# Pipeline DALI minimal: decode JPEG + resize + normalize 100% na GPU
from nvidia.dali import pipeline_def, fn, types

@pipeline_def(batch_size=64, num_threads=4, device_id=0)
def cv_pipeline(file_root):
    jpegs, labels = fn.readers.file(file_root=file_root, random_shuffle=True)
    images = fn.decoders.image(jpegs, device="mixed")  # mixed = GPU decode
    images = fn.resize(images, resize_x=224, resize_y=224)
    images = fn.crop_mirror_normalize(
        images,
        mean=[0.485 * 255, 0.456 * 255, 0.406 * 255],
        std=[0.229 * 255, 0.224 * 255, 0.225 * 255],
        output_layout="CHW",
    )
    return images, labels`}</CodeBlock>
      </Section>

      <Section title="Preprocessing determinístico para inferência" accent={accent}>
        <CodeBlock lang="python">{`# preprocess.py — importado pelo treino e pela API FastAPI
import cv2
import numpy as np

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

def preprocess(img_bgr: np.ndarray, size: int = 640) -> np.ndarray:
    img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]
    scale = size / max(h, w)
    nh, nw = int(h * scale), int(w * scale)
    img = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)
    canvas = np.zeros((size, size, 3), dtype=np.uint8)
    canvas[:nh, :nw] = img
    x = canvas.astype(np.float32) / 255.0
    x = (x - MEAN) / STD
    return x.transpose(2, 0, 1)  # HWC -> CHW`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Um arquivo, uma função, dois consumidores. Se o treino mudar de 640 pra 800, a API não quebra silenciosamente — uma mudança, um deploy sincronizado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
