import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('aria-quando-usar-quando-nao');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é a "first rule of ARIA"?',
    options: [
      'Sempre usar ARIA',
      '"No ARIA is better than bad ARIA" — se existe elemento HTML nativo com a semântica, USE ele em vez de reinventar com ARIA. role="button" em div é pior que usar button',
      'ARIA é obrigatório',
      'Sem regras',
    ],
    correct: 1,
    explanation: 'Regra #1 oficial da spec ARIA (W3C). Div com role=button precisa você implementar tabindex, keyboard, focus ring, disabled state — fácil errar. Button nativo vem tudo grátis. ARIA é pra quando HTML não tem o elemento (combobox, tree, grid) ou pra enhancement (aria-label em icon-only button).',
  },
  {
    question: 'Qual a diferença entre aria-live="polite" e aria-live="assertive"?',
    options: [
      'Volume',
      'polite: screen reader anuncia quando terminar de falar o atual (baixa prioridade — status, toast). assertive: interrompe imediatamente (alta prioridade — error crítico, alert). Use polite por default',
      'polite é deprecated',
      'Nenhuma',
    ],
    correct: 1,
    explanation: 'aria-live = live region (conteúdo que muda dinamicamente). polite é respeitoso: espera silêncio. assertive: atropela. Usar assertive demais = irritante. Padrão: toast success polite, error assertive. role="alert" = assertive + atomic.',
  },
  {
    question: 'Quando aria-label é apropriado?',
    options: [
      'Em todo elemento',
      'Em elementos sem TEXTO VISÍVEL que precisam nome acessível — icon-only buttons, inputs sem label, landmarks com mesmo tipo (duas navs precisam aria-label diferente)',
      'Substituir label',
      'Em divs sempre',
    ],
    correct: 1,
    explanation: 'aria-label dá nome programático quando não há texto. Ex: <button><SVG /></button> precisa aria-label="Fechar". <nav aria-label="Breadcrumb"> diferencia de outro <nav aria-label="Main">. Em input com label visível, NÃO use aria-label (redundante e sobrescreve label — some text only).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="aria-quando-usar-quando-nao"
      title="ARIA: quando usar, quando NÃO usar"
      icon="🏷️"
      xp={50}
      readTime={11}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="keyboard-navigation-e-focus-management"
      nextTitle="Keyboard navigation e focus management: sem mouse também"
      quiz={quiz}
    >
      <Section title="ARIA atributos úteis" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>aria-label</strong>: nome acessível invisível</li>
          <li><strong>aria-labelledby</strong>: ref a ID de elemento visível</li>
          <li><strong>aria-describedby</strong>: ref a descrição adicional</li>
          <li><strong>aria-expanded</strong>: estado aberto/fechado (accordion, menu)</li>
          <li><strong>aria-selected</strong>: item selecionado em lista</li>
          <li><strong>aria-current</strong>: page/step atual</li>
          <li><strong>aria-live</strong>: região dinâmica (polite/assertive)</li>
          <li><strong>aria-hidden</strong>: esconder de assistive tech (elemento decorativo)</li>
          <li><strong>aria-disabled</strong>: disabled semântico (ainda focável vs disabled attr)</li>
        </ul>
      </Section>

      <Section title="Live region — toast example" accent={accent}>
        <CodeBlock lang="tsx">{`// Toast container
<div
  role="status"          // = aria-live="polite"
  aria-atomic="true"     // lê a região inteira a cada mudança
  className="sr-only-visible-when-visible"
>
  {toastMessage}
</div>

// Error crítico
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// Setar texto via state faz screen reader anunciar`}</CodeBlock>
      </Section>

      <Section title="Armadilhas" accent={accent}>
        <CodeBlock lang="tsx">{`// ❌ role="button" em div — reinventou button pela metade
<div role="button" onClick={handler}>Click</div>

// ✅ Use button
<button onClick={handler}>Click</button>

// ❌ aria-label sobrescreve texto visível
<button aria-label="OK">Salvar</button>  // screen reader lê "OK", user vê "Salvar"

// ✅ Sem aria-label quando texto existe
<button>Salvar</button>

// ❌ aria-hidden em button interativo — fica invisível pra screen reader mas mouse clica (?!)
<button aria-hidden="true">X</button>

// ✅ Pra icon-only
<button aria-label="Fechar"><svg aria-hidden="true" /></button>`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          ARIA mal feita PIORA a11y. É comum ver apps com ARIA cagado que ficam piores que HTML plain. Menos é mais. Teste com NVDA antes de adicionar ARIA.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
