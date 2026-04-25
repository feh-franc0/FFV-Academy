# 04 — Validação

> **Validação ≠ Verificação.**
> - **Validação** (este doc): "estamos construindo a coisa certa?" — métricas de produto, uso real, ROI.
> - **Verificação** ([05-VERIFICATION](./05-VERIFICATION.md)): "estamos construindo a coisa certo?" — testes, segurança, qualidade.

---

## Métricas de produto

Cada métrica tem: **definição operacional**, **fonte**, **alvo**, **cadência de medição**.

### M1 — Tempo de criação de artigo

- **Definição:** tempo do cronômetro entre "decidi escrever sobre X" e "artigo está publicado no admin".
- **Fonte:** medição manual em planilha. Marcar 10 antes do MCP, 10 depois.
- **Alvo (G1):** redução ≥ 50%.
- **Cadência:** medido continuamente nos primeiros 10 artigos pós-v1.1, depois amostragem semanal.
- **Falha:** se 10 medições pós-v1.1 não baterem alvo, voltar pra `01-CRITICAL-REVIEW` e identificar root cause.

### M2 — Taxa de duplicação

- **Definição:** número de artigos detectados como duplicatas semânticas em revisão mensal manual.
- **Fonte:** revisão pessoal mensal de novos artigos.
- **Alvo (G2):** redução ≥ 80% vs baseline (registrar baseline antes da v1.1).
- **Cadência:** mensal.
- **Risco:** essa métrica depende de eu fazer a revisão honestamente. Se eu não fizer, métrica é morta.

### M3 — Cobertura funcional vs painel admin

- **Definição:** % das operações que eu faço hoje no painel admin que o MCP cobre.
- **Fonte:** lista enumerada das operações + checklist.
- **Alvo (G3, v2):** 100%.
- **Cadência:** revisado a cada release.

### M4 — Adoção pessoal

- **Definição:** % de artigos criados via MCP vs via painel admin nos últimos 30 dias.
- **Fonte:** audit log do backend (filtra mutations por User-Agent, ou por origem se isso for instrumentado).
- **Alvo:** ≥ 80% após v2.
- **Cadência:** mensal.
- **Sinal de fracasso:** < 50% após 30 dias da v2 = MCP não está resolvendo dor real.

### M5 — Confiabilidade percebida

- **Definição:** número de vezes que eu desisto de uma operação no MCP e vou pro painel admin.
- **Fonte:** anotação manual (uma linha num arquivo `friction-log.md`).
- **Alvo:** < 1 por semana após v2.
- **Cadência:** semanal.

### M6 — Erros de conteúdo gerado

- **Definição:** número de artigos que precisaram ser corrigidos por erro do LLM (slug errado, hub errado, conteúdo factualmente errado) detectado em até 7 dias.
- **Fonte:** `friction-log.md`.
- **Alvo:** < 1 a cada 5 artigos.
- **Cadência:** revisão semanal.

---

## Critérios de saída por release (gates)

Estes são os gates que **bloqueiam** uma release. Se algum falhar, release é segurada.

### Gate v1.1

| Critério | Como medir | Bloqueia? |
|---|---|---|
| Refresh automático funciona ≥ 24h sem reinício | Uso real, observação | sim |
| `preview_article_update` retorna diff válido em 5 cenários | Teste manual scriptado | sim |
| Backup de Postgres testado em restore | Simulação restore | sim |
| `list_hubs` / `list_trails` listam pelo menos os hubs em uso | Inspeção | não |
| `find_duplicates` renomeada | Code review | não |
| Documentação atualizada | Revisão | sim |

### Gate v2.0

| Critério | Como medir | Bloqueia? |
|---|---|---|
| Cobertura ≥ 70% linhas | `vitest --coverage` | sim |
| Logs estruturados verificados em uso | Inspeção stderr | sim |
| OpenAPI completa + tipos gerados + CI rodando | Build CI | sim |
| `delete_article` com elicitation OU removida | Code review | sim |
| ≥ 1 Resource e 1 Prompt funcionais | Demo manual | sim |
| 30 dias de uso solo sem precisar do painel | Diário de uso | sim |
| M1, M2 atingidos e registrados | Planilha | sim |
| Penetration test (mesmo que básico) documentado | Doc | não |
| `friction-log.md` revisado e itens críticos atacados | Revisão | sim |

### Gate v3.0 (entrada, não saída)

Pra **entrar** na v3 precisa antes:

- ≥ 1 pedido formal externo (issue, mensagem documentada).
- ADR autorizando, com análise de custo/benefício.
- Reserva de tempo de manutenção formalmente acordada.

---

## Validação contínua (post-release)

### Healthcheck mensal

Toda primeira segunda-feira do mês:

1. Rodar `claude mcp list` — confirmar que conecta.
2. Rodar 1 chamada de cada tool (smoke).
3. Conferir `friction-log.md` — algum item recorrente?
4. Conferir M4 (adoção pessoal) — ainda usando?

Se **dois meses seguidos** com baixo uso ou problemas recorrentes, abrir investigação:
- Razão técnica? → vai pra roadmap.
- Razão de produto (não preciso mais)? → considerar deprecar.

### Validação de continuidade

Se passarem 6 meses sem release e sem issues abertas, perguntar:
- O MCP ainda resolve a dor original?
- A dor original ainda existe?
- Vale manter? (resposta honesta — manter código vivo custa)

---

## Anti-padrões de validação a evitar

- ❌ **"Funciona na minha máquina"** = não é validação. Sem métricas medidas, é opinião.
- ❌ **"Os usuários (eu) parecem felizes"** = vibes não substituem M1-M6.
- ❌ **"Não recebi reclamação"** = ausência de evidência ≠ evidência de ausência. Especialmente em uso solo onde "reclamar pra quem?".
- ❌ **Métricas vaidosas** ("número de tools" não é métrica de sucesso).
- ❌ **Gate flexível** — se você flexibilizou um gate "porque está perto", o gate não existia.

---

## Como o `friction-log.md` deve ser preenchido

Arquivo na raiz do projeto MCP, formato simples:

```markdown
## 2026-04-25
- find_similar_titles: Claude pediu "casper" e não encontrou nada óbvio. Esperado: deveria sugerir variações.
- create_article: Claude usou hub_id="programacao" mas o id correto é "programming". Faltou list_hubs.

## 2026-04-26
- ...
```

Revisar semanalmente. Itens recorrentes viram issues. Itens únicos viram contexto.
