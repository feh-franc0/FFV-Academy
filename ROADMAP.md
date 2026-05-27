# ROADMAP — FFV Academy
> Roadmap unificado. Sucessor de BACKEND_ROADMAP/MELHORIAS/PERSONALIZATION_PLAN/BRIEFING_CURRICULUM_V2.
> Última atualização: 2026-05-26 · v2.0 (pós-pivot user-generated learning)

## Visão de 12 meses (1 parágrafo)

**A FFV pivotou em mai/2026** de "escola com currículo curado" para **plataforma user-generated learning**: aluno sobe qualquer conteúdo, recebe módulo estruturado com 100 questões calibradas por Bloom + SRS real (ver [`TEACHING_METHOD.md`](./TEACHING_METHOD.md) e [`STRATEGY.md`](./STRATEGY.md)). Próximos 12 meses focam em quatro frentes — (1) **pipeline de ingestão + geração de 100Q** como produto principal (Tier 0); (2) **monetização mínima viável** (Pro $7/mo) pra cobrir LLM custos e validar valor; (3) **personalização e dashboards** que já estavam planejados, agora servindo o produto user-generated; (4) **biblioteca curada** (157 módulos) mantida como showcase + seed SEO, sem expansão nova.

> **Dívida técnica documentada**: [`docs/STANDARDIZATION_REPORT.md`](./docs/STANDARDIZATION_REPORT.md) diagnostica score 4/10 de padronização em hubs/trilhas/módulos. Refactor de schema unificado adiado pra acontecer junto com Fase 3 DB-driven (estimativa 5-6 semanas) — fazer separado seria trabalho duplicado.

---

## Tier 0 — PIVOT (próximas 2 semanas, blocking everything else)

> Este Tier é existencial. Sem ele, o pivot anunciado em `STRATEGY.md` é só papel.

### [T0.1] Pipeline de ingestão v1.0 — PDF + texto → 100Q + SRS
- **Categoria:** Backend + Frontend (produto core)
- **Problema:** O produto novo da FFV não existe ainda. Existe a promessa e o doc canônico (`TEACHING_METHOD.md`).
- **Solução:** Implementar pipeline completo descrito em `TEACHING_METHOD.md §2`:
  1. `POST /api/v1/upload` (PDF + texto, R2 storage)
  2. Worker async (Asynq) extrai texto (pdf.js / pdfplumber)
  3. Claude Opus 4.7 estrutura (resumo + mapa + glossário + sequência)
  4. Claude gera 100Q calibrado por Bloom (20/30/25/15/7/3)
  5. Sonnet valida (gabarito único, distribuição ±2)
  6. Cards SRS criados automaticamente, integrados ao SM-2 existente
  7. Página `/modulo/[id]` com resumo + simulado + cards
- **ICE:** 10 × 9 × 4 = 360 / 5 ≈ **72** (Ease baixa = trabalho grande, mas Impact 10)
- **Esforço estimado:** 50-80h (sprint dedicado)
- **Dependências:** R2 já configurado, SM-2 já implementado, Claude API key. Nenhuma blocker.
- **Métrica de saída:** 95%+ uploads viram módulo entregue; custo médio LLM <$0.15/upload.

### [T0.2] Suporte a imagem (OCR) + link web
- **Categoria:** Backend
- **Problema:** PDF-only é demo, não produto. Aluno tira foto da apostila ou cola link de artigo.
- **Solução:** OCR via Tesseract (fallback Claude Vision pra imagens difíceis) + Readability/Playwright pra links.
- **ICE:** 8 × 8 × 6 = 384 / 5 ≈ **77**
- **Esforço estimado:** 15-20h
- **Dependências:** T0.1 entregue.

### [T0.3] FFV Pro $7/mês (Stripe + feature gating)
- **Categoria:** Backend + Frontend (monetização)
- **Problema:** 100Q por upload custa $0.10-0.30 em LLM. Sem revenue, unit economics quebra em <1000 MAU.
- **Solução:**
  - Stripe checkout subscription mensal
  - Free: 5 uploads/mês, ≤30 páginas/upload, marca d'água
  - Pro: ilimitado, sem marca, prioridade fila, export Anki
  - Webhook → atualiza `users.tier`
