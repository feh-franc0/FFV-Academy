# EXECUTIVE PLAN — FFV Academy "Chegar Chegando" (2026-05)

> Data: 2026-05-19
> Autor: estrategia + GTM
> Janela: próximos 90 dias (lançamento V1 → tração mensurável)
> Companheiros: COMPETITIVE_ANALYSIS_2026-05.md, MARKET_ACTION_PLAN.md, LANDING_COPY_2026-05.md, ARCHITECTURE_BASES_MODULAR.md, PERSONALIZATION_PLAN.md

---

## A) STRATEGIC NORTH STAR

### North Star Metric
**"Bases entregues que atingiram >50% de conclusão de trilha em 30 dias após entrega"** — abreviado **AB30** (Active Bases @ 30d).

**Por que essa, e não outras:**
- *Por que não "bases geradas"?* Vaidade. NotebookLM gera 10M notebooks/mês — quase ninguém volta. Geração não é diferencial — entrega de aprendizado é.
- *Por que não "MAU"?* Captura uso, não valor pedagógico. Aluno que volta pra ver ranking mas não estuda não é sucesso.
- *Por que não "XP/dia"?* Engagement-proxy. Pode ser inflado por gamificação vazia.
- *Por que >50% conclusão em 30d?* É a barra acima da qual SRS de fato começa a entregar memória de longo prazo (literatura SM-2: ganho marginal de retenção dispara após ~50% dos cards passarem pela 2ª revisão). É a métrica que **separa "ferramenta usada uma vez" de "escola que funcionou"**.
- *Por que medir em 30d e não 7d?* 7d ainda é fase de novidade. 30d é o ciclo do prova/concurso brasileiro médio.

**Meta 90d:** **AB30 ≥ 35%** (de toda base entregue, mais de 1/3 ter ultrapassado 50% de conclusão em 30 dias). [hipótese: Duolingo público reporta ~25% retention 7d em cursos completos; com SRS + curadoria humana + filtro de motivação inicial via formulário, achamos plausível 35% — agressivo mas alcançável].

### OKRs 90 dias

**O1 — Provar o loop pedagógico (produto)**
- KR1: 100 bases entregues no SLA de 24h (ou 36h com upgrade transparente).
- KR2: AB30 ≥ 35% medido em coorte de bases entregues no mês 1.
- KR3: NPS ≥ 50 entre usuários com ≥3 sessões de estudo (escala -100/+100).

**O2 — Criar reputação técnica defensável (marca)**
- KR1: 3 peças de conteúdo "Trojan horse" publicadas (1 thread comparativa auditável, 1 case clínico documentado, 1 demo pública do /admin) — somando ≥50k impressões orgânicas.
- KR2: Aparição em 2 newsletters técnicas BR (TechTudo, MIT Tech Review BR, Café Brasil, ou similar). [hipótese: contato via cold outreach + 1 piece viral suficiente].
- KR3: Volume de busca por "FFV Academy" ≥ 500 buscas/mês no Google (medido via GSC + Ahrefs free tier).

**O3 — Estabilizar economia unitária pré-monetização**
- KR1: Custo médio por base entregue ≤ R$ 8 (LLM + storage + curadoria humana).
- KR2: Pipeline operacional de curadoria com ≥2 revisores onboarded, throughput ≥ 20 bases/dia steady.
- KR3: Cap de 1 base/mês/free user implementado e respeitado por 95% dos pedidos.

### Anti-objetivo
**NÃO perseguimos volume de signups soltos** (newsletter, "leads frios" via paid ads). Tração rasa polui métrica de retenção e queima caixa de curadoria. Cada signup precisa vir com material enviado (intenção real) — preferimos 200 alunos engajados a 20.000 emails inertes.

---

## B) ICP RANKEADO POR ESTÁGIO DE TRAÇÃO

### Persona 1 — Marina, 22, estudante de Medicina Veterinária (P5/P10) — *ICP primário*

