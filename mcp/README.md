# FFV Academy — MCP Server

MCP (Model Context Protocol) server que expõe o currículo da **FFV Academy** ao Claude. Permite listar, ler, buscar, criar, editar e deletar artigos diretamente do Claude Desktop ou Claude Code, sem abrir o painel admin.

**Versão:** v0.1.0 — escopo: gestão de currículo.

> 📚 **Planejamento, decisões e roadmap completos em [`docs/`](./docs/README.md).** Comece por [`docs/00-VISION.md`](./docs/00-VISION.md) e leia [`docs/01-CRITICAL-REVIEW.md`](./docs/01-CRITICAL-REVIEW.md) — esse último lista honestamente o que está errado/frágil na v0.1.0.

---

## Por que existe

Você cria conteúdo o tempo todo. Antes desse MCP, escrever um artigo novo significava:
1. Abrir admin → checar se já existe algo similar
2. Voltar pro editor, escrever
3. Abrir admin de novo, colar, configurar metadados, publicar

Com o MCP, vc fala com o Claude:
> *"Escreve um artigo sobre prompt caching no hub de IA. Antes confere se já tem algo parecido, calibra o tom pelos meus últimos 2 artigos do hub, e publica como rascunho."*

E ele faz tudo via tools.

---

## Tools disponíveis (v1)

| Tool | Auth | O que faz |
|---|---|---|
| `list_articles` | público | Lista artigos (filtra por trilha, paginação) |
| `read_article` | público | Lê um artigo completo (Markdown) por slug |
| `search_articles` | público | Busca por similaridade no título |
| `find_duplicates` | público | Busca + agrupa por trilha pra avaliar sobreposição |
| `create_article` | admin | Cria novo artigo |
| `update_article` | admin | PATCH parcial em artigo existente |
| `delete_article` | admin | Soft-delete (exige `confirm: true`) |

---

## Pré-requisitos

- **Node.js ≥ 20**
- Backend FFV Academy rodando (local ou produção)
- Para tools admin: JWT com `role=admin` (ver [obter token](#obter-token-admin))

---

## Instalação

```bash
cd mcp
npm install
npm run build
```

Build gera `dist/index.js` (executável shebang).

---

## Configuração

Copie `.env.example` para `.env` e preencha:

```bash
FFV_API_BASE_URL=http://localhost:8080      # ou https://api.fernandofrancovalle.com
FFV_ADMIN_TOKEN=eyJhbGciOi...                # JWT admin (opcional para leitura)
FFV_HTTP_TIMEOUT_MS=15000                    # opcional
```

> O MCP roda como processo filho do Claude — ele recebe as env vars que você define no `claude_desktop_config.json` (não lê `.env` automaticamente). O `.env` serve pra dev/teste local.

### Obter token admin

A API usa magic link. Pra dev:

```bash
# 1. Solicitar token (chega no Mailhog em dev: http://localhost:8025)
curl -X POST http://localhost:8080/api/v1/auth/request-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com"}'

# 2. Verificar com o código de 6 dígitos do email
curl -X POST http://localhost:8080/api/v1/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email-admin@dominio.com","token":"123456"}'
# → copia accessToken da resposta
```

⚠️ TTL do access token é curto (15min default). Para uso prolongado, considere aumentar o TTL via env do backend ou implementar refresh automático no v2 do MCP.

---

## Plugar no Claude Desktop

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

Reinicie o Claude Desktop. As tools aparecem automaticamente.

## Plugar no Claude Code

```bash
claude mcp add ffv-academy \
  -e FFV_API_BASE_URL=http://localhost:8080 \
  -e FFV_ADMIN_TOKEN=eyJhbGciOi... \
  -- node /Users/fernandofranco/Developer/fernandofrancovalledotcom/mcp/dist/index.js
```

Verifique:

```bash
claude mcp list
```

Deve aparecer `ffv-academy ✓ Connected`.

---

## Exemplos de uso

```
"Lista os 10 últimos artigos da trilha de IA fundamentos."
→ list_articles(trail_id="ia-fundamentos", limit=10)

"Procura artigos sobre 'prompt caching' antes de eu escrever um novo."
→ find_duplicates(topic="prompt caching")

"Lê o artigo 'introducao-claude' e me sugere melhorias no estilo."
→ read_article(slug="introducao-claude")

"Cria um artigo de intermediário sobre 'cache breakpoints no Claude'
 no hub 'ia', trilha 'claude-anthropic'. Use o conteúdo abaixo."
→ create_article(...)

"Marca o artigo 'old-thing' como despublicado."
→ update_article(slug="old-thing", published=false)
```

---

## Desenvolvimento

```bash
npm run dev        # tsc --watch
npm run typecheck  # checa tipos sem emitir
npm run clean      # remove dist/
```

Estrutura:

```
src/
├── index.ts    # entry point + bootstrap stdio
├── config.ts   # carregamento de env vars
├── client.ts   # cliente HTTP da API + tipos
└── tools.ts    # registro de tools MCP + schemas Zod
```

### Decisões arquiteturais

- **TypeScript + ESM** — alinhado com o frontend; SDK MCP oficial é TS-first.
- **Cliente HTTP escrito à mão** (não gerado da OpenAPI) — a spec não cobre os endpoints de currículo ainda. Adicionar à spec depois e regenerar é trivial.
- **stdio transport** — single-user local. v2 pode adicionar HTTP/SSE pra uso multi-usuário.
- **Token estático em env** — simples e seguro pra dev solo. v2 deve adicionar refresh-token rotation.
- **Erros viram texto** com `isError: true` em vez de exception — é o que o protocolo MCP espera; o LLM lê e decide retry/correção.

---

## Roadmap v2

- [ ] Refresh token automático (driblar TTL de 15min)
- [ ] Tool `find_gaps(trail_id)` — comparar artigos existentes contra estrutura planejada da trilha
- [ ] Tool `bulk_update` — alterar metadados em lote (ex: republicar trilha inteira)
- [ ] Resource MCP expondo o catálogo completo como contexto navegável
- [ ] Tools de simulados — `list_simulados`, `get_attempt_stats` (admin)
- [ ] Tools de stats admin — XP global, top usuários, conversão de paywall
- [ ] Cobrir endpoints faltantes na OpenAPI (curriculum + admin curriculum) e gerar tipos via `openapi-typescript`
- [ ] Suite de testes (Vitest) com mock do fetch
- [ ] Publicar como pacote npm privado pra outros usarem via `npx`

---

## Troubleshooting

**`Esta operação exige FFV_ADMIN_TOKEN configurado`** → você chamou uma tool de mutação sem token. Defina `FFV_ADMIN_TOKEN` na config do MCP.

**`API error 401: token expirado`** → access token expirou (15min). Gere um novo via fluxo magic-link.

**`Timeout (15000ms) em ...`** → backend não respondeu. Confira `FFV_API_BASE_URL` e se o backend está up (`curl $FFV_API_BASE_URL/healthz`).

**Tool não aparece no Claude** → reinicie o cliente Claude (Desktop) ou rode `claude mcp reset-server ffv-academy` (Code).

**`✗ Failed` em `claude mcp list`** → rode `node dist/index.js` direto no terminal e veja o erro em stderr.
