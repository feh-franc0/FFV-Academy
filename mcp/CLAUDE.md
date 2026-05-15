# MCP — FFV Academy

MCP server que expõe o currículo da FFV Academy ao Claude via 24 tools, divididas em 4 grupos:

- **curriculum** (10): `list_hubs`, `list_trails`, `list_articles`, `read_article`, `search_articles`, `find_similar_titles`, `create_article`, `preview_article_update`, `update_article`, `delete_article`
- **simulados/questions** (7): `list_simulados`, `read_simulado`, `verify_certificate`, `list_questions`, `create_question`, `update_question`, `delete_question`
- **admin** (3): `get_leaderboard`, `get_admin_stats`, `get_audit_log`
- **news** (4): `list_news`, `create_news`, `update_news`, `delete_news`

Roda como processo stdio.

## Comandos rápidos

```bash
npm run build      # compila TypeScript → dist/index.js
npm run typecheck  # verifica tipos sem emitir arquivos
npm test           # 101 testes (100% linhas/funções, 94% branches)
npm run test:watch # Vitest em modo interativo
npm run dev        # tsc --watch (recompila ao salvar)
npm run clean      # remove dist/
```

## Estrutura

```
src/
├── index.ts          # bootstrap stdio (conecta McpServer ao StdioTransport)
├── config.ts         # loadConfig() — lê e valida variáveis de ambiente
├── client.ts         # FFVClient — HTTP client tipado + ApiError
├── util.ts           # helpers compartilhados: safe(), log(), json(), fail(),
│                     # readJson(), writeJson(), today(), buildDiff()
└── tools/
    ├── index.ts          # registerAllTools(server, client, cfg)
    ├── curriculum.ts     # HUBS_STATIC, TRAILS_STATIC, getTrails, groupByTrail + 10 tools
    ├── simulados.ts      # simulados + 4 tools de questions
    ├── admin.ts          # leaderboard, stats, audit log
    └── news.ts           # 4 tools de news.json
    └── __tests__/
        ├── config.test.ts        # 10 testes
        ├── client.test.ts        # 27 testes
        ├── tools.test.ts         # 28 testes — funções puras
        ├── handlers.test.ts      # 12 testes — handlers via InMemoryTransport
        ├── news.test.ts          # 14 testes — news.json com tmpfs real
        ├── questions.test.ts     # 10 testes — catalog.json com tmpfs real
        ├── helpers/tmpfs.ts      # withTempJson(initial) → { path, cleanup }
        └── fixtures/             # news.fixture.json, catalog.fixture.json
```

## As 24 tools

| Tool | Autenticação | Propósito |
|---|---|---|
| `list_hubs` | pública | Taxonomia estática — hubs com IDs e trilhas |
| `list_trails` | pública | Taxonomia estática — trilhas (filtrável por hub_id) |
| `list_articles` | pública | Lista artigos com metadados (paginável, filtrável por trilha) |
| `read_article` | pública | Artigo completo em Markdown por slug |
| `search_articles` | pública | Busca por similaridade de título via backend |
| `find_similar_titles` | pública | search + agrupamento por trilha com recomendação |
| `preview_article_update` | admin | Diff campo a campo sem aplicar nenhuma alteração |
| `create_article` | admin | Cria artigo (requer hub_id e trail_id válidos — use list_hubs/list_trails antes) |
| `update_article` | admin | PATCH parcial — destrutivo, sem rollback via MCP |
| `delete_article` | admin | Soft-delete — requer confirm_slug idêntico ao slug |

## Variáveis de ambiente

| Variável | Padrão | Obrigatória? |
|---|---|---|
| `FFV_API_BASE_URL` | `http://localhost:8080` | Em produção, sim |
| `FFV_ADMIN_TOKEN` | `null` | Apenas para tools de mutação |
| `FFV_HTTP_TIMEOUT_MS` | `15000` | Não |

## Padrões de código

- **`safe(tool, fn)`** — wrapper obrigatório em todos os handlers; captura `ApiError` e `Error`, emite log em stderr, retorna `{ content, isError }`.
- **`log(entry)`** — escreve JSON em stderr. Campos: `ts`, `tool`, `status`, `ms`, e opcionalmente `httpStatus` ou `error`. **Nunca registrar tokens ou corpos de requisições autenticadas.**
- **`json(value)`** e **`fail(msg)`** — únicos construtores de resposta MCP aceitos.
- **Zod em todos os schemas de input** — incluir `.describe()` em todos os campos (o LLM lê as descrições).
- **Mensagens de erro em português** — consistente com a plataforma FFV.
- **Taxonomia estática** (`HUBS_STATIC`, `TRAILS_STATIC`) — manter sincronizada com `frontend/src/lib/curriculum.ts`. Ao atualizar o currículo, alterar ambos e rodar `npm test` para detectar inconsistências.

## Como adicionar uma nova tool

1. Adicionar o método ao `FFVClient` em `client.ts` com tipo de retorno explícito.
2. Registrar em `registerTools()` em `tools.ts` com `server.registerTool(name, { title, description, inputSchema }, handler)`.
3. Extrair lógica não-trivial como função pura exportada para testabilidade independente.
4. Escrever testes em `handlers.test.ts`: caminho feliz + erro `ApiError` + erro genérico.
5. Atualizar `README.md` (tabela de tools) e `CHANGELOG.md`.

## Testar com o protocolo real

```bash
# Conectar no Claude Code (backend deve estar rodando)
claude mcp add ffv-academy \
  -e FFV_API_BASE_URL=http://localhost:8080 \
  -e FFV_ADMIN_TOKEN=SEU_TOKEN \
  -- node /caminho/para/mcp/dist/index.js

claude mcp list              # confirmar "Connected"
claude mcp logs ffv-academy  # inspecionar stderr em tempo real
```

Roteiro completo de testes manuais: [`docs/09-TEST-ROTEIRO.md`](./docs/09-TEST-ROTEIRO.md).

## Renovar token admin (TTL: 15 min)

```bash
# 1. Solicitar magic link
curl -X POST http://localhost:8080/api/v1/auth/request-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com"}'

# 2. Verificar com o código recebido no e-mail
curl -X POST http://localhost:8080/api/v1/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email@dominio.com","token":"123456"}'
# → copiar accessToken e atualizar FFV_ADMIN_TOKEN na configuração do MCP
```

Ao receber erro 401, o MCP já exibe esses comandos com a URL real do backend.

## Pontos de atenção

- **trail39 não existe** — estava na taxonomia mas não pertencia a nenhum hub. Foi removido. Se o backend retornar `trail_id="trail39"`, o agrupamento vai incluí-lo mas sem nome de trilha associado.
- **`content_md` é opcional em `Article`** — `buildDiff` trata esse caso (`before_length=0` quando `undefined`). Nunca expor o conteúdo em texto puro no preview — apenas `delta_chars`.
- **`noUncheckedIndexedAccess: true` no tsconfig** — acessos a arrays retornam `T | undefined`. Usar `?.[0]` ou guard explícito; nunca usar `!` sem verificação prévia.
- **Token estático com TTL curto** — o access token expira em 15 min. A v1.1 implementará refresh automático.
- **InMemoryTransport nos testes** — usar o helper `ct(client, toolName, args)` de `handlers.test.ts` para contornar o index-signature `{ [x: string]: unknown }` retornado pelo SDK.
