import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('mcp-fundamentos');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre MCP Tools e MCP Resources?',
    options: [
      'Tools e Resources são sinônimos — a escolha é apenas questão de estilo de API',
      'Tools são funções que Claude invoca para executar ações ou buscar dados dinâmicos (com efeitos colaterais possíveis). Resources são dados estáticos ou semi-estáticos que Claude pode ler como contexto — similar a arquivos. Tools têm argumentos; Resources têm URIs.',
      'Resources são mais seguros que Tools — Resources nunca têm efeitos colaterais por definição',
      'Tools são para desenvolvedores; Resources são para usuários finais — é uma distinção de audiência',
    ],
    correct: 1,
    explanation: 'A distinção é semântica e importante para decidir qual usar. Tools são chamadas de função: Claude invoca `search_database(query="...")` e recebe um resultado — pode ter side effects, é dinâmico. Resources são URIs que Claude pode "ler": `file:///docs/readme.md` ou `db://users/schema` — são dados contextuais, não ações. Hosts como Claude Code usam Resources para carregar contexto sem consumir tokens de ferramenta. Use Tool quando Claude precisa agir; use Resource quando Claude precisa ler.',
  },
  {
    question: 'Por que MCP usa stdio (stdin/stdout) como transporte padrão em vez de HTTP?',
    options: [
      'HTTP seria mais lento — stdio tem latência zero por ser in-process',
      'stdio permite que o servidor MCP rode como processo filho gerenciado pelo host. O host inicia o processo, se comunica via stdin/stdout, e pode matá-lo quando não precisar mais — sem portas abertas, sem gerenciamento de rede, sem autenticação HTTP. É o transporte mais simples para integrações locais.',
      'HTTP não é suportado pelo protocolo MCP — stdio é o único transporte válido',
      'stdio é necessário porque MCP usa JSON binário que HTTP não consegue transportar',
    ],
    correct: 1,
    explanation: 'stdio como transporte padrão para MCP local é uma decisão de simplicidade operacional. O host (Claude Code, Claude Desktop) inicia o servidor MCP como subprocesso — sem configurar portas, sem abrir firewall, sem gerenciar credenciais HTTP. A comunicação é JSON-RPC sobre stdin/stdout: host escreve no stdin do servidor, lê resposta do stdout. Isso funciona em qualquer OS, sem permissões especiais, e o servidor morre automaticamente quando o host encerra. Para integrações remotas, MCP suporta SSE (Server-Sent Events) sobre HTTP — mas a maioria dos servidores locais usa stdio.',
  },
  {
    question: 'Claude Code está conectado ao seu servidor MCP, mas Claude não está usando as tools disponíveis mesmo quando seria útil. Qual é a causa mais provável?',
    options: [
      'Claude Code tem um bug — tools de MCP nunca funcionam corretamente',
      'A descrição da tool está vaga ou genérica demais. Claude decide usar tools baseado na descrição — se ela não comunica claramente quando e por que usar, Claude não infere o caso de uso correto. Descriptions precisas com casos de uso explícitos são o fator mais crítico para adoção de tools.',
      'O servidor MCP está retornando respostas em formato errado — Claude ignora tools com JSON malformado',
      'Claude só usa tools de MCP quando o usuário menciona explicitamente o nome da tool na mensagem',
    ],
    correct: 1,
    explanation: 'A qualidade da description da tool é o fator mais crítico para Claude usar ou não a tool. Claude lê as descriptions e decide se a tool é relevante para o contexto atual. Uma description vaga como "busca dados" faz Claude não saber quando usar. Uma description precisa como "Busca informações do cliente por ID. Use quando o usuário mencionar número de pedido, CPF ou email de um cliente específico. Retorna histórico de compras e dados de contato." faz Claude usar corretamente. Invista em descriptions que descrevem o caso de uso, não apenas o que a tool faz tecnicamente.',
  },
];

