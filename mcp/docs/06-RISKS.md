# 06 — Riscos

Cada risco tem ID, descrição, impacto, probabilidade, status e mitigação. **Revisado antes de cada release.**

Severidade = Impacto × Probabilidade. Escala 1-5 cada → score 1-25.

---

## Riscos ativos

### R-AUTH-01 — Token admin de TTL curto inviabiliza uso real

- **Categoria:** UX / Operacional
- **Impacto:** 5 (sem token, MCP é inútil)
- **Probabilidade:** 5 (já está acontecendo na v0.1)
- **Score:** 25 🔴 CRÍTICO
- **Status:** ativo, em mitigação
- **Mitigação:** v1.1 R1.1 — refresh automático
- **Owner:** mantenedor
- **Prazo:** v1.1

### R-DATA-01 — Mutation MCP sem backup confiável = perda irrecuperável

- **Categoria:** Dados / Segurança
- **Impacto:** 5 (artigos perdidos = trabalho perdido)
- **Probabilidade:** 3 (depende de bug ou má instrução)
- **Score:** 15 🔴 ALTO
- **Status:** ativo, **bloqueante pra v1.1**
- **Mitigação:** validar e testar restore do Postgres do backend ANTES de qualquer uso de mutation MCP em produção
- **Owner:** mantenedor (do backend e do MCP)
- **Prazo:** antes de declarar v1.1 produção

### R-DATA-02 — `update_article` sem versionamento sobrescreve tudo

- **Categoria:** Dados
- **Impacto:** 4 (revert exige restore do banco inteiro)
- **Probabilidade:** 2 (reduzida — `preview_article_update` disponível desde v0.2.0)
- **Score:** 8 🟡 MÉDIO (era 16 🔴)
- **Status:** mitigado parcialmente (v0.2.0)
- **Mitigação aplicada:** `preview_article_update` entregue — diff antes de aplicar. Workflow documentado no README.
- **Mitigação longa:** backend precisa versionar artigos (separado do MCP)
- **Owner:** mantenedor
- **Prazo:** versionamento de artigos → v3

### R-LLM-01 — LLM gera metadados inválidos (slug, hub, trail)

- **Categoria:** Qualidade / Conteúdo
- **Impacto:** 2 (rejeição do backend retorna erro útil)
- **Probabilidade:** 2 (reduzida — `list_hubs` e `list_trails` disponíveis desde v0.2.0)
- **Score:** 4 🟢 BAIXO (era 8 🟡)
- **Status:** mitigado (v0.2.0)
- **Mitigação aplicada:** `list_hubs` e `list_trails` entregues. `create_article` instrui explicitamente a usá-las.
- **Owner:** mantenedor
- **Prazo:** fechado — monitorar drift de taxonomia

### R-LLM-02 — LLM gera conteúdo factualmente errado e publica

- **Categoria:** Qualidade
- **Impacto:** 3 (artigo com erro = dano de reputação se publicado)
- **Probabilidade:** 3 (depende do prompt do autor)
- **Score:** 9 🟡 MÉDIO
- **Status:** aceito com mitigação humana
- **Mitigação:** workflow recomendado é criar com `published=false`, revisar humano, depois publicar
- **Mitigação técnica:** considerar default `published=false` no MCP (em vez de aceitar do LLM)
- **Owner:** autor (no workflow); mantenedor (no default)
- **Prazo:** v1.1 (default)

### R-SEC-01 — Token vazado fica válido até expirar

- **Categoria:** Segurança
- **Impacto:** 4 (acesso admin)
- **Probabilidade:** 2 (token só está no config local)
- **Score:** 8 🟡 MÉDIO
- **Status:** ativo
- **Mitigação:** TTL curto (já é o caso). Refresh com rotação no v1.1 limita janela de exposição.
- **Mitigação longa:** v3 troca pra OAuth — token só é emitido on-demand.
- **Owner:** mantenedor
- **Prazo:** mitigação parcial em v1.1

### R-SEC-02 — Logs vazam segredos

- **Categoria:** Segurança
- **Impacto:** 4
- **Probabilidade:** 3 (fácil esquecer ao adicionar log)
- **Score:** 12 🟡 MÉDIO
- **Status:** ativo (sem logging hoje, mas vai ter)
- **Mitigação:** v2 R2.2 — logger com sanitização explícita; checklist em PR
- **Owner:** mantenedor
- **Prazo:** v2

### R-DEP-01 — Quebra do `@modelcontextprotocol/sdk`

- **Categoria:** Dependência
- **Impacto:** 5 (sem SDK, projeto morre)
- **Probabilidade:** 2 (SDK oficial Anthropic, manutenção ativa)
- **Score:** 10 🟡 MÉDIO
- **Status:** monitorado
- **Mitigação:** pin de versão; ler CHANGELOG antes de upgrade; cobertura de testes pega regressões
- **Owner:** mantenedor
- **Prazo:** revisão mensal

