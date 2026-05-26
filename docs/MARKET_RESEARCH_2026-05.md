# FFV Market Research — 2026-05-26

Modelo FFV proposto: aluno envia PDF/imagem/áudio/vídeo/link → plataforma extrai texto (OCR/transcrição) → estrutura pedagógica → **gera SEMPRE 100 questões distribuídas por Bloom (20 Lembrar, 30 Entender, 25 Aplicar, 15 Analisar, 7 Avaliar, 3 Criar)** → cards SRS (SM-2/FSRS). 100% gratuito, PT-BR.

---

## A. CONCORRENTES (16 players)

### Tabela resumo

| # | Player | Preço (USD) | Idioma | Inputs | Outputs | SRS real? | Qtd Q por upload | Diferencial |
|---|--------|-------------|--------|--------|---------|-----------|------------------|-------------|
| 1 | **NotebookLM** (Google) | Free / Plus $7.99 / Pro $19.99 / Ultra $99.99-200 | 80+ idiomas (PT-BR sim) | PDF, doc, áudio, vídeo, link, YouTube, Google Drive | Resumo, mind map, audio/video overview, flashcards, quizzes, infográficos, relatórios, slides | NÃO (flashcards sem agendamento SRS — só "Got it/Missed it" + shuffle) | Customizável, sem cap de 100 | "Grounded in your sources" — RAG sobre uploads do usuário |
| 2 | **Quizlet + Coconote** | Free (heavily restricted) / Plus $35.99/yr ou $7.99/mo | Multi (PT existe mas fraco) | Notes, áudio/vídeo (via Coconote, fev/2026) | Flashcards, Learn Mode, Q-Chat (Socratic), quizzes | Tem "Learn Mode" (não é SRS canônico) | ~10-30 cards | Maior base instalada (60M MAU); UGC marketplace |
| 3 | **StudyFetch** | Free (10 chats, 1 set) / Base $7.99 / Premium $11.99 | EN (PT limitado) | PDF, PPT, vídeo, YouTube, áudio, foto handwritten | Flashcards, quizzes, summaries, Spark.E tutor, Arcade games, LiveLecture | NÃO (quiz único, sem agendamento) | **Cap em 20 questões/quiz** | Tutor Spark.E grounded; voice-to-voice (beta) |
| 4 | **Mindgrasp AI** | Free trial 4d / Basic $5.99-9.99 / Scholar $8.99 / Premium $14.99 | 30+ idiomas | PDF, vídeo (incl. live recording), site, áudio | Notes, summaries, flashcards, quizzes, AI tutor | NÃO | Ilimitado mas sem distribuição Bloom | Live recording 10h/mo Premium; integração Canvas/Blackboard |
| 5 | **Knowt** | Free (generoso) / Plus $9.99/mo ou $59.99/yr | Multi (EN dominante) | PDF, notes texto, links | Flashcards, AI summaries, quiz, Kai chat (Ultra) | Diz "spaced repetition" mas **NÃO é SRS real** — sem ease factor, sem interval tracking | Ilimitado free | "Quizlet alternative grátis"; Snap & Solve (Ultra) |
| 6 | **Wisdolia** | Free trial / Plans não públicos | EN | Artigo web, PDF, YouTube (Chrome ext) | Flashcards | NÃO (gera, depois você exporta pra Anki) | ~10-15 cards | Chrome extension generativa one-click |
| 7 | **Quizgecko** | Student $16/mo ou $64/yr / Educator $20/mo ou $79/yr | Multi | PDF, texto, link | MCQ, T/F, short answer, fill-blank, flashcards | NÃO | Configurável mas pago | Foco em educator/B2B |
| 8 | **ChatPDF** | Free (2 PDFs/dia, 50 Q/dia, 120 pg) / Plus $19.99/mo | Multi | PDF only | Chat conversacional, summary | NÃO (não gera quiz) | N/A — é chat | Pioneiro "chat com PDF" |
| 9 | **Humata.ai** | Free 60 pg/mo / Student $1.99 / Expert $9.99 / Team $99 | EN | PDF, doc | Q&A, summary, citations | NÃO | N/A — chat | Citation-backed answers; B2B research |
| 10 | **PDF.ai** | Free limitado / paid ~$15/mo | EN | PDF | Chat, summary | NÃO | N/A | Concorrente direto ChatPDF |
| 11 | **Conker** | Free (5 quizzes, 10Q cada) / pago $3.99-8/mo | EN | Texto, URL, prompt | Quizzes (MCQ, fill-blank, mixed, read-respond) | NÃO | **Cap 10 questões/quiz no free** | "Quiz maker for teachers"; 600K+ quizzes |
| 12 | **Eduaide.ai** | Free (15 gens/mo) / Pro $5.99/mo | Multi | Texto, prompt | 100+ teaching resources: lesson plans, quizzes, rubrics | NÃO | Variável | Lesson dev tool pra teachers (B2B) |
| 13 | **Revisely** | Free (3 quizzes) / Premium $3.99-8.99/mo | Multi | PDF, notes | Flashcards, notes, quizzes | NÃO | Pequeno cap free | Student-oriented quiz maker UK |
| 14 | **Anki** | Free desktop+Android / iOS $24.99 one-time | Multi (PT via deck UGC) | Manual + add-ons (PDF, image-occlusion) | Flashcards | **SIM** — FSRS default desde 2024; gold standard | Manual (sem gerador AI nativo) | OG SRS; FSRS ML-trained scheduler |
| 15 | **Mochi** | Free desktop / Pro $5/mo (sync) | Multi (Markdown) | Markdown + import Anki | Flashcards | **SIM** — FSRS opcional desde jun/2025 | Manual | UX moderno minimalista; Markdown+LaTeX |
| 16 | **RemNote** | Free / Pro $8/mo (Student $6) | Multi | PDF (annotation), notes, image occlusion | Notes + flashcards via bullets | **SIM** — SM-2 + FSRS beta | Manual + AI gen (Pro) | Notes ↔ flashcards integrados; knowledge graph |