- **ICE:** 9 × 7 × 6 = 378 / 5 ≈ **76**
- **Esforço estimado:** 12-18h
- **Dependências:** T0.1 entregue (não faz sentido cobrar sem produto).

### [T0.4] Áudio + YouTube → transcrição + módulo
- **Categoria:** Backend
- **Problema:** Estudante de concurso/vestibular consome aula em vídeo. Limite a PDF perde 50% do mercado.
- **Solução:** Whisper local (CPU) ou AssemblyAI (API) + yt-dlp pra YouTube. Vídeo → áudio → transcrição → pipeline T0.1.
- **ICE:** 8 × 8 × 5 = 320 / 5 ≈ **64**
- **Esforço estimado:** 20-30h
- **Dependências:** T0.1 entregue.

### [T0.5] Landing nova alinhada ao pivot
- **Categoria:** Frontend + Distribuição
- **Problema:** Hero atual fala "8 bases, escola de engenharia". Não vende user-generated.
- **Solução:** Hero: "Suba qualquer conteúdo. Receba 100 questões + revisão espaçada." + demo interativo (upload de PDF de amostra → módulo gerado em 30s) + comparativo vs NotebookLM/Quizlet/Anki.
- **ICE:** 9 × 8 × 7 = 504 / 5 ≈ **101**
- **Esforço estimado:** 8-15h
- **Dependências:** T0.1 funcional (precisa do demo).

---

## Tier 1 — Próximas 6 semanas (must-do, ICE >= 80)

> Itens originais do roadmap pré-pivot. Continuam relevantes porque dão alicerce de retenção/engajamento, mas só fazem sentido **depois** do Tier 0 entregar.

### [T1.1] Personalização — migrations + provider + onboarding v3
- **Categoria:** Backend + Frontend
- **Problema:** Hoje a home/explorar trata todo usuário igual; não há sinal declarado nem inferido pra ordenar hubs/módulos.
- **Solução:** Migrations 000045-000048 (user_preferences estendido + event log + rollup), `UserPreferencesProvider`, onboarding v3 de 5 telas (≤90s) e `/perfil` canonical.
- **ICE:** 9 × 9 × 6 = 486 / 5 ≈ **97**
- **Esforço estimado:** 21h (PRs 1-4 do plano de personalização)
- **Dependências:** nenhuma

### [T1.2] Engagement tracking + ranker de hubs
- **Categoria:** Backend + Frontend
- **Problema:** Sem dados de comportamento (visit/open/complete por base) não dá pra inferir interesse nem priorizar conteúdo.
- **Solução:** Bounded context `engagement` Go (`POST /me/engagement-events` async batch), `EngagementTracker` cliente com queue offline, `rank.ts` puro integrado em `KnowledgeBaseHome`/`Explorar`/`RelatedArticles`.
- **ICE:** 9 × 8 × 6 = 432 / 5 ≈ **86**
- **Esforço estimado:** 17h (PRs 5-7 personalização)
- **Dependências:** T1.1

### [T1.3] Dashboards admin de engajamento por usuário e por base
- **Categoria:** Backend + Produto
- **Problema:** Não há visão de saúde por base, gap entre tags declaradas e visitadas, nem ranking de módulos.
- **Solução:** `/admin/users/[id]/engagement` e `/admin/bases/[slug]/health` consumindo views materializadas; cron noturno do rollup.
- **ICE:** 8 × 9 × 6 = 432 / 5 ≈ **86**
- **Esforço estimado:** 6h
- **Dependências:** T1.2

### [T1.4] Perfil público `/u/<handle>`
- **Categoria:** Backend + Frontend + Distribuição
- **Problema:** Não existe artefato compartilhável que vira marketing orgânico (LinkedIn/Twitter).
- **Solução:** Rota pública com avatar, streak, XP, badges, trilhas; opt-in via toggle; indexável quando público.
- **ICE:** 8 × 9 × 7 = 504 / 5 ≈ **100**
- **Esforço estimado:** 8h-12h
- **Dependências:** nenhuma (auth e schema users já existem)

