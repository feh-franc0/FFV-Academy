## Reuniao de Marketing #4 — Script & Copy Final

**Data:** 2026-04-18 | **Topico:** Texto exato por cena, timing, posicao e CTA final
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** INTERATIVA — usuario revisa antes de aprovar
**Input:** Atas das Reunioes #1 (USP/persona), #2 (Storyboard 6 cenas), #3 (Pipeline tecnico)

---

### Contexto

Com storyboard de 6 cenas (80s), pipeline tecnico definido (Puppeteer + Remotion) e USP travado ("Plataforma gratuita que transforma curiosos em especialistas"), esta reuniao define **cada palavra que aparece no video**. Cada headline, subtexto e CTA sera implementado exatamente como aprovado aqui.

Persona: Rafael, 27 anos, dev pleno brasileiro que quer ir alem do tutorial basico.

**Escopo:** Copy final, timing de texto, posicao e animacao. Tudo travado apos aprovacao.

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** O hook (cena 1) precisa provocar sem julgar. "Voce estuda ou so consome?" e forte mas pode soar agressivo. Melhor: uma pergunta que o Rafael se faz internamente.
- **Observacao 2:** A transicao emocional entre cena 2 (dor) e cena 3 (revelacao) precisa de silencio textual — 0.5s de tela preta antes da home aparecer. O vazio cria expectativa.
- **Problema critico:** O CTA de 18s pode ficar longo demais com tela estatica. Proposta: dividir em 3 beats — URL (5s) → beneficio (5s) → respiro final com logo (8s).
- **Ponto forte:** O arco emocional (curiosidade → dor → encantamento → confianca → acao) esta claro e cada cena tem um beat definido.
- **Recomendacao:** Cena 6 (CTA) dividida em 3 momentos visuais para manter ritmo.
- **Voto:** Aprova storyboard, propoe CTA em 3 beats.

#### ✍️ Copywriter
- **Observacao 1:** Testei 5 opcoes de hook. O mais forte que encontrei balanca provocacao e identificacao: "E se existisse um lugar onde estudar tecnologia te fizesse evoluir de verdade?" — 12 palavras, cabe em 2 linhas.
- **Observacao 2:** Para a cena de features, headlines de 2-3 palavras funcionam melhor que frases: "Trilhas guiadas", "Quiz com XP", "Seu progresso", "Revisao inteligente". O screenshot explica; o texto nomeia.
- **Observacao 3:** O CTA final precisa ter 3 elementos: URL (onde ir), acao (o que fazer) e desarmador de objecao (por que nao tem risco). "fernandofrancovalle.com · Comece agora · 100% gratuito, sem cadastro."
- **Problema critico:** O subtexto da cena 2 nao pode listar problemas demais — 1 dor principal e suficiente. "Tutoriais rasos" ou "cursos caros", nao os dois.
- **Ponto forte:** Os numeros reais (168 artigos, 16 trilhas, 36h) sao proof points fortes que nao precisam de copywriting — so mostrar.
- **Recomendacao:** Copy final proposto abaixo com timing por frame.
- **Voto:** Aprova com script detalhado.

#### 🎨 Designer Motion
- **Observacao 1:** Headlines em fonte Poppins Bold, 72px minimo para legibilidade em mobile (mesmo em 16:9). Subtextos em Inter 36px.
- **Observacao 2:** Nas cenas de texto puro (1, 2, 6), o texto fica centralizado vertical e horizontalmente com margin lateral de 200px (cada lado).
- **Observacao 3:** Cor do texto: branco #f0f6fc para headlines, cinza #8b949e para subtextos, azul #58a6ff para numeros e destaques.
- **Problema critico:** Na cena 4, as headlines de features precisam estar no canto inferior esquerdo (nao centralizadas) para nao cobrir a area de interesse do screenshot.
- **Ponto forte:** O contraste branco sobre #0d1117 e perfeito — WCAG AAA, legivel em qualquer tela.
- **Recomendacao:** Spec visual detalhada por cena abaixo.
- **Voto:** Aprova com posicoes definidas.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** Cada headline precisa de no minimo 60 frames (2s) visivel para leitura confortavel. Headlines de 5+ palavras precisam de 75 frames (2.5s).
- **Observacao 2:** Animacao de entrada dos textos: fade-in + slide-up (translateY de 30px a 0) com duracao de 15 frames (0.5s). Saida: fade-out puro, 10 frames (0.33s).
- **Observacao 3:** Na cena 5 (numeros), posso implementar animacao de contagem (0 → 168) usando interpolate(). Dura ~45 frames (1.5s) por numero.
- **Problema critico:** Se headlines e subtextos entram simultaneamente, fica pesado visualmente. Stagger de 10 frames (0.33s) entre headline e subtexto.
- **Ponto forte:** Todos os timings propostos cabem confortavelmente nas duracoes das cenas.
- **Recomendacao:** Stagger de 10 frames entre headline e subtexto. Contagem animada nos numeros da cena 5.
- **Voto:** Aprova com stagger e contagem animada.

