import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'MCP na prática: conectar Drive, GitHub, Slack e bancos de dados — FFV Academy',
  description: 'Model Context Protocol (MCP) permite que Claude acesse ferramentas externas. Como configurar servidores MCP prontos para Google Drive, GitHub, Postgres, Slack e mais.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre um MCP Tool e um MCP Resource?',
    options: [
      'Tools são para leitura de dados, Resources são para execução de ações — o oposto do que os nomes sugerem',
      'Não há diferença prática — são duas formas de expor a mesma funcionalidade, e cabe ao servidor escolher qual usar',
      'Tools são funções que Claude pode chamar para executar ações (consultar banco, criar issue, enviar mensagem). Resources são dados que Claude pode ler de forma passiva (listar arquivos, ler documentos). Tools têm side effects; Resources são geralmente somente-leitura.',
      'Tools são definidos pelo usuário, Resources são definidos pela Anthropic — a distinção é de origem, não de funcionalidade',
    ],
    correct: 2,
    explanation: 'A distinção Tool vs Resource é sobre natureza da operação. Um Tool para PostgreSQL seria `execute_query(sql: string)` — Claude chama isso para rodar uma query. Um Resource seria `postgres://meudb/tabelas` — Claude "lê" esse URI para obter a lista de tabelas. Na prática, Tools são mais flexíveis (podem ter efeitos colaterais) enquanto Resources são mais seguros (somente leitura, navegáveis). A maioria dos servidores MCP implementa Tools; Resources são mais comuns em servidores de documentos e filesystems.',
  },
  {
    question: 'Você configurou um servidor MCP para Postgres. Claude fez uma query de análise e sugeriu um UPDATE. O que acontece?',
    options: [
      'O servidor MCP bloqueia automaticamente qualquer UPDATE — MCP é somente-leitura por design',
      'Claude executa o UPDATE diretamente, pois já tem a conexão configurada via MCP',
      'Depende da implementação do servidor MCP e das permissões configuradas. Um servidor bem configurado pode requerer confirmação para operações de escrita. Se o servidor aceita qualquer SQL, Claude mostrará a query como ação de ferramenta e pedirá confirmação antes de executar.',
      'Claude não pode sugerir UPDATEs — o model é treinado para recusar operações de escrita em bancos via MCP',
    ],
    correct: 2,
    explanation: 'O comportamento depende de dois fatores: (1) o que o servidor MCP aceita — um servidor configurado com usuario read-only no banco fisicamente não consegue fazer UPDATE mesmo que Claude tente; (2) o sistema de confirmação do Claude Code — comandos de ferramenta são mostrados antes de executar. A boa prática é: configure o usuário do banco com as permissões mínimas necessárias (read-only para análise) e deixe o sistema de confirmações do Claude Code como segunda camada.',
  },
  {
    question: 'Para compartilhar a configuração de servidores MCP com toda a equipe, onde o arquivo deve ficar?',
    options: [
      'Em ~/.claude.json — configuração global que vale para todos os usuários do sistema',
      'Em .claude/mcp.json na raiz do projeto, commitado no repositório — cada dev tem os mesmos servidores disponíveis',
      'Não é possível compartilhar configurações MCP — cada dev precisa configurar manualmente em suas preferências locais',
      'Em .env junto com as outras variáveis de ambiente — Claude Code lê automaticamente',
    ],
    correct: 1,
    explanation: 'Servidores MCP podem ser configurados em dois níveis: `~/.claude.json` (global, pessoal) e `.claude/mcp.json` no projeto (compartilhado via git). Para servidores que toda a equipe precisa (GitHub, Jira, banco de dev), use o arquivo de projeto commitado. Para servidores pessoais (seu Google Drive, sua conta Slack pessoal), use o global. NUNCA commite API keys no arquivo — use env vars referenciadas: `"env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }`.',
  },
];

