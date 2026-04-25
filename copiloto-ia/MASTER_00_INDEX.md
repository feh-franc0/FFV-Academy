# 📂 Master Index — Projeto Copiloto IA

> Esta é a **série canônica** do projeto. Os arquivos `MASTER_*` são a fonte da verdade. Os docs anteriores (`ARQUITETURA_*`, `ANALISE_CRITICA_E_PITCH`, `ASSISTENTE_IA_COMPLETO`, `VERSOES_DO_PRODUTO`) são **referências históricas** — leia se quiser ver a evolução do pensamento, mas **não trate como decidido**.

---

## Como ler

**Se você tem 10 minutos:** leia só este index + a seção "Decisões críticas pendentes" no `MASTER_01`.

**Se você vai apresentar pro chefe:** `MASTER_01` (análise honesta) + `MASTER_03` (plano integrado).

**Se você vai começar a executar:** os 5 arquivos, na ordem.

**Se você é jurídico/compliance:** vai direto pro `MASTER_05`.

---

## Arquivos da série

| # | Arquivo | O que tem | Quando ler |
|---|---|---|---|
| 00 | `MASTER_00_INDEX.md` | Este arquivo. Mapa da série. | Primeiro |
| 01 | `MASTER_01_ANALISE_CRITICA.md` | Crítica honesta de tudo proposto até aqui. Build vs buy. Premissas que precisam ser validadas **antes** de codar. | Antes de decidir investir |
| 02 | `MASTER_02_ORGANIZACAO.md` | Organograma, papéis, RACI, governança, rituais, comitês de decisão. | Antes de montar time |
| 03 | `MASTER_03_PLANO_INTEGRADO.md` | Plano único integrando arquitetura, versões, milestones, gates de qualidade e dependências. | Para executar |
| 04 | `MASTER_04_VALIDACAO.md` | Como provar que cada etapa funcionou. Métricas de aceitação por gate. Critérios de kill switch. | Continuamente durante execução |
| 05 | `MASTER_05_RISCOS_LGPD.md` | Riscos sérios, LGPD (obrigatório no Brasil), responsabilidade civil, plano de contingência. | Antes de qualquer dado real entrar no sistema |

---

## Decisões críticas que ainda estão em aberto

Estas decisões precisam de resposta **antes** de começar. Estão detalhadas no `MASTER_01`, mas listadas aqui para visibilidade:

1. ⚠️ **Build vs buy** — existem produtos prontos (Glean, Intercom Fin, Forethought, Ada). Por que não usar? Resposta honesta exigida.
2. ⚠️ **A documentação interna existe?** Se não, o projeto morre na v3. Esse é o killer #1.
3. ⚠️ **Quem é o DPO/responsável LGPD?** Se ninguém, tem que ser definido antes de qualquer dado de cliente passar pelo bot.
4. ⚠️ **Cliente final vai usar ou só colaborador?** Muda completamente o nível de risco e a estratégia.
5. ⚠️ **Bus factor.** Plano com 1 dev é frágil. Aceita o risco ou contrata 2?
6. ⚠️ **Orçamento real aprovado?** R$ 60k de MVP + R$ 20k/mês de operação. Patrocinador identificado?
7. ⚠️ **Quem da operação dedica tempo?** Sem product owner real, projeto vira shelfware em 3 meses.

Sem resposta clara para essas 7 perguntas, **não comece**. O custo de começar errado e abandonar é maior que o custo de demorar 2 semanas pra alinhar.

---

## Convenções desta série

- **⚠️** = ponto crítico, perda de dinheiro/tempo/credibilidade se ignorado.
- **🚦** = gate de decisão (vai/não vai).
- **🔒** = obrigação legal ou de segurança.
- **💰** = impacto financeiro relevante.
- **👥** = decisão organizacional, não técnica.

---

## O que estes docs **não** são

- Não são contrato. Premissas mudam, atualize os docs.
- Não são especificação técnica detalhada. Issues no Jira/Linear cobrem isso.
- Não são plano de marketing. Foco é construção e operação interna.
- Não substituem conversa cara-a-cara com patrocinador, jurídico e operação. **São base para essas conversas.**
