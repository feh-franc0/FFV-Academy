## Reuniao de Marketing #1 — Discovery & USP

**Data:** 2026-04-18 | **Topico:** Entender o produto e definir o diferencial unico da FFV Academy
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** Automatica

---

### Contexto

A FFV Academy e um blog tecnico gamificado com 168 modulos, 16 trilhas, 4 hubs tematicos (IA, AWS, Engenharia de Software, Claude/Anthropic), ~36 horas de conteudo tecnico profundo. O sistema de gamificacao inclui XP, 7 niveis (Curioso → Mestre), badges, streak diario com freeze, e revisao espacada (SRS SM-2). O site e 100% estatico (Next.js export), 100% gratuito, sem cadastro, sem backend — todo estado e client-side via localStorage.

Precisamos definir: o que torna este produto unico e comunicavel em um video de 60-90 segundos.

**Escopo:** Somente posicionamento, persona e USP. NAO estamos definindo roteiro ou tecnica ainda.

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** A plataforma tem um arco narrativo natural embutido: o usuario comeca como "Curioso" (nivel 0) e pode evoluir ate "Mestre" (1800+ XP). Isso e uma jornada do heroi pronta — a historia se conta sozinha.
- **Observacao 2:** O dark theme GitHub-inspired com acentos de cor por hub (azul IA, laranja AWS, verde engenharia, roxo Claude) cria uma identidade visual forte e "developer-first" que diferencia de plataformas educacionais genericas.
- **Problema critico:** O nome "FFV Academy" nao comunica o que e. O video precisa compensar isso nos primeiros 3 segundos.
- **Ponto forte:** A gamificacao nao e cosmetics — ela esta integrada ao aprendizado (quiz da XP, SRS reforça memoria). Isso e diferencial real.
- **Recomendacao:** O video deve contar a historia de uma transformacao: "de curioso a especialista" — e mostrar essa jornada visualmente.
- **Voto:** USP deve focar na jornada de evolucao, nao na quantidade de conteudo.

#### ✍️ Copywriter
- **Observacao 1:** Os numeros sao impressionantes e verificaveis: 168 artigos, 16 trilhas, 4 areas, 36h de conteudo, 100% gratuito. Isso e prova social forte sem precisar de depoimentos.
- **Observacao 2:** O "100% gratuito, sem cadastro" e um CTA de friccao zero — raro em edtech. Isso precisa estar no video cedo.
- **Problema critico:** "Blog tecnico gamificado" pode soar como gimmick. O copy precisa posicionar a gamificacao como ferramenta seria de aprendizado, nao como joguinho.
- **Ponto forte:** O conteudo cobre temas que devs brasileiros estao ativamente buscando: IA, LLMs, AWS, Docker, Kubernetes, Claude Code. Relevancia alta.
- **Recomendacao:** Headline principal: "Aprenda tecnologia real, evolua de verdade." — posiciona como serio + progressao.
- **Voto:** USP deve combinar profundidade tecnica + gamificacao seria + gratuito.

