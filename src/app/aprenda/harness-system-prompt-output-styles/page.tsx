import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-system-prompt-output-styles');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre --system-prompt e --append-system-prompt?',
    options: [
      'São sinônimos — ambos definem o system prompt principal',
      '--system-prompt SUBSTITUI o system prompt padrão do Claude Code inteiro (raramente o que você quer — perde instruções de usar tools corretamente). --append-system-prompt ADICIONA ao prompt padrão (o que você quase sempre quer — preserva comportamento correto do agente + adiciona contexto).',
      '--system-prompt é para a API direta; --append-system-prompt é exclusivo do CLI',
      '--append-system-prompt só funciona em modo não-interativo (-p)',
    ],
    correct: 1,
    explanation: 'Essa distinção é fundamental e fonte comum de bugs em harness engineering. --system-prompt substitui TOTALMENTE o prompt interno do Claude Code — que inclui instruções críticas de como usar ferramentas, formato de tool calls, guardrails. Substituir sem saber o que o prompt padrão faz QUEBRA o agente. --append-system-prompt preserva o prompt padrão e adiciona suas instruções ao final — é o que você quer em 99% dos casos. Use --system-prompt apenas se entende profundamente o que está substituindo (raro) ou em SDK com total controle.',
  },
  {
    question: 'Onde ficam os arquivos de output styles e para que servem?',
    options: [
      'Em .claude/output-styles/<name>.json; mudam como o Claude formata respostas, tool calls e erros (prefixos, templates, cores lógicas) sem alterar o que ele decide fazer. Útil para padronizar output em times ou adequar a um layout específico.',
      'Output styles são apenas temas de cor — escolhidos via /theme',
      'Em settings.json.outputFormat — é apenas um switch entre text/json/stream-json',
      'Output styles não existem no Claude Code; apenas no claude.ai',
    ],
    correct: 0,
    explanation: 'Output styles em .claude/output-styles/<name>.json customizam a camada visual/estrutural da resposta do Claude: como tool calls são renderizados, como erros aparecem, prefixos de seção, formato de diffs. São distintos de themes (cores) e de --output-format (text/json/stream-json para parseio programático). Use output styles quando quer padronização visual para o time ou adequação a um layout editorial. Exemplo: time de SRE pode ter output style "incident-mode" que prefixa toda ação com severidade + timestamp.',
  },
  {
    question: 'Você quer exibir no statusline: branch atual + arquivos modificados + horário. Qual a forma correta em 2026?',
    options: [
      'Não é possível — statusline é fixo',
      'Criar ~/.claude/statusline.sh (ou .claude/statusline.sh no projeto) com um shell script que imprime a linha desejada. Configurar { "statusLine": { "type": "command", "command": "~/.claude/statusline.sh", "refreshInterval": 5000 } } em settings. O script roda periodicamente; o refresh interval controla a frequência.',
      'Rodar /statusline que aplica automaticamente o $PS1 do shell (sem customização possível)',
      'Usar uma skill especial chamada /statusline-show que atualiza em tempo real',
    ],
    correct: 1,
    explanation: 'Statusline customizado é um shell script + config em settings.json. O script pode fazer qualquer coisa: git branch --show-current, hostname, horário, status do deploy, contagem de TODOs, etc. refreshInterval em ms controla a frequência (5000 = 5s é comum). Para inicializar com o conteúdo do seu $PS1, use /statusline — ele gera um script baseline que você edita. O statusline é uma forma elegante de expor contexto ambiental sem poluir o prompt, e combina perfeitamente com hooks que atualizam arquivos lidos pelo script.',
  },
];

