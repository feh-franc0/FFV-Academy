# FFV Academy — MCP Server

MCP Server que transforma o Claude em funcionário editorial e educacional da **FFV Academy**: cria notícias, gerencia questões de simulado, publica artigos, monitora o portal e muito mais — tudo em uma conversa, sem abrir nenhum painel.

**Versão:** v0.3.0 · **24 tools** · 77 testes (100% linhas/funções)

> Planejamento, decisões arquiteturais e revisão crítica: [`docs/`](./docs/README.md) · Backlog futuro: [`docs/BACKLOG.md`](./docs/BACKLOG.md)

---

## O que é MCP e como funciona na prática

### O problema que o MCP resolve

Sem MCP, o Claude é um assistente de texto: ele *sugere* coisas, mas você ainda precisa executar. Para criar uma notícia, o fluxo sem MCP seria:

```
Você pede → Claude escreve o texto → você copia → você abre o arquivo → você cola → você salva
```

Com MCP, o Claude *executa*:

```
Você pede → Claude chama create_news → MCP escreve no news.json → pronto
```

### O que é o protocolo MCP

MCP (Model Context Protocol) é um padrão aberto criado pela Anthropic que define como qualquer LLM se comunica com servidores de ferramentas externos. É análogo ao que o HTTP é para a web: um contrato de comunicação que qualquer cliente e qualquer servidor podem implementar independentemente.

Antes do MCP, cada empresa criava seu próprio jeito de dar ferramentas ao LLM. O resultado era plugins acoplados a plataformas específicas — as tools do ChatGPT não funcionavam no Claude, as do Claude não funcionavam em outros clientes. O MCP resolve isso padronizando o protocolo.

### Como o processo funciona fisicamente

Quando o Claude Code ou o Claude Desktop inicia, ele lê a configuração e **lança o MCP como um processo filho separado**:

```
Claude Code (processo pai)
    └── node dist/index.js  ← processo filho, o MCP rodando
```

Os dois processos se comunicam via **stdin e stdout** usando JSON-RPC 2.0 — o mesmo protocolo que editores como VS Code usam para falar com servidores de linguagem (LSP). O `stderr` é reservado para logs e diagnóstico; o `stdout` é exclusivo para o protocolo.

```
Claude                          MCP (node dist/index.js)
  │                                       │
  │── lista de tools disponíveis? ───────>│
  │<─ [list_hubs, create_news, ...] ──────│
  │                                       │
  │── chame create_news({id, title...}) ─>│
  │                           lê/escreve news.json
  │<─ { created: "gpt5-launch" } ─────────│
  │                                       │
  │── chame list_simulados() ────────────>│
  │                           faz fetch → backend Go
  │<─ { simulados: [...] } ───────────────│
```

O Claude nunca vê os arquivos diretamente. Ele chama uma tool, o MCP executa a lógica e devolve o resultado.

### Por que o MCP é diferente de outras abordagens

**vs. tool use direto na API Anthropic**

Você pode dar ferramentas ao Claude via API assim:

```python
tools = [{"name": "create_news", "description": "...", "input_schema": {...}}]
response = anthropic.messages.create(tools=tools, ...)
```

Isso funciona, mas as tools existem **dentro daquele app específico**. Se você quiser usar no Claude Code, no Claude Desktop, em outro script — precisa recriar tudo do zero em cada lugar.

Com MCP, você escreve uma vez e qualquer cliente que fale o protocolo se conecta:

```
Claude Code    ──┐
Claude Desktop ──┼──→  node dist/index.js  (suas 24 tools)
Cursor         ──┤
Outro app MCP  ──┘
```

**vs. plugins de plataforma (ChatGPT plugins, etc.)**

Plugins são acoplados a uma plataforma e geralmente só fazem leitura via HTTP. O MCP é agnóstico de plataforma e pode fazer qualquer coisa: escrever arquivos, chamar APIs autenticadas, acessar banco de dados, rodar scripts.

**A diferença em uma frase:** MCP separa *o que o Claude pode fazer* de *quem está usando o Claude*. O servidor de tools é um processo independente — não um prompt, não um plugin, não código dentro de um app.

### O que acontece quando você pede algo

Exemplo real: `"Cria uma notícia sobre o lançamento do GPT-5"`

