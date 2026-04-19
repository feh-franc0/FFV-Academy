import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-hooks-cookbook-executivo');

const quiz: QuizQuestion[] = [
  {
    question: 'Um hook PreToolUse retorna JSON {"decision":"ask","reason":"..."}. O que acontece?',
    options: [
      'A ação é bloqueada imediatamente',
      'A ação é permitida automaticamente (ask é equivalente a allow)',
      'Claude Code pede confirmação explícita do usuário antes de executar, exibindo o reason ao usuário. Se usuário aprova, executa; se nega, bloqueia. É útil pra actions borderline onde você quer que o usuário decida caso a caso.',
      'Um hook nunca pode retornar ask — apenas block ou allow',
    ],
    correct: 2,
    explanation: '{"decision":"ask"} instrui o runtime a inserir uma confirmação explícita do usuário. O reason é exibido como contexto pra ajudar a decisão. Útil em cenários onde você não quer bloquear totalmente (ex: edit em package.json é válido às vezes) mas não quer auto-permitir. Isso dá granularidade — você tem 3 decisões: block (impede), allow (permite sem perguntar), ask (pede). Combine com hookSpecificOutput.PreToolUse.permissionDecision pra sobrepor o permission system padrão.',
  },
  {
    question: 'Por que é importante usar jq em hooks shell em vez de grep/sed para extrair campos do JSON de entrada?',
    options: [
      'É apenas preferência estética — grep funciona igualmente bem',
      'O JSON de entrada pode ter campos com caracteres especiais (aspas dentro de strings, newlines em arquivos, escapes) que quebram grep/sed. jq parseia JSON corretamente. Em produção, hook quebrado = agent quebrado — use jq e teste o hook com payloads reais antes de confiar.',
      'jq é obrigatório em hooks — shell simples não funciona',
      'grep é mais rápido que jq, então deve ser usado sempre que possível',
    ],
    correct: 1,
    explanation: 'jq é a ferramenta certa para parsear JSON em shell. grep/sed funcionam para casos simples mas falham silenciosamente com: aspas dentro de strings ("comando com aspas"), newlines embutidos, caracteres especiais em paths, campos ausentes. Em hooks, um erro de parsing pode ser catastrófico — se o hook não consegue detectar corretamente o tool_name, ele pode bloquear (ou liberar) errado. Use jq -r (.field // "default") para acesso seguro. Teste hooks passando payloads reais capturados com --debug hooks. Um hook que falha silenciosamente é pior que não ter hook.',
  },
  {
    question: 'Qual a vantagem de usar hook do tipo "prompt" em vez de "command"?',
    options: [
      'Tipo prompt é mais barato (não usa tokens)',
      'Tipo prompt delega a decisão para Claude via LLM. Você passa uma instrução, o modelo evalua o contexto e decide. Útil quando a regra é difícil de codificar em shell (ex: "bloquear apenas comandos que parecem maliciosos") e pode usar o contexto semântico. Trade-off: mais caro e mais lento, mas mais flexível.',
      'Tipo prompt só funciona com modelos pequenos (Haiku)',
      'Tipo prompt é deprecated — use apenas command',
    ],
    correct: 1,
    explanation: 'Tipo "prompt" em hooks é uma novidade poderosa de 2026. Em vez de shell script com regras explícitas, você passa uma instrução natural: "Classifique a severidade deste comando bash em low/medium/high e bloqueie se for high". Claude avalia usando contexto semântico. Use quando: (a) a regra seria complexa demais em shell (ex: detectar intenção maliciosa); (b) o contexto semântico importa (ex: decidir se uma edit está alinhada com mudanças recentes); (c) você quer explicações para o usuário. Trade-off real: mais lento (1-3s) e mais caro que shell. Para regras determinísticas simples (bloqueia curl, roda prettier), fique com command.',
  },
];

