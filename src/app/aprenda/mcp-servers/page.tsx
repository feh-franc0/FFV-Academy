import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('mcp-servers');

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que MCP (Model Context Protocol) resolve?',
    options: [
      'É só um SDK da Anthropic',
      'Padroniza como agents LLM acessam ferramentas, dados e prompts externos. Em vez de cada app criar sua integração custom, o MCP define um protocolo (JSON-RPC sobre stdio ou HTTP/SSE) que qualquer agent-host pode falar com qualquer MCP server. Reuso de integrações entre Claude Desktop, Cursor, IDEs, CI etc.',
      'É um embedding model',
      'É uma alternativa ao OpenAPI',
    ],
    correct: 1,
    explanation:
      'Antes do MCP, cada app implementava tool calling do zero. MCP (Anthropic, nov/2024, e depois adotado por OpenAI, Google e outros) é o "USB-C" dos agents: um servidor MCP expõe tools/resources/prompts; qualquer host compatível consome. Isso criou um marketplace de integrações (GitHub, Slack, Postgres, Linear) que agents plugam e usam.',
  },
  {
    question: 'Qual a diferença entre tools, resources e prompts no MCP?',
    options: [
      'São sinônimos',
      'Tools são funções que o modelo decide chamar (ex: run_sql). Resources são dados legíveis expostos ao host/usuário para inclusão no contexto (ex: arquivos, linhas de DB). Prompts são templates parametrizados que o usuário invoca explicitamente (ex: "/refactor-api"). Separação por quem decide e quando entra no contexto',
      'Só tools importam',
      'Resources é para imagens',
    ],
    correct: 1,
    explanation:
      'Essa separação é a sacada do MCP: o modelo não deveria ter acesso irrestrito a tudo. Tools são controladas pelo modelo (com aprovação do host). Resources são escolhidos pelo usuário/host (ex: "anexe este arquivo à conversa"). Prompts são invocados pelo usuário como atalho (ex: slash commands). Cada um tem permissioning e UX próprios.',
  },
  {
    question: 'Quando usar transport stdio vs HTTP/SSE em MCP server?',
    options: [
      'Qualquer um serve',
      'stdio: servidor roda local como subprocess do host (IDE, desktop app). Simples, zero infra, segurança via filesystem/process. HTTP/SSE: servidor remoto acessível por rede. Exige auth, TLS, rate limit. Regra: local/pessoal → stdio; compartilhado/SaaS → HTTP com OAuth',
      'HTTP é sempre melhor',
      'stdio só funciona em Linux',
    ],
    correct: 1,
    explanation:
      'stdio é a origem do MCP: Claude Desktop executa o server como processo filho, troca JSON-RPC por stdin/stdout. Zero configuração, zero rede. HTTP (com SSE para streaming) é o modo servidor compartilhado — permite MCP como serviço, mas exige tratar auth, multi-tenancy, rate limit. Produção SaaS é HTTP; dev/pessoal é stdio.',
  },
  {
    question: 'Qual a boa prática de design de tool em MCP server profissional?',
    options: [
      'Quantas mais tools, melhor',
      'Tools devem ter: nomes verbosos e descritivos, descriptions que explicam quando NÃO usar, schemas estritos (required, enum), respostas estruturadas (não prosa livre) e idempotência quando possível. Tool mal descrita é ignorada pelo modelo ou usada errado. Prefira 5 tools claras a 30 ambíguas',
      'Sempre retorne JSON bruto da API',
      'Tools devem ser curtas no nome',
    ],
    correct: 1,
    explanation:
      'LLMs escolhem tools por name + description + schema. "get_data" é ruim; "search_customer_by_email" é bom. Description deve dizer quando USAR e quando NÃO usar ("Não use para buscar por ID; use get_customer_by_id"). Schema estrito (enum em campos limitados) reduz tool calls inválidos. Idempotência permite retry seguro. Tool design é UX do agent.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mcp-servers"
      title="MCP Deep Dive: construindo um servidor profissional"
      icon="🔌"
      xp={90}
      readTime={19}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="llm-apis-producao"
      nextTitle="LLM APIs em Produção: streaming, structured output, batch e cache"
      relatedSlugs={['claude-code-primeiros-passos','agentes-padroes','claude-code-hooks']}
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
        MCP (Model Context Protocol) é o padrão que transformou "plugar ferramentas em agent" de projeto custom por
        integração em commodity reutilizável. Este módulo mostra a arquitetura, os três primitivos (tools, resources,
        prompts), transports (stdio e HTTP/SSE), auth e um MCP server profissional em TypeScript e Python — incluindo
        rate limit, logging e permissioning.
      </p>

      <Section title="Por que MCP virou padrão" accent={ACCENT}>
        <ArchDiagram title="Antes do MCP: N × M integrações" accent={ACCENT}>{`
     Claude       Cursor      VSCode+Copilot
       │            │               │
    ┌──┴──┐      ┌──┴──┐         ┌──┴──┐
    │ GH  │      │ GH  │         │ GH  │   ← cada host
    │ int │      │ int │         │ int │     reimplementa
    └─────┘      └─────┘         └─────┘     integrações
    ┌─────┐      ┌─────┐         ┌─────┐
    │Slack│      │Slack│         │Slack│
    └─────┘      └─────┘         └─────┘
`}</ArchDiagram>
        <ArchDiagram title="Com MCP: um servidor para muitos hosts" accent={ACCENT}>{`
     Claude   Cursor   VSCode   ChatGPT   IDEs/CI
       └──┬──────┬───────┬────────┬─────────┬───┘
          │ (fala MCP: JSON-RPC stdio ou HTTP/SSE)
          ▼
   ┌────────────────────────────────────────────┐
   │        MCP servers (escolhidos pelo user)  │
   │  github   slack   postgres   linear   fs   │
   └────────────────────────────────────────────┘
`}</ArchDiagram>
        <Callout tone="info">
          MCP criou um marketplace real: servidores oficiais (github, slack, postgres, fetch, filesystem), community
          (linear, sentry, figma), corporativos (acesso privado a sistemas internos). Em 2026, qualquer dev-host
          sério suporta MCP.
        </Callout>
      </Section>

      <Section title="Anatomia: tools, resources, prompts" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Primitivo', 'Quem decide invocar', 'Quando entra no contexto']}
          rows={[
            ['Tool', 'Modelo (com aprovação do host)', 'Quando o modelo decide chamar durante raciocínio'],
            ['Resource', 'Host/usuário', 'Quando usuário anexa ou host auto-inclui (ex: arquivo aberto)'],
            ['Prompt', 'Usuário (comando explícito)', 'Quando usuário invoca via slash ou menu'],
          ]}
        />
        <CodeBlock lang="typescript">{`// MCP server em TypeScript — SDK oficial @modelcontextprotocol/sdk
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "ffv-db-server",
  version: "1.0.0",
});

// --- TOOL: ação com efeito controlado pelo modelo
server.registerTool(
  "search_customer_by_email",
  {
    description:
      "Busca dados públicos do cliente por email EXATO. " +
      "NÃO use para busca aproximada — use search_customer_fuzzy para isso. " +
      "Retorna { id, name, plan, signup_at } ou null.",
    inputSchema: {
      email: z.string().email().describe("Email exato do cliente"),
    },
  },
  async ({ email }) => {
    const row = await db.oneOrNone(
      "SELECT id, name, plan, signup_at FROM customers WHERE email = $1",
      [email.toLowerCase()],
    );
    return {
      content: [{ type: "text", text: JSON.stringify(row) }],
    };
  },
);

// --- RESOURCE: dado legível escolhido pelo host/usuário
server.registerResource(
  "customer-doc",
  new ResourceTemplate("customer://{id}/profile", { list: undefined }),
  {
    title: "Perfil do cliente",
    description: "Documento estruturado com histórico resumido.",
  },
  async (uri, { id }) => ({
    contents: [{
      uri: uri.href,
      text: await getCustomerProfileMarkdown(id),
      mimeType: "text/markdown",
    }],
  }),
);

// --- PROMPT: template invocado pelo usuário (slash command)
server.registerPrompt(
  "summarize-customer",
  {
    title: "Resumir cliente",
    description: "Gera resumo executivo do cliente",
    argsSchema: { id: z.string() },
  },
  ({ id }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text:
          \`Resuma em 200 palavras o cliente \${id}: plano, uso, tickets, sinal de churn.\`,
      },
    }],
  }),
);

await server.connect(new StdioServerTransport());`}</CodeBlock>
      </Section>

      <Section title="Transports: stdio vs HTTP/SSE" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'stdio', 'HTTP / SSE']}
          rows={[
            ['Execução', 'Subprocess do host', 'Serviço remoto'],
            ['Setup para usuário', 'Command + args no config', 'URL + token'],
            ['Segurança', 'Herda processo/FS do host', 'Precisa de TLS + auth'],
            ['Multi-tenancy', 'Não', 'Sim (por token/OAuth)'],
            ['Streaming', 'JSON-RPC sobre stdin/stdout', 'SSE para eventos'],
            ['Caso de uso', 'Dev local, desktop, CLI', 'SaaS, org-wide, cloud'],
          ]}
        />
        <CodeBlock lang="json">{`// ~/.claude/mcp.json — configuração de MCP servers no host
{
  "mcpServers": {
    "ffv-db": {
      "command": "node",
      "args": ["/Users/ferf/ffv-mcp/dist/server.js"],
      "env": { "DATABASE_URL": "postgres://..." }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
    },
    "acme-saas": {
      "url": "https://mcp.acme.com/v1",
      "headers": { "Authorization": "Bearer $ACME_TOKEN" }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="MCP server em Python (stdio)" accent={ACCENT}>
        <CodeBlock lang="python">{`# pip install mcp
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool
import psycopg, os

server = Server("ffv-db-server")
POOL = psycopg.connect(os.environ["DATABASE_URL"])

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_customer_by_email",
            description=(
                "Busca cliente por email EXATO. Não usa match aproximado. "
                "Retorna JSON {id, name, plan, signup_at} ou null."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "email": {"type": "string", "format": "email"},
                },
                "required": ["email"],
            },
        ),
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_customer_by_email":
        email = arguments["email"].lower()
        with POOL.cursor() as cur:
            cur.execute(
                "SELECT id, name, plan, signup_at FROM customers WHERE email=%s",
                (email,),
            )
            row = cur.fetchone()
        payload = None if not row else {
            "id": row[0], "name": row[1], "plan": row[2], "signup_at": str(row[3]),
        }
        import json
        return [TextContent(type="text", text=json.dumps(payload))]
    raise ValueError(f"Tool desconhecida: {name}")