#### 🎨 Designer Motion
- **Observacao 1:** O dark theme (#0d1117 bg) com gradientes radiais e grid animado na hero e cinematografico — screenshots vao ficar bonitos em video sem tratamento.
- **Observacao 2:** As telas com mais impacto visual sao: (1) Home hero com grid e hubs, (2) Dashboard de progresso com barras de XP e badges, (3) Quiz com feedback colorido, (4) Command Palette.
- **Observacao 3:** A transicao dark → light theme e visualmente impactante e pode ser usada como momento "wow" no video.
- **Problema critico:** Algumas telas (listagem de trilha, SRS review) sao funcionais mas visualmente monotomas — precisam de crops e highlights para brilhar.
- **Ponto forte:** As cores de acento (#58a6ff, #3fb950, #d2a8ff, #ffa657) contra fundo escuro criam contraste alto — perfeito para video.
- **Recomendacao:** Priorizar telas que mostram estado gamificado (progresso, badges, XP) — elas contam a historia de evolucao visualmente.
- **Voto:** USP visual deve ser o dark theme premium + gamificacao visivel.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** O site roda em localhost:3000 com `npm run dev`. Todas as 168 paginas sao acessiveis e capturaveis via Puppeteer.
- **Observacao 2:** O estado de jogo pode ser injetado via localStorage antes da captura — posso simular um usuario "Especialista" com 800 XP, 5 badges, streak de 14 dias sem que o usuario real precise fazer isso.
- **Problema critico:** O quiz requer cliques interativos para mostrar feedback. Vou precisar de 3 screenshots separados (pergunta, clique, feedback) para simular a interacao.
- **Ponto forte:** O script generate-og-images.mjs ja usa satori+resvg para gerar PNGs programaticamente — a equipe ja tem experiencia com geracao de imagens.
- **Recomendacao:** Capturar 12-15 screenshots em dark theme + 2-3 em light theme para contraste. Quiz em 3 frames.
- **Voto:** USP deve ser demonstravel — so mostrar o que podemos capturar de verdade.

#### 📊 Estrategista
- **Observacao 1:** O publico-alvo primario sao desenvolvedores brasileiros (22-35 anos) que querem aprender IA/cloud/engenharia de forma estruturada. Estao no LinkedIn, Twitter/X tech BR e YouTube tech.
- **Observacao 2:** Concorrentes diretos em PT-BR (Alura, Rocketseat, DIO) sao pagos e focam em cursos em video. FFV Academy e texto interativo + gamificado + gratuito — posicionamento unico.
- **Observacao 3:** O "sem cadastro" elimina a barreira que mais mata conversao em edtech. CTA vira literalmente "abra o site e comece".
- **Problema critico:** Sem metricas de usuarios reais (analytics, testimonials), a prova social depende 100% dos numeros do conteudo (168 artigos, 36h).
- **Ponto forte:** 100% gratuito + sem cadastro + conteudo profundo = proposta de valor incontestavel para a persona.
- **Recomendacao:** Persona principal: "Dev junior/pleno brasileiro que quer ir alem do tutorial basico e entender os internals."
- **Voto:** USP = "plataforma gratuita que leva o dev de curioso a especialista, com conteudo tecnico real."

---

### Conflitos e Resolucoes

#### Conflito 1: DC vs CW — Foco do USP
- **DC:** USP deve focar na jornada emocional de evolucao (curioso → especialista). A historia e o que conecta.
- **CW:** USP deve combinar 3 pilares: profundidade tecnica + gamificacao + gratuito. Os fatos convertem.
- **Resolucao:** Combinar ambos. O USP e a JORNADA (emocional) sustentada por FATOS (numeros). Headline: "De curioso a especialista" (emocao). Subtexto: "168 artigos, 16 trilhas, 100% gratuito" (fato). A jornada e o gancho; os numeros sao a prova.

#### Conflito 2: DM vs PT — Telas do quiz
- **DM:** O quiz e um dos momentos visuais mais fortes — feedback verde/vermelho, celebracao de XP. Precisa aparecer no video com animacao fluida.
- **PT:** Quiz requer 3 screenshots separados e animacao entre eles no Remotion. Nao e impossivel mas adiciona complexidade.
- **Resolucao:** Capturar 3 frames do quiz (pergunta → resposta → feedback). Animar no Remotion com crossfade rapido (0.3s). Produz o efeito de "clique" sem cursor fake.

#### Conflito 3: ES vs DC — Tom do video
- **ES:** Para LinkedIn/YouTube tech BR, o tom precisa ser pragmatico e direto. Devs brasileiros fogem de hype.
- **DC:** O video precisa ter emocao — comecando com curiosidade e terminando com confianca. "Direto" nao precisa ser "frio".
- **Resolucao:** Tom "tecnico com alma" — linguagem direta, sem superlativos, mas com ritmo e build-up emocional. O produto ja e "zero hype" por natureza; o video respeita isso.

---

### Deliverable da Reuniao

#### USP (Unique Selling Proposition)

**1 frase:** "Plataforma gratuita que transforma curiosos em especialistas com conteudo tecnico real e gamificacao que funciona."

**Versao expandida:** A FFV Academy e um blog tecnico gamificado com 168 artigos em 16 trilhas sobre IA, AWS, engenharia de software e Claude/Anthropic. Sem cadastro, sem paywall — voce abre, estuda e evolui. Sistema de XP, niveis, badges e revisao espacada transformam aprendizado em progresso visivel.

**Proof points:**
1. 168 artigos tecnicos profundos em portugues brasileiro
2. 16 trilhas estruturadas em 4 hubs tematicos
3. ~36 horas de conteudo cobrindo IA, AWS, Docker, Kubernetes, LLMs, Claude
4. 100% gratuito, sem cadastro, sem backend
5. Gamificacao real: XP, 7 niveis, badges, streak, SRS (revisao espacada)

#### Persona Principal

- **Nome:** Rafael, 27 anos
- **Cargo atual:** Dev pleno em startup brasileira
- **Aspiracao:** Virar especialista em IA/cloud e se posicionar no mercado
- **Dor principal:** Tutoriais sao rasos, cursos pagos sao caros, documentacao e em ingles
- **Onde esta:** LinkedIn (network tech BR), Twitter/X (tech BR), YouTube (canais tech)
- **Gatilho de acao:** Ver conteudo profundo e organizado + "e gratuito?" + comecar a ganhar XP

#### Posicionamento Competitivo

| Concorrente | Forca | Fraqueza vs FFV Academy |
|-------------|-------|------------------------|
| Alura | Cursos em video, certificados | Pago (~R$90/mes), video passivo, sem gamificacao real |
| Rocketseat | Comunidade forte, projetos praticos | Foco fullstack JS, nao cobre IA/AWS profundo |
| DIO | Gratuito parcial, bootcamps | Conteudo raso, gamificacao superficial, UX poluida |
| freeCodeCamp | Gratuito, curriculo extenso | Ingles, foco web dev, sem conteudo IA/AWS atualizado |

**Diferencial FFV Academy:** Unica plataforma em PT-BR que combina conteudo tecnico profundo (internals, arquitetura real) + gamificacao integrada ao aprendizado + 100% gratuito sem friccao.

#### Features Showcaseaveis no Video

1. **Home hero** — impacto visual, dark theme premium, grid animado
2. **Hubs tematicos** — 4 areas com cores e identidade propria
3. **Trilha com progresso** — artigos com checkmarks, progresso visivel
4. **Artigo com TOC** — conteudo profundo, navegacao lateral
5. **Quiz interativo** — perguntas reais, feedback imediato, XP
6. **Dashboard de progresso** — XP, nivel, streak, badges, completude por hub
7. **SRS Review** — cards de revisao espacada, rating de dificuldade
8. **Command Palette** — busca global Cmd+K, estilo IDE
9. **Celebracao de XP/badge** — overlay de conquista
10. **Tema light vs dark** — transicao visual impactante

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | — |
| CW | Aprova | — |
| DM | Aprova | Incluir transicao dark/light como momento showcase |
| PT | Aprova | Quiz em 3 frames confirmado como viavel |
| ES | Aprova | — |

**Resultado:** Aprovado por unanimidade (5/5)

---

### Proxima Reuniao
- **Numero:** 2
- **Topico:** Storyboard — roteiro cena-a-cena com arco emocional
- **Preparar antes:** USP e persona definidos (este documento), lista de screenshots prioritarios
