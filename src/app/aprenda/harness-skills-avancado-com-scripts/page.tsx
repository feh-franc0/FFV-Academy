import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-skills-avancado-com-scripts');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a vantagem de usar `context: fork` no frontmatter de uma skill?',
    options: [
      'A skill roda mais rápido porque usa um modelo menor',
      'A skill executa em um subagent isolado (fork do contexto atual). Isso preserva a janela de contexto principal — tudo que a skill faz não polui a sessão. Quando a skill termina, apenas o resultado final volta para o principal.',
      'A skill é executada em background sem bloquear',
      'context: fork desabilita permissions para a skill específica',
    ],
    correct: 1,
    explanation: 'context: fork é o mecanismo de isolamento de contexto em skills. Quando ativo, a skill não executa no contexto principal — ela ganha um subagent próprio. Benefício: tudo que a skill lê (potencialmente dezenas de arquivos), as conversas intermediárias, os tool calls, NADA disso entra no contexto principal. Só o resultado final (pode ser um resumo, uma lista, um veredito). Use quando a skill faz trabalho extenso (exploração, análise, geração de relatório) que não precisa persistir no contexto da sessão. Combinado com agent: Explore, você tem uma skill de pesquisa que não polui nada.',
  },
  {
    question: 'Dentro de uma skill com frontmatter "paths: src/api/**", o que acontece se você invoca /minha-skill enquanto está editando um arquivo em src/ui/?',
    options: [
      'A skill executa normalmente — o campo paths é apenas uma hint de documentação',
      'Claude avisa que a skill é irrelevante para o path atual e pergunta se deve executar mesmo assim',
      'paths: glob restringe quando a skill é automaticamente SUGERIDA/invocada por Claude. Se você invoca manualmente (/minha-skill), a skill executa — o paths serve para auto-invocation pattern matching. Combinado com disable-model-invocation: true, você garante invocação apenas explícita.',
      'A skill é bloqueada pelo runtime do Claude Code',
    ],
    correct: 2,
    explanation: 'paths no frontmatter das skills serve ao mecanismo de AUTO-invocation do Claude. Quando você está trabalhando em um arquivo, Claude pode sugerir skills cujo paths matcha. paths limita ESSE comportamento — a skill só é auto-sugerida para arquivos em src/api/**. Invocação manual (/minha-skill) sempre funciona, salvo se disable-model-invocation ou user-invocable disserem o contrário. Para controle preciso: paths filtra auto-suggest, disable-model-invocation proíbe Claude de invocar, user-invocable: false proíbe o usuário (só Claude). Combine os três para skills hiperespecíficas.',
  },
  {
    question: 'Qual a diferença entre `!`git status`` em uma skill e instruir Claude a rodar "git status" no texto?',
    options: [
      'Não há diferença — ambos executam o mesmo comando',
      '!`cmd` executa ANTES da skill ser processada — o output substitui o literal no markdown. Claude vê o resultado como texto, não precisa decidir rodar git status. Isso é mais eficiente (evita tool call) e determinístico (sempre executa). Instruir Claude no texto depende dele escolher usar Bash.',
      '!`cmd` só funciona em contextos administrativos; texto com instrução funciona sempre',
      '!`cmd` é deprecated — foi removido em 2026',
    ],
    correct: 1,
    explanation: 'Dynamic context injection com !`cmd` é uma feature de preprocessing: o Claude Code executa o comando ANTES de a skill ser carregada no contexto, e substitui o literal pelo output. Claude vê apenas o texto resultante. Benefícios: (1) eficiência — não consome tool call; (2) determinismo — sempre executa, Claude não pode "decidir" não rodar; (3) output como contexto — Claude usa o resultado como dado, não como output de tool. Casos clássicos: injetar git branch atual, git log recente, data, path info, status de serviços. Instruir Claude no texto a rodar o comando é menos confiável (ele pode escolher outro caminho) e consome tool call + permission prompt.',
  },
];