async def main() -> None:
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`}</CodeBlock>
      </Section>

      <Section title="MCP server em HTTP com auth (produção)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para MCP servers expostos via rede, OAuth 2.1 + PKCE é o padrão. O host descobre o servidor, troca token
          por scope, e cada chamada HTTP carrega o Bearer. Rate limit e audit log viram obrigatórios.
        </p>
        <CodeBlock lang="typescript">{`// Server HTTP com Hono + MCP SDK + OAuth 2.1
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

const app = new Hono();

// --- Middleware: auth + rate limit
app.use("/mcp/*", bearerAuth({
  verifyToken: async (token) => {
    const user = await validateJWT(token);
    if (!user) return false;
    c.set("user", user);                // disponível para tools
    return true;
  },
}));
app.use("/mcp/*", rateLimiter({ max: 60, windowMs: 60_000 }));   // 60/min por token

// --- Endpoint MCP
app.post("/mcp/v1", async (c) => {
  const user = c.get("user");
  const server = buildServerForUser(user);      // escopo por user
  const transport = new HttpServerTransport({ request: c.req.raw });
  await server.connect(transport);
  return transport.response;
});

// --- Endpoint OAuth metadata para discovery
app.get("/.well-known/oauth-authorization-server", (c) =>
  c.json({
    issuer: "https://mcp.ffv.com",
    authorization_endpoint: "https://mcp.ffv.com/oauth/authorize",
    token_endpoint: "https://mcp.ffv.com/oauth/token",
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
  }),
);