### Brasil-specific

| Player | Modelo | AI features? | Posição |
|--------|--------|-------------|---------|
| **Stoodi** | Cursinho ENEM PT-BR pago | 30K+ questões curadas, video classes — sem AI gen de quiz a partir de upload | Vertical ENEM/vestibular |
| **Descomplica** | Cursinho ENEM/pós PT-BR pago | Plano estudo personalizado, mas sem upload-to-AI | Líder de marca em vestibular |
| **QConcursos** | Banco de questões concursos | Premium anual ~R$ com 30% desconto; questões curadas (não AI gen) | Líder de questões pra concursos |
| **Flashcards Concursos (FC)** | Plataforma de flashcards concursos | "IA integrada" anunciada; PDFs + video + flashcards curados | Vertical concursos |
| **Tesify** | Acadêmico PT-BR | ABNT, APA, plágio, AI writing — NÃO faz quiz/SRS | Vertical TCC/redação acadêmica |
| **Astra AI** | Tutor PT-BR | AI tutor passo a passo — sem 100Q nem SRS | Tutor Q&A |

### Detalhamento dos 3 mais ameaçadores

**NotebookLM (Google)** — referência absoluta do espaço. 80+ idiomas incl. PT-BR. Free tier MUITO generoso (100 notebooks, 50 sources/notebook, 50 chats/dia). Flashcards/quizzes lançados set/2025 com progresso salvo entre sessões e "Got it/Missed it". Lançou em out/2025 no Google Classroom (estudantes 18+). Ameaça letal porque é **grátis para estudantes via conta Google**, integra com YouTube/Drive nativo, e tem força de marca + distribuição. **NÃO TEM SRS de verdade** — flashcards são deck estático com shuffle, sem ease factor, sem agendamento.

**Quizlet + Coconote (fev/2026)** — comprou Coconote em 5/fev/2026 (valor não divulgado). Agora ingere áudio/vídeo de aula → notes → flashcards. 60M MAU. 2/3 dos high schoolers e 1/2 dos college nos EUA usam. Free tier muito restritivo em 2026 (Learn Mode cortado após poucas rounds). Plus $35.99/yr. Magic Notes gera ~10-30 cards por upload — **não 100 por Bloom**.

