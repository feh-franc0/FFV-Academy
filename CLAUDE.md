# FFV Academy — Monorepo

---

## 🎯 O QUE É A FFV ACADEMY

**FFV Academy é a escola de arquitetura de soluções AWS e IA em produção — gratuita, gamificada e sem hype.**

O eixo é a **junção**: saber desenhar a arquitetura E saber o que os serviços de IA da AWS fazem por baixo. Enquanto o mercado vende "use o ChatGPT para ganhar dinheiro", aqui se aprende a decidir entre Knowledge Bases e retrieval próprio, por que a cota do Bedrock quebra antes da CPU, e o que o Textract responde quando devolve confiança alta num campo errado.

### Proposta de valor em uma frase
> **"Arquitete soluções de IA na AWS como engenheiro — Bedrock, Knowledge Bases, agents e os 100 laboratórios que provam cada decisão. Gratuito, gamificado e com revisão espaçada real."**

### O que a plataforma NÃO é (decidido em ago/2026)
Não é escola de ferramenta de fornecedor. O hub `claude-anthropic` foi retirado com 49 módulos sobre Claude Code, harness engineering e a certificação Anthropic: nenhum deles ensinava a desenhar solução de IA na AWS. Claude, no eixo atual, é **um modelo que se consome via Bedrock** — e esse assunto mora em `bedrock-claude-na-aws-ecossistema`. Quatro módulos daquele hub tinham lacuna correspondente do lado AWS e foram **reescritos** como conteúdo Bedrock, não apagados.

---

## 🏆 DIFERENCIAIS COMPETITIVOS

### 1. Profundidade técnica real
Não são tutoriais de surface-level. Cada módulo explica o *porquê* por baixo: como o attention mechanism funciona matematicamente, por que o PostgreSQL usa MVCC em vez de locking, o que acontece dentro do kernel quando você faz um `syscall`. **Profundidade que a concorrência não tem coragem de oferecer.**

### 2. Gamificação completa e coerente
Não é um "badge pelo bem da gamificação". É um sistema com:
- **XP + Níveis** (16 níveis, de Iniciante a Lendário)
- **128+ badges** com lógica real de desbloqueio (ex: "Especialista em RAG" = completar 5 módulos de RAG)
- **Streak diário** com sistema de freeze (proteção de streak para dias offline)
- **Revisão Espaçada (SM-2)** — os quizzes viram flashcards com algoritmo SM-2 real
- **Ranking** com 4 períodos (geral, anual, mensal, semanal)
- **Meta diária** customizável (1–10 módulos/dia)
- **Sons de feedback** (XP coin, level up, badge) via Web Audio API

### 3. SRS (Spaced Repetition System) real
Após cada quiz, as perguntas entram numa fila de revisão espaçada com algoritmo SM-2 (o mesmo do Anki). O sistema recalcula intervalo baseado na dificuldade — não é "marque como pronto", é memorização científica de longo prazo.

### 4. 100% gratuito, sem paywall de conteúdo
Cada artigo, trilha, quiz, badge e ranking é gratuito. Monetização é via simulados de certificação (AWS, etc.) — não via paywalls em conteúdo educacional.

**Banco de simulados (09/ago/2026): 1.565 questões no Postgres** — CLF-C02 (1.015), DVA-C02 (435) e AIF-C01 (115). Fonte em `frontend/data/question-bank/`, publicada por `make gen-seed-migration`. As 65 questões da AIF são **originais**, escritas a partir dos enunciados de tarefa do guia oficial e distribuídas nos pesos publicados dos cinco domínios; reproduzir questão real de prova violaria o acordo de certificação da AWS e poderia custar a certificação de quem estuda.

### 5. Currículo estruturado em hubs
**5 hubs no eixo AWS + IA**, com **38 trilhas e 490 módulos**. Hierarquia: Hub → Trilha → Módulo. A ordem responde "onde eu começo?", não é alfabética nem histórica:

| Hub | Rota | Trilhas | O que é |
|-----|------|--------:|---------|
| **IA na AWS** ← o centro | `/ia-aws` | 4 | Bedrock ponta a ponta (36 módulos), 100 arquiteturas de IA, **AIF-C01 e MLA-C01** |
| Arquitetura de Soluções AWS | `/aws` | 5 | Os 100 laboratórios + CLF-C02, DVA-C02, SAA-C03, SAP-C03 |
| Fundamentos de IA | `/ia` | 13 | O conhecimento que faz a escolha de serviço ser decisão, não chute |
| Produção e Dados para IA | `/engenharia` | 10 | SRE, distribuídos, FinOps, segurança + a camada de dados do retrieval |
| Base técnica | `/fundamentos` | 6 | Terminal, Git, HTTP, redes, SQL, Python/TS/Go — hub de apoio |

