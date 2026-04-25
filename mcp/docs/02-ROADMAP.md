# 02 — Roadmap

Versionamento semântico. Cada release tem **critério de saída obrigatório** — não avança até bater todos.

---

## v0.1.0 — MVP funcional ✅ (entregue)

**Escopo:** 7 tools de currículo, build limpo, smoke test do protocolo MCP, README usável.

**Limitações conhecidas (ver `01-CRITICAL-REVIEW`):** token expira em 15min, sem testes, sem observabilidade, sem preview de update, sem descoberta de hubs/trilhas.

**Status:** instalável, mas inviável pra uso diário.

---

## v1.1.0 — "Hotfix de viabilidade" — alvo: 1 semana

> Esta release existe porque a v0.1.0 não é usável no dia a dia. Sem ela, o MCP morre antes de provar valor.

### Must (bloqueante)

- **R1.1** Refresh token automático.
  - Implementar fluxo: MCP guarda refresh token, renova access antes de expirar (margem 60s).
  - Token persistido em arquivo local (~/.config/ffv-mcp/credentials.json, modo 0600).
  - Resolve crítica #1.
- **R1.2** Tool `preview_article_update(slug, patches)` retornando diff unificado antes de aplicar.
  - Nada é gravado. LLM mostra o diff ao usuário humano antes de chamar `update_article`.
  - Resolve crítica #4.
- **R1.3** Validar plano de backup do backend (ver `06-RISKS` R-DATA-01).
  - Não é código MCP, mas é **pré-requisito**: sem backup confiável, mutations MCP são suicídio.

### Should

- **R1.4** Tools `list_hubs` e `list_trails`, alimentadas por JSON estático bundlado.
  - Aceita drift. Atualizar manualmente quando estrutura mudar.
  - Resolve crítica #5.
- **R1.5** Renomear `find_duplicates` → `find_similar_titles`.
  - Resolve crítica #3.

### Could

- Documentar processo de geração de token admin com TTL longo (claim especial?).

### Critério de saída

- [ ] Token não precisa ser renovado manualmente por ≥ 24h de uso real.
- [ ] `preview_article_update` retorna diff válido em ≥ 5 cenários testados.
- [ ] Backup do Postgres testado em restore (rollback de 1 artigo deletado).
- [ ] CHANGELOG atualizado.

---

## v2.0.0 — "Profissional para uso solo" — alvo: 4-6 semanas

> Tudo que separa "demo legal" de "ferramenta de trabalho".

### Must (bloqueante)

- **R2.1** Cobertura de testes ≥70% linhas.
  - Vitest. Mock de fetch. Cobre client.ts, tools.ts, config.ts.
  - Tests de contrato: cada tool MCP retorna no shape esperado.
  - Resolve crítica #2.
- **R2.2** Logging estruturado em stderr (JSON lines).
  - Campos: ts, level, tool, params_hash, duration_ms, status, error_kind.
  - Não loga PII (sanitiza emails, tokens).
  - Resolve crítica #6.
- **R2.3** Confirmação humana via MCP elicitation no `delete_article`.
  - Se cliente MCP suportar elicitation, usar. Senão, deprecar a tool.
  - Resolve crítica #8.
- **R2.4** Tipos gerados da OpenAPI.
  - Pré-requisito: completar a OpenAPI spec do backend pros endpoints de currículo.
  - `npm run codegen` baixa spec e gera `src/api-types.ts`.
  - CI falha se spec mudou e MCP não foi rebuildado.
  - Resolve crítica #13.

### Should

- **R2.5** MCP Resources expondo o catálogo.
  - URI scheme `ffv://curriculum/{slug}` retorna o conteúdo do artigo como resource.
  - Permite Claude "anexar" artigos sem chamar `read_article` explicitamente.
- **R2.6** MCP Prompts.
  - `prompt://write-article-ffv-style` parametrizado por hub.
  - `prompt://review-article` que faz checklist de qualidade.
- **R2.7** Backoff exponencial em 429 e retry idempotente em 5xx.
  - Resolve crítica #7.
- **R2.8** Health check tool: `mcp_health()` retornando status backend + latência.

### Could

- Cache de leitura (TTL 60s) pra `list_articles` e `read_article` quando o LLM iterar.
- Modo dry-run global via env (`FFV_MCP_DRY_RUN=1`) que loga mutations mas não envia.