#### 📊 Estrategista
- **Observacao 1:** O hook precisa funcionar em mudo no feed do LinkedIn — o texto sozinho tem que fazer o scroll parar. Fonte grande, contraste maximo, frase provocativa.
- **Observacao 2:** O CTA final deve incluir a URL literal (nao encurtada) para que o espectador possa digitar manualmente se estiver no mobile assistindo video.
- **Observacao 3:** A frase "100% gratuito, sem cadastro" e o closer mais forte — deve ser a ultima coisa que o espectador le.
- **Problema critico:** Se o video roda em autoplay mudo no LinkedIn, os primeiros 3s sao criticos. O texto do hook precisa estar 100% visivel no frame 1, nao animado gradualmente.
- **Ponto forte:** CTA sem friccao (site publico, sem cadastro) e raro e valioso.
- **Recomendacao:** Hook text aparece rapido (0.3s fade-in, nao 0.5s). Primeiros frames devem ser impactantes.
- **Voto:** Aprova com hook acelerado.

---

### Conflitos e Resolucoes

#### Conflito 1: ES vs PT — Velocidade do hook
- **ES:** Hook precisa aparecer em 0.3s (9 frames) para funcionar em autoplay mudo do LinkedIn.
- **PT:** 0.3s e rapido demais para fade-in + slide-up. Vai parecer pop-in. Alternativa: fade-in puro (sem slide) em 0.3s.
- **Resolucao:** Cena 1 usa fade-in puro (sem slide-up) em 10 frames (0.33s). Rapido o suficiente para LinkedIn, suave o suficiente para nao parecer glitch. Subtexto entra 15 frames depois.

#### Conflito 2: DC vs CW — Tom do hook
- **DC:** Quer pergunta introspectiva: "E se existisse um lugar onde estudar tecnologia te fizesse evoluir de verdade?"
- **CW:** 12 palavras e muito para headline de video. Propoe: "Estudar tecnologia deveria te transformar." (6 palavras, statement em vez de pergunta)
- **Resolucao:** Usar o statement do CW como headline (6 palavras, impacto imediato) e uma versao resumida da pergunta do DC como subtexto: "Nao so te informar." Juntos: "Estudar tecnologia deveria te transformar. Nao so te informar." — provoca e completa em 2 tempos.

#### Conflito 3: DM vs CW — Texto na cena de features
- **DM:** Headlines de features devem ficar no canto inferior esquerdo para nao cobrir o screenshot.
- **CW:** Canto inferior esquerdo e pouco visivel — olho vai primeiro ao centro.
- **Resolucao:** Features usam barra inferior (full width, 120px height, fundo gradiente preto 80% → transparente). Headline centralizada dentro da barra. Screenshot visivel acima; texto legivel abaixo.

---

### Deliverable da Reuniao — Script Final

---

### CENA 1 — HOOK (0s–8s / frames 0–240)

**Background:** Solido #0d1117 (dark bg)
**Layout:** Texto centralizado, margin 200px lateral

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Estudar tecnologia deveria te transformar. | Poppins Bold | 72px | #f0f6fc | Centro | Fade-in 10f | 0 | 210 |
| Subtexto | Nao so te informar. | Inter Regular | 40px | #8b949e | Centro, abaixo headline | Fade-in 10f | 25 | 210 |

**Saida:** Fade-out ambos 10f (frames 210–220). Frames 220–240: tela preta.

---

### CENA 2 — PROBLEMA (8s–18s / frames 240–540)

**Background:** Solido #0d1117
**Layout:** Texto centralizado, margin 200px lateral

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Tutoriais rasos. Cursos caros. Conteudo em ingles. | Poppins Bold | 64px | #f0f6fc | Centro | Fade-in 15f | 255 | 480 |
| Subtexto | Voce merece mais do que isso. | Inter Regular | 36px | #58a6ff | Centro, abaixo | Fade-in 10f | 285 | 480 |

