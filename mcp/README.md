# FFV Academy — MCP Server

MCP (Model Context Protocol) server que expõe o currículo da **FFV Academy** ao Claude. Permite listar, ler, buscar, criar, editar e excluir artigos diretamente do Claude Desktop ou Claude Code, sem abrir o painel administrativo.

**Versão:** v0.2.0

> Planejamento completo, decisões arquiteturais e revisão crítica: [`docs/`](./docs/README.md).

---

## Por que existe

Produzir conteúdo para o currículo envolvia três contextos diferentes:

1. Abrir o painel administrativo para verificar se o tema já existe
2. Escrever o conteúdo no editor
3. Voltar ao painel para colar, configurar metadados e publicar

Com o MCP, todo esse fluxo acontece em uma única conversa com o Claude:

> *"Escreva um artigo sobre prompt caching no hub de IA. Antes, verifique se já existe algo similar, calibre o tom com base nos meus últimos dois artigos do hub e salve como rascunho."*

---

## Tools disponíveis (v0.2.0)

### Taxonomia

| Tool | Autenticação | Descrição |
|---|---|---|
| `list_hubs` | pública | Lista todos os hubs temáticos com IDs, slugs e trilhas vinculadas — use antes de `create_article` |
| `list_trails` | pública | Lista trilhas do currículo, filtrável por `hub_id` — use antes de `create_article` |

### Leitura

| Tool | Autenticação | Descrição |
|---|---|---|
| `list_articles` | pública | Lista artigos com metadados, filtrável por trilha e com paginação |
| `read_article` | pública | Retorna o artigo completo em Markdown a partir do slug |
| `search_articles` | pública | Busca artigos por similaridade de título |
| `find_similar_titles` | pública | Agrupa títulos similares por trilha — use para detectar sobreposição antes de criar conteúdo |

### Mutação (requer `FFV_ADMIN_TOKEN`)

| Tool | Autenticação | Descrição |
|---|---|---|
| `preview_article_update` | admin | Exibe o diff campo a campo **sem aplicar nenhuma alteração** — use antes de `update_article` |
| `create_article` | admin | Cria um novo artigo no currículo |
| `update_article` | admin | Atualiza campos específicos (PATCH parcial) — **operação destrutiva, sem rollback via MCP** |
| `delete_article` | admin | Soft-delete — o artigo é removido do currículo mas preservado no banco para auditoria |

> **Fluxo recomendado para edição segura:**
> 1. `read_article` — verificar o estado atual
> 2. `preview_article_update` — revisar o diff antes de aplicar
> 3. `update_article` — aplicar somente após confirmar o preview

---

## Pré-requisitos

- **Node.js ≥ 20**
- Backend FFV Academy acessível (local ou produção)
- Para tools de mutação: JWT com `role=admin` — ver [como obter o token](#obter-token-admin)

---

## Instalação

```bash
cd mcp
npm install
npm run build
```

O build gera `dist/index.js`, utilizado como entry point pelo Claude.

---

## Configuração

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
FFV_API_BASE_URL=http://localhost:8080      # URL base da API (obrigatória em produção)
FFV_ADMIN_TOKEN=eyJhbGciOi...              # JWT admin (necessário apenas para mutações)
FFV_HTTP_TIMEOUT_MS=15000                  # Timeout HTTP em ms (padrão: 15000)
```

O MCP roda como processo filho do Claude e recebe as variáveis via configuração do cliente (Claude Desktop ou Claude Code). O arquivo `.env` é útil apenas para testes locais com `dotenv-cli`.

### Obter token admin

A API utiliza magic link para autenticação. Em ambiente de desenvolvimento:

```bash
# 1. Solicitar o código (enviado para o e-mail via Mailhog: http://localhost:8025)
curl -X POST http://localhost:8080/api/v1/auth/request-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com"}'

# 2. Verificar com o código de 6 dígitos recebido no e-mail
curl -X POST http://localhost:8080/api/v1/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com","token":"123456"}'
# Copie o valor de accessToken da resposta
```

> **Atenção:** o token de acesso expira em 15 minutos. Ao receber um erro 401, o MCP exibe os comandos curl completos e corretos para renovação. Basta seguir as instruções no próprio erro.

---

## Integração com o Claude Desktop

Edite `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ffv-academy": {
      "command": "node",
      "args": ["/Users/fernandofranco/Developer/fernandofrancovalledotcom/mcp/dist/index.js"],
      "env": {
        "FFV_API_BASE_URL": "http://localhost:8080",
        "FFV_ADMIN_TOKEN": "eyJhbGciOi..."
      }
    }
  }
}
```

Reinicie o Claude Desktop. As tools são registradas automaticamente.

---

## Integração com o Claude Code

```bash
claude mcp add ffv-academy \
  -e FFV_API_BASE_URL=http://localhost:8080 \
  -e FFV_ADMIN_TOKEN=eyJhbGciOi... \
  -- node /Users/fernandofranco/Developer/fernandofrancovalledotcom/mcp/dist/index.js
