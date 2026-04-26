# 02 — Roadmap

Versionamento semântico. Cada release tem **critério de saída obrigatório** — não avança até bater todos.

---

## v0.1.0 — MVP funcional ✅ (entregue em 2026-04-25)

**Escopo:** 7 tools de currículo, build limpo, smoke test do protocolo MCP, README usável.

**Limitações conhecidas (ver `01-CRITICAL-REVIEW`):** token expira em 15min, sem testes, sem observabilidade, sem preview de update, sem descoberta de hubs/trilhas.

---

## v0.2.0 — "Viabilidade + qualidade" ✅ (entregue em 2026-04-25)

> Consolidação das críticas P0 e P1 do `01-CRITICAL-REVIEW`. Entregue na mesma sessão que a v0.1.0.

### O que foi entregue

- **R1.2 ✅** `preview_article_update` — diff campo a campo sem aplicar nada. Resolve crítica #4.
- **R1.4 ✅** `list_hubs` e `list_trails` com JSON estático bundlado. Resolve crítica #5.
- **R1.5 ✅** `find_duplicates` renomeado para `find_similar_titles`. Resolve crítica #3.
- **R2.1 ✅** 52 testes Vitest cobrindo `config.ts`, `client.ts` e lógica de `tools.ts`. Resolve crítica #2.
- **R2.2 ✅** Logging JSON estruturado em stderr (`ts`, `tool`, `status`, `ms`). Resolve crítica #6.
- **Parcial #1 ✅** 401 com mensagem acionável — curl de renovação exibido no erro.
- **Parcial #8 ✅** `confirm: true` removido de `delete_article`. Descrição com aviso real.
- **Bug ✅** `trail39` órfão removido do `TRAILS_STATIC`.
- **CHANGELOG.md** criado.

### O que ficou pendente desta fase

- **R1.1** Refresh token automático — ainda necessário (ver v1.1.0 abaixo).
- **R1.3** Validar backup do Postgres — pré-condição operacional, não código MCP.

### Critério de saída (todos atingidos)

- [x] `preview_article_update` retorna diff válido (28 testes cobrem `buildDiff`).
- [x] `list_hubs` e `list_trails` funcionando com taxonomia real do currículo.
- [x] 52 testes passando, build + typecheck limpos.
- [x] Logging JSON emitido em cada chamada de tool.
- [x] CHANGELOG atualizado.

---

## v1.1.0 — "Refresh de token" — alvo: próxima sprint

> O único item que ainda bloqueia uso real no dia a dia.

### Must (bloqueante)

- **R1.1** Refresh token automático.
  - MCP guarda refresh token em `~/.config/ffv-mcp/credentials.json` (modo 0600).
  - Renova access automaticamente antes de expirar (margem 60s).
  - Resolve crítica #1 completamente.

- **R1.3** Validar backup do Postgres (pré-requisito operacional, não código MCP).
  - Testar restore de 1 artigo deletado antes de usar mutations em produção.
  - Ver `06-RISKS` R-DATA-01.

### Critério de saída

- [ ] Token não precisa ser renovado manualmente por ≥ 24h de uso real contínuo.
- [ ] Restore do Postgres testado e documentado no runbook.

---

## v2.0.0 — "Profissional para uso solo" — alvo: 4-6 semanas

> O que falta para separar "ferramenta de trabalho" de "demo legal".

### Must (bloqueante)

- **R2.3** Confirmação humana via MCP elicitation no `delete_article`.
  - Se cliente MCP suportar elicitation, usar. Senão, remover a tool e orientar para o painel web.
  - Resolve crítica #8 completamente.
- **R2.4** Tipos gerados da OpenAPI.
  - Pré-requisito: completar a OpenAPI spec do backend para endpoints de currículo.
  - `npm run codegen` baixa spec e gera `src/api-types.ts`.
  - CI falha se spec mudou e MCP não foi rebuildado.
  - Resolve crítica #13.

### Should

- **R2.5** MCP Resources expondo o catálogo.
  - URI scheme `ffv://curriculum/{slug}` retorna conteúdo do artigo como resource navegável.
- **R2.6** MCP Prompts.
  - `prompt://write-article-ffv-style` parametrizado por hub.
  - `prompt://review-article` com checklist de qualidade FFV.
- **R2.7** Backoff exponencial em 429 e retry idempotente em 5xx. Resolve crítica #7.
- **R2.8** Tool `mcp_health()` — status do backend + latência.

### Could

- Cache de leitura (TTL 60s) para `list_articles` e `read_article`.
- Modo dry-run global via env `FFV_MCP_DRY_RUN=1`.

### Won't (rejeitado)

- ❌ `bulk_update` — operações em massa via LLM são perigosas (crítica #10).
- ❌ Tools de simulados/billing — ROI não justificado (crítica #11).
- ❌ `find_gaps` no formato vago — só quando `CURRICULUM_MASTER_PLAN` for parseável (crítica #9).

### Critério de saída

- [ ] Pelo menos 1 Resource e 1 Prompt funcionais e documentados.
- [ ] Tipos da OpenAPI gerados e CI configurado.
- [ ] Aceitação interna: 30 dias sem precisar abrir painel admin para criação/edição.
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
