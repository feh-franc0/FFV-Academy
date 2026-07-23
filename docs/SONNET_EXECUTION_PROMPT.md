# Prompt mestre para Sonnet 4.6 — executar migração DB-driven do currículo

> Cole o prompt abaixo numa sessão nova do Sonnet 4.6 (Claude Code, contexto 1M). Ele é **self-contained** — não precisa de instruções adicionais. Anexe o repositório `/Users/fernandofranco/Developer/fernandofrancovalledotcom`.
>
> Inicie a sessão com modo permissivo: `--dangerously-skip-permissions` ou aceite todas as tools manualmente. Reserve ~2 horas pra Fase 1 inicial.

---

```
Você é um engenheiro sênior contratado para executar uma migração estrutural no
FFV Academy (academy.fernandofrancovalle.com), uma plataforma de educação BR.
Stack: Next.js 16 frontend (TypeScript), Go 1.25 backend (Chi + Postgres + Redis),
deploy SSR Docker na VPS Hostinger. CI: GitHub Actions. PT-BR.

## CONTEXTO

O sistema está LIVE em produção. Tem 1188 testes no front e suíte Go completa no
back. Toda mudança precisa ser:
- Idempotente (`IF NOT EXISTS`, `ON CONFLICT DO UPDATE`)
- Reversível (toda migration tem `.down.sql` testada)
- Pequena e fácil de revisar (1 migration = 1 arquivo, 1 conceito)
- Coberta por testes (não removar/quebrar testes existentes)

Estado atual do currículo está fragmentado:
- **Bases** (Tecnologia, Carreira, Comunicação, etc.) vivem no DB em `bases`,
  mas com fallback hardcoded em `backend/internal/interfaces/http/handlers/bases_handler.go`
- **Hubs / Trilhas / Módulos** vivem 100% em `frontend/src/lib/curriculum.ts`
  (arquivo de ~5900 linhas TypeScript hardcoded)
- **Conteúdo dos módulos** (blocks) está no DB em `curriculum_articles` + `module_blocks`
- **Simulados** vivem em `backend/internal/infrastructure/catalog/catalog.json`
  (//go:embed), mas as **questões** já estão na tabela `questions`

## OBJETIVO

Migrar tudo para o banco com encadeamento por FK:

```
Base (slug PK)
 └── Hub (id PK, base_slug FK NOT NULL)
       └── Trail (id PK, hub_id FK NOT NULL)
             └── Module (slug PK, trail_id FK NOT NULL)
                   ├── ModuleBlock (article_slug FK CASCADE) ← já existe
                   ├── ModuleQuiz (module_slug FK CASCADE)
                   ├── ModulePrerequisite (M:N self)
                   └── ModuleNextSuggested (M:N self ordered)

Base
 └── Simulado (id PK, base_slug FK NOT NULL)
       └── Question (id PK, simulado_id FK NOT NULL,
                     related_module_slug FK NULLABLE)
```

Frontend deixa de ler `curriculum.ts` e passa a consumir snapshot do backend
no build (`GET /api/v1/curriculum/snapshot` → `curriculum.generated.ts`).

## DOCUMENTOS QUE VOCÊ DEVE LER ANTES DE COMEÇAR (na ordem)

1. `/Users/fernandofranco/Developer/fernandofrancovalledotcom/CLAUDE.md`
   — regras do monorepo, protocolo de commit/push/CI
2. `/Users/fernandofranco/Developer/fernandofrancovalledotcom/frontend/CLAUDE.md`
   — convenções frontend, gotchas
3. `/Users/fernandofranco/Developer/fernandofrancovalledotcom/backend/CLAUDE.md`
   — arquitetura DDD do backend, migrations
4. `/Users/fernandofranco/Developer/fernandofrancovalledotcom/docs/MIGRATION_PLAN_DB_DRIVEN_CURRICULUM.md`
   — o plano completo (5 fases, deliverables, critérios)
5. `/Users/fernandofranco/Developer/fernandofrancovalledotcom/docs/DB_ARCHITECTURE_BASE_HUB_TRAIL_MODULE_QUESTION.md`
   — schema detalhado, decisões de design já travadas

Leia COMPLETAMENTE antes de tocar em qualquer código.

## MAPEAMENTO CANÔNICO HUB → BASE (LOCK-IN, NÃO MUDAR)

| Hub slug                    | Base slug         |
|-----------------------------|-------------------|
| ia                          | tecnologia        |
| aws                         | tecnologia        |
| engenharia                  | tecnologia        |
| claude-anthropic            | tecnologia        |
| fundamentos                 | tecnologia        |
| programacao                 | tecnologia        |
| dados                       | tecnologia        |
| construcao                  | tecnologia        |
| seguranca-hardware-hacking  | tecnologia        |
| carreira                    | carreira          |
| comunicacao                 | comunicacao       |
| marketing                   | marketing         |
| conteudo                    | conteudo          |
| empreendedorismo            | empreendedorismo  |
| ingles                      | ingles            |

Medvet (`lib/bases/medvet/`) NÃO é tocada por este plano — vive em outra árvore.

## REGRAS OPERACIONAIS

1. **Branch**: `feat/db-driven-curriculum` (criar a partir de `main`). NUNCA
   commit direto em `main`. Abrir PR ao final de cada fase.

2. **Protocolo de commit** (segue `CLAUDE.md` raiz):
   - `git status --short` + `git diff --stat HEAD` antes do commit
   - Pre-commit hook do repo cuida de lint/test/gofmt — não pular com `--no-verify`
   - Mensagem PT-BR no estilo `feat:`, `fix:`, `refactor:`, `docs:`
   - SEMPRE incluir `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
   - Push para branch da feature, NÃO main

