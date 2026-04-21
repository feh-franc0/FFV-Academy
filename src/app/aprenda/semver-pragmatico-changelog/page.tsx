import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('semver-pragmatico-changelog');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Renomear um parâmetro de função é breaking?',
    options: [
      'Nunca',
      'Depende do call site — posicional (fn(a, b)) não quebra, mas se for chamada com objeto destructuring ({ nome }) ou TS com tipos documentados, sim; em lib pública a regra é: se qualquer consumer vê o nome, é major',
      'Sempre',
      'Só no teste',
    ],
    correct: 1,
    explanation: 'Semver protege API observável. Em JS/TS, tipos de parâmetro exportados (interface Options) são parte da API. Renomear campo de objeto = quebra consumer que typed. Mesmo rename interno pode aparecer em stack traces, docs auto-geradas, code completion. Regra: não rename em major. Se precisa migrar, adicione alias deprecated no minor e remova no próximo major.',
  },
  {
    question: 'Por que changesets ganhou sobre semantic-release?',
    options: [
      'Marketing',
      'Changesets desacopla "descrever mudança" (markdown por PR) de "fazer release" (CI run); funciona bem em monorepo (múltiplas libs, bumps independentes), dá controle humano sobre scope de bump, gera changelog legível — semantic-release automatiza 100% baseado em commit messages, frágil em monorepo',
      'É mais barato',
      'Obrigatório npm',
    ],
    correct: 1,
    explanation: 'Semantic-release bumpa automático baseado em conventional commits. Em mono pequeno funciona; em mono com 20 pacotes + refactor cross-package, determinar quem bumpa o quê fica confuso. Changesets: PR adiciona .md explicando mudança + severidade (patch/minor/major). Bot agrega em release PR, consolida changelog, publica via CI. Padrão em pnpm/turborepo/vite/shadcn monorepos.',
  },
  {
    question: 'Quando fazer pre-release (0.x versões alpha/beta/rc)?',
    options: [
      'Só hobby',
      'Pre-1.0 (0.x) sinaliza API instável — cada minor pode quebrar; útil enquanto API amadurece. Alpha/beta/rc dentro de major (1.0.0-beta.3) pra feedback em mudança grande antes de stable; ambos liberam experimentação sem commit rígido de semver',
      'Nunca',
      'Só em lib interna',
    ],
    correct: 1,
    explanation: '0.x é convenção explícita: consumer sabe que breaking pode vir em 0.3 → 0.4. Ideal pra primeiros meses. Pre-release tags (1.0.0-alpha.1) pra next major em development: npm install lib@next puxa preview. Ambos protegem você de commit prematuro a API stable. Contrariamente: 1.0.0 pede commitment, 2.0.0 em 6 meses queima credibilidade.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="semver-pragmatico-changelog"
      title="Semver pragmático + changesets release"
      icon="📋"
      xp={50}
      readTime={12}
      trailName="Library & Package Authoring"
      trailColor={accent}
      nextSlug="typings-como-produto"
      nextTitle="Typings como produto: rigor em .d.ts"
      quiz={quiz}
    >
      <Section title="Semver é contrato social" accent={accent}>
        <p>
          SemVer é simples: MAJOR.MINOR.PATCH. Major muda API incompatível. Minor adiciona feature compatível. Patch corrige bug compatível. O desafio está em julgar "incompatível" honestamente — rename de parâmetro, mudança de tipo TS, erro mais específico, tudo pode quebrar consumer.
        </p>
        <CodeBlock lang="ts">{`// Breaking (major):
// - Remover export
// - Renomear parâmetro que consumer passa por nome
// - Mudar tipo de retorno (ex.: Promise<T> → T sync)
// - Default behavior diferente (strict: true virou default)
// - Dependency peer range ficou mais restrito

// Feature (minor):
// - Novo export
// - Nova option com default backward-compatible
// - Performance sem mudar saída

// Fix (patch):
// - Bug corrigido sem mudar API
// - Correção de tipo que estava inconsistente com runtime`}</CodeBlock>
      </Section>

      <Section title="Changesets: workflow no dia a dia" accent={accent}>
        <CodeBlock lang="bash">{`# Setup uma vez:
pnpm add -D @changesets/cli
pnpm changeset init

# Desenvolvimento: PR com mudança
# Após commit, roda:
pnpm changeset

# Prompt:
# ? Which packages should have a new version?  (spacebar pra selecionar)
# ? Which type of change is this for @ffv/date-helper?
#   > patch
#     minor
#     major
# ? Summary: fix DST edge case in parseISODate

# Gera .changeset/quiet-lemons-dance.md:
---
"@ffv/date-helper": patch
---
fix DST edge case in parseISODate

# Commit o changeset junto com o código.
git add . && git commit -m "fix: DST edge"`}</CodeBlock>
      </Section>

      <Section title="CI agrega e publica" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test
      - run: npx publint --strict
      - run: npx @arethetypeswrong/cli --pack

      - uses: changesets/action@v1
        with:
          publish: pnpm exec changeset publish
          version: pnpm exec changeset version
          commit: "chore: version packages"
          title: "Release"
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`}</CodeBlock>
        <p>
          Action cria PR "Release" acumulando todos os changesets pending. Merge do PR → changeset version bumpa package.json + consolida CHANGELOG.md + tag git + publica npm. Fluxo claro, auditável, sem mágica.
        </p>
      </Section>

      <Section title="Changelog que serve ao consumer" accent={accent}>
        <CodeBlock lang="markdown">{`# @ffv/date-helper

## 1.4.0 — 2026-04-19

### Minor Changes

- **feat**: novo helper \`formatRelative\` que retorna "há 3 dias" etc.
  Aceita \`{ locale: 'pt-BR' | 'en-US' }\`, default pt-BR.

### Patch Changes

- **fix**: \`parseISODate\` tratava timezone incorretamente em DST brasileiro.
  (#123) Obrigado @ciclano.
- **chore**: dep zod bumped ^3.22 → ^3.23.

## 1.3.2 — 2026-04-05

### Patch Changes

- **fix**: types de \`formatDate\` não aceitavam \`Date | string\` documentado.`}</CodeBlock>
        <Callout tone="info">
          Changelog é comunicação assíncrona com consumer. Linha "fix: #123" sem contexto não ajuda. Escreva 1-2 sentences cada entry: o que mudou, quem pediu (link PR/issue), qual impacto se houver.
        </Callout>
      </Section>

      <Section title="Deprecation strategy" accent={accent}>
        <CodeBlock lang="ts">{`// 1. Minor com aviso
/**
 * @deprecated Use formatDate. Será removido em v2.0.
 */
export function format(input: Date): string {
  // Em dev, avisa uma vez
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[@ffv/date-helper] format() is deprecated. Use formatDate().');
  }
  return formatDate(input);
}

// 2. Docs + changelog falam claramente
// 3. Pelo menos um minor cycle com deprecated
// 4. Major remove + anuncia no CHANGELOG breaking section`}</CodeBlock>
      </Section>

      <Section title="0.x como escolha estratégica" accent={accent}>
        <Callout tone="success" icon="✅">
          Fique em 0.x até API estar idiomática e ter ao menos 3 real consumers além de você. Cada 0.x → 0.(x+1) pode conter breaking com aviso no README. Quando você bate 1.0, é commitment público: next major só em 12+ meses, com migration guide escrito. Esse gate honest salva credibilidade.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
