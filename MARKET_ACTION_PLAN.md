# FFV Academy — Plano de Ação Competitivo (próximas 2 semanas)

**Data:** 2026-05-19
**Base:** `COMPETITIVE_ANALYSIS_2026-05.md` + `MARKET_ANALYSIS.md`
**Frente de guerra:** NotebookLM (Google) e ChatGPT Study Mode.
**Tese:** "NotebookLM te dá um resumo. ChatGPT te responde. A FFV pega seu material e te devolve uma escola — em 24h, com trilha, SRS real e gamificação, gratuita."

---

## A) GAPS COMPETITIVOS ABERTOS HOJE (top 5)

### 1. Sem preview imediato — tudo demora 24h
**Dói porque:** o estudante saiu do NotebookLM (onde colou PDF e em 30s tinha resumo). Vê "24h" e abandona. Estamos perdendo no primeiro toque.
**Feature que fecha:** **Pré-trilha automática** (Claude API server-side) que gera esqueleto da trilha — capítulos, módulos previstos, primeiros 3 quizzes — em <60s, antes da curadoria humana entrar.

### 2. Sem "conversar com o material" depois de gerado
**Dói porque:** Studyfetch (Spark.E), NotebookLM e ChatGPT permitem perguntar sobre o PDF a qualquer momento. A FFV gera trilha e some.
**Feature que fecha:** **Tutor IA contextual por módulo** (RAG sobre o material do aluno + módulo atual). Já temos infra `/api/v1/tutor/ask` — só falta plumbing no frontend.

### 3. Sem prova social numérica visível
**Dói porque:** A landing fala em diferenciais ("SRS real", "gamificação coerente") sem evidência. NotebookLM tem marca Google. FFV tem zero reconhecimento → cada visitante precisa ser convencido do zero.
**Feature que fecha:** **Barra de stats live na home** ("X trilhas entregues esta semana · Y cards revisados hoje · Z alunos no ranking agora") + 2-3 depoimentos com foto/instituição.

### 4. Sem garantia visível ("e se demorar?", "e se ficar ruim?")
**Dói porque:** 24h é uma promessa frágil sem SLA explícito. Estudante em véspera de prova não arrisca.
**Feature que fecha:** **SLA visível** ("respondemos em até 24h ou seu material vira prioridade máxima") + **status tracker** ("recebido → em curadoria → trilha pronta") por email + página `/minhas-solicitacoes`.

### 5. Sem export Anki — comunidade Anki (medicina/idiomas) é fanática
**Dói porque:** Estudante de medicina já vive no Anki. Sem export, FFV é "mais uma ferramenta" em vez de upgrade.
**Feature que fecha:** **Botão "Exportar para Anki (.apkg)"** por trilha. Trivial (gerar `.apkg` é spec aberta).

---

## B) DIFERENCIAIS A AMPLIFICAR NA LANDING (top 5)

1. **Curadoria humana em 24h** — *"Sua trilha é revisada por um engenheiro de verdade antes de chegar. Não é cuspe de LLM."*
2. **SRS SM-2 real (não 'marque como lido')** — *"Mesmo algoritmo do Anki, integrado a cada quiz. Memorização científica que dura meses, não horas."*
3. **Trilha estruturada do SEU material** — *"NotebookLM te dá um resumo. A FFV te dá uma escola completa do seu PDF — com módulos, quizzes e progresso."*
4. **Gratuito de verdade, multi-área** — *"Medicina, Direito, Engenharia, AWS, Concurso. Tudo gratuito, em PT-BR. Sem trial, sem paywall em conteúdo."*
5. **Gamificação que retém (XP, streak, 128+ badges, 4 rankings)** — *"Duolingo provou que funciona em idiomas. A FFV traz pra estudo sério."*

---

## C) FEATURES PRIORITÁRIAS (top 10) — formato (Impacto, Esforço, ROI)

### 1. Pré-trilha em 60s (preview antes da curadoria)
- **Entrega:** Esqueleto da trilha visível na hora; o final chega em 24h.
- **Vantagem:** Mata o "vou no NotebookLM agora" — entregamos preview na velocidade dele.
- **Esforço:** 12-16h (Claude API + render como `KnowledgeBaseHome` simplificado).
- **Risco de não fazer:** ~40% abandono pós-submit.
- **Impacto 10 / Esforço 6 / ROI 10**

### 2. Tutor IA contextual por módulo (chat sobre material + módulo)
- **Entrega:** Botão "Pergunte sobre este módulo" → chat Claude com RAG no material do aluno.
- **Vantagem:** ChatGPT/Studyfetch perdem a vantagem do Q&A — temos trilha + Q&A.
- **Esforço:** 20h (UI + RAG sobre PDFs upload).
- **Risco de não fazer:** Studyfetch/NotebookLM continuam como "ferramenta completa", FFV vira só "gerador inicial".
- **Impacto 9 / Esforço 7 / ROI 8**

