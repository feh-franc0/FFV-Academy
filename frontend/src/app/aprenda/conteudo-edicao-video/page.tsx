import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('conteudo-edicao-video');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual editor de vídeo gratuito tem qualidade profissional comparável a softwares pagos em 2026?',
    options: [
      'Windows Movie Maker — simples e rápido',
      'DaVinci Resolve (gratuito) — usado em filmes de Hollywood, color grading profissional, edição não-linear, motion graphics e áudio em uma única ferramenta. Versão Studio paga (US$295) só é necessária para 4K acima de 60fps e features avançadas',
      'iMovie — apenas para Mac, mas suficiente para qualquer criador',
      'CapCut — ideal para vídeos longos e edição complexa',
    ],
    correct: 1,
    explanation:
      'DaVinci Resolve é o padrão da indústria gratuita. Tem todos os recursos de Adobe Premiere + After Effects + Audition em uma única ferramenta. Curva de aprendizado mais íngreme nos primeiros 10h, mas depois é mais rápido que Premiere para muitas tarefas. Download oficial: blackmagicdesign.com/products/davinciresolve. Roda em Mac, Windows, Linux.',
  },
  {
    question: 'Qual é a regra de "cortar tudo o que pode ser cortado" e por que ela funciona?',
    options: [
      'Eliminar pausas longas e silêncios para reduzir duração total',
      'Cortar palavras de hesitação ("éééé", "humm"), silêncios acima de 0.3s, repetições e digressões. Vídeo educacional bom tem ritmo de 1 corte a cada 3-7 segundos. Tutorial técnico bom tem 1 corte a cada 5-10s. Reduz duração em 30-50% sem perder conteúdo',
      'Manter o vídeo abaixo de 10 minutos sempre — algoritmos preferem',
      'Cortar apenas o início e fim do vídeo',
    ],
    correct: 1,
    explanation:
      'Cérebro humano perde atenção em 8-12 segundos sem mudança visual ou auditiva. Cortes mantêm engajamento. CapCut e Premiere têm "Auto Cut" que detecta pausas longas. DaVinci tem o recurso "Detect Scene Cuts". Para vídeos falados: Descript faz transcrição + corta direto pelo texto (apaga palavra → apaga vídeo).',
  },
  {
    question: 'Qual é o setup mínimo de hardware para editar vídeo 1080p com fluidez em 2026?',
    options: [
      'Qualquer notebook moderno serve — software faz toda a otimização',
      'Mac M2 ou superior / PC com 16GB RAM + GPU dedicada (RTX 3060 ou superior) + SSD NVMe. 8GB RAM = travadinhas frequentes. HD mecânico = lentidão extrema na timeline. Para 4K: 32GB RAM + RTX 4070+ ou Mac M3 Pro+',
      'Desktop gamer com placa de vídeo top de linha é obrigatório',
      'Notebook de 8GB RAM e SSD comum é suficiente para qualquer projeto',
    ],
    correct: 1,
    explanation:
      'Edição de vídeo é o caso de uso mais pesado para hardware doméstico. RAM importa para timeline longa, GPU importa para preview e exportação, SSD NVMe importa para scrubbing fluido. Mac M2/M3 tem otimização nativa para vídeo (ProRes em hardware). PC: priorize Ryzen 7 ou Intel i7 + RTX 3060+ + 16GB+ + SSD NVMe de 1TB+. Investimento: R$6-10k em PC, R$11-18k em Mac.',
  },
  {
    question: 'Como acelerar a exportação de vídeo sem perder qualidade?',
    options: [
      'Reduzir a resolução final para 720p — qualidade visível é a mesma',
      'Usar codec H.264 com hardware acceleration (NVIDIA NVENC, AMD AMF, Apple VideoToolbox), bitrate target apropriado (8-12 Mbps para 1080p YouTube), e exportar em segundo monitor enquanto trabalha. Reduz tempo em 4-10x vs CPU encoding',
      'Sempre usar codec ProRes para máxima velocidade',
      'Exportar em partes e juntar depois manualmente',
    ],
    correct: 1,
    explanation:
      'Hardware encoding (NVENC, QuickSync, VideoToolbox) usa hardware dedicado da GPU para encodar — muito mais rápido que CPU. Trade-off: qualidade ligeiramente inferior em bitrates muito baixos. Para YouTube/Instagram: imperceptível. Para entrega cliente premium: use software encoding (CPU). DaVinci: Deliver page → Video tab → Encoder: NVIDIA H.264. Premiere: Format H.264 → Profile: Main → Hardware Encoding.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-edicao-video"
      title="Edição de Vídeo: do CapCut ao DaVinci Resolve com fluxo profissional"
      icon="🎬"
      xp={75}
      readTime={14}
      trailName="Criação de Conteúdo"
      trailColor={ACCENT}
      nextSlug="conteudo-tutorial-tecnico"
      nextTitle="Tutorial Técnico: ensinar com clareza no vídeo"
      relatedSlugs={['conteudo-setup-gravacao', 'conteudo-youtube', 'conteudo-design-basico']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Edição é onde o vídeo nasce de verdade. Material gravado bom + edição ruim = vídeo ruim. Material
        mediano + edição boa = vídeo bom. Esta aula cobre fluxo completo: do escolha do software ao
        export final, com configurações exatas para YouTube, Instagram e LinkedIn em 2026.
      </p>

      <Section title="Qual editor escolher: comparação direta" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Editor', 'Custo', 'Curva', 'Para quem']}
          rows={[
            ['CapCut Desktop', 'Grátis (com IA paga)', '2h até dominar', 'Reels, Shorts, conteúdo rápido'],
            ['DaVinci Resolve', 'Grátis (Studio US$295)', '15-20h sério', 'Qualquer criador sério'],
            ['Adobe Premiere Pro', 'R$112/mês', '20-30h', 'Quem trabalha em time/agência'],
            ['Final Cut Pro', 'R$1.799 único (Mac)', '10-15h', 'Mac, fluxo nativo Apple'],
            ['Descript', 'US$15-30/mês', '1h', 'Edição por transcrição (texto = corte)'],
            ['iMovie', 'Grátis (Mac)', '30min', 'Início absoluto, projetos simples'],
          ]}
        />
        <Callout tone="info">
          <strong>Recomendação 2026:</strong> CapCut para Reels/Shorts (tudo em um), DaVinci Resolve
          para vídeos longos (qualidade Hollywood grátis), Descript se você fala muito (corte por
          texto economiza horas). Premiere apenas se trabalha em agência ou colabora com time Adobe.
        </Callout>
      </Section>

      <Section title="Fluxo de edição passo a passo (DaVinci Resolve)" accent={ACCENT}>
        <LayerStack
          title="Pipeline profissional de edição em DaVinci Resolve"
          accent={ACCENT}
          separatorLabel="próxima etapa →"
          layers={[
            { label: '1. Media Pool', content: 'Importar arquivos. Organize em bins: VIDEO, AUDIO, BROLL, ASSETS', note: 'tecla 1', tone: 'writable' },
            { label: '2. Cut/Edit Page', content: 'Cortar pausas e erros — use J-K-L para navegação rápida, B para razor blade', tone: 'writable' },
            { label: '3. Color Page', content: 'Color grading — primary wheels para corrigir, depois LUT criativa para look', note: 'tecla 6', tone: 'writable' },
            { label: '4. Fairlight', content: 'Limpar áudio — Voice Isolation (tecla F), normalize a -16 LUFS', tone: 'writable' },
            { label: '5. Fusion (opcional)', content: 'Motion graphics, lower thirds, animações', tone: 'writable' },
            { label: '6. Deliver Page', content: 'Exportar — preset YouTube 1080p ou Custom para outras plataformas', note: 'tecla 7', tone: 'success' },
          ]}
        />
        <CodeBlock lang="bash">{`# Atalhos críticos para acelerar edição em 5x
J / K / L     = play reverso / pause / play (segure para mais rápido)
I / O         = marcar in / out
B             = razor blade (cortar)
A             = selection tool
M             = adicionar marker
Cmd/Ctrl + B  = inserir corte na timeline (split clip)
Shift + ↑/↓   = mover para próximo/anterior corte
Cmd/Ctrl + Z  = desfazer
Cmd/Ctrl + S  = salvar (faça a cada 10 minutos)`}</CodeBlock>
      </Section>

      <Section title="Configurações de export por plataforma (2026)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Resolução', 'Bitrate', 'FPS', 'Codec']}
          rows={[
            ['YouTube 1080p', '1920×1080', '8-12 Mbps', '30 ou 60', 'H.264 (HEVC para 4K)'],
            ['YouTube 4K', '3840×2160', '35-45 Mbps', '30 ou 60', 'H.265/HEVC'],
            ['Instagram Reels', '1080×1920 (9:16)', '5 Mbps', '30', 'H.264'],
            ['TikTok', '1080×1920 (9:16)', '5-6 Mbps', '30', 'H.264'],
            ['LinkedIn Vídeo', '1920×1080 ou 1:1', '5-10 Mbps', '30', 'H.264'],
            ['WhatsApp Status', '720×1280', '2 Mbps', '30', 'H.264 baixo'],
          ]}
        />
        <DecisionBox
          scenario="Editar vídeo para YouTube em 2026 — qual setup usar?"
          winner="DaVinci Resolve gratuito + atalhos J-K-L + export H.264 1080p NVENC"
          winnerColor={ACCENT}
          why="Resolve gratuito tem 95% das features pagas. Hardware encoding NVENC reduz tempo de export de 30min para 5min em vídeo de 20min. 1080p continua sendo padrão YouTube — 4K só compensa para gameplay e tutoriais visuais detalhados."
          alternatives={[
            { name: 'Premiere Pro com Adobe CC', note: 'Vale se já paga Photoshop+After Effects — workflow integrado' },
            { name: 'Final Cut Pro (Mac)', note: 'Mais rápido em Mac que DaVinci, R$1.799 único — paga em 1 ano vs Premiere' },
          ]}
        />
      </Section>

      <Section title="Edição por IA: o que vale a pena em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'O que faz', 'Preço']}
          rows={[
            ['Descript', 'Edita por texto (apaga palavra → apaga vídeo)', 'US$15/mês'],
            ['CapCut Auto Cut', 'Detecta pausas e cria cortes automáticos', 'Grátis'],
            ['Adobe Podcast', 'Restaura áudio ruim → estúdio', 'Grátis (web)'],
            ['Eleven Labs', 'Voice cloning para correção de fala', 'US$5-22/mês'],
            ['Runway Gen-3', 'Geração de B-roll por prompt de texto', 'US$15-95/mês'],
            ['Opus Clip', 'Pega vídeo longo, gera Reels/Shorts virais', 'US$19-95/mês'],
            ['Submagic', 'Legendas animadas estilo Reels', 'US$16/mês'],
          ]}
        />
        <Callout tone="info">
          <strong>Stack econômico recomendado:</strong> DaVinci Resolve (grátis) + CapCut (grátis) +
          Adobe Podcast Enhance (grátis para áudio) + Submagic (R$80/mês para legendas) = estúdio
          completo por R$80/mês. Compare com Premiere + After Effects + Audition + Captions = R$300+/mês.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale a pena pagar DaVinci Resolve Studio (US$295)?"
          a={<>Para 90% dos criadores, a versão gratuita é suficiente. Pague Studio se: (1) edita 4K acima de 60fps; (2) precisa de Noise Reduction temporal (limpa ruído de vídeo gravado em ISO alto); (3) exporta H.265 para 4K e o gratuito limita a 8-bit; (4) precisa de Resolve FX avançados (face refinement, beauty, etc). É licença vitalícia (não assinatura) — comprou uma vez, vale para sempre.</>}
        />
        <QAItem
          q="Como organizar arquivos de projeto para não perder material?"
          a={<>Estrutura de pastas obrigatória: /ProjetoNome/01-RAW (gravações originais — NUNCA editar), /02-AUDIO (áudio limpo e separado), /03-BROLL (clips de apoio), /04-ASSETS (logos, lower thirds, fontes), /05-PROJECT (arquivo .drp/.prproj), /06-EXPORTS. Backup obrigatório antes de finalizar: pasta inteira em SSD externo + cópia em nuvem (Google Drive, OneDrive). Hard drive falha; nuvem não — mas perda de internet acontece.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> DaVinci Resolve gratuito = 95% das features pagas. CapCut para
        Reels/Shorts. Descript se você fala muito (edição por texto). Atalhos J-K-L economizam horas.
        Hardware encoding (NVENC/VideoToolbox) acelera export 4-10x. 1080p H.264 8-12Mbps continua
        padrão YouTube em 2026. Stack completo gratuito + R$80/mês resolve 99% das necessidades.
        Estrutura de pastas e backup salvam projeto da catástrofe.
      </Callout>
    </div>
  );
}
