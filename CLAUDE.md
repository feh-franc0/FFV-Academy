# FFV Academy — Monorepo

---

## 🎯 O QUE É A FFV ACADEMY

**FFV Academy é a escola de engenharia para a era da IA — gratuita, gamificada e sem hype.**

Enquanto o mercado vende cursos de "use o ChatGPT para ganhar dinheiro", a FFV Academy ensina como as coisas funcionam por dentro: transformers, sistemas distribuídos, RAG, MVCC no Postgres, CloudFlare Workers internals, SRE, LLMOps, context engineering — conteúdo que engenheiros sênior escrevem e que engineers aspirantes precisam para virar seniors de verdade.

### Proposta de valor em uma frase
> **"Aprenda IA, AWS e Engenharia de Software como engenheiro — não como consumidor de hype. Gamificado, gratuito e com revisão espaçada real."**

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

### 5. Currículo estruturado em hubs
8 hubs temáticos (IA, AWS, Engenharia, Claude & Anthropic, Fundamentos, Programação, Dados, Profissional Digital) com 66+ trilhas e 900+ módulos. Hierarquia: Hub → Trilha → Módulo. Usuário sabe exatamente onde está e para onde vai.

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

| Doc | Quando consultar |
|-----|------------------|
| [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md) | Estado atual após maio/2026 — leia primeiro |
| [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md) | Iniciativas que dependem de backend |
| [`MELHORIAS.md`](./MELHORIAS.md) | Roadmap pedagógico/visual |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md) | Plano mestre do currículo |
| [`backend/PLAN.md`](./backend/PLAN.md) | Plano detalhado da API Go |
| `frontend/CLAUDE.md` | Arquitetura frontend, gotchas, mapa de componentes |
