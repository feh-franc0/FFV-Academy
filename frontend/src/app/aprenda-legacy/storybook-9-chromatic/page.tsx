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

export const metadata = getModuleMetadata('storybook-9-chromatic');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou de fundamental no Storybook 9 vs 7/8?',
    options: [
      'Nada relevante',
      'v9 (2025) é Vite-first (Webpack legacy via opt-in), addon-test integrado com Vitest browser mode (executa stories como testes reais em headless browser), play function para interaction tests, a11y addon roda axe automático, e bundle do builder caiu ~50%. v9 também unificou os addons essenciais (test, a11y, controls, docs) reduzindo configuração',
      'Removeu controls',
      'É backwards compat 100%',
    ],
    correct: 1,
    explanation:
      'Storybook 9 representou consolidação grande. O salto para Vitest browser mode é especialmente importante: as mesmas stories viram testes (interaction + a11y + visual) sem duplicar código. Ferramental para DS chegou ao ponto de "stories são a fonte canônica de truth".',
  },
  {
    question: 'Por que visual regression testing é crítico para um DS sério?',
    options: [
      'Não é crítico, basta lint',
      'Porque mudanças em tokens, primitives ou utilities podem ter efeito visual cascata em centenas de componentes — e revisar PR olhando código não pega isso. Visual regression (Chromatic, Percy, Loki) faz screenshot de cada story antes/depois e mostra pixel-diff. Falsos positivos são raros se baseline está limpa. É como type-check para o visual',
      'Só importa em mobile',
      'Faz CI lento sem benefício',
    ],
    correct: 1,
    explanation:
      'Sem visual regression, time grande quebra DS em produção semanalmente. Designer muda cor de hover em token, isso afeta 47 componentes, code review não pega nada visualmente, CSS muda, deploy quebra UI. Chromatic vira "type-check do visual" — Trevor Blades (Apollo) chamou assim.',
  },
  {
    question: 'Como Chromatic faz visual regression sem ser caro/lento?',
    options: [
      'Roda em local dev sempre',
      'Chromatic builda Storybook em CI, captura screenshot de cada story em browsers (Chrome, Firefox, Safari, Edge) e viewports, compara com baseline (último merge aprovado em main), e envia link no PR com diff visual. Smart skip — só rebuilda stories que mudaram (baseado em chunked hashing). Em PR, designer aprova/rejeita diff visualmente. Custo escala com número de snapshots únicos, não com runs',
      'Roda em local apenas',
      'Não funciona em CI',
    ],
    correct: 1,
    explanation:
      'A engenharia do Chromatic é elegante. TurboSnap (feature deles) detecta quais stories foram afetadas por commits e só recaptura essas. Em projeto com 800 stories, normalmente só 20-50 são afetadas por PR — economiza 95% do custo. Backed por Storybook team mesma.',
  },
  {
    question: 'O que é interaction test (play function) no Storybook?',
    options: [
      'É só visual',
      'Play function é callback async exportado pela story que executa eventos (click, type, hover) via testing-library e faz assertions com expect/jest-axe. Roda no browser real (Vitest browser mode) durante story render. Vira test sem duplicar setup. Exemplo: testar que um Dialog abre ao clicar trigger, foco vai para primeiro field, ESC fecha, foco retorna',
      'Substitui Cypress',
      'Só funciona com classe',
    ],
    correct: 1,
    explanation:
      'Play function é a inovação que matou "escrever story E escrever teste E2E separado". Agora a story é o teste. shadcn componentes vêm com play functions de exemplo. Storybook 9 deixou isso primeira classe.',
  },
  {
    question: 'Por que addon-a11y (axe-core) em CI não substitui auditoria manual?',
    options: [
      'Substitui completamente',
      'Axe detecta ~30% dos problemas de a11y (contraste, alt text, role inválido, label ausente) — os problemas estruturais. Não detecta: focus order quebrado, gestos sem alternativa keyboard, anúncios aria-live inadequados, text alternatives equivalentes mas inadequadas. Auditoria manual com NVDA/VoiceOver pega o outro 70%. Axe é necessário mas não suficiente',
      'Não importa em DS',
      'Manual é dispensável',
    ],
    correct: 1,
    explanation:
      'Esse insight é da Deque (mantenedores do axe-core). Em DS, política saudável: axe em CI para regressions de baseline + auditoria manual trimestral cobrindo top 20 componentes. Sem axe, regressões passam; sem manual, problemas estruturais ficam.',
  },
  {
    question: 'Stories devem ser apenas demo visual ou também documentação?',
    options: [
      'Só demo',
      'Ambos. Storybook 9 + MDX permite story + prose + props table + a11y status em uma página. Convenção: 1 story por variant principal, 1 "All Variants" para overview, exemplos de composição com outros componentes, plus seção "When to use / When not to use" (Brad Frost style). É a documentação viva do DS — substitui Confluence/Notion de design',
      'Só docs Markdown',
      'Stories são deprecated',
    ],
    correct: 1,
    explanation:
      'Storybook como documentação viva é um padrão consolidado. Times maduros (Shopify Polaris, Adobe Spectrum, IBM Carbon) usam Storybook + MDX como a única doc do DS. Designer abre, vê componente em todas variants, copia código, vê quando usar — tudo em uma página.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="storybook-9-chromatic"
      title="Storybook 9 + Chromatic: visual regression em CI"
      icon="📚"
      xp={65}
      readTime={13}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="ds-versioning-semver"
      nextTitle="DS versioning: changesets, semver, deprecation strategy"
      quiz={quiz}
    >
      <Section title="Por que Storybook ainda importa em 2026" accent={accent}>
        <p>
          Houve fase em 2022-23 em que muito time questionou Storybook (lento, bloated, "só
          serve para slideshow"). A virada veio com Storybook 7 (testing primitives), 8 (CSF
          3, Vitest integration beta) e 9 (Vite-first, addon-test estável, a11y integrado).
          Hoje, Storybook em DS sério faz três jobs simultâneos:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Workshop de desenvolvimento', v: 'Renderiza componente isolado, sem precisar subir app inteiro' },
            { k: 'Documentação viva', v: 'MDX + props table + a11y status = doc canônica' },
            { k: 'Plataforma de testes', v: 'Visual regression (Chromatic) + interaction (play) + a11y (axe) em CI' },
          ]}
        />
        <Callout tone="info" icon="📜">
          Cronologia: v0 (2016, Arunoda Susiripala), v6 (2020, CSF 2), v7 (2023, modernização),
          v8 (2024, CSF 3 + Vitest integration), v9 (2025, Vite-first + addon-test estável).
          Mantido pela Chromatic Inc. (Tom Coleman, Michael Shilman). Backed por VC pesado.
        </Callout>
      </Section>

      <Section title="CSF 3 e a anatomia de uma story moderna" accent={accent}>
        <p>
          Component Story Format 3 (CSF 3) reduziu boilerplate. Story é objeto exportado, não
          função:
        </p>
        <CodeBlock lang="tsx">{`// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from 'storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' }, // axe falha CI se violations
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
  tags: ['autodocs'], // gera doc page automática
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Click me' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {['default', 'destructive', 'outline', 'ghost', 'link'].map((v) => (
        <Button key={v} variant={v as any}>{v}</Button>
      ))}
    </div>
  ),
};

// Interaction test — vira teste real no CI via addon-test
export const ClickInteraction: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { text: /click me/i });
    await userEvent.click(button);
    expect(button).toHaveFocus();
  },
};`}</CodeBlock>
        <p>
          Vantagens vs CSF 2 antigo: tipagem precisa (<InlineCode>StoryObj&lt;typeof Component&gt;</InlineCode>), play
          function inline, args explicitos, autodocs tag gera Markdown automático.
        </p>
      </Section>

      <Section title="Configuração de Storybook 9 com Next.js + Tailwind v4" accent={accent}>
        <CodeBlock lang="javascript">{`// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',     // controls, viewport, backgrounds, docs
    '@storybook/addon-a11y',           // axe-core integration
    '@storybook/addon-test',           // Vitest browser mode
    '@storybook/addon-themes',         // toggle light/dark com decorator
    '@chromatic-com/storybook',        // Chromatic preview
  ],
  framework: { text: '@storybook/nextjs-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
};
export default config;`}</CodeBlock>
        <CodeBlock lang="tsx">{`// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/app/globals.css'; // tokens + Tailwind v4

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    a11y: { test: 'error' },
    backgrounds: {
      default: 'surface',
      values: [
        { text: 'surface', value: 'var(--color-surface-bg)' },
        { text: 'subtle',  value: 'var(--color-surface-subtle)' },
      ],
    },
    chromatic: {
      viewports: [375, 768, 1280, 1920], // múltiplos breakpoints
      modes: {
        light: { theme: 'light' },
        dark:  { theme: 'dark' },
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};
export default preview;`}</CodeBlock>
        <p>
          Resultado: toggle de tema no toolbar do Storybook + Chromatic captura cada story em
          4 viewports × 2 temas = 8 snapshots por story. Cobertura visual robusta.
        </p>
      </Section>

      <Section title="addon-test: stories como testes via Vitest browser" accent={accent}>
        <p>
          Storybook 9 introduziu pipeline em que cada story com play function vira teste real
          no CI, rodando em Vitest browser mode (browser headless real, não jsdom). Significa:
          eventos de teclado, focus, scroll funcionam como em produção.
        </p>
        <FlowDiagram
          title="Pipeline addon-test"
          accent={accent}
          steps={[
            { label: 'Story.stories.tsx', desc: 'play function definida' },
            { label: 'Vitest config', desc: 'browser mode + Playwright provider' },
            { label: 'npm test', desc: 'CI roda Vitest, cada story = teste' },
            { label: 'Pass/Fail', desc: 'PR check com link para Storybook' },
          ]}
        />
        <CodeBlock lang="typescript">{`// vitest.config.ts (excerpt)
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-test/vitest-plugin';

export default defineConfig({
  plugins: [
    storybookTest({ storybookScript: 'npm run storybook --no-open' }),
  ],
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
    setupFiles: ['./.storybook/vitest.setup.ts'],
  },
});`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Vitest browser mode tem cost: cada test roda em browser real, ~10-50ms por story.
          Para projeto com 1000 stories + 50 com play, isso é ~30s extra de CI. Vale o custo —
          confiança é incomparável.
        </Callout>
      </Section>

      <Section title="addon-a11y: axe-core em cada story" accent={accent}>
        <p>
          Axe-core (Deque) é a engine de a11y testing padrão da indústria. addon-a11y do
          Storybook roda axe em cada story automaticamente:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Detecta', v: 'Contraste baixo, alt missing, role inválido, label ausente, heading order, etc. ~30% dos issues' },
            { k: 'Configurável', v: 'rules globais (parameters.a11y.config.rules) ou por story' },
            { k: 'Severidade', v: 'parameters.a11y.test = "error" (CI falha) ou "warn" (só log)' },
            { k: 'Não detecta', v: 'Focus order, gestos sem teclado alternativo, anúncios live region semânticos' },
          ]}
        />
        <CodeBlock lang="tsx">{`// override por story se justificado
export const TooltipOnlyContent: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // Tooltip pode ter contrast menor em mobile, regra customizada
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },
  args: { content: 'Info contextual' },
};`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Política recomendada: <strong>parameters.a11y.test = 'error' globalmente</strong>. Se um
          componente specific precisa de exceção justificada, documentar o porquê no story como
          comment. Não criar exceções "para não brigar com CI".
        </Callout>
      </Section>

      <Section title="Chromatic: visual regression real" accent={accent}>
        <p>
          Chromatic é o serviço SaaS dos próprios mantenedores do Storybook. Pipeline em CI:
        </p>
        <CodeBlock lang="yaml">{`# .github/workflows/chromatic.yml
name: Chromatic
on:
  pull_request:
  push:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 } # full history para baseline detection
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - name: Run Chromatic
        uses: chromaui/action@v11
        with:
          projectToken: \${'$'}{{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true # TurboSnap — só stories afetadas
          exitOnceUploaded: true # não bloqueia, comenta no PR
          autoAcceptChanges: main # auto-accept se merge em main`}</CodeBlock>
        <p>
          Resultado em PR: comentário automático com link "47 stories changed (12 accepted, 35
          to review)". Designer aprova/rejeita cada diff em UI web do Chromatic. Aprovação vira
          nova baseline. Workflow completo: code muda → PR aberto → Chromatic captura → diff
          mostra mudanças visuais → designer aprova → merge.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Ferramenta', 'Tipo', 'Cobrança', 'Quando usar']}
          rows={[
            ['Chromatic', 'SaaS, Storybook nativo', 'Por snapshot/mes (grátis até 5k)', 'Padrão para projetos Storybook'],
            ['Percy', 'SaaS, BrowserStack', 'Por snapshot/mes', 'Se já usa BrowserStack stack'],
            ['Loki', 'Self-hosted, Storybook', 'Grátis (open source)', 'Compliance/on-prem obrigatório'],
            ['Playwright visual', 'Self-hosted, framework-agnóstico', 'Grátis', 'Não usa Storybook'],
          ]}
        />
      </Section>

      <Section title="Antipatterns frequentes" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Stories incompletas.</strong> Só "Default" story por componente é insuficiente.
          Mínimo: Default + 1 story por variant principal + AllVariants + DarkMode (via Chromatic
          modes). Sem cobertura de variants, visual regression vira segurança falsa.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Stories que dependem de network/API real.</strong> Usar MSW (Mock Service Worker)
          ou args injetando dados mock. Story não deve quebrar se rede cair em CI.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Auto-aceitar diff em PR.</strong> Anula o ponto de visual regression. Sempre
          revisar manualmente, especialmente em PRs de tokens.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Storybook só local, sem deploy.</strong> Designers, PMs e devs externos precisam
          acessar o Storybook em URL pública (Chromatic faz deploy automático, ou Vercel/Netlify
          para Storybook estático).
        </Callout>
      </Section>

      <Section title="Decisão final" accent={accent}>
        <DecisionBox
          scenario="Devo investir em Storybook + Chromatic para meu DS?"
          winner="Sim se você tem 20+ componentes ou múltiplos consumidores"
          winnerColor={accent}
          why="Storybook é overhead se você tem 5 componentes em 1 app — preview no Next.js dev resolve. Mas a partir de 20+ componentes ou múltiplos apps consumindo o DS, ROI é claro: documentação viva, visual regression, interaction tests e a11y em CI substituem horas-pessoa de bug-hunting e auditoria manual."
          alternatives={[
            { name: 'Storybook + Chromatic', when: 'DS sério com múltiplos consumidores' },
            { name: 'Storybook self-hosted', when: 'Compliance impede SaaS; use Loki para visual' },
            { name: 'Next.js Playground page', when: 'DS pequeno (até ~10 componentes)' },
            { name: 'Histoire (Vue/Solid)', when: 'Ecossistema não-React quer alternativa mais leve' },
            { name: 'Nada, só app', when: 'DS embedded, 1 consumer, time pequeno' },
          ]}
        />
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Quanto custa Chromatic em projeto médio?"
          a="Free tier: 5.000 snapshots/mes. Time growth: $149/mes por 35k snapshots. Em DS com 100 stories × 4 viewports × 2 temas = 800 snapshots por PR, ~80 PRs/mes = 64k snapshots → ~$300/mes. Comparado ao tempo-pessoa que economiza, vale."
        />
        <QAItem
          q="Storybook funciona com Server Components?"
          a="Sim, Storybook 9 + @storybook/nextjs-vite suporta RSC via emulation. Algumas APIs (cookies, headers) precisam mock. Componentes puramente apresentacionais funcionam direto."
        />
        <QAItem
          q="Posso usar Storybook só para docs, sem testes?"
          a="Pode, mas perde 80% do valor. Em 2026, Storybook se justifica principalmente pelo combo testing + visual regression. Para só docs, Docusaurus + MDX serve melhor."
        />
        <QAItem
          q="Como integrar com Figma?"
          a="@storybook/addon-designs liga story a frame Figma. Ferramentas como Story.to.Figma ou Bit fazem reverse (componente Storybook vira Figma asset). Detalhado no módulo Figma-to-code."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          <strong>Storybook docs</strong> (storybook.js.org/docs),{' '}
          <strong>Chromatic docs</strong> (chromatic.com/docs),{' '}
          <strong>"Component-Driven Development" by Tom Coleman</strong>,{' '}
          <strong>Storybook YouTube channel — release talks v8/v9</strong>,{' '}
          <strong>axe-core docs</strong> (deque.com/axe/), e Michael Shilman/Norbert de Langen
          dando talks em conferências (Component Encyclopedia, ReactConf).
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: Storybook 9 + Chromatic vira o sistema nervoso central do DS. Cada
          story é simultaneamente: workshop dev, doc viva, teste visual, teste de interaction,
          teste de a11y. CI deve falhar em a11y violations e mostrar visual diff em cada PR.
          ROI escala com tamanho do DS e número de consumidores. Próximo módulo: como
          versionar essa biblioteca (changesets, semver) sem quebrar consumers.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
