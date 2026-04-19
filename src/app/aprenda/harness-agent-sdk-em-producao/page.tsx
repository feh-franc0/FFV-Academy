import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-agent-sdk-em-producao');

const quiz: QuizQuestion[] = [
  {
    question: 'Em que cenário faz mais sentido usar o Claude Agent SDK em vez do CLI do Claude Code?',
    options: [
      'Em qualquer cenário — SDK é sempre superior',
      'Quando você precisa: (a) embarcar o agente em uma aplicação (API, servidor, app desktop); (b) rodar em CI/CD com controle granular do ciclo de vida; (c) customizar hooks programaticamente em Python/TS; (d) construir produtos que usem Claude como componente. Para uso interativo de desenvolvimento, CLI é melhor.',
      'Apenas quando você precisa de streaming (CLI não suporta)',
      'Apenas para processamento em batch (CLI não suporta -p)',
    ],
    correct: 1,
    explanation: 'SDK e CLI são duas interfaces pra mesma capacidade subjacente. CLI é otimizado para interação humana: TUI, slash commands, atalhos, sessions persistentes locais. SDK é otimizado para integração programática: embutir num servidor, hooks com callbacks tipados, custom tools em Python/TS puro, sessions via API. Regra prática: interação humana → CLI. Produto/serviço que usa Claude como componente → SDK. CI/CD de produção onde você quer controle fino → SDK. Uso exploratório, dev local, scripts simples → CLI com -p. Os dois têm as mesmas capacidades (tools, subagents, hooks, MCP); diferença é a ergonomia pro caso de uso.',
  },
  {
    question: 'Você criou uma custom tool via @tool decorator no Python SDK. Claude pode usar essa tool?',
    options: [
      'Sim, mas só se você adicionar explicitamente "my_tool" em allowed_tools em ClaudeAgentOptions',
      'Sim, automaticamente — decoradores @tool são auto-registrados e disponibilizados ao modelo',
      'Custom tools via @tool são disponibilizadas, mas você controla visibilidade via options: tools=[my_tool] para incluir na sessão e allowed_tools para pre-aprovar (sem permission prompt). Se não incluir em tools, Claude não sabe que existe.',
      'Não — custom tools só funcionam via MCP server',
    ],
    correct: 2,
    explanation: 'Custom tools no SDK exigem dois passos: (1) registrar via @tool decorator (Python) ou helper equivalente (TS); (2) INCLUIR em ClaudeAgentOptions.tools para que Claude saiba que existe. Separadamente, allowed_tools controla se Claude pode usar sem permission prompt. Isso permite ter um catálogo de tools custom no código mas só disponibilizar subset específico pra cada session. Útil quando você tem tools sensíveis (ex: delete_user) que só certas sessões autorizadas podem usar. A distinção registration vs availability vs allowance dá granularidade fina.',
  },
  {
    question: 'Qual a forma idiomática de continuar uma sessão SDK entre múltiplos processos (ex: GitHub Action que roda em vários steps)?',
    options: [
      'Sessões SDK são efêmeras — cada processo começa do zero sempre',
      'Capture session_id da primeira mensagem system (subtype: init). Em processos subsequentes, passe options.resume=session_id (Python) ou resume:session_id (TS). O Claude Code Agent recupera o estado completo, incluindo contexto, tool calls anteriores e memória de sessão. Salve session_id em arquivo/env var entre steps.',
      'Use options.persistent=true e Claude persiste automaticamente',
      'Use um arquivo JSON local de snapshot — o SDK não suporta resume nativamente',
    ],
    correct: 1,
    explanation: 'Resume por session_id é o mecanismo nativo. Primeira invocação retorna session_id na mensagem system init. Você salva (env var, arquivo, Redis) e passa em próxima invocação via options.resume. Use cases: GitHub Action multi-step onde cada step invoca SDK; worker que processa jobs e mantém contexto entre jobs relacionados; long-running agent que é reiniciado periodicamente. --fork-session via flag análoga cria novo session_id a partir do estado, útil para experimentar sem destruir original. Critical: session_ids são UUIDs; não invente — use o retornado pelo system init message.',
  },
];

