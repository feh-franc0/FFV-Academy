# FFV Academy — Análise de mercado, posicionamento e roadmap inovador

> **Pivot 2026-05**: de "escola de engenharia para devs" para **plataforma de educação personalizada multiárea**.
> Esta análise embasa o reposicionamento e define o roadmap de inovação que separa a FFV de tudo que existe no mercado.

---

## 1. Por que pivotar agora

A plataforma já provou que **gamificação + profundidade técnica + revisão espaçada funciona**: 749 testes verdes, 900+ módulos publicados, 16+ trilhas, sistema completo de XP/badges/ranking. Mas o mercado de "cursos para dev em PT-BR" é finito (estimativa: 1.5–2M devs ativos no Brasil).

Ao mesmo tempo, três sinais de mercado tornam o pivot estratégico:

1. **Crise de aprendizado pós-IA**: estudantes recebem mais material do que conseguem organizar. Faculdades não estão evoluindo no método. Cursinhos e MBAs cobram caro por experiência ruim.
2. **PT-BR underserved**: Brilliant, Duolingo, Khan Academy não têm material profundo em português para áreas como Medicina, Direito, Engenharia. Udemy é marketplace, não plataforma.
3. **IA generativa madura**: o custo de gerar trilhas personalizadas com qualidade caiu 100x em 18 meses. Quem capturar leads agora monta moat de dados (perguntas reais, materiais reais, gaps reais).

A tese: **a infraestrutura de aprendizado da FFV (XP, SM-2, ranking, módulos) é agnóstica de conteúdo**. Vale para genética veterinária do mesmo jeito que vale para transformers.

---

## 2. TAM/SAM/SOM

| Camada | Tamanho | Fonte |
|--------|---------|-------|
| **TAM** — Estudantes ativos no Brasil | ~50M | ~8M ensino superior + ~22M ens. médio + ~6M concursos + ~14M cursos livres/extensão (estimativa MEC + IBGE 2024) |
| **SAM** — Estudantes online em PT-BR (2025-26) | ~22M | Brasil tem ~165M usuários internet ativos; cruzamento com pesquisas Statista/Hotmart sobre consumo de conteúdo educacional |
| **SOM (3 anos)** — Leads qualificados que provavelmente convertem | ~250k | Estudantes que (a) já compram cursos/apostilas online, (b) ativos em redes sociais com hashtag de estudo, (c) frustrados com ferramentas atuais |
| **SOM (12 meses)** — Realista para uma plataforma single-founder | 5–15k usuários ativos mensais | Comparável ao ramp-up de Notion Academy (PT-BR), Tilki Tarihçi (TR), Aulalivre (BR) |

Monetização realista a 12 meses (5k MAU, conversão 4%): 200 assinantes × R$ 39/mês = **R$ 93k MRR**. Com taxa de conversão de 8% no nicho-veterinária / concursos (pessoas pagantes por natureza): potencial 2x.

---

## 3. Mapa competitivo

### 3.1 Competidores diretos (PT-BR)

| Plataforma | Foco | Modelo | Gap que a FFV preenche |
|------------|------|--------|------------------------|
| **Hotmart / Eduzz** | Marketplace de cursos | Take-rate dos creators | Não tem experiência integrada — cada curso é uma silo |
| **Aulalivre** | ENEM / concursos | Free + ads + premium | Não tem SRS real, sem personalização, conteúdo genérico |
| **Descomplica / Estácio** | Ensino formal online | Mensalidade | Caro, formato passivo (vídeo + prova final) |
| **Mereo / Voitto** | Corporate L&D | B2B SaaS | Não atende estudante final |
| **Anki BR** | Flashcards | Free | Pure SRS, sem trilha, sem gamificação, sem onboarding |

**Onde a FFV vence**: combina ingredientes que estão fragmentados.

### 3.2 Competidores indiretos (globais, principalmente EN)

| Plataforma | Por que monitorar | Como divergimos |
|------------|-------------------|-----------------|
| **Duolingo** | Maior referência de gamificação educacional do mundo | Eles fazem 1 vertical bem; nós atacamos multi-vertical |
| **Brilliant.org** | Profundidade conceitual | Caro, EN-only, foco STEM. Nossa janela: vertical PT-BR + qualquer área |
| **Khan Academy** | Free + curriculum sólido | Conteúdo extenso mas estático. Nós damos personalização |
| **Notion Academy / Substack edu** | Comunidade ao redor de criadores | Não tem sistema de progresso real |
| **NotebookLM (Google)** | Trilha personalizada a partir de materiais do usuário | Faz resumo/podcast, não gera **experiência gamificada de longo prazo** |
| **MagicSchool / Khanmigo** | IA tutorial K-12 | Foco professor/escola. Nós: foco estudante autônomo |