```
1. Claude analisa o pedido
2. Decide que deve chamar create_news
3. Monta os argumentos: { id: "gpt5-launch", title: "...", summary: "...", ... }
4. Envia via stdout → processo MCP recebe
5. MCP valida com Zod (formato, tipos, regras de negócio)
6. MCP lê o news.json atual com fs/promises
7. MCP insere o novo item no início do array
8. MCP escreve o arquivo atualizado
9. MCP devolve { created: "gpt5-launch", total: 52 } via stdout
10. Claude lê o resultado e responde para você
```

Cada tool call é síncrona do ponto de vista do Claude: ele espera o MCP responder antes de continuar. Se o MCP retornar `isError: true`, o Claude lê o erro e decide o que fazer — tentar de novo com parâmetros corrigidos, pedir esclarecimento, ou informar o problema.

---

## Tools disponíveis (v0.3.0)

### Taxonomia do currículo

| Tool | Auth | Descrição |
|---|---|---|
| `list_hubs` | pública | 8 hubs temáticos com IDs, slugs e trilhas vinculadas |
| `list_trails` | pública | 66 trilhas, filtrável por `hub_id` |

### Artigos do currículo

| Tool | Auth | Descrição |
|---|---|---|
| `list_articles` | pública | Lista artigos com metadados, paginável e filtrável por trilha |
| `read_article` | pública | Artigo completo em Markdown pelo slug |
| `search_articles` | pública | Busca por similaridade de título |
| `find_similar_titles` | pública | Títulos similares agrupados por trilha — detecta sobreposição antes de criar |
| `preview_article_update` | admin | Diff campo a campo sem aplicar nada — use antes de `update_article` |
| `create_article` | admin | Cria artigo novo no currículo |
| `update_article` | admin | PATCH parcial — apenas campos fornecidos são alterados |
| `delete_article` | admin | Soft-delete — artigo preservado no banco para auditoria |

> **Fluxo seguro de edição:** `read_article` → `preview_article_update` → `update_article`

### Simulados

| Tool | Auth | Descrição |
|---|---|---|
| `list_simulados` | pública | Catálogo completo: título, certificação, tópicos, preço, nota mínima |
| `read_simulado` | pública | Detalhes de um simulado específico pelo ID |
| `list_questions` | pública | Questões de um simulado, filtrável por tópico e dificuldade |
| `create_question` | — | Adiciona questão ao `catalog.json` (requer rebuild do backend) |
| `update_question` | — | Edita questão existente — apenas campos fornecidos |
| `delete_question` | — | Remove questão (requer `confirm_id` idêntico ao `question_id`) |

### Notícias

| Tool | Auth | Descrição |
|---|---|---|
| `list_news` | — | Lista notícias do portal, filtrável por categoria/fonte/hot |
| `create_news` | — | Adiciona notícia ao `news.json` (requer rebuild do frontend) |
| `update_news` | — | Edita notícia existente pelo ID |
| `delete_news` | — | Remove notícia (requer `confirm_id` idêntico ao `id`) |

### Portal e administração

| Tool | Auth | Descrição |
|---|---|---|
| `verify_certificate` | pública | Verifica autenticidade de certificado pelo hash SHA-256 |
| `get_leaderboard` | admin | Ranking semanal de XP, top 50 alunos |
| `get_admin_stats` | admin | Estado operacional do portal |
| `get_audit_log` | admin | Log de mutations, filtrável por usuário/ação/data |

---

## Arquitetura interna

### Os quatro arquivos

```
src/
├── index.ts    ponto de entrada — inicializa McpServer e conecta ao StdioTransport
├── config.ts   loadConfig() — lê env vars, resolve paths dos JSONs com import.meta.url
├── client.ts   FFVClient — cliente HTTP tipado para o backend Go + ApiError
└── tools.ts    registerTools() — 24 tools, schemas Zod, lógica de arquivo e HTTP
```

### Dois tipos de tool

Todas as 24 tools seguem o mesmo contrato externo, mas internamente há dois mecanismos:

**1. Tools HTTP → Backend Go**

Usadas para artigos, simulados (leitura), leaderboard, stats e audit. O `FFVClient` faz `fetch` para `FFV_API_BASE_URL` com o token no header `Authorization`.

```typescript
// list_simulados — chama GET /api/v1/simulados
async () => safe("list_simulados", () => client.listSimulados())
```

**2. Tools Filesystem → JSON**

Usadas para notícias e questões de simulado. O MCP lê e escreve arquivos locais diretamente via `fs/promises`. Não passa pelo backend — altera o arquivo em disco.