### [T1.5] Referral tracking real com badges de embaixador
- **Categoria:** Backend + Distribuição
- **Problema:** `?ref=<id>` hoje dá XP mas não conta nada — sem contagem real, sem leaderboard de embaixadores.
- **Solução:** Tabela `referrals`, contagem por usuário, badges Conector/Embaixador/Influencer (5/10/25), mostra no perfil.
- **ICE:** 8 × 8 × 7 = 448 / 5 ≈ **90**
- **Esforço estimado:** 6h-10h
- **Dependências:** T1.4 (perfil mostra os badges)

### [T1.6] Componentes visuais para substituir ArchDiagram ASCII
- **Categoria:** Frontend + Pedagógico
- **Problema:** 46 artigos usam box-drawing Unicode em `<pre>` — alinhamento frágil, visual ruim, incompatível com nível premium.
- **Solução:** Implementar `HierarchyDiagram`, `FlowDiagram`, `ComparisonFlow`, `ArchFlow`, `MatrixDiagram`, `AnnotatedFormula` em `primitives.tsx`.
- **ICE:** 9 × 9 × 6 = 486 / 5 ≈ **97**
- **Esforço estimado:** 10h-14h
- **Dependências:** nenhuma

### [T1.7] Migração P0 dos 8 artigos mais lidos (Trilhas 1-2) para componentes visuais
- **Categoria:** Conteúdo + Pedagógico
- **Problema:** Mesmo com componentes prontos, o ganho só aparece quando os artigos migram.
- **Solução:** Migrar `o-que-e-ia`, `transformers`, `o-que-e-llm`, `redes-neurais`, `kv-cache`, `mixture-of-experts`, `tool-calling`, `ia-alem-do-llm`.
- **ICE:** 8 × 9 × 6 = 432 / 5 ≈ **86**
- **Esforço estimado:** 12h-16h
- **Dependências:** T1.6

### [T1.8] Quiz fortes — corrigir D4 fraco e padronizar distratores
- **Categoria:** Pedagógico + Conteúdo
- **Problema:** `qual-coding-agent-usar` (D4=3.0) tem opções óbvias; padrão de quiz inconsistente entre trilhas.
- **Solução:** Reescrever as 3 perguntas do artigo, criar checklist de quiz no doc de padrões, varredura por trilhas P0.
- **ICE:** 7 × 9 × 8 = 504 / 5 ≈ **100**
- **Esforço estimado:** 4h-6h
- **Dependências:** nenhuma

### [T1.9] Push notifications real (web push)
- **Categoria:** Backend + Distribuição
- **Problema:** PWA installable existe mas sem push — perde retenção em streak rescue/daily challenge.
- **Solução:** Endpoint subscription + cron de envio (streak rescue, daily challenge, weekly recap, novo conteúdo); pedir permissão D2+, não na primeira visita.
- **ICE:** 8 × 7 × 7 = 392 / 5 ≈ **78** (limite Tier 1)
- **Esforço estimado:** 10h-14h
- **Dependências:** T1.2 (sinal de comportamento alimenta gatilhos)

---

## Tier 2 — 6-12 semanas (should-do)

### [T2.1] Email drip Buttondown automatizado (welcome, streak rescue, churn, weekly digest)
- **Categoria:** Backend + Distribuição
- **Problema:** Buttondown tem subscribers passivos; sem orquestração por estado, retenção fica plana.
- **Solução:** Cron (Vercel/Supabase) dispara via API do Buttondown baseado em estado (D0/D1/D3/D7 welcome; D-1 streak; D14 churn; sextas weekly).
- **ICE:** 8 × 7 × 6 = 336 / 5 ≈ **67**
- **Esforço estimado:** 12h-18h
- **Dependências:** T1.2 (eventos pra acionar)

### [T2.2] Leaderboard por trilha + por hub
- **Categoria:** Backend + Produto
- **Problema:** Ranking global existe (4 períodos) mas não há competição dentro de trilha — perde efeito de comunidade focada.
- **Solução:** Variantes `?trail=<slug>` e `?hub=<slug>` no endpoint; UI dedicada em `/aprenda/<trail>` e `/<hub>`.
- **ICE:** 7 × 8 × 7 = 392 / 5 ≈ **78**
- **Esforço estimado:** 8h-12h
- **Dependências:** infra de leaderboard (já implementada)

