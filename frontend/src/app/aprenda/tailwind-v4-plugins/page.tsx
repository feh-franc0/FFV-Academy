import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, KeyValue, FlowDiagram, DecisionBox, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tailwind-v4-plugins');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou de fundamental do Tailwind v3 para v4?',
    options: [
      'Nada, só renomearam',
      'v4 (lançado 2025) é CSS-first: configuração via @theme directive em CSS (não tailwind.config.js), engine Lightning CSS (Rust, ~10x mais rápido), container queries first-class, @starting-style, suporte nativo a OKLCH/HSL/light-dark(), zero PostCSS plugin chain. v3 ainda é JS-config + PostCSS. Migration tem codemod oficial mas exige revisão',
      'Removeu utility classes',
      'É backwards compat 100%',
    ],
    correct: 1,
    explanation:
      'Tailwind v4 é uma reescrita arquitetural, não evolução incremental. A motivação principal foi performance (Lightning CSS substituiu o engine antigo) e alinhamento com CSS moderno (custom properties, light-dark, container queries). Adam Wathan escreveu sobre a transição em blog post oficial.',
  },
  {
    question: 'Como integrar design tokens (tokens.css gerado por Style Dictionary) com Tailwind v4?',
    options: [
      'Não dá pra integrar',
      '@theme directive aceita custom properties diretamente. Você importa tokens.css em globals.css, e dentro de @theme refere as custom properties: --color-action-primary: var(--color-action-primary). Tailwind v4 gera utility classes bg-action-primary, text-action-primary, etc. automaticamente. Zero duplicação',
      'Precisa duplicar todos tokens no tailwind.config',
      'Tailwind não suporta tokens',
    ],
    correct: 1,
    explanation:
      'Esse é o sonho realizado: Style Dictionary gera tokens.css → @theme consome → utility classes geradas. Em v3, você tinha que duplicar tudo no tailwind.config.ts (DRY violation). Em v4, é fonte única.',
  },
  {
    question: 'Por que container queries são "first-class" em v4 e por que isso importa?',
    options: [
      'Não importa',
      'Container queries permitem componente reagir ao tamanho do container pai (não viewport). v4 inclui @container, cqw/cqh/cqi/cqb units e prefix @sm/@md/@lg de utilities. Importa porque DS são compostos: Card em sidebar vs Card em main grid devem se adaptar diferente. Antes precisava de JS (ResizeObserver) ou prop manual',
      'Container queries não existem em CSS',
      'Só para mobile',
    ],
    correct: 1,
    explanation:
      'Container queries (CSS Containment Module Level 3) chegaram em browsers em 2022-23. Mudam radicalmente como pensamos responsividade em DS: cada componente é responsive ao seu container, não ao viewport global. Tailwind v4 expôs isso como cidadão de primeira: <div className="@container"><Card className="@md:flex-row" /></div>.',
  },
  {
    question: 'O que é @starting-style e quando usar?',
    options: [
      'Inválido em CSS',
      '@starting-style é regra CSS (Color Adjust Level 5) que define estilo INICIAL antes de transitions, permitindo animar elementos entrando (display:none → block) com CSS puro. Antes precisava JS para gerenciar enter/leave (Framer Motion AnimatePresence). v4 expõe via variant starting:. Útil para popover/dialog enter sem lib JS',
      'É só syntactic sugar',
      'Funciona só no Safari',
    ],
    correct: 1,
    explanation:
      'O eterno problema de "como animo um elemento que entra no DOM via display:block?" tinha que ser resolvido com JS lib. @starting-style + transition-behavior: allow-discrete resolve em CSS puro. Suporte: Chrome 117+, Safari 17.5+, Firefox 129+.',
  },
  {
    question: 'Como criar utility custom em Tailwind v4 (substituto do plugin JS de v3)?',
    options: [
      'Não dá pra criar utilities custom',
      '@utility directive: @utility scrollbar-thin { scrollbar-width: thin; }. Vira classe scrollbar-thin. Substitui addUtilities() do plugin v3. Pode aceitar valores: @utility text-shadow-* { text-shadow: 0 1px 0 --value(--text-shadow-*) }. Muito mais simples que escrever plugin JS — agora é CSS puro',
      'Precisa plugin JS',
      'Só strings literais',
    ],
    correct: 1,
    explanation:
      '@utility é uma das melhores adições de v4. Em v3, qualquer utility custom virava função JS verbosa em tailwind.config. Agora é regra CSS declarativa. Plugins ainda existem para casos complexos, mas 90% dos casos resolvem com @utility.',
  },
  {
    question: 'Por que NÃO recomendam @apply em Tailwind v4 (e em v3 também)?',
    options: [
      'Recomendam usar @apply sempre',
      '@apply re-introduz CSS abstrato (.btn-primary { @apply bg-blue-500 px-4... }) — anula a vantagem de utility-first (collocation, deletable). Em v4, prefira componentes React/Vue/Svelte como abstração: <Button variant="primary">. @apply só faz sentido em casos raros: estilos não componentizáveis (article p, terceiros sem JSX) ou print styles',
      '@apply é mais rápido',
      '@apply deprecated',
    ],
    correct: 1,
    explanation:
      'Adam Wathan já disse várias vezes em podcasts: @apply foi adicionado para apaziguar usuários transicionando de BEM/CSS modules, mas o uso pesado anula 80% do benefício de Tailwind. Em componentes React/Vue, sempre prefira utility classes inline + variants via cva. @apply é último recurso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tailwind-v4-plugins"
      title="Tailwind v4: CSS-first, plugins e custom utilities"
      icon="💨"
      xp={60}
      readTime={12}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="storybook-9-chromatic"
      nextTitle="Storybook 9 + Chromatic: visual regression em CI"
      quiz={quiz}
    >
      <Section title="Por que Tailwind v4 é uma virada e não evolução" accent={accent}>
        <p>
          Tailwind v4 (lançado oficial em janeiro 2025) é reescrita arquitetural, não evolução
          incremental. Adam Wathan e equipe Tailwind Labs gastaram ~18 meses repensando o
          engine. A motivação foi tripla: <strong>(1) performance</strong> — Lightning CSS (escrito em
          Rust pela Devon Govett) substituiu o engine JS antigo, ~10x mais rápido em projetos
          grandes; <strong>(2) alinhamento com CSS moderno</strong> — custom properties,
          light-dark(), container queries, OKLCH viraram cidadãos primeira; <strong>(3) DX</strong>{' '}
          — configuração via CSS (@theme) em vez de tailwind.config.js elimina a duplicação com
          tokens e simplifica setup.
        </p>
        <Callout tone="info" icon="📜">
          Cronologia: v0 (2017, primeiro release público), v1 (2019), v2 (2020), v3 (2021,{' '}
          <em>JIT engine</em> revolucionou perf), v4 (2025, CSS-first). O salto v3→v4 foi
          maior que v2→v3.
        </Callout>
      </Section>

      <Section title="Configuração CSS-first com @theme" accent={accent}>
        <p>
          Em v3, você abria <InlineCode>tailwind.config.ts</InlineCode> e escrevia um objeto JS gigante
          duplicando tokens. Em v4, escreve em CSS:
        </p>
        <CodeBlock lang="css">{`/* globals.css */
@import "tailwindcss";

/* Importa tokens gerados por Style Dictionary */
@import "./tokens.css";

@theme {
  /* Custom properties consumidas pelo Tailwind para gerar utilities */
  --font-display: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --color-action-primary: var(--color-action-primary);
  --color-surface-bg: var(--color-surface-bg);
  --color-surface-fg: var(--color-surface-fg);

  --spacing-section: 4rem;
  --spacing-card: 1.5rem;

  --radius-card: 1rem;
  --shadow-elevated: 0 10px 30px rgba(0,0,0,.08);

  --breakpoint-3xl: 120rem;
}`}</CodeBlock>
        <p>
          Resultado: classes como <InlineCode>bg-action-primary</InlineCode>,{' '}
          <InlineCode>font-display</InlineCode>, <InlineCode>p-section</InlineCode>, <InlineCode>shadow-elevated</InlineCode>,{' '}
          <InlineCode>3xl:flex</InlineCode> são geradas automaticamente. Sem duplicação com tokens.
          Style Dictionary é a fonte; @theme é o consumidor.
        </p>
        <Callout tone="info" icon="💡">
          Você pode misturar @theme com tailwind.config.ts no v4 para migração gradual. Mas o
          futuro é CSS-only. Em projetos novos, comece direto sem config.ts.
        </Callout>
      </Section>

      <Section title="Lightning CSS: o engine Rust" accent={accent}>
        <p>
          Lightning CSS, criado por Devon Govett (autor da Parcel), substituiu PostCSS + autoprefixer + cssnano + nesting plugin no v4. É escrito em Rust, distribuído como native binary via npm, e faz:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Parsing', v: 'CSS source → AST em ms' },
            { k: 'Nesting', v: 'CSS Nesting nativo, sem precisar de postcss-nesting plugin' },
            { k: 'Vendor prefixes', v: 'Browserslist-aware, sem autoprefixer' },
            { k: 'Minification', v: 'Mais agressiva que cssnano, sem perda' },
            { k: 'Custom transforms', v: 'OKLCH → sRGB fallback automático para browsers legacy' },
            { k: 'Source maps', v: 'Precisas, sem overhead' },
          ]}
        />
        <p>
          Ganho prático em projetos grandes (1000+ componentes): build CSS de 5s no v3 vai
          para ~500ms no v4. Em CI, isso é diferença entre 8min e 3min.
        </p>
      </Section>

      <Section title="Container queries first-class" accent={accent}>
        <p>
          Container queries permitem componente reagir ao tamanho do container pai, não ao
          viewport global. Em DS, isso é transformador: o mesmo Card em sidebar (320px) e em
          main grid (800px) se adapta naturalmente.
        </p>
        <CodeBlock lang="tsx">{`// Card que muda layout baseado no container
export function Card({ children }) {
  return (
    <div className="@container">
      <article className="
        flex flex-col gap-2 p-4
        @md:flex-row @md:gap-6 @md:p-6
        @lg:gap-8
      ">
        {children}
      </article>
    </div>
  );
}

// Em sidebar 300px: layout vertical
// Em main 800px: layout horizontal com mais padding
// Sem media query global, sem prop responsive`}</CodeBlock>
        <p>
          Em v4, prefixos <InlineCode>@sm:</InlineCode>, <InlineCode>@md:</InlineCode>, <InlineCode>@lg:</InlineCode>{' '}
          funcionam como media queries mas em container scope. Breakpoints customizáveis via{' '}
          <InlineCode>--container-*</InlineCode> em @theme.
        </p>
        <Callout tone="warn" icon="⚠️">
          Container queries têm custo de layout: cada elemento <InlineCode>@container</InlineCode> cria
          um containment block. Não envolva tudo. Use só em componentes que realmente precisam
          (Card, Sidebar item, GridItem). Browsers só recalculam quando necessário.
        </Callout>
      </Section>

      <Section title="@utility: custom utilities sem plugin JS" accent={accent}>
        <p>
          Em v3, criar utility custom exigia escrever plugin JS verboso. Em v4 é CSS puro:
        </p>
        <CodeBlock lang="css">{`/* Utility simples */
@utility scrollbar-thin {
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; height: 6px; }
}

/* Utility com valor variável */
@utility text-shadow-* {
  text-shadow: 0 1px 0 --value(--text-shadow-*);
}
/* uso: text-shadow-sm, text-shadow-lg (definidos no @theme) */

/* Utility com múltiplas variantes */
@utility tap-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}`}</CodeBlock>
        <p>
          A maioria dos plugins de v3 (typography, forms, aspect-ratio, container-queries) ou
          virou nativo em v4 ou pode ser reescrito como @utility em poucas linhas. Plugins JS
          ainda existem para casos complexos (custom variants, dynamic logic) mas são raros.
        </p>
      </Section>

      <Section title="@starting-style: animações de entrada em CSS puro" accent={accent}>
        <p>
          Problema clássico: como animar elemento que entra no DOM via display:none → block? Em
          v3, era Framer Motion ou hack de transition-delay. Em v4, com{' '}
          <InlineCode>@starting-style</InlineCode> + <InlineCode>transition-behavior: allow-discrete</InlineCode>,
          resolve em CSS:
        </p>
        <CodeBlock lang="css">{`/* Tooltip que aparece com fade + slide */
.tooltip {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms, transform 200ms, display 200ms allow-discrete;
}

.tooltip[data-state="closed"] {
  display: none;
}

@starting-style {
  .tooltip[data-state="open"] {
    opacity: 0;
    transform: translateY(-4px);
  }
}`}</CodeBlock>
        <p>
          Em Tailwind v4, há variant <InlineCode>starting:</InlineCode>:{' '}
          <InlineCode>starting:opacity-0 starting:-translate-y-1</InlineCode>. Combine com{' '}
          <InlineCode>transition-discrete</InlineCode> para animar display.
        </p>
      </Section>

      <Section title="Migração v3 → v4" accent={accent}>
        <p>
          Tailwind Labs publicou codemod oficial:
        </p>
        <CodeBlock lang="bash">{`npx @tailwindcss/upgrade@latest`}</CodeBlock>
        <p>
          O codemod converte:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'tailwind.config.ts', v: '→ @theme em globals.css (ou mantém ambos)' },
            { k: 'PostCSS config', v: 'Removido; v4 não precisa de PostCSS' },
            { k: 'shadow-sm', v: '→ shadow-xs (renomeação de escala)' },
            { k: 'rounded-lg', v: '→ rounded-xl (escalas mudaram em alguns casos)' },
            { k: 'bg-opacity-*', v: '→ bg-{color}/{N} (modifier syntax já existia em v3)' },
            { k: '@layer base/components/utilities', v: 'Continua funcionando, mas @utility é preferido' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          O codemod cobre ~80%. Revisão manual é obrigatória. Plugins JS de terceiros podem
          precisar reescrita. Bundle CSS pode aumentar transitoriamente até você migrar para
          @utility. Faça em branch dedicada, com Chromatic ativo, e merge só depois de visual
          regression aprovada.
        </Callout>
      </Section>

      <Section title="cva (class-variance-authority): variants tipados" accent={accent}>
        <p>
          Tailwind não tem solução nativa para "variants de componente" (button primary vs
          secondary vs destructive). A lib <strong>cva</strong> (Joe Bell) virou o padrão de
          facto, especialmente combinado com shadcn:
        </p>
        <CodeBlock lang="tsx">{`import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-xl border bg-surface-bg text-surface-fg',
  {
    variants: {
      variant: {
        default: 'border-border shadow-sm',
        elevated: 'border-transparent shadow-elevated',
        ghost: 'border-transparent shadow-none bg-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
      },
    },
    compoundVariants: [
      // Quando variant=ghost E padding=sm, sobrescreve
      { variant: 'ghost', padding: 'sm', class: 'p-2' },
    ],
    defaultVariants: { variant: 'default', padding: 'md' },
  }
);

export interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export function Card({ variant, padding, children }: CardProps) {
  return <div className={cardVariants({ variant, padding })}>{children}</div>;
}`}</CodeBlock>
        <p>
          <InlineCode>VariantProps</InlineCode> dá tipos TypeScript automáticos. tv (tailwind-variants)
          é alternativa mais recente com features extras (slots, responsive variants).
        </p>
      </Section>

      <Section title="Composing com Radix + Tailwind + cva" accent={accent}>
        <p>
          O stack consenso 2026 combina três peças:
        </p>
        <FlowDiagram
          title="Stack DS moderno"
          accent={accent}
          steps={[
            { label: 'Radix UI', desc: 'Comportamento + a11y' },
            { label: 'Tailwind v4', desc: 'Styling via utilities + tokens' },
            { label: 'cva', desc: 'Variants tipados' },
            { label: 'Componente final', desc: 'Exporta pronto para uso' },
          ]}
        />
        <p>
          Esse é exatamente o pattern shadcn. Você OWNs o código, customiza livremente, e tem a11y de fábrica.
        </p>
      </Section>

      <Section title="Quando NÃO usar Tailwind" accent={accent}>
        <DecisionBox
          scenario="Tailwind v4 é sempre a melhor escolha?"
          winner="Sim para 90% dos novos projetos React/Next.js/Vue/Svelte"
          winnerColor={accent}
          why="Utility-first com tokens via @theme + Lightning CSS é o stack mais performático e produtivo em 2026. Combinado com Radix + cva, vira o consenso. Exceções: WebComponents (precisa CSS encapsulado), projetos legacy com SCSS já estabelecido, ou casos onde CSS-in-JS oferece dynamic styling crítico (raro)."
          alternatives={[
            { name: 'CSS Modules', when: 'Projeto legacy ou time prefere escopo CSS tradicional' },
            { name: 'Vanilla Extract', when: 'Quer type-safe CSS-in-TS com zero runtime' },
            { name: 'Styled Components', when: 'Projeto legacy com investment significativo' },
            { name: 'Open Props', when: 'Quer custom properties prontos sem utility classes' },
            { name: 'CSS puro + tokens', when: 'Time pequeno, projeto simples, prefere ortodoxia' },
          ]}
        />
      </Section>

      <Section title="Antipatterns frequentes" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>@apply abuse.</strong> Reusar utilities via @apply em centenas de classes
          custom anula utility-first. Prefira componente React + cva.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Valores hardcoded ([280px], [#ff4500]).</strong> Use sparingly. Se aparecer
          repetidamente, vire token no @theme.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Mistura tailwind + inline style.</strong> Inline style vence specificity e
          quebra dark mode (não consome custom properties via classes). Sempre prefira classes.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Classes condicionais sem clsx/cn.</strong>{' '}
          <InlineCode>className={'`bg-blue ${isActive && \'border-2\'}`'}</InlineCode> quebra com falsy
          values. Use <InlineCode>cn(...)</InlineCode> (cn = clsx + tailwind-merge) que dedupe e resolve
          conflitos.
        </Callout>
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Tailwind v4 funciona com Next.js 16 + static export?"
          a="Sim, perfeitamente. Lightning CSS roda no build, gera CSS estático, exporta. Zero runtime JS necessário. Configuração via @theme em globals.css."
        />
        <QAItem
          q="Como usar Tailwind v4 com Storybook 9?"
          a="Storybook 9 suporta v4 nativamente via @storybook/addon-styling-webpack ou Vite plugin. Importa globals.css em preview.ts. Detalhado no módulo Storybook."
        />
        <QAItem
          q="Posso usar Tailwind v4 e v3 no mesmo monorepo?"
          a="Sim, em packages separados. Em mesmo bundle, não — conflitos de utilities. Migre package por package."
        />
        <QAItem
          q="tailwind-merge ainda é necessário em v4?"
          a="Sim. cva + tailwind-merge (via cn helper) resolve conflitos de classes derivadas de variants vs override. v4 não mudou esse problema."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          <strong>Tailwind v4 docs</strong> (tailwindcss.com/docs/v4-beta),{' '}
          <strong>Adam Wathan — "Open Sourcing Tailwind v4"</strong> (blog post oficial),{' '}
          <strong>Lightning CSS</strong> (lightningcss.dev),{' '}
          <strong>cva (class-variance-authority)</strong> (cva.style), <strong>shadcn/ui</strong>{' '}
          (ui.shadcn.com), e Adam Wathan + Steve Schoger no podcast "Refactoring UI" sobre
          design system thinking.
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: Tailwind v4 é virada arquitetural. CSS-first via @theme elimina
          duplicação com tokens. Lightning CSS dá perf 10x. Container queries + light-dark()
          + @starting-style + @utility tornam features modernas de CSS acessíveis. Combine com
          Radix + cva para stack DS consenso. Antipatterns: @apply abuse, valores hardcoded,
          inline styles. Próximo módulo: Storybook 9 + Chromatic para fechar o ciclo com
          visual regression em CI.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