**A jornada (`/jornada`) é o eixo de LEITURA, transversal aos hubs**: base técnica → AWS do básico ao avançado → IA do básico ao avançado → a união (IA na AWS) → sustentar em produção. Fonte única em `frontend/src/lib/curriculum/jornada.ts`, e ela alimenta ao mesmo tempo o `nextSuggested` entre trilhas, a página, o `coursePrerequisites` do JSON-LD e o `llms.txt`. Antes dela, **31 das 38 trilhas terminavam em beco sem saída**.

`/dados` foi absorvido por `/engenharia` e `/programacao` por `/fundamentos`: eram hubs rasos de assunto de apoio, e hub raso dilui a navegação em vez de organizá-la. Disposição de toda rota retirada em `frontend/src/lib/rotas-retiradas.ts`.

> **Repertório de arquitetura (ago/2026):** a trilha **100 Arquiteturas de IA na AWS** (`trail-arq-ia-aws`, 10 módulos) desenha uma arquitetura percorrível para cada uma das 100 soluções do catálogo — 100 `arch_diagram` com legenda que entrega a decisão e 5 passos. Os seeds são **gerados** por `scripts/seo/gerar_arquiteturas_100.py` a partir de `docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md`, que continua sendo a fonte do problema, da cadeia e da origem. Cobertura de diagrama na base: **291 de 490 módulos (59%)**.
>
> **Barra de qualidade, medida em 07/ago/2026:** cobertura conta quantos módulos
> têm diagrama; ela não diz se o diagrama ensina. `validate_servicos_diagrama.py`
> passou a medir isso, e a dívida é de **871 arestas sem rótulo e 218 nós sem
> nota**, em 172 módulos escritos à mão — a trilha gerada está em zero, porque o
> DSL já cobrava. Em modo relatório, com a linha de base no cabeçalho do script.

> **Foco estratégico — o eixo atual (ago/2026):** **arquitetura de soluções AWS + IA em produção sobre serviços AWS.** O centro é `/ia-aws`: Bedrock, Knowledge Bases, Agents e AgentCore, Guardrails, as 100 arquiteturas e as duas certificações de IA na AWS — AIF-C01 e MLA-C01. Os 100 laboratórios são a competência de arquiteto que sustenta tudo isso; os fundamentos de IA existem para que a escolha de serviço seja decisão e não chute.
>
> Duas medições motivaram o estreitamento de ago/2026. Primeira: dos 526 módulos, só **130 (25%)** tinham densidade real de AWS **e** de IA — 151 ensinavam IA sem nunca chegar a um serviço, 116 ensinavam AWS sem IA. O problema não era falta de conteúdo, era falta de **junção**. Segunda: o hub declarado como "o centro" (Claude & Anthropic) tinha **5,5% do conteúdo** contra 68% de AWS — a estratégia escrita contradizia a execução por 12 para 1.
>
> **Histórico:** jul/2026 estreitou de "escola de tudo" (10 hubs, 88 trilhas, 803 módulos, com Web3/Flipper/Marketing/mobile nativo) para IA/Claude/AWS. Ago/2026 removeu o eixo Claude-ferramenta, consolidou em 5 hubs e acrescentou a trilha **MLA-C01** (13 módulos, 157k) — a certificação de engenheiro de ML na AWS, que estava citada 91 vezes no conteúdo e não existia como produto. Total: 38 trilhas, 490 módulos. Ver `refactor/foco-ia-claude`.

### 6. PWA — funciona como app
Instalável como PWA no iOS/Android. Service worker com cache. Reading progress bar, bookmarks, modo de leitura focado.

---

## 🆚 POSICIONAMENTO vs CONCORRENTES

| | FFV Academy | Duolingo | Khan Academy | Brilliant.org | Udemy |
|--|--|--|--|--|--|
| Conteúdo técnico profundo | ✅ | ❌ (superficial) | 🟡 (médio) | 🟡 (médio) | ✅ |
| Gratuito | ✅ | 🟡 (freemium) | ✅ | ❌ ($$$) | ❌ ($$$) |
| Gamificação completa | ✅ | ✅ | 🟡 | 🟡 | ❌ |
| SRS / Revisão espaçada | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ranking público | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certificados verificáveis | 🟡 (simulados) | ❌ | 🟡 | ❌ | ✅ |
| Foco em devs brasileiros | ✅ | ❌ | ❌ | ❌ | 🟡 |
| PWA / Offline | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Conteúdo em PT-BR | ✅ | ❌ | ❌ | ❌ | 🟡 |

