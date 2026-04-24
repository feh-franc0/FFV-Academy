import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('keyboard-navigation-e-focus-management');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que tabindex="-1" faz?',
    options: [
      'Remove elemento',
      'Torna elemento FOCÁVEL programaticamente (element.focus()) mas NÃO por tab. Útil pra modal receber focus sem entrar na ordem natural de tab',
      'Coloca primeiro na tab order',
      'Disable tab',
    ],
    correct: 1,
    explanation: 'tabindex="0": entra na tab order natural. "-1": focável via JS (focus()) mas fora da tab. Positivo (1, 2, 3): antipattern — distorce ordem, confuso. Uso #1: dar focus programático em regions (modal, error message) sem alterar tab flow.',
  },
  {
    question: 'O que é "focus trap" em modais?',
    options: [
      'Bug',
      'Quando modal abre, tab cycle FICA dentro do modal — ao chegar no último elemento focável, tab volta ao primeiro. Evita user "escapar" pra conteúdo bloqueado embaixo',
      'Estilo visual',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Sem focus trap, tab do dentro do modal vai parar no conteúdo mainstream (escondido visualmente mas ainda focável) — cria estado esquisito. Libs: focus-trap-react, Radix UI primitives fazem automático. HTML dialog nativo (showModal) faz trap grátis.',
  },
  {
    question: 'Para que serve "skip link"?',
    options: [
      'Atalho estético',
      'Link no TOPO da página, normalmente escondido até receber focus, que pula direto pro main content — user de screen reader não precisa tab por header/nav a cada página',
      'Deprecated',
      'Só em mobile',
    ],
    correct: 1,
    explanation: 'Primeira coisa ao dar tab na página: "Pular para conteúdo" link que vira visível. href="#main". Economiza dezenas de tabs por página. WCAG 2.4.1 "Bypass Blocks" — AA requirement. Tem no topo do próprio FFV Academy (procure).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="keyboard-navigation-e-focus-management"
      title="Keyboard navigation e focus management: sem mouse também"
      icon="⌨️"
      xp={50}
      readTime={11}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="screen-readers-na-pratica"
      nextTitle="Screen readers na prática: NVDA, JAWS, VoiceOver"
      quiz={quiz}
    >
      <Section title="Padrões obrigatórios" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Todo elemento interativo focável com Tab</li>
          <li>Enter/Space ativa buttons e links</li>
          <li>Esc fecha modais e dropdowns</li>
          <li>Arrow keys navegam dentro de menu/listbox/grid</li>
          <li>Focus visível (outline CSS não deletado)</li>
          <li>Focus restaurado após modal fechar</li>
          <li>Skip link no topo</li>
        </ul>
      </Section>

      <Section title="Focus management em modal" accent={accent}>
        <CodeBlock lang="tsx">{`// Radix UI (ou dialog HTML nativo) faz isso automaticamente
import { Dialog } from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Abrir</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="..." />
    <Dialog.Content className="...">
      {/* Focus trap automático */}
      {/* Esc fecha automático */}
      {/* Click overlay fecha automático */}
      {/* Focus restaurado após close */}
      <Dialog.Title>Título</Dialog.Title>
      <Dialog.Description>...</Dialog.Description>
      <Dialog.Close>Fechar</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>`}</CodeBlock>
      </Section>

      <Section title="Skip link" accent={accent}>
        <CodeBlock lang="tsx">{`// Layout.tsx — primeiro elemento focável
<a
  href="#main-content"
  className="skip-link"  // invisível até focus
>
  Pular para conteúdo
</a>
<header>...</header>
<main id="main-content">...</main>

// CSS
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
}
.skip-link:focus {
  left: 10px;
  z-index: 9999;
  background: white;
  padding: 8px 16px;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Roving tabindex (pra listas/menus grandes): só um item focável por vez; arrow keys movem o focável. Evita tab em 50 items. Tradução do padrão: tabindex=0 só no item ativo, -1 nos outros, keydown muda.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
