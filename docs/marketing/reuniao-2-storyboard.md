## Reuniao de Marketing #2 — Storyboard & Arco Narrativo

**Data:** 2026-04-18 | **Topico:** Definir roteiro cena-a-cena com arco emocional para video 60-90s
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** Automatica
**Input:** Ata da Reuniao #1 (USP, persona, features showcaseaveis)

---

### Contexto

Com o USP definido ("Plataforma gratuita que transforma curiosos em especialistas com conteudo tecnico real e gamificacao que funciona"), persona (dev pleno brasileiro, 27 anos, quer ir alem do tutorial) e 10 features showcaseaveis, precisamos agora criar o storyboard cena-a-cena.

O video tem 60-90 segundos, formato 16:9 (YouTube/LinkedIn), com trilha sonora e texto visual que funciona em mudo. Arco narrativo: gancho → problema → solucao → features → prova → CTA.

**Escopo:** Roteiro narrativo e beat emocional por cena. NAO estamos definindo copy exato nem spec tecnica ainda.

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** O arco ideal em 80s e: hook provocativo (10s) → dor identificavel (10s) → revelacao da solucao (15s) → features em acao (20s) → numeros que comprovam (10s) → CTA (15s). Seis cenas, cada uma com beat emocional claro.
- **Observacao 2:** O momento de "revelacao" (cena 3) e o ponto de virada — quando a home aparece pela primeira vez deve ser cinematico, com zoom lento e musica subindo.
- **Problema critico:** Se a cena de features (cena 4) tentar mostrar tudo, vira slideshow. Maximo 4 features, 5s cada, com transicoes rapidas.
- **Ponto forte:** A jornada "Curioso → Especialista" da gamificacao e literalmente a jornada do video — o espectador se ve evoluindo.
- **Recomendacao:** Cena 4 (features) deve focar em: quiz + XP, dashboard de progresso, trilhas estruturadas, e SRS review. Sao as 4 que melhor comunicam "gamificacao real".
- **Voto:** 6 cenas, 80 segundos totais.

#### ✍️ Copywriter
- **Observacao 1:** O hook precisa ser uma pergunta que o Rafael se faz: "Voce estuda tecnologia ou so consome tutorial?" — provoca sem ofender.
- **Observacao 2:** O CTA final nao pode ser generico. Deve ser: URL + acao + reforco de gratuidade. "fernandofrancovalle.com — comece agora, e gratuito."
- **Problema critico:** A cena de "problema" (cena 2) nao pode ser negativa demais — dev brasileiro rejeita conteudo que parece estar julgando ele. Dor identificavel, nao acusatoria.
- **Ponto forte:** O "100% gratuito" aparecendo no CTA e um closer poderoso — elimina a ultima objecao.
- **Recomendacao:** Cada cena precisa de no maximo 1 headline + 1 subtexto. Mais que isso e ilegivel em video.
- **Voto:** 6 cenas, hook como pergunta.

#### 🎨 Designer Motion
- **Observacao 1:** A sequencia visual ideal e: texto puro (hook) → texto puro (problema) → screenshot home (solucao) → screenshots features → screenshot dashboard (prova) → texto puro (CTA). Alterna texto/screenshot para ritmo visual.
- **Observacao 2:** A cena 3 (revelacao) deve usar transicao zoom-from-black para a home — simulando "abrir o site pela primeira vez".
- **Observacao 3:** Na cena 4, cada feature deve ter crop focado (nao tela cheia) com highlight glow na area de interesse.
- **Problema critico:** Cena 5 (prova social) so com numeros pode ser visualmente fraca. Proposta: mostrar dashboard de progresso com numeros overlaid.
- **Ponto forte:** O dark theme com acentos coloridos contra fundo escuro cria contraste cinematografico natural.
- **Recomendacao:** Usar fundo #0d1117 (dark bg) para cenas de texto puro — integra visualmente com screenshots.
- **Voto:** Alternancia texto/screenshot para ritmo.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** Com 6 cenas e 80s total, temos ~400 frames por cena a 30fps. Remotion suporta facilmente com <Sequence> components.
- **Observacao 2:** Screenshots necessarios confirmados: (1) home hero full, (2) home hubs scroll, (3) trilha com progresso, (4) artigo com TOC, (5) quiz 3 frames, (6) dashboard progresso, (7) SRS review, (8) command palette. Total: 10 PNGs.
- **Problema critico:** Ken Burns (zoom lento) em screenshots 1920x1080 pode causar artefatos se o zoom ultrapassar 15%. Manter em 5-10%.
- **Ponto forte:** O pipeline Puppeteer → Remotion suporta todas as transicoes propostas: fade, zoom, slide, crossfade.
- **Recomendacao:** Capturar screenshots em 2x (3840x2160) para permitir crop e zoom sem perda de qualidade.
- **Voto:** 10 screenshots + 3 frames quiz = 13 PNGs total.

