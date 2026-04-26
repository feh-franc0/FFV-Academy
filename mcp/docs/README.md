# FFV Academy MCP — Documentação de Planejamento

Suite de documentos para planejar, validar e operar o MCP server da FFV Academy de forma profissional. Cada documento tem um propósito específico e é mantido independente.

**Audiência:** você (mantenedor solo hoje), e qualquer pessoa que entrar amanhã.

**Estado atual:** v0.2.0 implementada — 10 tools, 52 testes, logging JSON, preview de update. Próximo: v1.1.0 (refresh de token automático).

---

## Como usar essa documentação

| Quando você quer… | Leia… |
|---|---|
| Entender por que esse MCP existe | [00-VISION.md](./00-VISION.md) |
| Saber o que está errado / mal pensado | [01-CRITICAL-REVIEW.md](./01-CRITICAL-REVIEW.md) |
| Saber o que vem depois | [02-ROADMAP.md](./02-ROADMAP.md) |
| Entender como o sistema funciona | [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) |
| Saber se a versão atual está pronta | [04-VALIDATION.md](./04-VALIDATION.md) |
| Saber como testar / auditar | [05-VERIFICATION.md](./05-VERIFICATION.md) |
| Entender riscos e mitigações | [06-RISKS.md](./06-RISKS.md) |
| Entender decisões técnicas | [07-DECISIONS.md](./07-DECISIONS.md) |
| Operar / debugar em produção | [08-OPERATIONS.md](./08-OPERATIONS.md) |
| Ver o brainstorm original de ideação | [99-EXPLORATORY-NOTES.md](./99-EXPLORATORY-NOTES.md) |

---

## Princípios de manutenção desta documentação

1. **Crítica antes de elogio.** Documento que só elogia o trabalho é propaganda, não engenharia. O `01-CRITICAL-REVIEW` é o mais importante.
2. **Cada decisão grande vira um ADR** em `07-DECISIONS.md`. Sem ADR, não tem decisão — só preferência.
3. **Roadmap tem critério de saída.** Versão não avança porque "achei que tá pronto"; avança quando os critérios de `04-VALIDATION` foram atingidos.
4. **Riscos vivem.** O `06-RISKS` é revisado antes de cada release.
5. **Documento que ninguém lê morre.** Se um arquivo aqui não foi consultado em 6 meses, considere remover.

---

## Convenções

- **MoSCoW** para prioridade: Must / Should / Could / Won't.
- **Tamanho de versão**: v1 = MVP utilizável, v2 = robusto solo, v3 = multi-usuário, v4 = profissional/corporativo.
- **Idioma**: português neste repo (consistente com o resto do projeto FFV).
- **Diagramas**: Mermaid embutido em Markdown — renderiza no GitHub e no Cursor/VS Code.