**ChatGPT Study Mode (OpenAI)** — lançado jul/2025 para Free/Plus/Pro/Team + ChatGPT Edu. Socratic questioning, scaffolded responses, system instructions desenvolvidas com 40+ instituições. Roadmap: goal tracking, progress, deeper personalization. **Ameaça existencial**: se OpenAI adicionar "gera 100 Q por Bloom + SRS calendar" como feature, comoditiza tudo.

---

## B. TENDÊNCIAS DE MERCADO 2026

### Market sizing

| Segmento | 2025 | 2026 | Projeção | CAGR |
|----------|------|------|----------|------|
| AI Education Tools global | $3.45B | $4.20B | $17.84B em 2034 | **19.8%** |
| AI in Education global | $5.88B (2024) | — | $32.27B em 2030 | **31.2%** |
| EdTech global | $189B (2025) | $214B | — | ~13% |
| Brazil AI (broader) | $17.8B | — | — | **23%** (2026-2033) |
| Brazil Generative AI | $140.6M | — | — | **36.2%** (2026-2033) |

### Funding 2025-2026

- **Speak** (AI language tutor, OpenAI-backed): Series C $78M @ $1B (dez/2024). Total $162M. Acessou Sudeste Asiático + Europa em 2025.
- **AI in education (geral)**: $183.6M em 21 deals entre mai/2025-abr/2026. Mediana $6.8M — espaço ainda **pré-consolidação**, sem ronda >$50M.
- **EdTech total 2025**: $4.09B, +23% YoY. 31% foi pra startups AI-leveraged.
- **Language learning**: vertical campeã. Preply + Speak + ELSA + Praktika + Univerbal + Blue Canoe = **$400M+ combinado**.
- **Teacher-facing tools**: MagicSchool, Brisk, Curipod, Chalkie = **$90M+ combinado**.

### Big Tech entrando direto

- **OpenAI Study Mode** — jul/2025. Socratic. Free tier inclui.
- **Anthropic Claude for Education** — Learning Mode "asks questions, not answers". Acordos campus inteiro: Northeastern, LSE, Champlain, USF, Dartmouth, Syracuse, UVA, Pittsburgh. **Harvard FAS substituindo ChatGPT Edu por Claude em abr/2026**. Acordo $200M Gates Foundation. Parceria CodePath (maior CS program EUA).
- **Google Gemini for Education** — BETT 2026: Guided Learning Mode, Gemini Canvas com practice quizzes/study guides/flashcards. **Integração NotebookLM dentro do Google Classroom** (estudantes 18+). Practice SAT grátis via Princeton Review. Disponível em **todos os idiomas suportados pelo Classroom** (abr/2026).

### Comportamento de uso (estudantes)

- **86%** dos estudantes globais usam AI pra estudos
- **82%** college / 58% high school nos EUA já usaram AI
- **57%** college EUA usam IA semanal ou mais; **20%** uso diário
- **66%** dos estudantes usam ChatGPT como primary AI tool
- **69%** admitem usar ChatGPT para homework
- **67%** concordam que IA ajuda a estudar mais eficientemente
- Brasil: **5.57%** do tráfego global ChatGPT; Latam total 5.7%

### Pedagogia + Bloom

Mercado de "AI quiz generator com Bloom's Taxonomy" existe mas é **fragmentado e teacher-facing**: Questgen, TurinQ, Quizizz AI Toolkit. Todos permitem **selecionar UM nível** de Bloom por geração. **Nenhum entrega distribuição calibrada de 100Q por upload com mix Bloom predefinido como produto principal**.

---

## C. GAPS QUE FFV PODE PREENCHER

