## Reuniao de Marketing #3 — Pipeline Tecnico

**Data:** 2026-04-18 | **Topico:** Definir ferramentas, captura e estrutura do projeto Remotion
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** Automatica
**Input:** Atas das Reunioes #1 (USP/persona) e #2 (Storyboard 6 cenas, 80s)

---

### Contexto

Com storyboard aprovado (6 cenas, 80s, 6 screenshots), precisamos definir o pipeline tecnico completo: como capturar as telas, como compor o video no Remotion, e como renderizar o output final. Decisoes tecnicas devem respeitar o storyboard sem comprometer a viabilidade.

**Escopo:** Pipeline tecnico (captura, composicao, render). NAO estamos definindo copy exato ainda.

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** O pipeline precisa preservar o ritmo narrativo. As transicoes entre cenas nao sao decoracao — sao pontuacao. Fade = virgula, corte = ponto, zoom = exclamacao.
- **Observacao 2:** A transicao mais critica e a da cena 2 → cena 3 (problema → revelacao). Precisa ser zoom-from-black, nao um simples fade. E o momento "wow".
- **Problema critico:** Se as transicoes ficarem mecanicas/uniformes, o video perde ritmo. Cada transicao deve ser diferente.
- **Ponto forte:** O Remotion suporta spring() e interpolate() — suficiente para todas as transicoes do storyboard.
- **Recomendacao:** Definir 4 tipos de transicao: (1) fade, (2) slide-horizontal, (3) zoom-from-center, (4) crossfade rapido.
- **Voto:** Pipeline aprovado com 4 tipos de transicao.

#### ✍️ Copywriter
- **Observacao 1:** Os textos no Remotion precisam de animacao de entrada (fade-in ou slide-up) e saida (fade-out). Texto que aparece/desaparece sem animacao parece amador.
- **Observacao 2:** O texto precisa ter sombra ou overlay escuro atras para garantir legibilidade sobre screenshots. Sem isso, texto branco some no azul claro da home.
- **Problema critico:** A fonte precisa ser Poppins (headlines) e Inter (subtexto) para manter consistencia com a marca. Remotion precisa carregar essas fontes.
- **Ponto forte:** Remotion suporta Google Fonts nativo — Poppins e Inter sao importaveis diretamente.
- **Recomendacao:** Criar componente TextOverlay reutilizavel com: texto, posicao, tamanho, animacao entrada/saida, sombra/overlay.
- **Voto:** TextOverlay como componente padrao.

#### 🎨 Designer Motion
- **Observacao 1:** A composicao de cada cena segue um padrao: background (screenshot ou cor solida) + overlay (gradiente escuro quando necessario) + texto (posicionado com AbsoluteFill).
- **Observacao 2:** O Ken Burns deve ser implementado com scale() animado via interpolate(). De 1.0 a 1.08 ao longo da duracao da cena (8% zoom).
- **Observacao 3:** Highlights (glow) em areas de interesse devem ser implementados com box-shadow animado ou borda com pulsacao.
- **Problema critico:** O overlay escuro para legibilidade de texto nao pode ser uniforme — usar gradiente linear de baixo para cima (100% opaco na base, 0% no topo) para manter o screenshot visivel.
- **Ponto forte:** Todas as transicoes do storyboard sao implementaveis com Remotion primitivos: Sequence, AbsoluteFill, Img, interpolate, spring.
- **Recomendacao:** 3 componentes reutilizaveis: ScreenFrame (screenshot + Ken Burns + overlay), TextOverlay (texto animado), SceneTransition (wrapper de transicao).
- **Voto:** 3 componentes reutilizaveis + 6 cenas.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** Estrutura do projeto Remotion confirmada. Entry point: `marketing/src/index.ts` exporta `<RemotionRoot>` com uma `<Composition>` de 2400 frames (80s × 30fps).
- **Observacao 2:** Script de captura Puppeteer: abre Chromium headless, viewport 2560x1440, navega para cada URL, injeta localStorage via `page.evaluate()`, aguarda `networkidle0` + 2s extra para animacoes CSS, captura PNG.
- **Observacao 3:** Para o quiz, preciso usar `page.click()` para selecionar resposta e capturar o frame de feedback. Alternativa: manipular DOM para forcar estado de "respondido" via JavaScript injection.
- **Problema critico:** Fonts do Google (Poppins, Inter) precisam ser registradas no Remotion. Usar `@remotion/google-fonts` para import automatico.
- **Ponto forte:** O pipeline e deterministico — mesmo input gera mesmo output. Scripts podem ser re-executados quantas vezes necessario.
- **Recomendacao:** Adicionar `@remotion/google-fonts` as dependencias. Script de captura com retry automatico (3 tentativas por screenshot).
- **Voto:** Pipeline aprovado. deps: remotion, @remotion/cli, @remotion/renderer, @remotion/google-fonts, puppeteer, typescript, tsx.