3. **CI watch**:
   - Após push, rodar `gh run list --limit 3 --branch feat/db-driven-curriculum`
   - Acompanhar com `gh run watch <id>` ou `gh run view <id> --log-failed`
   - Se quebrar, diagnosticar e arrumar antes de continuar. Não acumular falhas.

4. **Migrations Go** (`backend/migrations/`):
   - Numeração sequencial. Próxima livre: **000055** (000054 já existe).
   - Cada migration tem `<n>_<nome>.up.sql` + `<n>_<nome>.down.sql`
   - SEMPRE: `IF NOT EXISTS`, `ON CONFLICT DO UPDATE`
   - Testar local: `cd backend && export DATABASE_URL='postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable' && migrate -path migrations -database "$DATABASE_URL" up` (e `down`)

5. **Quando travar**:
   - Não invente schemas. Releia `DB_ARCHITECTURE_*.md`.
   - Se decisão de produto for necessária, PARE e me pergunte. Não escolha sozinho.
   - Se um teste quebrar de forma estranha, leia o teste antes de "ajustar" — talvez a sua mudança está errada, não o teste.

## EXECUTE NA ORDEM ABAIXO. NÃO PULE FASES.

### FASE 0 — Preparação (faça AGORA, ~30 min)

1. Crie branch: `git checkout -b feat/db-driven-curriculum`
2. Backup do Postgres local: `pg_dump -U ffv -h localhost ffv_dev > /tmp/ffv-pre-migration.sql`
3. Confirme leitura dos 5 docs listados acima respondendo em 5 bullets o que você entendeu de cada um.
4. PARE e me confirme antes de avançar pra Fase 1.

### FASE 1 — Relacionamentos no DB (3-5 dias)

Crie as 9 migrations 000055-000063 conforme especificado em
`docs/MIGRATION_PLAN_DB_DRIVEN_CURRICULUM.md` seção "Fase 1".

Para cada migration:
1. Escreva `.up.sql` e `.down.sql`
2. Aplique local: `migrate ... up`
3. Reverta local: `migrate ... down` (1 nível)
4. Aplique de novo
5. Rode `go test ./...` + `make test-integration` no backend
6. Se passar, faz commit com mensagem clara:
   `feat(db): migration 000055 — add base_slug FK to hubs`
7. Push para branch
8. Vai pra próxima

Backfill da migration 000055 usa o mapeamento canônico acima.

**Critério de aceite da Fase 1**:
- 9 migrations aplicam e revertem limpo
- `go test ./...` verde
- CI verde no GitHub
- PR aberto pra `main` (não merge ainda)

PARE depois da Fase 1 e me chame para revisar.

### FASE 2 — Importer (3-4 dias)

Depois de Fase 1 aprovada:

1. Crie `frontend/scripts/dump-curriculum.mjs` que faz:
   - Importa `HUBS` e `CURRICULUM` de `frontend/src/lib/curriculum.ts`
   - Serializa para JSON em `frontend/.cache/curriculum.snapshot.json`
   - É chamado por `npm run dump-curriculum`

