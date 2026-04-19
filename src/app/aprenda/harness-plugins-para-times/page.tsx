import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-plugins-para-times');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a vantagem de empacotar skills + agents + hooks como plugin em vez de simplesmente commitar em .claude/ do projeto?',
    options: [
      'Plugins são automaticamente mais rápidos que .claude/ direto',
      'Plugins podem ser reusados entre múltiplos projetos sem duplicar código. Uma equipe pode instalar o mesmo plugin em 15 repos. Também são versionáveis separadamente, facilitam rollback, podem ser compartilhados entre equipes/clientes e publicados em marketplaces internos/públicos.',
      'Plugins não precisam de settings.json — são auto-configurados',
      'Plugins são a única forma de compartilhar skills entre devs',
    ],
    correct: 1,
    explanation: 'A distinção entre .claude/ local e plugins é sobre reúso e distribuição. .claude/ é perfeito para padrões específicos de UM projeto. Plugin é para padrões reaproveitáveis entre N projetos — times que trabalham em múltiplos repos, consultorias com múltiplos clientes, ou padrões organizacionais que mudam juntos (todos os repos devem ter /security-check v2). Plugins também têm namespace (meu-plugin:skill-name) evitando colisões, versionamento independente, marketplace e suporte a hot-reload com /reload-plugins. Use plugins quando a lógica é reutilizável; .claude/ quando é específica do projeto.',
  },
  {
    question: 'Um plugin contém uma skill chamada /deploy, mas o projeto também tem uma skill /deploy em .claude/skills/. Qual é invocada?',
    options: [
      'Sempre a do plugin — plugins têm prioridade máxima',
      'Sempre a do projeto — níveis mais específicos ganham',
      'A do projeto é invocada por padrão, pois tem prioridade sobre plugin. Para invocar explicitamente a do plugin, use o namespace: /<plugin-name>:deploy. Essa separação permite overrides intencionais e coexistência de plugins genéricos com adaptações por projeto.',
      'Ambas são executadas em paralelo',
    ],
    correct: 2,
    explanation: 'A hierarquia de skills 2026: enterprise > personal (~/.claude/skills/) > project (.claude/skills/) > plugin. O projeto ganha sobre plugin quando há conflito — permitindo que um projeto específico OVERRIDE uma skill distribuída via plugin. Para chamar explicitamente a versão do plugin, use namespace: /my-plugin:deploy. Isso dá granularidade: você pode ter /deploy genérico (plugin) + /deploy adaptado (projeto) + /team:deploy (plugin do time) coexistindo. A plataforma resolve via hierarquia, e o dev pode escolher explicitamente via namespace quando precisar.',
  },
  {
    question: 'Qual é uma boa prática ao versionar um plugin compartilhado entre times?',
    options: [
      'Usar sempre a versão latest — atualizar é sempre seguro',
      'Semver no plugin (major.minor.patch), CHANGELOG.md descrevendo mudanças, bump de major para mudanças que quebram contrato de skills/hooks, testes automatizados antes de publicar. Times podem pinnar versão específica em settings e atualizar quando revisarem o changelog.',
      'Versionamento não faz sentido para plugins — sempre use o código direto do git',
      'Manter apenas uma versão — se mudar, sobrescreva e todos atualizam',
    ],
    correct: 1,
    explanation: 'Plugins são código; mudanças mal-gerenciadas quebram workflows de devs. Semver + CHANGELOG é o mínimo. Major bumps para mudanças que quebram contrato: skill renomeada, hook que muda matcher, remoção de tool permitido. Times podem pinnar a versão: claude plugin install team-tools@2.3.1. Quando atualizar, revisam o changelog e testam num worktree primeiro. Combine com CI que testa o plugin (tem skills básicas funcionando, hooks retornam JSON válido). Plugins mal-versionados são pior que plugin nenhum — quebram confiança.',
  },
];

