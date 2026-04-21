import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('segmentation-unet-sam');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Diferença entre semantic, instance e panoptic segmentation?',
    options: [
      'Só nomes diferentes',
      'Semantic: cada pixel recebe classe, mas dois carros viram uma massa única “carro”. Instance: cada objeto é uma máscara separada (carro-1, carro-2), porém só pra “things” (contáveis). Panoptic: une as duas — things (carros individuais) + stuff (céu, estrada como regiões contínuas). Panoptic é o superset',
      'Resolução da imagem',
      'CPU vs GPU',
    ],
    correct: 1,
    explanation: 'Escolher errado custa retrabalho. Se o cliente quer contar carros num pátio: instance ou panoptic. Se quer “área ocupada por vegetação”: semantic basta. Se quer ambos numa cena urbana (contar veículos + mapear estrada): panoptic. U-Net típico faz semantic; Mask R-CNN faz instance; Mask2Former (2022) faz panoptic com arquitetura unificada.',
  },
  {
    question: 'Por que U-Net dominou segmentação biomédica?',
    options: [
      'Sorte',
      'Arquitetura encoder-decoder com skip connections nível-a-nível preserva detalhes finos (bordas celulares) que pooling perderia. Funciona com poucos dados (100-500 imagens) por causa do bias indutivo e heavy augmentation elástica. Saída com mesma resolução da entrada, ideal pra segmentar estruturas milimétricas em lâminas histológicas',
      'Só roda em MRI',
      'É mais rápido que CNN',
    ],
    correct: 1,
    explanation: 'Ronneberger 2015, ISBI challenge. Datasets médicos são pequenos (privacidade, anotação cara) — U-Net ganha porque skip connections do encoder direto pro decoder trazem detalhes espaciais fine-grained. Hoje em 2026, variantes (nnU-Net, Swin-UNet) seguem state-of-the-art em radiologia. Fora da medicina, para stuff segmentation em escala urbana, prefere-se DeepLabv3+ ou Mask2Former.',
  },
  {
    question: 'O que SAM (Segment Anything Model, Meta 2023) trouxe de novo?',
    options: [
      'Mais parâmetros',
      'Foundation model de segmentação promptable: você dá um ponto, uma bbox ou uma máscara grosseira e o modelo entrega a máscara final sem fine-tune. Treinado em SA-1B (1 bilhão de máscaras). Ideal como ferramenta de anotação semiautomática — em 2024 virou padrão em plataformas como Roboflow e CVAT. SAM-2 (2024) estendeu pra vídeo',
      'Só funciona em satélite',
      'Substitui U-Net em medicina',
    ],
    correct: 1,
    explanation: 'SAM é zero-shot no sentido prompting: você clica num objeto, ele segmenta. Não substitui modelos de domínio específico (ainda erra em células raras, tecidos médicos de nicho) — complementa. Uso killer: reduzir custo de anotação em 5–10x. SAM-2 (Meta 2024) faz tracking de máscara em vídeo com um clique no primeiro frame. Licença Apache-2.0, uso comercial liberado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="segmentation-unet-sam"
      title="Segmentation: U-Net, Mask R-CNN, SAM"
      icon="✂️"
      xp={55}
      readTime={13}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Mapa mental das três tarefas" accent={accent}>
        <p>
          Antes de escolher arquitetura, defina a tarefa com precisão cirúrgica: semantic (pixel → classe), instance (pixel → classe + id do objeto), panoptic (ambos, unificado). Cliente que pede “segmentar imagem” raramente sabe qual — pergunte até deixar claro.
        </p>
      </Section>

      <Section title="U-Net do zero em PyTorch" accent={accent}>
        <CodeBlock lang="python">{`import torch
import torch.nn as nn

def conv_block(cin, cout):
    return nn.Sequential(
        nn.Conv2d(cin, cout, 3, padding=1), nn.BatchNorm2d(cout), nn.ReLU(inplace=True),
        nn.Conv2d(cout, cout, 3, padding=1), nn.BatchNorm2d(cout), nn.ReLU(inplace=True),
    )

class UNet(nn.Module):
    def __init__(self, n_classes=2):
        super().__init__()
        self.d1 = conv_block(3, 64)
        self.d2 = conv_block(64, 128)
        self.d3 = conv_block(128, 256)
        self.bottleneck = conv_block(256, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.u3 = conv_block(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.u2 = conv_block(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.u1 = conv_block(128, 64)
        self.out = nn.Conv2d(64, n_classes, 1)
        self.pool = nn.MaxPool2d(2)

    def forward(self, x):
        d1 = self.d1(x)
        d2 = self.d2(self.pool(d1))
        d3 = self.d3(self.pool(d2))
        b  = self.bottleneck(self.pool(d3))
        u3 = self.u3(torch.cat([self.up3(b), d3], dim=1))
        u2 = self.u2(torch.cat([self.up2(u3), d2], dim=1))
        u1 = self.u1(torch.cat([self.up1(u2), d1], dim=1))
        return self.out(u1)`}</CodeBlock>
      </Section>

      <Section title="Loss: Dice + BCE" accent={accent}>
        <CodeBlock lang="python">{`def dice_loss(logits, target, eps=1e-6):
    probs = torch.sigmoid(logits)
    inter = (probs * target).sum(dim=(2, 3))
    union = probs.sum(dim=(2, 3)) + target.sum(dim=(2, 3))
    dice = (2 * inter + eps) / (union + eps)
    return 1 - dice.mean()

def combo_loss(logits, target):
    bce = nn.functional.binary_cross_entropy_with_logits(logits, target)
    return bce + dice_loss(logits, target)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          BCE puro falha com classes desbalanceadas (ex.: tumor ocupa 1% dos pixels). Dice é invariante a escala da classe. Combinar os dois é robusto. Para multi-classe, use Focal Loss + Dice.
        </Callout>
      </Section>

      <Section title="SAM como ferramenta de anotação" accent={accent}>
        <CodeBlock lang="python">{`from segment_anything import sam_model_registry, SamPredictor
import numpy as np, cv2

sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth").to("cuda")
predictor = SamPredictor(sam)

img = cv2.imread("foto.jpg")
predictor.set_image(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

# Prompt = um ponto dentro do objeto
point_coords = np.array([[500, 375]])
point_labels = np.array([1])  # 1 = foreground
masks, scores, _ = predictor.predict(
    point_coords=point_coords,
    point_labels=point_labels,
    multimask_output=True,
)
best_mask = masks[np.argmax(scores)]`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Workflow 2026 para novo dataset de segmentação: (1) SAM gera máscaras candidatas por clique, (2) anotador só corrige onde SAM errou, (3) treina U-Net/Mask2Former especializado. Reduz custo de rotulagem em 5–10x vs anotação manual pura.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
