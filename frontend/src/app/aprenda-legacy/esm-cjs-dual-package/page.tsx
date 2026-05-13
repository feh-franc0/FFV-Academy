import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('esm-cjs-dual-package');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o campo "exports" no package.json resolve que "main"/"module" não?',
    options: [
      'Nada',
      'Conditional resolution: Node decide qual arquivo baseado em runtime (import vs require), ambiente (browser, worker, deno), condições customizadas — encapsula internals (consumer não consegue importar caminho fora do exports)',
      'Só rename',
      'Só types',
    ],
    correct: 1,
    explanation: '"main" (CJS legacy) e "module" (ESM por Webpack) eram heurísticas. "exports" é spec oficial que: (a) resolve por condição (import, require, types, browser, worker, deno, default), (b) bloqueia acesso a arquivos internos ("@lib/foo" acessa só o que você expôs), (c) permite subpath exports (@lib/foo/utils como entry separada). Modern packages 2026 sempre usam exports.',
  },
  {
    question: 'Por que "Are The Types Wrong?" (ATTW) virou ferramenta obrigatória?',
    options: [
      'Marketing',
      'Detecta inconsistências comuns no exports map: types condicional faltando, types apontando pra .d.ts errado, mismatch ESM/CJS types, "masquerading as CJS" (TS acha que é ESM mas bundle é CJS) — são bugs invisíveis que estouram no consumer meses depois',
      'Só lint',
      'Nada técnico',
    ],
    correct: 1,
    explanation: 'ATTW (arethetypeswrong.github.io, também npm --init-author) roda 11+ checks: NoResolution, Fallback to main, Masquerading, ResolvesToFileJS, etc. Sem ATTW, você publica lib que funciona no seu projeto TS strict mas quebra em projeto do consumer com moduleResolution: "node16". É diferença entre "funciona pra mim" e "funciona profissionalmente".',
  },
  {
    question: 'Publint verifica o quê adicional ao ATTW?',
    options: [
      'Só formatação',
      'Verifica exports map shape, extensão de arquivos coerente (.mjs/.cjs vs type: module), conditional types posicionados corretamente (sempre antes de import/require), prefixos de path (./foo) — pega erros que ATTW não foca, mais voltado ao packaging',
      'Mesma coisa que ATTW',
      'Só formata JSON',
    ],
    correct: 1,
    explanation: 'Publint (publint.dev / bluwy) foca no shape do package: ordem de conditions no exports (types antes de import/require, senão TS falha), extensões coerentes, types/module/main legacy fields consistentes, files field. Use os dois: publint pra packaging correto, ATTW pra types resolution correta. Ambos em CI garantem que lib publicada não tem landmine.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="esm-cjs-dual-package"
      title="ESM + CJS dual package: exports map + publint"
      icon="🔀"
      xp={55}
      readTime={13}
      trailName="Library & Package Authoring"
      trailColor={accent}
      nextSlug="tree-shaking-de-verdade"
      nextTitle="Tree-shaking: sideEffects + pure annotations"
      quiz={quiz}
    >
      <Section title="Por que ainda nos importamos com CJS em 2026" accent={accent}>
        <p>
          Ecossistema Node ainda tem milhões de apps CJS (require). ESM-only publish é tentador, mas corta base de consumers. Dual package (ESM + CJS) com exports map correto é o padrão profissional: consumer escolhe via import/require, você entrega ambos.
        </p>
        <Callout tone="info">
          Em pacote novo puramente para runtimes modernos (Bun, Deno, edge-only, browser via ESM): ESM-only é legítimo. Declare no README e bumpe major ao mudar. Em lib de uso geral com Node audience grande: dual continua mais seguro.
        </Callout>
      </Section>

      <Section title="Exports map canônico" accent={accent}>
        <CodeBlock lang="json">{`{
  "name": "@ffv/date-helper",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./locale/*": {
      "types": "./dist/locale/*.d.ts",
      "import": "./dist/locale/*.js",
      "require": "./dist/locale/*.cjs"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist", "README.md", "LICENSE"]
}`}</CodeBlock>
        <Callout tone="warn">
          Ordem importa: <code>types</code> SEMPRE primeiro dentro da condição, senão TS pode pegar fallback errado. <code>default</code>, se usado, SEMPRE por último. O campo <code>./package.json</code> é necessário pra libs que fazem require do próprio package.json (plugins, por exemplo).
        </Callout>
      </Section>

      <Section title="Build com tsup gerando dual" accent={accent}>
        <CodeBlock lang="ts">{`// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/locale/*.ts'],
  format: ['esm', 'cjs'],
  dts: true,           // gera .d.ts
  sourcemap: true,
  clean: true,
  splitting: false,    // mantém um arquivo por entry
  treeshake: true,
  target: 'es2022',
  external: ['react'], // peer deps nunca bundled
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
  }),
});`}</CodeBlock>
        <p>
          Em 2026, alternativas a tsup incluem <code>pkgroll</code>, <code>unbuild</code>, <code>rolldown</code> (ainda early). tsup continua o default pragmático — rolldown vai virar escolha quando 1.0 estabilizar.
        </p>
      </Section>

      <Section title="Condições avançadas" accent={accent}>
        <CodeBlock lang="json">{`{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "browser": "./dist/index.browser.js",
      "worker": "./dist/index.worker.js",
      "deno": "./dist/index.deno.js",
      "bun":  "./dist/index.bun.js",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}`}</CodeBlock>
        <Callout tone="info">
          Use condições extras só se você ganha algo real (substituir node:fs por fallback no browser, por exemplo). Não multiplique builds por diversão — cada variante é superfície de bug.
        </Callout>
      </Section>

      <Section title="Verificação automática" accent={accent}>
        <CodeBlock lang="bash">{`# Depois do build, antes de publish:
npx publint                    # valida exports map shape
npx @arethetypeswrong/cli --pack  # valida types resolution
npm pack --dry-run             # mostra o que será publicado

# Rode em CI (.github/workflows/ci.yml):
# - run: pnpm build
# - run: npx publint --strict
# - run: npx @arethetypeswrong/cli --pack --fail-on-only=Alpha`}</CodeBlock>
      </Section>

      <Section title="Dual package hazard" accent={accent}>
        <p>
          Problema clássico: consumer CJS (require) e consumer ESM (import) carregam dois módulos diferentes — duas instâncias, state duplicado, instanceof falha. Evite estado global dentro da lib; se precisar de singleton, coloque em pacote separado que seja sempre CJS ou use WeakMap keyed em global.
        </p>
        <CodeBlock lang="ts">{`// Solução: singleton em globalThis
const KEY = Symbol.for('@ffv/date-helper/registry');
type Registry = Map<string, unknown>;

export function getRegistry(): Registry {
  const g = globalThis as any;
  if (!g[KEY]) g[KEY] = new Map();
  return g[KEY];
}
// Agora ESM e CJS compartilham o mesmo Map real.`}</CodeBlock>
      </Section>

      <Section title="Quando ESM-only faz sentido" accent={accent}>
        <Callout tone="success" icon="✅">
          Biblioteca nova focada em runtimes 2024+ (Vite, Bun, Deno, edge), web components, ou sem consumers Node legacy conhecidos. Declare <code>"type": "module"</code>, só export ESM, sem <code>require</code> no exports map. Muito mais simples de manter. Chart: dayjs ainda dual, zod dual, mas libs novíssimas (like tinyexec, radash) preferem ESM-only.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
