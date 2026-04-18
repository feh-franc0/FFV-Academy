import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-sdk');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença principal entre o Claude Agent SDK e o Anthropic Client SDK?',
    options: [
      'O Client SDK é mais caro porque inclui funcionalidades extras de monitoramento',
      'O Agent SDK executa ferramentas automaticamente (Read, Edit, Bash, etc.) — no Client SDK, você implementa o tool loop manualmente',
      'O Agent SDK só funciona em Python; o Client SDK funciona em ambas as linguagens',
      'Não há diferença — ambos são nomes diferentes para o mesmo pacote',
    ],
    correct: 1,
    explanation: 'Essa é a distinção fundamental. Com o Client SDK, você chama client.messages.create() e implementa um loop que verifica stop_reason == "tool_use", executa a ferramenta, e manda o resultado de volta. Com o Agent SDK, você chama query() e o agente faz tudo sozinho — ele lê arquivos, roda comandos, edita código, tudo autonomamente. O Agent SDK é Claude Code como biblioteca; o Client SDK é acesso direto à API Messages.',
  },
  {
    question: 'Você está criando um agente que roda em CI/CD para revisar PRs. Qual combinação de flags é mais adequada para o CLI com -p?',
    options: [
      'claude -p "Review this PR" --output-format text — o default já carrega tudo o que precisa',
      'claude -p "Review this PR" --bare --output-format json --allowedTools "Read,Glob,Grep" — bare evita hooks/MCP locais, JSON dá output estruturado, tools são read-only',
      'claude -p "Review this PR" --allowedTools "Bash,Edit,Write" — CI precisa poder corrigir os problemas',
      'claude "Review this PR" — sem -p é mais completo porque inclui modo interativo',
    ],
    correct: 1,
    explanation: 'Em CI/CD, --bare é essencial: ele pula hooks, skills, plugins e MCP servers que possam existir no .claude/ de alguém — garante resultado consistente em qualquer máquina. --output-format json dá saída estruturada com session_id e metadata. --allowedTools restrito a Read,Glob,Grep garante que o agente só leia (não edite). Sem -p, o comando espera input interativo — inutilizável em CI. Sem --bare, um hook de um dev pode interferir no resultado do pipeline.',
  },
  {
    question: 'Você definiu um subagent "security-reviewer" via SDK e incluiu "Agent" em allowed_tools. O que acontece quando o agente principal delega uma tarefa para ele?',
    options: [
      'O subagent roda no mesmo contexto do agente principal, compartilhando memória e histórico',
      'O subagent é criado com uma janela de contexto isolada, usando apenas o prompt e as tools definidas na AgentDefinition, e retorna o resultado para o agente principal',
      'O subagent precisa ser deployado separadamente como um servidor MCP antes de ser usado',
      'Claude ignora o subagent e executa a tarefa diretamente — subagents só funcionam no modo interativo',
    ],
    correct: 1,
    explanation: 'Subagents no SDK rodam em janelas de contexto completamente isoladas. Quando você define um AgentDefinition com description, prompt e tools, o agente principal invoca o subagent via a ferramenta Agent. O subagent só vê o prompt que recebeu e só tem acesso às tools especificadas — ele não herda o contexto do pai. As mensagens do subagent incluem parent_tool_use_id para rastreabilidade. Isso é poderoso para separação de responsabilidades: um subagent de segurança vê apenas código, sem acesso a Bash.',
  },
];

