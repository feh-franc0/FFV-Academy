## Reuniao de Marketing #6 — Pipeline Short-form (TikTok/Reels)

**Data:** 2026-04-18 | **Topico:** Evoluir o pipeline de prints estaticos para gravacao real de tela em formato 9:16 com loop autonomo de avaliacao/critica/iteracao
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** Interativa (usuario definiu escopo via AskUserQuestion)
**Input:** Pipeline institucional 80s 16:9 (Reunioes #1-5) + request do usuario por padrao TikTok/MrBeast

---

### Contexto

O pipeline institucional de 80s 16:9 foi aprovado (ata #5) e gerou `marketing/out/promo.mp4`. Ele serve LinkedIn/YouTube mas nao converte no feed de TikTok/Reels — linguagem errada (screenshots com Ken Burns vs. gravacao real, 80s vs. 30-45s, 16:9 vs. 9:16, narrativa lenta vs. hook-em-3s).

**Problema:** prints estaticos nao mostram o produto em USO. TikTok exige demonstracao real.

**Objetivo:** ecossistema paralelo de shorts 9:16 com (1) gravacao real do produto, (2) ritmo TikTok/MrBeast, (3) loop autonomo de critica ate padrao profissional. **Pipeline institucional permanece intacto** — os dois coexistem.

**Escopo fechado com usuario:**
- Manter pipeline 80s em paralelo (nao substituir)
- Playwright recordVideo para gravacao real
- 3 shorts tematicos end-to-end (Quiz, Progresso, SRS)
- Silent + captions + trilha royalty-free (sem TTS nesta fase)

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** A linguagem do feed TikTok e "loop aberto". Cada 2s precisa ter algo novo ou o cerebro desengaja. Ken Burns em screenshot nao serve — tem que ter movimento real de interacao.
- **Observacao 2:** O arco dos 45s e diferente do promo. Hook nao e "venda", e *gancho cognitivo* (pergunta, afirmacao contra-intuitiva). Contexto e *dor*. Demo e *prova*. Clima e *reward visual*. CTA e discreto (soft close).
- **Problema critico:** Sem gravacao real, a demo falha — usuario sente que viu so marketing, nao o produto. Screenshots matam essa prova.
- **Ponto forte:** Os 3 temas (Quiz, Progresso, SRS) cobrem o trio de valor: *engajamento imediato* (quiz) · *habito de longo prazo* (progresso) · *retencao real* (SRS).
- **Recomendacao:** Definir um RHYTHM hardcoded: nenhum plano estatico >2s (max 60 frames a 30fps). BeatMarker (flash branco 2 frames) entre cortes da secao Demo. RewardGlow no Clima.
- **Voto:** Aprovado com arco 5-slot (Hook 3s / Context 7s / Demo 20s / Climax 12s / CTA 3s).

#### ✍️ Copywriter
- **Observacao 1:** Caption estilo TikTok e uppercase, grande (fontSize 132 para hook), bounce-in com spring, sombra forte. Texto fino e lower-case nao lê no feed mute.
- **Observacao 2:** 85% do feed e consumido em mute. Caption nao e decoracao — e o conteudo. Sem caption clara, retencao cai pela metade.
- **Problema critico:** Caption cortada (safe zone violada) destroi credibilidade. TikTok tem UI fixa no topo (220px) e base (380px — comentarios, like, perfil).
- **Ponto forte:** A plataforma ja tem copy testada em PT-BR (atas #2, #4) — reaproveitavel nas captions.
- **Recomendacao:** Componente QuickCaption com 3 estilos: `hook` (132px, uppercase, letter-spacing -2), `reward` (112px, accent color com glow), `normal` (68px, body font). SAFE_ZONE respeitada por `position: 'top'|'middle'|'bottom'`.
- **Voto:** Aprovado — captions como conteudo primario, audio como secundario.

#### 🎨 Designer Motion
- **Observacao 1:** Zoom-to-click e o mecanismo que transforma screenshot em "demo viva". Ao detectar clique (timestamp gravado pelo Playwright), aplicar scale 1.0→1.2 em 10 frames centrado no ponto.
- **Observacao 2:** Cada short tem uma cor-acento propria (azul IA para Quiz, verde streak para Progresso, roxo Anthropic para SRS). Isso diferencia os 3 no feed.
- **Observacao 3:** Trilha de fundo a 22% de volume (nao 30% como no promo 80s) — TikTok algoritmicamente prioriza audio dos usuarios sobre trilhas embutidas.
- **Problema critico:** Se os 3 shorts ficarem visualmente iguais, publico nao volta. Accent color + diferenca de ritmo por tema (Quiz mais rapido, SRS mais contemplativo) e fundamental.
- **Ponto forte:** Remotion suporta `<OffthreadVideo>` com `playbackRate` — permite acelerar beats (ex: 1.2x no beat de resposta do quiz) sem re-gravar.
- **Recomendacao:** 6 componentes compartilhados (VideoBeat, QuickCaption, ClickZoom, ProgressBar, BeatMarker, BackgroundTrack) + 5 scenes + 1 SceneBeats helper + Root parametrizado.
- **Voto:** Aprovado — arquitetura de 1 ShortRoot + 3 configs.

#### ⚙️ Produtor Tecnico
- **Observacao 1:** Playwright supera Puppeteer aqui pelo `recordVideo` nativo (WebM → H.264 via ffmpeg). Puppeteer+CDP screencast seria 3x mais codigo por menor qualidade.
- **Observacao 2:** Build estatico da plataforma (`next build && serve out -p 8080`) e obrigatorio — dev server Turbopack quebra hidratacao em headless. Isso ja foi aprendido no pipeline 80s (comentario em capture.ts).
- **Observacao 3:** OffthreadVideo exige MP4 `yuv420p`. ffmpeg converte WebM→MP4 garantindo pixel format no pipeline de gravacao.
- **Observacao 4:** State simulado (`GAME_STATE_FULL`) e compartilhado entre `capture.ts` e `record-beats.ts` via `scripts/shared/state.ts` — single source of truth. Capture foi refatorado (refactor conservador, sem mudar comportamento).
- **Problema critico:** Re-gravacao de beat e operacao cara (~60s cada: abrir browser, navegar, gravar, converter). O skill `marketing-iterador` prioriza edits em config antes de re-gravar.
- **Ponto forte:** `manifest.json` por short carrega timestamps de clique — ClickZoom le isso em vez de re-processar video frame-a-frame.
- **Recomendacao:** Scripts npm separados (`record-beats`, `render-short`, `render-shorts-all`, `extract-frames-short`). CLI com `--short=<id>` e `--id=<Short[A|B|C]>`. Max 3 iteracoes no loop autonomo.
- **Voto:** Aprovado. Deps: adicionar `playwright@^1.48.0`. ffmpeg ja era requisito.

#### 📊 Estrategista
- **Observacao 1:** Duracao 30-45s e o sweet spot. TikTok/Reels algoritmo premia "complete watch" — >45s, taxa de completude despenca.
- **Observacao 2:** Hook de 3s e critico. TikTok descarta viewers nos primeiros 3s de forma brutal (40% leaving). O primeiro frame precisa ja ter algo.
- **Observacao 3:** 3 shorts e o minimo para testar. Um e anedotico, 3 validam o sistema (3 temas distintos, mesma infra, mesma qualidade).
- **Observacao 4:** Soft CTA no final (URL + "gratuito, sem cadastro") converte melhor que hard sell. "Acesse agora" queima no TikTok.
- **Problema critico:** Sem metrica de retencao real em producao (este pipeline so *simula* retencao via avaliacao visual), nao temos loop de verdade. Mas para v1, avaliacao visual por Claude ja pega 80% dos problemas — red flags estruturais (hook fraco, caption cortada, >3s estatico) sao detectaveis sem telemetria.
- **Ponto forte:** O conteudo dos 3 shorts cobre 3 buyer personas distintas: curioso (Quiz hook), engajado (Progresso), serio/longo-prazo (SRS).
- **Recomendacao:** Nota ponderada com Hook 30% / Ritmo 20% / Demo 20% / Caption 15% / CTA 15%. Aprovacao >= 4.0 E zero red flags criticos.
- **Voto:** Aprovado. Priorizar ShortA (Quiz) como primeiro a publicar — tem maior gancho cognitivo.

---

### Conflitos e Resolucoes

#### Conflito 1: DC vs PT — Composition parametrizada vs. duplicada
- **DC:** Cada short pode precisar de narrativa unica — parametrizar pode engessar.
- **PT:** 3 Compositions separadas significa 3x manutencao. Duplicacao vira debito rapido.
- **Resolucao:** ShortRoot parametrizado por `ShortConfig`. Se algum short precisar de cena exclusiva, adiciona prop opcional na config (nao cria arvore nova). Em 2 meses se ficar rigido demais, revisita.

#### Conflito 2: CW vs DM — Caption default no top vs. bottom
- **CW:** Bottom e natural para leitura ("callout" em video).
- **DM:** TikTok UI no bottom consome 380px — caption bottom sempre raspa.
- **Resolucao:** `position` como prop obrigatoria da CaptionRef. Bottom existe mas respeita SAFE_ZONE. Captions *hook* (dominantes) vao no middle.

#### Conflito 3: ES vs DC — Aprovacao por nota numerica vs. julgamento criativo
- **ES:** Nota 4.0 ponderada e objetiva, replicavel.
- **DC:** Pode passar na nota e nao emocionar. Falta o "click".
- **Resolucao:** Nota 4.0 + zero red flags + ausencia de "hook fraco" como red flag critico (julgamento subjetivo do avaliador sobre os 3s iniciais). DC mantem veto se o hook nao for emocionalmente forte, mesmo passando no resto.

#### Conflito 4: PT vs DM — Playwright como dependencia nova
- **PT:** Adicionar Playwright duplica deps com Puppeteer (ja instalado).
- **DM:** recordVideo do Playwright e insubstituivel — Puppeteer nao tem equivalente nativo.
- **Resolucao:** Coexistem. `capture.ts` (Puppeteer, pipeline 80s) + `record-beats.ts` (Playwright, pipeline short). Estado compartilhado em `scripts/shared/state.ts`.

---

### Deliverable da Reuniao — Arquitetura Aprovada

#### Composicao 9:16 parametrizada

```
marketing/src/short/
├── index.tsx                ← registerRoot: Composition ShortA/B/C
├── ShortRoot.tsx            ← parametrizado por ShortConfig
├── config/
│   ├── types.ts             ← ShortConfig, BeatRef, CaptionRef
│   ├── short-quiz.ts        ← ShortA
│   ├── short-progresso.ts   ← ShortB
│   └── short-srs.ts         ← ShortC
├── scenes/
│   ├── SceneBeats.tsx       ← helper: beats + captions de um slot
│   ├── ShortHook.tsx        ← 0-3s
│   ├── ShortContext.tsx     ← 3-10s
│   ├── ShortDemo.tsx        ← 10-30s (+ BeatMarker)
│   ├── ShortClimax.tsx      ← 30-42s (+ RewardGlow)
│   └── ShortCTA.tsx         ← 42-45s
├── components/
│   ├── VideoBeat.tsx        ← OffthreadVideo volume 0
│   ├── QuickCaption.tsx     ← 3 estilos (hook/reward/normal)
│   ├── ClickZoom.tsx        ← scale 1.0→1.2 em 10 frames no ponto de clique
│   ├── ProgressBar.tsx      ← barra fina topo
│   ├── BeatMarker.tsx       ← flash 2 frames
│   └── BackgroundTrack.tsx  ← trilha volume 0.22
└── styles/short-tokens.ts   ← cores/fontes/timing/safe zones
```

#### Gravacao

```
marketing/scripts/
├── record-beats.ts          ← Playwright: 18 beats (6 × 3 shorts)
├── render-shorts.ts         ← wrapper remotion render
├── extract-frames-short.sh  ← ffmpeg: 1 frame/s
└── shared/state.ts          ← GAME_STATE_FULL + helpers
```

#### Loop Autonomo

```
marketing-video-curto   ← orquestrador
  ↓ invoca
marketing-avaliador-retencao  ← 5 criterios ponderados, granularidade 1s
  ↓ (se reprovado)
marketing-critico-ritmo       ← root cause + edits propostos
  ↓
marketing-iterador            ← aplica edits + re-render
  ↓
re-avalia  (max 3 iteracoes)
```

#### Especificacao tecnica

| Item | Valor |
|------|-------|
| Formato | 1080×1920 (9:16) |
| FPS | 30 |
| Duracao | 45s (1350 frames) |
| Codec | H.264 CRF 20 |
| Pixel format | yuv420p |
| Audio | Trilha mp3 @ volume 0.22, silent-first |
| Gravacao | Playwright `recordVideo` WebM → ffmpeg → MP4 |
| Viewport | 1080×1920 portrait |
| URL | http://127.0.0.1:8080 (build estatico, nao dev server) |

#### Specs por short

| Short | id | Accent color | Beats | Arco |
|-------|-----|--------------|-------|------|
| A Quiz | ShortA | #58a6ff (azul IA) | 6 | "IA fraca vs forte?" → quiz em acao → +30 XP |
| B Progresso | ShortB | #3fb950 (verde) | 6 | "21 dias de streak" → dashboard → metricas por hub |
| C Revisao | ShortC | #d2a8ff (roxo) | 6 | "decorar sem decorar?" → SM-2 em acao → proximo card |

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | Veto preservado sobre hook fraco (red flag critico subjetivo) |
| CW | Aprova | SAFE_ZONE obrigatoria em toda caption |
| DM | Aprova | 3 accent colors distintos para diferenciar no feed |
| PT | Aprova | Re-gravacao custa ~60s/beat — iterador prioriza config |
| ES | Aprova | Metrica de retencao real so virá na v2 (telemetria producao); v1 usa avaliacao visual como proxy |

**Resultado:** Aprovado por unanimidade (5/5).

---

### Deliverables implementados

- [marketing/scripts/shared/state.ts](../../marketing/scripts/shared/state.ts) — estado compartilhado
- [marketing/scripts/record-beats.ts](../../marketing/scripts/record-beats.ts) — Playwright recorder
- [marketing/scripts/render-shorts.ts](../../marketing/scripts/render-shorts.ts) — wrapper de render
- [marketing/scripts/extract-frames-short.sh](../../marketing/scripts/extract-frames-short.sh) — extrator de frames
- [marketing/src/short/](../../marketing/src/short/) — arvore completa (16 arquivos)
- [.claude/skills/marketing-video-curto.md](../../.claude/skills/marketing-video-curto.md)
- [.claude/skills/marketing-avaliador-retencao.md](../../.claude/skills/marketing-avaliador-retencao.md)
- [.claude/skills/marketing-critico-ritmo.md](../../.claude/skills/marketing-critico-ritmo.md)
- [.claude/skills/marketing-iterador.md](../../.claude/skills/marketing-iterador.md)
- [.claude/skills/marketing-producao.md](../../.claude/skills/marketing-producao.md) — evoluido com comando `short`

---

### Proxima Reuniao
- **Numero:** 7 (AUTOMATICA — pos-primeiro-render)
- **Topico:** Analise de retencao dos 3 shorts gerados + ajustes finais antes de distribuicao
- **Preparar antes:** Rodar pipeline end-to-end (`/marketing-video-curto all`) e compartilhar notas + red flags dos 3 shorts
- **Trigger:** Ao concluir a primeira passada com score >= 4.0 nos 3 shorts, convocar esta reuniao para validar antes de publicar
