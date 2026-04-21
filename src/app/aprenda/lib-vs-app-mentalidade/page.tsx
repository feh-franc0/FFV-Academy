import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lib-vs-app-mentalidade');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que React fica em peerDependencies, não em dependencies?',
    options: [
      'Moda',
      'Lib não deve bundlar React — o app consumer provê a versão dele; peer evita múltiplas cópias (que quebram hooks, context) e dá controle ao consumer de escolher versão compatível',
      'Gastar menos disco',
      'Bug de npm',
    ],
    correct: 1,
    explanation: 'React usa identidade de referência (instance check) pra hooks e context. Duas cópias no bundle = dois dispatchers diferentes → "Invalid hook call". peerDependencies declara "eu espero que você tenha React X.Y já instalado"; npm 7+ instala automaticamente, e bundler dedup. Mesmo vale pra react-dom, vue, next, zustand, rxjs — qualquer runtime compartilhado.',
  },
  {
    question: 'Um console.log no código da lib publicada é problema?',
    options: [
      'Não',
      'Sim — polui o console do consumer (app do usuário final), impossível de silenciar sem monkey patch, vazamento de info interna. Libs profissionais usam debug flag opcional (env var, option) ou zero output',
      'Só em dev',
      'Tanto faz',
    ],
    correct: 1,
    explanation: 'Imagine 50 libs no seu app, cada uma com 3 console.log de "loading". Inferno. Libs sérias: zero output por default; se quiser diagnostics, aceite option { debug: true } ou check process.env.LIB_DEBUG. Código de test/example pode logar; código publicado, não. Também vale pra warnings: use adequadamente, não spam.',
  },
  {
    question: 'Bundle size de 200KB pra uma lib de date utilities — aceitável?',
    options: [
      'Sim, se útil',
      'Não — lib bem desenhada é tree-shakable (import só o que usa, chega em 2-10KB); 200KB monolítico mata hot paths de web. Benchmark contra concorrente (date-fns, dayjs) é obrigatório antes de publicar',
      'Depende',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Cada KB importa em web (download + parse + execute). Lib publicada é adicionada por outros no bundle deles. 200KB pra date util matou libs antes (moment.js perdeu market share pra dayjs/date-fns por exatamente isso). Bundle analyzer (bundlephobia.com, pkg-size) deveria ser test obrigatório no CI antes de publish.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lib-vs-app-mentalidade"
      title="Mentalidade lib vs app: o que diverge"
      icon="📚"
      xp={45}
      readTime={11}
      trailName="Library & Package Authoring"
      trailColor={accent}
      nextSlug="esm-cjs-dual-package"
      nextTitle="ESM + CJS dual package: exports map + publint"
      quiz={quiz}
    >
      <Section title="App é fechado, lib é API pública" accent={accent}>
        <p>
          Quando você escreve app, decide tudo: runtime, build, versões de deps, quando quebrar coisas. Lib é o oposto — você entrega uma API que outros usam em contextos que você não controla. Mudança de assinatura sem deprecation quebra produção de desconhecidos. Essa inversão muda tudo: como você versiona, como documenta, como testa.
        </p>
      </Section>

      <Section title="Peer dependencies, dependencies, devDependencies" accent={accent}>
        <CodeBlock lang="json">{`{
  "name": "@ffv/date-helper",
  "version": "0.2.0",
  "dependencies": {
    "zod": "^3.22.0"                 // runtime, bundle pode incluir
  },
  "peerDependencies": {
    "react": ">=18 <20",              // consumer provê
    "react-dom": ">=18 <20"
  },
  "peerDependenciesMeta": {
    "react-dom": { "optional": true } // opcional em build server-only
  },
  "devDependencies": {
    "tsup": "^8.0.0",                 // só build, nunca bundled
    "vitest": "^2.0.0",
    "@types/react": "^18.0.0"
  }
}`}</CodeBlock>
        <Callout tone="info">
          Regra: "é shared runtime que múltiplas libs podem declarar?" → peer. "É utility que eu uso internamente, ok se for duplicado?" → dependencies. "Só precisa pra build/test?" → dev.
        </Callout>
      </Section>

      <Section title="Side effects explícitos" accent={accent}>
        <CodeBlock lang="json">{`// package.json
{
  "sideEffects": false,  // 99% das libs modernas: zero side effects
  // OU, se tem alguns arquivos que importar = efeito:
  "sideEffects": ["./dist/polyfills.js", "*.css"]
}`}</CodeBlock>
        <p>
          Side effect = import do arquivo executa código global (polyfill, CSS, analytics, registro). Quando <code>sideEffects: false</code>, bundler pode tree-shake qualquer export não usado. Lib com side effect não declarado = bundler mantém tudo por segurança = bundle gordo no consumer.
        </p>
      </Section>

      <Section title="API stability como commitment" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ Erro de iniciante: exportar helpers internos
export { __internalFormat } from './internal';

// ✅ Só exporte o que você quer sustentar por 2+ anos
export { formatDate, parseDate } from './public';

// Se precisar expor algo experimental, marque:
/** @experimental This API may change without notice. */
export function experimentalBatchFormat(/* ... */) {}

// @deprecated avisa consumers antes de remover
/** @deprecated Use formatDate. Remove in v3. */
export function format(/* ... */) { return formatDate(/* ... */); }`}</CodeBlock>
      </Section>

      <Section title="Zero assumptions sobre ambiente" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ Acopla a Node
import { readFile } from 'node:fs/promises';

// ❌ Acopla a browser
const el = document.querySelector('#x');

// ✅ Detecta/abstrai runtime
function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// Se sua lib é genuinamente só-Node, declare:
// "engines": { "node": ">=18" } no package.json
// E marque como "type": "module" se ESM-only.`}</CodeBlock>
      </Section>

      <Section title="Error messages pensadas" accent={accent}>
        <Callout tone="warn">
          Erro genérico "Invalid input" sem contexto é pesadelo pro consumer. Inclua: o que era esperado, o que foi recebido, link pra docs. Zod faz isso bem — use como inspiração.
        </Callout>
        <CodeBlock lang="ts">{`function parseISODate(input: unknown): Date {
  if (typeof input !== 'string') {
    throw new TypeError(
      'parseISODate: expected string, got ' + typeof input +
      '. See https://docs.ffv.com/date-helper#parseISODate'
    );
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) {
    throw new RangeError(
      'parseISODate: "' + input + '" is not a valid ISO 8601 date. ' +
      'Example: "2026-04-19" or "2026-04-19T10:00:00Z".'
    );
  }
  return d;
}`}</CodeBlock>
      </Section>

      <Section title="Checklist mental antes de publicar" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Zero console.log/warn inesperado. (2) peer deps corretas (react, framework host). (3) sideEffects declarado. (4) Types bundled e acessíveis via "types" ou exports map. (5) Bundle size medido vs concorrentes (bundlephobia). (6) Erros descritivos com link pra docs. (7) README com exemplo executável na primeira tela. (8) LICENSE presente. (9) Changelog começando (mesmo vazio). (10) Test coverage &gt; 80% no código public.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
