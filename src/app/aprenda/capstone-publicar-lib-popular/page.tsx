import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-publicar-lib-popular');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema pequeno e focado é bom candidato pra lib capstone?',
    options: [
      'Framework inteiro',
      'Utility específica com bundle < 5KB e API mínima: parser de CSV tolerante, helper de invariant com mensagens TS-friendly, storage adapter unificado (localStorage/MMKV/AsyncStorage) — escopo claro, testável, com users potenciais',
      'Projeto enorme',
      'Qualquer coisa',
    ],
    correct: 1,
    explanation: 'Libs conhecidas começam pequenas: tiny-invariant (500B), use-debounce (1KB), slugify (2KB). Foco estreito + API elegante + zero deps + bundle mínimo = trilha pra adoção. Capstone escolhendo problema que você já enfrentou em projeto real aumenta chance de utilidade genuína. Fuja de "lib de componentes UI completa" — gigante demais pra um dev terminar bem.',
  },
  {
    question: 'Docs site com TypeDoc vs Astro Starlight — quando cada um?',
    options: [
      'Igual',
      'TypeDoc: gera API reference direto de TSDoc (ótimo pra listagem de funções, types); Starlight: docs site customizável com guias, tutoriais, search, dark mode, MDX — combine os dois: Starlight pra contar história + TypeDoc embutido pra referência exaustiva',
      'Nunca Starlight',
      'Só Markdown puro',
    ],
    correct: 1,
    explanation: 'TypeDoc sozinho é referência, seco. Starlight sozinho não conhece seu código. Mix ideal: Starlight com MDX pra getting started, examples, migration guide; TypeDoc em /reference pra API completa auto-gerada. Docusaurus e Nextra são alternativas; Starlight é simples/rápido e tem design moderno out of box.',
  },
  {
    question: 'O que torna README de lib efetivo na primeira tela?',
    options: [
      'Licenças',
      'One-liner descrevendo o quê e por quê (1 frase), badge de tamanho do bundle + coverage, instalação em 1 comando, exemplo MÍNIMO copiável que resolve problema real — resto (API ref, filosofia, migration) vem depois',
      'Todo código',
      'Sem exemplo',
    ],
    correct: 1,
    explanation: 'Visitante dá 10 segundos de atenção. Primeiro pulo: "isso resolve meu problema?". One-liner de 15 palavras + exemplo de 8 linhas que mostra valor imediato = win. Badges ajudam credibilidade (build passing, size, npm downloads). Filosofia, comparação com alternativas, API completa — TUDO em seções mais abaixo ou em docs site. README não é livro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-publicar-lib-popular"
      title="Capstone: publicar lib com 1.0 release, docs, exemplos"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="Library & Package Authoring"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Escopo: lib pequena, focada, 1.0" accent={accent}>
        <p>
          Escolha problema real que você já teve: utility parser, adapter cross-runtime, hook React específico, helper de validação. Meta: bundle &lt; 5KB min+gz, zero deps (ou 1 peer), API &lt; 10 exports públicos, 100% test coverage, docs publicadas, primeiro release 1.0 estável.
        </p>
      </Section>

      <Section title="Ideias prontas pra adotar" accent={accent}>
        <CodeBlock lang="ts">{`// 1. @ffv/invariant — tiny-invariant TS-first com template strings
invariant(user != null, 'user required at ' + location);

// 2. @ffv/storage — abstração localStorage/MMKV/AsyncStorage
const s = createStorage({ adapter: 'auto' });
await s.set('key', { value: 1 });

// 3. @ffv/csv-lite — parser tolerante (headers, quotes, multiline)
const rows = parseCSV(text, { header: true });

// 4. @ffv/use-stable-callback — useCallback sem lista de deps
const onClick = useStableCallback(() => doSomething(latestValue));

// 5. @ffv/fetch-retry — fetch com retry exponencial + jitter
await fetchRetry(url, { retries: 3, backoff: 'exponential' });`}</CodeBlock>
      </Section>

      <Section title="Checklist completo" accent={accent}>
        <CodeBlock lang="markdown">{`# Lib Capstone — Checklist

## 1. Estrutura
- [ ] pnpm / bun monorepo ou pacote único
- [ ] tsup pra build (ESM + CJS + dts)
- [ ] vitest pra testes
- [ ] ESLint + Prettier + EditorConfig
- [ ] Licença (MIT recomendado)

## 2. Pacote
- [ ] package.json com exports map correto
- [ ] sideEffects declarado
- [ ] peerDependencies onde cabe
- [ ] files field limitando publish a dist + README + LICENSE
- [ ] keywords, author, repository, homepage

## 3. Tipos
- [ ] tsconfig strict: true + noUncheckedIndexedAccess
- [ ] TSDoc em toda função pública
- [ ] Types bundled (.d.ts no pacote)
- [ ] Generic que agrega (não force-fit)

## 4. Testes
- [ ] vitest + coverage v8
- [ ] 100% cobertura em src/
- [ ] Testes de tipo (expectTypeOf) pra garantir types corretos
- [ ] Bench (vitest bench ou tinybench) se performance importa

## 5. Build & Publish validation
- [ ] npm run build cria dist/ limpo
- [ ] publint --strict passa
- [ ] @arethetypeswrong/cli --pack passa
- [ ] npm pack mostra só o necessário
- [ ] Bundle size aferido (size-limit ou pkg-size)

## 6. CI
- [ ] GitHub Actions: lint, typecheck, test, build, publint, ATTW
- [ ] Matrix Node versions (18, 20, 22)
- [ ] Matrix bundlers pra integration (Vite, Next, CRA)
- [ ] changesets/action pra release automatizado

## 7. Docs
- [ ] README com one-liner + badges + install + exemplo
- [ ] Site docs (Starlight recomendado)
- [ ] API reference via TypeDoc
- [ ] Guias: quickstart, recipes, migration
- [ ] Playground com StackBlitz ou CodeSandbox template

## 8. Release 1.0
- [ ] CHANGELOG.md inicial
- [ ] Tag v1.0.0 + GitHub Release com notes
- [ ] npm publish
- [ ] Post de anúncio (LinkedIn/Twitter/HN) com link demo
- [ ] Submeta em "awesome-*" lists relevantes`}</CodeBlock>
      </Section>

      <Section title="Estrutura de diretório sugerida" accent={accent}>
        <CodeBlock lang="bash">{`meu-lib/
  src/
    index.ts              # entry público
    internal/             # não exportado
    types.ts
  tests/
    index.test.ts
    types.test-d.ts       # type-level tests
  docs/                   # Starlight site
    astro.config.mjs
    src/content/docs/
      index.mdx
      getting-started.mdx
      recipes/
      reference/          # TypeDoc output embed
  examples/
    basic/                # CodeSandbox-ready
    with-next/
  .changeset/
    config.json
  .github/workflows/
    ci.yml
    release.yml
  package.json
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
  README.md
  CHANGELOG.md
  LICENSE`}</CodeBlock>
      </Section>

      <Section title="Site docs com Astro Starlight" accent={accent}>
        <CodeBlock lang="bash">{`cd docs
npm create astro@latest -- --template starlight
npm install

# astro.config.mjs:
import starlight from '@astrojs/starlight';
export default defineConfig({
  integrations: [starlight({
    title: '@ffv/invariant',
    description: 'Tiny TypeScript invariant helper.',
    social: { github: 'https://github.com/ffv/invariant' },
    sidebar: [
      { label: 'Quickstart', link: '/getting-started' },
      { label: 'Recipes', autogenerate: { directory: 'recipes' } },
      { label: 'Reference', autogenerate: { directory: 'reference' } },
    ],
  })],
});

# Deploy Cloudflare Pages ou Vercel (free tier cobre).`}</CodeBlock>
      </Section>

      <Section title="Anúncio e pós-release" accent={accent}>
        <Callout tone="success" icon="✅">
          Post de anúncio com estrutura: (1) problema que resolvia mal antes, (2) 6-10 linhas de código mostrando a lib em ação, (3) link pra docs + repo + bundle size badge, (4) pedido específico de feedback. Responda issues rápido nas primeiras 2 semanas — adotantes iniciais viram contribuidores se sentirem ouvidos. Mensure npm downloads, GitHub stars, menções — ajusta roadmap real com sinal.
        </Callout>
      </Section>

      <Section title="Critérios de sucesso do capstone" accent={accent}>
        <Callout tone="info">
          (1) Lib publicada no npm com 1.0.0. (2) Bundle size &lt; 5KB min+gz. (3) Zero dependencies runtime ou &lt;= 1 peer dep. (4) 100% test coverage. (5) Docs site deployada com quickstart + recipes + API ref. (6) 3+ exemplos reproduzíveis. (7) CI verde com publint + ATTW. (8) README cativante em primeira tela. (9) Post de anúncio público. Entregáveis comprovam competência de lib author de verdade.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
