# 🎯 Validation Report — FFV Academy (2026-05-19)

**Síntese executiva** com os 3 inputs cruzados:
- [`PLATFORM_AUDIT_2026-05.md`](./PLATFORM_AUDIT_2026-05.md) — 20 issues técnicos
- [`UX_HEURISTIC_EVAL_2026-05.md`](./UX_HEURISTIC_EVAL_2026-05.md) — 20 friction points UX (5 P0 / 10 P1 / 5 P2)
- [`MARKET_REFRESH_2026-05.md`](./MARKET_REFRESH_2026-05.md) — refresh de concorrência + 3 features defensáveis novas

Este doc substitui o [`MARKET_ACTION_PLAN.md`](./MARKET_ACTION_PLAN.md) e [`EXECUTIVE_PLAN_2026-05.md`](./EXECUTIVE_PLAN_2026-05.md) **enquanto plano de execução vigente**. Os antigos viram referência histórica.

---

## 🔥 TL;DR brutal (1 parágrafo)

Construímos uma fundação técnica boa (modularização modular, drawer mobile, copy de combate, espelho de aprendizado) mas **3 coisas estão erradas**: (1) a base ainda **vaza** em 3 lugares mesmo após o refactor (hardcodes de `/tecnologia`); (2) parte do que entreguei é **encenação** — `/stats-publicas` está hardcoded, `/perfil` perdido sem backend, SLA tracker é estático; (3) o **mercado andou rápido** — NotebookLM lançou áudio PT-BR nativo + Deep Research, ChatGPT Study Mode global com roadmap de goal tracking, **Anki migrou SM-2 → FSRS-6** (nossa copy "mesmo algoritmo do Anki" está obsoleta em 6 meses). **Janela de 8 semanas** pra construir moat real antes que isso vire commodity.

---

## 🧨 3 verdades difíceis

1. **Nossa landing fala de SM-2 como diferencial mas o Anki já é FSRS-6 por padrão.** Copy fica desatualizada em ~6 meses. Posicionamento deve ser "SRS calibrado pelo material do aluno", não "SM-2 idêntico ao Anki".

2. **ChatGPT Study Mode vai fechar 50% do nosso moat em 6-9 meses** (roadmap público de goal setting + progress tracking entre conversas). A janela de "memória longitudinal" como diferencial é finita. Precisamos converter isso em **dados defensáveis** (eventos de engagement, comparação direta) antes que vire commodity.

3. **Não temos UM usuário real ainda.** Toda a estratégia é hipótese. Antes de mais código, precisamos rodar o Trojan Comparativo público pra GERAR distribuição — temos 7 commits de produto mas zero tração.

---

## ⏱️ Janela competitiva: 8 semanas

| Ameaça | Probabilidade | Ataque na FFV | Defesa |
|---|---|---|---|
| ChatGPT Study Mode lança goal/progress tracking | Alta (6-9m) | Fecha "memória longitudinal" como diferencial | Trojan Comparativo + Diff de Conhecimento publicados |
| NotebookLM lança SRS | Média-alta (3-6m, Google tem Gemini 3 + memory) | Some retenção via revisão | PT-BR-first + multi-área profissional + curadoria humana |
| Damásio IA pra outros mercados | Média (mediu OAB, pode escalar) | Come ICP concurseiro | OAB 2ª fase com SRS lançado primeiro |
| EstudaIA 2.0 "3 meses grátis" | Alta (já em pré-lançamento) | Come ICP universitário/concurseiro genérico | Reposicionar pra nichos: OAB, CNU, residência, AWS-cert |

---

## 📋 Plano em 4 ondas

### ⚡ Onda 1 — Sangria (esta semana, 12-16h)
**Conserta o que sangra hoje.** Fricções que perdem leads/usuários no funil.