**Demografia + psicografia:** 22 anos, 5º período de MedVet em UF/UFV/USP/UNESP, renda familiar 4-10 sal. mín., mora com pais ou república. Estuda 4-6h/dia, dorme tarde, vive com 8 abas abertas. Usa Notion pra organizar matéria, Anki pra revisar farmacologia/parasitologia/genética. Identifica-se como "pessoa de Anki". Frustra-se porque montar deck Anki bom toma 3h por matéria — tempo que ela não tem. Dor latente: **prova final em 3 semanas, 600 slides do professor, 4 livros recomendados, 0 estrutura**.

**Onde está hoje:** Anki (decks de colegas, baixa qualidade), grupo de WhatsApp da turma (resumos de PDF que circulam), Stoodi (vestibular, não serve mais), YouTube (canais de Med Vet específicos), ChatGPT (pergunta solta).

**Job-to-be-done:** *"Quando tenho prova grande em 3 semanas, quero transformar o material caótico do professor em um plano de estudo diário com revisão garantida, para chegar na prova lembrando — sem gastar 3 dias montando deck Anki."*

**Gatilho de troca pra FFV:** semana de provas finais (junho-julho, novembro-dezembro). Indicação de colega que já usou. Vê thread comparativa "FFV vs NotebookLM" no Twitter/Instagram.

**Canal mais barato de aquisição:** Instagram orgânico via páginas de MedVet (@vetmed_oficial, @medvetestuda, @medvetfacil — 50-500k seguidores). Custo: troca por conteúdo (não dinheiro). [hipótese: 1 reel comparativo NotebookLM vs FFV em página de 100k seguidores = ~50 signups qualificados, vs ~R$5k em paid Meta pra mesmo resultado].

---

### Persona 2 — Rodrigo, 28, dev pleno transitando pra IA — *ICP de validação técnica*

**Demografia + psicografia:** 28 anos, dev backend Java/Node 4 anos de experiência, renda R$8-15k, mora sozinho em SP/POA/Floripa. CLT em empresa "tradicional" (banco, varejo) querendo entrar em startup de IA ou freelas internacionais. Estuda em pomodoros à noite, assina Brilliant em inglês e abandona, tem GitHub com 12 repos pessoais. Não confia em curso pago de "vire engenheiro de IA". Lê Hacker News, Lobste.rs, Filipe Deschamps. Dor: **sabe que IA é o futuro, mas não tem tempo nem paciência pra cursos genéricos — precisa de profundidade real (transformers, RAG, evals) sem hype**.

**Onde está hoje:** ChatGPT/Claude (pergunta solta), papers no arxiv (não termina), Karpathy no YouTube (assiste e esquece), Brilliant ($25/mês, abandonado), bootcamps brasileiros (despreza).

**Job-to-be-done:** *"Quando decido transitar pra engenheiro de IA, quero uma trilha sequencial de profundidade real em PT-BR que me leve de RAG básico a evals/LLMOps, com exercícios práticos e revisão, sem ter que orquestrar 12 papers e 4 cursos sozinho."*

**Gatilho de troca pra FFV:** colega trocou de empresa pra startup de IA. Demissão em massa no banco. Vê post no LinkedIn de engenheiro brasileiro mostrando devcard FFV com badges de "Especialista em RAG".

**Canal mais barato de aquisição:** GitHub (README de projetos open-source com link), LinkedIn (artigos técnicos com devcard compartilhável), Twitter BR técnico (@filipedeschamps, @akitaonrails — engagement orgânico via thread comparativa). Custo: R$0 se devcard viralizar. [hipótese: 5% dos visitantes que recebem base de tech compartilham devcard no LinkedIn — geram 5-15 leads cada via 1st degree].

---

### Persona 3 — Camila, 34, OAB 2ª fase ou concurseira tribunais — *ICP de monetização futura*

