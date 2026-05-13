import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, FlowDiagram, DecisionBox, StackFlow, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flip-technique');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que FLIP significa no contexto de animação web?',
    options: [
      'Flutter Layout Inversion Protocol',
      'First, Last, Invert, Play — técnica popularizada por Paul Lewis (Google) em 2015: 1) meça bounds ANTES (First), 2) mude DOM, 3) meça bounds DEPOIS (Last), 4) aplique transform INVERSO para fazer o elemento parecer no estado First, 5) anime de volta ao Last com transform identidade (Play)',
      'Fast Layout in Plain CSS',
      'Frame Loop in Paint',
    ],
    correct: 1,
    explanation: 'FLIP é a técnica fundamental para animar mudanças de DOM/layout que NÃO podem ser animadas com CSS transition direto (width/height/position muda, ou elemento muda de container). Em vez de animar a propriedade cara (layout/paint), você anima APENAS transform (composite-only, GPU). Resultado: 60fps mesmo em mudanças complexas.',
  },
  {
    question: 'Por que FLIP é mais performático do que animar width/height direto?',
    options: [
      'É só convenção',
      'Animar width/height invalida layout em CADA FRAME do browser — reflow nos filhos, repaint, recompositor — gera jank em listas. FLIP anima APENAS transform: scale/translate, que vive 100% no compositor da GPU em camada separada. O browser não recalcula layout em nenhum frame durante a animação',
      'É mais lento',
      'Não há diferença',
    ],
    correct: 1,
    explanation: 'Pipeline do navegador: JS → Style → Layout → Paint → Composite. Animar width = invalida Layout (reflow) → Paint → Composite, 60x/seg em uma lista grande = jank. Animar transform = pula direto para Composite (a camada GPU já está pronta). FLIP transforma uma mudança de layout em "ilusão" via transform, sem custo de layout em runtime.',
  },
  {
    question: 'Como calcular o transform inverso no FLIP?',
    options: [
      'Sempre identidade',
      'Após First (firstBounds) e Last (lastBounds), o invert é: deltaX = firstBounds.left - lastBounds.left; deltaY = firstBounds.top - lastBounds.top; scaleX = firstBounds.width / lastBounds.width; scaleY = firstBounds.height / lastBounds.height. Aplica transform: translate(deltaX, deltaY) scale(scaleX, scaleY) — elemento PARECE estar no First, mas está fisicamente no Last',
      'Random matriz',
      'Sempre escala 2x',
    ],
    correct: 1,
    explanation: 'O cálculo é geometria pura. Você quer que o elemento, AGORA fisicamente em Last, apareça visualmente em First. Translate de (delta) move até a posição antiga; scale de (ratio first/last) ajusta tamanho. Depois você seta transform: none + transition: transform — o browser anima de identidade-inversa de volta a identidade, criando a ilusão.',
  },
  {
    question: 'Em qual cenário FLIP brilha de forma única?',
    options: [
      'Hover scale',
      'Mudança ARBITRÁRIA de DOM: card muda de coluna em kanban, item reordenado em lista, grid vira list, elemento "promovido" para fullscreen, troca de página com shared element. Casos onde animar a propriedade real (top/left/width/height) seria caro ou impossível (elemento mudou de parent)',
      'Fade simples',
      'Loop infinito',
    ],
    correct: 1,
    explanation: 'FLIP é especificamente para mudanças de DOM/layout que CSS transition não consegue. Mudou de container = pais diferentes = top/left muda 100px = não tem transition CSS que cubra. FLIP captura "antes e depois" geometricamente e anima via transform, agnóstico ao motivo da mudança.',
  },
  {
    question: 'Qual a diferença entre FLIP manual e bibliotecas (Motion layoutId, GSAP Flip)?',
    options: [
      'Não há',
      'Bibliotecas resolvem edge cases que FLIP manual ignora: nested elements (filhos também precisam de inverse-scale para não deformar), border-radius (que escala junto), elementos não-retangulares, sincronização com outros animations, AbortSignal para cancelar mid-flight. Manual é didático mas frágil em produção',
      'Manual é sempre melhor',
      'Bibliotecas são lentas',
    ],
    correct: 1,
    explanation: 'Os edge cases matam o FLIP manual: scale(2) no pai faz border-radius dos filhos virar elipse (Motion correções aplicam inverse-scale recursivo). Mid-flight cancel: usuário clica de novo durante animação, manual quebra; bibliotecas têm AbortController. Aspect ratio change, content reflow, focus management — tudo lá no source de Motion/Flip plugin.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flip-technique"
      title="FLIP technique: animar layout impossível com performance"
      icon="🔄"
      xp={70}
      readTime={14}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="motion-choreography"
      nextTitle="Motion choreography: timing, ease, stagger, hierarquia"
      quiz={quiz}
    >
      <Section title="O problema que FLIP resolve" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Imagine: usuário clica em um card de produto. Você quer expandir esse card em uma view de detalhe
          fullscreen. O card antigo estava em (300,400) com 200×280px; o destino é (0,0) com 100% × 100vh.
          Como animar isso?
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Abordagem', 'Resultado', 'Problema']}
          rows={[
            ['CSS transition em width/height/top/left', 'Anima — em teoria', 'Reflow cada frame = jank brutal em listas e mobile'],
            ['JS RAF animando .style.width', 'Mesmo problema', 'Layout invalidation = main thread bloqueado'],
            ['Render condicional + AnimatePresence', 'Crossfade simples', 'Não anima a CONTINUIDADE — o "card vira detail"'],
            ['FLIP technique', 'Anima apenas transform', 'GPU compositor → 60fps, sem reflow'],
          ]}
        />
        <Callout tone="info" icon="🎓">
          Paul Lewis, então engenheiro Chrome DevRel, publicou &quot;FLIP your animations&quot; em 2015
          (aerotwist.com/blog/flip-your-animations/). É leitura obrigatória — tem 10 anos e continua sendo a
          base do shared element transition em qualquer biblioteca moderna.
        </Callout>
      </Section>

      <Section title="As 4 letras — F, L, I, P" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Pipeline FLIP"
          orientation="vertical"
          steps={[
            { icon: 'F', label: 'First', desc: 'Meça bounds ANTES — getBoundingClientRect() do estado atual' },
            { icon: 'L', label: 'Last', desc: 'Mude o DOM/CSS. Meça bounds DEPOIS — getBoundingClientRect() do novo estado' },
            { icon: 'I', label: 'Invert', desc: 'Calcule delta e aplique transform: translate(-Δx, -Δy) scale(firstW/lastW, firstH/lastH) — visualmente o elemento parece estar no First' },
            { icon: 'P', label: 'Play', desc: 'Próximo frame: transform: none + transition. Browser anima de identidade-inversa para identidade = ilusão de movimento do First ao Last' },
          ]}
        />
        <AnnotatedFormula
          accent={accent}
          title="As fórmulas"
          formula="invert = translate(Δx, Δy) · scale(rW, rH)"
          parts={[
            { text: 'Δx', annotation: 'firstRect.left - lastRect.left', highlight: true },
            { text: 'Δy', annotation: 'firstRect.top - lastRect.top', highlight: true },
            { text: 'rW', annotation: 'firstRect.width / lastRect.width' },
            { text: 'rH', annotation: 'firstRect.height / lastRect.height' },
          ]}
        />
      </Section>

      <Section title="Implementação manual — para entender" accent={accent}>
        <CodeBlock lang="ts" filename="flip-manual.ts">{`function flip(element: HTMLElement, mutateDOM: () => void, durationMs = 400) {
  // 1) FIRST — bounds antes da mudança
  const first = element.getBoundingClientRect();

  // 2) MUTATE DOM (síncrono — pode mover de parent, mudar classe, etc.)
  mutateDOM();

  // 3) LAST — bounds depois
  const last = element.getBoundingClientRect();

  // 4) INVERT — calcula transform que faz o elemento PARECER no First
  const deltaX = first.left - last.left;
  const deltaY = first.top - last.top;
  const scaleX = first.width / last.width;
  const scaleY = first.height / last.height;

  // Aplica IMEDIATAMENTE (sem transition) — elemento "volta" visualmente ao First
  element.style.transformOrigin = 'top left';
  element.style.transform = \`translate(\${deltaX}px, \${deltaY}px) scale(\${scaleX}, \${scaleY})\`;

  // Força o browser a reconhecer o estado intermediário antes da próxima animação
  // (sem isso, browser otimiza e pula direto para o final)
  element.offsetHeight;  // reflow trigger

  // 5) PLAY — habilita transição e remove transform
  element.style.transition = \`transform \${durationMs}ms cubic-bezier(0.2, 0, 0, 1)\`;
  element.style.transform = '';

  // Cleanup após terminar
  element.addEventListener('transitionend', () => {
    element.style.transition = '';
    element.style.transformOrigin = '';
  }, { once: true });
}

// Uso: mover card entre colunas Kanban
const card = document.querySelector('.card') as HTMLElement;
const targetColumn = document.querySelector('.column-done');

flip(card, () => {
  targetColumn.appendChild(card);   // mudou de parent — top/left mudou drasticamente
}, 500);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Por que <InlineCode>element.offsetHeight</InlineCode>?</strong> Forçar leitura de layout
          impede o browser de batchear: sem isso, ele otimiza juntando o transform invert e o transform vazio
          em um único frame — o elemento &quot;pula&quot; direto para o Last sem animar.
        </Callout>
      </Section>

      <Section title="Por que isso é tão performático" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          O segredo do FLIP está em <strong>o que NÃO acontece</strong> durante a animação.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Frase do pipeline', 'Animando width/height', 'Animando transform (FLIP)']}
          rows={[
            ['Style recalc', '✅ cada frame', '✅ apenas no início'],
            ['Layout (reflow)', '✅ cada frame — caro', '❌ não roda durante anim'],
            ['Paint', '✅ cada frame', '❌ raster cached na GPU layer'],
            ['Composite', '✅ cada frame', '✅ cada frame — único custo'],
            ['Thread bloqueada', 'Main', 'Composite (off-main)'],
            ['Performance em listas grandes', '20fps comum', '60fps consistente'],
          ]}
        />
        <Callout tone="info" icon="🧠">
          Lighthouse / Chrome DevTools Performance mostram isso claramente: em listas com 50+ items animando
          via FLIP, o flame chart fica vazio na main thread; animando width, vê-se uma parede de Layout (roxo)
          em cada frame.
        </Callout>
      </Section>

      <Section title="Edge cases que bibliotecas resolvem" accent={accent}>
        <StackFlow
          accent={accent}
          title="O que falta no FLIP manual"
          items={[
            { icon: '👶', label: 'Filhos deformam com scale', detail: 'scale(2) no pai → filhos esticam 2x. Solução: inverse-scale recursivo nos filhos diretos. Motion e GSAP Flip aplicam automaticamente.' },
            { icon: '⭕', label: 'border-radius escala junto', detail: 'border-radius: 12px em elemento scale(2) vira 6px visual. Solução: animar border-radius separado com keyframes correspondentes.' },
            { icon: '🚪', label: 'Mid-flight cancel', detail: 'Usuário clica de novo durante animação — manual entra em estado inconsistente. Bibliotecas usam AbortController + nova captura de bounds.' },
            { icon: '🌊', label: 'Mudança de aspect ratio', detail: 'Card 100×200 → 300×100 não escala uniformemente. Bibliotecas detectam e animam scaleX/scaleY independentes com inverse nos filhos.' },
            { icon: '🎯', label: 'Focus management', detail: 'Após animação, foco vai pra onde? Acessibilidade exige programar foco no elemento final.' },
            { icon: '⏰', label: 'requestAnimationFrame timing', detail: 'O reflow trigger deve ser no frame certo; usar Promise<void>(r => requestAnimationFrame(r)) é mais robusto que offsetHeight em alguns casos.' },
            { icon: '📦', label: 'will-change cleanup', detail: 'Setar will-change: transform durante animação melhora GPU; remover depois é crítico (memory leak se persistir).' },
          ]}
        />
      </Section>

      <Section title="GSAP Flip plugin — ergonomia profissional" accent={accent}>
        <CodeBlock lang="js" filename="gsap-flip.js">{`import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

// Caso 1: mover card entre containers
function moveCard(card, newContainer) {
  const state = Flip.getState(card);              // FIRST + INVERT prep
  newContainer.appendChild(card);                  // mutate DOM
  Flip.from(state, {                               // PLAY
    duration: 0.5,
    ease: 'power2.inOut',
    absolute: true,                                // detach do fluxo durante anim (evita affect siblings)
    onComplete: () => focusCard(card),
  });
}

// Caso 2: toggle grid ↔ list (vários elementos)
function toggleLayout() {
  const items = gsap.utils.toArray('.item');
  const state = Flip.getState(items, {
    props: 'backgroundColor,borderRadius',         // captura ALÉM de bounds
    nested: true,                                  // captura filhos também
  });
  document.body.classList.toggle('list-view');
  Flip.from(state, {
    duration: 0.6,
    stagger: { each: 0.04, from: 'center' },
    ease: 'power2.inOut',
  });
}

// Caso 3: shared element entre views (kanban → modal)
function expandCard(card) {
  const state = Flip.getState(card, { props: 'borderRadius' });
  modalRoot.appendChild(card);
  card.classList.add('expanded');                 // CSS toma conta do "Last"
  Flip.from(state, { duration: 0.7, ease: 'power3.inOut' });
}`}</CodeBlock>
      </Section>

      <Section title="Motion (React) layoutId — FLIP transparente" accent={accent}>
        <CodeBlock lang="tsx" filename="motion-layoutid.tsx">{`import { motion, AnimatePresence } from 'motion/react';

function Gallery() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="grid">
        {items.map(it => (
          <motion.div
            key={it.id}
            layoutId={\`card-\${it.id}\`}                  // identidade compartilhada
            onClick={() => setSelectedId(it.id)}
            className="card-thumb"
          >
            <motion.h3 layoutId={\`title-\${it.id}\`}>{it.title}</motion.h3>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            layoutId={\`card-\${selectedId}\`}              // MESMO layoutId
            className="card-fullscreen"
            onClick={() => setSelectedId(null)}
          >
            <motion.h3 layoutId={\`title-\${selectedId}\`}>{/* ... */}</motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}`}</CodeBlock>
        <Callout tone="info" icon="🪄">
          Motion detecta que dois elementos com mesmo <InlineCode>layoutId</InlineCode> existiram em frames
          consecutivos (um desmontou, outro montou). Em vez de tratar como mount/unmount independentes, faz
          FLIP entre os dois — capturando bounds do que saiu e animando o que entrou para parecer o anterior.
        </Callout>
      </Section>

      <Section title="View Transitions API — FLIP no navegador, sem JS" accent={accent}>
        <CodeBlock lang="css" filename="view-transitions-flip.css">{`/* O browser cuida do FLIP entre páginas/states */

/* Página A: thumbnail */
.product-thumb {
  view-transition-name: product-123;
}

/* Página B (após nav): hero */
.product-hero {
  view-transition-name: product-123;     /* mesmo nome */
}

/* Browser captura bounds do .product-thumb (página A),
   bounds do .product-hero (página B), e anima entre eles automaticamente.
   Isso É FLIP — implementado nativamente, sem JS. */

::view-transition-group(product-123) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}`}</CodeBlock>
      </Section>

      <Section title="Decisão final — qual ferramenta usar?" accent={accent}>
        <DecisionBox
          scenario="Shared element entre rotas em SPA React"
          winner="Motion layoutId"
          winnerColor={accent}
          why="API mais ergonômica para React: 2 props (layoutId em ambos os lados) + AnimatePresence. Filhos animam recursivamente."
        />
        <DecisionBox
          scenario="Mudança de layout vanilla JS / Vue / Svelte / framework agnóstico"
          winner="GSAP Flip"
          winnerColor={accent}
          why="API consistente em qualquer stack, ergonomia getState/from, stagger/absolute/nested out-of-the-box."
        />
        <DecisionBox
          scenario="Navegação entre páginas inteiras (MPA, static site)"
          winner="View Transitions API"
          winnerColor={accent}
          why="@view-transition CSS + view-transition-name resolve com zero JS. Suporte: Chrome 126+ baseline."
        />
        <DecisionBox
          scenario="Caso simples isolado, sem usar libs"
          winner="FLIP manual"
          winnerColor={accent}
          why="50 linhas, didático, suficiente para 1 elemento sem filhos complexos. Use o snippet deste artigo como base."
        />
      </Section>

      <Section title="Checklist de produção" accent={accent}>
        <StackFlow
          accent={accent}
          title="Antes de mergear FLIP em produção"
          items={[
            { icon: '🎯', label: 'transform-origin: top left explícito', detail: 'Sem isso, scale acontece a partir do centro e quebra os deltas' },
            { icon: '⚡', label: 'will-change: transform DURANTE a anim', detail: 'Setar antes de Play, remover no transitionend. Persistente = memory leak' },
            { icon: '♿', label: 'prefers-reduced-motion respeitado', detail: 'Em motion-reduce, aplicar Last direto sem animar' },
            { icon: '🚫', label: 'pointer-events: none durante anim', detail: 'Evita usuário clicar em estado intermediário' },
            { icon: '🎬', label: 'Focus pós-anim', detail: 'Após movimentação, foco deve ir ao elemento final (a11y)' },
            { icon: '📐', label: 'Border-radius com keyframe se for diferente entre states', detail: 'Scale deforma; animar separado' },
            { icon: '🔄', label: 'AbortController para mid-flight cancel', detail: 'Manual: limpar listeners; libs: re-getState no novo click' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Leitura essencial:</strong> Paul Lewis &quot;FLIP your animations&quot;
        (aerotwist.com/blog/flip-your-animations), David Khourshid (Stately) &quot;Animating the Impossible&quot;,
        Motion docs sobre layoutId, GSAP Flip plugin docs (gsap.com/docs/v3/Plugins/Flip).
      </Callout>
    </ModuleLayout>
  );
}