export default function HarnessHooksCookbookPage() {
  return (
    <ModuleLayout
      slug="harness-hooks-cookbook-executivo"
      title="Hooks cookbook: 10 receitas executáveis prontas para copiar"
      icon="🪝"
      xp={95}
      readTime={19}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-plugins-para-times"
      nextTitle="Plugins: empacotar skills + agents + MCP + hooks"
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
        Hooks separam o amador do profissional em harness engineering. Este módulo é cookbook: <strong>10 receitas testadas</strong> pra copiar, adaptar e rodar. Cada receita tem código completo, caso de uso, e a configuração em <code>settings.json</code>. São os padrões que aparecem em projetos sérios — validação de segurança, automação de qualidade, notificação, audit log, snapshot pré-compact, classificação via LLM. Tudo com JSON decisions, tratamento de erro, e atenção a encoding.
      </p>

      <Section accent={accent} title="Receita 1: Bloquear rm -rf em paths perigosos">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PreToolUse/block-dangerous-rm.sh
# Bloqueia rm -rf em paths absolutos; pede confirmação em paths relativos.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')

# Só atua em Bash
if [[ "$TOOL" != "Bash" ]]; then
  echo '{"decision":"allow"}'
  exit 0
fi

# Padrão crítico: rm -rf em paths absolutos
if [[ "$CMD" =~ rm[[:space:]]+-rf[[:space:]]+/ ]] || \\
   [[ "$CMD" =~ rm[[:space:]]+-rf[[:space:]]+~ ]] || \\
   [[ "$CMD" =~ rm[[:space:]]+-rf[[:space:]]+\\\$HOME ]]; then
  jq -n '{
    decision: "block",
    reason: "rm -rf em path absoluto é proibido pelo harness",
    systemMessage: "🚨 Bloqueado: rm -rf em path absoluto",
    hookSpecificOutput: { PreToolUse: { permissionDecision: "deny" } }
  }'
  exit 0
fi

# Padrão moderado: rm -rf em path relativo
if [[ "$CMD" =~ rm[[:space:]]+-rf ]]; then
  jq -n '{
    decision: "ask",
    reason: "rm -rf detectado — confirme antes de executar",
    hookSpecificOutput: { PreToolUse: { permissionDecision: "ask" } }
  }'
  exit 0
fi

echo '{"decision":"allow"}'`}</CodeBlock>
        <CodeBlock lang="json">{`// settings.json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/PreToolUse/block-dangerous-rm.sh",
        "timeout": 5
      }]
    }]
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 2: Prettier automático pós Edit/Write">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PostToolUse/auto-format.sh
# Formata automaticamente arquivos suportados após edit/write

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

[[ "$TOOL" != "Edit" && "$TOOL" != "Write" ]] && exit 0
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.mdx|*.css)
    npx --no-install prettier --write "$FILE" --log-level warn 2>&1
    ;;
  *.py)
    ruff format "$FILE" 2>&1
    ;;
  *.go)
    gofmt -w "$FILE" 2>&1
    ;;
  *.rs)
    rustfmt "$FILE" 2>&1
    ;;
esac

exit 0  # PostToolUse: exit code ignorado, hook é só notificação`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 3: Injetar git context em todo prompt">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/UserPromptSubmit/inject-git-context.sh
# Adiciona estado do git ao contexto de cada prompt do usuário

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.user_message // ""')

BRANCH=$(git branch --show-current 2>/dev/null || echo "—")
CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "—")

CONTEXT="[git: branch=$BRANCH, changes=$CHANGES files, last=$LAST_COMMIT]"