**Demografia + psicografia:** 34 anos, formada em Direito há 4 anos, trabalha como advogada júnior em escritório ou setor público, renda R$4-8k. Casada, sem filhos ou com 1 filho pequeno. Tentou OAB 1x (reprovou na 2ª fase) ou prepara concurso TJ/MPU. Estuda 2-3h por noite + 8h sábado. Hoje gasta R$200-400/mês em Gran Cursos / Estratégia Concursos / CERS — mas vê metade dos vídeos em 2x e esquece. Dor: **volume gigantesco de matéria, jurisprudência muda, retenção zero, sem feedback sobre o que sabe ou não sabe**.

**Onde está hoje:** Gran Cursos / Estratégia Concursos (assinatura ~R$300/mês), YouTube (canais de concurso), PDFs piratas do Telegram, Notion (resumos manuais), Concursa.ai (testado, achou raso).

**Job-to-be-done:** *"Quando preparo OAB 2ª fase ou concurso, quero saber objetivamente o que já domino, o que esqueci, e receber só o que importa estudar hoje — sem assistir 6h de vídeo por dia."*

**Gatilho de troca pra FFV:** reprovação anterior, prova marcada em 90-120 dias. Indicação de colega de cursinho. Post em grupo de concurseiro com print de base FFV de OAB com tabela "tópicos dominados vs não dominados".

**Canal mais barato de aquisição:** grupos de Telegram/WhatsApp de concurseiros (500-3000 membros), parceria com 1-2 influenciadores de concurso (custo R$500-2k por menção honesta), SEO de termos "OAB 2ª fase plano de estudo" e "TJ-SP edital plano". [hipótese: SEO de cauda longa em concurso é barato e converte — Estratégia Concursos dominou década passada por isso].

---

**Ranking de prioridade GTM:**
1. **Marina (MedVet)** — primeiro ICP a atacar. Base MedVet já está no ar, ciclo de prova rápido (8 semanas), comunidade engajada e endogâmica, ROI viral altíssimo.
2. **Rodrigo (Dev IA)** — segundo. Base tech tem 157 módulos prontos. Crescimento via GitHub/LinkedIn é barato. Vira evangelista técnico se entregamos profundidade.
3. **Camila (Concurseira)** — terceiro. Maior LTV potencial (mercado paga R$300/mês hoje), mas exige base de OAB/concurso ainda inexistente — entra na fila quando V1 estiver provada com 1 e 2.

---

## C) PLAYBOOK DE LANÇAMENTO "CHEGAR CHEGANDO" — 60 DIAS

### Três alavancas de tração (com COMO + R$ + CAC)

#### Alavanca 1 — "Embaixadora da MedVet" (parcerias orgânicas com micro-influencers)
- **Como:** identificar 15 contas Instagram de MedVet entre 20k-200k seguidores via Hypeauditor free / busca manual. Oferecer **base gratuita personalizada do material da prova final delas** em troca de 1 stories honesto + 1 reel comparativo. Não pedir post promocional — pedir uso real e documentação. Selecionar 8 que toparem.
- **Custo estimado:** R$ 0 em mídia. ~R$ 2.500 em tempo de curadoria humana extra (8 bases premium ×R$300/base de custo de curadoria sênior).
- **CAC esperado:** R$ 2.500 / 400 leads qualificados esperados (8 contas × 50 conversões/conta média BR para "tente isso grátis" = 400 [hipótese baseada em conversão típica de 0.3-0.8% de seguidores em CTA orgânico])  → **R$ 6 por lead qualificado**.
- **Risco:** influencer ruim entrega base má-iluminada e estrago é maior que ganho. Mitigação: contrato verbal de transparência + direito a refazer.