### [T2.3] Certificado verificável por trilha (PDF + URL pública)
- **Categoria:** Backend + Frontend
- **Problema:** Conclusão de trilha não tem artefato compartilhável verificável; perde gancho de prova social e B2B.
- **Solução:** Reutilizar `Certificate.tsx`, assinar URL (HMAC + verify route), badge de validação no perfil público.
- **ICE:** 7 × 8 × 6 = 336 / 5 ≈ **67**
- **Esforço estimado:** 10h-14h
- **Dependências:** T1.4

### [T2.4] Próximo artigo inteligente + `Prerequisites`/`NextSteps` com progresso real
- **Categoria:** Pedagógico + Frontend
- **Problema:** Ao concluir módulo, o leitor não sabe o que vem agora; pré-requisitos não são explicitados.
- **Solução:** Schema `prerequisites[]` e `nextSuggested[]` em `Module`; componentes `Prerequisites` (check verde se completado) e `NextSteps` (cards); backfill Trilhas 1-3 primeiro.
- **ICE:** 8 × 8 × 6 = 384 / 5 ≈ **77**
- **Esforço estimado:** 14h-20h
- **Dependências:** nenhuma

### [T2.5] Reescrita densa das Trilhas 1 e 2 (12 artigos → ~400 linhas cada)
- **Categoria:** Conteúdo + Pedagógico
- **Problema:** Gap de 3-5× entre Trilhas 1-2 (média 160 linhas) e Trilhas 9-11 (440-822). Iniciante recebe menos profundidade.
- **Solução:** Reescrever os 12 artigos seguindo padrão obrigatório (briefing histórico, pré-reqs, 4-6 sections, ComparisonTable, componente visual novo, QA, quiz forte, take-aways, links).
- **ICE:** 9 × 7 × 4 = 252 / 5 ≈ **50** (alto impacto, esforço alto puxa pra baixo, mas é o coração da promessa pedagógica — incluído em T2)
- **Esforço estimado:** 40h-60h
- **Dependências:** T1.6, T1.8

### [T2.6] Estatísticas de performance por trilha (acerto %, tempo médio, tendência semanal)
- **Categoria:** Produto + Frontend
- **Problema:** Usuário não vê se está progredindo bem; sem feedback de qualidade, motivação cai.
- **Solução:** Card `/progresso/<trail>` com % acerto, tempo médio por módulo, tendência 7d/30d.
- **ICE:** 7 × 7 × 6 = 294 / 5 ≈ **59**
- **Esforço estimado:** 8h-12h
- **Dependências:** T1.2 (eventos)

### [T2.7] Maratona de revisão SRS configurável
- **Categoria:** Produto + Frontend
- **Problema:** Revisão atual é diária e fixa; usuários querem sessão longa em fim de semana.
- **Solução:** Modal `/revisar/maratona` com seleção de qtd cards, trilha(s), timer; XP bonus por sessão completa.
- **ICE:** 6 × 7 × 7 = 294 / 5 ≈ **59**
- **Esforço estimado:** 6h-10h
- **Dependências:** nenhuma

### [T2.8] Trilha 19 — TypeScript Profissional (10 módulos)
- **Categoria:** Conteúdo
- **Problema:** Site inteiro é TS, leitor usa TS, mas nunca ensinamos TS de verdade — gap absoluto na camada 2.
- **Solução:** Criar trilha completa (narrowing, generics, async, erros como valores, monorepo, capstone CLI).
- **ICE:** 8 × 9 × 4 = 288 / 5 ≈ **58**
- **Esforço estimado:** 50h-70h
- **Dependências:** nenhuma

### [T2.9] Trilha 21 — API Design & Contratos (9 módulos)
- **Categoria:** Conteúdo
- **Problema:** Todo backend passa por API, mas não há trilha sobre REST maduro, gRPC, GraphQL, idempotência, paginação.
- **Solução:** Criar trilha (REST Richardson, versionamento, GraphQL, gRPC, OpenAPI contract testing, idempotency keys, rate limit, capstone).
- **ICE:** 8 × 8 × 4 = 256 / 5 ≈ **51**
- **Esforço estimado:** 45h-60h
- **Dependências:** nenhuma