export default function HarnessAgentSdkPage() {
  return (
    <ModuleLayout
      slug="harness-agent-sdk-em-producao"
      title="Claude Agent SDK em produção: CI/CD, servidores e app embarcado"
      icon="🚀"
      xp={100}
      readTime={20}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
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
        Este é o último módulo da trilha. Cobertura do <strong>Claude Agent SDK</strong> — quando sair do CLI e usar SDK Python/TypeScript. Você vai ver: <code>query()</code> minimal, custom tools com <code>@tool</code>, subagents programáticos, hooks como callbacks tipados, MCP servers inline, sessions com resume/fork. Depois, <strong>dois scripts reais de produção</strong>: GitHub Action que revisa PRs automaticamente e cron de PR triage em Node. No fim, você terá o mapa completo pra embutir Claude em aplicações.
      </p>

      <Section accent={accent} title="Instalação e primeiro query()">
        <CodeBlock lang="shell">{`# Python
pip install claude-agent-sdk

# TypeScript
npm install @anthropic-ai/claude-agent-sdk`}</CodeBlock>
        <CodeBlock lang="python">{`# Python — query minimal
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Liste os arquivos Python em src/ e sugira os que poderiam ser divididos",
        options=ClaudeAgentOptions(
            cwd="/path/to/project",
            allowed_tools=["Read", "Glob", "Grep"],
            model="claude-opus-4-7",
            effort="high",
        ),
    ):
        # message types: system, tool_use, tool_result, text, result
        if message.type == "text":
            print(message.text)
        elif message.type == "result":
            print(f"---\\nDone. Total cost: $\\{message.total_cost_usd}")

asyncio.run(main())`}</CodeBlock>
        <CodeBlock lang="typescript">{`// TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Revise o código em src/auth.ts por vulnerabilidades OWASP",
  options: {
    cwd: "/path/to/project",
    allowedTools: ["Read", "Glob", "Grep"],
    model: "claude-opus-4-7",
    effort: "high",
  },
})) {
  if (message.type === "text") {
    console.log(message.text);
  } else if (message.type === "result") {
    console.log(\`Total cost: $\${message.total_cost_usd}\`);
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Custom tools: capacidades além do built-in">
        <CodeBlock lang="python">{`# Python — custom tool via decorator
from claude_agent_sdk import query, tool, ClaudeAgentOptions
import httpx

@tool
async def fetch_jira_ticket(ticket_id: str) -> dict:
    """Busca detalhes de um ticket Jira.

    Args:
        ticket_id: ID do ticket no formato PROJ-123
    """
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"https://your-domain.atlassian.net/rest/api/3/issue/\\{ticket_id}",
            headers={"Authorization": "Bearer $\\{JIRA_TOKEN}"},
        )
        data = r.json()
        return {
            "summary": data["fields"]["summary"],
            "status": data["fields"]["status"]["name"],
            "description": data["fields"]["description"],
        }

@tool
async def post_to_slack(channel: str, message: str) -> str:
    """Envia mensagem para um canal Slack."""
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://slack.com/api/chat.postMessage",
            headers={"Authorization": "Bearer $\\{SLACK_TOKEN}"},
            json={"channel": channel, "text": message},
        )
    return "Posted"

# Usar custom tools:
async for message in query(
    prompt="Verifique o ticket PROJ-123 e poste resumo no canal #eng",
    options=ClaudeAgentOptions(
        tools=[fetch_jira_ticket, post_to_slack],  # registra E disponibiliza
        allowed_tools=[                              # pre-aprova (sem permission prompt)
            "fetch_jira_ticket",
            "post_to_slack",
            "Read",
        ],
    ),
):
    ...`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Subagents e hooks programáticos">
        <CodeBlock lang="python">{`from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    AgentDefinition,
    HookCallback,
    HookMatcher,
)

# Subagent definido programaticamente
code_reviewer = AgentDefinition(
    description="Reviewer de código focado em segurança",
    prompt="""Você é um revisor de código sênior.
Analise o código por: injection, auth bugs, IDOR, XSS.
Retorne APENAS problemas encontrados em formato estruturado.""",
    tools=["Read", "Glob", "Grep"],
    model="claude-opus-4-7",
    effort="high",
)

# Hook programático com callback Python
async def audit_edits(input_data, tool_use_id, context):
    """Loga toda edição de arquivo em audit.jsonl"""
    file_path = input_data.get("tool_input", {}).get("file_path", "?")
    from datetime import datetime
    import json
    entry = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "tool_use_id": tool_use_id,
        "file_path": file_path,
        "session_id": context.get("session_id"),
    }
    with open("audit.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\\n")
    return {}  # não bloqueia

async def block_env_edits(input_data, tool_use_id, context):
    """Bloqueia edição em .env*"""
    file_path = input_data.get("tool_input", {}).get("file_path", "")
    if ".env" in file_path:
        return {
            "decision": "block",
            "reason": "Edição em arquivos .env é proibida por policy",
        }
    return {}

