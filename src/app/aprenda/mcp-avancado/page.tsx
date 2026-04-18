import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('mcp-avancado');

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "sampling" no contexto do MCP e por que servidores MCP precisam dele?',
    options: [
      'Sampling é a capacidade do servidor MCP de chamar a API da Anthropic diretamente sem autenticação',
      'Sampling permite que o servidor MCP peça ao host para fazer uma chamada LLM em nome do servidor. O servidor envia o prompt, o host faz a chamada com suas credenciais, e retorna o resultado. Isso permite que servidores MCP usem inteligência do modelo sem precisar de suas próprias chaves de API.',
      'Sampling é o mecanismo de rate limiting do protocolo MCP — limita quantas chamadas um servidor pode fazer',
      'Sampling é opcional e apenas para debug — servidores de produção nunca usam',
    ],
    correct: 1,
    explanation: 'Sampling é uma capacidade poderosa do MCP: o servidor pode solicitar ao host (Claude Code, Claude Desktop) que faça uma chamada LLM com um prompt específico. O host tem as credenciais da API, o servidor não precisa ter. Isso permite casos como: um servidor de análise de código que quer usar o modelo para sumarizar um diff antes de retornar o resultado. O fluxo: servidor envia `sampling/createMessage` → host faz a chamada com suas credenciais → retorna resultado ao servidor → servidor usa no seu output para Claude. É Claude chamando Claude via MCP.',
  },
  {
    question: 'Você está construindo um servidor MCP que acessa dados sensíveis de clientes. Qual é a melhor prática de autenticação?',
    options: [
      'Hardcode as credenciais no código do servidor — é mais simples e o servidor roda localmente mesmo',
      'Use variáveis de ambiente para credenciais, implemente validação de token no servidor, defina escopos mínimos necessários, e audite cada chamada de tool que acessa dados sensíveis. Nunca confie que o Claude não vai pedir algo inesperado.',
      'Coloque as credenciais no mcp.json do projeto — é o lugar padrão para configuração',
      'Autenticação não é necessária em servidores MCP locais — o transporte stdio já é seguro por ser local',
    ],
    correct: 1,
    explanation: 'Segurança em servidores MCP que acessam dados sensíveis requer múltiplas camadas: (1) credenciais em variáveis de ambiente, nunca no código ou mcp.json commitado; (2) validação que cada tool só acessa o que ela deve acessar — não confie nos argumentos sem validar; (3) logging de audit para cada chamada que acessa dados sensíveis; (4) escopos mínimos — se a tool só precisa ler, não dê permissão de escrita; (5) rate limiting interno para evitar uso abusivo. O fato de rodar localmente via stdio não significa que é automaticamente seguro — um prompt injection pode fazer Claude chamar tools com argumentos maliciosos.',
  },
  {
    question: 'Qual é o padrão correto para retornar erros em servidores MCP?',
    options: [
      'Lance uma exceção Python/JS — o protocolo MCP captura e converte automaticamente para o formato correto',
      'Retorne um resultado com isError: true e o conteúdo do erro. Erros de negócio (não encontrado, permissão negada) devem retornar isError: true com mensagem útil. Apenas erros de protocolo devem resultar em exceção JSON-RPC.',
      'Retorne um resultado vazio — Claude infere o erro pelo conteúdo vazio',
      'Retorne uma string com prefixo "ERROR:" — Claude detecta e trata como erro automaticamente',
    ],
    correct: 1,
    explanation: 'A distinção entre erros de protocolo e erros de negócio é fundamental em MCP. Erros de protocolo (método inválido, argumentos malformados) devem resultar em erro JSON-RPC (usando o mecanismo de erro do protocolo). Erros de negócio (produto não encontrado, rate limit atingido, permissão negada) devem retornar um resultado bem-sucedido do protocolo, mas com `isError: true` no conteúdo — porque Claude precisa ler o erro e agir sobre ele. Claude usa o conteúdo de isError: true para adaptar sua resposta, tentar alternativas ou informar o usuário. Uma exceção não tratada interrompe o protocolo e Claude não consegue se recuperar.',
  },
];