#### 📊 Estrategista
- **Observacao 1:** Para LinkedIn, os primeiros 3 segundos determinam se o usuario para de scrollar. O hook visual precisa ser impactante — texto grande em fundo escuro com contraste maximo.
- **Observacao 2:** O video de 80s funciona para YouTube (pre-roll organico) e LinkedIn (feed). Para Reels/Shorts (futuro), cortamos para 30s: hook + solucao + CTA.
- **Problema critico:** Sem audio/narration, o ritmo de leitura do texto determina a duracao minima de cada cena. Teste: headline de 5 palavras precisa de no minimo 2s na tela.
- **Ponto forte:** O CTA "fernandofrancovalle.com" + "100% gratuito" e o melhor CTA possivel em edtech — zero friccao, zero objecao.
- **Recomendacao:** Adicionar 2-3 segundos de "respiro" final apos CTA — o espectador precisa de tempo para registrar a URL.
- **Voto:** 80s com respiro final de 3s = 83s total.

---

### Conflitos e Resolucoes

#### Conflito 1: DC vs ES — Duracao das cenas
- **DC:** Cena 3 (revelacao) precisa de 15s para construir o momento cinematico. Nao pode ser apressada.
- **ES:** 15s e muito para uma unica tela em video de feed. LinkedIn penaliza retencao apos 10s de monotonia visual.
- **Resolucao:** Cena 3 com 12s — revela rapido (zoom-from-black, 3s) e depois Ken Burns lento (9s) enquanto headline aparece. Movimento constante mantem atencao.

#### Conflito 2: CW vs DM — Texto na cena de features
- **CW:** Cada feature precisa de headline + subtexto para explicar o que e.
- **DM:** Com 4 features em 20s (5s cada), headline + subtexto + screenshot = tela poluida. So headline.
- **Resolucao:** Features mostram screenshot com highlight + headline curta (max 4 palavras). Sem subtexto. O visual explica; o texto nomeia.

#### Conflito 3: DM vs PT — Resolucao de captura
- **DM:** Captura em 2x (3840x2160) para permitir crops e zoom com qualidade.
- **PT:** Screenshots em 2x dobram o tempo de captura e o tamanho dos assets. 1920x1080 ja e o output final.
- **Resolucao:** Capturar em 2560x1440 (1.33x) — compromisso entre qualidade de crop e performance. Suficiente para zoom de 10% sem artefatos.

---

### Deliverable da Reuniao — Storyboard

