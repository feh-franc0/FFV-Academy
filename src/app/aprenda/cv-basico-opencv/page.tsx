import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cv-basico-opencv');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que OpenCV lê imagem em BGR e não RGB?',
    options: [
      'Porque BGR ocupa menos memória',
      'Decisão histórica dos anos 1990 — câmeras e placas de captura da época entregavam nessa ordem. Foi mantido por compatibilidade. Resultado prático: sempre converter com cv2.cvtColor(img, cv2.COLOR_BGR2RGB) antes de mostrar em matplotlib ou passar pra modelos treinados em RGB (quase todos do PyTorch/TF)',
      'Porque é mais preciso',
      'BGR é padrão ISO',
    ],
    correct: 1,
    explanation: 'Bug clássico: juntar OpenCV (BGR) com torchvision (RGB) sem converter — modelo processa canais trocados, acurácia cai silenciosamente. Sempre lembre: cv2.imread → BGR; PIL.Image.open → RGB; torchvision expects RGB. Converter explicitamente evita 3 horas debugando.',
  },
  {
    question: 'Quando CV clássico (OpenCV puro) ainda ganha de deep learning?',
    options: [
      'Nunca, DL venceu tudo',
      'Tarefas determinísticas bem definidas: detecção de bordas/contornos, alinhamento por feature matching (ORB/SIFT), barcode/QR, calibração de câmera, homografia, stitching. Rodam em CPU, milissegundos, zero GPU, zero dataset, zero retreino. Custo e latência imbatíveis',
      'Só em imagens grayscale',
      'Só em vídeo',
    ],
    correct: 1,
    explanation: 'Engenheiro sênior escolhe ferramenta por custo/benefício. Detectar 4 cantos de um documento? Canny + findContours resolve em 5ms sem dataset. Treinar CNN pra isso é overkill. DL ganha quando há variação semântica complexa (reconhecer gato vs cachorro sob iluminação variada). Pipeline real mistura: CV clássico faz preprocessing/ROI, DL faz a parte semântica.',
  },
  {
    question: 'Qual combinação típica pra detectar bordas robustamente?',
    options: [
      'Só Sobel',
      'GaussianBlur (5x5) para reduzir ruído → Canny com thresholds adaptativos (low=médio*0.66, high=médio*1.33 via mediana de pixels) → morphological close para unir bordas quebradas. Ordem importa: blur antes de gradiente evita amplificar ruído',
      'Threshold binário direto',
      'Histogram equalization apenas',
    ],
    correct: 1,
    explanation: 'Canny sem blur prévio detecta ruído como borda. Thresholds hardcoded (100, 200) quebram sob iluminação variada — derivar da mediana é truque do John Canny original. Morph close conecta bordas fragmentadas por compressão JPEG. Essa receita resolve 80% dos casos industriais (inspeção visual, leitura de medidores).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cv-basico-opencv"
      title="Computer vision básico com OpenCV"
      icon="🖼️"
      xp={45}
      readTime={11}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Imagem é array numpy, nada mais" accent={accent}>
        <p>
          Toda imagem em OpenCV é <code>np.ndarray</code> de shape <code>(H, W, 3)</code> com dtype <code>uint8</code> (0–255). Essa é a mentalidade mais importante do módulo: se você sabe numpy, sabe manipular pixel. Inverter cores? <code>255 - img</code>. Cropar? Slice. Resize? Broadcasting controlado.
        </p>
        <CodeBlock lang="python">{`import cv2
import numpy as np

img = cv2.imread("foto.jpg")          # shape (H, W, 3) BGR uint8
print(img.shape, img.dtype)            # (1080, 1920, 3) uint8

# Crop ROI = slicing numpy puro
roi = img[100:400, 200:600]            # H-slice, W-slice

# Brilho +30 com saturação correta
brighter = cv2.add(img, 30)            # cv2.add satura em 255
# vs img + 30 (numpy faz overflow wrap - bug comum)

# BGR -> RGB antes de mostrar em matplotlib
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <code>img + 30</code> (numpy) faz overflow: pixel 250 vira 24. <code>cv2.add(img, 30)</code> satura em 255. Diferença silenciosa que destrói imagem clara.
        </Callout>
      </Section>

      <Section title="Color spaces: BGR, RGB, HSV, LAB" accent={accent}>
        <p>
          Escolher color space certo resolve problema antes de começar. HSV separa matiz (H) de brilho (V) — perfeito pra segmentar cor sob iluminação variável. LAB aproxima percepção humana — bom pra comparar similaridade de cor.
        </p>
        <CodeBlock lang="python">{`# Segmentar pixels verdes robustamente via HSV
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower_green = np.array([35, 50, 50])   # H, S, V
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)
green_only = cv2.bitwise_and(img, img, mask=mask)`}</CodeBlock>
      </Section>

      <Section title="Filtros: blur, Sobel, Canny" accent={accent}>
        <p>
          Convolução 2D é a base. Blur (suaviza), Sobel (derivada = borda), Canny (pipeline completo de detecção de bordas com non-max suppression e double threshold).
        </p>
        <CodeBlock lang="python">{`gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5, 5), 0)

# Canny com thresholds adaptativos via mediana
v = np.median(blur)
lower = int(max(0, 0.66 * v))
upper = int(min(255, 1.33 * v))
edges = cv2.Canny(blur, lower, upper)

# Fechar pequenas quebras de borda
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)`}</CodeBlock>
      </Section>

      <Section title="Contornos e decisão: CV clássico ou DL?" accent={accent}>
        <p>
          <code>findContours</code> devolve lista de polígonos fechados. Útil pra contar objetos, medir área, detectar formas geométricas determinísticas.
        </p>
        <CodeBlock lang="python">{`contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# Filtrar por área mínima (remove ruído)
big = [c for c in contours if cv2.contourArea(c) > 500]
cv2.drawContours(img, big, -1, (0, 255, 0), 2)`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Regra prática: se o problema tem especificação geométrica clara (cantos de documento, código QR, linhas de quadra), CV clássico em CPU é a melhor ferramenta. Se precisa de semântica (“isso é um gato?”), vá de CNN. A maioria dos pipelines reais combina os dois.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
