import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow, NodeGraph, MindMap } from '@/components/article/primitives';

export const metadata = getModuleMetadata('motion-choreography');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a duração recomendada para micro vs macro interactions?',
    options: [
      'Sempre 1s',
      'Microinterações (hover, button press, icon morph): 100–200ms. Transições médias (modal open, page transition, accordion): 250–400ms. Macroexpansões (full-screen view, complex layout shift): 400–600ms. >600ms para movimentos PROPOSITAIS (onboarding, narrative). Material e IBM Motion concordam neste range',
      'Sempre 2s',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Material Motion 3 e IBM Carbon Motion estabelecem hierarquia clara. Microinterações precisam ser instantâneas-feeling (sub-200ms) — usuário interpreta como feedback direto. Macro (>400ms) é percebido como "transição com intenção" — deve sinalizar mudança de contexto. Acima de 600ms cansa em uso repetido; reservar para reveal narrativo (onboarding, hero).',
  },
  {
    question: 'Diferença entre ease-out e ease-in — quando usar?',
    options: [
      'São iguais',
      'ease-out (rápido no início, desacelera): para ENTRADAS — elemento chegando rápido e estabelecendo. ease-in (devagar, acelera): para SAÍDAS — elemento ganhando velocidade ao sair. ease-in-out: para in-place (toggle, accordion). Linear: praticamente só para loaders e progress. Disney 12 principles: "slow in and out" mas saída pode ser mais rápida',
      'Sempre linear',
      'Sempre ease-in',
    ],
    correct: 1,
    explanation: 'Regra Material/IBM/Apple HIG: entrada (elemento aparecendo) = ease-out (decelerate) porque psicologicamente sentimos chegada como "freando até parar". Saída (elemento desaparecendo) = ease-in (accelerate) porque sentimos partida como "acelerando para fora". Mistura = "natural movement" — copia física do mundo real (Disney principles).',
  },
  {
    question: 'O que é stagger e por que é fundamental?',
    options: [
      'Bug em CSS',
      'Aplicar a mesma animação a N elementos com delay sequencial entre cada — primeiro item delay 0, segundo delay 50ms, terceiro 100ms, etc. Cria sensação de cascata/ondulação em vez de "tudo aparece de uma vez". Eleva a percepção de qualidade dramaticamente. Stagger amount típico: 30-80ms entre items',
      'Animação em zigzag',
      'Loop infinito',
    ],
    correct: 1,
    explanation: 'Stagger transforma um reveal pobre ("tudo aparece junto") em coreografia rica. Material 3 chama de "sequential" motion. CSS via animation-delay: calc(var(--i) * 50ms); Motion via staggerChildren: 0.05; GSAP via stagger: 0.05 ou stagger: {each: 0.05, from: "center"}. Cuidado: stagger total >800ms cansa.',
  },
  {
    question: 'Spring vs cubic-bezier — quando cada?',
    options: [
      'Sempre cubic-bezier',
      'cubic-bezier: durações DETERMINÍSTICAS (sabe quando termina), fácil sincronizar com áudio/outras animações, padrões de design system (Material curves). Spring: física natural, depende de stiffness/damping/mass — final timing varia com distância, ótimo para drag/release e movimentos orgânicos. Springs em UI hover/microinterações é tendência (Motion default)',
      'Sempre spring',
      'Não há diferença',
    ],
    correct: 1,
    explanation: 'Cubic-bezier é a base do design system (Material, IBM, Carbon, Apple HIG todos têm curvas oficiais). Determinístico = previsível, sincronizável. Spring é física: stiffness/damping/mass governam o movimento; tempo final depende da distância. Spring é incrível para drag-release e UI orgânica (Motion default), cubic-bezier para coreografia precisa.',
  },
  {
    question: 'O que Disney 12 principles tem a ver com motion design web?',
    options: [
      'Nada',
      'Os princípios da animação Disney (1981, Ollie Johnston + Frank Thomas) são fundamentos universais: Squash & Stretch (deformação preserva volume), Anticipation (pequeno movimento contrário antes do principal), Slow In/Slow Out (easing), Follow Through (partes secundárias acompanham), Staging (foco visual), Timing (velocidade comunica peso). Material Motion explicitamente cita',
      'Apenas cartoons',
      'É anti-UI',
    ],
    correct: 1,
    explanation: 'Os 12 princípios foram destilados em "The Illusion of Life" (1981). Em motion UI: Anticipation = botão "afunda" antes do click feedback expandir; Squash/Stretch = drag elastic em Motion; Follow Through = filhos animam com delay residual; Slow In/Out = ease-in-out; Staging = um movimento principal por frame. Material Motion guidelines citam diretamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="motion-choreography"
      title="Motion choreography: timing, ease, stagger, hierarquia"
      icon="🎼"
      xp={60}
      readTime={12}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="motion-performance-a11y"
      nextTitle="Motion performance + A11y: prefers-reduced-motion"
      quiz={quiz}
    >
      <Section title="Choreography — o que diferencia animação amadora de profissional" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Você pode dominar Motion, GSAP e CSS — mas se durações, easings e stagger estão errados, o resultado
          parece amador. Choreography é a engenharia do timing: <strong>quanto tempo</strong> (duration),{' '}
          <strong>como acelera/desacelera</strong> (easing), <strong>em que ordem</strong> (stagger,
          sequenciamento) e <strong>quem segue quem</strong> (hierarquia).
        </p>
        <MindMap
          accent={accent}
          root="Choreography de motion"
          branches={[
            {
              title: 'Timing',
              items: ['Duration por categoria (micro/macro)', 'Quando é instantâneo (<100ms)', 'Quando cansa (>600ms repetido)'],
            },
            {
              title: 'Easing',
              items: ['ease-out para entrada', 'ease-in para saída', 'spring para drag/release', 'design system curves (Material, IBM)'],
            },
            {
              title: 'Stagger',
              items: ['Amount típico 30-80ms', 'Direção (center, edges, random)', 'Stop antes de cansar (~600ms total)'],
            },
            {
              title: 'Hierarquia',
              items: ['Um movimento principal por frame', 'Follow-through (filhos seguem pai)', 'Staging visual claro'],
            },
            {
              title: 'Disney principles aplicados',
              items: ['Anticipation antes do main', 'Squash & stretch (drag elastic)', 'Slow in/out = easing', 'Follow through em filhos'],
            },
          ]}
        />
      </Section>

      <Section title="Duration hierarchy — Material/IBM/Apple consensus" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Categoria', 'Duração', 'Exemplos', 'Easing recomendado']}
          rows={[
            ['Instant feedback', '<100ms (idealmente 50-80ms)', 'Button press scale, ripple start, focus ring', 'ease-out'],
            ['Micro', '100–200ms', 'Hover scale, icon morph, tooltip, toast in', 'ease-out'],
            ['Small', '200–300ms', 'Dropdown, accordion, switch toggle', 'ease-in-out'],
            ['Medium', '300–400ms', 'Modal open, drawer slide, page transition (within app)', 'cubic-bezier(0.2,0,0,1) — emphasized decelerate'],
            ['Large', '400–600ms', 'Full-screen reveal, hero expand, route transition', 'cubic-bezier(0.05,0.7,0.1,1) — emphasized'],
            ['Narrative', '600ms-1.2s', 'Onboarding step, splash hero, marketing scene', 'Custom — purposeful'],
            ['Loop/idle', 'qualquer', 'Loading spinner (1-1.6s), live dot (1.6s), shimmer (1.5s)', 'linear ou ease-in-out'],
          ]}
        />
        <Callout tone="warn" icon="⏰">
          <strong>Pitfall comum:</strong> usar a mesma duração (ex: 400ms) para tudo. Modal abrindo em 400ms +
          botão hover em 400ms = botão parece quebrado (lento demais). Duração comunica importância e peso —
          como tipografia.
        </Callout>
      </Section>

      <Section title="Easing — o vocabulário das curvas" accent={accent}>
        <CodeBlock lang="css" filename="design-system-curves.css">{`/* Material Design 3 emphasized */
--ease-emphasized:           cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
--ease-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

/* Material Design 3 standard */
--ease-standard:             cubic-bezier(0.2, 0, 0, 1);
--ease-standard-decelerate:  cubic-bezier(0, 0, 0, 1);
--ease-standard-accelerate:  cubic-bezier(0.3, 0, 1, 1);

/* IBM Carbon (productive) */
--ease-productive-standard:  cubic-bezier(0.2, 0, 0.38, 0.9);
--ease-productive-entrance:  cubic-bezier(0, 0, 0.38, 0.9);
--ease-productive-exit:      cubic-bezier(0.2, 0, 1, 0.9);

/* IBM Carbon (expressive — mais dramático) */
--ease-expressive-standard:  cubic-bezier(0.4, 0.14, 0.3, 1);
--ease-expressive-entrance:  cubic-bezier(0, 0, 0.3, 1);
--ease-expressive-exit:      cubic-bezier(0.4, 0.14, 1, 1);

/* Apple HIG inspired */
--ease-apple-smooth:         cubic-bezier(0.42, 0, 0.58, 1);
--ease-apple-bounce:         cubic-bezier(0.34, 1.56, 0.64, 1);   /* slight overshoot */

/* Tailwind CSS defaults */
--ease-tw-linear:            linear;
--ease-tw-in:                cubic-bezier(0.4, 0, 1, 1);
--ease-tw-out:               cubic-bezier(0, 0, 0.2, 1);
--ease-tw-in-out:            cubic-bezier(0.4, 0, 0.2, 1);`}</CodeBlock>
        <NodeGraph
          accent={accent}
          title="Quando usar qual"
          columns={[
            {
              label: 'Entrada (decelerate)',
              nodes: [
                { icon: '→', label: 'ease-out', sub: 'cubic-bezier(0,0,0.2,1)', tone: 'success' },
                { icon: '🎯', label: 'emphasized-decelerate', sub: 'Material 3 modal/drawer entrando' },
                { icon: '🍎', label: 'apple-smooth ou ease-out forte', sub: 'iOS-like polish' },
              ],
            },
            {
              label: 'Saída (accelerate)',
              nodes: [
                { icon: '←', label: 'ease-in', sub: 'cubic-bezier(0.4,0,1,1)', tone: 'success' },
                { icon: '⚡', label: 'emphasized-accelerate', sub: 'Material 3 elemento saindo' },
              ],
            },
            {
              label: 'In-place / toggle',
              nodes: [
                { icon: '↔', label: 'ease-in-out', sub: 'Accordion, switch, expand' },
                { icon: '🌊', label: 'standard', sub: 'Material standard curve' },
              ],
            },
            {
              label: 'Físico (orgânico)',
              nodes: [
                { icon: '🌀', label: 'spring', sub: 'Motion default — stiffness/damping', tone: 'emphasis' },
                { icon: '🎯', label: 'overshoot bounce', sub: 'cubic-bezier(0.34,1.56,0.64,1) — leve passar e voltar' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Spring physics — quando física natural ganha" accent={accent}>
        <CodeBlock lang="tsx" filename="spring.tsx">{`// Motion (default é spring)
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 1 }}
/>

// GSAP — via plugin (CustomEase) ou usar duration + ease
// CSS — via linear() easing function aproximando spring curve

/* Parâmetros de spring */
// stiffness: rigidez da mola (mais alto = mais rápido até destino) — típico 100-400
// damping:   amortecimento (mais alto = menos oscilação) — típico 10-40
// mass:      massa do objeto (mais alto = "pesado", inércia) — típico 1
// velocity:  velocidade inicial (útil em drag release)`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Quando usar spring', v: 'Drag release, hover responsivo, gestos, microinterações com sensação tátil' },
            { k: 'Quando NÃO usar', v: 'Coreografias precisas (música, vídeo, multi-elemento sincronizado), pois duração varia' },
            { k: 'Tunning', v: 'stiffness 200, damping 20 = "gentle"; 400/30 = "rápido firme"; 600/40 = "snappy"' },
            { k: 'Oscilação', v: 'damping < 2*sqrt(stiffness*mass) = underdamped (oscila); = critical; > = sem oscilação' },
          ]}
        />
      </Section>

      <Section title="Stagger — o multiplicador de qualidade percebida" accent={accent}>
        <CodeBlock lang="tsx" filename="stagger.tsx">{`// Motion via variants
const container = {
  visible: {
    transition: {
      staggerChildren: 0.06,    // 60ms entre filhos
      delayChildren: 0.1,
    },
  },
};

// GSAP — stagger simples
gsap.from('.card', { y: 30, opacity: 0, stagger: 0.06 });

// GSAP — stagger avançado (direção, grid)
gsap.from('.tile', {
  scale: 0,
  stagger: {
    each: 0.04,
    from: 'center',           // 'start' | 'end' | 'center' | 'edges' | 'random' | [x,y]
    grid: [4, 4],             // grid 4x4 → ondulação radial real
    ease: 'power2.inOut',
  },
});

// CSS — via custom property + nth-child
.card {
  animation: fadeUp 400ms cubic-bezier(0.2,0,0,1) both;
  animation-delay: calc(var(--i) * 60ms);
}
/* aplique style="--i:0", --i:1, etc. */`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Stagger amount', 'Sensação', 'Casos']}
          rows={[
            ['20-30ms', 'Quase simultâneo, sutil cascata', 'Letters em texto, dots de loading'],
            ['40-60ms', 'Cascata clara mas rápida', 'Cards em grid, lista curta (5-10 items)'],
            ['80-120ms', 'Cascata dramática', 'Hero reveal sequencial, lista média'],
            ['>150ms', 'Tedioso em listas — só para narrativa', 'Onboarding step-by-step, reveal cinematográfico'],
          ]}
        />
        <Callout tone="warn" icon="⏱️">
          <strong>Regra de bolso:</strong> stagger total (N items × stagger amount) deve ficar abaixo de 600ms.
          Lista de 30 items × 60ms = 1.8s — usuário cansa. Solução: stagger menor (20ms) ou agrupar em batches.
        </Callout>
      </Section>

      <Section title="Hierarchy & follow-through — Disney aplicado" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Disney 12 principles em motion UI"
          orientation="vertical"
          steps={[
            { icon: '⏪', label: 'Anticipation', desc: 'Botão "afunda" antes do action expandir — prepara o olho' },
            { icon: '🎯', label: 'Staging', desc: 'Um movimento PRINCIPAL por frame; outros são suporte' },
            { icon: '🌊', label: 'Slow in / Slow out', desc: 'Easing — começa e termina suave (ease-in-out)' },
            { icon: '🎈', label: 'Squash & Stretch', desc: 'Drag elastic em Motion — elemento deforma sob tensão' },
            { icon: '👥', label: 'Follow through', desc: 'Filhos animam com delay residual (stagger + cascade)' },
            { icon: '🎵', label: 'Timing', desc: 'Duração comunica peso — movimento pesado = mais lento' },
            { icon: '📐', label: 'Arcs', desc: 'Movimento curvo > linear; MotionPath em GSAP, ease com Y' },
            { icon: '✨', label: 'Appeal', desc: 'Cohesão e charme — design system de motion consistente' },
          ]}
        />
        <CodeBlock lang="tsx" filename="anticipation-followthrough.tsx">{`// Anticipation: botão "afunda" antes de expandir
<motion.button
  whileTap={{ scale: 0.92 }}                  // anticipation
  whileHover={{ scale: 1.02 }}
  onClick={() => expand()}
>
  Abrir
</motion.button>

// Follow-through: card expande, texto interno aparece com delay
const card = {
  closed: { height: 80 },
  open: {
    height: 'auto',
    transition: { duration: 0.3, ease: [0.2, 0, 0, 1] },
  },
};
const content = {
  closed: { opacity: 0, y: 10 },
  open: {
    opacity: 1, y: 0,
    transition: { delay: 0.15, duration: 0.25 },   // espera o card terminar
  },
};`}</CodeBlock>
      </Section>

      <Section title="Design tokens de motion — institucionalize" accent={accent}>
        <CodeBlock lang="css" filename="motion-tokens.css">{`/* tokens em :root para o design system inteiro */
:root {
  /* Durations */
  --motion-instant:   80ms;
  --motion-micro:     150ms;
  --motion-small:     250ms;
  --motion-medium:    350ms;
  --motion-large:     500ms;
  --motion-narrative: 800ms;

  /* Easings */
  --ease-entrance:    cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-exit:        cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-standard:    cubic-bezier(0.2, 0, 0, 1);
  --ease-bounce:      cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Stagger */
  --stagger-tight:    30ms;
  --stagger-normal:   60ms;
  --stagger-loose:    100ms;
}

.modal { transition: transform var(--motion-medium) var(--ease-entrance); }
.tooltip { transition: opacity var(--motion-micro) var(--ease-standard); }`}</CodeBlock>
        <Callout tone="info" icon="🏛️">
          Tokens de motion são parte do design system, igual a cores e tipografia. Sem isso, cada
          desenvolvedor escolhe duração diferente e a sensação de qualidade desaparece. Documentar em
          Figma/Storybook e usar tokens compartilhados.
        </Callout>
      </Section>

      <Section title="Anti-patterns — o que destrói qualidade" accent={accent}>
        <StackFlow
          accent={accent}
          title="Lista dos pecados"
          items={[
            { icon: '⏳', label: 'Tudo com mesma duração', detail: 'Modal e tooltip em 400ms é igualar coisas diferentes — quebra hierarquia' },
            { icon: '↔', label: 'ease-in-out em tudo', detail: 'Entradas pedem ease-out; ease-in-out em entrada parece "lento começo"' },
            { icon: '🎢', label: 'Bounce em todo lugar', detail: 'Overshoot é tempero — em formulário/feedback sério, parece infantil' },
            { icon: '🐢', label: 'Macroexpansão >800ms repetida', detail: '"Cinematográfico" na primeira vez; tedioso na décima' },
            { icon: '🎪', label: 'Multiple movimentos competing por atenção', detail: 'Sem staging = caos visual; usuário não sabe onde olhar' },
            { icon: '🚫', label: 'Ignorar prefers-reduced-motion', detail: 'Usuários vestibulares (vertigem) sofrem; veja próximo módulo' },
            { icon: '📐', label: 'Animar layout (width/height/top)', detail: 'Jank no mobile; sempre transform/opacity (composite-only)' },
            { icon: '🎯', label: 'Stagger linear em listas longas (>20 items)', detail: 'Total > 1s = tedioso; use batches ou view-timeline' },
          ]}
        />
      </Section>

      <Section title="Workflow profissional — como decidir" accent={accent}>
        <DecisionBox
          scenario="Qual easing usar?"
          winner="ease-out para entrada, ease-in para saída, ease-in-out para in-place"
          winnerColor={accent}
          why="Regra universal (Material, IBM, Apple HIG). Override só com motivo design system."
          alternatives={[
            { name: 'spring', when: 'Drag/release, microinterações orgânicas, sensação tátil' },
            { name: 'linear', when: 'Apenas loaders e progress bars' },
          ]}
        />
        <DecisionBox
          scenario="Quanto tempo de duração?"
          winner="100-200ms para micro, 250-400ms para médio, 400-600ms para macro"
          winnerColor={accent}
          why="Hierarquia comunica peso. Material 3 e IBM Carbon convergem nestes ranges."
        />
        <DecisionBox
          scenario="Devo usar stagger?"
          winner="Sim, em qualquer lista 3+ items"
          winnerColor={accent}
          why="60ms é um sweet spot. Eleva percepção de qualidade dramaticamente. Total <600ms."
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Recursos essenciais:</strong> m3.material.io/styles/motion, carbondesignsystem.com/guidelines/motion,
        developer.apple.com/design/human-interface-guidelines/motion, Disney &quot;The Illusion of Life&quot;
        (Frank Thomas + Ollie Johnston, 1981), Val Head &quot;Designing Interface Animation&quot;.
      </Callout>
    </ModuleLayout>
  );
}