export default function ClaudeCodeMcpNaPraticaPage() {
  return (
    <ModuleLayout
      slug="claude-code-mcp-na-pratica"
      title="MCP na prática: conectar Drive, GitHub, Slack e bancos de dados"
      icon="🔌"
      xp={75}
      readTime={15}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="claude-code-hooks"
      nextTitle="Hooks: automatizar revisões, validações e ações customizadas"
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
        Sem MCP, Claude Code conhece apenas o seu projeto local. Com MCP, ele pode consultar o banco de dados de produção, ler issues do GitHub, verificar status no Slack e acessar documentos do Drive — tudo na mesma sessão. Model Context Protocol é o que transforma Claude Code de assistente de código em agente de trabalho integrado.
      </p>

      <Section accent={accent} title="Como MCP funciona: o protocolo em 5 minutos">
        <CodeBlock>{`# MCP usa JSON-RPC 2.0 para comunicação entre cliente e servidor
# Transporte padrão: stdio (servidor roda como processo filho do Claude Code)
# Alternativas: SSE (Server-Sent Events), HTTP Streamable

# Um servidor MCP expõe três primitivos:

# 1. Tools — funções chamáveis com side effects
{
  "name": "execute_query",
  "description": "Executa uma SQL query no banco de dados",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": { "type": "string", "description": "Query SQL a executar" },
      "read_only": { "type": "boolean", "default": true }
    }
  }
}

# 2. Resources — dados navegáveis (URI scheme)
# postgres://localhost/mydb/tables → lista tabelas
# file:///path/to/docs/          → lista documentos

# 3. Prompts — templates reutilizáveis
# "code_review" → template de revisão de código
# "explain_error" → template para explicar stack traces

# Fluxo quando Claude usa um MCP Tool:
# Claude → [tool call: execute_query({sql: "SELECT ..."})]
# Claude Code → [envia para servidor MCP via stdio]
# Servidor MCP → [executa query, retorna resultado]
# Claude Code → [exibe resultado para Claude]
# Claude → [analisa e responde]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Configuração: servidores prontos para usar">
        <CodeBlock>{`# ~/.claude.json (configuração global) ou .claude/mcp.json (projeto)

{
  "mcpServers": {

    # GitHub — issues, PRs, code search
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },

    # PostgreSQL — queries, schema inspection
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://readonly_user:pass@localhost/mydb"
      ]
    },

    # Filesystem — acesso a diretório específico (mais seguro que acesso total)
    "docs": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/dev/projetos/empresa/docs"
      ]
    },

    # Slack — mensagens, canais (requer app token)
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "\${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "T0XXXXXXX"
      }
    },

    # Google Drive (OAuth necessário na primeira vez)
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"]
    },

    # Brave Search — busca web quando Claude precisa de info externa
    "search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "\${BRAVE_API_KEY}"
      }
    }
  }
}`}</CodeBlock>
        <ComparisonTable
          headers={['Servidor MCP', 'O que oferece', 'Uso típico']}
          rows={[
            ['@mcp/server-github', 'Issues, PRs, commits, code search', 'Revisar PRs, criar issues, buscar código'],
            ['@mcp/server-postgres', 'Queries SQL, schema, explain plans', 'Análise de dados, debug de queries lentas'],
            ['@mcp/server-filesystem', 'Leitura/escrita em diretório específico', 'Documentação, especificações, assets'],
            ['@mcp/server-slack', 'Mensagens, canais, threads', 'Resumir discussões, postar updates'],
            ['@mcp/server-gdrive', 'Google Docs, Sheets, Drive files', 'Ler specs, atualizar docs de projeto'],
            ['@mcp/server-brave-search', 'Busca web em tempo real', 'Pesquisa de libs, documentação externa'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Uso real: sessão de trabalho com múltiplos MCP servers">
        <CodeBlock>{`# Sessão realista: analisar um bug reportado no GitHub, investigar no banco,
# e propor correção no código

$ claude

