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
  Timeline,
  DecisionBox,
  StackFlow,
  NodeGraph,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('gsap-profissional');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou em maio/2024 que tornou o GSAP relevante novamente?',
    options: [
      'GSAP virou pago',
      'Webflow adquiriu o GreenSock e tornou TODO o GSAP — incluindo plugins premium (ScrollTrigger, MorphSVG, Flip, MotionPath, SplitText, DrawSVG) — 100% gratuito, sem licença Club Greensock',
      'Foi descontinuado',
      'Virou só CSS',
    ],
    correct: 1,
    explanation: 'Em maio/2024 a Webflow comprou GreenSock e anunciou: GSAP + todos os plugins (antes pagos via Club Greensock por ~$199/ano) ficam free for commercial. Isso remove a única objeção histórica ao GSAP em projetos de cliente. Hoje rivaliza com Motion em React e é dominante fora dele.',
  },
  {
    question: 'Diferença entre gsap.to(), .from(), .fromTo() e .set()?',
    options: [
      'São aliases',
      'to() anima do estado atual para o target. from() anima do target para o estado atual (útil para reveals — define onde começa). fromTo() especifica os dois extremos explicitamente. set() aplica instantaneamente sem animação (útil para preparar estado inicial)',
      'Apenas to() funciona',
      'set() é o mais lento',
    ],
    correct: 1,
    explanation: 'Quatro métodos cobrem 90% dos casos. to(target, {x:100}) anima de onde está até x:100. from(target, {opacity:0, y:50}) começa em y:50 invisível e anima até o estado natural — ideal para reveals on-load. fromTo(target, {opacity:0},{opacity:1}) define ambos os extremos. set(target, {x:100}) é igual a duration:0 — usado para resetar antes de animar.',
  },
  {
    question: 'O que ScrollTrigger.scrub faz?',
    options: [
      'Lava o scroll',
      'Liga o progresso da animação ao scroll: scrub:true sincroniza 1:1, scrub:1 adiciona ~1s de "smoothing" (a animação alcança o scroll com lag suave, criando efeito buttery), scrub:false dispara animação ao entrar e ela roda normalmente',
      'Acelera scroll',
      'Pausa scroll',
    ],
    correct: 1,
    explanation: 'scrub é o coração do ScrollTrigger. true: progresso da timeline = posição do scroll, instantâneo. 1 ou 2 (número): suaviza com 1s/2s de lag — sensação de "physics", muito usado em sites de agência. false (default): scroll só DISPARA, animação roda em duração fixa. Para parallax suave use scrub: 1.5–2.',
  },
  {
    question: 'O que o plugin Flip do GSAP resolve?',
    options: [
      'Vira a tela',
      'Anima mudanças de layout impossíveis de animar com CSS — captura estado A (Flip.getState), muda DOM (reorder, mudar classe, mover entre containers), restaura visualmente para A e anima até o novo estado B. É FLIP technique (Paul Lewis) com API ergonômica',
      'Inverte cores',
      'Cria animação 3D',
    ],
    correct: 1,
    explanation: 'Flip plugin = FLIP technique encapsulada. const state = Flip.getState(targets); // muda DOM/CSS; Flip.from(state, {duration: 0.6, ease: "power2.inOut"}); GSAP mede bounds, aplica transforms invertidos e anima de volta. Casos: mover card entre colunas (kanban), expandir lightbox, reordenar grid, troca de layout list ↔ grid.',
  },
  {
    question: 'Por que usar Timeline em vez de várias gsap.to() encadeadas?',
    options: [
      'Não há diferença',
      'Timeline dá controle total de sequenciamento, sobreposição (position parameter "<", ">", "-=0.5"), pause/resume/reverse globais, label, repeat com yoyo, e callbacks por marco. Animações soltas exigem delay manual que vira inferno de manutenção',
      'Timeline é mais lento',
      'Não pode pausar',
    ],
    correct: 1,
    explanation: 'tl.to(a, {x:100}).to(b, {y:50}, "<").to(c, {opacity:1}, "-=0.3"). "<" = início do anterior, ">" = fim. "-=0.3" = 300ms antes do fim. Você pode tl.pause(), tl.reverse(), tl.timeScale(2). Adicionar etapa = inserir linha, não recalcular delays. Disney 12 principles aplicam timing — Timeline é a ferramenta certa.',
  },
  {
    question: 'O que gsap.context() resolve em React?',
    options: [
      'Cria contexto React',
      'Cria escopo para todas as animações criadas dentro dele — ao chamar ctx.revert() no cleanup do useEffect, GSAP reverte todos os estados, mata todas as tweens e ScrollTriggers criados no escopo. Sem ele = leaks, animations fantasmas após unmount',
      'É opcional sempre',
      'Substitui useEffect',
    ],
    correct: 1,
    explanation: 'useEffect(() => { const ctx = gsap.context(() => { gsap.to(".box", {x:100}); ScrollTrigger.create({...}); }, scopeRef); return () => ctx.revert(); }, []). Sem context: tweens permanecem, ScrollTriggers seguem ouvindo scroll após unmount, vazamentos em SPA. Em Next 16 com strict mode (double-mount) é absolutamente obrigatório.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="gsap-profissional"
      title="GSAP profissional: Timeline, ScrollTrigger, Flip"
      icon="🎯"
      xp={70}
      readTime={14}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="css-animations-avancado"
      nextTitle="CSS animations avançado: @keyframes, @scroll-timeline"
      quiz={quiz}
    >
      <Section title="Por que GSAP voltou ao mainstream" accent={accent}>
        <Timeline
          accent={accent}
          title="A jornada do GSAP"
          events={[
            { when: '2008', label: 'TweenLite/TweenMax em ActionScript (Flash)', detail: 'Jack Doyle cria a engine que viraria padrão de animação web' },
            { when: '2013', label: 'GSAP JavaScript edition', detail: 'Migração para JS, mantendo a API timeline-first' },
            { when: '2017', label: 'GSAP 2 + Club GreenSock', detail: 'Plugins premium pagos: ScrollTrigger, Flip, MorphSVG, SplitText' },
            { when: '2020', label: 'GSAP 3 — API mais limpa', detail: 'gsap.to()/timeline() simplificados; uso comercial dispara' },
            { when: 'mai/2024', label: 'Webflow adquire GreenSock — 100% free', highlight: true, detail: 'Todos os plugins premium liberados; remove única objeção histórica' },
            { when: '2025–2026', label: 'GSAP 3.13+ — adoção em agências e SaaS', detail: 'Rivalidade saudável com Motion; coexistência em stacks modernos' },
          ]}
        />
      </Section>

      <Section title="Anatomia do GSAP" accent={accent}>
        <CodeBlock lang="js" filename="basico.js">{`import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);

// 1) tween simples
gsap.to('.box', {
  x: 200,                    // qualquer prop CSS funciona
  rotation: 360,
  duration: 1,
  ease: 'power2.inOut',
  delay: 0.2,
  onStart: () => {},
  onComplete: () => {},
});

// 2) from — anima DE um estado ATÉ o atual
gsap.from('.reveal', {
  y: 80,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,             // delay sequencial entre cada match
});

// 3) fromTo — controle total
gsap.fromTo('.bar',
  { scaleX: 0, transformOrigin: '0%' },
  { scaleX: 1, duration: 0.5, ease: 'power3.out' }
);

// 4) set — sem animação (instantâneo)
gsap.set('.box', { x: 0, opacity: 0 });`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'duration', v: 'em segundos (não ms) — convenção GreenSock' },
            { k: 'ease', v: '"power2.inOut" | "back.out(1.7)" | "elastic.out(1, 0.3)" — visualizador em gsap.com/docs/v3/Eases' },
            { k: 'stagger', v: 'número (delay fixo) ou {amount, from, grid, axis} — controle complexo de cascata' },
            { k: 'repeat', v: 'número de repetições (-1 = infinito); combinar com yoyo: true para ping-pong' },
            { k: 'onUpdate / onStart / onComplete', v: 'callbacks por etapa — útil para sincronizar com áudio/estado' },
            { k: 'transformOrigin', v: '"center" (default), "0% 100%", "50px 50px" — pivô da rotação/scale' },
          ]}
        />
      </Section>

      <Section title="Timeline — a feature killer do GSAP" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Onde Motion exige variants + stagger + delays para coreografar, GSAP nasceu timeline-first. Cada
          tween é posicionada em segundos absolutos ou relativos. Adicionar, remover, reordenar é trivial.
        </p>
        <CodeBlock lang="js" filename="timeline.js">{`const tl = gsap.timeline({
  paused: true,
  repeat: -1,
  yoyo: true,
  defaults: { duration: 0.5, ease: 'power2.out' },  // aplica em todas as tweens
});

tl
  .from('.hero-title', { opacity: 0, y: 30 })
  .from('.hero-sub', { opacity: 0, y: 20 }, '-=0.3')      // 300ms antes do fim
  .from('.hero-cta', { scale: 0.8, opacity: 0 }, '<')     // junto com o anterior
  .to('.hero-img', { rotation: 360 }, '>')                // após o anterior
  .addLabel('intro-done')
  .to('.parallax', { y: -100, duration: 1.5 }, 'intro-done+=0.2');

tl.play();
// tl.pause(); tl.reverse(); tl.seek('intro-done'); tl.timeScale(0.5);`}</CodeBlock>
        <FlowDiagram
          accent={accent}
          title="Position parameter — sintaxe"
          steps={[
            { icon: '"+=0.5"', label: 'após +500ms', desc: 'depois da anterior + delay' },
            { icon: '"-=0.3"', label: 'sobreposição', desc: '300ms antes do fim da anterior' },
            { icon: '"<"', label: 'início', desc: 'mesmo instante que início da anterior' },
            { icon: '">"', label: 'fim', desc: 'imediatamente após a anterior' },
            { icon: '"label"', label: 'marco', desc: 'na posição do label nomeado' },
          ]}
        />
      </Section>

      <Section title="ScrollTrigger — o plugin que matou as concorrências" accent={accent}>
        <CodeBlock lang="js" filename="scroll-trigger.js">{`import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// 1) Reveal simples — dispara ao entrar
gsap.from('.card', {
  opacity: 0,
  y: 60,
  duration: 0.8,
  stagger: 0.15,
  scrollTrigger: {
    trigger: '.cards-section',
    start: 'top 80%',         // top do elemento toca 80% do viewport
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',  // onEnter onLeave onEnterBack onLeaveBack
  },
});

// 2) Scrub — anima conforme o scroll
gsap.to('.parallax-bg', {
  y: -200,
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,               // 1.5s de "smoothing"
  },
});

// 3) Pin — fixa elemento e anima conteúdo durante o scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.horizontal-section',
    start: 'top top',
    end: '+=2000',            // pin por 2000px de scroll
    pin: true,
    scrub: true,
    anticipatePin: 1,         // melhora performance em pin
    markers: true,            // DEV: mostra start/end visualmente
  },
});

tl.to('.slides', { x: '-300%' })       // scroll horizontal clássico
  .to('.caption', { opacity: 1 }, 0);`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'start / end', v: '"trigger viewport" — "top 80%" = top do trigger toca 80% (de cima) do viewport' },
            { k: 'scrub', v: 'true (1:1) | número (smoothing em segundos) | false (só dispara)' },
            { k: 'pin', v: 'true fixa o trigger durante a animação; pinSpacing: false remove o gap' },
            { k: 'toggleActions', v: '"play|pause|resume|reverse|restart|reset|complete|none" para 4 eventos' },
            { k: 'markers', v: 'DEV-only: mostra start/end visualmente — APAGUE em produção' },
            { k: 'invalidateOnRefresh', v: 'true: recalcula em resize/orientação — essencial mobile' },
          ]}
        />
        <Callout tone="info" icon="🧭">
          ScrollTrigger.refresh() força recálculo de posições — chame após mudanças dinâmicas de DOM (fontes
          carregando, imagens redimensionando). Em Next/SSR garanta que <InlineCode>registerPlugin</InlineCode>{' '}
          rode só client-side (dentro de useEffect ou com `&apos;use client&apos;`).
        </Callout>
      </Section>

      <Section title="Flip plugin — animar o impossível" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Quando você muda DOM de forma drástica (mover entre containers, troca grid↔list, expandir lightbox)
          não existe CSS transition que cubra. Flip captura snapshot, muda, e anima do estado antigo para o
          novo via transforms.
        </p>
        <CodeBlock lang="js" filename="flip.js">{`import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

// Kanban: mover card de coluna
function moveCard(cardEl, targetColumn) {
  const state = Flip.getState(cardEl);        // 1) FIRST — bounds atuais
  targetColumn.appendChild(cardEl);            // 2) LAST — muda DOM
  Flip.from(state, {                           // 3) INVERT + 4) PLAY
    duration: 0.5,
    ease: 'power2.inOut',
    absolute: true,                            // detach do fluxo durante anim
    onComplete: () => {},
  });
}

// Troca de layout grid ↔ list
function toggleLayout() {
  const items = document.querySelectorAll('.item');
  const state = Flip.getState(items);
  document.body.classList.toggle('list-mode');
  Flip.from(state, {
    duration: 0.6,
    stagger: 0.04,
    ease: 'power2.inOut',
    absolute: false,
  });
}`}</CodeBlock>
        <DecisionBox
          scenario="Animar mudança de container/layout (Kanban, grid↔list)"
          winner="GSAP Flip"
          winnerColor={accent}
          why="API mais ergonômica: getState/from em 2 linhas. Suporta absolute mode (detach durante anim), nested elements, dimensões dinâmicas. Stagger built-in."
          alternatives={[
            { name: 'Motion layoutId', when: 'Funciona, mas exige render condicional duplicado (componente A desmonta + B monta)' },
            { name: 'FLIP manual', when: 'Possível mas verboso — calcular bounds, aplicar transforms inversos, RAF, cleanup' },
          ]}
        />
      </Section>

      <Section title="GSAP em React/Next — gsap.context() é obrigatório" accent={accent}>
        <CodeBlock lang="tsx" filename="gsap-react.tsx">{`'use client';
import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Tudo aqui é "scoped" ao container
      gsap.from('.title', { y: 50, opacity: 0, duration: 0.8 });
      gsap.from('.cta', { scale: 0.8, opacity: 0, delay: 0.4 });

      ScrollTrigger.create({
        trigger: '.section',
        start: 'top top',
        pin: true,
      });
    }, scope);

    return () => ctx.revert();  // mata TUDO criado no escopo
  }, []);

  return (
    <div ref={scope}>
      <h1 className="title">Olá</h1>
      <button className="cta">Começar</button>
    </div>
  );
}`}</CodeBlock>
        <Callout tone="warn" icon="🚨">
          Em Next 16 + React Strict Mode (double-mount em dev), <strong>sempre</strong>{' '}
          <InlineCode>ctx.revert()</InlineCode> no cleanup. Sem isso, segunda montagem cria tweens duplicadas
          e ScrollTriggers fantasmas. <InlineCode>useLayoutEffect</InlineCode> evita flash entre estado
          inicial e from() — só rode em client component.
        </Callout>
      </Section>

      <Section title="Outros plugins essenciais (agora gratuitos)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Plugin', 'Para que serve', 'Quando usar']}
          rows={[
            ['ScrollTrigger', 'Disparar/scrubbar animações por scroll', 'Reveals, parallax, pin, scroll horizontal'],
            ['Flip', 'Animar mudanças de layout impossíveis', 'Kanban, grid↔list, lightbox, drag-and-drop'],
            ['MorphSVG', 'Morfar path SVG em outro path', 'Ícones que se transformam (menu → close)'],
            ['DrawSVG', 'Animar stroke-dashoffset de SVG', 'Linhas se desenhando, logo reveal'],
            ['MotionPath', 'Animar elemento ao longo de path SVG', 'Avatar seguindo curva, partícula em trajetória'],
            ['SplitText', 'Dividir texto em chars/words/lines', 'Letter stagger, kinetic typography'],
            ['ScrambleText', 'Texto embaralhando até resolver', 'Hero terminal-style, hacking effect'],
            ['Physics2D / InertiaPlugin', 'Decay com física real após drag', 'Swipe cards com momentum, throw-to-dismiss'],
            ['Observer', 'Unificar wheel/touch/pointer/key gestures', 'Custom scroll, swipe nav, scroll-jacking'],
          ]}
        />
      </Section>

      <Section title="Motion vs GSAP — quando escolher cada" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Decisão por caso de uso"
          columns={[
            {
              label: 'Motion vence',
              nodes: [
                { icon: '⚛️', label: 'Projeto React-only', sub: 'Integração natural com lifecycle', tone: 'emphasis' },
                { icon: '🎬', label: 'AnimatePresence', sub: 'Exit animations em mounts/unmounts' },
                { icon: '🪄', label: 'layoutId mágico', sub: 'Shared element em troca de view' },
                { icon: '📦', label: 'Bundle menor (mini)', sub: '~5kb vs ~30kb GSAP+plugins' },
              ],
            },
            {
              label: 'GSAP vence',
              nodes: [
                { icon: '🎼', label: 'Timeline coreografada', sub: 'Cenas marketing, banners ricos', tone: 'emphasis' },
                { icon: '📜', label: 'ScrollTrigger + pin', sub: 'Scroll horizontal, scrubbing complexo' },
                { icon: '🔄', label: 'Flip entre containers', sub: 'API mais ergonômica que layoutId em casos não-React' },
                { icon: '🌐', label: 'Vanilla/Vue/Svelte', sub: 'API idêntica em qualquer stack' },
                { icon: '✏️', label: 'SVG complexo', sub: 'MorphSVG, DrawSVG, MotionPath' },
              ],
            },
          ]}
          legend="Spoiler: ambos coexistem em produção. Motion para microinterações em React, GSAP para hero/scroll storytelling."
        />
      </Section>

      <Section title="Performance e produção" accent={accent}>
        <StackFlow
          accent={accent}
          title="Checklist GSAP em produção"
          items={[
            { icon: '🌳', label: 'Tree-shake plugins', detail: 'Importe só ScrollTrigger/Flip que você usa — bundle inflar é fácil' },
            { icon: '🔌', label: 'gsap.registerPlugin() em client-only', detail: 'Plugins acessam window/document; SSR quebra sem guard' },
            { icon: '🧹', label: 'gsap.context() + revert()', detail: 'Strict mode double-mount cria leaks; obrigatório em React' },
            { icon: '📱', label: 'matchMedia para mobile', detail: 'gsap.matchMedia() roda variantes por breakpoint, com cleanup automático' },
            { icon: '🎯', label: 'force3D: true em transforms complexos', detail: 'Força GPU layer; cuidado com excesso (memory)' },
            { icon: '🚫', label: 'markers: false em produção', detail: 'ScrollTrigger markers DEV-only — esquecer = aparece pro usuário' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Recursos oficiais:</strong> gsap.com/docs/v3, gsap.com/scroll-trigger (interativo), GreenSock
        forum (resposta de Jack Doyle em quase tudo), &quot;The Standard&quot; YouTube channel.
      </Callout>
    </ModuleLayout>
  );
}