### [T2.10] Trilha 23 — AWS DVA-C02 (15 módulos)
- **Categoria:** Conteúdo
- **Problema:** Elo perdido entre CLF e SAA; quem certifica DVA hoje sai do FFV.
- **Solução:** Trilha completa (Lambda profundo, API GW, DynamoDB, S3 dev, Step Functions, EventBridge, Cognito, KMS, CI/CD AWS, X-Ray, ECS, IaC, simulado).
- **ICE:** 7 × 8 × 4 = 224 / 5 ≈ **45**
- **Esforço estimado:** 70h-90h
- **Dependências:** nenhuma

---

## Tier 3 — 3-12 meses (could-do / estratégico)

### [T3.1] Tier "Pro" pago (R$ 19/mês) — Stripe + features premium
- **Categoria:** Produto + Backend
- **Problema:** Zero monetização hoje; sem receita, infra e expansão dependem só do dono.
- **Solução:** Cloud sync versionado, certificados verificáveis, AI Tutor ilimitado, módulos novos 7d antes, Discord room Pro, PIX via Stripe.
- **ICE:** 8 × 6 × 3 = 144 / 5 ≈ **29**
- **Esforço estimado:** 60h-90h
- **Dependências:** T1.4, T2.3

### [T3.2] Tier B2B "Teams" (R$ 99/usuário/mês) — admin dashboard, SSO, trilhas customizadas
- **Categoria:** Produto + Backend + Distribuição
- **Problema:** Mercado BR tem gap (LinkedIn Learning é genérico, Alura não é AI-native focado).
- **Solução:** Admin org dashboard, trilhas customizadas por stack, leaderboard privado, certificados com logo, SSO SAML/OIDC, LGPD.
- **ICE:** 9 × 5 × 2 = 90 / 5 ≈ **18** (alto ceiling, baixa confidence sem validar demanda)
- **Esforço estimado:** 150h+
- **Dependências:** T3.1

### [T3.3] AI Tutor integrado (Claude API context-aware)
- **Categoria:** Produto + Backend
- **Problema:** Dúvida do leitor hoje vai pro Google/ChatGPT genéricos, sem contexto do progresso dele.
- **Solução:** Chat embarcado Claude que conhece progresso (cloud sync), sugere próximo passo; 50 msgs/mês free, ilimitado Pro.
- **ICE:** 8 × 7 × 4 = 224 / 5 ≈ **45**
- **Esforço estimado:** 30h-50h
- **Dependências:** T1.2

### [T3.4] Study groups + friend system
- **Categoria:** Produto + Backend
- **Problema:** Aprendizado solitário; empresas/turmas querem leaderboard privado.
- **Solução:** Convite `/grupo/<token>`, 3-10 pessoas, ranking privado, "adicionar amigo" via handle, comparação 1:1.
- **ICE:** 7 × 6 × 5 = 210 / 5 ≈ **42**
- **Esforço estimado:** 25h-40h
- **Dependências:** T1.4

### [T3.5] Dev card compartilhável `/devcard/@username`
- **Categoria:** Distribuição
- **Problema:** Perfil público completo é denso; precisa de card resumido pra LinkedIn/Twitter.
- **Solução:** OG image dinâmica + página `/devcard/@<handle>` com layout viral (streak, top badges, trilhas).
- **ICE:** 7 × 7 × 6 = 294 / 5 ≈ **59**
- **Esforço estimado:** 8h-12h
- **Dependências:** T1.4

### [T3.6] Trilha 22 — Security Engineering (10 módulos)
- **Categoria:** Conteúdo
- **Problema:** Segurança é disciplina própria; hoje é subtópico em Trail 8.
- **Solução:** STRIDE, AuthN/AuthZ, OAuth2/OIDC, JWT, hashing moderno, OWASP, secrets, supply chain, zero trust, capstone pentest.
- **ICE:** 7 × 8 × 3 = 168 / 5 ≈ **34**
- **Esforço estimado:** 50h-70h
- **Dependências:** nenhuma