export default function HarnessSkillsAvancadoPage() {
  return (
    <ModuleLayout
      slug="harness-skills-avancado-com-scripts"
      title="Skills avançadas: scripts auxiliares, dynamic context e hooks scoped"
      icon="⚡"
      xp={90}
      readTime={18}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-hooks-cookbook-executivo"
      nextTitle="Hooks cookbook: 10 receitas executáveis"
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
        Skill básica = prompt repetitivo automatizado. Skill profissional = workflow completo com scripts testáveis, contexto ambiental injetado em tempo real, hooks que só rodam durante a skill, invocação condicionada por path e isolamento de contexto quando faz sentido. Este módulo cobre o frontmatter completo de 2026, dynamic context injection com <code>!`cmd`</code>, scripts auxiliares em <code>scripts/</code>, reference files lazy-loaded, hooks scoped e estrutura de pastas que escala para dezenas de skills por projeto.
      </p>

      <Section accent={accent} title="Frontmatter completo: todos os campos de 2026">
        <CodeBlock lang="yaml">{`---
# Identificação (obrigatórios ou quase)
name: release-manager                       # lowercase, max 64 chars, único no escopo
description: |                              # o que faz + quando usar (max 1536 chars incluindo when_to_use)
  Gera release completa: changelog, notas, tag git, PR do release.
  Use quando houver commits desde última tag e for hora de releasear.
when_to_use: |                              # appended à description
  Evite rodar se CI estiver quebrado ou se há PRs em flight não mergeados.

# UX
argument-hint: "[major|minor|patch]"        # exibido no TUI
icon: "🚀"                                  # emoji no picker

# Invocação
disable-model-invocation: false             # se true, só usuário invoca
user-invocable: true                        # se false, só Claude invoca (autopilot)
paths: "**"                                 # glob pra auto-suggest (opcional)

# Execução
allowed-tools: "Read Bash(git *) Edit(CHANGELOG.md) Write(docs/releases/**)"
model: claude-opus-4-7                      # override do modelo (opcional)
effort: high                                # override de effort level
context: fork                               # executa em subagent isolado
agent: general-purpose                      # tipo de subagent quando context: fork
shell: bash                                 # shell pra !\`cmd\` blocks (bash|powershell)

# Hooks scoped (só ativam durante execução desta skill)
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: ".claude/skills/release-manager/scripts/pre-check.sh"
          timeout: 30
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/skills/release-manager/scripts/verify.sh"
  Stop:
    - matcher: ".*"
      hooks:
        - type: http
          url: "\${SLACK_RELEASE_WEBHOOK}"
          allowedEnvVars: ["SLACK_RELEASE_WEBHOOK"]
---

# Release Manager

Bump de versão: $1 (major|minor|patch)

## Estado atual
- Última tag: !\`git describe --tags --abbrev=0\`
- Branch: !\`git branch --show-current\`
- Commits desde tag: !\`git rev-list --count $(git describe --tags --abbrev=0)..HEAD\`
- Arquivos alterados: !\`git diff --stat $(git describe --tags --abbrev=0)..HEAD | tail -1\`

## Procedimento

1. Pre-check: bash \${CLAUDE_SKILL_DIR}/scripts/pre-check.sh
2. Gere CHANGELOG.md novo usando \${CLAUDE_SKILL_DIR}/reference/changelog-template.md
3. Calcule nova versão baseado em $1
4. Commit: "chore(release): v<nova-versão>"
5. Tag: v<nova-versão>
6. Abra PR de release com notas geradas
7. Notificação Slack automática via Stop hook

## Erros comuns
Consulte \${CLAUDE_SKILL_DIR}/reference/common-errors.md`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Estrutura de pastas: skill profissional">
        <CodeBlock lang="text">{`.claude/skills/release-manager/
├── SKILL.md                      # entrada principal (frontmatter + instruções)
├── reference/
│   ├── changelog-template.md     # template que Claude consulta quando precisa
│   ├── common-errors.md          # erros conhecidos e como resolver
│   ├── api-reference.md          # referência técnica detalhada
│   └── examples/
│       ├── release-minor.md      # exemplo completo de release minor
│       └── release-major.md      # exemplo com breaking changes
├── scripts/
│   ├── pre-check.sh              # Claude executa via Bash
│   ├── verify.sh
│   ├── bump-version.sh
│   └── notify-slack.sh
└── tests/
    └── dry-run.sh                # testa a skill sem side effects

# Vantagens desta estrutura:
# 1. SKILL.md curto e focado (menos tokens no contexto)
# 2. Reference files lazy-loaded: Claude só lê quando precisa
# 3. Scripts testáveis isoladamente (bash scripts/pre-check.sh dry-run)
# 4. Versionamento: tudo no git, time inteiro tem o mesmo workflow
# 5. Onboarding: novo dev lê SKILL.md + examples/ pra entender

# Convenção sugerida:
# - SKILL.md: < 200 linhas
# - Reference individual: < 500 linhas
# - Scripts: testáveis isoladamente, bem documentados`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Dynamic context injection: !`cmd` e multi-line">
        <CodeBlock lang="markdown">{`# Variantes de dynamic context injection:

## 1. Inline com crase backticks
Branch atual: !\`git branch --show-current\`
Commits hoje: !\`git log --since=midnight --oneline | wc -l\`

## 2. Multi-line com fence
\`\`\`!
git log --since="1 week ago" --pretty=format:"%h %s (%an)" | head -20
\`\`\`

## 3. Encadeamento
PRs mergeados essa semana: !\`gh pr list --state merged --search "merged:>=$(date -d 'last monday' +%Y-%m-%d)" --json number | jq length\`

## 4. Com processamento
Top contribuidores: !\`git log --format='%an' --since='1 month ago' | sort | uniq -c | sort -rn | head -5\`

## 5. Condicionais (via script)
Status do deploy: !\`[ -f .deploy-status ] && cat .deploy-status || echo "sem info"\`

# IMPORTANTE:
# - !\`cmd\` executa ANTES de a skill ser processada
# - Output substitui o literal no markdown
# - Claude vê apenas o texto resultante (não o comando)
# - Erros: stderr vai pro Claude como parte do contexto
# - Timeout: usa timeout padrão do shell do sistema

# Quando NÃO usar:
# - Comandos lentos (> 2s) poluem o startup da skill
# - Dados sensíveis (tokens): use \${CLAUDE_SKILL_DIR}/reference/ em vez
# - Comandos com efeito colateral: reserve pros Bash tool calls depois`}</CodeBlock>
      </Section>

      <Section accent={accent} title="context: fork — isolamento de contexto em skill">
        <CodeBlock lang="yaml">{`---
name: deep-research
description: Pesquisa profunda em codebase sem poluir contexto
context: fork                              # ← crítico
agent: Explore
allowed-tools: "Read Glob Grep"
argument-hint: "[tópico de pesquisa]"
---

# Deep Research: $ARGUMENTS

Você é um subagent Explore dedicado à pesquisa.

Sua tarefa: mapear todo o uso de "$ARGUMENTS" no codebase.

Processo:
1. Use Glob pra listar arquivos relevantes
2. Use Grep pra encontrar ocorrências
3. Para cada ocorrência crítica, use Read pra ler contexto
4. Monte um relatório estruturado

Formato de output (SÓ retorne isso pro principal):
\`\`\`
## Ocorrências de "$ARGUMENTS"

### Arquivo: <path>
- **Linha N**: <contexto em 1 frase>
- **Linha M**: <contexto em 1 frase>

### Arquivo: <path>
- ...

## Padrões identificados
- <padrão 1>
- <padrão 2>

## Recomendação
<1 parágrafo>
\`\`\`

NÃO retorne conteúdo bruto dos arquivos — só resumos e referencias.
`}</CodeBlock>
        <Callout tone="info">
          <strong>O que acontece com <code>context: fork</code>:</strong> o Claude Code spawn um subagent do tipo <code>agent:</code> (Explore, Plan, general-purpose). A skill executa lá, isolada. A sessão principal recebe apenas o output final (o relatório estruturado). Os arquivos lidos durante a pesquisa NÃO entram no contexto principal. Ideal para: pesquisa, análise que lê muitos arquivos, validações exaustivas, geração de relatórios.
        </Callout>
      </Section>

      <Section accent={accent} title="Skills-scoped hooks: lifecycle durante execução">
        <CodeBlock lang="yaml">{`# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Deploy com validação pré + verificação pós + notificação
allowed-tools: "Bash Read"
argument-hint: "[staging|production]"
hooks:
  # Hooks aqui ativam APENAS durante execução desta skill.
  # Acabando a skill, eles somem — não afetam outras sessões.

  UserPromptSubmit:
    - hooks:
        - type: command
          command: "bash \${CLAUDE_SKILL_DIR}/scripts/inject-context.sh"
          # Injeta contexto de deploy (último deploy, versão atual, etc.)

  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash \${CLAUDE_SKILL_DIR}/scripts/pre-deploy-check.sh"
          timeout: 60
          # Valida: branch main, sem mudanças, testes passando, approval obtido

  PostToolUse:
    - matcher: "Bash(./deploy.sh:*)"
      hooks:
        - type: command
          command: "bash \${CLAUDE_SKILL_DIR}/scripts/post-deploy-verify.sh"
          # Health checks, smoke tests, métricas de latência

  Stop:
    - matcher: ".*"
      hooks:
        - type: http
          url: "\${SLACK_RELEASES_WEBHOOK}"
          allowedEnvVars: ["SLACK_RELEASES_WEBHOOK"]
          # Notifica o time ao terminar o deploy

  # Agents/Tasks hooks (2026):
  SubagentStart:
    - hooks:
        - type: command
          command: "echo 'Subagent spawned for deploy' >> \${CLAUDE_SKILL_DIR}/../audit.log"
---

# Deploy

Execute deploy no ambiente: $1

Procedimento:
1. Pre-check é automático (hook PreToolUse). Você só executa ./deploy.sh $1.
2. Post-check é automático (hook PostToolUse após deploy.sh).
3. Notificação é automática (hook Stop).

Sua responsabilidade:
- Confirmar o ambiente com o usuário se for production
- Executar o comando correto baseado em $1
- Reportar resultado final ao usuário`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Variáveis disponíveis em skills">
        <ComparisonTable
          headers={['Variável', 'Valor', 'Uso típico']}
          rows={[
            ['$ARGUMENTS', 'Todos os args passados à skill', 'Instruções que usam o input cru'],
            ['$1, $2, ... $N', 'N-ésimo argumento (0-indexed)', 'Parsing posicional'],
            ['${CLAUDE_SESSION_ID}', 'UUID da sessão', 'Log, audit, correlação'],
            ['${CLAUDE_SKILL_DIR}', 'Path absoluto da pasta da skill', 'Refs a scripts/ e reference/'],
            ['${CLAUDE_PROJECT_ROOT}', 'Root do projeto (cwd da sessão)', 'Scripts relativos ao projeto'],
            ['${CLAUDE_MODEL}', 'Modelo ativo', 'Condicionais baseados no modelo'],
            ['!`cmd`', 'Output de cmd shell (preprocessing)', 'Contexto dinâmico'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Skills profissionais têm 5 características:</strong> (1) <strong>frontmatter rico</strong> com allowed-tools e contexto controlado; (2) <strong>pastas organizadas</strong> com scripts/ testáveis e reference/ lazy-loaded; (3) <strong>dynamic context injection</strong> com <code>!`cmd`</code> para puxar dados ao vivo; (4) <strong><code>context: fork</code></strong> quando o trabalho polui contexto principal; (5) <strong>hooks scoped</strong> para automação que só faz sentido dentro da skill. Essa é a diferença entre &ldquo;slash command glorificado&rdquo; e &ldquo;workflow profissional versionável&rdquo;.
      </Callout>

      <Callout>
        Próximo: <strong>Hooks cookbook executivo</strong> — o quinto eixo. 10 receitas de hooks reais com código testado: bloquear rm -rf, prettier automático, git context injection, Slack webhook no stop, snapshot pré-compact, audit log em JSON, e mais. Cada uma copy-paste-ready.
      </Callout>
    </div>
  );
}