#### Alavanca 2 — "Trojan Comparativo Auditável" (conteúdo viral defensável)
- **Como:** publicar artigo + thread X/LinkedIn intitulado **"Submeti o mesmo PDF de Farmacologia (87 páginas) ao NotebookLM, ChatGPT, Studyfetch e FFV. Tabela auditável com 12 critérios, todos os outputs públicos."** Inclui screenshots, prompts usados, links para outputs no Drive público. Resultado honesto (FFV vence em estrutura+SRS, perde em velocidade). Convida competidores a refazerem.
- **Custo estimado:** R$ 0 (você produz). ~2 dias de trabalho.
- **CAC esperado:** [hipótese] thread comparativa honesta + auditável tem CTR 3-7% se atingir 30-50k impressões → 1.500-3.500 cliques → conv 5% → 75-175 signups. CAC efetivo: R$ 0 + custo de tempo. Se viralizar para 200k impressões (plausível em BR tech) → 1k+ signups.
- **Por que funciona:** desarma o ceticismo "lá vem mais um indie". Auditabilidade vence promoção.

#### Alavanca 3 — "SEO de cauda longa por matéria/prova" (compound, lento)
- **Como:** publicar 30 artigos no formato *"Como estudar [matéria/prova] em [N] semanas — plano gerado pela FFV"* otimizados para queries reais: "como estudar farmacologia veterinária", "plano de estudo OAB 2ª fase", "trilha de RAG para devs". Cada artigo termina com CTA "monte sua base com seu material". Reciclar conteúdo dos próprios módulos curados.
- **Custo estimado:** R$ 0 em SEO pago. ~R$ 4.000 em produção (30 artigos × R$ ~130 cada via redator técnico freelance) ou tempo próprio.
- **CAC esperado:** SEO compound começa pequeno: mês 1 ~50 visitas, mês 3 ~500, mês 6 ~3.000 — conv 1-2% → 30-60 signups/mês a partir do mês 4. **CAC long-tail < R$ 3 a partir do mês 6**. Não é alavanca pra "chegar chegando" sozinha — é a base que sustenta crescimento orgânico de 12 meses.

### Sequência de 6 ações públicas pra criar momentum (não-óbvio)

1. **Dia 0 — "Open Admin Dashboard"**: publicar `/stats-publicas` como dashboard ao vivo: bases na fila, SLA atual, AB30 corrente, custo por base. Radical: ninguém faz isso. Vira prova permanente de honestidade.
2. **Dia 3 — "Case clínico documentado":** publicar 1 base entregue completa (com permissão da Marina) com timeline (recebido às 14h, curadoria às 18h, entregue às 02h do dia seguinte) e métricas da aluna após 30 dias (cards revisados, score na prova). Formato: longread com screenshots e dados.
3. **Dia 10 — Thread "Trojan Comparativo" (Alavanca 2)**.
4. **Dia 20 — "Eu vs NotebookLM ao vivo":** live de 30min no YouTube/Twitch testando ambos com PDF da audiência. Convidar 1 dev BR conhecido (Akita, Deschamps, Rocketseat) como observador neutro. Subir cortes no TikTok/Reels.
5. **Dia 30 — Lançar `devcard` público** (`/devcard/@username`): tweet de lançamento com 5 devcards de early users + CTA "compartilhe o seu".
6. **Dia 50 — "Auditoria de retenção 30d":** publicar AB30 real da primeira coorte com gráfico antes/depois. Se for 35%+, é prova social. Se for 25%, é honestidade competitiva (ninguém mais reporta isso).

### Trojan Horse Content — formato específico

**"O que eu descobri submetendo o mesmo PDF a 4 IAs de estudo — tabela auditável de 12 critérios"** (artigo longread + thread Twitter/X + carrossel LinkedIn).

