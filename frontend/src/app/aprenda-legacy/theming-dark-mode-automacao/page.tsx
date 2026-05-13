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

export const metadata = getModuleMetadata('theming-dark-mode-automacao');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CSS custom properties (variáveis CSS) são superiores a SCSS variables para theming?',
    options: [
      'São iguais, escolha por preferência',
      'CSS custom properties são resolvidas em runtime e cascateiam pelo DOM, então mudar :root muda toda a árvore sem rebuild. SCSS variables são build-time — você precisa compilar dois arquivos CSS (light/dark) e fazer swap. Custom properties também herdam, suportam color-mix() e light-dark() nativos, e funcionam com Container Queries por contexto',
      'SCSS é mais rápido em runtime',
      'Custom properties não funcionam em browsers modernos',
    ],
    correct: 1,
    explanation:
      'Essa é a virada de chave da última década. SCSS variables exigiam dois bundles CSS pré-gerados ou JS para swap classes. Custom properties + uma classe (data-theme) trocam tudo em uma operação atômica do browser, com perf nativa e sem flicker. Funcionam desde 2017 em todos browsers relevantes.',
  },
  {
    question: 'O que é FOUC (Flash of Unstyled Content) no contexto de dark mode e como evitar?',
    options: [
      'É um bug do React que não tem solução',
      'FOUC é o "flash branco" quando a página carrega em light theme antes do JS do tema aplicar a preferência salva. Solução: inline script blocking no <head> que lê localStorage e seta data-theme ANTES do CSS pintar. Em SSR, ler cookie no servidor e renderizar o HTML já com data-theme correto evita o flash em qualquer caso',
      'Acontece só em Safari',
      'Só Tailwind sabe resolver',
    ],
    correct: 1,
    explanation:
      'FOUC é um dos bugs mais embaraçosos de dark mode. Inline script no <head> roda síncrono antes do render. Em Next.js App Router, a melhor solução é Server Component lendo cookie e aplicando data-theme no <html> direto — zero JS, zero flash, e funciona com static export.',
  },
  {
    question: 'Para que serve a função CSS light-dark()?',
    options: [
      'É só um alias para var()',
      'light-dark(lightValue, darkValue) é uma função CSS nativa (2024+) que retorna o primeiro valor quando color-scheme: light e o segundo quando dark. Elimina a necessidade de duplicar declarações em duas classes. Exige color-scheme declarado no :root para funcionar. Suportada em Chrome 123+, Safari 17.5+, Firefox 120+',
      'É uma feature do Tailwind',
      'Não existe',
    ],
    correct: 1,
    explanation:
      'light-dark() é parte do CSS Color Module Level 5. Mata uma boa parte do boilerplate de theming. Exemplo: color: light-dark(black, white). Para temas além de light/dark, ainda precisa custom properties; light-dark() resolve só o caso binário, que é 80% dos usos.',
  },
  {
    question: 'Class strategy vs data-attribute strategy para theming — qual escolher?',
    options: [
      'class="dark" sempre vence',
      'Ambos funcionam; data-theme="dark" é mais semântico (HTML data attribute documenta intent), permite múltiplos temas além de binary (data-theme="brand-acme-dark") e não conflita com classes utilitárias do Tailwind. Tailwind v4 suporta variants @custom-variant para ambos. Para multi-brand white-label, data-attribute é claramente superior',
      'Class é mais rápida em runtime',
      'data-attribute não funciona em CSS',
    ],
    correct: 1,
    explanation:
      'Diferença de perf é nula; diferença de design é grande. data-theme aceita N valores (light, dark, dim, high-contrast, brand-acme); class precisa de hack para múltiplos. Em DS multi-brand, data-attribute é o padrão. Tailwind v3 forçava class por default, v4 abraçou flexibilidade.',
  },
  {
    question: 'Por que cookie é melhor que localStorage para persistir tema em SSR?',
    options: [
      'Cookie é mais seguro',
      'Cookie é enviado em cada request, então o servidor sabe a preferência ANTES de renderizar HTML e pode aplicar data-theme no <html> server-side. localStorage só existe no client — o server renderiza com default e o client troca depois, causando flash. Para apps Next.js com SSR/static, cookie elimina FOUC sem inline script',
      'localStorage não existe em mobile',
      'São equivalentes',
    ],
    correct: 1,
    explanation:
      'Esse insight é underdocumented. Em Next.js App Router, cookies() do server permite renderizar HTML já com o tema correto. Sem cookie, mesmo SSR causa flash porque o servidor não tem como adivinhar a preferência salva no client. Combinação ideal: cookie (server-side default) + localStorage espelhado para legacy + listener prefers-color-scheme.',
  },
  {
    question: 'Como implementar white-label multi-brand sem duplicar o DS?',
    options: [
      'Fazer fork do código por brand',
      'Tokens semantic apontam para primitives via aliasing. Cada brand é um conjunto de semantic tokens (acme.json, contoso.json) que sobrescreve só os primitive references. Em runtime, data-brand="acme" aplica um set de custom properties via uma única folha gerada por Style Dictionary. Componentes não sabem qual brand está ativo — leem semantic tokens. Mesmo código, N brands',
      'Multi-brand é impossível com tokens',
      'Precisa de iframe por brand',
    ],
    correct: 1,
    explanation:
      'White-label é o teste final de maturidade de tokens. Se os componentes referenciam primitive direto (color.blue.500), você está perdido. Se referenciam semantic (color.action.primary), basta gerar tokens por brand. É como mover o ponto de variação: nos primitives, não nos componentes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="theming-dark-mode-automacao"
      title="Theming + dark mode: prefers-color-scheme + system + manual"
      icon="🌓"
      xp={55}
      readTime={11}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="radix-ark-primitives"
      nextTitle="Radix UI vs Ark UI: headless primitives modernos"
      quiz={quiz}
    >
      <Section title="Dark mode não é mais opcional" accent={accent}>
        <p>
          Em 2025-26, dark mode deixou de ser feature opcional para virar expectativa de
          usuário. iOS, Android, macOS e Windows todos têm preferência de tema sistema-wide. Um
          produto sério deve respeitar a preferência do SO, permitir override manual,
          persistir a escolha, sincronizar entre devices e evitar o flash branco quando alguém
          recarrega a página às 22h. Esse módulo cobre o stack moderno de theming usando CSS
          custom properties, <InlineCode>prefers-color-scheme</InlineCode>,{' '}
          <InlineCode>color-scheme</InlineCode>,{' '}
          <InlineCode>light-dark()</InlineCode> e cookies — sem React boilerplate
          desnecessário.
        </p>
        <Callout tone="info" icon="📜">
          Histórico: <InlineCode>prefers-color-scheme</InlineCode> entrou na spec Media Queries Level 5
          em 2018 e foi adotado por todos os browsers até 2020. <InlineCode>color-scheme</InlineCode> property
          chegou em 2021 (afeta cores nativas do browser: scrollbar, form controls).{' '}
          <InlineCode>light-dark()</InlineCode> function veio em CSS Color Level 5 (2024+) e é o
          syntactic sugar que estávamos esperando.
        </Callout>
      </Section>

      <Section title="Os três sinais de tema (system, manual, persistido)" accent={accent}>
        <p>
          Theming sério lida com três fontes de verdade que precisam compor:
        </p>
        <KeyValue
          accent={accent}
          items={[
            {
              k: '1. Sistema operacional',
              v: 'Browser expõe via prefers-color-scheme (CSS) ou matchMedia (JS). É o default razoável quando usuário não fez override.',
            },
            {
              k: '2. Override manual',
              v: 'Usuário clicou no toggle. Deve sobrescrever o sistema até clicar de novo. Persiste em cookie + localStorage.',
            },
            {
              k: '3. Persistência cross-device',
              v: 'Usuário autenticado: salvar em user.preferences no backend. Próximo login em outro device aplica.',
            },
          ]}
        />
        <p>
          A ordem de precedência (do mais forte para o mais fraco) é:{' '}
          <strong>backend (autenticado) → cookie/localStorage → prefers-color-scheme do SO</strong>.
        </p>
      </Section>

      <Section title="CSS custom properties como motor de theming" accent={accent}>
        <p>
          O motor moderno é simples: definir uma camada semantic de custom properties em{' '}
          <InlineCode>:root</InlineCode>, e sobrescrever em <InlineCode>[data-theme=&quot;dark&quot;]</InlineCode> ou via
          <InlineCode>@media (prefers-color-scheme: dark)</InlineCode>.
        </p>
        <CodeBlock lang="css">{`/* tokens.css gerado pelo Style Dictionary */
:root {
  color-scheme: light dark;             /* informa browser que app suporta ambos */

  /* primitives — não devem ser usados diretamente em componentes */
  --color-blue-500: #2563eb;
  --color-blue-400: #3b82f6;
  --color-neutral-0: #ffffff;
  --color-neutral-900: #0f172a;

  /* semantic tokens — light theme (default) */
  --color-action-primary: var(--color-blue-500);
  --color-surface-background: var(--color-neutral-0);
  --color-surface-foreground: var(--color-neutral-900);
}

/* override quando user escolhe dark manualmente */
[data-theme="dark"] {
  --color-action-primary: var(--color-blue-400);
  --color-surface-background: var(--color-neutral-900);
  --color-surface-foreground: var(--color-neutral-0);
}

/* fallback automático para usuário com preferência do SO (sem override manual) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-action-primary: var(--color-blue-400);
    --color-surface-background: var(--color-neutral-900);
    --color-surface-foreground: var(--color-neutral-0);
  }
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O seletor <InlineCode>:root:not([data-theme])</InlineCode> é a chave: só aplica o fallback do
          SO quando o usuário NÃO escolheu manualmente. Se houver data-theme, ignora a media
          query. Isso preserva a hierarquia: manual &gt; sistema.
        </Callout>
      </Section>

      <Section title="light-dark(): o syntactic sugar moderno" accent={accent}>
        <p>
          A função <InlineCode>light-dark()</InlineCode> nativa (CSS Color Level 5) é o futuro
          quando você precisa apenas de tema binário. Elimina a duplicação de declarações:
        </p>
        <CodeBlock lang="css">{`:root {
  color-scheme: light dark; /* OBRIGATÓRIO para light-dark() funcionar */

  /* uma única declaração resolve ambos os temas */
  --color-surface-bg: light-dark(#ffffff, #0f172a);
  --color-surface-fg: light-dark(#0f172a, #ffffff);
  --color-border: light-dark(#e2e8f0, #334155);
}

body {
  background: var(--color-surface-bg);
  color: var(--color-surface-fg);
}`}</CodeBlock>
        <p>
          Para forçar um tema independente do SO, sobrescreva <InlineCode>color-scheme</InlineCode> num
          ancestral: <InlineCode>[data-theme=&quot;dark&quot;] {`{`} color-scheme: dark; {`}`}</InlineCode>. A
          função light-dark() segue a propriedade color-scheme do contexto.
        </p>
        <Callout tone="warn" icon="⚠️">
          Suporte: Chrome 123+, Safari 17.5+, Firefox 120+. Em 2026, suporte é &gt;95% global.
          Para suporte legacy, mantenha o fallback com <InlineCode>--var</InlineCode> tradicional. Use
          <InlineCode>@supports (color: light-dark(red, blue))</InlineCode> para feature detection.
        </Callout>
      </Section>

      <Section title="Evitar FOUC: a estratégia correta" accent={accent}>
        <p>
          FOUC (Flash of Unstyled Content) no contexto de theming é o "flash branco" quando o
          usuário com tema dark abre a página e vê meio segundo de tela clara antes do JS
          aplicar o tema salvo. Visualmente embaraçoso e profissionalmente inaceitável em DS
          sério. Três soluções, em ordem de preferência:
        </p>
        <FlowDiagram
          title="Hierarquia de soluções anti-FOUC"
          accent={accent}
          steps={[
            { label: 'Cookie + SSR', desc: 'Server lê cookie e renderiza <html data-theme="dark"> direto. Zero flash.' },
            { label: 'Inline script', desc: 'Script blocking no <head> lê localStorage antes de pintar.' },
            { label: 'CSS only', desc: 'Apenas prefers-color-scheme — sem override manual.' },
          ]}
        />
        <CodeBlock lang="tsx">{`// Next.js App Router — app/layout.tsx (Server Component, SEM 'use client')
import { cookies } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'system'; // 'light' | 'dark' | 'system'

  // Quando 'system', NÃO seta data-theme — deixa o @media decidir
  const dataTheme = theme === 'system' ? undefined : theme;

  return (
    <html lang="pt-BR" data-theme={dataTheme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}`}</CodeBlock>
        <p>
          Com static export do Next.js 16, <InlineCode>cookies()</InlineCode> não funciona em build time.
          A solução é inline script blocking minúsculo:
        </p>
        <CodeBlock lang="tsx">{`// componente que vira <script> inline (server-rendered)
export function ThemeScript() {
  const code = \`(function(){
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark' || t === 'light') {
        document.documentElement.setAttribute('data-theme', t);
      }
    } catch (e) {}
  })();\`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

// no <head> do layout.tsx
<head>
  <ThemeScript />
</head>`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Esse script deve rodar <strong>antes</strong> do CSS pintar. Em Next.js, garantir que
          ele esteja no <InlineCode>&lt;head&gt;</InlineCode> e seja inline (não external) — external src
          adiciona round-trip. Tamanho: ~150 bytes. Aceitável.
        </Callout>
      </Section>

      <Section title="Toggle de tema com hooks (React 19)" accent={accent}>
        <p>
          Lado client, um hook isola a lógica de leitura/escrita de tema, sincronização com
          matchMedia e persistência dupla (cookie + localStorage):
        </p>
        <CodeBlock lang="tsx">{`'use client';
import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme') as Theme | null;
  return stored ?? 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  localStorage.setItem('theme', theme);
  document.cookie = \`theme=\${theme}; path=/; max-age=\${60 * 60 * 24 * 365}; SameSite=Lax\`;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  // re-aplica quando user muda preferência do SO e tema atual = system
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme };
}`}</CodeBlock>
        <p>
          Lib popular: <strong>next-themes</strong> faz tudo isso pronto e mais (sincronização
          com cookies, SSR-aware, multi-attribute). Vale 90% dos casos. O código acima é o que
          ela faz por baixo.
        </p>
      </Section>

      <Section title="color-scheme: por que isso importa" accent={accent}>
        <p>
          A property CSS <InlineCode>color-scheme</InlineCode> não é opcional. Ela informa ao
          browser que sua página suporta ambos os temas, e isso afeta:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Elemento', 'Sem color-scheme', 'Com color-scheme: dark']}
          rows={[
            ['Scrollbar', 'Branca/claro (gritante em página dark)', 'Escura, harmônica'],
            ['Form controls (input, select)', 'Estilo OS default light', 'Estilo OS default dark'],
            ['Canvas transparente', 'Background branco', 'Background escuro'],
            ['SVG com currentColor', 'Cor texto default', 'Cor texto adaptada'],
            ['light-dark() function', 'Não funciona', 'Funciona — usa o segundo arg'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Esquecer <InlineCode>color-scheme</InlineCode> é o erro mais comum em DS dark mode. Você passa
          dias estilizando dark, mas as scrollbars continuam brancas. Adicionar{' '}
          <InlineCode>color-scheme: light dark</InlineCode> em <InlineCode>:root</InlineCode> e{' '}
          <InlineCode>color-scheme: dark</InlineCode> em <InlineCode>[data-theme=&quot;dark&quot;]</InlineCode>{' '}
          resolve.
        </Callout>
      </Section>

      <Section title="color-mix(): contraste e estados sem explosão de tokens" accent={accent}>
        <p>
          <InlineCode>color-mix()</InlineCode> (CSS Color Level 5, suporte 95%+ em 2026) permite gerar
          variantes de cor (hover, active, disabled) em runtime, sem criar 5 tokens por cor:
        </p>
        <CodeBlock lang="css">{`.button-primary {
  background: var(--color-action-primary);
}
.button-primary:hover {
  /* mistura 12% de preto com a cor primária — escurece sem hardcode */
  background: color-mix(in srgb, var(--color-action-primary) 88%, black);
}
.button-primary:active {
  background: color-mix(in srgb, var(--color-action-primary) 75%, black);
}
.button-primary:disabled {
  background: color-mix(in srgb, var(--color-action-primary) 40%, transparent);
}

/* em dark theme, mistura com branco em vez de preto */
[data-theme="dark"] .button-primary:hover {
  background: color-mix(in srgb, var(--color-action-primary) 88%, white);
}`}</CodeBlock>
        <p>
          Use <InlineCode>in oklch</InlineCode> em vez de <InlineCode>in srgb</InlineCode> para mistura
          percentualmente uniforme (OKLCH é perceptualmente linear; sRGB não é). Suporte OKLCH:
          Chrome 111+, Safari 16.4+, Firefox 113+.
        </p>
      </Section>

      <Section title="Multi-brand white-label (avançado)" accent={accent}>
        <p>
          O teste final de tokens é multi-brand white-label: mesmo código, N marcas. A solução
          é tratar brand como dimensão ortogonal a tema:
        </p>
        <CodeBlock lang="css">{`/* tokens-acme.css gerado por Style Dictionary com brand=acme */
[data-brand="acme"] {
  --brand-primary: #ff4500;
  --brand-secondary: #1a1a1a;

  --color-action-primary: var(--brand-primary);
  --color-surface-accent: var(--brand-primary);
}

[data-brand="contoso"] {
  --brand-primary: #0066cc;
  --brand-secondary: #ffffff;

  --color-action-primary: var(--brand-primary);
  --color-surface-accent: var(--brand-primary);
}

/* combinação: brand × theme */
[data-brand="acme"][data-theme="dark"] {
  --color-action-primary: color-mix(in oklch, var(--brand-primary) 75%, white);
}`}</CodeBlock>
        <p>
          No HTML root: <InlineCode>&lt;html data-brand=&quot;acme&quot; data-theme=&quot;dark&quot;&gt;</InlineCode>. Componentes
          continuam lendo só <InlineCode>--color-action-primary</InlineCode> — não sabem nem se importam
          qual brand está ativo. Multi-brand em 8 linhas de CSS.
        </p>
      </Section>

      <Section title="Tradeoffs e decisão final" accent={accent}>
        <DecisionBox
          scenario="Qual estratégia de tema escolher para um produto Next.js 16 com static export?"
          winner="data-theme + cookie + inline script anti-FOUC + light-dark() onde possível"
          winnerColor={accent}
          why="data-theme é mais semântico que class e suporta multi-brand. Cookie + SSR mata FOUC em SSR mode; em static export, inline script é o fallback. light-dark() reduz boilerplate. CSS custom properties são runtime-swappable e cascateiam — sem rebuild, sem dois bundles."
          alternatives={[
            { name: 'next-themes lib', when: 'Quer o pacote completo pronto; aceita dependência extra' },
            { name: 'Class strategy (Tailwind default)', when: 'Tema binário simples; sem multi-brand previsto' },
            { name: 'Só prefers-color-scheme', when: 'Não quer toggle manual; o SO decide' },
            { name: 'SCSS variables', when: 'Não escolher; é arquitetura morta para theming dinâmico' },
          ]}
        />
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Tailwind v3 dark:bg-slate-900 ainda funciona?"
          a="Sim. Tailwind v3 usa class strategy (.dark). v4 suporta data-attribute também via @custom-variant. Para novo projeto, prefira v4 + data-theme (este módulo)."
        />
        <QAItem
          q="Imagens devem ter versões dark/light?"
          a="Sim, para ilustrações com background. Use <picture> com <source media='(prefers-color-scheme: dark)'> ou SVG inline que usa currentColor para herdar a cor de texto."
        />
        <QAItem
          q="Como testar dark mode em CI?"
          a="Storybook + Chromatic suporta múltiplos backgrounds e themes via parameters. Cada story renderiza light e dark, e Chromatic faz diff em ambas variants. Detalhado no módulo de Storybook."
        />
        <QAItem
          q="Print (impressão) deve respeitar dark mode?"
          a="Não. @media print deve forçar light: @media print { :root { --color-surface-bg: white; --color-surface-fg: black; } }. Tinta preta em fundo branco economiza tinta e melhora legibilidade no papel."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          <strong>MDN — prefers-color-scheme, color-scheme, light-dark()</strong> (developer.mozilla.org),{' '}
          <strong>web.dev — "Improved dark mode default styling with the color-scheme CSS property"</strong>{' '}
          (Thomas Steiner, Google), <strong>next-themes</strong> (github.com/pacocoursey/next-themes),{' '}
          <strong>Brad Frost — "Theming" no livro Design Systems</strong>, e a spec CSS Color
          Module Level 5 (w3.org/TR/css-color-5/).
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: dark mode é expectativa, não feature. CSS custom properties + data-theme
          + cookie/inline script anti-FOUC + color-scheme + light-dark() é o stack moderno.
          Componentes leem apenas semantic tokens — nunca primitives nem hex hardcoded.
          Multi-brand white-label é só uma dimensão extra (data-brand). Próximo módulo:
          headless primitives (Radix UI, Ark UI, shadcn) que recebem tudo isso prontos para
          consumir tokens.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