# Output JSON que o Claude Code consolida no contexto:
jq -n --arg context "$CONTEXT" '{
  decision: "allow",
  systemMessage: $context
}'`}</CodeBlock>
        <Callout tone="info">
          Use esse hook quando Claude frequentemente pergunta &ldquo;em qual branch estamos?&rdquo; ou não sabe se tem mudanças pendentes. Expor esses dados automaticamente economiza turns.
        </Callout>
      </Section>

      <Section accent={accent} title="Receita 4: Notificação Slack no Stop">
        <CodeBlock lang="json">{`// settings.json — HTTP hook tipo direto
{
  "hooks": {
    "Stop": [{
      "matcher": ".*",
      "hooks": [{
        "type": "http",
        "url": "https://hooks.slack.com/services/T00/B00/XXX",
        "headers": { "Content-Type": "application/json" },
        "allowedEnvVars": ["USER"],
        "timeout": 10
      }]
    }]
  }
}`}</CodeBlock>
        <CodeBlock lang="bash">{`#!/bin/bash
# Alternativa via command hook com formatação rica
# .claude/hooks/Stop/slack-notify.sh

INPUT=$(cat)
SESSION=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
STOP_REASON=$(echo "$INPUT" | jq -r '.stop_reason // "end_turn"')
PROJECT=$(basename "$PWD")
USER_NAME="\${USER:-$(whoami)}"

# Rich message com blocks
curl -sS -X POST "$SLACK_WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d @- <<JSON
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "✅ Claude Code finalizou tarefa" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Projeto:*\\n$PROJECT" },
        { "type": "mrkdwn", "text": "*Dev:*\\n$USER_NAME" },
        { "type": "mrkdwn", "text": "*Sessão:*\\n\\\`$SESSION\\\`" },
        { "type": "mrkdwn", "text": "*Motivo:*\\n$STOP_REASON" }
      ]
    }
  ]
}
JSON

exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 5: Snapshot antes de compaction">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PreCompact/snapshot.sh
# Salva snapshot da sessão antes do compactor rodar (evita perder trabalho)

INPUT=$(cat)
SESSION=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // ""')

SNAPSHOT_DIR=".claude/snapshots/\${SESSION}"
mkdir -p "$SNAPSHOT_DIR"

# Copia transcript atual
if [[ -n "$TRANSCRIPT" && -f "$TRANSCRIPT" ]]; then
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  cp "$TRANSCRIPT" "$SNAPSHOT_DIR/pre-compact-\${TIMESTAMP}.jsonl"
fi

# Log
echo "[$(date -u +%FT%TZ)] Pre-compact snapshot salvo: $SNAPSHOT_DIR" >> .claude/audit.log

exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 6: Audit log estruturado em JSON">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PostToolUse/audit-log.sh
# Gera audit log estruturado de todas as ações de ferramenta

INPUT=$(cat)
TS=$(date -u +%FT%T.%3NZ)
USER_NAME="\${USER:-$(whoami)}"

# Adiciona metadata e append ao log
echo "$INPUT" | jq --arg ts "$TS" --arg user "$USER_NAME" --arg cwd "$PWD" '{
  timestamp: $ts,
  user: $user,
  cwd: $cwd,
  session_id: .session_id,
  tool_name: .tool_name,
  tool_input: .tool_input,
  tool_result_summary: (.tool_result | tostring | .[0:200])
}' >> .claude/audit.jsonl

exit 0`}</CodeBlock>
        <p>Depois, para auditoria:</p>
        <CodeBlock lang="shell">{`# Quantas edições por arquivo hoje:
jq -c 'select(.tool_name == "Edit") | .tool_input.file_path' .claude/audit.jsonl | \\
  sort | uniq -c | sort -rn | head

# Comandos Bash mais executados:
jq -r 'select(.tool_name == "Bash") | .tool_input.command' .claude/audit.jsonl | \\
  cut -d' ' -f1 | sort | uniq -c | sort -rn | head

# Timeline das últimas 20 ações:
tail -20 .claude/audit.jsonl | jq -c '{ts: .timestamp, tool: .tool_name, target: (.tool_input.file_path // .tool_input.command // "?")}'`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 7: Lint condicional por extensão">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PostToolUse/smart-lint.sh
# Roda o lint apropriado pra cada tipo de arquivo

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

[[ "$TOOL" != "Edit" && "$TOOL" != "Write" ]] && exit 0
[[ -z "$FILE" || ! -f "$FILE" ]] && exit 0

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

case "$FILE" in
  *.ts|*.tsx)
    npx --no-install eslint "$FILE" --fix --quiet 2>&1
    npx --no-install tsc --noEmit --incremental 2>&1 | grep "$FILE" >&2 || true
    ;;
  *.py)
    ruff check "$FILE" --fix --quiet 2>&1
    mypy "$FILE" 2>&1 | head -5 >&2 || true
    ;;
  *.go)
    golangci-lint run --fix "$FILE" 2>&1 >&2 || true
    ;;
esac

# Exit 0: PostToolUse não bloqueia — output via stderr vira feedback pro Claude
exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 8: Auto-rollback se teste falha">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/PostToolUse/test-and-rollback.sh
# Roda testes após Edit; se falharem, reverte a edição via git

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

[[ "$TOOL" != "Edit" ]] && exit 0
[[ -z "$FILE" ]] && exit 0

# Só em arquivos de código (não docs/config)
case "$FILE" in
  *.ts|*.tsx|*.py|*.go) ;;
  *) exit 0 ;;
esac

# Roda teste específico do arquivo (se houver):
TEST_FILE=""
case "$FILE" in
  *.ts) TEST_FILE="\${FILE%.ts}.test.ts" ;;
  *.tsx) TEST_FILE="\${FILE%.tsx}.test.tsx" ;;
  *.py) TEST_FILE="\${FILE%.py}_test.py" ;;
esac

if [[ -z "$TEST_FILE" || ! -f "$TEST_FILE" ]]; then
  exit 0
fi