export default function McpAvancadoPage() {
  return (
    <ModuleLayout
      slug="mcp-avancado"
      title="MCP Avançado: construindo servidores profissionais"
      icon="⚙️"
      xp={85}
      readTime={17}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="claude-rag-agentic-search"
      nextTitle="RAG Agêntico: busca híbrida, reranking e pipelines de retrieval"
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
        Um servidor MCP de produção vai além de expor tools. Ele lida com autenticação, auditoria, erros de forma resiliente, usa sampling para inteligência interna, e expõe resources dinâmicos. Neste módulo, construímos um servidor completo com os padrões que aparecem em integrações profissionais.
      </p>

      <Section accent={accent} title="Error handling robusto">
        <CodeBlock>{`# Padrão de error handling para tools MCP em produção:

from mcp.server import Server
from mcp import types
import logging, traceback

logger = logging.getLogger(__name__)
app = Server("servidor-producao")

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        if name == "buscar_cliente":
            return await _buscar_cliente(arguments)
        raise ValueError(f"Tool desconhecida: {name}")

    except ClienteNaoEncontradoError as e:
        # Erro de negócio — Claude pode tentar alternativa
        logger.info(f"Cliente não encontrado: {arguments}")
        return [types.TextContent(
            type="text",
            text=json.dumps({
                "erro": "cliente_nao_encontrado",
                "mensagem": str(e),
                "sugestao": "Tente buscar por CPF ou email em vez de nome"
            }),
            isError=True  # ← Claude recebe e adapta sua resposta
        )]

    except PermissaoNegadaError as e:
        # Erro de autorização — deve ser informado ao usuário
        logger.warning(f"Acesso negado: {name} com {arguments}")
        return [types.TextContent(
            type="text",
            text=json.dumps({
                "erro": "permissao_negada",
                "recurso": str(e),
                "acao": "Solicite ao administrador acesso ao recurso"
            }),
            isError=True
        )]

    except Exception as e:
        # Erro inesperado — log completo interno, mensagem genérica ao Claude
        logger.error(
            f"Erro inesperado em tool '{name}'",
            extra={"arguments": arguments, "error": str(e)},
            exc_info=True
        )
        return [types.TextContent(
            type="text",
            text=json.dumps({
                "erro": "erro_interno",
                "mensagem": "Erro interno ao processar a solicitação. Tente novamente."
            }),
            isError=True
        )]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Resources dinâmicos">
        <CodeBlock>{`# Resources estáticos vs dinâmicos:

# ─── Resources estáticos (lista fixa) ────────────────────
@app.list_resources()
async def list_resources() -> list[types.Resource]:
    return [
        types.Resource(
            uri="config://database/schema",
            name="Schema do banco de dados",
            description="Estrutura completa das tabelas e relacionamentos",
            mimeType="application/json"
        ),
        types.Resource(
            uri="docs://api/reference",
            name="Referência da API interna",
            description="Documentação dos endpoints internos",
            mimeType="text/markdown"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    if uri == "config://database/schema":
        return json.dumps(get_db_schema())  # função sua
    if uri == "docs://api/reference":
        return pathlib.Path("docs/api.md").read_text()
    raise ValueError(f"Resource desconhecido: {uri}")

# ─── Resource templates (URI dinâmico) ────────────────────
# Para expor coleções de dados addressable por ID:

@app.list_resource_templates()
async def list_resource_templates() -> list[types.ResourceTemplate]:
    return [
        types.ResourceTemplate(
            uriTemplate="cliente://{cliente_id}/historico",
            name="Histórico de compras do cliente",
            description="Lê o histórico completo de pedidos de um cliente específico. "
                        "Use {cliente_id} como o ID do cliente (ex: cliente://C001/historico)",
            mimeType="application/json"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    # Processa tanto URIs fixos quanto de templates
    if uri.startswith("cliente://") and uri.endswith("/historico"):
        cliente_id = uri.replace("cliente://", "").replace("/historico", "")
        historico = get_historico_cliente(cliente_id)  # função sua
        return json.dumps(historico)
    # ... outros casos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Sampling: Claude dentro do seu servidor">
        <CodeBlock>{`# Sampling permite que o servidor peça ao host para chamar o LLM
# Caso de uso: usar Claude para processar/sumarizar antes de retornar

from mcp.server import Server
from mcp.types import SamplingMessage, TextContent

app = Server("servidor-com-sampling")

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "analisar_log":
        # 1. Busca os logs brutos
        logs_brutos = get_logs(arguments["periodo"])  # pode ser 10MB de logs

        # 2. Usa sampling para pedir ao host que Claude sumarize
        # O host tem as credenciais de API — o servidor não precisa ter
        summary_response = await app.request_context.session.create_message(
            messages=[
                SamplingMessage(
                    role="user",
                    content=TextContent(
                        type="text",
                        text=f"""Analise estes logs e retorne:
1. Top 5 erros por frequência com contagem
2. Padrão de horário com mais erros (hora do dia)
3. Serviços mais afetados

LOGS:
{logs_brutos[:50000]}  # limita para caber no contexto"""
                    )
                )
            ],
            max_tokens=1000,
            system="Você é um analisador de logs. Responda em JSON estruturado."
        )

        # 3. Retorna o sumário — não os 10MB de logs brutos
        return [TextContent(
            type="text",
            text=summary_response.content.text
        )]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Autenticação e segurança">
        <CodeBlock>{`# Padrão de autenticação para servidores MCP que acessam dados sensíveis:

import os, hmac, hashlib
from functools import wraps

# ─── 1. Credenciais via env vars ──────────────────────────
# Nunca hardcode. O mcp.json passa via env:
# "env": {"DATABASE_URL": "\${DATABASE_URL}", "API_KEY": "\${MY_API_KEY}"}

DATABASE_URL = os.environ["DATABASE_URL"]
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]

# ─── 2. Validação de argumentos (não confie no input) ─────
def validar_cliente_id(cliente_id: str) -> bool:
    """IDs de cliente sempre são alfanuméricos, 6-20 chars."""
    return bool(re.match(r'^[A-Z0-9]{6,20}$', cliente_id))

async def _buscar_cliente(arguments: dict) -> list:
    cliente_id = arguments.get("cliente_id", "")

    if not validar_cliente_id(cliente_id):
        return [TextContent(
            type="text",
            text=json.dumps({"erro": "ID de cliente inválido", "recebido": cliente_id}),
            isError=True
        )]

    # Agora é seguro usar o ID
    cliente = await db.buscar(cliente_id)
    return [TextContent(type="text", text=json.dumps(cliente))]

# ─── 3. Audit logging ─────────────────────────────────────
import structlog

audit_log = structlog.get_logger("mcp.audit")

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list:
    # Log toda chamada de tool com dados sensíveis
    audit_log.info(
        "tool_called",
        tool=name,
        # Redact dados sensíveis antes de logar
        args_redacted={k: "***" if k in ("senha", "token", "cpf") else v
                       for k, v in arguments.items()}
    )
    # ... resto da lógica

# ─── 4. Rate limiting por sessão ──────────────────────────
from collections import defaultdict
import time

_call_counts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 50  # chamadas por minuto por sessão

def check_rate_limit(session_id: str) -> bool:
    now = time.time()
    # Remove chamadas > 60s atrás
    _call_counts[session_id] = [t for t in _call_counts[session_id] if now - t < 60]
    if len(_call_counts[session_id]) >= RATE_LIMIT:
        return False
    _call_counts[session_id].append(now)
    return True`}</CodeBlock>
        <ComparisonTable
          headers={['Aspecto', 'Servidor básico', 'Servidor produção']}
          rows={[
            ['Credenciais', 'Hardcoded ou no código', 'Env vars, nunca no código'],
            ['Validação', 'Confia nos argumentos do Claude', 'Valida todos os inputs antes de usar'],
            ['Erros', 'Exceção não tratada', 'isError: true com mensagem contextual'],
            ['Logging', 'print() ou sem log', 'Structured logging com audit trail'],
            ['Rate limiting', 'Sem limite', 'Limite por sessão/tool para evitar abuso'],
            ['Secrets', 'Em mcp.json (commitado?)', 'Em env vars, mcp.json no .gitignore'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Deploy e distribuição">
        <CodeBlock>{`# Opções de deploy para servidores MCP:

# ─── 1. Local via stdio (mais comum para dev) ──────────────
# .claude/mcp.json:
{
  "mcpServers": {
    "meu-servidor": {
      "command": "python",
      "args": ["mcp_server/main.py"]
    }
  }
}

# ─── 2. Remote via SSE (para times, SaaS) ─────────────────
# O servidor roda como serviço HTTP com SSE endpoint
# mcp.json para servidor remoto:
{
  "mcpServers": {
    "meu-servidor-remoto": {
      "url": "https://meu-servidor.empresa.com/mcp",
      "headers": {
        "Authorization": "Bearer \${MCP_TOKEN}"
      }
    }
  }
}

# Servidor SSE com FastAPI:
from fastapi import FastAPI
from mcp.server.sse import SseServerTransport

app_web = FastAPI()
mcp_app = Server("meu-servidor")
sse = SseServerTransport("/messages/")

@app_web.get("/sse")
async def sse_endpoint(request: Request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await mcp_app.run(streams[0], streams[1], mcp_app.create_initialization_options())

# ─── 3. npx para servidores Node.js (distribuição fácil) ───
# O usuário configura assim sem instalar nada:
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
# npx baixa e roda automaticamente — zero instalação manual`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Um servidor MCP profissional é um microsserviço do seu ecossistema de IA.</strong> Com error handling correto, autenticação, audit logging e rate limiting, você pode expor dados e ações sensíveis para Claude com confiança — sabendo que cada chamada é validada, rastreada e limitada. Esse é o padrão que permite escalar de protótipo para produção.
      </Callout>

      <Callout>
        Próximo: <strong>RAG Agêntico</strong> — como Claude usa retrieval como uma ferramenta, combinando busca híbrida, reranking e pipelines adaptativos para responder perguntas sobre grandes corpora de documentos.
      </Callout>
    </div>
  );
}