**Síntese**: A FFV Academy é a única plataforma que combina **profundidade técnica real** + **gamificação completa** + **SRS** + **gratuito** + **PT-BR**. É o ponto de intersecção que nenhuma outra preenche.

---

## 🗺️ ROADMAP DE FUNCIONALIDADES

### 🔥 TIER 1 — Próximas sprints (alto impacto, baixo esforço)

1. **Leaderboard por trilha** — ranking dentro de cada trilha específica, não só global
2. **Certificado por trilha** — PDF/PNG verificável ao completar 100% de uma trilha (reutilizar Certificate.tsx)
3. **Próximo artigo inteligente** — ao concluir módulo, card direto para o próximo na sequência
4. **Estatísticas de performance por trilha** — % de acerto por trilha, tempo médio, tendência semanal
5. **Maratona de revisão** — configurar sessão SRS (qtd de cards, trilha específica, timer)
6. **Email semanal de progresso** — resumo automático: XP, streak, badges, recomendação

### ⚡ TIER 2 — Médio prazo (alto impacto, médio esforço)

7. **Amigos / grupos de estudo** — leaderboard privado entre amigos via código de grupo
8. **Trilha do Dia** — 1-3 módulos recomendados diariamente pelo algoritmo
9. **Quests diárias/semanais** — "revise 3 cards", "complete 1 módulo", "atinja 80% no quiz"
10. **Power-ups consumíveis** — XP 2x por sessão, freeze extra, skip SRS card (desbloqueados por badges raros)
11. **Dev card compartilhável** — `/devcard/@username` com badges, XP, streak (viral no LinkedIn/Twitter)
12. **Trending modules** — top 10 módulos da semana na home (por completions + rating)

### 🌱 TIER 3 — Roadmap estratégico

13. **Discussão por artigo** — comentários com markdown por módulo (reduz fricção de dúvidas)
14. **Export Anki** — gerar `.apkg` com os cards SRS de uma trilha
15. **LLM-powered learning path** — Claude API analisa erros nos quizzes e recomenda próximos passos
16. **AI quiz generator** — gerar 5 quizzes extras por artigo via Claude API
17. **Certificados de trilha verificáveis no backend** — QR code + endpoint de validação
18. **Multi-idioma (EN/ES)** — internacionalização via next-intl para expansão global

---

## 📁 ESTRUTURA DO MONOREPO

| Pasta | O que é | Stack |
|-------|---------|-------|
| `frontend/` | App web Next.js (artigos, simulados, gamificação, ranking) | Next.js 16, TypeScript, Tailwind, Vitest |
| `backend/` | API REST + workers (auth, sync, leaderboard, certificados, billing) | Go 1.25, Chi, PostgreSQL, Redis |
| `video-pipeline/` | Pipeline de geração de vídeos de marketing | TypeScript, Remotion 4, Playwright |
| `mcp/` | MCP server — expõe o currículo FFV ao Claude (24 tools) | TypeScript, Node 20, MCP SDK |
| `drawio-tools/` | Scripts para diagramas de arquitetura AWS | Python, Bash, draw.io |
| `legacy-site/` | Site estático HTML/CSS/JS anterior | HTML/CSS/JS puro |
| `docs/` | Decisões de projeto e planejamento | Markdown |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Frontend
cd frontend && npm install && npm run dev   # dev server :3000
cd frontend && npm test                     # 62 test files, 562 tests
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

## 📌 ESTADO ATUAL (maio 2026)

A plataforma evoluiu de "portal de IA + engenharia" para **escola completa do Profissional Digital do Futuro**: IA, AWS, engenharia, comunicação humana, carreira, conteúdo, marketing e empreendedorismo digital.

**Mudanças grandes recentes** — ver [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md):
- 5 trilhas novas (29 módulos do Profissional Digital)
- Home redesenhada (16 → 8 seções com prova social honesta)
- Sistema de ranking com 4 períodos (geral / anual / mensal / semanal)
- Páginas novas: `/sobre`, `/comunidade`, `/explorar`, `/newsletter`, `/search`, `/ranking`
- Backend Go com endpoints públicos `/api/v1/stats` e `/api/v1/leaderboard/public`
- Gamificação: sons Web Audio API, heatmap de estudo, metas diárias, recomendações
- UX: 26 fixes de mobile/a11y, animations fluidas, CodeBlock com scrollbar visível

