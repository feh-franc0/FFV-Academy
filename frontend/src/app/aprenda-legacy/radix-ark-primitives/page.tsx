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
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('radix-ark-primitives');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "headless primitives" (Radix, Ark) substituíram libs com styling (MUI, Chakra) em DS modernos?',
    options: [
      'Por moda — não há razão técnica',
      'Porque accessibility é a parte difícil (WAI-ARIA, focus management, keyboard nav, screen reader), e Radix/Ark fazem isso certo. Styling é a parte fácil. Libs com estilo casado (MUI) forçam você a fightar o CSS deles ou aceitar uma estética que não combina com o DS. Headless dá controle total de estilo + a11y correto de fábrica',
      'MUI é proprietária',
      'Radix é mais rápido em runtime',
    ],
    correct: 1,
    explanation:
      'Antes de Radix (2020+), times de DS tinham 3 opções ruins: (1) MUI/Chakra com tema customizado (lutando o styling para sair como o design quer), (2) escrever do zero (a11y impossível de acertar), (3) shadcn-style com primitives (a vitória). Radix entregou WAI-ARIA correto + zero styling, e o ecosistema convergiu.',
  },
  {
    question: 'Qual a diferença arquitetural entre Radix UI e Ark UI?',
    options: [
      'São idênticos',
      'Radix UI é React-only, mantida pela WorkOS, mais madura (2020+). Ark UI é multi-framework (React, Vue, Solid, Svelte) construída sobre Zag.js — state machines XState-style que descrevem comportamento agnóstico de framework. Para projetos React puro, Radix é mais leve; para projetos multi-framework ou que querem state machines explícitas, Ark é melhor escolha',
      'Ark é mais antiga',
      'Radix usa state machines também',
    ],
    correct: 1,
    explanation:
      'Ark UI vem do time do Chakra (Segun Adebayo), que percebeu que Chakra v2 estava esticando demais. Zag.js separou a state machine do componente — Ark é só o wrapper React/Vue/Solid em cima. Radix permanece React-first, mas tem mais componentes prontos e ecossistema maior (shadcn é construído em cima).',
  },
  {
    question: 'O que shadcn/ui propõe diferente de uma lib npm tradicional?',
    options: [
      'É só outra lib npm',
      'shadcn/ui não é uma dependência — você usa o CLI para COPIAR o código dos componentes para o seu repo. Você passa a OWN o código. Vantagens: zero versionamento upstream (você não atualiza), pode modificar livremente, é só código + Tailwind + Radix por baixo. Desvantagens: você é responsável por bugs e updates. Padrão "copy-paste, not dependency"',
      'É só Radix renomeado',
      'shadcn substitui Tailwind',
    ],
    correct: 1,
    explanation:
      'shadcn é uma mudança de paradigma. Em vez de "instale e use", é "copie e adapte". Para DS interno de empresa, faz total sentido — você já vai customizar tudo mesmo, então por que ter dependência? Para libs públicas que querem updates automáticos, não serve.',
  },
  {
    question: 'Por que WAI-ARIA "correto" é tão difícil de fazer manualmente?',
    options: [
      'Não é difícil, qualquer dev acerta',
      'Porque WAI-ARIA Authoring Practices (APG) define ~50 patterns cada um com regras detalhadas: focus management em modal (focus trap, return focus on close), keyboard nav em listbox (arrow keys, type-ahead, home/end), aria-live para anúncios, roles compostos, etc. Acertar 1 pattern leva semanas; acertar 30 patterns leva 1 ano-pessoa. Radix tem isso testado contra NVDA, JAWS, VoiceOver',
      'É só adicionar role="button"',
      'Screen readers são todos iguais',
    ],
    correct: 1,
    explanation:
      'Esse é o argumento mais forte para usar Radix/Ark em vez de escrever do zero. WAI-ARIA APG (https://www.w3.org/WAI/ARIA/apg/) é uma bíblia de 300+ páginas. Sergei Chestakov e Pedro Duarte (Radix maintainers) e Segun Adebayo (Ark) gastaram anos testando contra screen readers reais. Reimplementar é desperdício de engenharia.',
  },
  {
    question: 'O que é "asChild" pattern do Radix?',
    options: [
      'É deprecated',
      '<Radix.Trigger asChild><MyButton/></Radix.Trigger> faz o Radix passar as props (refs, handlers, aria-*) para o filho em vez de renderizar seu próprio <button>. Permite usar SEU componente Button como trigger sem aninhar elementos (evita <button><button/></button>). É composição via prop, não wrapping. Padrão copiado por várias libs depois',
      'É só uma flag de debug',
      'Cria um child fragment',
    ],
    correct: 1,
    explanation:
      'asChild é uma das ideias mais influentes do Radix, baseada em Slot do React. Em vez de a lib decidir qual elemento renderizar, você passa o seu e a lib injeta props nele. Resolve o problema histórico de "como customizo o elemento raiz desse componente?". Hoje é padrão em ecosistema React.',
  },
  {
    question: 'Quando NÃO usar Radix/Ark e escrever do zero é justificável?',
    options: [
      'Sempre escrever do zero',
      'Componentes muito simples (Avatar, Badge, Card que são divs com classes) ou casos onde a lib não cobre (componente proprietário sem equivalente APG). Para Dialog, Dropdown, Select, Tooltip, Tabs, Accordion, Popover — sempre Radix/Ark. Escrever esses do zero em 2026 é decisão de engenharia ruim a menos que tenha justificativa muito forte (bundle size em micro-frontend)',
      'Sempre usar Radix',
      'Nunca usar Radix',
    ],
    correct: 1,
    explanation:
      'A regra prática: se o componente está no WAI-ARIA APG, use Radix/Ark. Se é só estrutura visual sem comportamento (Card, Section), escreva do zero. O custo de manutenção de um Dropdown WAI-ARIA-correto caseiro é enorme e o bug fica oculto até alguém testar com VoiceOver.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="radix-ark-primitives"
      title="Radix UI vs Ark UI: headless primitives modernos"
      icon="🧱"
      xp={65}
      readTime={13}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="tailwind-v4-plugins"
      nextTitle="Tailwind v4: CSS-first, plugins e custom utilities"
      quiz={quiz}
    >
      <Section title="A virada do mercado: de styled libs para headless primitives" accent={accent}>
        <p>
          Entre 2015 e 2020, o ecossistema React de DS era dominado por bibliotecas com estilo
          acoplado: Material-UI (depois MUI), Ant Design, Chakra UI, Semantic UI React. Você
          instalava, escolhia tema e tinha um conjunto de componentes prontos. O problema:
          essas libs forçavam um look-and-feel que raramente combinava com o brand do produto,
          e customizar profundamente exigia lutar contra centenas de seletores CSS internos.
          A11y, na maior parte dos casos, era ok mas não excelente.
        </p>
        <p>
          A partir de 2020, três projetos mudaram a paisagem: <strong>Radix UI</strong> (Pedro
          Duarte, depois adquirido pela WorkOS), <strong>Headless UI</strong> (Tailwind Labs,
          mais limitado) e mais tarde <strong>Ark UI</strong> (Segun Adebayo, criador do
          Chakra). A proposta: separar comportamento + a11y (problema difícil) de styling
          (problema fácil). Hoje, em 2026, Radix + Tailwind + shadcn é o stack consenso para
          DS novos em React.
        </p>
        <Callout tone="info" icon="📜">
          Cronologia: Radix UI v1 (2021), Headless UI (2020 — só ~10 componentes), Ark UI
          (2023), shadcn/ui (2023). Chakra v3 (2024) reescrito sobre Ark UI. Material UI v6
          (2024) introduziu "MUI Base" (sua tentativa de headless, atrasada).
        </Callout>
      </Section>

      <Section title="O que significa &quot;headless&quot; na prática" accent={accent}>
        <p>
          "Headless" = lib entrega comportamento, refs, handlers, aria-*, mas <strong>nenhum
          estilo</strong>. Você compõe o visual. Exemplo concreto, um Dialog do Radix:
        </p>
        <CodeBlock lang="tsx">{`import * as Dialog from '@radix-ui/react-dialog';

export function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn-primary">Abrir</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-[var(--color-surface-bg)] p-6 rounded-2xl
                     w-[90vw] max-w-md shadow-xl"
        >
          <Dialog.Title className="text-lg font-bold">Confirmar</Dialog.Title>
          <Dialog.Description className="text-sm text-[var(--color-muted)]">
            Tem certeza?
          </Dialog.Description>
          <div className="flex gap-2 mt-4 justify-end">
            <Dialog.Close asChild>
              <button className="btn-secondary">Cancelar</button>
            </Dialog.Close>
            <button className="btn-danger">Confirmar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}`}</CodeBlock>
        <p>
          O que Radix faz por baixo, gratuitamente, e que você teria que reimplementar:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Focus trap', v: 'Tab/Shift+Tab ficam dentro do modal. Não vaza para elementos por trás.' },
            { k: 'Focus return', v: 'Ao fechar, foco volta para o trigger que abriu (acessibilidade crítica).' },
            { k: 'Escape close', v: 'ESC fecha o modal. Configurável.' },
            { k: 'Pointer down outside', v: 'Click fora do content fecha (configurável).' },
            { k: 'aria-modal, role="dialog"', v: 'Atributos WAI-ARIA aplicados automaticamente.' },
            { k: 'aria-labelledby + describedby', v: 'Title e Description são auto-linkados via ids gerados.' },
            { k: 'Body scroll lock', v: 'Background não rola enquanto modal aberto.' },
            { k: 'Portal', v: 'Content renderiza em <body>, evitando z-index/overflow issues.' },
            { k: 'Composition via asChild', v: 'Você usa seu Button próprio como Trigger sem nested buttons.' },
          ]}
        />
      </Section>

      <Section title="Radix UI: anatomia e maturidade" accent={accent}>
        <p>
          Radix UI tem ~30 primitives cobrindo basicamente todo o WAI-ARIA APG: Accordion,
          AlertDialog, AspectRatio, Avatar, Checkbox, Collapsible, ContextMenu, Dialog,
          DropdownMenu, Form, HoverCard, Label, Menubar, NavigationMenu, Popover, Progress,
          RadioGroup, ScrollArea, Select, Separator, Slider, Slot, Switch, Tabs, Toast,
          Toggle, ToggleGroup, Toolbar, Tooltip, VisuallyHidden.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Detalhes', 'Implicação']}
          rows={[
            ['Framework', 'React 18+ (apenas)', 'Não serve Vue/Solid/Svelte'],
            ['Tamanho', '~3-8 KB gzipped por componente', 'Tree-shakeable, paga só o que usa'],
            ['Bundling', 'ESM nativo, sem CSS', 'Plug & play em qualquer bundler moderno'],
            ['Mantenedor', 'WorkOS (adquiriu em 2024)', 'Backing comercial = sustentabilidade'],
            ['Versionamento', 'Por primitive (radix-ui/react-dialog 1.x.y)', 'Pode atualizar selectivamente'],
            ['Docs', 'radix-ui.com/primitives', 'Excelente, com playgrounds'],
            ['Testes A11y', 'Contra NVDA/JAWS/VoiceOver real', 'Confiança em produção'],
          ]}
        />
      </Section>

      <Section title="Ark UI + Zag.js: state machines explícitas" accent={accent}>
        <p>
          Ark UI tem uma arquitetura diferente. Por baixo está <strong>Zag.js</strong>, uma lib
          de state machines em estilo XState que descreve componentes de UI complexos como
          máquinas finitas. Cada estado e transição é explícito; o Ark é um adapter fino para
          React, Vue, Solid e Svelte sobre as machines.
        </p>
        <FlowDiagram
          title="Arquitetura Ark UI"
          accent={accent}
          steps={[
            { label: 'Zag.js core', desc: 'State machines vanilla TS' },
            { label: 'Framework adapter', desc: 'React/Vue/Solid/Svelte hook' },
            { label: 'Ark UI primitive', desc: 'Componente headless' },
            { label: 'Seu DS', desc: 'Styling Tailwind/CSS' },
          ]}
        />
        <CodeBlock lang="tsx">{`// Ark UI Dialog — quase isomorfo ao Radix, mas multi-framework
import { Dialog } from '@ark-ui/react/dialog';

export function MyArkDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Abrir</Dialog.Trigger>
      <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
      <Dialog.Positioner className="fixed inset-0 grid place-items-center">
        <Dialog.Content className="bg-white p-6 rounded-xl">
          <Dialog.Title>Confirmar</Dialog.Title>
          <Dialog.Description>Tem certeza?</Dialog.Description>
          <Dialog.CloseTrigger>Fechar</Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}`}</CodeBlock>
        <p>
          Em monorepos com aplicações React + Vue + Svelte (raro mas existe), Ark é
          imbatível. Em React puro, Radix tem ecosistema maior (shadcn é o exemplo).
        </p>
      </Section>

      <Section title="Radix vs Ark: comparação direta" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'Radix UI', 'Ark UI', 'Veredicto']}
          rows={[
            ['Frameworks', 'React only', 'React + Vue + Solid + Svelte', 'Ark se multi-framework'],
            ['Maturidade', '2020+, mais estável', '2023+, evoluindo rápido', 'Radix em prod-critical'],
            ['Tamanho bundle', '3-8KB/primitive', 'Similar (Zag tem overhead)', 'Empate'],
            ['Ecossistema', 'shadcn, Vercel, Linear, Tremor', 'Chakra v3, crescendo', 'Radix líder'],
            ['State machines explícitas', 'Não (custom hooks)', 'Sim (Zag.js)', 'Ark para debugging complexo'],
            ['API surface', 'Pequena, idiomática React', 'Maior (positioner extras)', 'Radix mais simples'],
            ['Tooling/devtools', 'Padrão React DevTools', 'Zag DevTools (XState inspector)', 'Ark se debugar state'],
          ]}
        />
        <Callout tone="info" icon="💡">
          Recomendação 2026 para React puro: <strong>Radix UI + shadcn/ui</strong>. Para
          monorepo multi-framework: <strong>Ark UI</strong>. Para Chakra v3 users: você já está
          em Ark sem saber.
        </Callout>
      </Section>

      <Section title="shadcn/ui: o pattern copy-paste" accent={accent}>
        <p>
          shadcn/ui (Shad CN, pseudônimo de uma pessoa só, hoje empregado pela Vercel) é a
          referência mais influente de DS em 2024-26. Não é uma lib npm — é um <strong>CLI que
          copia código para seu repo</strong>. Você roda <InlineCode>npx shadcn add button</InlineCode>{' '}
          e ele cria <InlineCode>components/ui/button.tsx</InlineCode> no seu projeto.
        </p>
        <CodeBlock lang="bash">{`# init em projeto Next.js
npx shadcn@latest init
# escolhe estilo (default/new-york), color base, CSS variables, etc.

# adiciona componentes
npx shadcn@latest add button card dialog dropdown-menu select

# resultado: arquivos copiados em components/ui/*
# Você OWN esse código agora — pode editar livremente`}</CodeBlock>
        <p>
          Cada componente shadcn é, internamente: <strong>Radix primitive + Tailwind classes
          + cva (class-variance-authority) para variants</strong>. Exemplo simplificado:
        </p>
        <CodeBlock lang="tsx">{`// components/ui/button.tsx (copiado pelo shadcn CLI)
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          shadcn não é uma lib mágica — é um <em>pattern</em> que você copia. Em time grande,
          combine com changesets para versionar internamente. shadcn registry agora suporta
          custom registries (sua empresa pode publicar um shadcn próprio).
        </Callout>
      </Section>

      <Section title="O pattern asChild + Slot" accent={accent}>
        <p>
          <InlineCode>asChild</InlineCode> é a ideia mais influente do Radix. Em vez do componente
          renderizar seu próprio elemento, ele <strong>delega o render</strong> ao child e
          injeta props (ref, aria-*, handlers) via <InlineCode>Slot</InlineCode>:
        </p>
        <CodeBlock lang="tsx">{`// Sem asChild — gera <button><a>...</a></button> (HTML inválido)
<Dialog.Trigger>
  <a href="/somewhere">Trigger</a>
</Dialog.Trigger>

// Com asChild — Slot mescla as props no <a>, vira <a aria-*="..." onClick={...}>
<Dialog.Trigger asChild>
  <a href="/somewhere">Trigger</a>
</Dialog.Trigger>

// Útil para integrar com Next.js <Link>:
<Dialog.Trigger asChild>
  <Link href="/somewhere">Abrir</Link>
</Dialog.Trigger>`}</CodeBlock>
        <p>
          O componente <InlineCode>Slot</InlineCode> mescla props (className, style, refs) corretamente.
          O conflito mais comum é com className — Slot concatena. Refs são merged via{' '}
          <InlineCode>useComposedRefs</InlineCode>.
        </p>
      </Section>

      <Section title="Quando escrever do zero (e quando não)" accent={accent}>
        <DecisionBox
          scenario="Devo usar Radix/Ark ou escrever esse componente do zero?"
          winner="Componentes WAI-ARIA APG → Radix/Ark. Componentes puramente visuais → do zero."
          winnerColor={accent}
          why="WAI-ARIA APG cobre ~30 patterns complexos (Dialog, Listbox, Combobox, Menu, Tabs, etc.). Acertar a11y de cada um é trabalho de meses. Para esses, sempre usar lib. Para Card, Badge, Avatar, Separator, etc. (puramente visuais sem comportamento), do zero é mais simples e tem zero dependência."
          alternatives={[
            { name: 'Radix UI', when: 'React puro, quer estabilidade e ecossistema maduro' },
            { name: 'Ark UI', when: 'Multi-framework ou quer state machines explícitas' },
            { name: 'shadcn/ui', when: 'Quer ownership total do código, está confortável copiando' },
            { name: 'Headless UI', when: 'Já está no ecossistema Tailwind Labs e precisa só do básico' },
            { name: 'Do zero', when: 'Componente visual sem comportamento ARIA (Card, Badge, Tag)' },
          ]}
        />
      </Section>

      <Section title="Antipatterns comuns" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Não envolva Radix primitives em mais um wrapper que esconde asChild.</strong> O
          padrão "MyDialog component que recebe trigger e content como props" anula a
          composição. Use Radix diretamente em cada feature, ou exporte os primitives
          re-exportados do seu DS.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Não esconda o estado do Radix em useState próprio.</strong> Radix tem props{' '}
          <InlineCode>open</InlineCode> / <InlineCode>onOpenChange</InlineCode> (controlled), use elas em vez
          de duplicar state. Se duplicar, vai dessincronizar em algum edge case.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Não use Tooltip como container de informação importante.</strong> Tooltip não
          é acessível para teclado em screen readers de mobile. Para info crítica, use Popover
          (focusável) ou exiba inline.
        </Callout>
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Posso animar transitions em Radix?"
          a="Sim — Radix expõe data-state='open' | 'closed' em todos componentes animáveis. Use CSS transitions ou Framer Motion com AnimatePresence. shadcn já vem com transitions Tailwind padrão."
        />
        <QAItem
          q="Como customizar focus ring globalmente?"
          a="Radix não estiliza focus por default. Defina globalmente em globals.css: *:focus-visible { outline: 2px solid var(--color-action-primary); outline-offset: 2px; }. Use focus-visible (não focus) para evitar ring no mouse click."
        />
        <QAItem
          q="Radix tem componente de Toast?"
          a="Sim, @radix-ui/react-toast. Mas a comunidade prefere sonner (Emil Kowalski) — API mais simples, animações melhores. shadcn agora padroniza em sonner."
        />
        <QAItem
          q="Como testar componentes Radix em Storybook?"
          a="Storybook 9 + interaction tests (Vitest browser mode) executa eventos teclado/click em jsdom-not-required ambiente. Para a11y, addon-a11y roda axe automaticamente em cada story. Detalhado no módulo Storybook."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          <strong>Radix UI docs</strong> (radix-ui.com/primitives),{' '}
          <strong>Ark UI docs</strong> (ark-ui.com), <strong>Zag.js</strong> (zagjs.com),{' '}
          <strong>shadcn/ui</strong> (ui.shadcn.com), <strong>WAI-ARIA Authoring Practices Guide</strong>{' '}
          (w3.org/WAI/ARIA/apg/), <strong>Pedro Duarte — "Building accessible components"</strong>{' '}
          (talks no YouTube), e o livro <em>"Inclusive Components"</em> de Heydon Pickering.
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: headless primitives ganharam porque a11y é o problema difícil e
          styling é o fácil. Radix UI domina React; Ark UI ganha em multi-framework. shadcn é
          pattern de ownership ("copy, not depend") — popular para DS interno. asChild é a
          ideia mais influente do Radix. Não reimplemente Dialog/Dropdown/Select/Combobox do
          zero — você nunca vai acertar WAI-ARIA tão bem quanto Radix testou. Próximo módulo:
          Tailwind v4 como motor de styling em cima desses primitives.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
