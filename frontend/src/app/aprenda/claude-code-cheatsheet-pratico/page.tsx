import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, Kbd } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-cheatsheet-pratico');

const quiz: QuizQuestion[] = [
  {
    question: 'Você está numa sessão longa e quer voltar pra um estado anterior sem perder tudo — por exemplo, desfazer as últimas 3 edições que deram ruim. Qual a sequência certa?',
    options: [
      'Ctrl+C três vezes para cancelar as últimas mensagens — Claude Code reverte automaticamente',
      '/clear para limpar a sessão e começar de novo do zero',
      'Esc+Esc (ou /rewind) abre um picker pra escolher o ponto de retorno. Combine com /branch para criar uma nova linha a partir desse ponto, preservando a original acessível via /resume.',
      '/compact "descarte as últimas edições" — o compactador remove as mudanças indesejadas',
    ],
    correct: 2,
    explanation: 'Esc+Esc (ou /rewind) é o desfazer temporal do Claude Code: abre um picker mostrando pontos anteriores da sessão (cada ferramenta aplicada, cada prompt) — você escolhe pra onde voltar. /branch cria uma sessão filha a partir desse ponto, deixando a original intacta e acessível via /resume no picker de sessões. Isso é diferente de /clear (limpa tudo) e de /compact (apenas resume a conversa, não reverte estado). É a forma correta de experimentar sem perder trabalho.',
  },
  {
    question: 'Você repete aprovações para Bash(git status), Bash(npm test), Read em cada sessão. Como parar de perder tempo com prompts sem usar --dangerously-skip-permissions?',
    options: [
      'Não tem jeito — aprovações são parte do modelo de segurança do Claude Code',
      'Rode /fewer-permission-prompts: Claude analisa seu transcript histórico, identifica comandos que você aprova consistentemente e gera um allowlist pronto em .claude/settings.json (permissions.allow). Você revisa e commita.',
      'Use sempre --permission-mode bypassPermissions no início da sessão — equivalente seguro',
      'Configure ANTHROPIC_AUTO_APPROVE=true no ambiente — Claude Code lê essa variável e pula os prompts',
    ],
    correct: 1,
    explanation: '/fewer-permission-prompts é a forma idiomática de reduzir fricção em 2026. Ele analisa transcripts de sessões anteriores, identifica padrões de aprovação consistente e gera o bloco permissions.allow com regras específicas (Bash(git status), Bash(npm test:*), Read(**)). Você revisa a lista, commita o settings.json, e o time todo ganha a mesma fluidez sem sacrificar o modelo de segurança. Muito melhor que --dangerously-skip-permissions (que desabilita TUDO) ou bypassPermissions (que é sandbox-only).',
  },
  {
    question: 'Qual o propósito do atalho Ctrl+O no Claude Code?',
    options: [
      'Abre o arquivo selecionado no editor externo',
      'Abre o transcript viewer: visualização detalhada de toda a sessão com tool calls, inputs e outputs de cada ferramenta, navegável com setas. Útil para debug de "o que Claude viu" e para auditoria.',
      'Cria um novo worktree e abre em nova sessão',
      'Força output em JSON da próxima resposta',
    ],
    correct: 1,
    explanation: 'Ctrl+O é o transcript viewer — mostra o histórico completo da sessão em formato expandido: cada chamada de ferramenta, o input exato, o output retornado, tool_use_id, tempos. Permite entender "o que Claude realmente viu" quando decidiu X. Dentro do viewer: Ctrl+E toggle show all, [ escreve no scrollback (pra buscar com Cmd+F no terminal), v abre no $EDITOR, q/Esc saem. Ferramenta essencial para debug de comportamento inesperado.',
  },
];

