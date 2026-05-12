# MCP — Backlog de funcionalidades futuras

Items descartados do escopo atual. Revisitar quando o backend correspondente estiver pronto ou a prioridade mudar.

---

## Fase 2 — Pendente (backend + MCP)

### Gestão de Trilhas (CRUD)

**O que é:** Criar, editar e deletar trilhas via MCP (hoje trilhas são taxonomia estática em TypeScript).

**O que precisa:**
- Backend: novos endpoints `POST/PATCH/DELETE /api/v1/admin/trails` + migration com tabela `trails`
- Backend: `GET /api/v1/trails` retornando trilhas dinâmicas do banco
- MCP: substituir `HUBS_STATIC`/`TRAILS_STATIC` por chamada ao backend (`list_trails` dinâmico)
- MCP: tools `create_trail`, `update_trail`, `delete_trail`
- Frontend: sincronizar `frontend/src/lib/curriculum.ts` com trilhas do banco (ou consumir API)

**Risco:** Trilhas têm dependências profundas no frontend (rotas, componentes, SEO). Mudança requer coordenação entre backend, MCP e frontend.

---

## Fase 3 — Pendente

### Batch create de artigos

**O que é:** Criar múltiplos artigos em uma única chamada MCP.

**O que precisa:**
- MCP: tool `batch_create_articles` que itera sobre um array e chama `createArticle` para cada item
- Suporte a rollback parcial: registrar quais slugs foram criados e quais falharam
- Backend: opcional — endpoint batch para reduzir round-trips

### Auto-refresh do admin token

**O que é:** O MCP detecta token expirado (401) e automaticamente inicia o fluxo de magic link.

**O que precisa:**
- MCP: lógica de retry após 401 — chamar `POST /auth/request-token`, aguardar input do usuário com código, chamar `POST /auth/verify`, atualizar token em memória
- Problema: fluxo interativo (precisa do código de 6 dígitos do email) — requer UX clara no Claude

### WebSearch para pesquisar notícias

**O que é:** Tool que busca notícias reais na internet sobre um tópico para subsidiar criação de conteúdo.

**O que precisa:**
- Integração com API externa: Brave Search API, Tavily, ou similar
- Nova env var: `BRAVE_API_KEY` (ou equivalente)
- MCP: tool `search_web_news(topic, max_results?)` → retorna títulos + URLs + resumos
- Uso típico: pesquisar → resumir → criar notícia via `create_news`

### fetch_article_from_url

**O que é:** Extrai conteúdo de uma URL (artigo, blog post, docs) e transforma em rascunho Markdown para o currículo.

**O que precisa:**
- MCP: tool `fetch_article_from_url(url)` — faz HTTP GET, extrai texto principal (readability), retorna Markdown formatado
- Uso típico: colar URL de artigo externo → obter rascunho → editar → publicar via `create_article`

### sync_trail_taxonomy

**O que é:** Sincroniza automaticamente `HUBS_STATIC`/`TRAILS_STATIC` do MCP com o estado atual do currículo.

**O que precisa:**
- Depende da gestão dinâmica de trilhas (ver acima)
- MCP: tool `sync_trail_taxonomy` que compara taxonomia estática em memória com backend e alerta divergências

---

## Notas

- Items desta lista **não têm prazo** — são referência para o próximo ciclo de planejamento.
- Antes de retomar qualquer item, verificar se o endpoint de backend correspondente já existe com `curl http://localhost:8080/healthz`.
- Ao implementar gestão de trilhas, lembrar que `trail39` foi removido da taxonomia e não pertence a nenhum hub — verificar se o banco tem registros órfãos.