### 3. SLA + status tracker visível + emails de update
- **Entrega:** "Sua trilha em: recebido → análise → curadoria → pronta" com timestamp.
- **Vantagem:** Transforma 24h de fraqueza em prova de qualidade. NotebookLM não tem isso.
- **Esforço:** 8-10h (já tem admin + Resend).
- **Risco de não fazer:** Lead some no dia 0.
- **Impacto 9 / Esforço 3 / ROI 10**

### 4. Stats bar live + 3 depoimentos reais com foto
- **Entrega:** Faixa numérica na home: "X trilhas entregues · Y cards SRS revisados hoje".
- **Vantagem:** Combate diretamente o brand-gap vs Google/OpenAI.
- **Esforço:** 6h (já temos `/api/v1/stats`).
- **Risco de não fazer:** Landing parece "outro indie sem tração".
- **Impacto 8 / Esforço 2 / ROI 10**

### 5. Export Anki (.apkg) por trilha
- **Entrega:** Botão "Exportar como Anki" na trilha.
- **Vantagem:** Captura comunidade Anki (medicina/idiomas) sem competir frontal.
- **Esforço:** 8h (spec `.apkg` é aberta; SQLite + zip).
- **Risco de não fazer:** Perde nicho médico inteiro pra Anki+Mindgrasp.
- **Impacto 7 / Esforço 3 / ROI 9**

### 6. "Pergunte de novo" no card SRS (reformula conceito errado)
- **Entrega:** Botão no card após errar → Claude reformula em outro ângulo.
- **Vantagem:** Pedagogia real — ninguém faz isso. SRS deixa de ser punitivo.
- **Esforço:** 6h.
- **Risco de não fazer:** Pedagógico fica idêntico ao Anki.
- **Impacto 7 / Esforço 2 / ROI 9**

### 7. Certificado de trilha (já no roadmap T1)
- **Entrega:** PDF/PNG verificável ao completar trilha.
- **Vantagem:** NotebookLM/ChatGPT/Anki não emitem nada.
- **Esforço:** 10h (`Certificate.tsx` já existe — falta endpoint).
- **Risco de não fazer:** Perde Persona B (concurseiro) e C (transição).
- **Impacto 8 / Esforço 4 / ROI 8**

### 8. Dev/Student Card compartilhável (`/devcard/@user`)
- **Entrega:** Página pública com badges, XP, streak. Botão "compartilhar no LinkedIn".
- **Vantagem:** Marketing viral grátis. LinkedIn BR adora.
- **Esforço:** 8h.
- **Risco de não fazer:** Crescimento orgânico zero.
- **Impacto 8 / Esforço 3 / ROI 9**

### 9. Comparativo lado-a-lado na landing (FFV vs NotebookLM vs ChatGPT)
- **Entrega:** Tabela visual: "o que cada um faz" — 5 linhas, 3 colunas.
- **Vantagem:** Desarma a dúvida #1 do estudante ("isso não é tipo um ChatGPT?").
- **Esforço:** 3h.
- **Risco de não fazer:** Estudante decide sem ver o argumento.
- **Impacto 7 / Esforço 1 / ROI 10**

### 10. Webhook Slack/Discord interno + auto-tag por área
- **Entrega:** Cada nova solicitação cai no Slack + tagged por área.
- **Vantagem:** Operacional — sem isso, 24h vira 72h e o posicionamento desmorona.
- **Esforço:** 4h.
- **Risco de não fazer:** SLA não tem como ser cumprido em escala.
- **Impacto 7 / Esforço 2 / ROI 9**

---

## D) MICROCOPY ESPECÍFICO PRA COMBATE

1. **"Isso é tipo um ChatGPT?"** → *"ChatGPT responde uma vez. A FFV vira uma escola que te lembra do que você esqueceu — toda semana, no algoritmo que a comunidade médica usa há 30 anos."*
2. **"Vou pagar?"** → *"Nunca. Gratuito de verdade — não freemium, não trial. Trilhas, módulos, quizzes, ranking, badges: tudo grátis, sempre. Suportamos via simulados de certificação opcionais."*
3. **"É confiável? Quem revisa?"** → *"Cada trilha passa por um engenheiro humano antes de ir pra você. Não é cuspe de LLM."*
4. **"Vai demorar?"** → *"Preview da trilha em 60 segundos. Versão final curada em até 24h. Você acompanha em tempo real."*
5. **"E se for ruim?"** → *"Se a trilha não te servir, refazemos. Não tem letra miúda — você não pagou nada e a gente tem orgulho do que entrega."*
6. **"Por que não usar Anki?"** → *"Use os dois. A FFV exporta sua trilha como .apkg quando quiser. A gente não tira nada — só adiciona estrutura e gamificação."*
7. **"Vocês têm mesmo conteúdo de [minha área]?"** → *"Já temos trilhas vivas em Tecnologia e MedVet. Sua área entra na fila — você é nosso piloto e nós te tratamos como tal."*

