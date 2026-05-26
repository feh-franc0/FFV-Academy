# STRATEGY — FFV Academy

> **Doc-mestre de estratégia.** Posicionamento, mercado, concorrentes, SWOT, plano executivo.
> **Última atualização:** 2026-05-26 · v2.0 (pós-pivot para user-generated learning)
> **Documento canônico:** se outro doc conflitar com este, este vence.

---

## 0. TL;DR — O que somos

> **A FFV é a plataforma onde você sobe qualquer conteúdo (PDF, imagem, link, áudio, vídeo) e recebe um plano de estudo estruturado com 100 questões calibradas por Bloom e revisão espaçada real. Gratuita, em PT-BR, sem hype.**

O método operacional completo está em [`TEACHING_METHOD.md`](./TEACHING_METHOD.md). Este documento cobre o **negócio** ao redor dele.

**Pivot:** até abril/2026 éramos uma escola com currículo curado (157 módulos, 8 bases). De maio/2026 em diante, o **produto principal** é o pipeline de **user-generated learning**. O currículo curado vira biblioteca/showcase do método (ver `TEACHING_METHOD.md §8`).

---

## 1. Posicionamento

### Pitch (uma linha, copia colando)

> *"Suba qualquer conteúdo. Receba 100 questões calibradas + revisão espaçada. Aprenda de verdade, em português, de graça."*

### Pitch (3 linhas, blog/landing)

> A FFV transforma o conteúdo que **você** já tem — PDF da apostila, foto do quadro, link do artigo, áudio da aula, vídeo do YouTube — num plano de estudo estruturado pedagogicamente: resumo, mapa conceitual, **100 questões obrigatórias** calibradas pela Taxonomia de Bloom, e revisão espaçada real (SM-2 / FSRS).
>
> Não é mais um "chat com PDF". É **método pedagógico embutido em software**, baseado em research empírico de retenção (Karpicke, Roediger, Bjork). Tudo em PT-BR. Tudo gratuito.

### Vantagem injusta (defensável)

| Camada | Por que difícil de copiar |
|--------|---------------------------|
| **Padrão "100Q sempre"** | Concorrentes são *customizáveis* por filosofia ("flexibilidade vende"). FFV é **opinionada** — vira contra-cultura. Replicar exige redesign de produto. |
| **SRS real + AI gen integrados** | Anki/Mochi/RemNote têm SRS sério mas **não geram quiz**. Quizlet/Knowt/NotebookLM **geram mas SRS é fake** (sem ease factor, sem interval, sem memory decay). Cruzar os dois exige engenharia + research. |
| **PT-BR + cultura BR** | NotebookLM tem PT-BR genérico. FFV é **nativa BR**: ENEM/concurso/OAB/residência/CESPE/FGV/Vunesp. Localização cultural não-trivial. |
| **Fernando como founder técnico de pedagogia** | Combinação rara: sênior em código + estuda neurociência aplicada de verdade + entrega solo. Public building amplifica. |

---

## 2. Mercado

### Tamanho (todos em USD)