**Saida:** Fade-out 15f (480–495). Frames 495–540: tela 100% preta (silencio visual antes da revelacao).

**Nota do DC:** Os 1.5s de tela preta sao intencionais — criam expectativa para a revelacao.

---

### CENA 3 — REVELACAO (18s–30s / frames 540–900)

**Background:** Screenshot `home-hero.png`
**Transicao entrada:** Zoom-from-black (spring: damping 12, stiffness 80), 30 frames (540–570)
**Ken Burns:** Scale 1.0 → 1.08 ao longo de toda a cena
**Overlay:** Gradiente linear bottom-to-top (#0d1117 80% → transparente 0%), height 40%

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Label | FFV ACADEMY | Poppins Bold | 24px | #58a6ff | Base-esquerda, acima headline | Slide-up 15f | 600 | 870 |
| Headline | Aprenda tecnologia real. Evolua de verdade. | Poppins Bold | 56px | #f0f6fc | Base-esquerda | Slide-up 15f | 615 | 870 |

**Saida:** Slide-left (toda cena desliza para esquerda), 12 frames (888–900).

---

### CENA 4 — FEATURES (30s–52s / frames 900–1560)

**Layout:** Cada sub-cena mostra screenshot com barra inferior (120px, gradiente preto 80%)

#### 4A — Trilhas Guiadas (frames 900–1065, 5.5s)

**Screenshot:** `trilha-progresso.png` (crop da listagem de artigos com checkmarks)
**Ken Burns:** Scale 1.0 → 1.05
**Highlight:** Glow suave nos checkmarks verdes

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Trilhas guiadas | Poppins Bold | 48px | #f0f6fc | Barra inferior, centro | Slide-up 10f | 915 | 1050 |
| Tag | 16 trilhas · 168 artigos | Inter Regular | 28px | #3fb950 | Barra inferior, abaixo headline | Fade-in 10f | 930 | 1050 |

**Transicao:** Slide-right 9f (1056–1065)

#### 4B — Quiz com XP (frames 1065–1230, 5.5s)

**Screenshots:** `quiz-pergunta.png` → crossfade 9f → `quiz-feedback.png` (crossfade no frame 1140)
**Highlight:** Glow verde no feedback correto (apos crossfade)

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Quiz interativo | Poppins Bold | 48px | #f0f6fc | Barra inferior, centro | Slide-up 10f | 1080 | 1215 |
| Tag | Acerte e ganhe XP | Inter Regular | 28px | #ffa657 | Barra inferior, abaixo | Fade-in 10f | 1095 | 1215 |

**Transicao:** Slide-right 9f (1221–1230)

#### 4C — Seu Progresso (frames 1230–1395, 5.5s)

**Screenshot:** `dashboard-progresso.png` (crop do hero com XP, nivel, badges)
**Ken Burns:** Scale 1.0 → 1.06
**Highlight:** Glow na barra de XP e badge grid

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Seu progresso | Poppins Bold | 48px | #f0f6fc | Barra inferior, centro | Slide-up 10f | 1245 | 1380 |
| Tag | XP · Niveis · Badges · Streak | Inter Regular | 28px | #d2a8ff | Barra inferior, abaixo | Fade-in 10f | 1260 | 1380 |

**Transicao:** Slide-right 9f (1386–1395)

#### 4D — Revisao Inteligente (frames 1395–1560, 5.5s)

**Screenshot:** `srs-review.png` (card de revisao espacada)
**Ken Burns:** Scale 1.0 → 1.05
**Highlight:** Glow nos botoes de rating (Again/Hard/Good/Easy)

| Elemento | Texto | Fonte | Tamanho | Cor | Posicao | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|---------|----------|-----------|
| Headline | Revisao inteligente | Poppins Bold | 48px | #f0f6fc | Barra inferior, centro | Slide-up 10f | 1410 | 1530 |
| Tag | Revisao espacada SM-2 | Inter Regular | 28px | #58a6ff | Barra inferior, abaixo | Fade-in 10f | 1425 | 1530 |

**Transicao:** Fade-to-black 15f (1545–1560)

---

### CENA 5 — PROVA / NUMEROS (52s–62s / frames 1560–1860)

**Background:** Screenshot `dashboard-progresso.png` com blur 8px + overlay #0d1117 70%
**Layout:** Numeros grandes centralizados, grid 2x3

| Elemento | Texto | Fonte | Tamanho | Cor | Animacao | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|----------|-----------|
| Numero 1 | 168 | Poppins Bold | 96px | #f0f6fc | Contagem 0→168 (45f) | 1590 | 1830 |
| Label 1 | artigos tecnicos | Inter Regular | 28px | #8b949e | Fade-in 10f | 1635 | 1830 |
| Numero 2 | 16 | Poppins Bold | 96px | #f0f6fc | Contagem 0→16 (30f) | 1620 | 1830 |
| Label 2 | trilhas estruturadas | Inter Regular | 28px | #8b949e | Fade-in 10f | 1650 | 1830 |
| Numero 3 | 36h | Poppins Bold | 96px | #f0f6fc | Contagem 0→36 (30f) | 1650 | 1830 |
| Label 3 | de conteudo | Inter Regular | 28px | #8b949e | Fade-in 10f | 1680 | 1830 |
| Numero 4 | 100% | Poppins Bold | 96px | #3fb950 | Contagem 0→100 (45f) | 1680 | 1830 |
| Label 4 | gratuito | Inter Regular | 28px | #3fb950 | Fade-in 10f | 1725 | 1830 |

**Layout grid:** 2 colunas × 2 linhas, gap 80px, centralizado
**Saida:** Fade-out 15f (1830–1845). Frames 1845–1860: tela preta.

---

### CENA 6 — CTA (62s–80s / frames 1860–2400)

**Background:** Solido #0d1117, com mini-screenshot home-hero no fundo (blur 12px, opacity 15%)
**Layout:** 3 beats sequenciais, tudo centralizado

#### Beat 1 — URL (frames 1860–2010, 5s)

| Elemento | Texto | Fonte | Tamanho | Cor | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|----------|-----------|
| URL | fernandofrancovalle.com | Poppins Bold | 64px | #58a6ff | Fade-in 15f | 1875 | 2400 |

#### Beat 2 — Acao (frames 2010–2160, 5s)

| Elemento | Texto | Fonte | Tamanho | Cor | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|----------|-----------|
| CTA | Comece agora. De curioso a especialista. | Poppins Medium | 44px | #f0f6fc | Slide-up 15f | 2025 | 2400 |

#### Beat 3 — Closer + Respiro (frames 2160–2400, 8s)

| Elemento | Texto | Fonte | Tamanho | Cor | Entrada | Frame in | Frame out |
|----------|-------|-------|---------|-----|---------|----------|-----------|
| Closer | 100% gratuito · Sem cadastro · Comece em 10 segundos | Inter Regular | 32px | #3fb950 | Fade-in 15f | 2175 | 2400 |

**Nota:** Todos os textos permanecem visiveis ate o ultimo frame. Os ultimos 90 frames (3s) sao "respiro" — tela estavel, tudo visivel, espectador registra a URL.

---

### Resumo do Copy Completo

| Cena | Headline | Subtexto/Tag |
|------|----------|-------------|
| 1 Hook | Estudar tecnologia deveria te transformar. | Nao so te informar. |
| 2 Problema | Tutoriais rasos. Cursos caros. Conteudo em ingles. | Voce merece mais do que isso. |
| 3 Revelacao | Aprenda tecnologia real. Evolua de verdade. | FFV ACADEMY (label) |
| 4A Trilhas | Trilhas guiadas | 16 trilhas · 168 artigos |
| 4B Quiz | Quiz interativo | Acerte e ganhe XP |
| 4C Progresso | Seu progresso | XP · Niveis · Badges · Streak |
| 4D Revisao | Revisao inteligente | Revisao espacada SM-2 |
| 5 Prova | 168 / 16 / 36h / 100% | artigos / trilhas / conteudo / gratuito |
| 6 CTA | fernandofrancovalle.com | Comece agora. De curioso a especialista. / 100% gratuito · Sem cadastro · Comece em 10 segundos |

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | CTA em 3 beats aprovado — ritmo forte |
| CW | Aprova | — |
| DM | Aprova | Barra inferior nas features resolve legibilidade |
| PT | Aprova | Todos os timings cabem nos frames. Contagem animada viavel. |
| ES | Aprova | Hook em 0.33s + URL literal no CTA = otimo para LinkedIn |

**Resultado:** Aprovado por unanimidade (5/5)

---

### Proxima Reuniao
- **Numero:** 5 (INTERATIVA — usuario aprova Go/No-Go)
- **Topico:** Checklist final de producao + plano de distribuicao
- **Preparar antes:** Script aprovado (este documento) + todas as atas anteriores