### Won't (rejeitado)

- ❌ `bulk_update` (crítica #10).
- ❌ Tools de simulados/billing — ROI não justificado (crítica #11).
- ❌ `find_gaps` no formato vago — só com `CURRICULUM_MASTER_PLAN` parseável (crítica #9).

### Critério de saída

- [ ] Cobertura ≥70% medida por Vitest.
- [ ] Logs estruturados visíveis em uso real.
- [ ] Tipos da OpenAPI gerados e CI configurado.
- [ ] Pelo menos 1 Resource e 1 Prompt funcionais e documentados.
- [ ] Aceitação interna: 30 dias de uso sem precisar abrir painel admin pra criação/edição.
- [ ] Métricas G1, G2 do `00-VISION` mensuradas e atingidas.

---

## v3.0.0 — "Multi-usuário (caso aconteça)" — alvo: trigger-driven, sem prazo

> **Não construir até ter sinal de demanda real** (1+ pessoa pedindo acesso). Especulação aqui custa caro.

### Must

- **R3.1** Transport HTTP/SSE em vez de stdio.
  - Servidor único, hospedado.
- **R3.2** OAuth/OIDC pra autenticação por usuário.
  - Cada chamada MCP é feita em nome de um usuário identificado.
- **R3.3** RBAC respeitando roles do FFV (admin/user).
  - Tools de mutação só pra admin. Leitura pra qualquer autenticado.
- **R3.4** Audit log de toda chamada (quem, quando, qual tool, params, resultado).
- **R3.5** Rate limit por usuário no MCP, independente do backend.
- **R3.6** Tenant isolation se mais de uma "conta admin" existir.

### Should

- **R3.7** Painel de admin do MCP (stats de uso, quem usou o quê).
- **R3.8** Política de retenção de logs (LGPD).

### Critério de entrada (gate)

- ≥1 pedido formal de outra pessoa.
- Decisão arquitetural assinada em `07-DECISIONS` autorizando o esforço.
- Análise de custo (hospedar, manter) vs benefício documentada.

### Critério de saída

- [ ] 2+ usuários reais usando por 30 dias.
- [ ] Audit log testado (consulta + filtragem).
- [ ] Penetration test básico documentado em `05-VERIFICATION`.

---

## v4.0.0 — "Padrão corporativo / referência pro trabalho" — sem prazo

> Esta versão é especulativa. Existe pra documentar pra onde isso pode ir, **não pra ser construída sem demanda**.

Cenários possíveis:

### Cenário A — MCP público pra alunos da FFV Academy

Permite alunos plugarem o Claude deles em FFV pra "Claude, me explica esse artigo", "começa um simulado de X", "como tá meu progresso?". Mudança radical de modelo: vira *parte do produto*.

**Pré-requisitos:** modelo de billing (rate limit por plano), termos de uso de IA, auditoria de tudo, content moderation (Claude pode sugerir simulados não-existentes etc.).

**Decisão:** só revisitar quando FFV tiver ≥ 1000 usuários ativos. Antes disso, ROI é zero.

### Cenário B — Template open-source de "MCP pra SaaS B2B"

Extrair padrões deste código pra um repo público que sirva de referência. Mover lógica genérica pra biblioteca, deixar FFV como exemplo de implementação.

**Decisão:** acontece se eu tiver tempo e o código estiver maduro (pós-v2 estável por 3+ meses).

### Cenário C — Replicação pro trabalho profissional

Levar o aprendizado pra um MCP corporativo no meu trabalho. **Esse cenário não envolve este código** — é um projeto separado que reusa as decisões documentadas aqui.

**Decisão:** não tem trabalho a fazer aqui; só usar `07-DECISIONS` e `01-CRITICAL-REVIEW` como referência ao planejar o MCP de trabalho.

---

## Princípios do roadmap

1. **Versão não avança sem critério de saída batido.** Sem exceção.
2. **Toda v.x.0 tem release notes em `CHANGELOG.md`** (ainda não criado — criar na v1.1).
3. **Hotfixes (v.x.y onde y > 0)** vão direto pra branch `release/x.y` e rebatem na main via cherry-pick.
4. **Roadmap é vivo.** Revisado a cada release. Itens podem ser rebaixados, promovidos ou rejeitados com base em uso real.
5. **Won't é decisão.** Tirar do roadmap exige nota em `07-DECISIONS`.
