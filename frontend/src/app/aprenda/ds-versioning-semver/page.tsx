import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, FlowDiagram, DecisionBox, Timeline, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ds-versioning-semver');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é uma breaking change em DS e como classificar corretamente em semver?',
    options: [
      'Qualquer mudança é breaking',
      'Breaking change = remoção de export, mudança de prop signature, renomeação de classe CSS pública, mudança de valor de semantic token que altera visual de componentes existentes. Semver: major (X.0.0) para breaking, minor (x.Y.0) para adições retrocompatíveis, patch (x.y.Z) para fixes. Hardcoded color changes em componentes (rebrand) são MAJOR porque podem quebrar overrides de consumers',
      'Mudança de cor nunca é breaking',
      'Adicionar componente é breaking',
    ],
    correct: 1,
    explanation:
      'A confusão clássica em DS: "só mudei a cor, é minor". Mas se a cor afetar contrast em consumers (test snapshots, brand customizations), é breaking. Regra prática: se quebra screenshot test de algum consumer conhecido, é major. Conservador é melhor.',
  },
  {
    question: 'Por que changesets (Atlassian) virou o padrão para monorepos com múltiplos packages?',
    options: [
      'Não é padrão',
      'Porque automatiza: contribuidor adiciona arquivo .changeset/<random>.md descrevendo a mudança e severidade, CI agrupa changesets em PR de release, gera CHANGELOG, faz bumps coordenados nos packages dependentes, publica no npm. Resolve o problema de lerna/yarn workspaces ("quem decide bump de cada package?") com workflow explícito',
      'É mais rápido que git tag',
      'Substitui o npm',
    ],
    correct: 1,
    explanation:
      'changesets foi criado pela Atlassian para AtlasKit (DS multi-package). Hoje usado por Chakra, MUI Joy, Storybook, Astro, Remix, shadcn-registry e centenas de outros. A vitória: documenta intenção de release no commit, não no momento de publicar.',
  },
  {
    question: 'O que é "deprecation lifecycle" em DS sério?',
    options: [
      'Deletar quando der vontade',
      'Processo: (1) marcar com @deprecated em JSDoc + console.warn em runtime + visual indicator em Storybook, (2) abrir RFC de substituto, (3) manter por N versões major (típico: 2 majors), (4) eventualmente remover em major. Permite consumers migrarem gradualmente. Codemods (jscodeshift) podem automatizar a migração para reduzir fricção',
      'Sem aviso prévio',
      'Só refactor interno',
    ],
    correct: 1,
    explanation:
      'Time imaturo deleta API "porque ninguém usa". Time maduro segue lifecycle: marca deprecated, documenta substituto, espera ciclos, oferece codemod, então remove. Adobe Spectrum, Shopify Polaris e Material UI fazem isso bem documentado.',
  },
  {
    question: 'Para que servem codemods (jscodeshift) em DS?',
    options: [
      'Inúteis',
      'Codemods são scripts AST-based que reescrevem código consumer automaticamente para migrar de API antiga para nova. Exemplo: renomeação de <Button variant="primary"> para <Button kind="primary"> em 800 arquivos vira `npx mycodemod@latest button-variant-rename`. Reduz custo de upgrade para consumers de horas para minutos. MUI publica codemods em todo major',
      'É só linter',
      'Substitui testes',
    ],
    correct: 1,
    explanation:
      'Codemods viram diferencial competitivo entre DS bom e excelente. MUI publica codemods em todo major (v4→v5 codemod migrou ~70% das ocorrências). React mesmo publica codemods (defaultProps→default args). jscodeshift é a lib base, ts-morph alternativa mais simples para projetos TypeScript.',
  },
  {
    question: 'Por que RFC process antes de mudanças grandes em DS?',
    options: [
      'Burocracia desnecessária',
      'RFC (Request For Comments) força explicitar motivação, design alternatives, breaking impact, migration path ANTES de implementar. Inspirado em IETF RFCs e React RFCs (github.com/reactjs/rfcs). Em DS, captura context para futuro arqueologista de código e força discussão antes de PR de 2000 linhas. Custo: tempo de escrever; benefício: evita refactors no merge',
      'Só sobrecarga',
      'Não funciona em time',
    ],
    correct: 1,
    explanation:
      'RFC process foi popularizado pelo Rust e React. Em DS, é especialmente valioso porque mudanças afetam dezenas de consumers. PR de 2000 linhas sem RFC tipicamente vira refactor de 4000 linhas depois de review. RFC de 1 página economiza dias.',
  },
  {
    question: 'Como tags release no GitHub se relacionam com publish no npm?',
    options: [
      'Independentes',
      'Em workflow maduro: changeset CLI faz npm publish + cria git tag + cria GitHub Release com CHANGELOG auto-gerado, tudo em ação CI. Tag git é o ponto de truth (referencia commit que foi publicado). GitHub Release agrega CHANGELOG entries. npm é apenas o registry. Em ação errada, dessincroniza (npm versão X, git tag missing) e debugging vira pesadelo',
      'GitHub release substitui npm',
      'npm não precisa de tag',
    ],
    correct: 1,
    explanation:
      'O fluxo correto: PR merge → changesets/action consome changesets → bumpa package.json → npm publish → git tag vX.Y.Z → push tag → GitHub release. Tudo automático em uma ação. Em projetos manuais, dessincronização é regra, não exceção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ds-versioning-semver"
      title="DS versioning: changesets, semver, deprecation strategy"
      icon="🏷️"
      xp={60}
      readTime={12}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="ds-a11y-completo"
      nextTitle="A11y no DS: WAI-ARIA, focus management, screen reader test"
      quiz={quiz}
    >
      <Section title="Por que versionamento de DS é diferente de versionamento de app" accent={accent}>
        <p>
          Um app interno tem 1 consumer (o app), 0 contratos públicos e zero risco de breaking
          change — você quebra, conserta no mesmo deploy. Um DS é uma <strong>biblioteca
          publicada</strong> com N consumers (apps web, mobile, marketing, parceiros). Quebrar
          contrato sem aviso significa: builds quebrados em produção de consumers, designers
          XPLodindo, tickets de suporte, perda de confiança no DS — efeito multiplicador.
        </p>
        <p>
          Por isso, DS sério adota disciplina de biblioteca: semver real, changelog, deprecation
          lifecycle, codemods, RFC process. Times maduros (Shopify Polaris, Adobe Spectrum, IBM
          Carbon, Atlassian) tratam o DS como produto interno com versão pública. Esse módulo
          cobre o workflow consenso 2026.
        </p>
        <Callout tone="info" icon="📜">
          Histórico: lerna (2016) tentou resolver monorepo versioning mas era complicado em
          customização. yarn workspaces (2017) simplificou install mas não versionou. changesets
          (2019, Atlassian) inverteu o modelo: contribuidor declara intenção, CI consolida. Hoje
          é padrão de facto.
        </Callout>
      </Section>

      <Section title="Semver na prática (e não na teoria)" accent={accent}>
        <p>
          Semver formal (semver.org) diz: MAJOR.MINOR.PATCH = breaking.feature.fix. Aplicar em
          DS na prática exige decisões cinzas:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Mudança', 'Bump', 'Por quê']}
          rows={[
            ['Remover prop', 'MAJOR', 'Breaking explícito'],
            ['Renomear prop (variant → kind)', 'MAJOR', 'Quebra TS types e runtime'],
            ['Tornar prop required', 'MAJOR', 'Consumers sem prop quebram'],
            ['Adicionar componente novo', 'MINOR', 'Não afeta código existente'],
            ['Adicionar prop optional', 'MINOR', 'Defaults preservam behavior'],
            ['Mudar valor de semantic token (rebrand)', 'MAJOR (controverso)', 'Pode quebrar visual regression de consumers'],
            ['Bug fix sem mudar API', 'PATCH', 'Comportamento corrigido sem surpresa'],
            ['Mudar implementação interna', 'PATCH', 'Se output observável é igual'],
            ['Atualizar dep Radix de 1.x para 2.x', 'MAJOR (defensivo)', 'Transitively breaking'],
            ['Adicionar variant a um componente existente', 'MINOR', 'Não afeta variantes anteriores'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          A regra ouro: <strong>quando em dúvida, bump major</strong>. Custo de major desnecessário
          é desconforto (consumers veem CHANGELOG, "acabou de ter v2 e agora v3?"). Custo de
          breaking change sem major é desastre.
        </Callout>
      </Section>

      <Section title="changesets: o workflow consenso" accent={accent}>
        <p>
          changesets resolve o problema "quem decide qual package bumpar e em qual nível?" com
          fluxo explícito: cada PR que tem efeito em pacote adiciona um arquivo descritivo. CI
          agrupa em PR de release.
        </p>
        <CodeBlock lang="bash">{`# Setup inicial (monorepo)
npm install -D @changesets/cli @changesets/changelog-github
npx changeset init

# Cria .changeset/config.json — define packages e tipo de bump`}</CodeBlock>
        <CodeBlock lang="json">{`{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "acme/design-system" }],
  "commit": false,
  "fixed": [["@acme/tokens", "@acme/ui"]],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@acme/storybook"]
}`}</CodeBlock>
        <p>
          Workflow do contribuidor:
        </p>
        <Timeline
          accent={accent}
          events={[
            { when: '1. PR criada', label: 'Dev abre PR com mudança em @acme/ui' },
            { when: '2. npx changeset', label: 'Cria .changeset/funky-cats-jump.md descrevendo bump + nota' },
            { when: '3. Review', label: 'Time revisa código + changeset (severidade declarada)' },
            { when: '4. Merge em main', label: 'Changesets/action acumula em PR "Version Packages"' },
            { when: '5. PR Version Packages', label: 'CI gera CHANGELOG.md, bumpa package.json, sem human edit' },
            { when: '6. Merge release PR', label: 'CI publica no npm, cria git tag, GitHub release' },
          ]}
        />
        <CodeBlock lang="markdown">{`---
"@acme/ui": minor
"@acme/tokens": patch
---

Add new \`Combobox\` component with WAI-ARIA listbox pattern.

Fix \`color.surface.subtle\` token to improve contrast in light mode (WCAG AA).`}</CodeBlock>
      </Section>

      <Section title="CI: o release automatizado" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
concurrency: \${'$'}{{ github.workflow }}-\${'$'}{{ github.ref }}
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write    # npm provenance
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release        # npx changeset publish
          version: npm run version-packages
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: \${'$'}{{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${'$'}{{ secrets.NPM_TOKEN }}`}</CodeBlock>
        <p>
          Resultado: cada merge em main com changesets abre/atualiza PR "Version Packages". Quando
          merged, CI bumpa, publica, cria tag — tudo em uma ação. Nada manual.
        </p>
      </Section>

      <Section title="Deprecation lifecycle: o jeito certo" accent={accent}>
        <p>
          Deletar API "porque ninguém usa" sem aviso é falha profissional. Lifecycle correto:
        </p>
        <FlowDiagram
          title="Deprecation lifecycle (recomendação Brad Frost + Nathan Curtis)"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: '1. Marcar @deprecated em código', desc: 'JSDoc + TS deprecation flag + Storybook tag' },
            { label: '2. Console.warn em dev', desc: 'Avisa consumer sem quebrar prod' },
            { label: '3. Documentar substituto', desc: 'CHANGELOG e MIGRATION.md com codemod (se houver)' },
            { label: '4. Manter por N majors', desc: 'Padrão: 2 majors. Time crítico: 4 majors' },
            { label: '5. Remover em major', desc: 'Anúncio em CHANGELOG: "BREAKING: removed X (deprecated since v3)' },
          ]}
        />
        <CodeBlock lang="tsx">{`/**
 * @deprecated Use \`<Button variant="destructive">\` instead.
 * Will be removed in v5.0.0. Migration: \`npx @acme/codemods@latest button-danger-to-destructive\`
 */
export function DangerButton(props: ButtonProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[@acme/ui] DangerButton is deprecated. Use <Button variant="destructive"> instead. ' +
      'Migration: npx @acme/codemods@latest button-danger-to-destructive'
    );
  }
  return <Button variant="destructive" {...props} />;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Marcador <InlineCode>@deprecated</InlineCode> em JSDoc/TS é lido pelo VS Code (mostra
          tachado), ESLint plugin <InlineCode>eslint-plugin-deprecation</InlineCode> avisa em build,
          Storybook addon mostra badge "Deprecated" no story. Tooling completo guia consumer.
        </Callout>
      </Section>

      <Section title="Codemods: a chave para upgrades suaves" accent={accent}>
        <p>
          Codemod é script AST-based que reescreve código. Quando você muda API, codemod migra
          consumers automaticamente. Reduz custo de upgrade de "dia inteiro" para "5 minutos".
        </p>
        <CodeBlock lang="javascript">{`// codemods/button-danger-to-destructive.js (jscodeshift)
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // <DangerButton ...> → <Button variant="destructive" ...>
  root
    .find(j.JSXElement, { openingElement: { text: { text: 'DangerButton' } } })
    .forEach((path) => {
      const opening = path.node.openingElement;
      const closing = path.node.closingElement;

      opening.name = j.jsxIdentifier('Button');
      if (closing) closing.name = j.jsxIdentifier('Button');

      // Adiciona variant="destructive"
      opening.attributes = [
        j.jsxAttribute(j.jsxIdentifier('variant'), j.literal('destructive')),
        ...opening.attributes,
      ];
    });

  // Atualiza import
  root
    .find(j.ImportSpecifier, { imported: { text: 'DangerButton' } })
    .forEach((path) => {
      path.node.imported.name = 'Button';
      if (path.node.local?.name === 'DangerButton') {
        path.node.local.name = 'Button';
      }
    });

  return root.toSource({ quote: 'single' });
}`}</CodeBlock>
        <p>
          Distribuir como CLI tool:
        </p>
        <CodeBlock lang="bash">{`# Consumer roda
npx @acme/codemods@latest button-danger-to-destructive ./src

# Internamente usa jscodeshift
# jscodeshift -t button-danger-to-destructive.js ./src --parser=tsx`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Codemods <strong>não substituem revisão manual</strong> — eles cobrem ~70-90% dos
          casos. Edge cases (props dinâmicos, spread, HOCs) ficam para review. Sempre rodar em
          branch separada com revisão antes de merge.
        </Callout>
      </Section>

      <Section title="RFC process: antes de implementar, escrever" accent={accent}>
        <p>
          RFC (Request For Comments) é documento curto (1-3 páginas) que descreve mudança
          proposta antes de implementação. Popularizado pelo Rust (rust-lang/rfcs) e React
          (reactjs/rfcs). Em DS, especialmente valioso porque mudanças afetam dezenas de
          consumers.
        </p>
        <CodeBlock lang="markdown">{`# RFC-0012: Replace Button.size prop with t-shirt sizes

- Start Date: 2026-02-14
- RFC PR: #234
- Implementation PR: TBD
- Author: @feh-franco0

## Summary

Replace numeric \`size={1|2|3|4}\` with string \`size={"sm"|"md"|"lg"|"xl"}\` for consistency
with Spacing scale and other components.

## Motivation

Currently:
- Spacing uses t-shirt sizes (sm/md/lg)
- Typography uses t-shirt sizes
- Button uses numbers (1/2/3/4)
- Input uses numbers

Inconsistency causes friction. Designers expect uniform vocabulary across components.

## Detailed design

\`\`\`tsx
<Button size="md"> ✓ new
<Button size={2}>  ✗ removed
\`\`\`

Mapping for migration:
- size={1} → size="sm"
- size={2} → size="md"  (default)
- size={3} → size="lg"
- size={4} → size="xl"

## Drawbacks

- Major version bump (v4)
- Codemod needed for all consumers (~12 apps)

## Alternatives

- Accept both: \`size={1 | "sm"}\` — rejected, more complex
- Keep numbers, change other components — rejected, t-shirt is industry standard

## Migration path

1. Mark size={1|2|3|4} as @deprecated in v3.5
2. Ship codemod \`button-size-t-shirt\`
3. Remove numeric support in v4 (3 months later)

## Open questions

- Should \`xs\` size be added now or in future RFC?`}</CodeBlock>
      </Section>

      <Section title="Multi-package monorepo: estratégias" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'Quando', 'Tradeoff']}
          rows={[
            ['Fixed (lockstep)', '@acme/tokens + @acme/ui sempre mesmo número', 'Simples; força bump de todos juntos'],
            ['Linked (relacionado)', 'Quando atualiza A, atualiza B junto (mesma severidade)', 'Meio termo'],
            ['Independent (default)', 'Cada package versão própria', 'Flexível; consumer instala versões precisas'],
          ]}
        />
        <p>
          Recomendação: <strong>independent por default</strong>, com <InlineCode>fixed</InlineCode> entre packages
          fortemente acoplados (tokens + ui). changesets suporta ambos via config.
        </p>
      </Section>

      <Section title="Antipatterns" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Force-push em tags publicadas.</strong> npm não permite republish da mesma versão.
          Se publicou bug, npm <InlineCode>deprecate @acme/ui@1.2.3 "bad release, use 1.2.4"</InlineCode> e publique 1.2.4. Nunca reescreva tag git pública.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Manual edit de CHANGELOG.</strong> changesets gera CHANGELOG. Editar manualmente cria conflitos no próximo PR de versão. Se precisar adicionar info, edite na .changeset/*.md ANTES de merge.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Skipping major em mudança de token.</strong> "É só rebrand, é minor" — não. Se afeta visual de consumers, é major. Tokens são parte da API pública.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Não testar package publicado.</strong> Sempre <InlineCode>npm pack</InlineCode> + instalar tarball em projeto de teste antes de release real. Pega problemas de exports, types, peerDependencies.
        </Callout>
      </Section>

      <Section title="Decisão final" accent={accent}>
        <DecisionBox
          scenario="Qual workflow de versionamento adotar?"
          winner="changesets + semver disciplinado + lifecycle de deprecation + codemods quando feasible"
          winnerColor={accent}
          why="changesets é o padrão de monorepos JS em 2026 e elimina dessincronizações manuais. Semver protege consumers. Deprecation lifecycle mantém confiança no DS. Codemods reduzem custo de upgrade — diferencial entre DS bom e excelente."
          alternatives={[
            { name: 'lerna publish', when: 'Projeto legacy; migração para changesets é trivial' },
            { name: 'release-please (Google)', when: 'Prefere conventional commits style' },
            { name: 'Manual versioning', when: 'Nunca — sempre acaba em dessincronia' },
          ]}
        />
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Devo publicar DS interno em npm público ou privado?"
          a="Privado (npm Pro, GitHub Packages, Verdaccio self-hosted). Acesso controlado, sem expor IP. Open source só se DS é estratégico para marca (Polaris, Carbon, Material)."
        />
        <QAItem
          q="Como handle peerDependency conflicts?"
          a="Declare React como peerDependency com range largo (^18.0.0 || ^19.0.0). Use semver minor/major no peer, não exact. Lock files do consumer resolvem."
        />
        <QAItem
          q="Branches: main vs next vs beta?"
          a="changesets/action suporta pre mode (npx changeset pre enter next). Permite publish @next tag sem afetar main. Útil para testar major release com consumers selecionados."
        />
        <QAItem
          q="Como saber se um break afetou consumers?"
          a="Build matrix em CI: PR do DS roda CI de consumers em parallel (matrix.consumer). Falha aparece como check. Vercel/Netlify previews de consumers também funcionam."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          <strong>changesets docs</strong> (github.com/changesets/changesets),{' '}
          <strong>semver.org</strong>, <strong>jscodeshift docs</strong>{' '}
          (github.com/facebook/jscodeshift), <strong>React RFCs</strong> (github.com/reactjs/rfcs),{' '}
          <strong>Nathan Curtis — "Versioning Design Systems"</strong> (EightShapes), e{' '}
          <strong>Material UI migration guides</strong> como case study (mui.com/material-ui/migration/).
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: DS é biblioteca publicada — adote disciplina de biblioteca. Semver
          real, changesets para coordenar bumps em monorepo, deprecation lifecycle com
          codemods, RFC antes de mudança grande. Tag git, GitHub release, npm publish em uma
          ação CI. Quando em dúvida, bump major. Time maduro investe em codemods para reduzir
          custo de upgrade dos consumers. Próximo módulo: a11y no DS — onde acertar 1 vez
          beneficia todos os consumers.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