**A FFV é o ponto único** que tem: (a) PT-BR, (b) profundidade, (c) gamificação completa, (d) SRS científico, (e) personalização por material do estudante.

---

## 4. Segmentação de personas

### Persona A — Estudante de faculdade especialista (Vet, Eng, Direito, Med)
- 21–28 anos, recebe PDFs e slides desorganizados, prova em 2 semanas
- Quer revisão objetiva + questões de fixação
- Valor percebido: economia de **horas** de organização de material
- Disposto a pagar: R$ 30–60/mês

### Persona B — Concurseiro
- 25–45 anos, edital específico
- Quer trilha estruturada pelo edital + simulados
- Valor percebido: vantagem competitiva sobre quem só estuda apostila
- Disposto a pagar: R$ 50–150/mês (mercado já paga isso por outros cursinhos)

### Persona C — Profissional em transição
- 28–40 anos, mudando de área (ex: backend → IA, advocacia → tech, gestão → produto)
- Quer ramp-up estruturado e gamificado para combater inércia
- Disposto a pagar: R$ 60–120/mês

### Persona D — Autodidata "intelectual curioso"
- Qualquer idade, aprende por gosto, quer profundidade
- Valor: ambiente de qualidade vs. YouTube/blogs aleatórios
- Disposto a pagar: R$ 20–40/mês

### Persona E — Estudante de cursinho/escola (futuro)
- 15–18 anos, vestibular/ENEM
- Pais pagam, gamificação é decisiva
- Disposto a pagar (família): R$ 80–180/mês

---

## 5. Diferenciais únicos (USPs) verificáveis

Cada um deles testável com usuário em <30 dias após o lançamento:

1. **"Não somos chatbot — entregamos uma EXPERIÊNCIA"** — Não retornamos texto cru de IA. Retornamos módulos com primitives ricos (CodeBlock, ComparisonTable, FlowDiagram, AnnotatedFormula, Callout) que já existem na plataforma.
2. **"Use o seu material"** — Upload de PDFs, slides e prints. NotebookLM existe, mas só faz resumo. Nós montamos uma trilha gamificada de longo prazo.
3. **"Memorização científica de verdade"** — SM-2 (mesmo algoritmo do Anki) já implementado em `src/lib/srs.ts`. Não é "marque como lido".
4. **"Ranking público entre estudantes"** — gamificação social que Duolingo provou que funciona. Nós aplicamos a estudos sérios.
5. **"PT-BR nativo"** — copy, exemplos, contexto regulatório (OAB, ENEM, concursos brasileiros), dicas pedagógicas em português.
6. **"Time + IA"** — V1 com curadoria manual gera dados perfeitos pra fine-tune. V2 com IA gera escala. Híbrido onde ninguém está hoje.

---

## 6. Modelo de negócio recomendado

### 6.1 Tier de monetização (proposto para semana 2 do MVP)

| Tier | Preço | Inclui |
|------|-------|--------|
| **Explorador** (free) | R$ 0 | 1 trilha personalizada/mês, 3 anexos por solicitação, gamificação completa, SRS, ranking |
| **Estudante** | R$ 39/mês ou R$ 379/ano | 5 trilhas/mês, 20 anexos/solicitação, exportação Anki, certificado por trilha |
| **Pro** | R$ 99/mês ou R$ 949/ano | Trilhas ilimitadas, materiais ilimitados, IA tutor desbloqueado (Claude), prioridade na fila de produção, perfil público verificado |
| **Família** | R$ 149/mês | Até 5 perfis (pais + filhos), dashboard parental |

### 6.2 Outras fontes (montar nas próximas sprints)

- **B2B leve**: pacotes para cursinhos / pequenas escolas (R$ 500–2000/mês). Eles enviam material, recebem trilha gamificada.
- **Certificados verificáveis**: R$ 19 por certificado em PDF + verificação online (já existe infra).
- **Marketplace de mentores**: % sobre sessões 1:1 (V3, depois de validar tração).

