import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('typings-como-produto');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que bundlar types dentro do próprio package em vez de @types/package separado?',
    options: [
      'Mesma coisa',
      'Bundled types garantem sincronia: versão da lib e dos types sempre casam, sem delay entre release e @types update; @types é legado útil só pra libs que não publicam .d.ts (JS puro, deps legadas do ecossistema)',
      'Bundled é pior',
      'Só por fashion',
    ],
    correct: 1,
    explanation: '@types/* separados foram workaround pra libs JS sem tipos. Hoje, toda lib TypeScript gera .d.ts no build e distribui junto. Ganho: consumer pega "npm install lib" e types vem no pacote; "Go to Definition" mostra sua source (útil); sem risco de @types desatualizado. DefinitelyTyped continua vivo pra libs só-JS que comunidade tipou.',
  },
  {
    question: 'Quando uma generic bem pensada agrega valor real?',
    options: [
      'Sempre',
      'Quando captura relação entre input e output que consumer pode aproveitar (ex: pick<T, K> preserva tipos exatos do input selecionado); usar generic só "pra flexibilidade" sem inferência útil adiciona complexidade sem retorno',
      'Nunca',
      'Só em classe',
    ],
    correct: 1,
    explanation: 'Generic vale quando o tipo de saída depende do tipo de entrada em maneira que consumer se beneficia de inferência automática. TanStack Query: useQuery<Data> infere data type do queryFn. Zod: z.infer<Schema> gera TS do runtime schema. Generic vazio ou inútil: function process<T>(x: T): any — consumer ganha nada, complexidade sobra. Regra: se você não consegue explicar em uma frase o ganho, corte.',
  },
  {
    question: 'TSDoc vs JSDoc em libs TS — qual usar?',
    options: [
      'Tanto faz',
      'TSDoc é padronização moderna (por TypeScript team + ESLint rule), especifica tags (@param, @returns, @example, @deprecated) de forma consistente pra tooling (VSCode, API Extractor, TypeDoc) gerar docs uniformes; JSDoc é legacy mais permissivo',
      'Nunca documentar',
      'JSDoc é superior',
    ],
    correct: 1,
    explanation: 'TSDoc é spec oficial TS (tsdoc.org) com tags bem-definidas. ESLint plugin eslint-plugin-tsdoc força consistência. TypeDoc gera docs HTML a partir de TSDoc. VSCode mostra @example, @deprecated, @param. JSDoc ainda funciona em TS, mas pode ter tags ambíguas que tools interpretam diferente. Em lib 2026, use TSDoc.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="typings-como-produto"
      title="Typings como produto: rigor em .d.ts"
      icon="🏷️"
      xp={50}
      readTime={12}
      trailName="Library & Package Authoring"
      trailColor={accent}
      nextSlug="capstone-publicar-lib-popular"
      nextTitle="Capstone: publicar lib com 1.0 release, docs, exemplos"
      quiz={quiz}
    >
      <Section title="Types são feature, não afterthought" accent={accent}>
        <p>
          Em 2026, developer avalia lib pelo tooling. Abre VSCode, importa função, hovera: se autocomplete é preciso, exemplos inline fazem sentido, deprecated aparece marcado — confiança cresce. Se types são <code>any</code> ou genéricos mal pensados, reputação cai antes do usuário testar runtime.
        </p>
      </Section>

      <Section title="Generate .d.ts bundled" accent={accent}>
        <CodeBlock lang="ts">{`// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: true },  // inclui types de deps quando necessário
  sourcemap: true,
});

// Alternativa pra projetos complexos: API Extractor (Microsoft)
// - Gera .d.ts rollup (um único arquivo)
// - Cria API report (detecta breaking changes automaticamente)
// - Parece overkill até você manter lib grande, aí vira essencial`}</CodeBlock>
      </Section>

      <Section title="Generics que agregam" accent={accent}>
        <CodeBlock lang="ts">{`// ✅ Bom uso — output depende de input, consumer ganha inferência
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
// Uso: const r = pick({ a: 1, b: '2', c: true }, ['a', 'c']);
// r é { a: number; c: boolean } — preservado.

// ✅ Query factory type-safe
export function defineQuery<TData>(config: {
  key: readonly unknown[];
  fetcher: () => Promise<TData>;
}) { return config; }

// Uso: const q = defineQuery({ key: ['user', 1], fetcher: async () => ({ name: 'F' }) });
// q.fetcher retorna Promise<{ name: string }> sem você declarar.

// ❌ Generic inútil
export function log<T>(x: T): any { console.log(x); return x; } // T não agrega`}</CodeBlock>
      </Section>

      <Section title="Tipos de union discriminada pra API rica" accent={accent}>
        <CodeBlock lang="ts">{`// Result type — força consumer a tratar erro
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export async function fetchUser(id: string): Promise<Result<User, 'not_found' | 'network'>> {
  try {
    const res = await fetch('/api/users/' + id);
    if (res.status === 404) return { ok: false, error: 'not_found' };
    if (!res.ok) return { ok: false, error: 'network' };
    return { ok: true, value: await res.json() };
  } catch {
    return { ok: false, error: 'network' };
  }
}

// Consumer:
const r = await fetchUser('42');
if (r.ok) r.value.name; // TS sabe que existe
else r.error === 'not_found' ? show404() : showError();`}</CodeBlock>
      </Section>

      <Section title="TSDoc no código" accent={accent}>
        <CodeBlock lang="ts">{`/**
 * Formata uma data ISO para o locale pt-BR.
 *
 * @param input - Data como \`Date\` ou string ISO 8601.
 * @param options - Opções de formatação. Veja {@link FormatOptions}.
 * @returns String formatada, ex: \`"19 de abril de 2026"\`.
 *
 * @example
 * \`\`\`ts
 * formatDate(new Date());
 * // "19 de abril de 2026"
 * formatDate('2026-04-19', { style: 'short' });
 * // "19/04/2026"
 * \`\`\`
 *
 * @throws {RangeError} Se a string não for ISO 8601 válida.
 * @public
 */
export function formatDate(input: Date | string, options?: FormatOptions): string {
  // ...
}`}</CodeBlock>
        <Callout tone="info">
          Tags importantes: <code>@public</code>/<code>@internal</code> (API Extractor usa), <code>@example</code> (VSCode mostra), <code>@deprecated</code> (risca em autocomplete), <code>@throws</code> (documenta exceções). Evite <code>@param</code> que só repete nome; use quando adiciona info.
        </Callout>
      </Section>

      <Section title="Strict checks no tsconfig da lib" accent={accent}>
        <CodeBlock lang="json">{`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "isolatedDeclarations": true,
    "declaration": true,
    "declarationMap": true,
    "skipLibCheck": false,
    "lib": ["ES2022", "DOM"]
  }
}`}</CodeBlock>
        <p>
          <code>isolatedDeclarations</code> (TS 5.5+) força anotar tipos de returns — acelera muito emit de .d.ts (ferramentas externas podem gerar sem type checking completo) e impede exports "invisíveis" inferidos em cross-package monorepo.
        </p>
      </Section>

      <Section title="Validação contínua de API" accent={accent}>
        <Callout tone="success" icon="✅">
          Em CI: <code>tsc --noEmit</code>, <code>publint</code>, <code>@arethetypeswrong/cli --pack</code>, opcional <code>api-extractor run</code> pra detectar breaking changes em .d.ts automaticamente. Com isso, você não publica regressão de types silenciosa — consumer não precisa reportar pra você descobrir.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
