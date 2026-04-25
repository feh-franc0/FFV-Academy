# 07 — Architecture Decision Records (ADRs)

Cada decisão técnica importante vira um ADR. Formato: contexto → decisão → consequências → alternativas rejeitadas.

**Status possíveis:** proposed | accepted | superseded | deprecated.

Ordem: cronológica. Numeração nunca reusada.

---

## ADR-001 — Linguagem: TypeScript + ESM

**Status:** accepted (2026-04-25)

**Contexto:** preciso escolher uma linguagem para o MCP. Opções razoáveis: TypeScript, Python, Go (mesmo do backend).

**Decisão:** TypeScript + ESM, Node ≥ 20.

**Consequências:**
- ✅ Stack alinhada com o frontend FFV — facilita reuso futuro de tipos.
- ✅ SDK MCP oficial é mais maduro em TS.
- ✅ Tooling (npm, npx) facilita distribuição (`npx ffv-mcp-academy`).
- ❌ Diverge da linguagem do backend (Go) — duas codebases, dois mindsets.
- ❌ Node em produção exige cuidado com runtime version mismatch.

**Alternativas rejeitadas:**
- **Go** (mesmo do backend): SDK MCP em Go é menos maduro; `npx` é melhor distribuição que binary.
- **Python**: bom SDK também, mas não tenho stack Python no resto do projeto — adicionaria runtime extra.

---

## ADR-002 — Transport: stdio (v1), HTTP fica pra v3

**Status:** accepted (2026-04-25)

**Contexto:** MCP suporta stdio, HTTP, SSE. Preciso escolher.

**Decisão:** stdio na v1 e v2. HTTP só se v3 acontecer.

**Consequências:**
- ✅ stdio é trivial pra setup local; Claude Desktop/Code já suporta.
- ✅ Sem servidor pra hospedar = zero custo.
- ❌ Single-user. Cada cliente Claude spawna seu processo.
- ❌ Sem auditoria centralizada.

**Alternativas rejeitadas:**
- **HTTP agora:** over-engineering pra single-user. Custo de hospedagem sem benefício real.

---

## ADR-003 — Auth: JWT Bearer estático em env (v1), refresh automático (v1.1), OAuth (v3)

**Status:** accepted (2026-04-25), parcialmente superseded por v1.1 (refresh)

**Contexto:** o backend FFV usa magic link → JWT (TTL 15min) + refresh cookie HttpOnly. MCP precisa autenticar pra mutations admin.

**Decisão evolutiva:**
- v1: token estático em env var (simplicidade, demo).
- v1.1: refresh automático (`POST /auth/refresh` → novo access).
- v3: OAuth/OIDC com identidade por usuário.

**Consequências v1:**
- ❌ Token expira em 15min — uso real inviável (ver R-AUTH-01).

**Consequências v1.1:**
- ✅ Uso prolongado funciona.
- ❌ Refresh token persistido em arquivo local — vazamento ainda é problema (R-SEC-01).

**Alternativas rejeitadas v1:**
- Magic link no MCP: complexo (precisa interagir com email), inadequado pra processo headless.
- API Key separada do JWT: backend não suporta hoje. Mudança de backend só pra MCP = scope creep.

---

## ADR-004 — Cliente HTTP: escrito à mão (v1), gerado de OpenAPI (v2)

**Status:** accepted (2026-04-25)

**Contexto:** preciso falar com o backend. Opções: escrever fetch à mão, gerar de OpenAPI, usar lib (axios/ky).

**Decisão:** mão na v1 (OpenAPI incompleta cobrindo curriculum); gerar de OpenAPI completa na v2.

**Consequências:**
- ✅ v1 começa rápido sem depender de fix da spec.
- ❌ Tipos podem desincronizar (R-DEP-02).
- ✅ v2 elimina drift via codegen.

**Alternativas rejeitadas:**
- **axios:** dep extra, native fetch é suficiente.
- **trpc/openapi-fetch:** força mudança no backend (não usa openapi-fetch contract).

---

## ADR-005 — Validação: Zod nas tools, backend é a autoridade final

**Status:** accepted (2026-04-25)

**Contexto:** entrada das tools vem do LLM, que pode inventar formatos. Precisa validação antes de chamar backend.

