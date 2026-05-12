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
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('view-transitions-api-pratica');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que document.startViewTransition() faz por baixo dos panos?',
    options: [
      'Cria CSS transition',
      'Tira snapshot do estado atual da página (old), executa o callback que muda o DOM (sync), tira snapshot do novo estado (new), e cria pseudo-elementos ::view-transition-old(*) e ::view-transition-new(*) sobre o conteúdo durante a animação — você anima esses pseudos com CSS puro',
      'Recarrega a página',
      'Salva localStorage',
    ],
    correct: 1,
    explanation: 'startViewTransition(callback) é o coração da API. Browser: 1) snapshot pixel-perfect do estado atual; 2) chama callback() para você mudar DOM/CSS sincronamente; 3) snapshot do novo; 4) gera ::view-transition-group/old/new como overlay e aplica CSS animations default (cross-fade); 5) seu CSS customiza. Tudo orquestrado pelo navegador, sem React.',
  },
  {
    question: 'Para que serve view-transition-name?',
    options: [
      'É só metadata',
      'Marca um elemento como ANIMATED INDEPENDENTEMENTE durante a view transition. Elementos sem name viram parte do "root snapshot" e fazem só cross-fade. Com name único, browser captura old/new daquele elemento separado e anima posição/tamanho — base de shared element transitions',
      'Apenas para SVG',
      'Para SEO',
    ],
    correct: 1,
    explanation: 'view-transition-name: hero-img em CSS marca o elemento. Antes da transição existe na página A; depois na página B em outro lugar. Browser cria ::view-transition-group(hero-img) com snapshots ::view-transition-old(hero-img) e ::view-transition-new(hero-img), animando entre as posições/tamanhos. É shared element transition zero-JS-config.',
  },
  {
    question: 'Diferença entre same-document e cross-document view transitions?',
    options: [
      'São iguais',
      'Same-document: usa document.startViewTransition(updateCallback) — você controla a mudança DOM (SPA, route change interno). Cross-document: usa @view-transition { navigation: auto } em CSS — navegação entre páginas DIFERENTES (MPA) anima automaticamente. Cross-document é Chrome 126+ baseline',
      'Cross-document não existe',
      'Same-document é descontinuado',
    ],
    correct: 1,
    explanation: 'Same-document (Chrome 111+) anima dentro da mesma página — ideal para SPA/SSR com client-side routing. Cross-document (Chrome 126+) anima entre páginas via @view-transition em CSS, sem JS — MPA tradicional, Astro, Rails, Django, qualquer site multi-página finalmente ganha transitions. Astro 4 e SvelteKit têm helpers; Next 16 expõe via unstable_after + experimental.',
  },
  {
    question: 'Por que ::view-transition-old(name) e ::view-transition-new(name) são fundamentais?',
    options: [
      'Não importam',
      'São os pseudo-elementos que representam os snapshots durante a transição. Você customiza-os com animation: meu-out 0.3s | meu-in 0.3s para sobrescrever o cross-fade default. Combinados com view-transition-name dão controle total da coreografia',
      'Apenas decorativos',
      'Só existem em prod',
    ],
    correct: 1,
    explanation: 'Hierarquia: ::view-transition (root) > ::view-transition-group(name) > ::view-transition-image-pair(name) > {::view-transition-old(name), ::view-transition-new(name)}. Você target esses pseudos com CSS e aplica @keyframes próprios. Default é cross-fade nos pares. Customizando: slide-out + slide-in, scale, blur — Disney 12 timing principles aplicam.',
  },
  {
    question: 'O que aconteceu se você esquecer de aguardar startViewTransition?',
    options: [
      'Nada',
      'O callback retorna um ViewTransition object com promises (ready, finished, updateCallbackDone). Sem await, código depois da chamada roda antes do snapshot estar pronto — race condition. Em React, fazer setState DENTRO do callback (flushSync se necessário) é essencial para o browser tirar snapshot do novo estado certo',
      'Quebra o browser',
      'Causa SSR error',
    ],
    correct: 1,
    explanation: 'document.startViewTransition(() => { /* DOM update SÍNCRONO aqui */ }) — em React, setState é assíncrono; precisa flushSync(() => setState(...)) dentro do callback para garantir DOM atualizado antes do snapshot novo. As 3 promises (ready, finished, updateCallbackDone) permitem orquestrar com outras animações ou esperar para iniciar áudio.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="view-transitions-api-pratica"
      title="View Transitions API na prática: rotas e state"
      icon="🚪"
      xp={60}
      readTime={12}
      trailName="Animation & Motion Engineering"
      trailColor={accent}
      nextSlug="scroll-driven-animations"
      nextTitle="Scroll-driven animations: ScrollTimeline puro CSS"
      quiz={quiz}
    >
      <Section title="O que View Transitions resolve" accent={accent}>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Antes da View Transitions API, animar transição de estado/rota era um pesadelo: você tinha que
          manter o componente antigo montado, renderizar o novo por cima, sincronizar mounts/unmounts, gerir
          z-index. Em MPA tradicional era simplesmente impossível. A API resolve isso no navegador.
        </p>
        <Timeline
          accent={accent}
          title="Adoção"
          events={[
            { when: '2023', label: 'View Transitions API (same-document) — Chrome 111+', detail: 'Apenas SPA por enquanto; SVG/HTML snapshots ainda em evolução' },
            { when: '2024', label: 'Astro 4, SvelteKit, Next 14 expõem helpers', detail: 'Drop-in para navegação client-side' },
            { when: 'jun/2024', label: 'Cross-document — Chrome 126+ baseline', highlight: true, detail: 'MPA ganha transitions via @view-transition CSS, zero JS' },
            { when: '2025', label: 'Safari 18+ ship same-document', detail: 'Suporte cross-browser melhora; Firefox em flag' },
            { when: '2026', label: 'View Transitions Level 2 — multi-page automation', detail: 'CSS-only navigation com types e selectors avançados' },
          ]}
        />
      </Section>

      <Section title="Anatomia: same-document" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Pipeline do startViewTransition"
          orientation="vertical"
          steps={[
            { icon: '📸', label: 'Snapshot OLD', desc: 'Browser captura pixel-perfect do estado atual' },
            { icon: '⚙️', label: 'updateCallback()', desc: 'Você muda DOM sincronamente' },
            { icon: '📸', label: 'Snapshot NEW', desc: 'Browser captura novo estado' },
            { icon: '🎬', label: 'Pseudos animam', desc: '::view-transition-old/new + group rodam CSS' },
            { icon: '🧹', label: 'Cleanup', desc: 'Pseudos somem; DOM real toma seu lugar' },
          ]}
        />
        <CodeBlock lang="ts" filename="basico.ts">{`// 1) Verificar suporte
function startTransition(updateDOM: () => void) {
  if (!document.startViewTransition) {
    updateDOM();  // fallback graceful
    return;
  }
  return document.startViewTransition(updateDOM);
}

// 2) Uso direto
startTransition(() => {
  document.querySelector('.theme')?.classList.toggle('dark');
});

// 3) Com React — flushSync força DOM update SÍNCRONO
import { flushSync } from 'react-dom';

function navigate(newPath: string) {
  document.startViewTransition(() => {
    flushSync(() => {
      setRoute(newPath);  // se for assíncrono, callback retorna antes do DOM mudar
    });
  });
}

// 4) Aguardar promises
const t = document.startViewTransition(updateDOM);
await t.ready;             // snapshots prontos, animação começou
await t.updateCallbackDone; // callback rodou
await t.finished;           // animação terminou`}</CodeBlock>
        <Callout tone="warn" icon="⚛️">
          <strong>React gotcha:</strong> setState é assíncrono. Dentro do callback de startViewTransition, sem
          flushSync, o React agenda update para depois — quando o browser tira o snapshot &quot;new&quot;, ainda
          está no estado antigo. Resultado: animação não acontece (ou anima do A para o A).
        </Callout>
      </Section>

      <Section title="CSS — customizando a animação" accent={accent}>
        <CodeBlock lang="css" filename="transitions.css">{`/* Default: cross-fade 0.25s no root */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* Customizar fade por slide */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
}
@keyframes slide-to-left {
  to { transform: translateX(-100%); }
}

::view-transition-old(root) {
  animation: 0.3s ease-out both slide-to-left;
}
::view-transition-new(root) {
  animation: 0.3s ease-out both slide-from-right;
}

/* Shared element via view-transition-name */
.thumbnail { view-transition-name: card-image; }
/* Após navegação, a tag <img> em /detail/123 também tem: */
.detail-hero { view-transition-name: card-image; }

/* Browser anima POSIÇÃO/TAMANHO entre os dois automaticamente */
::view-transition-group(card-image) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: '::view-transition-group(name)', v: 'Wrapper do par old/new — animação de POSIÇÃO/TAMANHO (FLIP automático)' },
            { k: '::view-transition-image-pair(name)', v: 'Sub-wrapper que contém old + new sobrepostos — útil para z-index' },
            { k: '::view-transition-old(name)', v: 'Snapshot do estado antigo — anima sua saída' },
            { k: '::view-transition-new(name)', v: 'Snapshot do novo estado — anima sua entrada' },
            { k: '::view-transition (root)', v: 'O overlay topo da hierarquia — controla z-index global da transição' },
          ]}
        />
      </Section>

      <Section title="Cross-document — MPA finalmente ganha transitions" accent={accent}>
        <CodeBlock lang="css" filename="cross-document.css">{`/* Habilita transition automática entre páginas (mesmo origin) */
@view-transition {
  navigation: auto;
}

/* Customizar por type (Level 2) */
@view-transition {
  navigation: auto;
  types: slide-forward;  /* customizado via JS: setViewTransitionType */
}

/* Em /produtos.html */
.product-image { view-transition-name: hero; }

/* Em /produtos/[id].html */
.detail-image { view-transition-name: hero; }
/* Browser anima entre as duas páginas — zero JavaScript */`}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Same-document', 'Cross-document']}
          rows={[
            ['Como dispara', 'document.startViewTransition() em JS', '@view-transition { navigation: auto } em CSS'],
            ['Cenário', 'SPA / SSR com client-side routing', 'MPA tradicional, Astro static, Rails, Django, Hugo'],
            ['Mesmo origin', 'N/A (mesma página)', 'OBRIGATÓRIO — mesma origem por security'],
            ['Suporte', 'Chrome 111+, Safari 18+', 'Chrome 126+ baseline; Safari 18.2+'],
            ['Performance', 'Snapshot client-side', 'Snapshot na navegação — browser otimiza'],
            ['Configuração', 'Por chamada de JS', 'Global via CSS @view-transition'],
          ]}
        />
        <Callout tone="success" icon="🚀">
          <strong>Para sites estáticos:</strong> 3 linhas de CSS (@view-transition + navigation: auto) +
          view-transition-name em elementos compartilhados = navegação animada profissional. Astro 4 e Next
          (com router App) suportam isso por default em browsers compatíveis.
        </Callout>
      </Section>

      <Section title="React + Next App Router" accent={accent}>
        <CodeBlock lang="tsx" filename="next-router.tsx">{`'use client';
import { useRouter } from 'next/navigation';
import { flushSync } from 'react-dom';

export function TransitionLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!document.startViewTransition) {
      router.push(href);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        router.push(href);
      });
    });
  };

  return <a href={href} onClick={handleClick}>{children}</a>;
}