export default function HarnessPluginsPage() {
  return (
    <ModuleLayout
      slug="harness-plugins-para-times"
      title="Plugins: empacotar skills + agents + MCP + hooks para o time inteiro"
      icon="📦"
      xp={85}
      readTime={17}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-agent-sdk-em-producao"
      nextTitle="Agent SDK em produção: CI/CD, servidores e app embarcado"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Você construiu skills, subagents, hooks e MCP config sólidos pro seu projeto. Agora como distribuir isso pra todo o time, pra múltiplos clientes da agência, ou pra toda a organização? A resposta é <strong>plugins</strong>: pacotes versionáveis que empacotam harness engineering reutilizável. Instalados com <code>claude plugin install</code>, com namespace, semver, CHANGELOG, marketplace. Este módulo mostra como construir, versionar, distribuir e manter um plugin real.
      </p>

      <Section accent={accent} title="Anatomia de um plugin">
        <CodeBlock lang="text">{`my-team-tools/
├── plugin.json                   # manifest obrigatório
├── README.md                     # documentação
├── CHANGELOG.md                  # histórico de versões (semver)
├── LICENSE
├── skills/
│   ├── commit-standard/
│   │   ├── SKILL.md
│   │   └── scripts/validate.sh
│   ├── pr-template/
│   │   └── SKILL.md
│   └── security-audit/
│       ├── SKILL.md
│       ├── scripts/run-audit.sh
│       └── reference/owasp-checklist.md
├── agents/
│   ├── code-reviewer/
│   │   └── AGENT.md
│   └── security-auditor/
│       └── AGENT.md
├── hooks/
│   └── hooks.json                # hooks registrados automaticamente
├── mcp/
│   └── servers.json              # MCP servers que o plugin expõe
└── tests/
    ├── integration.sh
    └── fixtures/
        └── sample-prompt.json`}</CodeBlock>
        <CodeBlock lang="json">{`// plugin.json
{
  "name": "my-team-tools",
  "version": "2.3.1",
  "description": "Skills, agents e hooks padronizados do time de plataforma",
  "author": "Platform Team <platform@empresa.com>",
  "license": "MIT",
  "homepage": "https://github.com/empresa/my-team-tools",
  "repository": "git+https://github.com/empresa/my-team-tools.git",
  "claudeCodeVersion": ">=2.1.0",
  "entrypoints": {
    "skills": "./skills/",
    "agents": "./agents/",
    "hooks": "./hooks/hooks.json",
    "mcp": "./mcp/servers.json"
  },
  "settings": {
    "defaultPermissions": {
      "allow": ["Bash(git status)", "Bash(git diff:*)"]
    }
  },
  "dependencies": {
    "other-plugin": ">=1.0.0"
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Estrutura de hooks/hooks.json">
        <CodeBlock lang="json">{`// hooks/hooks.json — hooks que o plugin registra automaticamente
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "\${PLUGIN_DIR}/hooks/PreToolUse/security-check.sh",
          "timeout": 10
        }
      ]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "\${PLUGIN_DIR}/hooks/PostToolUse/lint.sh"
        }
      ]
    }
  ],
  "Stop": [
    {
      "matcher": ".*",
      "hooks": [
        {
          "type": "command",
          "command": "\${PLUGIN_DIR}/hooks/Stop/audit.sh"
        }
      ]
    }
  ]
}