### R-DEP-02 — Backend muda contrato sem aviso

- **Categoria:** Integração
- **Impacto:** 4 (MCP quebra silenciosamente)
- **Probabilidade:** 3 (mesmo dono, mas esquecimento acontece)
- **Score:** 12 🟡 MÉDIO
- **Status:** ativo
- **Mitigação:** v2 R2.4 — tipos gerados da OpenAPI + CI quebra se spec mudar; testes de contrato
- **Mitigação imediata:** convenção: mudança em handler de currículo exige PR descrevendo impacto no MCP
- **Owner:** mantenedor (ambos repos)
- **Prazo:** v2

### R-OPS-01 — Sem observabilidade, problemas escondidos

- **Categoria:** Operacional
- **Impacto:** 3
- **Probabilidade:** 2 (reduzida — logging JSON em stderr desde v0.2.0)
- **Score:** 6 🟢 BAIXO (era 12 🟡)
- **Status:** mitigado (v0.2.0)
- **Mitigação aplicada:** logging JSON estruturado em stderr para cada chamada de tool (`ts`, `tool`, `status`, `ms`, `httpStatus`/`error`).
- **Owner:** mantenedor
- **Prazo:** fechado — métricas OpenTelemetry ficam para v2 se necessário

### R-PROD-01 — MCP não é adotado, vira código morto

- **Categoria:** Produto
- **Impacto:** 4 (esforço desperdiçado, sinaliza má decisão de produto)
- **Probabilidade:** 3
- **Score:** 12 🟡 MÉDIO
- **Status:** ativo
- **Mitigação:** métricas M1, M4 medidas honestamente; gate de v2 inclui 30 dias de uso real
- **Mitigação dura:** se M4 < 50% após 30 dias da v2, considerar deprecar
- **Owner:** mantenedor
- **Prazo:** revisão mensal pós v2

### R-SCOPE-01 — Over-engineering por "aprender pra trabalho"

- **Categoria:** Produto / Engenharia
- **Impacto:** 3 (atraso, complexidade desnecessária)
- **Probabilidade:** 4 (tentação real)
- **Score:** 12 🟡 MÉDIO
- **Status:** ativo
- **Mitigação:** ADR-008 — features só pra aprendizado vão pra branch experimental, não main
- **Owner:** mantenedor
- **Prazo:** disciplina contínua

### R-DOC-01 — Documentação desatualizada

- **Categoria:** Manutenção
- **Impacto:** 3
- **Probabilidade:** 4 (acontece em todo projeto)
- **Score:** 12 🟡 MÉDIO
- **Status:** ativo
- **Mitigação:** revisão de docs faz parte do checklist de release; auditoria trimestral em `05-VERIFICATION`
- **Owner:** mantenedor
- **Prazo:** contínuo

### R-CLAUDE-01 — Claude usa MCP de forma inesperada (loop, paralelismo destrutivo)

- **Categoria:** Comportamento de cliente
- **Impacto:** 3
- **Probabilidade:** 2
- **Score:** 6 🟢 BAIXO
- **Status:** aceito
- **Mitigação:** rate limit e idempotência no backend; backoff client-side (v2)
- **Owner:** mantenedor
- **Prazo:** v2

---

## Riscos retirados / fechados

### R-LEARN-01 — "Levar pro trabalho exige multi-user agora" (FECHADO)

- **Razão de fechamento:** ADR-009 explicita que multi-user só com sinal real (v3 gate). Aprendizado vem da arquitetura desenhada nos docs, não de código construído sem demanda.

---

## Matriz de risco (score)

```
           Probabilidade →
           1     2     3     4     5
        ┌─────┬─────┬─────┬─────┬─────┐
Impacto │     │     │     │     │     │
   5    │     │     │     │     │R-AUTH-01│
        ├─────┼─────┼─────┼─────┼─────┤
   4    │     │R-SEC-01│   │R-DATA-02│R-DATA-01│
        ├─────┼─────┼─────┼─────┼─────┤
   3    │     │R-CLAUDE-01│R-LLM-02│R-OPS-01│   │
        ├─────┼─────┼─────┼─────┼─────┤
   2    │     │     │     │R-LLM-01│   │
        ├─────┼─────┼─────┼─────┼─────┤
   1    │     │     │     │     │     │
        └─────┴─────┴─────┴─────┴─────┘
```

(Diagramas Mermaid não renderizam matriz X×Y bem; ASCII serve.)

---

## Política de aceitação de risco

- **Score ≥ 15 (🔴):** não pode existir em release de produção. Mitigação obrigatória ou release segurada.
- **Score 8-14 (🟡):** aceitável com mitigação documentada e prazo definido.
- **Score < 8 (🟢):** aceito, monitorado, sem ação obrigatória.

Mudança de status (ex: aceitar um 🔴) exige ADR.
