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

export const metadata = getModuleMetadata('conteudo-tutorial-tecnico');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o erro mais comum em tutoriais técnicos que faz as pessoas pararem o vídeo no minuto 1?',
    options: [
      'Não usar música de fundo',
      'Começar pela introdução ("oi pessoal, tudo bem?") em vez de mostrar o resultado final em 10 segundos. O cérebro precisa saber "vale a pena assistir?" — mostre o resultado primeiro, depois ensine como',
      'Usar o terminal sem zoom',
      'Não fazer perguntas para a audiência',
    ],
    correct: 1,
    explanation:
      'Hook de 5-15 segundos é a parte mais importante do vídeo. Estrutura validada: (1) "ao final desta aula você terá [resultado específico]"; (2) demo rápida do resultado; (3) "vou mostrar passo a passo". Evite saudações longas, "se inscreve no canal" no início, ou contexto desnecessário. Retention rate (% que assiste mais de 60s) salta de 30% para 60%+ com hook correto.',
  },
  {
    question: 'Qual ferramenta de gravação de tela tem melhor custo-benefício para tutoriais de programação em 2026?',
    options: [
      'OBS Studio (grátis) — gravação local, controle total, zero custo, mas exige configuração inicial',
      'OBS Studio (grátis) é o padrão da indústria para gravação de tela. ScreenStudio (Mac, US$89 vitalício) faz auto-zoom inteligente — ele detecta cliques e amplia automaticamente. Para começar sem custo: OBS. Para qualidade premium em Mac: ScreenStudio',
      'Loom (paga) — apenas online, qualidade limitada',
      'QuickTime — único disponível no Mac',
    ],
    correct: 1,
    explanation:
      'OBS Studio (obsproject.com) é gratuito, código aberto, roda em todos os SOs. Configuração inicial leva 30 minutos mas resultado é qualidade profissional. ScreenStudio (screen.studio) é específico para Mac, US$89 vitalício, com auto-zoom em cliques que parece edição manual. Para tutoriais de código: zoom automático em mouse cursor é diferencial gigante.',
  },
  {
    question: 'Como mostrar código no vídeo de forma legível em telas pequenas (mobile)?',
    options: [
      'Manter o tamanho de fonte do editor padrão — usuário pode dar zoom',
      'Aumentar fonte para 18-24pt (zoom 150-200% no editor), aumentar contraste do tema, e nunca mostrar mais de 30 linhas de código por frame. Em mobile, espectador vê tela de 6 polegadas — fonte pequena é ilegível e ele desiste',
      'Usar tema claro sempre — melhor legibilidade no mobile',
      'Mostrar código apenas em screenshot, não digitando ao vivo',
    ],
    correct: 1,
    explanation:
      'YouTube Mobile representa 70%+ do tráfego em 2026. Tela de smartphone vista a 30cm = código com fonte pequena vira borrão ilegível. Configurações VS Code para gravação: Settings → Editor: Font Size: 20, Zoom Level: 1, Line Height: 1.6, Theme: One Dark Pro ou Tokyo Night (alto contraste). Atalho Cmd+ / Ctrl+ aumenta zoom dinamicamente durante gravação para destaque.',
  },
  {
    question: 'Qual é a melhor estrutura para tutorial de programação acima de 15 minutos?',
    options: [
      'Mostrar tudo de uma vez sem cortes — autenticidade vende',
      'Dividir em chapters (capítulos) visíveis na timeline: 1. Setup (2min) → 2. Fundamentos (5min) → 3. Implementação (15min) → 4. Edge cases (5min) → 5. Recap (2min). YouTube indexa chapters separadamente — cada um pode aparecer em busca diferente',
      'Manter narração contínua sem pausas estruturais',
      'Tutoriais longos não funcionam — sempre dividir em vídeos de 5min',
    ],
    correct: 1,
    explanation:
      'Chapters (capítulos no YouTube) são SEO interno: cada chapter aparece como timestamp na busca, aumentando descoberta. Configurar: descrição do vídeo com timestamps em formato "00:00 Introdução\\n02:30 Setup\\n07:30 Implementação". YouTube auto-detecta e cria chapters clicáveis. Vídeos com chapters têm 30%+ de retention vs vídeos sem (YouTube Creator Insights 2024).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-tutorial-tecnico"
      title="Tutorial Técnico: ensinar com clareza, hooks e retenção"
      icon="🎓"
      xp={70}
      readTime={12}
      trailName="Criação de Conteúdo"
      trailColor={ACCENT}
      nextSlug="conteudo-linkedin-criador"
      nextTitle="LinkedIn Criador: posicionamento e algoritmo em 2026"
      relatedSlugs={['conteudo-edicao-video', 'conteudo-youtube', 'conteudo-setup-gravacao']}
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
        Tutorial técnico mal feito tem retention de 20% (espectador desiste no minuto 2). Tutorial bem
        feito tem retention de 60%+ — e isso muda completamente o crescimento do canal. A diferença
        está em estrutura, ritmo e qualidade visual. Esta aula mostra os 7 padrões que separam tutorial
        amador de tutorial profissional.
      </p>

      <Section title="Anatomia de um tutorial técnico de alta retenção" accent={ACCENT}>
        <LayerStack
          title="Estrutura validada de tutorial técnico (15-25 min)"
          accent={ACCENT}
          separatorLabel="próximo bloco →"
          layers={[
            { label: 'Hook (0:00-0:15)', content: 'Mostrar resultado final + promessa específica. Zero saudação longa', note: 'maior preditor de retention', tone: 'writable' },
            { label: 'Contexto (0:15-1:00)', content: 'Por que esse problema importa + pré-requisitos claros', tone: 'writable' },
            { label: 'Setup (1:00-3:00)', content: 'Instalações, configs, repositório base — pode acelerar 2x para condensar', tone: 'writable' },
            { label: 'Implementação principal (3:00-15:00)', content: 'Código passo a passo com explicações + erros comuns + por que cada decisão', tone: 'writable' },
            { label: 'Edge cases / armadilhas (15:00-20:00)', content: 'O que dá errado, debugging, alternativas', tone: 'writable' },
            { label: 'Recap + próximos passos (20:00-22:00)', content: 'O que aprendeu + onde aplicar + recursos extras', note: 'CTA para inscrição aqui, não no início', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Setup técnico de gravação para programação" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Configuração', 'Por que']}
          rows={[
            ['Resolução de tela', '1920×1080 ou 2560×1440', '4K é overkill — fica menor no preview'],
            ['Editor — fonte', 'JetBrains Mono ou Fira Code 18-22pt', 'Ligaduras + alto contraste + legível mobile'],
            ['Editor — tema', 'One Dark Pro / Tokyo Night / Dracula', 'Alto contraste + cores diferenciam tokens'],
            ['Terminal — tema', 'Igual editor (Tokyo Night Theme)', 'Consistência visual entre IDE e terminal'],
            ['Zoom durante gravação', '125-150% via Cmd/Ctrl + +', 'Mobile-friendly sem perder contexto'],
            ['Cursor highlight', 'Plugin Cursor Beam ou OBS Source', 'Espectador acompanha onde você clica'],
            ['Webcam', 'Canto inferior direito, 240×240px', 'Presença sem cobrir código'],
          ]}
        />
        <CodeBlock lang="json">{`// VS Code settings.json para gravação de tutoriais
{
  "editor.fontSize": 20,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "editor.fontLigatures": true,
  "editor.lineHeight": 1.6,
  "editor.cursorBlinking": "smooth",
  "editor.cursorWidth": 3,
  "editor.minimap.enabled": false,
  "editor.scrollbar.verticalScrollbarSize": 0,
  "workbench.colorTheme": "Tokyo Night",
  "workbench.statusBar.visible": false,
  "window.zoomLevel": 1,
  "terminal.integrated.fontSize": 18,
  "breadcrumbs.enabled": false
}`}</CodeBlock>
      </Section>

      <Section title="Ferramentas específicas para tutorial técnico" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Função', 'Preço']}
          rows={[
            ['OBS Studio', 'Gravação de tela + webcam', 'Grátis'],
            ['ScreenStudio (Mac)', 'Auto-zoom em cliques + transições', 'US$89 vitalício'],
            ['Carbon (carbon.now.sh)', 'Screenshots de código bonitas', 'Grátis'],
            ['Excalidraw', 'Diagramas hand-drawn para explicar conceitos', 'Grátis'],
            ['tldraw', 'Whiteboard infinito colaborativo', 'Grátis'],
            ['VS Code Live Share', 'Live coding com convidado', 'Grátis'],
            ['Codeium / Cursor', 'IDE com IA — corta digitação repetitiva', 'Grátis / US$20'],
            ['Asciinema', 'Gravar terminal como texto navegável', 'Grátis'],
          ]}
        />
        <DecisionBox
          scenario="Setup completo para tutoriais técnicos profissionais — orçamento R$2k"
          winner="OBS + Microfone HyperX SoloCast + Câmera C920 + Stream Deck Mini"
          winnerColor={ACCENT}
          why="OBS grátis com cenas pré-configuradas (full screen, webcam corner, slide). Microfone R$200, câmera R$400, Stream Deck Mini R$700 (atalhos para mute, cena, marker durante gravação). Total R$1.300, sobra para iluminação e suporte de notebook."
          alternatives={[
            { name: 'ScreenStudio + RØDE NT-USB Mini (Mac)', note: 'US$89 + R$500. Auto-zoom faz parecer edição manual. Para canais Mac' },
            { name: 'Premiere + Camtasia', note: 'Camtasia (~US$300) para edição rápida sem curva. Premiere para projetos sérios' },
          ]}
        />
      </Section>

      <Section title="Editando tutorial técnico para máxima retenção" accent={ACCENT}>
        <Callout tone="info">
          <strong>Regra dos 7 segundos:</strong> a cada 7 segundos algo deve mudar visualmente —
          zoom, corte, highlight, animação, troca de tela. Sem isso, o cérebro relaxa e o espectador
          abandona. Retention cai 50% após 30s sem mudança visual.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como aplicar', 'Impacto']}
          rows={[
            ['Cortar pausas longas', 'Auto Cut do CapCut ou Descript', '-30% duração, +retention'],
            ['Acelerar partes repetitivas', '2x em digitação longa, 4x em "esperando build"', 'Mantém ritmo'],
            ['Highlight em pontos críticos', 'Caixa amarela em volta do código importante', 'Foco visual + clareza'],
            ['Zoom em código pequeno', 'Zoom para 150% momentaneamente', 'Mobile readable'],
            ['Cortar erros que confundem', 'Manter só erros pedagogicamente úteis', 'Evita confusão'],
            ['B-roll de diagrama', 'Inserir Excalidraw enquanto explica conceito', 'Quebra monotonia visual'],
            ['Subtítulos sempre', 'Submagic ou auto-caption do CapCut', '+40% retention (silêncio + acessibilidade)'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Quanto tempo leva para gravar e editar 1 tutorial de 15min?"
          a={<>Para iniciantes: 6-10h totais (planejamento 1h + script 1h + gravação 2h + edição 4h). Profissionais experientes: 3-5h. A maior economia vem de: roteiro detalhado antes de gravar (evita refilmagens), atalhos do editor decorados, e uso de IA para legendas e cortes automáticos. Não invente conteúdo na hora — sempre tenha estrutura escrita. Isso reduz refilmagem em 70%.</>}
        />
        <QAItem
          q="Vale gravar com câmera ou só tela com voz?"
          a={<>Para tutoriais técnicos puros (programação): câmera é opcional. Pesquisa do YouTube mostra que tutoriais técnicos têm retention similar com ou sem câmera, desde que a voz seja clara e energética. Para conteúdo mais geral ou opinativo: câmera aumenta confiança e conexão em 25-40%. Recomendação: comece sem câmera para reduzir fricção. Adicione câmera quando ganhar confiança — webcam pequena no canto inferior direito (240px) já traz benefício sem ocupar tela.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Hook em 15s mostrando resultado final é o maior preditor de
        retention. Fonte 18-22pt no editor — mobile-friendly. Chapters no YouTube = SEO interno.
        OBS Studio gratuito + ScreenStudio (Mac) cobrem 99% dos tutoriais. A cada 7s algo deve mudar
        visualmente. Subtítulos sempre — Submagic é o padrão. Roteiro escrito antes de gravar reduz
        refilmagens em 70%. CTA para inscrição no FIM, nunca no início.
      </Callout>
    </div>
  );
}
