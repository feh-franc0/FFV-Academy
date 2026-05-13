import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('css-moderno-layers-has');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema real Cascade Layers (@layer) resolve?',
    options: [
      'Nenhum',
      'Specificity wars: antes, um reset global com seletor específico vencia estilos do seu componente, forçando !important. Com @layer, você ordena camadas (reset → base → components → utilities) e a camada posterior vence — independente da specificity. Desmonta guerra entre CSS de biblioteca e CSS próprio',
      'Só estilo',
      'Só do bundle',
    ],
    correct: 1,
    explanation: 'Cascade Layers resolvem de vez o problema de ordenação entre biblioteca + utility (Tailwind) + seu CSS. Cada camada tem prioridade própria, independente de specificity interna. Você escreve @layer reset, base, components, utilities; ordem do @layer no topo define a prioridade final.',
  },
  {
    question: 'O que :has() permite pela primeira vez em CSS?',
    options: [
      'Nada novo',
      'Selecionar elemento PAI baseado em condição de filho/descendente. Ex: form:has(input:user-invalid) para estilar todo o form quando algum campo é inválido, ou li:has(> ul) para estilar item que tem sublist. Antes exigia JS com addEventListener — agora é CSS puro',
      'Selecionar JS',
      'Não selecionar nada',
    ],
    correct: 1,
    explanation: ':has() (wide support desde 2023) é o "parent selector" que CSS sempre quis. Padrões antes impossíveis: card:has(img) para adicionar padding quando há imagem, tr:has(input:checked) para destacar linha selecionada, article:has(h2 + p) para layout com subtítulo. Uso correto transforma padrões de JS em zero JS.',
  },
  {
    question: 'O que a View Transitions API faz?',
    options: [
      'Animação básica',
      'Anima a transição entre dois estados do DOM (ou entre navegações no same-document e cross-document). Você pausa, mostra animação entre "estado antes" e "estado depois" (páginas, filtros de lista, add/remove de item). Antes exigia Framer Motion + ginástica com layoutId; agora é document.startViewTransition() nativo',
      'Só Chrome',
      'Só para SPA',
    ],
    correct: 1,
    explanation: 'View Transitions API (Chrome 111+, same-document; Chrome 126+ cross-document) deu ao browser primitiva para transições shared-element. SPAs usam document.startViewTransition() ao mudar de rota. MPA usa @view-transition { navigation: auto }. Anima elementos com mesmo view-transition-name entre estados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="css-moderno-layers-has"
      title="CSS moderno: Cascade Layers, :has, View Transitions"
      icon="🎨"
      xp={55}
      readTime={13}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="js-moderno-es2024"
      nextTitle="JS moderno: ES2024+, modules, async sem pegadinha"
      quiz={quiz}
    >
      <Section title="CSS saltou de patamar" accent={accent}>
        <p>
          Entre 2022 e 2025 o CSS recebeu mais features utilizáveis do que na década anterior somada. Cinco que mudam o dia-a-dia e esta aula cobre: <strong>Cascade Layers</strong>, <strong>:has()</strong>, <strong>View Transitions</strong>, <strong>nesting nativo</strong> e <strong>color-mix / light-dark</strong>. Dominá-las elimina dependências (Sass, Framer Motion, emotion) em muitos casos.
        </p>
      </Section>

      <Section title="Cascade Layers: fim da guerra de specificity" accent={accent}>
        <CodeBlock lang="css">{`@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui; }
}

@layer base {
  :root {
    --fg: #111;
    --bg: #fff;
  }
  body { color: var(--fg); background: var(--bg); }
}

@layer components {
  .card {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
}

@layer utilities {
  /* regras simples que vencem components, MESMO com specificity menor */
  .mt-0 { margin-top: 0 !important; }
}

/* Camada posterior vence. Independente de specificity interna.
   Especificidade ainda vale DENTRO de uma mesma camada. */`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Padrão pragmático: importe CSS de terceiros em camada dedicada (<code>@import &quot;reset.css&quot; layer(reset);</code>). Seu código em camada <code>app</code> declarada depois vence sem precisar de <code>!important</code>.
        </Callout>
      </Section>

      <Section title=":has() — o seletor pai que CSS sempre quis" accent={accent}>
        <CodeBlock lang="css">{`/* Estiliza form quando qualquer campo está inválido após interação */
form:has(:user-invalid) {
  border: 2px solid crimson;
}

/* Card sem imagem recebe padding extra */
.card:not(:has(img)) {
  padding-top: 2rem;
}

/* Linha de tabela destacada quando checkbox marcado */
tr:has(input[type="checkbox"]:checked) {
  background: #eef6ff;
}

/* Navbar muda estilo quando um dropdown está aberto */
nav:has(.dropdown[popover]:popover-open) {
  background: rgba(0,0,0,0.04);
}

/* Grid parent ajusta colunas quando tem elemento destacado */
.gallery:has(.featured) {
  grid-template-columns: 2fr 1fr;
}`}</CodeBlock>
      </Section>

      <Section title="Nesting nativo: Sass sem Sass" accent={accent}>
        <CodeBlock lang="css">{`/* Wide support desde 2023. Syntax quase idêntica a Sass, com & explícito */
.card {
  padding: 1rem;
  border: 1px solid #e5e7eb;

  & .title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  &:hover {
    border-color: #3b82f6;
  }

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  /* Nesting com :has() é onde fica interessante */
  &:has(img) .title {
    margin-top: 0.5rem;
  }
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O <code>&amp;</code> é obrigatório no nesting CSS nativo (diferente de Sass). Sem ele, <code>.title { }</code> dentro de <code>.card</code> é interpretado como declaração inválida. A syntax é literal: "<code>&amp;</code> refere-se ao seletor pai".
        </Callout>
      </Section>

      <Section title="View Transitions: transições shared-element" accent={accent}>
        <CodeBlock lang="ts">{`// Same-document (SPA) — framework-agnostic
async function navigate(newContent: string) {
  if (!document.startViewTransition) {
    document.querySelector('#root')!.innerHTML = newContent;
    return;
  }

  document.startViewTransition(() => {
    document.querySelector('#root')!.innerHTML = newContent;
  });
}

// CSS controla a animação
/*
::view-transition-old(root) { animation: fade-out 200ms ease; }
::view-transition-new(root) { animation: fade-in 200ms ease; }

// Shared element: mesmo view-transition-name antes e depois
.hero-img { view-transition-name: hero-1; }

// Cross-document (MPA) — Chrome 126+
@view-transition {
  navigation: auto;
}
*/`}</CodeBlock>
      </Section>

      <Section title="color-mix e light-dark: temas sem pré-processador" accent={accent}>
        <CodeBlock lang="css">{`:root {
  color-scheme: light dark;
  --accent: oklch(0.65 0.2 250);

  /* mesma cor, mais clara no hover */
  --accent-hover: color-mix(in oklch, var(--accent) 80%, white);

  /* light-dark(light-value, dark-value) */
  --bg: light-dark(#ffffff, #0a0a0a);
  --fg: light-dark(#111111, #fafafa);
}

body {
  background: var(--bg);
  color: var(--fg);
}

.btn {
  background: var(--accent);
  &:hover { background: var(--accent-hover); }
}`}</CodeBlock>
      </Section>

      <Section title="Anchor positioning: tooltips que não precisam de lib" accent={accent}>
        <CodeBlock lang="css">{`.trigger {
  anchor-name: --trigger-1;
}

.tooltip {
  position: absolute;
  position-anchor: --trigger-1;
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 4px;

  /* Fallback de posição quando o preferido colide com viewport */
  position-try-fallbacks: flip-block, flip-inline;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Anchor positioning ainda é Chrome-only em 2026 (Safari/Firefox atrás). Para prod, feature-detect e use fallback com Floating UI. Mas entender a API prepara para 12-18 meses à frente.
        </Callout>
      </Section>

      <Section title="Resumo" accent={accent}>
        <Callout tone="success" icon="✅">
          Cascade Layers acabam com <code>!important</code>. :has() elimina JS em padrões comuns. View Transitions dão animação entre rotas nativamente. Nesting nativo dispensa Sass em muitos projetos. color-mix e light-dark resolvem tema sem biblioteca. CSS 2026 é ferramenta de primeira classe — não suplemento do framework.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