Formato:
- 800-1200 palavras
- Tabela markdown comparando outputs reais (não claims de marketing)
- 12 critérios: estrutura sequencial, retenção em 7d (testada com flashcards), profundidade de explicação, latência, custo, suporte PT-BR, citações de fonte, gamificação, exportabilidade (Anki .apkg), API/integração, qualidade do quiz, "explica o porquê vs lista o quê".
- Links públicos pros outputs (Google Drive/Notion público de cada ferramenta).
- Conclusão honesta com 2-3 categorias onde a FFV perde (velocidade, marca, escala instantânea).
- Convite explícito: *"Refaz com seu PDF. Te envio meu prompt e os links de cada serviço. Se achar discrepância, abre issue no [repo público]."*

Por que viraliza: o tech-BR é cansado de "comparativos patrocinados". Auditabilidade + honestidade competitiva é raro o suficiente pra render compartilhamento orgânico em LinkedIn técnico, Twitter dev BR, e nichos de medicina/concurso. [hipótese: 30-100k impressões em 7 dias para autor com seguidores moderados; viral cap em 500k se Akita ou Deschamps amplificarem].

---

## D) PRICING E SUSTENTABILIDADE V1 → V2

### Como sustentar V1 grátis (custo por base entregue)

Estimativa por base entregue (PDF médio 80-150 páginas, trilha com 8-15 módulos + 30-60 quizzes):
- **Claude API (geração + revisão estrutural):** ~R$ 2,50 por base. [Cálculo: Sonnet 4.7 a US$3/1M input + US$15/1M output. PDF de 100k tokens input + 30k output × 3 passes (estrutura, módulos, quizzes) ≈ ~US$ 0.50 = R$ 2,50 com câmbio R$5.]
- **Storage S3/R2 (PDFs originais + outputs):** ~R$ 0,10/base/mês. Cap em 6 meses = R$ 0,60 amortizado.
- **Curadoria humana:** R$ 4-6 por base (15-25min de revisor júnior @ R$ 15-25/hora). [hipótese: revisor JR custa R$ 20/h, processa 4 bases/h após pipeline maduro].
- **Infra fixa (Postgres, Redis, Vercel, domínio, Resend):** ~R$ 600/mês fixo, amortizado em 200 bases = R$ 3/base.

**Custo médio total: ~R$ 8 por base entregue.** Com 200 bases/mês V1 → custo operacional **~R$ 1.600/mês**. Sustentável bootstrap.

### Cap honesto pra free
- **1 base por mês por usuário** (proteção do gargalo de curadoria).
- **Até 100MB de upload por base** (NotebookLM cobra cap de fonte; nosso é honesto).
- **Bases ficam vivas indefinidamente** — quem entrou na V1 continua, sem paywall retroativo. *(Já está na copy do FAQ — manter promessa.)*

### Modelo de monetização V2 — 3 cenários

#### Cenário 1 — B2C Premium ("FFV Plus", R$ 19-29/mês)
- **O que entra:** sem cap (bases ilimitadas), curadoria prioritária (12h vs 24h), export Anki avançado, certificados oficiais, tutor IA contextual ilimitado.
- **Prós:** receita previsível, conversão direta de fãs.
- **Contras:** [hipótese] conversão free→paid BR em edtech raramente passa de 2-3% — exige ≥10k usuários free pra pagar 1 PJ no mês.
- **Quando viável:** ≥ 5.000 usuários ativos engajados.

#### Cenário 2 — B2B institucional (universidades, cursinhos, escritórios de advocacia)
- **O que entra:** licença para professor montar bases dos alunos a partir do plano de ensino. White-label opcional. Dashboard de turma. Preço: R$ 30-80/aluno/semestre.
- **Prós:** ticket alto (R$ 5-50k/contrato), retenção semestral, dados de aprendizado por instituição.
- **Contras:** ciclo de venda B2B no Brasil é brutal (3-9 meses), exige SLA contratual sério.
- **Quando viável:** após 1 case institucional real (universidade piloto via Marina) ≥ 6 meses de track record.