### Gap 1 — "100 questões calibradas por Bloom" não existe como produto
**Evidência**: StudyFetch cap 20 Q/quiz ([source](https://www.toolsforhumans.ai/ai-tools/study-fetch)). Conker cap 10 Q/quiz free ([source](https://www.conker.ai/quiz-maker-for-teachers)). Quizlet Magic Notes gera 10-30 cards. NotebookLM permite customizar mas não força distribuição Bloom. Questgen permite gerar por nível de Bloom mas só **um nível por vez** — não há produto que entregue "20+30+25+15+7+3 = 100" calibrado e simulável como prova.
**Defensabilidade**: ALTA — é um produto opinionado com pedagogia embutida. Concorrentes evitam essa rigidez por filosofia ("customizável é melhor").

### Gap 2 — SRS real (SM-2/FSRS) acoplado a quiz generator AI
**Evidência**: Anki/Mochi/RemNote têm FSRS sério mas **não geram quiz/cards a partir de upload AI**. Quizlet/Knowt/NotebookLM **geram cards mas o "spaced repetition" é fake** ([Knowt review](https://flashcardbuddy.com/knowt-alternative): "no per-card interval tracking, no ease factor, no memory decay modeling"). RemNote tem ambos mas precisa Pro $8/mo e UX é nicho power-user.
**Defensabilidade**: ALTA — implementar FSRS sério + calendário de revisão exige engenharia + research. É um moat técnico.

### Gap 3 — PT-BR nativo com pedagogia séria + gratuito
**Evidência**: NotebookLM tem PT-BR mas é grounded-RAG genérico (não opinionated). Stoodi/Descomplica/QConcursos são PT-BR mas **pagos** e **não fazem upload-to-AI** ([Stoodi](https://stoodi.com.br/), [Descomplica](https://descomplica.com.br/)). Tesify é PT-BR mas vertical TCC/ABNT — não faz quiz/SRS. **Nenhum jogador PT-BR live combina: upload de qualquer conteúdo + 100Q Bloom + SRS real + grátis**.
**Defensabilidade**: MÉDIA — Google pode localizar NotebookLM a qualquer momento, e Quizlet já tem PT. Mas localização cultural (concurso público, ENEM, vestibular) é diferenciador.

### Gap 4 — Bundle "simulado 100Q + SRS + revisão" como UX único
**Evidência**: Hoje o aluno precisa: gerar resumo no NotebookLM, exportar pro Quizlet ou Anki, configurar deck, separar quiz no StudyFetch (cap 20), abrir Anki pra revisar SRS. **Nenhum concorrente entrega "loop fechado: ingest → 100Q simulado → SRS calendar"** em uma UX. Quizlet+Coconote tá perto, mas o Quizlet "Learn Mode" não é SRS canônico.
**Defensabilidade**: MÉDIA — é produto/UX, não tecnologia única. Quizlet pode chegar lá em 12-18 meses pós-Coconote.

### Gap 5 — Gamificação pedagogicamente honesta + gratuito
**Evidência**: Quizlet tem games mas pay-walled. StudyFetch tem "Arcade" mas pago ([source](https://aiquiks.com/ai-tools/studyfetch)). Anki/Mochi/RemNote têm zero gamificação. NotebookLM zero gamificação. **Gap claro**: XP/streak/leaderboard ligados a revisão SRS real + Bloom progressivo.
**Defensabilidade**: MÉDIA-BAIXA — gamificação é facilmente copiada. Mas combinar com SRS+Bloom é único.

### Gap 6 — Calibração de dificuldade individual via Bloom + FSRS
**Evidência**: Nenhum concorrente mapeia "este aluno acerta 95% no Lembrar mas 40% no Aplicar" → próxima sessão prioriza Aplicar+Analisar. ChatGPT Study Mode tem "skill calibration" mas é conversacional, não estruturado por Bloom.
**Defensabilidade**: ALTA — exige modelo de proficiência + engineering. É moat de produto + dados.

### Gap 7 — Conteúdo profissional brasileiro (concurso, ENEM, OAB, residência médica) com upload-to-AI
**Evidência**: QConcursos/Flashcards Concursos têm conteúdo curado mas **não fazem upload-to-AI**. Stoodi/Descomplica são video courses, não geradores. Estudante de concurso hoje precisa: comprar PDF do edital → resumir manualmente OR pagar curso → fazer flashcard manual no Anki. Combinar UGC ingest + curadoria de bancas BR é gap real.
**Defensabilidade**: ALTA — vertical knowledge (estilo de questão CESPE/FGV/Vunesp) + idioma + comportamento de estudo BR.

---

## D. AMEAÇAS 12-18 MESES

### Ameaça 1 — Google lança SRS sério no NotebookLM (PROBABILIDADE: ALTA)
Status atual: flashcards têm "Got it/Missed it" + shuffle ([source](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html)). Adicionar FSRS + calendário de revisão é mês de engenharia. Quando lançarem, FFV perde gap #2 contra um produto grátis com brand recognition + PT-BR + 80 idiomas.

### Ameaça 2 — ChatGPT Study Mode ganha "structured assessment" com Bloom (PROBABILIDADE: MÉDIA-ALTA)
OpenAI já anunciou roadmap: "goal setting, progress tracking, deeper personalization" ([source](https://openai.com/index/chatgpt-study-mode/)). Adicionar "gera 100Q estruturadas + revise daily" é incremental. Distribuição: 800M MAU ChatGPT em 2026.

### Ameaça 3 — Quizlet integra Coconote completamente + lança "lecture → 100 cards Bloom-calibrated" (PROBABILIDADE: MÉDIA)
Já têm 60M MAU + áudio/vídeo via Coconote + spaced repetition pseudo. Próximo passo lógico é FSRS real + Bloom calibration. Se baixarem free tier de novo (improvável dado o tightening atual), comoditizam o espaço.

### Ameaça 4 — Anthropic Claude for Education vai vertical, gratuito pra estudantes BR (PROBABILIDADE: MÉDIA)
Já tem Learning Mode + parcerias campus inteiro + Gates Foundation $200M. Se assinarem MEC ou USP/UNICAMP/UFRJ (improvável mas possível), entram com força.

### Ameaça 5 — Gemini for Education + NotebookLM dentro do Google Classroom comoditiza tudo no BR (PROBABILIDADE: ALTA)
Já live em **todas as línguas Classroom em abr/2026** ([source](https://workspaceupdates.googleblog.com/2026/04/gemini-in-google-classroom-is-now-available-in-all-Classroom-supported-languages.html)). Brasil tem 10M+ contas Classroom em escolas públicas. **Se MEC adotar Gemini for Education, FFV vira opcional num mundo onde a opção default é Google grátis**.

### Ameaça 6 — Custo de inferência: 100Q por upload é caro
Geração de 100 questões + estruturação Bloom + cards SRS por upload, mesmo com modelos baratos (Haiku/Gemini Flash), custa ~$0.10-0.30 por upload. **A 10K usuários gerando 1 upload/semana = $40K-120K/mês em LLM**. Sem revenue (produto grátis), unit economics quebra. Quizlet/Anki/NotebookLM têm subsídio (paid tiers ou Big Tech).

### Ameaça 7 — Concorrente brasileiro vertical lança upload-to-AI (PROBABILIDADE: BAIXA-MÉDIA)
QConcursos ou Stoodi pode comprar/integrar stack de geração AI e oferecer "envie seu edital → 100Q + SRS". Se acontecer, perdem-se gaps 3 e 7.

---

## E. FONTES (URLs)

### NotebookLM
1. https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-app-quizzes-flashcards/
2. https://workspaceupdates.googleblog.com/2025/09/flashcards-quizzes-reports-notebook-lm-google-education.html
3. https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html
4. https://workspaceupdates.googleblog.com/2026/04/gemini-in-google-classroom-is-now-available-in-all-Classroom-supported-languages.html
5. https://felloai.com/notebooklm-pricing/
6. https://www.abisheklakandri.com/blog/notebooklm-tiers-pricing-guide-free-plus-pro-ultra-2026
7. https://www.xda-developers.com/notebooklm-launches-new-ultra-tier-with-higher-limits/
8. https://notebooklm.google/students?hl=pt-BR

### Quizlet + Coconote
9. https://www.edtechinnovationhub.com/news/quizlet-acquires-note-taking-app-coconote-launches-new-ai-powered-learning-experience
10. https://thejournal.com/articles/2026/02/13/quizlet-adds-ai-powered-tools-for-active-practice-notetaking.aspx
11. https://www.prnewswire.com/news-releases/quizlet-supercharges-studying-with-new-product-innovations-and-strategic-acquisition-302679622.html
12. https://bibigpt.co/en/blog/posts/quizlet-coconote-ai-study-tools-2026-en

### StudyFetch, Mindgrasp, Knowt
13. https://www.toolsforhumans.ai/ai-tools/study-fetch
14. https://aiquiks.com/ai-tools/studyfetch
15. https://www.mindgrasp.ai/pricing
16. https://pitchbook.com/profiles/company/518043-25
17. https://knowt.com/
18. https://flashcardbuddy.com/knowt-alternative
19. https://aichief.com/ai-education-tools/knowt/

### Outros AI tools
20. https://www.g2.com/products/quizgecko/pricing
21. https://www.humata.ai/pricing
22. https://aisotools.com/pricing/humata-ai
23. https://www.conker.ai/quiz-maker-for-teachers
24. https://aisuggests.ai/tool/conker-ai
25. https://www.revisely.com/quiz-generator
26. https://aichief.com/ai-education-tools/revisely/
27. https://www.edcafe.ai/blog/free-ai-quiz-makers
28. https://elephas.app/blog/chatpdf-review

### SRS / Anki ecosystem
29. https://www.mindomax.com/best-spaced-repetition-apps-2026-anki-alternatives
30. https://www.mindomax.com/spaced-repetition-apps-updates-2026
31. https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm
32. https://www.deckbase.co/compare/best-flashcard-apps

### OpenAI / Anthropic / Google big tech entrada
33. https://openai.com/index/chatgpt-study-mode/
34. https://techcrunch.com/2025/07/29/openai-launches-study-mode-in-chatgpt/
35. https://www.anthropic.com/news/introducing-claude-for-education
36. https://www.anthropic.com/news/advancing-claude-for-education
37. https://www.thecrimson.com/article/2026/4/28/fas-anthropic-claude/
38. https://www.edtechinnovationhub.com/news/anthropic-puts-claude-into-education-and-workforce-programs-through-200-million-gates-foundation-deal
39. https://blog.google/products-and-platforms/products/education/bett-2026-gemini-classroom-updates/
40. https://edu.google.com/intl/ALL_us/ai/gemini-for-education/

### Market sizing / funding
41. https://www.intelmarketresearch.com/ai-education-tools-market-41184
42. https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-education-market-report
43. https://www.grandviewresearch.com/horizon/outlook/artificial-intelligence-market/brazil
44. https://www.grandviewresearch.com/horizon/outlook/generative-ai-market/brazil
45. https://newmarketpitch.com/blogs/news/ai-education-funding-analysis
46. https://newmarketpitch.com/blogs/news/edtech-funding-analysis
47. https://news.crunchbase.com/ai/language-learning-startup-unicorn-speak/
48. https://www.speak.com/blog/series-c

### Brasil / PT-BR
49. https://stoodi.com.br/
50. https://descomplica.com.br/
51. https://www.flashcardsconcursos.com.br/portal/
52. https://www.picodi.com/br/qconcursos
53. https://tesify.pt/melhores-ferramentas-ia-estudantes-2026-comparativo/
54. https://napratica.org.br/noticias/ia-e-apps-essenciais-as-ferramentas-que-mais-ajudam-voce-a-estudar-em-2026
55. https://www.techknow.com.br/post/ia-ferramentas-gratuitas-para-estudantes
56. https://exame.com/hub-faculdade-exame/notebook-lm-essa-ferramenta-de-ia-te-ajuda-a-estudar/

### Statistics / behavior
57. https://programs.com/resources/students-using-ai/
58. https://www.demandsage.com/ai-in-education-statistics/
59. https://news.gallup.com/poll/704090/routine-college-students-despite-campus-limits.aspx
60. https://nchstats.com/teens-use-chatgpt-for-homework/
61. https://www.sianamarketing.com/resources/chatgpt-usage-by-country-2026

### Bloom's Taxonomy
62. https://www.responsly.com/blog/ai-blooms-taxonomy-quiz-generator/
63. https://www.questgen.ai/ai-blooms-taxonomy-quiz-generator
64. https://quizizz.com/quizizz-ai/higher-order-thinking-question-generator
65. https://turinq.com/ai-question-generator-quiz-maker-with-bloom-taxonomy-turinq/

**Total: 65 fontes citadas, 90%+ de 2025-2026.**
