import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cnns-resnet-efficientnet');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema as skip connections da ResNet resolveram?',
    options: [
      'Overfitting',
      'Degradation problem: redes profundas (&gt;20 camadas) sem skip ficavam PIORES que rasas, não por overfitting mas porque gradientes vanecem e identidade não é aprendida facilmente. Skip x + F(x) dá um atalho: se F(x)=0, a camada vira identidade de graça. Permitiu treinar 152 camadas em 2015, depois 1000+',
      'Velocidade de inferência',
      'Consumo de memória',
    ],
    correct: 1,
    explanation: 'Pré-ResNet (2015), empilhar camadas piorava acurácia até no treino — não era overfit. He et al. mostraram que o problema era otimização: a rede não conseguia aprender função identidade por composição de ReLUs. Skip connection x + F(x) garante que identidade é gratuita e o bloco só precisa aprender o resíduo F(x). Hoje todo transformer também usa skip (residual stream) pelo mesmo motivo.',
  },
  {
    question: 'Qual a ideia central do EfficientNet?',
    options: [
      'Mais canais',
      'Compound scaling: em vez de escalar só profundidade (mais camadas) OU largura (mais canais) OU resolução, escala os três juntos numa proporção derivada por neural architecture search. Com o mesmo FLOP, alcança accuracy melhor que ResNet. EfficientNet-B0 é baseline; B1–B7 são a mesma arquitetura com fator phi crescente',
      'Treinar mais rápido',
      'Quantização agressiva',
    ],
    correct: 1,
    explanation: 'Tan &amp; Le (Google 2019): escalar uma dimensão só tem retornos decrescentes. A contribuição foi o coeficiente único phi que aumenta depth, width e resolução juntos numa razão ótima descoberta por NAS. Em 2021–2022, ConvNeXt (Liu et al.) mostrou que CNN modernizada compete com ViT — e hoje híbridos dominam.',
  },
  {
    question: 'Quando escolher ViT em vez de CNN em 2026?',
    options: [
      'Sempre',
      'Quando há dataset grande (&gt;1M imagens) ou pretrain forte disponível (CLIP, DINOv2). ViT ganha em generalização mas precisa de mais dados. Em datasets pequenos (&lt;50k), CNN com transfer learning ainda vence — CNN tem bias indutivo (locality, translation equivariance) que vale ouro com pouco dado',
      'Só para imagens 4K',
      'Nunca, CNN sempre vence',
    ],
    correct: 1,
    explanation: 'ViT tem quase zero bias indutivo — aprende tudo do dado. Ótimo com ImageNet-22k ou JFT-300M, sofre em dataset pequeno. CNN vem com convolução (locality) + pooling (translation invariance) de graça. Regra prática 2026: dataset &lt;50k → EfficientNet/ConvNeXt transfer; &gt;500k ou acesso a CLIP/DINOv2 → ViT fine-tune; produção edge → MobileNet ou EfficientNet-Lite.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cnns-resnet-efficientnet"
      title="CNNs: ResNet, EfficientNet, ConvNeXt"
      icon="🧠"
      xp={55}
      readTime={13}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Convolution: modelo mental correto" accent={accent}>
        <p>
          Convolução 2D é um filtro deslizante que calcula produto escalar numa janela. Três propriedades importam: <b>locality</b> (pixel vizinho influencia mais), <b>weight sharing</b> (mesmo filtro em todas as posições — poucos parâmetros) e <b>translation equivariance</b> (objeto deslocado gera feature map deslocado). É esse <i>bias indutivo</i> que faz CNN aprender com menos dados que um MLP.
        </p>
        <CodeBlock lang="python">{`import torch.nn as nn

block = nn.Sequential(
    nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=1, padding=1),
    nn.BatchNorm2d(128),
    nn.ReLU(inplace=True),
    nn.MaxPool2d(kernel_size=2),  # downsample 2x
)`}</CodeBlock>
      </Section>

      <Section title="ResNet: skip connections" accent={accent}>
        <CodeBlock lang="python">{`class BasicBlock(nn.Module):
    def __init__(self, ch):
        super().__init__()
        self.conv1 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn1   = nn.BatchNorm2d(ch)
        self.conv2 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn2   = nn.BatchNorm2d(ch)

    def forward(self, x):
        identity = x
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = out + identity   # skip connection
        return torch.relu(out)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O truque conceitual: a rede aprende o <i>resíduo</i> (quanto mudar), não a representação toda. Se mudar nada é ótimo, basta zerar os pesos de F(x) — gradiente flui direto pelo atalho.
        </Callout>
      </Section>

      <Section title="EfficientNet e ConvNeXt" accent={accent}>
        <p>
          EfficientNet (2019) trouxe compound scaling. ConvNeXt (2022) pegou o design do Swin Transformer e aplicou em CNN: kernel 7x7, LayerNorm em vez de BatchNorm, GELU, inverted bottleneck. Mostrou que CNN bem modernizada ainda compete com ViT no ImageNet.
        </p>
        <CodeBlock lang="python">{`# Transfer learning pragmático com timm
import timm

model = timm.create_model("convnext_tiny", pretrained=True, num_classes=10)
# Congelar backbone nas primeiras épocas
for p in model.parameters():
    p.requires_grad = False
for p in model.head.parameters():
    p.requires_grad = True`}</CodeBlock>
      </Section>

      <Section title="Transfer learning: receita que funciona" accent={accent}>
        <CodeBlock lang="python">{`# Fase 1: head only, lr alto (1e-3), 3-5 epochs
# Fase 2: descongela tudo, lr baixo (1e-4 head, 1e-5 backbone), 10-20 epochs
from torch.optim import AdamW

param_groups = [
    {"params": model.head.parameters(), "lr": 1e-4},
    {"params": [p for n, p in model.named_parameters() if "head" not in n], "lr": 1e-5},
]
optim = AdamW(param_groups, weight_decay=1e-4)`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Em 2026, para 90% dos problemas de classificação com &lt;100k imagens: timm + ConvNeXt-Tiny ou EfficientNet-B0 pretrained → fine-tune em 2 fases → acurácia competitiva com uma fração do custo de treinar ViT do zero.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