export default function ClaudeCodeSdkPage() {
  return (
    <ModuleLayout
      slug="claude-code-sdk"
      title="Claude Agent SDK: usar Claude Code como biblioteca"
      icon="📦"
      xp={80}
      readTime={16}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-cowork"
      nextTitle="Claude Cowork: plugins, tarefas agendadas e pesquisa em escala"
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
        Até aqui, você usou Claude Code no terminal — interativo, conversacional, poderoso. Mas e se você quiser que Claude Code rode automaticamente num pipeline de CI, revise PRs às 3h da manhã, ou vire o motor de um produto seu? O <strong>Claude Agent SDK</strong> transforma tudo o que você aprendeu — tools, hooks, subagents, MCP, skills — numa biblioteca Python/TypeScript que você importa e controla via código.
      </p>

      <Section accent={accent} title="O que é o Claude Agent SDK">
        <p>
          O Claude Agent SDK é Claude Code empacotado como biblioteca. A mesma engine que lê arquivos, roda comandos, edita código e gerencia contexto no terminal — disponível como <code>pip install claude-agent-sdk</code> ou <code>npm install @anthropic-ai/claude-agent-sdk</code>.
        </p>

        <Callout tone="warn" icon="⚠️">
          <strong>Não confundir com o Anthropic Client SDK.</strong> O Client SDK (<code>anthropic</code>) dá acesso direto à API Messages — você implementa o tool loop manualmente. O Agent SDK (<code>claude-agent-sdk</code>) executa ferramentas automaticamente. A diferença é quem controla o loop:
        </Callout>

        <ComparisonTable
          headers={['Aspecto', 'Client SDK (anthropic)', 'Agent SDK (claude-agent-sdk)']}
          rows={[
            ['Tool loop', 'Você implementa', 'SDK executa automaticamente'],
            ['Built-in tools', 'Nenhuma — você define tudo', 'Read, Edit, Bash, Glob, Grep, WebSearch, etc.'],
            ['Subagents', 'Você orquestra manualmente', 'AgentDefinition nativa'],
            ['Hooks', 'Não tem', 'PreToolUse, PostToolUse, Stop, etc.'],
            ['Sessões', 'Gerenciamento manual', 'Resume, fork, session_id'],
            ['Ideal para', 'Chatbots, APIs customizadas', 'Automação, CI/CD, agentes autônomos'],
          ]}
        />
      </Section>

      <Section accent={accent} title="Instalação e primeiro agente">
        <p>
          O SDK está disponível em Python e TypeScript. O pacote TypeScript já inclui o binário do Claude Code — nenhuma instalação separada necessária.
        </p>

        <CodeBlock lang="bash">{`# Python
pip install claude-agent-sdk

# TypeScript / Node.js
npm install @anthropic-ai/claude-agent-sdk`}</CodeBlock>

        <p>Configure a API key como variável de ambiente:</p>

        <CodeBlock lang="bash">{`export ANTHROPIC_API_KEY=sk-ant-...`}</CodeBlock>

        <p>Seu primeiro agente — listar e analisar arquivos de um diretório:</p>

        <CodeBlock lang="python">{`import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="What files are in this directory? Summarize the project.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "Bash"],
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())`}</CodeBlock>

        <CodeBlock lang="typescript">{`import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "What files are in this directory? Summarize the project.",
  options: { allowedTools: ["Read", "Glob", "Grep", "Bash"] }
})) {
  if ("result" in message) console.log(message.result);
}`}</CodeBlock>

        <Callout tone="info" icon="💡">
          <strong>A função query() é async iterator.</strong> <code>query()</code> retorna um async generator que emite mensagens conforme o agente trabalha. O último message com <code>result</code> contém a resposta final. Isso é diferente do Client SDK onde você recebe uma resposta de uma vez.
        </Callout>
      </Section>

      <Section accent={accent} title="Built-in tools: o que o agente já sabe fazer">
        <p>
          Ao contrário do Client SDK onde você define cada ferramenta manualmente, o Agent SDK vem com as mesmas ferramentas que Claude Code usa no terminal:
        </p>

        <ComparisonTable
          headers={['Tool', 'O que faz', 'Quando usar']}
          rows={[
            ['Read', 'Lê qualquer arquivo no working directory', 'Análise de código, revisão de PRs'],
            ['Write', 'Cria novos arquivos', 'Scaffolding, geração de código'],
            ['Edit', 'Edições precisas em arquivos existentes', 'Refactoring, bug fixes'],
            ['Bash', 'Roda comandos no terminal', 'Testes, git, scripts'],
            ['Glob', 'Busca arquivos por padrão (*.ts, src/**/*.py)', 'Descoberta de estrutura'],
            ['Grep', 'Busca conteúdo com regex', 'Encontrar referências, TODOs'],
            ['WebSearch', 'Pesquisa na web', 'Informação atualizada'],
            ['WebFetch', 'Busca e parseia uma URL', 'Documentação, APIs'],
            ['Monitor', 'Observa output de processo em background', 'Logs, builds longos'],
            ['AskUserQuestion', 'Pergunta ao usuário com opções', 'Decisões que requerem humano'],
          ]}
        />

        <p>
          Você controla quais tools estão disponíveis via <code>allowed_tools</code>. Um agente de code review pode ter apenas <code>[&quot;Read&quot;, &quot;Glob&quot;, &quot;Grep&quot;]</code> — read-only por design. Um agente de bug fix pode ter <code>[&quot;Read&quot;, &quot;Edit&quot;, &quot;Bash&quot;]</code>.
        </p>
      </Section>

      <Section accent={accent} title="Hooks programáticos: controle fino no SDK">
        <p>
          No terminal, hooks são scripts shell configurados em <code>.claude/settings.json</code>. No SDK, hooks são funções Python/TypeScript que recebem dados ricos e podem decidir o que acontece:
        </p>

        <CodeBlock lang="python">{`from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher

async def log_edit(input_data, tool_use_id, context):
    """Roda depois de cada Edit/Write — registra no audit log."""
    file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
    with open("./audit.log", "a") as f:
        f.write(f"{datetime.now().isoformat()}: modified {file_path}\\n")
    return {}

async def main():
    async for message in query(
        prompt="Refactor utils.py to improve readability",
        options=ClaudeAgentOptions(
            permission_mode="acceptEdits",
            hooks={
                "PostToolUse": [
                    HookMatcher(matcher="Edit|Write", hooks=[log_edit])
                ]
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)`}</CodeBlock>

        <p>
          Os hooks do SDK suportam os mesmos eventos do terminal: <strong>PreToolUse</strong> (pode bloquear), <strong>PostToolUse</strong>, <strong>Stop</strong>, <strong>SessionStart</strong>, <strong>SessionEnd</strong>. A diferença é que são funções async em vez de scripts shell — mais poder, mais controle, sem I/O de subprocess.
        </p>
      </Section>

      <Section accent={accent} title="Subagents: delegar tarefas especializadas">
        <p>
          O SDK permite definir subagents com instruções e ferramentas específicas. O agente principal delega tarefas, e cada subagent roda em contexto isolado:
        </p>

        <CodeBlock lang="python">{`from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async def main():
    async for message in query(
        prompt="Use the security-reviewer to audit this codebase",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "Agent"],
            agents={
                "security-reviewer": AgentDefinition(
                    description="Security expert — reviews for vulnerabilities.",
                    prompt="Analyze code for OWASP Top 10 vulnerabilities. "
                           "Report findings with severity and remediation.",
                    tools=["Read", "Glob", "Grep"],  # read-only!
                )
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)`}</CodeBlock>

        <Callout tone="info" icon="💡">
          Mensagens dentro de um subagent incluem <code>parent_tool_use_id</code> — você pode rastrear qual subagent gerou qual output. Útil para UI customizada ou logging.
        </Callout>
      </Section>

      <Section accent={accent} title="MCP no SDK: conectar ferramentas externas">
        <p>
          O SDK aceita servidores MCP da mesma forma que o <code>.mcp.json</code> do terminal:
        </p>

        <CodeBlock lang="python">{`from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Open example.com and describe what you see",
        options=ClaudeAgentOptions(
            mcp_servers={
                "playwright": {
                    "command": "npx",
                    "args": ["@playwright/mcp@latest"]
                }
            }
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)`}</CodeBlock>

        <p>
          Qualquer servidor MCP que funciona no terminal funciona no SDK — PostgreSQL, GitHub, Slack, Google Drive. A config é idêntica.
        </p>
      </Section>

      <Section accent={accent} title="Sessions: continuar e retomar conversas">
        <p>
          O SDK mantém sessões com contexto completo. Você pode capturar o <code>session_id</code> e retomar depois — o agente lembra de tudo que leu e fez:
        </p>

        <CodeBlock lang="python">{`from claude_agent_sdk import query, ClaudeAgentOptions, SystemMessage, ResultMessage

session_id = None

# Primeira query: agente lê e analisa
async for message in query(
    prompt="Read the authentication module",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Glob"]),
):
    if isinstance(message, SystemMessage) and message.subtype == "init":
        session_id = message.data["session_id"]

# Segunda query: retoma com contexto completo
async for message in query(
    prompt="Now find all places that call it",  # "it" = auth module
    options=ClaudeAgentOptions(resume=session_id),
):
    if isinstance(message, ResultMessage):
        print(message.result)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CLI headless: -p, --bare e structured output">
        <p>
          Nem sempre você precisa do SDK como biblioteca. O CLI com <code>-p</code> já é poderoso para scripts e CI:
        </p>

        <CodeBlock lang="bash">{`# Pergunta simples — output em texto
claude -p "What does the auth module do?"

# Output JSON estruturado com metadata
claude -p "Summarize this project" --output-format json

# Schema customizado — output tipado
claude -p "Extract function names from auth.py" \\
  --output-format json \\
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}}}'`}</CodeBlock>

        <Callout tone="warn" icon="⚠️">
          <strong>--bare para CI/CD:</strong> <code>--bare</code> pula hooks, skills, plugins, MCP servers e CLAUDE.md. Resultado consistente em qualquer máquina — nenhuma configuração local de dev interfere no pipeline. Autenticação deve vir de <code>ANTHROPIC_API_KEY</code> (não OAuth/keychain).
        </Callout>

        <CodeBlock lang="bash">{`# Review + commit de mudanças staged
claude -p "Look at my staged changes and create an appropriate commit" \\
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"

# Review de PR com system prompt customizado
gh pr diff "$1" | claude -p \\
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \\
  --output-format json \\
  --bare`}</CodeBlock>

        <CodeBlock lang="bash">{`# Stream cada token como JSON
claude -p "Explain recursion" \\
  --output-format stream-json \\
  --verbose \\
  --include-partial-messages

# Filtrar apenas texto (sem metadata)
claude -p "Write a poem" \\
  --output-format stream-json \\
  --verbose \\
  --include-partial-messages | \\
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Quando usar CLI -p vs SDK vs Client SDK">
        <ComparisonTable
          headers={['Cenário', 'Melhor opção', 'Por quê']}
          rows={[
            ['Script rápido no terminal', 'CLI -p', 'Uma linha, sem setup'],
            ['CI/CD pipeline', 'CLI -p --bare', 'Consistente, sem deps locais'],
            ['Agente customizado em produto', 'Agent SDK', 'Controle total, hooks, subagents'],
            ['Chatbot com tool use', 'Client SDK', 'Você define as ferramentas'],
            ['Automação com browser/DB', 'Agent SDK + MCP', 'MCP servers prontos'],
            ['Desenvolvimento interativo', 'CLI (sem -p)', 'Conversacional, rápido'],
          ]}
        />
      </Section>

      <Section accent={accent} title="Exemplo real: agente de code review para GitHub Actions">
        <p>
          Um caso de uso concreto — um agente que roda no GitHub Actions, revisa PRs e posta comentários:
        </p>

        <CodeBlock lang="python">{`import asyncio
import json
import os
from claude_agent_sdk import query, ClaudeAgentOptions

async def review_pr():
    pr_diff = os.popen("gh pr diff").read()

    result = None
    async for message in query(
        prompt=f"""Review this PR diff for:
1. Security vulnerabilities (OWASP Top 10)
2. Performance issues
3. Code quality concerns

Diff:
{pr_diff}

Output a JSON with: summary, severity (low/medium/high), findings[]""",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep"],
            bare=True,  # sem hooks/MCP locais
        ),
    ):
        if hasattr(message, "result"):
            result = message.result

    # Postar como comentário no PR
    if result:
        os.system(f'gh pr comment --body "{result}"')

