# 09 — Roteiro de Teste Manual (E2E)

> Teste do MCP FFV Academy v0.2.0 com o protocolo real — Claude Code + backend local.
> Execute na ordem. Cada bloco pode ser testado independentemente se o pré-requisito estiver satisfeito.

---

## Pré-requisitos

```bash
# 1. Backend rodando
cd backend && go run ./cmd/api
# ou: make dev

# 2. Build do MCP
cd mcp && npm run build

# 3. Plugar no Claude Code
claude mcp add ffv-academy \
  -e FFV_API_BASE_URL=http://localhost:8080 \
  -e FFV_ADMIN_TOKEN=SEU_TOKEN \
  -- node /Users/fernandofranco/Developer/fernandofrancovalledotcom/mcp/dist/index.js

# 4. Confirmar conexão
claude mcp list
# esperado: ffv-academy ✓ Connected
```

> **Para obter FFV_ADMIN_TOKEN:** ver seção "Renovar token admin" no `CLAUDE.md` ou no `README.md`.

---

## Bloco 1 — Taxonomia (offline, sem backend, sem token)

### Teste 1 — list_hubs

**Prompt:**
> "Use a tool list_hubs e me diz quantos hubs existem e quais são os IDs."

**Validar:**
- Retorna exatamente **8 hubs**
- IDs presentes: `hub-ia`, `hub-aws`, `hub-engenharia`, `hub-claude-anthropic`, `hub-fundamentos`, `hub-programacao`, `hub-dados`, `hub-construcao`
- Nenhuma chamada ao backend (funciona sem internet/backend)

---

### Teste 2 — list_trails com filtro

**Prompt:**
> "Liste as trilhas do hub 'hub-claude-anthropic' usando list_trails."

**Validar:**
- Retorna exatamente **3 trilhas**: `trail13`, `trail17`, `trail18`
- Nomes incluem "Claude Code", "API Claude" e "Harness Engineering"

---

### Teste 3 — list_trails sem filtro

**Prompt:**
> "Liste todas as trilhas sem filtro e me diz o total."

**Validar:**
- Total > 50 trilhas
- Nenhuma trilha com `hubId` inválido (todos os hubIds devem estar no resultado do Teste 1)

---

## Bloco 2 — Leitura (requer backend, sem token admin)

### Teste 4 — list_articles com paginação

**Prompt:**
> "Liste os primeiros 5 artigos da trilha 'trail1' usando list_articles."

**Validar:**
- Retorna JSON com `data` (array), `total`, `limit=5`
- Nenhum campo `content_md` exposto na listagem (só metadados)

---

### Teste 5 — find_similar_titles

**Prompt:**
> "Busca artigos similares ao tópico 'prompt caching' usando find_similar_titles e me diz se é seguro criar um artigo novo sobre isso."

**Validar:**
- Retorna `total_matches`, `trails_touched`, `groups` agrupados por trilha
- Campo `recommendation` presente (uma de três frases: "espaço livre para criar" / "provavelmente seguro criar" / "revise antes de criar")
- Campo `note` menciona a palavra **"TÍTULO"**
- Claude emite uma opinião sobre segurança baseada na recommendation

---

### Teste 6 — search_articles

**Prompt:**
> "Busca direta com search_articles pelo termo 'Claude'. Quantos resultados aparecem?"

**Validar:**
- Retorna `data` com array de artigos
- Sem `content_md` nos resultados (só metadados)
- Claude reporta o número de resultados

---

### Teste 7 — read_article

> ⚠️ Substitua `SLUG-EXISTENTE` por um slug real do seu banco antes de rodar.

**Prompt:**
> "Lê o artigo com slug 'SLUG-EXISTENTE' usando read_article."

**Validar:**
- Retorna artigo completo **com** `content_md` em Markdown
- Campos presentes: `id`, `slug`, `title`, `trail_id`, `hub_id`, `difficulty`, `xp`, `read_time`, `published`

---

## Bloco 3 — Mutação (requer FFV_ADMIN_TOKEN válido)

> ⚠️ Nos testes 8–11, substitua `SLUG-EXISTENTE` por um artigo real do seu banco.

### Teste 8 — preview_article_update com mudança real

**Prompt:**
> "Quero mudar o título do artigo 'SLUG-EXISTENTE' para 'Novo Título Teste MCP'. Usa preview_article_update para me mostrar o diff antes de aplicar qualquer coisa."

**Validar:**
- Retorna `preview_only: true`
- Campo `diff` mostra `{ field: "title", changed: true, before: "...", after: "Novo Título Teste MCP" }`
- Campo `fields_changed: 1`
- Campo `next_step` sugere o comando `update_article` a chamar
- **Nada foi alterado no banco** — verificar lendo o artigo depois

---

### Teste 9 — preview_article_update sem mudança real

**Prompt:**
> "Preview de update no artigo 'SLUG-EXISTENTE' passando exatamente o título atual que ele já tem."

*(Leia o artigo primeiro para saber o título atual.)*

**Validar:**
- Retorna `no_changes: true` e `fields_changed: 0`
- Campo `next_step` diz que update não teria efeito

---

### Teste 10 — create_article (fluxo completo)