#### Cenário 3 — Marketplace de simulados de certificação
- **O que entra:** vender simulados oficiais (AWS, OAB, residência médica, ENADE) a R$ 39-99 cada. Conteúdo educacional permanece 100% grátis.
- **Prós:** conversão alta (estudante já paga muito mais por simulado), não fere o pacto "conteúdo grátis sempre", mercado validado (CERS, Gran Cursos faturam centenas de milhões aqui).
- **Contras:** exige produção de simulados de altíssima qualidade — não é cuspe de LLM. Curadoria custosa.
- **Quando viável:** imediato (já está no posicionamento atual da FFV).

### Quando ativar billing — sinal de gatilho

Ativar B2C premium **somente quando 3 condições simultâneas:**
1. AB30 ≥ 35% sustentado por 2 meses (produto entrega valor real).
2. Demanda de curadoria humana > 300 bases/semana (gargalo legítimo para justificar tier prioritário).
3. NPS ≥ 50 entre coorte com ≥30 dias de uso (existem fãs dispostos a pagar).

Antes disso, billing é **prematuro e queima credibilidade**. O pacto "gratuito na V1" só funciona se for **anunciado, planejado e respeitado**. Quando cobrar, cobrar sobre features novas (Plus), não sobre o core já entregue.

---

## E) FEATURES SURPRESA — não estão no roadmap mas viram o jogo

### 1. **"Espelho de Aprendizado"** — relatório semanal pessoal e público (opt-in)
Cada usuário recebe email semanal com `Você sabia X módulos. Hoje sabe Y. Esqueceu Z (já agendado pra revisão). Seus 3 pontos cegos: …`. Versão pública compartilhável (igual Spotify Wrapped, mas semanal). Dado defensável: somos os únicos com **memória longitudinal real do que o aluno sabe** — NotebookLM/ChatGPT não persistem isso. Esforço médio. ROI estratégico: **vira o ritual semanal do aluno** (Spotify Wrapped fez bilhões de impressões grátis).

### 2. **"Card de Revisão Comunitária"** — peer review opt-in entre alunos da mesma matéria
Quando aluno A erra mesma pergunta 3x, sistema sugere: "Aluna B (mesma faculdade, mesma matéria) acertou na 1ª tentativa. Topa pedir uma explicação dela?" — B ganha XP + badge "Tutora". Cria efeito de rede pedagógico real (Khan tem isso na comunidade global; ninguém faz em PT-BR com SRS integrado). Esforço alto. ROI estratégico: vantagem defensável de comunidade — toda nova matéria onboarded ganha tutores em semanas, sem custo de curadoria.

### 3. **"Devolva sua dúvida"** — botão "não entendi" no módulo que vira nova versão
Aluno marca passagem que não entendeu → IA reformula em 3 ângulos alternativos (analogia visual, exemplo numérico, código). Versões mais votadas viram **variantes oficiais do módulo** (A/B test pedagógico ao vivo). Defensável: depois de 6 meses, cada módulo terá 5-8 variantes calibradas pelos próprios alunos. Khan/Brilliant não fazem isso. Esforço médio. ROI estratégico: o currículo **melhora sozinho** com o uso — moat composto.

### 4. **"Trilha Espelho do Concurso/Prova Real"**
Quando 30+ usuários enviam material da mesma prova (OAB-2024-2, residência USP cardiologia, AWS-SAA-C03), o sistema agrega esses materiais e gera uma **trilha consolidada pública** validada por edital + perguntas frequentes. Vira recurso de SEO killer ("plano oficial OAB 2ª fase 2026 — FFV") e prova social. Defensável: cada nova prova realimenta o sistema. Concursa.ai faz só pra concurso público; FFV faz transversal. Esforço alto. ROI estratégico: vira **enciclopédia viva** de planos de estudo brasileiros.

