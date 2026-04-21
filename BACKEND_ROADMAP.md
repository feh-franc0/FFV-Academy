# BACKEND_ROADMAP.md — Iniciativas que requerem backend

Este documento lista todas as iniciativas que precisam de uma camada de backend (auth, database, API) para serem viabilizadas. O FFV Academy é hoje 100% estático (Next.js export → Hostinger). Adicionar backend leve (Supabase, Firebase ou Cloudflare Workers + KV) desbloqueia tudo que está aqui.

> **Recomendação técnica**: começar com **Supabase free tier** (500 MB DB + auth + storage). Magic-link auth, Postgres, edge functions. Aguenta 10k+ usuários sem custo. Site continua estático; chamadas backend via fetch do cliente.

---

## 🎯 Diretrizes gerais

- **Não migrar localStorage** para o backend. Manter local como cache/fallback. Sync opcional.
- **Auth opcional**: usuário pode usar 100% sem cadastro. Auth desbloqueia features social, sync, leaderboard, certificados verificáveis.
- **Privacy first**: opt-in explícito pra qualquer dado público (perfil, leaderboard).

---

## 🧱 INFRA BASE (sprint 0)

Pré-requisito de tudo abaixo. Estimativa: **3-5 dias**.

### 1. Setup Supabase
- Criar projeto Supabase (free tier).
- Schema mínimo:
  - `users` (id, email, handle, display_name, avatar_url, created_at)
  - `progress` (user_id, game_state_json, updated_at) — cloud sync do GameState
  - `referrals` (referrer_id, referred_user_id, created_at, bonus_granted)
  - `events` (user_id, event_type, payload_json, created_at) — analytics rica
- Magic-link auth (email-only, sem senha).
- RLS (Row Level Security) — usuário só lê/escreve próprio `progress`.

### 2. Cloud sync hook
- Hook `useCloudSync(state)` em `useGameState.ts` que faz upsert no `progress` table debounced (5s).
- Fetch inicial substitui localStorage se cloud é mais recente.
- Funcionamento offline: localStorage continua autoritativo; sync quando online.

### 3. Edge function `/api/event`
- Recebe eventos custom (referral_used, certificate_generated, share_clicked).
- Persiste em `events` table.
- Substitui Plausible para eventos privados (mas mantém Plausible pra page views).

---

## 🚀 INICIATIVAS COMPLETAS (sprints 1+)

### Tier 1 — Loop viral aumentado

#### 4. Leaderboard semanal opt-in
**ROI alto**. Duolingo Leagues aumentou retenção em ~20%.
- Ranking de XP da semana corrente (Mon-Sun).
- Usuário escolhe se aparece (opt-in explícito).
- Display: top 20 + posição do usuário (mesmo se não top 20).
- Reset toda segunda 00:00 UTC.
- Página `/leaderboard` ou seção no `/progresso`.
- Variantes futuras: por hub, por trilha, mensal, all-time.

#### 5. Perfil público `/u/<handle>`
- URL compartilhável: `fernandofrancovalle.com/u/fernando`
- Mostra: avatar, nome, bio curta, streak, XP, badges, trilhas concluídas.
- Botões "Seguir" (futuro), "Compartilhar perfil".
- Privacy: opt-in (toggle "perfil público" no settings).
- SEO: cada perfil é página pública indexável (mas `noindex` se private).

#### 6. Refer-a-friend com tracking real
**Hoje**: client-only com URL `?ref=<id>`. Bônus dado mas sem contagem real.
**Com backend**: contagem real de referidos por user, leaderboard de embaixadores, badge ao atingir 5/10/25 referidos.
- Adicionar `referrals` table com `referrer_id` + `referred_user_id`.
- Calcular `referrer_count` per user.
- Badge "Conector" (5+), "Embaixador" (10+), "Influencer" (25+).
- Mostra na página de perfil.

### Tier 2 — Retenção profunda

#### 7. Email drip Buttondown automatizado
**Sem backend mas precisa de orchestration**.
- Buttondown tem API. Edge function dispara emails baseado em estado (sem revisar há 7 dias, completou trilha, etc).
- Sequências:
  - **Welcome series** (D0, D1, D3, D7) — onboarding pelo email
  - **Streak rescue** (D-1 do streak quebrar) — "sua streak de 23 dias acaba em 12h"
  - **Churn rescue** (D14 sem revisar) — "olha o que perdeu"
  - **Weekly digest** (sextas) — XP da semana, posição no leaderboard, novo conteúdo
- Edge function cron (Supabase ou Vercel Cron).

#### 8. Push notifications real
**Hoje**: PWA installable existe mas sem push (precisa endpoint).
- Supabase edge function para push subscription.
- Notificações:
  - Streak rescue: "🔥 sua streak de 30 dias acaba em 4h"
  - Daily challenge: "⚡ desafio do dia: Subagents (12 min)"
  - Weekly recap: "🎉 você ficou em 8º no leaderboard"
  - Novo conteúdo: "📚 nova trilha lançada: Harness Engineering"
- Permission flow: pedir após D2 (não na primeira visita — alta taxa de deny).

#### 9. Weekly recap email
- Toda sexta às 18h: cron + edge function envia personalizado.
- Conteúdo: "Você: +230 XP, +1 badge. Top 3 da plataforma. Novo conteúdo da semana."
- Reengaja listeners passivos da newsletter.

### Tier 3 — Social

#### 10. Study groups
- URL de convite: `/grupo/xpto` (token aleatório).
- 3-10 pessoas formam grupo.
- Ranking privado semanal entre membros.
- Chat opt-in (Discord/Telegram link compartilhado, sem reinventar chat).
- Use case: empresas/squads/turmas usam para gamificar aprendizado em grupo.

