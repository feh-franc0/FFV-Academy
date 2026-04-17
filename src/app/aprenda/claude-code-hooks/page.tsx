import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'Claude Code hooks: automatizar revisões, validações e ações customizadas — FFV Academy',
  description: 'Hooks são scripts que rodam automaticamente em eventos do Claude Code. Como criar hooks para lint, testes, validação e notificações após edições de arquivos.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre um hook PostToolUse e um hook Stop no Claude Code?',
    options: [
      'PostToolUse roda depois de qualquer ação de ferramenta (Edit, Bash, Write, etc.). Stop roda quando Claude Code encerra a sessão completamente.',
      'Não há diferença — ambos são disparados ao final de cada resposta de Claude',
      'PostToolUse é para ferramentas de leitura; Stop é para ferramentas de escrita — a separação é por tipo de ferramenta',
      'PostToolUse requer confirmação do usuário; Stop roda silenciosamente em background',
    ],
    correct: 0,
    explanation: 'Os eventos de hook têm granularidades diferentes. PostToolUse dispara após cada uso individual de ferramenta — você pode filtrar por tipo de ferramenta (ex: somente quando Edit foi usado). Stop dispara uma vez quando Claude termina toda a resposta e não vai fazer mais nada. PreToolUse dispara antes de executar uma ferramenta (pode até bloquear a execução devolvendo código de saída não-zero). Cada evento tem um propósito: PostToolUse é para reagir a ações específicas, Stop é para pós-processamento ao final da tarefa.',
  },
  {
    question: 'Um hook PreToolUse retorna exit code 1. O que acontece com a ação que Claude ia executar?',
    options: [
      'A ação é executada normalmente — o exit code do hook não afeta a ferramenta',
      'Claude pede confirmação adicional do usuário antes de executar',
      'A ação é bloqueada — Claude Code cancela a execução da ferramenta e recebe o stderr do hook como feedback para tentar outra abordagem',
      'Claude Code encerra a sessão inteira com erro',
    ],
    correct: 2,
    explanation: 'Hooks PreToolUse têm poder de veto: se o script retornar exit code não-zero, Claude Code cancela a ferramenta antes de executar. O stderr do hook é passado para Claude como contexto — Claude pode usar isso para ajustar a abordagem. Isso é poderoso para validação: um PreToolUse pode verificar se o arquivo que Claude vai editar está na lista de arquivos permitidos, e bloquear edições não autorizadas sem precisar de intervenção humana.',
  },
  {
    question: 'Você quer que um hook rode automaticamente quando Claude editar qualquer arquivo .py no projeto. Qual configuração usar?',
    options: [
      'Um hook PostToolUse com matcher "Edit" — hooks de Edit sempre recebem o path do arquivo editado no ambiente',
      'Não é possível filtrar hooks por extensão de arquivo — hooks PostToolUse rodam para todas as ferramentas sem filtragem',
      'Um hook de tipo "file_watcher" que monitora o filesystem em background',
      'Hooks são configurados em CLAUDE.md com expressões regulares para o caminho',
    ],
    correct: 0,
    explanation: 'Hooks PostToolUse com matcher "Edit" recebem via stdin um JSON com tool_name e tool_input, que inclui o file_path sendo editado. Seu script pode então verificar a extensão: `if [[ "$file" == *.py ]]; then ...`. O matcher inicial filtra o tipo de ferramenta (Edit), e o script decide o que fazer com base nos parâmetros recebidos. Isso dá controle preciso: rode pylint apenas em .py, eslint apenas em .ts/.tsx, etc.',
  },
];