# Executa
case "$TEST_FILE" in
  *.ts|*.tsx) RESULT=$(npx --no-install vitest run "$TEST_FILE" 2>&1) ;;
  *.py) RESULT=$(pytest "$TEST_FILE" -xvs 2>&1) ;;
esac

if [[ $? -ne 0 ]]; then
  # Testes falharam — reverte edição
  git checkout "$FILE" 2>&1
  echo "🔴 Teste falhou após editar $FILE. Edição foi revertida." >&2
  echo "Erro:" >&2
  echo "$RESULT" | tail -20 >&2
fi

exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 9: Copy .env para worktrees automaticamente">
        <CodeBlock lang="bash">{`#!/bin/bash
# .claude/hooks/WorktreeCreate/copy-env.sh
# Copia arquivos gitignored essenciais pro novo worktree

INPUT=$(cat)
WORKTREE_PATH=$(echo "$INPUT" | jq -r '.worktree_path // ""')

[[ -z "$WORKTREE_PATH" || ! -d "$WORKTREE_PATH" ]] && exit 0

# Arquivos comuns que precisam viajar junto:
for FILE in .env .env.local .env.development config/local.json; do
  if [[ -f "$FILE" ]]; then
    mkdir -p "$(dirname "$WORKTREE_PATH/$FILE")"
    cp "$FILE" "$WORKTREE_PATH/$FILE"
  fi
done

echo "✓ Arquivos de ambiente copiados para $WORKTREE_PATH" >&2
exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Receita 10: Classificação de severidade via Claude (hook type: prompt)">
        <CodeBlock lang="json">{`// settings.json — hook que delega decisão a Claude via LLM
{
  "hooks": {
    "Notification": [{
      "matcher": ".*",
      "hooks": [{
        "type": "prompt",
        "prompt": "Classifique esta notificação em severity (low|medium|high|critical) e sugira ação curta. Retorne JSON: {\\"severity\\":\\"...\\",\\"action\\":\\"...\\"}. Notificação:",
        "model": "claude-haiku-4-5",
        "timeout": 30
      }]
    }]
  }
}`}</CodeBlock>
        <p>O Claude Code envia o payload do hook pro modelo, que retorna classificação. Depois você pode usar o output em outros hooks (encadeados via stdout/pipe) — ex: notificações critical disparam call automatizado; low vão só pro log.</p>
      </Section>

      <Section accent={accent} title="Debugging de hooks">
        <CodeBlock lang="shell">{`# Testar um hook com payload real:
echo '{"tool_name":"Edit","tool_input":{"file_path":"/path/to/file.ts"},"session_id":"test"}' \\
  | bash .claude/hooks/PostToolUse/auto-format.sh

# Ver payloads reais capturados durante sessão:
claude --debug hooks -p "edite package.json"
# Loga input/output de cada hook

# Verificar configuração de hooks ativa:
/hooks

# Testar timeout:
# Aumente timeout em settings se hook lento (ex: rodar testes leva 60s)
# Defaults: 60s por hook. Max sensato: 300s.

# Erros comuns e soluções:
#
# 1. "Hook timeout" → aumente timeout em settings
# 2. "Hook exit 1 but no stderr" → adicione echo ">&2" pra capturar erros
# 3. "jq: parse error" → use jq -r (.field // "default") com fallback
# 4. Hook não dispara → cheque matcher (regex), tool_name exato
# 5. Loop infinito → hook edita arquivo que dispara o mesmo hook.
#    Solução: condicionar com env var (HOOK_RUNNING=1 skip).`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Hooks são o coração do harness determinístico.</strong> Onde Claude pode &ldquo;esquecer&rdquo; uma instrução do CLAUDE.md, o hook runtime <em>sempre</em> executa. Use-os para: (1) <strong>bloquear</strong> ações perigosas; (2) <strong>automatizar</strong> qualidade (lint, format, testes); (3) <strong>notificar</strong> eventos (Slack, webhook); (4) <strong>auditar</strong> ações (audit.jsonl estruturado); (5) <strong>preservar</strong> trabalho (snapshots pre-compact). Com os 10 receitas deste cookbook, você tem a base pro seu próprio arsenal.
      </Callout>

      <Callout>
        Próximo: <strong>Plugins para times</strong> — como empacotar skills, agents, MCP servers e hooks em um plugin instalável com <code>claude plugin install</code>. O mecanismo de distribuição que transforma o seu harness em um produto interno distribuível para a equipe toda.
      </Callout>
    </div>
  );
}