// \${PLUGIN_DIR} é substituído pelo caminho real do plugin instalado.
// Scripts ficam em plugin/hooks/<event>/ por convenção.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Instalação e gerenciamento">
        <CodeBlock lang="shell">{`# Instalar plugin de repositório Git:
claude plugin install https://github.com/empresa/my-team-tools

# Instalar versão específica (branch/tag/commit):
claude plugin install https://github.com/empresa/my-team-tools#v2.3.1
claude plugin install https://github.com/empresa/my-team-tools#develop

# Instalar de diretório local (desenvolvimento):
claude plugin install ./my-team-tools

# Listar plugins instalados:
claude plugin list

# Output típico:
#   NAME               VERSION   SCOPE    STATUS
#   my-team-tools      2.3.1     user     enabled
#   security-scanner   1.1.0     user     enabled
#   legacy-plugin      0.9.0     project  disabled

# Enable/disable:
claude plugin enable my-team-tools
claude plugin disable legacy-plugin

# Update:
claude plugin update my-team-tools           # última versão
claude plugin update my-team-tools@2.4.0     # versão específica

# Desinstalar:
claude plugin uninstall my-team-tools

# Reload após mudanças em plugin local (dev):
/reload-plugins

# Scopes:
# - user: instalado em ~/.claude/plugins/ (todo projeto)
# - project: instalado em .claude/plugins/ (só este projeto, commitável)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Marketplace: discovery e distribuição">
        <CodeBlock lang="shell">{`# Listar plugins disponíveis:
claude plugin search security
claude plugin search --category deployment

# Instalar do marketplace oficial:
claude plugin install anthropic/security-scanner

# Marketplaces customizados (empresa tem o seu):
claude plugin install mycompany/team-tools --registry https://plugins.internal.empresa.com

# Configurar registry padrão:
claude plugin config set registry https://plugins.internal.empresa.com

# Marketplace interno (exemplo de servidor simples):
# - Endpoint /plugins.json lista plugins disponíveis
# - Endpoint /plugins/<name>/<version>.tar.gz serve o pacote
# - Autenticação via OAuth ou token (header Authorization)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Caso real: plugin ffv-academy-tools">
        <CodeBlock lang="text">{`ffv-academy-tools/                     # Plugin pro projeto do blog técnico
├── plugin.json
├── README.md
├── CHANGELOG.md
├── skills/
│   ├── novo-modulo/
│   │   ├── SKILL.md                  # /novo-modulo <trilha> <slug>
│   │   └── reference/
│   │       ├── module-template.md
│   │       └── conventions.md
│   ├── validar-currículo/
│   │   ├── SKILL.md                  # /validar-currículo
│   │   └── scripts/check-slugs.sh    # detecta duplicatas
│   ├── zip/
│   │   └── SKILL.md                  # /zip (build + deploy script)
│   └── release-drawio/
│       ├── SKILL.md                  # /release-drawio
│       └── scripts/regenerate.sh
├── agents/
│   └── quiz-reviewer/
│       └── AGENT.md                  # revisa quizzes por qualidade pedagógica
├── hooks/
│   └── hooks.json                    # registra hooks do plugin
└── tests/
    └── integration.sh`}</CodeBlock>
        <CodeBlock lang="yaml">{`# ffv-academy-tools/skills/novo-modulo/SKILL.md
---
name: novo-modulo
description: Cria um novo módulo/artigo na trilha correta do FFV Academy
allowed-tools: "Read Edit Write Glob Grep"
argument-hint: "[trilha-id] [slug] [título]"
---

# Novo Módulo

Trilha: $1
Slug: $2
Título: $3

## Verificações
1. Valide que trilha "$1" existe em src/lib/curriculum.ts
2. Valide que slug "$2" ainda NÃO existe no curriculum
3. Valide que slug está em kebab-case

## Criação
1. Adicione entrada de módulo em curriculum.ts (dentro da trail $1)
   Use o template em \${CLAUDE_SKILL_DIR}/reference/module-template.md
2. Crie src/app/aprenda/$2/page.tsx
   Use padrão dos módulos existentes da trilha
3. Adicione 3 perguntas de quiz com distratores realistas

## Convenções
Consulte \${CLAUDE_SKILL_DIR}/reference/conventions.md`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Versionamento e lifecycle">
        <ComparisonTable
          headers={['Tipo de mudança', 'Bump', 'Exemplo']}
          rows={[
            ['Nova skill/agent sem mudar existentes', 'minor (2.3.1 → 2.4.0)', '+ skill /new-feature'],
            ['Fix de bug em hook/skill existente', 'patch (2.3.1 → 2.3.2)', 'corrige regex do lint hook'],
            ['Skill renomeada ou removida', 'major (2.3.1 → 3.0.0)', '/deploy-v1 → /deploy'],
            ['Hook muda matcher (comportamento)', 'major', 'PreToolUse Bash → PreToolUse Bash(git:*)'],
            ['Tool adicionado ao allowed-tools', 'minor', '+ Edit(docs/**)'],
            ['Tool removido de allowed-tools', 'major', '- Write(**)'],
            ['Estrutura de frontmatter muda', 'major', 'context: fork passa a ser obrigatório'],
            ['Documentação ou README', 'patch', 'typo fix'],
          ]}
          accent={accent}
        />
        <CodeBlock lang="markdown">{`# CHANGELOG.md (padrão Keep a Changelog)

## [2.4.0] — 2026-04-15

### Added
- Skill /security-audit-quick: versão rápida do /security-audit
- Agent \`performance-analyzer\`: analisa queries SQL, identifica N+1

### Changed
- Skill /deploy agora suporta \`--dry-run\`
- Hook PostToolUse auto-format inclui .rs (rustfmt)

### Fixed
- Hook Stop no Slack: corrige escape de caracteres especiais em $USER
- Skill /pr-template: funciona em repos sem template padrão

## [2.3.1] — 2026-04-01

### Fixed
- Plugin não carregava em Windows (path separator)

## [2.3.0] — 2026-03-28

### Added
- Skill /changelog: gera CHANGELOG.md a partir de commits
- Agent \`docs-writer\`: gera docstrings automáticas

### Changed (BREAKING em major next)
- DEPRECATED skill /old-deploy → migrar pra /deploy antes de v3.0.0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Testes para plugin profissional">
        <CodeBlock lang="bash">{`#!/bin/bash
# tests/integration.sh — CI roda antes de publicar nova versão

set -e

PLUGIN_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "\$PLUGIN_DIR"

echo "▶ Validando plugin.json..."
cat plugin.json | jq . > /dev/null
VERSION=\$(jq -r .version plugin.json)
echo "  Versão: \$VERSION"

echo "▶ Validando skills..."
for skill in skills/*/; do
  NAME=\$(basename "\$skill")
  [ -f "\$skill/SKILL.md" ] || { echo "FAIL: \$NAME sem SKILL.md"; exit 1; }
  # Frontmatter válido?
  head -30 "\$skill/SKILL.md" | grep -q "^name:" || { echo "FAIL: \$NAME sem frontmatter"; exit 1; }
  echo "  ✓ skill: \$NAME"
done

echo "▶ Validando hooks..."
if [ -f "hooks/hooks.json" ]; then
  cat hooks/hooks.json | jq . > /dev/null || { echo "FAIL: hooks.json inválido"; exit 1; }
  # Scripts referenciados existem?
  for script in \$(jq -r '.. | .command? // empty' hooks/hooks.json); do
    RESOLVED=\$(echo "\$script" | sed "s|\\\${PLUGIN_DIR}|\$PLUGIN_DIR|")
    [ -x "\$RESOLVED" ] || { echo "FAIL: hook script não executável: \$RESOLVED"; exit 1; }
  done
fi

echo "▶ Teste de smoke: instalação local e invocação de skill..."
TMPDIR=\$(mktemp -d)
cp -r . "\$TMPDIR/plugin"
claude plugin install "\$TMPDIR/plugin" --scope user-local
claude -p "/validate-plugin-test" --max-turns 1 || true
claude plugin uninstall \$(jq -r .name plugin.json)
rm -rf "\$TMPDIR"

echo "✅ Todos os checks passaram"`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Plugins transformam harness em produto interno.</strong> O que começa como &ldquo;ah, commitei umas skills em .claude/&rdquo; vira &ldquo;distribuímos v2.4 do plugin em 15 repos da org com um comando&rdquo;. Empacote quando houver reúso real (3+ projetos, 2+ times). Versione com semver. Documente com CHANGELOG. Teste com CI. Namespace para permitir overrides. Publique num marketplace interno. Esse é o próximo nível de produtividade — cada dev novo já chega com o harness do time carregado.
      </Callout>

      <Callout>
        Último módulo da trilha: <strong>Claude Agent SDK em produção</strong> — quando sair do CLI e usar o SDK Python/TypeScript. <code>query()</code>, custom tools, subagents programáticos, hooks programáticos, MCP servers. Dois scripts reais: GitHub Action que revisa PRs e cron de PR triage em Node.
      </Callout>
    </div>
  );
}