export default function ClaudeCodeHooksPage() {
  return (
    <ModuleLayout
      slug="claude-code-hooks"
      title="Hooks: automatizar revisões, validações e ações customizadas"
      icon="🪝"
      xp={70}
      readTime={14}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="claude-code-skills-commands"
      nextTitle="Skills e slash commands: criar seus próprios workflows"
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
        Hooks são scripts shell que o Claude Code executa automaticamente em resposta a eventos — antes ou depois de usar ferramentas, ao completar uma resposta, ao iniciar uma sessão. Eles são o mecanismo de automação determinística: enquanto instruções no CLAUDE.md dependem de Claude seguir, hooks são executados pelo runtime do Claude Code independentemente.
      </p>

      <Section accent={accent} title="Eventos disponíveis: quando cada hook dispara">
        <ComparisonTable
          headers={['Evento', 'Quando dispara', 'Pode bloquear?', 'Caso de uso típico']}
          rows={[
            ['PreToolUse', 'Antes de Claude usar uma ferramenta', 'Sim (exit ≠ 0 bloqueia)', 'Validar antes de editar, verificar permissões'],
            ['PostToolUse', 'Depois de Claude usar uma ferramenta', 'Não', 'Rodar lint, formatar código, notificar'],
            ['Stop', 'Quando Claude completa a resposta', 'Não', 'Resumir sessão, notificar por Slack, fazer backup'],
            ['Notification', 'Quando Claude precisa de atenção do usuário', 'Não', 'Desktop notification, som, mensagem'],
            ['SubagentStop', 'Quando um subagente termina', 'Não', 'Coletar resultado de tarefas paralelas'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Estrutura: hooks ficam em .claude/hooks/ (por projeto) ou ~/.claude/hooks/ (global)

# Nomeação: <evento>/<nome-do-hook>.sh
# Exemplos:
.claude/hooks/
├── PostToolUse/
│   ├── auto-lint.sh          # roda lint depois de qualquer Edit
│   ├── auto-format.sh        # formata o arquivo editado
│   └── notify-edit.sh        # loga edições em audit log
├── PreToolUse/
│   ├── protect-prod.sh       # bloqueia edição em arquivos de config de produção
│   └── require-tests.sh      # bloqueia Bash(npm deploy) sem testes passando
├── Stop/
│   └── slack-notify.sh       # posta no Slack quando Claude termina uma tarefa
└── Notification/
    └── desktop-alert.sh      # notificação macOS quando Claude precisa de input

# Cada hook recebe via stdin um JSON com contexto:
# Para PostToolUse/PreToolUse:
# {
#   "tool_name": "Edit",
#   "tool_input": {
#     "file_path": "/path/to/arquivo.ts",
#     "old_string": "...",
#     "new_string": "..."
#   }
# }`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Hook PostToolUse: lint automático após edições">
        <CodeBlock>{`#!/bin/bash
# .claude/hooks/PostToolUse/auto-lint.sh
# Roda lint automaticamente quando Claude edita arquivos de código

# Ler o JSON do stdin
INPUT=$(cat)

# Extrair nome da ferramenta e path do arquivo
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('tool_name', ''))")
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('tool_input', {}).get('file_path', ''))")

# Só agir em edições de arquivo (Edit ou Write)
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Sem arquivo? Sai silenciosamente
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Rodar o linter adequado por extensão
case "$FILE_PATH" in
  *.ts|*.tsx)
    cd "$(dirname "$FILE_PATH")/.."
    npx eslint "$FILE_PATH" --fix --quiet 2>&1
    ;;
  *.py)
    ruff check "$FILE_PATH" --fix --quiet 2>&1
    ;;
  *.go)
    gofmt -w "$FILE_PATH" 2>&1
    ;;
esac

# Hooks PostToolUse: exit code não afeta Claude — é apenas notificação
exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Hook PreToolUse: bloquear ações não autorizadas">
        <CodeBlock>{`#!/bin/bash
# .claude/hooks/PreToolUse/protect-prod-config.sh
# Bloqueia edições em arquivos de configuração de produção

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('tool_name', ''))")
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('tool_input', {}).get('file_path', ''), 2>'/dev/null')" 2>/dev/null)

# Só verificar edições de arquivo
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Verificar se o arquivo é de configuração de produção
PROTECTED_PATTERNS=(
  "config/production.json"
  ".env.production"
  "terraform/prod/"
  "k8s/production/"
)

for pattern in "\${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "BLOQUEADO: $FILE_PATH é um arquivo de configuração de produção." >&2
    echo "Para editar arquivos de produção, faça manualmente com revisão do time." >&2
    exit 1  # Exit não-zero BLOQUEIA a ação de ferramenta
  fi
done

exit 0  # Permitido

# O que Claude vê quando um PreToolUse bloqueia:
# "Hook de segurança bloqueou a edição. Mensagem: BLOQUEADO: config/production.json
#  é um arquivo de configuração de produção. Para editar arquivos de produção..."
# Claude então tenta outra abordagem ou pede confirmação explícita do usuário`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Hook Stop: notificação e resumo ao final da tarefa">
        <CodeBlock>{`#!/bin/bash
# .claude/hooks/Stop/notify-completion.sh
# Notifica quando Claude completa uma tarefa (útil para tarefas longas em background)

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('session_id', 'unknown'))")
STOP_REASON=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('stop_reason', 'end_turn'))")

# Notificação macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "display notification \"Claude Code finalizou a tarefa\" \
    with title \"Claude Code\" \
    subtitle \"Sessão: $SESSION_ID\" \
    sound name \"Glass\""
fi

# Notificação Linux (notify-send)
if command -v notify-send &>/dev/null; then
  notify-send "Claude Code" "Tarefa finalizada (sessão $SESSION_ID)"
fi

# Opcional: postar no Slack (se SLACK_WEBHOOK configurado)
if [[ -n "$SLACK_WEBHOOK_URL" && "$STOP_REASON" == "end_turn" ]]; then
  PROJECT=$(basename "$PWD")
  curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"✅ Claude Code finalizou tarefa em *$PROJECT*\"}"
fi

exit 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Configuração e debugging de hooks">
        <CodeBlock>{`# Habilitar hooks em .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",          # filtro de evento (regex)
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/PostToolUse/auto-lint.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/PreToolUse/protect-prod-config.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",                  # roda sempre que Claude para
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/Stop/notify-completion.sh"
          }
        ]
      }
    ]
  }
}

# Debugging: testar um hook manualmente
echo '{"tool_name": "Edit", "tool_input": {"file_path": "/path/arquivo.ts"}}' \
  | bash .claude/hooks/PostToolUse/auto-lint.sh

# Ver logs de hooks durante sessão:
# Claude Code exibe output do hook no terminal se ele escreve em stderr
# Saída em stdout é silenciosa (não mostrada ao usuário)
# Use stderr para mensagens de debug/status

# Timeout padrão: 60 segundos por hook
# Para hooks lentos (testes), configure timeout maior no settings:
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "...", "timeout": 120 }]
    }]
  }
}`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Hooks vs CLAUDE.md vs instruções inline:</strong> use CLAUDE.md para contexto e preferências comportamentais (Claude pode ou não seguir). Use instruções inline na sessão para ajustes pontuais. Use hooks para automação que precisa ser garantida — lint que roda sempre, validações de segurança, notificações ao final. Hooks são determinísticos: não dependem de Claude "lembrar" de fazer algo.
      </Callout>

      <Callout>
        Próximo: <strong>Skills e slash commands</strong> — como criar workflows customizados que você invoca com /nome-do-comando para automatizar tarefas repetitivas.
      </Callout>
    </div>
  );
}