1. **[P0] Máscara WhatsApp + validação email** no `StudyRequestForm.tsx:325-349` — leads sujos vão direto pro banco. **2h**
2. **[P0] Idempotência no submit** + bloqueio de duplo-clique (overlay) — `StudyRequestForm.tsx:533-546`. **1h**
3. **[P0] Hardcodes de base** em 3 lugares (`LearningMirrorClient`, `LandingClient`, `SimuladoRunner`) → usar `BaseRegistry`. **2h**
4. **[P0] Quiz keyboard nav** (radiogroup + setas + atalhos 1-4) — `BaseModule.tsx:912-975`. **3h**
5. **[P0] TrailSummaryDrawer focus trap** — `TrailSummaryDrawer.tsx:54-217`. **1h**
6. **[P0] Remover TODOs visíveis em prod** (`RankingClient`, `CommunityCard`, `PaywallCard`). **1h**
7. **[P1] Reposicionar copy SM-2 → "SRS calibrado pelo seu material"** em LandingClient + FAQ. **1h**
8. **[P1] `/perfil` com section headers** (Preferências / Dev card). **1h**
9. **[P1] Sidebar desktop usa checkmark de completados** (já existe no drawer mobile — só copiar). **1h**

**Saída onda 1:** UX P0 fechado, hardcodes eliminados, copy desatualizada removida. Backend zero.

### 🛠️ Onda 2 — Honestidade (próximos 7-10 dias, 14-20h)
**Pluga o que está fake.** `/stats-publicas`, SLA tracker e `/perfil` são todos hardcoded/localStorage. Precisamos backend mínimo.

10. **Backend `GET /api/v1/public/stats`** + cron noturno calculando AB30, SLA, custo médio. Substitui hardcode em `PublicStatsClient.tsx`. **6h**
11. **Backend `GET /study-requests/{id}/status`** + SLA tracker dinâmico (atualmente fixo em "active" pra sempre). Persistir ID no localStorage do usuário pra `/minha-solicitacao/{id}`. **4h**
12. **Backend `GET/PUT /api/v1/me/preferences`** + migrar `useUserPreferences` pra SWR (mantém fallback localStorage offline). **6h**
13. **Endpoint drift fix**: alinhar nomes (`/api/v1/public/stats`, `/api/v1/me/preferences`). **30min**

**Saída onda 2:** plataforma deixa de ser teatro. Dados reais aparecem onde a gente prometeu.

### 🏆 Onda 3 — Diferenciais defensáveis (10-14 dias, 30-40h)
**Constrói moat antes da janela fechar.** Foco no que ChatGPT/NotebookLM NÃO vão lançar em 6 meses.

14. **🎯 Diff de Conhecimento** (feature A do market refresh): roda o quiz do aluno em GPT-4 e Gemini via API, mostra *"você está acima do ChatGPT em X, abaixo em Y"*. Evidência matemática de calibração. ROI brand: 10/10. **12h**
15. **🎯 Modo Áudio-Trilha** (feature C): TTS PT-BR transforma trilha em audiobook 8-15 episódios + flashcards de voz agendados via SRS. Vazio absoluto no mercado. Cobre dislexia/deslocamento/baixa visão. **16h**
16. **🎯 Trilha Espelho agregada** (feature B): quando 5+ alunos enviam material da mesma prova, sistema agrega anonimamente e publica `/trilhas-espelho/oab-46-fase-2` como recurso público. SEO killer + network effect. **14h**
17. **Microcopy `xpUnitSingular`/`mascot` conectados ao GameHUD** — modulariza visualmente a base já implementada (ponto clínico vs XP). **3h**
18. **Onboarding v3 usando preferences** (substitui modal velho que ainda não está conectado). **6h**

**Saída onda 3:** 3 features que nenhum concorrente faz + experiência base 100% modular.

### 🚀 Onda 4 — Distribuição (mês, paralelo com onda 3)
**Tração ≠ produto.** Não temos um usuário real.