async for message in query(
    prompt="Revise o PR #456 e aplique fixes de segurança sugeridos",
    options=ClaudeAgentOptions(
        agents={
            "code-reviewer": code_reviewer,  # subagent disponível
        },
        hooks={
            "PostToolUse": [
                HookMatcher(matcher="Edit|Write", hooks=[audit_edits])
            ],
            "PreToolUse": [
                HookMatcher(matcher="Edit", hooks=[block_env_edits])
            ],
        },
        allowed_tools=["Read", "Edit", "Agent"],
    ),
):
    ...`}</CodeBlock>
      </Section>

      <Section accent={accent} title="MCP servers inline via SDK">
        <CodeBlock lang="typescript">{`// TypeScript — conectar MCP server programaticamente
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Navegue para github.com/anthropics/claude-code e resuma o README",
  options: {
    mcpServers: {
      playwright: {
        command: "npx",
        args: ["@playwright/mcp@latest"],
      },
      filesystem: {
        command: "npx",
        args: ["@modelcontextprotocol/server-filesystem", "/tmp"],
      },
    },
    allowedTools: [
      "Read",
      "mcp__playwright__navigate",
      "mcp__playwright__screenshot",
      "mcp__filesystem__write_file",
    ],
  },
})) {
  if (message.type === "text") console.log(message.text);
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Sessions: resume e fork programático">
        <CodeBlock lang="python">{`# Captura session_id na primeira chamada
session_id = None

async for message in query(prompt="Explore src/auth.ts", options=ClaudeAgentOptions(...)):
    if message.type == "system" and message.subtype == "init":
        session_id = message.data["session_id"]
        print(f"Session: \\{session_id}")
    if message.type == "text":
        print(message.text)

# Salva em algum lugar persistente
with open(".claude/session-id", "w") as f:
    f.write(session_id)

# --- Processo 2 (mais tarde, talvez em outro step do CI) ---

with open(".claude/session-id") as f:
    session_id = f.read().strip()

# Resume: continua de onde parou
async for message in query(
    prompt="Agora liste todos os callers de authenticateUser",
    options=ClaudeAgentOptions(resume=session_id),
):
    ...

# Fork: novo session_id a partir do estado atual (não sobrescreve)
async for message in query(
    prompt="Experimenta abordagem diferente: refatore pra JWT",
    options=ClaudeAgentOptions(resume=session_id, fork_session=True),
):
    ...`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Script real 1: GitHub Action que revisa PRs">
        <CodeBlock lang="yaml">{`# .github/workflows/ai-review.yml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install claude-agent-sdk httpx
      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: \${{ github.event.pull_request.number }}
          REPO: \${{ github.repository }}
        run: python .github/scripts/review.py`}</CodeBlock>
        <CodeBlock lang="python">{`# .github/scripts/review.py
import asyncio, os, httpx
from claude_agent_sdk import query, ClaudeAgentOptions

async def fetch_pr_diff(repo: str, pr_number: int, token: str) -> str:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"https://api.github.com/repos/\\{repo}/pulls/\\{pr_number}",
            headers={"Accept": "application/vnd.github.v3.diff",
                     "Authorization": f"Bearer \\{token}"},
        )
        return r.text

async def post_review(repo: str, pr: int, token: str, body: str):
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.github.com/repos/\\{repo}/issues/\\{pr}/comments",
            headers={"Authorization": f"Bearer \\{token}",
                     "Accept": "application/vnd.github.v3+json"},
            json={"body": body},
        )

async def main():
    diff = await fetch_pr_diff(
        os.environ["REPO"],
        int(os.environ["PR_NUMBER"]),
        os.environ["GITHUB_TOKEN"],
    )

    review_body = []
    async for message in query(
        prompt=f"""Revise este PR focando em: segurança, performance, edge cases.
Retorne em markdown com seções: ✅ Positivos, ⚠️ Atenção, 🔴 Bloqueadores.
Seja objetivo e cite arquivo:linha quando possível.

---
\\{diff}
""",
        options=ClaudeAgentOptions(
            model="claude-opus-4-7",
            effort="high",
            allowed_tools=["Read"],
            max_turns=5,
        ),
    ):
        if message.type == "text":
            review_body.append(message.text)

    body = "## 🤖 Claude Code Review\\n\\n" + "".join(review_body)
    await post_review(os.environ["REPO"], int(os.environ["PR_NUMBER"]),
                      os.environ["GITHUB_TOKEN"], body)

if __name__ == "__main__":
    asyncio.run(main())`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Script real 2: Cron de PR triage (Node)">
        <CodeBlock lang="typescript">{`// scripts/pr-triage.ts
// Roda como cron: agrega PRs abertos, classifica, atualiza board
import { query } from "@anthropic-ai/claude-agent-sdk";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

interface Triage {
  pr_number: number;
  priority: "P0" | "P1" | "P2" | "P3";
  category: "bug" | "feature" | "chore" | "security";
  estimated_review_minutes: number;
  blockers: string[];
}

async function triagePR(owner: string, repo: string, pr: number): Promise<Triage> {
  const { data: prData } = await octokit.rest.pulls.get({ owner, repo, pull_number: pr });
  const diff = await octokit.rest.pulls.get({
    owner, repo, pull_number: pr,
    mediaType: { format: "diff" },
  });

  let result = "";
  for await (const message of query({
    prompt: \`Classifique este PR em JSON strict (sem markdown fences):
{
  "priority": "P0|P1|P2|P3",
  "category": "bug|feature|chore|security",
  "estimated_review_minutes": <number>,
  "blockers": ["lista de bloqueadores detectados"]
}

PR: \${prData.title}
Descrição: \${prData.body ?? ""}
Diff:
\${diff.data}
\`,
    options: {
      model: "claude-haiku-4-5",  // rápido + barato para triage
      allowedTools: [],
      maxTurns: 1,
      jsonSchema: {
        type: "object",
        properties: {
          priority: { type: "string", enum: ["P0", "P1", "P2", "P3"] },
          category: { type: "string" },
          estimated_review_minutes: { type: "number" },
          blockers: { type: "array", items: { type: "string" } },
        },
        required: ["priority", "category", "estimated_review_minutes", "blockers"],
      },
    },
  })) {
    if (message.type === "text") result += message.text;
  }

  return { pr_number: pr, ...JSON.parse(result) };
}

async function main() {
  const owner = "empresa";
  const repo = "backend";
  const prs = await octokit.rest.pulls.list({ owner, repo, state: "open" });

  const triages = await Promise.all(
    prs.data.map(pr => triagePR(owner, repo, pr.number))
  );

  // Atualiza labels no GitHub baseado na triagem
  for (const t of triages) {
    await octokit.rest.issues.setLabels({
      owner, repo, issue_number: t.pr_number,
      labels: [\`priority/\${t.priority}\`, \`category/\${t.category}\`],
    });
  }

  // Notifica Slack com sumário
  const summary = triages
    .filter(t => t.priority === "P0" || t.priority === "P1")
    .map(t => \`• PR #\${t.pr_number} (\${t.priority}): \${t.estimated_review_minutes}min\`)
    .join("\\n");

  if (summary) {
    await fetch(process.env.SLACK_WEBHOOK!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: \`🚨 PRs prioritários:\\n\${summary}\` }),
    });
  }
}

main().catch(console.error);`}</CodeBlock>
      </Section>

      <Section accent={accent} title="SDK vs CLI: decisão final">
        <ComparisonTable
          headers={['Caso', 'Use SDK', 'Use CLI']}
          rows={[
            ['Embutir Claude em backend/app', 'Sim', '—'],
            ['CI/CD com controle granular', 'Sim', 'Parcial com -p'],
            ['Custom tools em Python/TS nativo', 'Sim', 'Só via MCP'],
            ['Hooks como callbacks tipados', 'Sim', 'Apenas shell/http/prompt'],
            ['Uso interativo de dev', '—', 'Sim'],
            ['Scripts one-off', 'Possível', 'Sim (-p)'],
            ['Exploração de codebase', '—', 'Sim'],
            ['Desktop/web agent', 'Sim', '—'],
            ['Testes automatizados de agent', 'Sim', 'Difícil'],
            ['Time-sensitive automação', 'Sim', 'Parcial'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Você completou a trilha de Harness Engineering.</strong> Os 7 eixos — system prompt, permissions, skills, hooks, subagents, plugins, SDK — compõem a disciplina. O que começou como &ldquo;usar Claude Code no terminal&rdquo; agora é &ldquo;engenheirar um agente customizado, versionado, distribuível, embedável, testável&rdquo;. Você tem o vocabulário, os padrões, os scripts. O próximo passo não é ler mais — é implementar. Escolha UM ponto do harness do seu projeto atual e invista 2 horas nele. Repita toda semana. Em 3 meses, o agente será indistinguível de um membro sênior do time.
      </Callout>

      <Callout>
        <strong>Fim da trilha.</strong> Próximo passo prático: rode <code>/team-onboarding</code> no seu projeto para gerar um guia do harness atual, identifique 1-2 gaps (skills que faltam, hooks que não existem), e implemente. Construa o harness que você quer herdar no próximo projeto.
      </Callout>
    </div>
  );
}