| Segmento | Tamanho 2025-2026 | Projeção | CAGR | Fonte |
|----------|-------------------|----------|------|-------|
| **AI Education Tools (global)** | $3.45B (2025) | $17.84B (2034) | **19.8%** | [Intel Market Research](https://www.intelmarketresearch.com/ai-education-tools-market-41184) |
| **AI in Education (global, amplo)** | $5.88B (2024) | $32.27B (2030) | **31.2%** | [Grand View](https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-education-market-report) |
| **EdTech global** | $189B (2025) → $214B (2026) | — | ~13% | Grand View |
| **Brasil AI (broad)** | $17.8B | — | **23%** (2026-33) | [Grand View](https://www.grandviewresearch.com/horizon/outlook/artificial-intelligence-market/brazil) |
| **Brasil Generative AI** | $140.6M | — | **36.2%** (2026-33) | [Grand View](https://www.grandviewresearch.com/horizon/outlook/generative-ai-market/brazil) |
| **Brasil EdTech** | $6.0B (2025) | $15.6B (2034) | **11.12%** | [IMARC](https://www.imarcgroup.com/brazil-edtech-market) |

### TAM/SAM/SOM aplicado à FFV

| Camada | Definição | Estimativa |
|--------|-----------|------------|
| **TAM** (Total Addressable) | Estudantes do mundo que usam AI pra estudar | ~600M (86% de 700M estudantes) — [Programs.com](https://programs.com/resources/students-using-ai/) |
| **SAM** (Serviceable Available) | Estudantes PT-BR (BR + PT + diáspora) | ~50M (10M Classroom BR + concurseiros + universitários + concursos) |
| **SOM** (Serviceable Obtainable, 5 anos) | Nicho FFV: dev BR + concurso público + ENEM/vestibular sério | **~500K usuários ativos** (1% do SAM) |

### Comportamento (estudantes 2026)

- **86%** usam AI pra estudar globalmente
- **82% college / 58% high school** EUA usaram AI
- **57% college EUA** usam IA semanal ou mais; **20% diariamente**
- **66%** usam ChatGPT como tool primário (ameaça e oportunidade)
- **Brasil = 5.57%** do tráfego global ChatGPT (mercado real, não teórico)

### Funding do espaço (2025-2026)

- **AI Education total:** $183.6M em 21 deals (mai/2025-abr/2026). Mediana $6.8M. **Nenhum round >$50M.** Espaço pré-consolidação — janela aberta.
- **Speak** (language tutor): Series C $78M @ $1B (dez/2024). Sinal de que vertical-puro escala.
- **EdTech total 2025:** $4.09B (+23% YoY). 31% pra startups AI-leveraged.
- **Teacher-facing tools** (MagicSchool, Brisk, Curipod): $90M+ combinado.

> Implicação: o espaço está MORNO (não tem unicorn AI study tool ainda), mas a janela vai fechar quando Google/OpenAI/Quizlet decidirem comer o nicho com produto grátis.

---

## 3. Concorrentes

### Tabela resumo — top 16 players

| # | Player | Preço (USD) | Idioma | Inputs aceitos | Qtd Q por upload | SRS real? | Ameaça FFV |
|---|--------|-------------|--------|----------------|------------------|-----------|------------|
| 1 | **NotebookLM** (Google) | Free / $7.99 / $19.99 / $99-200 | 80+ (PT-BR) | PDF, doc, áudio, vídeo, link, YouTube, Drive | Customizável | ❌ ("Got it/Missed it" + shuffle) | **🔴 LETAL** |
| 2 | **Quizlet + Coconote** | Free restritivo / $35.99/yr | Multi (PT fraco) | Notes, áudio/vídeo via Coconote | 10-30 cards | ⚠️ (Learn Mode ≠ SRS canônico) | 🟠 ALTA |
| 3 | **ChatGPT Study Mode** | Free incluso | Multi | Conversa, upload | Conversacional | ❌ | **🔴 EXISTENCIAL** |
| 4 | **StudyFetch** | Free trial / $7.99-11.99 | EN | PDF, PPT, vídeo, YouTube, áudio, foto | **Cap 20Q** | ❌ | 🟡 MÉDIA |
| 5 | **Mindgrasp AI** | $5.99-14.99 | 30+ | PDF, vídeo, link, áudio, live | Ilimitado sem Bloom | ❌ | 🟡 MÉDIA |
| 6 | **Knowt** | Free / $9.99/mo | Multi | PDF, notes, links | Ilimitado | ❌ ("SRS" é fake — [evidência](https://flashcardbuddy.com/knowt-alternative)) | 🟡 MÉDIA |
| 7 | **Wisdolia** | Free trial | EN | Web, PDF, YouTube (Chrome) | 10-15 cards | ❌ | 🟢 BAIXA |
| 8 | **Quizgecko** | $16-20/mo | Multi | PDF, texto, link | Configurável | ❌ | 🟢 BAIXA |
| 9 | **ChatPDF / Humata.ai / PDF.ai** | $9.99-19.99 | EN/multi | PDF | N/A (é chat) | ❌ | 🟢 BAIXA |
| 10 | **Conker** | Free 10Q / $3.99-8 | EN | Texto, URL | **Cap 10Q free** | ❌ | 🟢 BAIXA |
| 11 | **Eduaide.ai / Revisely** | $3.99-8.99 | Multi | Texto, PDF | Variável | ❌ | 🟢 BAIXA |
| 12 | **Anki** | Free / $24.99 iOS one-time | Multi (PT via UGC) | Manual + add-ons | Manual (sem AI) | ✅ **FSRS default** | 🟢 BAIXA (sem AI) |
| 13 | **Mochi** | Free / $5/mo sync | Multi | Markdown + Anki | Manual | ✅ FSRS opcional | 🟢 BAIXA |
| 14 | **RemNote** | Free / $6-8/mo | Multi | PDF, notes, image-occlusion | Manual + AI gen (Pro) | ✅ SM-2 + FSRS beta | 🟡 MÉDIA |

### Brasil-specific

| Player | Modelo | Faz upload-to-AI? | Posição |
|--------|--------|-------------------|---------|
| Stoodi | Cursinho ENEM PT-BR pago | ❌ video + questões curadas | Vertical ENEM |
| Descomplica | Cursinho ENEM/pós PT-BR pago | ❌ video + plano | Líder marca vestibular |
| QConcursos | Banco de questões concursos | ❌ questões curadas | Líder concurso |
| Flashcards Concursos | PT-BR concurso | ⚠️ "IA integrada" anunciada — não verificado | Vertical concurso |
| Tesify | Acadêmico PT-BR (TCC/ABNT) | ❌ AI writing, não quiz/SRS | Vertical TCC |
| Astra AI | Tutor PT-BR | ❌ Q&A, sem 100Q/SRS | Tutor |

### Os 3 mais ameaçadores (drill-down)

**1. NotebookLM (Google) — ameaça letal**
- Free tier brutal: 100 notebooks, 50 sources/notebook, 50 chats/dia, **PT-BR nativo**, 80+ idiomas
- Lançou flashcards + quizzes em set/2025; dentro do Google Classroom em out/2025 (abr/2026 todos os idiomas Classroom)
- Brasil tem **10M+ contas Classroom em escolas públicas** — se MEC adotar Gemini for Education, default = Google
- **Gap exposto:** flashcards são deck estático com shuffle. **Não tem SRS real, não tem 100Q calibrada por Bloom**. Mas é mês de engenharia adicionar.
- Fontes: [blog Google](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-app-quizzes-flashcards/), [pricing](https://felloai.com/notebooklm-pricing/), [Classroom languages](https://workspaceupdates.googleblog.com/2026/04/gemini-in-google-classroom-is-now-available-in-all-Classroom-supported-languages.html)

**2. ChatGPT Study Mode (OpenAI) — ameaça existencial**
- Lançado jul/2025 pra Free/Plus/Pro/Team + ChatGPT Edu
- Socratic questioning desenhado com 40+ instituições
- Roadmap explícito: goal tracking, progress, deeper personalization
- **800M MAU em 2026** — distribuição que não temos
- Brasil = 5.57% do tráfego ChatGPT
- Fonte: [openai.com](https://openai.com/index/chatgpt-study-mode/)

**3. Quizlet + Coconote — ameaça alta**
- 60M MAU, 2/3 dos high schoolers EUA usam
- Comprou Coconote 5/fev/2026 — agora ingere áudio/vídeo aula → notes → flashcards
- Magic Notes gera 10-30 cards (não 100 Bloom-calibrado)
- "Learn Mode" tem pseudo-SRS — não FSRS canônico
- Fonte: [acquisition news](https://www.edtechinnovationhub.com/news/quizlet-acquires-note-taking-app-coconote-launches-new-ai-powered-learning-experience)

---

## 4. Os 7 gaps que a FFV preenche (com defensabilidade)

| # | Gap | Evidência | Defensabilidade |
|---|-----|-----------|-----------------|
| 1 | **"100 questões calibradas por Bloom" não existe** | StudyFetch cap 20Q. Conker cap 10Q free. Quizlet 10-30. Questgen permite Bloom mas **um nível por vez**. | **ALTA** — produto opinionado contra-cultura |
| 2 | **SRS real (SM-2/FSRS) + AI quiz gen no mesmo loop** | Anki/Mochi/RemNote têm SRS, não geram. Quizlet/Knowt/NotebookLM geram, SRS é fake. RemNote tem ambos mas é nicho power-user pago. | **ALTA** — engenharia + research |
| 3 | **PT-BR nativo com pedagogia séria + gratuito** | NotebookLM tem PT-BR mas é RAG genérico. Stoodi/Descomplica/QConcursos são pagos e não fazem upload-to-AI. | **MÉDIA** — Google pode localizar. Diferenciador é localização cultural (ENEM/CESPE/FGV). |
| 4 | **Bundle "ingest → 100Q simulado → SRS calendar" em UX único** | Hoje aluno mistura NotebookLM + Quizlet + Anki. Quizlet+Coconote tá perto, não fecha loop. | **MÉDIA** — UX, não tech única |
| 5 | **Gamificação pedagogicamente honesta + grátis** | Quizlet tem games pay-walled. Anki/Mochi/RemNote zero gamificação. NotebookLM zero. | **MÉDIA-BAIXA** — fácil copiar isolado, único em combinação |
| 6 | **Calibração de dificuldade via Bloom + FSRS** | Nenhum mapeia "acerta 95% Lembrar, 40% Aplicar → próxima sessão prioriza Aplicar+Analisar". | **ALTA** — modelo de proficiência + dados |
| 7 | **Conteúdo profissional BR (concurso/ENEM/OAB/residência) com upload-to-AI** | QConcursos/Stoodi não fazem upload. Combinar UGC ingest + estilo CESPE/FGV/Vunesp é gap real. | **ALTA** — vertical knowledge + idioma + comportamento BR |

**Estratégia:** focar nos gaps 1, 2, 7 (alta defensabilidade). Gaps 4, 5 são consequência de execução boa. Gaps 3, 6 são bônus.

---

## 5. SWOT

### S — Strengths (forças internas)

1. **Fernando é fullstack sênior solo** com velocidade altíssima (~216 commits/30d em mai/2026). Pode buildar 80% de um vertical AI study tool sozinho.
2. **Infra já pronta**: Next.js 16 + Go 1.25 + Postgres + Redis + R2 + Docker em VPS. Custo R$250/mês sustenta milhares de users.
3. **SRS SM-2 já implementado** com tracking real (ease factor, interval, repetitions) — diferente dos "pseudo-SRS" dos concorrentes.
4. **PT-BR nativo** + cultura BR (Fernando vive ENEM/CESPE/concurso).
5. **Currículo curado (157 módulos)** funciona como prova social e seed SEO.
6. **Pedagogia embutida real** — `SKILL_ADVISOR.md` + `TEACHING_METHOD.md` ancoram em research empírico (Karpicke, Bjork, Bloom).

### W — Weaknesses (fraquezas internas)

1. **Solo founder.** Bottleneck humano em tudo. Burnout = risco crítico.
2. **Zero distribuição.** Audiência ~0. Sem tração validada.
3. **Atraso de mercado** — NotebookLM já live, Quizlet+Coconote já live, ChatGPT Study Mode já live. FFV chega depois.
4. **Unit economics quebrados.** 100Q por upload custa $0.10-0.30 em LLM. A 10K users × 1 upload/sem = $40-120K/mês em inferência. Sem revenue, queima.
5. **Pipeline de ingestão não existe ainda** — OCR, transcrição, Vision são features pra construir.
6. **Sem nome forte no espaço.** FFV ≠ Anki, NotebookLM. Construir marca exige tempo.
7. **Currículo curado consome horas** — distrai do pivot.
8. **Falta validação com aluno real** — métodos pedagógicos são hipóteses até medir retenção.

### O — Opportunities (externas)

1. **Janela pré-consolidação.** $183M funding em 12m, sem unicorn no nicho. 12-18 meses pra cravar posição antes de OpenAI/Google fecharem o espaço.
2. **PT-BR + cultura BR** é gap real. Big tech não localiza por padrão; Brazilian-first é defensável 24-36 meses.
3. **Concurso público BR** é mercado gigante mal-atendido (300K+ concurseiros ativos por ano). QConcursos/Stoodi não fazem upload-to-AI.
4. **ENEM/vestibular** — 4M+ inscritos/ano. Hoje preparação = videoaula + lista. AI study tool BR-first preenche vazio.
5. **Devs BR aprendendo AI/AWS** (já é o nicho histórico FFV) — 1M+ devs BR, mercado dolarizado paga $10-15/mês.
6. **OAB/residência médica/CRP** — mercados verticais profissionais que pagam.
7. **Big tech indiferente ao BR** — Anthropic/OpenAI focam EN-college. NotebookLM é multi-idioma mas genérico.
8. **Public building** — Fernando como case study amplifica audiência sem custo.

### T — Threats (externas)

1. **NotebookLM lança SRS sério** (probabilidade ALTA, 6-12 meses). FFV perde gap #2 contra produto grátis com brand + distribuição Google Classroom.
2. **ChatGPT Study Mode adiciona structured assessment com Bloom** (probabilidade MÉDIA-ALTA). 800M MAU comoditiza tudo.
3. **Gemini for Education + Classroom comoditiza no BR** (probabilidade ALTA). 10M+ Classroom BR. Se MEC adotar, default = Google grátis.
4. **Quizlet integra Coconote completamente + lança 100Q Bloom + FSRS real** (probabilidade MÉDIA). 60M MAU.
5. **Anthropic Claude for Education vai vertical no BR** (probabilidade MÉDIA). Gates Foundation $200M + Harvard FAS já trocou ChatGPT Edu por Claude (abr/2026).
6. **Unit economics inviável** — 100Q por upload é caro. Sem revenue, FFV queima.
7. **QConcursos/Stoodi/Descomplica integram upload-to-AI** (probabilidade BAIXA-MÉDIA). Capital e canal já têm.
8. **Burnout do Fernando** (probabilidade ALTA se não disciplinar horário). Solo founder = fragilidade.
9. **Comoditização AI** — modelos baratos como Gemini Flash / Haiku reduzem barreira de entrada. Qualquer dev pode buildar concorrente em 3 meses.

### Quadrante SWOT cruzado (ações estratégicas)

|  | **Oportunidades** | **Ameaças** |
|---|---|---|
| **Forças** | **(SO — atacar)** Lançar FFV upload + 100Q + SRS em 60d pegando janela pré-consolidação. Mira BR concurseiro/dev. | **(ST — defender)** Cravar PT-BR + verticais BR antes do NotebookLM SRS chegar. Public building como marketing barato. |
| **Fraquezas** | **(WO — reforçar)** Monetizar mínimo viável ($5-9/mês) pra cobrir LLM. Foco em UM vertical (concurso ou dev) por 6 meses. | **(WT — sobreviver)** Disciplina de Fernando (horário, deload semanal). Não competir com OpenAI em recursos — competir em foco. |

---

## 6. Estratégia de entrada — 3 frentes (escolher 1 nos primeiros 6 meses)

A FFV precisa de UM nicho-cunha pra rachar o mercado. As 3 opções:

### Opção A — Devs BR (continuidade do FFV original)

- **Tamanho:** ~1M devs BR, ~300K em jornada de IA/AWS
- **Pain:** conteúdo dev em PT-BR é raso, fontes profundas em EN
- **Por que ataca:** Fernando é dev sênior, identidade da FFV já está aqui
- **Pricing aceitável:** $10-15/mês (público dolarizado de tech)
- **Risco:** vertical pequeno, growth devagar

### Opção B — Concurseiros BR

- **Tamanho:** ~300K concurseiros ativos por ano + 1M passivos
- **Pain:** PDF de edital + lista de questões curadas — sem ingestão AI
- **Concorrência:** QConcursos, Flashcards Concursos (sem upload-to-AI sério)
- **Pricing aceitável:** R$30-80/mês (público acostumado a pagar Estratégia/Gran Cursos)
- **Risco:** baixa retenção pós-aprovação; conteúdo varia por banca

### Opção C — Estudantes ENEM/vestibular

- **Tamanho:** 4M+ inscritos/ano
- **Pain:** preparação cara + videoaula passiva
- **Concorrência:** Stoodi, Descomplica, AlfaCon (todos pagos, sem upload-to-AI)
- **Pricing aceitável:** R$20-50/mês (público estudante, sensível)
- **Risco:** sazonalidade brutal (out-nov pico, dez-mar quase zero)

> **Recomendação do advisor:** **Opção A (Devs BR) por 90 dias** pra validar pipeline + sinal de pagamento com público técnico tolerante. Em paralelo, fazer 1 piloto de Opção B (concurseiros) com 50 usuários reais. Decisão entre B e C ao final do mês 3 baseado em quem converte melhor.

---

## 7. Plano executivo 90 dias (BSC)

### Mês 1 — Validar pipeline + UM público

| Pilar BSC | Meta | Resultado mensurável |
|-----------|------|-----------------------|
| **Aprendizado** | Pipeline v1.0: PDF + texto → 100Q + SRS rodando | 50 PDFs reais processados sem erro grave |
| **Cliente** | 20 entrevistas: 10 devs BR + 10 concurseiros | Validar JTBD + willingness to pay |
| **Processos** | Validador automático (segundo modelo) reduz erro de gabarito | <5% erro de gabarito em sample auditado |
| **Financeira** | Custo médio LLM por upload: <$0.15 | Monitor real, não estimado |

**Entregáveis:**
- [ ] `/upload` endpoint funcional (PDF + texto)
- [ ] Pipeline gerando 100Q calibrado por Bloom
- [ ] Cards SRS criados automaticamente, integrados ao SM-2 existente
- [ ] Página `/modulo/[id]` mostrando módulo gerado
- [ ] Simulado dos 100 itens cronometrado
- [ ] Métricas internas (custo por upload, tempo, qualidade)

### Mês 2 — Monetização mínima viável

| Pilar BSC | Meta | Resultado mensurável |
|-----------|------|-----------------------|
| **Financeira** | Lançar **FFV Pro** $7/mês com Stripe | 10 pagantes ($70 MRR) |
| **Cliente** | Onboarding em <3min até primeiro módulo gerado | Funnel medido |
| **Processos** | Suporte a imagem (OCR) + link web | 30% dos uploads são não-PDF |
| **Aprendizado** | NPS pedagógico ≥60 do primeiro grupo | Pesquisa pós-3-módulos |

**Feature gating sugerido:**
- **Free:** 5 uploads/mês, até 30 páginas/upload, marca d'água "feito com FFV"
- **Pro $7/mo:** ilimitado, sem marca, prioridade no processamento, export Anki

### Mês 3 — Tração + sistema

| Pilar BSC | Meta | Resultado mensurável |
|-----------|------|-----------------------|
| **Financeira** | 100 pagantes ($700 MRR) | Stripe dashboard |
| **Cliente** | D30 retention ≥25% | Cohort analysis |
| **Processos** | Áudio + YouTube + vídeo suportados | 50% uploads multimídia |
| **Aprendizado** | Primeiro caso público "aprendi X com FFV" | 3+ testimonials gravados |

**Distribuição (70% do tempo Fernando neste mês):**
- 1 tweet/dia (X tech BR), build in public
- 1 post/semana Tabnews + IndieHackers BR
- 4 artigos SEO/semana (long-tail PT-BR — "como estudar pra concurso da Caixa")
- 1 piloto em comunidade BR (concurso ou dev) com 20-50 alpha users
- Lançamento Product Hunt planejado pra fim do mês

---

## 8. Métricas-norte (5 KPIs)

Tudo que não mexer em 1 desses 5 = deletar.

1. **Upload → módulo completo** — % de uploads que viram módulo entregue. **Alvo: >95%**.
2. **Time-to-value (TTV)** — minutos do signup até primeiro módulo gerado. **Alvo: <5 min**.
3. **D30 retention** — % que volta após 30 dias. **Alvo: >25%**.
4. **Free→Pro conversion** — sinal de valor real. **Alvo: >3%** (EdTech média = 2.6%).
5. **Custo LLM por upload** — unit economics. **Alvo: <$0.15** (sustentável até 100K MAU sem revenue, depois precisa monetização).

Métrica pedagógica complementar (em `TEACHING_METHOD.md §9`):
- **Acerto médio 1º simulado** = 50-65% (calibração).
- **Retenção em 30 dias** dos cards do módulo = >70%.

---

## 9. Ações dos próximos 14 dias

Concreto, mensurável. Em sequência:

- [ ] **Dia 1-2:** Atualizar landing (`/`) com novo pitch ("Suba qualquer conteúdo..."). Tirar referência a "8 bases" do hero.
- [ ] **Dia 3-5:** Endpoint `POST /upload` aceitando PDF/texto. Salvar em R2.
- [ ] **Dia 5-7:** Pipeline ingestão → análise → estruturação (sem 100Q ainda). Output: resumo + mapa + glossário.
- [ ] **Dia 8-10:** Gerador de 100Q calibrado Bloom (com validador automático).
- [ ] **Dia 10-12:** Cards SRS criados automaticamente, integrados ao SM-2 existente.
- [ ] **Dia 12-14:** Página `/modulo/[id]` exibindo módulo. Simulado funcional.
- [ ] **Dia 14:** Demo público com 5 PDFs reais (postar no X + Tabnews). Coletar feedback.

---

## 10. Princípios de decisão (quando bater dúvida, voltar aqui)

1. **Foco mata distribuição. Distribuição mata excelência.** (Patrick McKenzie) — não adicionar features novas sem distribuir o que já tem.
2. **100Q sempre.** Não negocia. Se conteúdo for pequeno, recusa.
3. **PT-BR > traduzir conteúdo EN.** Cultura BR é o moat.
4. **Métodos pedagógicos > UX bonito.** Se feature engaja sem aumentar retenção, não entra.
5. **Solo founder não compete em recursos** — compete em foco e velocidade.
6. **Construir pra MRR mínimo viável.** $1K MRR > 100K MAU sem revenue.
7. **Preço valida, não monetiza.** Cobrar $7 é sinal de mercado, não captura.

---

## 11. Histórico de revisões

- **2026-05-26 · v2.0** — Pivot pra user-generated learning. Reescrita completa com SWOT + 7 gaps + research de 65 fontes. Estratégia de entrada agora explicita 3 frentes (Dev BR / Concurso / ENEM) com recomendação A.
- **2026-05-26 · v1.0** — Versão consolidada de 5 docs antigos (MARKET_ANALYSIS, MARKET_REFRESH, COMPETITIVE_ANALYSIS, MARKET_ACTION_PLAN, EXECUTIVE_PLAN).

---

## 12. Fontes principais (65 URLs catalogadas em `/tmp/ffv_market_research.md`)

### NotebookLM
- [Google: Quizzes & flashcards no NotebookLM](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-app-quizzes-flashcards/)
- [Workspace Updates: customização (mar/2026)](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html)
- [NotebookLM PT-BR (estudantes)](https://notebooklm.google/students?hl=pt-BR)

### Quizlet + Coconote
- [Acquisition news (fev/2026)](https://www.edtechinnovationhub.com/news/quizlet-acquires-note-taking-app-coconote-launches-new-ai-powered-learning-experience)
- [Quizlet PR newsroom](https://www.prnewswire.com/news-releases/quizlet-supercharges-studying-with-new-product-innovations-and-strategic-acquisition-302679622.html)

### ChatGPT Study Mode + Claude for Education
- [OpenAI: ChatGPT Study Mode](https://openai.com/index/chatgpt-study-mode/)
- [Anthropic: Claude for Education](https://www.anthropic.com/news/introducing-claude-for-education)
- [Harvard FAS troca por Claude (abr/2026)](https://www.thecrimson.com/article/2026/4/28/fas-anthropic-claude/)

### Concorrentes diretos
- [StudyFetch (cap 20Q)](https://www.toolsforhumans.ai/ai-tools/study-fetch)
- [Mindgrasp pricing](https://www.mindgrasp.ai/pricing)
- [Knowt "SRS é fake" review](https://flashcardbuddy.com/knowt-alternative)
- [Conker (cap 10Q free)](https://www.conker.ai/quiz-maker-for-teachers)

### SRS ecosystem
- [Spaced repetition apps 2026](https://www.mindomax.com/best-spaced-repetition-apps-2026-anki-alternatives)
- [FSRS algorithm explainer (RemNote)](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm)

### Mercado
- [AI Education Tools market — Intel](https://www.intelmarketresearch.com/ai-education-tools-market-41184)
- [Brazil EdTech — IMARC](https://www.imarcgroup.com/brazil-edtech-market)
- [Brazil AI market — Grand View](https://www.grandviewresearch.com/horizon/outlook/artificial-intelligence-market/brazil)
- [Funding 2025-2026 — NewMarket Pitch](https://newmarketpitch.com/blogs/news/ai-education-funding-analysis)

### Comportamento estudantes
- [86% estudantes usam AI — Programs.com](https://programs.com/resources/students-using-ai/)
- [Gallup: AI routine em colleges](https://news.gallup.com/poll/704090/routine-college-students-despite-campus-limits.aspx)

### Brasil
- [Stoodi](https://stoodi.com.br/) · [Descomplica](https://descomplica.com.br/) · [QConcursos](https://www.picodi.com/br/qconcursos) · [Flashcards Concursos](https://www.flashcardsconcursos.com.br/portal/)

### Bloom's Taxonomy + AI
- [Questgen — gerador por nível Bloom](https://www.questgen.ai/ai-blooms-taxonomy-quiz-generator)
- [Quizizz AI Higher Order Thinking](https://quizizz.com/quizizz-ai/higher-order-thinking-question-generator)

> Catálogo completo (65 URLs) em `/tmp/ffv_market_research.md` — copie pro repo se precisar persistir.

---

**Versão:** 2.0 (mai/2026)
**Mantenedor:** Fernando + Claude (advisor)
**Próxima revisão:** após Mês 1 do plano executivo (jun/2026)
