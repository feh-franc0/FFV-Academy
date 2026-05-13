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
  NodeGraph,
  Timeline,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('framer-motion-v12-completo');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou no rebrand para "Motion" (ex-Framer Motion) v12?',
    options: [
      'Apenas o nome',
      'Pacote npm motion substitui framer-motion, bundle base ~5kb (mini.js), API com hybrid engine (CSS hardware + WAAPI + JS quando necessário), suporte oficial fora do React (vanilla / Vue / Svelte)',
      'Virou pago',
      'Foi descontinuado',
    ],
    correct: 1,
    explanation: 'A v12 (2025) rebrandeada como Motion (motion.dev) ganhou hybrid engine que escolhe automaticamente entre CSS transitions (composite-only, GPU), Web Animations API (WAAPI) ou JavaScript (spring, custom easing). Bundle mini ~5kb usa só CSS. framer-motion ainda existe como alias; novo nome é motion.',
  },
  {
    question: 'O que layoutId habilita em Motion v12?',
    options: [
      'Ordena z-index',
      'Magic motion entre componentes com mesmo layoutId — quando um desmonta e outro com mesmo id monta, Motion interpola size/position automaticamente. Base de hero transitions, accordion shared element',
      'Ordena DOM',
      'É depreciado',
    ],
    correct: 1,
    explanation: 'layoutId é a feature mais característica. Sob o capô: FLIP technique (First, Last, Invert, Play) — Motion mede bounds antes/depois, aplica transform inverso e anima com spring para identidade. Use para shared element transitions, expandable cards, tabs com indicador deslizante. Limitação: não pode haver dois layoutId iguais ativos simultaneamente.',
  },
  {
    question: 'Diferença entre useScroll e useTransform?',
    options: [
      'São o mesmo hook',
      'useScroll devolve MotionValues (scrollY, scrollYProgress) baseadas no scroll do container/elemento; useTransform mapeia uma MotionValue de input para uma de output (ex: scrollYProgress 0→1 vira opacity 0→1 ou rotate 0→360). Composição = scroll-driven animations',
      'useScroll é para mouse',
      'useTransform só serve para cores',
    ],
    correct: 1,
    explanation: 'useScroll fornece o sinal (progresso 0–1 do scroll, com offsets configuráveis tipo ["start end","end start"]). useTransform é o mapeador genérico — aceita qualquer MotionValue e arrays [input] [output] com interpolação automática (números, cores, transforms). Combinação clássica: parallax (Y scroll → translateY), reveal (scroll → opacity), progress bar.',
  },
  {
    question: 'Quando AnimatePresence é obrigatório?',
    options: [
      'Sempre',
      'Quando precisa animar exit — React desmonta antes do CSS transition rodar. AnimatePresence segura o componente no DOM até a animação exit terminar. Requer key estável e prop initial/animate/exit no filho. mode="wait" anima sequencialmente, "popLayout" reordena layout',
      'Só em SSR',
      'Para inputs',
    ],
    correct: 1,
    explanation: 'Sem AnimatePresence, exit não anima — o elemento já saiu do DOM antes do CSS aplicar transition. AnimatePresence intercepta a remoção e mantém o filho montado até onAnimationComplete do exit. Crítico para modais, toasts, route transitions. mode="wait": exit antes do enter. mode="popLayout": filho saindo "flutua" enquanto layout reflow.',
  },
  {
    question: 'Por que drag em Motion v12 não causa jank?',
    options: [
      'Mágica',
      'Drag aplica transform: translate (composite-only, GPU layer), não top/left (reflow). Pointer events são capturados, requestAnimationFrame loop atualiza MotionValue, render só toca propriedade composta. dragConstraints + dragElastic dão limite com spring de volta',
      'Usa setTimeout',
      'É CPU-only',
    ],
    correct: 1,
    explanation: 'Drag em Motion = pointer event capture + RAF + transform. Nunca toca layout properties (top/left/width/height) durante o gesto — só transform/opacity, que vivem no compositor da GPU. dragConstraints aceita refs ou objeto {top,bottom,left,right}; dragElastic 0–1 controla quanto pode ultrapassar antes do spring puxar de volta (Apple-like rubber band).',
  },
  {
    question: 'O que MotionConfig com reducedMotion="user" faz?',
    options: [
      'Aumenta animação',
      'Respeita prefers-reduced-motion: quando user pediu redução, Motion automaticamente skipa transforms/durations e aplica estados finais instantaneamente (mantém apenas opacity quando essencial). Implementação correta = essencial para a11y vestibular',
      'É decorativo',
      'Quebra Motion',
    ],
    correct: 1,
    explanation: 'reducedMotion="user" (recomendado) lê o media query prefers-reduced-motion do OS. Quando true, Motion pula durações de transform/scale/rotate e aplica instant. "always" força redução; "never" ignora. Usuários vestibulares (vertigem, enxaqueca) sofrem com parallax/zoom — respeitar a preferência é obrigatório por WCAG 2.3.3.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="framer-motion-v12-completo"
      title="Framer Motion v12: layout, gestures, scroll, layoutId"
      icon="🎬"
      xp={65}
      readTime={13}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="gsap-profissional"
      nextTitle="GSAP profissional: Timeline, ScrollTrigger, Flip"
      quiz={quiz}
    >
      <Section title="Motion v12 — o rebrand e o que mudou" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Em 2025 o time da Framer renomeou <strong>framer-motion</strong> para <strong>motion</strong>{' '}
          (motion.dev), abrindo a biblioteca para uso vanilla, Vue e Svelte. Para projetos React, a API ficou
          praticamente igual, mas o engine ganhou modo híbrido: Motion escolhe automaticamente entre CSS
          transitions, Web Animations API e fallback JavaScript dependendo do que está animando.
        </p>
        <Timeline
          accent={accent}
          title="Evolução resumida"
          events={[
            { when: 'v6', label: 'framer-motion clássico — JS-only, ~30kb', detail: 'Base do que conhecemos: motion.div, useAnimation, AnimatePresence' },
            { when: 'v10', label: 'Layout animations maduras', detail: 'layoutId estável, LayoutGroup, shared element transitions' },
            { when: 'v11', label: 'Hardware-accelerated path', detail: 'CSS transitions para propriedades simples (transform/opacity)' },
            { when: 'v12', label: 'Rebrand → Motion + hybrid engine', highlight: true, detail: 'Pacote motion, mini.js 5kb, suporte multi-framework' },
          ]}
        />
        <Callout tone="info" icon="📦">
          Migração: <InlineCode>npm i motion</InlineCode>, troque <InlineCode>{`from 'framer-motion'`}</InlineCode>{' '}
          por <InlineCode>{`from 'motion/react'`}</InlineCode>. O alias framer-motion ainda funciona — sem pressa.
        </Callout>
      </Section>

      <Section title="O componente motion.* — anatomia" accent={accent}>
        <CodeBlock lang="tsx" filename="anatomia.tsx">{`import { motion } from 'motion/react';

// motion.<element> = drop-in com superpoderes
<motion.div
  // estado inicial (antes de montar)
  initial={{ opacity: 0, y: 20 }}
  // estado de destino (anima ao montar e ao mudar)
  animate={{ opacity: 1, y: 0 }}
  // estado ao desmontar (precisa AnimatePresence)
  exit={{ opacity: 0, y: -20 }}
  // transição: tipo, duração, easing
  transition={{
    type: 'spring',       // ou 'tween', 'inertia'
    stiffness: 260,
    damping: 20,
    mass: 1,
  }}
  // estados nomeados (variants) — orquestração
  variants={{
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }}
  // gestures: while* dispara animações temporárias
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, margin: '-100px' }}
>
  Card
</motion.div>`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'initial', v: 'estado antes de montar; aceita boolean false para pular animação inicial' },
            { k: 'animate', v: 'estado alvo; mudanças disparam transição automática' },
            { k: 'exit', v: 'estado de saída — só funciona dentro de AnimatePresence' },
            { k: 'transition', v: 'spring (default) | tween (curves) | inertia (com velocidade)' },
            { k: 'variants', v: 'objeto de estados nomeados — orquestra filhos via staggerChildren' },
            { k: 'whileHover/Tap/Focus/InView', v: 'animações condicionais — não persistem após o evento' },
            { k: 'layout', v: 'true ativa FLIP automático em qualquer mudança de bounds' },
            { k: 'layoutId', v: 'string que liga elementos para shared element transition' },
          ]}
        />
      </Section>

      <Section title="Layout animations — o coração da v12" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          A prop <InlineCode>layout</InlineCode> faz Motion medir bounds antes e depois de qualquer mudança de
          DOM/layout e interpolar via transform — a técnica FLIP (First/Last/Invert/Play) descrita por Paul
          Lewis no Google em 2015. Mudar grid, reordenar lista, expandir card: tudo anima sem você tocar em CSS.
        </p>
        <CodeBlock lang="tsx" filename="layout-flip.tsx">{`// 1) layout em mudanças de bounds
<motion.div layout>
  {expanded ? <FullDetail /> : <Summary />}
</motion.div>

// 2) layoutId: shared element entre componentes diferentes
{!selected && <motion.div layoutId="card-1" className="card-small" />}
{selected && <motion.div layoutId="card-1" className="card-full" />}
// quando o boolean muda, Motion interpola size/position entre os dois

// 3) Reordering com AnimatePresence + layout
<AnimatePresence>
  {items.map(it => (
    <motion.li
      key={it.id}
      layout                                  // anima reordering
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {it.text}
    </motion.li>
  ))}
</AnimatePresence>`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Pitfalls de layout:</strong> filhos com border-radius/box-shadow podem deformar durante a
          interpolação (transform escala tudo). Solução: <InlineCode>layout=&quot;position&quot;</InlineCode>{' '}
          anima só posição, ou usar <InlineCode>borderRadius</InlineCode> animado explicitamente.
        </Callout>
      </Section>

      <Section title="Gestures — drag, hover, tap, pan" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Pipeline de drag em Motion"
          steps={[
            { icon: '👆', label: 'pointerdown', desc: 'capture event, lock scroll' },
            { icon: '🎯', label: 'pointermove', desc: 'update MotionValue (x, y)' },
            { icon: '🎞️', label: 'RAF render', desc: 'transform: translate aplicado' },
            { icon: '✋', label: 'pointerup', desc: 'spring back se elastic' },
          ]}
        />
        <CodeBlock lang="tsx" filename="drag.tsx">{`<motion.div
  drag                              // 'x' | 'y' | true
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2}                 // 0 = rígido | 1 = sem limite
  dragMomentum={true}               // inércia ao soltar
  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
  onDragStart={(e, info) => {/* info.point, info.offset, info.velocity */}}
  onDrag={(e, info) => {}}
  onDragEnd={(e, info) => {
    if (info.offset.x > 100) onSwipeRight();
  }}
  whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
/>`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Gesture', 'Quando dispara', 'Prop animada', 'Caso de uso']}
          rows={[
            ['whileHover', 'pointerenter', 'whileHover={{...}}', 'Card lift, button glow'],
            ['whileTap', 'pointerdown→up', 'whileTap={{ scale: 0.95 }}', 'Feedback de press tátil'],
            ['whileFocus', 'focus do input', 'whileFocus={{ borderColor }}', 'Form fields a11y'],
            ['whileInView', 'IntersectionObserver', 'viewport={{ once: true }}', 'Reveal on scroll'],
            ['drag', 'pointerdown + move', 'dragConstraints, dragElastic', 'Swipe cards, reorder, sliders'],
            ['onPan', 'gesture sem mover DOM', 'panInfo.point/delta', 'Custom swipe, drawer'],
          ]}
        />
      </Section>

      <Section title="useScroll + useTransform — scroll-driven em React" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          A dupla mais usada da biblioteca. <InlineCode>useScroll</InlineCode> entrega MotionValues
          reativas baseadas no scroll; <InlineCode>useTransform</InlineCode> mapeia qualquer MotionValue para
          outra escala (números, cores, strings de transform). Composto: parallax, progress bars, sticky reveals.
        </p>
        <CodeBlock lang="tsx" filename="useScroll.tsx">{`import { motion, useScroll, useTransform } from 'motion/react';

function Parallax() {
  const ref = useRef<HTMLDivElement>(null);
  // progresso 0→1 desde "topo do elemento toca bottom do viewport"
  // até "bottom do elemento toca topo do viewport"
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // mapeamento: 0→1 vira -100→100px
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

  return (
    <motion.section ref={ref}>
      <motion.div style={{ y, opacity, scale }}>Conteúdo</motion.div>
    </motion.section>
  );
}

// Progress bar do scroll global
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-1 bg-pink-500"
    />
  );
}`}</CodeBlock>
        <Callout tone="info" icon="🧠">
          MotionValue é um observable fora do ciclo de render do React. Mudar uma MotionValue NÃO causa
          re-render — Motion atualiza o DOM direto via WAAPI. Para ler no JSX use{' '}
          <InlineCode>useMotionValueEvent</InlineCode> ou converta com <InlineCode>useTransform</InlineCode>.
        </Callout>
      </Section>

      <Section title="AnimatePresence — exit animations" accent={accent}>
        <CodeBlock lang="tsx" filename="exit.tsx">{`<AnimatePresence mode="wait" initial={false}>
  {isOpen && (
    <motion.div
      key="modal"                            // KEY ESTÁVEL é obrigatório
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['mode', 'Comportamento', 'Quando usar']}
          rows={[
            ['default (sync)', 'Exit e enter rodam simultaneamente', 'Trocas suaves de conteúdo sobreposto'],
            ['wait', 'Espera exit terminar antes do enter', 'Route transitions, modal sequencial'],
            ['popLayout', 'Filho saindo é tirado do fluxo (position: absolute) para layout dos remaining reorganizar', 'Listas reordenando ao remover item'],
          ]}
        />
      </Section>

      <Section title="Variants — orquestração com staggerChildren" accent={accent}>
        <CodeBlock lang="tsx" filename="variants.tsx">{`const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,    // delay entre filhos
      delayChildren: 0.2,       // delay antes de começar
      when: 'beforeChildren',   // pai termina antes dos filhos
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(it => (
    <motion.li key={it.id} variants={item}>{it.text}</motion.li>
  ))}
</motion.ul>`}</CodeBlock>
        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--ffv-muted)' }}>
          Filhos herdam o estado nomeado do pai automaticamente — não precisa passar prop. O sistema é
          recursivo: variants em netos também herdam.
        </p>
      </Section>

      <Section title="Performance — o que vigiar" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Custos relativos por propriedade animada"
          legend="Verde = composite-only (60–120fps fácil) · Vermelho = layout/paint (jank garantido em listas)"
          columns={[
            {
              label: 'Composite-only (GPU)',
              nodes: [
                { icon: '🟢', label: 'transform', sub: 'translate/scale/rotate', tone: 'success' },
                { icon: '🟢', label: 'opacity', sub: 'alpha channel', tone: 'success' },
                { icon: '🟢', label: 'filter', sub: 'blur/brightness — cuidado em mobile', tone: 'success' },
              ],
            },
            {
              label: 'Paint (médio)',
              nodes: [
                { icon: '🟡', label: 'color', sub: 'OK em poucos elementos' },
                { icon: '🟡', label: 'background-color', sub: 'invalida pintura do elemento' },
                { icon: '🟡', label: 'border-color', sub: 'idem' },
              ],
            },
            {
              label: 'Layout (caro)',
              nodes: [
                { icon: '🔴', label: 'width/height', sub: 'reflow em descendentes', tone: 'danger' },
                { icon: '🔴', label: 'top/left', sub: 'use transform: translate', tone: 'danger' },
                { icon: '🔴', label: 'margin/padding', sub: 'reflow total', tone: 'danger' },
              ],
            },
          ]}
        />
        <DecisionBox
          scenario="Animar mudança de tamanho de card"
          winner="layout prop + transform interno"
          winnerColor={accent}
          why="Motion mede bounds e aplica transform: scale invertido nos filhos automaticamente — não dispara layout no browser. Resultado: 60fps mesmo em 100 cards."
          alternatives={[
            { name: 'Animar width/height direto', when: 'Causa reflow em cada frame; jank em mobile' },
            { name: 'CSS transition width', when: 'Mesmo problema, sem o benefício de FLIP' },
          ]}
        />
      </Section>

      <Section title="Quando NÃO usar Motion" accent={accent}>
        <Callout tone="warn" icon="🎯">
          Motion é poderoso mas tem custo. Para animações <strong>muito simples</strong> (hover scale, fade
          in inicial), CSS puro é mais leve. Para <strong>timelines complexas com sincronia</strong> (scenes
          de marketing, banner com 10 elementos coreografados), GSAP costuma ser mais ergonômico.
        </Callout>
        <ComparisonTable
          accent={accent}
          headers={['Cenário', 'Melhor escolha', 'Por quê']}
          rows={[
            ['Hover scale em botão', 'CSS :hover + transition', 'Zero JS, GPU compositor'],
            ['Modal enter/exit', 'Motion (AnimatePresence)', 'React desmonta antes do CSS — precisa AnimatePresence'],
            ['Shared element transition', 'Motion (layoutId)', 'FLIP automático embutido'],
            ['Scroll-driven simples', 'CSS @scroll-timeline', 'Zero JS quando o browser suporta'],
            ['Scroll-driven complexo', 'Motion useScroll OU GSAP ScrollTrigger', 'Controle de pinning, scrub, callbacks'],
            ['Timeline coreografada (marketing video)', 'GSAP Timeline', 'API timeline-first, sequenciamento mais ergonômico'],
            ['Drag/swipe', 'Motion drag', 'API completa, dragElastic, momentum'],
          ]}
        />
      </Section>

      <Section title="Mini checklist de produção" accent={accent}>
        <StackFlow
          accent={accent}
          title="Antes de mergeir uma animação"
          items={[
            { icon: '♿', label: 'prefers-reduced-motion respeitado', detail: 'MotionConfig reducedMotion="user" no root da app' },
            { icon: '🎬', label: 'AnimatePresence em tudo que monta/desmonta condicionalmente', detail: 'Sem ele, exit não anima' },
            { icon: '🔑', label: 'key estável em listas animadas', detail: 'index como key quebra exit/enter' },
            { icon: '📐', label: 'Animar transform/opacity, evitar layout properties', detail: 'Width/height/top/left = jank em mobile' },
            { icon: '🎯', label: 'will-change só durante a animação', detail: 'Persistente cria GPU layers permanentes — memory leak' },
            { icon: '📊', label: 'Lighthouse + DevTools Performance', detail: 'Long tasks > 50ms = animação travada' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Leitura essencial:</strong> Motion docs (motion.dev), Paul Lewis &quot;FLIP your animations&quot;
        (aerotwist.com/blog/flip-your-animations/), Material Motion guidelines (m3.material.io/styles/motion),
        Sam Selikoff React-Three-Fiber + Motion examples.
      </Callout>
    </ModuleLayout>
  );
}
