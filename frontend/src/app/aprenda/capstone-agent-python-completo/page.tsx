import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-agent-python-completo');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar Pydantic pra entrada/saída de tools do agente?',
    options: [
      'Frescura',
      'Validação automática + schema JSON gerado pro LLM descobrir tools + type safety no código. Elimina classes de bugs onde o agente retorna shape inválido e quebra o loop',
      'Só pra documentação',
      'Substitui asyncio',
    ],
    correct: 1,
    explanation: 'Agent SDKs (Claude, OpenAI) consomem JSON schema de tools. Pydantic model.model_json_schema() dá isso de graça. Input do LLM é validado via model_validate. Saídas idem. Se LLM halucina campo, Pydantic rejeita com erro que agente processa e retry.',
  },
  {
    question: 'O que "agentic loop" típico faz?',
    options: [
      'Só responde sem usar tools',
      'LLM recebe input + tools disponíveis → decide se chamar tool ou responder → se tool, executa e feed result → LLM processa → repete até tarefa completa OU max steps',
      'Chamada única',
      'Faz streaming só',
    ],
    correct: 1,
    explanation: 'Agentic loop = LLM toma decisões iterativas. Cada turno: (1) pensa, (2) opcionalmente chama tool, (3) recebe resultado, (4) próximo turno. Anthropic Claude SDK, OpenAI tools, LangChain — todos implementam esse loop. Guardrails: max_steps, timeout, reflection, critic.',
  },
  {
    question: 'Como observar agent em produção?',
    options: [
      'Logs grep',
      'Tracing estruturado — cada turno do loop vira span. Langfuse, Langsmith, OpenTelemetry GenAI spans. Correlaciona turn ID, token counts, latency, cost. Sem isso, debug agent é arqueologia',
      'Só dashboard grafana',
      'Impossível',
    ],
    correct: 1,
    explanation: 'Observability de agent é requisito, não luxo. Cada tool call, cada prompt, cada response em spans com atributos (model, tokens in/out, cost, tool name). Langfuse é open source excelente. OpenTelemetry GenAI semantic conventions (2024) padronizam atributos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-agent-python-completo"
      title="Capstone: agent Python completo com Claude SDK"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="Python para Engenheiros"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto: triage assistant" accent={accent}>
        <p>
          Agente que recebe texto livre de cliente (bug report, feature request, dúvida), classifica (bug/feature/question), cria ticket em Linear, notifica Slack, retorna resumo. Aplicação de <strong>tudo</strong> da trilha Python.
        </p>
      </Section>

      <Section title="Stack" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><InlineCode>uv</InlineCode> + <InlineCode>pyproject.toml</InlineCode></li>
          <li><InlineCode>pydantic</InlineCode> v2 (schemas)</li>
          <li><InlineCode>fastapi</InlineCode> (endpoint)</li>
          <li><InlineCode>anthropic</InlineCode> SDK + agent loop</li>
          <li><InlineCode>httpx</InlineCode> pra Linear/Slack</li>
          <li><InlineCode>langfuse</InlineCode> pra tracing</li>
          <li><InlineCode>pytest-asyncio</InlineCode> pra testes</li>
          <li><InlineCode>ruff</InlineCode> + <InlineCode>mypy strict</InlineCode></li>
        </ul>
      </Section>

      <Section title="Código (esqueleto)" accent={accent}>
        <CodeBlock lang="python">{`# src/schemas.py
from pydantic import BaseModel, Field
from typing import Literal

class TriageInput(BaseModel):
    text: str = Field(min_length=10, max_length=5000)
    client_id: str

class TicketCategory(BaseModel):
    kind: Literal["bug", "feature", "question"]
    priority: Literal["low", "med", "high"]
    summary: str = Field(max_length=200)

# src/tools.py
from anthropic import Anthropic

async def create_linear_ticket(title: str, description: str, team: str) -> str:
    """Cria ticket no Linear e retorna url."""
    ...

async def notify_slack(channel: str, text: str) -> None:
    """Envia mensagem no Slack."""
    ...

TOOLS = [
    {
        "name": "create_linear_ticket",
        "description": "Create a Linear issue...",
        "input_schema": TicketInput.model_json_schema(),
    },
    {
        "name": "notify_slack",
        "description": "Send Slack message...",
        "input_schema": SlackInput.model_json_schema(),
    },
]

# src/agent.py
async def run_agent(input: TriageInput) -> TicketCategory:
    client = Anthropic()
    messages = [{"role": "user", "content": input.text}]
    for _ in range(5):  # max_steps
        resp = client.messages.create(
            model="claude-sonnet-4",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )
        if resp.stop_reason == "tool_use":
            for block in resp.content:
                if block.type == "tool_use":
                    result = await execute_tool(block.name, block.input)
                    messages.append({"role": "assistant", "content": resp.content})
                    messages.append({
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }],
                    })
            continue
        # Final answer
        return TicketCategory.model_validate_json(resp.content[0].text)
    raise Exception("max steps reached")

# src/main.py
from fastapi import FastAPI

app = FastAPI()

@app.post("/triage")
async def triage(input: TriageInput) -> TicketCategory:
    return await run_agent(input)`}</CodeBlock>
      </Section>

      <Section title="Observability" accent={accent}>
        <CodeBlock lang="python">{`from langfuse.decorators import observe

@observe(name="triage_agent")
async def run_agent(input: TriageInput) -> TicketCategory:
    # cada API call é span-automático
    ...

# Langfuse UI mostra:
# - trace por request
# - cada turn do loop como span
# - tool calls com input/output
# - latency, tokens, cost`}</CodeBlock>
      </Section>

      <Section title="Testes" accent={accent}>
        <CodeBlock lang="python">{`# Mock do LLM — VCR ou Anthropic replay
import pytest
from unittest.mock import patch

@pytest.mark.asyncio
async def test_agent_classifies_bug():
    with patch("src.agent.Anthropic") as mock:
        mock.return_value.messages.create.return_value = ...  # canned response
        result = await run_agent(TriageInput(text="app crasha ao abrir", client_id="c1"))
        assert result.kind == "bug"`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Este capstone exercita a trilha inteira. Ao terminar, você tem um agent FUNCIONAL em produção — type-safe, observado, testado. Esse é o nível que um engenheiro de IA sério entrega.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