#### 📊 Estrategista
- **Observacao 1:** O output final precisa ser h264 com CRF 18-20 para qualidade alta sem arquivo gigante. LinkedIn aceita ate 5GB mas recomenda <200MB para upload rapido.
- **Observacao 2:** Aspect ratio 16:9 (1920x1080) e o padrao. Para Reels futuro, cortamos para 9:16 — mas isso e Fase 2.
- **Observacao 3:** O video precisa ter thumbnail extraivel — o frame da cena 3 (home hero com headline) e o melhor candidato.
- **Problema critico:** Sem narration em audio, o video depende 100% de texto visual + musica. Garantir que o texto aparece tempo suficiente para leitura (minimo 2s por headline).
- **Ponto forte:** Video 80s funciona para YouTube (optimal 60-120s para organico) e LinkedIn (optimal <90s para feed).
- **Recomendacao:** Exportar tambem 1 frame PNG da cena 3 como thumbnail. Remotion suporta `renderStill()`.
- **Voto:** h264, CRF 18, 1920x1080, 30fps. Thumbnail da cena 3.

---

### Conflitos e Resolucoes

#### Conflito 1: DM vs PT — Quantidade de componentes
- **DM:** Quer 3 componentes reutilizaveis (ScreenFrame, TextOverlay, SceneTransition) + 6 componentes de cena.
- **PT:** 9 componentes no total e muito para um video de 80s. Melhor 6 cenas inline com helpers simples.
- **Resolucao:** 3 componentes reutilizaveis + 6 cenas = 9 arquivos e aceitavel. Os reutilizaveis evitam duplicacao e garantem consistencia. PT implementa.

#### Conflito 2: PT vs DC — Transicao zoom-from-black
- **PT:** Zoom-from-black (cena 2→3) e essencialmente um scale de 0.5 a 1.0 com opacity de 0 a 1, partindo do centro. Implementavel mas precisa de spring() bem calibrado para nao ficar mecanico.
- **DC:** O spring precisa ter damping baixo para sensacao de "abertura organica", nao robotica.
- **Resolucao:** Usar `spring({ fps: 30, damping: 12, stiffness: 80 })` para a transicao zoom-from-black. PT cria preview para validacao visual antes do render final.

#### Conflito 3: ES vs PT — Inclusao de thumbnail
- **ES:** Precisa de thumbnail PNG da cena 3 para upload em plataformas.
- **PT:** Adiciona complexidade ao pipeline (renderStill alem de render). Mas e simples.
- **Resolucao:** Adicionar `renderStill` para frame da cena 3 (segundo 24, apos headline aparecer). 1 linha extra no script de render.

---

### Deliverable da Reuniao — Spec Tecnica Final

#### Dependencias

```json
{
  "dependencies": {
    "remotion": "^4.x",
    "@remotion/cli": "^4.x",
    "@remotion/renderer": "^4.x",
    "@remotion/google-fonts": "^4.x",
    "puppeteer": "^23.x",
    "typescript": "^5.x",
    "tsx": "^4.x"
  }
}
```

Sistema: `ffmpeg` (brew install ffmpeg)

#### Estrutura de Arquivos

```
marketing/
  package.json
  tsconfig.json
  remotion.config.ts
  scripts/
    capture.ts              # Puppeteer: captura 6 screenshots + 2 quiz frames
    render.ts               # Script de render: video + thumbnail
  src/
    index.ts                # RemotionRoot com Composition
    Root.tsx                # Composicao principal (80s, 30fps, 1920x1080)
    components/
      ScreenFrame.tsx       # Screenshot + Ken Burns + overlay gradiente
      TextOverlay.tsx       # Texto animado (fade-in/out, posicao, fonte, sombra)
      SceneTransition.tsx   # Wrapper de transicao (fade, slide, zoom, crossfade)
    scenes/
      HookScene.tsx         # Cena 1: texto provocativo (0-8s)
      ProblemScene.tsx      # Cena 2: dor do publico (8-18s)
      RevealScene.tsx       # Cena 3: home hero zoom-from-black (18-30s)
      FeaturesScene.tsx     # Cena 4: 4 sub-cenas de features (30-52s)
      ProofScene.tsx        # Cena 5: numeros animados (52-62s)
      CTAScene.tsx          # Cena 6: URL + gratuito (62-80s)
    styles/
      tokens.ts             # Cores, fontes, constantes
  assets/
    screenshots/            # PNGs capturados
    audio/                  # background.mp3 (trilha sonora)
  out/
    promo.mp4               # Video final
    thumbnail.png           # Frame cena 3 para plataformas
```

#### Configuracao da Composition