2. Crie `backend/cmd/import-curriculum/main.go` que:
   - Lê o JSON de `frontend/.cache/curriculum.snapshot.json`
   - Conecta no DB via DATABASE_URL
   - Para cada hub: UPSERT em `hubs` com `base_slug` derivado do mapeamento canônico
   - Para cada trilha: UPSERT em `trails` (descobre hub_id via HUBS[*].trailIds)
   - Para cada módulo: UPSERT em `curriculum_articles` (atualiza metadata)
   - Para prerequisites/nextSuggested: INSERT idempotente em junction tables

3. Teste local:
   ```
   cd frontend && npm run dump-curriculum
   cd ../backend && go run ./cmd/import-curriculum
   ```
   Verifique:
   - `SELECT COUNT(*) FROM hubs` = 15
   - `SELECT COUNT(*) FROM trails` ≥ 66
   - `SELECT COUNT(*) FROM curriculum_articles WHERE status='published'` ≥ 900
   - Rodar importer 2x: counts iguais (idempotente)

4. Adicione `make import-curriculum` no `backend/Makefile`

5. Adicione teste de integração que valida o importer end-to-end

6. Commit + push + CI watch

PARE depois da Fase 2 e me chame.

### FASE 3 — Snapshot + frontend consome (4-5 dias)

1. **Backend**: novo handler `GET /api/v1/curriculum/snapshot` em
   `backend/internal/interfaces/http/handlers/curriculum_snapshot_handler.go`:
   - 1 query JSONB aggregation montando árvore Base → Hub → Trail → Module
   - Cache headers: `Cache-Control: public, max-age=60`
   - ETag baseado em hash do conteúdo
   - Testes contract em `test/contract/`

2. **Frontend**: novo script `frontend/scripts/fetch-curriculum.mjs`:
   - Fetch `${API}/api/v1/curriculum/snapshot`
   - Transforma o JSON em arquivo TypeScript: `src/lib/curriculum.generated.ts`
   - Mesma API que `curriculum.ts`: exporta `HUBS`, `CURRICULUM`, helpers `getHubBySlug`, `getHubTrails`, `getHubStats`, `getHubForTrail`, `getTrailHref`, `getModuleBySlug`, `getTrailForModule`, `getModulePrerequisites`
   - Se fetch falhar: warn + copia `curriculum.ts` cachado pra `.generated.ts`

3. Adiciona em `frontend/package.json`:
   ```json
   "scripts": {
     "prebuild": "node scripts/fetch-curriculum.mjs",
     "fetch-curriculum": "node scripts/fetch-curriculum.mjs"
   }
   ```

4. Substituir imports em TODOS os 60+ arquivos:
   `from '@/lib/curriculum'` → `from '@/lib/curriculum.generated'`

   Use grep para listar:
   `grep -rn "from '@/lib/curriculum'" frontend/src/`

   Substitua um arquivo por vez ou em batch com `sed`. Confirme com TypeScript que tudo compila.

5. `curriculum.ts` NÃO é deletado — vira fallback. Adicionar comentário no topo do arquivo:
   ```
   // ⚠️ FALLBACK ONLY. Source of truth is the DB (Phase 3+).
   // This file is used when the snapshot fetch fails during build.
   // Será removido na Fase 5 (após 30 dias de soak em prod).
   ```

6. Rodar `npm run build` em local com backend ON (deve usar snapshot real) e backend OFF (deve usar fallback). Verifica que ambos buildam.

7. Rodar `npm test -- --run`. Tudo deve passar.

8. Commit + push + CI watch.

PARE depois da Fase 3 e me chame para fazer soak de 7 dias em prod.

### FASE 4 — Admin CMS (4-5 dias)

Aguarde sinal verde meu pós-soak da Fase 3.

Crie endpoints + UI admin pra:
- Hubs CRUD: `POST/PATCH/DELETE /api/v1/admin/hubs/{id}`
- Trails CRUD
- Modules CRUD (já existe parcial — expandir)
- Simulados CRUD
- Questions CRUD (já existe)

Cada write:
1. Valida payload com Zod (frontend) + CHECK constraints (DB)
2. Persiste no DB
3. Refresh `base_stats` materialized view
4. Dispara `POST /api/revalidate?path=...` no Next via webhook (precisa endpoint do Next)
5. Audit log automático (middleware já existe)

UI: `/admin/curriculum/{hubs,trails,modules,simulados}` seguindo pattern do
`admin_questions.go` existente.

Commit por entidade. PARE depois da Fase 4.

### FASE 5 — Sunset (30-45 dias soak)

Aguarde 30 dias de soak em prod da Fase 3 + Fase 4 sem incidente. Eu te aviso.

