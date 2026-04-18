## Reuniao de Marketing #5 — Plano de Producao & Go/No-Go

**Data:** 2026-04-18 | **Topico:** Checklist final de execucao + plano de distribuicao
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** INTERATIVA — usuario aprova Go/No-Go
**Input:** Atas das Reunioes #1–#4 (USP, Storyboard, Pipeline, Script)

---

### Contexto

Todas as decisoes criativas e tecnicas estao travadas. Esta reuniao consolida tudo em um checklist de execucao passo-a-passo e define o plano de distribuicao do video. Apos aprovacao, entramos em producao.

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** O arco narrativo esta solido — 6 cenas com beat emocional claro, 80s no timing certo. Nenhum ajuste necessario.
- **Observacao 2:** O unico risco remanescente e a trilha sonora — a musica precisa casar com os beats emocionais (suspense no hook, build-up no problema, drop na revelacao, energia nas features, climax nos numeros, resolucao no CTA).
- **Problema critico:** Se a musica nao casar, o video perde 50% do impacto. A escolha da trilha sonora e critica.
- **Ponto forte:** O script e storyboard ja foram validados por todos os experts — nao ha ambiguidade.
- **Recomendacao:** Selecionar 3 opcoes de musica e testar com preview do Remotion antes de render final.
- **Voto:** GO — com condicao de teste de musica no preview.

#### ✍️ Copywriter
- **Observacao 1:** O copy esta travado e revisado. Todas as headlines tem max 8 palavras, subtextos max 12.
- **Observacao 2:** Ultimo check: acentuacao e cedilha estao corretos? "Nao" vs "Não", "voce" vs "você". No Remotion, precisamos garantir UTF-8 e fontes com suporte a diacriticos.
- **Problema critico:** Se as fontes Poppins/Inter nao renderizam acentos corretamente no Remotion, o video fica amador.
- **Ponto forte:** Copy foi aprovado unanimemente na Reuniao 4. Sem alteracoes necessarias.
- **Recomendacao:** Testar todos os textos com acentos no preview do Remotion antes de render.
- **Voto:** GO — com teste de acentuacao.

#### 🎨 Designer Motion
- **Observacao 1:** Spec visual completa — posicoes, cores, tamanhos, transicoes definidos por frame.
- **Observacao 2:** Checklist visual: (1) Contraste WCAG AAA em todas as cenas, (2) Texto nao ultrapassa safe zone (margem 100px em todos os lados), (3) Ken Burns max 8%, (4) Transicoes < 0.5s.
- **Problema critico:** A barra inferior na cena de features (120px, gradiente preto 80%) precisa ser testada em preview — se o gradiente for muito sutil, o texto fica ilegivel sobre screenshots claros.
- **Ponto forte:** Todos os design tokens vem do globals.css do projeto — identidade visual 100% consistente.
- **Recomendacao:** Preview de cada cena individualmente antes do render completo.
- **Voto:** GO.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** Pipeline completamente definido. 4 fases: (1) setup, (2) captura, (3) composicao, (4) render. Cada fase e independente e pode ser re-executada.
- **Observacao 2:** Dependencias externas: ffmpeg (brew), Node.js (ja instalado), Chromium (bundled com Puppeteer).
- **Observacao 3:** Riscos tecnicos mapeados: (a) quiz click pode nao funcionar se o seletor mudar — fallback: injecao de DOM, (b) SRS precisa de cards no localStorage — preciso saber a estrutura exata do SRSCard.
- **Problema critico:** Preciso verificar a estrutura exata de GameState e SRSCard em useGameState.ts e srs.ts para injetar localStorage correto.
- **Ponto forte:** O pipeline e deterministico e re-executavel. Se algo falhar, e so corrigir e rodar de novo.
- **Recomendacao:** Antes de capturar, rodar `npm run dev` e verificar que todas as paginas-alvo carregam corretamente.
- **Voto:** GO.

#### 📊 Estrategista
- **Observacao 1:** Plano de distribuicao definido para 3 canais principais: LinkedIn, YouTube, Twitter/X.
- **Observacao 2:** O video precisa de metadata alem do MP4: titulo, descricao, hashtags, thumbnail. Tudo deve ser preparado em paralelo ao render.
- **Observacao 3:** Timing de publicacao: melhor horario para tech BR no LinkedIn e terca/quarta 8-10h (BRT). YouTube aceita qualquer horario mas terca/quarta performa melhor organicamente.
- **Problema critico:** Sem analytics no site, nao conseguimos medir conversao (video → visita → uso). Recomendacao: pelo menos adicionar UTM na URL do CTA para rastrear origem.
- **Ponto forte:** CTA com URL literal + "100% gratuito" + sem cadastro = pipeline de conversao mais curto possivel.
- **Recomendacao:** Usar URL com UTM: `fernandofrancovalle.com?utm_source=video&utm_medium=social` — mas no video manter a URL limpa (sem UTM). UTM so no link do post.
- **Voto:** GO.

