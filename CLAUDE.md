# FFV Academy — Monorepo

---

## 🎯 O QUE É A FFV ACADEMY

### Pitch em português coloquial (pra entender o produto, não a tech)

Sabe quando você precisa estudar alguma coisa — uma apostila, um livro, um vídeo de aula, um artigo da internet, a foto que você tirou do quadro da sala — e bate aquele desespero de *"por onde eu começo?"* e *"como é que eu vou lembrar disso tudo na hora da prova?"*

**A FFV resolve isso.**

Você joga o material lá dentro. Pode ser PDF, foto, link, áudio, vídeo, qualquer coisa. Em uns dois ou três minutos, ela te devolve uma escola montada em cima daquele conteúdo:

- Um **resumo** do que importa.
- Um **mapinha** mostrando como os assuntos se conectam.
- Um **dicionário** dos termos difíceis, explicado em português normal.
- **Cem perguntas** pra você testar se entendeu de verdade — não cinco, não vinte, sempre cem, indo do básico (*"o que é tal coisa"*) até o difícil (*"monte sua própria solução pra isso"*).
- Um sistema que vai te **lembrar de revisar** essas perguntas nos dias certos pra você não esquecer com o tempo.
- Uma **simulação tipo prova de verdade**, cronometrada.

Aí o aluno vira aluno daquele conteúdo. Estuda 30 minutinhos por dia, a FFV avisa quando é hora de revisar o que tá esquecendo, dá pontos quando acerta, mostra a sequência de dias estudando, coloca num ranking com outras pessoas, e no fim entrega um **certificado de verdade** pra colocar no LinkedIn.

**O ponto central:** o conteúdo é **do aluno**. Não é a FFV empurrando aula pronta. É o aluno trazendo o que precisa aprender — pra prova, pro concurso, pro vestibular, pro trabalho, pra faculdade — e a FFV virando aquilo num plano de estudo sério, com método científico de retenção (a mesma técnica que estudantes de medicina usam pra decorar tudo, aplicada em qualquer assunto).

Tudo **de graça**, em **português**, sem encheção. Quem quiser usar à vontade sem limite, paga US$7/mês (uns R$35). Mas a base é gratuita.

> **Em uma frase:** o aluno joga o material dele lá, a FFV transforma em aprendizado que gruda na cabeça.

### Pitch técnico (resumo formal)

**FFV é a plataforma onde o aluno sobe qualquer conteúdo (PDF, imagem, texto, link, áudio, vídeo) e recebe um plano de estudo estruturado pedagogicamente: resumo, mapa conceitual, glossário, *100 questões obrigatórias* calibradas pela Taxonomia de Bloom, e revisão espaçada real (SM-2 / FSRS). Gratuita, em PT-BR, sem hype.**

> **"Suba qualquer conteúdo. Receba 100 questões calibradas + revisão espaçada. Aprenda de verdade, em português, de graça."**

### Princípios não-negociáveis do produto

1. **O CONTEÚDO É DO ALUNO.** Quem traz o material é o estudante — PDF da apostila, foto do livro, link do artigo, áudio da aula. A FFV é o **método** que transforma isso em aprendizado retido. Não somos editora; somos pipeline pedagógico.
2. **100 QUESTÕES SEMPRE.** Cada upload gera EXATAMENTE 100 questões distribuídas em Bloom (20 Lembrar + 30 Entender + 25 Aplicar + 15 Analisar + 7 Avaliar + 3 Criar). Nunca 30, nunca 60, nunca 200. Se o conteúdo for pequeno demais, o sistema recusa e pede mais material.
3. **SRS real, não fake.** SM-2 (hoje) → FSRS-6 (2027). Ease factor, interval tracking, memory decay reais — diferente dos "pseudo-SRS" dos concorrentes (Knowt, Quizlet, NotebookLM).
4. **PT-BR nativo.** Não é tradução; é cultura BR (ENEM, concurso, CESPE/FGV/Vunesp, OAB, residência).
5. **Pedagogia ancorada em research.** Karpicke, Roediger, Bjork, Sweller, Bloom — cada decisão de produto passa pelo crivo "ensina ou só engaja?".

> **Documento canônico do método:** [`TEACHING_METHOD.md`](./TEACHING_METHOD.md) — pipeline técnico, princípios, anatomia do módulo gerado.
> **Documento canônico de estratégia:** [`STRATEGY.md`](./STRATEGY.md) — concorrentes, SWOT, plano executivo.

### Histórico do pivot (mai/2026)

