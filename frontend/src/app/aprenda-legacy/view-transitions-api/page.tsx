import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('view-transitions-api');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'View Transitions API resolve qual problema histórico?',
    options: [
      'Substituir CSS',
      'Animar transições entre estados do DOM (mesma página) e entre páginas (cross-document, Chrome 126+) sem precisar manter o estado anterior em JS — o browser tira "snapshots" automaticamente',
      'Substituir JavaScript',
      'Eliminar HTML',
    ],
    correct: 1,
    explanation: 'Antes, animar uma transição entre "lista" → "detalhe" exigia manter o item antigo em DOM, calcular delta de posição, animar manualmente. View Transitions automatiza: você muda o DOM em document.startViewTransition() e o browser gera before/after snapshots e morfa.',
  },
  {
    question: 'O que é view-transition-name em CSS?',
    options: [
      'O nome do projeto',
      'Marca um elemento como "tagueado" — elementos com o mesmo view-transition-name em estados diferentes são tratados como o MESMO elemento (animação shared element transition)',
      'Apenas decorativo',
      'Substitui o id HTML',
    ],
    correct: 1,
    explanation: 'view-transition-name é o que ativa "shared element transition": foto de capa na lista vira foto grande no detalhe, com morph automático. Cada nome deve ser único no DOM no momento da transição.',
  },
  {
    question: 'Suporte em maio/2026:',
    options: [
      'Apenas Chrome',
      'Same-document: Chrome 111+, Edge 111+, Safari 18+, Firefox 26+ (estável). Cross-document: Chrome 126+, Safari 18.4+, Firefox parcial — coverage ~85%',
      'Apenas Safari',
      'Suporte universal',
    ],
    correct: 1,
    explanation: 'Same-document chegou primeiro (2023). Cross-document (entre páginas full) é mais recente — Chrome 126 estabilizou em mid-2024. Firefox ainda preview behind flag em algumas builds. Para MPA com View Transitions, ~85% coverage.',
  },
  {
    question: 'Como usar View Transitions com framework moderno?',
    options: [
      'Não funciona com framework',
      'Astro tem built-in via <ViewTransitions />. Next.js 15+ via experimental.viewTransitions. SvelteKit via @sveltejs/kit. Para vanilla, document.startViewTransition() direto',
      'Apenas Vue funciona',
      'Apenas React',
    ],
    correct: 1,
    explanation: 'Em 2026 cobertura de framework é boa: Astro foi o pioneiro (one-liner), Next.js 15 estabilizou em fim de 2024, SvelteKit suporta nativamente. React 19 também tem useViewTransition.',
  },
  {
    question: 'Sobre prefers-reduced-motion e View Transitions:',
    options: [
      'Ignora a preferência',
      'O browser respeita automaticamente — se o usuário tiver prefers-reduced-motion: reduce, a transição cai para crossfade simples ou nada. Mas você ainda deve testar com a preferência ativada',
      'Sempre anima',
      'Desliga as transições para todo mundo',
    ],
    correct: 1,
    explanation: 'O browser tem comportamento sensato por default: prefers-reduced-motion ativo → crossfade simples ou no-op. Você pode customizar via @media (prefers-reduced-motion: reduce). Sempre teste — usuários com vestibular disorders dependem disso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="view-transitions-api"
      title="View Transitions API: SPA-like UX em MPA"
      icon="✨"
      xp={60}
      readTime={12}
      trailName="Browser & Web Internals Profundo"
      trailColor={accent}
      nextSlug="origin-private-fs"
      nextTitle="Origin Private File System"
      quiz={quiz}
    >
      <Section title="O problema que View Transitions resolve" accent={accent}>
        <p className="text-sm leading-6">
          Quer animar a transição entre "/produtos" e "/produtos/banana"? Antes, você precisava de SPA, manter o item antigo na árvore, calcular FLIP manualmente, sincronizar com data fetching. Era a razão de força para escolher React/Next/Vue. Agora o browser oferece a primitiva: <InlineCode>document.startViewTransition()</InlineCode>.
        </p>
        <Callout tone="success">
          MPA com View Transitions ganha 80% do "feeling SPA" sem o custo de SPA. Astro foi o primeiro framework a fazer disso bandeira.
        </Callout>
      </Section>

      <Section title="Same-document — exemplo mais simples" accent={accent}>
        <CodeBlock lang="typescript">{`// JS
function toggleTheme() {
  if (!document.startViewTransition) {
    // fallback: simplesmente muda
    document.documentElement.classList.toggle('dark');
    return;
  }
  document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });
}`}</CodeBlock>
        <CodeBlock lang="css">{`/* CSS — customizar a animação default */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}

::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}`}</CodeBlock>
      </Section>

      <Section title="Shared element transitions — o killer feature" accent={accent}>
        <p className="text-sm leading-6">
          Animar a foto da lista virando o hero do detalhe automaticamente:
        </p>
        <CodeBlock lang="css">{`/* Lista */
.product-card .product-image {
  view-transition-name: var(--vt-name); /* único por item */
}

/* Detalhe */
.product-detail .product-image {
  view-transition-name: var(--vt-name); /* mesmo nome do item correspondente */
}`}</CodeBlock>
        <CodeBlock lang="html">{`<!-- HTML: variável CSS por item -->
<div class="product-card" style="--vt-name: product-42">
  <img class="product-image" src="/p/42.jpg" />
</div>`}</CodeBlock>
        <Callout tone="info">
          Quando a navegação acontece, o browser percebe que dois elementos têm o mesmo view-transition-name e morpha entre eles automaticamente — posição, tamanho, opacidade.
        </Callout>
      </Section>

      <Section title="Cross-document — transições entre páginas (Chrome 126+)" accent={accent}>
        <CodeBlock lang="html">{`<!-- Em ambas as páginas, no <head> -->
<meta name="view-transition" content="same-origin" />

<!-- CSS compartilhado -->
<style>
@view-transition {
  navigation: auto;
}
</style>`}</CodeBlock>
        <p className="text-sm leading-6">
          Com essas linhas, navegar entre páginas <i>same-origin</i> dispara a transição automaticamente. Como Astro/Next/SvelteKit fazem internamente quando você ativa View Transitions.
        </p>
      </Section>

      <Section title="Frameworks em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Framework', 'Como ativar', 'Notas']}
          rows={[
            ['Astro', '<ViewTransitions /> no <head>', 'Pioneiro — DX impecável'],
            ['Next.js 15+', "experimental: { viewTransitions: true }", 'Stable em meados de 2024'],
            ['SvelteKit', 'onNavigate hook + startViewTransition', 'Manual mas simples'],
            ['React 19', 'useViewTransition() hook', 'Estável em 2025'],
            ['Vanilla', 'document.startViewTransition()', 'Sem framework — funciona'],
          ]}
        />
      </Section>

      <Section title="Pitfalls e gotchas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'view-transition-name deve ser único no DOM no momento da transição', v: 'Dois elementos com o mesmo nome simultaneamente = browser ignora a transição' },
            { k: 'Layout shifts impactam', v: 'CLS (Core Web Vital) pode subir se layout muda entre snapshots' },
            { k: 'Não animar em listas longas', v: 'Marcar 200 cards com view-transition-name custa caro — só os visíveis ou em foco' },
            { k: 'A11y first', v: 'Sempre teste com prefers-reduced-motion ativado' },
            { k: 'Cross-document exige same-origin', v: 'Não funciona entre domínios diferentes (security)' },
          ]}
        />
      </Section>

      <Section title="O futuro — Scoped View Transitions" accent={accent}>
        <p className="text-sm leading-6">
          A spec evolui: <b>Scoped View Transitions</b> (em draft para 2026) permite transições dentro de subárvores DOM independentes — múltiplas transições em paralelo na mesma página. Permite componente isolado animar sem reflow no global.
        </p>
      </Section>
    </ModuleLayout>
  );
}
