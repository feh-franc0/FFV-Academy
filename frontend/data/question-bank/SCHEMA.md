# Question Bank — Schema

> Versionamento dos arquivos JSON do banco de questões dos simulados.
> Source-of-truth do tipo: `frontend/src/lib/simulados.ts` (`SimuladoQuestion`, `QuestionExplanation`).

---

## Versões do schema

| `schemaVersion` | Quando | Explicação |
|-----------------|--------|------------|
| **(ausente, v1)** | até maio/2026 | `explanation` é **string única** no formato `(a) ... (b) ... (c) ... (d) ...` |
| **2** | maio/2026 → atual | `explanation` é **objeto rico** `QuestionExplanation` |

> Os arquivos **sem** `schemaVersion` são tratados como v1 (string). A partir de v2, o campo aparece no topo do arquivo.

---

## Schema v2 (atual) — pseudo-código

```ts
{
  "schemaVersion": 2,
  "certification": "CLF-C02",
  "version": "pilot-v1",                  // identificador humano do lote
  "generatedAt": "2026-05-14",
  "totalQuestions": 15,
  "distribution": { /* opcional */ },
  "notes": "...",
  "questions": [
    {
      "id": "clf-c02-001",                // ID estável; ver convenção abaixo
      "stem": "Pergunta em PT-BR...",
      "options": [
        { "id": "A", "text": "..." },
        { "id": "B", "text": "..." },
        { "id": "C", "text": "..." },
        { "id": "D", "text": "..." }
      ],
      "correctId": "B",
      "explanation": {                    // <-- objeto QuestionExplanation
        "summary":         "1-2 frases TLDR",
        "whyCorrect":      "Por que B está certo + regra/princípio AWS",
        "whyWrong": {
          "A": "Por que A erra",
          "C": "Por que C erra",
          "D": "Por que D erra"
        },
        "keyConcept":      "Shared Responsibility Model",
        "compareWith":     ["IAM vs SCP", "Roles vs Users"],      // opcional
        "realWorldContext":"Cenário típico onde isso aparece",     // opcional
        "commonMistakes":  "Pegadinha comum",                      // opcional
        "tutorSeeds": [                                            // opcional
          "Pode explicar com mais detalhe: Shared Responsibility Model?",
          "Quais cenários reais aplicam Shared Responsibility Model?",
          "Como AWS Lambda se compara com alternativas?"
        ]
      },
      "topic": "Security & Compliance",
      "domain": "Security & Compliance",
      "domainWeight": 30,
      "difficulty": "easy",
      "scenarioType": "scenario",
      "tags": ["shared-responsibility", "ec2"],
      "references": [{ "title": "...", "url": "..." }],
      "source": "ai-draft" | "human-reviewed"
    }
  ]
}
```

### Regras dos campos da explanation

- `summary` — máx ~280 chars; resposta rápida.
- `whyCorrect` — explicação completa do **porquê** da correta, ancorando em regra AWS (Well-Architected, Shared Responsibility, etc.).
- `whyWrong` — chave = `id` da opção (`A`/`B`/`C`/`D`/`E`); **não inclui** a opção correta. Idealmente uma frase por distractor.
- `keyConcept` — nome canônico do conceito testado. Reutilizar entre questões correlatas (importante para agrupamento e analytics).
- `tutorSeeds` — perguntas em **1ª pessoa do usuário** que o TutorChat pode oferecer como atalho ("Pode explicar X?"). Gerar 2–3.

### Marcador `TODO_REVIEW`

O script de migração `frontend/scripts/migrate-cf-explanations.mjs` faz best-effort para mapear cada distractor à sua justificativa no bloco `(b)` original. Quando a heurística falha, escreve o conteúdo com prefixo `TODO_REVIEW:` para revisão humana posterior.

```jsonc
"whyWrong": {
  "A": "RDS não é IaaS",
  "C": "TODO_REVIEW: não há SSH no host RDS",     // precisa revisão manual
  "D": "patches de engine são da AWS dentro da versão"
}
```

**Convenção**: PRs novos não devem deixar `TODO_REVIEW` em arquivos versionados. Para migrações em lote pode-se permitir temporariamente, mas com issue de follow-up.

---

## Integração futura com TutorChat

`tutorSeeds[]` é consumido pelo TutorChat após o usuário marcar uma resposta:

```
[ Você errou. Quer aprofundar? ]
  ┌────────────────────────────────────────────────────┐
  │ ❓ Pode explicar com mais detalhe: Shared Responsibility Model? │
  │ ❓ Quais cenários reais aplicam Shared Responsibility Model?    │
  │ ❓ Como AWS IAM se compara com alternativas?                    │
  └────────────────────────────────────────────────────┘
```

Cada seed clicada vira o primeiro `user` message numa conversa com Claude API, com `whyCorrect + whyWrong[chosenId] + keyConcept` no system prompt como contexto.

---

## Convenção de IDs por domínio

| Certificação | Prefixo de id | Exemplo |
|--------------|---------------|---------|
| AWS CLF-C02 | `clf-c02-NNN` (sequencial global) ou `clf-c02-<dominio>-NNN` | `clf-c02-001`, `clf-c02-sec-002` |
| AWS DVA-C02 | `dva-c02-NNN` ou `dva-c02-<dominio>-NNN` | `dva-c02-dev-015` |

- Domínio em minúsculo, abreviado (`cc`, `sec`, `tech`, `bil`, `dev`, `dep`, `tbl`).
- IDs são **imutáveis**: nunca renumerar. Para deprecar, marcar `"deprecated": true` na questão.
- Cross-file uniqueness é garantida globalmente; o loader (`flattenBank`) deduplica por id.

---

## Como adicionar uma nova versão (v3, v4, …) sem quebrar v1/v2

1. **Adicione** novos campos como `optional` no tipo TS (`QuestionExplanation` em `simulados.ts`). Nunca remova campos antigos sem 1+ ciclo de deprecação.
2. **Bump** `schemaVersion` no novo arquivo (`schemaVersion: 3`).
3. **Atualize** o type guard `isRichExplanation` se a forma do objeto mudar drasticamente; senão mantenha.
4. **Crie um script** `migrate-X-vN.mjs` em `frontend/scripts/` para migrar bancos antigos. Sempre gerar `*.vN-backup.json` antes de sobrescrever (já gitignored).
5. **Backward-compat de leitura**: o frontend deve continuar abrindo arquivos v1 e v2 enquanto existirem em produção. Use `isRichExplanation` para discriminar.
6. **Backward-compat de escrita**: novos JSONs devem sempre nascer na versão mais recente.

### Por que `string | QuestionExplanation` na union?

Permite migrar arquivos por lotes (e revisar antes de promover) sem quebrar o frontend. Renderizadores chamam `getExplanationText()` que aceita ambas e devolve string plana — suficiente para fallback enquanto componentes ricos (cards expansíveis, TutorChat hand-off) são construídos.

---

## Arquivos atuais

| Arquivo | Versão | Questões | Status |
|---------|--------|----------|--------|
| `clf-c02-pilot-v1.json` | v2 | 15 | migrado |
| `clf-c02-cloud-concepts-v1.json` | v2 | 80 | migrado |
| `clf-c02-security-v1.json` | v2 | 100 | migrado |
| `clf-c02-tech-v1.json` | v2 | 100 | migrado |
| `clf-c02-billing-v1.json` | v2 | 40 | migrado |
| `clf-c02-security-v2.json` | v2 (nativo) | — | criado já em v2 |
| `dva-c02-*-v1.json` | v1 (string) | — | migração pendente |