Depois:
1. Migration 000064: `drop_bases_counter_columns` (drop colunas modules/trails/hubs de bases)
2. Delete `frontend/src/lib/curriculum.ts`
3. Delete `backend/internal/infrastructure/catalog/catalog.json`
4. Remove `//go:embed catalog.json` em provider.go
5. Remove `buildHardcodedBases()` em bases_handler.go
6. Atualiza CLAUDE.md raiz documentando que tudo é DB-driven
7. Commit + push + CI watch
8. PR final para `main`

## CHECKLIST FINAL ANTES DE FECHAR PR

- [ ] Todas as 10 migrations (000055-000064) aplicam e revertem
- [ ] Importer roda idempotente (2x = mesmo resultado)
- [ ] Snapshot endpoint retorna árvore completa em <500ms
- [ ] Frontend build funciona com e sem backend
- [ ] Admin UI cria/edita/deleta sem erro
- [ ] 1180+ testes do front continuam verdes
- [ ] Backend Go tests verdes
- [ ] E2E Playwright verde
- [ ] CI no GitHub verde em todos os commits do branch
- [ ] CLAUDE.md atualizado
- [ ] `git grep -i "TODO\|FIXME\|XXX"` zerado em código novo

## ANTI-PADRÕES PROIBIDOS

- ❌ Editar `main` direto
- ❌ Pular hook do pre-commit
- ❌ Force push em prod (`--force`, `--force-with-lease`)
- ❌ Amend de commit já pushado
- ❌ Migration sem `.down.sql` ou com down quebrada
- ❌ Migration não-idempotente (`CREATE TABLE` sem `IF NOT EXISTS`)
- ❌ Hardcode de schema em handlers (catalog.json fallback é exceção temporária)
- ❌ Deletar `curriculum.ts` antes da Fase 5
- ❌ Mudar mapeamento Hub → Base sem me consultar
- ❌ Adicionar novas tabelas além do schema especificado (DB_ARCHITECTURE_*.md)

## QUANDO ME CHAMAR

- Após Fase 0 (confirmação de leitura)
- Após Fase 1 (revisar 9 migrations antes de Fase 2)
- Após Fase 2 (validar importer antes de Fase 3)
- Após Fase 3 (decidir início do soak de 7 dias)
- Antes de Fase 4 (sinal verde para CMS write-through)
- Antes de Fase 5 (sinal verde para sunset)
- Qualquer momento que travar com decisão de produto

## FORMATO DAS SUAS RESPOSTAS

A cada milestone:
1. **O que fiz** (1-3 bullets concretos com arquivos/commits)
2. **O que verifiquei** (testes que rodaram, CI status)
3. **Próximo passo** (o que vou fazer agora ou pergunta para você)

Sem floreio. Vai.
```

---

## Como usar este prompt

1. **Abra uma sessão nova do Claude Code** (Sonnet 4.6, contexto 1M).

2. **Cole o prompt acima inteiro** (do `Você é um engenheiro sênior` até o `Vai.`).

3. **Anexe o repositório**: certifique-se que a CWD do Claude Code é `/Users/fernandofranco/Developer/fernandofrancovalledotcom`.

4. **Confirme as ferramentas que ele vai usar**:
   - Bash (com permissões para `gh`, `git`, `migrate`, `psql`, `go`, `npm`)
   - Edit / Write / Read
   - Possivelmente WebFetch (para ler documentação Postgres se travar)

5. **Acompanhe os checkpoints**. Ele vai parar em cada fim de fase e pedir confirmação. Não tenha pressa — releia o diff antes de aprovar a próxima fase.

6. **Backup antes**: rode `pg_dump` em prod antes da Fase 1 ser aplicada na VPS. O Sonnet só roda em local nessa fase, mas quando a migration entrar em main e o deploy rodar, ela vai pra prod automaticamente.

---

## Cronograma resumido (calendário esperado)

| Semana | Ação |
|--------|------|
| 1 | Sonnet executa Fase 0 + Fase 1 (9 migrations). Você revisa PR. |
| 2 | Sonnet executa Fase 2 (importer). Você valida counts. |
| 3 | Sonnet executa Fase 3 (snapshot + front). Merge para main. |
| 4 | Soak em prod (7 dias). Você monitora. |
| 5 | Sonnet executa Fase 4 (admin CMS). |
| 6-10 | Soak final (30-45 dias). |
| 11 | Sonnet executa Fase 5 (sunset). Plano completo. |

Compressível para **3-4 semanas** se pular soaks (NÃO recomendado para sistema em prod).
