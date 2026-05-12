import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('modelos-3d-mesh');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'TripoSR (Stability AI/Tripo, 2024) gera mesh 3D em quanto tempo?',
    options: ['Horas', '~0.5 segundos em A100 a partir de uma única imagem 2D — feed-forward, sem otimização iterativa', 'Dias', '10 minutos'],
    correct: 1,
    explanation: 'TripoSR é o primeiro modelo "image-to-3D" feed-forward sub-segundo. Treina uma rede transformer (LRM, Large Reconstruction Model) que mapeia direto imagem → triplanos NeRF → mesh. Antes, métodos otimizativos (DreamFusion) levavam minutos a horas.',
  },
  {
    question: 'Diferença entre text-to-3D e image-to-3D em 2026:',
    options: [
      'São iguais',
      'Text-to-3D (DreamFusion, Magic3D) gera 3D direto do texto via score distillation com modelo 2D — lento, qualidade variável; Image-to-3D (TripoSR, Stable Fast 3D, Hunyuan3D) parte de imagem 2D (gerada por SD/Flux ou foto) e produz mesh rapidamente. Pipeline 2-stage (text→image→3D) costuma vencer.',
      'Text-to-3D é mais rápido',
      'Image-to-3D não existe',
    ],
    correct: 1,
    explanation: 'Em 2026 a meta-arquitetura padrão é 2-stage: usar SD/Flux para gerar imagem de referência, depois TripoSR/Hunyuan3D para 3D. Qualidade e velocidade vencem o text-to-3D direto.',
  },
  {
    question: 'Trellis (Microsoft 2024) inova em qual aspecto?',
    options: [
      'É 100x mais lento',
      'Representação 3D unificada SLAT (Structured LATent) que permite gerar mesh, NeRF e Gaussian Splatting de um único modelo treinado — flexibilidade de output para casos de uso distintos (jogos vs visualização)',
      'Não existe',
      'Roda só em iPhone',
    ],
    correct: 1,
    explanation: 'Trellis usa SLAT como representação intermediária canônica e converte para o formato final desejado. Permite ao mesmo modelo servir um pipeline de jogo (mesh com PBR materials) e visualização web (Gaussian Splatting).',
  },
  {
    question: 'Hunyuan3D (Tencent, 2024) destaca-se por:',
    options: [
      'Ser pago',
      'Qualidade visual top e PBR materials nativos (albedo, normal, roughness, metallic) — pronto para integração em engines de jogo. Open-source, baseline para Hunyuan3D-2.0',
      'Apenas mesh sem textura',
      'Não existe',
    ],
    correct: 1,
    explanation: 'Hunyuan3D foi um salto qualitativo em 2024. PBR maps prontos para Unity/Unreal sem retopologia pesada. Tencent open-sourced — mais usado em pipelines indie de game em 2026.',
  },
  {
    question: 'Quando 3D generation é prático em 2026?',
    options: [
      'Sempre',
      'Para protótipos rápidos (asset de blockout), avatares baseline, props secundários em jogos, AR/VR assets descartáveis, e-commerce 3D preview. Ainda NÃO bom o suficiente para hero assets de AAA games sem retopologia humana.',
      'Não é prático',
      'Apenas para arquitetura',
    ],
    correct: 1,
    explanation: 'Maturidade real em 2026: protótipos sim, hero assets ainda precisam de artista. Topology automática é o gap — geração tende a triangles desorganizados; jogos precisam de quads e UV organizado. Pipelines mistos (gen + retopo humano + texturing) ganham produtividade real.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="modelos-3d-mesh"
      title="Geração 3D: TripoSR, Stable Fast 3D, mesh do prompt"
      icon="🗿"
      xp={65}
      readTime={13}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="3D em 2026 — onde estamos" accent={accent}>
        <p className="text-sm leading-6">
          Geração 3D madureceu rapidamente em 2023-2024. Antes, métodos otimizativos como DreamFusion (Poole 2022) levavam horas por asset. Em 2024 surgiram LRMs (Large Reconstruction Models) feed-forward — TripoSR, Stable Fast 3D, Hunyuan3D, Trellis. Hoje, mesh decente em sub-segundo a partir de uma imagem. Hero assets AAA ainda precisam humano, mas pipeline indie/AR/VR/e-commerce já é viável.
        </p>
      </Section>

      <Section title="Comparativo dos modelos abertos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Origem', 'Velocidade', 'Forte em']}
          rows={[
            ['TripoSR', 'Stability + Tripo', '~0.5s (A100)', 'Pioneirismo, baseline rápido'],
            ['Stable Fast 3D', 'Stability AI', '~0.5s', 'UV-unwrap + textura prontos'],
            ['Hunyuan3D 1.0/2.0', 'Tencent', '~3-5s', 'PBR materials, qualidade visual'],
            ['Trellis', 'Microsoft', '~3-5s', 'Output flexível (mesh / Gaussian / NeRF)'],
            ['Meshy', 'Comercial API', '~30-120s', 'Quality-focused, retopo automática'],
            ['CSM (Common Sense Machines)', 'Comercial', '~30s', 'Image-to-3D + animação rigging'],
          ]}
        />
      </Section>

      <Section title="Pipeline típico 2-stage" accent={accent}>
        <FlowDiagram
          title="Text → Image → 3D"
          accent={accent}
          orientation="horizontal"
          steps={[
            { icon: '📝', label: 'Prompt', desc: 'Texto descritivo' },
            { icon: '🎨', label: 'SD/Flux', desc: 'Imagem 2D referência' },
            { icon: '🗿', label: 'TripoSR/Hunyuan3D', desc: 'Mesh + textura' },
            { icon: '🎮', label: 'Engine', desc: 'Unity/Unreal/three.js' },
          ]}
        />
      </Section>

      <Section title="Use cases reais em 2026" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'E-commerce 3D preview', v: 'Geração on-the-fly de modelo 3D do produto a partir de foto do catálogo' },
            { k: 'AR try-on / placement', v: 'Móvel/decoração — usuário coloca asset na sala via ARKit/ARCore' },
            { k: 'Game indie blockout', v: 'Props secundários, decoração, NPCs descartáveis (não-hero)' },
            { k: 'Avatares baseline', v: 'Avatar inicial gerado da foto do usuário; refinamento manual depois' },
            { k: 'Roblox/UEFN content', v: 'Pipeline rápido para criadores não-artistas' },
            { k: 'Pré-vis arquitetônica', v: 'Conceitos rápidos para apresentação ao cliente' },
          ]}
        />
      </Section>

      <Section title="Os gaps que ainda existem" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Problema', 'Status em maio/2026']}
          rows={[
            ['Topology limpa (quads, UV organizado)', 'Ainda manual ou ferramenta separada (QuadRemesher, Instant Meshes)'],
            ['PBR materials de alta qualidade', 'Hunyuan3D bom; outros médios. Texturas geradas ainda têm artifacts.'],
            ['Animação / rigging automático', 'CSM e Meshy começaram, mas ainda imaturo'],
            ['Multi-objeto coerente', 'Ainda difícil — gerar 3 objetos numa cena coerente'],
            ['Hero assets AAA', 'Não pronto. Pipeline misto gen + artista humano vence.'],
            ['Resolução de polígonos controlável', 'Saída tende a triangle counts fixos — adjacente a aplicação específica'],
          ]}
        />
      </Section>

      <Section title="Fechamento da trilha" accent={accent}>
        <Callout tone="success" icon="🎓">
          Trilha Diffusion & Geração Multimodal concluída — você atravessou math de score matching, VAE/U-Net, SD3/Flux/MMDiT, ControlNet, LoRA, ComfyUI, vídeo, APIs e geração 3D. Badge <b>Diffusion Master</b> desbloqueado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