### [T3.7] Trilha 25-26 — Fine-tuning + LLM Evals Pro (15 módulos combinados)
- **Categoria:** Conteúdo
- **Problema:** Aprofundamento IA termina em RAG; fine-tune e evals profissionais não existem.
- **Solução:** Quando fine-tune vs RAG, SFT, LoRA/QLoRA, DPO, datasets, deploy vLLM/Bedrock; evals como disciplina, golden sets, LLM-as-judge, frameworks, A/B prompt.
- **ICE:** 7 × 7 × 3 = 147 / 5 ≈ **29**
- **Esforço estimado:** 60h-80h
- **Dependências:** nenhuma

### [T3.8] Página `/mapa` — grafo visual de prerequisites entre trilhas
- **Categoria:** Frontend + Pedagógico
- **Problema:** Jornada do iniciante não é visualizável; ele não vê o caminho.
- **Solução:** SVG do grafo de dependências usando campo `prereq` que já existe no schema.
- **ICE:** 6 × 7 × 5 = 210 / 5 ≈ **42**
- **Esforço estimado:** 12h-18h
- **Dependências:** T2.4 (schema prerequisites)

### [T3.9] `/roadmaps` — upgrade visual das playlists com branching
- **Categoria:** Frontend + Distribuição
- **Problema:** Playlists atuais são listas; não comunicam jornada.
- **Solução:** Jornada linear com % progresso, branching, 4 roadmaps iniciais (Zero→Staff IA, Zero→AWS Pro, Claude Power User→Harness Eng, Backend tradicional→AI-Native).
- **ICE:** 7 × 6 × 4 = 168 / 5 ≈ **34**
- **Esforço estimado:** 20h-30h
- **Dependências:** T3.8

### [T3.10] Quests diárias/semanais + Trilha do Dia
- **Categoria:** Produto + Frontend
- **Problema:** Streak motiva mas não direciona; usuário não sabe "o que fazer hoje".
- **Solução:** "Revise 3 cards", "complete 1 módulo", "atinja 80%"; 1-3 módulos recomendados diariamente via ranker.
- **ICE:** 7 × 7 × 5 = 245 / 5 ≈ **49**
- **Esforço estimado:** 12h-18h
- **Dependências:** T1.2

### [T3.11] Export Anki + Multi-idioma (EN/ES via next-intl)
- **Categoria:** Produto + Distribuição
- **Problema:** Devs power-users querem Anki; mercado PT-BR é teto baixo vs LatAm/global.
- **Solução:** Gerar `.apkg` por trilha; internacionalização com next-intl, traduzir Trilhas 1-2 como piloto.
- **ICE:** 6 × 5 × 4 = 120 / 5 ≈ **24**
- **Esforço estimado:** 40h-70h
- **Dependências:** nenhuma

---

## Anexo A — Iniciativas mortas/adiadas (com motivo)

### Já implementadas (mai/2026)
- **Leaderboard com 4 períodos** (geral, anual, mensal, semanal) — `GET /api/v1/leaderboard/public` + `/ranking` + `MyRankCard`. Variantes por trilha/hub ficam em T2.2.
- **Endpoint `/api/v1/stats` público** — social proof.
- **Sync de progresso wired** (push/pull) com auth opcional.
- **Sitemap dinâmico** (`app/sitemap.ts`) + **JSON-LD baseline** (`ArticleJsonLd`).
- **"Por onde começar?"** (`ComecarAqui`) na home com 6 caminhos.
- **Currículo expandido** — 5 trilhas novas (Profissional Digital), 29 módulos.
- **Home redesenhada** — 16 → 8 seções, prova social honesta.
- **`/news` rebuscada** — imagens reais + magazine layout.
- **Fase 1 DB-driven** — migrations 000055-000063 (schema base→hub→trail→module via FK, importer sem switch hardcoded).
- **Admin defesa em profundidade** — role no DB + JWT + allowlist env (migration 000065).
- **Storage R2** — adapter S3-compatible, anexos de StudyRequest.
- **Migrar `mixture-of-experts`** dos primitivos legados — já feito.