**Sempre que fizer mudanças grandes**, criar novo changelog incremental (`CHANGELOG_PLATFORM_YYYY-MM.md`).

---

## 📚 DOCUMENTOS DE REFERÊNCIA

> ## ⚠️ ANTES DE ESCREVER OU REVISAR QUALQUER MÓDULO
>
> Leia **[`PADRAO_ENSINO.md`](./PADRAO_ENSINO.md)**. Ele é normativo, não sugestivo.
>
> As cinco regras, em uma linha cada:
> 1. **Onde há fluxo ou topologia, entra `arch_diagram`** — com `caption` que diz o que concluir e 5–6 passos percorríveis. Diagrama sem passo é figura.
> 2. **3 quizzes por módulo**, em seção `Fixando`. Cada quiz vira carta de SRS (SM-2) — é a única fonte de cartas da plataforma.
> 3. **Explicação de quiz trata cada distrator**, nomeando o erro de raciocínio. É a parte que mais ensina.
> 4. **Rota de conteúdo fecha o laço de gamificação** (`ConcluirModulo`), senão ler não dá XP nem gera carta.
> 5. **Bloco inválido desaparece em silêncio** — título sem conteúdo é bloco invisível. Rode os gates.
>
> Todas as cinco têm gate no CI. O documento explica qual defeito real cada regra
> existe para impedir.

| Doc | Quando consultar |
|-----|------------------|
| [`PADRAO_ENSINO.md`](./PADRAO_ENSINO.md) | **Sempre, antes de escrever conteúdo** — padrão normativo de ensino |
| [`PENDENCIAS.md`](./PENDENCIAS.md) | **Fonte única de tarefas abertas** — o que falta, com prioridade, esforço, dono e critério de aceite |
| [`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](./ESTRATEGIA_SEO_ORGANICO_2026-08.md) | **Antes de escrever `Perguntas frequentes` ou página de captação** — os quatro formatos, o contrato de resposta citável e o que NÃO fazer |
| [`PESQUISA_DEMANDA_BUSCA_2026-08.md`](./PESQUISA_DEMANDA_BUSCA_2026-08.md) | A demanda de busca medida: 10.000 consultas, 21 temas, as três lacunas reais |
| [`docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md`](./docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md) | 100 soluções de IA na AWS com origem rotulada (21 casos públicos · 32 arquiteturas AWS · 47 padrões). É a **fonte** dos 100 diagramas da trilha `trail-arq-ia-aws` |
| [`docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`](./docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md) | Os **100 laboratórios** de arquitetura AWS (`L01`–`L100`), do básico à solução com IA — com dependência, entregável e os 20 essenciais para portfólio. **Não confundir** com o catálogo de 100 soluções de IA (`S01`–`S100`): outro eixo, outra numeração |
| [`.claude/skills/lab-arquitetura-aws.md`](./.claude/skills/lab-arquitetura-aws.md) | **Antes de escrever um laboratório** — como as 25 seções de um módulo de laboratório viram blocos desta plataforma, Terraform/YAML + .NET 8, e o que NÃO cabe (Mermaid não renderiza; exercício em prosa não gera carta de SRS) |
| [`.claude/skills/arquitetura-ia-aws.md`](./.claude/skills/arquitetura-ia-aws.md) | **Antes de desenhar `arch_diagram`** — esquema, chaves do catálogo e os 5 padrões de IA na AWS |
| [`openspec/changes/`](./openspec/changes/) | **10 mudanças em OpenSpec** (72 requisitos, 131 cenários, 249 tarefas) cobrindo o que falta no sistema. Executadas 76 tarefas em 07/ago/2026; `openspec list` mostra o andamento por mudança |
| [`PLANO_MESTRE_PENDENCIAS_2026-08.md`](./PLANO_MESTRE_PENDENCIAS_2026-08.md) | Registro do que já foi feito em ago/2026 e por quê |
| [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md) | Estado atual após maio/2026 — leia primeiro |
| [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md) | Iniciativas que dependem de backend |
| [`MELHORIAS.md`](./MELHORIAS.md) | Roadmap pedagógico/visual |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md) | Plano mestre do currículo |
| [`backend/PLAN.md`](./backend/PLAN.md) | Plano detalhado da API Go |
| `frontend/CLAUDE.md` | Arquitetura frontend, gotchas, mapa de componentes |