export default function HarnessSystemPromptPage() {
  return (
    <ModuleLayout
      slug="harness-system-prompt-output-styles"
      title="System prompt, output styles e statusline: a personalidade do agente"
      icon="🎭"
      xp={80}
      readTime={16}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-permissions-em-producao"
      nextTitle="Permissions em produção: allowlist, deny rules e auto mode"
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
        Personalidade não é cosmética — é operação. Um system prompt ajustado reduz alucinação em edge cases do seu domínio, produz output no formato exato que seu pipeline espera, e carrega convenções que você repetiria em cada turno. Output styles padronizam a saída pro time inteiro. Statusline customizado expõe contexto ambiental (branch, deploy status, ticket atual) sem poluir o prompt. Juntos, são o primeiro eixo do harness: a voz + o visual do seu agente.
      </p>

      <Section accent={accent} title="System prompt: --append vs --system-prompt">
        <CodeBlock lang="shell">{`# NUNCA comece substituindo — APPEND é o que você quer:
claude --append-system-prompt "Sempre retorne respostas em PT-BR.
Use o padrão de erros Result<T,E> do projeto.
Nunca modifique arquivos fora de src/ sem confirmar explicitamente."

# Ou via arquivo (mais prático pra prompts longos):
claude --system-prompt-file ./.claude/project-voice.md

# ❌ ARRISCADO: substitui o prompt padrão inteiro
# Só faz sentido se você sabe EXATAMENTE o que está perdendo:
claude --system-prompt "You are a helpful assistant."
# ← Perde: instruções de tool use correto, guardrails, comportamento agêntico.
# Resultado típico: Claude para de usar tools, responde como chat genérico.

# Onde definir permanentemente (por projeto):
# .claude/settings.json — systemPromptFile aponta pra arquivo commitado
{
  "systemPromptFile": ".claude/project-voice.md"
}

# Hierarquia: enterprise append + user append + project append
# (Anthropic: system prompt nunca é SUBSTITUÍDO por configs — só appended)

# Debugging — ver o prompt efetivo:
claude --debug prompt
# Loga o system prompt montado antes de cada request`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Modelos práticos de system prompt por domínio">
        <CodeBlock lang="markdown">{`# .claude/project-voice.md — exemplo para projeto Python + FastAPI

## Voz
Você é um colaborador técnico deste projeto, não um assistente genérico.
Fale em PT-BR, tom direto, sem floreio. Se faltar contexto, pergunte —
não invente.

## Stack e convenções do projeto
- Python 3.12 com type hints em 100% das APIs públicas
- FastAPI + Pydantic v2 + SQLAlchemy async
- Testes: pytest + pytest-asyncio, fixtures em conftest.py
- Logging: structlog em JSON, nunca print()
- Erros: raise HTTPException com status correto; nunca return {"error": ...}

## Padrões de código
- Imports: stdlib, third-party, local (separados por linha em branco)
- Docstrings: Google style, apenas em funções públicas
- Comentários: só quando o "por quê" é não-óbvio
- Funções: max 30 linhas; extraia helpers se crescer
- Sem classes utilitárias; prefira funções puras

## O que NÃO fazer
- Não usar requests (use httpx)
- Não usar time.sleep em código async (use asyncio.sleep)
- Não silenciar exceptions com try/except Exception: pass
- Não editar alembic/versions/ manualmente (use alembic revision)

## Fluxo de trabalho
Antes de modificar um endpoint:
1. Leia o handler + schemas Pydantic + testes existentes
2. Proponha mudança citando arquivos/linhas específicos
3. Aguarde aprovação para mudanças não-triviais
4. Execute testes depois: pytest -xvs tests/api/`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Output styles: padronizar a saída visual">
        <CodeBlock lang="json">{`// .claude/output-styles/incident-mode.json
{
  "name": "incident-mode",
  "responsePrefix": "🚨 [INCIDENT-MODE]",
  "toolCallFormat": "⏱ {timestamp} | {severity} | {toolName}({toolArgsSummary})",
  "toolResultFormat": "✓ {durationMs}ms | {resultSummary}",
  "errorFormat": "🔴 ERRO [{category}]: {message}\\n   Sugestão: {suggestion}",
  "sectionHeaders": {
    "proposal": "▶ PROPOSTA DE AÇÃO",
    "reasoning": "▶ RACIOCÍNIO",
    "risks": "▶ RISCOS IDENTIFICADOS"
  },
  "colors": {
    "primary": "red",
    "accent": "yellow"
  }
}

// Uso:
// Via /config → selecionar output style
// Ou em settings.json:
{
  "outputStyle": "incident-mode"
}

// Combine com --output-format para pipelines:
claude -p "analise falha no job X" \\
  --output-format stream-json \\
  --outputStyle incident-mode
// stream-json é consumido por scripts; style afeta display humano quando há TUI`}</CodeBlock>
        <ComparisonTable
          headers={['Style', 'Quando usar']}
          rows={[
            ['default', 'Uso geral'],
            ['compact', 'Sessões longas, muitos tool calls — reduz verbosidade'],
            ['incident-mode', 'On-call, debugging crítico — destaca severidade'],
            ['tutor-mode', 'Ensino — expande explicações, sugere leituras'],
            ['review-mode', 'Code review — prefixa com 🔍, formata sugestões inline'],
            ['ci-mode', 'Pipelines headless — minimal, parseável'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Statusline customizado: contexto ambiental sem poluir prompt">
        <CodeBlock lang="bash">{`#!/bin/bash
# ~/.claude/statusline.sh
# Executado periodicamente (refreshInterval em settings.json)

# Git context
BRANCH=$(git branch --show-current 2>/dev/null || echo "—")
CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
COMMITS_AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")

# Deploy status (se houver arquivo .deploy-status)
DEPLOY_STATUS="—"
if [ -f ".deploy-status" ]; then
  DEPLOY_STATUS=$(cat .deploy-status)
fi

# Ticket atual (se houver .current-ticket)
TICKET="—"
if [ -f ".current-ticket" ]; then
  TICKET=$(cat .current-ticket)
fi

# Time
TIME=$(date +%H:%M)

# Monta a linha
printf "🌿 %s" "$BRANCH"
[ "$CHANGES" != "0" ] && printf " (%s mod)" "$CHANGES"
[ "$COMMITS_AHEAD" != "0" ] && printf " ↑%s" "$COMMITS_AHEAD"
printf " | 🚀 %s" "$DEPLOY_STATUS"
printf " | 🎫 %s" "$TICKET"
printf " | ⏰ %s" "$TIME"`}</CodeBlock>
        <CodeBlock lang="json">{`// .claude/settings.json
{
  "statusLine": {
    "type": "command",
    "command": ".claude/statusline.sh",
    "refreshInterval": 5000
  }
}

// Gerar baseline a partir do seu $PS1:
// /statusline
// → cria ~/.claude/statusline.sh com sua config atual do shell

// Combine com hooks que atualizam arquivos lidos pelo statusline:
// hook PostToolUse(Bash(./deploy.sh:*)) → escreve em .deploy-status
// hook UserPromptSubmit → parseia ticket Jira do prompt e escreve em .current-ticket
// → statusline automaticamente reflete o estado sem Claude precisar printar`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Themes e UX visual">
        <CodeBlock lang="shell">{`# Themes afetam apenas cores (não formatação/comportamento):
/theme
# Opções: auto, light, dark, daltonized, ANSI

# Output styles afetam FORMATO; themes afetam CORES — combinam.
# Exemplo: output style "compact" + theme "dark" + statusline custom

# Outras flags de rendering:
CLAUDE_CODE_NO_FLICKER=1  # rendering smooth (alt-screen mode)
/tui fullscreen           # modo fullscreen com alt-screen
/tui default              # modo inline (padrão)

# Focus mode — esconde tudo exceto último prompt + resposta:
/focus   # toggle

# Command palette pra acesso rápido:
Cmd+K    # macOS
Ctrl+K   # linux/win

# Keybindings customizados:
/keybindings  # edita ~/.claude/keybindings.json
# Você pode remapear qualquer atalho (ex: trocar Ctrl+O por Ctrl+Shift+L)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Voz + visual = identidade do agente.</strong> System prompt com <code>--append</code> carrega sua stack e convenções em cada sessão. Output styles padronizam saída pro time. Statusline expõe contexto ambiental (branch, deploy, ticket) sem ocupar prompt. Themes dão coerência visual. Em times maduros, todos esses artefatos ficam em <code>.claude/</code> commitado no repo — um dev novo clona o repo e já herda a personalidade correta do agente pro projeto. É a camada de produtividade mais subestimada do Claude Code.
      </Callout>

      <Callout>
        Próximo: <strong>Permissions em produção</strong> — o segundo eixo. Allowlist granular com patterns, deny rules absolutas, sandbox de rede, wrappers (sudo/env/watch), auto mode com classifier. Como construir uma política de permissão que seja segura em CI e fluida no dev local.
      </Callout>
    </div>
  );
}