Você: Temos uma issue aberta no GitHub (#247) sobre usuários não conseguindo
      fazer login após trocar de senha. Investigue e proponha uma correção.

Claude: [usa MCP GitHub] Lendo issue #247...
        Título: "Login falha após reset de senha"
        Descrição: usuário reseta senha, tenta logar, recebe "Invalid credentials"
        Labels: bug, authentication, high-priority

        [usa MCP GitHub] Buscando código relacionado...
        Encontrei src/auth/password.ts - função resetPassword()

        [usa Read] Lendo src/auth/password.ts...

        Encontrei o problema: após reset, o hash é salvo mas o
        campo updated_at não é atualizado. O sistema de cache
        usa updated_at como chave de invalidação — o cache antigo
        com o hash anterior ainda está ativo.

        [usa MCP Postgres] Verificando no banco de dev...
        SELECT id, updated_at, last_password_change FROM users WHERE id = 123;
        → updated_at: 2026-04-10 (não mudou)
        → last_password_change: 2026-04-17 (recente)

        Confirmado: updated_at não é atualizado no reset.

        Posso corrigir src/auth/password.ts e adicionar um teste?

Você: Sim, faça isso.

Claude: [Edit] src/auth/password.ts — adiciona updated_at = NOW() na query de reset
        [Write] src/tests/auth.test.ts — adiciona teste para reset + login
        [Bash] npm test -- auth.test.ts (aguardando confirmação)

Você: [Enter para aprovar]

Claude: Testes passando. Posso criar um comentário na issue #247 com o diagnóstico?

Você: Sim.

Claude: [MCP GitHub] Postando comentário na issue #247...
        "Root cause identified: updated_at not updated on password reset..."
        Feito. Issue atualizada com o diagnóstico e PR pronto para review.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Construindo um servidor MCP customizado">
        <CodeBlock>{`# Para integrar uma API interna ou serviço proprietário, crie seu próprio servidor
# Usando o SDK oficial: @modelcontextprotocol/sdk

# exemplo: servidor MCP para sistema de tickets interno
# arquivo: mcp-tickets-server.js

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "sistema-tickets",
  version: "1.0.0",
});

// Tool: buscar tickets
server.tool(
  "buscar_tickets",
  "Busca tickets no sistema interno",
  {
    status: z.enum(["aberto", "fechado", "em_andamento"]).optional(),
    assignee: z.string().optional(),
    limit: z.number().default(10),
  },
  async ({ status, assignee, limit }) => {
    const tickets = await fetch(
      \`https://tickets.empresa.internal/api?status=\${status}&limit=\${limit}\`,
      { headers: { Authorization: \`Bearer \${process.env.TICKETS_TOKEN}\` } }
    ).then(r => r.json());

    return {
      content: [{ type: "text", text: JSON.stringify(tickets, null, 2) }],
    };
  }
);

// Resource: lista de projetos
server.resource(
  "projetos",
  "lista de projetos ativos",
  async () => {
    const projetos = await fetch("https://tickets.empresa.internal/api/projetos")
      .then(r => r.json());
    return {
      contents: [{ uri: "tickets://projetos", text: JSON.stringify(projetos) }],
    };
  }
);

// Iniciar servidor
const transport = new StdioServerTransport();
await server.connect(transport);

# Adicionar ao .claude/mcp.json:
{
  "mcpServers": {
    "tickets": {
      "command": "node",
      "args": ["/caminho/para/mcp-tickets-server.js"],
      "env": { "TICKETS_TOKEN": "\${TICKETS_TOKEN}" }
    }
  }
}`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>MCP muda o que Claude consegue fazer:</strong> de um assistente que conhece apenas seu projeto local para um agente que integra todos os sistemas do seu workflow. Configure com segurança: usuários read-only no banco, env vars para tokens, .claude/mcp.json no repo para compartilhar com o time. Para sistemas internos, o SDK tem curva de aprendizado baixa — um servidor funcional em menos de 100 linhas.
      </Callout>

      <Callout>
        Próximo: <strong>Hooks</strong> — como criar scripts que rodam automaticamente em eventos do Claude Code para automatizar lint, testes e notificações.
      </Callout>
    </div>
  );
}