---

### Conflitos e Resolucoes

#### Conflito 1: DC vs PT — Musica antes ou depois de render
- **DC:** Precisa testar 3 opcoes de musica com preview. Escolher a melhor. Depois render final.
- **PT:** Testar 3 musicas = 3x preview time. Melhor escolher 1 e ajustar.
- **Resolucao:** Baixar 2-3 opcoes de musica. Testar com Remotion Player (preview no browser, instantaneo). Escolher a melhor. Render 1 vez.

#### Conflito 2: ES vs todos — UTM no video
- **ES:** Quer UTM na URL para tracking.
- **Todos:** URL com UTM no video e feia e ninguem digita `?utm_source=video`. Fica so no link do post.
- **Resolucao:** Video mostra URL limpa (`fernandofrancovalle.com`). Post do LinkedIn/YouTube tem link com UTM. Todos concordam.

---

### Deliverable da Reuniao — Checklist de Execucao

---

## CHECKLIST COMPLETO DE PRODUCAO

### FASE 1 — SETUP (estimativa: 15 min)

- [ ] **1.1** Criar diretorio `marketing/` na raiz do projeto
- [ ] **1.2** Criar `marketing/package.json` com deps:
  - remotion, @remotion/cli, @remotion/renderer, @remotion/google-fonts
  - puppeteer, typescript, tsx
- [ ] **1.3** Rodar `cd marketing && npm install`
- [ ] **1.4** Verificar ffmpeg: `which ffmpeg` (se nao: `brew install ffmpeg`)
- [ ] **1.5** Criar `marketing/tsconfig.json` (target ES2020, jsx react-jsx)
- [ ] **1.6** Criar `marketing/remotion.config.ts`
- [ ] **1.7** Criar estrutura de diretorios:
  ```
  marketing/src/components/
  marketing/src/scenes/
  marketing/src/styles/
  marketing/assets/screenshots/
  marketing/assets/audio/
  marketing/out/
  ```

### FASE 2 — CAPTURA DE TELAS (estimativa: 20 min)

- [ ] **2.1** Estudar estrutura de GameState em `src/hooks/useGameState.ts` e SRSCard em `src/lib/srs.ts`
- [ ] **2.2** Criar `marketing/scripts/capture.ts` com:
  - Configuracao do Puppeteer (viewport 2560x1440, headless)
  - Funcao de injecao de localStorage com GameState simulado
  - 6 capturas definidas (home, trilha, quiz×2, dashboard, SRS)
  - Retry automatico (3 tentativas por screenshot)
  - Logs de progresso
- [ ] **2.3** Rodar `npm run dev` no projeto principal (localhost:3000)
- [ ] **2.4** Executar `npx tsx marketing/scripts/capture.ts`
- [ ] **2.5** Verificar 6 screenshots em `marketing/assets/screenshots/`:
  - home-hero.png (2560x1440)
  - trilha-progresso.png (2560x1440)
  - quiz-pergunta.png (2560x1440)
  - quiz-feedback.png (2560x1440)
  - dashboard-progresso.png (2560x1440)
  - srs-review.png (2560x1440)
- [ ] **2.6** Validar visualmente cada screenshot (estado correto, sem artefatos)

### FASE 3 — COMPOSICAO REMOTION (estimativa: 45 min)

- [ ] **3.1** Criar `marketing/src/styles/tokens.ts`:
  - Cores: bg #0d1117, text #f0f6fc, muted #8b949e, blue #58a6ff, green #3fb950, purple #d2a8ff, orange #ffa657
  - Fontes: Poppins (headlines), Inter (body)
  - Constantes: FPS=30, DURATION=2400 frames

- [ ] **3.2** Criar `marketing/src/components/TextOverlay.tsx`:
  - Props: text, fontSize, color, position, animation (fade/slide-up), frameIn, frameOut
  - Sombra de texto para legibilidade
  - Stagger opcional entre headline e subtexto

