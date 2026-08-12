# FFV Academy — Frontend

> **Ver `../CLAUDE.md` para proposta de valor, posicionamento, roadmap de funcionalidades e pitch completo.**
>
> **Ao mexer em conteúdo, primitives ou na rota `/aprenda`: leia
> [`../PADRAO_ENSINO.md`](../PADRAO_ENSINO.md) primeiro.** Ele é normativo e explica
> por que cada regra existe. Dois pontos que já quebraram em produção e têm gate:
> bloco que falha o Zod volta `null` e **desaparece da página sem erro**; e rota de
> conteúdo sem `ConcluirModulo` não concede XP nem gera carta de SRS.

---

## Stack

- **Language**: TypeScript (strict)
- **Framework**: Next.js 16 App Router, React 19
- **Styling**: Tailwind v4 + CSS custom properties (`--ffv-*`)
- **Package manager**: npm
- **Tests**: Vitest + @testing-library/react — 62 arquivos, 562 testes
- **Deploy**: **SSR Docker** (`output: "standalone"`) → imagem `ghcr.io/feh-franc0/ffv-frontend` rodando na VPS Hostinger KVM (Boston). Servido por Nginx reverse proxy junto com a API. **⚠️ Migração DNS+SSL pendente** — ver seção [Deploy e Infraestrutura](#-deploy-e-infraestrutura) e [README raiz](../README.md#migração-dnsssl-pendente).

---

## Comandos

```bash
npm run dev    # dev server (Turbopack) → :3000
npm run build  # build estático → out/
npm run test   # vitest run (todos os testes)
npm run lint   # eslint src/ — zero warnings policy
```

---

## Convenções de desenvolvimento

- Sempre rodar `npm run test` após mudanças não-triviais.
- Sempre rodar `npm run lint` antes de finalizar; corrigir todos os erros.
- Preferir Server Components; usar `"use client"` só quando há interatividade.
- Data fetching em Server Components ou Route Handlers, não em client components.
- Não criar arquivo novo sem verificar se já existe algo similar.
- Funções com >40 linhas ou >1 responsabilidade → extrair.
- Testes no mesmo commit que a implementação.
- Ao adicionar campo em `GameState`: atualizar **obrigatoriamente** `engine.ts` + `schemas.ts` + `DEFAULT_STATE` + `migrateState()`.

---

## 🗺️ Mapa de áreas-chave

### Páginas (`src/app/`)

| Rota | Descrição |
|------|-----------|
| `/` | Home — 8 seções modulares em `src/components/home/` |
| `/aprenda/<slug>/` | 900+ módulos (cada um `page.tsx` com JSX + `ModuleLayout` + primitives) |
| `/progresso` | Dashboard pessoal — XP, streak, heatmap, rank, recomendações, bookmarks |
| `/revisar` | Sessão de revisão espaçada (SRS) — `ReviewClient.tsx` |
| `/ranking` | Leaderboard 4 períodos + MyRankCard com XP gap |
| `/mapa` | Grafo visual de trilhas |
| `/simulados` | Simulados de certificação com timer e certificado |
| `/news` | Curadoria com NewsCard (imagens reais + magazine layout) |
| `/search` | Busca real-time de módulos e trilhas |
| `/explorar` | Discovery por hub/trilha |
| `/perguntas` | **Hub de conhecimento** — as 168 perguntas respondidas, agrupadas por tema, com a pergunta como texto da âncora. Índice em `src/lib/perguntas-respondidas.json` (GERADO) |
| `/temas`, `/temas/<tema>` | **Eixo de assunto** — 21 temas, 19 com página. Transversal a hub e trilha; é o recorte que a busca usa. Ver `PESQUISA_DEMANDA_BUSCA_2026-08.md` |
| `/arquiteturas-ia-aws` | **100 Arquiteturas de IA na AWS** — trilha de 10 módulos, uma arquitetura percorrível para cada solução do catálogo. Seeds **GERADOS** por `../scripts/seo/gerar_arquiteturas_100.py`; não edite `scripts/seeds/articles/arq-ia-aws-*.json` à mão |
| `/exemplos-arquitetura-aws` | **100 Laboratórios de Arquitetura AWS** — trilha `trail-labs-aws`, do básico (.NET 8 em ECS Fargate + RDS + front na borda, em Terraform) à solução com IA. Plano dos 100 em `../docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`, padrão de autoria em `../.claude/skills/lab-arquitetura-aws.md`. Seeds **escritos**, não gerados — ao contrário de `/arquiteturas-ia-aws` |
| `/comunidade` | Página de comunidade |
| `/newsletter` | Opt-in newsletter |
| `/sobre` | Sobre a plataforma |
| `/cheatsheets`, `/roadmaps`, `/playlists` | Recursos complementares |
| `/verificar` | Verificação de certificados |
| `/preferencias` | Configurações do usuário |

### Currículo (`src/lib/curriculum.ts`)
- **Single source of truth**: ~5000 linhas
- Exports: `CURRICULUM`, `HUBS`, `LEVELS`, `BADGES_DEF` + helpers (`getHubStats`, `getHubTrails`, etc.)
- **5 hubs** no eixo **AWS + IA** (ago/2026): **IA na AWS** (`/ia-aws`, o centro — Bedrock, 100 arquiteturas, AIF-C01 e MLA-C01), Arquitetura de Soluções AWS (`/aws` — 100 labs + 4 certificações), Fundamentos de IA (`/ia`), Produção e Dados para IA (`/engenharia`), Base técnica (`/fundamentos`)
- **38 trilhas**, **490 módulos**. Dois estreitamentos: jul/2026 saiu de 88 trilhas / 803 módulos (`refactor/foco-ia-claude`); ago/2026 retirou as 4 trilhas de Claude-ferramenta (49 módulos) e fundiu os hubs `dados`→`engenharia` e `programacao`→`fundamentos`. **Quatro módulos daquelas trilhas foram REESCRITOS como conteúdo Bedrock** em vez de apagados — `bedrock-prompt-engineering`, `bedrock-reasoning-converse`, `bedrock-mcp-fundamentos`, `bedrock-agentcore-gateway-producao` — porque engenharia de prompt, MCP e reasoning eram lacuna medida do lado AWS (2, 3 e 3 módulos em 31). Em seguida entrou `trail-mla` — MLA-C01, 13 módulos, `readTime` derivado do volume na razão da trilha AIF (0,848 min/1000ch).
- **Ao apagar conteúdo, o efeito colateral maior não é o seed:** são as referências vivas. A consolidação de ago/2026 tocou 17 arquivos, e os que quebraram silenciosamente foram os DERIVADOS e os de curadoria — `seo-descriptions.ts` (53 órfãs), `playlists.ts`, `roadmaps.ts` (um roadmap inteiro), `temas.ts` + `temas-perguntas.ts` (2 temas de fornecedor), `preferences-api.ts` e `OnboardingModal.tsx`. Regenere `content-manifest`, `indice-leve` e `gerar_corpus.py` antes de rodar os testes; o gerador de corpus **falha de propósito** quando uma exceção aponta para slug apagado.
- **A JORNADA é a espinha, e mora em `curriculum/jornada.ts`** (ago/2026). Cinco etapas — base técnica → AWS do básico ao avançado → IA do básico ao avançado → a união (IA na AWS) → sustentar em produção. Ela é **dado**, não página escrita à mão, porque alimenta quatro coisas que não podem divergir: o `nextSuggested` do último módulo de cada trilha, a página `/jornada`, o `coursePrerequisites` do JSON-LD e o `llms.txt`.
  - **O defeito que ela corrige:** 31 das 38 trilhas terminavam em beco sem saída e 138 módulos no meio de trilha não tinham `nextSuggested`. Nada reclamava, porque falta de link não é erro de tipo — o currículo compila igual. Hoje são **860 arestas** e **98% dos módulos recebem ao menos um link de entrada**.
  - Travado por `jornada-ligacao.test.ts` (8 casos). Trilha nova que não entrar na jornada reprova no caso 1; trilha que terminar sem apontar para fora reprova no caso 2.
- **`level` de módulo tem consumidor silencioso:** `OnboardingModal` faz `m.level ?? 'beginner'`. Os 105 módulos sem o campo entravam na recomendação personalizada como iniciantes — incluindo os 20 do SAA-C03 e os 8 de Sistemas Distribuídos. Preenchidos por HERANÇA do nível da trilha, que é a única atribuição honesta disponível: declaração explícita no módulo continua vencendo.
- **Meça apoio pedagógico pelo que ENSINA, não pelo tipo de bloco.** Contar só diagrama diz que a trilha de terminal é pobre, quando ela precisa de comando e não de topologia. O sinal honesto é módulo sem NENHUMA forma concreta — sem código, sem diagrama e sem tabela: hoje são **0 de 490**. O segundo sinal é densidade por trilha; abaixo de ~2 blocos/módulo é onde vale olhar. Script em `scratchpad`, reproduzível a partir dos seeds.
  - Corrigido em 09/ago/2026: **MLA-C01 saiu com 0,1 bloco de código por módulo** — a trilha mais fraca das 38, e escrita nesta mesma sessão. Certificação de ENGENHARIA sem código é aula sobre a prova, não sobre o trabalho. **DVA-C02, uma certificação de DESENVOLVEDOR, tinha 0,4.** Hoje: 23 exemplos executáveis novos em MLA, DVA e AIF, e a plataforma em **1.733 blocos de código (3,5 por módulo)**.
  - **Três módulos da AIF ficaram sem código de propósito** (`aif-intro`, `aif-ai-ml-fundamentos`, `aif-simulado-final`): são visão geral, vocabulário e estratégia de prova. Forçar código ali é o mesmo erro de forçar diagrama onde não há fluxo — e o mesmo vale para a SAA-C03, que é arquitetura e já tem 2,6 diagramas por módulo.
- **Banco de questões de simulado NÃO mora em TypeScript.** A fonte é `frontend/data/question-bank/<cert>-*.json`; `make gen-seed-migration` gera a migration; o Postgres serve. `simulados-catalog.ts` guarda só metadado, com `questions: []`.
  - Colocar 65 questões inline nele em 09/ago/2026 levou o arquivo a 128 KB, a suíte de 10 s para **915 s** com 8 arquivos estourando por tempo — e o módulo é importado por componente de CLIENTE, então os 128 KB iriam para o navegador de todo visitante. Desfeito no mesmo dia.
  - **Prefixo de arquivo novo precisa entrar na tabela `certs` de `backend/cmd/gen-seed-migration/main.go`.** Ela era a constante `clf-c02-`, e o efeito estava medido: **435 questões de DVA-C02 e 115 de AIF-C01 escritas e nunca publicadas**, porque o gerador as ignorava em silêncio e o deploy aplica migration, não o binário `seed-questions`.
  - `scripts/validate_question_bank.py` cobra as quatro coisas que falharam: prefixo legível pelo gerador, `totalQuestions` verdadeiro (havia arquivo declarando 100 com **0** questões), id único, e **gabarito não concentrado** — o banco do CLF em produção tinha arquivo com **87% das corretas na letra A**, ou seja, dava para passar marcando sempre a mesma letra. O gate lê os prefixos DIRETO do Go: manter duas listas foi tentado e elas divergiram no mesmo dia.
- BACKLOG: quebrar em arquivos por trilha (arquivo único está pesado)

**Orçamento de carga por rota — resolvido em 11/ago/2026** (`orcamento-de-carga-por-rota`):
- **O bug era um import RELATIVO, não limite do empacotador.** `engine.ts` e `lib/badges.ts` — alcançados por TODA rota via `GameHUD` → `useGameState` → `engine.ts`, que vive no layout raiz — importavam `CURRICULUM` completo (~92 KB gz, 490 módulos com `desc`/`keywords`) por `from './curriculum'` (relativo). `layout-sem-curriculo.test.ts` só rastreava imports `@/...` e não pegava. Corrigido o rastreador (segue `./`/`../` também, resolvendo por ARQUIVO alvo) e os dois caminhos apareceram na hora. Medido antes: **97 de 97 rotas** com o currículo completo no bundle — não "cerca de 50", como a hipótese antiga (limite do Turbopack) sugeria.
- **Regra para código alcançável do layout raiz:** nunca importar `CURRICULUM`/`@/lib/curriculum` (nem o barril nem `./curriculum` relativo) em `engine.ts`, `lib/badges.ts` (gamificação, não confundir com `curriculum/badges.ts`) ou `lib/random-question.ts` — todos usam `CURRICULO_LEVE` (`curriculum/indice-leve.ts`) hoje, que basta para XP/trilha por slug. Regressão pega em `layout-sem-curriculo.test.ts` e no gate de bundle (abaixo).
- **`queries-leves.ts` ganhou `getHubBySlug`, `getHubForTrail`, `getHubTrailsLeve`, `getHubStatsLeve`, `getTrilhasConcluidasLeve`** — equivalentes de `queries.ts` que operam sobre `CURRICULO_LEVE` em vez de `CURRICULUM`. `queries.ts` reexporta as duas primeiras por compatibilidade (84 arquivos importam do barril).
- **`ConcluirModulo`, `TrailCertificateBanner`, `NextSteps`** (rodam nas 490 páginas de `/aprenda/[slug]`) reimportavam `CURRICULUM` client-side para reencontrar a MESMA trilha que `page.tsx` (Server Component) já tinha resolvido via `getTrailForModule`. Passaram a receber `trail`/`steps` como prop. `Certificate.tsx` (canvas + currículo completo, só para o texto do LinkedIn) virou `next/dynamic` em `TrailCertificateBanner`/`TrailCompletionModal`/`ProgressoClient` — só carrega ao clicar.
- **RSC payload dos artigos `lab-*`:** `ConcluirModulo` e `AnkiExport` recebiam `article.blocks` (a árvore INTEIRA do artigo) como prop — client component precisa serializar qualquer prop no payload RSC, então o conteúdo do módulo (já no HTML via `<BlockTree>`) viajava de novo, mais de uma vez. Extração (`extrairQuizzes`/`extractQA`) moveu para `lib/article-extract.ts`, chamada uma vez em `page.tsx`; só o resultado pequeno vira prop. Maior página caiu de 1.533 KB → 1.347 KB de HTML (199 KB gz), payload RSC de 62,4% → 58,4%. O resto do payload RSC (~58%) é arquitetural do App Router (serialização do flight protocol para navegação client-side) — não dá para zerar sem desligar soft-navigation nessas rotas, o que não foi feito (fora de escopo, mudança de UX maior).
- **Gate real, `frontend/scripts/check-route-bundle.mjs`:** soma o GZIP de todo chunk em `firstLoadChunkPaths` (`.next/diagnostics/route-bundle-stats.json`, emitido pelo `next build` sem config extra) por rota crítica, contra teto declarado — substitui/complementa `bundlesize.config.json`, que media arquivo isolado (maior chunk 336 KB, teto 400 KB — sempre passava) e tinha `continue-on-error: true` no CI, ou seja, nem a métrica errada bloqueava. `npm run bundle:check`. Prova negativa (reintroduzir `CURRICULUM` em `engine.ts`): as 4 rotas críticas estouram o teto em 40-56 KB cada.
- **Medido antes → depois (gzip, soma dos chunks de firstLoad):** `/` 443,7→351,4 KB · `/aprenda/[slug]` 438,8→338,0 KB · `/revisar` 421,2→323,4 KB · `/verificar` 421,2→322,4 KB.
- **Achado à parte, não corrigido:** `storage.ts`/`auth.ts` têm uma segunda dependência sempre-síncrona de Zod via `UserProfileSchema` (`getUser`/`setUser`, ~15 call sites em `auth.ts`, mistura de funções síncronas e assíncronas). Fora do escopo desta rodada — tornar lazy exige async-ificar a cadeia de auth, risco de regressão no login sem tempo pra validar cada call site.

**Terceira classificação — temas** (`src/lib/curriculum/temas.ts`):
- Hub e trilha = hierarquia de **ensino**. Tema = eixo de **assunto**, e atravessa trilhas. Um módulo tem 1 hub, 1 trilha e N temas.
- `temas-mapa.ts` é **GERADO** por `python3 scripts/seo/gerar_corpus.py` — 1270 atribuições. **Não edite à mão.**
- Falso positivo do classificador se corrige em `EXCECOES_TEMA`, no gerador, com o termo que casou escrito na linha. O gerador falha se a exceção aponta para slug/tema inexistente ou para par que já não existe.
- `MINIMO_PARA_PAGINA = 3` — tema abaixo do limiar não ganha página e aparece em `/temas` como "Em produção", com a contagem à vista.
- Regerar o mapa **também regera** `docs/seo/CORPUS_10K_CONSULTAS.md`, o CSV e a fila `FILA_PERGUNTAS_POR_MODULO.md`: é o mesmo script.
- `temas-perguntas.ts` tem as 3 perguntas respondidas por tema (57 no total). **Contrato:** pergunta é `<h3>` e é a que se digita; resposta começa pela conclusão, mínimo 180 chars. Travado por `temas-perguntas.test.ts` e pela varredura. Ver `../ESTRATEGIA_SEO_ORGANICO_2026-08.md`.

### Gamificação — sistema completo

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/engine.ts` | XP, badges (128+), streak, level-up, freeze, SM-2 init. `CURRENT_SCHEMA` (exportado — `progress-sync.ts` importa em vez de duplicar o número) |
| `src/lib/game-state-codec.ts` | Único ponto de (de)serialização do GameState (LZ-string) — `engine.ts` e `progress-sync.ts` usam o MESMO `encodeGameState`/`decodeGameState`. Ver nota abaixo |
| `src/lib/srs.ts` | Algoritmo SM-2 real — easeFactor, interval, repetition |
| `src/hooks/useGameState.ts` | Hook principal — loadAsync, saveAsync, markComplete, reviewOne, bookmark, rate |
| `src/lib/progress-sync.ts` | Pull/push backend `/api/v1/progress` (debounced 3s); `pullProgressOnLogin` protege progresso anônimo não sincronizado; retry automático no evento `online` |
| `src/lib/leaderboard-api.ts` | getPublicLeaderboard, getMyRankAll por período |
| `src/lib/sounds.ts` | Web Audio API — playXPCoin, playLevelUp, playBadge, playPop, unlockAudio |
| `src/lib/toast.tsx` | Toasts celebrativos customizados (badge 🏆, streak 🔥, level ⭐) com animação própria |
| `src/components/GameHUD.tsx` | Top bar fixa — XP com bump animation, streak, meta diária, due cards |
| `src/components/StudyHeatmap.tsx` | Heatmap GitHub-style de 91 dias |
| `src/components/MyRankCard.tsx` | Card de rank em /progresso — XP gap para posição acima |

**GameState (schema v3):**
```ts
{
  xp, level, streak, lastStudyDate, completedModules,
  quizScores, badges, totalStudyTime, startedAt,
  reviewCards, archivedCards, studyDays,
  freezes, dailyGoal, lastReviewDate, lastArticle,
  preferredHub, onboardedAt, articleProgress,
  perfectQuizStreak, earlyMorningDays, trailStartedAt,
  bookmarks, moduleRatings,              // adicionados v3
  schemaVersion: 3
}
```

**Ao adicionar campo ao GameState**, seguir em ordem:
1. `engine.ts` — interface + DEFAULT_STATE + migrateState() + CURRENT_SCHEMA bump
2. `schemas.ts` — GameStateSchema Zod (`.strict()` quebra se campo ausente)
3. `useGameState.ts` — expor no hook se necessário

### Auth
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/components/auth/AuthProvider.tsx` | Pull progresso ao login, contexto global |
| `src/components/auth/LoginModal.tsx` | Magic link — email + phone BR |
| `src/components/auth/AuthBadge.tsx` | Botão login/logout no GameHUD |

### Module rendering (`src/components/article/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/aprenda/[slug]/page.tsx` | Wrapper real de toda página de módulo — Server Component CMS-driven. `ModuleLayout.tsx` (legado, pré-CMS) foi apagado; se você achar referência a ele em comentário antigo, é histórico, não código vivo |
| `primitives.tsx` | Section, Callout, CodeBlock (Shiki), ComparisonTable, DecisionBox, FlowDiagram, ArchFlow, MatrixDiagram, StackFlow, Timeline, NodeGraph, AnnotatedFormula |
| `ArticleToc.tsx` | TOC sticky desktop — IntersectionObserver, highlight ativo. **Religado em 12/ago/2026** (achado da auditoria pedagógica: ficou órfão na migração pro CMS-driven — nenhuma rota o importava, apesar de pronto) |
| `MobileToc.tsx` | TOC mobile — bottom sheet, trigger FAB. Mesmo achado/religação que `ArticleToc.tsx` |
| `BackToTop.tsx` | Botão flutuante (>50% scroll), z-index acima do MobileToc — **ainda órfão**, fora do escopo da rodada de 12/ago |
| `ReadingProgressBar.tsx` | Barra de progresso no topo (clamp 2px–4px) |
| `CopyButton.tsx` | Copy em CodeBlock — focus-visible, ffv-no-print |
| `RelatedArticles.tsx` | Navegação contextual — **ainda órfão** |
| `Prerequisites.tsx` | Pré-requisitos com progresso do leitor. **Religado em 12/ago/2026**: recebe `prereqs: PrereqInfo[]` como prop calculada no servidor (mesmo padrão de `NextSteps`, abaixo) — 364 de 490 módulos (74%) declaram `prerequisites`, e o dado só chegava ao JSON-LD antes disso |
| `NextSteps.tsx` | Sugestão de próximo módulo — recebe `steps: NextStepInfo[]` computado no servidor (`getModuleNextSteps`), nunca importa `CURRICULUM` no cliente |

**A cadeia de render tem TRÊS elos, e cada um tem gate próprio:**

```
seed JSON  →  adapter (BlockRenderer.tsx)  →  primitive (primitives.tsx)  →  tela
           ↑                               ↑
  validate_primitives_render.py     validate_adapter_primitive.py   ← declaração
                                    cobertura-de-blocos.test.tsx    ← pixel
```

O elo do meio ficou sem cobertura até 07/ago/2026, e três defeitos da mesma forma
o atravessaram: prop entregue pelo adapter e não declarada pelo primitive faz o
texto escrito **sumir da tela sem erro**. `decision_box.downside` (82 de 391
alternativas, 120 módulos), `annotated_formula.name` (53 de 201 partes, 12
módulos), `stack_flow.text` vs `detail` (282 de 367 itens).

**Declarar não é renderizar** — e é por isso que são dois gates, não um.
`annotated_formula.name` **estava** declarado no tipo, o gate estático passava, e
mesmo assim não aparecia: a normalização `text ?? label ?? name` o consumia como
fallback. Quem pega esse caso é o teste que afirma sobre a TELA, com o shape real
dos seeds — `cobertura-de-blocos.test.tsx`, que cobre os 26 tipos
automaticamente a partir de `BLOCK_DATA_SCHEMAS` e não pode ficar parcial.

**Primitives — notas importantes:**
- `CodeBlock` é async Server Component (Shiki)
- `whitespace-pre` no CodeBlock — scrollbar visível via `scrollbar-width: thin`
- `ComparisonTable` tem 2 versões: desktop (table) + mobile (stacked cards)
- `ArchDiagram` (ASCII puro) — **EVITAR** para novos módulos, preferir `ArchFlow`/`FlowDiagram`/`StackFlow`
- Bloco `arch_diagram` (o de ícones, `AwsDiagram.tsx`) é outra coisa e é o recomendado para topologia: 207 dos 427 módulos usam. **`kind: "vpc"` afirma isolamento de rede** — use só onde há recurso em subrede (Lambda anexada, RDS, ElastiCache, endpoint privado). Bedrock, Knowledge Bases, S3 e Athena são regionais e vão em `plain`. Gate: `validate_servicos_diagrama.py` (pegou 121 grupos errados em ago/2026)

### Home (`src/components/home/`)
`Hero`, `GameDemo`, `SocialProofBar`, `HowItWorks`, `ComecarAqui`, `Explorar`, `HomeRanking`, `ComunidadeAutor`, `FinalCta`

- `Hero.tsx` — personalizado para usuários com `lastArticle`: mostra "Continuar: [título]" em vez de "Começar agora"

### Analytics
- Plausible em `app/layout.tsx` (sem cookies, LGPD-ok)
- `src/lib/analytics.ts` — `track('event_name', { props })` — 13 eventos catalogados

### Componentes de engajamento
| Componente | Descrição |
|-----------|-----------|
| `OnboardingModal.tsx` | Primeira visita — 3 perguntas, recomenda hub/playlist personalizada |
| `SyncBanner.tsx` | Visitante com progresso → "logue para sincronizar" (dismiss 7d) |
| `PWAInstallBanner.tsx` | `beforeinstallprompt` — mobile (dismiss 14d) |
| `KeyboardShortcuts.tsx` | Modal "?" com 10 shortcuts listados |
| `BookmarkButton.tsx` | Toggle bookmark com aria-pressed |
| `ModuleRating.tsx` | 👍/👎 por módulo |
| `CelebrationOverlay.tsx` | Overlay de badge/level-up/streak com auto-dismiss 3.2s |

### Acessibilidade

- **Cor de acento como TEXTO usa `.ffv-acento-texto`**, nunca `style={{ color: cor }}`. As paletas de trilha/hub/tema/nível são da linhagem GitHub **dark**: 41 das 43 cores falham WCAG AA sobre fundo claro (1,57:1 a 4,35:1; mínimo 4,5). O utilitário em `globals.css` escurece só em tema claro, com **fator 57% calculado** — o menor que leva todas as 43 a 4,5:1 contra `#ffffff` e `#f6f8fa`.
- **Regra de tema tem de falhar em SEGURANÇA quando `data-theme` falta.** O escuro é o PADRÃO (`:root, :root[data-theme="dark"]`) e `data-theme` só existe depois do script de tema, que precisa de JS. Escreva o valor do escuro como padrão e trate o claro como opt-in por `[data-theme="light"]` — a ordem inversa derrubou o contraste de 7,49:1 para 2,87:1 com JS desligado. Travado por `tema-falha-em-seguranca.test.ts`.
- **A 13ª checagem da varredura roda axe-core** em **22 rotas**: violação ESTRUTURAL reprova; contraste tem **teto por rota**. O teto existe para a dívida ser visível e **só descer** — exigir zero faria desligarem a checagem.
- **A dívida de contraste caiu de 479 → 308 → 21 nós**, em duas passadas de 07/ago/2026. A primeira aplicou `.ffv-acento-texto` onde ele faltava (479 → 308). A segunda atacou a CAUSA RAIZ, que era a paleta (308 → 21), e **12 das 22 rotas foram a zero**. O utilitário existia desde ago/2026 e estava em **dois** lugares; a paleta de trilha e de hub continuava entrando como `style={{ color: cor }}` em `HubPageClient`, `TrailBlogClient` e `MapaClient`. Efeito por rota: `/mapa` **82 → 2** (na época, 7 hubs × 41 trilhas na mesma página), `/aws-bedrock` 39 → 3, `/ia` 31 → 1, `/arquiteturas-ia-aws` 17 → 3, `/aws` 11 → 1. Os tetos foram descidos no mesmo commit da correção.
- **A causa raiz de 287 dos 308 nós era a PALETA, não o componente.** No tema claro, cinco variáveis mediam entre 4,17:1 e 4,45:1 como texto (`--ffv-blue` 4,45, `green` 4,36, `purple` 4,33, `orange` 4,32, `yellow` 4,17). Corrigido na variável, com fator único de **0,89** — corrigir 308 pontos de uso deixaria o 309º nascer errado. Sem custo no tema escuro, que tem definição própria.
- **O fundo que importa é o CHIP TINGIDO, não o fundo da página.** Calcular só contra `--ffv-bg/bg2/bg3` deixou 67 nós de pé, todos com a mesma medida: `/explorar` tinha 61 nós de `#0964cf` sobre `#dae6f5`, que é `color-mix(in srgb, var(--ffv-blue) 12%, transparent)` — a cor sobre uma tinta 12% dela mesma, mais clara que `bg3`. O escopo correto é 3 fundos de página + tintas de 12% e 14% sobre `bg` e `bg2`. Tinta acima de ~20% é borda e brilho, e incluí-la faria o fator explodir sem corrigir nada real.
- **A tinta usa a variável JÁ escurecida.** Calcular a tinta com o valor original dá um fundo mais claro que o real e um fator otimista: 0,90 passava na conta e reprovava na medição. Travado por `paleta-contraste.test.ts`, que mede os dois temas contra 11 fundos.
- **Hex do tema escuro escrito à mão em componente é defeito recorrente.** `SimuladoCard` fixava `#f78166`/`#a371f7` — 2,21:1 e 2,9:1 em tema claro, e os 44 nós de `/simulados` saíam todos dali. Ao trocar por `var(--ffv-red)`, o sufixo de alfa em hex (`${accent}40`) deixa de funcionar: `var(--x)40` é CSS inválido e o navegador descarta a declaração inteira. Use `color-mix(in srgb, ${accent} 25%, transparent)`.
- **`opacity` sobre texto já apagado multiplica o apagamento.** `<span style={{ opacity: 0.6 }}>` sobre `--ffv-muted` levava 4,7:1 a 2,6:1 — 18 nós em `/perguntas`, num contador que é informação, não decoração.
- **Branco sobre acento claro não se lê.** Os acentos da paleta são claros: `#fff` sobre `#fbbf24` mede 1,66:1. Em círculo de iniciais o texto é o conteúdo inteiro do elemento; o par legível é o fundo escuro da marca.
- **Meça o teto sobre o BUILD, não sobre o `next dev`.** Os números diferem, e comparar dev contra build fez sete rotas parecerem regressão quando nenhuma havia regredido. Para remedir: zere os tetos, rode `npm run varredura -- -g "acessibilidade"` e leia a contagem real na mensagem de falha.
- **`overflow-x-auto` sem `tabIndex` deixa o conteúdo à direita inalcançável por teclado.** A correção do `arch_diagram` (ago/2026) não foi generalizada, e o axe só acusa onde o elemento **de fato rola** — então o defeito ficava invisível nas rotas auditadas, cujo conteúdo caberia em 1280 px. Corrigidos em 07/ago/2026: o `<pre>` do adapter `code_block` (**136 dos 427 módulos** têm linha de código acima de 88 caracteres, de 1.089 blocos) e o invólucro desktop de `ComparisonTable` (tabela de 5–6 colunas rola, e a última coluna costuma carregar o trade-off). Use `role="group"`, não `region`: nove blocos de código numa página produziriam nove landmarks de ruído.
- **Sufixo de alfa em hex NÃO funciona sobre `var()`, e falhava em silêncio em 58 pontos.** `${accent}30` produz `var(--ffv-blue)30` quando `accent` tem o valor padrão — CSS inválido, que o navegador **descarta inteiro**. Medido no navegador em 07/ago/2026: o cabeçalho tingido de `FlowDiagram` vinha `rgba(0,0,0,0)` e a borda `0px`. Valia para todos os primitives de diagrama (`arch_flow`, `flow_diagram`, `matrix_diagram`, `layer_stack`, `node_graph`, `stack_flow`, `timeline`, `comparison_flow`, `split_flow`, `annotated_formula`, `hierarchy_diagram`), então **os diagramas da plataforma renderizavam sem borda e sem tinta desde que o adapter passou a usar a variável**. Use `color-mix(in srgb, ${accent} 19%, transparent)`, que funciona com hex e com `var()`. Conversão: `0x12`→7%, `0x30`→19%, `0x40`→25%, `0x55`→33%.
  - O mesmo defeito estava em `SimuladoCard` e foi corrigido junto. Ele NÃO aparece em teste de componente que passa hex, e não aparece em revisão de código — só medindo `getComputedStyle` no navegador.
- **Tinta acima de ~14% da própria cor derruba o contraste do texto sobre ela.** O chip de destaque de `AnnotatedFormula` usava 20% e media 4,34:1. A faixa que `paleta-contraste.test.ts` garante é 12% e 14% sobre `--ffv-bg`/`--ffv-bg2`; passar disso exige trocar a cor do texto, não só a do fundo.
- **Cor de BORDA não é cor de texto.** `DecisionBox` pintava o rótulo `Alt:` com `--ffv-border` — **1,34:1**, um rótulo que carrega significado e praticamente não se lia. O `<p>` pai já era `--ffv-muted`; o span existia só para apagar mais, e apagou até desaparecer.
- **Ao usar `.ffv-acento-texto`, não escreva o nome da classe num comentário longo acima dela.** `tema-falha-em-seguranca.test.ts` procura `--ffv-acento` numa janela de 400 caracteres **depois de cada menção à classe** e conta a menção em comentário como uso — comentário de cinco linhas empurra a variável para fora da janela e reprova código correto.
- Três violações estruturais viviam em componente compartilhado e apareciam em TODA página: barra de progresso sem `aria-label`, `TooltipTrigger` envolvendo um `<a>` (use `render={<Link/>}`) e contêiner de rolagem do `arch_diagram` sem `tabIndex`.

**Consistência visual e acessibilidade — resolvido em 11/ago/2026** (`consistencia-visual-e-acessibilidade`):

- **O mesmo defeito de contraste tem DUAS polaridades, e o grep só pega uma.** "Branco sobre acento claro" (acima) é a polaridade óbvia. A OUTRA é `background: 'var(--ffv-blue)'` com `color` **escuro** fixo (`'#0d1117'`, não `'white'`): funciona no tema ESCURO (`--ffv-blue` é claro ali) e falha no CLARO (`--ffv-blue` vira escuro, texto escuro sobre escuro). Grep de `'white'`/`'#fff'` não pega essa segunda forma. Medido rodando a varredura de verdade (não só grep) em 11/ago: **101 de 121 rotas `/aprenda/lab-*`/`arq-ia-aws-*` reprovando** por um único botão (`FalhaAoCarregar.tsx`, "Tentar novamente", 3,02:1 no claro) — mais **21 ocorrências** do mesmo padrão espalhadas pela base, nenhuma pega por revisão de código. **A regra de verdade, para as duas polaridades:** texto sobre `background: var(--ffv-blue|red|purple)` é sempre `var(--primary-foreground)`, nunca hex literal — porque só o token muda de polaridade junto com a variável de acento entre os dois temas. Exceção: `var(--ffv-gold)` NÃO muda de valor por tema (mesmo hex nos dois), então texto escuro fixo sobre gold está correto — não trocar para o token ali.
- **Cor de DADO (trilha/hub/certificação) não pode usar `var(--primary-foreground)`** — são hex fixos por tema, arbitrários, e algumas são escuras (`#336791`, `#146eb4` — azuis de marca tipo Postgres/AWS). `var(--primary-foreground)` assume que o fundo troca de polaridade com o tema; cor de dado não troca. Use `readableTextColor(hex)` de `src/lib/readable-text.ts` — escolhe `#0d1117`/`#ffffff`, o que tiver mais contraste contra o hex dado. Testado contra toda cor real de trilha/hub/certificação em `readable-text.test.ts`.
- **Botão único, decisão parcial:** `FfvButton` (`src/components/ui/ffv-button.tsx`) é o componente de botão primário — os 4 componentes `ui/*` shadcn não usados (`button.tsx`, `card.tsx`, `badge.tsx`, `separator.tsx`) foram apagados (0 imports, verificado antes). A migração de MARKUP dos ~35 botões inline (`style={{ background: 'var(--ffv-blue)' }}`) para o componente `<FfvButton>` **não foi feita**: a variante `primary` do `FfvButton` é um GRADIENTE azul→roxo, enquanto a maioria dos botões inline usa `var(--ffv-blue)` CHAPADO — migrar trocaria a aparência sem uma decisão de design tomada. O que FOI feito: todos os call sites inline agora usam os MESMOS tokens de cor que `FfvButton` (`var(--primary-foreground)`, nunca hex/`white` literal) — unificação de cor sem unificação de markup. Decisão em aberto: `FfvButton` ganha uma variante chapada, ou os call sites chapados são o padrão a corrigir.
- **Gate de hex de tema em `style={{}}`:** `scripts/check-hex-in-style.mjs`, chamado por `npm run lint`. Falha se um hex literal duplicar o valor atual de um token `--ffv-*`/semântico (ex.: escrever `'#f78166'` em vez de `var(--ffv-red)`). É um RATCHET, não um zero: teto declarado no topo do script, só pode descer — medido 126 em 11/ago, várias rodadas de correção baixaram para 89 na mesma sessão. Exceção: `opengraph-image.tsx` (runtime do `next/og`, sem CSS) e comentário `// hex-ok` na mesma linha (cor de marca de terceiro, ex. LinkedIn `#0a66c2`).
- **Espaçamento: Tailwind venceu.** `--space-*` (`globals.css`) tinha 0 consumidores contra milhares de usos de `p-*`/`gap-*`/etc. — removido.
- **`useFocusTrap(ref, isOpen)`** (`src/hooks/useFocusTrap.ts`) contém Tab dentro do modal e devolve o foco ao gatilho ao fechar. Aplicado aos 13 `role="dialog"` da plataforma (nenhum prendia foco antes). Uso: ref no elemento raiz que tem `role="dialog"`, mais `tabIndex={-1}` nele (fallback de foco quando o modal não tem elemento focável).
- **`Breadcrumb`/`BackButton`** (`src/components/Breadcrumb.tsx`, `BackButton.tsx`) são os componentes únicos de wayfinding — `nav>ol` com `aria-current="page"` no item atual; `ArrowLeft` do lucide-react em vez do glifo `←` cru. 24 breadcrumbs e ~12 back-links copiados à mão existiam antes; migração aplicada nas rotas pessoais (`/progresso`, `/perfil`, `/devcard`, `/revisar`, `/plano`, `/times`) e em ~7 back-links fora delas — as ~18 instâncias de breadcrumb restantes (a maioria em páginas não-pessoais) e o breadcrumb de `/aprenda/[slug]` (que casa com o `BreadcrumbList` do JSON-LD — não mexer) ficaram fora.
- **Alvo de toque de 44px é responsivo, não incondicional.** `CommandPaletteTrigger` (busca do HUD) tinha `height: 32` fixo — virou ícone-só abaixo de 44px no mobile. Fix: `h-11 sm:h-8` via Tailwind (inline `style` sempre vence `className` para a MESMA propriedade, então a altura teve que sair do `style` para o `className` poder variar por breakpoint).

### SEO
- **Convenção de URL: SEM barra final.** O servidor não usa `trailingSlash` — `/aprenda/x/` responde **308**. Canônica, `Article` JSON-LD, `llms.txt` e sitemap usam a mesma forma. Travado por `src/tests/integration/indexacao.test.ts` + 9ª checagem da varredura (que faz `GET` na canônica com `maxRedirects: 0`).
- `src/lib/site-jsonld.ts` — `@graph` do site (`EducationalOrganization` + `Person` + `WebSite`) com `@id` estável, emitido **uma vez** no layout raiz. Páginas referenciam por `@id`. **Sem `SearchAction`** (não há rota de busca).
- **`/admin` fora do índice por `X-Robots-Tag`** em `next.config.ts` — o layout é client component e não pode exportar `metadata`.
- **Rota pessoal (`/progresso`, `/perfil`, `/revisar`) declara `noindex` na página e NÃO entra no `disallow`** do robots: bloquear o rastreamento impediria o buscador de ler o noindex.
- `src/app/sitemap.ts` — gerado dinâmico (CURRICULUM + HUBS + páginas)
- `src/app/robots.ts` — AI crawlers explícitos (GPTBot, ClaudeBot allowlisted)
- **Cartão social vem de `social()`, em `src/lib/metadata-social.ts` — nunca escreva `openGraph` à mão.** Duas regras do Next que produziram 69 defeitos medidos em 06/ago/2026:
  - `openGraph` de uma página **SUBSTITUI** o do layout, não mescla campo a campo. `openGraph: { title, description, type, url }` apaga o `images` herdado → **11 páginas saíam sem `og:image`**.
  - o que a raiz declara é herdado INTEIRO por quem não declara. Com `title` e `url` na raiz, **58 páginas emitiam `og:url` da home e `twitter:title` genérico** — cada uma se anunciando como a página inicial. A raiz hoje herda só o que é verdade para toda página (`siteName`, `locale`, `images`, `card`); sem `title` lá, o Next cai no título da própria página.
  - `twitter` **não** herda de `openGraph`. `social()` monta os dois.
  - Travado por `metadados-sociais.test.ts` + a 14ª checagem da varredura, que mede o HTML servido de TODA URL do sitemap.
- **`lastmod` voltou em 07/ago/2026, só para artigo e só onde há data real.** Ele havia sido removido porque as 520 URLs traziam a data do build — sinal uniforme que o Google IGNORA, inclusive onde seria verdade. A quinta fonte de data (`curriculum_articles.updated_at`) era igualmente falsa: o importador fazia `SET updated_at = now()` INCONDICIONALMENTE nos 427 artigos. Corrigido na origem — migration `000045` acrescentou `content_hash`, e o importador (`backend/cmd/importer/hash.go`) só move a data quando o hash do conteúdo NORMALIZADO muda. Três regras: só URL de `/aprenda/`; só slug presente em `content-dates.json` (escrito por `importer --emit-dates`); e **arquivo vazio é estado válido e é o padrão** — sem banco no build, nenhuma URL declara data. A 15ª checagem da varredura trocou de pergunta: deixou de exigir ausência e passou a exigir DISTINÇÃO.
  - A normalização do hash é o que impede o pior modo de falha: ordem de chave estável, `id` de bloco fora do cálculo, fim de linha e espaço à direita descartados. Sem isso, rodar um formatador nos seeds bumparia a data dos 427 de uma vez, e não haveria como distinguir depois. Coberto por `Test_contentHash_ReformatarJSON_NaoMudaHash`.
- **Rota que mostra dado do usuário declara `noindex`.** Vale para `/progresso`, `/perfil`, `/revisar` e, desde 06/ago/2026, `/devcard`, `/plano`, `/times` e `/certificacoes` — rastreador anônimo vê o estado vazio. Também `/simulados/cloud-practitioner/estudo`, que é envolvida em `RequireAuth`: indexar parede de login entrega resultado inútil.
- **`og:image` por módulo é GERADO SOB DEMANDA** em `src/app/aprenda/[slug]/opengraph-image.tsx` (`ImageResponse` do `next/og`), pré-gerado no build pelos slugs conhecidos. Substituiu `src/lib/metadata.ts` + `scripts/generate-og-images.mjs`, que apontavam para `out/og/` — diretório que deixou de existir com `output: "standalone"`. As duas peças eram mortas e as 426 páginas saíam **sem `og:image`**: só `twitter:image` do layout raiz, que serve ao X e a mais nada.
  - **Não use emoji no cartão.** `ImageResponse` baixa fonte de serviço externo por glifo desconhecido (`Failed to download dynamic font`) — requisição externa por imagem, num app cuja CSP bloqueia host externo.
  - `openGraph` declarado sem `images` **não** herda a imagem da convenção do segmento raiz. E `twitter` não herda de `openGraph`: os dois precisam ser declarados no `generateMetadata`.
- **`description` tem contrato de faixa e de forma**, em `seo-descriptions.test.ts`: 70–165 caracteres, sem selo `— guia PT-BR.` no fim, e tem de ser frase (proxy: pelo menos duas palavras funcionais minúsculas). O gate anterior exigia só `≥40`, e por isso 297 descrições eram lista de palavra-chave — `Image segmentation U-Net SAM Meta — PT-BR.`, 42 caracteres. Reescritas em 06/ago/2026; mediana foi de 89 para 124.
- **Título de módulo pode passar de 60 caracteres, e isso é decisão.** 237 dos 426 passam com o sufixo ` — FFV Academy`. O Google trunca o display sem penalizar ranking e costuma descartar o próprio sufixo da marca; os títulos carregam significado pedagógico. Não encurte por régua de exibição.
- **Número que o site anuncia sobre si é verificado em CI** por `numeros-publicos.test.ts`: varre `src/app`, `src/components` e `curriculum/trails/` comparando toda contagem de trilhas/módulos/artigos/hubs com o CURRICULUM. O `og:image` da raiz dizia "17 trilhas" e "570+ módulos" com 40 e 426.

---

## ⚠️ Gotchas críticos

### SSR Docker (`output: "standalone"`)
- O bundle final é uma imagem Docker (`ffv-frontend`) que roda **Node.js 24/7** na VPS.
- `headers()` em `next.config.ts` **FUNCIONA** — CSP HTTP real é a fonte de verdade (ver bloco abaixo).
- `dynamic = 'force-dynamic'` e Server Actions funcionam.
- `generateStaticParams` continua sendo usado para pré-renderizar URLs estáticas no build (**426** slugs de `/aprenda/[slug]`, simulados, etc.) — Next entrega HTML pronto no primeiro hit e troca pra dinâmico depois.
- Imagens externas precisam `images.unoptimized: true` (já configurado) **OU** configurar `images.remotePatterns`. Mantido `unoptimized: true` para evitar dependência do otimizador `sharp` no container.
- **NÃO existe `trailingSlash`, e não pode passar a existir.** Esta linha dizia o contrário até 06/ago/2026 — `trailingSlash: true` "obrigatório", herança da época do export FTP — enquanto o código não tem a opção e a convenção de URL é SEM barra final (ver SEO acima). Ligar a opção inverteria a canônica de 426 páginas e reprovaria a 9ª checagem da varredura no mesmo commit.

### RSC payloads em SSR
- Em `output: "standalone"`, os RSC payloads (`__next.*.txt`) são **gerados em runtime pelo Node** a cada navegação. Soft navigation entre páginas: **~80ms**.
- O ADR `docs/adr/0002-exclude-rsc-payloads-from-ftp-deploy.md` está marcado como **superseded** — só fazia sentido em static export FTP.

### CSP (Content Security Policy)
- **Fonte de verdade: HTTP header `Content-Security-Policy`** no `next.config.ts` (`async headers()`). Roda em todas as rotas em prod.
- Permite: `'self'`, Plausible (analytics), Stripe (`js.stripe.com`), `images.unsplash.com`, `*.googleusercontent.com`, `NEXT_PUBLIC_API_BASE_URL`.
- `frame-ancestors 'none'` (anti-clickjacking) — agora é efetivo via header HTTP (meta tag não suporta).
- **Endurecida em 11/ago/2026** (achado P-07 da auditoria de segurança): `script-src` perdeu `unsafe-eval`/`data:`/`blob:` — confirmado sem uso real (`CodePlayground.tsx`, o único `new Function()` do projeto, sem importador na época). `'unsafe-inline'` **ficou**: removê-lo (mesmo com hash SHA-256 correto pro script de tema) quebra a hidratação RSC do App Router, que injeta `<script>` inline por request (`self.__next_f.push(...)`) com conteúdo que muda a cada build/rota — hash estático não cobre isso, e nonce exigiria middleware (que desliga cache estático/ISR). Verificado empiricamente com Playwright contra o build de produção antes da decisão, não por suposição.
- **`CodePlayground.tsx` quarentenado em 12/ago/2026** (achado P-16): "sem importador" era um fato do momento, não uma garantia — movido pra `drafts/` (fora de `src/`, fora do `include` do tsconfig) pra tornar a ausência estrutural. `scripts/check-no-code-execution-cdns.mjs` (`npm run check:no-code-execution-cdns`, rodado no CI depois do build) falha se qualquer chunk de produção voltar a referenciar `cdn.jsdelivr.net/pyodide` ou `esm.sh/esbuild-wasm` — mede o bundle real, não a ausência de import. Requisito de sandboxing antes de religar: `PENDENCIAS.md`, item F-2.
- **`/admin` tem gate server-side desde 11/ago/2026** (achado P-06): `admin/layout.tsx` só renderiza o shell depois de `syncProfileFromServer()` confirmar `role==='admin'` — chamada de rede real (`POST /api/v1/auth/refresh`), sem fallback pra cache, ao contrário de `refreshSession()`. Fecha o bypass de editar `role` no localStorage via devtools (a enforcement real de dado já era o backend, `RequireAdmin` fail-closed em toda rota `/api/v1/admin*` — este gate é sobre não mostrar a casca da UI).

### Healthcheck endpoint
- `src/app/api/health/route.ts` expõe `GET /api/health` para o Docker `HEALTHCHECK CMD`.
- Retorna `{ status: "ok" }` 200. Usado pelo `docker-compose.prod.yml` (frontend service) para `start_period`/`restart`.

### Pre-renderização vs runtime
- Rotas com `generateStaticParams` **e** dados que mudam pouco (artigos `/aprenda/<slug>`): HTML pré-gerado no build, refresh a cada deploy.
- Rotas dinâmicas client-side (admin, simulados, ranking, news/cheatsheets/playlists/comments): shell vazio + `fetch` em runtime → SEMPRE atualizadas sem deploy.
- **ISR já está ativo** em `/aprenda/[slug]`: o build reporta `revalidate 1h / expire 1y`, então artigo editado no admin aparece sem deploy, com até 1h de atraso. Falta só o webhook do admin disparando `revalidatePath('/aprenda/<slug>')` para propagar na hora em vez de esperar a janela.

### Zod + GameStateSchema (`.strict()`)
- `GameStateSchema` usa `.strict()` — **qualquer campo não declarado causa rejeição**
- Ao adicionar campo em `GameState`: adicionar como `.optional()` em `schemas.ts`
- Caso contrário, `importState` e testes de export/import **quebram silenciosamente**
- **`GameStateSchema` é import DINÂMICO em `engine.ts`/`progress-sync.ts`** desde 11/ago/2026 — `import('./schemas')`, nunca `import { GameStateSchema } from './schemas'` no topo do arquivo. Os dois módulos são alcançados por TODA rota (via `GameHUD`), e Zod inteiro pesa ~61,5 KB gz. `importState()` (em `engine.ts`) e `readLocalState()`/`pullProgress()` (em `progress-sync.ts`) viraram `async` por causa disso — qualquer novo call site precisa `await`.

### O formato de persistência do GameState é UM só — use game-state-codec.ts
`engine.ts` grava o `GameState` comprimido com LZ-string (`ffv_academy` no
localStorage). Até ago/2026, `progress-sync.ts` tinha sua PRÓPRIA leitura via
`getJSON`/`JSON.parse` cru — nunca descomprimia, então `readLocalState()`
sempre devolvia `null`, `pushProgress` desistia antes de sequer chamar a API,
e XP/streak/SRS nunca saíam do navegador. O teste de integração da época
semeava o localStorage com JSON puro (o formato que a engine nunca produz),
então passava verde sobre o bug. **Qualquer código que leia ou escreva
`STORAGE_KEYS.GAME_STATE` diretamente usa `encodeGameState`/`decodeGameState`
de `game-state-codec.ts` — nunca `JSON.stringify`/`JSON.parse` cru nem
`getJSON`/`setJSON`.** `engine.ts` exporta `CURRENT_SCHEMA`, `hasLocalState()`
e `restoreFromBackup()` especificamente para outros módulos (sync, fallback de
IndexedDB) não duplicarem essa lógica de novo.

### JSX em strings
- Em arrays de options: `['...> 5']` — JSX `{'>'}` NÃO funciona dentro de strings, use `>` direto
- Em JSX text content: `<>{'>'}5</>` — usar `{'>'}` é correto
- Backticks em CodeBlock template literal — escapar como `` \` ``

### Conflitos `public/`
- `public/sitemap.xml` ou `public/robots.txt` causam **erro 500** (conflito com `app/sitemap.ts`)
- REMOVIDOS — **nunca recriar**

### Rota retirada tem inventário — não apague e siga
- **`src/lib/rotas-retiradas.ts` é a fonte única** das 55 rotas que o pivot retirou, com a disposição de cada uma (`sucessor`, `hub` ou `removido`) e o motivo escrito. `next.config.ts` consome esse arquivo; não escreva redirect à mão lá (um gate reprova se escrever).
- Ao apagar página, **declare no inventário**. Auditoria de 06/ago/2026: havia **6 redirects para 55 rotas apagadas** — 49 URLs que produção serve hoje iam virar 404 no deploy, e nada reclamava, porque `next build` não sabe que uma URL existia ontem.
- `removido` = 404 de propósito. Redirect para página que não fala do assunto é **soft 404** aos olhos do Google, e pior para o leitor que um 404 honesto.
- `/search` e `/search-trilha` **não existem mais** (esta seção descrevia as duas como vivas): a busca é o CommandPalette, e a trilha de Search & IR virou `/search-ir-deep`.

### Sonner toast animations
- `toast.badge()`, `toast.streak()`, `toast.levelUp()` usam `toast.custom()` + `unstyled: true`
- Animação de enter/exit controlada **internamente** no componente via `useToastFade()` hook
- `globals.css` tem overrides de `[data-sonner-toast]` para animações mais fluidas globalmente
- **Não** usar `toast.custom()` com `unstyled: true` esperando as transitions do Sonner — não funcionam

### Audio (Web Audio API)
- `unlockAudio()` **deve ser chamado** num evento de clique do usuário antes de qualquer som
- GameHUD chama `unlockAudio()` no primeiro clique do header
- ReviewClient chama `unlockAudio()` em `handleSelect()`

---

## 🚀 Deploy e Infraestrutura

### Onde o frontend roda

| Item | Detalhe |
|------|---------|
| **Provedor** | Hostinger — VPS KVM 2 (mesma máquina do backend) |
| **IP** | `72.60.28.82` |
| **Datacenter** | Estados Unidos — Boston (latência ~120ms BR; será mitigada por Cloudflare na próxima sprint) |
| **Domínio principal** | `fernandofrancovalle.com` + `www.fernandofrancovalle.com` |
| **Subdomínio API** | `api.fernandofrancovalle.com` (mesma VPS, rota Nginx host-based) |
| **Tipo de deploy** | Docker SSR (`next.config.ts` → `output: "standalone"`) — imagem `ghcr.io/feh-franc0/ffv-frontend` |
| **Servidor reverse proxy** | Nginx no docker-compose.prod.yml (TLS 1.2/1.3 + HSTS) |
| **Container** | Node 20 alpine runner, expõe `:3000`, healthcheck via `GET /api/health` |
| **Resource limits** | 512 MB RAM / 0.8 CPU |

### ⚠️ Migração DNS+SSL pendente

O domínio raiz ainda aponta pra Hostinger LiteSpeed antiga (build estático de 13/mai). Ver [README raiz — Migração DNS+SSL pendente](../README.md#migração-dnsssl-pendente) para o passo a passo completo. Resumo:

1. **Painel Hostinger DNS** → trocar registros A de `@` e `www` de `89.116.115.228` → `72.60.28.82`
2. **SSH na VPS** → `sudo certbot certonly --webroot -w /var/www/certbot -d fernandofrancovalle.com -d www.fernandofrancovalle.com`
3. **Reload Nginx** → `docker compose -f /opt/ffv/docker-compose.prod.yml exec nginx nginx -s reload`

Enquanto não for feito: o site público continua mostrando o build estático antigo da Hostinger, sem `/admin`, sem os refactors de simulado, sem as 1015 questões CLF-C02 conectadas via banco.

### Como o deploy funciona (automático)

```
git push main
  → CI passa (.github/workflows/ci.yml)
  → .github/workflows/deploy.yml dispara
      ├── build-push: Docker → ghcr.io/feh-franc0/ffv-api:sha-<hash>
      ├── build-push-frontend: Docker → ghcr.io/feh-franc0/ffv-frontend:sha-<hash>
      │     (NEXT_PUBLIC_API_BASE_URL injetado como build arg)
      └── deploy-backend (também deploya frontend):
            1. SCP: docker-compose.prod.yml + nginx conf + migrations → VPS /tmp/
            2. SSH: executa /opt/ffv/bin/deploy.sh na VPS
                a. docker pull das duas imagens novas
                b. migrate up (postgres) — inclui seed CLF idempotente
                c. docker compose up -d --scale api=2 api frontend
                d. health check ambos (até 120s)
                e. atualiza nginx
                f. rollback automático se health check falhar
```

**Não há downtime de backend** (réplicas com max_fails detectam queda e rotam). **Frontend tem ~5s de blip durante o swap** (container antigo para, novo sobe) — Cloudflare na frente (próxima sprint) elimina isso.

### Deploy manual (emergência)

```bash
# Compilar imagem frontend localmente e push pro GHCR
cd frontend
docker build -t ghcr.io/feh-franc0/ffv-frontend:emergency \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.fernandofrancovalle.com .
docker push ghcr.io/feh-franc0/ffv-frontend:emergency

# Na VPS, force pull + recreate
ssh deploy@72.60.28.82
FRONTEND_TAG=emergency docker compose -f /opt/ffv/docker-compose.prod.yml up -d --no-deps frontend
```

### GitHub Secrets necessários (Settings → Secrets → Actions)

| Secret | Valor |
|--------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.fernandofrancovalle.com` |
| `VPS_HOST` | `72.60.28.82` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | chave privada ed25519 do usuário `deploy` |
| `VPS_PORT` | `22` |

> Secrets antigos do FTP (`HOSTINGER_FTP_SERVER`, etc.) **podem ser removidos** — não são mais usados desde o commit `845eddb`.

### Ativar deploy automático

Por padrão o deploy está **desativado** até a infra estar configurada.
Para ativar: GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

---

## 📚 Referências cross-projeto

- [`../CLAUDE.md`](../CLAUDE.md) — **pitch completo, proposta de valor, roadmap, posicionamento**
- [`../CHANGELOG_PLATFORM_2026-05.md`](../CHANGELOG_PLATFORM_2026-05.md) — todas as mudanças de maio/2026
- [`../BACKEND_ROADMAP.md`](../BACKEND_ROADMAP.md) — features que dependem de backend
- [`../backend/CLAUDE.md`](../backend/CLAUDE.md) — deploy e infra do backend (VPS + Docker)
- [`../MELHORIAS.md`](../MELHORIAS.md) — roadmap pedagógico/visual