Até abril/2026 a FFV era uma **escola com currículo curado** (157 módulos em 8 bases: Tecnologia, Medicina Veterinária, Carreira, Comunicação, Marketing, Conteúdo, Empreendedorismo, Inglês). Em maio/2026 pivotamos: o **produto principal** passa a ser o **pipeline user-generated**. O currículo curado **continua existindo** como biblioteca pública + showcase do método + seed SEO, mas **não expandimos** curadoria nova até o user-generated rodar bem (ver `TEACHING_METHOD.md §8`).

---

## 🚫 REGRA ABSOLUTA — SISTEMA 100% MOLDÁVEL (ZERO DADOS ESTÁTICOS)

> **Nenhum switch/case, if/else chain ou lista hardcoded pode existir com slugs de hub, base, trilha ou módulo.**
> Todo dado de currículo vem do banco de dados. O sistema é um gerador — o usuário cria pelo admin e o front reflete automaticamente.

### O que é vetado

- ❌ `hubBaseSlug(slug)` como switch/case — **foi removido do `cmd/importer`**, NÃO recriar em lugar nenhum.
- ❌ `TECH_HUB_SLUGS` como `Set` hardcoded em `lib/bases/tecnologia/index.ts` — candidato a remoção (Fase 3); usar query do DB.
- ❌ Constantes de slugs em código fonte (exceto mapeamentos de fallback **explicitamente documentados como temporários**).
- ❌ Switch derivando `base_slug` de slug de hub — o importer lê `base_slug` do JSON seed diretamente.
- ❌ Código novo necessário quando o admin cria um hub/trilha/módulo no CMS — zero código, só dados no DB.

### Estado das migrações DB-driven (mai/2026)

| Fase | Migrations | Status |
|------|-----------|--------|
| Fase 1 — schema base→hub→trail→module via FK | 000055–000063 | ✅ Concluídas |
| Fase 2 — importer lê `base_slug` do JSON, sem switch | — | ✅ Concluído |
| Fase 3 — `BASE_REGISTRY` frontend gerado de DB snapshot | — | 🔄 Pendente |

**`BASE_REGISTRY` no frontend ainda tem dados estáticos** — na Fase 3 será gerado de snapshot do DB. Por ora, é um `BaseConfig` que descreve chrome/tema/microcopy (não slugs de currículo).

### Regra de ouro
> Se você está escrevendo `case "ia":`, `case "aws":`, `case "engenharia":` ou equivalente para derivar a base de um slug — **PARE**. Essa lógica pertence ao DB via FK `hubs.base_slug`.

---

## 🗺️ ROADMAP DE FUNCIONALIDADES

### 🔥 TIER 1 — Próximas sprints
1. **Leaderboard por trilha** — ranking dentro de cada trilha específica
2. **Certificado por trilha** — PDF/PNG verificável ao completar 100% (reutilizar Certificate.tsx)
3. **Próximo artigo inteligente** — ao concluir módulo, card direto para o próximo
4. **Estatísticas de performance por trilha** — % de acerto, tempo médio, tendência semanal
5. **Maratona de revisão** — sessão SRS configurável (qtd de cards, trilha, timer)
6. **Email semanal de progresso** — resumo automático: XP, streak, badges, recomendação

### ⚡ TIER 2 — Médio prazo
7. **Amigos / grupos de estudo** — leaderboard privado via código de grupo
8. **Trilha do Dia** — 1-3 módulos recomendados diariamente
9. **Quests diárias/semanais** — "revise 3 cards", "complete 1 módulo", "atinja 80%"
10. **Dev card compartilhável** — `/devcard/@username` (viral no LinkedIn/Twitter)
11. **Trending modules** — top 10 módulos da semana na home

### 🌱 TIER 3 — Estratégico
12. **Export Anki** — `.apkg` com cards SRS de uma trilha
13. **LLM-powered learning path** — Claude API analisa erros e recomenda próximos passos
14. **AI quiz generator** — 5 quizzes extras por artigo via Claude API
15. **Multi-idioma (EN/ES)** — internacionalização via next-intl

---

## 📁 ESTRUTURA DO MONOREPO