- [ ] **3.3** Criar `marketing/src/components/ScreenFrame.tsx`:
  - Props: screenshot (staticFile path), kenBurns (scale range), overlay (gradient config)
  - AbsoluteFill com Img + scale interpolado + gradiente overlay

- [ ] **3.4** Criar `marketing/src/components/SceneTransition.tsx`:
  - Props: type (fade/slide/zoom/crossfade), duration (frames), direction
  - Wrapper que anima entrada/saida do children

- [ ] **3.5** Criar `marketing/src/scenes/HookScene.tsx`:
  - Fundo #0d1117
  - "Estudar tecnologia deveria te transformar." (Poppins 72px, fade-in 10f, frame 0)
  - "Não só te informar." (Inter 40px, fade-in 10f, frame 25)
  - Fade-out frame 210

- [ ] **3.6** Criar `marketing/src/scenes/ProblemScene.tsx`:
  - Fundo #0d1117
  - "Tutoriais rasos. Cursos caros. Conteúdo em inglês." (Poppins 64px, frame 15/300)
  - "Você merece mais do que isso." (Inter 36px, azul #58a6ff, frame 45/300)
  - Fade-out + 1.5s tela preta

- [ ] **3.7** Criar `marketing/src/scenes/RevealScene.tsx`:
  - Zoom-from-black (spring damping:12 stiffness:80) frames 0-30 da cena
  - Screenshot home-hero.png com Ken Burns 1.0→1.08
  - Overlay gradiente inferior
  - "FFV ACADEMY" label + "Aprenda tecnologia real. Evolua de verdade."
  - Slide-left saida

- [ ] **3.8** Criar `marketing/src/scenes/FeaturesScene.tsx`:
  - 4 sub-sequences (trilhas, quiz, progresso, SRS)
  - Cada: screenshot + barra inferior 120px + headline + tag
  - Quiz: crossfade entre 2 screenshots
  - Slide-right transicoes entre sub-cenas

- [ ] **3.9** Criar `marketing/src/scenes/ProofScene.tsx`:
  - Dashboard blur + overlay 70%
  - Grid 2x2: numeros com contagem animada (interpolate)
  - 168 artigos · 16 trilhas · 36h conteudo · 100% gratuito
  - Stagger de 30f entre cada numero

- [ ] **3.10** Criar `marketing/src/scenes/CTAScene.tsx`:
  - Fundo #0d1117 + home blur 15% opacity
  - Beat 1: "fernandofrancovalle.com" (Poppins 64px, azul)
  - Beat 2: "Comece agora. De curioso a especialista." (Poppins 44px)
  - Beat 3: "100% gratuito · Sem cadastro · Comece em 10 segundos" (Inter 32px, verde)
  - 3s respiro final

- [ ] **3.11** Criar `marketing/src/Root.tsx`:
  - 6 Sequences na ordem com duracoes corretas
  - <Audio> component com trilha sonora volume 0.3

- [ ] **3.12** Criar `marketing/src/index.ts`:
  - registerRoot(RemotionRoot)
  - Composition: id="PromoVideo", 2400 frames, 30fps, 1920x1080

### FASE 4 — AUDIO (estimativa: 15 min)

- [ ] **4.1** Buscar musica royalty-free em Pixabay Music:
  - Estilo: tech, upbeat, corporate, buildable
  - Duracao: ~90s (cortar se necessario)
  - Licenca: uso comercial gratuito
- [ ] **4.2** Baixar para `marketing/assets/audio/background.mp3`
- [ ] **4.3** Cortar/ajustar duracao para 80s se necessario (ffmpeg ou editor online)
- [ ] **4.4** Integrar no Root.tsx via `<Audio>` component

### FASE 5 — PREVIEW E AJUSTES (estimativa: 30 min)

- [ ] **5.1** Rodar `npx remotion preview` (abre Player no browser)
- [ ] **5.2** Verificar cada cena individualmente:
  - [ ] Cena 1: Texto legivel, timing correto, acentos renderizam
  - [ ] Cena 2: Texto legivel, 1.5s de preto antes da revelacao
  - [ ] Cena 3: Zoom-from-black suave, Ken Burns sem artefatos
  - [ ] Cena 4: Screenshots corretos, barra inferior legivel, transicoes fluidas
  - [ ] Cena 5: Contagem animada funciona, numeros corretos
  - [ ] Cena 6: URL legivel, 3 beats sequenciais, respiro final
- [ ] **5.3** Verificar musica: volume, sync com beats visuais
- [ ] **5.4** Verificar transicoes entre cenas: nenhum frame preto indesejado
- [ ] **5.5** Ajustar timings se necessario (fator de iteracao)
- [ ] **5.6** Teste de legibilidade: assistir em tela cheia E em janela pequena (simula mobile)

### FASE 6 — RENDER FINAL (estimativa: 5 min)

- [ ] **6.1** Render video:
  ```bash
  npx remotion render src/index.ts PromoVideo out/promo.mp4 \
    --codec h264 --crf 18 --audio-bitrate 192k
  ```
- [ ] **6.2** Render thumbnail:
  ```bash
  npx remotion still src/index.ts PromoVideo out/thumbnail.png \
    --frame 720
  ```
- [ ] **6.3** Verificar output:
  - `marketing/out/promo.mp4` — ~80s, ~20-40MB, 1920x1080, 30fps
  - `marketing/out/thumbnail.png` — 1920x1080, frame da revelacao
- [ ] **6.4** Assistir video completo 1x para validacao final

### FASE 7 — DISTRIBUICAO (estimativa: 15 min)

- [ ] **7.1** Preparar metadata por canal:

**LinkedIn:**
- Titulo: Aprenda tecnologia real. Evolua de verdade. | FFV Academy
- Post copy: [ver abaixo]
- Hashtags: #DesenvolvimentoSoftware #InteligenciaArtificial #AWS #AprendizadoGratuito #CarreiraTech
- Horario: Terca ou Quarta, 8-10h BRT

**YouTube:**
- Titulo: FFV Academy — Plataforma Gratuita para Devs que Querem Evoluir de Verdade
- Descricao: [ver abaixo]
- Tags: ffv academy, aprender programacao, ia para devs, aws gratuito, gamificacao educacional
- Thumbnail: out/thumbnail.png

**Twitter/X:**
- Tweet: [ver abaixo]
- Horario: Mesma janela do LinkedIn

- [ ] **7.2** Copy dos posts:

**LinkedIn:**
```
Passei meses criando algo que gostaria que existisse quando comecei.

168 artigos tecnicos. 16 trilhas estruturadas. IA, AWS, engenharia de software, Claude.

Sem cadastro. Sem paywall. Com gamificacao que faz voce querer voltar.

FFV Academy — de curioso a especialista.

fernandofrancovalle.com

#DesenvolvimentoSoftware #IA #AWS #AprendizadoGratuito
```

**YouTube descricao:**
```
FFV Academy e uma plataforma gratuita de aprendizado tecnico com gamificacao.

168 artigos | 16 trilhas | 36h de conteudo | 100% gratuito

Temas: Inteligencia Artificial, AWS Cloud, Engenharia de Software, Claude & Anthropic

Acesse: https://fernandofrancovalle.com

Sem cadastro, sem paywall. Abra e comece a estudar.
```

**Twitter/X:**
```
Criei uma plataforma gratuita pra devs que querem ir alem do tutorial:

- 168 artigos tecnicos
- 16 trilhas (IA, AWS, Eng. Software, Claude)
- Gamificacao: XP, niveis, badges, revisao espacada
- Sem cadastro, sem paywall

fernandofrancovalle.com
```

- [ ] **7.3** Upload video + thumbnail nos canais
- [ ] **7.4** Publicar nos horarios otimos

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | GO | Testar 2-3 musicas no preview antes de render |
| CW | GO | Confirmar acentuacao no preview |
| DM | GO | Preview de cada cena individual |
| PT | GO | Verificar estrutura de GameState/SRSCard antes da captura |
| ES | GO | URL limpa no video, UTM so nos links dos posts |

**Resultado:** GO por unanimidade (5/5)

---

### Estimativa Total de Execucao

| Fase | Tempo estimado |
|------|---------------|
| 1. Setup | 15 min |
| 2. Captura | 20 min |
| 3. Composicao Remotion | 45 min |
| 4. Audio | 15 min |
| 5. Preview e ajustes | 30 min |
| 6. Render | 5 min |
| 7. Distribuicao | 15 min |
| **Total** | **~2.5 horas** |

---

### Riscos Remanescentes e Mitigacao

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Musica nao casa com beats | Media | Alto | Testar 3 opcoes no preview |
| Acentos nao renderizam | Baixa | Alto | @remotion/google-fonts com charset latino |
| Quiz screenshot falha | Media | Medio | Fallback: DOM injection para forcar estado |
| SRS sem cards | Media | Medio | Injetar cards no localStorage antes da captura |
| Ken Burns com artefatos | Baixa | Baixo | Captura em 2560x1440, output 1920x1080 |
