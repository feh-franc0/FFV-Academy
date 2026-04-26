# Changelog

Formato: [Semantic Versioning](https://semver.org). Cada versão tem critério de saída definido em `docs/02-ROADMAP.md`.

---

## [0.2.0] — 2026-04-25

### Adicionado

- **`list_hubs`** — lista todos os hubs do currículo com IDs, slugs, nomes e trilhas. Resolve a crítica #5: antes `create_article` exigia `hub_id` sem nenhuma forma de descobri-lo.
- **`list_trails`** — lista trilhas, filtrável por `hub_id`. Mesmo motivo: o LLM adivinhava `trail_id` e errava.
- **`preview_article_update`** — lê o artigo atual e compara campo a campo com as mudanças propostas, sem aplicar nada. Para `content_md` mostra delta de chars em vez de expor o conteúdo completo. Resolve crítica #4: `update_article` era cego e destrutivo.
- **Logging estruturado em stderr** — JSON lines com `ts`, `tool`, `status`, `ms`. Erros incluem `httpStatus` ou `error`. Resolve crítica #6.
- **Mensagem de 401 acionável** — quando o token expira, o erro inclui os 3 comandos curl exatos para renovar via magic link e atualizar a config. Resolve parte da crítica #1.
- **Suíte de testes Vitest** — 52 testes em 3 arquivos cobrindo `config.ts`, `client.ts` e a lógica de `tools.ts`. Cobertura das principais branches e cenários de erro. Resolve critério de v2 R2.1.
- **Funções puras exportadas de `tools.ts`** — `HUBS_STATIC`, `TRAILS_STATIC`, `getTrails()`, `groupByTrail()`, `buildDiff()` são exportadas e testáveis sem depender do McpServer.

### Alterado

- **`find_duplicates` renomeado para `find_similar_titles`** — o nome antigo mentia: só busca por similaridade de título, não por duplicação semântica de conteúdo. Descrição atualizada para ser honesta. Resolve crítica #3.
- **`create_article`** — descrição agora instrui explicitamente a usar `list_hubs` e `list_trails` antes de chamar a tool.
- **`update_article`** — descrição inclui aviso de operação destrutiva e sugere `preview_article_update` antes.
- **`delete_article`** — campo `confirm: true` removido (era teatro: o LLM passava o valor sozinho). Aviso honesto adicionado à descrição: "sem rollback via MCP". Resolve parcialmente crítica #8.

### Corrigido

- `trail39` ("Search & Information Retrieval") estava no `TRAILS_STATIC` com `hubId: hub-engenharia` mas não pertence a nenhum hub no currículo. Removido para evitar induzir o LLM a erro.

### Infraestrutura

- Vitest `^4.1.5` adicionado como devDependency
- `vitest.config.ts` criado com threshold de cobertura ≥70%
- Scripts `test` e `test:watch` adicionados ao `package.json`

---

## [0.1.0] — 2026-04-25

### Adicionado

Primeira versão funcional do MCP Server da FFV Academy.

**Tools de leitura (auth pública):**
- `list_articles` — lista artigos com filtro por trilha e paginação
- `read_article` — lê artigo completo (incluindo `content_md`) por slug
- `search_articles` — busca por similaridade de título
- `find_duplicates` — agrupa resultados de busca por trilha (renomeado em v0.2.0)

**Tools de mutação (requer JWT admin):**
- `create_article` — cria novo artigo
- `update_article` — PATCH parcial
- `delete_article` — soft-delete com campo `confirm: true` (removido em v0.2.0)

**Infraestrutura:**
- TypeScript + ESM + `@modelcontextprotocol/sdk`
- `config.ts` — carrega e valida env vars (`FFV_API_BASE_URL`, `FFV_ADMIN_TOKEN`, `FFV_HTTP_TIMEOUT_MS`)
- `client.ts` — cliente HTTP com timeout via `AbortController`, parsing de Problem+JSON
- Schemas de input via Zod em `tools.ts`
- stdio transport (single-user)

**Limitações conhecidas na v0.1.0** (documentadas em `docs/01-CRITICAL-REVIEW.md`):
- Token admin expira em 15 min, sem renovação automática
- Zero testes
- Sem logging/observabilidade
- `update_article` sem preview/diff
- Sem discovery de hubs e trilhas
- `find_duplicates` busca só em títulos (nome enganoso)
- `confirm: true` em delete é teatro de segurança