// uso:
<TransitionLink href="/produtos/123">Ver produto</TransitionLink>

// CSS — shared element entre páginas
// /produtos/page.tsx: <img className="thumb" style={{ viewTransitionName: 'p-' + id }} />
// /produtos/[id]/page.tsx: <img className="hero" style={{ viewTransitionName: 'p-' + id }} />`}</CodeBlock>
        <Callout tone="info" icon="📦">
          <strong>Bibliotecas que ajudam:</strong> <InlineCode>next-view-transitions</InlineCode> (wrapper
          para App Router), Astro <InlineCode>{`<ClientRouter />`}</InlineCode> (built-in desde 4.0),
          SvelteKit <InlineCode>onNavigate</InlineCode> hook.
        </Callout>
      </Section>

      <Section title="Padrões comuns prontos" accent={accent}>
        <CodeBlock lang="css" filename="patterns.css">{`/* 1) Theme switch com clip-path circular (Chrome dev style) */
::view-transition-new(root) {
  animation: clip-reveal 0.5s ease-out;
}
@keyframes clip-reveal {
  from { clip-path: circle(0% at 100% 0%); }
  to   { clip-path: circle(150% at 100% 0%); }
}

/* 2) Modal entrando com scale + fade */
::view-transition-new(modal) {
  animation: modal-in 0.3s cubic-bezier(0.2, 0.9, 0.3, 1) both;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
}

/* 3) Card → full page (hero transition) */
/* basta marcar view-transition-name: card-X em ambos os lados */
::view-transition-group(card-product-123) {
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 4) Respeitar prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar View Transitions" accent={accent}>
        <DecisionBox
          scenario="Animação dentro de um componente sem mudança de rota/estado de página"
          winner="CSS transition ou Motion"
          winnerColor={accent}
          why="View Transitions é overkill para hover/toggle — snapshot é caro (browser pinta a página inteira). Reserve para mudanças significativas de DOM ou navegação."
          alternatives={[
            { name: 'View Transitions', when: 'Use quando muda 30%+ do DOM ou cruza rota/state significativo' },
            { name: 'Motion layoutId', when: 'Para shared element dentro de um único componente React' },
          ]}
        />
        <StackFlow
          accent={accent}
          title="Limitações conhecidas"
          items={[
            { icon: '🚫', label: 'Não funciona em iframes', detail: 'Snapshot não captura cross-origin content' },
            { icon: '⏱️', label: 'Snapshot pode demorar em páginas grandes', detail: 'Browser precisa pintar toda a viewport — em layouts complexos vê-se latência' },
            { icon: '🔄', label: 'Apenas elementos visíveis', detail: 'Conteúdo fora da viewport não é capturado; aparece "do nada" na nova página' },
            { icon: '🎯', label: 'view-transition-name deve ser ÚNICO no DOM', detail: 'Dois elementos com mesmo name no mesmo momento = erro silencioso (animação não roda)' },
            { icon: '📐', label: 'Snapshots não interagem (pointer events)', detail: 'Durante a transição user não pode clicar nos pseudos' },
          ]}
        />
      </Section>

      <Callout tone="success" icon="📚">
        <strong>Recursos:</strong> developer.chrome.com/docs/web-platform/view-transitions (Jake Archibald +
        Bramus), live-transitions.netlify.app (demos cross-document), Astro Docs &quot;View Transitions&quot;,
        Cassidy Williams threads sobre setup em Next.
      </Callout>
    </ModuleLayout>
  );
}