asyncio.run(review_pr())`}</CodeBlock>

        <Callout tone="info" icon="💡">
          <strong>Branding:</strong> Se você integrar o Agent SDK num produto, pode usar &quot;Claude Agent&quot; ou &quot;Powered by Claude&quot; na sua UI. Não é permitido usar &quot;Claude Code&quot; como nome do seu produto ou imitar a marca da Anthropic.
        </Callout>
      </Section>

      <Section accent={accent} title="O mapa mental">
        <ComparisonTable
          headers={['Conceito', 'Terminal', 'SDK']}
          rows={[
            ['Usar Claude Code', 'claude (interativo)', 'query(prompt, options)'],
            ['Ferramentas', 'Claude escolhe e pede permissão', 'allowed_tools pré-aprovadas'],
            ['Hooks', 'Scripts shell em settings.json', 'Funções async em hooks={}'],
            ['Subagents', '.claude/agents/*.md', 'agents={} com AgentDefinition'],
            ['MCP', '.mcp.json', 'mcp_servers={} no options'],
            ['Sessões', 'Automático', 'session_id + resume'],
            ['Contexto', 'CLAUDE.md carregado', '--bare pula tudo'],
            ['Permissões', 'Trust levels', 'permission_mode + allowed_tools'],
          ]}
        />
      </Section>
    </div>
  );
}