export default app;`}</CodeBlock>
        <Callout tone="warn">
          MCP HTTP recebeu em 2025 a especificação de auth OAuth 2.1 com PKCE. Qualquer servidor público deve seguir:
          evita token-leak, suporta revogação, e permite org-wide SSO. Evite schemes custom por questão de
          interoperabilidade com hosts diferentes.
        </Callout>
      </Section>

      <Section title="Design de tool: regras que evitam dor" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Regra', 'Por que', 'Exemplo bom']}
          rows={[
            ['Nome verbo_objeto explícito', 'Modelo decide por nome + description', 'search_customer_by_email, não getCustomer'],
            ['Description diz quando NÃO usar', 'Evita tool errada em caso ambíguo', '"Não use para busca fuzzy — use search_customer_fuzzy"'],
            ['Schema estrito', 'Reduz tool calls inválidos', 'enum em status, required em ids'],
            ['Output estruturado (JSON)', 'Reduz parsing errado pelo modelo', 'Retornar { id, name, ... } em vez de prosa'],
            ['Idempotência quando possível', 'Permite retry seguro', 'upsert em vez de insert; read-only nunca muda estado'],
            ['Errors úteis, não stack trace', 'Modelo precisa ler e decidir', '"Email não encontrado. Tente search_customer_fuzzy."'],
            ['Truncar saídas grandes', 'Tool result de 100k tokens destrói contexto', 'Paginação + total_count, ou preview + more=true'],
          ]}
        />
      </Section>

      <Section title="Logging, observability e audit" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          MCP server em produção precisa de audit trail — cada chamada, quem chamou (token/user), argumentos,
          duração e resultado. Para debug e compliance.
        </p>
        <CodeBlock lang="typescript">{`// Middleware de log estruturado para cada tool call
