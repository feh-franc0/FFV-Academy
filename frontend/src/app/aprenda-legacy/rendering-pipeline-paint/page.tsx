import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  DecisionBox,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rendering-pipeline-paint');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Quais são as fases do rendering pipeline na ordem correta?',
    options: [
      'JS → Paint → Style → Layout → Composite',
      'Parse HTML/CSS → Style (recalc) → Layout (reflow) → Paint → Composite',
      'Style → JS → Layout → Composite → Paint',
      'Layout → Paint → Style → Composite',
    ],
    correct: 1,
    explanation:
      'Pipeline canônica (Chromium/Blink, similar em WebKit e Gecko): Parse HTML → DOM tree; Parse CSS → CSSOM; combinar em Render Tree; Style recalc; Layout (reflow) — calcula geometria; Paint — preenche pixels em layers; Composite — combina layers na GPU. Modificar uma fase invalida as seguintes. Ver web.dev/articles/rendering-performance e Chrome “The Anatomy of a Frame”.',
  },
  {
    question: 'Por que mudar `transform: translate()` é mais barato que mudar `top` em uma animação?',
    options: [
      'transform usa hardware acceleration por padrão; top força reflow do layout tree',
      'top é uma propriedade legacy do CSS 2.1',
      'transform tem syntax mais curta',
      'top só funciona em position absolute',
    ],
    correct: 0,
    explanation:
      '`top/left/width/height` mudam geometria → invalidam layout → invalidam paint → composite. Cada frame de animação custa pipeline inteira. `transform: translate()` e `opacity` (em layers compostas) podem ser aplicados diretamente pelo compositor na GPU, pulando layout E paint. Por isso são as duas propriedades “GPU-friendly”. Ver “High Performance Animations” em web.dev/articles/animations-guide.',
  },
  {
    question: 'O que é “layout thrashing” e como evitar?',
    options: [
      'Quando o navegador faz layout em paralelo em múltiplas threads',
      'Quando JS força sucessivos reads e writes que invalidam layout repetidamente em um mesmo frame, forçando o browser a recalcular layout múltiplas vezes (ex: read offsetWidth → write style → read offsetTop → write style). Solução: batch reads, depois writes',
      'Quando o CSS tem mais de 1000 seletores',
      'Quando o usuário redimensiona a janela',
    ],
    correct: 1,
    explanation:
      'Layout é “lazy” — invalidado por mudanças, computado quando lido. Se você lê offsetWidth (força layout sync), escreve algo (invalida), lê offsetTop (força layout DE NOVO), repete N vezes — explode de O(1) para O(N) layouts por frame. Solução: ler tudo primeiro (em batch), depois escrever tudo. Bibliotecas como fastdom automatizam. Paul Irish documentou em gist.github.com/paulirish/5d52fb081b3570c81e3a.',
  },
  {
    question: 'O que `will-change: transform` faz?',
    options: [
      'Pré-otimiza a transform para o próximo paint',
      'Dica ao browser para promover o elemento a uma compositor layer separada antecipadamente, evitando o custo de criar layer no momento da animação. Mas abuso causa memória excessiva e degradação',
      'Marca a transform como CSS variável',
      'Força recalc imediato de estilos',
    ],
    correct: 1,
    explanation:
      '`will-change` cria layer antes da animação começar, pulando o “first frame penalty” da criação. Útil para animações sob demanda (hover, click). Antipattern: aplicar a tudo — cada layer consome memória GPU e bandwidth de composição. Use só onde mediu benefício. Remover após animação terminar é boa prática.',
  },
  {
    question: 'O que é CSS Containment (`contain: layout paint`)?',
    options: [
      'Limita o tamanho máximo do elemento',
      'Diz ao browser: “mudanças dentro deste subtree NÃO afetam o resto da página” — permite skip layout/paint de áreas fora do container quando este muda. Crítico para listas longas e SPAs',
      'Aplica overflow: hidden automaticamente',
      'É deprecado em favor de overflow: clip',
    ],
    correct: 1,
    explanation:
      'CSS Containment (CSS Containment Module Level 1, W3C) é poderoso e subutilizado. `contain: layout` — mudanças de layout interno não afetam fora. `contain: paint` — pinta isolado, pode usar overflow clipping otimizado. `contain: size` — tamanho fixo, browser não precisa medir filhos. Para listas longas, `content-visibility: auto` (que implica containment) faz off-screen items virtualmente “não renderizarem”. Ver web.dev/articles/content-visibility.',
  },
  {
    question: 'Qual destas operações causa REFLOW (layout)?',
    options: [
      'Mudar opacity em elemento já promovido a layer',
      'Ler getBoundingClientRect() ou offsetWidth',
      'Mudar background-color (fora de layer GPU)',
      'Toggle de display: none',
    ],
    correct: 1,
    explanation:
      'Leituras de geometria (offsetWidth/Height/Top/Left, getBoundingClientRect, getComputedStyle, scrollTop) forçam layout sync se algo foi invalidado desde o último layout. Mudar opacity em layer GPU é só composite. Background-color é paint, não layout. display:none força layout uma vez ao remover (e ao readicionar). Lista completa: gist.github.com/paulirish/5d52fb081b3570c81e3a.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rendering-pipeline-paint"
      title="Rendering pipeline: parse → style → layout → paint → composite"
      icon="🎨"
      xp={75}
      readTime={15}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="web-workers-shared-memory"
      nextTitle="Web Workers + SharedArrayBuffer: paralelismo real"
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
        Pixel não aparece por mágica. Browser tem uma pipeline rigorosa: parse → style →
        layout → paint → composite. Cada fase invalida as seguintes. Entender essa pipeline é
        o que separa quem “acha que opacity é mais rápido” de quem sabe exatamente o porquê e
        usa <InlineCode>contain</InlineCode>, <InlineCode>will-change</InlineCode>,{' '}
        <InlineCode>content-visibility</InlineCode> com critério.
      </p>

      <Section title="As 5 fases do frame" accent={ACCENT}>
        <StackFlow
          title="Do bytecode HTML até pixel na tela"
          accent={ACCENT}
          items={[
            {
              icon: '📄',
              label: '1. Parse',
              sub: 'HTML → DOM, CSS → CSSOM',
              detail: 'HTML parser (state machine spec WHATWG) constrói DOM tree. CSS parser constrói CSSOM. Scripts <script> bloqueiam parser por padrão (use defer/async).',
              connector: 'merge',
            },
            {
              icon: '🎯',
              label: '2. Style',
              sub: 'Recalc / cascade',
              detail: 'Para cada elemento, casa seletores CSS, aplica cascade + inheritance + specificity. Resultado: ComputedStyle por elemento. Invalidado por classList.toggle, mudança de :hover etc.',
              connector: 'render tree',
            },
            {
              icon: '📐',
              label: '3. Layout (Reflow)',
              sub: 'Geometria absoluta',
              detail: 'Calcula posição/tamanho de cada box. Block formatting, flex, grid, abs. positioning. Recursivo: mudar width de um pai pode invalidar TUDO embaixo. Custoso.',
              connector: 'displaylist',
            },
            {
              icon: '🎨',
              label: '4. Paint',
              sub: 'Display lists por layer',
              detail: 'Gera comandos de pintura (fill rect, draw text, draw image) por compositor layer. Não desenha ainda — apenas grava o que desenhar.',
              connector: 'GPU upload',
            },
            {
              icon: '🚀',
              label: '5. Composite',
              sub: 'Layers → frame final',
              detail: 'GPU pega texturas de cada layer e compõe o frame final aplicando transforms, opacity, masks. Transform + opacity em layer dedicada = só composite, pulando paint.',
            },
          ]}
        />
        <Callout tone="info" icon="📚">
          Referência canônica: <InlineCode>web.dev/articles/rendering-performance</InlineCode>{' '}
          (Paul Lewis, Chrome DevRel). Para profundidade arquitetural do Blink/Chromium:
          “Life of a Pixel” — Steve Kobes, Chromium tech talks (procurar no YouTube).
        </Callout>
      </Section>

      <Section title="O que invalida cada fase" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Mudança', 'Style', 'Layout', 'Paint', 'Composite']}
          rows={[
            ['width / height / top / left', '✓', '✓', '✓', '✓'],
            ['margin / padding / border', '✓', '✓', '✓', '✓'],
            ['font-size / line-height', '✓', '✓', '✓', '✓'],
            ['color / background-color', '✓', '—', '✓', '✓'],
            ['box-shadow / border-radius', '✓', '—', '✓', '✓'],
            ['visibility: hidden ↔ visible', '✓', '—', '✓', '✓'],
            ['transform (em layer dedicada)', '—', '—', '—', '✓'],
            ['opacity (em layer dedicada)', '—', '—', '—', '✓'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Tabela completa: <InlineCode>csstriggers.com</InlineCode> (mantida por Stoyan
          Stefanov / Paul Irish). Mostra exatamente que fases cada propriedade dispara em
          Blink, Gecko, WebKit.
        </Callout>
      </Section>

      <Section title="Layout thrashing — a armadilha clássica" accent={ACCENT}>
        <CodeBlock lang="javascript" filename="thrashing.js">{`// ❌ THRASHING: layout recalculado em CADA iteração
function moveBoxes(boxes) {
  for (const box of boxes) {
    box.style.left = (box.offsetLeft + 10) + 'px';
    //                   ^ READ força layout (porque a linha anterior pode ter mudado algo)
    //   ^ WRITE invalida layout
  }
}
// Custo: O(n²) — n leituras forçando layout, n writes invalidando

// ✅ BATCH: ler tudo, depois escrever tudo
function moveBoxes(boxes) {
  // 1. Read phase
  const offsets = boxes.map(box => box.offsetLeft);
  // 2. Write phase (sem reads no meio)
  boxes.forEach((box, i) => {
    box.style.left = (offsets[i] + 10) + 'px';
  });
}
// Custo: O(1) layouts — um para todas as leituras, um para todas as writes

// ✅ FastDOM (lib) — automatiza com fila
fastdom.measure(() => {
  const w = element.offsetWidth;
  fastdom.mutate(() => {
    element.style.width = (w * 2) + 'px';
  });
});`}</CodeBlock>
        <Callout tone="tip" icon="🎯">
          Detecte thrashing no DevTools → Performance → Rendering. Marcas vermelhas “Forced
          reflow” na timeline mostram exatamente onde. Cada uma é uma oportunidade.
        </Callout>
      </Section>

      <Section title="Composite layers e GPU" accent={ACCENT}>
        <p>
          O browser promove certos elementos a layers separadas para que possam ser compostas
          na GPU sem repaint. Critérios típicos no Chromium:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'transform 3D', v: 'translate3d, translateZ, rotate3d — força layer' },
            { k: 'will-change', v: 'transform | opacity — promove proativamente' },
            { k: '<video>, <canvas>, WebGL', v: 'Sempre em layer própria' },
            { k: 'position: fixed/sticky', v: 'Frequentemente promovido' },
            { k: 'filter, backdrop-filter', v: 'Força layer (custo de paint na GPU)' },
            { k: 'opacity < 1 + animação', v: 'Promove quando detecta animação' },
          ]}
        />
        <DecisionBox
          scenario="Você vai animar um botão por 200ms ao hover"
          winner="transform: scale() + opacity, com will-change adicionado on hover"
          winnerColor={ACCENT}
          why="transform e opacity em layer GPU rodam só compositing — 0 layout, 0 paint. will-change criando layer antes do hover evita o spike no primeiro frame. Remover will-change após animação libera memória GPU."
          alternatives={[
            { name: 'width/height + margin', note: 'Cada frame: layout + paint + composite — pesado e janky' },
            { name: 'left/top', note: 'Mesma armadilha; preferir transform' },
            { name: 'box-shadow animation', note: 'Paint pesado; usar pseudo-element em layer separada' },
          ]}
        />
      </Section>

      <Section title="CSS Containment e content-visibility" accent={ACCENT}>
        <p>
          Containment é a arma secreta de listas longas e SPAs grandes. Ao declarar que um
          subtree é “contido”, browser pode pular fases inteiras.
        </p>
        <CodeBlock lang="css" filename="containment.css">{`/* Card é uma "ilha" — mudanças dentro NÃO afetam fora */
.card {
  contain: layout paint style;
}

/* Lista virtualmente infinita: items fora da viewport não rendem */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px;  /* dica de tamanho para layout */
}

/* Tabela enorme: cada row é contido */
tr {
  contain: layout paint;
}`}</CodeBlock>
        <FlowDiagram
          title="content-visibility: auto na prática"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '👁️', label: 'Off-screen', desc: 'Browser pula style/layout/paint do conteúdo' },
            { icon: '📏', label: 'Reserva espaço', desc: 'Usa contain-intrinsic-size como placeholder' },
            { icon: '📜', label: 'Scroll aproxima', desc: 'Quando entra ~viewport, materializa' },
            { icon: '🎨', label: 'Renderiza', desc: 'Style + layout + paint só agora' },
            { icon: '⚡', label: 'Resultado', desc: 'Listas de 10k itens carregam como se fossem 50' },
          ]}
        />
        <Callout tone="success" icon="✅">
          Caso real: Google Chrome blog reportou 7× speedup em initial render em página com
          muitas seções aplicando <InlineCode>content-visibility: auto</InlineCode>. Ver{' '}
          <InlineCode>web.dev/articles/content-visibility</InlineCode>.
        </Callout>
      </Section>

      <Section title="Métricas: LCP, CLS, INP" accent={ACCENT}>
        <p>
          Core Web Vitals medem três aspectos da pipeline:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'O que mede', 'Limite "bom"']}
          rows={[
            ['LCP (Largest Contentful Paint)', 'Tempo até o maior elemento de conteúdo aparecer (hero image, h1)', '≤ 2.5s'],
            ['CLS (Cumulative Layout Shift)', 'Quanto layout “salta” após primeira pintura (somatório de impact × distance)', '≤ 0.1'],
            ['INP (Interaction to Next Paint)', 'Maior latência interação → próximo paint (substituiu FID em 2024)', '≤ 200ms'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Reduzir LCP', v: 'Preload hero, fetchpriority="high", server-side render do hero, comprimir imagem' },
            { k: 'Reduzir CLS', v: 'Reservar width/height em imgs, evitar inject de banners, font-display: optional' },
            { k: 'Reduzir INP', v: 'Quebrar long tasks (scheduler.yield), mover CPU para Worker, debounce event handlers' },
          ]}
        />
      </Section>

      <Section title="Ferramentas de diagnóstico" accent={ACCENT}>
        <FlowDiagram
          title="Workflow de debug de rendering"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Performance tab', desc: 'Record interação, ver flame chart' },
            { icon: '2️⃣', label: 'Marcas vermelhas', desc: '“Forced reflow”, “Long task” — onde está o jank' },
            { icon: '3️⃣', label: 'Layers panel', desc: 'Ver quantos compositor layers e custo de memória' },
            { icon: '4️⃣', label: 'Rendering tab', desc: 'Paint flashing, Layer borders, FPS meter' },
            { icon: '5️⃣', label: 'Lighthouse / PSI', desc: 'CWV em lab + field data (CrUX)' },
            { icon: '6️⃣', label: 'web-vitals lib', desc: 'Coleta CWV reais em produção (RUM)' },
          ]}
        />
        <CodeBlock lang="javascript" filename="observe-web-vitals.js">{`// PerformanceObserver para LCP, CLS, INP (web-vitals lib usa isso)
import { onLCP, onCLS, onINP } from 'web-vitals';

onLCP((metric) => sendToAnalytics(metric));
onCLS((metric) => sendToAnalytics(metric));
onINP((metric) => sendToAnalytics(metric));

// Long tasks raw
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task:', entry.name, entry.duration, 'ms');
    }
  }
}).observe({ entryTypes: ['longtask'] });`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="`display: none` é grátis?"
          a={
            <span>
              Não. Toggle entre none/block invalida layout (elemento entra/sai da render tree).
              Em comparação, <InlineCode>visibility: hidden</InlineCode> mantém o elemento no
              layout (espaço reservado) — mais barato para esconder/mostrar repetidamente.
            </span>
          }
        />
        <QAItem
          q="CSS Grid é mais lento que Flexbox?"
          a={
            <span>
              Marginalmente, em layouts complexos — Grid resolve em duas passadas (track sizing
              algorithm). Para 99% dos casos, indistinguível. Não escolha layout por
              microperformance.
            </span>
          }
        />
        <QAItem
          q="`@media (prefers-reduced-motion)` ajuda no rendering?"
          a={
            <span>
              Indiretamente. Usuários que ativam reduce motion (acessibilidade) recebem menos
              animações — menos work de paint/composite. Mais importante: é a coisa certa a
              fazer.
            </span>
          }
        />
        <QAItem
          q="`pointer-events: none` afeta paint?"
          a={
            <span>
              Não diretamente — só desabilita hit-testing. Útil para overlays não-interativos.
              Não promove a layer nem afeta pipeline visual.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: para realmente paralelizar trabalho CPU-bound sem travar o pipeline, Web
        Workers + SharedArrayBuffer. Veja <InlineCode>web-workers-shared-memory</InlineCode>.
      </Callout>
    </div>
  );
}