### 5. **"Modo Treinador" para profs / cursinhos** (B2B Trojan)
Professor universitário cria conta especial, envia plano de ensino + bibliografia, ganha página `/turma/<código>` onde alunos entram via código e estudam a mesma base. Professor vê dashboard de quem está atrasado, quem domina cada tópico, quais módulos têm baixa retenção (sinal pra ele reforçar em aula). Grátis na V1 para professores (modelo Khan/Khanmigo). Defensável: cria **dependência institucional** que outros produtos não têm. ROI estratégico: porta de entrada B2B (Cenário 2 de pricing) sem ciclo de venda — viraliza dentro da universidade via boca-a-boca de aluno.

---

## F) MEDIDA DE SUCESSO 30 / 60 / 90

### 30 dias (gating: "produto funciona pra uma pessoa real")
- **Bases entregues:** 30-50 dentro do SLA de 24h (com 95% de adesão ao SLA).
- **Completion rate inicial:** ≥ 40% dos usuários abrem ≥3 módulos da base recebida em 7 dias.
- **NPS @ 14d:** ≥ 40 (n ≥ 20 respostas).
- **Custo médio por base:** ≤ R$ 10 (folga vs meta R$8).
- **Conteúdo viral:** Trojan Horse publicado, ≥10k impressões orgânicas.
- **Sinal qualitativo:** ≥3 usuários voltam espontaneamente pra pedir 2ª base ou indicam um amigo (sem prompt).

### 60 dias (gating: "produto retém")
- **Retention 7d:** ≥ 50% dos usuários da coorte 30d retornam para 2+ sessões na 2ª semana.
- **Bases entregues totais:** 120-180 acumuladas.
- **Leads orgânicos/mês:** ≥ 200/mês não-pagos (atribuídos a alavancas 1, 2 e início de 3).
- **Volume de busca "FFV Academy" no Google:** ≥ 200 buscas/mês.
- **Trojan Content:** thread/longread comparativo atingiu ≥50k impressões com ≥30 reposts orgânicos.
- **Throughput operacional:** curadoria sustentável de 25 bases/dia steady (sem queimar fundador).
- **AB30 da coorte de 30d atrás:** ≥ 30% (proxy do KR final).

### 90 dias (gating: "produto cresce + tem economia")
- **AB30 sustentado:** ≥ 35% por 2 meses consecutivos.
- **Bases/mês:** ≥ 250 entregues no mês 3.
- **Pre-receita / sinais de monetização:** ≥ 30 usuários explicitamente perguntando "como pago" / "tem plano premium" / "vocês fazem turma?" (capturado via interceptor no formulário + email pós-30d). Esse sinal qualitativo é o gatilho de **Cenário 1 ou 2** de monetização.
- **Brand search volume:** ≥ 500 buscas/mês "FFV Academy" no Google (medido via GSC).
- **Cobertura editorial:** ≥ 2 menções em mídia técnica/educacional BR (Tecmundo, MIT TR BR, Café Brasil, Hipsters.Tech, ou similar).
- **NPS sustentado:** ≥ 50 entre usuários ≥30d.
- **Custo por base:** ≤ R$ 8 mantido (economia provada).
- **Devcard compartilhado:** ≥ 50 devcards públicos compartilhados no LinkedIn/Twitter, somando ≥30k impressões secundárias.

### Critério único de "chegamos"
Se ao fim do dia 90 tivermos **AB30 ≥35%, NPS ≥50, ≥250 bases/mês, sinais pre-receita e Trojan Content viralizado** — temos o direito de cobrar e o material pra captar seed. Se faltar **AB30 ou NPS**, é hora de **pausar GTM e voltar pra produto**. Se faltar só volume, é hora de **dobrar em conteúdo orgânico** antes de queimar paid.

---

**Fim do documento.** Cerca de 2.480 palavras. Próximos artefatos sugeridos para a implementação: `EXECUTIVE_PLAN_TRACKING.md` (KRs em tabela atualizável semanal) + `GTM_CONTENT_CALENDAR_60D.md` (calendário dos 6 momentos públicos).