server.setRequestMiddleware(async (req, next) => {
  const start = Date.now();
  const user = req.auth?.user;
  try {
    const res = await next();
    logger.info({
      event: "mcp.tool_call",
      tool: req.params?.name,
      user_id: user?.id,
      duration_ms: Date.now() - start,
      status: "ok",
    });
    return res;
  } catch (err) {
    logger.error({
      event: "mcp.tool_call",
      tool: req.params?.name,
      user_id: user?.id,
      duration_ms: Date.now() - start,
      status: "error",
      error: String(err),
    });
    throw err;
  }
});`}</CodeBlock>
      </Section>

      <Section title="Quando criar MCP server custom (vs usar SDK direto)" accent={ACCENT}>
        <DecisionBox
          scenario="Equipe interna quer expor sistema interno (CRM, DB) a agents de vários colegas"
          winner="MCP server (HTTP com OAuth)"
          winnerColor={ACCENT}
          why="Reuso entre Claude Desktop, Cursor, IDEs. Cada colega plugga a URL + seu token. Permissioning centralizado, audit unificado."
          alternatives={[
            { name: 'Tool calling custom em cada app', note: 'N integrações duplicadas e dessincronizadas' },
            { name: 'REST API tradicional', note: 'requer agent saber ler docs; MCP entrega schema + description prontos' },
          ]}
        />
        <DecisionBox
          scenario="App próprio com um único agent LLM, sem intenção de compartilhar"
          winner="SDK nativo (Anthropic/OpenAI tool_use)"
          winnerColor={ACCENT}
          why="MCP adiciona complexidade que não se paga em caso single-agent single-app. SDK nativo é direto: define tool, chama LLM, roda função."
          alternatives={[
            { name: 'MCP local stdio', note: 'vale só se você já for reusar as tools em outros hosts' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Posso usar MCP server de um vendor sem ter Claude?"
          a={<>Sim. MCP é aberto — OpenAI, Google e outros adotaram. Hosts como Cursor, Zed, Continue e VSCode extensions suportam MCP. A spec e SDKs (TS, Python, Go, Rust) estão em modelcontextprotocol.io.</>}
        />
        <QAItem
          q="Qual o risco de segurança de plugar MCP server de terceiro?"
          a={<>Sério. Tool call pode executar código, tocar DB, enviar mensagem. Best practice: (1) aprovação explícita por tool call, (2) scopes no token OAuth, (3) rodar servers não-confiáveis em sandbox (container, user separado), (4) audit log de tudo. Nunca dê token write sem necessidade.</>}
        />
        <QAItem
          q="MCP substitui OpenAPI/REST?"
          a={<>Não, complementa. OpenAPI é contrato HTTP genérico; MCP é contrato otimizado para agents (tools + resources + prompts com descriptions e permissions). Você pode ter um MCP server que internamente consome sua API REST — é comum.</>}
        />
        <QAItem
          q="Como testar um MCP server antes de publicar?"
          a={<>Use <InlineCode>npx @modelcontextprotocol/inspector</InlineCode> — UI que conecta ao seu servidor (stdio ou HTTP), lista tools/resources/prompts, permite invocar manualmente e inspecionar respostas. É o "Postman" do MCP.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> MCP padronizou integração de tools/resources/prompts entre hosts. Tools = modelo
        decide; Resources = usuário escolhe; Prompts = usuário invoca. stdio para dev local; HTTP+OAuth para SaaS.
        Tool design (nome, description, schema, idempotência) é onde a qualidade se faz. Audit, rate limit e auth
        não são opcionais em server público. Próximo: colocar LLM API em produção com streaming, structured output,
        batch e retry.
      </Callout>
    </div>
  );
}