### 6.3 Estratégia anti-churn (gamification embarcada)

- **Streak diário** já implementado — Duolingo provou que reduz churn em ~30%
- **Freeze de streak** e Streak Repair — usuário não perde progresso por 1 dia ruim
- **Badges raras** com critérios de desbloqueio reais (128+ já modeladas)
- **Ranking semanal/mensal/anual** — competição social

---

## 7. Moat & defensibilidade

| Camada | Tipo de moat | Como construímos |
|--------|--------------|------------------|
| **Dados** | Conteúdo proprietário (V1 manual → V2 IA) | Cada solicitação vira módulo no catálogo — quanto mais usuários, melhor o currículo |
| **Engagement loop** | Streak + ranking + badges | Custo de switching alto para quem tem 60-dias de streak |
| **SEO long-tail** | 900+ artigos PT-BR + módulos novos por trilha | Domínio autoridade orgânica em nichos pouco competitivos |
| **Comunidade** | Ranking + perfis públicos (`/devcard/@user`) | Network effect leve mas crescente |
| **B2B-ready** | API existente + admin completo | Receita previsível futura |

---

## 8. Roadmap de inovação (12 meses, ordem de impacto)

### 🚀 NOW — V1.1 a V1.3 (próximas 4 semanas)

1. **Painel admin completo** ✅ (entregue nesta iteração)
2. **Emails transacionais Resend** ✅ (entregue)
3. **Associação automática lead → user por email** ✅ (entregue)
4. **Página `/minhas-solicitacoes`** — estudante logado vê status das suas solicitações
5. **Webhook Slack** — admin recebe novas solicitações em real-time
6. **Templates de trilha por área** — admin "duplica" trilha existente como base
7. **Recolocação de SEO** — sitemaps e schema markup para áreas multidisciplinares

### ⚡ NEXT — V2 (mês 2-3): camada de IA

8. **Análise automática de PDF (server-side)** — Claude API extrai tópicos, gera índice, sugere ordem ao admin
9. **Gerador de trilha (admin co-piloto)** — Claude propõe estrutura: trilha → módulos → quizzes; admin aprova/edita
10. **Quiz auto-generator** — gerar 5–10 perguntas SM-2 por módulo, com explicação rica (whyCorrect/whyWrong)
11. **Email humanizado** — Claude personaliza email de status update com base no perfil do estudante
12. **Tutor 1:1** — chat com Claude no contexto de cada módulo, já temos infra (`/api/v1/tutor/ask`)

### 🌟 LATER — V3 (mês 4-9): plataforma social

13. **Comunidade por trilha** — comentários, dúvidas, respostas com upvote (já tem `comments_handler`, expandir)
14. **Grupos de estudo privados** — leaderboard interno por código
15. **Multiplayer learning** — pareamento por nível para "duelos" de SRS (Duolingo provou que aumenta DAU em 22%)
16. **Live events** — mini-aulas síncronas via Twitch/YouTube com integração de XP
17. **Trilha social** — recomendações "amigos do seu nível concluíram X"

### 🔮 DREAM — V4 (mês 9-12): especulativo

18. **Voice-first studying** — modo "fone" que lê módulo + faz perguntas (mobilidade)
19. **AR overlay** — apontar câmera pra livro físico e ganhar XP por leitura confirmada
20. **AI-Generated diagrams** — Claude/Mermaid integrado gerando flow-charts no fly
21. **B2B SaaS-API** — cursinhos integram via API, white-label
22. **Mentor marketplace** — match com humano quando IA não basta

---

## 9. KPIs de sucesso

| Métrica | Baseline (hoje) | Meta 30d | Meta 90d | Meta 365d |
|---------|----------------|----------|----------|-----------|
| Solicitações/mês | 0 (lançando) | 50 | 500 | 5.000 |
| % solicitações com anexo | — | 40% | 55% | 65% |
| Time-to-trilha (manual) | — | 3 dias | 1 dia | 4 horas (com IA) |
| MAU | 0 | 200 | 1.500 | 12.000 |
| D7 retention | — | 25% | 35% | 45% |
| Streak médio | — | 4 dias | 7 dias | 14 dias |
| Conversão free → pago | — | — | 3% | 6% |
| NPS | — | 40 | 50 | 60 |

---