export default function ClaudeCodeCheatsheetPraticoPage() {
  return (
    <ModuleLayout
      slug="claude-code-cheatsheet-pratico"
      title="Cheatsheet prático: 50+ comandos, 30 atalhos, 20 flags — a referência executiva"
      icon="📋"
      xp={90}
      readTime={18}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-paralelismo-na-pratica"
      nextTitle="Paralelismo na prática: worktrees, fan-out e múltiplas sessões"
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
        Este é o módulo que você vai deixar aberto num monitor. Tudo que o Claude Code expõe em 2026 consolidado: os 70+ slash commands organizados por categoria, 30 atalhos de teclado que economizam minutos todo dia, 20 flags da CLI pra cenários reais, 15 padrões do workflow diário e 10 variáveis de ambiente que mudam o comportamento. Sem ficção — só o que aparece em sessões reais.
      </p>

      <Section accent={accent} title="70+ slash commands built-in (categorizados)">
        <CodeBlock lang="text">{`━━━ SESSÃO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/resume [session]      Retoma sessão por ID/nome ou abre picker
/continue              Alias de /resume (pega a mais recente)
/branch [name]         Cria branch da conversa no ponto atual
/clear                 Nova conversa (contexto zerado, anterior em /resume)
/rename [name]         Renomeia a sessão atual (aparece no picker)
/rewind                Volta código + conversa a um ponto anterior
/export [filename]     Exporta conversa como texto

━━━ CONTROLE & MODO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/permissions           Gerencia allow/ask/deny rules (dialog)
/model [model]         Muda modelo (picker se omitir)
/effort [level]        Set effort: low|medium|high|xhigh|max
/fast [on|off]         Toggle fast mode (Opus 4.6+)
/permission-mode       Muda: default|acceptEdits|plan|auto|bypassPermissions
/config                Settings UI (theme, model, output style)
/status                Versão, modelo, account, conectividade

━━━ ANÁLISE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/review [PR]           Review PR local (shallow)
/security-review       Analisa pending changes por vulnerabilidades
/diff                  Diff viewer interativo (git + per-turn)
/insights              Análise cloud de sessões, patterns, friction
/context               Visualiza uso do context window + otimizações
/cost                  Token usage stats (subscription-specific)

━━━ DEBUG & MANUTENÇÃO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/debug [description]   [Skill] Ativa debug logging + troubleshoot
/doctor                Diagnóstico + settings (status icons, 'f' pra fix)
/simplify [focus]      [Skill] Review código recente + aplica fixes
/batch <instruction>   [Skill] Paraleliza em 5-30 worktrees + PRs
/loop [interval] [cmd] [Skill] Executa repetidamente (auto-pace se sem interval)
/compact [instructions] Resume conversa (libera context, skills sobrevivem)
/fewer-permission-prompts [Skill] Gera allowlist automático

━━━ WORKFLOWS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/claude-api            [Skill] Carrega API reference (Python/TS/Java/Go/...)
/init                  Inicializa CLAUDE.md
/agents                Gerencia subagents (UI)
/hooks                 Visualiza hook configs
/skills                Lista skills (press 't' sort by tokens)
/memory                Edita CLAUDE.md + auto-memory
/schedule [desc]       [Skill] Cria routines (cron remoto Anthropic)
/autofix-pr [prompt]   Spawn web session assistindo + pushing fixes

━━━ IDE & AMBIENTE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/ide                   Manage IDE integrations + status
/terminal-setup        Configura keybindings terminal (Shift+Enter)
/keybindings           Abre/cria keybindings config
/statusline            Configura statusline customizado
/desktop               Continua sessão em Desktop app (/app)
/mobile                QR code do app mobile (/ios, /android)

━━━ INTEGRAÇÕES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/chrome                Configura Claude in Chrome
/mcp                   Manage MCP servers + OAuth
/plugin                Manage plugins (install/list/enable)
/install-github-app    Setup GitHub Actions integration
/install-slack-app     Instala Slack app

━━━ UTILITÁRIOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/help                  Lista comandos + skills disponíveis
/add-dir <path>        Adiciona working dir à sessão
/copy [N]              Copia Nth resposta ao clipboard
/color [color|default] Seta cor da prompt bar
/btw <question>        Pergunta rápida sem adicionar à conversa
/focus                 Toggle focus view (só último prompt+resposta)
/theme                 Muda theme (auto/light/dark/daltonized/ANSI)
/tui [default|fullscreen] Muda renderer + relaunch (alt-screen)
/heapdump              Heap snapshot + memory breakdown (~/Desktop)
/release-notes         Changelog interativo com picker
/powerup               Lições interativas com demos animadas
/team-onboarding       Gera guia de ramp-up pra teammates

━━━ CONTA & SUPORTE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/login /logout /auth   Autenticação
/upgrade /usage        Plano + rate limits
/extra-usage           Continuar além do rate limit
/privacy-settings      View/update privacy (Pro/Max)
/feedback [report]     Submete feedback (alias /bug)
/exit                  Sai (alias /quit)

━━━ CLOUD & WEB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/remote-control        Habilita controle remoto de claude.ai (/rc)
/remote "desc"         Cria web session em claude.ai
/teleport              Puxa web session pro terminal (/tp)
/remote-env            Configura default remote environment
/ultraplan <prompt>    Planejamento profundo em web session
/ultrareview [PR]      Multi-agent code review em cloud sandbox
/web-setup             Conecta GitHub account pra web sessions`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Atalhos de teclado: os 30 que você vai usar sempre">
        <p><strong>Edição de texto:</strong></p>
        <CodeBlock lang="text">{`Ctrl+A              Vai pro início da linha
Ctrl+E              Vai pro fim da linha
Ctrl+K              Deleta até o fim da linha (guarda pra paste)
Ctrl+U              Deleta do cursor até início da linha
Ctrl+W              Deleta palavra anterior
Ctrl+Y              Cola texto deletado (Alt+Y cicla histórico)
Alt+B               Cursor uma palavra atrás
Alt+F               Cursor uma palavra à frente`}</CodeBlock>
        <p><strong>Controle da sessão:</strong></p>
        <CodeBlock lang="text">{`Ctrl+C              Cancela input ou geração em andamento
Ctrl+D              EOF / sai
Ctrl+L              Limpa prompt + redraw
Ctrl+O              Transcript viewer (detalhes de tool calls)
Ctrl+R              Busca reversa no histórico (interativa)
Ctrl+B              Background do comando em andamento
Ctrl+T              Toggle task list (background tasks)
Ctrl+G              Abre prompt em $EDITOR
Esc+Esc             Rewind ou summarize`}</CodeBlock>
        <p><strong>Produtividade:</strong></p>
        <CodeBlock lang="text">{`Shift+Tab           Cicla permission modes
Alt+P  (Option+P)   Muda o modelo
Alt+T  (Option+T)   Toggle extended thinking
Alt+O  (Option+O)   Toggle fast mode
Shift+Enter         Nova linha multiline (após /terminal-setup)
Ctrl+V / Cmd+V      Cola imagem do clipboard
Up/Down / Ctrl+P/N  Histórico de comandos`}</CodeBlock>
        <p><strong>Transcript viewer (Ctrl+O):</strong></p>
        <CodeBlock lang="text">{`Ctrl+E              Toggle show all
[                   Escreve no scrollback (busca com Cmd+F)
v                   Abre em $VISUAL/$EDITOR
q / Ctrl+C / Esc    Sai do viewer`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Flags da CLI: as 20 que aparecem na prática">
        <ComparisonTable
          headers={['Flag', 'Para que serve']}
          rows={[
            ['--model <name>', 'Define modelo (alias: opus, sonnet, haiku)'],
            ['--effort <level>', 'low|medium|high|xhigh|max (raciocínio)'],
            ['-p "prompt"', 'Modo print (non-interactive) — saída em stdout'],
            ['--output-format', 'text|json|stream-json'],
            ['--json-schema', 'Schema para output estruturado'],
            ['--max-turns N', 'Limite de turns antes de exit'],
            ['--max-budget-usd', 'Stop automático ao atingir custo'],
            ['--allowedTools', 'Lista de tools permitidas (allowlist)'],
            ['--permission-mode', 'default|acceptEdits|plan|auto|bypassPermissions'],
            ['--add-dir <path>', 'Adiciona diretório adicional'],
            ['--worktree <nome>', 'Cria git worktree + branch isolada'],
            ['--tmux [classic]', 'Abre em tmux (iTerm2 native panes se disponível)'],
            ['--name <id>', 'Nome da sessão (aparece no picker)'],
            ['--session-id <uuid>', 'UUID exato pra reuso'],
            ['--resume <name>', 'Retoma por nome/ID'],
            ['--continue / -c', 'Retoma a última sessão no cwd'],
            ['--from-pr <num>', 'Sessions linkadas a PR'],
            ['--fork-session', 'Com --resume: novo ID (não sobrescreve)'],
            ['--bare', 'Skip hooks/skills/plugins/MCP/CLAUDE.md (boot rápido)'],
            ['--agents \'{...}\'', 'Define subagents inline via JSON'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="15 padrões do dia a dia (copy-paste)">
        <CodeBlock lang="shell">{`# 1. Começar em plan mode (read-only) pra explorar sem medo
claude --permission-mode plan

# 2. Continuar onde parou ontem (no mesmo cwd)
claude -c

# 3. Retomar sessão nomeada de 2 semanas atrás
claude --resume "migration-v2"

# 4. Nova feature num worktree isolado + tmux
claude --worktree feature-auth --tmux

# 5. Explorar codebase num subagent (contexto limpo)
"Use o Explore pra mapear como authentication flui no app"

# 6. Fork de sessão pra experimentar sem destruir
claude --resume "my-session" --fork-session

# 7. Headless em CI: 3 turns máx, JSON pro pipeline
claude -p "fix type errors in src/" \\
  --max-turns 3 --output-format json \\
  --allowedTools "Read,Edit,Bash(tsc:*)"

# 8. Análise de log gigante via pipe
tail -1000 /var/log/app.log | claude -p "padrão de erros + causa raiz"

# 9. Geração de commit message real
git diff --staged | claude -p "Conventional Commit em pt-BR"

# 10. Loop de polling pra build longo
/loop 5m "verifique se o deploy do PR 123 terminou e resuma status"

# 11. Migração massiva em paralelo
/batch "migrar todos os useState para useReducer em src/features/"

# 12. Review robusto antes de mergear
/ultrareview 456

# 13. Session dedicada com budget
claude -n "refactor-auth" --max-budget-usd 10 --effort high

# 14. Gerar allowlist do seu uso real (parar de aprovar as mesmas coisas)
/fewer-permission-prompts

# 15. Onboarding de novo dev do time (gera guide personalizado)
/team-onboarding`}</CodeBlock>
      </Section>

      <Section accent={accent} title="10 variáveis de ambiente essenciais">
        <CodeBlock lang="shell">{`# Modelo e provider
export ANTHROPIC_API_KEY="sk-ant-..."       # obrigatória (auth)
export CLAUDE_CODE_USE_BEDROCK=1            # roda via Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1             # roda via Google Vertex AI
export CLAUDE_CODE_USE_FOUNDRY=1            # roda via Azure Foundry

# Comportamento padrão
export CLAUDE_CODE_EFFORT_LEVEL=high        # default effort (low|medium|high|xhigh|max)
export MAX_THINKING_TOKENS=10000            # limite de thinking (0 = disable; legacy)
export CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1  # reverte Opus 4.6/Sonnet 4.6 a budget fixo

# Performance & UX
export CLAUDE_CODE_NO_FLICKER=1             # rendering suave (alt-screen)
export CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false  # desabilita sugestões

# Task sharing entre projetos
export CLAUDE_CODE_TASK_LIST_ID=my-project  # ~/.claude/tasks/my-project compartilhado

# Debug
export CLAUDE_CODE_DEBUG_LOGS_DIR=/tmp/claude-logs

# Segurança
export CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1   # strip credentials de subprocesses
export ENABLE_PROMPT_CACHING_1H=1           # cache de 1 hora (vs padrão)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Padrões de settings.json que cobrem 80% dos projetos">
        <CodeBlock lang="json">{`// .claude/settings.json — configuração típica de projeto profissional
{
  "model": "claude-opus-4-7",
  "effortLevel": "high",
  "defaultMode": "plan",
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git branch:*)",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(npm run build:*)",
      "Read(**)",
      "Glob(**)",
      "Grep(**)",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Edit(docs/**)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Bash(curl:*)",
      "Bash(npm publish:*)",
      "Bash(git push --force:*)",
      "Edit(.env*)",
      "Edit(**/secrets/**)",
      "Write(/etc/**)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(docker:*)",
      "Edit(package.json)",
      "Edit(Dockerfile)"
    ]
  },
  "sandbox": {
    "network": {
      "deniedDomains": ["pastebin.com", "transfer.sh", "*.ngrok.io"]
    }
  },
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "refreshInterval": 5000
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/auto-lint.sh" }]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [{ "type": "command", "command": ".claude/hooks/notify.sh" }]
      }
    ]
  }
}`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Use este módulo como referência permanente.</strong> Marque no navegador, deixe aberto num monitor secundário. A fluência com Claude Code não vem de memorizar — vem de abrir o cheatsheet 50 vezes até os 10-15 comandos mais usados do seu workflow virarem automáticos. Para cada categoria aqui, peça ao Claude <Kbd>/help nome-do-comando</Kbd> para ver a doc completa do comando específico.
      </Callout>

      <Callout>
        Próximo: <strong>Paralelismo na prática</strong> — como rodar N subagents simultâneos em worktrees isolados, tasks em background, múltiplas sessões e orquestração fan-out para tarefas que escalam além de uma janela de contexto.
      </Callout>
    </div>
  );
}