#### Cena 1 — Hook (0s–8s)
- **Duracao:** 8s
- **Beat emocional:** Provocacao → curiosidade
- **O que o espectador ve:** Fundo escuro (#0d1117), texto grande aparece com fade-in. Sem screenshot.
- **O que o espectador sente:** "Hmm, isso me descreve..."
- **Headline sugerida:** [Pergunta provocativa sobre estudar tecnologia]
- **Subtexto sugerido:** [Statement sobre tutoriais rasos]
- **Screenshot:** Nenhum — cena texto-puro
- **Transicao para proxima:** Fade-out texto → fade-in novo texto
- **Musica:** Beat leve, suspense sutil

#### Cena 2 — Problema (8s–18s)
- **Duracao:** 10s
- **Beat emocional:** Identificacao → dor suave
- **O que o espectador ve:** Fundo escuro, texto novo aparece. Sem screenshot.
- **O que o espectador sente:** "E exatamente isso que me frustra."
- **Headline sugerida:** [Statement sobre a dor de aprender superficialmente]
- **Subtexto sugerido:** [Complemento sobre cursos caros ou conteudo raso]
- **Screenshot:** Nenhum — cena texto-puro
- **Transicao para proxima:** Texto faz fade-out → tela 100% preta por 0.5s → zoom-from-black revelando home
- **Musica:** Build-up sutil

#### Cena 3 — Revelacao/Solucao (18s–30s)
- **Duracao:** 12s
- **Beat emocional:** Descoberta → encantamento
- **O que o espectador ve:** Home hero aparece com zoom-from-black (3s de transicao). Ken Burns zoom-in lento. Headline aparece com overlay.
- **O que o espectador sente:** "Isso e bonito. O que e isso?"
- **Screenshot:** home-hero.png (full screen, dark theme)
- **Transicao para proxima:** Slide-left para cena de features
- **Musica:** Drop — musica abre com mais energia

#### Cena 4 — Features em Acao (30s–52s)
- **Duracao:** 22s (~5.5s por feature)
- **Beat emocional:** Exploracao → encantamento crescente
- **O que o espectador ve:** 4 sub-cenas rapidas, cada uma mostrando uma feature com crop focado e headline curta.

**4A — Trilhas Estruturadas (30s–35.5s)**
- Screenshot: trilha-progresso.png (crop da lista de artigos com checkmarks)
- Headline: [Nome da feature]
- Highlight: Glow nos checkmarks de completude
- Transicao: Slide-right

**4B — Quiz Interativo (35.5s–41s)**
- Screenshots: quiz-pergunta.png → quiz-feedback.png (crossfade 0.3s)
- Headline: [Nome da feature]
- Highlight: Glow no feedback verde
- Transicao: Slide-right

**4C — Dashboard de Progresso (41s–46.5s)**
- Screenshot: dashboard-progresso.png (crop do hero com XP, nivel, badges)
- Headline: [Nome da feature]
- Highlight: Glow na barra de XP
- Transicao: Slide-right

**4D — Revisao Espacada (46.5s–52s)**
- Screenshot: srs-review.png (card de revisao)
- Headline: [Nome da feature]
- Highlight: Glow nos botoes de rating
- Transicao: Fade-to-black

- **Musica:** Ritmo constante, energia media

#### Cena 5 — Prova Social / Numeros (52s–62s)
- **Duracao:** 10s
- **Beat emocional:** Confianca → credibilidade
- **O que o espectador ve:** Screenshot do dashboard com overlay escuro + numeros grandes animados (contagem).
- **O que o espectador sente:** "Isso e serio, tem muito conteudo."
- **Numeros a mostrar:** 168 artigos · 16 trilhas · 4 hubs · 36h de conteudo · 100% gratuito
- **Screenshot:** dashboard-progresso.png (background desfocado com overlay 70%)
- **Transicao para proxima:** Fade-out screenshot → fundo escuro
- **Musica:** Build-up para climax

#### Cena 6 — CTA (62s–80s)
- **Duracao:** 18s (incluindo 3s de respiro final)
- **Beat emocional:** Urgencia suave → confianca → acao
- **O que o espectador ve:** Fundo escuro. URL grande. Subtexto "100% gratuito". Logo FFV Academy. Respiro final de 3s com tela estavel.
- **O que o espectador sente:** "Vou acessar agora."
- **Screenshot:** Nenhum — cena texto-puro com possivel mini-screenshot da home ao fundo (blur)
- **Headline sugerida:** [CTA direto com URL]
- **Subtexto sugerido:** [Reforco de gratuidade + sem cadastro]
- **Transicao:** Fade-in texto principal → fade-in subtexto (stagger 1s) → hold 3s
- **Musica:** Resolucao — volta a calma, nota sustentada

---

### Resumo de Timing

| Cena | Nome | Inicio | Fim | Duracao | Tipo |
|------|------|--------|-----|---------|------|
| 1 | Hook | 0s | 8s | 8s | Texto puro |
| 2 | Problema | 8s | 18s | 10s | Texto puro |
| 3 | Revelacao | 18s | 30s | 12s | Screenshot + texto |
| 4 | Features | 30s | 52s | 22s | 4 screenshots + texto |
| 5 | Prova | 52s | 62s | 10s | Screenshot + numeros |
| 6 | CTA | 62s | 80s | 18s | Texto puro |
| **Total** | | | | **80s** | |

### Screenshots Necessarios

| # | Nome arquivo | Pagina | Viewport | Estado localStorage |
|---|-------------|--------|----------|---------------------|
| 1 | home-hero.png | `/` | 2560x1440 | Nivel Especialista, 800 XP |
| 2 | trilha-progresso.png | `/fundamentos-da-ia` | 2560x1440 | 4/6 artigos completos |
| 3 | quiz-pergunta.png | `/aprenda/o-que-e-llm` (scroll) | 2560x1440 | — |
| 4 | quiz-feedback.png | `/aprenda/o-que-e-llm` (click) | 2560x1440 | Quiz respondido |
| 5 | dashboard-progresso.png | `/progresso` | 2560x1440 | 800 XP, 5 badges, streak 14 |
| 6 | srs-review.png | `/revisar` | 2560x1440 | Cards pendentes |

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | — |
| CW | Aprova | Copy exato sera definido na Reuniao 4 |
| DM | Aprova | Viewport 2560x1440 confirmado |
| PT | Aprova | 6 screenshots + quiz 2 frames = viavel |
| ES | Aprova | 80s total com 3s respiro = ideal para LinkedIn/YouTube |

**Resultado:** Aprovado por unanimidade (5/5)

---

### Proxima Reuniao
- **Numero:** 3
- **Topico:** Pipeline Tecnico — ferramentas, captura, estrutura Remotion
- **Preparar antes:** Storyboard aprovado (este documento), lista de screenshots com specs
