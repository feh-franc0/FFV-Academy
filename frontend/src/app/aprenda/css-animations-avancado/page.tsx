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
  Timeline,
  DecisionBox,
  StackFlow,
  FlowDiagram,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('css-animations-avancado');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que @starting-style resolve em CSS moderno?',
    options: [
      'Define cores iniciais',
      'Permite animar elementos que estão entrando no DOM (ou mudando de display:none para block) — define o estado from que a transição usa como ponto de partida. Antes era impossível animar entrada sem JS',
      'É só um seletor',
      'Substitui @keyframes',
    ],
    correct: 1,
    explanation: '@starting-style {} é a peça que faltava: dialog[open], elementos com display:none → block, popover — todos passam de "não existe no layout" para "renderizado", e o navegador antes pulava qualquer transição. Com @starting-style você declara "valor de partida quando o elemento aparece", e transition rola. Baseline Chrome/Edge 117+, Safari 17.4+, Firefox 129+.',
  },
  {
    question: 'O que allow-discrete habilita em transition?',
    options: [
      'Permite cores discretas',
      'Permite transicionar propriedades que normalmente não animam (discrete) — principalmente display: none ↔ block. transition-behavior: allow-discrete + @starting-style permite popovers, modals, tooltips entrarem/saírem com animação CSS pura, sem JS para gerenciar mounting',
      'Acelera animação',
      'Compila CSS',
    ],
    correct: 1,
    explanation: 'Propriedades discrete (display, visibility, content-visibility) historicamente "saltam" sem transição. Com transition-behavior: allow-discrete (ou shorthand transition: all 0.3s allow-discrete), o navegador segura o estado anterior durante a duração antes de aplicar o discrete final. Combinado com @starting-style, modais ficam 100% declarativos: o popover entra/sai com fade animado sem uma linha de JS.',
  },
  {
    question: 'Diferença entre animation-composition: replace, add, accumulate?',
    options: [
      'São aliases',
      'Quando múltiplas animações afetam a mesma propriedade: replace (default) — última vence; add — soma os efeitos (translateX 10px + translateX 20px = 30px); accumulate — acumula com semântica per-property (rotações somam graus, transforms compõem matriz). Crucial para layered animations',
      'Apenas replace funciona',
      'É CSS antigo',
    ],
    correct: 1,
    explanation: 'animation-composition (CSS Animations Level 2): quando element tem 2+ animations tocando a mesma prop. replace = última declarada sobrescreve as anteriores no frame. add = combina via interpolação somada. accumulate = combina semanticamente (matriz de transforms, soma de blur). Use para construir efeitos complexos compondo animações pequenas em vez de keyframes gigantes.',
  },
  {
    question: 'O que @scroll-timeline e @view-timeline fazem?',
    options: [
      'Nada útil',
      'Definem timelines não baseadas no relógio: scroll() acompanha posição de scroll do container; view() acompanha visibilidade do elemento no viewport (0% = entrando, 100% = saindo). animation-timeline: scroll() liga uma @keyframes a essa timeline → animation scroll-driven 100% CSS, zero JS',
      'É só polyfill',
      'Substituem ScrollTrigger sempre',
    ],
    correct: 1,
    explanation: 'Scroll-driven animations CSS-only: animation-timeline: scroll(root block) faz @keyframes progredir conforme scroll do root. animation-timeline: view() progride conforme o ELEMENTO entra/sai do viewport (perfeito para reveal). Suporte: Chrome/Edge 115+, Safari atrás, Firefox flag. Polyfill: Bramus scroll-timeline.js. Onde funciona, mata 80% dos casos de GSAP/Motion scroll.',
  },
  {
    question: 'Por que animation-fill-mode importa?',
    options: [
      'Define a cor de fundo',
      'Controla quais valores o elemento mantém antes/depois da animação: none (volta ao CSS original), forwards (mantém último keyframe), backwards (aplica primeiro keyframe durante o delay inicial), both (combina). Esquecer forwards é a causa #1 de "minha animação volta sozinha"',
      'É depreciado',
      'Só funciona com Safari',
    ],
    correct: 1,
    explanation: 'animation-fill-mode: forwards é critico — sem ele, ao terminar a animação o elemento volta ao estado declarado fora do @keyframes. Para reveal-and-stay: forwards. Para entrada com delay e estado from preservado durante o delay: backwards. both = forwards + backwards. Não confundir com transition (que sempre "mantém" o estado final pois você mudou a prop diretamente).',
  },
  {
    question: 'Quando usar transition vs animation?',
    options: [
      'Sempre animation',
      'transition: anima de um valor para outro disparado por mudança de estado (hover, classe, atributo). É 1 disparo, do estado A para o B. animation + @keyframes: timeline declarativa multi-step, controle de iteração, fill-mode, pause/play via animation-play-state. Use transition para microinterações, animation para sequências',
      'Eles são iguais',
      'Sempre transition',
    ],
    correct: 1,
    explanation: 'transition: declara "se essa prop mudar, anime durante X tempo com Y ease" — simples, perfeito para hover, focus, toggle classes. animation + @keyframes: descreve a timeline inteira com vários frames, repeat, alternate, delay, fill-mode. Regra: 1 estado A→B = transition. Sequência multi-frame ou loop = animation. Em performance são equivalentes (ambos compositor).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="css-animations-avancado"
      title="CSS animations avançado: @keyframes, @scroll-timeline"
      icon="🎨"
      xp={60}
      readTime={12}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="view-transitions-api-pratica"
      nextTitle="View Transitions API na prática: rotas e state"
      quiz={quiz}
    >
      <Section title="CSS Animations cresceu — e muita gente não percebeu" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Por anos, CSS animations foi sinônimo de &quot;hover, keyframes e pronto&quot;. Em 2024–2025 a
          plataforma ganhou recursos que substituem JavaScript em casos inteiros: <strong>@starting-style</strong>,
          <strong> transition-behavior: allow-discrete</strong>, <strong>animation-composition</strong>, <strong>@scroll-timeline</strong>{' '}
          e <strong>@view-timeline</strong>. Quando você puder usar, use — é a opção mais leve e acessível.
        </p>
        <Timeline
          accent={accent}
          title="Marcos recentes do CSS Animations"
          events={[
            { when: '2009', label: 'animation + @keyframes (WebKit)', detail: 'Padrão básico, ainda hoje a base' },
            { when: '2018', label: 'will-change estabilizado', detail: 'Hint para o navegador criar GPU layer antecipadamente' },
            { when: '2023', label: 'animation-composition + Level 2', detail: 'replace/add/accumulate para compor múltiplas animations' },
            { when: '2024', label: '@starting-style + allow-discrete', highlight: true, detail: 'Animações de entrada/saída sem JS — popover, dialog' },
            { when: '2024', label: '@scroll-timeline + @view-timeline', highlight: true, detail: 'Scroll-driven 100% CSS (Chrome/Edge baseline)' },
            { when: '2025+', label: 'Anchor positioning + Container queries v2', detail: 'CSS ganha territórios que antes exigiam JS' },
          ]}
        />
      </Section>

      <Section title="Fundamentos firmes: transition vs animation" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'transition', 'animation + @keyframes']}
          rows={[
            ['Trigger', 'Mudança de valor (hover, classe, atributo)', 'Aplicação da regra (load, classe)'],
            ['Steps', 'A → B (linear ou eased)', 'Multi-step (0%, 30%, 100%)'],
            ['Iteração', '1 vez', 'animation-iteration-count: N | infinite'],
            ['Pause/play', 'Não controlável', 'animation-play-state: paused | running'],
            ['Estado final', 'Mantido (prop mudou)', 'Precisa animation-fill-mode: forwards'],
            ['Caso típico', 'Hover, focus, toggle de classe', 'Loop infinito, sequência multi-frame, loaders'],
          ]}
        />
        <CodeBlock lang="css" filename="basico.css">{`/* transition: simples e poderoso */
.button {
  background: oklch(60% 0.2 280);
  transform: scale(1);
  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1),
              background 150ms ease-out;
}
.button:hover { transform: scale(1.05); background: oklch(65% 0.22 280); }
.button:active { transform: scale(0.95); }

/* animation: multi-step, loops, controle fino */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.1); opacity: 1; }
}
.live-indicator {
  animation: pulse 1.6s ease-in-out infinite;
  animation-play-state: running;          /* pode virar 'paused' por JS/CSS */
  animation-fill-mode: both;
}`}</CodeBlock>
      </Section>

      <Section title="@starting-style + allow-discrete — entrada/saída sem JS" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          O combo mais importante da plataforma em 2024. Substitui frameworks inteiros para
          mount/unmount animado.
        </p>
        <CodeBlock lang="css" filename="popover.css">{`/* Popover nativo entrando e saindo com animação CSS pura */
[popover] {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
  transition:
    opacity 200ms,
    transform 200ms,
    display 200ms allow-discrete,     /* permite transicionar display */
    overlay 200ms allow-discrete;     /* fica no top-layer durante a animação */
}

[popover]:popover-open {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Estado inicial NO MOMENTO em que o popover aparece */
@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
}`}</CodeBlock>
        <FlowDiagram
          accent={accent}
          title="Por que precisa de @starting-style?"
          steps={[
            { icon: '1', label: 'display:none', desc: 'elemento não existe no layout' },
            { icon: '2', label: 'JS abre popover', desc: 'display vira block' },
            { icon: '3', label: 'Sem @starting-style', desc: 'browser pinta valor final, sem transição' },
            { icon: '4', label: 'Com @starting-style', desc: 'browser usa esse valor como FROM da transição' },
          ]}
        />
        <Callout tone="info" icon="💡">
          <strong>allow-discrete</strong> é a chave que permite transicionar propriedades que normalmente saltam
          (display, visibility, content-visibility, overlay). Sem ela, mesmo com @starting-style o elemento
          desapareceria instantaneamente no fade out.
        </Callout>
      </Section>

      <Section title="@scroll-timeline e @view-timeline — scroll-driven 100% CSS" accent={accent}>
        <CodeBlock lang="css" filename="scroll-driven.css">{`/* 1) Progress bar do scroll global */
@keyframes scaleProgress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.scroll-progress {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: oklch(70% 0.2 320);
  transform-origin: left;
  animation: scaleProgress linear;
  animation-timeline: scroll(root block);   /* timeline = scroll do root */
}

/* 2) Reveal por elemento (view timeline) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal {
  animation: fadeUp linear both;
  animation-timeline: view();               /* timeline = visibilidade do elemento */
  animation-range: entry 0% cover 30%;      /* roda enquanto entra até 30% coberto */
}

/* 3) Named timeline — referenciar timeline em outro lugar */
.scroller {
  scroll-timeline-name: --main-scroll;
  scroll-timeline-axis: block;
  overflow-y: scroll;
}

.parallax-img {
  animation: parallaxMove linear;
  animation-timeline: --main-scroll;
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'scroll(root block)', v: 'Timeline = posição de scroll do root (ou ancestral nomeado) no eixo block' },
            { k: 'view()', v: 'Timeline = quanto o ELEMENTO está visível no viewport (0%=entrando, 100%=saindo)' },
            { k: 'animation-range', v: '"entry", "exit", "cover", "contain" — controla em que faixa a animação ocorre' },
            { k: 'scroll-timeline-name', v: 'Cria timeline nomeada para reaproveitar em vários elementos' },
            { k: 'view-timeline-name', v: 'Cria view timeline nomeada para um elemento específico (referenciada por outro)' },
          ]}
        />
        <Callout tone="warn" icon="🧪">
          <strong>Suporte (2026):</strong> Chrome/Edge 115+ baseline, Safari 17.4+ (parcial), Firefox atrás
          (flag layout.css.scroll-driven-animations.enabled). Em projetos com Safari mobile crítico, use o
          polyfill <InlineCode>scroll-timeline.js</InlineCode> do Bramus (Adam Argyle/Google).
        </Callout>
      </Section>

      <Section title="animation-composition — compor múltiplas animations" accent={accent}>
        <CodeBlock lang="css" filename="composition.css">{`@keyframes drift {
  to { translate: 100px 0; }
}
@keyframes bob {
  50% { translate: 0 -20px; }
}

.particle {
  /* duas animations afetam translate ao mesmo tempo */
  animation:
    drift 4s linear infinite,
    bob 1s ease-in-out infinite;
  animation-composition: add;    /* soma efeitos em vez de "última vence" */
}`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Modo', 'Comportamento', 'Quando usar']}
          rows={[
            ['replace (default)', 'Última animation vence — anteriores ignoradas no frame', 'Comportamento legado, raramente o que você quer ao compor'],
            ['add', 'Soma efeitos: translate 10px + translate 20px = translate 30px', 'Drift + bob, parallax + sway, qualquer composição linear'],
            ['accumulate', 'Combina semanticamente (rotações em graus, transforms compostos)', 'Rotação cumulativa, transforms 3D complexos'],
          ]}
        />
      </Section>

      <Section title="Easing moderno — cubic-bezier, linear() e spring" accent={accent}>
        <CodeBlock lang="css" filename="easing.css">{`/* Cubic-bezier custom (Material 3 emphasized) */
.menu {
  transition: transform 400ms cubic-bezier(0.05, 0.7, 0.1, 1);
}

/* linear() — easing CUSTOM (não confundir com 'linear')
   Aproxima qualquer curva via interpolação linear entre N pontos.
   Permite spring, bounce, elástico em CSS puro. */
.bounce {
  transition: transform 600ms
    linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.563 7.9%, 1 9.7%, 0.948, 0.916,
           0.908 13.7%, 0.991 17.8%, 1 19.4%, 0.985, 0.987 25.2%, 1 27.6%,
           0.998, 0.997 38.3%, 1 50%, 1);
  /* easings.net / linear-easing-generator.netlify.app gera essas listas */
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'cubic-bezier(x1,y1,x2,y2)', v: 'Curva por 2 pontos de controle — cubic-bezier.com para visualizar' },
            { k: 'steps(N, jump-start|end|none|both)', v: 'Escada de N passos — sprite animation, typing effect' },
            { k: 'linear(0, 0.1 10%, 1)', v: 'Curva arbitrária por waypoints — gera spring/bounce sem JS' },
            { k: 'ease, ease-in, ease-out, ease-in-out', v: 'Atalhos clássicos — bom para microinterações simples' },
          ]}
        />
      </Section>

      <Section title="Padrões prontos — reaproveite" accent={accent}>
        <CodeBlock lang="css" filename="padroes.css">{`/* Skeleton shimmer */
@keyframes shimmer {
  to { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    oklch(85% 0 0) 25%, oklch(92% 0 0) 50%, oklch(85% 0 0) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}

/* Live dot (status online) */
@keyframes liveDot {
  0%, 100% { box-shadow: 0 0 0 0 oklch(70% 0.2 145 / 0.7); }
  50%      { box-shadow: 0 0 0 8px oklch(70% 0.2 145 / 0); }
}
.live { animation: liveDot 1.6s ease-out infinite; }

/* Typewriter */
@keyframes typing { from { width: 0 } to { width: 100% } }
@keyframes caret { 50% { border-color: transparent } }
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid currentColor;
  animation: typing 2s steps(28, end), caret 0.7s step-end infinite;
}`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar CSS animations" accent={accent}>
        <DecisionBox
          scenario="Animação simples disparada por mudança de estado"
          winner="CSS transition/animation"
          winnerColor={accent}
          why="Zero JS, GPU compositor, respeita prefers-reduced-motion via @media nativo, melhor performance possível."
          alternatives={[
            { name: 'Motion/GSAP', when: 'Apenas se precisar callbacks complexos, FLIP, ou orquestração multi-elemento dependente de estado JS' },
          ]}
        />
        <StackFlow
          accent={accent}
          title="Limites do CSS — quando JS é necessário"
          items={[
            { icon: '🔄', label: 'FLIP de mudanças DOM/layout', detail: 'CSS só anima propriedades de um elemento estável; mudar containers/grids exige Flip (GSAP/Motion)' },
            { icon: '⏯️', label: 'Pause/resume com estado preciso', detail: 'animation-play-state pausa, mas seek arbitrário só com JS (timeline.seek)' },
            { icon: '🎼', label: 'Sequenciamento dependente de dados', detail: 'Stagger sobre N itens dinâmicos é trivial em JS, verboso em CSS puro' },
            { icon: '📡', label: 'Callbacks por marco', detail: 'animationend existe, mas marcos intermediários (ex: onUpdate) só via JS RAF' },
            { icon: '🌐', label: 'Cross-element coordinated transitions', detail: 'View Transitions API resolve o caso de troca de página/state — ver próximo módulo' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Leitura essencial:</strong> Adam Argyle (developer.chrome.com/blog/scroll-driven-animations),
        Bramus van Damme (bram.us — referência em scroll-timeline), Una Kravets posts sobre @starting-style,
        Josh Comeau &quot;An Interactive Guide to CSS Transitions&quot;.
      </Callout>
    </ModuleLayout>
  );
}
