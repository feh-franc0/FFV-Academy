import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, Timeline, DecisionBox, StackFlow, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('scroll-driven-animations');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Diferença fundamental entre scroll() e view() timelines?',
    options: [
      'São iguais',
      'scroll() vincula a animação ao SCROLL de um container (root ou nomeado) — independente do elemento animado. view() vincula a animação à VISIBILIDADE do próprio elemento dentro do viewport (entry/exit). scroll() = parallax/progress global; view() = reveal por elemento',
      'scroll() é descontinuado',
      'view() é só Safari',
    ],
    correct: 1,
    explanation: 'scroll(root) ou scroll(nearest block): progresso da timeline = posição absoluta de scroll do scroller. Útil para progress bars globais. view(): progresso = quanto do ELEMENTO está visível (0% antes de entrar, 100% após sair). Cada elemento tem sua própria view timeline — ideal para reveal cascateado, fade no in/out por card.',
  },
  {
    question: 'O que animation-range controla?',
    options: [
      'Volume de som',
      'Define em que faixa do scroll/view timeline a animação roda. animation-range: entry 0% cover 50% = anima desde o início da entrada até 50% coberto. Sintaxe: <name> <length-percentage>, onde name pode ser entry, exit, contain, cover, entry-crossing, exit-crossing',
      'Cor da animação',
      'Apenas em SVG',
    ],
    correct: 1,
    explanation: 'animation-range é a precisão fina das scroll-driven. Phases: entry (elemento entrando, 0% começou-a-entrar, 100% totalmente dentro), exit (saindo, 0% começa, 100% saiu), contain (elemento totalmente dentro), cover (totalmente dentro OU cobrindo o viewport). entry 0% entry 100% = animação roda só durante a fase de entrada.',
  },
  {
    question: 'Por que MotionValue (Motion) ainda é útil se CSS scroll-timeline existe?',
    options: [
      'É legacy',
      'CSS scroll-timeline cobre 80% dos casos comuns (parallax, progress, reveal) com zero JS — onde suportado. Motion/JS é necessário para: lógica condicional baseada em scroll, callbacks em pontos específicos, sincronização com áudio/canvas/WebGL, e fallback em browsers sem suporte (Safari atrasado, Firefox em flag)',
      'CSS é mais lento',
      'JS é proibido',
    ],
    correct: 1,
    explanation: 'CSS scroll-timeline é declarativo, zero JS, ótima performance — mas é "fire-and-forget": rola e pronto. Para callbacks (touch trigger em 50%, dispatch evento, sync com áudio), comparar com outro estado, ou animar fora da timeline de scroll, JS continua necessário. Bramus polyfill (scroll-timeline.js) cobre suporte, mas é JS.',
  },
  {
    question: 'O que scroll-timeline-name e view-timeline-name permitem?',
    options: [
      'Apenas semântica',
      'Criar timelines NOMEADAS que outros elementos podem referenciar via animation-timeline: <name>. Permite separar o scroller (que define a timeline) do elemento animado (que consome a timeline) — patterns como "sidebar fixa que mostra progresso de leitura do article main"',
      'Só para CSS-in-JS',
      'Deprecado',
    ],
    correct: 1,
    explanation: 'Por default animation-timeline: scroll() pega o scroller mais próximo do elemento animado. Mas se quero animar um elemento (ex: progress bar fixa) baseado no scroll de OUTRO container (ex: article main), uso: .article { scroll-timeline-name: --reading; } .progress { animation-timeline: --reading; }. Mesmo princípio com view-timeline-name para view timelines.',
  },
  {
    question: 'Quando o polyfill scroll-timeline.js é estritamente necessário?',
    options: [
      'Nunca',
      'Quando target inclui Safari ≤17 ou Firefox sem flag — onde scroll-timeline CSS não roda nativamente. O polyfill (Bramus, Google) usa IntersectionObserver e RAF para simular, com API quase idêntica. Custo: ~10kb JS + execução RAF; benefício: cross-browser hoje',
      'Sempre',
      'Apenas em mobile',
    ],
    correct: 1,
    explanation: 'Bramus van Damme mantém scroll-timeline.js que polyfilla scroll() e view() via IntersectionObserver + scroll listener + RAF. Adiciona ~10kb mas garante funcionamento em Safari/Firefox até suporte nativo chegar. Estratégia: feature-detect (CSS.supports("animation-timeline: scroll()")) e carregar dinamicamente apenas se necessário.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="scroll-driven-animations"
      title="Scroll-driven animations: ScrollTimeline puro CSS"
      icon="📜"
      xp={60}
      readTime={12}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="flip-technique"
      nextTitle="FLIP technique: animar layout impossível com performance"
      quiz={quiz}
    >
      <Section title="O que são scroll-driven animations" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Animação tradicional é dirigida pelo <strong>tempo</strong>: começa em t=0 e progride conforme o
          relógio. Scroll-driven animation troca o relógio pela posição de scroll — a animação <em>é</em> o
          scroll. Resultado: efeitos buttery, scrubbing nativo, sem JS RAF.
        </p>
        <Timeline
          accent={accent}
          title="Como chegamos aqui"
          events={[
            { when: '2015', label: 'Paul Lewis populariza scroll-jacking com JS', detail: 'GSAP ScrollMagic, AOS, custom RAF loops' },
            { when: '2019', label: 'IntersectionObserver — performante mas limitado', detail: 'Bom para "entrou na viewport"; ruim para progresso contínuo' },
            { when: '2022', label: 'CSS Scroll-Linked Animations Module Level 1 (spec)', detail: 'Proposta inicial: scroll-timeline, view-timeline' },
            { when: '2023', label: 'Chrome 115 baseline', highlight: true, detail: 'animation-timeline: scroll() | view() ship em Chromium' },
            { when: '2024', label: 'Safari 17.4 (parcial), Firefox em flag', detail: 'Cross-browser progride lentamente' },
            { when: '2026', label: 'Suporte amplo + Bramus polyfill maduro', detail: 'Adoção mainstream — 80% dos casos de GSAP ScrollTrigger viáveis em CSS' },
          ]}
        />
      </Section>

      <Section title="scroll() — animação ligada ao scroll do container" accent={accent}>
        <CodeBlock lang="css" filename="scroll-timeline.css">{`/* Progress bar global (mais simples possível) */
@keyframes growProgress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.scroll-progress {
  position: fixed;
  inset: 0 0 auto 0;
  height: 4px;
  background: oklch(70% 0.22 320);
  transform-origin: left;

  animation: growProgress linear;
  animation-timeline: scroll(root block);
  /* root = elemento root (html). block = eixo vertical (em writing-mode: horizontal-tb). */
}

/* Parallax — elemento se move conforme scroll do container ancestral */
@keyframes parallax {
  to { transform: translateY(-200px); }
}
.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll();
  animation-range: 0 100%;   /* roda durante TODO o scroll */
}

/* Sintaxe completa */
/* scroll([root|nearest|self], [block|inline|x|y]) */`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'scroll(root)', v: 'Scroll do elemento root (html) — mais comum, para timelines globais' },
            { k: 'scroll(nearest)', v: 'Scroll do ancestral scrollable mais próximo (default)' },
            { k: 'scroll(self)', v: 'Scroll do PRÓPRIO elemento (caso ele seja scrollable)' },
            { k: 'block / inline', v: 'Eixo da timeline em writing-mode: block=vertical em horizontal-tb' },
            { k: 'x / y', v: 'Eixos físicos (sem respeitar writing-mode)' },
          ]}
        />
      </Section>

      <Section title="view() — animação ligada à visibilidade do elemento" accent={accent}>
        <CodeBlock lang="css" filename="view-timeline.css">{`/* Reveal: cada card fade-in conforme entra na viewport */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeUp linear both;
  animation-timeline: view();          /* timeline própria do elemento */
  animation-range: entry 0% entry 100%;
  /* entry 0% = top do elemento na bottom edge do viewport
     entry 100% = elemento totalmente dentro */
}

/* Scrub completo durante entrada E saída */
.parallax-card {
  animation: fadeUp linear both;
  animation-timeline: view();
  animation-range: cover 0% cover 100%;
  /* cover = elemento qualquer parte visível, antes ou depois */
}

/* Animação separada de entrada e saída */
.advanced {
  animation:
    slideIn linear forwards,
    fadeOut linear forwards;
  animation-timeline: view(), view();
  animation-range: entry 0% entry 100%, exit 0% exit 100%;
}`}</CodeBlock>
        <FlowDiagram
          accent={accent}
          title="Fases da view() timeline"
          orientation="vertical"
          steps={[
            { icon: 'entry', label: 'Entrada (0–100%)', desc: 'Do primeiro pixel visível até totalmente dentro' },
            { icon: 'contain', label: 'Contido (0–100%)', desc: 'Elemento totalmente dentro do viewport' },
            { icon: 'exit', label: 'Saída (0–100%)', desc: 'Do início da saída até totalmente fora' },
            { icon: 'cover', label: 'Cover (alias)', desc: 'Toda a duração entre primeiro e último pixel visível' },
          ]}
        />
        <Callout tone="info" icon="🎯">
          <strong>view()</strong> é o que substitui IntersectionObserver para reveal-on-scroll na grande
          maioria dos casos. Mais performante (não dispara callbacks), declarativo, e dá progressão contínua
          em vez de "entrou/saiu" binário.
        </Callout>
      </Section>

      <Section title="Named timelines — desacoplando scroller e animado" accent={accent}>
        <CodeBlock lang="css" filename="named-timelines.css">{`/* Caso: progress bar FIXA mostra progresso de leitura do <article> */

/* O scroller declara a timeline */
.article-content {
  scroll-timeline-name: --reading;
  scroll-timeline-axis: block;
  /* não precisa ser overflow auto — pode ser o próprio html scroll */
}

/* O elemento consome */
.reading-progress {
  position: fixed;
  inset: 0 0 auto 0;
  height: 3px;
  animation: growProgress linear;
  animation-timeline: --reading;   /* nome customizado */
}

/* View timelines nomeadas (mais raras) */
.hero {
  view-timeline-name: --hero;
}
.sticky-nav {
  animation: shrinkNav linear both;
  animation-timeline: --hero;
  animation-range: exit 0% exit 100%;
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'scroll-timeline-name: --foo', v: 'Cria timeline nomeada baseada no scroll deste elemento' },
            { k: 'scroll-timeline-axis', v: 'block (default) | inline | x | y' },
            { k: 'view-timeline-name: --bar', v: 'Cria view timeline nomeada baseada na visibilidade deste elemento' },
            { k: 'view-timeline-inset', v: 'Padding virtual que muda quando o "entry" começa (negative = depois)' },
            { k: 'animation-timeline: --foo', v: 'Referencia timeline nomeada por --foo' },
          ]}
        />
      </Section>

      <Section title="Patterns comuns" accent={accent}>
        <NodeGraph
          accent={accent}
          title="O que dá pra fazer com puro CSS"
          columns={[
            {
              label: 'Parallax',
              nodes: [
                { icon: '🏞️', label: 'BG move oposto ao scroll', sub: 'translateY com timeline scroll()', tone: 'success' },
                { icon: '🎴', label: 'Cards em camadas (depth)', sub: 'translateZ + perspective + scroll()', tone: 'success' },
              ],
            },
            {
              label: 'Reveals',
              nodes: [
                { icon: '👁️', label: 'Fade up por elemento', sub: 'view() + entry 0%–100%', tone: 'success' },
                { icon: '🎢', label: 'Stagger sequencial', sub: 'animation-delay calculado via :nth-child + scroll()' },
                { icon: '✨', label: 'Reveal direcional', sub: 'view() + translateX/Y baseado em índice' },
              ],
            },
            {
              label: 'Progress',
              nodes: [
                { icon: '📊', label: 'Reading progress bar', sub: 'named scroll-timeline' },
                { icon: '🍩', label: 'Donut progress circular', sub: 'stroke-dashoffset + scroll()' },
                { icon: '🎯', label: 'TOC active item', sub: 'view() em sections + sibling selectors' },
              ],
            },
            {
              label: 'Effects',
              nodes: [
                { icon: '🌫️', label: 'Blur ao sair da viewport', sub: 'filter: blur() + view() exit', tone: 'emphasis' },
                { icon: '📐', label: 'Sticky header shrink', sub: 'animation com view-timeline-name' },
                { icon: '🎨', label: 'Color shift por scroll', sub: 'background-color + scroll() range' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Sintaxe completa de animation-range" accent={accent}>
        <CodeBlock lang="css" filename="range-examples.css">{`/* Sintaxe: animation-range: <start> <end> */

/* Roda durante toda a fase de entrada */
animation-range: entry 0% entry 100%;
/* equivalente atalhado: */
animation-range: entry;

/* Roda começando 200px antes do elemento entrar até totalmente dentro */
animation-range: entry -200px entry 100%;

/* Roda só durante 50%-100% da entrada (segunda metade) */
animation-range: entry 50% entry 100%;

/* Roda durante entrada E enquanto totalmente dentro (sem exit) */
animation-range: entry 0% contain 100%;

/* Cobertura total (entry + contain + exit) */
animation-range: cover 0% cover 100%;
/* atalho: */
animation-range: cover;`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Phase', 'Significado', 'Quando usar']}
          rows={[
            ['entry', 'Elemento entrando — top toca bottom do viewport até elemento todo dentro', 'Reveals on scroll, fade-in'],
            ['exit', 'Elemento saindo — bottom toca top do viewport até totalmente fora', 'Fade-out, blur quando sai'],
            ['contain', 'Elemento totalmente dentro do viewport', 'Animar enquanto está na tela'],
            ['cover', 'Atalho: do primeiro pixel visível ao último — entry+contain+exit', 'Parallax completo durante toda visibilidade'],
            ['entry-crossing', 'Apenas o cruzamento de entrada (50% do entry)', 'Trigger pontual em meio à entrada'],
            ['exit-crossing', 'Apenas o cruzamento de saída', 'Trigger pontual quando começa a sair'],
          ]}
        />
      </Section>

      <Section title="Suporte e estratégia de fallback" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Browser', 'Status', 'Notas']}
          rows={[
            ['Chrome / Edge', '✅ 115+ baseline', 'Suporte completo: scroll(), view(), named timelines'],
            ['Safari', '🟡 17.4+', 'Parcial — view() ok, scroll() em evolução'],
            ['Firefox', '🟡 em flag', 'layout.css.scroll-driven-animations.enabled — ainda não default'],
            ['Polyfill (Bramus)', '✅ scroll-timeline.js', '~10kb; cobre Safari/Firefox antigos'],
          ]}
        />
        <CodeBlock lang="js" filename="conditional-polyfill.js">{`// Feature detect e carregar polyfill só se necessário
if (!CSS.supports('animation-timeline: scroll()')) {
  await import('https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js');
}

// Ou via @supports CSS — graceful degradation
// .reveal {
//   opacity: 1;  /* fallback: sem animação, mostra direto */
// }
// @supports (animation-timeline: view()) {
//   .reveal {
//     animation: fadeUp linear both;
//     animation-timeline: view();
//   }
// }`}</CodeBlock>
      </Section>

      <Section title="Quando usar CSS vs Motion/GSAP" accent={accent}>
        <DecisionBox
          scenario="Reveal-on-scroll simples (fade + translate em cards)"
          winner="CSS view-timeline"
          winnerColor={accent}
          why="Zero JS, perfeitamente performático, declarativo. Suporte com polyfill cobre browsers em transição."
          alternatives={[
            { name: 'Motion whileInView', when: 'Se precisa lógica condicional ou callback ao revelar' },
            { name: 'GSAP ScrollTrigger', when: 'Se a animação faz parte de timeline complexa coreografada com outros elementos' },
          ]}
        />
        <DecisionBox
          scenario="Scroll-jacking com pin + cenário multi-step"
          winner="GSAP ScrollTrigger"
          winnerColor={accent}
          why="pinning, scrub com smoothing, callbacks, anticipatePin, snap — features CSS scroll-timeline ainda não cobre completamente."
          alternatives={[
            { name: 'CSS sticky + scroll-timeline', when: 'Casos simples sem pin programático' },
          ]}
        />
        <StackFlow
          accent={accent}
          title="Decisão por feature"
          items={[
            { icon: '📊', label: 'Progress bar fixa', detail: 'CSS scroll() — 5 linhas, perfeito' },
            { icon: '👁️', label: 'Reveal cards', detail: 'CSS view() + entry — substitui IntersectionObserver' },
            { icon: '🏞️', label: 'Parallax background', detail: 'CSS scroll() — ou Motion useScroll/useTransform para controle JS' },
            { icon: '🎬', label: 'Pin + scrub complexo', detail: 'GSAP ScrollTrigger (até CSS evoluir mais)' },
            { icon: '🎨', label: 'Color/blur shift gradual', detail: 'CSS view() + animation-range' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Recursos:</strong> scroll-driven-animations.style (Bramus playground com 30+ demos),
        developer.chrome.com/articles/scroll-driven-animations (Adam Argyle), Una Kravets posts.
      </Callout>
    </ModuleLayout>
  );
}