19. **Trojan Comparativo Auditável**: artigo + thread "Submeti o mesmo PDF a NotebookLM, ChatGPT, Studyfetch, FFV — tabela auditável de 12 critérios". Outputs públicos no Google Drive. Honestidade competitiva é arma. ~12h conteúdo + 4h thread. **16h**
20. **10 artigos SEO cauda longa**: "Como estudar OAB 2ª fase com IA", "Como passar no CNU 2026 sem cursinho", "Genética veterinária pra prova final em 30 dias". CAC <R$3 após mês 6. **20h** (~2h/artigo).
21. **3 embaixadoras MedVet**: 20-200k seguidores, base premium grátis em troca de stories. R$ ~2.500 em curadoria extra. CAC ~R$6 esperado. **operacional, não código**
22. **Export Anki `.apkg`** (P1 do market action plan original): captura comunidade Anki sem competir frontalmente. **8h**

---

## 🪦 O que matar do roadmap antigo

Coisas no plano que **não vamos fazer** baseado nos novos sinais:

- ❌ **"Card de Revisão Comunitária"** (feature #2 do exec plan) — efeito de rede exige escala que ainda não temos. Postergar pra V3.
- ❌ **Email semanal automatizado do Espelho** (V2 da feature #1) — sem base de usuários, é canhão pra mosquito. Onda 5+.
- ❌ **Modo Treinador B2B** (feature #5) — entrada B2B exige ciclo de venda longo. Postergar pra Q3, depois de tração orgânica.
- ❌ **Pré-trilha 60s com Claude** (P1 do market plan original) — sobreposição com Diff de Conhecimento. Diff é mais defensável.
- ❌ **Devcard `/devcard/@username` viral** (P1 original) — sem usuários, viralidade é teoria. Reativar após onda 4.
- ⏸️ **Quebrar componentes >800 linhas** — débito técnico real mas não bloqueante. Refactor incremental quando tocar cada um, não dedicado.

---

## 📊 Métricas pra acompanhar (revisão semanal)

- **Vaidade controlada**: visitas em `/`, `/stats-publicas`, `/meu-aprendizado`
- **Funil real**: form submits / visitantes (meta semana 4: >2%)
- **SLA real**: % de bases entregues em <24h (mostrar em `/stats-publicas` quando endpoint pluggar)
- **AB30** (North Star): só mede depois de mês 1 com primeira coorte fechada
- **Brand search**: Google Trends "FFV Academy" (baseline: ~0, meta mês 2: aparecer no gráfico)

---

## 🎬 Decisão pendente do CEO

3 perguntas que paralisam:

1. **Onda 2 (backend) ou Onda 3 (features novas) primeiro?**
   - *Meu voto:* Onda 1 → Onda 2 → Onda 3 (em paralelo com Onda 4 distribuição). Backend é o que faz a plataforma deixar de ser teatro.

2. **Qual feature da Onda 3 começa: Diff, Áudio ou Trilha Espelho?**
   - *Meu voto:* **Diff de Conhecimento** primeiro. É a única que diretamente mata um concorrente em comparação. Brand >10/10.

3. **Quando começar distribuição (Onda 4)?**
   - *Meu voto:* Trojan Comparativo é a primeira coisa antes mesmo da Onda 2 terminar — é o que vai gerar 10 primeiros usuários reais. SEO espera.

---

## Arquivos relacionados
- [`PLATFORM_AUDIT_2026-05.md`](./PLATFORM_AUDIT_2026-05.md)
- [`UX_HEURISTIC_EVAL_2026-05.md`](./UX_HEURISTIC_EVAL_2026-05.md)
- [`MARKET_REFRESH_2026-05.md`](./MARKET_REFRESH_2026-05.md)
- [`EXECUTIVE_PLAN_2026-05.md`](./EXECUTIVE_PLAN_2026-05.md) (referência histórica)
- [`MARKET_ACTION_PLAN.md`](./MARKET_ACTION_PLAN.md) (referência histórica)