```typescript
// src/index.ts
const FPS = 30;
const DURATION_SECONDS = 80;
const TOTAL_FRAMES = FPS * DURATION_SECONDS; // 2400

<Composition
  id="PromoVideo"
  component={Root}
  durationInFrames={TOTAL_FRAMES}
  fps={FPS}
  width={1920}
  height={1080}
/>
```

#### Mapa de Cenas → Frames

| Cena | Inicio (s) | Fim (s) | Frame inicio | Frame fim | Frames total |
|------|-----------|---------|-------------|---------|-------------|
| 1 Hook | 0 | 8 | 0 | 240 | 240 |
| 2 Problema | 8 | 18 | 240 | 540 | 300 |
| 3 Revelacao | 18 | 30 | 540 | 900 | 360 |
| 4 Features | 30 | 52 | 900 | 1560 | 660 |
| 5 Prova | 52 | 62 | 1560 | 1860 | 300 |
| 6 CTA | 62 | 80 | 1860 | 2400 | 540 |

#### Transicoes entre Cenas

| De → Para | Tipo | Duracao | Implementacao |
|-----------|------|---------|---------------|
| 1 → 2 | Fade | 0.5s (15 frames) | opacity interpolate |
| 2 → 3 | Zoom-from-black | 1s (30 frames) | scale spring + opacity |
| 3 → 4 | Slide-left | 0.4s (12 frames) | translateX interpolate |
| 4A → 4B | Slide-right | 0.3s (9 frames) | translateX interpolate |
| 4B → 4C | Slide-right | 0.3s (9 frames) | translateX interpolate |
| 4C → 4D | Slide-right | 0.3s (9 frames) | translateX interpolate |
| 4 → 5 | Fade-to-black | 0.5s (15 frames) | opacity interpolate |
| 5 → 6 | Fade | 0.5s (15 frames) | opacity interpolate |

#### Script de Captura (Puppeteer)

```typescript
// marketing/scripts/capture.ts — estrutura
const CAPTURES = [
  {
    name: 'home-hero',
    url: 'http://localhost:3000/',
    waitFor: '[data-testid="hero"]', // ou seletor CSS existente
    scroll: 0,
    localStorage: GAME_STATE_ESPECIALISTA,
  },
  {
    name: 'trilha-progresso',
    url: 'http://localhost:3000/fundamentos-da-ia',
    waitFor: 'main',
    scroll: 0,
    localStorage: GAME_STATE_4_DE_6,
  },
  {
    name: 'quiz-pergunta',
    url: 'http://localhost:3000/aprenda/o-que-e-llm',
    waitFor: '[data-quiz]', // seletor do quiz
    scroll: 'quiz', // scroll ate quiz
    localStorage: {},
  },
  {
    name: 'quiz-feedback',
    url: 'http://localhost:3000/aprenda/o-que-e-llm',
    waitFor: '[data-quiz-feedback]',
    action: 'click-quiz-answer', // clica na resposta correta
    localStorage: {},
  },
  {
    name: 'dashboard-progresso',
    url: 'http://localhost:3000/progresso',
    waitFor: 'main',
    scroll: 0,
    localStorage: GAME_STATE_ESPECIALISTA,
  },
  {
    name: 'srs-review',
    url: 'http://localhost:3000/revisar',
    waitFor: 'main',
    scroll: 0,
    localStorage: GAME_STATE_COM_SRS,
  },
];
```

#### Configuracao de Render

```bash
# Video principal
npx remotion render src/index.ts PromoVideo out/promo.mp4 \
  --codec h264 --crf 18 --audio-bitrate 192k

# Thumbnail
npx remotion still src/index.ts PromoVideo out/thumbnail.png \
  --frame 720  # segundo 24 (cena 3, apos headline)
```

#### Audio

- Arquivo: `marketing/assets/audio/background.mp3`
- Fonte: Pixabay Music ou YouTube Audio Library (royalty-free)
- Estilo: Tech/upbeat, buildable, ~90s
- Volume no Remotion: `<Audio src={bgMusic} volume={0.3} />`
- Sync points manuais via corte do MP3 ou ajuste de volume por frame

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | Spring da transicao zoom-from-black precisa de preview antes do render final |
| CW | Aprova | Fontes Poppins + Inter via @remotion/google-fonts confirmado |
| DM | Aprova | 3 componentes reutilizaveis aprovados |
| PT | Aprova | — |
| ES | Aprova | Thumbnail da cena 3 incluido no pipeline |

**Resultado:** Aprovado por unanimidade (5/5)

---

### Proxima Reuniao
- **Numero:** 4 (INTERATIVA — usuario revisa)
- **Topico:** Script & Copy Final — texto exato por cena, timing e CTA
- **Preparar antes:** Storyboard + spec tecnica (documentos das reunioes 1-3)
- **Nota:** O usuario participa desta reuniao e revisa o output antes de aprovar