## 10. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Volume de solicitações explode antes da IA estar pronta | Alta | Médio | Fila + tier free com cap (1 trilha/mês), prioridade pra pagantes |
| Lead achar que demora demais ("perdi a fé") | Média | Alto | SLA visível ("respondemos em 72h"), updates por email a cada etapa, dashboard de status |
| Qualidade inconsistente entre áreas | Alta | Alto | Templates por vertical, checklist de qualidade, beta-fechado por área (1 área/mês) |
| Spam no formulário | Alta | Baixo | Rate-limit por IP ✅, captcha (Cloudflare Turnstile) se necessário |
| Materiais sensíveis enviados (CPF, diagnóstico médico, segredo) | Média | Alto | Política LGPD clara, criptografia at-rest (S3 com KMS na V2), aviso no upload |
| Concorrente big-tech copia | Baixa (curto prazo) | Alto | Velocidade + nicho PT-BR + comunidade fiel = janela de 18-24 meses |

---

## 11. Por que isto NÃO é um "GPT wrapper"

Diferenças concretas, demonstráveis:

1. **A IA é colaboradora interna do time, não a entrega** — V1 é manual. V2 usa Claude como co-piloto do admin, não como produto. Cada trilha é revisada por humano antes de ir pro estudante.
2. **A plataforma tem ESTADO**: progresso, SRS, badges, ranking. Wrappers de chat não retêm contexto entre sessões; nós temos `GameState` versionado (schema v3) e cloud sync.
3. **O conteúdo vive no nosso banco** — currículo, blocks, questões. Não dependemos da OpenAI/Anthropic continuar acessível ou barata. A FFV é resistente a "queda de upstream".
4. **Pedagogia, não chat** — SM-2 (algoritmo Anki), níveis (16 tiers), badges com critérios (128+), revisão espaçada por questão. Wrappers fazem Q&A. Nós fazemos aprendizado de longo prazo.

---

## 12. Próximos 14 dias (recomendado, pós-pivot)

1. ✅ **Pivot técnico** — esta entrega: backend completo, admin, emails, associação automática
2. **Soft launch** (D+1 a D+3) — postar em 3 comunidades alvo (Vet, Eng, concursos) pedindo beta
3. **Calibrar SLA** (D+3 a D+7) — primeiras solicitações respondidas em 24-48h, coletar feedback
4. **Caso de sucesso** (D+7 a D+14) — 5 trilhas piloto entregues; pedir vídeo-depoimento; usar como social proof
5. **Captura sistemática** (D+10) — bloco de social proof na home com depoimentos reais
6. **Métricas básicas** (D+14) — dashboard admin de stats por área, conversão de status

---

## Apêndice A — Mapa de inovações já no produto (e por que valem ouro)

A maior parte do trabalho técnico que sustenta essa visão **já está pronta** — só precisava ser reposicionado:

| Capability | Onde vive | O que destrava no pivot |
|-----------|-----------|-------------------------|
| 8 hubs / 16 trilhas / 900+ módulos | `frontend/src/lib/curriculum.ts` | Catálogo seed para qualquer área |
| 16 níveis + 128 badges | `frontend/src/lib/engine.ts` | Gamificação plug-and-play |
| Algoritmo SM-2 (Anki-equivalent) | `frontend/src/lib/srs.ts` | Memorização científica para qualquer matéria |
| Ranking 4 períodos (weekly/monthly/yearly/all-time) | `backend/internal/domain/leaderboard/` | Competição multiárea |
| Backend Go com DDD limpo | `backend/internal/{domain,application,infrastructure}/` | API multi-tenant ready |
| Resend (email transacional) | `backend/internal/infrastructure/email/` | Comunicação automatizada |
| Audit log + RBAC admin | `internal/domain/audit/`, `middleware.RequireAdmin` | Compliance-ready |
| PWA + offline-first | `next.config.ts` + service worker | Estudo no metrô / sem internet |
| OpenTelemetry | `internal/platform/telemetry/` | Observabilidade Day-1 |
| 749 testes verdes | `frontend/src/tests/`, `backend/test/` | Velocidade sustentável de iteração |

**Conclusão**: o que falta não é tecnologia. É distribuição.

---

> _"A maioria dos competidores tem cara de ferramenta, com um logo bonito. A FFV tem cara de plataforma, com gamificação completa e profundidade real. O pivot não inventou nada — só apontou a infra existente pra um mercado 30x maior."_