---

## E) UX SPECS RÁPIDAS

### 1. Hero da landing — adicionar "trust strip" abaixo do CTA
**Arquivo:** `/Users/fernandofranco/Developer/fernandofrancovalledotcom/frontend/src/components/home/Hero.tsx` (linhas 145-157, após os CTAs).
**Mudança:** Adicionar uma faixa horizontal compacta (max 1 linha) com 3 selos: `100% gratuito` · `Curadoria humana em 24h` · `SRS SM-2 real`. Hoje o Hero pula direto dos CTAs pro `lastArticle` ou `finalStats` — o visitante novo não vê argumento de garantia. Usar `var(--ffv-muted)` + ícones pequenos. Acima do `StatPill` row.

### 2. StudyRequestForm — promessa de preview + barra de progresso visual
**Arquivo:** `/Users/fernandofranco/Developer/fernandofrancovalledotcom/frontend/src/components/home/StudyRequestForm.tsx`.
**Mudanças:**
- **Topo do form:** badge `"Preview em 60s · Trilha final em 24h"` antes do primeiro campo. Hoje o form é só campos, sem framing de promessa.
- **Stepper visual** (4 passos: `seus dados → o que estudar → seu material → confirmação`) no topo — reduz fricção em forms longos (10 campos é muito).
- **Estado `success`** (linha ~39): substituir mensagem genérica por card com: timer "começamos a processar agora", próximos passos numerados, link `/minhas-solicitacoes`.

### 3. KnowledgeBaseHome — slot "Recebemos seu material? Veja status" + comparativo
**Arquivo:** `/Users/fernandofranco/Developer/fernandofrancovalledotcom/frontend/src/components/base/KnowledgeBaseHome.tsx`.
**Mudanças:**
- Entre `Hero` e `SocialProofBar` (linhas ~estrutura comentada 1-7), adicionar slot opcional `pendingRequestBanner` — se usuário logado tem solicitação pendente, mostra banner "Sua trilha de [matéria] está em curadoria · etapa 2/4". Usa `/api/v1/study-requests/mine` (a criar).
- Adicionar nova section `<ComparisonStrip />` antes de `FinalCta` — tabela 3 colunas (FFV vs NotebookLM vs ChatGPT) com 5 linhas-chave (trilha estruturada, SRS real, gamificação, curadoria humana, gratuito). Combate direto.

---

## F) RISCOS NO POSICIONAMENTO ATUAL

### 1. "Gratuito" sem explicar a sustentabilidade soa golpe
Visitantes pós-Hotmart desconfiam de "grátis". Sem dizer **como** se sustenta (simulados pagos opcionais, B2B leve), o estudante assume "vão cobrar depois" ou "vão vender meu dado". **Mitigação:** rodapé honesto em `/sobre` + microcopy "Como nos sustentamos: simulados opcionais de certificação. Conteúdo educacional é e será sempre grátis."

### 2. "24h" sem SLA visível vira pretexto pra abandono
Em véspera de prova, 24h é uma eternidade. Sem timeline visível + email a cada etapa, o lead se convence que esquecemos. **Mitigação:** preview em 60s (feature #1) + status tracker + email a cada transição de status.

### 3. Curadoria humana é gargalo — não escalar mata o posicionamento
Se chegarem 500 pedidos/semana e ainda for "24h", a confiança quebra publicamente (Twitter/Reddit). **Mitigação:** Claude API como co-piloto do admin desde a sprint atual + cap por tier no free (1 trilha/mês) + filas com prioridade transparente. Honestidade em escala é melhor que prometer 24h e entregar 72h.

---

**Próximos 14 dias — sequência recomendada:**
Semana 1: features #3 (SLA tracker), #4 (stats bar), #9 (comparativo), #10 (Slack hook), microcopy + UX specs 1, 2, 3.
Semana 2: features #1 (pré-trilha 60s), #6 ("pergunte de novo"), #5 (export Anki), #8 (devcard).
Feature #2 (tutor RAG) e #7 (certificado) ficam para sprint seguinte — alto valor mas exigem RAG infra e validação de SSO.