```

Verificar se a conexão foi estabelecida:

```bash
claude mcp list
# esperado: ffv-academy ✓ Connected
```

---

## Exemplos de uso

**Explorar o currículo:**
```
"Quais hubs existem no currículo?"
"Quais trilhas pertencem ao hub de IA?"
"Liste os 10 artigos mais recentes da trilha 1."
```

**Verificar antes de criar:**
```
"Pesquise artigos sobre 'prompt caching' antes de eu escrever um novo."
"Existe algum conteúdo sobre KV Cache no currículo?"
```

**Ler e editar:**
```
"Leia o artigo 'introducao-claude' e sugira melhorias no estilo."
"Mostre o que mudaria se eu alterasse o título do artigo 'kv-cache' para 'KV Cache: como funciona na prática'."
"Atualize o artigo 'artigo-antigo' para despublicado."
```

**Criar conteúdo:**
```
"Crie um artigo de nível intermediário sobre 'cache breakpoints no Claude'
 no hub 'hub-claude-anthropic', trilha 'trail17'. Use o conteúdo abaixo."
```

---

## Desenvolvimento

```bash
npm run build      # compila TypeScript → dist/
npm run dev        # tsc --watch (recompila ao salvar)
npm run typecheck  # verificação de tipos sem emitir arquivos
npm test           # executa a suíte Vitest (77 testes, 100% linhas/funções)
npm run test:watch # Vitest em modo interativo
npm run clean      # remove dist/
```

### Estrutura do projeto

```
src/
├── index.ts          # entry point — inicializa e conecta o McpServer ao StdioTransport
├── config.ts         # loadConfig() — lê e valida variáveis de ambiente
├── client.ts         # FFVClient — cliente HTTP tipado + ApiError
└── tools.ts          # registerTools() — registro de todas as tools e schemas Zod
                      # Funções puras exportadas (testáveis sem McpServer):
                      #   HUBS_STATIC, TRAILS_STATIC
                      #   getTrails(hubId?)
                      #   groupByTrail(data, topic)
                      #   buildDiff(current, patches)

src/__tests__/
├── config.test.ts    # 10 testes — variáveis de ambiente, defaults, validação
├── client.test.ts    # 27 testes — HTTP, autenticação, timeout, Problem+JSON, erros de rede
├── tools.test.ts     # 28 testes — taxonomia, agrupamento, diff, referências cruzadas
└── handlers.test.ts  # 12 testes — todos os 10 handlers via InMemoryTransport + Client SDK
```

### Decisões arquiteturais

| Decisão | Justificativa |
|---|---|
| TypeScript + ESM | Alinhado com o frontend; SDK MCP oficial é TS-first |
| Cliente HTTP manual | A spec OpenAPI do backend não cobre os endpoints de currículo — v2 gerará tipos via `openapi-typescript` |
| Transport stdio | Single-user local; v3 pode adicionar HTTP/SSE para múltiplos usuários |
| Token estático em env | Simples e seguro para uso solo; token expirado gera instrução de renovação no próprio erro |
| Erros retornam `isError: true` | Padrão do protocolo MCP — o LLM lê e decide entre retry e correção |
| Funções puras extraídas | `groupByTrail`, `buildDiff`, `getTrails` são testadas diretamente sem depender do McpServer |

---

## Observabilidade

Cada chamada de tool emite uma linha JSON estruturada em **stderr**:

```json
{"ts":"2026-04-25T17:00:01.234Z","tool":"list_articles","status":"ok","ms":42}
{"ts":"2026-04-25T17:00:05.001Z","tool":"update_article","status":"error","httpStatus":401,"ms":11}
```

Em erros HTTP, o campo `httpStatus` é incluído. Em erros internos, o campo `error` contém a mensagem. Tokens e corpos de requisições autenticadas **nunca são registrados**.

**Como acessar os logs:**

| Ambiente | Comando |
|---|---|
| Claude Desktop | `~/Library/Logs/Claude/mcp*.log` |
| Claude Code | `claude mcp logs ffv-academy` |
| Desenvolvimento manual | `node dist/index.js 2>mcp.log` |

---

## Roadmap

| Versão | Status | Entrega |
|---|---|---|
| v0.1.0 | ✅ Entregue | 7 tools básicas, build limpo |
| v0.2.0 | ✅ Entregue | `list_hubs`, `list_trails`, `preview_article_update`, `find_similar_titles`, logging estruturado, 77 testes (100% linhas/funções), erro 401 acionável |
| v1.1.0 | 🔜 Próxima | Refresh token automático — elimina a renovação manual a cada 15 minutos |
| v2.0.0 | 📋 Planejada | MCP Resources, MCP Prompts, tipos gerados de OpenAPI, elicitation no delete |

Detalhes em [`docs/02-ROADMAP.md`](./docs/02-ROADMAP.md).

---

## Resolução de problemas

**`Esta operação exige FFV_ADMIN_TOKEN configurado`**
→ Uma tool de mutação foi chamada sem token administrativo. Defina `FFV_ADMIN_TOKEN` na configuração do MCP e reinicie o cliente.

**`Token expirado ou inválido (401)`**
→ O próprio erro exibe os comandos curl para renovação com a URL correta. Siga as instruções, atualize `FFV_ADMIN_TOKEN` na configuração e reinicie o Claude.

**`Timeout (15000ms) em ...`**
→ O backend não respondeu no prazo. Verifique `FFV_API_BASE_URL` e se o backend está disponível:
```bash
curl $FFV_API_BASE_URL/healthz
```

**A tool não aparece no Claude**
→ Reinicie o cliente Claude ou execute:
```bash
claude mcp reset-server ffv-academy
```

**`✗ Failed` em `claude mcp list`**
→ Execute `node dist/index.js` diretamente no terminal para inspecionar o erro em stderr. Causas frequentes: caminho incorreto, `dist/` inexistente (execute `npm run build`), versão do Node abaixo de 20.