```typescript
// create_news — lê news.json, insere item, salva
async (args) => safe("create_news", async () => {
  const feed = await readJson(cfg.newsJsonPath);
  feed.items.unshift(novaNoticia);
  await writeJson(cfg.newsJsonPath, feed);
  return { created: args.id };
})
```

### O wrapper `safe()`

Todo handler é obrigatoriamente envolvido em `safe()`:

```typescript
async function safe(tool, fn) {
  try {
    const result = await fn();
    log({ tool, status: "ok", ms });
    return json(result);           // { content: [{ type: "text", text: "..." }] }
  } catch (err) {
    log({ tool, status: "error" });
    return fail(err.message);      // { content: [...], isError: true }
  }
}
```

Sem `safe()`, uma exceção não capturada encerraria a conexão stdio inteira. Com ele, o Claude recebe `isError: true` e pode decidir o que fazer — tentar novamente, corrigir os parâmetros, ou reportar o problema.

### Schemas Zod com `.describe()`

Cada campo do `inputSchema` tem `.describe()` obrigatório:

```typescript
slug: z.string()
  .regex(/^[a-z0-9-]+$/)
  .describe("Slug único kebab-case (ex: 'prompt-caching-anthropic').")
```

O Claude lê essas descrições antes de chamar a tool. Uma descrição boa evita parâmetros errados; uma descrição ruim gera erros que poderiam ser prevenidos.

### Logging estruturado

Cada chamada emite uma linha JSON em `stderr`:

```json
{"ts":"2026-04-27T10:00:01.234Z","tool":"create_news","status":"ok","ms":18}
{"ts":"2026-04-27T10:00:05.001Z","tool":"update_article","status":"error","httpStatus":401,"ms":11}
```

Tokens e corpos de requisições autenticadas **nunca são registrados**.

---

## Pré-requisitos

- **Node.js ≥ 20**
- Backend FFV Academy acessível (local ou produção) para tools HTTP
- JWT `role=admin` para tools de mutação de artigos, leaderboard, stats e audit

---

## Instalação

```bash
cd mcp
npm install
npm run build   # compila TypeScript → dist/index.js
```

---

## Variáveis de ambiente

| Variável | Padrão | Quando usar |
|---|---|---|
| `FFV_API_BASE_URL` | `http://localhost:8080` | Obrigatória em produção |
| `FFV_ADMIN_TOKEN` | `null` | Tools de mutação de artigos, leaderboard, stats, audit |
| `FFV_HTTP_TIMEOUT_MS` | `15000` | Ajustar se o backend for lento |
| `FFV_NEWS_JSON_PATH` | `../../frontend/src/data/news.json` | Sobrescrever path do news.json |
| `FFV_CATALOG_JSON_PATH` | `../../backend/internal/infrastructure/catalog/catalog.json` | Sobrescrever path do catalog.json |

Os paths de JSON são resolvidos automaticamente a partir da localização do `dist/index.js`. Só defina as variáveis `FFV_*_PATH` se a estrutura do monorepo for diferente do padrão.

---

## Obter token admin

A API usa magic link (6 dígitos, TTL 15 min):

```bash
# 1. Solicitar o código
curl -X POST http://localhost:8080/api/v1/auth/request-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com"}'

# 2. Verificar com o código recebido no e-mail
curl -X POST http://localhost:8080/api/v1/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com","token":"123456"}'
# → copie o accessToken da resposta
```

Ao receber erro 401, o MCP exibe esses comandos automaticamente com a URL correta.

---

## Configuração no Claude Code

```bash
claude mcp add ffv-academy \
  -e FFV_API_BASE_URL=http://localhost:8080 \
  -e FFV_ADMIN_TOKEN=eyJhbGciOi... \
  -- node /Users/fernandofranco/Developer/fernandofrancovalledotcom/mcp/dist/index.js

claude mcp list        # esperado: ffv-academy ✓ Connected
claude mcp logs ffv-academy  # inspecionar stderr em tempo real
```

## Configuração no Claude Desktop

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

Reinicie o Claude Desktop. As 24 tools são registradas automaticamente.

---

## Exemplos de uso

**Notícias**
```
"Cria uma notícia sobre o lançamento do GPT-5 com categoria 'launch'."
"Liste as notícias da fonte Anthropic marcadas como hot."
"Atualiza a notícia 'gpt5-launch' para adicionar a tag 'gpt'."
```