**Decisão:**
- Validação sintática estrita via Zod (rejeita early, mensagens claras pro LLM).
- Validação semântica fica no backend (regra de negócio).
- Não duplicar regras de negócio no MCP.

**Consequências:**
- ✅ Erros do LLM viram feedback útil ("dificuldade deve ser intermediate, não medium").
- ✅ Backend permanece source of truth.
- ❌ Schemas Zod podem desincronizar do backend — daí ADR-004 v2 (codegen).

---

## ADR-006 — Layout: 4 arquivos com responsabilidade única

**Status:** accepted (2026-04-25)

**Contexto:** projeto pequeno. Tentação de tudo num arquivo, ou tentação de over-decompor.

**Decisão:** `index.ts` (bootstrap) + `config.ts` + `client.ts` + `tools.ts`. Sem subpastas até justificar (provável v2: `src/tools/` com um arquivo por grupo de tools).

**Consequências:**
- ✅ Navegação trivial.
- ✅ Mock-friendly (cliente isolado).
- ❌ `tools.ts` cresce até virar problema — refator quando passar de ~400 linhas.

---

## ADR-007 — Tools de mutação em massa: rejeitadas

**Status:** accepted (2026-04-25)

**Contexto:** brainstorm sugeriu `bulk_update`, `migrate_articles`, etc. Tentação real.

**Decisão:** rejeitadas. Mutações em massa = scripts versionados (Go/SQL), não LLM.

**Consequências:**
- ✅ Risco de catástrofe (R-DATA-02 ampliado) eliminado.
- ❌ Algumas operações continuam manuais.

**Razão:** LLM é probabilístico. Operação destrutiva determinística não combina.

---

## ADR-008 — Features de aprendizado vão pra branch experimental, não main

**Status:** accepted (2026-04-25)

**Contexto:** objetivo dual (autor solo + veículo de aprendizado pra trabalho) cria conflito de incentivos. Tentação de implementar OAuth, multi-tenant, etc., "porque vai ser útil aprender".

**Decisão:** se uma feature **não resolve dor concreta do autor solo agora**, vai pra branch `feat/learn-*` ou repo separado. Main serve o produto, não o aprendizado.

**Consequências:**
- ✅ Main fica enxuta, focada.
- ✅ Aprendizado não polui produto.
- ❌ Algum aprendizado fica em ramos órfãos — aceitável.

---

## ADR-009 — v3 (multi-user) só com sinal real de demanda

**Status:** accepted (2026-04-25)

**Contexto:** tentação de "construir pra escalar desde o dia 1".

**Decisão:** v3 (multi-user) tem gate de entrada — ≥1 pedido formal externo + ADR autorizando. Nada construído antes.

**Consequências:**
- ✅ Foco em valor real.
- ✅ Decisões v3 podem ser informadas pelo uso de v2 (melhor que adivinhar).
- ❌ Quando v3 chegar, refator não-trivial. Aceito — speculative work seria pior.

---

## ADR-010 — Documentação em português

**Status:** accepted (2026-04-25)

**Contexto:** o resto do projeto FFV é em português. Comentários, docs, mensagens de erro.

**Decisão:** manter consistência. PT-BR em todo lugar exceto IDs/keys de código (que ficam em inglês por convenção).

**Consequências:**
- ✅ Consistência cognitiva.
- ❌ Se v4 virar produto open-source público, traduzir.

---

## ADR-011 — Erros das tools viram texto com `isError: true`, não throw

**Status:** accepted (2026-04-25)

**Contexto:** o protocolo MCP tem 2 caminhos pra erro — exception (interrompe protocolo) ou response com `isError: true` (LLM lê e decide).

**Decisão:** sempre `isError: true`. Exception só pra falha estrutural (ex: protocolo quebrou, env inválida).

**Consequências:**
- ✅ LLM consegue tentar de novo, ajustar input, etc.
- ✅ Cliente MCP não desconecta por erro de domínio.
- ❌ Erros estruturais ainda podem acontecer e quebrar a sessão — aceitável.

---

## Template para novos ADRs

```markdown
## ADR-XXX — Título curto

**Status:** proposed | accepted | superseded by ADR-YYY | deprecated (data)

**Contexto:** o problema, restrições, forças em jogo.

**Decisão:** o que foi decidido, em uma frase.

**Consequências:**
- ✅ Positivas
- ❌ Negativas

**Alternativas rejeitadas:** com razão.
```
