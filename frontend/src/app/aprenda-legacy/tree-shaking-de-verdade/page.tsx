import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tree-shaking-de-verdade');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CJS (require) não tree-shake tão bem quanto ESM?',
    options: [
      'Moda',
      'CJS é dinâmico (require pode ser chamado condicional, com string computed), bundler não consegue fazer análise estática certeira; ESM é estático (imports no topo, strings literais), permite bundler descobrir exatamente o que é usado',
      'Nada a ver',
      'CJS é mais leve',
    ],
    correct: 1,
    explanation: 'Tree-shaking depende de saber em build-time: "quais exports desse módulo são importados?". ESM garante que imports são top-level e strings literais. CJS permite require(condicional ? "a" : "b"), module.exports = algoDinamico, exportAll. Bundlers fazem best effort em CJS mas conservadoramente mantêm mais código pra não quebrar. ESM é precondição real pra tree-shaking.',
  },
  {
    question: 'O comentário /* @__PURE__ */ faz o quê?',
    options: [
      'Documentação',
      'Marca chamada de função como sem side effects — bundler pode remover se o resultado não for usado; essencial em factory functions no topo do módulo (createSlice, defineComponent) pra tree-shake funcionarem',
      'Nada',
      'Só comentário',
    ],
    correct: 1,
    explanation: 'Bundler por default assume que chamadas de função podem ter side effects (analytics, registro, global mutation) e mantém mesmo se resultado não usado. /* @__PURE__ */ createFoo() promete: "sem side effect, se ninguém usa o retorno, descarte". Crítico em: Redux Toolkit createSlice, Vue defineComponent, quaisquer factories ao nível de módulo.',
  },
  {
    question: 'Por que "sideEffects": false é ameaça dupla?',
    options: [
      'Nenhuma',
      'Se você declara false mas tem arquivos com side effect (CSS, polyfill, registro global), bundler os elimina e consumer descobre em prod; só declare false se TODOS os arquivos são puros, ou use array pra listar exceções',
      'Nunca declare',
      'Não impacta',
    ],
    correct: 1,
    explanation: 'Declaração mente = produção quebrada. Ex.: lib importa CSS em um arquivo ("./dist/styles.css"), se sideEffects false, bundler remove o import e app sobe sem estilo. Solução: sideEffects: ["*.css", "./dist/polyfills.js"]. Ou, melhor ainda: estrutura lib pra não ter side effects em arquivos indexados pelo exports, isolando CSS em subpath opt-in (import "@lib/styles.css").',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tree-shaking-de-verdade"
      title="Tree-shaking: sideEffects + pure annotations"
      icon="🌲"
      xp={55}
      readTime={13}
      trailName="Library & Package Authoring"
      trailColor={accent}
      nextSlug="semver-pragmatico-changelog"
      nextTitle="Semver pragmático + changesets release"
      quiz={quiz}
    >
      <Section title="Tree-shaking não é automático" accent={accent}>
        <p>
          A ideia <code>{"import { foo } from 'lib'"}</code> e bundler corta o resto funciona em teoria. Na prática, bundler precisa de três condições combinadas: (1) ESM estático, (2) sideEffects declarado, (3) code sem side effects escondidos. Qualquer uma falhando, bundler inclui tudo por segurança.
        </p>
      </Section>

      <Section title="sideEffects com precisão" accent={accent}>
        <CodeBlock lang="json">{`// Caso 1: lib totalmente pura (ideal)
{ "sideEffects": false }

// Caso 2: alguns arquivos têm side effects
{
  "sideEffects": [
    "./dist/polyfills.js",
    "./dist/register-globals.js",
    "*.css"
  ]
}

// Caso 3: não sei / não testei — sempre true (bundler inclui tudo)
// (é o default se não declarar; é a situação padrão em libs antigas)
{ "sideEffects": true }`}</CodeBlock>
        <Callout tone="warn">
          Teste de sanidade: importa um único export da sua lib num app e roda bundle analyzer. O bundle deveria conter só esse export + deps diretas. Se incluir tudo, sideEffects ou ESM shape estão errados.
        </Callout>
      </Section>

      <Section title="Pure annotations no código" accent={accent}>
        <CodeBlock lang="ts">{`// src/counter.ts — sem pure annotation, bundler mantém
export const counterA = createCounter({ initial: 0 });

// Com pure annotation, se ninguém usa counterA, bundler remove
export const counterB = /* @__PURE__ */ createCounter({ initial: 0 });

// Exemplo real (Redux Toolkit):
export const userSlice = /* @__PURE__ */ createSlice({
  name: 'user',
  initialState: { text: '' },
  reducers: { setName: (s, a) => { s.name = a.payload; } },
});

// Webpack, Rollup, esbuild, Vite, tsup — todos respeitam /* @__PURE__ */.
// Babel mantém em minificação se você não desliga comment preservation.`}</CodeBlock>
      </Section>

      <Section title="Evite barrel files profundos" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ src/index.ts — barrel com re-export star
export * from './module-a';
export * from './module-b';
export * from './module-c'; // ... mais 20

// Consumer faz: import { foo } from '@ffv/lib'
// Se qualquer module-* tem side effect escondido, tree-shake falha.
// Barrel profundo também dificulta circular deps e inflaciona tempo de build.

// ✅ Alternativa 1: named re-exports (bundler analisa melhor)
export { formatDate, parseDate } from './date';
export { formatNumber } from './number';

// ✅ Alternativa 2: subpath exports
// Consumer faz: import { formatDate } from '@ffv/lib/date'
// Cada subpath é entry isolada no build e bundle.`}</CodeBlock>
      </Section>

      <Section title="Build configurado pra tree-shaking" accent={accent}>
        <CodeBlock lang="ts">{`// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', date: 'src/date.ts', number: 'src/number.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  treeshake: true,
  splitting: false,
  clean: true,
  minify: false,     // deixe consumer minificar
  sourcemap: true,
  target: 'es2022',  // evita downlevel que quebra /* @__PURE__ */
});`}</CodeBlock>
        <Callout tone="info">
          <code>target</code> baixo demais (es5) reintroduz helpers do TS que podem perder purity. Use target alinhado com audience realista — hoje (2026), es2022 é o default são.
        </Callout>
      </Section>

      <Section title="Medição: provando tree-shaking" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Crie um app isolado que importa só uma função da lib
mkdir test-app && cd test-app
npm init -y
npm install @ffv/date-helper
echo "import { formatDate } from '@ffv/date-helper'; console.log(formatDate(new Date()));" > app.js

# 2. Bundle com Rollup ou esbuild:
npx esbuild app.js --bundle --minify --format=esm > bundle.js
ls -la bundle.js    # comparar com o size esperado

# 3. Bundle analyzer (visual):
npx @next/bundle-analyzer ou 'npm-bundle-analyzer'
# ou veja bundlephobia.com/package/@ffv/date-helper`}</CodeBlock>
      </Section>

      <Section title="Armadilhas frequentes" accent={accent}>
        <Callout tone="danger" icon="🚨">
          (1) TypeScript emitHelpers combinados com CommonJS quebram tree-shake — use tsup que inline helpers corretamente. (2) enum em TS vira objeto com side effect implícito — prefira const enum ou as const literals. (3) Classes com decorators podem inflacionar bundle com reflect-metadata. (4) Import de CSS em arquivo core (não isolado) sem declarar em sideEffects faz bundler remover o CSS em prod. (5) Re-export de default export não tree-shake tão bem quanto named.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