**Prompt:**
> "Cria um artigo de teste. Antes verifica os hubs e trilhas disponíveis, escolhe a trilha mais adequada para um artigo sobre 'Testes de integração em Go', e cria o artigo com slug 'teste-integracao-go-mcp', dificuldade intermediária, conteúdo mínimo de 2 parágrafos em Markdown."

**Validar:**
- Claude chama `list_hubs` e/ou `list_trails` **antes** de criar (não inventa IDs)
- Escolhe `hub-engenharia` e uma trilha de engenharia (ex: `trail33` — Testing Engineering)
- Retorna `{ slug: "teste-integracao-go-mcp" }`
- Confirmar no banco que o artigo existe com `published: false`

---

### Teste 11 — update_article

**Prompt:**
> "Agora publica o artigo 'teste-integracao-go-mcp' usando update_article com published=true."

**Validar:**
- Retorna artigo atualizado com `published: true`
- Verificar no banco que o campo mudou

---

### Teste 12 — delete_article (confirmação correta)

**Prompt:**
> "Delete o artigo 'teste-integracao-go-mcp'. Lembra que você precisa passar o slug nos dois campos: slug e confirm_slug."

**Validar:**
- Claude passa `slug="teste-integracao-go-mcp"` **e** `confirm_slug="teste-integracao-go-mcp"`
- Retorna `{ deleted: "teste-integracao-go-mcp" }`
- Confirmar no banco que o artigo foi soft-deleted (não deve aparecer no currículo público)

---

## Bloco 4 — Tratamento de Erros

### Teste 13 — Artigo inexistente (404)

**Prompt:**
> "Tenta ler o artigo com slug 'artigo-que-nao-existe-xyz123'."

**Validar:**
- Retorna erro legível mencionando **404**
- Claude não trava nem entra em loop de retry

---

### Teste 14 — Token expirado ou ausente (401)

**Prompt:**
> "Tenta criar um artigo qualquer." *(Remova ou invalide o FFV_ADMIN_TOKEN na config antes de rodar.)*

**Validar:**
- Erro 401 com instruções de renovação contendo os **comandos curl completos**
- A URL nos comandos é a URL real do backend (`http://localhost:8080/...`), **não** a string literal `$FFV_API_BASE_URL`
- Mensagem menciona `FFV_ADMIN_TOKEN`

---

### Teste 15 — delete_article com confirm_slug errado

**Prompt:**
> "Delete o artigo 'artigo-alvo-teste', mas passa 'artigo-errado' como confirm_slug."

**Validar:**
- Retorna `isError: true` com mensagem **"Confirmação inválida"**
- Artigo **não é deletado** (confirmar no banco)
- Claude reporta o erro e não tenta novamente automaticamente

---

## Bloco 5 — Observabilidade

Após qualquer tool chamada, verificar os logs:

```bash
claude mcp logs ffv-academy
```

**Validar em cada linha de log:**
- Campo `ts` — timestamp ISO
- Campo `tool` — nome da tool chamada
- Campo `status` — `"ok"` ou `"error"`
- Campo `ms` — tempo de execução em milissegundos
- Em erros HTTP: campo `httpStatus` presente (ex: 503, 404)
- Em erros internos: campo `error` presente
- **Nenhuma linha** contém o token JWT, passwords ou corpo de requests autenticadas

---

## Checklist de resultado esperado

| # | Tool | Cenário | Resultado esperado |
|---|---|---|---|
| 1 | `list_hubs` | padrão | 8 hubs, sem backend |
| 2 | `list_trails` | filtro hub-claude-anthropic | 3 trilhas |
| 3 | `list_trails` | sem filtro | > 50 trilhas |
| 4 | `list_articles` | trail1, limit=5 | 5 artigos sem content_md |
| 5 | `find_similar_titles` | "prompt caching" | grupos + recommendation + note com TÍTULO |
| 6 | `search_articles` | "Claude" | array de artigos |
| 7 | `read_article` | slug existente | artigo com content_md |
| 8 | `preview_article_update` | mudança de título | diff com changed=true, sem alterar banco |
| 9 | `preview_article_update` | mesmo título | no_changes=true |
| 10 | `create_article` | fluxo completo | usa list_hubs/list_trails antes, cria rascunho |
| 11 | `update_article` | published=true | artigo publicado no banco |
| 12 | `delete_article` | slugs idênticos | soft-delete executado |
| 13 | `read_article` | 404 | erro legível, sem loop |
| 14 | `create_article` | 401 sem token | instrução curl com URL real |
| 15 | `delete_article` | confirm_slug errado | isError, sem deletar |

**Todos os 15 passando = MCP pronto para uso em produção.**

---

## Se algo falhar

| Sintoma | Causa provável | Como investigar |
|---|---|---|
| `ffv-academy ✗ Failed` em `claude mcp list` | dist/ não existe ou Node < 20 | `node dist/index.js` direto no terminal |
| Tool não aparece no Claude | Config mal formatada | Checar JSON em `claude mcp list --verbose` |
| Erro 401 em toda tool admin | Token expirado | Seguir instruções no erro, renovar token |
| Timeout em toda leitura | Backend off | `curl http://localhost:8080/healthz` |
| `Confirmação inválida` em delete legítimo | Claude não repetiu o slug corretamente | Reformular o prompt pedindo explicitamente os dois campos |