export default function McpFundamentosPage() {
  return (
    <ModuleLayout
      slug="mcp-fundamentos"
      title="MCP Fundamentos: tools, resources e prompts do protocolo"
      icon="🔌"
      xp={75}
      readTime={15}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="mcp-avancado"
      nextTitle="MCP Avançado: construindo servidores profissionais"
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
        Model Context Protocol (MCP) é o padrão aberto da Anthropic para conectar Claude a qualquer ferramenta, banco de dados ou serviço externo. Em vez de escrever integrações customizadas para cada sistema, você implementa um servidor MCP uma vez — e qualquer host compatível (Claude Code, Claude Desktop, sua aplicação) consegue se conectar.
      </p>

      <Section accent={accent} title="Arquitetura do MCP">
        <ComparisonTable
          headers={['Componente', 'Papel', 'Exemplos']}
          rows={[
            ['Host', 'Aplicação que incorpora Claude e gerencia conexões MCP', 'Claude Code, Claude Desktop, seu app'],
            ['Client', 'Gerencia a conexão com um servidor MCP específico (1:1)', 'Embutido no host'],
            ['Server', 'Expõe tools, resources e prompts via protocolo MCP', 'Servidor GitHub MCP, servidor de banco de dados'],
            ['Transport', 'Como host e servidor se comunicam', 'stdio (local), SSE sobre HTTP (remoto)'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# O fluxo completo de uma chamada MCP:

# 1. Host inicializa o servidor MCP (como subprocesso ou via SSE)
# 2. Claude recebe a lista de tools/resources disponíveis no contexto
# 3. Durante a conversa, Claude decide usar uma tool

# Mensagem do host para o servidor MCP (JSON-RPC 2.0):
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_github_issues",
    "arguments": {
      "repo": "anthropics/claude-code",
      "query": "MCP timeout",
      "state": "open"
    }
  }
}

# Resposta do servidor MCP para o host:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"number\": 142, \"title\": \"MCP server timeout after 30s...\"}]"
      }
    ]
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Os 3 primitivos do MCP">
        <CodeBlock>{`# MCP tem 3 primitivos que servidores podem expor:

# ─── 1. TOOLS ────────────────────────────────────────────
# Funções que Claude chama — dinâmicas, podem ter side effects
# Claude decide quando chamar baseado na description

{
  "name": "criar_issue_github",
  "description": "Cria uma nova issue no repositório GitHub especificado.
                  Use quando o usuário pedir para criar, abrir ou registrar
                  um bug, feature request ou tarefa no GitHub.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repositório no formato owner/repo (ex: anthropics/claude)"
      },
      "title": {"type": "string", "description": "Título da issue"},
      "body": {"type": "string", "description": "Descrição detalhada em Markdown"},
      "labels": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Labels para aplicar (ex: ['bug', 'priority:high'])"
      }
    },
    "required": ["repo", "title", "body"]
  }
}

# ─── 2. RESOURCES ─────────────────────────────────────────
# Dados que Claude pode ler como contexto — URI addressable
# Não têm argumentos — Claude faz "get" pelo URI

{
  "uri": "github://anthropics/claude/readme",
  "name": "README do repositório Claude",
  "description": "Conteúdo atual do README.md do repositório principal",
  "mimeType": "text/markdown"
}

# Resource com template (URI dinâmico):
{
  "uriTemplate": "github://{owner}/{repo}/issues/{issue_number}",
  "name": "Detalhes de issue do GitHub",
  "description": "Lê o conteúdo completo de uma issue específica incluindo comentários"
}

# ─── 3. PROMPTS ───────────────────────────────────────────
# Templates de prompt reutilizáveis — Claude os invoca como comandos
# Aparecem como slash commands no Claude Desktop e similares

{
  "name": "code_review",
  "description": "Inicia um code review estruturado do diff atual",
  "arguments": [
    {"name": "focus", "description": "Área de foco: security|performance|style|all", "required": false}
  ]
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Construindo seu primeiro servidor MCP">
        <CodeBlock>{`# Servidor MCP mínimo com Python (usando mcp library):
# pip install mcp

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
import asyncio, json

app = Server("meu-servidor-mcp")

# ─── Definir as tools disponíveis ────────────────────────
@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="buscar_produto",
            description="""Busca um produto pelo ID ou nome parcial no catálogo.
                          Use quando o usuário mencionar um produto específico,
                          pedir preço, verificar estoque ou obter detalhes de item.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "ID do produto (ex: PROD-123) ou nome parcial"
                    },
                    "tipo": {
                        "type": "string",
                        "enum": ["id", "nome"],
                        "description": "Tipo de busca: 'id' para código exato, 'nome' para busca textual"
                    }
                },
                "required": ["query", "tipo"]
            }
        )
    ]

# ─── Implementar a lógica da tool ─────────────────────────
@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "buscar_produto":
        query = arguments["query"]
        tipo = arguments["tipo"]

        # Sua lógica de negócio aqui:
        resultado = buscar_no_banco(query, tipo)  # função sua

        if not resultado:
            return [types.TextContent(
                type="text",
                text=json.dumps({"erro": f"Produto '{query}' não encontrado"})
            )]

        return [types.TextContent(
            type="text",
            text=json.dumps(resultado)
        )]

    raise ValueError(f"Tool desconhecida: {name}")

# ─── Iniciar o servidor via stdio ─────────────────────────
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Configurando o servidor no Claude Code">
        <CodeBlock>{`# .claude/mcp.json — configuração dos servidores MCP do projeto

{
  "mcpServers": {
    "meu-servidor": {
      "command": "python",
      "args": ["mcp_server/main.py"],
      "env": {
        "DATABASE_URL": "\${DATABASE_URL}",
        "API_KEY": "\${MINHA_API_KEY}"
      }
    },

    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    },

    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "\${DATABASE_URL}"
      }
    }
  }
}

# Variáveis de ambiente: nunca commite segredos no mcp.json.
# Use \${VAR_NAME} — o host substitui pelo valor do ambiente.
# Adicione mcp.json ao .gitignore se contiver caminhos sensíveis.

# Verificar conexão no Claude Code:
claude
> "Liste as tools disponíveis"
# Claude vai listar todas as tools dos servidores conectados

# Verificar recursos:
> "Quais resources estão disponíveis neste servidor?"

# Depurar problemas de conexão:
# Claude Code mostra erros de inicialização de MCP no início da sessão`}</CodeBlock>
        <ComparisonTable
          headers={['Cenário', 'Use Tool', 'Use Resource']}
          rows={[
            ['Buscar dados por parâmetro', '✅ Tool com argumentos', '—'],
            ['Ler documentação estática', '—', '✅ Resource com URI fixo'],
            ['Executar ação com side effect', '✅ Tool', '—'],
            ['Carregar schema do banco', '—', '✅ Resource (semi-estático)'],
            ['Pesquisa full-text dinâmica', '✅ Tool com query arg', '—'],
            ['Conteúdo de arquivo específico', '—', '✅ Resource com URI template'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>MCP é a camada de integração universal do ecossistema Claude.</strong> Um servidor MCP bem construído pode ser conectado ao Claude Code, Claude Desktop e qualquer aplicação que implemente o protocolo — sem reescrever a integração. Invista em descriptions precisas: são o que faz Claude saber quando e como usar suas tools.
      </Callout>

      <Callout>
        Próximo: <strong>MCP Avançado</strong> — autenticação, sampling, recursos dinâmicos, error handling robusto e deploy de servidores MCP em produção.
      </Callout>
    </div>
  );
}
