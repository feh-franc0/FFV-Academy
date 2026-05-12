import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('eval-fid-clip');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'O que FID (Frechet Inception Distance) mede?',
    options: [
      'A "qualidade" visual subjetiva',
      'A distância estatística entre distribuições de features (extraídas pela Inception v3) de imagens reais vs geradas. Quanto menor, mais a distribuição gerada se parece com a real',
      'Tempo de geração',
      'Resolução máxima',
    ],
    correct: 1,
    explanation: 'FID (Heusel et al., NeurIPS 2017) compara duas distribuições gaussianas multivariadas em espaço de features Inception. Baixo FID → distribuição parecida → modelo "bom". Padrão de benchmark há quase uma década, mas com limitações conhecidas (penaliza estilos válidos fora da distribuição de treino).',
  },
  {
    question: 'CLIP score em geração de imagem mede:',
    options: [
      'Realismo',
      'Alinhamento texto-imagem — cosine similarity entre o embedding CLIP da imagem gerada e o embedding CLIP do prompt. Mede "a imagem casa com o que pediu?", não realismo',
      'Tempo de geração',
      'Uso de GPU',
    ],
    correct: 1,
    explanation: 'CLIP score (Radford 2021) usa o joint embedding text-image do CLIP. Score alto → imagem alinhada com prompt. Não mede qualidade fotográfica nem fidelidade. Use FID + CLIP score juntos para visão dupla (realismo + alinhamento).',
  },
  {
    question: 'DPG-Bench foca em qual aspecto?',
    options: [
      'Realismo',
      'Compositional capability — capacidade do modelo de entender prompts complexos com múltiplos objetos, atributos, relações espaciais ("um cachorro vermelho à esquerda de um gato azul")',
      'Velocidade',
      'Cor',
    ],
    correct: 1,
    explanation: 'DPG-Bench (Dense Prompt Generation, Hu et al 2024) avalia compositional prompts. Modelos atuais ainda falham em "X à esquerda de Y, com Z em cima" — atributos vazam entre objetos, contagem erra. Métrica importante além de FID/CLIP.',
  },
  {
    question: 'Imagen Arena (Elo-style) é:',
    options: [
      'Um jogo',
      'Benchmark crowdsourced onde usuários votam em pares de imagens (modelo A vs modelo B para o mesmo prompt). Score Elo acumula. Padrão emergente para ranking subjetivo de modelos em 2025/2026',
      'Apenas para vídeo',
      'Não existe',
    ],
    correct: 1,
    explanation: 'Imagen Arena (similar a LMArena para chat) destrava avaliação humana em escala. Usuário não sabe qual modelo é qual. Útil para capturar "preferência humana" — algo que FID e CLIP score não capturam.',
  },
  {
    question: 'Quando human eval é insubstituível em geração?',
    options: [
      'Nunca',
      'Sempre que o output será usado por humanos em contexto subjetivo: marketing, arte, branding, identidade visual. Métricas automáticas correlacionam mas não substituem.',
      'Apenas em testes',
      'Apenas para vídeo',
    ],
    correct: 1,
    explanation: 'FID/CLIP medem propriedades estatísticas. Beleza, gosto, branding, contexto cultural — humanos só. Estado da arte: usar métricas automáticas para CI/gating + revisão humana em amostragem para release.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="eval-fid-clip"
      title="Avaliação: FID, CLIP score, DPG-Bench, human eval"
      icon="📊"
      xp={60}
      readTime={12}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="modelos-3d-mesh"
      nextTitle="Geração 3D"
      quiz={quiz}
    >
      <Section title="Como medir 'imagem boa'?" accent={accent}>
        <p className="text-sm leading-6">
          Avaliação de geração é problema aberto. O que é "boa"? Realista? Bonita? Alinhada com o prompt? Compositional? Sem viés? Sem violações de copyright? Cada pergunta tem métrica diferente — e nenhuma sozinha resolve. A indústria converge em <i>bateria de testes</i>: FID + CLIP score + DPG-Bench + Arena + amostragem humana.
        </p>
      </Section>

      <Section title="FID — a métrica clássica" accent={accent}>
        <AnnotatedFormula
          title="Frechet Inception Distance"
          formula="FID = ||μ_r - μ_g||² + Tr(Σ_r + Σ_g - 2(Σ_r·Σ_g)^(1/2))"
          accent={accent}
          parts={[
            { text: 'FID', highlight: true, annotation: 'Distância entre distribuições' },
            { text: '=' },
            { text: '||μ_r - μ_g||²', annotation: 'Diferença das médias (features Inception)' },
            { text: '+' },
            { text: 'Tr(Σ_r + Σ_g - 2(Σ_r·Σ_g)^(1/2))', annotation: 'Traço da covariância combinada' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Features', v: 'Camada pool3 da Inception v3 pré-treinada em ImageNet' },
            { k: 'Tamanho mínimo de amostra', v: '~50k imagens reais + 50k geradas para FID estável' },
            { k: 'Range típico', v: 'Stable Diffusion: FID 10-15 em COCO. Modelos SOTA <10.' },
            { k: 'Pitfall', v: 'FID prefere "média do dataset" — modelo que gera só faces "médias" pode ter FID melhor que modelo diverso' },
            { k: 'Lib', v: 'cleanfid (Kynkäänniemi et al, ICCV 2023) é o padrão moderno' },
          ]}
        />
      </Section>

      <Section title="CLIP score — alinhamento texto-imagem" accent={accent}>
        <CodeBlock lang="python">{`import torch
from transformers import CLIPModel, CLIPProcessor

model = CLIPModel.from_pretrained('openai/clip-vit-large-patch14')
processor = CLIPProcessor.from_pretrained('openai/clip-vit-large-patch14')

inputs = processor(text=[prompt], images=[generated_image], return_tensors='pt', padding=True)
outputs = model(**inputs)
# logits_per_image é a similaridade cosseno
clip_score = outputs.logits_per_image.item()`}</CodeBlock>
        <Callout tone="info">
          Para benchmarks publicados, use o CLIP ViT-L/14 da OpenAI como referência. Variantes (BigG, SigLIP) mudam absolute values — não compare cross-modelo sem normalizar.
        </Callout>
      </Section>

      <Section title="DPG-Bench — compositional" accent={accent}>
        <p className="text-sm leading-6">
          Benchmark com prompts complexos categorizados em: contagem ("3 maçãs"), atributo ("uma maçã vermelha e uma azul"), relação espacial ("livro em cima da mesa"), múltiplos objetos. Avaliador automático verifica se cada constraint foi atendida.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'DPG-Bench score (2025)', 'FID (COCO)']}
          rows={[
            ['SD 1.5', '~67%', '~12'],
            ['SDXL', '~74%', '~9'],
            ['SD3', '~83%', '~7'],
            ['Flux.1 dev', '~85%', '~6'],
            ['DALL·E 3', '~85%', '~8'],
          ]}
        />
      </Section>

      <Section title="Arena — preferência humana em escala" accent={accent}>
        <p className="text-sm leading-6">
          Imagen Arena (e similares como Genmo Arena, Pika Arena) mostram pares de imagens cegamente. Usuário escolhe a preferida. Elo score acumula. Captura beleza/preferência que métricas estatísticas perdem.
        </p>
        <Callout tone="warn">
          Arenas têm viés próprio: usuários técnicos votam diferente do público geral. Captura "preferência média dos votantes da arena", não verdade universal.
        </Callout>
      </Section>

      <Section title="O pipeline de eval de uma release" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Sanidade automática', v: 'FID + CLIP score em set fixo de 1k prompts. Falha se cai >5%.' },
            { k: 'Compositional', v: 'DPG-Bench em CI. Catches regressões em prompt understanding.' },
            { k: 'Human spot-check', v: '50 outputs/release revisados por humano. Olhar para safety + qualidade subjetiva.' },
            { k: 'Red team', v: 'Prompts adversariais (jailbreak, NSFW, copyright). Não pode regredir.' },
            { k: 'Arena pre-release', v: 'Modelo vs versão anterior em arena privada com beta testers.' },
            { k: 'Métricas de produto', v: 'Pós-release: time-to-good-image, regeneration rate, user save rate.' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