#### 11. Friend system simples
- "Adicionar amigo" via handle.
- Comparação 1:1 (XP, streak, badges em comum).
- Notificação: "Fulano completou 3 módulos hoje".

#### 12. AMA mensal com Fernando
- Live no Discord/YouTube. Recorded.
- Página `/eventos` lista eventos passados + próximo.
- Email automático para inscritos da newsletter no dia.

### Tier 4 — Conteúdo dinâmico

#### 13. "Quiz do Dia" comunitário
- 1 pergunta por dia (curated ou auto-gerada via Claude API).
- Resultado agregado: "82% dos devs acertaram".
- Stats por trilha/categoria.
- Email push: "👀 quiz do dia chegou".

#### 14. AI Tutor integrado
- Chat embarcado com Claude (Anthropic API).
- Context-aware: sabe o progresso do user (cloud sync), pode sugerir próximo passo.
- Limite: 50 mensagens/mês free, ilimitado pro Tier Pro.

#### 15. User-generated content
- Comentários em artigos (com moderation).
- "Pergunte ao Fernando" — fila pública de perguntas.
- "Mostre o que construiu" — galeria de projetos dos usuários.

### Tier 5 — Monetização

#### 16. Tier "Pro" — R$ 19/mês
- **Cloud sync premium** (já tem free, mas Pro tem versionamento + restore).
- **Certificados verificáveis** (open badge + URL pública assinada).
- **Priority access**: módulos novos 7 dias antes.
- **AI Tutor ilimitado**.
- **Discord room "Pro"**.
- Stripe integration via Supabase edge functions.

#### 17. Tier "Teams" B2B — R$ 99/usuário/mês
- **Admin dashboard**: CTO/Tech Lead vê progresso do time.
- **Trilhas customizadas** por stack da empresa.
- **Corporate leaderboard** privado.
- **Certificados com logo da empresa**.
- **SSO** (SAML/OIDC) + LGPD compliance.
- Mercado BR: gap claro (LinkedIn Learning é caro/genérico, Alura é grande mas não focado em IA moderna).

#### 18. Live cohorts pagos
- Turmas de 20 devs, 6 semanas, R$ 497-997 por cohort.
- "Cohort Claude Code", "Cohort RAG em produção", "Cohort AWS SAA".
- Zoom + Discord exclusivo + projetos finais.
- Integração: page `/cohorts` lista próximas, formulário de aplicação, Stripe checkout.

#### 19. Mentorship marketplace
- Top performers (XP, badges raros) podem se cadastrar como mentor.
- 30% revenue share.
- Booking via Cal.com integration.
- Reviews públicos.
- (Complexo. Lançar só após 5k MAU.)

### Tier 6 — Analytics & Operações

#### 20. Admin dashboard
- Métricas em real-time: DAU/MAU, retention curves, churn analysis.
- Funnel de cada landing page.
- Top trails/articles por engagement.
- Cohort analysis (D1, D7, D30 retention).
- Built com Supabase + simple Next.js dashboard.

#### 21. A/B testing framework
- Edge function decide variant (50/50).
- Eventos taggeados com variant.
- Decision: PostHog free tier ou homemade com Supabase.

#### 22. Anti-cheat / fraud detection
- Detect XP farming (mesma sessão, milhares de cards/h).
- Detect referral abuse (mesmo IP).
- Soft suspension com manual review.

---

## 📊 PRIORIZAÇÃO SUGERIDA

| Sprint | Iniciativas | Resultado esperado |
|---|---|---|
| **0** (3-5d) | 1, 2, 3 — infra base | Backend pronto, cloud sync |
| **1** (1-2sem) | 4, 5, 6 — viral social | Leaderboard + perfil público + referral real → +30% MAU |
| **2** (1-2sem) | 7, 8, 9 — drip + push | Retenção D30: 15% → 35% |
| **3** (3-4sem) | 10, 13, 14 — social/ai tutor | DAU/MAU dobra |
| **4** (1mes+) | 16, 17 — monetização Pro+Teams | ARR começa |
| **Ongoing** | 20, 21, 22 — analytics | Decisões data-driven |

---

## 💸 ESTIMATIVA DE CUSTO (até 10k MAU)

| Serviço | Custo mensal |
|---|---|
| Supabase (free tier até 50k MAU + 500MB DB) | $0 |
| Hostinger (já temos) | já pago |
| Buttondown (até 1k subscribers free, depois $9-29/mo) | $0-29 |
| Cloudflare (DNS, CDN free) | $0 |
| Anthropic API (AI Tutor — ~5k req/mes) | $20-50 |
| **TOTAL** | **$20-80/mês** |

Em comparação, monetização realista com 10k MAU + 5% conversion para Pro = 500 × R$ 19 = **R$ 9.500/mês**.

ROI claro.

---

## 🛡️ DECISÕES DE PRINCÍPIO

1. **Privacidade**: nada vai pro backend sem opt-in. localStorage continua sendo o "modo padrão".
2. **Reversibilidade**: usuário pode deletar conta + dados a qualquer momento (LGPD/GDPR compliance).
3. **Open data**: backups completos exportáveis a qualquer momento (já temos /progresso → export).
4. **Open source**: considerar abrir o código (já que é estático) — vira marketing técnico forte.
5. **Brasileiro first**: payment em PIX (via Stripe ou alternativa local), suporte em PT-BR, LGPD compliance, hospedagem com latência boa pro Brasil.

---

**Última atualização**: 2026-04-19
