import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('monorepo-pnpm-turbo');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que pnpm é preferido em monorepos grandes em vez de npm/yarn?',
    options: [
      'Porque tem logo melhor',
      'Porque usa content-addressable store (cada versão de dep existe uma vez no disco, symlinkada), drasticamente reduzindo espaço e tempo de install',
      'Porque não suporta TS',
      'Porque é feito pela Microsoft',
    ],
    correct: 1,
    explanation: 'npm/yarn flattened node_modules duplicam libs entre workspaces. pnpm tem store global: cada {nome, versão, peer} existe 1x em ~/.pnpm-store e cada projeto tem symlinks. Install de repo grande passa de minutos para segundos. Strict: resolve quebra de peer dependency cedo.',
  },
  {
    question: 'Qual a função principal do Turbo (turborepo)?',
    options: [
      'Compilar TypeScript mais rápido',
      'Orquestrar tarefas (build, test, lint) respeitando dependências entre pacotes e cacheando saída — local e remoto',
      'Substituir npm scripts',
      'Gerenciar versões de Node',
    ],
    correct: 1,
    explanation: 'Turbo lê turbo.json com pipeline (ex: build depende de ^build — o ^ significa "dos pacotes dos quais eu dependo"). Cache por hash das inputs: se nada mudou, reusa. Remote cache via Vercel/auto-hospedado faz CI voar.',
  },
  {
    question: 'Qual é um anti-padrão em monorepo que costuma gerar dor?',
    options: [
      'Ter múltiplos packages',
      'Circular dependencies entre packages — ex: lib-ui importa lib-utils que importa lib-ui. Turbo não consegue resolver, builds infinitos',
      'Usar TypeScript',
      'Ter README em cada package',
    ],
    correct: 1,
    explanation: 'Circular deps são o pior inimigo. Causam cache misses, build loops, bugs sutis de hoisting. Detecte com `madge --circular` ou `pnpm why`. Regra: grafo de packages deve ser DAG (acíclico). Se precisar de algo bidirecional, extraia pra package neutro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="monorepo-pnpm-turbo"
      title="Monorepo profissional: pnpm workspaces + Turbo + shared configs"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="capstone-cli-tool-ts"
      nextTitle="Capstone: construir um CLI tool TypeScript end-to-end"
      quiz={quiz}
    >
      <Section title="Por que monorepo" accent={accent}>
        <p>
          Empresas como Google, Meta, Microsoft — todas escolheram monorepo. Motivos:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Atomic commits</strong>: mudança que afeta lib + app viram um commit só, revisado junto.</li>
          <li><strong>Shared packages</strong>: UI lib, types, configs reusados sem publicar no npm.</li>
          <li><strong>CI unificada</strong>: build/test de tudo num lugar.</li>
          <li><strong>Refatoração cross-projeto</strong>: editor enxerga tudo.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Monorepo ≠ gigante arquivo único. Cada package é isolado. O que é compartilhado é o <em>repositório</em>, não o código.
        </Callout>
      </Section>

      <Section title="Estrutura típica" accent={accent}>
        <CodeBlock lang="bash">{`.
├── package.json            # raiz, só devDeps
├── pnpm-workspace.yaml     # define packages/*
├── turbo.json              # pipeline
├── tsconfig.base.json      # config shared
├── packages/
│   ├── ui/                 # componentes
│   ├── utils/              # helpers puros
│   └── types/              # tipos shared
└── apps/
    ├── web/                # Next.js
    └── api/                # backend`}</CodeBlock>
      </Section>

      <Section title="pnpm-workspace.yaml + turbo.json" accent={accent}>
        <CodeBlock lang="yaml">{`# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'`}</CodeBlock>
        <CodeBlock lang="json">{`{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": { "outputs": [] },
    "dev": { "cache": false, "persistent": true }
  }
}`}</CodeBlock>
        <p>
          <InlineCode>^build</InlineCode> = &quot;primeiro build dos packages dos quais eu dependo&quot;. <InlineCode>outputs</InlineCode> diz o que cachear. Turbo hasheia inputs; se nada mudou, reusa.
        </p>
      </Section>

      <Section title="Shared tsconfig" accent={accent}>
        <CodeBlock lang="json">{`// tsconfig.base.json (raiz)
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}

// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"]
}`}</CodeBlock>
      </Section>

      <Section title="Armadilhas reais" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Hoisting sujeito a bug</strong>: pnpm é strict. Se seu código importa lib não declarada (veio transiente), quebra. Isso é FEATURE — declare no package.json.</li>
          <li><strong>Peer deps entre workspaces</strong>: especifique como <InlineCode>&quot;workspace:*&quot;</InlineCode> — pnpm resolve pro package local automaticamente.</li>
          <li><strong>CI cold</strong>: sem remote cache, builds de monorepo grande ficam lentos. Turbo remote cache (ou <InlineCode>turborepo-remote-cache</InlineCode> self-hosted) resolve.</li>
          <li><strong>VSCode perdido</strong>: abra o monorepo pela raiz, não por subfolder — senão Intellisense não enxerga packages irmãos.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