### Adiadas / fora do escopo de 12 meses
- **Trilhas 24 (Data Engineering), 27 (SAP-C03), 28 (FinOps), 29 (Multimodal), 30 (AI Safety), 31 (Frontend Moderno), 32 (Product Leadership)** — escopo do BRIEFING_CURRICULUM_V2 muito ambicioso; só faz sentido depois de validar demanda e ter T2.5-T2.10 entregues. Voltar a discutir em jan/2027.
- **Trilha 20 (DS&A para o dia a dia)** — alto valor mas overlap parcial com conteúdo externo gratuito; reavaliar depois de T2.8.
- **Capstones nas 6 trilhas maduras (T0.2 do briefing)** — entram embutidos na reescrita T2.5 e nas trilhas novas T2.8-T2.10, não vale rastrear separado.
- **Quiz consolidado gratuito por trilha (T0.5)** — depende de definir se quebra modelo de simulado pago; adiar até T3.1 estar live.
- **Mentorship marketplace** — só faz sentido pós-5k MAU.
- **Live cohorts pagos** — exige bandwidth do Fernando que não escala; reavaliar como produto premium pós-T3.1.
- **AMA mensal com Fernando** — formato exige cadência fixa; deixar emergir orgânico.
- **User-generated content** (comentários, "pergunte ao Fernando", galeria) — moderation cost alto sem time; adiar.
- **A/B testing framework + Anti-cheat** — só após 1k DAU; cedo demais.
- **Admin dashboard global** (DAU/MAU, cohorts) — coberto parcialmente por T1.3; ampliar quando houver decisão real travada por falta de dado.
- **Hub novo "Programação"** — adiar até T2.8/T2.9 mostrarem que faz falta semântica; por ora trilhas novas vão pra Fundamentos ou Engenharia.
- **Cleanup `curriculum.ts` (4894 linhas)** — refactor mecânico; faz junto com Fase 3 DB-driven do frontend.
- **Hook automático `npm run generate-og` no postbuild** — chore; faz junto com próximo redesign de OG.
- **Migrar imagens Unsplash para `public/news/`** — chore; sem regressão visível.
- **Acessibilidade — só 24/71 componentes têm aria-*** — backlog contínuo; tratar por PR conforme tocar componente.
- **Test coverage de componentes (HomeClient, MobileNav, OnboardingModal, MyRankCard)** — incluído implicitamente em T1.1 (onboarding) e T2.4.

### Sobreposições resolvidas durante consolidação
- "Leaderboard por trilha" (MELHORIAS Tier 1) + "Leaderboard variantes futuras" (BACKEND_ROADMAP) → unificado em **T2.2**.
- "Certificado por trilha" (MELHORIAS) + "Certificados verificáveis Pro" (BACKEND_ROADMAP) → unificado em **T2.3** (tier free do verificável; Pro ganha versionamento em T3.1).
- "Próximo artigo inteligente" (MELHORIAS) + `Prerequisites`/`NextSteps` (MELHORIAS Fase 0) → unificado em **T2.4**.
- "Estatísticas de performance por trilha" (MELHORIAS) + dashboards de engagement (PERSONALIZATION) → admin fica em **T1.3**, view do próprio usuário em **T2.6**.
- "Email semanal de progresso" + "Weekly recap email" + "Email drip" (BACKEND/MELHORIAS) → unificado em **T2.1**.
- "Trilha do Dia" + "Quests diárias/semanais" (MELHORIAS Tier 2) → unificado em **T3.10**.
- "AI quiz generator" (MELHORIAS) + "Quiz do Dia comunitário" (BACKEND) + "LLM-powered learning path" → englobado em **T3.3** (AI Tutor context-aware é o vetor central).
- Onboarding v3 (PERSONALIZATION) + "Onboarding v2 — 3a pergunta" (MELHORIAS auditoria mai/2026) → unificado em **T1.1**.
- Hub "Fundamentos" (BRIEFING T0.1) — já parcialmente endereçado pela arquitetura DB-driven de bases; quando T2.8-T2.10 entrarem, basta registrar via admin sem código novo (regra absoluta do CLAUDE.md).