| Pasta | O que é | Stack |
|-------|---------|-------|
| `frontend/` | App web Next.js (artigos, simulados, gamificação, ranking) | Next.js 16, TypeScript, Tailwind, Vitest |
| `backend/` | API REST + workers (auth, sync, leaderboard, certificados, billing) | Go 1.25, Chi, PostgreSQL, Redis |
| `video-pipeline/` | Pipeline de geração de vídeos de marketing | TypeScript, Remotion 4, Playwright |
| `mcp/` | MCP server — expõe o currículo FFV ao Claude (24 tools) | TypeScript, Node 20, MCP SDK |
| `drawio-tools/` | Scripts para diagramas de arquitetura AWS | Python, Bash, draw.io |
| `docs/` | Decisões de projeto e planejamento | Markdown |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Frontend
cd frontend && npm install && npm run dev   # dev server :3000
cd frontend && npm test                     # Vitest
cd frontend && npm run build                # build estático → frontend/out/
cd frontend && npm run lint                 # zero warnings policy

# Backend
cd backend && go run ./cmd/api             # servidor local :8080
cd backend && go test ./...                # todos os testes Go
cd backend && make migrate                 # rodar migrations

# MCP
cd mcp && npm install && npm run build     # compila → dist/index.js
cd mcp && npm test                         # 77 testes (100% linhas/funções)
```

---

## 📌 ESTADO ATUAL (mai/2026)

9 bases live: `tecnologia`, `medicina-veterinaria`, `carreira`, `comunicacao`, `marketing`, `conteudo`, `empreendedorismo`, `ingles`, `neurociencia`.

**Mudanças grandes recentes** — ver [`CHANGELOG.md`](./CHANGELOG.md):
- Fase 1 do plano DB-driven concluída (migrations 000055–000063): schema base→hub→trail→module via FK, importer sem switch hardcoded
- 5 trilhas novas (29 módulos do Profissional Digital)
- Home redesenhada (16 → 8 seções), ranking com 4 períodos (geral/anual/mensal/semanal)
- Páginas novas: `/sobre`, `/comunidade`, `/explorar`, `/newsletter`, `/search`, `/ranking`
- Backend Go com endpoints `/api/v1/stats` e `/api/v1/leaderboard/public`
- Gamificação: sons Web Audio API, heatmap de estudo, metas diárias

**Sempre que fizer mudanças grandes**, registrar em `CHANGELOG.md` (timeline única) com tag `[PLATAFORMA] [BACKEND] [CURRÍCULO] [GAMIFICAÇÃO]`.

---

## 🧱 REGRA FIXA — ISOLAMENTO DE BASE DE CONHECIMENTO

> **Cada base de conhecimento é uma ilha. O usuário NUNCA pode ver chrome, hub, simulado, nav ou link de outra base enquanto estiver dentro de uma.**

### O que TEM que ser isolado por base

| Elemento | O que tem que ser próprio |
|----------|--------------------------|
| **Base home** `src/app/<base-slug>/page.tsx` | Hero, descrição, paths, hubs, playlists só da base |
| **Header/nav** `BaseConfig.nav.hubNavItems` | Links dos hubs DESSA base — nunca tech hubs em base não-tech |
| **Footer** `BaseConfig.footer` | hubLinks, contentLinks, mobilePrimary — todos da própria base |
| **Mascot/Microcopy/Slogans/Tema** | Contextualizados para a base, paleta própria |
| **Simulados** `BaseConfig.simulados[]` | Só os simulados da base (nunca cross-base) |
| **Trilhas e módulos** | `CURRICULUM` filtrado por base; `/aprenda/<slug>` resolve só pra módulos da base |
| **Hubs** | Filtrados em `lib/bases/<base>/index.ts` — nunca importa `HUBS` cru |

### O que CONTINUA global

Perfil/preferências, XP/streak/level (gamificação cross-base), marketing (`/`, `/sobre`, `/bases`), dashboards globais (`/progresso`, `/ranking`, `/revisar`), verificação de certificados.

### Checklist ao adicionar base nova

1. **Backend**: migration SQL + tabela `bases` com `status='live'`, JSONB de theme/nav. Mirror em `buildHardcodedBases()` pro fallback.
2. **Frontend `BASE_REGISTRY`**: BaseConfig completo (theme, mascot, microcopy, slogans, nav, footer). NÃO copiar nav de tecnologia.
3. **Frontend resolver**: `/<base-slug>` → resolve pra ESSA base.
4. **Frontend page**: `src/app/<base-slug>/page.tsx` renderiza `KnowledgeBaseHome`.
5. **Isolation tests**: passam automaticamente ao registrar — só registrar é suficiente.

### Anti-padrões proibidos

- ❌ Hub não-tech resolvendo para `'tecnologia'` no resolver.
- ❌ Footer ou nav de uma base com `href` de outra base.
- ❌ Importar `HUBS` cru (sempre filtrar pelo slug da base).
- ❌ Reusar `TECH_PATHS`, `TECH_HUBS`, `TECH_PLAYLISTS` em outra base.
- ❌ `/<base-slug>` renderizando `HubPageClient` em vez de `KnowledgeBaseHome`.
- ❌ Módulos em `/aprenda/<slug>` herdando chrome de `tecnologia` por default — o resolver DEVE consultar `getBaseSlugForModule(slug)` em `lib/bases/module-base-resolver.ts` antes de cair em tecnologia.

### Como o resolver decide a base (precedência)

Em `lib/bases/resolver.ts → detectBaseSlug()`:

1. Match exato com `BaseConfig.basePath` (ex.: `/comunicacao` → base comunicacao).
2. `/aprenda/<slug>` → `getBaseSlugForModule(slug)` (módulo → trilha → hub → base). Módulo desconhecido cai em `tecnologia` como fallback.
3. Href de trilha → `getBaseSlugForTrailHref(path)` derivado do CURRICULUM.
4. Legacy tech prefixes (`/ia`, `/aws`, `/simulados`, `/engenharia`…) → `tecnologia`.
5. Marketing (`/`, `/sobre`, `/bases`…) → `null` + `isMarketing=true`.
6. App-global (`/progresso`, `/ranking`, `/revisar`…) → base default + `isAppGlobal=true`.

**Se alguém ver chrome errado**, começa investigando por #1.

---

## 🔭 PONTOS DE ATENÇÃO OPERACIONAIS (mai/2026)

### Componentes de chrome SEM fallback default (NÃO recriar)

- `SiteFooter`: fallback é `?? []`, NÃO `?? HUBS.map(...)`. O caller (`AppChrome`) injeta do `BaseConfig` ativo.
- `MobileNav` e `GameHUD`: só renderizam itens globais quando `BaseConfig.nav.hideGlobalContentNav === false`. Apenas `tecnologia` tem isso `false`.

### Alertas sobre dados hardcoded removidos

- `hubBaseSlug()` switch em `cmd/importer` foi **removido** — não recriar. O importer agora lê `base_slug` do JSON seed.
- `TECH_HUB_SLUGS` Set em `lib/bases/tecnologia/index.ts` é **candidato a remoção** na Fase 3 (substituído por query do DB). Não ampliar nem replicar em outras bases.
- `BASE_REGISTRY` frontend ainda tem dados estáticos de chrome (theme, microcopy) — ok por ora. Dados de currículo (hubs, trilhas, módulos) devem vir do DB.

### Pendências conhecidas (low priority)

| Item | Onde | Por que adiar |
|------|------|---------------|
| `OnboardingModal` só sugere 4 hubs tech | `src/components/OnboardingModal.tsx:11` | Expandir quando tiver dados de uso das novas bases |
| `StudyRequestForm` lista áreas "queued" sem incluir bases profissionais já live | `src/components/home/StudyRequestForm.tsx:35-45` | Avaliar quando usuários pedirem expansão |
| Módulos das 6 bases não têm JSONs em `scripts/seeds/articles/` | check-curriculum-seed-drift.mjs | Produção de conteúdo em ondas; já na allowlist |

### Testes que travam regressões (NÃO REMOVER)

- `frontend/src/lib/bases/__tests__/isolation.test.ts`: module routing (11 casos), trail URL routing (10 casos), `selectTotalModulesForBase` (6 casos)
- `frontend/src/lib/bases/__tests__/state-selectors.test.ts`: `selectRecommendationsForBase` nunca vaza tech recs em outras bases
- `frontend/src/tests/render/SiteFooter.test.tsx`: sem props, NÃO renderiza links cross-base

### Checklist rápido antes de mexer em base/hub/módulo

1. **Mudou hub em curriculum.ts?** Mirror em `scripts/seeds/hubs.json` SEMPRE.
2. **Base nova?** Migration SQL + `BASE_REGISTRY` + `buildHardcodedBases()` + page `src/app/<slug>/page.tsx` + `<BaseStructuredData />` + canonical.
3. **Trilha nova?** Coloca em `HUBS[*].trailIds`. Resolver deriva `getBaseSlugForTrailHref` automaticamente.
4. **Módulo novo?** Verifica que `getBaseSlugForModule(slug)` resolve certo via trilha → hub → base.
5. **Antes de fechar PR**: testa URLs afetadas visualmente no browser (header certo, cores, mascote).

---

## 🔐 ADMIN — Defesa em profundidade (3 camadas)

> **`fernandofv1110@gmail.com` é o único admin atual.** O sistema exige **duas** condições independentes pra qualquer rota `/api/v1/admin/*`: role no DB **E** email na allowlist do env var. Comprometer uma camada sozinho não basta pra escalar privilégio.

### As 3 camadas

| Camada | Onde fica | Como bloqueia |
|--------|-----------|---------------|
| **1. DB** | `users.role = 'admin'` | Migration 000065 promove explicitamente. Não há endpoint que altere role. |
| **2. JWT** | Claim `email` assinado HMAC-SHA256 | Atacante não consegue forjar email/role no token. |
| **3. Middleware** | Env var `ADMIN_EMAIL_ALLOWLIST` | `RequireAdminWithAllowlist` em `interfaces/http/middleware/auth.go:65` exige role=admin **AND** email ∈ allowlist. |

### Ativando o admin (passo único)

```bash
# 1. Na VPS, em /opt/ffv/.env:
ADMIN_EMAIL_ALLOWLIST=fernandofv1110@gmail.com

# 2. Migration aplicada automaticamente em deploy (000065):
#    UPDATE users SET role='admin' WHERE email='fernandofv1110@gmail.com'
#    (idempotente — só roda se já existir o user via magic-link login)

# 3. Restart API
docker compose -f /opt/ffv/docker-compose.prod.yml up -d --force-recreate api

# 4. Login pelo magic-link normal. JWT novo carregará role=admin.
```

> Se a env var ficar vazia, o middleware degrada pro modo "só role" (compat com dev). Em produção SEMPRE setar.

### Anti-padrões proibidos

- ❌ Endpoint que mude `users.role` via HTTP (não existir = não pode ser exploitado).
- ❌ Auto-promoção "primeiro user vira admin" (vetor de race-condition).
- ❌ Allowlist hardcoded no código fonte (rotação de admin precisa de PR — lento). Use env var.
- ❌ Logar o JWT inteiro (vaza email). Logar só user_id quando precisar.

### Rotacionar admin (se um dia precisar trocar)

1. Cria/promove novo admin via migration nova: `UPDATE users SET role='admin' WHERE email='novo@...'`.
2. Atualiza `ADMIN_EMAIL_ALLOWLIST=novo@...` no `.env` da VPS (substitui ou adiciona).
3. Restart API.
4. (Opcional) Migration nova: `UPDATE users SET role='user' WHERE email='antigo@...'`.

---

## ☁️ STORAGE DE ARQUIVOS — Cloudflare R2

> **Anexos de StudyRequest e qualquer upload de cliente vão pra Cloudflare R2 (S3-compatible).** Nada de upload fica no Postgres — só metadata + URL canônica `s3://bucket/key`.

### Por que R2
- **Zero egress fees** — frontend baixa arquivos sem custo extra (vs $0.09/GB AWS S3).
- **API 100% S3-compatible** — adapter Go usa `aws-sdk-go-v2`; trocar pra B2/MinIO/AWS é só mudar env vars.
- **$0.015/GB/mês** — mais barato que S3 e Firebase.

### Arquitetura

| Camada | Responsabilidade |
|--------|------------------|
| `backend/internal/infrastructure/storage/s3.go` | Adapter S3-compatible (PutObject, GetObject) |
| `backend/internal/domain/studyrequest/ports.go:63` | Interface `FileStorage` (Upload) |
| `backend/internal/interfaces/http/handlers/study_request_admin_handler.go` | `AttachmentDownloader` (Open) — usado também pelo ZIP bundler |
| `backend/cmd/api/main.go` | Switch por env: `S3_BUCKET` setado → S3; senão → LocalDisk (dev/fallback) |
| Postgres `study_request_attachments.storage_url` | Guarda `s3://ffv-uploads/<req-id>/<att-id>.ext` |

### Env vars obrigatórias em produção

```bash
S3_BUCKET=ffv-uploads
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<R2 API token>
S3_SECRET_ACCESS_KEY=<R2 API token>
S3_PATH_STYLE=false
```

Setup completo passo-a-passo: **[`backend/docs/RUNBOOK.md` §8](./backend/docs/RUNBOOK.md)**.

### Layout de keys no bucket

```
ffv-uploads/
├── <study_request_id>/
│   ├── <attachment_id>.pdf
│   ├── <attachment_id>.xlsx
│   └── <attachment_id>.pptx
└── <outro_request_id>/
    └── ...
```

Cada solicitação tem sua pasta (não há agrupamento por usuário — uma pessoa pode ter N solicitações, cada uma com sua pasta). Para baixar todos os arquivos de uma solicitação como ZIP: `GET /api/v1/admin/study-requests/{id}/download-all` (admin only).

### MIME types aceitos

PDF, DOCX, XLS/XLSX, PPT/PPTX, CSV, TXT, MD, PNG, JPG, JPEG, WebP, GIF. Limite: 25 MiB/arquivo, até 10 anexos/solicitação. Whitelist canônica em `backend/internal/domain/studyrequest/study_request.go:89`.

### NÃO FAZER

- ❌ Salvar binário no Postgres (campos BYTEA).
- ❌ Salvar uploads em `/opt/ffv/uploads/` em produção (esse path é fallback de emergência).
- ❌ Expor credenciais R2 fora de `.env` (sempre via env vars).
- ❌ Commitar `.env` no git (já no `.gitignore`).
- ❌ Reutilizar R2 token entre dev/staging/prod — gerar 1 token por ambiente.

---

## 🚀 PROTOCOLO DE COMMIT + PUSH + CI (regra fixa do PO)

### 1. Antes do commit
- `git status --short` + `git diff --stat HEAD` pra mapear o que muda.
- Verificar que não há `.env`, credenciais ou tokens no diff.
- Sanity: `go build ./...` + `npx tsc --noEmit` + `npm run lint`. Rodar `gofmt -w .` se pre-commit hook exigir.

### 2. Commit
- Mensagem **em português**, estilo do `git log` recente (`feat:`, `fix:`, `chore:`).
- HEREDOC com seções claras quando cobre múltiplas áreas.
- SEMPRE incluir `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

### 3. Push + acompanhamento de CI (OBRIGATÓRIO)
- `git push origin main`.
- `gh run list --limit 3 --branch main` pra capturar o run ID.
- `gh run watch <run-id>` OU `gh run view <run-id> --log-failed` quando terminar.
- **Reportar**: status final (passou/falhou) + logs filtrados se falhou. O usuário NÃO deve precisar tirar print do GitHub Actions.

### 4. Se CI quebrar
- Diagnosticar com `gh run view <id> --log-failed`. Corrigir, commitar `fix:`, repushar. Repetir até verde.

### 5. Anti-padrões proibidos
- ❌ Push sem watch. ❌ Force push sem autorização. ❌ `--amend` em commit já pushed. ❌ `--no-verify`.

---

## 📚 DOCUMENTOS DE REFERÊNCIA

**10 docs canônicos na raiz** (consolidação de 28 → 10 em mai/2026). Antigos arquivados em `docs/archive/`.

| Doc | Quando consultar |
|-----|------------------|
| [`TEACHING_METHOD.md`](./TEACHING_METHOD.md) | **Método pedagógico** — pipeline ingestão → 100Q → SRS. Doc canônico do produto. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Timeline única de mudanças (plataforma + currículo) — leia primeiro |
| [`STRATEGY.md`](./STRATEGY.md) | Mercado, concorrentes (NotebookLM, Quizlet, ChatGPT Study Mode...), SWOT, plano 90d |
| [`ROADMAP.md`](./ROADMAP.md) | Iniciativas priorizadas por Tier (backend + frontend + produto + conteúdo) |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Arquitetura técnica unificada (frontend + backend + DB-driven + isolamento de base) |
| [`AUDITS_2026-05.md`](./AUDITS_2026-05.md) | Índice consolidado das 5 auditorias de mai/2026 (code/platform/UX/validation/medvet) |
| [`docs/STANDARDIZATION_REPORT.md`](./docs/STANDARDIZATION_REPORT.md) | Diagnóstico 4/10 de hubs/trilhas/módulos + plano de unificação (executar com Fase 3 DB-driven) |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md) | Plano mestre do currículo (66 trilhas, 570+ artigos) |
| [`MIGRATION_PLAN_CONTENT_TO_DB.md`](./MIGRATION_PLAN_CONTENT_TO_DB.md) | CMS plan — 10 sprints de migração conteúdo → DB |
| [`BACKLOG.md`](./BACKLOG.md) | Pendências operacionais do Fernando |
| [`docs/SKILL_ADVISOR.md`](./docs/SKILL_ADVISOR.md) | Advisor de Produto Educacional (business + pedagogia + metodologia de estudos) |
| [`backend/PLAN.md`](./backend/PLAN.md) | Plano detalhado da API Go |
| `frontend/CLAUDE.md` | Arquitetura frontend, gotchas, mapa de componentes |
