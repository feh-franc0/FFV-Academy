import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-cli-tool-ts');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que publicar um CLI em npm exige campo `bin` em package.json?',
    options: [
      'Pra aparecer no site do npm',
      'Pra que npm crie um symlink no PATH quando alguém instalar globalmente (ou via npx) — apontando pro entry file',
      'Por limite de Node',
      'Pra controlar versão',
    ],
    correct: 1,
    explanation: '"bin": { "meu-cli": "./dist/index.js" } instrui npm/pnpm a criar symlink. O arquivo precisa começar com `#!/usr/bin/env node` (shebang). Sem isso, npx e global install não funcionam.',
  },
  {
    question: 'Por que usar Zod pra parse de argumentos em vez de acessar `argv` direto?',
    options: [
      'Zod é mais rápido no runtime',
      'Porque argv vem como string; validação com Zod garante tipagem, coerção (--count 5 → number) e mensagens de erro ricas',
      'Pra reduzir bundle',
      'Por ser trendy',
    ],
    correct: 1,
    explanation: 'CLI args sempre chegam como string. Zod (ou citty/yargs com schema) transforma em tipos corretos, valida obrigatórios, gera help automático. Erros viram mensagens que o usuário entende ("--count deve ser número positivo") em vez de crash aleatório.',
  },
  {
    question: 'Qual ferramenta gerencia releases automatizados em monorepo com versioning semântico?',
    options: [
      'npm publish --force',
      'changesets — commits trazem "changeset" descrevendo tipo (major/minor/patch) e lib afetada; CI publica automaticamente',
      'Só tag manual',
      'Git rebase',
    ],
    correct: 1,
    explanation: 'Changesets (pnpm changeset) é padrão em monorepos TS. Dev adiciona changeset no commit; merge gera PR de versão; aprovar publica no npm com changelog automático. Alternativa: semantic-release (mono-package, commit-driven).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-cli-tool-ts"
      title="Capstone: construir um CLI tool TypeScript end-to-end"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="TypeScript Profissional"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O projeto" accent={accent}>
        <p>
          Vamos construir <strong>ffv-count</strong>: CLI que conta palavras, linhas e caracteres de arquivos (estilo <InlineCode>wc</InlineCode>) mas com output JSON/CSV e validação tipada. Projeto pequeno o suficiente pra terminar numa tarde, grande o suficiente pra exercitar tudo que a trilha ensinou.
        </p>
      </Section>

      <Section title="1. Estrutura" accent={accent}>
        <CodeBlock lang="bash">{`ffv-count/
├── src/
│   ├── index.ts       # entry (shebang + main)
│   ├── cli.ts         # parse args com Zod
│   ├── count.ts       # lógica pura
│   └── output.ts      # formatters
├── test/
│   └── count.test.ts
├── package.json
├── tsconfig.json
└── README.md`}</CodeBlock>
      </Section>

      <Section title="2. Argumentos tipados com Zod" accent={accent}>
        <CodeBlock lang="typescript">{`// src/cli.ts
import { z } from 'zod';
import { parseArgs } from 'node:util';

const ArgsSchema = z.object({
  files: z.array(z.string()).min(1),
  format: z.enum(['json', 'csv', 'text']).default('text'),
  verbose: z.boolean().default(false),
});

export type CliArgs = z.infer<typeof ArgsSchema>;

export function parseCliArgs(argv: string[]): CliArgs {
  const { values, positionals } = parseArgs({
    args: argv.slice(2),
    options: {
      format: { type: 'string', short: 'f' },
      verbose: { type: 'boolean', short: 'v' },
    },
    allowPositionals: true,
  });
  const parsed = ArgsSchema.safeParse({ files: positionals, ...values });
  if (!parsed.success) {
    console.error('Erro nos argumentos:', parsed.error.message);
    process.exit(1);
  }
  return parsed.data;
}`}</CodeBlock>
      </Section>

      <Section title="3. Lógica pura + Result" accent={accent}>
        <CodeBlock lang="typescript">{`// src/count.ts
import { readFile } from 'node:fs/promises';

export type FileStats = { file: string; lines: number; words: number; chars: number };
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export async function countFile(path: string): Promise<Result<FileStats, Error>> {
  try {
    const content = await readFile(path, 'utf8');
    return {
      ok: true,
      value: {
        file: path,
        lines: content.split('\\n').length,
        words: content.split(/\\s+/).filter(Boolean).length,
        chars: content.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}`}</CodeBlock>
      </Section>

      <Section title="4. Entry com shebang + bin" accent={accent}>
        <CodeBlock lang="typescript">{`#!/usr/bin/env node
// src/index.ts
import { parseCliArgs } from './cli.js';
import { countFile } from './count.js';
import { formatOutput } from './output.js';

const args = parseCliArgs(process.argv);
const controller = new AbortController();
process.on('SIGINT', () => controller.abort());

const results = await Promise.all(args.files.map(countFile));
const ok = results.filter(r => r.ok).map(r => r.value);
const errors = results.filter(r => !r.ok);

console.log(formatOutput(ok, args.format));
if (errors.length > 0) process.exit(1);`}</CodeBlock>
        <CodeBlock lang="json">{`// package.json
{
  "name": "ffv-count",
  "version": "0.1.0",
  "type": "module",
  "bin": { "ffv-count": "./dist/index.js" },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "files": ["dist/**"]
}`}</CodeBlock>
      </Section>

      <Section title="5. Testes + release" accent={accent}>
        <CodeBlock lang="typescript">{`// test/count.test.ts
import { describe, it, expect } from 'vitest';
import { countFile } from '../src/count.js';

describe('countFile', () => {
  it('conta linhas, palavras e chars', async () => {
    const r = await countFile('./test/fixtures/hello.txt');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.words).toBe(2);
      expect(r.value.lines).toBeGreaterThan(0);
    }
  });

  it('retorna err em arquivo inexistente', async () => {
    const r = await countFile('./nope');
    expect(r.ok).toBe(false);
  });
});`}</CodeBlock>
        <p>
          Release: <InlineCode>pnpm changeset</InlineCode> → descreva mudança → commit → CI publica. Done.
        </p>
        <Callout tone="success" icon="🎓">
          Você aplicou: tipos estruturais, narrowing, Zod em boundary, Result, async, tests. CLI roda, publica, tem help. Isso é TypeScript profissional em menos de 300 linhas.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