**Questões de simulado**
```
"Liste as questões de dificuldade hard do simulado aws-clf."
"Cria uma questão sobre IAM Policies no simulado aws-clf, nível medium."
"Atualiza a explicação da questão clf-q1 para ficar mais didática."
```

**Artigos do currículo**
```
"Pesquise artigos sobre 'prompt caching' antes de eu criar um novo."
"Leia o artigo 'introducao-claude' e sugira melhorias no estilo."
"Mostre o diff antes de alterar o título do artigo 'kv-cache'."
```

**Portal**
```
"Qual é o ranking desta semana? Quem está no top 3?"
"Mostre as últimas 10 alterações feitas no portal."
"Verifica se o certificado com hash abc123... é autêntico."
```

---

## Desenvolvimento

```bash
npm run build      # compila TypeScript → dist/
npm run dev        # tsc --watch (recompila ao salvar)
npm run typecheck  # verifica tipos sem emitir arquivos
npm test           # Vitest — 77 testes, 100% linhas/funções, 94% branches
npm run test:watch # Vitest modo interativo
npm run clean      # remove dist/
```

### Estrutura de testes

```
src/__tests__/
├── config.test.ts    # env vars, defaults, paths, validação
├── client.test.ts    # HTTP, autenticação, timeout, erro 401, Problem+JSON
├── tools.test.ts     # funções puras: taxonomia, groupByTrail, buildDiff
└── handlers.test.ts  # todos os handlers via InMemoryTransport + Client SDK
```

As funções puras (`getTrails`, `groupByTrail`, `buildDiff`) são testadas isoladamente, sem depender do McpServer. Os handlers em `handlers.test.ts` usam `InMemoryTransport` para simular a conexão stdio completa.

### Como adicionar uma nova tool

1. Se precisar de endpoint novo: adicionar método ao `FFVClient` em `client.ts` com tipo de retorno explícito
2. Em `tools.ts`, chamar `server.registerTool(nome, { title, description, inputSchema }, handler)`
3. Envolver o handler em `safe()`; extrair lógica não-trivial como função pura exportada
4. Escrever testes em `handlers.test.ts`: caminho feliz + ApiError + erro genérico
5. Atualizar este README (tabela de tools) e `CLAUDE.md`

---

## Observabilidade

| Ambiente | Como acessar logs |
|---|---|
| Claude Code | `claude mcp logs ffv-academy` |
| Claude Desktop | `~/Library/Logs/Claude/mcp*.log` |
| Terminal direto | `node dist/index.js 2>mcp.log` |

---

## Resolução de problemas

**`Esta operação exige FFV_ADMIN_TOKEN configurado`**
→ Defina `FFV_ADMIN_TOKEN` na configuração do MCP e reinicie o cliente.

**`Token expirado ou inválido (401)`**
→ O erro já exibe os comandos `curl` para renovação. Siga, atualize `FFV_ADMIN_TOKEN` e reinicie.

**`Timeout (15000ms) em ...`**
→ Backend não respondeu. Verifique se está acessível: `curl $FFV_API_BASE_URL/healthz`

**`ENOENT: no such file or directory` em tools de notícia/questão**
→ O MCP não encontrou o JSON no path esperado. Defina `FFV_NEWS_JSON_PATH` ou `FFV_CATALOG_JSON_PATH` com o caminho absoluto correto.

**A tool não aparece no Claude**
→ Reinicie o cliente ou execute: `claude mcp reset-server ffv-academy`

**`✗ Failed` em `claude mcp list`**
→ Execute `node dist/index.js` direto no terminal para ver o erro em stderr. Causas comuns: `dist/` inexistente (rode `npm run build`), Node abaixo de 20, path incorreto.

---

## Roadmap

| Versão | Status | O que inclui |
|---|---|---|
| v0.1.0 | ✅ Entregue | 7 tools de currículo, build limpo |
| v0.2.0 | ✅ Entregue | 16 tools — taxonomia, preview, logging, 77 testes |
| v0.3.0 | ✅ Entregue | 24 tools — simulados, notícias, questões, leaderboard, audit |
| v1.1.0 | 🔜 Próxima | Refresh automático do admin token (elimina renovação manual a cada 15 min) |
| v2.0.0 | 📋 Planejada | Backend real para notícias e questões, MCP Resources, tipos gerados de OpenAPI |

Itens descartados do escopo atual: [`docs/BACKLOG.md`](./docs/BACKLOG.md)
