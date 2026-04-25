# 05 — Verificação

> "Estamos construindo a coisa **certo**?" — testes, segurança, qualidade técnica.

---

## Pirâmide de testes

```
            ┌──────────────┐
            │  E2E manual  │   ← v2: protocolo MCP real
            │   (poucos)   │
            └──────────────┘
        ┌─────────────────────┐
        │  Contract tests     │   ← v2: schema das tools
        │  (alguns)           │
        └─────────────────────┘
    ┌─────────────────────────────┐
    │  Unit tests (muitos)        │   ← v2: cliente, config, utils
    └─────────────────────────────┘
```

**Estado atual (v0.1):** zero testes. **Bloqueante pra v2** (ver `02-ROADMAP` R2.1).

---

## Estratégia por camada

### Unit (Vitest) — cobre ≥70% linhas

| Módulo | O que testa |
|---|---|
| `config.ts` | Parsing de env, defaults, rejeição de valores inválidos |
| `client.ts` | Construção de URLs, headers, parsing de erros (Problem+JSON), timeout, propagação de ApiError |
| `tools.ts` | Validação Zod (entrada inválida rejeitada), formatação de output, tratamento de exceção em `safe()` |

**Mock estratégia:** `globalThis.fetch = vi.fn(...)`. Não usa MSW — simplicidade > poder.

**O que NÃO testar em unit:** o backend real. Isso é integração (próximo nível, opcional).

### Contract — schema do protocolo

Testar que cada tool retorna shape válido:
- `list_articles` retorna `content[0].text` parseável como JSON com keys `data`, `total`, `limit`, `offset`.
- Erros retornam `isError: true`.

Isso pega regressões em mudanças de output sem precisar de stack inteiro.

### E2E — opcional, manual

Roteiro de smoke documentado em `tests/e2e-smoke.md`:

1. Iniciar backend local (`make dev` no backend).
2. Gerar token admin.
3. `claude mcp add ffv-academy ...` apontando pra dist/.
4. Rodar 7 prompts (um por tool) no Claude Code.
5. Conferir efeitos no banco.

Frequência: antes de cada release v.x.0.

---

## Checklist de qualidade de código

Aplicado antes de merge em main:

- [ ] `npm run typecheck` passa.
- [ ] `npm run build` gera `dist/` sem warnings.
- [ ] Nenhum `any` introduzido sem comentário justificando.
- [ ] Erros são `ApiError` ou `Error` — nunca `throw "string"`.
- [ ] Toda nova tool tem schema Zod completo (descrições incluídas).
- [ ] Toda nova tool tem entrada no README e no `02-ROADMAP` se mudou escopo.
- [ ] Mensagens de erro **em português** (consistente com FFV).

---

## Revisão de segurança

### Threat model resumido (v1)

| Ameaça | Vetor | Severidade | Mitigação atual | Gap |
|---|---|---|---|---|
| Vazamento de admin token | env var em config | 🔴 | Arquivo de config local (não commitado) | Não há expiração curta — token vaza = vaza por TTL inteiro |
| Mutação não autorizada via MCP | Claude alucina mutation | 🟡 | Confirmação `confirm:true` (teatro), backend exige role=admin | Elicitation real (v2) |
| Replay de chamada | Atacante intercepta | 🟢 | HTTPS no backend; em local não importa | n/a |
| Injection no SQL | Via `slug` parametrizado | 🟢 | Backend usa prepared statements (verificado) | n/a |
| Path traversal em slug | `../something` | 🟢 | `encodeURIComponent` no client; backend valida | n/a |
| Negação de serviço | LLM em loop | 🟡 | Backend tem rate limit IP | Adicionar backoff client-side (v2) |
| Conteúdo malicioso (XSS no MD) | LLM gera MD com `<script>` | 🟡 | Renderização do front sanitiza? **Verificar** | TODO |
| Token leak via logs | logger imprime headers | 🟢 | Hoje só loga `admin=yes/no` | Manter sanitização ao adicionar logging estruturado |

### Checklist de revisão de segurança por release

- [ ] Nenhum segredo commitado (verificado com `git diff` antes de push).
- [ ] `.env` no `.gitignore`.
- [ ] Logs não imprimem `Authorization` headers, tokens, ou bodies de requests autenticadas.
- [ ] Dependências: `npm audit` sem CVEs alta/crítica.
- [ ] Mensagens de erro pro usuário não vazam stack traces nem caminhos internos do backend.

### Plano de pen-test básico (v2)

Antes de v3 multi-user, fazer pelo menos:

1. **Token forjado:** chamar tool admin com token válido mas role=user → deve retornar 403.
2. **Token expirado:** simular expiração, observar erro útil.
3. **Slug malicioso:** `../`, `; DROP TABLE`, unicode tricks. Deve voltar erro estruturado, não 500.
4. **Body gigante:** enviar `content_md` com 10MB. Backend tem body limit (verificar).
5. **Concurrent writes:** 2 chamadas `update_article` no mesmo slug. Ver comportamento.

Documentar resultados em `tests/pentest-v2.md`.

---

## Lint e formatação

### Decisão atual: minimal

Não estou usando ESLint/Prettier no MCP. Razão: projeto é pequeno, TypeScript strict + revisão manual cobrem 95%. **Crítica honesta:** isso vira problema quando outra pessoa entrar.

**v2:** adicionar `prettier` + `eslint` com config compatível com o frontend (já usa). Fixar formatação no CI.

---

## Dependências

### Política

- **Política de adoção:** só adiciona dep se substitui ≥ 50 linhas de código próprio ou cobre algo crítico (segurança, protocolo).
- **Atualização:** revisar mensalmente via `npm outdated`. Major updates exigem leitura do CHANGELOG da dep.
- **Pinning:** `package.json` usa `^` (compatible). `package-lock.json` é fonte da verdade.

### Inventário atual

| Dep | Por que existe | Risco se quebrar |
|---|---|---|
| `@modelcontextprotocol/sdk` | Protocolo MCP | Crítico — sem ela, não há produto |
| `zod` | Validação de input das tools | Médio — substituível |
| `typescript` (dev) | Tipagem | Crítico em build, irrelevante em runtime |
| `@types/node` (dev) | Tipos do Node | Médio |

Total: 4 deps diretas. Manter assim.

---

## CI (a construir na v2)

Pipeline mínimo (GitHub Actions):

```yaml
on: [push, pull_request]
jobs:
  ci:
    steps:
      - npm ci
      - npm run typecheck
      - npm run build
      - npm run test -- --coverage
      - check coverage ≥ 70%
      - npm audit --audit-level=high
```

E **fail loud** se algum passo falhar.

---

## Auditoria de qualidade trimestral

A cada 3 meses, revisar:

1. `friction-log.md` — top 5 fricções recorrentes viram backlog.
2. Métricas M1-M6 — ainda atingidas?
3. Dependências — outdated?
4. ADRs em `07-DECISIONS` — alguma virou obsoleta?
5. Documentação — alguma página não foi tocada e está desatualizada?

Output da auditoria: 1 página em `docs/audits/YYYY-QN.md`.
